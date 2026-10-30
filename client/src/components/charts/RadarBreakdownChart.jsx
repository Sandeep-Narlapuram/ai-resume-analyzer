import { useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LABELS = {
  keywordMatch: 'Keyword Match',
  formatting: 'Formatting',
  sectionCompleteness: 'Section Completeness',
  readability: 'Readability',
};

export default function RadarBreakdownChart({ breakdown = {} }) {
  const data = useMemo(
    () => ({
      labels: Object.keys(breakdown).map((key) => LABELS[key] || key),
      datasets: [
        {
          label: 'Score breakdown',
          data: Object.values(breakdown),
          backgroundColor: 'rgba(124, 92, 255, 0.18)',
          borderColor: '#7C5CFF',
          borderWidth: 2,
          pointBackgroundColor: '#22D3EE',
          pointBorderColor: '#0A0E1A',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }),
    [breakdown]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      scales: {
        r: {
          angleLines: { color: 'rgba(255,255,255,0.08)' },
          grid: { color: 'rgba(255,255,255,0.08)' },
          pointLabels: {
            color: '#94A3B8',
            font: { family: 'Inter', size: 11 },
          },
          ticks: {
            display: true,
            backdropColor: 'transparent',
            color: '#5B6478',
            stepSize: 25,
            font: { family: '"JetBrains Mono"', size: 9 },
          },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F1524',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleFont: { family: 'Space Grotesk' },
          bodyFont: { family: '"JetBrains Mono"' },
          callbacks: {
            label: (ctx) => ` ${ctx.formattedValue}/100`,
          },
        },
      },
    }),
    []
  );

  return (
    <div style={{ height: 280 }}>
      <Radar data={data} options={options} />
    </div>
  );
}
