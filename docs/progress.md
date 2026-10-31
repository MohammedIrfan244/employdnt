# Employdnt — Development Progress Tracker

This document tracks implementation status across all phases defined in [docs/plan.md](file:///d:/myprojects/employdnt/docs/plan.md). It serves as the single source of truth for where we are and what comes next.

---

## Current Status Overview

- **Active Phase:** Phase 1 — Core Application (Complete) ➔ Ready for Phase 2: Follow-Up Assistant
- **Active Step:** Phase 1 Complete (Verification on `core` feature branch)
- **Current Milestone:** Full CRUD, Category Progressive Goal System, Today Dashboard, Application Details & Timeline operational.

| Phase | Description | Reference (`plan.md`) | Status |
|---|---|---|---|
| **Phase 1** | Core Application (CRUD, Categories, Progressive Goals, Dashboard) | Modules 1, 2, 5, 9, 11 | **COMPLETED** ✅ |
| **Phase 2** | Follow-Up Assistant (Auto-scheduling, Needs Attention, Drafts) | Modules 1.4, 3, 8 | **NEXT UP** 🟡 |
| **Phase 3** | Gmail Integration (OAuth, detection, matching, alerts) | Modules 4, 8 | PENDING ⚪ |
| **Phase 4** | Supporting Modules (Profile, Resumes, Resources, Settings) | Modules 6, 7, 10 | PENDING ⚪ |
| **Phase 5** | Polish & Optimization (Responsive, accessibility, error handling) | Modules 9.4, 12 | PENDING ⚪ |

---

## Phase 1: Core Application ✅ (COMPLETED)

### 1.1 Foundation & Infrastructure
- [x] **NextAuth v5 + Google OAuth & Proxy Protection:** Configured Auth.js with Google provider ([src/auth.ts](file:///d:/myprojects/employdnt/src/auth.ts), [src/app/api/auth/[...nextauth]/route.ts](file:///d:/myprojects/employdnt/src/app/api/auth/[...nextauth]/route.ts)), Next.js 16 `src/proxy.ts` route protection, and Google login view.
- [x] **Reusable UI Component System:** Standardized atomic primitives in `src/components/ui/` (`Button`, `Input`, `Select`, `StatusSelect`, `Textarea`, `Badge`, `Card`) used across all forms, dialogs, and cards.
- [x] **Human, Anti-Corporate Dark Design System:** Deep obsidian palette (`#0b0d10`, `#13161c`, `#1f232e`), emerald green indicator accents (`#10b981`), eliminated sterile SaaS gutters with a fluid layout up to `1680px`, and left sidebar app shell.
- [x] **Vector SVG Branding & Icons:** Employdnt SVG ([public/svg/employdnt.svg](file:///d:/myprojects/employdnt/public/svg/employdnt.svg)) with responsive `viewBox` enabled, configured for app icon (`src/app/icon.svg`), metadata icons ([src/app/layout.tsx](file:///d:/myprojects/employdnt/src/app/layout.tsx)), sidebar branding, and authentication view.
- [x] **Client Time Infrastructure:** Created client-date utils ([src/lib/date-utils.ts](file:///d:/myprojects/employdnt/src/lib/date-utils.ts)) and hydration-safe hook ([src/hooks/use-client-date.ts](file:///d:/myprojects/employdnt/src/hooks/use-client-date.ts)) to guarantee zero server-time bias.
- [x] **Constants & Domain Configuration:** Application statuses, progressive milestones (`10 -> 15 -> 20 -> 30 -> 40 -> 50`), and default categories ([src/lib/constants.ts](file:///d:/myprojects/employdnt/src/lib/constants.ts)). *(Ref: Module 1.2, 2.5, 5.1)*
- [x] **TypeScript Interfaces:** Defined `ICategory`, `IApplication`, `IDailyProgress`, and `IApplicationEvent` in `src/types/`. *(Ref: Module 11)*
- [x] **Mongoose Models:** Created schemas for `Category`, `Application`, `DailyProgress` (compound unique on category+date), and `ApplicationEvent` in `src/models/`. *(Ref: Module 11)*
- [x] **Next.js 16 Partial Prefetching Compliance:** Fixed Suspense boundaries on dynamic routes (`/applications/[id]`) and App Router layout types.
- [x] **CI/CD & Git Strategy:** GitHub Actions CI workflow for all branch pushes and local pre-push protection hook.

---

### 1.2 Layout & Navigation *(Ref: Module 9.2)*
- [x] **App Shell:** Clean white + green design tokens, persistent navbar with routes: **Today**, **Applications**, **Follow-Up**, **Settings** ([src/components/layout/navbar.tsx](file:///d:/myprojects/employdnt/src/components/layout/navbar.tsx)).
- [x] **Active Link Highlighting:** Visual indicators for current section using `usePathname()`.
- [x] **Mobile Responsive Navigation:** Clean mobile navigation bar.

---

### 1.3 Business Services Layer *(Ref: Module 2.2, 5.2, 11)*
- [x] **Category Service ([src/services/category.service.ts](file:///d:/myprojects/employdnt/src/services/category.service.ts)):**
  - Seed default categories (*Development*, *Other Remote Jobs*) automatically on first run.
  - Query active categories with lifetime counts.
- [x] **Progress Service ([src/services/progress.service.ts](file:///d:/myprojects/employdnt/src/services/progress.service.ts)):**
  - Compute daily progress and next milestone targets (`10 -> 15 -> 20 -> 30 -> 40 -> 50`) based on client date `YYYY-MM-DD`. *(Ref: Module 1.2)*
- [x] **Application Service ([src/services/application.service.ts](file:///d:/myprojects/employdnt/src/services/application.service.ts)):**
  - Implemented Module 2.2 Automatic Initialization on application creation:
    1. Set status to `Applied`.
    2. Auto-schedule follow-up date (+7 days in client time).
    3. Increment category lifetime count.
    4. Upsert today's `DailyProgress`.
    5. Log creation to `ApplicationEvent` timeline.
  - Application CRUD (fetch list with filters, fetch by ID, edit, delete, status change).
- [x] **Timeline Service ([src/services/timeline.service.ts](file:///d:/myprojects/employdnt/src/services/timeline.service.ts)):**
  - Audit trail logging and retrieval for application events. *(Ref: Module 2.6)*

---

### 1.4 API Endpoints / Server Actions *(Ref: Module 2.4, 5.3)*
- [x] `GET /api/categories` & `POST /api/categories` ([src/app/api/categories/route.ts](file:///d:/myprojects/employdnt/src/app/api/categories/route.ts))
- [x] `GET /api/applications` & `POST /api/applications` ([src/app/api/applications/route.ts](file:///d:/myprojects/employdnt/src/app/api/applications/route.ts))
- [x] `GET /api/applications/[id]`, `PATCH`, `DELETE` ([src/app/api/applications/[id]/route.ts](file:///d:/myprojects/employdnt/src/app/api/applications/[id]/route.ts))
- [x] `GET /api/progress/today?clientDate=YYYY-MM-DD` ([src/app/api/progress/today/route.ts](file:///d:/myprojects/employdnt/src/app/api/progress/today/route.ts))
- [x] `GET /api/follow-up` ([src/app/api/follow-up/route.ts](file:///d:/myprojects/employdnt/src/app/api/follow-up/route.ts))

---

### 1.5 Today Dashboard View *(Ref: Module 1)*
- [x] **Progressive Goal Bars:** Visual progress bars per active category with `X / Target` display and auto-expanding targets. *(Ref: Module 1.1, 1.2)*
- [x] **Lifetime Counters:** Display total applications per category without pressure-based stats. *(Ref: Module 1.3)*
- [x] **Quick Add Modal:** 3 required fields (*Company*, *Role*, *Category*) + collapsible details ([src/components/shared/quick-add-modal.tsx](file:///d:/myprojects/employdnt/src/components/shared/quick-add-modal.tsx)). *(Ref: Module 1.6, 2.1)*
- [x] **Needs Attention Preview:** Container for follow-ups due linking to applications. *(Ref: Module 1.4)*
- [x] **Recent Applications List:** Mini feed of recent applications with quick links. *(Ref: Module 1.5)*

---

### 1.6 Applications Management View *(Ref: Module 2)*
- [x] Applications list table/cards with category filters, status filters, and search query ([src/components/pages/applications/applications.tsx](file:///d:/myprojects/employdnt/src/components/pages/applications/applications.tsx)).
- [x] Inline status change dropdown with immediate timeline event logging.
- [x] Application detail view ([src/components/pages/applications/application-detail.tsx](file:///d:/myprojects/employdnt/src/components/pages/applications/application-detail.tsx)) displaying full metadata, editable notes, delete action, and chronological audit trail.

---

## Phase 2: Follow-Up Assistant ⚪ (NEXT UP)
*(Ref: docs/plan.md Module 3, 1.4, 8)*
- [ ] **Follow-Up Automation:** Query applications where `followUpDate <= clientToday` and follow-up is neither completed nor dismissed.
- [ ] **Needs Attention Full Section:** Populate dashboard with due follow-ups.
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
