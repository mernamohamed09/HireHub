---
title: HireHub AI ATS Engine
emoji: 🎯
colorFrom: green
colorTo: indigo
sdk: docker
app_port: 8008
pinned: false
license: mit
short_description: Explainable ATS resume scoring and taxonomy engine
---

# HireHub AI ATS Scoring Microservice

[![Hugging Face Space](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-CPU--Optimized-EE4C2C.svg?logo=pytorch)](https://pytorch.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?logo=python)](https://www.python.org)

An on-premises, CPU-optimized, explainable **Applicant Tracking System (ATS)** inference engine for the **HireHub** platform. It combines transformer-based Named Entity Recognition (`yashpwr/resume-ner-bert-v2`), semantic embedding matching (`sentence-transformers/all-MiniLM-L6-v2`), multi-layer ESCO & tech taxonomy resolution, and deterministic rubric calculations.

---

## 🎯 Features

1. **Semantic Text Similarity**: Evaluates semantic alignment between raw CV text and job descriptions using MiniLM-L6 embeddings.
2. **NER Entity & Skill Extraction**: Extracts skills, technologies, and certifications from candidate resumes.
3. **Multi-Source Taxonomy Matching**: Cross-references canonical skills across ESCO, curated tech registries, and local market overrides.
4. **Explainable Scoring Rubric**: Delivers transparent score breakdowns (required skills, preferred skills, experience years, job title match, semantic similarity).
5. **Fail-Closed Security**: Rejects unauthorized access with `401 Unauthorized` via `X-AI-Service-Key` header authentication.
6. **Inbound Boundary Constraints**: Strictly protects CPU and memory using Pydantic length bounds (20-150k characters).

---

## 🚀 API Endpoints

### 1. Root Information
- **`GET /`**: Service metadata and online status.

### 2. Health & Readiness
- **`GET /health`**: Model readiness and loaded taxonomy status.

### 3. Taxonomy Introspection
- **`GET /taxonomy/status`**: Detailed status of active taxonomy sources.

### 4. Resume & Job Matching
- **`POST /analyze-application`**
  - **Headers**: `X-AI-Service-Key: <YOUR_SHARED_SECRET_KEY>`, `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "cv_text": "Senior Full-Stack Engineer with 6 years experience in Python, Node.js, React, Docker, and system architecture...",
      "job_title": "Senior Software Engineer",
      "job_description": "Seeking Senior Full-Stack Engineer skilled in Node.js, Python, and React."
    }
    ```
  - **Response Sample**:
    ```json
    {
      "success": true,
      "match_score": 88,
      "extracted_skills": ["python", "node.js", "react", "docker"],
      "matched_skills": ["python", "node.js", "react"],
      "missing_required_skills": [],
      "required_skills": ["python", "node.js", "react"],
      "preferred_skills": ["docker"],
      "required_years": 5.0,
      "candidate_years": 6.0,
      "score_breakdown": {
        "required_skills": 40,
        "preferred_skills": 10,
        "experience": 20,
        "title": 10,
        "semantic": 8
      },
      "execution_time_ms": 234.5
    }
    ```

---

## 🛠️ Deploying to Hugging Face Spaces

1. Create a new Space on [Hugging Face](https://huggingface.co/new-space).
2. Select **Docker** as the Space SDK.
3. In **Settings -> Variables and secrets**, add:
   - Secret Name: `AI_SERVICE_KEY`
   - Value: `<Your-Secure-Shared-Key>`
4. Push this repository or directory to your Hugging Face Space git remote:
   ```bash
   git remote add space https://huggingface.co/spaces/<YOUR_USERNAME>/<YOUR_SPACE_NAME>
   git push space main
   ```
5. Update your HireHub Backend `.env` with the Space URL:
   ```env
   AI_SERVICE_URL=https://<YOUR_USERNAME>-<YOUR_SPACE_NAME>.hf.space
   AI_SERVICE_KEY=<Your-Secure-Shared-Key>
   ```

---

## 🐳 Local Docker Execution

```bash
# Build image
docker build -t hirehub-ai-service ./ai-service

# Run container
docker run -d -p 8008:8008 -e AI_SERVICE_KEY="your-shared-secret-key" --name hirehub-ai hirehub-ai-service
```
