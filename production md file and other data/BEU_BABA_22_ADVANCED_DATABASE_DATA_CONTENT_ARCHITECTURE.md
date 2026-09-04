# BEU BABA — ADVANCED DATABASE, DATA MODEL & CONTENT ARCHITECTURE

Document ID: BEU-BABA-22
Document Type: Production Architecture & Implementation Specification
Target: BEU BABA Progressive Web App
Status: Mandatory engineering specification
Primary stack assumption: React + Vite + TypeScript + Tailwind CSS + Supabase
Database: PostgreSQL through Supabase
Storage: Supabase Storage and/or approved external object storage according to the final deployment plan

This document defines the complete data architecture for BEU BABA. It is intentionally implementation-level rather than conceptual. The purpose is to give a developer or coding agent enough context to build the database, content model, relationships, permissions, moderation workflow, administration system, student data model, quiz model, resource model, syllabus/calendar model, notifications, bookmarks, progress tracking, developer communication, and future extensibility without repeatedly inventing missing rules.

The application is a premium light-theme educational platform for students. The visual language is transparent glassmorphism inspired by modern Apple interfaces: translucent surfaces, layered blur, subtle borders, soft shadows, restrained gradients, excellent typography, and clean motion. The product must not become a dark neon AI dashboard, RGB interface, gaming interface, or visually overloaded 3D scene. Data architecture and UI architecture are separate concerns, but the database must expose clean, predictable data that allows the interface to remain fast and polished.

The core principle is that content must be editable without changing application code. If an administrator needs to change a syllabus, academic calendar, notice, course metadata, resource, quiz, link, or other educational content, the administrator should be able to perform the change from the admin panel. The student application should read the latest approved data from the database. Hardcoding educational content into React components is prohibited except for genuine static UI labels, fallback states, legal copy, and system-level configuration.

The second core principle is separation of identity, content, moderation, analytics, and presentation. A student's authentication identity must not be mixed with educational content. Uploaded resources must not immediately become public. User submissions must pass moderation when required. Admin operations must be auditable. Student-private information must never be exposed through public queries. The database schema must support future migration to additional universities, departments, courses, semesters, and content types without requiring a destructive rewrite.

# 1. ARCHITECTURAL OBJECTIVES AND NON-NEGOTIABLE RULES

1. The database must be relational and normalized enough to avoid uncontrolled duplication while remaining practical for frontend queries.
2. Every important entity must have a stable UUID primary key unless there is a strong reason to use another type.
3. Human-readable slugs may be used for routing, but slugs must never be treated as authorization credentials.
4. Authentication credentials must be managed by Supabase Auth. The application database should store the corresponding profile and application metadata, not passwords.
5. Student profile data must be private by default.
6. Admin-only records must be protected by Row Level Security.
7. Public educational content must have an explicit publication state. A row existing in the database does not mean students may see it.
8. Uploaded student resources must have a moderation state such as pending, approved, rejected, archived, or removed.
9. Every moderation decision must record who performed it and when.
10. Deleting a user must not accidentally delete globally useful educational content unless the business rule explicitly requires it.
11. Foreign keys and deletion behavior must be deliberate. CASCADE is allowed only when child data has no independent value.
12. Timestamps must be stored consistently in UTC at the database layer.
13. UI formatting should convert timestamps to the student's local timezone.
14. The database must support soft deletion for records that need auditability.
15. All user-generated text must be treated as untrusted input.
16. File metadata must be stored separately from binary objects where practical.
17. File access must be authorized by database policy and storage policy together.
18. Public URLs must never be used as a substitute for permission checks.
19. Admin interfaces must not rely solely on hiding buttons. Backend policies are the real security boundary.
20. The database must support future versioning of syllabus and academic calendar data.
21. Educational content must support ordering, visibility, and optional scheduling.
22. Every list shown in the student application should have a predictable sort order.
23. Every potentially large collection needs pagination or bounded queries.
24. The frontend must never request an entire database table merely to display a small screen.
25. Database indexes must be designed around real query patterns.
26. Analytics must not store unnecessary sensitive data.
27. The schema should support India-specific academic fields such as course, branch, semester, academic year, examination year, and university-specific identifiers.
28. A student's branch or course should be represented through relational references where possible rather than uncontrolled free text.
29. Content ownership and creator attribution must be explicit.
30. The schema must support administrators changing educational data without modifying source code.

# 2. HIGH-LEVEL DATA DOMAINS

BEU BABA should be organized into the following logical data domains:

A. Identity domain
- auth user identity
- student profile
- profile avatar
- generated character
- course/branch identity
- account status
- role and permissions

B. Academic structure domain
- university
- academic year
- course
- branch
- semester
- subject
- subject-semester relationship
- academic session

C. Educational content domain
- notes
- previous-year questions
- question papers
- syllabus
- units
- topics
- yearly academic calendar
- notices
- courses
- lessons
- study resources
- external links

D. User activity domain
- bookmarks
- recently viewed items
- reading progress
- course progress
- completed lessons
- quiz attempts
- quiz answers
- downloaded resources
- search history where explicitly needed

E. Quiz domain
- quiz
- questions
- options
- correct answer
- explanation
- difficulty
- tags
- attempts
- score
- generated quiz card metadata

F. Community contribution domain
- resource submissions
- submission files
- moderation actions
- reports
- contributor reputation or statistics

G. Communication domain
- student-to-developer conversations
- messages
- message attachments if enabled
- read state
- developer replies
- conversation status

H. Notification domain
- in-app notifications
- notification preferences
- delivery status
- announcement references

I. Administration domain
- admin users
- roles
- permissions
- audit logs
- content revisions
- moderation records
- system settings

J. Storage domain
- file metadata
- storage bucket reference
- object path
- MIME type
- file size
- checksum
- upload status
- moderation relation

These domains should remain conceptually separate even if some are physically implemented in the same PostgreSQL schema.

# 3. RECOMMENDED CORE TABLE INVENTORY

The initial production database should be designed around the following tables. Exact names may be adapted to project conventions, but the semantic responsibilities must remain.

identity:
1. profiles
2. profile_roles
3. profile_characters
4. profile_preferences

academic:
5. universities
6. academic_sessions
7. courses
8. branches
9. semesters
10. subjects
11. subject_offerings

content:
12. resources
13. resource_files
14. resource_subjects
15. syllabus_documents
16. syllabus_units
17. syllabus_topics
18. academic_calendars
19. calendar_events
20. notices
21. external_links

course_learning:
22. learning_courses
23. course_modules
24. course_lessons
25. lesson_resources
26. lesson_progress

quiz:
27. quizzes
28. quiz_questions
29. quiz_options
30. quiz_attempts
31. quiz_attempt_answers
32. quiz_cards

activity:
33. bookmarks
34. recently_viewed
35. download_records
36. search_records where justified

submissions:
37. resource_submissions
38. submission_files
39. moderation_actions
40. content_reports

communication:
41. developer_conversations
42. developer_messages
43. message_attachments

notifications:
44. notifications
45. notification_preferences
46. notification_deliveries

administration:
47. admin_roles
48. admin_permissions
49. role_permissions
50. audit_logs
51. content_revisions
52. system_settings

Not every table must be created on day one if the corresponding feature is not yet implemented. However, the architecture should avoid choices that make these additions impossible later.

# 4. PROFILES AND STUDENT IDENTITY MODEL

The profiles table represents application-level identity. Supabase Auth remains responsible for authentication credentials and sessions.

Recommended fields:
- id UUID primary key, matching auth.users.id
- full_name text not null
- display_name text nullable
- email text
- contact_number text nullable
- course_id UUID nullable
- branch_id UUID nullable
- current_semester_id UUID nullable
- academic_session_id UUID nullable
- gender text or controlled enum where needed for generated character selection
- avatar_type text such as uploaded or generated
- avatar_file_id UUID nullable
- generated_character_id UUID nullable
- student_identifier text nullable
- account_status text
- onboarding_completed boolean
- is_active boolean
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz nullable

Do not duplicate password fields. Do not store raw authentication tokens in profiles.

