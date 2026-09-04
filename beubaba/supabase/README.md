# BEU BABA — Backend (Supabase)

This directory contains the complete, production-shaped backend for BEU BABA:
a PostgreSQL schema, Row-Level Security (RLS) policies, server-authoritative
functions, storage buckets, and a data importer for the real BEU dataset.

The frontend talks to the backend **only through the service layer**
(`src/services/*`). A single adapter boundary (`src/services/backend/`) swaps
between the local mock and Supabase via env flags — no UI changes required.

---

## What's here

```
supabase/
├── migrations/
│   ├── 0001_identity_rbac.sql        Profiles, student profiles, roles,
│   │                                  permissions, RBAC helpers, signup trigger,
│   │                                  anti-escalation role management.
│   ├── 0002_academic_content.sql     Courses, branches, semesters, subjects,
│   │                                  syllabus (+versions), calendar, notices, PYQs.
│   ├── 0003_quiz_engine.sql          Quizzes, questions, options (secret keys),
│   │                                  attempts, answers, results + SERVER-SIDE
│   │                                  scoring functions + safe options view.
│   ├── 0004_community_support.sql    Resources + moderation, reports, private
│   │                                  support threads, notifications, product
│   │                                  data (toolbox/gov-exams/portals/colleges),
│   │                                  bookmarks, recents, settings, audit logs.
│   └── 0005_permissions_storage.sql  Permission catalog + role→permission map,
│                                      storage buckets + storage RLS.
├── seed/
│   ├── seed_data.sql                 Generated: full real academic + product data.
│   └── seed_admin.sql                Promote an existing account to admin.
├── tests/                            SQL that proves the security guarantees.
├── build_seed.mjs                    Regenerates seed_data.sql from the dataset.
└── README.md                         This file.
```

---

## Security model (enforced in the database, not the client)

The specs require the database to be the source of truth and to treat the
browser as hostile. These guarantees are enforced by RLS + `SECURITY DEFINER`
functions and are covered by `tests/`:

- **No role escalation.** `user_roles` has no client write policy at all. A
  student's attempt to insert `role = 'super_admin'` is rejected by RLS. Roles
  are granted only through `grant_role()` / `revoke_role()`, which check
  `is_super_admin()` internally. *(spec 05 §11)*
- **Server-authoritative quiz scoring.** The correct-answer flag lives on
  `quiz_options.is_correct` and is **never** selectable by students (no read
  policy for the base table). Students read option labels through the
  `public_quiz_options` view, which omits `is_correct`. Grading happens in
  `submit_quiz_attempt()`, which reads the answer key server-side and writes an
  immutable `quiz_results` row. Students cannot insert a result directly.
  *(spec 15)*
- **Private support threads.** A student can read only their own
  `support_conversations` / `support_messages`. *(spec 05 §7)*
- **Moderation before publish.** Resources default to `pending`; only
  `approve_resources` holders (via `moderate_resource()`) can publish, and the
  action is written to `resource_moderation_actions` + `audit_logs` and notifies
  the owner. *(spec 01 §17, spec 14)*
- **Private files.** The `resources` / `support-attachments` / `admin-assets`
  buckets are private; access is via server-issued signed URLs after the DB
  confirms permission. *(spec 05 §29–32)*
- **Version integrity.** A quiz attempt stores `quiz_version`; grading reads the
  matching question version, so historical attempts stay reproducible after
  admins edit questions. *(spec 15)*

---

## Setup

### 1. Create the schema
Using the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase db push          # applies everything in migrations/ in order
```

Or apply directly with psql (order matters):

```bash
for f in supabase/migrations/*.sql; do psql "$SUPABASE_DB_URL" -f "$f"; done
```

### 2. Load the dataset

```bash
node supabase/build_seed.mjs                       # regenerate (optional)
psql "$SUPABASE_DB_URL" -f supabase/seed/seed_data.sql
```

This loads 1 course, 30 branches, 8 semesters, 1749 subjects, ~1168 syllabus
versions, 363 PYQs, 45 quizzes / 92 questions / 368 options, 21 government exams,
13 portals and 37 colleges — the same real dataset the mock uses, with stable
UUIDs so deep links keep working.

### 3. Create + promote an admin
1. Sign up normally through the app (or the Supabase Auth dashboard).
2. Edit the email in `seed/seed_admin.sql`, then:
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/seed/seed_admin.sql
   ```

### 4. Point the app at Supabase
Copy `.env.example` to `.env` and set:

```
VITE_BACKEND=supabase
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Rebuild/restart. With `VITE_BACKEND` unset or `mock`, the app runs entirely on
the local mock (default) and the preview keeps working with no backend.

---

## Running the security tests locally

The tests run against any PostgreSQL 15+ using a tiny Supabase compatibility
shim (defines `auth.uid()`, `storage.objects`, roles). They prove the four core
guarantees: hidden answer keys, server-side scoring (right & wrong), private
support threads, and blocked role escalation.

```bash
# with a scratch database running on port 5432:
psql "$DB" -f supabase/tests/00_local_shim.sql
for f in supabase/migrations/*.sql; do psql "$DB" -f "$f"; done
psql "$DB" -f supabase/tests/01_rls_security.sql
psql "$DB" -f supabase/tests/03_privacy_and_scoring.sql
```

Expected: `PASS: escalation blocked`, `PASS: grant_role blocked`,
`rows_visible_to_student = 0`, correct answer → 100% / passed, wrong answer →
0% / failed, cross-student reads → 0.
