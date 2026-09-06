-- ============================================================================
-- BEU BABA — Seed: OFFICIAL BEU HOLIDAY CALENDAR 2026
--
-- Source (verbatim, not invented): 
--   production md file and other data/BEU_Holiday_Calendar_2026.json
--   → "Bihar Engineering University, Patna — Holiday Calendar 2026"
--   → source: "Uploaded BEU Holiday 2026 calendar image"
--
-- VALIDATED during the Phase 3B audit (see supabase/tests/RESULTS.md):
--   * 28 entries, all dates parse, all within 2026
--   * every weekday name matches the real 2026 calendar (0 mismatches)
--   * 5 multi-day ranges; holiday_days excludes Sundays, matching the
--     official sheet (e.g. 1–30 Jun = 30 days − 4 Sundays = 26)
--   * sum(holiday_days) = 65, sundays = 8, total = 73  ==  official_total
--   * the June entry is TEACHERS ONLY and is labelled as such
--
-- No date has been added, removed or altered. Ids are deterministic (md5 of
-- source id + start date) so re-running this file UPDATES rather than
-- duplicating.
-- ============================================================================

insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('3378a1d1-c7d9-c7a8-2d7d-949f321783be', 'New Year', 'नववर्ष आरंभ', 'holiday', '2026-01-01', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('1b2a2161-c896-603f-1ced-1715cf3fd7dc', 'Makar Sankranti', 'मकर संक्रांति', 'holiday', '2026-01-14', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('aac7229e-5a8f-74e8-7f9c-9192995ad7de', 'Basant Panchami / Saraswati Puja', 'वसंत पंचमी / सरस्वती पूजा', 'holiday', '2026-01-23', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('32bef867-d084-4195-a5e1-bbfcacdf1c66', 'Sant Ravidas Jayanti', 'संत रविदास जयंती', 'holiday', '2026-02-01', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('2ba8e068-dda7-de68-de76-b7cec92d43c3', 'Shab-e-Barat', 'शब-ए-बारात', 'holiday', '2026-02-04', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('ba042183-e1e9-3ab5-1a79-6e7fded45aba', 'Maha Shivratri', 'महाशिवरात्रि', 'holiday', '2026-02-15', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('c635af3e-ad27-ae77-4a9b-eafd0bf81aa6', 'Holika Dahan / Holi', 'होलिकादहन / होली', 'holiday', '2026-03-02', '2026-03-04', true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('a8c91f9e-302a-9777-d265-2f8499c1f413', 'Eid-ul-Fitr', 'ईद-उल-फितर', 'holiday', '2026-03-21', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('c3366f8a-5ce0-b935-0b62-0229e956c080', 'Bihar Diwas', 'बिहार दिवस', 'holiday', '2026-03-22', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('473d1617-af8c-b8ef-19e4-7210a40f4100', 'Emperor Ashoka Jayanti', 'सम्राट अशोक जयंती', 'holiday', '2026-03-26', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('0ee517b2-76a8-2c79-6284-a0d3eeae3308', 'Ram Navami', 'रामनवमी', 'holiday', '2026-03-27', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('9c1d76c8-694d-33ed-fe29-a6074ed3b452', 'Mahavir Jayanti', 'महावीर जयंती', 'holiday', '2026-03-31', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('0b05a8c4-aa8a-ebfa-377b-c90e6a193d55', 'Good Friday', 'गुड फ्राइडे', 'holiday', '2026-04-03', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('33640ee4-f812-da8c-dc04-ace33d8d108b', 'Dr. B. R. Ambedkar Jayanti', 'डॉ. भीम राव अंबेडकर जयंती', 'holiday', '2026-04-14', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('05474931-089c-0d36-59d4-6343f240192c', 'Veer Kunwar Singh Jayanti', 'वीर कुँवर सिंह जयंती', 'holiday', '2026-04-23', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('89bc4d2c-fac0-2139-81a4-e94e5b2c4fac', 'Janki Navami', 'जानकी नवमी', 'holiday', '2026-04-25', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('d1e1bf2d-efd4-cc4f-f025-676c6c82b7a1', 'May Day / Labour Day / Buddha Purnima', 'मई दिवस / श्रम दिवस / बुद्ध पूर्णिमा', 'holiday', '2026-05-01', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('d248b482-2a45-ab32-0006-9e10f8f76501', 'Eid-ul-Adha / Bakrid', 'ईद-उल-जोहा (बकरीद)', 'holiday', '2026-05-28', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('0862d81a-8f70-13bb-d856-f2ce21ebe8e2', 'Summer Vacation (Teachers Only) / Muharram / Kabir Jayanti', 'ग्रीष्मावकाश (केवल शिक्षकों के लिए) / मुहर्रम / कबीर जयंती — Summer vacation is specifically for teachers. — Includes 4 Sunday(s); 26 working day(s) off.', 'holiday', '2026-06-01', '2026-06-30', true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('b528cb73-c783-3aba-1ef8-a823e7c4d71f', 'Chehlum', 'चेहल्लुम', 'holiday', '2026-08-04', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('6be9cfb1-16b4-9c93-965a-9b5d37f6c1fe', 'Prophet Muhammad''s Birthday', 'हज़रत मोहम्मद साहब का जन्म दिवस', 'holiday', '2026-08-26', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('c06df7b7-abc3-6530-57d8-82cb0fce5751', 'Raksha Bandhan', 'रक्षाबंधन', 'holiday', '2026-08-28', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('455c988c-b4f9-3f9b-48cd-1378115a17d0', 'Krishna Janmashtami', 'श्री कृष्ण जन्माष्टमी', 'holiday', '2026-09-04', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('3ee97aa4-d353-29d0-543c-72111277b72f', 'Mahatma Gandhi Jayanti', 'महात्मा गांधी जयंती', 'holiday', '2026-10-02', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('a4fee9fb-41f1-07b7-72df-4ee7b0f46db4', 'Durga Puja', 'दुर्गा पूजा — Includes 1 Sunday(s); 3 working day(s) off.', 'holiday', '2026-10-17', '2026-10-20', true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('03209258-bd32-c790-83e5-240751297a65', 'Diwali / Chitragupta Puja / Bhai Dooj / Chhath Puja', 'दीपावली / चित्रगुप्त पूजा / भाई दूज एवं छठ पूजा — Includes 2 Sunday(s); 7 working day(s) off.', 'holiday', '2026-11-08', '2026-11-16', true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('e8d4f977-678f-2539-c278-7720256f3b1c', 'Guru Nanak Jayanti / Kartik Purnima', 'गुरुनानक जयंती / कार्तिक पूर्णिमा', 'holiday', '2026-11-24', null, true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();
insert into public.academic_calendar_events
  (id, title, description, category, starts_on, ends_on, is_published)
values ('0eb7e55a-0441-db5c-00c0-dcbaeb22f9b3', 'Christmas / Winter Vacation', 'क्रिसमस / शीतकालीन अवकाश — Includes 1 Sunday(s); 6 working day(s) off.', 'holiday', '2026-12-25', '2026-12-31', true)
on conflict (id) do update set
  title = excluded.title, description = excluded.description,
  starts_on = excluded.starts_on, ends_on = excluded.ends_on, updated_at = now();

-- Official notes carried with the calendar (master §14).
insert into public.content_versions
  (entity_type, entity_id, version, source, snapshot, is_current)
values ('calendar', 'beu-holidays-2026', 1, 'import',
        jsonb_build_object(
          'title', 'BEU Holiday Calendar 2026',
          'university', 'Bihar Engineering University, Patna',
          'year', 2026,
          'source', 'Uploaded BEU Holiday 2026 calendar image',
          'official_total', '{"holiday_days": 65, "sundays": 8, "total": 73}'::jsonb,
          'notes', 'Republic Day (26 January) and Independence Day (15 August) are to be observed according to applicable rules. | Muslim festival holiday dates may be changed according to the relevant government order. | Additional holidays may be declared by government order. | The June summer vacation entry is specifically for teachers.',
          'entry_count', 28),
        true)
on conflict (entity_type, entity_id, version) do nothing;
