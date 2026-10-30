import { Queue } from 'bullmq';
import { createBullConnection } from '../config/redis.js';

export const ANALYSIS_QUEUE_NAME = 'resume-analysis';

let queueInstance = null;

export function getAnalysisQueue() {
  if (!queueInstance) {
    queueInstance = new Queue(ANALYSIS_QUEUE_NAME, {
      connection: createBullConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600 }, // keep completed jobs for 1hr for debugging
        removeOnFail: { age: 86400 },
      },
    });
  }
  return queueInstance;
}

export async function enqueueAnalysisJob({ analysisId }) {
  const queue = getAnalysisQueue();
  await queue.add('analyze', { analysisId }, { jobId: analysisId });
}
