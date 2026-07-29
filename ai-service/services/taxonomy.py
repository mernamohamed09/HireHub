"""Versioned English taxonomy loading, canonicalization, and extraction.

The taxonomy is a normalizer, not a gatekeeper. Known aliases resolve to a
canonical skill while unknown NER phrases remain available as raw skills.
"""

from __future__ import annotations

from dataclasses import dataclass
import json
import os
from pathlib import Path
import re
import unicodedata
from typing import Iterable, List


DEFAULT_MANIFEST = Path(
    os.getenv(
        "TAXONOMY_MANIFEST",
        Path(__file__).resolve().parents[1]
        / "data"
        / "taxonomy"
        / "manifest.json",
    )
)


def normalize_term(value: str) -> str:
    """Normalize harmless presentation differences without stemming meaning."""
    normalized = unicodedata.normalize("NFKC", value or "")
    normalized = normalized.replace("\u2010", "-").replace("\u2011", "-")
    return re.sub(r"\s+", " ", normalized.strip()).casefold()


@dataclass(frozen=True)
class SkillMetadata:
    canonical: str
    preferred: str
    concept_id: str
    source: str
    source_version: str
    license: str
    priority: int
    known: bool = True


@dataclass(frozen=True)
class TaxonomyStatus:
    name: str
    version: str
    priority: int
    mode: str
    loaded: bool
    entries: int
    path: str


@dataclass(frozen=True)
class _Entry:
    canonical: str
    preferred: str
    concept_id: str
    aliases: tuple[str, ...]


class TaxonomyRegistry:
    """Immutable in-memory index assembled from versioned JSON sources."""

    def __init__(
        self,
        aliases: dict[str, set[str]],
        alias_to_canonical: dict[str, str],
        metadata: dict[str, SkillMetadata],
        statuses: list[TaxonomyStatus],
    ):
        self.aliases = aliases
        self.alias_to_canonical = alias_to_canonical
        self.metadata = metadata
        self.statuses = statuses

    def canonicalize(self, skill: str) -> str:
        compact = normalize_term(skill)
        if compact in self.alias_to_canonical:
            return self.alias_to_canonical[compact]

        # Preserve the previous tolerance for Node.js / Nodejs-style formatting.
        compact_no_dots = compact.replace(".", "")
        for alias, canonical in self.alias_to_canonical.items():
            if compact_no_dots == alias.replace(".", ""):
                return canonical
        return compact

    def describe(self, skill: str) -> SkillMetadata:
        canonical = self.canonicalize(skill)
        metadata = self.metadata.get(canonical)
        if metadata:
            return metadata
        return SkillMetadata(
            canonical=canonical,
            preferred=skill.strip() or canonical,
            concept_id=f"dynamic:{canonical}",
            source="dynamic",
            source_version="raw",
            license="unclassified",
            priority=-1,
            known=False,
        )


def _entries(payload: dict, source_name: str) -> list[_Entry]:
    result = []
    skills = payload.get("skills")
    if isinstance(skills, dict):
        for canonical, aliases in skills.items():
            normalized = normalize_term(canonical)
            result.append(
                _Entry(
                    canonical=normalized,
                    preferred=canonical,
                    concept_id=f"{source_name}:{normalized}",
                    aliases=tuple(aliases or ()),
                )
            )

    for entry in payload.get("entries", []):
        canonical = normalize_term(
            entry.get("canonical") or entry.get("preferred") or ""
        )
        if not canonical:
            continue
        result.append(
            _Entry(
                canonical=canonical,
                preferred=entry.get("preferred") or canonical,
                concept_id=entry.get("id") or f"{source_name}:{canonical}",
                aliases=tuple(entry.get("aliases") or ()),
            )
        )
    return result


