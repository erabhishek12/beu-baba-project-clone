# CURRENT_FEATURE_MATRIX.md

**BEU BABA — Phase 0 deliverable** (blueprint §45 PHASE 0)
**Date:** 2026-09-04 · **Commit audited:** `e408801` · **Blueprint:** BEU-BABA-MASTER-01 v2.0

Every row was verified by reading the implementation, not by looking at a screen.
Status key: ✅ COMPLETE · 🟡 PARTIAL · 🔴 BROKEN · ❌ MISSING · ⛔ BLOCKED · 📄 SCHEMA-ONLY (exists in SQL, not wired)

---

## 1. Student — Core (blueprint §2)

| Feature | Status | Where / evidence |
|---|---|---|
| Authentication (signup/login/logout) | 🟡 | `features/auth/*`, `services/authService.ts`. Works on **mock only**; Supabase adapter written but never executed (⛔ no credentials) |
| Session restoration | ✅ | `app/providers/AuthProvider.tsx` bootstrap + `app/guards.tsx` loading state — no content flash |
| Password reset | 🟡 | `ForgotPasswordPage.tsx`; mock is a no-op stub, Supabase path calls `resetPasswordForEmail` (unverified) |
| Academic profile | ✅ | `features/profile/*`, `ProfilePage` + 3 edit modals |
| Avatar / profile image | ✅ | `ProfileImagePicker.tsx` (canvas WebP re-encode), 6 generated characters |
| Home / dashboard | ✅ | `features/home/HomePage.tsx` — greeting, quick actions, Explore, Notices, Upcoming |
| Courses | 🟡 | Data has **1 course** (B.Tech) — real, not a bug, but the "Courses" domain is thin |
| **Classes / Modules / Chapters / Lessons** | ❌ | Not in the taxonomy. Current hierarchy is course → branch → semester → **subject** → unit → topic. Blueprint §20 assumes Program → Branch → Year → Semester → Subject → Unit → Topic (matches), but §2/§30 also list modules/chapters/lessons (do not exist) |
| Notes | ❌ | No notes feature. `resources` covers student uploads |
| PYQs | ✅ | **363 papers, 8,831 questions, 3,263 blocks**, 2013–2025. Integrity verified: 0 orphans, counts match |
| Syllabus | 🟡 | **1,286 / 1,749 subjects (73.5%)**. 4,233 units. 463 subjects have none |
| Academic calendar | ⛔ | Intentionally emptied — fabricated dates removed per owner directive. **BLOCKED on real BEU calendar data** |
| Notices | ⛔ | Intentionally emptied — same reason. **BLOCKED on real data** |
| Universal search | 🟡 | `services/searchService.ts` — 7 sources indexed. **Syllabus topics NOT indexed** (blueprint §7 requires them) |
| Bookmarks | ✅ | `services/bookmarkService.ts`, `features/saved/SavedPage.tsx` |
| Recent activity | ✅ | `services/recentlyViewedService.ts`, `features/saved/useRecordView.ts` |
| Progress | 🟡 | Quiz history + topic accuracy only. No `progress` / `study_sessions` / `study_goals` tables wired |
| Notifications (in-app) | ✅ | `services/notificationService.ts`, `NotificationsPage`, `NotificationCenter`, per-category preferences |
| Developer support | 🟡 | Student side ✅. **No admin inbox — a human cannot reply**; replies are a `setTimeout` canned message |
| PWA | 🟡 | Manifest + SW + install banner ✅ complete. **Web Push ❌** (no VAPID, no `pushManager.subscribe`) |

## 2. Student — Learning / Quiz (blueprint §15–19)

| Feature | Status | Where / evidence |
|---|---|---|
| Quiz engine | ✅ | `services/quizService.ts` — server-authoritative boundary, keys stripped via `toPublic()` |
| Question bank | 🔴 | **92 questions / 45 quizzes**, 9 subject codes of 1,224. **26,342 new questions staged in `mcq_import/`, not imported** |
| Timer | ✅ | `AttemptPage.tsx`, `expires_at`, auto-submit |
| Question navigator | ✅ | `AttemptPage.tsx:373` grid with answered/marked states |
| Mark for review | ✅ | `AttemptPage.tsx:129-256` |
| Random question order | ✅ | `pickQuestions()` Fisher–Yates |
| **Random option order** | ❌ | No shuffle of `options`. Blueprint §16 requires it (optional) with attempt mapping preserved |
| Configurable marks / negative marks | 🟡 | Present in data (`marks_per_question`, `negative_marking`) and scoring; **no admin UI to configure** |
| Explanations | ✅ | `ReviewPage.tsx` |
| Results | ✅ | `ResultPage.tsx` |
| Topic analytics | ✅ | `result.topics` with accuracy + "Topics to revise" |
| **Difficulty analytics** | ❌ | `QuizResult` has no per-difficulty breakdown (blueprint §17 requires it) |
| Weak-area engine | 🟡 | Only `accuracy < 60` filter in `ResultPage`. No `weak_topics` persistence, no cross-quiz tracking (blueprint §13/§33) |
| Shareable result card | ✅ | `ResultPage.downloadCard()` — 1080×1350 canvas PNG, no private data |
| **PDF result** | ❌ | PNG only. Blueprint §17 requires PNG **and** PDF |
| Retry / review | ✅ | `ReviewPage`, `HistoryPage` |
| Question types | 🟡 | `single` + `multi` render correctly. `truefalse` / `assertion_reason` work **as single-choice** — no dedicated UI. DB check constraint allows only `('single','multiple','true_false')` → **`assertion_reason` would be rejected by the schema** |

## 3. Student — Toolbox (blueprint §2, §10–12)

