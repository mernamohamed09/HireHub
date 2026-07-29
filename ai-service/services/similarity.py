"""Semantic similarity between a job posting and a candidate CV."""

from typing import Any

# Empirically measured with all-MiniLM-L6-v2 on representative CV/job pairs
# (backend, chef and design resumes crossed against backend and chef postings):
#
#   unrelated pairs   cosine 0.14 .. 0.27
#   partial match     cosine 0.51
#   strong match      cosine 0.63 .. 0.74
#
# Cosine similarity never approaches -1 here: sentence-transformer embeddings of
# same-language, same-genre prose (every resume and posting is professional
# English) stay well into positive territory even when the subject matter is
# unrelated. The old [-1, 1] -> [0, 100] map therefore assumed a floor that
# cannot occur in practice and scored a chef's resume 61% against a backend
# posting - inside the "Moderate Match" band.
#
# These bounds bracket the observed distribution with a little headroom rather
# than sitting exactly on the sampled extremes; the sample is small, so the aim
# is a realistic floor/ceiling, not a precise fit.
COSINE_FLOOR = 0.12
COSINE_CEILING = 0.80


def normalize_cosine_to_percentage(cosine_similarity: float) -> int:
    """Map cosine similarity to an integer percentage [0, 100].

    Rescales the realistic [COSINE_FLOOR, COSINE_CEILING] range rather than the
    theoretical [-1, 1] one, so an unrelated CV/job pair lands in the low tens
    instead of near 60.
    """
    clamped = max(COSINE_FLOOR, min(COSINE_CEILING, cosine_similarity))
    percentage = (clamped - COSINE_FLOOR) / (COSINE_CEILING - COSINE_FLOOR) * 100
    return round(percentage)


def compute_match_score(embedder: Any, job_text: str, cv_text: str) -> int:
    """Encode both texts with a sentence-transformers model and score their cosine similarity."""
    from sentence_transformers import util

    job_embedding = embedder.encode(job_text, convert_to_tensor=True)
    cv_embedding = embedder.encode(cv_text, convert_to_tensor=True)
    cosine_similarity = util.cos_sim(job_embedding, cv_embedding).item()
    return normalize_cosine_to_percentage(cosine_similarity)
