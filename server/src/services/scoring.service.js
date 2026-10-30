/**
 * Gemini returns category-level scores (keywordMatch, formatting,
 * sectionCompleteness, readability) as part of its structured response.
 * Rather than trusting the model's own self-reported composite atsScore
 * (which can drift or be inconsistent between calls), we compute the final
 * score server-side with fixed, auditable weights. This keeps scoring
 * deterministic and reproducible independent of the AI's phrasing.
 */
const WEIGHTS = {
  keywordMatch: 0.4,
  formatting: 0.2,
  sectionCompleteness: 0.2,
  readability: 0.2,
};

export const scoringService = {
  computeCompositeScore(breakdown) {
    const weightedSum = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => {
      const value = breakdown[key] ?? 0;
      return sum + value * weight;
    }, 0);
    return Math.round(weightedSum);
  },

  weights: WEIGHTS,
};
