\set QUIET on
set role postgres;
insert into auth.users(id,email) values
 ('11111111-1111-1111-1111-111111111111','s1@x.com'),
 ('22222222-2222-2222-2222-222222222222','s2@x.com') on conflict do nothing;
insert into public.profiles(id,full_name,email) values
 ('11111111-1111-1111-1111-111111111111','S1','s1@x.com'),
 ('22222222-2222-2222-2222-222222222222','S2','s2@x.com') on conflict do nothing;
insert into public.user_roles(user_id,role) values
 ('11111111-1111-1111-1111-111111111111','student'),
 ('22222222-2222-2222-2222-222222222222','student') on conflict do nothing;
insert into public.resources(id,owner_id,owner_name,title,type,status)
 values('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','S1','Mine','notes','pending') on conflict do nothing;
insert into public.support_conversations(id,user_id,subject,category)
 values('bbbbbbbb-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Help','bug') on conflict do nothing;
\set QUIET off

select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false);
set role authenticated;

\echo '### V1 self-approve resource (expect: stays pending)'
update public.resources set status='approved', published_at=now() where id='aaaaaaaa-0000-0000-0000-000000000001';
select status from public.resources where id='aaaaaaaa-0000-0000-0000-000000000001';

\echo '### V2 impersonate developer (expect: ERROR)'
do $$ begin
  insert into public.support_messages(conversation_id,sender_id,sender_role,body)
  values('bbbbbbbb-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','developer','fake');
  raise notice 'VULNERABLE: impersonation succeeded';
exception when others then raise notice 'PASS: impersonation blocked (%)', sqlerrm; end $$;

\echo '### V2b legit student message (expect: ok, thread auto-touched)'
insert into public.support_messages(conversation_id,sender_id,sender_role,body)
values('bbbbbbbb-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','student','real question');
select status, last_message_at is not null as touched from public.support_conversations where id='bbbbbbbb-0000-0000-0000-000000000001';

\echo '### V3 self-escalate ticket priority (expect: stays normal)'
update public.support_conversations set priority='urgent', assigned_to='22222222-2222-2222-2222-222222222222'
 where id='bbbbbbbb-0000-0000-0000-000000000001';
select priority, assigned_to from public.support_conversations where id='bbbbbbbb-0000-0000-0000-000000000001';

\echo '### V4 self-write is_active/email (expect: unchanged)'
update public.profiles set is_active=false, email='hacked@x.com' where id='11111111-1111-1111-1111-111111111111';
select is_active, email from public.profiles where id='11111111-1111-1111-1111-111111111111';

\echo '### NEW: student reads raw banners table (expect 0/denied)'
select count(*) as banners_visible from public.banners;

\echo '### NEW: student forges own banner impression count (expect denied)'
do $$ begin
  insert into public.banner_impressions(banner_id,user_id,seen_count) values(gen_random_uuid(),auth.uid(),0);
  raise notice 'VULNERABLE: impression forged';
exception when others then raise notice 'PASS: impression write blocked (%)', sqlerrm; end $$;

\echo '### NEW: student reads other student revision items (expect 0)'
select count(*) as other_revision from public.revision_items where user_id <> '11111111-1111-1111-1111-111111111111';

\echo '### NEW: external links readable (expect 5)'
select count(*) as external_links from public.external_links;
reset role;
