# Employdnt — Development Progress Tracker

This document tracks implementation status across all phases defined in [docs/plan.md](file:///d:/myprojects/employdnt/docs/plan.md). It serves as the single source of truth for where we are and what comes next.

---

## Current Status Overview

- **Active Phase:** Phase 3 — Gmail Integration (Complete) ➔ Ready for Phase 4: Supporting Modules
- **Active Step:** Phase 3 Verification on `g-mail` feature branch
- **Current Milestone:** OAuth read-only scope, targeted recruitment email scanner, smart application matching engine, status transition proposals, and Settings Gmail connection management operational.

| Phase | Description | Reference (`plan.md`) | Status |
|---|---|---|---|
| **Phase 1** | Core Application (CRUD, Categories, Progressive Goals, Dashboard) | Modules 1, 2, 5, 9, 11 | **COMPLETED** ✅ |
| **Phase 2** | Follow-Up Assistant (Auto-scheduling, Needs Attention, Drafts) | Modules 1.4, 3, 8 | **COMPLETED** ✅ |
| **Phase 3** | Gmail Integration (OAuth, detection, matching, alerts) | Modules 4, 8 | **COMPLETED** ✅ |
| **Phase 4** | Supporting Modules (Profile, Resumes, Resources, Settings) | Modules 6, 7, 10 | **NEXT UP** 🟡 |
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

## Phase 2: Follow-Up Assistant ✅ (COMPLETED)
*(Ref: docs/plan.md Module 3, 1.4, 8)*
- [x] **Follow-Up Automation ([src/services/follow-up.service.ts](file:///d:/myprojects/employdnt/src/services/follow-up.service.ts)):**
  - Query applications where `followUpDate <= clientToday` (zero server-time bias) or status is `Follow-up Needed`.
  - Exclude completed (`followUpCompleted: true`), dismissed (`followUpDismissed: true`), and terminal statuses (`Offer`, `Rejected`, `Withdrawn`).
  - Calculate upcoming follow-up queue for the next 14 days and lifetime completed counts.
- [x] **Needs Attention Full Section ([src/components/pages/today/today.tsx](file:///d:/myprojects/employdnt/src/components/pages/today/today.tsx)):**
  - Scoped with client date parameter (`clientDate=YYYY-MM-DD`).
  - Inline action buttons (`Draft` and `Done`) directly on due items with instant modal launch and completion.
  - Linked to dedicated `/follow-up` management view.
- [x] **Follow-up Actions & Endpoints ([src/app/api/follow-up/[id]/action/route.ts](file:///d:/myprojects/employdnt/src/app/api/follow-up/[id]/action/route.ts)):**
  - Action dispatch for `complete`, `postpone` (+N days), and `dismiss`.
  - Full audit trail logging to `ApplicationEvent` timeline (`FOLLOW_UP_COMPLETED`, `FOLLOW_UP_POSTPONED`, `FOLLOW_UP_DISMISSED`).
- [x] **Draft Generator Modal ([src/components/shared/follow-up-draft-modal.tsx](file:///d:/myprojects/employdnt/src/components/shared/follow-up-draft-modal.tsx)):**
  - 3 customizable tones (*Direct & Polite*, *Short & Sweet*, *Value-Focused*) generating pre-filled subject and body.
  - Dynamic recruiter greeting and relative submission timing.
  - 1-click clipboard copy with visual feedback, `mailto:` launcher for user's native email client, and quick "Mark as Completed" action.
  - Strict compliance with core design rule: **zero automated sending**.
- [x] **Follow-Up Management View ([src/app/(dashboard)/follow-up/page.tsx](file:///d:/myprojects/employdnt/src/app/(dashboard)/follow-up/page.tsx), [src/components/pages/follow-up/follow-up-view.tsx](file:///d:/myprojects/employdnt/src/components/pages/follow-up/follow-up-view.tsx)):**
  - Due / Overdue section with inline Draft, Done (`✓`), Postpone (+3d), and Dismiss actions.
  - Upcoming 14-day schedule overview with days-until counters and preview drafts.
  - Empty states when all caught up.
- [x] **Application Detail Integration ([src/components/pages/applications/application-detail.tsx](file:///d:/myprojects/employdnt/src/components/pages/applications/application-detail.tsx)):**
  - Dynamic follow-up status card (Completed, Dismissed, Inactive, Due Now, Scheduled).
  - "Draft Follow-Up Email" button opening the draft modal, plus quick `Done`, `+3 Days`, and `Dismiss` buttons updating the audit timeline.

---

## Phase 3: Gmail Integration ✅ (COMPLETED)
*(Ref: docs/plan.md Module 4)*
- [x] **OAuth Read-Only Scope & Token Lifecycle ([src/auth.ts](file:///d:/myprojects/employdnt/src/auth.ts), [src/services/user.service.ts](file:///d:/myprojects/employdnt/src/services/user.service.ts)):**
  - Integrated `https://www.googleapis.com/auth/gmail.readonly` with `access_type: "offline"` and automatic token refresh via Google's OAuth token endpoint.
  - Persisted tokens on `User` model with disconnect support.
- [x] **Recruitment Email Scanner & Data Model ([src/models/detected-email.model.ts](file:///d:/myprojects/employdnt/src/models/detected-email.model.ts), [src/services/gmail.service.ts](file:///d:/myprojects/employdnt/src/services/gmail.service.ts)):**
  - Targeted queries filtering out promotions and social mail.
  - Domain classification engine identifying *Interviews*, *Offers*, *Rejections*, *Acknowledgments*, and *Inquiries*.
  - Strict privacy compliance: stores only headers and brief snippets, never full inboxes.
- [x] **Application Matching Engine ([src/services/gmail.service.ts](file:///d:/myprojects/employdnt/src/services/gmail.service.ts)):**
  - Multi-signal matching (recruiter email, exact company name, role name, sender domain).
  - Confidence scoring (`high`, `medium`, `low`, `none`).
- [x] **User Confirmation & Status Transitions:**
  - Automated status suggestions (Interview, Rejected, Offer) requiring explicit user confirmation.
  - Confirmation logs `EMAIL_LINKED` and `STATUS_CHANGED` events to the application's chronological timeline.
- [x] **UI Integration & Controls:**
  - **Settings View ([src/components/pages/settings/settings-view.tsx](file:///d:/myprojects/employdnt/src/components/pages/settings/settings-view.tsx)):** Gmail connect/disconnect controls, manual "Sync Now" trigger, and privacy disclosures.
  - **Today Dashboard ([src/components/pages/today/today.tsx](file:///d:/myprojects/employdnt/src/components/pages/today/today.tsx)):** Real-time "Recruiter Updates" card with quick confirmation/dismissal actions.
  - **Application Detail ([src/components/pages/applications/application-detail.tsx](file:///d:/myprojects/employdnt/src/components/pages/applications/application-detail.tsx)):** Banner for detected emails with status transition shortcuts and linked timeline activity.

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
