# BEU BABA — CONTINUATION AUDIT

**Audit date:** 2026-09-02
**Repository:** `https://github.com/erabhishek12/beu-baba-project-clone`
**Commit audited:** `e408801` — "Add BEU BABA project files" (the only commit; `main`; working tree clean)
**Authoritative instruction:** `BEU_BABA_MASTER_CONTINUATION_PROMPT.md` (4,936 lines, 119 sections)
**Authoritative product source:** `production md file and other data/` — 24 numbered specs, 125,213 lines, **5,468 numbered requirement sections**

> This document is the continuation audit required by §7 and §116 of the master
> prompt. It records what was inspected, and classifies every significant
> feature as COMPLETE / PARTIAL / BROKEN / DOCUMENTED-ONLY / MISSING / BLOCKED.
> Nothing here was inferred from appearance; every classification cites the
> file and evidence that produced it.

---

## 0. Method — what was actually inspected

| Step | Action | Result |
|---|---|---|
| 1 | Cloned repo, enumerated full tree | 3 top-level areas, 152 `src` files |
| 2 | Read master continuation prompt in full | 4,936 lines, no section skipped |
| 3 | Measured all 24 production MD files | 125,213 lines / 57,111 unique / **0 boilerplate padding** — all substantive |
| 4 | Extracted section map + requirement text of all 24 specs | `spec_distill.txt` (14,006 lines of distilled requirements) |
| 5 | Read app source: routes, guards, providers, backend adapters, all 18 services, mock DB, media, motion, text, icon cache, design tokens, Tailwind config | done |
| 6 | Inspected all 5 migrations, 4 SQL test files, seed generator, seed SQL | done |
| 7 | Inspected every JSON dataset + measured real record counts | done |
| 8 | `npm install` | **158 packages, 5s, exit 0** |
| 9 | `npm run lint` (oxlint) | **exit 0 — 0 errors, 7 warnings** |
| 10 | `npm run build` (`tsc -b && vite build`) | **exit 0 — PASSED**, 2,582 modules, 2.33s |
| 11 | `npm run dev` and served the app | **VITE v8.2.2 ready, HTTP 200, port 5173** |
| 12 | Verified `index.html`, `manifest.webmanifest`, `sw.js`, `offline.html` served | all HTTP 200 |
| 13 | Emoji scan of all `src/**/*.{ts,tsx}` | **0 emoji used as UI icons** (15 hits, all `→`/`↔` in comments or legitimate text) |
| 14 | Unused-asset audit of `public/assets` | 7.5 MB dead weight found |
| 15 | LaTeX/markup exposure measurement across PYQ, quiz, syllabus | quantified below |

**Not done (honest limitation):** no browser-driven interaction test was
executed. Classification below is from source tracing, data measurement, build
and HTTP verification. Runtime *behavioral* verification of each user flow
(§110–112) remains outstanding and is called out in the plan.

---

## 1. Repository inventory

```
/
├── assets_preview/                 2 logo options (A/B), ~2.3 MB
├── beubaba/                        THE APPLICATION
│   ├── docs/QUIZ_MCQ_GENERATION_PROMPT.md   (330 lines — MCQ generation contract)
│   ├── index.html, vite.config.ts, tailwind.config.js, postcss.config.js
│   ├── package.json                React 19.2, Vite 8.2, TS ~6.0, Tailwind 3.4,
│   │                               framer-motion 13, @tanstack/react-query 5,
│   │                               @supabase/supabase-js 2.109, zod 4, lucide-react,
│   │                               qrcode, react-router-dom 7, oxlint
│   ├── .env.example                VITE_BACKEND=mock (default) | supabase
│   ├── public/                     manifest, sw.js, offline.html, favicon,
│   │                               2 self-hosted woff2 fonts, 21 MB assets
│   ├── src/                        152 files, ~18.4k lines
│   │   ├── app/       routes, guards, App, ErrorBoundary, layouts, providers, pwa
│   │   ├── components/ ui, glass, forms, navigation, feedback, brand
│   │   ├── features/  about, admin, auth, home, notifications, profile, quiz,
│   │   │              resources, saved, search, settings, splash, study,
│   │   │              support, tools (+ toolbox)
│   │   ├── services/  18 services + backend/ adapters + mock/ seeds
│   │   ├── lib/       cn, iconCache, media, motion, text
│   │   ├── hooks/     useReducedMotion
│   │   ├── types/domain.ts   (452 lines — the full domain contract)
│   │   └── index.css  (474 lines — design tokens + glass material system)
│   ├── supabase/      5 migrations, seed/ (4.3 MB generated SQL), tests/ (4),
│   │                  build_seed.mjs, README.md
│   └── syllabus_export/  31 branch JSONs + index.json + _ALL_BRANCHES.json (9.7 MB)
└── production md file and other data/
    ├── BEU_BABA_01 … 24 .md        24 specs, 125,213 lines
    ├── apna_beu_extracted_data.json      8.4 MB  (the extraction source)
    ├── syllabus.json                     2.6 MB
    ├── pyqs.json                         4.8 MB
    ├── BEU_BABA_ALL_CONTEXT.json        15.0 MB
    ├── BEU_BABA_ALL_PYQ_QUESTIONS_ONLY.json 3.3 MB
    ├── government_exams.json, external_links.json, extras.json
    ├── 6 Python build scripts (build_seed, build_seed_phase3, build_quiz_seed,
    │   build_syllabus_detail, build_tools, export_syllabus_for_mcq)
    ├── 2 screenshots + 4 reference images + logo + character PNG
    └── index.html (1.4 KB stray)
```

**Git state:** 1 commit, 1 branch (`main`), clean tree, no uncommitted work to
preserve, no other branches. §6 handoff-preservation obligations are satisfied
trivially — nothing was at risk.

---

## 2. Architecture as-built (verified, not assumed)

**Entry:** `src/main.tsx` → `App` → `ErrorBoundary` › `QueryProvider` ›
`AuthProvider` › `ToastProvider` › `RouterProvider`.

**Routing:** `createBrowserRouter`, 44 routes. Public `/login`, `/register`,
`/forgot-password` behind `RequireGuest`. Everything else behind `RequireAuth`.
Three admin routes additionally behind `RequireAdmin`. Catch-all `*` → `/`.
Guards correctly render `FullScreenLoader` while `status === 'loading'`, so
protected content does **not** flash (§13 satisfied).

**Backend adapter boundary — this is the single most important architectural
fact in the repo:**

```
src/services/backend/config.ts   →  BACKEND = 'supabase' only if
                                    VITE_BACKEND==='supabase' AND url AND anon key
src/services/authService.ts      →  USE_SUPABASE ? supabaseAuthService : mockAuthService
```

`authService` is the **only** service that honours the switch. Measured:

| Service | Reads `USE_SUPABASE`? | Imports localStorage mock? |
|---|---|---|
| `authService` | **YES** | yes (mock branch) |
| `academicService`, `bookmarkService`, `calendarService`, `dashboardService`, `notificationService`, `profileService`, `pyqService`, `quizService`, `recentlyViewedService`, `reportService`, `resourceService`, `searchService`, `settingsService`, `supportService`, `syllabusService`, `toolsService` | **NO** | **yes — unconditionally** |