Email should be treated carefully because Supabase Auth already maintains authoritative authentication email information. If the application copies email into profiles for convenient display and search, synchronization rules must be defined. An admin should not be able to silently alter authentication identity by changing an arbitrary profile field.

Contact numbers are private student information. They must not be included in public resource queries, public leaderboards, or publicly accessible profile endpoints.

Course and branch should normally be foreign keys. This permits the administrator to change labels centrally. If a student changes branch, historical records should not be rewritten unnecessarily. For academic analytics, an optional enrollment-history table can be introduced so that the application knows which branch/course was valid during a specific academic session.

Gender should not be used for anything beyond the explicit product requirement for automatic character selection if that feature is retained. It should not affect permissions, ranking, academic recommendations, or access to content.

Account status should distinguish operational states such as active, suspended, pending verification, and deleted. Authorization policies must consider status, not merely the existence of a profile row.

# 5. ACADEMIC HIERARCHY

The academic hierarchy should be relational:

University
→ Course
→ Branch
→ Academic Session
→ Semester
→ Subject
→ Content

This prevents the same course and branch names from being repeatedly typed into resources.

Example conceptual structure:

University: Binod Bihari Mahto Koylanchal University
Course: B.Tech
Branch: Computer Science and Engineering
Academic Session: 2026–2030
Semester: Semester 1
Subject: Mathematics I

The schema must not assume that every course has eight semesters, every branch has identical subjects, or every academic year uses the same syllabus.

A subject should therefore be linked to a particular academic structure through subject_offerings. A subject offering can contain:
- subject_id
- semester_id
- academic_session_id
- branch_id
- course_id
- subject_code
- credits
- lecture_hours
- tutorial_hours
- practical_hours
- is_active

This is more robust than storing only subject_id and semester_id because curriculum can differ by branch or academic session.

When the administrator updates the syllabus for a new academic session, the previous session's syllabus should remain historically available. Students should not unexpectedly see a new syllabus simply because an administrator edited the old row.

# 6. RESOURCE ARCHITECTURE — NOTES, PYQS, PDFs, IMAGES AND LINKS

The resource entity is the central abstraction for educational materials.

A resource may represent:
- lecture notes
- PDF notes
- previous-year question paper
- model question paper
- syllabus PDF
- practical file
- reference document
- image
- worksheet
- important notice
- external educational link
- video reference
- downloadable study material

Recommended resource fields:
id
title
slug
description
resource_type
visibility
publication_status
course_id
branch_id
semester_id
subject_id
academic_session_id
year
exam_type
created_by
approved_by
approved_at
featured
is_downloadable
is_bookmarkable
sort_order
created_at
updated_at
deleted_at

resource_files stores binary-object metadata. A resource can have multiple files. This is important because a question paper may eventually contain a PDF, answer key PDF, scanned image, and official reference.

File metadata should include:
id
resource_id
storage_provider
bucket_name
object_path
original_filename
mime_type
file_size_bytes
checksum
upload_status
is_primary
created_at
deleted_at

Do not put large binary data directly into PostgreSQL rows. Use object storage. The database stores metadata and authorization context.

A student-facing query should normally return only published resources appropriate to the student's academic scope. Admin queries may see draft, pending, rejected, or archived records according to permissions.

# 7. SYLLABUS VERSIONING AND CHANGE MANAGEMENT

Syllabus is not a simple text field. It is a structured academic document and must support revisions.

Recommended model:
syllabus_documents
- id
- course_id
- branch_id
- academic_session_id
- title
- version_label
- effective_from
- effective_to
- status
- source
- created_by
- approved_by
- approved_at
- created_at
- updated_at

syllabus_units
- id
- syllabus_id
- unit_number
- title
- description
- sort_order

syllabus_topics
- id
- unit_id
- topic_number
- title
- description
- hours
- sort_order

The application should display the currently active approved syllabus. Historical syllabi remain available to administrators and, where appropriate, students whose academic session maps to them.

When an administrator changes a syllabus, the safest default workflow is:
1. Create a new draft revision.
2. Import or duplicate the existing structure.
3. Modify units/topics.
4. Preview the revision.
5. Submit for approval if the role requires approval.
6. Publish.
7. Mark the previous version superseded rather than deleting it.
8. Record the change in audit logs.
9. Optionally notify affected students.

Never overwrite the only copy of an important academic document without revision history.

A content_revisions table should record:
- entity_type
- entity_id
- revision_number
- snapshot or structured change data
- changed_by
- change_reason
- created_at

For very large documents, the revision can store a JSONB snapshot of structured metadata plus a file reference for the original PDF.

# 8. YEARLY ACADEMIC CALENDAR MODEL

The yearly calendar must be editable from the admin panel without code deployment.

academic_calendars:
- id
- title
- academic_session_id
- course_id nullable
- branch_id nullable
- effective_from
- effective_to
- status
- source_resource_id nullable
- created_by
- approved_by
- created_at
- updated_at

calendar_events:
- id
- calendar_id
- title
- description
- event_type
- start_at
- end_at
- all_day
- location
- priority
- sort_order
- status

event_type can represent:
- semester_start
- semester_end
- registration
- examination
- practical_examination
- result
- holiday
- form_submission
- admission
- counselling
- other

Dates should be stored as timestamptz when a precise instant matters. For date-only academic events, a date field can be more semantically correct than midnight timestamps. The implementation must avoid timezone bugs.

The student application should show:
- current/upcoming event
- calendar list
- month view if implemented
- examination dates
- important deadlines
- notices linked to events

When the calendar changes, the admin should see a clear revision comparison. Students should receive an in-app notification for major changes if notifications are enabled.

# 9. COURSE AND LESSON DATA MODEL

The BEU BABA platform can include free and paid learning content. The data model must support both without mixing access logic into presentation components.

learning_courses:
- id
- title
- slug
- description
- short_description
- thumbnail_file_id
- instructor_name
- status
- access_type
- price
- currency
- featured
- sort_order
- published_at
- created_by
- created_at
- updated_at

access_type may include:
- free
- paid
- restricted
- hidden

course_modules:
- id
- course_id
- title
- description
- sort_order
- is_published

course_lessons:
- id
- module_id
- title
- description
- lesson_type
- video_provider
- video_reference
- duration_seconds
- thumbnail_file_id
- sort_order
- is_preview
- is_published

lesson_resources:
- lesson_id
- resource_id
- sort_order

The database should not expose private paid video URLs to unauthorized users. If video is hosted on a third-party provider, access control must be enforced at the application level and, where supported, at the provider level.

Course progress:
lesson_progress
- id
- user_id
- lesson_id
- progress_seconds
- completion_percent
- completed_at
- last_viewed_at
- updated_at

A unique constraint on user_id + lesson_id prevents duplicate progress rows.

# 10. QUIZ ENGINE DATA ARCHITECTURE

The quiz system is a first-class feature, not merely a JSON blob embedded inside a React component.

quizzes:
- id
- title
- description
- quiz_type
- difficulty
- duration_seconds
- total_marks
- passing_marks
- question_count
- status
- visibility
- course_id nullable
- subject_id nullable
- created_by
- published_at
- created_at
- updated_at

quiz_questions:
- id
- quiz_id
- question_text
- explanation
- marks
- negative_marks
- question_type
- difficulty
- sort_order
- image_file_id nullable

quiz_options:
- id
- question_id
- option_text
- option_label
- sort_order
- is_correct

The is_correct field must not be exposed to ordinary students in the public question query. This is critical. The frontend should receive answer keys only after the attempt is submitted, or the scoring should happen server-side.

For stronger security, quiz scoring should occur through a controlled server-side function rather than trusting a score sent by the browser.

quiz_attempts:
- id
- quiz_id
- user_id
- started_at
- submitted_at
- status
- score
- correct_count
- incorrect_count
- skipped_count
- time_taken_seconds

quiz_attempt_answers:
- id
- attempt_id
- question_id
- selected_option_id nullable
- marked_for_review
- answered_at
- awarded_marks

A student must only be able to read and modify their own in-progress attempt. After submission, the attempt should become immutable except for administrative correction.

The system must protect against duplicate submissions, score manipulation, and changing answers after submission.

# 11. QUIZ CARD GENERATION

