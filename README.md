---
title: HireHub Full-Stack Platform
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: Full-Stack AI-Powered Recruitment Platform (Frontend + Backend + AI ATS)
---

# HireHub

## 1. Project Overview

HireHub is an English-first, full-stack recruitment platform for candidates, employers, and platform administrators. It brings job publishing and discovery, candidate profiles, resume management, applications, employer pipelines, interviews, notifications, and direct messaging into one application.

The project also includes an explainable Applicant Tracking System (ATS). When a candidate applies, HireHub extracts text from the candidate's stored PDF or DOCX resume, compares it with the job description in a private Python service, and stores a versioned score with skill, experience, title, and semantic breakdowns. Employers can use this result to sort and review their pipeline; candidates do not receive the employer-side ATS score.

HireHub is intended for:

- **Candidates** who want to maintain a reusable portfolio, discover jobs, apply with a stored resume, track applications, and communicate with employers.
- **Companies and recruiters** who need job management, applicant tracking, explainable matching, interview scheduling, and real-time communication.
- **Administrators** who manage users, review platform statistics, and verify company profiles.
- **Developers and evaluators** studying an integrated React, Express, MongoDB, Socket.IO, and local ML service architecture.

The repository contains synthetic ATS evaluation fixtures under `TSTET ATS/`. They are test data, not production applicant records.

## 2. Tech Stack & Technologies

| Layer | Technologies used |
|---|---|
| Languages | JavaScript/JSX, Python, CSS, HTML, PowerShell |
| Frontend | React 19, React DOM, Vite 8, React Router 7, Redux Toolkit, React Redux |
| UI and forms | Tailwind CSS 3, Bootstrap 5, React Bootstrap, Lucide React, React Toastify, React Hook Form, Yup, `clsx`, `tailwind-merge` |
| HTTP and real time | Axios, Socket.IO client, Socket.IO server |
| Backend API | Node.js 20+, Express 5, CORS, Helmet, `express-rate-limit` |
| Authentication and validation | JSON Web Tokens, bcryptjs, Joi |
| Database | MongoDB with Mongoose 9 |
| File handling | Multer, `file-type`, `pdf-parse`, Mammoth |
| AI service | Python 3.10+, FastAPI, Uvicorn, Pydantic, PyTorch, Hugging Face Transformers, Sentence Transformers, NumPy |
| ML models | `yashpwr/resume-ner-bert-v2`, `sentence-transformers/all-MiniLM-L6-v2` |
| Testing and quality | Node.js test runner, Pytest, FastAPI TestClient/httpx, ESLint, Vite production build |

Dependency versions are defined in the root, Backend, and Frontend `package.json`/lock files and in `ai-service/requirements.txt`. Python requirements use minimum-version constraints; the installed environment determines their exact resolved versions.

## 3. Project Architecture & Folder Structure

HireHub is a **monorepo with a modular monolith plus an AI microservice**:

- The React single-page application is the presentation layer.
- The Express application is the primary API and real-time backend. Internally it follows a route/controller/service/model organization similar to MVC, with React replacing server-rendered views.
- MongoDB is the system of record for users, profiles, jobs, applications, interviews, chat, notifications, and ATS results.
- FastAPI is a separately deployed, stateless inference service. Its loaded ML models are held in process memory; analysis results are persisted by Express in MongoDB.
- A database-backed worker in the Backend processes and retries ATS work. This allows an application to be accepted even when the AI service is temporarily unavailable.

```text
Browser
  |  REST (JSON/multipart) + authenticated Socket.IO
  v
Frontend: React/Vite (:5173)
  |
  v
Backend: Express/Socket.IO (:5000) --------> MongoDB (:27017 by local convention)
  |                                              |
  | private HTTP + X-AI-Service-Key              | persisted ATS queue/results
  v                                              |
AI service: FastAPI (:8008) <--------------------+
  |-- resume NER
  |-- sentence embeddings
  |-- versioned skill taxonomy
  `-- explainable scoring
