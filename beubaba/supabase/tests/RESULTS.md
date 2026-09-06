# SQL SECURITY TEST RESULTS (Phase 2 evidence)

**Run:** 2026-09-04 (UTC) · **Engine:** PostgreSQL 17.11 (local scratch cluster `/tmp/bbpg:5433`)
**Harness:** `00_local_shim.sql` → migrations `0001…0005` → `00_platform_grants.sql` →
`01_rls_security.sql` → `02_quiz_scoring.sql` → `03_privacy_and_scoring.sql`
**Every step exited 0. Full raw log reproducible with the commands in §Repro.**

> `00_platform_grants.sql` emulates the Supabase platform's default table grants
> (present automatically on real Supabase projects). Without it a bare cluster
> fails on table ACLs before RLS is ever evaluated. `auth.*` stays un-granted,
> exactly like production.

## Blueprint §Phase 2 required security tests

| Required test | Result | Evidence |
|---|---|---|
| Cross-user isolation | ✅ PASS | student1 sees **0** of student2's support conversations and **0** of their messages (`03_privacy_and_scoring.sql`) |
| Role escalation prevention | ✅ PASS | self-insert into `user_roles` rejected: *"PASS: escalation blocked (new row violates row-level security policy)"*; `grant_role()` by non-super-admin: *"PASS: grant_role blocked (not authorized)"* (`01_rls_security.sql` TEST 3–4) |

## Additional assertions verified in the same run

| Assertion | Result |
|---|---|
| Student cannot read secret `is_correct` via base table (`quiz_options`) | ✅ 0 rows visible |
| Student CAN read option labels via safe view, view exposes no `is_correct` | ✅ labels only |
| Trusted scoring: correct answer → `correct=1, 100.00%, passed=t` | ✅ |
| Trusted scoring: wrong answer → `correct=0, 0.00%, passed=f` | ✅ |
| All 5 migrations apply cleanly on a fresh DB | ✅ 0 errors |
| RLS enabled on 35/35 tables; 78 policies; 11 SECURITY DEFINER functions all pin `set search_path = public` | ✅ (see `PROJECT_AUDIT.md` §3) |

## Repro

```bash
bash /home/user/bootstrap.sh            # starts PG17 scratch cluster on :5433
P="sudo -n -u postgres psql -h 127.0.0.1 -p 5433"
$P -c "drop database if exists bb_test;" -c "create database bb_test;"
S="$P -d bb_test -v ON_ERROR_STOP=1"
cd /home/user/repo/beubaba
for f in supabase/tests/00_local_shim.sql supabase/migrations/000*.sql \
         supabase/tests/00_platform_grants.sql supabase/tests/0[123]*.sql; do
  $S -f "$f" || echo "FAIL $f"
done
```

## Still ⛔ blocked (not failures)

Live Supabase integration (real auth emails, storage uploads, realtime, Web Push
VAPID) cannot be exercised without project credentials — none are invented.

---

# PHASE 3B RE-VALIDATION + NEW FINDINGS (2026-09-04)

**Engine:** PostgreSQL 17.11 (Debian), fresh cluster at `/tmp/bbpg:5433`, database `bb2`/`bb3`.
**Applied:** `00_local_shim.sql` → migrations `0001…0007` → `00_platform_grants.sql` → tests `01…05`.
**All migrations applied to a FRESH database with 0 errors.** 49 tables, 88 policies,
**0 tables without RLS**.

## Re-validation of the earlier claims
Every assertion previously recorded in this file was re-run and **still passes**
(no regression from 0006/0007): answer key hidden, safe view exposes labels only,
correct → 100%/passed, wrong → 0%/failed, cross-student support reads = 0,
role escalation blocked, `grant_role()` blocked.

## NEW: privilege-escalation defects found by probing (`04_privilege_escalation.sql`)
These paths were **not covered** by tests 01–03, so they passed while the holes were open.

| # | Severity | Defect | Before fix | After 0006 |
|---|---|---|---|---|
| V1 | CRITICAL | `resources_update_own` let an owner set `status='approved'` — self-publishing unmoderated content, bypassing `moderate_resource()` | `UPDATE 1` → status `approved` | stays `pending` ✅ |
| V2 | CRITICAL | `support_msg_insert` never constrained `sender_role`; a student could post as `'developer'` — forging official support replies | `INSERT 0 1`, row reads `developer` | `ERROR: not authorized to post as developer` ✅ |
| V3 | HIGH | `support_conv_update` let the owning student set `priority` / `status` / `assigned_to` | `priority='urgent'`, `status='resolved'` | stays `normal`, `assigned_to` null ✅ |
| V4 | MEDIUM | `profiles_update_own` let a user write `is_active` (undoing an admin suspension) and `email` (drifting from `auth.users`) | `is_active=f`, `email='hacked@x.com'` | both unchanged ✅ |

Confirmed **already safe** (no change needed): fake `quiz_results` insert ✗,
fake `quiz_attempts` insert ✗, direct `quiz_answers` write ✗, notification for
another user ✗, anon read of `profiles` → 0 rows, cross-user bookmarks → 0 rows.

## NEW: banner frequency engine (`05_banner_frequency.sql`)
Server-side enforcement via `next_eligible_banner()` / `record_banner_impression()`:

- `n_times=3` banner served exactly **3×**, then automatically fell through to the
  next-priority banner — ledger shows `seen_count = 3`.
- `once_ever` banner served exactly **1×** — ledger shows `seen_count = 1`.
- 5th request returned **0 rows** (both exhausted).
- **Per-user proven:** a second student saw the 3-times banner fresh while
  student 1 was exhausted.
- Expired banner (`expires_at` in the past) never returned.
- Student SELECT on raw `banners` → **0 rows** (targeting stays private).
- Student cannot write `banner_impressions` directly (no INSERT policy).

## Calendar 2026 validation
`BEU_Holiday_Calendar_2026.json` was parsed and checked: 28 entries, all dates
valid and in 2026, **all 28 weekday labels match the real 2026 calendar**,
5 multi-day ranges whose `holiday_days` correctly exclude Sundays
(1–30 Jun = 30 − 4 = 26 ✓, 8–16 Nov = 9 − 2 = 7 ✓, 25–31 Dec = 7 − 1 = 6 ✓,
17–20 Oct = 4 − 1 = 3 ✓) and `sum(holiday_days) = 65`, matching the sheet's own
`official_total`. Seeded via `seed/seed_calendar_2026.sql` — applied twice,
row count stayed **28** (idempotent).

## Application checks
`tsc -b` → exit 0. `vite build` → success. `oxlint` → **0 errors** (10 pre-existing
warnings, untouched). Dev server boots and serves the new calendar data.

## Still ⛔ blocked (not failures)
Live Supabase integration (real auth emails, storage uploads, realtime, Web Push
VAPID) cannot be exercised without project credentials — none are invented.
Storage policies are validated **statically only**: the local shim's
`storage.objects` is a plain table, so bucket ACL behaviour is unverified.