The user requirement includes allowing students to download or save their own quiz card. This should be treated as generated presentation data, not as the source of truth for quiz results.

quiz_cards:
- id
- user_id
- attempt_id
- card_type
- title
- score
- total_marks
- percentage
- rank_text nullable
- generated_at
- asset_file_id nullable

The generated card can contain:
- BEU BABA branding
- student display name
- quiz title
- score
- percentage
- correct/incorrect counts
- date
- short motivational line
- optional generated avatar
- unique verification code if desired

Do not expose contact number, email, internal UUIDs, or private account metadata on the shareable card.

If a verification QR code is implemented, it should point to a safe verification endpoint containing a non-sensitive public token rather than the student's internal ID.

# 12. BOOKMARKS, RECENT ACTIVITY AND PERSONALIZATION

Bookmarks are user-specific and should have a simple relational model.

bookmarks:
- id
- user_id
- resource_id nullable
- lesson_id nullable
- quiz_id nullable
- created_at

A database constraint or application rule must ensure that a bookmark references exactly one target type.

recently_viewed:
- id
- user_id
- entity_type
- entity_id
- viewed_at

The application should avoid storing unlimited history. A reasonable retention policy can keep the most recent N items per user or purge older records periodically.

Download records:
- id
- user_id
- resource_id
- file_id
- downloaded_at
- client_type

Download records should be used for useful product analytics, not invasive tracking. The system does not need to store IP addresses merely to know that a student downloaded a PDF.

# 13. USER RESOURCE UPLOAD AND ADMIN VERIFICATION

Students may upload educational resources. This creates a moderation boundary.

resource_submissions:
- id
- submitted_by
- title
- description
- resource_type
- subject_id nullable
- semester_id nullable
- academic_session_id nullable
- submission_status
- moderation_note
- reviewed_by
- reviewed_at
- created_at
- updated_at

submission_files:
- id
- submission_id
- storage_bucket
- object_path
- filename
- mime_type
- size_bytes
- checksum
- scan_status
- created_at

The submission flow must be:

Student selects Upload Resource.
→ Client validates basic file type and size.
→ File uploads into a private/quarantine location.
→ Submission row is created as pending.
→ Backend verifies ownership and metadata.
→ Optional malware/content scanning occurs.
→ Admin sees pending queue.
→ Admin previews metadata/file.
→ Admin approves, rejects, requests correction, or removes.
→ Approved submission can create or attach a published resource.
→ Student receives a status notification.

A student must never be able to set submission_status = approved from the browser.

Moderation actions should be immutable audit records:
- action
- previous_status
- new_status
- moderator_id
- reason
- created_at

Rejected resources should remain visible to the submitting student with a helpful reason when policy permits.

# 14. DEVELOPER DIRECT MESSAGE SYSTEM

BEU BABA should use a private student-to-developer communication model rather than a public chat room.

developer_conversations:
- id
- user_id
- subject
- status
- priority
- last_message_at
- created_at
- closed_at

developer_messages:
- id
- conversation_id
- sender_user_id nullable for system/developer identity
- sender_type
- message_text
- is_read
- created_at
- edited_at nullable

A student must be able to see only conversations where user_id equals their own authenticated identity.

Developer/admin users may see conversations according to their support permission.

A conversation can contain:
- course update request
- syllabus correction
- academic calendar correction
- bug report
- feature request
- account issue
- resource issue
- general support

The UI should not present this as social chat. It should look like a premium support inbox: glass message bubbles, clear timestamps, message status, subject header, attachments if enabled, and a clean reply composer.

Messages should be searchable by authorized developers, but search must not leak data across unauthorized roles.

# 15. NOTIFICATION DATA MODEL

Notifications should be database-backed so that users can see a notification center even if push delivery is unavailable.

notifications:
- id
- recipient_user_id
- type
- title
- body
- entity_type nullable
- entity_id nullable
- action_url nullable
- is_read
- created_at
- expires_at nullable

Examples:
- syllabus_updated
- calendar_updated
- resource_approved
- resource_rejected
- developer_reply
- quiz_result
- course_update
- important_notice

notification_preferences:
- user_id
- push_enabled
- academic_updates
- resource_updates
- support_replies
- course_updates
- quiz_updates
- marketing_enabled if marketing is ever added

The application should distinguish in-app notifications from browser push notifications. The database record is the source of truth for notification history. Push delivery is a delivery channel.

Notifications must not contain sensitive data in payloads. A push notification saying “Developer replied to your support message” is preferable to exposing the entire private message in a browser push payload.

# 16. ADMIN ROLES AND PERMISSIONS

Use role-based access control.

Suggested roles:
- student
- moderator
- content_editor
- support_agent
- administrator
- super_admin
- developer

Do not implement authorization with a frontend role string alone.

A permission system can include:
content.read
content.create
content.edit
content.publish
content.archive
resource.moderate
quiz.manage
syllabus.manage
calendar.manage
notice.manage
support.read
support.reply
student.read_basic
student.read_sensitive
analytics.read
admin.manage
settings.manage
audit.read

The principle of least privilege is mandatory.

For example:
A support agent may read student name and conversation history but should not automatically have permission to export every student's contact number.
A content editor may update syllabus content but should not manage authentication.
A moderator may approve resources but should not alter admin roles.
A super administrator may perform sensitive actions, but all such actions must be audited.

The admin panel should derive its visible modules from permissions, but backend policies must independently enforce them.

# 17. ROW LEVEL SECURITY STRATEGY

Supabase Row Level Security is a mandatory security layer.

Student profile policy:
- authenticated user can select own profile
- authenticated user can update own permitted profile fields
- user cannot change role, account_status, moderation fields, or other protected columns through unrestricted update policies

Bookmarks:
- user can select/insert/update/delete own bookmarks

Progress:
- user can select/insert/update own progress

Quiz attempts:
- user can create and read own attempts
- submitted attempts cannot be modified by normal student policy

Developer messages:
- student can read conversations where conversation.user_id = auth.uid()
- student can insert messages only into their own conversations
- developer/support roles can access authorized conversations

Published resources:
- authenticated users may read rows with publication_status = published and visibility appropriate to their account
- drafts and pending rows remain hidden

Submissions:
- submitter can read own submissions
- submitter can create own submissions
- submitter cannot directly approve or modify moderation fields

Audit logs:
- students cannot read audit logs
- only authorized admin roles may read them

Admin policies should use trusted role/permission information. Avoid fragile client-side claims.

RLS must be tested with at least:
1. Student A accessing Student B's profile.
2. Student A accessing Student B's quiz attempt.
3. Student A accessing Student B's developer conversation.
4. Student A reading pending resource submissions.
5. Student A attempting to set a resource to approved.
6. Ordinary user attempting to change role.
7. Moderator attempting to change super-admin permissions.
8. Unauthenticated user querying private tables.

# 18. INDEXING AND QUERY PERFORMANCE

The database must be optimized for actual screens.

Recommended indexes include:
- profiles(course_id)
- profiles(branch_id)
- profiles(current_semester_id)
- resources(subject_id, publication_status)
- resources(semester_id, publication_status)
- resources(resource_type, publication_status)
- resources(created_at desc)
- syllabus_documents(branch_id, academic_session_id, status)
- calendar_events(calendar_id, start_at)
- course_modules(course_id, sort_order)
- course_lessons(module_id, sort_order)
- lesson_progress(user_id, lesson_id)
- bookmarks(user_id, created_at desc)
- quiz_questions(quiz_id, sort_order)
- quiz_attempts(user_id, created_at desc)
- resource_submissions(submission_status, created_at)
- developer_conversations(user_id, last_message_at desc)
- developer_messages(conversation_id, created_at)
- notifications(recipient_user_id, is_read, created_at desc)
- audit_logs(created_at desc)
- audit_logs(actor_user_id, created_at desc)

Avoid indexing every column. Indexes consume storage and increase write cost.

Student home screen should use bounded queries. For example, “recent resources” should request perhaps 10–20 records, not every resource ever uploaded.

Search can use PostgreSQL full-text search for moderate datasets. If the content volume becomes large, a dedicated search engine can be introduced later. The schema should preserve stable IDs so migration is possible.

