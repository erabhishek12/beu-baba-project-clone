-- ============================================================================
-- 0016 — ONE-FILE CONTENT SYNC (syllabus / PYQ / calendar)
--
-- GOAL
-- ----
-- Upload one JSON file and have the database match it exactly:
--   * rows in the file that are new      -> INSERTED
--   * rows in the file that changed      -> UPDATED
--   * rows NOT in the file               -> DELETED
--
-- That last rule is what makes it a true "sync" rather than an "import", and
-- it is also the dangerous one, so:
--
--   1. Every function is DRY RUN by default. It reports what WOULD change and
--      touches nothing until you pass p_dry_run => false.
--   2. Deletes are SCOPED. A syllabus file for one branch can only ever delete
--      that branch's rows — never another branch's. Scope comes from the file
--      itself, so a partial file cannot wipe the database.
--   3. A refusal guard: if a run would delete more than 60% of the existing
--      rows in scope it aborts, unless p_allow_mass_delete => true. This stops
--      an empty or truncated upload from destroying content.
--   4. Every run writes an audit_logs entry.
--
-- Reviewer/admin only — assert_can_review() gates all three.
-- Idempotent: safe to re-run. Running the same file twice changes nothing.
-- ============================================================================

-- Upsert targets. These tables had no unique key, so a re-upload would have
-- created duplicates instead of updating. Added here, safely.
create unique index if not exists subjects_branch_code_uidx
  on public.subjects (branch_id, code);
create unique index if not exists syllabus_subject_uidx
  on public.syllabus (subject_id);
create unique index if not exists pyqs_subject_year_session_uidx
  on public.pyqs (subject_code, exam_year, coalesce(exam_session, ''));
create unique index if not exists calendar_start_title_uidx
  on public.academic_calendar_events (starts_on, title);

-- ------------------------------------------------------------- helper ------
create or replace function public._sync_guard(
  p_delete int, p_existing int, p_allow boolean)
returns void
language plpgsql
immutable
as $$
begin
  if p_allow then return; end if;
  if p_existing >= 10 and p_delete::numeric / greatest(p_existing, 1) > 0.60 then
    raise exception
      'refusing to delete % of % rows (>60%%). Re-run with allow_mass_delete if this is intended.',
      p_delete, p_existing
      using errcode = 'P0001';
  end if;
end $$;

-- ------------------------------------------------------------ SYLLABUS -----
/**
 * Expected JSON:
 * {
 *   "type": "syllabus",
 *   "branch_code": "CSE",
 *   "subjects": [
 *     { "subject_code": "100101", "subject_name": "Mathematics-I",
 *       "semester": 1, "credits": 4,
 *       "units": [ { "title": "Unit 1 — Calculus", "topics": ["Limits","Derivatives"] } ] }
 *   ]
 * }
 *
 * Scope of deletion: subjects of THIS branch only.
 */