```

Main repository structure:

```text
HireHub/
|-- Frontend/                         # React/Vite single-page application
|   |-- public/                       # Static icons and favicon
|   |-- src/
|   |   |-- api/                      # Compatibility export for the Axios client
|   |   |-- assets/                   # Frontend image assets
|   |   |-- components/               # Shared UI, layout, modal, and route guards
|   |   |-- context/                  # Shared authenticated Socket.IO connection
|   |   |-- layouts/                  # Public and dashboard route shells
|   |   |-- pages/                    # Public, shared, candidate, company, admin pages
|   |   |-- services/                 # REST resource clients
|   |   |-- store/                    # Redux store and authentication slice
|   |   `-- utils/                    # Class, date, avatar, and file-display helpers
|   |-- .env.example                  # Browser API base URL template
|   `-- package.json                  # Frontend dependencies and scripts
|-- Backend/                          # Primary API and real-time server
|   |-- controller/                   # Request handlers and Joi validation schemas
|   |-- middleware/                   # JWT/RBAC and secure file upload middleware
|   |-- models/                       # Mongoose schemas
|   |-- Routes/                       # Express route declarations
|   |-- services/                     # Parsing, AI client, ATS worker, portfolio parser
|   |-- scripts/                      # Database maintenance scripts
|   |-- tests/                        # Node test-runner suites
|   |-- uploads/                      # Local CV/avatar storage; only .gitkeep is tracked
|   |-- app.js                        # Express composition, MongoDB, HTTP server startup
|   |-- socket.js                     # Authenticated Socket.IO event handlers
|   |-- .env.example                  # Backend configuration template
|   `-- package.json                  # Backend dependencies and scripts
|-- ai-service/                       # Private FastAPI ATS engine
|   |-- data/taxonomy/                # Manifest and versioned English taxonomy sources
|   |-- scripts/                      # Optional official ESCO import utility
|   |-- services/                     # Skills, requirements, experience, similarity, scoring
|   |-- tests/                        # AI unit and endpoint tests
|   |-- app.py                        # FastAPI lifecycle and endpoints
|   |-- schemas.py                    # Pydantic API contracts
|   |-- state.py                      # In-memory ML model registry
|   `-- requirements.txt              # Python dependencies
|-- TSTET ATS/                        # Synthetic job/resume calibration suites
|-- docs/RUNBOOK.md                   # Operations, troubleshooting, deployment checklist
|-- SECURITY.md                       # Security and disclosure guidance
|-- start-ai.ps1                      # Windows AI environment/bootstrap helper
`-- package.json                      # Root orchestration scripts and engine requirements
```

### Runtime flow

1. The browser calls the Express API through the shared Axios client. The client adds `Authorization: Bearer <JWT>` from local storage.
2. Express validates input with Joi, enforces role-based access, and reads/writes Mongoose models.
3. Socket.IO authenticates its handshake with the same JWT. User rooms are derived from the verified token; conversation rooms require participant membership.
4. On application submission, Express persists an `Application` with `aiAnalysis.status = pending`, returns the HTTP response, and starts analysis asynchronously.
5. The worker extracts selectable text from the stored resume and calls FastAPI. Failed jobs retry up to three attempts; stale `processing` records are returned to the queue.
6. FastAPI combines deterministic taxonomy extraction, resume NER, experience/title evidence, and semantic similarity into ATS scoring contract `2.4`.
7. Express stores the result and emits `application_ai_completed` to the job poster's authenticated room.

## 4. Core Features

### Role-based accounts and workspaces

- Public registration supports `candidate` and `company` roles; it cannot create administrators.
- JWTs contain the user ID and role and expire after one day.
- Candidate, company, and admin routes are guarded both in React and in Express.
- Admins can create users, inspect users, view aggregate statistics, delete users, and toggle company verification.
- Authentication endpoints are rate-limited to 10 requests per 15-minute window outside the test environment.

### Candidate profile and resume lifecycle

- Candidates maintain a title, biography, skills, education, experience, social links, birth date, and active status.
- Resume upload accepts one multipart field named `cv`, limited to 5 MB and to genuine PDF or DOCX content. MIME type and file signature are both checked.
- Resume download and deletion are authenticated. A replaced/deleted file is removed only when no application still references it.
- Resume auto-fill extracts editable profile suggestions such as contact details, title, summary, skills, education, experience, and professional links. Auto-fill does not silently persist its suggestions.
- Avatar upload uses multipart field `avatar`, is limited to 2 MB, and accepts verified JPEG, PNG, WebP, or GIF content.

### Jobs and applications

