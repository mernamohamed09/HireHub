"""Skill/experience extraction from resume text via a NER pipeline."""

import re
from typing import Any, Iterator, List

# Sized to stay well inside the model's 512-token limit (English prose averages
# ~4 characters per token) while keeping the number of passes low. The overlap
# only needs to exceed the longest plausible skill phrase.
WINDOW_CHARS = 1500
WINDOW_OVERLAP_CHARS = 200

# Experience is extracted and scored independently. Mixing "3 years" into the
# skills array made the API contract misleading and polluted matched-skill tags.
RELEVANT_ENTITY_GROUPS = {"Skills"}

# The model tends to tag one long comma-separated span as a single "Skills"
# entity (e.g. "Skills : Python, FastAPI, Docker") instead of one entity per
# skill, so that span is split back into individual candidates here.
_SKILLS_LABEL_PREFIX_RE = re.compile(r"^skills\s*:\s*", re.IGNORECASE)


def _candidates_for_entity(entity_group: str, word: str) -> List[str]:
    if entity_group != "Skills":
        return [word]

    cleaned = _SKILLS_LABEL_PREFIX_RE.sub("", word)
    return [part.strip() for part in cleaned.split(",")]


def extract_skills_from_entities(entities: List[dict]) -> List[str]:
    """Filter NER entities to skills and deduplicate case-insensitively."""
    skills: List[str] = []
    seen = set()

    for entity in entities:
        entity_group = entity.get("entity_group")
        if entity_group not in RELEVANT_ENTITY_GROUPS:
            continue

        raw_word = entity.get("word", "").strip()
        if not raw_word:
            continue

        for candidate in _candidates_for_entity(entity_group, raw_word):
            key = candidate.lower()
            if not candidate or key in seen:
                continue

            seen.add(key)
            skills.append(candidate)

    return skills


def _windows(text: str) -> Iterator[tuple]:
    """Yield (offset, chunk) pairs covering the whole text with overlapping windows.

    The NER model has a hard token limit, so long resumes have to be fed in chunks.
    Windows overlap so a skill sitting on a boundary is still seen intact by at
    least one window; duplicates are collapsed later by the shared dedup pass.
    """
    if len(text) <= WINDOW_CHARS:
        yield 0, text
        return

    step = WINDOW_CHARS - WINDOW_OVERLAP_CHARS
    for start in range(0, len(text), step):
        chunk = text[start:start + WINDOW_CHARS]
        if not chunk.strip():
            continue
        yield start, chunk
        if start + WINDOW_CHARS >= len(text):
            break


def extract_skills(ner_pipeline: Any, text: str) -> List[str]:
    """Run the NER pipeline over arbitrary text (resume or job description) and
    filter/dedupe the resulting entities.

    The text is processed in overlapping windows rather than truncated: a flat
    cut at 2000 characters discarded roughly two thirds of a typical two-page
    resume, so skills listed in the most recent experience (usually page two)
    were never extracted at all.

    Entities are re-sliced from the original text via their `start`/`end` character
    offsets rather than trusting the pipeline's own reconstructed `word` field: BERT's
    WordPiece aggregation can leak raw subword fragments (e.g. "##S6" for "ES6+") or
    silently drop the whitespace/commas between adjacent same-label entities (e.g.
    "Python, PHP" collapsing into "PythonPHP"). Slicing the original text preserves
    the exact original characters and delimiters, which the comma-splitting logic in
    `_candidates_for_entity` then relies on.
    """
    all_entities: List[dict] = []

    for offset, chunk in _windows(text):
        for entity in ner_pipeline(chunk):
            start, end = entity.get("start"), entity.get("end")
            if start is not None and end is not None:
                # Offsets come back relative to the chunk; shift them so the
                # re-slice reads from the correct span of the full text.
                entity["word"] = text[offset + start:offset + end]
                entity["start"] = offset + start
                entity["end"] = offset + end
            all_entities.append(entity)

    return extract_skills_from_entities(all_entities)