| Feature | Status | Where |
|---|---|---|
| CGPA / SGPA / GPA target / Percentage / Marks / Attendance | ✅ | `features/tools/toolbox/AcademicTools.tsx` |
| Unit converter / Scientific / Age / Date diff / QR / Password / Text formatter | ✅ | `UtilityTools.tsx` |
| Pomodoro / Exam countdown | ✅ | `ProductivityTools.tsx` |
| **OCR** | ❌ | Not present. Blueprint §10 |
| **Translator** | ❌ | Not present. Blueprint §11 |
| Portals / Gov exams / Colleges / Results | ✅ | 13 portals, 21 gov exams, 37 colleges — real extracted data |

**15 tools implemented, 2 required tools missing.**

## 4. Student — Intelligent study / Practice / Focus / External (blueprint §8, 12, 13, 14, 26)

| Feature | Status |
|---|---|
| AI chatbot | ❌ MISSING |
| 500+ intent catalog | ❌ MISSING |
| Natural-language navigation | ❌ MISSING |
| Floating assistant + context auto-hide | ❌ MISSING |
| Mascot (chibi assistant) | 🟡 `public/assets/mascot.webp` exists and is used on the splash screen, but there is no assistant behaviour |
| Math Mind (5 adaptive levels) | ❌ MISSING |
| Revision Center | ❌ MISSING |
| Memory Match / Quick Focus / Number-Pattern | ❌ MISSING |
| Doubt Desk / JavaSourceCode / Study Hub | ❌ MISSING — grep across `src/` finds none. `external_links.json` (85 links) is extracted source data, mostly `t.me/mindsnapps` + `beu-bih.ac.in`, and does not contain these three |
| Smart external search (Google / YouTube / ChatGPT) | ✅ `services/smartSearch.ts` + `SmartSearchSheet.tsx` — 7 AI task templates, no private data leaked. **This exists and is good, but is not the chatbot the blueprint describes** |

## 5. Admin platform (blueprint §3 — 30 listed modules)

| Module | Status | Module | Status |
|---|---|---|---|
| Dashboard | ✅ | Question bank | ❌ |
| Students | ❌ | Quiz builder | ❌ |
| Roles / permissions | 📄 SQL only | Quiz analytics | ❌ |
| Courses | ❌ | Resource submissions | ✅ |
| Modules / Chapters / Lessons | ❌ | Moderation | ✅ |
| Notes | ❌ | Reports | ✅ |
| PYQs | ❌ | Announcements | ❌ |
| Syllabus | ❌ | Banner management | ❌ |
| Calendar | ❌ | Notifications | 🟡 service only, no UI |
| Notices | ❌ | Support inbox | ❌ |
| JSON import center | ❌ | Import validation / duplicates / preview | ❌ |
| Content versioning | 📄 `syllabus_versions` in SQL | Audit logs | 📄 `audit_logs` in SQL, no UI |
| Analytics | ❌ | Storage / file management | 📄 5 buckets in SQL |
| Settings / feature flags | ❌ | | |

**Admin: 4 of 30 modules implemented** (`AdminHomePage`, `AdminResourcesPage`, `AdminReportsPage` + role badges).

## 6. Platform / non-functional

| Area | Status | Evidence |
|---|---|---|
| Build / lint / typecheck | ✅ | `npm run build` exit 0, `npm run lint` 0 errors |
| Design tokens + light glass system | ✅ | `src/index.css` `:root`, 5 glass levels, `tailwind.config.js` fully variable-sourced |
| No dark / neon / RGB / cyberpunk / 3D / emoji icons | ✅ | Verified by scan — 0 violations |
| Reduced motion | ✅ | `hooks/useReducedMotion.ts` + CSS media query |
| Safe areas | ✅ | 8 correct `env(safe-area-inset-*)` uses |
| Responsive mobile bottom nav | ✅ | `BottomNav.tsx` — SVG notched cradle, spring, 5 items. **Blueprint §5.5 wants Home \| Courses \| Quiz \| Progress \| Profile; current is Home \| Study \| Quiz \| Tools \| Profile** |
| Desktop sidebar | ❌ | Single `max-w-2xl` column at all widths. Blueprint §5.5 requires a glass sidebar + multi-column dashboard on desktop |
| Typography | 🟡 | **Conflict:** blueprint §5.4 recommends Manrope + Inter; the app ships self-hosted **Sora + Plus Jakarta Sans** |
| Performance | 🔴 | 8.96 MB JS, no route-level code splitting |
| Accessibility | 🟡 | Semantic controls, aria labels, focus states present. Not audited against a screen reader; no automated a11y test |
| Automated tests | ❌ | No runner, no tests. 4 hand-run SQL files |
| Database schema | ✅ designed / ⛔ unexecuted | 35 tables, RLS on all 35, 78 policies, 12 SECURITY DEFINER functions, 5 buckets |

---

## Summary counts

| | ✅ | 🟡 | 🔴 | ❌ | ⛔ | 📄 |
|---|---|---|---|---|---|---|
| Student core | 9 | 7 | 0 | 3 | 2 | 0 |
| Quiz / learning | 10 | 4 | 2 | 3 | 0 | 0 |
| Toolbox | 10 | 0 | 0 | 2 | 0 | 0 |
| Intelligent / practice / focus | 1 | 1 | 0 | 9 | 0 | 0 |
| Admin (30 modules) | 4 | 1 | 0 | 21 | 0 | 4 |
| Platform | 8 | 3 | 1 | 3 | 1 | 0 |

The **student academic app is largely built**. The **intelligent-study layer, the
admin CMS, and the Supabase integration are largely not built**.
