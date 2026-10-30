import { useEffect, useRef, useState, useCallback } from 'react';
import { analysisApi } from '../services/analysisApi.js';

/**
 * Polls an analysis job until it reaches a terminal status (completed | failed).
 * Backs off gradually to avoid hammering the API while a Gemini job is processing.
 */
export function useAnalysisPolling(analysisId, { enabled = true } = {}) {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const timeoutRef = useRef(null);
  const attemptRef = useRef(0);

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!analysisId || !enabled) return undefined;

    let cancelled = false;
    setIsPolling(true);
    attemptRef.current = 0;

    async function poll() {
      try {
        const { data } = await analysisApi.getById(analysisId);
        const result = data?.data;
        if (cancelled) return;
        setAnalysis(result);

        if (result?.status === 'completed' || result?.status === 'failed') {
          setIsPolling(false);
          return;
        }

        attemptRef.current += 1;
        const delay = Math.min(1500 * Math.pow(1.3, attemptRef.current), 8000);
        timeoutRef.current = setTimeout(poll, delay);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setIsPolling(false);
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [analysisId, enabled]);

  return { analysis, error, isPolling, stop };
}
