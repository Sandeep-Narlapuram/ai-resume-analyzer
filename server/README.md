# ScoreMyResume — Backend

Node.js/Express API + async worker powering the AI Resume Analyzer, per the architecture doc.

## Stack

- **Express** — REST API (`/api/v1`)
- **MongoDB + Mongoose** — system of record
- **Redis + BullMQ** — job queue for Gemini analysis (decoupled from the request/response cycle)
  and the store backing rate limiting / quotas
- **JWT + bcrypt** — short-lived access tokens, rotated httpOnly-cookie refresh tokens
- **Multer + pdf-parse + mammoth** — resume upload, magic-byte validation, text extraction
- **Zod** — request validation and strict validation of Gemini's JSON output
- **@google/generative-ai** — Gemini analysis calls
- **pino** — structured logging

## Getting started

```bash
npm install
cp .env.example .env   # fill in MongoDB/Redis URIs and your Gemini API key
npm run dev             # starts the API server with --watch
npm run worker           # in a second terminal — starts the analysis worker
```

Or with Docker (from the repo root, alongside `client/`):

```bash
docker compose up --build
```

This starts `mongo`, `redis`, `api`, `worker`, and `client` together.

## Running tests

```bash
npm test
```

- `tests/auth.test.js` — register/login/auth-guard flow via `mongodb-memory-server` (needs network
  access to fetch a real `mongod` binary — works in normal dev/CI environments).
- `tests/scoring.test.js` — unit tests for the deterministic scoring formula. No infrastructure
  required.
- `tests/pdf-upload-reliability.test.js` — regression test for the pdf-parse reliability fix (see
  below). No infrastructure required beyond Node itself.
- `tests/e2e-full-flow.test.js` — a 23-test end-to-end run through the real Express app: register →
  login → auth-guard → real PDF upload → real text extraction → authenticated file download →
  cross-user access denial → analysis creation → **real BullMQ worker** processing the job over
  **real Redis** → composite score verification → quota enforcement → refresh-token rotation →
  logout → resume deletion → change password (including old-password invalidation and
  wrong-current-password rejection) → delete account (including cascading resume/analysis deletion
  and confirming the old access token stops working) → analysis comparison (real score delta and
  newly-matched-keyword computation, plus cross-user denial against a still-existing resource) →
  rate-limit headers. Everything runs for real except the MongoDB-backed repository layer (an
  in-memory fake stands in — see the file's header comment for why) and the Gemini API call (a
  canned, schema-valid response stands in, since it costs real money and needs a real key).
  **Requires a real Redis instance reachable at `REDIS_URL`** (defaults to `redis://127.0.0.1:6379`)
  and must be run with `node --experimental-test-module-mocks --test tests/e2e-full-flow.test.js`,
  since it relies on Node's module-mocking API to swap in the repository fakes without changing any
  production code. Run `redis-cli FLUSHALL` between runs if testing repeatedly in a short window —
  the real rate limiters persist their counters in Redis across runs, same as they would in
  production, so back-to-back runs without flushing will legitimately 429 on requests that would
  otherwise succeed.

## Project structure

```
src/
├── config/         # env, logger, db, redis, gemini client setup
├── models/         # User, Resume, Analysis, RefreshToken (Mongoose schemas)
├── routes/         # Express routers — one per resource, mounted in routes/index.js
├── controllers/     # Request/response handling only — no business logic
├── services/        # Business logic: auth, extraction, gemini, scoring, storage
├── repositories/     # All Mongoose queries — controllers/services never import models directly
├── middlewares/      # auth, upload, error handling, rate limiting/quota
├── validators/        # Zod schemas per resource
├── queues/             # BullMQ queue definition + the analysis worker process (processAnalysisJob
│                          is exported for direct testing; the module only auto-starts and connects
│                          to a live DB/Redis when run directly, not when imported)
├── prompts/             # Gemini prompt template (prompt-injection-aware)
├── utils/                # AppError, response envelope, asyncHandler, sanitization
├── app.js                 # Express app assembly (middleware, routes, error handling)
└── server.js                # Boots DB connection + HTTP listener, graceful shutdown
```

