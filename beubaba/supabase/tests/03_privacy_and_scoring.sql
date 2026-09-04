-- Student 2 opens a private support thread
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claim.role','authenticated', true);
insert into public.support_conversations (id,user_id,subject,category)
  values ('70000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','Login issue','account');
insert into public.support_messages (conversation_id,sender_id,sender_role,body)
  values ('70000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','student','I cannot log in');
commit;

-- Student 1 tries to read student 2's private thread
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role','authenticated', true);
\echo '--- student1 sees student2 conversations (expect 0) ---'
select count(*) from public.support_conversations;
\echo '--- student1 sees student2 messages (expect 0) ---'
select count(*) from public.support_messages;
commit;

-- Wrong-answer scoring check
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role','authenticated', true);
select public.start_quiz_attempt('40000000-0000-0000-0000-000000000001') as aid \gset
select public.save_quiz_answer(:'aid','50000000-0000-0000-0000-000000000001',
  array['60000000-0000-0000-0000-000000000001']::uuid[], false);  -- WRONG (option '3')
select public.submit_quiz_attempt(:'aid', false);
\echo '--- wrong answer result (expect correct=0 / 0% / passed=f) ---'
select correct_count c, incorrect_count w, percentage, passed
from public.quiz_results where attempt_id = :'aid';
commit;
