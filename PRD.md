# Product Requirements Document — FitFlow

> Recreated from the current webapp codebase (source of truth). Describes what is implemented today, plus known gaps and next work.

---

## 1. Overview

**Product Name:** FitFlow  
**Tagline / metadata:** “Smart Workout Tracker”  
**Type:** Web-based fitness tracking application  
**Summary:** FitFlow lets users create and edit custom workouts, run guided live sessions (checklist, session timer, rest timer, inline edits with auto-save), and view progress metrics. It supports **guest mode** (shared default user UUID) and **email/password auth** via Supabase, with data stored in Postgres under RLS.

**Package identity:** npm package is still named `my-v0-project` (`0.1.0`); UI brand is FitFlow.

---

## 2. Goals & Success Metrics

| Goal | Metric / signal |
|------|-----------------|
| Low-friction workout tracking | Guest can reach `/workouts` in one tap from landing |
| Fast start of a saved routine | Start a workout from list card → `/workouts/[id]` |
| Visible progress retention | Returning users open Progress and see streak / weekly activity |
| Mobile-usable core flows | Workouts, session, and progress usable at ~375px (nav drawer) |
| Account continuity | Auth users get starter workouts on first login; data scoped by `user_id` |

---

## 3. Target Users

- **Casual gym-goers** who want a simple place to store and run routines.
- **Intermediate lifters** who log sets, reps, weight, rest, and machine adjustments.
- **Explorers** who prefer guest mode before signing up.

---

## 4. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 15** (App Router), **React 19**, **TypeScript 5** |
| Styling | **Tailwind CSS 3.4** + CSS variables / custom neon utilities |
| Components | **shadcn/ui** (Radix UI), **Lucide** icons |
| Backend | **Supabase** (Postgres, Auth, RLS) — browser client only |
| Forms / validation | **react-hook-form**, **zod**, **@hookform/resolvers** |
| Charts | **Recharts** |
| Drag & drop | **@dnd-kit** (core, sortable, modifiers) |
| Theming | **next-themes** (`defaultTheme="dark"`, `enableSystem`) |
| Toasts | **sonner** / `use-toast` (called in UI; Toaster not mounted in root layout today) |
| E2E | **Playwright** |
| Dates | **date-fns** |

There are **no** Next.js API routes or server actions for domain data. All reads/writes go through the Supabase JS client from the browser.

---

## 5. Information Architecture

```
/                     Landing (hero + Login/Sign Up modal + Use as Guest)
/workouts             Workout list (search, create/edit dialogs, delete, start)
/workouts/[id]        Live workout session
/progress             Progress dashboard (metrics + charts)
/profile              Auth-gated placeholder (“coming soon”)
/auth/callback        Email confirmation / auth error messaging → redirect /workouts
/create               Legacy weekly program UI (not linked in active nav; save is local alert only)
```

**Active nav (`NavigationBar`):** FitFlow logo, Workouts, Progress, disabled “Community”, guest/auth actions.  
**Not in active nav:** Profile, `/create`.  
**Unused:** `components/navigation.tsx` (CyberFit branding + external Progress link).

---

## 6. Database Schema

### 6.1 Tables

#### `workouts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Default UUID |
| `user_id` | UUID | Nullable historically; auth/guest scoping via RLS |
| `name` | VARCHAR(255) | Required |
| `description` | TEXT | Optional |
| `estimated_duration` | VARCHAR(50) | e.g. `"45 min"` (string, not integer minutes) |
| `workout_type` | VARCHAR(20) | CHECK: Strength, Hypertrophy, Endurance, Cardio, Mobility, Skill, Recovery |
| `categories` | JSONB | Array of category strings |
| `completions` | INTEGER | Default 0 |
| `last_completed` | TIMESTAMPTZ | Nullable |
| `created_at` | TIMESTAMPTZ | Default `now()` |

#### `exercises`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `workout_id` | UUID (FK → workouts) | ON DELETE CASCADE |
| `name` | VARCHAR(255) | Required |
| `sets` | INTEGER | Default 3 |
| `reps` | VARCHAR(50) | Ranges allowed (`"8-12"`) |
| `weight` | VARCHAR(50) | Optional string (e.g. `"70kg"`) |
| `rest_time` | VARCHAR(50) | e.g. `"60s"`, `"90"` |
| `notes` | TEXT | Optional |
| `adjustment` | VARCHAR(100) | Machine position / setup |
| `description` | TEXT | Optional (UI often labels as notes) |
| `order_index` | INTEGER | DnD ordering |
| `created_at` | TIMESTAMPTZ | |

