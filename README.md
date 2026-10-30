# Employdnt — Personal Job Search Assistant

A lightweight personal job-search assistant designed to keep applications organized, track daily goals progressively, and manage follow-ups without administrative overhead or guilt-inducing metrics.

> **Core Philosophy:** *The user manages applications. The software manages the organization.*

---

## Tech Stack

- **Framework:** Next.js (App Router, React 19)
- **Styling:** Tailwind CSS (v4)
- **Database & ODM:** MongoDB with Mongoose
- **Language:** TypeScript

---

## Project Structure & Architecture Rules

This project adheres to a clean separation of concerns with a strict **"one file, one logic"** rule:

```
src/
├── app/                  # Next.js App Router (pages, layouts, route handlers)
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── (dashboard)/      # Main dashboard routes (today, applications, follow-up, settings)
│   └── api/              # API endpoints / Route handlers
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
- **Styling:** Use preconfigured Tailwind utility classes directly. Follow the white-and-green design identity (green for progress/primary actions, subtle accents for info and status).

---

## Getting Started

### 1. Environment Setup
Create a `.env.local` or `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/employdnt
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
