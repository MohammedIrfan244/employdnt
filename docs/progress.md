# Employdnt — Development Progress Tracker

This document tracks implementation status across all phases defined in [docs/plan.md](file:///d:/myprojects/employdnt/docs/plan.md). It serves as the single source of truth for where we are and what comes next.

---

## Current Status Overview

- **Active Phase:** Phase 1 — Core Application
- **Active Step:** Phase 1.3 (Business Services Layer)
- **Current Milestone:** Connecting Category & Application Services to Database and UI Views

| Phase | Description | Reference (`plan.md`) | Status |
|---|---|---|---|
| **Phase 1** | Core Application (CRUD, Categories, Progressive Goals, Dashboard) | Modules 1, 2, 5, 9, 11 | **IN PROGRESS** 🟡 |
| **Phase 2** | Follow-Up Assistant (Auto-scheduling, Needs Attention, Drafts) | Modules 1.4, 3, 8 | PENDING ⚪ |
| **Phase 3** | Gmail Integration (OAuth, detection, matching, alerts) | Modules 4, 8 | PENDING ⚪ |
| **Phase 4** | Supporting Modules (Profile, Resumes, Resources, Settings) | Modules 6, 7, 10 | PENDING ⚪ |
| **Phase 5** | Polish & Optimization (Responsive, accessibility, error handling) | Modules 9.4, 12 | PENDING ⚪ |

---

## Phase 1: Core Application 🟡 (IN PROGRESS)

### 1.1 Foundation & Infrastructure
- [x] **Client Time Infrastructure:** Created client-date utils ([src/lib/date-utils.ts](file:///d:/myprojects/employdnt/src/lib/date-utils.ts)) and hydration-safe hook ([src/hooks/use-client-date.ts](file:///d:/myprojects/employdnt/src/hooks/use-client-date.ts)) to guarantee zero server-time bias.
- [x] **Constants & Domain Configuration:** Application statuses, progressive milestones (`10 -> 15 -> 20 -> 30 -> 40 -> 50`), and default categories ([src/lib/constants.ts](file:///d:/myprojects/employdnt/src/lib/constants.ts)). *(Ref: Module 1.2, 2.5, 5.1)*
- [x] **TypeScript Interfaces:** Defined `ICategory`, `IApplication`, `IDailyProgress`, and `IApplicationEvent` in `src/types/`. *(Ref: Module 11)*
- [x] **Mongoose Models:** Created schemas for `Category`, `Application`, `DailyProgress` (compound unique on category+date), and `ApplicationEvent` in `src/models/`. *(Ref: Module 11)*
- [x] **Next.js 16 Partial Prefetching Compliance:** Fixed Suspense boundaries on dynamic routes (`/applications/[id]`) and App Router layout types.
- [x] **CI/CD & Git Strategy:** GitHub Actions CI workflow for all branch pushes and local pre-push protection hook.

---

### 1.2 Layout & Navigation *(Ref: Module 9.2)*
- [x] **App Shell:** Clean white + green design tokens, persistent navbar with routes: **Today**, **Applications**, **Follow-Up**, **Settings** ([src/components/layout/](file:///d:/myprojects/employdnt/src/components/layout/)).
- [ ] **Active Link Highlighting:** Visual indicators for current section.
- [ ] **Mobile Responsive Navigation:** Clean mobile drawer / header.

---

### 1.3 Business Services Layer *(Ref: Module 2.2, 5.2, 11)* 👈 **CURRENT STEP**
- [ ] **Category Service (`src/services/category.service.ts`):**
  - Seed default categories (*Development*, *Other Remote Jobs*, *Freelance*) on first run.
  - Query active categories with lifetime counts.
- [ ] **Progress Service (`src/services/progress.service.ts`):**
  - Compute daily progress and next milestone targets (`10 -> 15 -> 20...`) based on client date `YYYY-MM-DD`. *(Ref: Module 1.2)*
- [ ] **Application Service (`src/services/application.service.ts`):**
  - Implement Module 2.2 Automatic Initialization on application creation:
    1. Set status to `Applied`.
    2. Auto-schedule follow-up date (+7 days in client time).
    3. Increment category lifetime count.
    4. Upsert today's `DailyProgress`.
    5. Log creation to `ApplicationEvent` timeline.
  - Application CRUD (fetch by ID, edit, delete, status change).

---

### 1.4 API Endpoints / Server Actions *(Ref: Module 2.4, 5.3)*
- [ ] `GET /api/categories` & `POST /api/categories`
- [ ] `GET /api/applications` & `POST /api/applications`
- [ ] `GET /api/applications/[id]`, `PATCH`, `DELETE`
- [ ] `GET /api/progress/today?clientDate=YYYY-MM-DD`

---

### 1.5 Today Dashboard View *(Ref: Module 1)*
- [ ] **Progressive Goal Bars:** Visual progress bars per active category with `X / Target` display and auto-expanding targets. *(Ref: Module 1.1, 1.2)*
- [ ] **Lifetime Counters:** Display total applications per category without pressure-based stats. *(Ref: Module 1.3)*
- [ ] **Quick Add Modal:** 3 required fields (*Company*, *Role*, *Category*) + collapsible details. *(Ref: Module 1.6, 2.1)*
- [ ] **Needs Attention Preview:** Placeholder container for follow-ups due. *(Ref: Module 1.4)*
- [ ] **Recent Applications List:** Mini feed of recent applications with quick links. *(Ref: Module 1.5)*

---

### 1.6 Applications Management View *(Ref: Module 2)*
- [ ] Applications list table/cards with category filters and status pills.
- [ ] Application detail view ([id]) displaying timeline, notes, and contacts.
- [ ] Status dropdown (Applied, Follow-up Needed, In Progress, Interview, Offer, Rejected, Withdrawn).

---

## Phase 2: Follow-Up Assistant ⚪ (PENDING)
*(Ref: docs/plan.md Module 3, 1.4, 8)*
- [ ] **Follow-Up Automation:** Query applications where `followUpDate <= clientToday` and follow-up is neither completed nor dismissed.
- [ ] **Needs Attention Section:** Populate dashboard with due follow-ups.
- [ ] **Follow-up Actions:** Mark as done, postpone (e.g. +3 days), or dismiss.
- [ ] **Draft Generator:** Client-side template generator to draft concise follow-up emails without automated sending.

---

## Phase 3: Gmail Integration ⚪ (PENDING)
*(Ref: docs/plan.md Module 4)*
- [ ] Google OAuth connection for reading relevant job emails.
- [ ] Recruitment email heuristic scanner (acknowledgments, interview requests, rejections).
- [ ] Application matching engine with confidence rating & user confirmation workflow.
- [ ] Suggested status transitions (user confirms).

---

## Phase 4: Supporting Modules ⚪ (PENDING)
*(Ref: docs/plan.md Modules 6, 7, 10)*
- [ ] Profile information & job search preferences.
- [ ] Multiple resume upload & association.
- [ ] Resources & job board link organizer.
- [ ] User settings (customize milestone sequence, follow-up waiting period).

---

## Phase 5: Polish & Final Touches ⚪ (PENDING)
*(Ref: docs/plan.md Modules 9.4, 12)*
- [ ] Accessibility review (WCAG compliance, screen reader compatibility).
- [ ] Responsive pass for mobile viewports.
- [ ] Error boundary handling & graceful offline fallbacks.

