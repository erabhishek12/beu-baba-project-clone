-- ============================================================================
-- 0017 — BANNERS: return buttons with the eligible banner (spec §34-§39)
--
-- PROBLEM
-- -------
-- The banner backend from 0007 is complete EXCEPT for one thing: the spec
-- requires banners with buttons ("[Open Form] [Learn More]"), but
--   * next_eligible_banner() returns no buttons, and
--   * RLS correctly hides public.banner_buttons from students (verified: a
--     student SELECT returns 0 rows).
-- So a student could never see a banner button. Buttons were unreachable.
--
-- Loosening RLS on banner_buttons would leak the buttons of banners a student
-- is NOT targeted for. Instead the SECURITY DEFINER function now returns the
-- buttons of the ONE banner that student is actually eligible for, as jsonb.
--
-- Also adds banner_stats() so the admin screen can show real reach without
-- exposing per-user data.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- The old signature returns a different column list, so drop before replacing.
drop function if exists public.next_eligible_banner(text);

create function public.next_eligible_banner(p_session_id text default null)
returns table (
  id              uuid,
  title           text,
  description     text,
  supporting_text text,
  image_path      text,
  image_alt       text,
  kind            text,
  priority        integer,
  buttons         jsonb
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select b.id, b.title, b.description, b.supporting_text,
         b.image_path, b.image_alt, b.kind, b.priority,
         coalesce(
           (select jsonb_agg(
                     jsonb_build_object(
                       'label',       bb.label,
                       'target',      bb.target,
                       'is_external', bb.is_external,
                       'style',       bb.style)
                     order by bb.display_order, bb.label)
              from public.banner_buttons bb
             where bb.banner_id = b.id),
           '[]'::jsonb) as buttons
  from public.banners b
  left join public.banner_impressions i
         on i.banner_id = b.id and i.user_id = auth.uid()
  where auth.uid() is not null
    and b.is_active
    and (b.starts_at  is null or b.starts_at  <= now())
    and (b.expires_at is null or b.expires_at >  now())
    -- targeting: no target rows => everyone; otherwise the student must match
    and (
      not exists (select 1 from public.banner_targets t where t.banner_id = b.id)
      or exists (
        select 1
        from public.banner_targets t
        left join public.student_profiles sp on sp.user_id = auth.uid()
        left join public.semesters sem on sem.id = sp.current_semester_id
        where t.banner_id = b.id
          and (t.branch_id       is null or t.branch_id = sp.branch_id)
          and (t.semester_number is null or t.semester_number = sem.number)
          and (t.academic_year   is null or t.academic_year = sp.admission_year)
          and (t.role            is null or public.has_role(t.role))
      )
    )
    -- a banner the user closed for good is never shown again
    and i.dismissed_at is null
    -- frequency (§37)
    and case b.frequency
          when 'always'           then true
          when 'once_ever'        then coalesce(i.seen_count, 0) < 1
          when 'n_times'          then coalesce(i.seen_count, 0) < b.frequency_count
          when 'once_per_session' then p_session_id is null
                                       or i.last_session_id is distinct from p_session_id
          else false
        end
  order by b.priority desc, b.starts_at nulls last, b.created_at
  limit 1;
$$;

comment on function public.next_eligible_banner(text) is
  'The single banner this user should see now, with its buttons. Honours targeting, schedule, dismissal and per-user frequency. No other banner is exposed.';

revoke all on function public.next_eligible_banner(text) from public, anon;
grant execute on function public.next_eligible_banner(text) to authenticated;

-- ---------------------------------------------------------------- stats ----
/** Reach per banner for the admin screen. Aggregates only — no user ids. */
create or replace function public.banner_stats()
returns table (
  banner_id     uuid,
  seen_by       bigint,
  total_views   bigint,
  dismissed_by  bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select i.banner_id,
         count(*)                                        as seen_by,
         coalesce(sum(i.seen_count), 0)                   as total_views,
         count(*) filter (where i.dismissed_at is not null) as dismissed_by
  from public.banner_impressions i
  group by i.banner_id;
$$;

revoke all on function public.banner_stats() from public, anon;
grant execute on function public.banner_stats() to authenticated;

select 'MIGRATION 0017 COMPLETE' as status;