`grep -rn "getSupabase" src/ | grep -v services/backend/` returns **nothing**:
Supabase is correctly confined to the adapter layer (good discipline), but only
one adapter exists. **Consequence: setting `VITE_BACKEND=supabase` produces a
hybrid — real Supabase Auth, everything else still localStorage.** That is
worse than either pure mode, because a student would authenticate against
Supabase while their quiz attempts, resources, messages and profile live in
browser storage. This is the highest-priority architectural gap.

**Mock persistence:** `src/services/storage.ts` — namespaced (`beubaba:v1:`)
localStorage with `try/catch` that **silently swallows quota errors**. Per-user
scoping is consistently applied (`quiz_attempts:${userId}`,
`support:conv:${userId}`, `reports:${userId}`, `notifications:${userId}`).

**Mock auth:** real SHA-256 hashing with a salt (`mock/hash.ts`, explicitly
labelled non-cryptographic and mock-only), session token object (not a boolean
flag), generic `invalid_credentials` to avoid enumeration, roles read from the
account record. Seeded demo admin `admin@beubaba.app / admin1234` with 5
privileged roles, created only when `!USE_SUPABASE`. This is a *legitimate,
honestly-labelled* mock — not a fake-auth violation — but see Defect D6.

**Supabase schema (built, never executed):** 35 tables, **RLS enabled on all
35**, 78 policies, 12 `SECURITY DEFINER` functions (`handle_new_user`,
`grant_role`, `revoke_role`, `has_role`, `has_permission`, `is_admin`,
`is_super_admin`, `moderate_resource`, `start_quiz_attempt`, `save_quiz_answer`,
`submit_quiz_attempt`, `set_updated_at`), 5 storage buckets, a
`public_quiz_options` view that omits `is_correct`, and 4 SQL security test
files. The design is genuinely strong and spec-aligned. **It has never run
against a live project — no credentials exist in the repo (correctly).**

---

## 3. Build, lint, run verification (§113)

| Command | Result |
|---|---|
| `npm install` | exit 0 — 158 packages, 5s |
| `npm run lint` (oxlint) | **exit 0 — 0 errors, 7 warnings** |
| `npm run build` (`tsc -b && vite build`) | **exit 0 — PASSED** (2,582 modules, 2.33s) |
| `npm run dev` | **running** — VITE v8.2.2, port 5173, HTTP 200 |
| test script | **DOES NOT EXIST** — no `test` in `package.json`, no vitest/jest/playwright/cypress, zero `*.test.*` files |

Lint warnings (7, all `react/set-state-in-effect`) are in `AuthProvider.tsx:51`
and `app/pwa/usePwa.ts:29` and similar. They are benign bootstrap patterns but
disable React Compiler optimisation for those components. Low priority; do not
suppress blindly (§113).

**Build output — the real performance problem (§83):**

```
dist/assets/index-*.js                     1,780.07 kB │ gzip:   431.19 kB
dist/assets/seed_pyq_full-*.js             2,058.75 kB │ gzip:   479.42 kB
dist/assets/seed_syllabus_by_code-*.js     2,148.18 kB │ gzip:   609.16 kB
dist/assets/seed_syllabus_detail-*.js      2,972.32 kB │ gzip:   855.86 kB
dist/assets/index-*.css                       41.13 kB │ gzip:     9.11 kB
```

≈ **8.96 MB of JS** (1.94 MB gzipped). The three data chunks *are* lazily
imported (`syllabusService.loadDetailMap()`, `pyqDb.detail()`) — that part is
correct — but the **1.78 MB main chunk is not split at all**: all 44 routes are
statically imported in `routes.tsx`, so there is no route-level code splitting.
Bundler also reports `INEFFECTIVE_DYNAMIC_IMPORT` for `mock/hash.ts` (dynamic in
`db.ts`, static in `authService.ts`).

For the stated target audience — spec 01 §03: *"Do not assume all students have
high-end phones, unlimited bandwidth"* — a 431 KB gzipped main bundle plus a
855 KB gzipped syllabus chunk on first subject open is a material defect, not a
warning to ignore.

---

## 4. Feature classification

Legend: ✅ COMPLETE · 🟡 PARTIAL · 🔴 BROKEN · 📄 DOCUMENTED-ONLY · ❌ MISSING · ⛔ BLOCKED

### 4.1 Foundation

| Feature | Status | Evidence |
|---|---|---|
| Install / run / build | ✅ | §3 above |
| Route architecture + guards | ✅ | `app/routes.tsx`, `app/guards.tsx` — 44 routes, loading state handled |
| Error boundary | ✅ | `app/ErrorBoundary.tsx` |
| Design tokens (colour/typography/spacing/radius/shadow/motion) | ✅ | `index.css` `:root` + `tailwind.config.js` — fully centralised, CSS-variable sourced. §53/§54 satisfied |
| Light-glass material system (5 levels) | ✅ | `--glass-subtle/standard/elevated/floating/modal-bg` at 0.42→0.94 white alpha, blur 16→48px, 3 shadow tiers. Genuinely translucent, **not** opaque white cards (§50 satisfied) |
| No dark theme / no neon / no RGB / no cyberpunk | ✅ | `color-scheme: light`; background `#eef0fb`; accent `#5b6ef0`; semantic colours explicitly "muted, never neon". Zero violations found (§46/§47 satisfied) |
| No giant 3D / particles / animated blobs | ✅ | `.bb-environment` is 3 static radial gradients + 1 linear; `AppLayout` adds a 5%-opacity static campus wash. No 3D libs in `package.json` (§48 satisfied) |
| No emoji as UI icons | ✅ | Full scan: 0. Icons are lucide-react vectors + generated PNG glyphs (§61/§102 satisfied) |
| Reduced motion | ✅ | `hooks/useReducedMotion.ts` (reactive matchMedia) + `index.css:435` media query + consumed in `BottomNav` (§60 satisfied) |
| Safe-area insets | ✅ | 8 correct `env(safe-area-inset-*)` usages incl. `BottomNav.tsx:127` `pb-[max(env(safe-area-inset-bottom),10px)]` (§55 satisfied) |
| Self-hosted fonts, no CDN | ✅ | Sora (600–800) + Plus Jakarta Sans (400–700), `font-display: swap`, preloaded |
| Desktop max-width | ✅ | `main` capped at `max-w-2xl` (§66 satisfied) |
| Automated test suite | ❌ | No runner, no tests. Spec 18 is a 4,163-line QA specification |

### 4.2 Auth, profile, identity

