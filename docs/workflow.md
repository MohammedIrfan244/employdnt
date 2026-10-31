# Employdnt — Project Commands & Git Workflow Guide

This document is your daily reference for common terminal commands, Git branching procedures, and deployment workflows.

---

## 1. Quick Command Cheatsheet

| Task | Command | Description |
|---|---|---|
| **Start Development** | `npm run dev` | Starts local Next.js dev server with Turbopack |
| **Production Build** | `npm run build` | Builds app using Next.js 16 Partial Prefetching |
| **Run Linter** | `npm run lint` | Runs ESLint across all files |
| **Run Type Check** | `npx tsc --noEmit` | Validates TypeScript types across the codebase |
| **Check Git Status** | `git status` | Shows modified, untracked, and staged files |

---

## 2. Branching Architecture

```
feat/feature-name  ──(PR)──>  beta (Staging)  ──(PR + CI verify)──>  main (Production)
```

- **`main` (Production):** Protected branch. Direct pushes are blocked locally and on GitHub. Deploys to live production on Vercel.
- **`beta` (Staging):** Integration branch. Deploys to preview/staging on Vercel (`employdnt-git-beta-....vercel.app`).
- **`feat/*` (Features):** Work branches created from `beta`. Every push triggers CI checks automatically on GitHub.

---

## 3. Daily Feature Workflow (Step-by-Step)

### Step 1: Start a New Feature
Always pull the latest changes from `beta` before branching:
```bash
git checkout beta
git pull origin beta
git checkout -b feat/your-feature-name
```
*Example: `git checkout -b feat/phase-1-services`*

### Step 2: Develop and Test Locally
As you make code changes:
1. Verify types:
   ```bash
   npx tsc --noEmit
   ```
2. Verify linting:
   ```bash
   npm run lint
   ```
3. Commit your progress:
   ```bash
   git add .
   git commit -m "feat: description of what was implemented"
   ```

### Step 3: Push Your Feature Branch
```bash
git push -u origin feat/your-feature-name
```
> **Note:** GitHub Actions CI will automatically trigger and run lint, type-check, and build on your feature branch push.

### Step 4: Open Pull Request to `beta`
1. Go to GitHub and open a Pull Request:
   - **Base:** `beta`
   - **Compare:** `feat/your-feature-name`
2. Wait for the green checkmark from CI.
3. Merge the Pull Request.
4. Vercel will update your Beta staging environment.

### Step 5: Release from `beta` to `main` (Production)
When a milestone or phase on `beta` is ready for production:
1. Open a Pull Request on GitHub:
   - **Base:** `main`
   - **Compare:** `beta`
2. CI validates the release build.
3. Merge the Pull Request.
4. Vercel automatically deploys the release to production!

---

## 4. Safety Guardrails & Tips

### Local Pre-Push Guard
A local hook is installed at `.git/hooks/pre-push`. If you ever accidentally run:
```bash
git push origin main
```
Git will reject it immediately:
```
🚨 BLOCKED: Direct push to 'main' is not allowed!
Please push to 'beta' or your feature branch, then open a Pull Request.
```
*(If you ever need an emergency admin bypass locally, append `--no-verify`).*

### Next.js 16 Rules to Keep in Mind
- **Dynamic Routes:** Any dynamic parameter (`[id]`) in Next.js 16 App Router using Partial Prefetching must access runtime data within `<Suspense>` boundaries.
- **One File, One Logic:** Keep database logic in `src/services/`, types in `src/types/`, models in `src/models/`, and UI strictly presentation-focused.

