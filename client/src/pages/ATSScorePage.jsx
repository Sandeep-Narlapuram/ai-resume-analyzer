import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card.jsx';
import ScoreGauge from '../components/charts/ScoreGauge.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import RadarBreakdownChart from '../components/charts/RadarBreakdownChart.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useAnalysisPolling } from '../hooks/useAnalysisPolling.js';

const CATEGORY_LABELS = {
  keywordMatch: 'Keyword Match',
  formatting: 'Formatting',
  sectionCompleteness: 'Section Completeness',
  readability: 'Readability',
};

const CATEGORY_DESCRIPTIONS = {
  keywordMatch: 'How many role-relevant hard skills, tools, and terms your resume includes.',
  formatting: 'Whether your resume uses ATS-safe formatting — no tables, columns, or images that break parsing.',
  sectionCompleteness: 'Whether standard sections (Summary, Skills, Experience, Education) are present and complete.',
  readability: 'Sentence clarity, bullet structure, and use of measurable outcomes.',
};

export default function ATSScorePage() {
  const { analysisId } = useParams();
  const { analysis } = useAnalysisPolling(analysisId, { enabled: true });

  if (!analysis || analysis.status !== 'completed') {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Loading score details…" />
      </div>
    );
  }

  const breakdown = analysis.scoreBreakdown || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to={`/analysis/${analysisId}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink_text-muted hover:text-ink_text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to report
      </Link>

      <div className="text-center">
        <h1 className="text-2xl font-display font-semibold mb-6">Your ATS score, explained</h1>
        <div className="flex justify-center mb-8">
          <ScoreGauge score={analysis.atsScore} size={220} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Category radar" />
          <RadarBreakdownChart breakdown={breakdown} />
        </Card>

        <Card>
          <CardHeader title="Category breakdown" />
          <div className="space-y-6">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key}>
                <ProgressBar value={value} label={CATEGORY_LABELS[key] || key} colorByScore />
                <p className="text-xs text-ink_text-faint mt-1.5 leading-relaxed">
                  {CATEGORY_DESCRIPTIONS[key]}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padding="p-8" className="text-center">
        <h2 className="text-lg font-display font-semibold mb-2">What does this score mean?</h2>
        <p className="text-sm text-ink_text-muted max-w-2xl mx-auto leading-relaxed">
          A score of 80+ means your resume is very likely to pass automated ATS filters used by
          most companies. Scores between 55-79 suggest the ATS may parse your resume but rank it
          lower than competing applicants. Below 55, key sections or keywords are likely missing
          entirely — see your suggestions for exactly what to fix.
        </p>
      </Card>
    </div>
  );
}