- Anyone can browse active, unexpired jobs, view job details, and search by text, location, salary, or company.
- Companies and admins can publish jobs. The Backend derives the displayed company name from the poster's company profile (falling back to the user's name) rather than trusting free text.
- Job owners and admins can update jobs. Deletion is a soft delete implemented by setting `isActive` to `false`.
- A candidate applies with the resume already stored in their profile; clients cannot submit arbitrary filesystem paths or another user's resume URL.
- A unique database index prevents the same candidate from applying to the same job twice.
- Candidates can track and withdraw pending/reviewed applications. Employer-side AI analysis is removed from candidate-facing responses.
- Job owners/admins can view applicants, sort them by ATS score, change application status, securely download application resumes, and request re-analysis.

### Explainable ATS 2.4

- Text is extracted locally from PDF/DOCX files; scanned image-only PDFs require OCR before upload.
- A versioned English taxonomy normalizes aliases and records each skill's source, version, license metadata, and whether it is known.
- Resume NER can retain useful skills not yet present in the taxonomy as pending/dynamic concepts.
- Requirement extraction distinguishes required skills, preferred skills, and alternatives such as `AWS or GCP`.
- Weak evidence filtering reduces false credit from learning-only, passive, occasional, or explicitly negative statements.
- The output contains the final match score, matched/missing skills, required skill groups, required/candidate experience, warnings, and a component score breakdown.
- The worker detects scoring-version mismatches, recovers stale work, processes batches of up to five, and retries transient failures.
- Scores are employer-side ranking assistance, not an automated hiring decision.

ATS 2.4 component weights are defined in `ai-service/services/scoring.py`:

| Component | No preferred requirements | Preferred requirements present |
|---|---:|---:|
| Required skills | 55% | 45% |
| Preferred skills | 0% | 10% |
| Relevant experience | 20% | 20% |
| Job title evidence | 10% | 10% |
| Calibrated semantic similarity | 15% | 15% |

Coverage gates cap inflated results when mandatory skills or experience are missing, and the final ranking score is bounded to `0..98`.

### Messaging, notifications, and interviews

- One authenticated Socket.IO connection is shared across the signed-in React session.
- Two-user conversations have a deterministic participant key to prevent duplicates.
- Chat supports REST fallback plus real-time send, typing, read-state, and notification events. Client message IDs make sends idempotent per sender.
- Notifications cover new applications, application updates, interviews, messages, and system events; users can read, mark all read, or delete their own notifications.
- Companies/admins can schedule, reschedule, complete, and query interviews. Candidates and interviewers can view their schedules; authorized participants can cancel.
- Interview creation verifies the job owner, confirms that the candidate applied, validates time ordering, and blocks an interviewer's exact date/time conflict.

### Security and resilience

- Helmet security headers, explicit CORS origin configuration, generic production error responses, JWT authorization, and resource ownership checks protect the primary API.
- Socket rooms are never selected from an untrusted user ID; membership is derived from the JWT and checked against each conversation.
- Upload filenames are generated server-side, signatures are verified, and resolved resume paths are constrained to the CV upload directory.
- AI service authentication uses a separate shared key. The Backend applies a configurable request timeout and degrades to persisted retries instead of failing application submission.

## 5. Getting Started (Installation & Setup)

### Prerequisites

- Node.js **20 or newer**
- npm **10 or newer**
- Python **3.10 or newer**
- A running MongoDB deployment (local or hosted)
- Internet access on first AI startup to download the two Hugging Face models

### 1. Open the project

Clone the repository from its actual remote, or open the supplied source checkout, then enter its root directory:

```powershell
Set-Location "D:\path\to\HireHub"
```

### 2. Install JavaScript dependencies

Use the lock files for reproducible Backend and Frontend installations:

```bash
npm run install:all
```

### 3. Create the Python environment

Windows PowerShell:

```powershell
Set-Location ai-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
Set-Location ..
```

