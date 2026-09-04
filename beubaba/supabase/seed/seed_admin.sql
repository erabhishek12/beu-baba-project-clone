-- ============================================================================
-- BEU BABA — Promote an existing account to administrator (spec 05 §11)
--
-- Roles are NEVER granted from the client. Run this ONCE, as the database owner
-- (service role), against a user who has already SIGNED UP through the app.
--
-- 1) Create the account normally in the app (or Supabase Auth dashboard).
-- 2) Replace the email below with that account's email.
-- 3) Run:  psql "$SUPABASE_DB_URL" -f supabase/seed/seed_admin.sql
-- ============================================================================
do $$
declare
  v_email text := 'admin@beubaba.app';   -- <-- change to your admin's email
  v_uid   uuid;
begin
  select id into v_uid from auth.users where email = v_email;
  if v_uid is null then
    raise exception 'No auth user with email %. Sign up first, then re-run.', v_email;
  end if;

  insert into public.user_roles (user_id, role) values
    (v_uid, 'super_admin'),
    (v_uid, 'admin'),
    (v_uid, 'content_manager'),
    (v_uid, 'moderator'),
    (v_uid, 'support_manager')
  on conflict do nothing;

  raise notice 'Granted admin roles to % (%).', v_email, v_uid;
end $$;