| Feature | Status | Evidence |
|---|---|---|
| Multi-step registration UI | ✅ | `RegisterPage.tsx` (436 lines), 4 steps: Account → Academic → Profile → Review, `Stepper.tsx` |
| Zod validation | ✅ | `auth/validation.ts` — email, phone 10–15 with regex, password ≥8 + letter + digit, confirm match |
| Required fields vs spec 04 §5.2 | 🟡 | **Terms/privacy acceptance is absent** — `grep -n "terms|privacy|accept|agree|checkbox" RegisterPage.tsx` returns nothing. Spec 04 §5.2 lists "acceptance of terms/privacy policy" as a minimum field. `/privacy` page exists but is never linked from registration |
| Password policy enforced at service boundary | 🟡 | Both `mockAuthService.register` and `supabaseAuthService.register` check **only `password.length < 8`**. The letter+digit rule exists only in the client Zod schema → violates §85 *"Do not treat frontend validation as a security boundary"* |
| Real Supabase Auth adapter | ✅ (code) ⛔ (unverified) | `backend/supabaseAuth.ts` — `signInWithPassword`, `signUp` with metadata, `signOut`, `resetPasswordForEmail`, `persistSession`+`autoRefreshToken`. Cannot be executed: no project credentials |
| Session restore / no flash | ✅ | `AuthProvider` bootstrap + guard loading state |
| Logout | ✅ | Clears session token only |
| Profile page + edit modals | ✅ | `ProfilePage.tsx` (306), `EditProfileModal`, `EditAcademicModal`, `AvatarPickerModal` |
| Profile image upload | ✅ | `ProfileImagePicker.tsx` — canvas re-encode to WebP, max edge 1280, q0.85. `lib/media.ts` validates **MIME not extension** (§11 satisfied) |
| Generated character avatars by gender | ✅ | 6 assets (`male_01..03`, `female_01..03`), `auth/avatars.ts`, `AvatarPickerModal` |
| Ownership enforced in backend | 🟡 | Mock scopes by userId at read time; Supabase has RLS. But `profileService` has **no Supabase adapter**, so in the hybrid mode profile edits would not persist to Supabase at all |

### 4.3 Academic content

| Feature | Status | Evidence |
|---|---|---|
| Course → branch → semester → subject hierarchy | ✅ | Data-driven from `seed_academic.json`; **1 course, 30 branches, 8 semesters, 1,749 subjects**. No hardcoded per-branch JSX (§15 satisfied) |
| Dependent selection (course→branch→semester) | ✅ | `study/ContextPicker.tsx`, `syllabusService.availableSemesters()` derives from real data, not a hardcoded 1–8 range (§18 satisfied) |
| Subject detail + L/T/P + credits | ✅ | `Subject` type carries `credits`, `type`, `L`, `T`, `P`; `getSyllabus` computes totalCredits/theoryCount/labCount |
| Detailed syllabus (units + topics + books) | 🟡 | **1,286 of 1,749 subjects (73.5%)** have syllabus via id-match (1,168) or code-match fallback (1,284). **463 subjects have none.** Detail map = 1,253 entries; by-code map = 937. Detail preserved, not summarised (§20 satisfied where data exists) |
| Syllabus unit titles | 🟡 | **752 of 4,233 units (17.8%) have the generic title `"Unit"`**; 23 units have empty topics. §19 says "avoid generic placeholder cards" |
| Syllabus topic search within subject | ✅ | `SubjectDetailPage.tsx:49-54` filters units/topics by query |
| **Global search over syllabus topics** | ❌ | `searchService.build()` indexes subjects, PYQs, quizzes, approved resources, notices, gov exams, portals — **syllabus topics are not indexed at all.** §21 requires "Search should locate syllabus topics and return their parent paper and academic context" |
| PYQ discovery + metadata | ✅ | **363 papers, 2013–2025, 8,831 questions, 3,263 blocks.** Year, semester, code, exam_title, full_marks, time, question_count, block_count all present (§23 satisfied) |
| PYQ data integrity | ✅ **verified** | meta↔detail: **0 orphans both directions**; `block_count` matches actual blocks for **all 363**; `question_count` sum (8,831) equals actual subquestion count (8,831). Excellent |
| PYQ gaps | 🟡 | 3 papers have null `code`; **37 have null `semester`**; 3 have null `year`. Must render gracefully (§17) |
| PYQ LaTeX handling | 🟡 | **3,189 of 23,692 PYQ text fields (13.5%)** contain LaTeX. `lib/text.ts` `cleanMath()` strips delimiters and maps ~20 macros + `\text/\mathrm/\mathbf/\mathit`, `\frac{a}{b}`→`(a)/(b)`. **Correctly applied at all 6 render points** in `PyqDetailPage` (instructions, block title, subquestion text, smart-search context, options). Residual: `\sqrt` (104), `\sin` (166), `\cos` (111) are not in MACROS so render as bare `sqrt`/`sin`/`cos` after the generic backslash-strip. Acceptable-but-degraded; the file itself notes KaTeX can replace it later |
| PYQ file/PDF access | 📄 | PYQs are stored as **structured question text**, not PDF files. §24 (PDF access via storage, public/private rules) is therefore not applicable as written — but the *spec* assumes files. Conflict to resolve with owner |
| Yearly academic calendar | 🔴 **fabricated** | `mock/seed_calendar.ts` states in its own header: *"The source dataset's holidays_2026 was empty, so this is a representative 2026 academic-year set to exercise the UI."* Verified: `apna_beu_extracted_data.json` → `holidays_2026: dict len=0`. The 12 events (exam dates, holidays, deadlines) are **invented**. Violates §17 *"Never fabricate academic data"* and §22 *"preserve its actual dates"* — though §"data conflict" (document instead of silently changing) was honoured in the code comment |
| Duplicate calendar source | 🔴 | `mock/seed_content.ts` `SEED_EVENTS` is a **second, competing** calendar (3 events) with the *same* dates for "Mid-semester exams begin" (2026-09-15) and "Assignment submission deadline" (2026-09-10). `HomePage` + `CalendarPage` use `calendarService`; `dashboardService.listUpcomingEvents()` is called by nobody. Violates §22 "clear source of truth" |
| Notices | 🔴 fabricated | 3 hardcoded notices in `seed_content.ts` with invented 2026 dates. Rendered on `HomePage` as real content |

### 4.4 Quiz engine

