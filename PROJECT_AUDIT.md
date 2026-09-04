# PROJECT_AUDIT.md

**BEU BABA — Phase 0 deliverable** (blueprint §45 PHASE 0 — DISCOVERY + SAFETY BASELINE)
**Date:** 2026-09-04 · **Author:** Arena.ai agent · **Mode:** read-only audit, **zero code changes**

Companions: `CURRENT_FEATURE_MATRIX.md` · `TECHNICAL_GAP_REPORT.md` · `CONTINUATION_AUDIT.md`

---

## 1. Repository inventory

| Path | Size | What it is |
|---|---|---|
| `repo/beubaba/` | 44 MB | The application. React 19.2 + Vite 8.2 + TypeScript 6.0 + Tailwind 3.4 |
| `repo/beubaba/src/` | — | 91 `.tsx`, 48 `.ts`, **42 routes**, 10 seed JSON files (8.3 MB) |
| `repo/beubaba/supabase/` | 4.3 MB | 5 migrations, `build_seed.mjs`, `seed_data.sql` (4.3 MB), `seed_admin.sql`, 4 test SQL files |
| `repo/production md file and other data/` | 42 MB | 24 production spec MDs + extracted source JSON datasets |
| `repo/mcq_import/` | 22 MB | **NEW** — the 5 uploaded MCQ banks + `audit_mcq.py` (Phase 6 input, quarantined outside `src/`) |
| `repo/assets_preview/` | 2.3 MB | Extracted image assets |
| `repo/CONTINUATION_AUDIT.md` | 56 KB | Prior 729-line audit, defect register D1–D14, blockers B1–B7 |

**Workspace total: 108 MB / 385 files** — inside the 128 MB / 10,000-file snapshot budget.

Git: single upstream commit `e408801`; `.git` is re-created locally by `bootstrap.sh`
(history does not survive across turns in this environment — plain files only).

### Dependencies (22 total — lean)
`@supabase/supabase-js 2.109` · `@tanstack/react-query 5.102` · `clsx` · `framer-motion 13.1` ·
`lucide-react 1.38` · `qrcode` · `react 19.2` · `react-dom` · `react-router-dom 7.18` ·
`tailwind-merge` · `zod 4.5`
Dev: `typescript ~6.0.2` · `vite ^8.2.2` · `@vitejs/plugin-react` · `tailwindcss 3.4.19` ·
`postcss` · `autoprefixer` · `oxlint 1.79` · `@types/*`

**No test runner is installed.** Scripts are `dev` / `build` (`tsc -b && vite build`) / `lint` (`oxlint`) / `preview`.

---

## 2. Environment verification (machine-checked, not assumed)

| Check | Command | Result |
|---|---|---|
| Install | `npm ci` | ✅ succeeds (cache at `/tmp/npm-cache`) |
| Typecheck + build | `npm run build` | ✅ **exit 0** |
| Lint | `npm run lint` | ✅ **0 errors** |
| Bundle size | build output | 🔴 **8.96 MB JS**, no route-level code splitting |
| PostgreSQL | `psql --version` | ✅ **17.11** available via passwordless sudo |
| Scratch DB cluster | `/tmp/bbpg` on port **5433** | ✅ boots — migrations and RLS **can** be executed and tested locally |
| Supabase credentials | repo scan | ⛔ **absent** (correct — nothing committed). Supabase path cannot be exercised |
| Playwright browsers | not attempted | ⚠️ unknown |
| Demo login | mock backend | `admin@beubaba.app` / `admin1234` |

**Important correction to prior sessions:** SQL/RLS testing is **not** blocked. A real PostgreSQL
17 cluster runs locally, so migrations, policies, and SECURITY DEFINER functions can be verified
without Supabase. Only live-Supabase integration (auth, storage, realtime, push) is blocked.

---

## 3. Security baseline audit (blueprint §49 — security is priority #1)

