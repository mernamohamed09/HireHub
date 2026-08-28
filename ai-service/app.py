import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException

# Load deployment-local settings before importing taxonomy services because the
# optional TAXONOMY_MANIFEST path is resolved during module initialization.
load_dotenv(Path(__file__).with_name(".env"))

from schemas import AnalyzeRequest, AnalyzeResponse
from services.experience import extract_candidate_years, extract_required_years
from services.requirements import extract_skill_requirements
from services.scoring import calculate_explainable_score
from services.similarity import compute_match_score
from services.skills import extract_skills
from services.taxonomy import (
    describe_skill,
    extract_taxonomy_skills,
    filter_weak_skill_evidence,
    merge_canonical_skills,
    taxonomy_status,
)
from state import ml_models

NER_MODEL_NAME = "yashpwr/resume-ner-bert-v2"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
MIN_WORDS_FOR_SCORING = 20


@asynccontextmanager
async def lifespan(app: FastAPI):
    from sentence_transformers import SentenceTransformer
    from transformers import pipeline

    ml_models["ner"] = pipeline(
        "ner",
        model=NER_MODEL_NAME,
        aggregation_strategy="simple",
    )
    ml_models["embedder"] = SentenceTransformer(EMBEDDING_MODEL_NAME)

    yield

    ml_models.clear()


app = FastAPI(
    title="HireHub AI ATS Engine",
    description="On-prem, CPU-only AI microservice that scores resume/job-description matches.",
    version="2.4.0",
    lifespan=lifespan,
)


@app.get("/")
async def root():
    return {
        "service": "HireHub AI ATS Engine",
        "version": "2.4.0",
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "taxonomy": "/taxonomy/status",
            "analyze": "/analyze-application"
        }
    }


@app.get("/health")
async def health():
    ready = "ner" in ml_models and "embedder" in ml_models
    sources = taxonomy_status()
    return {
        "success": ready,
        "service": "hirehub-ai",
        "models_ready": ready,
        "taxonomy_ready": all(
            source.loaded
            for source in sources
            if source.name != "esco_en"
        ),
        "taxonomy_sources": [
            {
                "name": source.name,
                "version": source.version,
                "loaded": source.loaded,
                "entries": source.entries,
            }
            for source in sources
        ],
    }


@app.get("/taxonomy/status")
async def get_taxonomy_status():
    return {
        "success": True,
        "language": "en",
        "sources": [
            {
                "name": source.name,
                "version": source.version,
                "priority": source.priority,
                "mode": source.mode,
                "loaded": source.loaded,
                "entries": source.entries,
            }
            for source in taxonomy_status()
        ],
    }


@app.post("/analyze-application", response_model=AnalyzeResponse)
async def analyze_application(
    payload: AnalyzeRequest,
    x_ai_service_key: str | None = Header(default=None),
) -> AnalyzeResponse:
    expected_key = os.getenv("AI_SERVICE_KEY")
    if not expected_key or x_ai_service_key != expected_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing AI service credentials",
        )
    start = time.perf_counter()

    cv_text = payload.cv_text.strip()
    job_text = f"{payload.job_title}\n{payload.job_description}"

    if len(cv_text.split()) < MIN_WORDS_FOR_SCORING:
        execution_time_ms = (time.perf_counter() - start) * 1000
        return AnalyzeResponse(
            success=True,
            match_score=0,
            extracted_skills=[],
            warnings=["Resume text is too short for reliable scoring."],
            execution_time_ms=round(execution_time_ms, 2),
        )

    semantic_score = compute_match_score(ml_models["embedder"], job_text, cv_text)
    ner_skills = extract_skills(ml_models["ner"], cv_text)
    extracted_skills = filter_weak_skill_evidence(
        cv_text,
        merge_canonical_skills(
            extract_taxonomy_skills(cv_text, exclude_weak_evidence=True),
            ner_skills,
        ),
    )
    requirements = extract_skill_requirements(job_text)
    required_years = extract_required_years(payload.job_description)
    candidate_years = extract_candidate_years(cv_text)
    score = calculate_explainable_score(
        semantic_score=semantic_score,
        required_skills=requirements.required,
        preferred_skills=requirements.preferred,
        candidate_skills=extracted_skills,
        required_years=required_years,
        candidate_years=candidate_years,
        job_title=payload.job_title,
        cv_text=cv_text,
        required_skill_groups=requirements.required_groups,
        preferred_skill_groups=requirements.preferred_groups,
    )
    all_reported_skills = merge_canonical_skills(
        extracted_skills,
        requirements.required,
        requirements.preferred,
        *requirements.required_groups,
        *requirements.preferred_groups,
    )
    metadata = [describe_skill(skill) for skill in all_reported_skills]

    execution_time_ms = (time.perf_counter() - start) * 1000
    return AnalyzeResponse(
        success=True,
        match_score=score.final_score,
        extracted_skills=extracted_skills,
        matched_skills=score.matched_skills,
        missing_required_skills=score.missing_required_skills,
        required_skills=requirements.required,
        preferred_skills=requirements.preferred,
        required_skill_groups=requirements.required_groups,
        preferred_skill_groups=requirements.preferred_groups,
        skill_metadata=[
            {
                "canonical": item.canonical,
                "preferred": item.preferred,
                "concept_id": item.concept_id,
                "source": item.source,
                "source_version": item.source_version,
                "license": item.license,
                "known": item.known,
            }
            for item in metadata
        ],
        pending_taxonomy=[
            item.canonical
            for item in metadata
            if not item.known
        ],
        required_years=required_years,
        candidate_years=candidate_years,
        score_breakdown={
            "required_skills": score.required_skill_score,
            "preferred_skills": score.preferred_skill_score,
            "experience": score.experience_score,
            "title": score.title_score,
            "semantic": score.semantic_score,
            "semantic_raw": score.semantic_raw_score,
        },
        execution_time_ms=round(execution_time_ms, 2),
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8008))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)

