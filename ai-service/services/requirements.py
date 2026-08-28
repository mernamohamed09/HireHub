"""Extract structured skill requirements from a job description."""

import re
from dataclasses import dataclass
from typing import List

from services.taxonomy import extract_taxonomy_skills, find_skill_mentions


REQUIRED_MARKERS = re.compile(
    r"\b(required|requirements?|must|minimum|mandatory|need(?:ed)?|proficient)\b",
    re.IGNORECASE,
)
PREFERRED_MARKERS = re.compile(
    r"\b(preferred|nice to have|bonus|plus|desirable|advantage)\b",
    re.IGNORECASE,
)


@dataclass
class SkillRequirements:
    required: List[str]
    preferred: List[str]
    required_groups: List[List[str]]
    preferred_groups: List[List[str]]


def _alternative_groups(segment: str) -> List[List[str]]:
    mentions = find_skill_mentions(segment)
    groups = []
    for index in range(len(mentions) - 1):
        left, _, left_end = mentions[index]
        right, right_start, _ = mentions[index + 1]
        if left == right:
            continue
        connector = segment[left_end:right_start]
        if not re.fullmatch(r"\s*(?:or|/)\s*", connector, re.IGNORECASE):
            continue
        if groups and groups[-1][-1] == left:
            if right not in groups[-1]:
                groups[-1].append(right)
        else:
            groups.append([left, right])
    return groups


def extract_skill_requirements(job_text: str) -> SkillRequirements:
    all_skills = extract_taxonomy_skills(job_text)
    required = []
    preferred = []
    required_groups = []
    preferred_groups = []

    segments = re.split(r"(?<=[.!?;\n])\s+", job_text or "")
    for segment in segments:
        skills = extract_taxonomy_skills(segment)
        if not skills:
            continue
        target = preferred if PREFERRED_MARKERS.search(segment) else required
        group_target = preferred_groups if target is preferred else required_groups
        alternative_groups = _alternative_groups(segment)
        grouped_skills = {
            skill for group in alternative_groups for skill in group
        }
        if REQUIRED_MARKERS.search(segment) or target is preferred:
            for skill in skills:
                if skill not in grouped_skills and skill not in target:
                    target.append(skill)
        for group in alternative_groups:
            if group not in group_target:
                group_target.append(group)

    grouped = {
        skill
        for group in required_groups + preferred_groups
        for skill in group
    }
    classified = set(required) | set(preferred) | grouped
    # Unqualified skills are treated as required because most job descriptions
    # list core requirements under a heading rather than repeating "required".
    for skill in all_skills:
        if skill not in classified:
            required.append(skill)

    preferred = [skill for skill in preferred if skill not in required]
    return SkillRequirements(
        required=required,
        preferred=preferred,
        required_groups=required_groups,
        preferred_groups=preferred_groups,
    )
