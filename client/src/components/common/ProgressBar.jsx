import { scoreColor } from '../../utils/formatters.js';

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = true,
  colorByScore = false,
  className = '',
  trackClassName = '',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = colorByScore ? scoreColor(value) : undefined;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5 text-sm">
          {label && <span className="text-ink_text-muted">{label}</span>}
          {showValue && <span className="font-mono text-ink_text-primary">{Math.round(value)}%</span>}
        </div>
      )}
      <div className={`h-2 w-full rounded-full bg-white/[0.06] overflow-hidden ${trackClassName}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            colorByScore ? '' : 'bg-gradient-to-r from-violet-500 to-aqua-500'
          }`}
          style={{ width: `${pct}%`, backgroundColor: barColor }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