Linux/macOS:

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
cd ..
```

### 4. Configure environment variables

Copy the three templates:

```powershell
Copy-Item Frontend\.env.example Frontend\.env
Copy-Item Backend\.env.example Backend\.env
Copy-Item ai-service\.env.example ai-service\.env
```

Frontend configuration:

```dotenv
VITE_API_URL=http://127.0.0.1:5000/api
```

Backend configuration:

```dotenv
PORT=5000
DB_URL=mongodb://127.0.0.1:27017/hirehub
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8008
AI_SERVICE_KEY=replace-with-the-same-private-service-key
AI_REQUEST_TIMEOUT_MS=30000
AI_WORKER_POLL_MS=15000
AI_WORKER_STALE_MS=300000
```

AI service configuration:

```dotenv
AI_SERVICE_KEY=replace-with-the-same-private-service-key
# TAXONOMY_MANIFEST=D:\optional\path\to\manifest.json
```

| Variable | Required by | Purpose |
|---|---|---|
| `VITE_API_URL` | Frontend | Express API base URL, including `/api` |
| `PORT` | Backend | HTTP and Socket.IO port; the template uses `5000` |
| `DB_URL` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Signs and verifies one-day access tokens |
| `FRONTEND_URL` | Backend | Exact allowed browser origin for CORS and Socket.IO |
| `AI_SERVICE_URL` | Backend | FastAPI origin, without an endpoint suffix |
| `AI_SERVICE_KEY` | Backend + AI | Shared private service credential; values must match |
| `AI_REQUEST_TIMEOUT_MS` | Backend | Timeout for one AI HTTP call |
| `AI_WORKER_POLL_MS` | Backend | Delay between persisted ATS queue scans |
| `AI_WORKER_STALE_MS` | Backend | Age after which stuck `processing` work is requeued |
| `TAXONOMY_MANIFEST` | AI (optional) | Overrides the bundled taxonomy manifest path |
| `NODE_ENV` | Backend (optional) | Use `production` for generic server errors and production behavior |

Generate secrets independently; do not reuse the JWT secret as the AI key:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 5. Start the services

Start MongoDB, then run each application service in a separate terminal from the repository root:

```bash
# Terminal 1
npm run dev:ai

# Terminal 2
npm run dev:backend

# Terminal 3
npm run dev:frontend
```

Open `http://localhost:5173`.

On Windows, `./start-ai.ps1` is an alternative AI bootstrapper. It creates a reusable virtual environment and environment file below `%LOCALAPPDATA%\HireHub`, installs dependencies when `requirements.txt` changes, checks the selected port, and starts Uvicorn. Because it uses `%LOCALAPPDATA%\HireHub\ai-service.env`, ensure that file's `AI_SERVICE_KEY` matches `Backend/.env`.

```powershell
.\start-ai.ps1
# Optional examples:
.\start-ai.ps1 -NoReload
.\start-ai.ps1 -Port 8010 -Reinstall
```

### 6. Verify service health

```powershell
Invoke-RestMethod http://127.0.0.1:8008/health
Invoke-RestMethod http://127.0.0.1:8008/taxonomy/status
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

The Backend returns HTTP `200` only when MongoDB is connected; otherwise its health route returns `503`. The AI health response reports model and taxonomy readiness. Optional `esco_en` data may be unloaded without making the bundled taxonomy unavailable.

The first AI startup can be slow while model weights are downloaded and initialized. Wait for Uvicorn to report that application startup is complete.

## 6. Usage & API Endpoints

### API conventions

- Backend base URL: `http://127.0.0.1:5000/api`
- AI base URL: `http://127.0.0.1:8008` (intended for Backend-to-service traffic)
- Protected routes require `Authorization: Bearer <token>`.
- Most JSON responses use `{ "success": true, ... }`; validation/error responses generally use `{ "msg": ... }`.
- IDs are MongoDB ObjectId strings.
- Role abbreviations below: **C** = candidate, **Co** = company, **A** = admin, **Any** = any authenticated role.

### Authentication and users

| Method | Route | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/register` | Public | Register a candidate/company and return a JWT |
| `POST` | `/api/login` | Public | Authenticate and return a JWT |
| `GET` | `/api/users/profile` | Any | Get the current user |
| `PUT` | `/api/users/profile` | Any | Update name, phone, location, or profile image URL |
| `POST` | `/api/users/profile/avatar` | Any | Upload multipart `avatar` |
| `PUT` | `/api/users/change-password` | Any | Change the current user's password |
| `PUT` | `/api/users/change-password/:id` | Any | Change own password; admins may target another user subject to controller rules |
| `GET` | `/api/users` | A | List users |
| `POST` | `/api/users` | A | Create a user, including an admin |
| `GET` | `/api/users/stats` | A | Return platform/user aggregate counts |
| `GET` | `/api/users/:id` | A | Get one user and role profile |
| `DELETE` | `/api/users/:id` | A | Delete a user and associated role data |

Registration example:

```bash
curl -X POST http://127.0.0.1:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Candidate","email":"ada@example.com","password":"change-me","role":"candidate"}'
```

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "<userId>",
    "name": "Ada Candidate",
    "email": "ada@example.com",
    "role": "candidate",
    "phone": "",
    "location": "",
    "profileImage": ""
  },
  "token": "<jwt>"
}
```