def load_taxonomy_registry(
    manifest_path: Path | str = DEFAULT_MANIFEST,
) -> TaxonomyRegistry:
    """Load all configured sources; optional missing sources never stop scoring."""
    manifest_path = Path(manifest_path)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    source_configs = sorted(
        manifest.get("sources", []),
        key=lambda item: int(item.get("priority", 0)),
    )

    # alias -> (priority, source order, canonical)
    resolutions: dict[str, tuple[int, int, str]] = {}
    metadata: dict[str, SkillMetadata] = {}
    statuses = []

    for order, config in enumerate(source_configs):
        source_path = manifest_path.parent / config["path"]
        priority = int(config.get("priority", 0))
        required = bool(config.get("required", False))
        if not source_path.exists():
            if required:
                raise FileNotFoundError(
                    f"Required taxonomy source is missing: {source_path}"
                )
            statuses.append(
                TaxonomyStatus(
                    name=config["name"],
                    version="not-installed",
                    priority=priority,
                    mode=config.get("mode", "base"),
                    loaded=False,
                    entries=0,
                    path=str(source_path),
                )
            )
            continue

        payload = json.loads(source_path.read_text(encoding="utf-8"))
        source_metadata = payload.get("metadata", {})
        source_name = source_metadata.get("name") or config["name"]
        source_version = str(source_metadata.get("version", "unversioned"))
        source_license = str(source_metadata.get("license", "unspecified"))
        entries = _entries(payload, source_name)
        statuses.append(
            TaxonomyStatus(
                name=source_name,
                version=source_version,
                priority=priority,
                mode=config.get("mode", "base"),
                loaded=True,
                entries=len(entries),
                path=str(source_path),
            )
        )

        for entry in entries:
            current_metadata = metadata.get(entry.canonical)
            if not current_metadata or priority >= current_metadata.priority:
                metadata[entry.canonical] = SkillMetadata(
                    canonical=entry.canonical,
                    preferred=entry.preferred,
                    concept_id=entry.concept_id,
                    source=source_name,
                    source_version=source_version,
                    license=source_license,
                    priority=priority,
                )

            for raw_alias in (entry.canonical, entry.preferred, *entry.aliases):
                alias = normalize_term(raw_alias)
                if not alias:
                    continue
                current = resolutions.get(alias)
                candidate = (priority, order, entry.canonical)
                if current is None or candidate[:2] >= current[:2]:
                    resolutions[alias] = candidate

    alias_to_canonical = {
        alias: resolution[2]
        for alias, resolution in resolutions.items()
    }
    aliases: dict[str, set[str]] = {}
    for alias, canonical in alias_to_canonical.items():
        aliases.setdefault(canonical, set()).add(alias)
    return TaxonomyRegistry(aliases, alias_to_canonical, metadata, statuses)


TAXONOMY = load_taxonomy_registry()
SKILL_ALIASES = TAXONOMY.aliases
ALIAS_TO_CANONICAL = TAXONOMY.alias_to_canonical


def _alias_pattern(alias: str) -> re.Pattern:
    escaped = re.escape(alias).replace(r"\ ", r"\s+")
    boundary_chars = (
        r"A-Za-z0-9." if len(alias) <= 2 and alias.isalnum() else r"A-Za-z0-9"
    )
    return re.compile(
        rf"(?<![{boundary_chars}]){escaped}(?![{boundary_chars}])",
        re.IGNORECASE,
    )


ALIAS_PATTERNS = {
    canonical: [
        (alias, _alias_pattern(alias))
        for alias in sorted(aliases, key=len, reverse=True)
    ]
    for canonical, aliases in SKILL_ALIASES.items()
}


def canonicalize_skill(skill: str) -> str:
    return TAXONOMY.canonicalize(skill)


def describe_skill(skill: str) -> SkillMetadata:
    """Return provenance for a known skill or a dynamic fallback descriptor."""
    return TAXONOMY.describe(skill)


def taxonomy_status() -> list[TaxonomyStatus]:
    return list(TAXONOMY.statuses)


WEAK_DIRECT_PREFIX = re.compile(
    r"\b(?:basic|introductory|beginner(?:-level)?)\s*$",
    re.IGNORECASE,
)
WEAK_LEARNING_PREFIX = re.compile(
    r"\b(?:currently\s+)?(?:learning|studying|exploring|"
    r"developing\s+(?:my\s+)?knowledge\s+(?:of|in)|"
    r"building\s+knowledge\s+(?:of|in)|familiar\s+with|exposure\s+to)"
    r"(?:\s+[\w+#.-]+){0,6}\s*$",
    re.IGNORECASE,
)
EXPLICIT_NEGATIVE_CONTEXT = re.compile(
    r"\b(?:no|without)\s+(?:direct\s+|practical\s+|production\s+)?"
    r"(?:hands-on\s+)?(?:experience\s+(?:with|in|using)\s+)?",
    re.IGNORECASE,
)
PASSIVE_CONTEXT_START = re.compile(
    r"^\s*(?:[-*\u2022\u25cf\u25e6\u25aa]\s*)?(?:observed|attended|"
    r"collaborated(?:\s+\w+){0,3}\s+(?:with|on)|assisted|eager\s+to)\b",
    re.IGNORECASE,
)
ACTIVE_TECHNICAL_VERB = re.compile(
    r"\b(?:build|built|deploy|deployed|design|designed|implement|implemented|"
    r"develop|developed|engineer|engineered|scale|scaled|train|trained|"
    r"create|created|process|processed|apply|applied|containerize|containerized|"
    r"manage|managed|establish|established|write|wrote|maintain|maintained|"
    r"query|queried|clean|cleaned|manipulate|manipulated|conduct|conducted)\b",
    re.IGNORECASE,
)
OCCASIONAL_DOCUMENT_USE = re.compile(
    r"\bused?\b.{0,50}\boccasionally\b.{0,80}\b(?:documentation|repositories?)\b",
    re.IGNORECASE,
)


