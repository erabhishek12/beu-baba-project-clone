begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claim.role','authenticated', true);

select public.start_quiz_attempt('40000000-0000-0000-0000-000000000001') as attempt_id \gset
select public.save_quiz_answer(:'attempt_id','50000000-0000-0000-0000-000000000001',
  array['60000000-0000-0000-0000-000000000002']::uuid[], false);
select public.submit_quiz_attempt(:'attempt_id', false);

\echo '--- RESULT (expect correct=1 / 100% / passed=t) ---'
select total_questions t, correct_count c, incorrect_count w, unanswered_count u,
       raw_score, max_score, percentage, passed
from public.quiz_results where attempt_id = :'attempt_id';
commit;
