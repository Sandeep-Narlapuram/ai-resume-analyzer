# ScoreMyResume — Frontend

AI-powered resume analyzer frontend built with React 19, Vite, Tailwind CSS, React Router, Axios, and React Hook Form.

## Stack

- **React 19** + **Vite** — app shell and build tooling
- **Tailwind CSS** — utility-first styling, dark-mode-first glassmorphism design system
- **React Router v6** — client-side routing (public, auth, and protected app layouts)
- **Axios** — API client with automatic access-token refresh
- **React Hook Form** — all form handling and validation
- **Chart.js / react-chartjs-2** — score gauge, radar breakdown, and trend charts
- **jsPDF** — client-side PDF report export
- **lucide-react** — icon set

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

The app expects a backend implementing the API contract described in the architecture doc
(`/api/v1/auth/*`, `/api/v1/resumes/*`, `/api/v1/analyses/*`). See `vite.config.js` for the local
dev proxy to `http://localhost:5000`.

## Project structure

```
src/
├── components/
│   ├── common/       # Button, Card, Modal, LoadingSpinner, SkeletonLoader, Toast, ProgressBar
│   ├── navigation/    # Navbar, Sidebar, Footer
│   ├── charts/        # ScoreGauge, RadarBreakdownChart, TrendLineChart
│   └── upload/         # ResumeDropzone
├── pages/              # One file per route (see App Router)
├── layouts/            # PublicLayout, AuthLayout, AppLayout
├── routes/              # AppRouter, ProtectedRoute
├── context/             # AuthContext, ThemeContext, ToastContext
├── hooks/               # useAuth, useTheme, useToast, useAnalysisPolling
├── services/            # axiosInstance, authApi, resumeApi, analysisApi
└── utils/               # formatters, validators, pdfBuilder
```

## Design system

- **Colors:** deep-space background (`ink`), violet + aqua gradient accent, semantic score colors
  (emerald/amber/rose for strong/needs-work/weak)
- **Type:** Space Grotesk (display), Inter (body), JetBrains Mono (scores & data)
- **Signature element:** the animated circular `ScoreGauge` — a glowing gradient arc that sweeps in
  to reveal the ATS score, used consistently across the dashboard, analysis report, and score page
- **Dark mode is default**; light mode is available via the theme toggle in the navbar/settings
- Reduced-motion and visible keyboard focus are respected throughout (see `index.css`)

## Notes for backend integration

- Access tokens are kept in memory only (never `localStorage`) and refreshed via an httpOnly
  cookie-based `/auth/refresh` call — see `services/axiosInstance.js`.
- Long-running Gemini analysis jobs are polled via `useAnalysisPolling`, which expects
  `GET /analyses/:id` to return a `status` of `queued | processing | completed | failed`.
- PDF export happens entirely client-side in `utils/pdfBuilder.js`; no backend endpoint required
  for v1 (see architecture doc for the future server-side rendering path).
