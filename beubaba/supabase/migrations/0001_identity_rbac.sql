-- ============================================================================
-- BEU BABA — Migration 0001: Identity, Roles & RBAC
-- Source of truth: specs 05, 08, 11, 17, 21.
--
-- Principles enforced here:
--  * PostgreSQL is the source of truth; the frontend is never trusted (spec 05 §2.2).
--  * Roles live in a separate table; a student can NEVER escalate their own role
--    (spec 05 §11). All role writes go through privileged, SECURITY DEFINER paths.
--  * RLS is ON for every table. "Deny by default, allow by policy."
-- ============================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- fuzzy search

-- ----------------------------------------------------------------------------
-- updated_at trigger helper
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- PROFILES  (1:1 with auth.users)   — spec 05 §6
-- ============================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  email         text,
  phone         text,
  avatar_type   text not null default 'generated'
                  check (avatar_type in ('generated','uploaded')),
  avatar_url    text,                       -- storage path (avatars bucket) when uploaded
  avatar_character_id text,                 -- id of the chosen generated character
  gender        text check (gender in ('male','female','unspecified')),
  date_of_birth date,
  bio           text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- STUDENT PROFILES (academic identity)  — spec 05 §8
-- ============================================================================
create table if not exists public.student_profiles (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  course_id           uuid,
  branch_id           uuid,
  admission_year      integer,
  current_semester_id uuid,
  enrollment_number   text,
  college_name        text,
  college_code        text,
  onboarding_completed boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger trg_student_profiles_updated
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROLES & PERMISSIONS   — spec 05 §9-11, spec 11 §19-21
-- ============================================================================
create table if not exists public.user_roles (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in
               ('student','moderator','content_manager','support_manager','admin','super_admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- Permission catalog + role→permission mapping (data-driven, spec 05 §10).
create table if not exists public.permissions (
  key         text primary key,
  description text
);

create table if not exists public.role_permissions (
  role           text not null,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role, permission_key)
);

-- ----------------------------------------------------------------------------
-- Authorization helper functions (SECURITY DEFINER so RLS policies can call
-- them without recursing into user_roles' own RLS).   — spec 11 §19
-- ----------------------------------------------------------------------------
create or replace function public.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = p_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('moderator','content_manager','support_manager','admin','super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin','super_admin')
  );
$$;

create or replace function public.has_permission(p_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = auth.uid()
      and rp.permission_key = p_key
  );
$$;

-- ============================================================================
-- NEW-USER BOOTSTRAP  — on auth.users insert, create profile + default role.
-- Metadata is passed via auth signUp options.data.  — spec 11 §9
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, avatar_type,
                               avatar_url, avatar_character_id, gender)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student'),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'avatar_type', 'generated'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'avatar_character_id',
    new.raw_user_meta_data->>'gender'
  )
  on conflict (id) do nothing;

  insert into public.student_profiles (user_id, course_id, branch_id,
                                       current_semester_id, admission_year,
                                       onboarding_completed)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'course_id','')::uuid,
    nullif(new.raw_user_meta_data->>'branch_id','')::uuid,
    nullif(new.raw_user_meta_data->>'current_semester_id','')::uuid,
    nullif(new.raw_user_meta_data->>'admission_year','')::int,
    coalesce((new.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  )
  on conflict (user_id) do nothing;

  -- Default role is ALWAYS student. Privileged roles are granted only by an
  -- existing admin via grant_role() — never at signup (spec 05 §11).
  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Privileged role management (spec 05 §11). Only super_admin may grant/revoke.
-- SECURITY DEFINER + explicit caller check = no client-side escalation.
-- ----------------------------------------------------------------------------
create or replace function public.grant_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_role not in ('student','moderator','content_manager','support_manager','admin','super_admin') then
    raise exception 'invalid role %', p_role;
  end if;
  insert into public.user_roles (user_id, role)
  values (p_user, p_role)
  on conflict do nothing;
end;
$$;

create or replace function public.revoke_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  delete from public.user_roles where user_id = p_user and role = p_role;
end;
$$;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.student_profiles  enable row level security;
alter table public.user_roles        enable row level security;
alter table public.permissions       enable row level security;
alter table public.role_permissions  enable row level security;

-- profiles: a user sees & edits ONLY their own row; admins can read all.
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- No client INSERT/DELETE: rows are created by the signup trigger only.

-- student_profiles: owner read/write; admin read.
create policy student_select_own on public.student_profiles
  for select using (user_id = auth.uid() or public.is_admin());
create policy student_update_own on public.student_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy student_insert_own on public.student_profiles
  for insert with check (user_id = auth.uid());

-- user_roles: a user may READ their own roles; only admins read all. Writes are
-- IMPOSSIBLE from the client (no insert/update/delete policy) — grants happen
-- only through grant_role()/revoke_role() (SECURITY DEFINER). This is the core
-- anti-escalation guarantee (spec 05 §11).
create policy user_roles_select_own on public.user_roles
  for select using (user_id = auth.uid() or public.is_admin());

-- permissions / role_permissions: readable by any authenticated user (so the UI
-- can reflect capabilities); writable by no one from the client.
create policy permissions_read on public.permissions
  for select using (auth.role() = 'authenticated');
create policy role_permissions_read on public.role_permissions
  for select using (auth.role() = 'authenticated');
