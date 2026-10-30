# ScoreMyResume — AI Resume Analyzer

This is the complete, already-built project: a full-stack web app that lets a user upload a resume
(PDF/DOCX), get an AI-generated ATS (Applicant Tracking System) score, see missing keywords, get
ranked improvement suggestions, and download a PDF report. This README is the single place to go to
get it running locally in VS Code — nothing here changes the project's features, UI, or
architecture; it's export/setup documentation for the existing codebase.

## 1. Overview & features

- Email/password auth (register, login, change password, delete account, forgot/reset password)
- Resume upload with real PDF/DOCX text extraction
- AI analysis via Google Gemini: ATS score (0–100), category breakdown (keyword match, formatting,
  section completeness, readability), matched/missing keywords, ranked suggestions
- Resume history with score-trend charts and a real analysis-to-analysis Compare view
- Client-side PDF report export
- Dark-mode glassmorphism UI, fully responsive
- Contact form that sends real email (once SMTP is configured)
- Per-user daily analysis quota and rate limiting
- Async processing: uploads don't block on the Gemini call — a separate worker process handles it

## 2. Technology stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, React Hook Form, Chart.js/Recharts,
jsPDF, lucide-react
**Backend:** Node.js, Express, MongoDB + Mongoose, Redis + BullMQ (job queue), JWT + bcrypt, Multer +
pdf-parse + mammoth (file upload/extraction), Zod (validation), nodemailer, pino (logging)
**AI:** Google Gemini API
**Infra:** Docker (optional), MongoDB, Redis

## 3. Architecture

Layered backend (`routes → controllers → services → repositories → models`), with resume analysis
handled by a **separate worker process** reading jobs off a Redis-backed queue — this is so a slow
or rate-limited Gemini call never blocks or times out the upload request itself. Full design
rationale is in `AI_Resume_Analyzer_Architecture.md`.

## 4. Exact folder structure

```
ai-resume-analyzer-fullstack/
├── client/                              React 19 + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                  Button, Card, Modal, LoadingSpinner, SkeletonLoader, Toast, ProgressBar
│   │   │   ├── navigation/              Navbar, Sidebar, Footer
│   │   │   ├── charts/                  ScoreGauge, RadarBreakdownChart, TrendLineChart
│   │   │   └── upload/                  ResumeDropzone
│   │   ├── pages/                       HomePage, LoginPage, RegisterPage, ForgotPasswordPage,
│   │   │                                 ResetPasswordPage, DashboardPage, UploadResumePage,
│   │   │                                 ResumeAnalysisPage, ATSScorePage, SuggestionsPage,
│   │   │                                 ResumeHistoryPage, ProfilePage, SettingsPage, AboutPage,
│   │   │                                 ContactPage, NotFoundPage
│   │   ├── layouts/                     PublicLayout, AuthLayout, AppLayout
│   │   ├── routes/                      AppRouter, ProtectedRoute
│   │   ├── context/                     AuthContext, ThemeContext, ToastContext
│   │   ├── hooks/                       useAuth, useTheme, useToast, useAnalysisPolling
│   │   ├── services/                    axiosInstance, authApi, resumeApi, analysisApi, contactApi
│   │   ├── utils/                       formatters, validators, pdfBuilder
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── server/                              Node.js + Express backend
│   ├── src/
│   │   ├── config/                      env, logger, db, redis, gemini
│   │   ├── models/                      User, Resume, Analysis, RefreshToken
│   │   ├── routes/                      auth, resume, analysis, admin, contact (+ index.js)
│   │   ├── controllers/                 auth, resume, analysis, admin, contact
│   │   ├── services/                    auth, extraction, gemini, scoring, storage, email
│   │   ├── repositories/                user, resume, analysis, refreshToken
│   │   ├── middlewares/                 auth, upload, error, rateLimiter, resumeOwnership, validate
│   │   ├── validators/                  auth, resume, analysis, admin, contact (Zod schemas)
│   │   ├── queues/                      analysis.queue.js, analysis.worker.js
│   │   ├── prompts/                     geminiPrompt.templates.js
│   │   ├── utils/                       AppError, apiResponse, asyncHandler, sanitize
│   │   ├── app.js                       Express app assembly
│   │   └── server.js                    Entry point (boots DB + HTTP listener)
│   ├── tests/                           auth, scoring, pdf-upload-reliability, e2e-full-flow
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── docker-compose.yml                   Runs mongo, redis, api, worker, client together
├── AI_Resume_Analyzer_Architecture.md   Full system design document
└── README.md                            This file
```

## 5. Requirements

- **Node.js 20 or newer** — check with `node --version`. Get it from https://nodejs.org if needed.
- **MongoDB** and **Redis** — via Docker (recommended, see below) or native Windows installs
- **Docker Desktop for Windows** (recommended, makes step 7 much simpler)
- **A Google Gemini API key** — free at https://ai.google.dev/ — the app runs without one, but every
  resume analysis will fail until it's set
- **VS Code** — no required extensions; ESLint and Tailwind CSS IntelliSense are nice to have