### Candidate and company profiles

| Method | Route | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/candidates/me` | C | Get the current candidate profile |
| `PUT` | `/api/candidates/me` | C | Create or update candidate profile fields |
| `DELETE` | `/api/candidates/me` | C | Delete the candidate profile |
| `GET` | `/api/candidates/me/cv` | C | Download the current stored resume |
| `POST` | `/api/candidates/me/cv` | C | Upload multipart `cv` (PDF/DOCX, max 5 MB) |
| `DELETE` | `/api/candidates/me/cv` | C | Detach/delete the stored resume when safe |
| `POST` | `/api/candidates/me/autofill` | C | Parse the stored resume into editable suggestions |
| `PUT` | `/api/candidates/me/portfolio` | C | Update portfolio fields with profile validation |
| `GET` | `/api/companies/me` | Co | Get the current company profile |
| `PUT` | `/api/companies/me` | Co | Create or update the company profile |
| `DELETE` | `/api/companies/me` | Co | Delete the company profile |
| `PUT` | `/api/companies/:id/verify` | A | Set `{ "isVerified": true|false }` |

Upload a candidate resume:

```bash
curl -X POST http://127.0.0.1:5000/api/candidates/me/cv \
  -H "Authorization: Bearer <candidate-jwt>" \
  -F "cv=@/absolute/path/resume.pdf"
```

### Jobs and applications

| Method | Route | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/jobs` | Public | List all active, unexpired jobs |
| `GET` | `/api/jobs/search` | Public | Filter and paginate active jobs |
| `GET` | `/api/jobs/:id` | Public | Get an active job's details |
| `POST` | `/api/jobs` | Co, A | Create a job |
| `PUT` | `/api/jobs/:id` | Owner, A | Update a job |
| `DELETE` | `/api/jobs/:id` | Owner, A | Soft-delete/deactivate a job |
| `POST` | `/api/applications/apply/:jobId` | C | Apply using the profile's stored resume |
| `GET` | `/api/applications/my-applications` | C | List own applications without ATS analysis |
| `GET` | `/api/applications/job/:jobId/applicants` | Owner, A | List applicants; use `?sort=ai_score` for score order |
| `PUT` | `/api/applications/:id/status` | Owner, A | Set `pending`, `reviewed`, `accepted`, or `rejected` |
| `DELETE` | `/api/applications/:id` | C | Withdraw an eligible own application |
| `GET` | `/api/applications/:id/cv` | Authorized | Download an application resume |
| `POST` | `/api/applications/:id/reanalyze` | Owner, A | Queue ATS analysis and return HTTP `202` |
| `GET` | `/api/applications/:id` | Authorized | Get one application; candidate response omits ATS analysis |

Job search query parameters:

| Parameter | Values/default |
|---|---|
| `q` | Free text matched against title, description, and company |
| `location`, `company` | Case-insensitive partial match |
| `minSalary`, `maxSalary` | Non-negative numbers |
| `sort` | `latest` (default), `oldest`, `salary-high`, `salary-low`, `title` |
| `page` | Positive integer; default `1` |
| `limit` | `1` to `50`; default `10` |

Create a job:

```bash
curl -X POST http://127.0.0.1:5000/api/jobs \
  -H "Authorization: Bearer <company-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Backend Engineer",
    "description":"Build and maintain Node.js APIs with MongoDB.",
    "location":"Cairo",
    "salary":30000,
    "company":"Validated but replaced by the server-side profile name"
  }'
```

Apply after uploading a resume:

```bash
curl -X POST http://127.0.0.1:5000/api/applications/apply/<jobId> \
  -H "Authorization: Bearer <candidate-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Available to interview next week."}'
```

The application response is returned before ATS processing finishes. Poll the employer applicant endpoint or subscribe to `application_ai_completed` for completion.

### Interviews, notifications, and chat

