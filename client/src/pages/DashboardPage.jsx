import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, ArrowRight, FileText, TrendingUp, Clock } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import TrendLineChart from '../components/charts/TrendLineChart.jsx';
import { SkeletonCard, SkeletonText } from '../components/common/SkeletonLoader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { analysisApi } from '../services/analysisApi.js';
import { formatDate, scoreColor } from '../utils/formatters.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await analysisApi.list({ limit: 5, sort: '-createdAt' });
        if (!cancelled) setAnalyses(data?.data?.items || []);
      } catch {
        if (!cancelled) setAnalyses([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const history = analyses
    .filter((a) => a.status === 'completed')
    .slice()
    .reverse()
    .map((a) => ({ date: a.createdAt, score: a.atsScore }));

  const latest = analyses[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p className="text-sm text-ink_text-muted mt-1">Here's how your resume is trending</p>
        </div>
        <Link to="/upload">
          <Button icon={UploadCloud}>Analyze new resume</Button>
        </Link>
      </div>

      {!isLoading && analyses.length === 0 ? (
        <Card padding="p-14" className="text-center">
          <span className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-aqua-500/10 text-violet-300 mb-5">
            <FileText className="h-8 w-8" />
          </span>
          <h2 className="text-xl font-display font-semibold mb-2">No analyses yet</h2>
          <p className="text-sm text-ink_text-muted max-w-sm mx-auto mb-6">
            Upload your first resume to get an ATS score, keyword gaps, and AI-written suggestions.
          </p>
          <Link to="/upload">
            <Button icon={ArrowRight} iconPosition="right">
              Upload your resume
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Score trend"
              subtitle="Your ATS score across every analysis"
              action={<TrendingUp className="h-5 w-5 text-aqua-400" />}
            />
            {isLoading ? <SkeletonText lines={5} /> : <TrendLineChart history={history} />}
          </Card>

          <Card>
            <CardHeader title="Latest result" />
            {isLoading ? (
              <SkeletonCard />
            ) : latest ? (
              <div className="text-center">
                <span
                  className="font-mono text-5xl font-semibold"
                  style={{ color: scoreColor(latest.atsScore ?? 0) }}
                >
                  {latest.atsScore ?? '—'}
                </span>
                <p className="text-xs text-ink_text-faint font-mono mt-1">/ 100</p>
                <p className="text-sm text-ink_text-muted mt-4">{formatDate(latest.createdAt)}</p>
                <Link to={`/analysis/${latest._id || latest.id}`}>
                  <Button variant="secondary" size="sm" fullWidth className="mt-5">
                    View full report
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-ink_text-muted">No completed analyses yet.</p>
            )}
          </Card>
        </div>
      )}

      {analyses.length > 0 && (
        <Card>
          <CardHeader
            title="Recent analyses"
            action={
              <Link to="/history" className="text-sm text-violet-400 hover:text-violet-300 font-medium">
                View all
              </Link>
            }
          />
          <div className="divide-y divide-white/10">
            {analyses.map((a) => (
              <Link
                key={a._id || a.id}
                to={`/analysis/${a._id || a.id}`}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-ink_text-muted group-hover:text-violet-300 transition-colors">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink_text-primary truncate">
                      {a.resumeFileName || 'Resume analysis'}
                    </p>
                    <p className="text-xs text-ink_text-faint flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {formatDate(a.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className="font-mono text-sm font-semibold shrink-0 ml-4"
                  style={{ color: scoreColor(a.atsScore ?? 0) }}
                >
                  {a.status === 'completed' ? a.atsScore : a.status}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
