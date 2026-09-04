\set ON_ERROR_STOP on
-- ============ Seed two students + one super admin ============
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111','stu1@test.com','{"full_name":"Student One"}'),
  ('22222222-2222-2222-2222-222222222222','stu2@test.com','{"full_name":"Student Two"}'),
  ('99999999-9999-9999-9999-999999999999','boss@test.com','{"full_name":"Boss"}');
-- promote the boss to super_admin (as if done by the seed/service role)
insert into public.user_roles (user_id, role) values
  ('99999999-9999-9999-9999-999999999999','super_admin');

-- academic content for a quiz
insert into public.courses (id,name) values ('c0000000-0000-0000-0000-000000000001','B.Tech');
insert into public.quizzes (id,title,status,current_version,duration_seconds,points_per_question,negative_marking,pass_percentage,created_by)
  values ('40000000-0000-0000-0000-000000000001','DS Unit 1','published',1,600,1,0,40,'99999999-9999-9999-9999-999999999999');
insert into public.quiz_questions (id,quiz_id,version,prompt,display_order)
  values ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',1,'2+2 = ?',0);
insert into public.quiz_options (id,question_id,label,is_correct,display_order) values
  ('60000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','3',false,0),
  ('60000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','4',true,1);

-- helper to act as a given user with the authenticated role
-- (Supabase sets these JWT claims; we emulate via set_config)

\echo '--- TEST 1: student CANNOT read secret is_correct via base table ---'
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role','authenticated', true);
select count(*) as rows_visible_to_student from public.quiz_options; -- expect 0

\echo '--- TEST 2: student CAN read option labels via safe view (no is_correct) ---'
select id,label,display_order from public.public_quiz_options order by display_order;

\echo '--- TEST 3: student CANNOT escalate their own role ---'
do $$
begin
  begin
    insert into public.user_roles (user_id, role)
    values ('11111111-1111-1111-1111-111111111111','super_admin');
    raise notice 'FAIL: escalation insert succeeded';
  exception when others then
    raise notice 'PASS: escalation blocked (%).', sqlerrm;
  end;
end $$;

\echo '--- TEST 4: student CANNOT call grant_role (not super admin) ---'
do $$
begin
  begin
    perform public.grant_role('11111111-1111-1111-1111-111111111111','admin');
    raise notice 'FAIL: grant_role allowed for student';
  exception when others then
    raise notice 'PASS: grant_role blocked (%).', sqlerrm;
  end;
end $$;
reset role;
