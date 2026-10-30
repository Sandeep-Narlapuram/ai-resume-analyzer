import { useParams, Link } from 'react-router-dom';
import { FileDown, ListChecks, Target, RefreshCcw } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ScoreGauge from '../components/charts/ScoreGauge.jsx';
import RadarBreakdownChart from '../components/charts/RadarBreakdownChart.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { SkeletonScoreGauge, SkeletonText } from '../components/common/SkeletonLoader.jsx';
import { useAnalysisPolling } from '../hooks/useAnalysisPolling.js';
import { buildAndDownloadReport } from '../utils/pdfBuilder.js';
import { useToast } from '../hooks/useToast.js';

export default function ResumeAnalysisPage() {
  const { analysisId } = useParams();
  const { analysis, error, isPolling } = useAnalysisPolling(analysisId);
  const toast = useToast();

  if (error) {
    return (
      <Card padding="p-12" className="text-center max-w-lg mx-auto">
        <h2 className="text-xl font-display font-semibold mb-2">Couldn't load this analysis</h2>
        <p className="text-sm text-ink_text-muted mb-6">
          The report may have been deleted, or something went wrong on our end.
        </p>
        <Link to="/history">
          <Button variant="secondary">Back to history</Button>
        </Link>
      </Card>
    );
  }

  if (!analysis || analysis.status === 'queued' || analysis.status === 'processing') {
    return (
      <Card padding="p-16" className="text-center max-w-lg mx-auto">
        <LoadingSpinner size="lg" />
        <h2 className="text-lg font-display font-semibold mt-6 mb-2">Analyzing your resume…</h2>
        <p className="text-sm text-ink_text-muted">
          Gemini is checking formatting, section completeness, and keyword coverage. This usually
          takes under 15 seconds.
        </p>
        <div className="mt-8 grid gap-4">
          <SkeletonScoreGauge />
          <SkeletonText lines={2} />
        </div>
      </Card>
    );
  }

  if (analysis.status === 'failed') {
    return (
      <Card padding="p-12" className="text-center max-w-lg mx-auto">
        <h2 className="text-xl font-display font-semibold mb-2">Analysis failed</h2>
        <p className="text-sm text-ink_text-muted mb-6">
          {analysis.errorMessage || 'Something went wrong while analyzing this resume.'}
        </p>
        <Link to="/upload">
          <Button icon={RefreshCcw}>Try again</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">Analysis report</h1>
          <p className="text-sm text-ink_text-muted mt-1">{analysis.resumeFileName || 'Your resume'}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={FileDown}
            onClick={() => buildAndDownloadReport(analysis).catch(() => toast.error('Could not generate PDF'))}
          >
            Download PDF
          </Button>
          <Link to={`/analysis/${analysisId}/suggestions`}>
            <Button icon={ListChecks} iconPosition="right">
              View suggestions
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center">
          <ScoreGauge score={analysis.atsScore} size={200} />
          <Link to={`/analysis/${analysisId}/score`} className="mt-5 text-sm text-violet-400 hover:text-violet-300 font-medium">
            View score breakdown
          </Link>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Score breakdown"
            subtitle="How each category contributes to your ATS score"
            action={<Target className="h-5 w-5 text-aqua-400" />}
          />
          <RadarBreakdownChart breakdown={analysis.scoreBreakdown} />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Matched keywords" subtitle={`${analysis.matchedKeywords?.length || 0} found`} />
          <div className="flex flex-wrap gap-2">
            {(analysis.matchedKeywords || []).map((kw) => (
              <span key={kw} className="chip border-emerald-400/30 text-emerald-300">
                {kw}
              </span>
            ))}
            {!analysis.matchedKeywords?.length && (
              <p className="text-sm text-ink_text-faint">No keyword data available.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Missing keywords"
            subtitle={`${
              (analysis.missingKeywords?.hardSkills?.length || 0) +
              (analysis.missingKeywords?.softSkills?.length || 0) +
              (analysis.missingKeywords?.tools?.length || 0)
            } gaps found`}
          />
          <div className="space-y-3">
            {Object.entries(analysis.missingKeywords || {}).map(([category, words]) =>
              words?.length ? (
                <div key={category}>
                  <p className="text-xs uppercase tracking-wide text-ink_text-faint mb-1.5 font-mono">
                    {category.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {words.map((kw) => (
                      <span key={kw} className="chip border-rose-400/30 text-rose-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </Card>
      </div>

      {isPolling && <p className="text-xs text-ink_text-faint text-center">Refreshing…</p>}
    </div>
  );
}
