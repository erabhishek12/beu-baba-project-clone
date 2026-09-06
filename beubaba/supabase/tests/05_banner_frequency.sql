set role postgres;
insert into public.banners(id,title,description,is_active,frequency,frequency_count,priority)
values ('cccc0000-0000-0000-0000-000000000003','Show 3 times','body',true,'n_times',3,10),
       ('cccc0000-0000-0000-0000-000000000001','Once ever','body',true,'once_ever',null,5)
on conflict do nothing;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false);
set role authenticated;
\echo '--- n_times=3 banner: view 1,2,3 then should fall through to once_ever ---'
select title from public.next_eligible_banner('sess-A');
select public.record_banner_impression('cccc0000-0000-0000-0000-000000000003','sess-A');
select title from public.next_eligible_banner('sess-A');
select public.record_banner_impression('cccc0000-0000-0000-0000-000000000003','sess-A');
select title from public.next_eligible_banner('sess-A');
select public.record_banner_impression('cccc0000-0000-0000-0000-000000000003','sess-A');
\echo '--- 4th call: n_times exhausted, expect "Once ever" ---'
select title from public.next_eligible_banner('sess-A');
select public.record_banner_impression('cccc0000-0000-0000-0000-000000000001','sess-A');
\echo '--- 5th call: both exhausted, expect NO ROWS ---'
select title from public.next_eligible_banner('sess-A');
\echo '--- impression ledger ---'
select banner_id, seen_count from public.banner_impressions order by seen_count desc;
\echo '--- expired banner never shows ---'
reset role; set role postgres;
insert into public.banners(id,title,is_active,frequency,expires_at)
 values('cccc0000-0000-0000-0000-000000000009','Expired',true,'always',now()-interval '1 day') on conflict do nothing;
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',false);
set role authenticated;
select coalesce((select title from public.next_eligible_banner('s')),'<none-or-other>') as for_student2;
reset role;