| Feature | Status | Evidence |
|---|---|---|
| Server-authoritative scoring boundary | ✅ | `quizService` computes score on `submitAttempt`, never in UI. `toPublic()` strips `correct_index`/`correct_indices`/`explanation` → `PublicQuestion`. §31 satisfied in the mock boundary |
| Answer keys hidden during attempt | ✅ | `getAttemptQuestions()` returns `PublicQuestion[]` only |
| Immutable attempt snapshot | ✅ | `question_ids` fixed at `startAttempt` |
| Idempotent submit | ✅ | Resubmit returns cached result |
| Resume in-progress attempt | ✅ | `findActiveAttempt`, state `initialized|in_progress` |
| Negative marking, marks/question, expiry, auto-submit | ✅ | All in the attempt record + `isExpired()` |
| Randomised pool | ✅ | Fisher–Yates over `question_ids`, sliced to `pick_count` |
| Full attempt lifecycle UI | ✅ | `QuizHomePage`, `QuizDetailPage`, `AttemptPage` (471), `ResultPage` (303), `ReviewPage`, `HistoryPage` |
| Result card download | ✅ | `ResultPage.downloadCard()` — deterministic 1080×1350 canvas PNG, **no email/phone/private data** (§33/§97 satisfied). Uses `system-ui` not Sora/Plus Jakarta (minor brand inconsistency) |
| **Question bank volume** | 🔴 **critical** | **92 questions / 45 quizzes**, covering **9 subject codes out of 1,224** and **45 of 4,233 syllabus units (1.06%)**. `docs/QUIZ_MCQ_GENERATION_PROMPT.md` mandates **≥40 questions per theory unit** (rich units 80–120). Required scale is ~170,000 questions; present is 92 |
| Question type mix | 🔴 | **92/92 are `type: 'single'`** (100%). Required: ~80% single, 5% true/false, 8% assertion–reason, 7% multiple-correct. `types/domain.ts` supports `multi`/`truefalse`/`assertion_reason`; `correctOf()` handles them; UI supports them. **Engine ready, content absent** |
| Difficulty distribution | 🟡 | Actual easy 35 (38%) / medium 47 (51%) / hard 10 (11%). Required 30 / 45 / 25. Hard is badly under-represented |
| PYQ-derived questions | ❌ | `pyq` flag: **0 of 92**. Spec supports `type: 'pyq'` quizzes |
| Explanations | ✅ | 92/92 have explanations; 92/92 `verified: true` |
| **Supabase seed: mixed quizzes** | 🔴 **BROKEN** | See Defect **D1** — all 9 `*_mixed` quizzes seed with **zero** questions |
| Question type enum mismatch | 🔴 latent | DB check constraint allows `('single','multiple','true_false')`; TS domain allows `'single'|'multi'|'truefalse'|'assertion_reason'`. Adding `assertion_reason` content would fail the DB check |

### 4.5 Resources, moderation, reports, support

| Feature | Status | Evidence |
|---|---|---|
| Student resource upload | ✅ | `UploadResourcePage.tsx` (235), `AttachmentPicker`, MIME+size validation (8 MB default), image canvas re-encode, edit route `/resources/edit/:id` |
| Client cannot self-approve | ✅ | `resourceService.create` forces `status:'pending'`; any owner `update()` **resets to `pending`** and clears the moderation note (§34/§98 satisfied) |
| Moderation state machine | ✅ | `pending → approved/rejected/changes_requested/archived`, with owner notification on each transition |
| Trust labels distinct | ✅ | `adminMeta.ts` `RESOURCE_STATUS_LABEL` + `RESOURCE_STATUS_TONE` |
| Approved-only public listing | ✅ | `listPublished()` filters `status === 'approved'` |
| Ownership enforcement | ✅ | `update`/`remove` no-op on `owner_id` mismatch |
| Admin resource queue UI | ✅ | `AdminResourcesPage.tsx` (298) |
| Reports (content/bug) | ✅ | `reportService` with owner-scoped `listMine` + global `listAll` queue, 9 target types, 8 reasons, 4 statuses, optional screenshot attachment, `MyReportsPage`, `AdminReportsPage` (185) |
| Report status moderation | ✅ | `setStatus` + admin UI |
| Private support threads | ✅ | `supportService` — every read/write scoped to `userId`; `getThread` returns `undefined` for another user's conversation (§38/§39 satisfied at the mock boundary) |
| Support categories | ✅ | 7 categories exactly as §95 contemplates (bug, content_correction, missing_resource, feature_request, account, feedback, other) |
| Unread state + notifications | ✅ | `unreadForUser`, `markThreadRead`, notification on developer reply |
| **Developer/admin replies** | 🔴 **MISSING** | There is **no admin support inbox**. `grep -rn "supportService\."` shows only student-side callers. Developer replies exist solely as `scheduleAutoReply()` — a `setTimeout(…, 4000)` canned message with `sender_id: 'developer'`. §40 requires verifying "the developer can reply and that the same student can receive the reply". A human cannot reply today. Spec 12 §35/§37 require a Developer Message System + Admin Message Composer |
| Moderation audit trail | 📄 | SQL has `resource_moderation_actions` + `audit_logs` tables. Mock records nothing (§94) |
| **Role gating at service boundary** | 🔴 | `resourceService.moderate()`, `resourceService.listQueue()`, `reportService.listAll()`, `reportService.setStatus()` take **no role/user argument and perform no check**. Comments say "role-gated" but only `RequireAdmin` in the router enforces it. Violates §20 *"Never rely on frontend-only authorization"* and §36. (In pure-mock this is contained — all data is in the same browser — but the pattern will carry into the adapter if copied) |

### 4.6 Search, tools, notifications, PWA

| Feature | Status | Evidence |
|---|---|---|
| Internal search | ✅ | `searchService` — client-side index over 7 published sources, token scoring with position weighting (prefix 3 / word-start 2 / substring 1) + title boost 4, limit 30, `warm()` preheat, `invalidate()`. Idle/typing/loading/results/no-results states in `SearchPage.tsx` (171). No SQL from user input (§25/§26 satisfied) |
| Search privacy | ✅ | Indexes only published content; pending/rejected resources and private messages excluded by construction (§99 satisfied) |
| Google external search | ✅ | `smartSearch.googleQuery()` → `level + subject + topic + question`, `encodeURIComponent`, `noopener,noreferrer` (§27/§82 satisfied) |
| YouTube external search | ✅ | `youtubeQuery()` → `level + subject + topic + 'lecture'` — contextual, not the homepage (§28 satisfied) |
| AI/ChatGPT prompt | ✅ | 7 task templates (explain, exam_answer, notes, example, hinglish, quiz, viva) built from real context. **Honestly handles the prefill limitation**: opens `chatgpt.com/?q=` *and* copies the prompt, with the comment "The external interface may not accept the prefill… never fake submission" (§29/§109 satisfied) |
| No private data in external queries | ✅ | Verified — `StudyContext` carries only academic fields; no email/phone/id/token (§99 satisfied) |
| Study assist sheet | ✅ | `SmartSearchSheet.tsx` — prompt preview + copy, glass, no AI-theme styling |
| Student Toolbox | ✅ | **15 tools**, all implemented: CGPA, SGPA, GPA Target, Percentage, Marks, Attendance, Exam Countdown, Pomodoro, Scientific, Unit Converter, Age, Date Diff, QR, Password, Text Formatter. `ToolboxRouter` maps all 15 slugs; unknown slug → redirect. Search + 3 groups + tinted tiles |
| Calculator formula transparency | ✅ | e.g. `AcademicTools.tsx:180` states *"(CGPA − 0.75) × 10 approximation — your university…"* (§42 satisfied: formulas explained, approximation disclosed) |
| QR uses `qrcode` lib | ✅ | `UtilityTools.tsx:504` `QRCode.toCanvas`, download as PNG |
| Portals / Gov exams / Colleges / Results | ✅ | `ToolsPage`, `PortalsPage`, `GovExamsPage`, `GovExamDetailPage`, `CollegesPage`, `ResultsPage`. Data: **21 gov exams, 13 portals, 37 colleges** from real JSON |
| Bookmarks / saved / recently viewed | ✅ | `bookmarkService`, `SavedPage` (228), `recentlyViewedService`, `useRecordView`, `BookmarkButton` |
| In-app notification centre | ✅ | `notificationService` + `NotificationsPage` (276) + `NotificationCenter` (205), 6 categories, per-category user preferences honoured in `push()`, `system` always delivered, read/unread/clear/remove |
| Notification privacy | ✅ | Bodies contain no private message content — e.g. "You have a new reply in your developer support conversation" (§96 satisfied) |
| OS local notifications | ✅ | `requestNotificationPermission`, `showLocalNotification` via SW registration |
| **Web Push** | ❌ | `sw.js` has `push` + `notificationclick` handlers; SQL has a `push_subscriptions` table. But `grep -rn "pushManager|applicationServerKey|VAPID" src/` → **nothing**. No subscription is ever created or sent to a backend. Honestly commented ("a real VAPID/push subscription is added with Supabase"). §43 satisfied on honesty, feature absent |
| PWA manifest | ✅ | Complete: name/short_name/id/start_url/scope, `display: standalone` + `display_override`, orientation, theme+background `#eef0fb`, 4 icons incl. 2 maskable, **3 screenshots** (2 narrow + 1 wide) with labels, **4 shortcuts** with icons, `launch_handler`, categories (§44 satisfied) |
| Service worker | ✅ | `sw.js` — versioned shell + runtime caches, network-first navigations with `/offline.html` fallback, stale-while-revalidate for static assets, GET-only, same-origin-only, `SKIP_WAITING` message handling, old-cache cleanup on activate |
| SW update lifecycle | ✅ | `registerSW.ts` — `updatefound`/`waiting` surfacing, `applyUpdate()`, single reload on `controllerchange`. **Correctly skips registration in DEV** to avoid stale preview |
| Install banner | ✅ | `InstallBanner.tsx` with `beforeinstallprompt` + `appinstalled` |
| Splash screen | ✅ | `SplashScreen.tsx` (249) + `useSplash` + 14 quotes, deterministic `dayOfYear() % QUOTES.length`, shuffle button, skip-today. Uses `/assets/mascot.png` |
| Splash asset weight | 🟡 | Loads **`mascot.png` (656 KB)** while `mascot.webp` (152 KB) exists unused — 4.3× heavier on the critical startup path. §63 says keep startup short |