## 6. Cloud services this project actually uses

To be precise about what's real here (nothing invented or assumed):

- **Google Gemini API** — required for resume analysis to work. This is the only cloud AI service
  the project calls.
- **SMTP (e.g. Gmail)** — optional. Used for password-reset emails and the Contact form. If not
  configured, those features still work but just log the email content instead of sending it — the
  app never breaks because of missing SMTP config.
- **MongoDB and Redis** — these are *not* cloud services by default in this project; the setup below
  runs them as local Docker containers. You could point `MONGODB_URI`/`REDIS_URL` at a cloud-hosted
  instance (e.g. MongoDB Atlas) instead if you prefer, but nothing in the code requires that.
- **AWS S3** — referenced in config as a *future* storage option but **not implemented** — the code
  path deliberately throws an error if selected. The project currently only stores uploaded files on
  local disk. Don't configure AWS credentials; they won't be used.

## 7. Database setup

- **Type:** MongoDB, accessed via Mongoose (an ODM, not a query builder — no SQL, no separate
  migration files)
- **Collections/models:** `User`, `Resume`, `Analysis`, `RefreshToken` — full schema definitions are
  in `server/src/models/`
- **Migrations:** none — Mongoose creates collections and applies schema validation automatically
  the first time each model is used; there's no migration framework or migration commands to run
- **Seeding:** none exists yet. The database starts empty; you create your own data by registering
  through the app itself
- **First admin user:** there's no seed script for this. Promote a user by hand after registering
  normally:
  ```
  db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
  ```
  (run that inside `mongosh`, connected to your local Mongo)
- **Connection config:** `MONGODB_URI` in `server/.env` — defaults to
  `mongodb://localhost:27017/ai-resume-analyzer`, which matches the Docker command in step 7 below

## 8. Environment variables

Every variable the project actually reads. Nothing here is invented — this matches
`server/.env.example` and `client/.env.example` exactly.

### `server/.env`

| Variable | Required? | Purpose |
|---|---|---|
| `NODE_ENV` | No (default `development`) | `production` enables stricter secret checks |
| `PORT` | No (default `5000`) | API server port |
| `CLIENT_ORIGIN` | Yes | CORS + password-reset link base — must match your frontend's URL |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `REDIS_URL` | Yes | Redis connection string (queue + rate limiting) |
| `JWT_ACCESS_SECRET` | Yes | Signs short-lived access tokens — any long random string |
| `JWT_REFRESH_SECRET` | Yes | Signs refresh tokens — any long random string, different from above |
| `JWT_ACCESS_EXPIRES_IN` | No (default `15m`) | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No (default `30d`) | Refresh token lifetime |
| `GEMINI_API_KEY` | Yes, for analysis to work | Your Google Gemini API key |
| `GEMINI_MODEL` | No (default `gemini-1.5-pro`) | Which Gemini model to call |
| `STORAGE_PROVIDER` | No (default `local`) | Leave as `local` — `s3` is not implemented |
| `LOCAL_STORAGE_DIR` | No (default `./storage/resumes`) | Where uploaded files are saved on disk |
| `MAX_UPLOAD_SIZE_MB` | No (default `5`) | Upload size limit |
| `AWS_*` (4 vars) | No — unused | Placeholders for a future S3 integration; leave blank |
| `DAILY_ANALYSIS_LIMIT` | No (default `5`) | Per-user daily analysis quota |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | No | Leave `SMTP_PASSWORD` blank to skip real email sending |
| `EMAIL_FROM` | No | "From" address for sent emails |
| `CONTACT_RECIPIENT_EMAIL` | No | Where Contact-form messages are sent (defaults to `SMTP_USER`) |

### `client/.env`

| Variable | Required? | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Where the frontend sends API requests — default already matches the backend's default port |

**Where to create these files:** `server/.env` (next to `server/package.json`) and `client/.env`
(next to `client/package.json`). Never commit either — both are already covered by `.gitignore`.
Copy commands are in step 10 below.

## 9. Verification performed before this export

Checked immediately before packaging this copy — not assumed:
- Backend: every file passes `node --check` (no syntax errors), the full Express app module graph
  loads with zero broken imports
- Frontend: `npm run build` completes cleanly with no errors
- `npm audit`: **0 vulnerabilities**, frontend and backend
- Full backend test suite (30 tests across 4 files, including a 26-step real end-to-end run against
  real Redis and a real BullMQ worker): **all passing** — see `server/README.md` for exactly what
  each test covers and the extra flag the end-to-end suite needs
- Nothing was broken, so nothing was changed as part of this export

## 10. Running it locally — Windows + VS Code, exact commands