#### `workout_history`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `workout_id` | UUID (FK) | |
| `user_id` | UUID | |
| `completed_at` | TIMESTAMPTZ | Default `now()` |
| `duration_minutes` | INTEGER | Session duration |
| `notes` | TEXT | Currently set by app to a fixed completion string |

#### `exercise_performance`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `workout_history_id` | UUID (FK) | ON DELETE CASCADE |
| `exercise_id` | UUID (FK) | |
| `exercise_name` | VARCHAR(255) | Snapshot at finish |
| `sets_completed` | INTEGER | |
| `reps_performed` | VARCHAR(50) | Optional |
| `weight_used` | VARCHAR(50) | Optional string (e.g. `"70kg"`) |
| `notes` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | |

Written on session finish; read by Progress for strength trends and weekly sets.

#### `categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `user_id` | UUID | Optional / multi-user prep |
| `name` | VARCHAR(100) | Unique (migration) |
| `usage_count` | INTEGER | Via `increment_category_usage` |
| `created_at` | TIMESTAMPTZ | |

Seeded defaults include body-part style labels (Upper Body, Legs, Chest, etc.).

### 6.2 Relationships

```
workouts  1 ──* exercises
workouts  1 ──* workout_history
workout_history  1 ──* exercise_performance
```

### 6.3 RPC Functions (used / present)

| Function | Purpose | App usage |
|----------|---------|-----------|
| `get_workout_stats` | Totals, week/month counts, streak | Called from `databaseService` |
| `get_category_breakdown` | Distribution by category | Called from progress |
| `get_all_categories` | List categories + usage | Called from categories hook |
| `increment_category_usage` | Bump usage on assign | Called when saving categories |
| `increment_completions` | SQL helper | Present in schema; completions updated in app service path |

**Note:** Client calls some RPCs with a `{ user_id }` argument while older SQL definitions take no args and rely on `get_current_user_id()` / global scope (see auth setup / fix scripts). Deployed SQL must match the client.

### 6.4 Row-Level Security

- RLS enabled on domain tables.
- Auth setup scripts scope rows by `auth.uid()` **or** guest UUID `00000000-0000-0000-0000-000000000001`.
- Base `supabase-schema.sql` also includes permissive “allow all” policies for early single-user setup — production should use the auth/RLS setup scripts.

---

## 7. Features

### 7.1 Authentication

| Requirement | Detail |
|-------------|--------|
| Email/password | Supabase `signInWithPassword` / `signUp` via `AuthModal` |
| Guest mode | “Use as Guest” → `/workouts`; `getCurrentUserId()` falls back to guest UUID |
| Session | `AuthProvider` listens to `onAuthStateChange` |
| Hash tokens | Landing page parses `#access_token` / `#refresh_token`, `setSession`, then `/workouts` |
| Email confirmation | `/auth/callback` shows success/error; redirects to `/workouts` after ~3s |
| Starter workouts | On first authenticated session with **zero** workouts → seed **Leg Day** + **Upper Body Blast** |
| Profile gating | `/profile` redirects guests to `/?login=1` (opens AuthModal) |
| Logout | `signOut` then full page reload |

### 7.2 Workout Management (`/workouts`)

| Requirement | Detail |
|-------------|--------|
| List | Cards: name, workout type badge, up to 2 category badges, description, duration, exercise count, completions / last completed |
| Search | Real-time filter on **name, description, and categories** |
| Create | Dialog + `CreateWorkoutForm` (primary path) |
| Edit | Dialog + `EditWorkoutForm` |
| Delete | Immediate delete (no confirmation dialog) |
| Exercise builder | Add/remove/reorder via @dnd-kit + up/down; fields: name (autocomplete library), sets, reps, weight, rest, adjustment (“Machine Position”), description |
| Duration | Estimated duration auto-calculated unless user overrides |
| Start | Navigate to `/workouts/[id]` |

**Out of product path:** `/create` weekly program builder does not persist to Supabase.

### 7.3 Workout Session (`/workouts/[id]`)

