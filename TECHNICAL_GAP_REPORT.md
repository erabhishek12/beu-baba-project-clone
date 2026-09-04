# TECHNICAL_GAP_REPORT.md

**BEU BABA — Phase 0 deliverable** (blueprint §45 PHASE 0)
**Date:** 2026-09-04 · **Commit audited:** `e408801`

Companion files: `CURRENT_FEATURE_MATRIX.md` (what exists) · `PROJECT_AUDIT.md` (repo + env) ·
`CONTINUATION_AUDIT.md` (prior deep audit, defect register D1–D14 / blockers B1–B7)

---

## 1. The critical gap: nothing runs on Supabase

**Finding.** `supabase/schema.sql` defines **35 tables, 35 RLS-enabled tables, 78 policies,
12 SECURITY DEFINER functions, 5 storage buckets, 5 migrations + seed**. None of it has ever
been executed. `services/backendAdapter.ts` switches between a mock backend and a Supabase
backend, and the app boots on the **mock** path. There are **no credentials in the repo**
(correctly — nothing is committed) and none are available in this environment.

**Consequence.** Every "backend" feature currently writes to `localStorage` only. Data does
not sync across devices, is lost on cache clear, and has no server-side authorization.

**Blocked.** Per standing directive: do not invent credentials. Marked ⛔, not failed.

---

## 2. Question-bank gap (the reason the owner asked for the MCQ import)

| | Now | After import |
|---|---|---|
| Questions | **92** | **26,434** |
| Quizzes | 45 | ~730 subject-unit groups |
| Subject codes covered | **9 / 1,224 (0.7%)** | ~166 / 1,224 (13.6%) |
| Branches | 4 | 4 (civil, CSE, electrical, mechanical) |
| PYQ papers | 363 (8,831 Qs) — already strong | unchanged |

The quiz feature is **structurally complete but content-starved**. That is the single highest-
impact gap for students.

---

## 3. MCQ IMPORT READINESS — verdict: **NOT SAFE TO IMPORT AS-IS**

The 5 uploaded files (22 MB) are staged at `repo/mcq_import/` with the audit script
`repo/mcq_import/audit_mcq.py`. Full machine-checked results:

**Totals:** 26,342 questions · civil 9,316 (2 files) · CSE 6,651 · mechanical 5,847 ·
electrical 4,528 · 166 distinct subject codes · semesters 1–6.

### ✅ What is good
- **0 broken answer keys** — every `correct_indices` value is in range for its `options` array.
- **0 missing explanations** — all 26,342 have an `explanation`.
- **All `branch_id` values valid** against the app's 30-branch taxonomy.
- **All `semester` values valid** (1–6).
- Question-type mix matches blueprint §15 intent: `single` 23,202 · `assertion_reason` 1,173 ·
  `truefalse` 1,095 · `multi` 872.
- Difficulty spread usable: easy 5,572 / medium 13,944 / hard 6,826.
- Schema is a **superset** of the app's `QuizQuestion` — it adds `branch_id`, `correct_indices`,
  `important`, `pyq`, `semester`, `subject_name`, `unit_title`, `year`; **removes nothing**.

### 🔴 Defect A — IDs are not unique (blocking)
- **1,301 duplicate `id` values across the 5 files.** Of these, **1,085 have different content**
  (same ID, different question) — only 216 are true repeats.
- **119 IDs collide with the existing 92-question bank**, and **all 119 are different content**.
- → Importing by raw `id` would silently overwrite or merge unrelated questions.
  This is the same class of bug as prior defect **D1** (`build_seed.mjs` used `md5(qid)`).
- **Required fix:** re-key on import, e.g. `q_<branch>_<subject>_<unit>_<hash(stem+options)>`.

### 🔴 Defect B — filenames lie about semester range (blocking for grouping)
- `civil_engineering.mcq sem 1-3.json` actually contains semesters **4, 5, 6**.
- `civil_engineering.mcq sem 4-6.json` actually contains **1, 2, 3, 4**.
- → **Never trust the filename.** Group by each record's own `semester` field.
  (Files were renamed to `part1` / `part2` in `mcq_import/` to remove the misleading labels.)

### 🟡 Defect C — 300 questions reference subjects that do not exist in the taxonomy
- All in `mechanical_engineering.json`: subject codes **100301, 102501, 100205**
  (e.g. "Basic Electronics Engineering"). These codes are **absent from all 1,224 subject codes**
  in `seed_academic.json`.
- → Choice required from owner: (a) add these subject rows to the taxonomy, or
  (b) quarantine the 300 questions and report them. **Not decided — not invented.**

### 🟡 Defect D — LaTeX markup in stems (476 questions)
- 476 stems contain LaTeX (`\frac`, `\sqrt`, `\alpha`, `$...$`).
- → The renderer has **no KaTeX/MathJax**. These will display as raw markup. Needs a
  lightweight math renderer, or they must be quarantined.

### 🟡 Defect E — every question is `verified: false`, and `pyq: false` everywhere
- App behaviour confirmed: `verified:false` shows a **"Community · Unverified" badge + warning
  only** — it does **not** block quizzes.
- → Importing 26,342 questions stamps the entire quiz section "Unverified". That is factually
  correct (nobody has reviewed them) but is a **content-trust decision the owner must make**,
  not one to assume. Options: import as unverified community content, or gate behind a review
  queue (blueprint §19 preview + §30 moderation).

### 🔴 Defect F — quizzes are not auto-discovered
- Confirmed in `services/quizService.ts`: a quiz appears **only** if it has a row in
  `seed_quiz_meta` with a `question_ids` pool. Adding questions alone makes **zero** new quizzes.
