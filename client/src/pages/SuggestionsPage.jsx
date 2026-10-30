import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useAnalysisPolling } from '../hooks/useAnalysisPolling.js';

const PRIORITY_META = {
  High: { icon: AlertCircle, className: 'border-rose-400/30 text-rose-300 bg-rose-500/5' },
  Medium: { icon: Info, className: 'border-amber-400/30 text-amber-300 bg-amber-500/5' },
  Low: { icon: CheckCircle2, className: 'border-emerald-400/30 text-emerald-300 bg-emerald-500/5' },
};

const FILTERS = ['All', 'High', 'Medium', 'Low'];

export default function SuggestionsPage() {
  const { analysisId } = useParams();
  const { analysis } = useAnalysisPolling(analysisId);
  const [filter, setFilter] = useState('All');

  const suggestions = analysis?.suggestions || [];
  const filtered = useMemo(
    () => (filter === 'All' ? suggestions : suggestions.filter((s) => s.priority === filter)),
    [suggestions, filter]
  );

  if (!analysis || analysis.status !== 'completed') {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Loading suggestions…" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to={`/analysis/${analysisId}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink_text-muted hover:text-ink_text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to report
      </Link>

      <div>
        <h1 className="text-2xl font-display font-semibold">Suggestions</h1>
        <p className="text-sm text-ink_text-muted mt-1">
          Ranked by impact — start with High priority items first.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip transition-colors ${
              filter === f
                ? 'border-violet-400/50 text-violet-300 bg-violet-500/10'
                : 'border-white/10 text-ink_text-muted hover:text-ink_text-primary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {analysis.sectionFeedback && (
        <Card>
          <CardHeader title="Section feedback" subtitle="Status of each resume section" />
          <div className="space-y-3">
            {Object.entries(analysis.sectionFeedback).map(([section, info]) => (
              <div key={section} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-sm font-medium text-ink_text-primary capitalize w-32 shrink-0">
                  {section}
                </span>
                <p className="text-sm text-ink_text-muted">{info?.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card padding="p-10" className="text-center text-sm text-ink_text-muted">
            No suggestions in this category.
          </Card>
        )}
        {filtered.map((s, i) => {
          const meta = PRIORITY_META[s.priority] || PRIORITY_META.Medium;
          const Icon = meta.icon;
          return (
            <Card key={i} className={`border ${meta.className}`}>
              <div className="flex items-start gap-4">
                <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <h3 className="font-display font-semibold text-ink_text-primary">{s.title}</h3>
                    <span className="chip shrink-0 border-current">{s.priority}</span>
                  </div>
                  <p className="text-sm text-ink_text-muted leading-relaxed">{s.description}</p>
                  {s.category && (
                    <p className="text-xs text-ink_text-faint font-mono mt-2 uppercase tracking-wide">
                      {s.category}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
