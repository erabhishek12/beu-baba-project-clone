-- Emulates the Supabase platform's DEFAULT privilege model for local testing.
-- On real Supabase projects these grants exist automatically (anon /
-- authenticated / service_role receive table grants in the public schema);
-- RLS policies then decide row-level access. A bare PostgreSQL cluster has no
-- such defaults, so without this file every test dies on table ACLs before
-- RLS is ever evaluated. Run AFTER the migrations, BEFORE the test files.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
-- NOTE: auth.* stays un-granted, exactly like production Supabase (clients
-- reach auth data only through auth.uid()/views/functions, never raw tables).
grant usage on schema storage to anon, authenticated, service_role;
grant all on all tables in schema storage to anon, authenticated, service_role;
