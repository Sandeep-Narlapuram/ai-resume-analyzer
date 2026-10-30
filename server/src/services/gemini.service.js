import { z } from 'zod';
import { getGeminiModel } from '../config/gemini.js';
import { buildResumeAnalysisPrompt } from '../prompts/geminiPrompt.templates.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

const sectionEntrySchema = z.object({
  status: z.enum(['good', 'needs_improvement', 'missing']),
  comment: z.string().max(500),
});

// The AI's response is untrusted output — it is parsed and validated against
// this strict schema before anything derived from it is persisted or ever
// rendered to a client. Anything that doesn't match this shape is rejected,
// not coerced or passed through.
const analysisResponseSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  scoreBreakdown: z.object({
    keywordMatch: z.number().int().min(0).max(100),
    formatting: z.number().int().min(0).max(100),
    sectionCompleteness: z.number().int().min(0).max(100),
    readability: z.number().int().min(0).max(100),
  }),
  matchedKeywords: z.array(z.string().max(80)).max(100),
  missingKeywords: z.object({
    hardSkills: z.array(z.string().max(80)).max(50),
    softSkills: z.array(z.string().max(80)).max(50),
    tools: z.array(z.string().max(80)).max(50),
  }),
  sectionFeedback: z.object({
    summary: sectionEntrySchema,
    skills: sectionEntrySchema,
    experience: sectionEntrySchema,
    education: sectionEntrySchema,
    projects: sectionEntrySchema,
  }),
  suggestions: z
    .array(
      z.object({
        title: z.string().max(150),
        description: z.string().max(1000),
        priority: z.enum(['High', 'Medium', 'Low']),
        category: z.string().max(80),
      })
    )
    .max(30),
});

const MAX_RETRIES = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

export const geminiService = {
  /**
   * Calls Gemini with the resume analysis prompt, retrying with backoff on
   * transient failures, and strictly validates the JSON response shape
   * before returning it. Throws AppError on repeated failure or malformed
   * output — callers (the queue worker) are responsible for marking the
   * analysis job as failed.
   */
  async analyzeResume({ resumeText, jobDescriptionText }) {
    const prompt = buildResumeAnalysisPrompt({ resumeText, jobDescriptionText });
    const model = getGeminiModel();

    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = stripCodeFences(result.response.text());
        const tokensUsed = result.response.usageMetadata?.totalTokenCount ?? 0;

        let parsedJson;
        try {
          parsedJson = JSON.parse(responseText);
        } catch {
          throw new Error('Gemini response was not valid JSON');
        }

        const validated = analysisResponseSchema.safeParse(parsedJson);
        if (!validated.success) {
          logger.warn({ issues: validated.error.issues }, 'Gemini response failed schema validation');
          throw new Error('Gemini response did not match the expected schema');
        }

        return { data: validated.data, rawResponse: parsedJson, tokensUsed };
      } catch (err) {
        lastError = err;
        logger.warn({ attempt, err: err.message }, 'Gemini analysis attempt failed');
        if (attempt < MAX_RETRIES) {
          await sleep(500 * Math.pow(2, attempt));
        }
      }
    }

    throw AppError.unprocessable(
      'The AI analysis could not be completed. Please try again in a moment.',
      'GEMINI_ANALYSIS_FAILED',
      { cause: lastError?.message }
    );
  },
};