### ✅ PASS — no secrets committed
Scan for `eyJ…`, `sk_live`, `sk_test`, `AIza…`, `BEGIN PRIVATE KEY`, `service_role` across
`src/`, `supabase/`, `vite.config.ts`, `index.html` → **0 real hits**. The single match is a
local test shim creating a dummy `service_role` role (`supabase/tests/00_local_shim.sql:39`),
not a credential.

### ✅ PASS — Supabase config is env-only
`services/backend/config.ts` reads `VITE_BACKEND` (default `mock`), `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`. `supabaseClient.ts` throws if they are missing. **No hardcoded URL or key.**

### ✅ PASS — database authorization design
- **35 / 35 tables have RLS enabled** (`create table` count == `enable row level security` count).
- **78 RLS policies.**
- **11 `SECURITY DEFINER` functions — and all 11 pin `set search_path = public`.**
  This closes the classic search-path-hijack escalation. Verified by inspection of
  `has_role`, `is_admin`, `is_super_admin`, `has_permission`, `handle_new_user`,
  `grant_role`, `revoke_role`, `start_quiz_attempt`, `save_quiz_answer`,
  `submit_quiz_attempt`, `moderate_resource`.
- `grant_role` / `revoke_role` are the only write path to roles; `moderate_resource` re-checks
  `has_permission('approve_resources')` **inside** the function. No client-side escalation.
- The one non-definer function (`set_updated_at` trigger) touches no tables.

### ✅ PASS — XSS surface
- **0 uses of `dangerouslySetInnerHTML`.**
- **0 uses of `eval` or `element.innerHTML =`.**

### ✅ PASS — external navigation
All 8 `window.open` call sites pass `'_blank', 'noopener,noreferrer'`. `SavedPage.tsx:76`
additionally guards with `/^https?:\/\//` before opening a user-supplied URL (blocks
`javascript:` schemes).

### ✅ PASS — client-side quiz integrity
`services/quizService.ts` strips answer keys via `toPublic()` before any question reaches the
UI. Grading is server-authoritative in the design. Correct per blueprint §16/§49.

### 🟡 S-1 (LOW, open) — `new Function()` in the scientific calculator
`src/features/tools/toolbox/UtilityTools.tsx:314` builds an expression evaluator:
```js
const fn = new Function(`"use strict"; return (${s});`)
```
It is **not** remotely exploitable and it **is** sanitized: `ln/log/sqrt/sin/cos/tan/pi/e` are
rewritten to `Math.*`, then any remaining bare `[a-zA-Z]` identifier returns `null` — so
`Math.constructor`, `fetch`, `window` and friends are all rejected. Residual risk is an
unhandled throw on malformed input and a lint/security-scan hit.
**Recommendation (Phase 7):** replace with a small recursive-descent arithmetic parser.

### 🔴 S-2 (HIGH, open, carried from prior audit as D1) — seed key collisions
`supabase/build_seed.mjs` keys imported questions by `md5(qid)`. Colliding `qid` values silently
overwrite each other. **This is exactly the failure mode the new MCQ data would trigger**
(1,301 duplicate IDs, 119 colliding with the existing bank). Must be fixed **before** any import.

### 🔴 S-3 (HIGH, open) — no test coverage at all
No unit, integration, or e2e tests. 4 SQL test files exist but have never been run against a DB
in a recorded way. Security claims are therefore unproven by execution. Phase 14 must close this;
the local PG cluster means it is **not blocked**.

### 🟡 S-4 (MEDIUM, open) — frontend role guard is cosmetic
`app/guards.tsx:35` redirects non-admins with `<Navigate to="/" replace />`. This is correct UX
but is **not** authorization. Acceptable **only** because the SQL layer enforces RLS +
permission functions. It becomes a real vulnerability the moment any admin write is performed
client-side rather than through a SECURITY DEFINER function. Flag for Phase 10.

### 🟡 S-5 (MEDIUM, open) — mock backend stores sessions client-side
On the mock path, auth state lives in the browser. Anyone can flip it. Acceptable for a
demo/dev fallback; **must never ship as the production path**. `VITE_BACKEND` must be pinned to
`supabase` in any real deployment. Flag for Phase 2 / Phase 14.