## Security notes (see architecture doc §12 for full detail)

- Refresh tokens are opaque, stored only as a hash, delivered via `httpOnly`/`Secure`/`SameSite=Strict`
  cookies, and rotated on every use — reuse of a revoked token revokes every session for that user.
- Uploaded files are validated by MIME type, extension, **and** magic bytes (not just the
  client-supplied `Content-Type`) before any parsing happens.
- Resume text is wrapped in explicit delimiters before being sent to Gemini, with a system
  instruction telling the model to treat it strictly as data — see `utils/sanitize.js` and
  `prompts/geminiPrompt.templates.js`.
- Gemini's JSON response is never trusted as-is: it's parsed and validated against a strict Zod
  schema in `services/gemini.service.js` before anything derived from it is persisted or returned
  to a client.
- Every resource lookup is scoped by `userId` at the repository layer (e.g.
  `resumeRepository.findByIdAndUser`) — there is no route that trusts a client-supplied ID alone.
- Per-user daily analysis quota enforced via `middlewares/rateLimiter.middleware.js` to bound
  Gemini API cost and abuse.
- Resume files are **never** served from a static/public directory. There is no `storageUrl` field
  and no `express.static` mount for resume storage — the only way to read a stored file back is
  `GET /resumes/:id/file`, which requires a valid access token and verifies the requesting user
  owns that resume (`resumeController.download`). This was fixed after an initial version briefly
  served uploaded resumes — which contain PII — from an unauthenticated static route.

## Known issues (fixed)

- **PDF uploads intermittently failed with "Could not read text from this file" on perfectly valid
  PDFs.** Root cause: `pdf-parse` (and the aging pdf.js fork it bundles) occasionally throws parse
  errors (`bad XRef entry`, `Illegal character`) on byte-identical, valid PDF content. Confirmed the
  failure does NOT reproduce in an isolated tight loop with nothing else happening (0 failures in
  300 consecutive calls) — it correlates with contention from other concurrent activity in the
  process (other in-flight requests, the BullMQ worker, Redis I/O), which is exactly the condition a
  real production server runs under. `services/extraction.service.js` retries the PDF parse up to 5
  times with a short real delay between attempts. Validated across many consecutive full runs of the
  23-test end-to-end suite (which performs several real PDF uploads per run under real concurrent
  load) with zero failures.
- **`changePassword`, `resetPassword`, and the daily-analysis-quota check bypassed the repository
  layer**, calling `.save()` directly on a document instead of going through
  `userRepository.updateById(...)` like every other write in the codebase. Fixed in
  `controllers/auth.controller.js` and `middlewares/rateLimiter.middleware.js`, which now goes
  through a new `userRepository.incrementDailyAnalysisCount()` — an atomic `findOneAndUpdate` with
  the limit in the query condition, which also fixes a real concurrency bug: the previous
  read-then-write pattern could let two concurrent requests both read "under quota" and both be
  allowed through, exceeding the daily limit.
- **The daily analysis quota was consumed before the request was even validated.** Body validation
  now runs before quota enforcement in `routes/analysis.routes.js`, so a malformed request no longer
  burns a quota unit. (A validly-shaped `resumeId` that doesn't belong to the requesting user still
  reaches the quota check before the ownership check in the controller — a smaller residual gap, see
  below.)