def _evidence_line(text: str, match_start: int) -> tuple[str, int]:
    """Return the surrounding sentence, tolerating PDF line wrapping."""
    source = text or ""
    sentence_start = max(
        source.rfind(mark, 0, match_start)
        for mark in (".", "!", "?", ";")
    ) + 1
    sentence_ends = [
        position
        for mark in (".", "!", "?", ";")
        if (position := source.find(mark, match_start)) != -1
    ]
    sentence_end = min(sentence_ends, default=len(source))
    sentence = re.sub(r"\s+", " ", source[sentence_start:sentence_end]).strip()
    normalized_prefix = re.sub(
        r"\s+",
        " ",
        source[sentence_start:match_start],
    )
    return sentence, len(normalized_prefix.strip())


def _is_weak_evidence(text: str, match_start: int) -> bool:
    prefix = (text or "")[max(0, match_start - 120):match_start]
    line, normalized_match_start = _evidence_line(text, match_start)
    line_prefix = line[:max(0, normalized_match_start)]
    if EXPLICIT_NEGATIVE_CONTEXT.search(line_prefix):
        return True
    if OCCASIONAL_DOCUMENT_USE.search(line):
        return True
    if (
        PASSIVE_CONTEXT_START.search(line)
        and not ACTIVE_TECHNICAL_VERB.search(line)
    ):
        return True
    return bool(
        WEAK_DIRECT_PREFIX.search(prefix)
        or WEAK_LEARNING_PREFIX.search(prefix)
    )


def find_skill_mentions(text: str) -> List[tuple[str, int, int]]:
    """Return canonical skill mentions with source offsets, longest aliases first."""
    mentions = []
    occupied = []
    for canonical, patterns in ALIAS_PATTERNS.items():
        for _, pattern in patterns:
            for match in pattern.finditer(text or ""):
                span = (match.start(), match.end())
                if any(
                    start <= span[0] and span[1] <= end
                    for start, end in occupied
                ):
                    continue
                mentions.append((canonical, span[0], span[1]))
                occupied.append(span)
    return sorted(mentions, key=lambda item: (item[1], -(item[2] - item[1])))


def _has_strong_alias_evidence(text: str, canonical: str) -> bool:
    matches = [
        match
        for _, pattern in ALIAS_PATTERNS.get(canonical, [])
        for match in pattern.finditer(text or "")
    ]
    return bool(matches) and any(
        not _is_weak_evidence(text, match.start())
        for match in matches
    )


def extract_taxonomy_skills(
    text: str,
    *,
    exclude_weak_evidence: bool = False,
) -> List[str]:
    found = []
    for canonical, patterns in ALIAS_PATTERNS.items():
        matched = any(pattern.search(text or "") for _, pattern in patterns)
        if matched and (
            not exclude_weak_evidence
            or _has_strong_alias_evidence(text, canonical)
        ):
            found.append(canonical)
    return found


def filter_weak_skill_evidence(
    text: str,
    skills: Iterable[str],
) -> List[str]:
    """Remove known skills mentioned only in learning or beginner contexts.

    Unknown NER phrases are preserved because the taxonomy has no reliable alias
    span with which to evaluate their context.
    """
    result = []
    for skill in skills:
        canonical = canonicalize_skill(skill)
        if canonical in SKILL_ALIASES:
            has_alias = any(
                pattern.search(text or "")
                for _, pattern in ALIAS_PATTERNS[canonical]
            )
            if has_alias and not _has_strong_alias_evidence(text, canonical):
                continue
        result.append(canonical)
    return list(dict.fromkeys(result))


def merge_canonical_skills(*skill_groups: Iterable[str]) -> List[str]:
    result = []
    seen = set()
    for group in skill_groups:
        for skill in group:
            canonical = canonicalize_skill(skill)
            if not canonical or canonical in seen:
                continue
            # Unknown NER fragments are accepted when they look like a
            # meaningful skill phrase. This is the zero-taxonomy fallback.
            if canonical not in SKILL_ALIASES and (
                len(canonical) < 2
                or canonical in {"and", "or", "with", "skills", "experience"}
                or not re.search(r"[a-z0-9+#]", canonical)
            ):
                continue
            seen.add(canonical)
            result.append(canonical)
    return result