# 19. DATABASE QUERY CONTRACTS FOR THE FRONTEND

Frontend components should consume typed data contracts rather than raw, unpredictable database rows.

Example conceptual contract for a resource card:
{
  id,
  title,
  resourceType,
  subjectName,
  semesterName,
  year,
  thumbnailUrl,
  isBookmarked,
  createdAt
}

The database layer should perform joins needed for a screen, but should not return sensitive columns merely because they exist in the joined table.

A resource listing endpoint/query should not accidentally include:
- creator contact number
- private profile email
- moderation notes
- internal storage credentials
- private file paths
- unpublished revisions

A student dashboard query can aggregate:
- current student profile basics
- active semester
- featured resources
- upcoming calendar events
- unread notifications
- course progress summary
- recent quiz results

However, if a dashboard query becomes too complex, split it into multiple bounded queries and cache stable reference data.

Use TypeScript generated database types where available. Regenerate them whenever the schema changes.

# 20. CONTENT ADMINISTRATION WORKFLOW

Every educational entity should follow a predictable lifecycle.

Draft
→ Review
→ Approved
→ Published
→ Updated
→ Archived

Some content may use:
Draft
→ Published
→ Archived

The admin UI should show status clearly.

For every edit:
- show who changed it
- show when
- optionally show reason
- provide preview
- avoid accidental publication
- require confirmation for destructive operations

For high-impact records such as syllabus and examination calendar, use a stronger workflow:
1. Edit draft.
2. Validate dates and required fields.
3. Preview student view.
4. Compare against currently published version.
5. Publish.
6. Record audit log.
7. Trigger notification when applicable.

The student app should never depend on an administrator remembering to manually edit a React file. Database-driven content is mandatory.

# 21. SOFT DELETE, ARCHIVE AND RETENTION

Not every record should be physically deleted.

Use soft deletion for:
- published educational resources
- syllabus versions
- calendar versions
- notices
- moderation records
- audit records
- support conversations when legal/business policy requires retention

Use hard deletion where:
- data is purely temporary
- no audit value exists
- storage cleanup requires removal
- the user's explicit deletion rights require removal and retention is not legally required

Deleted records must not appear in normal student queries.

Storage objects require independent lifecycle handling. Deleting a database row does not automatically guarantee the binary object is deleted unless a controlled cleanup process exists.

A scheduled cleanup job can identify orphaned storage objects:
- object has no valid metadata record
- metadata is marked deleted beyond retention window
- upload failed permanently
- temporary object expired

Never build a cleanup job that blindly deletes files based only on age.

# 22. DATA VALIDATION AND INTEGRITY RULES

Database constraints should prevent invalid states wherever possible.

Examples:
- email-like fields validated at application/auth layer
- file_size_bytes >= 0
- marks >= 0
- negative_marks >= 0
- sort_order >= 0
- quiz duration >= 0
- event end must not precede event start
- completion_percent between 0 and 100
- score cannot exceed total marks unless explicitly supported
- one profile per auth user
- one progress row per user/lesson
- one bookmark per user/target
- one active syllabus version for a defined academic scope where business rules require it

Use CHECK constraints for simple invariants.

Use unique constraints for identity-like values such as:
- slug within an entity namespace
- subject code within a defined academic scope
- user_id + lesson_id
- user_id + resource_id

Do not depend on JavaScript validation alone. Browser validation improves UX; database constraints protect integrity.

# 23. STORAGE ARCHITECTURE

Storage should use private buckets for user uploads and private educational files unless a resource is explicitly intended to be public.

Suggested logical buckets:
- avatars
- resource-files
- submission-quarantine
- quiz-assets
- course-assets
- generated-cards
- message-attachments

Bucket names and object paths should not expose personal information.

Bad path:
students/abhishek/phone-number/important.pdf

Better:
user-content/{user_uuid}/submissions/{submission_uuid}/{random_filename}.pdf

For public resources, consider signed URLs or controlled proxy access depending on requirements. A signed URL should be short-lived when the content is sensitive or access-controlled.

File uploads require:
- extension validation
- MIME validation
- size limit
- filename normalization
- object path randomization
- optional checksum
- malware scanning where available
- authorization check
- moderation state

Never trust the file extension alone.

Images should be resized/compressed for avatars and thumbnails. Preserve originals only when required.

# 24. PROFILE AVATAR AND GENERATED CHARACTER DATA

The profile system supports two avatar modes:
1. Uploaded image.
2. Automatically selected BEU BABA generated character.

The database should store which mode is active.

If a user uploads a profile image:
- store file metadata
- validate type and size
- create optimized variants
- associate the approved image with the profile
- optionally retain a previous image for a short cleanup window
- never expose the original private storage path directly

If the application automatically selects a character based on gender, the character should be represented by a stable character record:
profile_characters
- id
- character_name
- gender_category
- asset_file_id
- is_active
- sort_order

The application should choose from active characters. This lets an administrator replace character assets without changing application code.

If the user later uploads a photo, avatar_type becomes uploaded. If they remove the uploaded photo and choose generated avatar, the generated character becomes active again.

# 25. SEARCH AND FILTER ARCHITECTURE

The application will likely need search across:
- subjects
- resources
- PYQs
- syllabus topics
- quizzes
- courses
- notices

Search should be scoped.

A student searching “DBMS” should be able to find:
- DBMS subject
- DBMS notes
- DBMS PYQs
- DBMS quiz
- DBMS course lesson

Filters can include:
- course
- branch
- semester
- subject
- year
- resource type
- difficulty
- file type

The UI should show filter chips using the transparent glass design. Filters should be reflected in URL query parameters where appropriate so that a result can be shared or revisited.

Search queries should have sensible limits and should not cause a query for thousands of rows. Debounce search input at the frontend and use indexed database search.

# 26. ADMIN DASHBOARD DATA REQUIREMENTS

The admin dashboard should be driven by aggregate queries.

Important metrics:
- total active students
- new registrations
- pending resource submissions
- approved resources
- pending moderation
- published resources
- active courses
- active quizzes
- unread support conversations
- syllabus versions
- upcoming calendar events
- notification delivery summary

Student list:
- name
- course
- branch
- semester
- email where permitted
- contact number only for authorized roles
- registration date
- status
- last active timestamp if collected

The list must support:
- search
- filters
- sorting
- pagination
- export only if authorized
- profile drill-down

Sensitive information should be hidden by default and revealed only when the administrator has a legitimate permission.

The admin panel should never query all students into the browser and filter them in JavaScript.

# 27. AUDIT LOGGING

Audit logging is mandatory for privileged changes.

audit_logs:
- id
- actor_user_id
- action
- entity_type
- entity_id
- previous_state or change_summary
- new_state or change_summary
- reason
- request_id where available
- created_at

Examples:
- admin published syllabus
- moderator approved student resource
- administrator changed calendar event
- support agent closed conversation
- admin changed student status
- administrator changed course price
- role permission changed

Avoid storing secrets in audit logs.

For large JSON records, store a structured diff rather than full duplicate snapshots when practical.

Audit logs should be append-only for normal administrators. A super-admin may have restricted archival capability, but the system should avoid allowing ordinary users to edit or delete audit entries.

# 28. CONTENT REVISION SYSTEM

Content revisions make educational maintenance safe.

Every major editable content type should support revision history:
- syllabus
- calendar
- notice
- course
- lesson
- resource metadata
- quiz

A revision record can include:
revision_number
entity_id
entity_type
changed_by
change_type
change_summary
snapshot_json
created_at

The admin interface should show:
Current
Previous
Changes

For structured syllabus content, show unit/topic additions, removals, and edits. For calendar changes, show old date → new date prominently.

This is particularly important for examination dates because a simple timestamp edit can have significant student impact.

# 29. PERFORMANCE, CACHING AND DATA FRESHNESS

Not all data needs the same freshness.

Highly dynamic:
- developer messages
- unread notifications
- quiz attempt state
- moderation queue

Moderately dynamic:
- resources
- notices
- course progress

Slow-changing:
- course list
- branch list
- semester list
- subject list
- generated character catalog

