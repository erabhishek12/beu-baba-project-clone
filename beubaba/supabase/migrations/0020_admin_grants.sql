-- ============================================================================
-- 0020 — MISSING TABLE GRANT ON question_quarantine
--
-- BUG
-- ---
-- 0008 enabled RLS on public.question_quarantine and added an admin policy:
--     create policy quarantine_admin ... using (public.is_admin())
-- …but never issued a table-level GRANT to `authenticated`.
--
-- In PostgreSQL the GRANT is checked BEFORE row-level policies. With no grant,
-- the policy is unreachable, so even a super admin got:
--     42501  permission denied for table question_quarantine
--
-- Confirmed live: is_admin() returned true for the super admin, yet the SELECT
-- still failed — proving it was the grant, not the policy.
--
-- The RLS policy is unchanged and still does the real work: only admins match
-- it, so granting SELECT to `authenticated` does NOT expose quarantined rows to
-- students. Verified after applying: a normal student still receives 0 rows.
--
-- Idempotent: safe to re-run.
-- ============================================================================

grant select on public.question_quarantine to authenticated;

-- Admins may also resolve a quarantined row (mark reviewed / change status).
grant insert, update, delete on public.question_quarantine to authenticated;

select 'MIGRATION 0020 COMPLETE' as status;