| Method | Route | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/interviews` | Co, A | Schedule an interview |
| `GET` | `/api/interviews/my` | Any | Get interviews relevant to the current user |
| `GET` | `/api/interviews/job/:jobId` | Owner, A | Get interviews for a job |
| `PUT` | `/api/interviews/:id` | Owner/interviewer, A | Update/reschedule an interview |
| `PUT` | `/api/interviews/:id/cancel` | Authorized participant | Cancel an interview |
| `GET` | `/api/notifications` | Any | List own notifications |
| `GET` | `/api/notifications/unread-count` | Any | Count unread notifications |
| `PUT` | `/api/notifications/read-all` | Any | Mark all own notifications read |
| `PUT` | `/api/notifications/:id/read` | Any | Mark one own notification read |
| `DELETE` | `/api/notifications/:id` | Any | Delete one own notification |
| `GET` | `/api/chat/conversations` | Any | List conversations |
| `POST` | `/api/chat/conversations` | Any | Get/create a conversation using `recipientId` |
| `GET` | `/api/chat/conversations/:conversationId/messages` | Participant | Get messages and update read state |
| `POST` | `/api/chat/messages` | Participant | Send using `text` plus `conversationId` or `recipientId` |

Interview request example:

```json
{
  "jobId": "<jobId>",
  "candidateId": "<candidateUserId>",
  "applicationId": "<applicationId>",
  "date": "2026-08-10",
  "startTime": "14:00",
  "endTime": "14:45",
  "type": "video",
  "meetingLink": "https://meet.example.com/interview",
  "notes": "Technical interview"
}
```

Socket.IO uses the Backend origin (for example, `http://127.0.0.1:5000`) and a JWT handshake:

```js
const socket = io('http://127.0.0.1:5000', {
  auth: { token: '<jwt>' },
  transports: ['websocket', 'polling']
});
```

| Direction | Event | Purpose |
|---|---|---|
| Client to server | `conversation:join` | Join a verified participant-only conversation room |
| Client to server | `chat:message:send` | Send a message with acknowledgement |
| Client to server | `chat:typing` | Publish typing state within a joined conversation |
| Client to server | `chat:message:read` | Mark incoming messages read |
| Server to client | `newMessage` | Deliver a new chat message |
| Server to client | `newNotification` | Deliver a notification |
| Server to client | `chat:typing` | Deliver participant typing state |
| Server to client | `chat:message:read` | Deliver read-state change |
| Server to client | `application_ai_completed` | Notify a job poster of completed/failed ATS work |

### AI service

| Method | Route | Authentication | Purpose |
|---|---|---|---|
| `GET` | `/health` | None | Report model and taxonomy readiness |
| `GET` | `/taxonomy/status` | None | List taxonomy source/version/load metadata |
| `POST` | `/analyze-application` | `X-AI-Service-Key` when configured | Score resume text against a job |

Direct analysis example for development diagnostics:

```bash
curl -X POST http://127.0.0.1:8008/analyze-application \
  -H "Content-Type: application/json" \
  -H "X-AI-Service-Key: <shared-ai-key>" \
  -d '{
    "cv_text":"Experienced backend engineer with Node.js, Express, MongoDB and five years building REST APIs...",
    "job_title":"Backend Engineer",
    "job_description":"Requires Node.js, Express, MongoDB and 3+ years of backend experience."
  }'
```

The response contract includes:

```json
{
  "success": true,
  "match_score": 0,
  "extracted_skills": [],
  "matched_skills": [],
  "missing_required_skills": [],
  "required_skills": [],
  "preferred_skills": [],
  "required_skill_groups": [],
  "preferred_skill_groups": [],
  "skill_metadata": [],
  "pending_taxonomy": [],
  "required_years": 0,
  "candidate_years": 0,
  "score_breakdown": {
    "required_skills": 0,
    "preferred_skills": 0,
    "experience": 0,
    "title": 0,
    "semantic": 0,
    "semantic_raw": 0
  },
  "scoring_version": "2.4",
  "warnings": [],
  "execution_time_ms": 0
}
```

Numeric and array values above illustrate the response shape; actual values depend on the supplied texts and loaded models.

## 7. Database Schema / Data Models

MongoDB collections are managed through Mongoose. All schemas use timestamps unless noted by their individual fields.