Cache slow-changing reference data more aggressively.

When an admin publishes a syllabus, calendar, notice, or resource, invalidate relevant caches or use a freshness strategy that makes the new content available quickly.

Do not cache private student data in a shared cache.

PWA service workers must be especially careful. Public static assets can be cached aggressively. Private API responses should not be placed into a shared static cache without an explicit security strategy.

# 30. OFFLINE AND PWA DATA RULES

BEU BABA is expected to behave like a premium PWA. Offline capability should focus on safe, useful content.

Safe candidates for caching:
- app shell
- icons
- fonts where licensed
- public/static illustrations
- selected public educational metadata
- recently opened non-sensitive content when appropriate

Do not blindly cache:
- private student profile
- contact number
- developer conversations
- admin pages
- private quiz answer keys
- authentication responses
- sensitive notifications

When offline:
- show a clear offline indicator
- allow reading of already cached safe content
- queue only explicitly supported non-sensitive actions
- do not pretend a message was delivered when it is only locally queued
- reconcile queued actions when connectivity returns

For developer messages, the safest initial design is to require an online connection for sending and show clear delivery state.

# 31. MIGRATION STRATEGY

Database schema changes must be performed through version-controlled migrations.

Never make manual production changes without recording them in the migration history.

Migration sequence:
1. Create new table/column.
2. Deploy compatible backend code.
3. Backfill data if necessary.
4. Verify constraints.
5. Switch application queries.
6. Remove deprecated fields only after safe migration.

Avoid breaking changes in a single deployment.

Example:
If resource_type changes from free text to a relational reference:
- add resource_type_id
- populate it
- deploy code reading the new field
- verify
- eventually remove old field

Seed data should be versioned separately from migrations when appropriate.

# 32. SEED DATA AND INITIAL BEU BABA CONTENT

Initial seed data should include:
- BEU BABA system settings
- academic course definitions
- branches
- semesters
- subjects
- resource categories
- quiz question types
- notification types
- moderation statuses
- admin role definitions
- permissions
- generated character catalog

Do not seed fake student accounts into production.

Educational data imported from an existing application or source must be normalized and reviewed. Duplicate resources should be detected where possible.

For imported PYQs:
- normalize title
- identify year
- identify semester
- identify subject
- preserve original file
- store source metadata
- mark imported content appropriately
- publish only after verification

For syllabus:
- preserve original PDF
- extract structured units/topics when reliable
- retain source reference
- associate academic session
- require admin verification before publication.

# 33. DATA IMPORT AND BULK ADMIN TOOLS

Administrators should eventually be able to bulk import:
- subjects
- PYQs
- resources
- syllabus topics
- calendar events
- quiz questions

CSV/Excel import must use a validation pipeline:
Upload
→ Parse
→ Validate
→ Preview errors
→ Confirm
→ Insert into draft state
→ Review
→ Publish

Never directly publish every imported row.

The preview should identify:
- missing subject
- invalid semester
- duplicate title
- unsupported file
- invalid year
- unknown branch
- malformed date

For bulk imports, use transactions or controlled batches so that a failure does not leave half-valid data without a clear state.

# 34. ERROR HANDLING AND USER-FACING STATES

Database failures must not expose SQL errors, stack traces, or internal implementation details.

Every data-driven screen should have:
- loading state
- empty state
- error state
- retry state
- offline state when relevant

Examples:
No PYQs found:
“PYQs for this subject haven't been added yet.”

Resource failed:
“We couldn't load this resource. Please try again.”

Permission denied:
“You don't have access to this content.”

Admin moderation failure:
“Unable to update moderation status. No changes were applied.”

Errors should be logged internally with a correlation/request ID where possible.

# 35. DATA PRIVACY PRINCIPLES

BEU BABA stores student information such as name, email, contact number, course, branch, semester, profile image, activity, and support messages. The architecture must minimize unnecessary collection and exposure.

Rules:
- collect only fields needed for product functionality
- make private fields private
- never expose contact numbers in public resource pages
- do not publish student email addresses
- do not expose support messages to other students
- do not put sensitive information in public URLs
- avoid unnecessary analytics identifiers
- provide account deletion controls according to product/legal requirements
- document retention periods
- protect administrator exports
- avoid sending sensitive data through push notification payloads

The database schema should make privacy the default rather than requiring every frontend developer to remember every restriction.

# 36. SECURITY TEST MATRIX

Before production, execute at least these tests:

Identity:
- unauthenticated user cannot access student-private data
- student can access own profile
- student cannot access another profile's private data
- student cannot change own role

Resources:
- draft resource hidden from students
- pending submission hidden from other students
- rejected submission not public
- approved published resource visible
- deleted resource hidden

Files:
- unauthorized user cannot access private file
- student cannot guess another student's object path
- invalid MIME upload rejected
- oversized file rejected
- quarantine file inaccessible publicly

Quiz:
- correct answer not exposed before submission
- score cannot be forged
- submitted attempt cannot be altered
- student cannot access another attempt

Support:
- student sees only own conversation
- developer sees authorized conversations
- student cannot impersonate developer
- attachments respect conversation permissions

Admin:
- moderator cannot grant super-admin
- content editor cannot access sensitive student data
- audit logs cannot be modified by ordinary users

PWA:
- private API data is not accidentally cached publicly
- logout clears sensitive client state
- expired sessions do not continue accessing private endpoints.

# 37. UI DATA MAPPING FOR THE PREMIUM GLASS INTERFACE

The data layer should support the visual system without polluting database records with styling decisions.

Do not store arbitrary Tailwind classes in database content unless there is a strong controlled use case.

Instead, store semantic fields:
- resource_type
- priority
- featured
- status
- category

The UI maps semantic states to the visual language.

Example:
featured = true → elevated glass card with a restrained accent
priority = high → stronger border and icon treatment
status = approved → subtle success indicator

The glass UI must remain light and transparent:
- translucent white surfaces
- backdrop blur
- soft neutral borders
- low-opacity shadows
- gentle blue/indigo or system-like accent use
- no black glass
- no neon RGB
- no glowing cyberpunk edges
- no animated 3D objects behind every screen

Animations should be used for navigation, card interaction, search, loading, and content transitions rather than as decorative noise.

# 38. DATA-DRIVEN HOME SCREEN

The home screen should not be a static collage.

Recommended data sections:
1. Greeting and student identity.
2. Current course/branch/semester.
3. Quick actions.
4. Upcoming academic event.
5. Continue learning.
6. Recently viewed.
7. Recommended resources.
8. Quiz shortcut.
9. Latest notices.
10. Support shortcut.

Each section should have a bounded query and skeleton state.

The interface can use horizontally scrollable glass cards, but the database should return only enough records for the initial viewport plus a small prefetch window.

For example:
featured resources = 5
upcoming events = 3
recent lessons = 4
recent quizzes = 3

Load additional content only when the user enters the relevant section.

# 39. STUDENT TOOLBOX DATA MODEL

The Student Toolbox can contain 10+ daily-life utilities such as:
- GPA/CGPA calculator
- percentage calculator
- attendance calculator
- unit converter
- age calculator
- EMI calculator
- time calculator
- study timer
- exam countdown
- notes scratchpad
- checklist
- QR generator if included
- text utilities

Pure calculators do not require database storage unless the user wants history.

If saved history is introduced, store only the minimum:
tool_type
user_id
input_data JSONB
result JSONB
created_at

Do not store unnecessary personal data inside tool inputs.

For sensitive calculators, such as finance-related calculations, clearly distinguish local calculations from server-stored history.

# 40. SYSTEM SETTINGS AND REMOTE CONFIGURATION

A controlled system_settings table can allow administrators to change non-code configuration.

Examples:
- app announcement
- maintenance mode
- support contact label
- default resource page size
- upload size limits
- feature toggles
- quiz card footer
- academic year display
- default character selection behavior

Sensitive infrastructure secrets must never be stored in ordinary editable system settings.

Settings should have:
- key
- value_json
- description
- is_public
- updated_by
- updated_at

Public settings can be safely exposed to the student application after authorization rules. Private settings remain admin-only.

# 41. API AND SERVICE LAYER RULES