create or replace function public.sync_syllabus(
  p_payload jsonb,
  p_dry_run boolean default true,
  p_allow_mass_delete boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_branch_code text := p_payload->>'branch_code';
  v_branch uuid;
  v_ins int := 0; v_upd int := 0; v_del int := 0; v_existing int := 0;
  v_deleted_codes text[];
begin
  perform public.assert_can_review();

  if v_branch_code is null then
    raise exception 'branch_code is required' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_payload->'subjects') <> 'array' then
    raise exception 'subjects must be an array' using errcode = 'P0001';
  end if;

  select id into v_branch from public.branches where code = v_branch_code;
  if v_branch is null then
    raise exception 'unknown branch_code: %', v_branch_code using errcode = 'P0002';
  end if;

  create temp table _in on commit drop as
  select (e->>'subject_code')                          as subject_code,
         (e->>'subject_name')                          as subject_name,
         nullif(e->>'semester','')::int                as semester,
         nullif(e->>'credits','')::numeric             as credits,
         coalesce(e->'units','[]'::jsonb)              as units
  from jsonb_array_elements(coalesce(p_payload->'subjects','[]'::jsonb)) e
  where coalesce(e->>'subject_code','') <> '';

  select count(*) into v_existing from public.subjects where branch_id = v_branch;

  select count(*) into v_ins from _in i
   where not exists (select 1 from public.subjects s
                      where s.branch_id = v_branch and s.code = i.subject_code);

  select count(*) into v_upd from _in i
   join public.subjects s on s.branch_id = v_branch and s.code = i.subject_code
   where s.name is distinct from i.subject_name
      or s.semester_number is distinct from i.semester;

  select count(*), array_agg(s.code)
    into v_del, v_deleted_codes
  from public.subjects s
  where s.branch_id = v_branch
    and not exists (select 1 from _in i where i.subject_code = s.code);

  v_del := coalesce(v_del, 0);
  perform public._sync_guard(v_del, v_existing, p_allow_mass_delete);

  if p_dry_run then
    return jsonb_build_object('dry_run', true, 'branch', v_branch_code,
      'would_insert', v_ins, 'would_update', v_upd, 'would_delete', v_del,
      'would_delete_codes', coalesce(to_jsonb(v_deleted_codes), '[]'::jsonb),
      'existing', v_existing);
  end if;

  -- insert + update
  insert into public.subjects (branch_id, code, name, semester_number, credits)
  select v_branch, i.subject_code, i.subject_name, i.semester, i.credits
  from _in i
  on conflict (branch_id, code) do update
    set name = excluded.name,
        semester_number = excluded.semester_number,
        credits = excluded.credits,
        updated_at = now();

  -- unit content, versioned
  insert into public.syllabus (subject_id, current_version)
  select s.id, 1
  from public.subjects s join _in i on i.subject_code = s.code
  where s.branch_id = v_branch
  on conflict (subject_id) do nothing;

  insert into public.syllabus_versions (syllabus_id, version, units)
  select sy.id, sy.current_version, i.units
  from _in i
  join public.subjects s on s.branch_id = v_branch and s.code = i.subject_code
  join public.syllabus sy on sy.subject_id = s.id
  on conflict (syllabus_id, version) do update set units = excluded.units;

  -- delete what the file no longer contains (this branch only)
  delete from public.subjects s
  where s.branch_id = v_branch
    and not exists (select 1 from _in i where i.subject_code = s.code);

  insert into public.audit_logs (actor_id, action, entity_type, metadata)
  values (auth.uid(), 'sync_syllabus', 'subjects',
          jsonb_build_object('branch', v_branch_code, 'inserted', v_ins,
                             'updated', v_upd, 'deleted', v_del));

  return jsonb_build_object('dry_run', false, 'branch', v_branch_code,
    'inserted', v_ins, 'updated', v_upd, 'deleted', v_del);
end $$;

-- ---------------------------------------------------------------- PYQ ------
/**
 * {
 *   "type": "pyq",
 *   "papers": [
 *     { "subject_code":"100101", "year":2023, "exam":"End Semester",
 *       "semester":1, "title":"Mathematics-I 2023", "file_url":"https://…" }
 *   ]
 * }
 * Scope of deletion: only the (subject_code) values present in the file.
 * A file about Maths can never delete Physics papers.
 */