### 4.7 Admin panel

| Feature | Status | Evidence |
|---|---|---|
| Admin home (ops hub) | ✅ | `AdminHomePage.tsx` — role badges, live pending counts, 2 queue links. Honestly states *"The client guard is a convenience, never the authority"* |
| Resource moderation | ✅ | `AdminResourcesPage.tsx` |
| Reports moderation | ✅ | `AdminReportsPage.tsx` |
| Admin route protection | 🟡 | `RequireAdmin` checks `roles` from session; roles come from the account record (mock) or `user_roles` table (Supabase, no client write policy). Correct design — but see the service-boundary gap above |
| **Admin student directory** | ❌ | §37 and spec 12 §38/§39 require it. No route, no page, no service method |
| **Content CMS** | ❌ | `grep` for `createCourse|updateSubject|publishSyllabus|upsertCalendar|createQuiz|contentService|cmsService` → **nothing**. Spec 12 §13/§15/§17/§26/§31/§41/§42 (syllabus, calendar, PYQ, quiz, notices, course, subject management) are entirely unimplemented |
| **Support inbox / composer** | ❌ | Spec 12 §35/§37 |
| Audit log UI | ❌ | Spec 12 §57/§58; SQL tables exist |
| Analytics | ❌ | Spec 12 §99–103 |
| Bulk import / validation | 📄 | `build_seed.mjs` exists as an offline generator, not an admin feature (spec 12 §43/§44) |
| 2FA, admin password policy, session security | ❌ | Spec 12 §87–89 |

**Scale context:** spec 12 alone has **128 numbered sections**; the admin
implementation is **3 pages**. This is the widest single gap in the project.

---

## 5. Defect register (prioritised)

### D1 — 🔴 CRITICAL · Supabase seed silently empties all 9 "mixed" quizzes

**Where:** `supabase/build_seed.mjs:105-118` → `supabase/seed/seed_data.sql`

**Evidence:** `seed_quiz_meta.json` has 45 quizzes referencing **184**
(quiz, question) pairs, but only **92 distinct question ids** — every question
is shared by exactly 2 quizzes (a per-unit `practice` quiz and a `_mixed` quiz).
The generator emits one `quiz_questions` row per *reference* while keying the
primary key on the *question* alone:

```js
insert into public.quiz_questions (id, quiz_id, …)
values (md5('<qid>')::uuid, md5('<quizId>')::uuid, …) on conflict (id) do nothing;
```

`id` is the PK. The second reference for each question conflicts and is
**silently dropped**. Because the unit quizzes precede the mixed quizzes in the
source array, the mixed quizzes lose every question:

```
quiz_100104_mixed   loses 12 of 12      quiz_100212_mixed   loses 10 of 10
quiz_105302_mixed   loses 11 of 11      quiz_105406_mixed   loses 10 of 10
quiz_100103_mixed   loses 10 of 10      quiz_119601_mixed   loses 10 of 10
quiz_100102_mixed   loses 10 of 10      quiz_105305_mixed   loses  9 of  9
quiz_100203_mixed   loses 10 of 10      → 9 of 45 quizzes affected
```

The same flaw propagates to `quiz_options` (736 emitted, keyed `md5(qid:oi)`).

**Impact (traced through the actual SQL, not assumed):** after
`psql -f seed_data.sql`, a mixed quiz has **zero** rows in `quiz_questions`.

- `start_quiz_attempt(p_quiz)` still succeeds — it only checks
  `quizzes.status = 'published'` and inserts an attempt row. It does **not**
  verify the quiz has questions, and it does not snapshot question ids.
- The student is presented with an empty question set.
- `submit_quiz_attempt` grades via
  `select q.id from quiz_questions q where q.quiz_id = v_att.quiz_id and q.version = v_att.quiz_version`
  → **0 iterations**, so `v_total = v_max = 0`, and inserts a result row:
  `total_questions 0, raw_score 0, max_score 0, percentage 0, passed false`
  (both guarded by `case when v_max > 0 … else 0/false`).
- The attempt is marked `submitted` and appears in history as a legitimately
  completed **0%** result.

So the failure is silent twice over: no exception is raised, and the student is
recorded as having failed a quiz they were never shown a question from. It is
invisible in the mock, which resolves questions by id at runtime and is
therefore correct.

**Why it matters now:** it is exactly the class of failure §117 forbids claiming
completeness over, and it would ship the moment anyone flips `VITE_BACKEND`.

**Fix (smallest coherent change):** make the row identity per-(quiz, question)
— `md5('<quizId>:<qid>')` for `quiz_questions.id` and `md5('<quizId>:<qid>:<oi>')`
for `quiz_options.id` / `question_id`. Regenerate with `node supabase/build_seed.mjs`.

**Also harden the function** so this class of bug can never be silent again —
`start_quiz_attempt` should refuse to create an attempt for a published quiz
that has no questions at `current_version`:

```sql
if not exists (select 1 from public.quiz_questions
               where quiz_id = p_quiz and version = v_quiz.current_version) then
  raise exception 'quiz has no questions' using errcode = 'P0002';
end if;
```

Then extend `supabase/tests/02_quiz_scoring.sql` to assert every published quiz
has `count(quiz_questions) = pick_count` for all 45 quizzes.

### D2 — 🔴 CRITICAL · 16 of 17 services have no Supabase adapter

**Where:** `src/services/*.ts` (all except `authService.ts`)

**Evidence:** the table in §2. `getSupabase()` is referenced nowhere outside
`src/services/backend/`.

**Impact:** `VITE_BACKEND=supabase` yields a hybrid — Supabase Auth plus
localStorage for profile, academic content, syllabus, PYQ, quizzes, resources,
reports, support, notifications, bookmarks, recents, settings, tools. Student
data would not persist across devices and none of the 35 tables / 78 RLS
policies / 12 security functions would be exercised.

**Fix:** implement adapters behind the existing boundary, one service at a
time, in dependency order (see plan P2). The 35-table schema and `types/domain.ts`
already agree closely, so this is mapping work, not design work.

### D3 — 🔴 HIGH · Academic calendar and notices are fabricated

**Where:** `src/services/mock/seed_calendar.ts` (12 events),
`src/services/mock/seed_content.ts` (3 notices + 3 duplicate events)

**Evidence:** the file header admits it; `apna_beu_extracted_data.json`
`holidays_2026` is `{}` (verified). Dates such as "End-semester examinations
2026-12-07 → 2026-12-22" and "Odd semester result declaration 2027-01-20" are
invented but presented to students as real.

**Impact:** direct violation of §17 and §22. A student who trusts an invented
exam date is materially harmed. This is the highest *user-harm* defect in the
repo even though it is not a crash.

**Fix (two parts, in this order):**
1. Immediately mark the data as unverified in the UI — a visible "Sample
   calendar — official dates not yet published" notice on `CalendarPage` and on
   the Home "Upcoming" section. Small, reversible, honest. Do **not** delete the
   events (they exercise the UI and §"preserve previous work" applies).
2. Resolve properly once the owner supplies the real BEU academic calendar
   (⛔ BLOCKED on external data). Then replace `SEED_ACADEMIC_EVENTS` from that
   source and delete the duplicate `SEED_EVENTS`.

### D4 — 🔴 HIGH · Quiz content is ~0.05% of the specified volume

**Where:** `src/services/mock/seed_quiz_questions.json` (92),
`seed_quiz_meta.json` (45); contract in `docs/QUIZ_MCQ_GENERATION_PROMPT.md`

**Evidence:** §4.4. 9 subject codes of 1,224; 45 units of 4,233 (1.06%); 100%
single-choice; 0 PYQ-derived.

**Impact:** the quiz feature is architecturally complete and functionally
empty. A student in any branch other than the 9 covered codes sees an empty
quiz list.

**Fix:** this is a **content-generation programme**, not a code change. The repo
already ships the generator contract (`docs/QUIZ_MCQ_GENERATION_PROMPT.md`, 330
lines) and the per-branch syllabus exports (`syllabus_export/*.json`, 31 files)
plus `build_quiz_seed.py`. Run the documented pipeline branch-by-branch. Do not
hand-write questions and do not fabricate (§17). Recommend starting with the
highest-enrolment branches and gating each batch on the doc's own quality rules.

### D5 — 🔴 HIGH · Web Push is not wired

**Where:** `src/services/notificationService.ts`, `public/sw.js`,
`supabase/migrations/0004` (`push_subscriptions`)

**Evidence:** SW `push`/`notificationclick` handlers exist; table exists; no
`pushManager.subscribe`, no VAPID key, no endpoint to store subscriptions.

**Impact:** §43 — only in-app and local OS notifications work. A student who
closes the tab receives nothing.

**Fix:** requires a VAPID keypair and a server-side sender (Supabase Edge
Function). ⛔ BLOCKED on credentials/infrastructure decision. Interim: keep the
honest in-app model and state the limitation in docs (§115).

### D6 — 🟡 MEDIUM · Admin authority is frontend-only in the mock

**Where:** `resourceService.moderate/listQueue`, `reportService.listAll/setStatus`

**Evidence:** §4.5. No role argument, no check; comments assert "role-gated".

**Impact:** contained today (single-browser localStorage), but violates §20/§36
as a pattern and will be copied into adapters if not corrected.

**Fix:** add an explicit `actor: { id, roles }` parameter to privileged service
methods and assert the required role inside the service — mirroring what
`is_admin()` / `has_permission()` do in SQL. Cheap now, expensive later.

### D7 — 🟡 MEDIUM · No route-level code splitting; 8.96 MB JS

**Evidence:** §3. `routes.tsx` statically imports all 44 route components.

**Fix:** `React.lazy` + `Suspense` per route (or per feature folder), fix the
`mock/hash.ts` ineffective dynamic import, and move the three seed JSONs out of
the JS graph — serve them as static `/data/*.json` and `fetch()` them, so they
are cacheable, streamable and not re-parsed by the bundler. Target: main chunk
< 250 kB raw.

### D8 — 🟡 MEDIUM · Registration missing terms/privacy acceptance

**Evidence:** §4.2. Spec 04 §5.2 lists it as a minimum field.

**Fix:** add a required checkbox in `RegisterPage` step 0 (or the Review step)
linking to `/privacy`, plus a field in `accountStepSchema`. Small, self-contained.

### D9 — 🟡 MEDIUM · Password policy not enforced at the service boundary

**Evidence:** §4.2. Only `length < 8` server-side; letter+digit is Zod-only.

**Fix:** move the full policy into a shared validator used by both adapters (and
ideally a DB constraint / Supabase Auth password policy).

### D10 — 🟡 MEDIUM · 752 syllabus units titled `"Unit"`; 137 units carry a concatenated-dump first topic

**Evidence:** §4.3. Measured: 752/4,233 (17.8%) generic titles in
`seed_syllabus_detail.json`, 537/3,328 in `by_code`; 23 units with empty topics;
137 units where `topics[0]` is a `"Unit 1.0: …"` paragraph that duplicates the
concatenation of the remaining topics.

**Impact:** §19 "avoid generic placeholder cards"; §20 detail quality. This is
an **upstream extraction defect**, so per the master prompt it must be
*documented*, not silently rewritten.

**Fix:** correct it in the extractor (`build_syllabus_detail.py`) and regenerate,
so the source of truth stays the extraction — not a hand-patched JSON. Where a
title is genuinely absent, derive `"Unit N"` from `unit_index` rather than
showing the bare word "Unit". Where `topics[0]` duplicates the rest, drop it.

### D11 — 🟡 LOW · 7.5 MB dead assets

**Evidence:** `public/assets/icons2/` is **28 files, byte-identical to
`public/assets/icons/`, referenced by nothing** (4.8 MB). Plus
`appicon-src.png` (1.2 MB), `dev-character-2.png` (1.5 MB),
`dev-character-2.webp` (40 KB) — all unreferenced. `mascot.webp` (152 KB)
exists but `SplashScreen` loads `mascot.png` (656 KB).