| Requirement | Detail |
|-------------|--------|
| Exercise checklist | Toggle complete; drives current sets (all or 0) |
| Progress bar | % of exercises marked complete |
| Session timer | Elapsed time via local interval from session start |
| Rest timer | Per-exercise countdown (`useRestTimer`); beep + vibrate; visibility-aware |
| Inline editing | Name, description, reps, weight, rest, machine position; ~1s debounced save of full exercise list |
| Serialized writes | `runSerializedWorkoutExerciseWrite` — delete-all + reinsert exercises per workout |
| Exit | Persist exercise edits, return to `/workouts` |
| Finish | Confirm dialog; requires ≥1 completed exercise; persists history + increments completions; notes = hardcoded `"Completed N exercises"` (no user notes field) |

### 7.4 Progress Dashboard (`/progress`)

| Requirement | Detail |
|-------------|--------|
| This week hero | Session count for the current week + soft row (this month, lifetime, weekly sets, streak) |
| Sets by muscle group | Bar chart (muscle on X, sets on Y); Week/Month toggle (calendar week vs last 30 days) |
| Sessions by week | Line chart of sessions per week over the last 5 weeks |
| Getting stronger | Up to 5 exercises from `exercise_performance`; last weight×reps and ↑/↓/—/New vs prior session |
| Recent sessions | Last 8 from `workout_history` (name, date, duration) |
| Data scope | Guest uses shared guest UUID (may include demo seed); authenticated users query by `auth.uid()` / their `user_id` only |
| Empty states | No completions → CTA to workouts; sessions without logged weight → note under Getting stronger |

**Removed:** hardcoded weekly/monthly goal bars, milestone badges, monthly trend line chart.

### 7.5 Profile (`/profile`)

Placeholder only after auth gate: email/password/avatar/delete account called out as coming soon. Email shown in nav when logged in; no Profile nav link.

### 7.6 Landing (`/`)

| Requirement | Detail |
|-------------|--------|
| Hero | FitFlow logo, gradient title, short supporting line |
| Highlights | Track & edit workouts; visualize progress; fast/modern |
| CTAs | Login / Sign Up (modal); Use as Guest → `/workouts` |
| Deep link | `?login=1` opens AuthModal |

### 7.7 Navigation & Layout

| Requirement | Detail |
|-------------|--------|
| Top nav | Fixed bar; Workouts + Progress; mobile drawer |
| Auth controls | Login (guest) / Logout (user); shows Guest or email |
| Theme | Dark by default; **no in-app theme toggle** |
| Branding | FitFlow wordmark + logo |

---

## 8. UI & Design System

| Aspect | Specification |
|--------|---------------|
| Direction | Dark neon / nightclub–Gymshark energy (see `RULES.md`) |
| Font | **Inter** loaded via `next/font/google`; CSS also references unloaded cyber fonts (fallback) |
| Colors | Primary green; accent purple/cyan neon; dark slate gradients |
| Utilities | `cyber-glow`, `cyber-border`, `neon-text`, `cyber-grid`, `glitch`, `pulse-neon`, `card-glow`, etc. |
| Components | shadcn/ui primitives + feature forms/session/metrics |
| Responsive | Mobile-first Tailwind; hamburger nav on small screens |

---

## 9. Data Layer Architecture

```
React page / component
  └─ Custom hook (useWorkouts, useProgress, useCategories, …)
       └─ databaseService / helpers (lib/database.ts)
            └─ Supabase client (lib/supabase.ts)
                 └─ Postgres + Auth + RLS
```

### 9.1 Custom Hooks

| Hook | Responsibility |
|------|----------------|
| `useWorkouts` | Load/create/update/delete workouts; complete workout; update exercises |
| `useProgress` | Stats, category breakdown, history, performance; weekly activity, strength trends, recent sessions, weekly sets |
| `useCategories` | List / save / delete categories |
| `useExercises` | Local exercise list helpers (forms largely inline their own logic) |
| `useRestTimer` | Rest countdown used in session |
| `useTimer` | Session elapsed helper — **not used** by current session UI |
| `useAutoSave` | Generic debounce helper — **not used** (session has inline debounce) |

### 9.2 State Management

- No Redux / Zustand / TanStack Query.
- Session/guest via `AuthProvider`; theme via `ThemeProvider`.
- Pages fetch on mount through hooks.

---

## 10. Auth Flow

```
Landing /
  ├─ Login / Sign Up → AuthModal → Supabase email/password
  │     ├─ Signup may require email confirmation → hash/callback → /workouts
  │     └─ Login success → /workouts
  └─ Use as Guest → /workouts (guest UUID)

First login with empty workout list:
  → createStarterWorkoutsForUser() → Leg Day + Upper Body Blast

Logout:
  → signOut → full reload

/profile (guest):
  → /?login=1
```

