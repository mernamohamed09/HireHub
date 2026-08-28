const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8008';
const REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);

/**
 * Calls the FastAPI AI microservice to score a CV against a job posting.
 * Never throws: connection failures and timeouts are caught, logged, and
 * reported via `success: false` so the caller can degrade gracefully.
 */
const analyzeApplication = async ({ cvText, jobTitle, jobDescription }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${AI_SERVICE_URL}/analyze-application`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(process.env.AI_SERVICE_KEY
                    ? { 'X-AI-Service-Key': process.env.AI_SERVICE_KEY }
                    : {})
            },
            body: JSON.stringify({
                cv_text: cvText,
                job_title: jobTitle,
                job_description: jobDescription
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`AI service responded with status ${response.status}`);
        }

        const data = await response.json();
        if (data.scoring_version !== '2.4' || !data.score_breakdown) {
            throw new Error(
                'AI service version mismatch. Restart the FastAPI service so it loads scoring version 2.4.'
            );
        }

        return {
            success: true,
            matchScore: data.match_score,
            extractedSkills: data.extracted_skills,
            matchedSkills: data.matched_skills,
            missingRequiredSkills: data.missing_required_skills,
            requiredSkills: data.required_skills,
            requiredSkillGroups: data.required_skill_groups,
            skillMetadata: data.skill_metadata,
            pendingTaxonomy: data.pending_taxonomy,
            scoreBreakdown: data.score_breakdown,
            requiredYears: data.required_years,
            candidateYears: data.candidate_years,
            scoringVersion: data.scoring_version,
            warnings: data.warnings,
            executionTimeMs: data.execution_time_ms
        };
    } catch (error) {
        console.error('AI service call failed:', error.message);
        return { success: false, error: error.message };
    } finally {
        clearTimeout(timeoutId);
    }
};

module.exports = { analyzeApplication };
