import { Worker } from 'bullmq';
import { createBullConnection } from '../config/redis.js';
import { connectDatabase } from '../config/db.js';
import { logger } from '../config/logger.js';
import { ANALYSIS_QUEUE_NAME } from './analysis.queue.js';
import { analysisRepository } from '../repositories/analysis.repository.js';
import { resumeRepository } from '../repositories/resume.repository.js';
import { geminiService } from '../services/gemini.service.js';
import { scoringService } from '../services/scoring.service.js';

/**
 * Runs as a separate process from the API server (see package.json's
 * `worker` script and docker-compose.yml) so slow/rate-limited Gemini calls
 * never block or time out an HTTP request. Scaled independently from the
 * web tier as analysis volume grows.
 */
export async function processAnalysisJob(job) {
  const { analysisId } = job.data;

  const analysis = await analysisRepository.findById(analysisId);
  if (!analysis) {
    logger.warn({ analysisId }, 'Analysis record not found — skipping job');
    return;
  }
  const startTime = Date.now();
  logger.info(
  { analysisId, durationSeconds: ((Date.now() - startTime) / 1000).toFixed(2) },
  'Gemini response received'
);

  await analysisRepository.updateById(analysisId, { status: 'processing' });

  try {
    const resume = await resumeRepository.findById(analysis.resumeId, { withText: true });
    if (!resume) throw new Error('Associated resume no longer exists');

    const { data, rawResponse, tokensUsed } = await geminiService.analyzeResume({
      resumeText: resume.extractedText,
      jobDescriptionText: analysis.jobDescriptionText,
    });

    const compositeScore = scoringService.computeCompositeScore(data.scoreBreakdown);

    await analysisRepository.updateById(analysisId, {
      status: 'completed',
      atsScore: compositeScore,
      scoreBreakdown: data.scoreBreakdown,
      matchedKeywords: data.matchedKeywords,
      missingKeywords: data.missingKeywords,
      sectionFeedback: data.sectionFeedback,
      suggestions: data.suggestions,
      rawAiResponse: rawResponse,
      geminiTokensUsed: tokensUsed,
    });

    logger.info({ analysisId, score: compositeScore }, 'Analysis completed');
  } catch (err) {
    const attemptsMade = job.attemptsMade ?? 1;
    const maxAttempts = job.opts?.attempts ?? 1;
    const isFinalAttempt = attemptsMade >= maxAttempts;

    logger.error(
      { analysisId, err: err.message, attemptsMade, maxAttempts, isFinalAttempt },
      'Analysis job attempt failed'
    );

    // Only surface a user-visible "failed" status once every retry is
    // exhausted. Writing it on the first transient failure was racy: the
    // frontend polls and treats "failed" as terminal, so it would stop
    // watching and show a false failure right as BullMQ was about to retry
    // and succeed a few seconds later, leaving the UI out of sync with a DB
    // row that had actually gone on to complete.
    if (isFinalAttempt) {
      await analysisRepository.updateById(analysisId, {
        status: 'failed',
        errorMessage: err.message || 'Analysis failed unexpectedly',
      });
    }

    throw err; // let BullMQ record the failure / retry per defaultJobOptions
  }
}

async function start() {
  await connectDatabase();

  const worker = new Worker(ANALYSIS_QUEUE_NAME, processAnalysisJob, {
    connection: createBullConnection(),
    concurrency: 5,
  });

  worker.on('completed', (job) => logger.info({ jobId: job.id }, 'Job completed'));
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err: err.message }, 'Job failed'));

  logger.info('Analysis worker started');

  process.on('SIGTERM', async () => {
    await worker.close();
    process.exit(0);
  });
}

// Only start the worker (and its live DB/Redis connections) when this file is
// run directly (`node src/queues/analysis.worker.js`) — not as a side effect
// of some other module importing processAnalysisJob for reuse or testing.
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  start().catch((err) => {
    logger.error({ err }, 'Failed to start analysis worker');
    process.exit(1);
  });
}
