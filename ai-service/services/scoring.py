"""Explainable weighted ATS scoring."""

from dataclasses import dataclass
import re
from typing import List

from services.taxonomy import canonicalize_skill

# Even a candidate with zero required-skill overlap keeps this fraction of their
# semantic score. Required skills are extracted by an imperfect NER pass over the
# job description, so a hard zero would unfairly punish false negatives there
# (e.g. a skill phrased differently in the posting than in the resume).
MIN_SKILL_DAMPING = 0.35


def normalize_skill_key(skill: str) -> str:
    """Collapse formatting differences (case, spaces, dots) for skill comparison."""
    return canonicalize_skill(skill).replace(" ", "").replace(".", "")


def _is_required_skill_present(required_key: str, candidate_keys: set, cv_key_text: str) -> bool:
    """Whether one required skill is evidenced by the candidate.

    Required skills are extracted from the job description by the same imperfect
    NER pass used on resumes, and short postings routinely yield mangled fragments
    (e.g. "JavaScript" coming back as "Java"). Relying only on an exact match
    against the candidate's equally-lossy extracted-skills list makes the whole
    penalty hostage to that noise. So a required skill counts as present if it is
    an exact extracted skill OR its normalized form appears anywhere in the
    normalized CV text - the raw text being the most reliable evidence available.
    Length-gated to avoid a 1-2 character fragment matching by coincidence.
    """
    if required_key in candidate_keys:
        return True
    return len(required_key) >= 3 and required_key in cv_key_text


def skill_coverage_ratio(
    required_skills: List[str],
    candidate_skills: List[str],
    cv_text: str = "",
) -> float:
    """Fraction of required_skills evidenced by the candidate (skills list or CV text).

    Returns 1.0 (no penalty applied) when no required skills could be identified,
    since we have no basis to penalize the candidate in that case.
    """
    if not required_skills:
        return 1.0

    candidate_keys = {normalize_skill_key(skill) for skill in candidate_skills}
    cv_key_text = normalize_skill_key(cv_text)

    matched = sum(
        1
        for skill in required_skills
        if _is_required_skill_present(normalize_skill_key(skill), candidate_keys, cv_key_text)
    )
    return matched / len(required_skills)


def apply_skill_coverage_penalty(semantic_score: int, coverage_ratio: float) -> int:
    """Damp a 0-100 semantic score down in proportion to missing required skills."""
    damping = MIN_SKILL_DAMPING + (1 - MIN_SKILL_DAMPING) * coverage_ratio
    return round(semantic_score * damping)


def _coverage(required: List[str], candidate_keys: set) -> float:
    if not required:
        return 1.0
    return sum(normalize_skill_key(skill) in candidate_keys for skill in required) / len(required)


def _grouped_coverage(
    skills: List[str],
    groups: List[List[str]],
    candidate_keys: set,
) -> float:
    units = [[skill] for skill in skills] + list(groups or [])
    if not units:
        return 0.0
    matched = sum(
        any(normalize_skill_key(skill) in candidate_keys for skill in unit)
        for unit in units
    )
    return matched / len(units)


def _title_evidence(cv_text: str) -> str:
    """Limit title matching to the resume headline and employment role headers."""
    lines = [line.strip() for line in (cv_text or "").splitlines() if line.strip()]
    if not lines:
        return ""
    if len(lines) == 1:
        return lines[0]

    section_heading = re.compile(
        r"^(?:professional\s+summary|summary|profile|objective|core\s+skills|skills)$",
        re.IGNORECASE,
    )
    if not any(section_heading.match(line) for line in lines):
        return lines[0]
    header_end = next(
        (index for index, line in enumerate(lines) if section_heading.match(line)),
        min(len(lines), 8),
    )
    header = [
        line
        for line in lines[1:header_end]
        if "@" not in line
        and "http" not in line.casefold()
        and "linkedin" not in line.casefold()
        and "github" not in line.casefold()
        and not re.search(r"\+?\d[\d\s()-]{6,}", line)
    ]

    experience_headers = []
    in_experience = False
    end_sections = re.compile(
        r"^(?:education|projects?|selected\s+projects?|certifications?|"
        r"professional\s+development|languages?)$",
        re.IGNORECASE,
    )
    for line in lines:
        if re.match(r"^(?:professional\s+experience|work\s+experience|experience)$", line, re.IGNORECASE):
            in_experience = True
            continue
        if in_experience and end_sections.match(line):
            in_experience = False
        if in_experience and "|" in line:
            experience_headers.append(line.split("|", 1)[0].strip())

    return "\n".join(header + experience_headers)