---

## 11. Non-Functional Requirements

| Requirement | Target / status |
|-------------|-----------------|
| Performance | Snappy client UX; auto-save + optimistic patterns preferred (`RULES.md`) |
| Accessibility | Radix primitives; keyboard/focus; 44px touch targets guidance |
| Offline | Not supported (Supabase required) |
| Browsers | Latest Chrome, Firefox, Safari, Edge |
| Testing | Playwright; currently one persistence E2E (`workout-sat-chest.spec.ts`) |
| Timer accuracy | Rest timer uses timestamps + Page Visibility (not naive intervals alone) |
| Build | `next build` / `next lint` |

---

## 12. Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

See `.env.example`.

---

## 13. Development Setup

```bash
# 1. Clone
git clone <repo-url> && cd fitness-app

# 2. Install
npm install --legacy-peer-deps

# 3. Env
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Database (Supabase SQL editor, in order as needed)
#    supabase-schema.sql
#    migration-workout-type.sql
#    migration-categories-table.sql
#    supabase-authentication-setup.sql
#    fix-progress-functions.sql   # if stats RPCs need repair

# 5. Dev
npm run dev
```

Optional: `npm run sync` / `npm run dev-sync` for the repo’s auto-sync helper.

---

## 14. Project Structure

```
fitness-app/
├── app/
│   ├── layout.tsx                 # Theme + Auth + NavigationBar
│   ├── page.tsx                   # Landing
│   ├── globals.css
│   ├── workouts/page.tsx          # List + dialogs
│   ├── workouts/[id]/page.tsx    # Session host
│   ├── progress/page.tsx
│   ├── profile/page.tsx           # Placeholder
│   ├── create/page.tsx            # Legacy / unused in nav
│   └── auth/callback/page.tsx
├── components/
│   ├── ui/                        # shadcn + AuthModal, etc.
│   ├── AuthProvider.tsx
│   ├── navigation-bar.tsx         # Active nav
│   ├── navigation.tsx             # Unused CyberFit nav
│   ├── create-workout-form.tsx
│   ├── edit-workout-form.tsx
│   ├── workout-session.tsx
│   ├── progress-metrics.tsx
│   └── exercise/                  # ExerciseRow, ExerciseList
├── hooks/                         # useWorkouts, useProgress, …
├── lib/
│   ├── supabase.ts
│   ├── database.ts
│   ├── utils.ts
│   ├── workoutExerciseWriteQueue.ts
│   └── supabaseError.ts
├── tests/                         # Playwright
├── supabase-schema.sql
├── supabase-authentication-setup.sql
├── migration-*.sql
├── fix-progress-functions.sql
├── RULES.md                       # Design / eng standards
└── PRD.md                         # This document
```

---

## 15. Current Status & Backlog

### Implemented (core path)

- [x] Next.js 15 + Tailwind + shadcn dark neon shell
- [x] Supabase client + workout/exercise CRUD
- [x] Guest + email/password auth, callback / hash session handling
- [x] Starter workouts for new auth users
- [x] Workout list with search, create/edit dialogs, DnD exercises
- [x] Live session: checklist, timers, inline auto-save, finish → history
- [x] Progress: weekly hero, activity chart, strength trends, recent sessions
- [x] Categories table + multi-select on workouts
- [x] Serialized exercise write queue
- [x] `exercise_performance` written on finish and used on Progress

### Gaps / tech debt (known from code)

- [ ] Mount global Toaster so session/form toasts actually surface
- [ ] Delete confirmation; optional finish notes UI
- [ ] Align RPC signatures (client `user_id` vs SQL definitions)
- [ ] Profile settings (email, password, avatar, delete account)
- [ ] Theme toggle (or remove unused theme-switch expectations)
- [ ] Remove or wire `/create` and unused CyberFit `navigation.tsx`
- [ ] Expand Playwright coverage (create workout, full session, progress)
- [ ] Rename npm package from `my-v0-project` to FitFlow
- [ ] Community / social (nav placeholder only)

### Possible next product phases

1. **Progress depth** — editable goals, richer lift history / PR views.
2. **Account & trust** — profile settings, confirm delete, finish notes, toast reliability.
3. **Cleanup** — dead routes/components, RPC/SQL parity, package branding.
4. **Polish & launch** — broader E2E, mobile pass, deploy (e.g. Vercel).
5. **Later** — Community, native mobile, templates/sharing.
