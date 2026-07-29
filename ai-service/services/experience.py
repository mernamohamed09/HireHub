"""Experience requirement and resume-duration extraction."""

import re
from datetime import date


YEARS_RE = re.compile(
    r"\b(?:minimum\s+of\s+|minimum\s+|at\s+least\s+)?"
    r"(\d+(?:\.\d+)?)"
    r"(?:\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?))?"
    r"\+?\s*(?:years?|yrs?)\b",
    re.IGNORECASE,
)
NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
}
NUMBER_WORD_PATTERN = "|".join(NUMBER_WORDS)
WORD_YEARS_RE = re.compile(
    r"\b(?:minimum\s+of\s+|minimum\s+|at\s+least\s+)?"
    rf"({NUMBER_WORD_PATTERN})"
    rf"(?:\s*(?:-|–|—|to)\s*({NUMBER_WORD_PATTERN}))?"
    r"\+?\s*(?:years?|yrs?)\b",
    re.IGNORECASE,
)
MONTHS_RE = re.compile(
    r"\b(\d{1,3})\+?\s*(?:months?|mos?)\b",
    re.IGNORECASE,
)
WORD_MONTHS_RE = re.compile(
    rf"\b({NUMBER_WORD_PATTERN})\s*(?:months?|mos?)\b",
    re.IGNORECASE,
)
YEAR_RANGE_RE = re.compile(
    r"\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present|current|now)\b",
    re.IGNORECASE,
)


def _explicit_experience_values(text: str) -> list[float]:
    numeric_years = [
        float(match.group(1))
        for match in YEARS_RE.finditer(text or "")
    ]
    word_years = [
        float(NUMBER_WORDS[match.group(1).lower()])
        for match in WORD_YEARS_RE.finditer(text or "")
    ]
    numeric_months = [
        round(float(match.group(1)) / 12, 2)
        for match in MONTHS_RE.finditer(text or "")
    ]
    word_months = [
        round(float(NUMBER_WORDS[match.group(1).lower()]) / 12, 2)
        for match in WORD_MONTHS_RE.finditer(text or "")
    ]
    return numeric_years + word_years + numeric_months + word_months


def extract_required_years(text: str) -> float:
    values = _explicit_experience_values(text)
    return float(max(values, default=0))


def _merge_intervals(intervals):
    if not intervals:
        return []
    merged = [list(intervals[0])]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged


def extract_candidate_years(text: str) -> float:
    current_year = date.today().year
    intervals = []
    for match in YEAR_RANGE_RE.finditer(text or ""):
        start = int(match.group(1))
        raw_end = match.group(2).lower()
        end = current_year if raw_end in {"present", "current", "now"} else int(raw_end)
        if 1950 <= start <= end <= current_year + 1:
            intervals.append((start, end))

    intervals.sort()
    merged = _merge_intervals(intervals)
    range_years = sum(max(0, end - start) for start, end in merged)

    explicit_values = _explicit_experience_values(text)
    explicit_years = max(explicit_values, default=0)
    return float(min(50, max(range_years, explicit_years)))