Open the project folder in VS Code (`File → Open Folder`), then use the integrated terminal
(`` Ctrl+` ``). VS Code's default terminal on Windows is PowerShell — the commands below assume that.

### Step 1 — Start MongoDB and Redis (one-time, then just `docker start` after)

```powershell
docker run -d -p 27017:27017 --name resume-mongo mongo:7
docker run -d -p 6379:6379 --name resume-redis redis:7-alpine
```

Check both are running:
```powershell
docker ps
```

(Next time you open VS Code, if `docker ps` shows them stopped: `docker start resume-mongo resume-redis`)

### Step 2 — Open 3 terminals in VS Code

Click the `+` icon in the terminal panel twice to get three tabs. You need all three running at once:
one for the API, one for the worker, one for the frontend.

### TERMINAL 1 — BACKEND API

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Now open `server\.env` in VS Code (click it in the Explorer) and set `GEMINI_API_KEY` to your real
key. Then:

```powershell
npm run dev
```

Expected output: `Server listening on port 5000 (development)`, `MongoDB connected`, `Redis connected`.
**Leave this running.**

### TERMINAL 2 — BACKEND WORKER

```powershell
cd server
npm run worker
```

Expected output: `Analysis worker started`. **Leave this running** — without it, uploads get stuck
at "Analyzing…" forever, since this is the process that actually calls Gemini.

### TERMINAL 3 — FRONTEND

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

Expected output includes `Local: http://localhost:5173/`. **Leave this running.**

### Step 3 — Open it

Go to **http://localhost:5173** in your browser.

### Alternative: one-command startup with Docker Compose

If you'd rather not manage 3 terminals, and have Docker Desktop:

```powershell
cd server
Copy-Item .env.example .env
# edit server\.env and set GEMINI_API_KEY
cd ..
docker compose up --build
```

This starts MongoDB, Redis, the API, the worker, and the frontend together. Same result at
http://localhost:5173.

## 11. Testing

```powershell
cd server
npm test
```
Runs the scoring and PDF-reliability tests (no extra setup needed) plus the auth test (needs network
access to download a test-MongoDB binary the first time).

```powershell
node --experimental-test-module-mocks --test tests/e2e-full-flow.test.js
```
The full 26-step end-to-end suite — register through delete-account, PDF upload, real BullMQ
processing, Compare, everything. **Requires Redis running** (Step 1 above). See `server/README.md`
for the full breakdown of what it covers.

## 12. Build

**Frontend:**
```powershell
cd client
npm run build
```
Outputs static files to `client/dist/` — this is what you'd deploy to any static host.

**Backend:** no build step — it's plain Node.js, run directly with `npm start` (or `npm run dev` for
local development with auto-restart on file changes).

## 13. Deployment

Not deeply built out yet (this project has been focused on local correctness), but the pieces are
here:
- `server/Dockerfile` and `client/Dockerfile` (multi-stage, nginx-served) exist and work — see
  `docker-compose.yml` for how they're wired together
- Deploy `client/dist/` (after `npm run build`) to any static host (Vercel, Netlify, S3+CloudFront)
- Deploy the backend + worker as two separate Node processes (or containers) — they must run
  separately, not combined, since that's the whole point of the async job-queue architecture
- You'll need a real MongoDB and Redis reachable from wherever you deploy (MongoDB Atlas + a managed
  Redis are the common choices) and to set every required env var from section 8 on the real host,
  with strong, unique values for `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (the `.env.example`
  placeholders are dev-only and the app will refuse to boot with them if `NODE_ENV=production`)

## 14. Troubleshooting

| Symptom | Fix |
|---|---|
| Backend won't start, complains about Mongo/Redis connection | Docker containers aren't running — `docker ps`, then `docker start resume-mongo resume-redis` |
| Upload works but analysis never completes | Terminal 2 (the worker) isn't running, or crashed — check that terminal for errors |
| "GEMINI_ANALYSIS_FAILED" on every analysis | `GEMINI_API_KEY` in `server\.env` is missing, wrong, or out of quota |
| CORS error in the browser console | `CLIENT_ORIGIN` in `server\.env` doesn't match the port Vite printed (usually `http://localhost:5173`) |
| `npm install` fails | Confirm Node 20+ (`node --version`); delete `node_modules` and retry |
| Port 5000 or 5173 already in use | Something else is using it — stop that process, or change `PORT` in `server\.env` (and update `VITE_API_BASE_URL` in `client\.env` to match) |
| Password reset / Contact form "succeeds" but no email arrives | Expected if `SMTP_PASSWORD` is blank — the app logs the content instead of sending. See `server/README.md`'s Email setup section for the Gmail App Password steps |
| `Copy-Item` command not recognized | You're in cmd.exe, not PowerShell — use `copy .env.example .env` instead, or open a PowerShell terminal in VS Code (dropdown next to the `+` in the terminal panel) |

## 15. What's known to still be incomplete (disclosed, not hidden)

- No S3/cloud storage (local disk only, by design for now)
- No admin-user seed script (promote by hand, see section 7)
- Settings page's "email notifications" toggle isn't persisted to the account yet
- Real MongoDB/Gemini/SMTP integration hasn't been exercised in Anthropic's own sandbox while
  building this (network-restricted there), only via the mocked/fake-repository end-to-end test
  suite — this is why running it for real on your machine, as this guide walks through, is the
  actual first live-integration test

Full technical detail on every fix made and every remaining gap is in `server/README.md`'s "Known
issues (fixed)" and "Known gaps / next steps" sections.