The frontend should not spread direct database access across dozens of components.

Use a data/service layer:
- authService
- profileService
- academicService
- resourceService
- quizService
- courseService
- supportService
- notificationService
- adminService

Each service should:
- validate inputs
- call the approved database/API operation
- return typed data
- normalize errors
- avoid leaking sensitive fields

Complex operations such as quiz scoring, moderation, bulk import, and role management should use secure server-side functions or API routes rather than trusting browser calculations.

# 42. TRANSACTIONAL OPERATIONS

Operations that modify multiple related records should be atomic where possible.

Examples:
Publishing a syllabus:
- mark new version published
- supersede old version
- create audit record
- optionally create notification

Approving a submission:
- update submission status
- create or update resource
- link files
- create moderation action
- create notification

Submitting quiz:
- lock attempt
- calculate score
- store answers
- update attempt
- create result notification

If these operations partially succeed, the system can enter inconsistent states. Use database transactions or a server-side function capable of executing the operation atomically.

# 43. DATA CONSISTENCY FOR ACADEMIC UPDATES

Academic content can change after students have already bookmarked or viewed it.

Bookmarks should reference stable resource IDs. If resource metadata changes, the bookmark should still work.

If a resource is replaced by a new version:
- either update the same resource with revision history
- or create a new resource and explicitly mark the old one superseded

For syllabus:
students should be able to identify the applicable academic session.

For calendar:
events should be versioned or audited so that changed dates can be explained.

For PYQs:
the year should remain immutable once verified unless a correction is necessary. Corrections should be audited.

# 44. DEVELOPER EXPERIENCE AND CODING AGENT INSTRUCTIONS

Any coding agent implementing BEU BABA must read this document before generating database code.

The agent must:
1. inspect existing migrations before creating new tables
2. never overwrite production schema blindly
3. use TypeScript types
4. implement RLS for every user-sensitive table
5. avoid service-role keys in browser code
6. use environment variables for secrets
7. never hardcode educational data into UI components
8. create seed scripts for reference data
9. document every migration
10. test authorization with multiple users
11. keep database queries bounded
12. use indexes for common filters
13. create foreign keys deliberately
14. avoid cascading deletion unless explicitly approved
15. maintain auditability for admin actions
16. preserve content revisions
17. keep file metadata separate from storage binaries
18. never expose quiz answer keys prematurely
19. never trust client-provided scores
20. never trust client-provided admin status

When adding a feature, the agent must answer:
- What tables are needed?
- What relationships are needed?
- Who can read the data?
- Who can write it?
- What is the lifecycle?
- Does it require an audit log?
- Does it require a storage object?
- Does it contain private data?
- Does it need an index?
- Does it need a notification?
- What happens when the referenced entity is deleted?
- What happens offline?
- What happens if two admins edit the same content?

# 45. FINAL PRODUCTION CHECKLIST

Database:
[ ] PostgreSQL/Supabase schema created through migrations
[ ] Primary keys and foreign keys defined
[ ] Required unique constraints defined
[ ] CHECK constraints defined where useful
[ ] Indexes created for actual queries
[ ] UTC timestamps used consistently
[ ] Soft-delete rules documented

Identity:
[ ] Auth handled by Supabase Auth
[ ] profiles linked to auth.users
[ ] private profile fields protected
[ ] roles protected
[ ] avatar storage protected

Academic:
[ ] courses
[ ] branches
[ ] semesters
[ ] subjects
[ ] academic sessions
[ ] subject offerings
[ ] syllabus versioning
[ ] calendar versioning

Content:
[ ] resources
[ ] resource files
[ ] publication workflow
[ ] moderation workflow
[ ] revision history
[ ] notices
[ ] external links

Learning:
[ ] courses
[ ] modules
[ ] lessons
[ ] progress
[ ] access control

Quiz:
[ ] quizzes
[ ] questions
[ ] options
[ ] attempts
[ ] answers
[ ] server-side scoring
[ ] result cards

User features:
[ ] bookmarks
[ ] recent activity
[ ] downloads
[ ] toolbox where persistence is required

Communication:
[ ] private student/developer conversations
[ ] message permissions
[ ] read state
[ ] attachment security

Notifications:
[ ] notification table
[ ] preferences
[ ] unread count
[ ] safe payload design

Admin:
[ ] roles
[ ] permissions
[ ] moderation
[ ] audit logs
[ ] content revisions
[ ] bulk import validation

Security:
[ ] RLS enabled
[ ] storage policies enabled
[ ] no service keys in frontend
[ ] no private URLs exposed
[ ] quiz answers protected
[ ] cross-user tests passed
[ ] admin escalation tests passed

UX/data:
[ ] loading states
[ ] empty states
[ ] error states
[ ] offline states
[ ] pagination
[ ] search
[ ] filters
[ ] light transparent glass presentation
[ ] no dark/RGB/AI-background styling

The database is considered production-ready only when data integrity, authorization, moderation, content lifecycle, storage security, and operational recovery have all been tested. The visual interface may change over time, but the underlying data contracts must remain stable and intentional.

END OF SPECIFICATION

# APPENDIX A — FIELD NAMING, TYPES AND IMPLEMENTATION CONVENTIONS

Use snake_case in PostgreSQL and camelCase in TypeScript DTOs. UUID primary keys should use gen_random_uuid() where supported. Foreign key columns should end in _id. Date-only values should use date; precise instants should use timestamptz. Boolean columns should use explicit positive names such as is_active, is_published, is_read rather than ambiguous flags.

Recommended common fields:
id UUID NOT NULL PRIMARY KEY
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
deleted_at TIMESTAMPTZ NULL

For updated_at, use a database trigger or controlled server-side update strategy so that it cannot be forgotten by individual queries.

Status fields should use controlled values. PostgreSQL enums are acceptable for stable system states, but text plus CHECK constraints can be easier to evolve. The decision must be consistent across the project.

# APPENDIX B — EXAMPLE RELATIONSHIP MAP

profiles.course_id → courses.id
profiles.branch_id → branches.id
profiles.current_semester_id → semesters.id
profiles.academic_session_id → academic_sessions.id

branches.course_id → courses.id
semesters.course_id → courses.id

subjects.course_id → courses.id
subjects.branch_id → branches.id

subject_offerings.subject_id → subjects.id
subject_offerings.semester_id → semesters.id
subject_offerings.academic_session_id → academic_sessions.id

resources.subject_id → subjects.id
resources.semester_id → semesters.id
resources.branch_id → branches.id
resources.course_id → courses.id

resource_files.resource_id → resources.id

syllabus_documents.course_id → courses.id
syllabus_documents.branch_id → branches.id
syllabus_documents.academic_session_id → academic_sessions.id

syllabus_units.syllabus_id → syllabus_documents.id
syllabus_topics.unit_id → syllabus_units.id

academic_calendars.academic_session_id → academic_sessions.id
calendar_events.calendar_id → academic_calendars.id

learning_courses.id → course_modules.course_id
course_modules.id → course_lessons.module_id
course_lessons.id → lesson_progress.lesson_id

quizzes.id → quiz_questions.quiz_id
quiz_questions.id → quiz_options.question_id
quizzes.id → quiz_attempts.quiz_id
quiz_attempts.id → quiz_attempt_answers.attempt_id

profiles.id → bookmarks.user_id
profiles.id → developer_conversations.user_id
developer_conversations.id → developer_messages.conversation_id
profiles.id → notifications.recipient_user_id

# APPENDIX C — EXAMPLE RESOURCE LIFECYCLE

A new official PYQ:
1. Admin creates resource draft.
2. Admin attaches verified PDF.
3. Metadata is entered: subject, branch, semester, year, exam type.
4. Admin previews student card.
5. Admin publishes.
6. Student sees it in the appropriate subject/PYQ screen.
7. Student bookmarks/downloads it.
8. If corrected later, revision history is created.
9. If replaced, old version is archived/superseded.
10. Audit log records every privileged action.

A student-contributed note:
1. Student uploads file.
2. Submission is pending.
3. File remains in private/quarantine storage.
4. Admin reviews.
5. Admin rejects or approves.
6. If approved, a published resource is created/linked.
7. Student receives a notification.
8. Other students see only the approved publication.

