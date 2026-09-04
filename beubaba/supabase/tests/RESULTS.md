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