| Model | Important fields | Relationships and constraints |
|---|---|---|
| `User` | `name`, unique `email`, bcrypt `password`, `role`, phone, location, profile image | Parent identity for candidate/company profiles, jobs, applications, interviews, chat, and notifications. Roles: `candidate`, `company`, `admin`. |
| `CandidateProfile` | title, bio, skills, experience, education, social links, `resumeUrl`, date of birth, active flag | One-to-one with `User` through unique `user`. |
| `CompanyProfile` | company name, industry, description, website, size, logo, founded year, verification | One-to-one with `User` through unique `user`; only admins set verification. |
| `Jobs` | title, description, location, salary, company display name, active flag, expiry | Many jobs belong to one posting `User` through `postedBy`; default expiry is 30 days. |
| `Application` | job, applicant, resume snapshot URL, workflow status, notes, applied date, `aiAnalysis` | References one `Jobs` and one candidate `User`. Unique compound index on `(job, applicant)`. |
| `Interview` | job, optional application, interviewer, candidate, date/times, type, link, notes, status | References `Jobs`, optional `Application`, and two `User` records. |
| `Conversation` | two participants, deterministic participant key, last-message summary | Participants reference `User`; unique participant key prevents duplicate two-user threads. |
| `Message` | conversation, sender, text, optional client message ID, read flag | References `Conversation` and `User`; unique `(sender, clientMessageId)` when supplied and indexed newest-first per conversation. |
| `Notification` | recipient, type, title/body, related ID/model, read flag | Belongs to `User`; may point logically to Job, Application, Interview, or Conversation. |

Relationship overview:

```text
User 1 -------- 0..1 CandidateProfile
User 1 -------- 0..1 CompanyProfile
User 1 -------- *    Jobs (postedBy)
User 1 -------- *    Application (applicant) * -------- 1 Jobs
Jobs 1 -------- *    Interview * -------- 1 User (candidate)
                              `--------- 1 User (interviewer)
Application 1 -- 0..* Interview
User * -------- *    Conversation (participants)
Conversation 1 - *    Message * -------- 1 User (sender)
User 1 -------- *    Notification
```

### Application and ATS state

Application workflow status is one of `pending`, `reviewed`, `accepted`, or `rejected`. The nested AI workflow has its own status: `pending`, `processing`, `completed`, or `failed`.

`aiAnalysis` persists:

- match score, matched skills, missing required skills, required skills/groups;
- skill provenance metadata and pending taxonomy concepts;
- required and candidate years of experience;
- required/preferred skill, experience, title, semantic, and raw semantic components;
- scoring version and warnings;
- attempts, last error, retry time, processing start, and completion time.

Local upload paths are stored as URLs in profile/application documents; the file bytes live under `Backend/uploads/`. This is suitable for a single local instance. A multi-instance production deployment should replace local storage with durable shared object storage.

## 8. Scripts & Commands

Run root commands from the repository root unless the table says otherwise.

| Command | Purpose |
|---|---|
| `npm run install:all` | Run lockfile-based `npm ci` in Backend and Frontend |
| `npm run dev:frontend` | Start the Vite development server |
| `npm run dev:backend` | Start Express with Nodemon |
| `npm run dev:ai` | Start FastAPI/Uvicorn on `127.0.0.1:8008` with reload |
| `npm run test:backend` | Run `Backend/tests/*.test.js` with the Node test runner |
| `npm run test:ai` | Run the Pytest suite quietly |
| `npm test` | Run Backend tests, then AI tests |
| `npm run lint` | Lint the Frontend source |
| `npm run build` | Build the Frontend production bundle |
| `npm run verify` | Run tests, lint, and production build in sequence |
| `npm --prefix Frontend run preview` | Preview the built Frontend locally |
| `.\start-ai.ps1` | Windows-only AI bootstrap/start helper |
| `.\start-ai.ps1 -NoReload -Reinstall` | Reinstall AI dependencies and start without Uvicorn reload |
| `python "TSTET ATS\run_ats_validation.py"` | Re-run synthetic ATS calibration against a live AI service; rewrites fixture result files |
| `python ai-service/scripts/import_esco_taxonomy.py <path>` | Import an authorized official English ESCO CSV package, then restart AI |
| `node Backend/scripts/requeueVersionMismatch.js` | Requeue stored analyses not using scoring contract `2.4`; requires Backend environment configuration |

The Backend package also declares `npm --prefix Backend run verify`, but its referenced file `scripts/verify/run-all.mjs` is not present in the current repository. Use the working root command `npm run verify` instead.

For operations, troubleshooting, production preparation, and clean-release guidance, see `docs/RUNBOOK.md` and `SECURITY.md`.