**Fix:** delete `icons2/` and the 3 unused files; switch splash to
`mascot.webp`. −7.5 MB repo, −504 KB on the splash critical path.

### D12 — 🟡 LOW · Attachments stored as data URLs in localStorage

**Where:** `lib/media.ts` (`Attachment.dataUrl`), `storage.ts`

**Evidence:** 8 MB max file size, base64 inflates ~1.33×, and `store.set`
**silently swallows quota exceptions**. A single large PDF upload can exceed the
~5 MB localStorage budget and fail *silently* — the resource appears saved.

**Fix (mock):** cap attachment size much lower for data-URL storage, and make
`store.set` return a boolean so callers can surface a real error (§70).
**Fix (real):** the Supabase adapter stores object paths + signed URLs, as
`media.ts` already documents.

### D13 — 🟡 LOW · Spec conflicts requiring an owner decision (document, don't guess)

| Conflict | Doc A | Doc B | Current code |
|---|---|---|---|
| Avatar bucket visibility | 04: *"Profile photos should not automatically become public resources"* | 21: *"If avatars are intentionally public, store only what is necessary and document that visibility"* | `avatars` bucket **public**; write/update/delete scoped to `auth.uid()` folder. Documented in the SQL header, so 21 is arguably satisfied; 04 is not |
| PYQ delivery | 24 assumes PDF files behind storage rules | — | PYQs are structured question text in JSON; no PDFs exist |
| Registration steps | 07 §18 lists Personal / Academic / Profile / **Security** | 04 §5.2 lists password inside the field set | 4 steps: Account (incl. password) / Academic / Profile / Review |
| Calendar source | 01 §10 requires admin-editable structured events | — | Hardcoded TS constant; no CMS |

### D14 — 🟡 LOW · No automated tests

**Evidence:** §3. Spec 18 is a 4,163-line QA/release-engineering specification.
The only executable tests are 4 hand-run SQL files requiring a scratch
PostgreSQL 15+.

---

## 6. What is genuinely, verifiably good (preserve — do not rebuild)

The master prompt warns against replacing working architecture. Specifically:

1. **The adapter boundary design** (`services/backend/config.ts` + service-layer
   indirection) is correct and is the right seam for D2. Extend it; don't redesign it.
2. **The Supabase schema** — 35 tables, RLS on all 35, 78 policies, answer keys
   isolated behind `public_quiz_options`, `uq_attempt_active` partial unique
   index, `SECURITY DEFINER` scoring functions, no client write policy on
   `user_roles`. This is a serious, spec-aligned security design.
3. **The design token system** — centralised CSS variables, 5-level glass,
   3 shadow tiers, full type scale, motion tokens with named easings, and a
   Tailwind config that resolves *everything* from those variables.
4. **`BottomNav`** — SVG-path notched cradle with a shared spring driving both
   bubble and dip, `ResizeObserver`-measured, reduced-motion aware, safe-area
   padded, light frosted glass. Directly satisfies §55/§56.
5. **Quiz security model in the mock** — keys stripped at the service boundary,
   immutable snapshots, idempotent submit, resume support.
6. **`lib/media.ts`** — MIME-based (not extension-based) validation with canvas
   re-encoding, which defeats extension spoofing.
7. **PYQ dataset integrity** — 363/363 with matching block and question counts,
   zero orphans. Verified numerically.
8. **`lib/iconCache.ts`** — boot-time decode warming to eliminate icon flicker,
   with `requestIdleCallback` so it never blocks first paint.
9. **Honesty discipline in comments** — the code repeatedly labels its own
   limitations (mock hashing, SW dev skip, ChatGPT prefill, VAPID absent,
   fabricated calendar). This is exactly what §117 demands and should be kept.

---

## 7. Blockers (require owner action — §119.11)

| # | Blocker | Needed from owner |
|---|---|---|
| B1 | **No Supabase project credentials.** `.env.example` is empty; no `.env` committed (correct). Nothing in `supabase/` has ever executed. | Project URL + anon key to verify D2 adapters; DB URL to run migrations and the 4 SQL test files |
| B2 | **Real BEU academic calendar does not exist in the dataset** (`holidays_2026` empty). | Official calendar document or structured dates, to resolve D3 |
| B3 | **Quiz content generation is an LLM + review programme** at ~170k-question scale. | Decision on scope/priority per branch, and who verifies academic accuracy (§17 forbids fabrication; generated MCQs need subject review) |
| B4 | **Web Push needs a VAPID keypair and a server sender.** | Decision: implement push (Edge Function + keys) or formally scope it out and update spec 16 |
| B5 | **Admin/CMS scope is 128 spec sections vs 3 built pages.** | Prioritisation — which CMS modules are launch-critical |
| B6 | **Avatar bucket visibility conflict (D13).** | Ruling: public-by-design (document per spec 21) or private + signed URLs (spec 04) |
| B7 | **463 subjects have no syllabus; PYQs are text not PDFs.** | Confirm whether the missing 26.5% exists in another source, and whether PDF papers are expected |

---

## 8. Prioritised continuation plan

Ordering follows §118: *stabilize → understand → secure → core data flows →
unfinished features → visual/perf polish.* The project is already stable and
understood, so the sequence starts at "secure".

### P0 — Make the two silent data-corruption defects impossible (½ day)

| # | Task | Where | Why first | Verify |
|---|---|---|---|---|
| P0.1 | Fix D1: composite quiz-question identity `md5(quizId:qid)` / options `md5(quizId:qid:oi)`; regenerate seed | `supabase/build_seed.mjs:105-118` → `supabase/seed/seed_data.sql` | Silent data loss on the real backend; the fix is ~4 lines and unblocks every later Supabase test | `node supabase/build_seed.mjs`; assert 184 `quiz_questions` + 736 `quiz_options` distinct ids; add a test asserting `count(questions) = pick_count` for all 45 quizzes |
| P0.2 | Add the assertion to `supabase/tests/02_quiz_scoring.sql` | `supabase/tests/` | Turns D1 into a regression test | Run against scratch PostgreSQL 15+ per `supabase/README.md` |
| P0.3 | Fix D3 step 1: visible "sample / unverified" labelling on calendar + home Upcoming | `features/study/CalendarPage.tsx`, `features/home/HomePage.tsx` | Stops real students trusting invented exam dates — highest user-harm item | Visual check at 375px and 1440px; confirm label appears in both places |
| P0.4 | Delete D11 dead assets; switch splash to `mascot.webp` | `public/assets/icons2/`, 3 files, `SplashScreen.tsx:143` | Zero-risk −7.5 MB repo / −504 KB startup | `npm run build`; confirm splash renders; confirm no 404s in the network log |

### P1 — Close the authorisation and validation boundary gaps (1 day)