create or replace function public.sync_pyqs(
  p_payload jsonb,
  p_dry_run boolean default true,
  p_allow_mass_delete boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_ins int := 0; v_upd int := 0; v_del int := 0; v_existing int := 0;
begin
  perform public.assert_can_review();

  if jsonb_typeof(p_payload->'papers') <> 'array' then
    raise exception 'papers must be an array' using errcode = 'P0001';
  end if;

  create temp table _p on commit drop as
  select (e->>'subject_code')                as subject_code,
         nullif(e->>'year','')::int          as exam_year,
         coalesce(e->>'exam','End Semester') as exam_session,
         nullif(e->>'semester','')::int      as semester_number,
         (e->>'title')                       as title,
         (e->>'file_url')                    as source_url
  from jsonb_array_elements(coalesce(p_payload->'papers','[]'::jsonb)) e
  where coalesce(e->>'subject_code','') <> '' and coalesce(e->>'year','') <> '';

  select count(*) into v_existing
    from public.pyqs q where q.subject_code in (select distinct subject_code from _p);

  select count(*) into v_ins from _p p
   where not exists (select 1 from public.pyqs q
                      where q.subject_code = p.subject_code and q.exam_year = p.exam_year and coalesce(q.exam_session,'') = coalesce(p.exam_session,''));

  select count(*) into v_upd from _p p
   join public.pyqs q on q.subject_code = p.subject_code and q.exam_year = p.exam_year and coalesce(q.exam_session,'') = coalesce(p.exam_session,'')
   where q.title is distinct from p.title or q.source_url is distinct from p.source_url;

  select count(*) into v_del
    from public.pyqs q
   where q.subject_code in (select distinct subject_code from _p)
     and not exists (select 1 from _p p
                      where p.subject_code = q.subject_code and p.exam_year = q.exam_year and coalesce(p.exam_session,'') = coalesce(q.exam_session,''));

  perform public._sync_guard(v_del, v_existing, p_allow_mass_delete);

  if p_dry_run then
    return jsonb_build_object('dry_run', true, 'would_insert', v_ins,
      'would_update', v_upd, 'would_delete', v_del, 'existing', v_existing);
  end if;

  insert into public.pyqs (subject_code, exam_year, exam_session, semester_number, title, source_url, is_published)
  select p.subject_code, p.exam_year, p.exam_session, p.semester_number, p.title, p.source_url, true
  from _p p
  on conflict (subject_code, exam_year, coalesce(exam_session, '')) do update
    set title = excluded.title, semester_number = excluded.semester_number,
        source_url = excluded.source_url, updated_at = now();

  delete from public.pyqs q
   where q.subject_code in (select distinct subject_code from _p)
     and not exists (select 1 from _p p
                      where p.subject_code = q.subject_code and p.exam_year = q.exam_year and coalesce(p.exam_session,'') = coalesce(q.exam_session,''));

  insert into public.audit_logs (actor_id, action, entity_type, metadata)
  values (auth.uid(), 'sync_pyqs', 'pyqs',
          jsonb_build_object('inserted', v_ins, 'updated', v_upd, 'deleted', v_del));

  return jsonb_build_object('dry_run', false, 'inserted', v_ins,
    'updated', v_upd, 'deleted', v_del);
end $$;

-- ------------------------------------------------------------- CALENDAR ----
/**
 * {
 *   "type": "calendar",
 *   "year": 2026,
 *   "events": [
 *     { "date":"2026-01-26", "title":"Republic Day", "category":"holiday",
 *       "end_date":null, "description":"" }
 *   ]
 * }
 * Scope of deletion: events inside that calendar year only.
 */
create or replace function public.sync_calendar(
  p_payload jsonb,
  p_dry_run boolean default true,
  p_allow_mass_delete boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_year int := nullif(p_payload->>'year','')::int;
  v_ins int := 0; v_upd int := 0; v_del int := 0; v_existing int := 0;
begin
  perform public.assert_can_review();

  if v_year is null then
    raise exception 'year is required' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_payload->'events') <> 'array' then
    raise exception 'events must be an array' using errcode = 'P0001';
  end if;

  create temp table _e on commit drop as
  select nullif(e->>'date','')::date      as starts_on,
         nullif(e->>'end_date','')::date  as ends_on,
         (e->>'title')                    as title,
         coalesce(e->>'category','other') as category,
         (e->>'description')              as description
  from jsonb_array_elements(coalesce(p_payload->'events','[]'::jsonb)) e
  where coalesce(e->>'date','') <> '' and coalesce(e->>'title','') <> '';

  select count(*) into v_existing
    from public.academic_calendar_events c
   where extract(year from c.starts_on)::int = v_year;

  select count(*) into v_ins from _e x
   where not exists (select 1 from public.academic_calendar_events c
                      where c.starts_on = x.starts_on and c.title = x.title);

  select count(*) into v_upd from _e x
   join public.academic_calendar_events c
     on c.starts_on = x.starts_on and c.title = x.title
   where c.category is distinct from x.category
      or c.ends_on is distinct from x.ends_on
      or c.description is distinct from x.description;

  select count(*) into v_del
    from public.academic_calendar_events c
   where extract(year from c.starts_on)::int = v_year
     and not exists (select 1 from _e x
                      where x.starts_on = c.starts_on and x.title = c.title);

  perform public._sync_guard(v_del, v_existing, p_allow_mass_delete);

  if p_dry_run then
    return jsonb_build_object('dry_run', true, 'year', v_year,
      'would_insert', v_ins, 'would_update', v_upd, 'would_delete', v_del,
      'existing', v_existing);
  end if;

  insert into public.academic_calendar_events (starts_on, ends_on, title, category, description, is_published)
  select x.starts_on, x.ends_on, x.title, x.category, x.description, true from _e x
  on conflict (starts_on, title) do update
    set ends_on = excluded.ends_on, category = excluded.category,
        description = excluded.description, updated_at = now();

  delete from public.academic_calendar_events c
   where extract(year from c.starts_on)::int = v_year
     and not exists (select 1 from _e x
                      where x.starts_on = c.starts_on and x.title = c.title);

  insert into public.audit_logs (actor_id, action, entity_type, metadata)
  values (auth.uid(), 'sync_calendar', 'academic_calendar_events',
          jsonb_build_object('year', v_year, 'inserted', v_ins,
                             'updated', v_upd, 'deleted', v_del));

  return jsonb_build_object('dry_run', false, 'year', v_year,
    'inserted', v_ins, 'updated', v_upd, 'deleted', v_del);
end $$;

revoke all on function public.sync_syllabus(jsonb,boolean,boolean) from public, anon;
revoke all on function public.sync_pyqs(jsonb,boolean,boolean) from public, anon;
revoke all on function public.sync_calendar(jsonb,boolean,boolean) from public, anon;
grant execute on function public.sync_syllabus(jsonb,boolean,boolean) to authenticated;
grant execute on function public.sync_pyqs(jsonb,boolean,boolean) to authenticated;
grant execute on function public.sync_calendar(jsonb,boolean,boolean) to authenticated;

select 'MIGRATION 0016 COMPLETE' as status;
