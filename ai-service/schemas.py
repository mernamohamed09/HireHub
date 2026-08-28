from typing import List

from pydantic import BaseModel, Field


class SkillMetadataResponse(BaseModel):
    canonical: str
    preferred: str
    concept_id: str
    source: str
    source_version: str
    license: str
    known: bool


class AnalyzeRequest(BaseModel):
    cv_text: str = Field(..., min_length=20, max_length=150000, description="Plaintext CV contents")
    job_title: str = Field(..., min_length=2, max_length=200, description="Job title")
    job_description: str = Field(..., min_length=20, max_length=50000, description="Job description")


class AnalyzeResponse(BaseModel):
    success: bool
    match_score: int
    extracted_skills: List[str]
    matched_skills: List[str] = Field(default_factory=list)
    missing_required_skills: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    required_skill_groups: List[List[str]] = Field(default_factory=list)
    preferred_skill_groups: List[List[str]] = Field(default_factory=list)
    skill_metadata: List[SkillMetadataResponse] = Field(default_factory=list)
    pending_taxonomy: List[str] = Field(default_factory=list)
    required_years: float = 0
    candidate_years: float = 0
    score_breakdown: dict = Field(default_factory=dict)
    scoring_version: str = "2.4"
    warnings: List[str] = Field(default_factory=list)
    execution_time_ms: float