- → Import must also generate ~730 quiz metadata rows grouped by branch / semester / subject /
  unit. This is real work, not a data copy.

### 🔴 Defect G — 22 MB must NOT go into the app bundle
- Current bundle is already **8.96 MB JS** with no route splitting.
- Blueprint §36 prohibits large bundled assets; workspace snapshot budget is 128 MB.
- → Correct destination is **Phase 6 JSON Import Center → database**, or lazily-fetched
  per-branch static chunks. **Never `import()` these files into `src/`.**

### 🔴 Defect H — schema mismatch on question type
- DB check constraint allows `('single','multiple','true_false')`.
- Incoming data uses `single`, `multi`, `truefalse`, **`assertion_reason`**.
- → `multi`→`multiple` and `truefalse`→`true_false` are simple renames, but
  **`assertion_reason` (1,173 questions) has no column value**. Needs either a migration to
  extend the constraint, or mapping to `single` with a rendered assertion/reason layout.

**Import verdict: READY TO PLAN, NOT READY TO RUN.** Eight defects must be resolved; four need
owner decisions (C, D, E, H).

---

## 4. Blueprint vs. codebase — direct conflicts

| # | Conflict | Blueprint says | Codebase does | Resolution needed |
|---|---|---|---|---|
| CF-1 | Typography | §5.4 Manrope + Inter | Sora + Plus Jakarta Sans (self-hosted, already loaded, no network cost) | Owner picks. Changing fonts now re-flows every screen |
| CF-2 | Bottom nav items | §5.5 Home \| Courses \| Quiz \| Progress \| Profile | Home \| Study \| Quiz \| Tools \| Profile | "Progress" page does not exist; "Tools" holds 17 features and is heavily used |
| CF-3 | Content hierarchy | §2/§30 lists classes, modules, chapters, lessons, notes | course → branch → semester → subject → unit → topic only | §20 taxonomy matches the code; §2/§30 assume modules that were never built. Decide: extend taxonomy or drop those modules |
| CF-4 | Desktop layout | §5.5 glass sidebar + multi-column dashboard | Single `max-w-2xl` column at every width | Phase 1 work — real gap |
| CF-5 | Question types | §15 single / true_false / assertion_reason | DB allows single / multiple / true_false | See Defect H |
| CF-6 | Result export | §17 PNG **and** PDF | PNG only | Phase 5 gap |
| CF-7 | Search scope | §7 includes syllabus topics | 7 sources, syllabus topics excluded | Phase 4 gap |
| CF-8 | PWA push | §13/§26 Web Push notifications | Manifest + SW + install banner done; push never implemented | Phase 13 gap, needs VAPID keys (⛔) |

**No conflict found** in: design-token approach, light glass system, prohibited-visuals list,
security posture (keys stripped client-side, RLS enabled on every table), or mock/adapter split.

---

## 5. Known open defects carried forward (from `CONTINUATION_AUDIT.md`)

| ID | Severity | Summary | Status |
|---|---|---|---|
| D1 | 🔴 Critical | `build_seed.mjs` keys questions by `md5(qid)` → collisions silently overwrite questions | **UNFIXED** — directly relevant to the MCQ import |
| D2–D14 | mixed | See `CONTINUATION_AUDIT.md` §Defect register | Mostly open; re-verify at the phase that touches each area |
| B1–B7 | blocker | Supabase credentials, real BEU calendar, real notices, quiz content decisions, Web Push VAPID, admin CMS scope, OCR/Translator provider keys | All still blocked |

---

## 6. Testing gap

- **No test runner installed.** No unit, integration, or e2e tests exist.
- 4 hand-run SQL files under `supabase/`, never executed against a live DB.
- **However, testing is NOT blocked in this environment:** PostgreSQL 17.11 is available and a
  scratch cluster runs on `/tmp/bbpg:5433`. SQL, migrations, and RLS policies **can** be executed
  and verified locally without Supabase credentials. Vitest + Playwright can be installed.
- Prior session's "tests passed" claims were lost and must be re-derived from machine-checked evidence.

---

## 7. Gap summary by blueprint phase

| Phase | Gap size | Notes |
|---|---|---|
| 0 Discovery | ✅ **done by this document** | |
| 1 Foundation / design system | 🟡 Medium | Tokens + glass exist; desktop sidebar, multi-column dashboard, typography decision outstanding |
| 2 Auth / profile / security | 🟡 Medium | Mock complete; Supabase ⛔ |
| 3 Student core shell | 🟡 Medium | Nav + routing exist; desktop layout, search scope |
| 4 Academic content | 🔴 Large | Notes, modules/chapters/lessons, calendar ⛔, notices ⛔ |
| 5 Quiz engine | 🔴 Large | Engine exists but content-starved; difficulty analytics, random options, PDF, weak-area persistence, `assertion_reason` support |
| 6 JSON import center | 🔴 **Entirely missing** | Required for the 26,342 MCQs |
| 7 Study toolbox | 🟡 Small | 15/17 tools done; OCR + Translator missing |
| 8 Math Mind / revision / focus | 🔴 Entirely missing | |
| 9 AI chatbot | 🔴 Entirely missing | |
| 10 Admin CMS + moderation | 🔴 **26 of 30 modules missing** | Largest single gap |
| 11 Banners / announcements / notifications | 🔴 Large | Student notification service exists; admin side missing |
| 12 Support + contributions | 🟡 Medium | Student side done; **no admin inbox** |
| 13 PWA + performance | 🔴 Large | 8.96 MB bundle, no code splitting, no push |
| 14 Final QA / security / release | 🔴 Entirely missing | No tests at all |