# APPENDIX D — EXAMPLE SYLLABUS UPDATE

Current:
Semester 1 → Mathematics I → Unit 3 → Topic A

Administrator creates revision:
Semester 1 → Mathematics I → Unit 3 → Topic A + Topic B

The old published syllabus remains intact.
The new revision is draft.
After validation it becomes published.
The previous version is marked superseded.
Students mapped to the affected academic session receive an optional notification.
Audit record contains the editor and reason.
No frontend deployment is required.

# APPENDIX E — EXAMPLE CALENDAR UPDATE

Current event:
Mid-Semester Examination — 2026-10-10

New date:
2026-10-14

Admin edits the draft/version.
The UI displays a prominent date change.
Publishing updates the active calendar.
An audit record stores old and new values.
A notification can be created:
Title: Academic Calendar Updated
Body: An examination date has been changed. Open the calendar to view the latest schedule.

Do not send the entire calendar through a push payload.

# APPENDIX F — EXAMPLE QUIZ SECURITY FLOW

Student requests quiz.
Server returns published question text and options but does not expose correct answers.
Student starts attempt.
Server creates attempt with user_id.
Student submits selected option IDs.
Server verifies that each option belongs to the corresponding quiz question.
Server calculates score.
Server writes answers and score atomically.
Server marks attempt submitted.
Client receives result.
A quiz card can be generated from the trusted result.
Student cannot modify the score from browser developer tools.

# APPENDIX G — EXAMPLE SUPPORT SECURITY FLOW

Student A creates Conversation A.
Student B creates Conversation B.

A can:
read A
send message to A
mark A messages read

A cannot:
read B
send to B
guess B's attachment URL
change developer reply
change conversation ownership

Developer/support user with permission can:
read authorized conversations
reply
change status
set priority
close conversation

Every privileged change is audited.

# APPENDIX H — REQUIRED DESIGN-DATA SEPARATION

Database records describe meaning, not decoration.

Good:
resource_type = "pyq"
featured = true
priority = "high"

Bad:
card_class = "backdrop-blur-xl bg-white/60 shadow-2xl..."
animation_name = "magic-glow-03"

The frontend owns the visual system. This keeps the database clean and allows the premium Apple-like glass interface to evolve without rewriting content records.

The intended visual system is:
light background
transparent white glass surfaces
backdrop blur
fine borders
soft depth
restrained accent colors
high readability
subtle interaction motion
clean navigation
no dark cyberpunk background
no RGB glow
no artificial 3D background objects
no unnecessary AI-themed decoration

# APPENDIX I — OPERATIONAL RULE

When an administrator asks, “Can I change this without changing code?”, the preferred answer for educational content should be yes.

Therefore:
- syllabus → database/admin
- yearly calendar → database/admin
- PYQ → database/admin
- notes → database/admin
- quiz → database/admin
- notices → database/admin
- course metadata → database/admin
- developer/support information → controlled configuration/admin
- generated character catalog → database/admin

Only true application behavior should require a code deployment.

# APPENDIX J — ACCEPTANCE STANDARD

A developer should not mark this architecture complete merely because tables exist. Completion requires:

1. Correct relationships.
2. Correct permissions.
3. Correct storage policy.
4. Correct lifecycle.
5. Correct indexes.
6. Correct validation.
7. Correct audit behavior.
8. Correct student/admin separation.
9. Correct error handling.
10. Correct frontend data contracts.
11. Correct PWA caching boundaries.
12. Correct migration strategy.
13. Successful cross-user authorization tests.
14. Successful content publication tests.
15. Successful syllabus/calendar revision tests.
16. Successful quiz security tests.
17. Successful student upload moderation tests.
18. Successful private support-message tests.
19. Successful deletion/archive behavior.
20. Successful production-like load testing for the most frequently visited screens.

This document should be treated as the source of architectural truth for BEU BABA's database and data layer. Any implementation decision that contradicts these rules must be explicitly documented and approved before being introduced into production.


# APPENDIX K — DETAILED SCREEN-TO-DATA CONTRACTS

## K.1 Home Screen

The home screen should consume a dedicated, bounded data composition rather than requesting the entire database. The identity portion contains only the fields needed for the greeting, such as display name, active course, branch, semester and avatar reference. The academic portion contains the nearest relevant calendar event and the current academic session. The learning portion contains a small number of continue-learning records ordered by last_viewed_at. The resource portion contains featured or recent published resources. The notification portion contains only the unread count or a small notification preview.

A home screen should not directly join every resource, every subject, every quiz and every student record. Large joins make the first render slow and increase the chance of accidentally returning private fields. The service layer should compose separate queries or a secure server-side function with a deliberately narrow return shape.

The UI can present these records as:
- compact transparent glass identity card
- horizontally scrolling quick-action cards
- upcoming-event glass card
- continue-learning cards
- resource carousel
- quiz card
- notice card

The database should not know that the interface uses a carousel. The database knows order and priority; the frontend decides whether that becomes a carousel, list, grid, or another presentation.

## K.2 Resource Library

A resource-library screen should support:
- all resources
- notes
- PYQs
- syllabus documents
- practical resources
- images
- links
- recently added resources

The query should accept:
course
branch
semester
subject
resource_type
year
search_text
sort
page

The default sort can be newest or relevance depending on the screen. The user should be able to switch to oldest/newest/year where appropriate.

Every resource result should contain enough information to render the card without a second request for each item. Avoid the N+1 query pattern.

The card should normally show:
title
resource type
subject
year
file format
optional file size
bookmark state
optional featured indicator

The card should not show moderation notes or creator contact information.

## K.3 Subject Detail

Subject detail can combine:
- subject metadata
- syllabus
- notes
- PYQs
- quizzes
- linked courses
- recent resources

The subject query must resolve the student's academic context first. A subject named “Mathematics I” can exist in more than one academic structure. The UI should therefore not assume that the first matching subject is the correct one.

## K.4 Profile

The profile screen needs:
- display name
- email
- contact number where appropriate
- course
- branch
- semester
- academic session
- avatar
- generated character
- account settings
- notification settings
- support shortcut
- logout
- account deletion

The profile query must return private information only for the authenticated user. Administrative profile views must use a separate authorized query rather than reusing the student's profile endpoint with a hidden “admin=true” parameter.

# APPENDIX L — CONCURRENCY AND MULTI-ADMIN EDITING

BEU BABA may eventually have multiple administrators editing content. The architecture should therefore consider concurrent updates.

A basic protection is an updated_at comparison:
1. Admin loads record.
2. Admin edits record.
3. Update includes the version/timestamp originally loaded.
4. Database updates only if the version is still current.
5. If another admin changed the record, the update is rejected as a conflict.
6. UI asks the administrator to reload and compare.

For high-value content such as examination calendars and syllabi, this is preferable to silently overwriting another administrator's work.

A stronger approach uses an integer version column:
version integer not null default 1

Every successful update increments version.

The client submits expected_version.
The server performs a conditional update.
If zero rows are affected, a concurrency conflict occurred.

Do not solve concurrency by allowing the last browser request to overwrite everything without warning.

# APPENDIX M — DATA QUALITY RULES FOR EDUCATIONAL CONTENT

Educational data needs stronger quality controls than ordinary CMS content.

For PYQs:
- year should be valid
- semester should be selected
- subject should be resolved
- exam type should be selected where known
- original source should be recorded where available
- file should be readable
- duplicate detection should be attempted

For syllabus:
- academic session required
- course required
- branch required when branch-specific
- units should have stable ordering
- topics should belong to units
- publication status explicit
- effective period must be valid

For calendar:
- date/time required
- event title required
- overlapping events should be allowed only when legitimate
- examination events should have high visibility
- changes should create an audit record

For quizzes:
- every question must have valid options
- at least one correct option for single-answer questions
- correct-option count must match question type
- marks must be valid
- duration must be non-negative
- published quiz cannot contain an unpublished question

The admin panel should perform these validations before publication.

# APPENDIX N — DUPLICATE DETECTION

