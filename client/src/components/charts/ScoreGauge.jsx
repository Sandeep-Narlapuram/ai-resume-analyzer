import { useEffect, useState } from 'react';
import { scoreColor, scoreBand } from '../../utils/formatters.js';

/**
 * The app's signature visual element: a glowing circular gauge with an
 * animated gradient arc that sweeps in to reveal the ATS score.
 */
export default function ScoreGauge({ score = 0, size = 200, strokeWidth = 14, showLabel = true }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = scoreColor(score);
  const band = scoreBand(score);
  const gradientId = 'score-gauge-gradient';

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 150);
    return () => clearTimeout(timeout);
  }, [score]);

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`ATS score ${score} out of 100, rated ${band.label}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-white/[0.06]"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 8px ${color}66)`,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-semibold text-ink_text-primary tabular-nums">
          {Math.round(animatedScore)}
        </span>
        <span className="text-xs text-ink_text-faint font-mono">/ 100</span>
      </div>

      {showLabel && (
        <div className="mt-4 chip" style={{ borderColor: `${color}55`, color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          {band.label} ATS Match
        </div>
      )}
    </div>
  );
}