- **The "Change password" and "Delete account" buttons on the Settings page did nothing real.**
  Built actual backend endpoints (`PATCH /auth/password`, `DELETE /auth/me` with a real cascading
  delete of the user's resumes, files, and analyses) and wired the frontend to them, with real error
  handling for wrong-password cases. Both are covered by end-to-end tests, including the cascade
  delete and confirming the old access token and password stop working afterward.
- **The daily analysis quota was consumed before the request was even validated or checked for
  resume ownership.** Now fully closed: `routes/analysis.routes.js` runs body validation, then a new
  `middlewares/resumeOwnership.middleware.js` (`requireOwnedResume`) that verifies the resume exists
  and belongs to the requester, and only then does quota enforcement run — so a malformed request or
  a request for someone else's resume can no longer burn a quota unit for something that was always
  going to fail.
- **A transient Gemini failure on attempt 1 of 3 flipped the analysis to `failed` immediately**, even
  though BullMQ might still retry it successfully — the frontend would stop polling at that point and
  show a false failure while the job quietly completed moments later in the background. Fixed in
  `queues/analysis.worker.js`: the DB status is now only set to `failed` once BullMQ's final retry
  attempt is exhausted (checked via `job.attemptsMade`/`job.opts.attempts`), not on the first
  transient error.
- **Password reset and the Contact form didn't actually send email** — see the dedicated section
  below for how this is wired up now.
- **Dependency vulnerabilities**: `npm audit` found issues in `bcrypt`'s install-time dependency
  chain (`tar`, critical), `nodemailer` (high), `jspdf`'s `dompurify` dependency (critical, frontend),
  and a `qs` DoS issue via `express` (moderate — this one surfaced on a later `npm install`, since
  npm's resolved versions can shift over time even with the same `package.json`). All resolved: `qs`
  was pinned via an `overrides` entry rather than forcing a risky Express major-version bump;
  `bcrypt`/`nodemailer`/`jspdf`/`react-router-dom` were upgraded across major versions after checking
  our actual usage doesn't touch any changed APIs, then re-verified by re-running the full test suite
  (which directly exercises `bcrypt.hash`/`compare` in every register/login test). Current state:
  `npm audit` reports 0 vulnerabilities on both frontend and backend.

## Known gaps / next steps

- `services/storage.service.js` only implements local-disk storage; the S3 branch throws
  intentionally until AWS credentials/bucket policy are finalized (see architecture doc's future
  enhancements). When implemented, keep the bucket private and continue routing all reads through
  `storageService.read()` behind the authenticated download endpoint — don't reintroduce a public URL.
- Admin routes exist but there's no seed script yet for creating the first `admin` user — until
  then, promote a user by hand in MongoDB (`db.users.updateOne({email:...}, {$set:{role:"admin"}})`).
- The Settings page's "email me when an analysis completes" toggle is a working UI control but isn't
  persisted to the account yet — flagged directly in the UI itself. (Actual email sending is now
  wired up for password reset and Contact — this toggle just isn't connected to either.)
- Real MongoDB and Gemini integration testing still hasn't run in this project's own sandbox (see
  `tests/auth.test.js`'s use of `mongodb-memory-server`, and the canned Gemini response in
  `tests/e2e-full-flow.test.js`) — both are written to work in a normal dev/CI environment with
  network access, just not verified there yet by an actual run. The same applies to real SMTP
  sending (see below) — the email service is fully wired and gracefully degrades to logging when
  unconfigured, but actually sending a real email has not been verified in this sandbox, since it
  can't reach an SMTP server here either.

## Email setup (password reset + Contact form)

Both now send real email via `services/email.service.js` (nodemailer) when SMTP is configured in
`.env`, and gracefully degrade to logging instead of sending when it isn't — so the app is fully
usable in local dev with zero email setup. To send real email through Gmail:

1. Turn on 2-Step Verification on the Google account you want to send from
2. Google Account → Security → 2-Step Verification → App Passwords → generate one
3. Put that 16-character app password (**not** your normal Gmail password) in `SMTP_PASSWORD` in
   your own local `.env` — never commit it or share it anywhere
4. `SMTP_HOST`, `SMTP_USER`, `EMAIL_FROM`, and `CONTACT_RECIPIENT_EMAIL` are pre-filled in
   `.env.example` for Gmail

The password-reset email links to `${CLIENT_ORIGIN}/reset-password?token=...` — the frontend page
for that route (`client/src/pages/ResetPasswordPage.jsx`) didn't exist before this fix; it's now
built and wired, since a reset email pointing at a page that doesn't exist would have been worse
than not sending one.