**Security summary: the schema design is genuinely good. The open risks are process risks
(no tests, no execution proof) plus one latent seed bug (D1/S-2) that the MCQ import will hit.**

---

## 4. Design-system compliance (blueprint §5, §50 prohibited list)

| Rule | Result |
|---|---|
| No dark theme / black glass / neon / RGB / cyberpunk | ✅ 0 violations |
| No giant 3D / particles | ✅ 0 violations |
| No emoji used as UI icons | ✅ `lucide-react` throughout |
| Light premium transparent glass only | ✅ 5 glass levels in `src/index.css` `:root` |
| `tailwind.config.js` sourced from CSS variables | ✅ fully variable-sourced |
| Reduced-motion support | ✅ `hooks/useReducedMotion.ts` + CSS media query |
| Safe-area insets | ✅ 8 correct `env(safe-area-inset-*)` uses |
| Typography | 🟡 ships Sora + Plus Jakarta Sans; blueprint §5.4 recommends Manrope + Inter (**conflict CF-1**) |
| Desktop layout | 🔴 single `max-w-2xl` column at all widths; blueprint §5.5 requires glass sidebar + multi-column dashboard (**conflict CF-4**) |

---

## 5. Data integrity of existing datasets (re-verified)

| Dataset | Volume | Integrity |
|---|---|---|
| Academic taxonomy (`seed_academic.json`) | 30 branches, 1,224 subject codes | ✅ |
| Syllabus | 1,286 / 1,749 subjects (**73.5%**), 4,233 units | 🟡 463 subjects empty |
| PYQ papers | **363 papers, 8,831 questions, 3,263 blocks**, 2013–2025 | ✅ 0 orphans, counts match |
| Quizzes (`seed_quiz_meta.json`) | 45 quizzes | ✅ |
| Questions (`seed_quiz_questions.json`) | **92 questions, 9 subject codes (0.7% coverage)** | 🔴 content-starved |
| External data | 13 portals, 21 gov exams, 37 colleges, 85 extracted links | ✅ real extracted data |
| Academic calendar / notices | **intentionally empty** | ⛔ blocked on real BEU data — fabricated content was removed per owner directive and must **not** be re-seeded |

New staged data: **26,342 MCQ questions** in `repo/mcq_import/` — audited, **not imported**.
See `TECHNICAL_GAP_REPORT.md` §3 for the eight defects and four owner decisions required.

---

## 6. Safety baseline established for all future phases

These are the invariants every later phase must not break:

1. `npm run build` exits 0 and `npm run lint` reports 0 errors — re-run at the end of every phase.
2. Never commit or invent credentials. `VITE_*` stays out of the repo.
3. Never bundle the 22 MB MCQ files into `src/` or the JS bundle.
4. Never import questions by raw `id`. Re-key deterministically and fix D1 first.
5. Calendar / notices stay empty until real BEU data is supplied. No invented academic dates.
6. Answer keys never reach the client (`toPublic()` must stay on every quiz read path).
7. Every new table gets RLS enabled; every new SECURITY DEFINER function pins `search_path`.
8. No new prohibited visual patterns (dark/neon/3D/particles/emoji-icons).
9. Keep the workspace under 128 MB / 10,000 files; run `bash /home/user/bootstrap.sh clean`
   before ending any turn.
10. Phase-locked delivery: never implement a future phase early; stop and ask after each phase.

---

## 7. Phase 0 completion status

| Required deliverable | Status |
|---|---|
| `PROJECT_AUDIT.md` | ✅ this file |
| `CURRENT_FEATURE_MATRIX.md` | ✅ written |
| `TECHNICAL_GAP_REPORT.md` | ✅ written |
| Code changes | ✅ **none** — Phase 0 is audit-only, as authorized |

**Phase 0 is complete. Awaiting authorization for Phase 1.**