| # | Task | Where | Why | Verify |
|---|---|---|---|---|
| P1.1 | D6: add `actor: {id, roles}` + role assertion to `resourceService.moderate/listQueue`, `reportService.listAll/setStatus` | `services/resourceService.ts`, `services/reportService.ts`; callers in `features/admin/*` | §20/§36 — never frontend-only authority. Must be fixed *before* adapters are written so the pattern is inherited | Unit-check that a `['student']` actor is rejected; admin UI still works for the demo admin |
| P1.2 | D9: shared password-policy validator used by both auth adapters | new `services/backend/passwordPolicy.ts`; `authService.ts`, `backend/supabaseAuth.ts` | §85 — frontend validation is not a security boundary | Attempt register with `12345678` → rejected at service level, not just in the form |
| P1.3 | D8: terms/privacy acceptance checkbox + schema field | `features/auth/RegisterPage.tsx`, `features/auth/validation.ts` | Spec 04 §5.2 minimum field | Register flow blocked until checked; `/privacy` link works |
| P1.4 | D12: `store.set` returns success; surface quota failure; lower data-URL cap | `services/storage.ts`, `lib/media.ts`, `UploadResourcePage.tsx` | §70 — silent failure is worse than an error | Upload an oversized PDF → explicit error, not a phantom success |

### P2 — Build the Supabase adapter layer, dependency-ordered (the main effort)

Do these in order; each is independently shippable and each must keep the mock
path working (`VITE_BACKEND=mock` must remain the zero-config default).

| # | Service | Depends on | Notes |
|---|---|---|---|
| P2.1 | `profileService` | auth (done) | `profiles` + `student_profiles`; RLS already written |
| P2.2 | `academicService`, `syllabusService` | — | Read-only: `courses`/`branches`/`semesters`/`subjects`/`syllabus`/`syllabus_versions`. Move the 5 MB JSON out of the bundle at the same time (D7) |
| P2.3 | `calendarService`, `dashboardService` | — | Also resolves the duplicate-source half of D3 |
| P2.4 | `pyqService` | academic | `pyqs` table; lazy detail load |
| P2.5 | `quizService` | academic | **Highest value** — activates `start_quiz_attempt`, `save_quiz_answer`, `submit_quiz_attempt`, `public_quiz_options`. Directly delivers real §31 server-authoritative scoring |
| P2.6 | `resourceService` + storage upload | profile | `resources` bucket (private) + signed URLs + `moderate_resource()` |
| P2.7 | `reportService` | profile | `reports` + `audit_logs` |
| P2.8 | `supportService` | profile | `support_conversations`/`support_messages`; **also build the admin inbox (P3.2)** |
| P2.9 | `notificationService`, `bookmarkService`, `recentlyViewedService`, `settingsService` | profile | Straightforward table mappings |

**Verify each:** run with `VITE_BACKEND=supabase` against a real project; trace
UI → service → DB → RLS → response → UI (§5); test loading/success/empty/failure;
confirm a second student cannot read the first student's rows by changing an id.

### P3 — Missing features, ordered by student value

| # | Task | Where | Why |
|---|---|---|---|
| P3.1 | **Syllabus-topic search** (§21) | `services/searchService.ts` — add a syllabus source, returning parent subject + branch + semester context | Explicit spec requirement, currently absent; the data already exists in `seed_syllabus_detail.json` |
| P3.2 | **Admin support inbox + composer** (§40, spec 12 §35/§37) | new `features/admin/AdminSupportPage.tsx`, route `/admin/support`, `supportService.listAllForStaff()` + `replyAsDeveloper()` | Without it "developer replies" is a `setTimeout`; the feature is fiction today |
| P3.3 | **Admin student directory** (§37, spec 12 §38/§39) | new `features/admin/AdminStudentsPage.tsx`, route `/admin/students` | Required admin view; expose only name/course/branch/semester/email/contact/status/timestamps — never tokens |
| P3.4 | **Notices CMS** (spec 12 §31/§32) | `dashboardService` + admin page | Removes the last fabricated home content (D3) |
| P3.5 | D7 route-level code splitting + JSON→static fetch | `app/routes.tsx`, `vite.config.ts`, `services/*` | §83; the audience explicitly includes low-bandwidth phones |
| P3.6 | D10 syllabus title/topic cleanup **in the extractor** | `build_syllabus_detail.py` → regenerate both JSONs | Keeps the extraction as source of truth (§"document conflicts, don't silently change source") |
| P3.7 | D4 quiz content programme | `syllabus_export/*.json` + `docs/QUIZ_MCQ_GENERATION_PROMPT.md` + `build_quiz_seed.py` | Largest effort, largest student value; blocked on B3 |
| P3.8 | Remaining CMS modules, audit-log UI, analytics | per spec 12 | Blocked on B5 prioritisation |

### P4 — Test + polish (only after P0–P3)

1. Add a test runner (vitest) + component/service tests — none exist (D14).
2. Execute the real user flows in a browser (§110–112): register → pick
   branch → open subject → read syllabus → open PYQ → take quiz → download card
   → upload resource → moderate as admin → message support → receive reply.
   At 375px and 1440px. Record loading/empty/error for each.
3. Run the 4 SQL security tests against scratch PostgreSQL 15+.
4. Resolve the 7 lint warnings properly (not by suppression).
5. Result-card typography: load Sora/Plus Jakarta for the canvas export so the
   downloaded PNG matches the brand.

---

## 9. Explicit non-goals for the next session

Per the master prompt's FINAL EXECUTION DIRECTIVE — do **not**:
redesign the homepage; replace the app with a template; create a second
architecture; delete imperfect previous work; introduce dark theme / RGB / neon
/ giant 3D / emoji icons; fabricate academic content, credentials, auth,
persistence, admin authority or messaging; treat a screenshot as production
readiness.

---

## 10. Summary scorecard

| Area | Verdict |
|---|---|
| Builds, lints, runs | ✅ Verified |
| Visual language (light premium glass) | ✅ Compliant — no violations found |
| Design system / tokens / motion / a11y primitives | ✅ Strong |
| Student-facing feature breadth | 🟡 Broad and mostly wired, on the mock |
| Academic dataset (PYQ, syllabus, taxonomy) | ✅ Real and internally consistent (73.5% syllabus coverage) |
| Academic dataset (calendar, notices) | 🔴 Fabricated — must be labelled or replaced |
| Quiz **engine** | ✅ Correct and secure at the service boundary |
| Quiz **content** | 🔴 92 questions vs ~170k required |
| Supabase schema design | ✅ Strong (35 tables, RLS everywhere, 78 policies) |
| Supabase **integration** | 🔴 1 of 17 services wired; never executed |
| Supabase **seed correctness** | 🔴 D1 silently empties 9 quizzes |
| Admin panel | 🔴 3 of ~128 spec sections |
| Authorisation at service boundary | 🔴 Frontend-only in the mock |
| PWA | 🟡 Manifest + SW complete; Web Push absent |
| Tests | 🔴 None for the frontend; 4 manual SQL files |
| Performance | 🔴 8.96 MB JS, no route splitting |

**Overall:** a well-architected, visually compliant, honestly-documented
frontend sitting on a correct-but-never-executed backend design, with real
academic data for syllabus/PYQ and fabricated data for calendar/notices. The
work is **not** a demo and should not be rebuilt. The critical path is
P0 → P1 → P2.5 (quiz adapter) → P3.2/P3.3 (admin inbox + student directory).
