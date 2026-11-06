# Employdnt — Personal Job Search Assistant

A lightweight personal job-search assistant designed to keep applications organized, track daily goals progressively, and manage follow-ups without administrative overhead or guilt-inducing metrics.

> **Core Philosophy:** *The user manages applications. The software manages the organization.*

---

## Features & Modules

- **Today Dashboard (Module 1):** Progressive milestone goal bars (`10 -> 15 -> 20 -> 30 -> 40 -> 50`), lifetime counters, "Needs Attention" follow-up alerts, recent applications feed, and quick-add modal.
- **Application Management (Module 2):** Full application CRUD, search, category & status filtering, multi-version resume tracking, notes, and chronological audit timelines.
- **Follow-Up Assistant (Module 3):** Automated scheduling (+N days), 14-day upcoming queue, 3-tone customizable email draft generator, 1-click clipboard copy, and native `mailto:` launcher (zero automated sending).
- **Google Recruitment Scanner (Module 4):** Read-only Gmail scanner identifying interview invites, offers, and rejections with smart confidence scoring and user-confirmed status transitions.
- **Multi-Tenant User Isolation (Module 5 & 11):** Strict user-scoped isolation for all applications, categories, resumes, bookmarks, and daily progress.
- **Profile & Resume Version Manager (Module 6):** Candidate profile editor and multi-resume manager (e.g. Frontend, Fullstack, DevOps) with target roles and default resume selection.
- **Resource Library & Bookmarks (Module 7):** Curated directory of job boards, interview prep handbooks, learning platforms, and custom bookmarks with tagging and pinning.
- **Preferences & Cadence Controls (Module 8):** Customizable follow-up cadence (3, 5, 7, 10, or 14 days), daily target baseline, and alert preferences.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Authentication:** Auth.js (NextAuth v5) + Google OAuth
- **Database & ODM:** MongoDB with Mongoose
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Language:** TypeScript 5

---

## Project Structure & Architecture Rules

This project adheres to a clean separation of concerns with a strict **"one file, one logic"** rule:

```
src/
├── app/                  # Next.js App Router (pages, layouts, route handlers)
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── (dashboard)/      # Main dashboard routes (today, applications, follow-up, resources, profile, settings)
│   └── api/              # Scoped API endpoints & Route handlers
├── components/           # React presentation & UI components
│   ├── layout/           # App shell, Navbar, Footer
│   ├── pages/            # Page-specific composite view components
│   ├── shared/           # Reusable shared components (modals, cards, badges)
│   └── ui/               # Base primitive UI elements (buttons, inputs)
├── config/               # Application & environment configuration
├── hooks/                # Custom React hooks (isolated stateful logic)
├── lib/                  # Utilities, database connection, constants
│   ├── constants.ts      # Global constants, statuses, milestones
│   ├── mongodb.ts        # Cached MongoDB connection client
│   └── utils.ts          # General helper functions
├── models/               # Mongoose database models and schemas (one model per file)
├── services/             # Business logic & database operations (isolated from API handlers)
└── types/                # TypeScript interfaces and type definitions
```

### Development Guidelines
- **One File, One Logic:** Keep components, services, and models focused strictly on a single responsibility.
- **Service Layer:** API routes (`/api/...`) and server actions should delegate business logic to dedicated functions in `src/services/`.
- **Client Date Isolation:** Zero server-time bias — all daily progress and follow-up schedules resolve using client local date `YYYY-MM-DD`.
- **User Scoping:** All database queries are strictly scoped to the authenticated `session.user.email`.

---

## Getting Started

### 1. Environment Setup
Create a `.env.local` or `.env` file in the project root:

```env
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>"
AUTH_SECRET="your-generated-auth-secret"

# Google OAuth & Gmail Integration
AUTH_GOOGLE_ID="your-google-oauth-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Quality

```bash
# Type check
node ./node_modules/typescript/bin/tsc --noEmit

# Lint check
npm run lint
```
