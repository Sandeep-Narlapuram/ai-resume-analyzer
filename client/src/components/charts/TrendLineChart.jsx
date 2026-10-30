import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatDate } from '../../utils/formatters.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function TrendLineChart({ history = [] }) {
  const data = useMemo(() => {
    const gradient = (ctx) => {
      const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 240);
      g.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
      g.addColorStop(1, 'rgba(34, 211, 238, 0)');
      return g;
    };

    return {
      labels: history.map((h) => formatDate(h.date, { year: undefined })),
      datasets: [
        {
          label: 'ATS Score',
          data: history.map((h) => h.score),
          borderColor: '#22D3EE',
          borderWidth: 2.5,
          pointBackgroundColor: '#7C5CFF',
          pointBorderColor: '#0A0E1A',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true,
          backgroundColor: gradient,
        },
      ],
    };
  }, [history]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#5B6478', font: { family: 'Inter', size: 11 } },
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: '#5B6478', font: { family: '"JetBrains Mono"', size: 10 }, stepSize: 25 },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F1524',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          bodyFont: { family: '"JetBrains Mono"' },
          callbacks: { label: (ctx) => ` Score: ${ctx.formattedValue}` },
        },
      },
    }),
    []
  );

  if (!history.length) {
    return (
      <div className="h-[240px] flex items-center justify-center text-sm text-ink_text-faint">
        Analyze a resume to start tracking your score trend.
      </div>
    );
  }

  return (
    <div style={{ height: 240 }}>
      <Line data={data} options={options} />
    </div>
  );
}
