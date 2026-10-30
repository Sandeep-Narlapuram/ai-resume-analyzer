import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, GitCompare, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import { SkeletonTable } from '../components/common/SkeletonLoader.jsx';
import { analysisApi } from '../services/analysisApi.js';
import { useToast } from '../hooks/useToast.js';
import { formatDate, formatDateTime, scoreColor } from '../utils/formatters.js';

export default function ResumeHistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    try {
      const { data } = await analysisApi.list({ sort: '-createdAt' });
      setAnalyses(data?.data?.items || []);
    } catch {
      toast.error('Could not load your history');
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmDelete() {
    try {
      await analysisApi.remove(pendingDelete._id || pendingDelete.id);
      setAnalyses((prev) => prev.filter((a) => (a._id || a.id) !== (pendingDelete._id || pendingDelete.id)));
      toast.success('Analysis deleted');
    } catch {
      toast.error('Could not delete this analysis');
    } finally {
      setPendingDelete(null);
    }
  }

  function toggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  async function handleCompare() {
    // The compare endpoint reports how `after` changed relative to `before` —
    // order the two selected analyses chronologically so the result reads
    // correctly regardless of which one the user checked first.
    const [a, b] = compareIds
      .map((id) => analyses.find((x) => (x._id || x.id) === id))
      .sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt));

    setIsComparing(true);
    try {
      const { data } = await analysisApi.compare(a._id || a.id, b._id || b.id);
      setCompareResult(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Could not compare these analyses');
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">Resume history</h1>
          <p className="text-sm text-ink_text-muted mt-1">Every analysis you've run, in one place</p>
        </div>
        {compareIds.length === 2 && (
          <Button icon={GitCompare} variant="secondary" isLoading={isComparing} onClick={handleCompare}>
            Compare selected
          </Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : analyses.length === 0 ? (
        <Card padding="p-14" className="text-center">
          <FileText className="h-10 w-10 mx-auto text-ink_text-faint mb-4" />
          <h2 className="text-lg font-display font-semibold mb-2">No history yet</h2>
          <p className="text-sm text-ink_text-muted mb-6">Your past analyses will show up here.</p>
          <Link to="/upload">
            <Button icon={ArrowRight} iconPosition="right">
              Upload a resume
            </Button>
          </Link>
        </Card>
      ) : (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-ink_text-faint text-xs uppercase tracking-wide font-mono">
                  <th className="px-6 py-3 font-medium">
                    <span className="sr-only">Compare</span>
                  </th>
                  <th className="px-2 py-3 font-medium">Resume</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analyses.map((a) => {
                  const id = a._id || a.id;
                  return (
                    <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={compareIds.includes(id)}
                          onChange={() => toggleCompare(id)}
                          className="rounded border-white/20 bg-white/[0.04] text-violet-500 focus:ring-violet-500"
                          aria-label="Select for comparison"
                        />
                      </td>
                      <td className="px-2 py-4">
                        <Link to={`/analysis/${id}`} className="font-medium text-ink_text-primary hover:text-violet-300">
                          {a.resumeFileName || 'Resume analysis'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-ink_text-muted">{formatDateTime(a.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span
                          className="font-mono font-semibold"
                          style={{ color: scoreColor(a.atsScore ?? 0) }}
                        >
                          {a.status === 'completed' ? `${a.atsScore}/100` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="chip border-white/10 text-ink_text-muted capitalize">{a.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setPendingDelete(a)}
                          aria-label="Delete analysis"
                          className="p-2 rounded-lg text-ink_text-faint hover:text-rose-400 hover:bg-rose-400/10 btn-focus-ring"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this analysis?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        This will permanently delete the analysis for{' '}
        <span className="text-ink_text-primary">{pendingDelete?.resumeFileName || 'this resume'}</span>. This
        can't be undone.
      </Modal>

      <Modal
        isOpen={Boolean(compareResult)}
        onClose={() => {
          setCompareResult(null);
          setCompareIds([]);
        }}
        title="Score comparison"
        size="lg"
      >
        {compareResult && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-xs text-ink_text-faint mb-1">{formatDate(compareResult.before.createdAt)}</p>
                <span className="font-mono text-3xl font-semibold" style={{ color: scoreColor(compareResult.before.score ?? 0) }}>
                  {compareResult.before.score ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                {compareResult.scoreDelta > 0 && <TrendingUp className="h-6 w-6 text-emerald-400" />}
                {compareResult.scoreDelta < 0 && <TrendingDown className="h-6 w-6 text-rose-400" />}
                {compareResult.scoreDelta === 0 && <Minus className="h-6 w-6 text-ink_text-faint" />}
                <span
                  className={`font-mono text-sm font-semibold ${
                    compareResult.scoreDelta > 0
                      ? 'text-emerald-400'
                      : compareResult.scoreDelta < 0
                      ? 'text-rose-400'
                      : 'text-ink_text-faint'
                  }`}
                >
                  {compareResult.scoreDelta > 0 ? '+' : ''}
                  {compareResult.scoreDelta}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs text-ink_text-faint mb-1">{formatDate(compareResult.after.createdAt)}</p>
                <span className="font-mono text-3xl font-semibold" style={{ color: scoreColor(compareResult.after.score ?? 0) }}>
                  {compareResult.after.score ?? '—'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-ink_text-primary mb-2">
                Newly matched keywords ({compareResult.newlyMatchedKeywords?.length || 0})
              </p>
              {compareResult.newlyMatchedKeywords?.length ? (
                <div className="flex flex-wrap gap-2">
                  {compareResult.newlyMatchedKeywords.map((kw) => (
                    <span key={kw} className="chip border-emerald-400/30 text-emerald-300">
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink_text-faint">No newly matched keywords between these two runs.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