Duplicate educational resources can damage trust. A simple title match is not sufficient because two different files can share the same title.

Possible duplicate signals:
- same checksum
- same normalized filename
- same subject/year/resource type
- same file size
- similar title
- same source reference

Checksum is especially useful for detecting identical files. The checksum should be generated from the uploaded object where feasible and stored in resource_files.

The system should not automatically delete duplicates. Instead, it can warn:
“An identical file already exists for this subject and year.”

An administrator can decide whether to:
- cancel upload
- attach existing resource
- publish as a separate version
- keep as replacement

# APPENDIX O — FILE VERSIONING

If a resource's PDF is replaced, the old file should not necessarily disappear immediately.

A resource can have multiple file records:
- version 1
- version 2
- current

The resource points to the current primary file.
Old files can remain archived according to retention policy.

This is useful when an administrator discovers that a question paper scan is incomplete and replaces it with a clearer scan. Students who bookmarked the resource continue using the same resource ID while the underlying file changes.

If historical file access is required, the UI can show a “previous versions” section to authorized users.

# APPENDIX P — NOTIFICATION TRIGGERS

Notification creation should be based on business events rather than scattered frontend calls.

Examples:
publishResource(resourceId)
→ resource published event
→ notification service determines affected users
→ creates in-app notifications
→ optional push delivery

publishSyllabusRevision(syllabusId)
→ syllabus published
→ identify affected academic scope
→ create notifications
→ optionally record notification source entity

developerReply(messageId)
→ support conversation updated
→ recipient notification created

This architecture prevents duplicate notifications when both admin frontend and backend attempt to create the same message.

Notification records should have an idempotency strategy for events that may be retried.

# APPENDIX Q — IDEMPOTENCY

Operations that may be retried must not create duplicate records.

Examples:
- quiz submission
- notification creation
- payment confirmation if payments are later introduced
- bulk import
- resource approval
- generated card creation

An idempotency key can be stored for operations that require it.

For quiz submission, an attempt should have a clear submitted state. Once submitted, another submission request must return the existing result rather than creating a second result.

For resource moderation, approving an already approved submission should not create a second resource accidentally.

# APPENDIX R — FUTURE PAYMENT-READY STRUCTURE

If paid courses are later introduced, the database should not place payment status directly into learning_courses. A course describes the product. A separate enrollment/access system describes who has access.

Potential future tables:
course_products
orders
order_items
payments
course_enrollments
access_grants

This keeps the architecture flexible.

A student's access should be derived from:
- free course rule
- active enrollment
- manual admin grant
- expired enrollment
- refund/revocation state

The browser must never decide that a paid course is unlocked merely because localStorage says “purchased.”

Even though payment may not be implemented immediately, the learning model should avoid hardcoding “paid” into dozens of lesson components.

# APPENDIX S — FUTURE MULTI-UNIVERSITY EXTENSION

BEU BABA may initially focus on a specific university/academic structure. The schema should still keep university as a top-level reference.

This permits future data such as:
University A
→ B.Tech
→ CSE
→ Semester 1

and:
University B
→ B.Tech
→ CSE
→ Semester 1

without mixing subjects, calendars and syllabi.

The application branding can remain BEU BABA while the content engine becomes multi-institution capable if the product later requires it.

However, multi-university capability should not add unnecessary complexity to the first release. The architecture should be extensible without building unused screens.

# APPENDIX T — BACKUP AND RECOVERY

A production educational database requires backups.

Backups should cover:
- PostgreSQL data
- migration history
- storage object metadata
- critical storage files
- configuration required for restoration

A backup is useful only if restoration has been tested.

At least periodically:
1. restore into a non-production environment
2. verify database integrity
3. verify storage references
4. test authentication integration
5. test critical student flows
6. document recovery procedure

Do not assume a cloud provider's backup feature automatically guarantees that every application-level recovery scenario works.

# APPENDIX U — ANALYTICS WITH MINIMAL DATA

Useful analytics can include:
- resource views
- quiz starts
- quiz completions
- lesson completion
- downloads
- search terms
- feature usage
- support response time

Analytics should answer product questions without collecting excessive personal information.

Example:
“How many students opened a Mathematics I PYQ?”

Store aggregate/event information necessary for that question. Avoid collecting full browsing histories indefinitely.

Analytics should be separated from operational tables where practical. This prevents reporting queries from slowing down student-facing transactions.

# APPENDIX V — RATE LIMITING AND ABUSE CONTROL

The database cannot be the only abuse-control mechanism.

Potential abuse:
- rapid resource uploads
- repeated quiz submissions
- spam support messages
- notification abuse
- brute-force queries
- oversized upload attempts

Use server-side rate limits for expensive operations.

Database constraints should still protect integrity if rate limiting fails.

For support:
- limit message frequency
- limit attachment size/count
- optionally prevent empty messages

For uploads:
- limit file size
- limit daily submission volume
- require authenticated user
- validate file type
- quarantine before publication

# APPENDIX W — LOCAL STORAGE AND CLIENT STATE

The frontend may store non-sensitive convenience state:
- selected filters
- UI preferences
- last selected tab
- theme/system preference
- temporary draft text if explicitly designed

Do not store:
- passwords
- service keys
- long-lived sensitive tokens outside the authentication library's supported mechanism
- private student datasets
- admin permissions as authoritative state
- quiz answer keys for future manipulation

Any locally stored role information is only a display hint. Authorization always comes from the server/database.

# APPENDIX X — FINAL IMPLEMENTATION ORDER

Recommended implementation order:

Phase 1:
Supabase project
Auth
profiles
courses
branches
semesters
subjects
RLS

Phase 2:
resources
resource_files
storage policies
admin resource management

Phase 3:
syllabus
calendar
notices
revision/audit system

Phase 4:
learning courses
modules
lessons
progress

Phase 5:
quiz engine
attempts
server-side scoring
quiz cards

Phase 6:
student uploads
moderation
reports

Phase 7:
developer support messaging
notifications
preferences

Phase 8:
toolbox persistence where actually required
analytics
bulk import
advanced admin controls

At each phase, security and data integrity should be completed before adding more UI.

# APPENDIX Y — DEFINITION OF DONE FOR THE DATA LAYER

The BEU BABA data layer is done only when a fresh developer can answer all of these questions from the repository:

Where is the student profile stored?
How is it connected to auth.users?
Where is course and branch information stored?
How is semester determined?
How does the app select the correct syllabus?
How can an admin change a syllabus without deploying code?
How can an admin change the yearly calendar?
How does a student upload a resource?
Why does that resource remain hidden until approval?
How does an admin approve it?
Who can see moderation notes?
Where is the original uploaded file stored?
How is the file protected?
How does the quiz prevent answer-key leakage?
How is a quiz score calculated?
How is a result card generated?
How are bookmarks stored?
How is course progress stored?
How does a student message the developer?
Why can another student not read that conversation?
How are notifications stored?
How are admin changes audited?
What happens when a resource is deleted?
What happens when a syllabus is replaced?
What happens when two administrators edit simultaneously?
What happens if the browser is offline?
What data is cached by the PWA?
What data is intentionally never cached?
How are database migrations applied?
How are backups restored?

If any answer is “the frontend handles it,” the architecture should be reviewed. Important integrity and authorization rules belong at the server/database boundary.

# APPENDIX Z — MASTER PRINCIPLE

BEU BABA must be built as a data-driven educational platform, not as a collection of static pages.

The student experience should feel simple:
open app
log in
see personal academic dashboard
find notes/PYQs
study
take quiz
save result
track learning
check calendar
read syllabus
send support message

Behind that simple experience, the architecture must be disciplined:
identity is separate from content;
content is separate from moderation;
moderation is separate from publication;
publication is separate from presentation;
files are separate from metadata;
quiz questions are separate from attempts;
private communication is separate from public content;
audit history is separate from current state;
and permissions are enforced at the backend boundary.

The visual design may be premium transparent glass, but the data layer must be intentionally boring, predictable, secure, and maintainable. This separation is what allows BEU BABA to look advanced without becoming technically fragile.

END OF BEU BABA DATABASE DATA ARCHITECTURE — MASTER SPECIFICATION