def _title_score(job_title: str, cv_text: str) -> int:
    stop = {"the", "and", "for"}
    tokens = {
        token
        for token in re.findall(r"[a-z0-9+#.]+", (job_title or "").casefold())
        if len(token) > 2 and token not in stop
    }
    if not tokens:
        return 100
    normalized_cv = _title_evidence(cv_text).casefold()
    seniority = {"senior", "junior", "lead", "principal", "staff"}
    role_tokens = tokens - seniority
    if role_tokens and not any(token in normalized_cv for token in role_tokens):
        return 0
    return round(sum(token in normalized_cv for token in tokens) / len(tokens) * 100)


@dataclass
class ScoreResult:
    final_score: int
    required_skill_score: int
    preferred_skill_score: int
    experience_score: int
    title_score: int
    semantic_score: int
    semantic_raw_score: int
    matched_skills: List[str]
    missing_required_skills: List[str]


def calculate_explainable_score(
    *,
    semantic_score: int,
    required_skills: List[str],
    preferred_skills: List[str],
    candidate_skills: List[str],
    required_years: float,
    candidate_years: float,
    job_title: str,
    cv_text: str,
    required_skill_groups: List[List[str]] | None = None,
    preferred_skill_groups: List[List[str]] | None = None,
) -> ScoreResult:
    candidate_keys = {normalize_skill_key(skill) for skill in candidate_skills}
    required_skill_groups = required_skill_groups or []
    preferred_skill_groups = preferred_skill_groups or []
    has_required_units = bool(required_skills or required_skill_groups)
    has_preferred_units = bool(preferred_skills or preferred_skill_groups)
    required_coverage = (
        _grouped_coverage(required_skills, required_skill_groups, candidate_keys)
        if has_required_units
        else 1.0
    )
    preferred_coverage = (
        _grouped_coverage(preferred_skills, preferred_skill_groups, candidate_keys)
        if has_preferred_units
        else 0.0
    )
    experience_ratio = 1.0 if required_years <= 0 else min(1.0, candidate_years / required_years)
    title_score = _title_score(job_title, cv_text)
    semantic_raw_score = semantic_score

    # Embedding similarity rewards repeated phrasing but does not know whether
    # the resume covers the breadth of a multi-skill role. Apply a small,
    # transparent breadth discount while preserving the raw semantic value.
    semantic_score = round(
        semantic_raw_score * (0.85 + 0.15 * required_coverage)
    )

    # Calendar years in an unrelated occupation are not relevant experience.
    # Require at least some title or skill evidence before awarding this component.
    if title_score < 50 and required_coverage < 0.5:
        experience_ratio *= max(title_score / 100, required_coverage)

    required_score = round(required_coverage * 100)
    preferred_score = round(preferred_coverage * 100)
    experience_score = round(experience_ratio * 100)
    matched = [
        skill
        for skill in required_skills + preferred_skills
        if normalize_skill_key(skill) in candidate_keys
    ]
    missing = [
        skill for skill in required_skills if normalize_skill_key(skill) not in candidate_keys
    ]
    for group in required_skill_groups + preferred_skill_groups:
        present = [
            skill
            for skill in group
            if normalize_skill_key(skill) in candidate_keys
        ]
        matched.extend(present)
    for group in required_skill_groups:
        if not any(normalize_skill_key(skill) in candidate_keys for skill in group):
            missing.append(" or ".join(group))

    required_weight = 0.45 if has_preferred_units else 0.55
    preferred_weight = 0.10 if has_preferred_units else 0.0
    weighted = (
        required_score * required_weight
        + preferred_score * preferred_weight
        + experience_score * 0.20
        + title_score * 0.10
        + semantic_score * 0.15
    )

    # Mandatory gates prevent broad prose similarity from producing a top match.
    if (required_skills or required_skill_groups) and required_coverage < 0.5:
        weighted = min(weighted, 55)
    if required_years and experience_ratio < 0.5:
        weighted = min(weighted, 65)

    # A document match is an estimate, not certainty. Reserving 100 avoids
    # presenting a probabilistic ranking as a perfect hiring decision.
    return ScoreResult(
        final_score=round(max(0, min(98, weighted))),
        required_skill_score=required_score,
        preferred_skill_score=preferred_score,
        experience_score=experience_score,
        title_score=title_score,
        semantic_score=semantic_score,
        semantic_raw_score=semantic_raw_score,
        matched_skills=list(dict.fromkeys(matched)),
        missing_required_skills=missing,
    )
