# BEU BABA — 13. DATABASE, SUPABASE, STORAGE, RLS & BACKEND ARCHITECTURE SPECIFICATION

## Document Status

- **Project:** BEU BABA
- **Document:** 13 — Database, Supabase, Storage, RLS & Backend Architecture
- **Purpose:** Production-grade backend foundation for the BEU BABA student application and administration platform
- **Primary backend direction:** Supabase
- **Frontend assumption:** React + Vite
- **Primary database:** PostgreSQL through Supabase
- **Authentication:** Supabase Auth
- **File storage:** Supabase Storage, with optional external object storage abstraction
- **Realtime:** Supabase Realtime where genuinely useful
- **API approach:** Supabase client + database RPC/functions + server-side Edge Functions where security or third-party secrets require them
- **Core design principle:** The frontend must never be treated as a trusted environment.
- **Security principle:** Every user-visible operation must be authorized by the database or a trusted server boundary.
- **Data principle:** Content, user profile data, moderation state, permissions, analytics, notifications, and support conversations must have explicit ownership and lifecycle rules.

---

# 1. PURPOSE OF THIS DOCUMENT

This document defines the backend architecture for BEU BABA in enough detail that a developer can implement the database, authentication, storage, authorization, content relationships, moderation system, messaging system, quiz system, notification system, and administrative controls without guessing what the application means.

This is not a list of tables only.

The backend of BEU BABA must behave like a real production application. A student should be able to register, create a profile, access academic content, save resources, attempt quizzes, upload useful resources, send a private message to the developer, receive replies, receive notifications, and manage their account.

At the same time, an administrator should be able to manage academic content, verify student submissions, manage users, publish notices, send notifications, respond to support messages, inspect audit history, and safely correct mistakes.

The database must therefore support:

1. Identity.
2. Student profiles.
3. Academic structure.
4. Courses.
5. Branches.
6. Semesters.
7. Subjects.
8. Syllabus.
9. Academic calendars.
10. Previous-year questions.
11. Notes.
12. Study resources.
13. Student-uploaded resources.
14. Resource moderation.
15. Quizzes.
16. Question banks.
17. Quiz attempts.
18. Quiz result cards.
19. Bookmarks.
20. Recent activity.
21. Notifications.
22. Developer/support conversations.
23. Admin roles.
24. Permissions.
25. Audit logs.
26. Content versioning.
27. File metadata.
28. Storage authorization.
29. Search.
30. Analytics.
31. Reporting.
32. Data retention.
33. Soft deletion.
34. Recovery.
35. Security.

The implementation must avoid the common mistake of putting all application data into one or two giant JSON columns. JSON is useful for flexible metadata, but core relationships must be represented relationally.

---

# 2. NON-NEGOTIABLE BACKEND PRINCIPLES

## 2.1 The client is untrusted

The React application can be modified by the user.

Therefore the following are never security controls:

- hiding a button,
- hiding an admin route,
- checking `localStorage`,
- checking a role only in JavaScript,
- disabling a UI control,
- hiding a download URL,
- storing an admin flag in localStorage,
- putting secret keys into Vite environment variables,
- checking ownership only in frontend code.

The database must enforce authorization.

A user who manually calls Supabase APIs must receive the same authorization result as a normal UI user.

---

## 2.2 Use Row Level Security

Every exposed table containing private, user-owned, administrative, or moderation-sensitive information must have explicit RLS policies.

RLS should be considered part of the data model rather than an optional security feature.

Examples:

- A student can read their own profile.
- A student cannot read another student's private contact information.
- A student can create their own support message.
- A student can read only their own support conversation.
- An administrator with the correct permission can read support conversations.
- A student can read only published public content.
- A student cannot publish a resource.
- A moderator can review pending submissions.
- A content administrator can create and update academic content.
- A super administrator can manage roles.

---

## 2.3 Separate authentication from authorization

Supabase Auth answers:

> Who is this user?

Application tables answer:

> What is this user allowed to do?

Do not put the complete application profile inside Auth metadata.

Use Auth for identity and secure authentication state.

Use `profiles` and related tables for application data.

---

## 2.4 Never trust role values supplied by the client

A malicious client could send:

```text
role=super_admin
```

Therefore role changes must be performed only through trusted administrative operations.

The frontend should not be allowed to update:

- role,
- permission level,
- verification state,
- moderation status,
- account suspension state,
- admin privileges,
- audit records.

These values require database policies or server-side functions.

---

## 2.5 Use UUID primary keys

Use UUIDs for externally exposed entity identifiers.

Benefits:

- avoids sequential ID guessing,
- works well with distributed systems,
- makes merging data safer,
- reduces accidental enumeration.

Do not expose sequential integer IDs for sensitive entities.

---

# 3. HIGH-LEVEL SYSTEM ARCHITECTURE

The recommended architecture is:

```text
                ┌──────────────────────────┐
                │       React + Vite       │
                │   BEU BABA Web/PWA App   │
                └────────────┬─────────────┘
                             │
                             │ HTTPS
                             ▼
                ┌──────────────────────────┐
                │       Supabase SDK       │
                └────────────┬─────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
   ┌────────────┐    ┌──────────────┐   ┌──────────────┐
   │ Supabase   │    │ PostgreSQL   │   │  Supabase    │
   │ Auth       │    │ + RLS + RPC  │   │  Storage     │
   └────────────┘    └──────────────┘   └──────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Edge Functions   │
                    │ trusted actions  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          Email/API      Push Service    Other APIs
```

The frontend should communicate with Supabase directly for ordinary authorized CRUD operations.

Use Edge Functions or another trusted backend for:

- secret API keys,
- notification provider secrets,
- privileged workflows,
- server-side document processing,
- signed external URLs,
- scheduled jobs,
- third-party integrations,
- sensitive administrative operations that should not expose implementation details to clients.

---

# 4. SUPABASE PROJECT ORGANIZATION

Use separate environments where possible.

Recommended:

```text
BEU BABA
│
├── Development
├── Staging
└── Production
```

Do not use the production database while developing experimental schema changes.

The production project should have:

- restricted credentials,
- backups enabled,
- migrations tracked,
- monitoring enabled,
- separate service-role secret,
- controlled admin access.

---

# 5. ENVIRONMENT VARIABLES

The frontend may safely use:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The frontend must never contain:

```text
SUPABASE_SERVICE_ROLE_KEY
```

The service role key bypasses normal RLS protections and must be treated as a backend secret.

It belongs only in trusted server environments.

---

# 6. AUTHENTICATION MODEL

## 6.1 Registration

The registration flow should collect the minimum required information while keeping account creation understandable.

Potential fields:

- full name,
- email,
- phone number,
- course,
- branch,
- semester,
- gender,
- optional profile image,
- optional generated avatar selection.

Recommended sequence:

```text
Registration
   ↓
Validate fields
   ↓
Create Auth account
   ↓
Create profile
   ↓
Create student academic profile
   ↓
Assign default role
   ↓
Create onboarding state
   ↓
Open app
```

The default role must always be a normal student/user role.

---

## 6.2 Email verification

If email verification is enabled:

```text
Register
↓
Verification email
↓
Verify
↓
Complete onboarding
```

Do not consider a user fully verified merely because a profile row exists.

The UI may display:

- Verified
- Verification required
- Verification email resent

But the database remains authoritative.

---

## 6.3 Phone number

If phone numbers are collected, normalize them.

Store:

```text
phone_e164
```

rather than arbitrary formats such as:

```text
98765 43210
+91 9876543210
09876543210
```

A canonical representation prevents duplicate-account confusion.

---

# 7. CORE PROFILE MODEL

Recommended table:

```text
profiles
```

Suggested columns:

```text
id UUID PRIMARY KEY
full_name TEXT NOT NULL
display_name TEXT
email TEXT
phone_e164 TEXT
gender TEXT
date_of_birth DATE NULL
bio TEXT NULL
avatar_type TEXT
avatar_url TEXT NULL
avatar_seed TEXT NULL
profile_image_file_id UUID NULL
onboarding_completed BOOLEAN
is_active BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Do not store passwords here.

Passwords are handled by Supabase Auth.

---

# 8. STUDENT ACADEMIC PROFILE

Academic information should be separated from general profile data.

Recommended:

```text
student_profiles
```

Suggested fields:

```text
id UUID
user_id UUID
course_id UUID
branch_id UUID
current_semester_id UUID
admission_year INT
graduation_year INT NULL
roll_number TEXT NULL
registration_number TEXT NULL
academic_status TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Potential academic statuses:

```text
active
graduated
on_leave
inactive
```

Do not allow students to modify verified institutional identifiers if the application later uses them for official workflows.

---

# 9. ACADEMIC MASTER DATA

Academic data should be normalized.

Core tables:

```text
universities
courses
branches
semesters
subjects
course_branches
branch_semesters
semester_subjects
```

For BEU BABA, the academic hierarchy may look like:

```text
University
   ↓
Course
   ↓
Branch
   ↓
Semester
   ↓
Subject
```

Example:

```text
B.Tech
  ↓
Computer Science & Engineering
  ↓
Semester 5
  ↓
Database Management Systems
```

This structure must be reusable if additional courses such as BCA, BBA, MCA, etc. are added later.

---

# 10. COURSES TABLE

```text
courses
```

Suggested fields:

```text
id UUID
name TEXT
short_name TEXT
slug TEXT UNIQUE
description TEXT
duration_years NUMERIC
is_active BOOLEAN
sort_order INT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Examples:

```text
B.Tech
BCA
BBA
MCA
```

Use slugs for stable frontend routing:

```text
/btech
/bca
/bba
```

---

# 11. BRANCHES TABLE

```text
branches
```

Suggested fields:

```text
id UUID
course_id UUID
name TEXT
short_name TEXT
slug TEXT
description TEXT
is_active BOOLEAN
sort_order INT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Do not assume every course has branches.

For example:

```text
B.Tech → many branches
BBA → possibly no traditional engineering branch
```

The schema must support both.

---

# 12. SEMESTERS TABLE

```text
semesters
```

Suggested fields:

```text
id UUID
course_id UUID
semester_number INT
name TEXT
slug TEXT
is_active BOOLEAN
sort_order INT
```

A semester belongs to a course.

If a curriculum differs by branch, the subject mapping must be handled separately.

---

# 13. SUBJECTS TABLE

```text
subjects
```

Suggested fields:

```text
id UUID
name TEXT
code TEXT
slug TEXT
description TEXT
credits NUMERIC
is_active BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Subject codes should be unique within the relevant academic context.

---

# 14. SEMESTER-SUBJECT MAPPING

Do not put a comma-separated subject list inside the semester row.

Use:

```text
semester_subjects
```

Fields:

```text
id UUID
semester_id UUID
branch_id UUID NULL
subject_id UUID
is_elective BOOLEAN
is_active BOOLEAN
sort_order INT
```

This allows the same subject to appear in multiple branches or semesters.

---

# 15. SYLLABUS DATA MODEL

The syllabus should not be one giant text field.

Recommended structure:

```text
syllabi
syllabus_units
syllabus_topics
```

Example:

```text
Syllabus
 ├── Unit 1
 │    ├── Topic A
 │    ├── Topic B
 │
 ├── Unit 2
 │    ├── Topic C
 │    └── Topic D
```

This makes it possible to display:

- progress,
- completed topics,
- topic search,
- unit filtering,
- future quiz generation.

---

# 16. SYLLABUS VERSIONING

Syllabus can change.

Therefore do not overwrite historical information blindly.

Recommended:

```text
syllabi
```

with:

```text
version
effective_from
effective_to
status
```

Possible statuses:

```text
draft
review
published
archived
```

When a new syllabus is published:

```text
Old version → archived
New version → published
```

Do not delete the old version unless there is a legal or security reason.

---

# 17. YEARLY ACADEMIC CALENDAR

Recommended:

```text
academic_calendars
academic_calendar_events
```

Calendar:

```text
id
course_id
academic_year
title
status
published_at
```

Event:

```text
id
calendar_id
event_type
title
description
start_date
end_date
is_holiday
is_exam
is_registration
```

This supports:

- semester start,
- semester end,
- exam dates,
- result dates,
- holidays,
- admission dates,
- registration deadlines.

---

# 18. CONTENT LIFECYCLE

Every major content entity should have a lifecycle.

Recommended:

```text
draft
pending_review
published
scheduled
archived
rejected
```

The exact state machine must be defined rather than allowing arbitrary strings.

Example:

```text
DRAFT
  ↓
PENDING_REVIEW
  ↓
PUBLISHED
  ↓
ARCHIVED
```

A student should never see draft content.

---

# 19. CONTENT OWNERSHIP

Every admin-created content record should have:

```text
created_by
updated_by
```

For published records:

```text
published_by
published_at
```

For moderation:

```text
reviewed_by
reviewed_at
review_notes
```

This makes audit trails possible.

---

# 20. PREVIOUS YEAR QUESTIONS

Recommended entities:

```text
pyq_sets
pyq_questions
pyq_files
```

A PYQ set might contain:

```text
course
branch
semester
subject
year
exam_type
```

Examples:

```text
Regular Exam
Back Paper
Mid Semester
End Semester
Special Exam
```

Question data may include:

```text
question_text
marks
question_number
unit
topic
difficulty
```

A PDF file should not replace metadata.

The PDF is the file.

The database contains searchable metadata.

---

# 21. NOTES AND STUDY MATERIAL

Recommended:

```text
resources
resource_files
resource_tags
resource_subjects
```

Resources can represent:

- notes,
- PDFs,
- question papers,
- syllabus documents,
- lab manuals,
- important links,
- cheat sheets,
- presentations.

Use a generic resource model where practical, rather than creating separate unrelated tables for every file type.

---

# 22. RESOURCE VISIBILITY

Every resource needs visibility rules.

Possible:

```text
public
authenticated
course_only
branch_only
semester_only
private
admin_only
```

A resource intended for a particular branch should not be exposed to unrelated students.

Authorization should derive from the student's academic profile.

---

# 23. STUDENT RESOURCE UPLOADS

Students can upload resources according to the application feature.

Important distinction:

```text
student uploaded
```

does not mean:

```text
published
```

Workflow:

```text
Student uploads
      ↓
Pending moderation
      ↓
Moderator reviews
      ↓
Approved / Rejected
      ↓
If approved → published resource
```

Recommended table:

```text
resource_submissions
```

Fields:

```text
id
submitted_by
title
description
resource_type
file_id
subject_id
semester_id
status
moderation_notes
reviewed_by
reviewed_at
created_at
updated_at
```

---

# 24. MODERATION SECURITY

A student must never be able to submit:

```text
status = approved
```

from the frontend.

Even if the request body contains it, RLS/database logic must ignore or reject it.

The safe pattern is:

```text
Student → INSERT pending submission
Admin → UPDATE status
```

---

# 25. FILE METADATA

Create a database table such as:

```text
files
```

Do not treat raw storage paths as your entire file system.

Suggested fields:

```text
id UUID
storage_bucket TEXT
storage_path TEXT
original_name TEXT
mime_type TEXT
size_bytes BIGINT
checksum TEXT NULL
uploaded_by UUID
visibility TEXT
scan_status TEXT
created_at TIMESTAMPTZ
deleted_at TIMESTAMPTZ NULL
```

This provides a stable abstraction over actual storage.

---

# 26. STORAGE BUCKET STRATEGY

Avoid one public bucket containing everything.

Suggested buckets:

```text
public-assets
profile-images
resource-files
private-files
admin-files
```

Exact bucket names can vary, but access policies must be deliberate.

---

# 27. PROFILE IMAGE STORAGE

Profile images should be stored separately from academic PDFs.

Recommended path:

```text
profile-images/{user_id}/{file_id}.webp
```

or:

```text
profile-images/{user_id}/avatar.webp
```

The first is better for versioning.

Restrict upload size.

Recommended image policy:

- accept JPG/PNG/WebP,
- reject unsupported executable formats,
- enforce MIME and extension checks,
- resize large images,
- strip unnecessary metadata where possible,
- generate thumbnails.

---

# 28. STUDENT RESOURCE STORAGE

Do not store every uploaded resource in a public bucket.

Student submissions should initially be private.

Example:

```text
resource-files/pending/{submission_id}/{file_id}
```

After approval, either:

1. move/copy to published storage, or
2. keep in private storage and issue authorized access.

The second option gives stronger control.

---

# 29. DOWNLOAD AUTHORIZATION

If a PDF is intended only for authenticated students, do not place a permanently public URL in the database.

Instead:

```text
User requests file
       ↓
Backend checks authorization
       ↓
Generate temporary signed URL
       ↓
Return URL
```

Signed URLs should expire.

This is especially important for:

- private resources,
- premium resources,
- admin documents,
- user-specific exports.

---

# 30. IMPORTANT LIMITATION OF FILE PROTECTION

No web application can guarantee that a user who can view a document can never copy it.

For example:

- screenshots,
- screen recording,
- browser cache,
- developer tools,
- printing,
- downloaded files

may remain possible depending on delivery method.

Therefore the goal is:

> prevent unauthorized access, not promise impossible absolute DRM.

---

# 31. ADMIN STORAGE ACCESS

Administrators may need broader access, but "admin" should not mean "unlimited."

Use permissions such as:

```text
resources.read
resources.create
resources.update
resources.publish
resources.delete
files.read
files.delete
users.read
```

A content editor should not automatically have permission to modify authentication settings.

---

# 32. ROLE MODEL

Recommended roles:

```text
student
moderator
content_admin
support_admin
analytics_admin
super_admin
```

A user can have multiple roles if required.

Therefore use:

```text
roles
user_roles
permissions
role_permissions
```

instead of a single `role` column if the system is expected to grow.

---

# 33. PERMISSIONS

Permission examples:

```text
users.read
users.update
users.suspend

courses.read
courses.create
courses.update
courses.delete

syllabus.read
syllabus.create
syllabus.update
syllabus.publish

resources.read
resources.create
resources.update
resources.publish
resources.moderate

quiz.read
quiz.create
quiz.update
quiz.publish

notifications.create
notifications.send

support.read
support.reply

audit.read
```

---

# 34. ROLE ASSIGNMENT

Never allow users to insert directly into:

```text
user_roles
```

unless the policy specifically permits a safe self-assignment of a default non-privileged role.

The recommended design is:

```text
Auth signup
↓
database trigger/function
↓
default student role
```

Administrative roles are assigned through a protected admin workflow.

---

# 35. SECURITY DEFINER FUNCTIONS

Use PostgreSQL functions carefully.

If a function is declared `SECURITY DEFINER`, it runs with the privileges of its owner.

This can be useful for controlled operations but is dangerous if implemented carelessly.

Rules:

- set a safe search path,
- validate all parameters,
- do not trust user-supplied IDs,
- do not expose arbitrary SQL,
- keep functions narrow,
- avoid dynamic SQL unless necessary,
- document who can execute the function.

---

# 36. SUPPORT / DEVELOPER MESSAGE SYSTEM

BEU BABA requires a private student-to-developer communication system.

This is not a public chat room.

Recommended entities:

```text
support_conversations
support_messages
```

Conversation:

```text
id
user_id
subject
category
status
priority
created_at
updated_at
last_message_at
```

Message:

```text
id
conversation_id
sender_id
sender_type
message_text
attachment_file_id
is_read
created_at
```

---

# 37. SUPPORT PRIVACY

A student must only see conversations where:

```text
conversation.user_id = auth.uid()
```

An admin can see the conversation only if they have the required support permission.

Student A must never be able to query:

```text
Student B's messages
```

even by changing a conversation UUID.

RLS must enforce this.

---

# 38. SUPPORT MESSAGE FLOW

```text
Student
  ↓
New message
  ↓
Conversation created
  ↓
Support admin receives notification
  ↓
Admin replies
  ↓
Student receives notification
  ↓
Conversation continues
  ↓
Resolved
```

Statuses:

```text
open
waiting_for_student
waiting_for_support
resolved
closed
```

---

# 39. ATTACHMENTS IN SUPPORT

Allow attachments only if useful.

Security:

- file type allowlist,
- size limit,
- private bucket,
- malware scanning where available,
- authorization based on conversation ownership.

Never make support attachments globally public.

---

# 40. NOTIFICATION DATA MODEL

Recommended:

```text
notifications
notification_preferences
user_devices
notification_deliveries
```

A notification can represent:

- syllabus update,
- new PYQ,
- quiz result,
- support reply,
- resource approval,
- academic notice,
- app announcement.

---

# 41. IN-APP NOTIFICATIONS

The core notification table can include:

```text
id
user_id
type
title
body
deep_link
metadata JSONB
is_read
read_at
created_at
expires_at
```

`metadata` can contain optional context such as:

```json
{
  "resource_id": "...",
  "subject_id": "..."
}
```

But the primary relationships should still be represented by columns when they are frequently queried.

---

# 42. PUSH NOTIFICATIONS

For web/PWA push notifications, maintain device/subscription records.

Example:

```text
user_devices
```

Fields:

```text
id
user_id
platform
push_token
browser
device_name
is_active
last_seen_at
created_at
```

Never expose another user's push token.

Push delivery should happen through a trusted server function.

---

# 43. NOTIFICATION PREFERENCES

Users should be able to control categories.

Example:

```text
resource_updates
quiz_updates
academic_updates
support_messages
announcements
```

Do not allow a preference setting to disable mandatory security/account notifications.

---

# 44. QUIZ DATA MODEL

Recommended:

```text
quizzes
quiz_questions
questions
question_options
quiz_attempts
quiz_answers
quiz_results
```

Potential structure:

```text
Question Bank
     ↓
Quiz
     ↓
Questions
     ↓
Attempt
     ↓
Answers
     ↓
Result
```

---

# 45. QUESTION BANK

Questions should be reusable.

Fields:

```text
id
subject_id
topic_id
question_type
question_text
explanation
difficulty
marks
negative_marks
created_by
status
```

Question types:

```text
single_choice
multiple_choice
true_false
short_answer
```

Do not add complex types until the frontend and grading engine support them.

---

# 46. QUESTION OPTIONS

For MCQ:

```text
question_options
```

Fields:

```text
id
question_id
option_text
sort_order
is_correct
```

However, correct-answer information must not be unnecessarily exposed to students before submission.

Use server-side query policies or grading functions so that the client cannot simply retrieve all answers.

---

# 47. QUIZ ATTEMPT SECURITY

A quiz attempt should belong to one user.

```text
quiz_attempts.user_id = auth.uid()
```

The user must not be able to change:

```text
score
percentage
correct_count
submitted_at
```

These should be generated by trusted logic.

---

# 48. QUIZ RESULT CARD

BEU BABA can generate a downloadable/shareable result card.

Store:

```text
quiz_result_cards
```

or generate dynamically.

A result card can contain:

- student display name,
- quiz name,
- score,
- percentage,
- correct answers,
- total questions,
- date,
- optional rank,
- BEU BABA branding.

Avoid exposing unnecessary private information on shareable cards.

---

# 49. QUIZ RANKING

If rankings are introduced, define whether they are:

- global,
- course-based,
- branch-based,
- semester-based,
- quiz-specific.

Do not accidentally expose student phone numbers or email addresses on leaderboards.

Use:

```text
display_name
avatar
score
```

or an anonymized name.

---

# 50. BOOKMARKS

Recommended:

```text
bookmarks
```

Fields:

```text
id
user_id
resource_id
created_at
```

Unique constraint:

```text
(user_id, resource_id)
```

This prevents duplicate bookmarks.

---

# 51. RECENT ACTIVITY

Do not store every click forever.

Use an activity table with retention.

Possible:

```text
user_activity
```

Events:

```text
resource_viewed
quiz_started
quiz_completed
search_performed
subject_opened
syllabus_opened
support_opened
```

Analytics events should not become a performance bottleneck.

---

# 52. SEARCH ARCHITECTURE

For moderate datasets, PostgreSQL full-text search is sufficient.

Potential searchable fields:

- resource title,
- description,
- subject name,
- question text,
- syllabus topic.

Use indexes.

For very large content volumes, introduce a dedicated search service later.

Do not prematurely add Elasticsearch/OpenSearch unless necessary.

---

# 53. DATABASE INDEXING

Indexes should exist for frequently queried columns.

Examples:

```text
profiles.email
student_profiles.user_id
student_profiles.course_id
student_profiles.branch_id
subjects.slug
resources.status
resources.subject_id
resources.semester_id
resources.created_at
support_conversations.user_id
support_messages.conversation_id
notifications.user_id
notifications.created_at
quiz_attempts.user_id
quiz_attempts.quiz_id
```

Do not create indexes on every column.

Indexes increase write cost and storage.

---

# 54. COMPOSITE INDEXES

If queries commonly use:

```text
WHERE status = 'published'
AND subject_id = ...
ORDER BY created_at DESC
```

consider a composite index.

The exact indexes should be derived from actual query patterns and `EXPLAIN ANALYZE`.

---

# 55. UNIQUE CONSTRAINTS

Use database uniqueness wherever logically required.

Examples:

```text
courses.slug
branches(course_id, slug)
subjects(code)
bookmarks(user_id, resource_id)
user_roles(user_id, role_id)
```

Do not rely on frontend duplicate checks.

Two users can submit requests simultaneously.

The database must resolve the race.

---

# 56. FOREIGN KEYS

Use foreign keys for relationships.

Examples:

```text
resources.subject_id → subjects.id
student_profiles.user_id → profiles.id
support_messages.conversation_id → support_conversations.id
quiz_questions.quiz_id → quizzes.id
```

Choose delete behavior carefully.

For critical academic content, avoid cascading deletion by default.

---

# 57. SOFT DELETE

For important content use:

```text
deleted_at
deleted_by
```

rather than immediately deleting.

This helps with:

- recovery,
- audit,
- accidental deletion,
- moderation review.

However, private sensitive data may require true deletion depending on applicable requirements.

---

# 58. AUDIT LOG

Recommended:

```text
audit_logs
```

Fields:

```text
id
actor_user_id
action
entity_type
entity_id
old_data JSONB
new_data JSONB
ip_address NULL
user_agent NULL
created_at
```

Do not make audit logs editable by normal administrators.

A super-admin may view them, but historical logs should be append-only.

---

# 59. AUDIT EVENTS

Examples:

```text
USER_SUSPENDED
ROLE_ASSIGNED
ROLE_REMOVED
RESOURCE_CREATED
RESOURCE_UPDATED
RESOURCE_PUBLISHED
RESOURCE_REJECTED
RESOURCE_DELETED
SYLLABUS_PUBLISHED
QUIZ_PUBLISHED
NOTIFICATION_SENT
SUPPORT_REPLIED
```

Use stable action names.

---

# 60. CONTENT VERSIONING

For important content, create:

```text
resource_versions
syllabus_versions
quiz_versions
```

A version should contain:

```text
version_number
content_snapshot
created_by
created_at
change_summary
```

This allows:

```text
Version 1
Version 2
Version 3
Rollback to Version 2
```

Do not implement rollback as a destructive overwrite.

Create a new version from the old version.

---

# 61. MIGRATIONS

Every schema change must be represented by a migration.

Do not manually modify production tables from random SQL editor sessions without recording the change.

Migration examples:

```text
001_initial_schema.sql
002_profiles.sql
003_academic_structure.sql
004_resources.sql
005_quizzes.sql
006_support.sql
007_notifications.sql
008_rls.sql
```

The exact numbering can vary.

---

# 62. SEED DATA

Development needs deterministic seed data.

Seed:

- sample course,
- sample branch,
- sample semesters,
- sample subjects,
- test resources,
- test quiz,
- test student,
- test admin roles.

Never put real production credentials into seed files.

---

# 63. RLS ARCHITECTURE

RLS should follow the principle:

```text
Default deny
```

Then explicitly permit required operations.

For example:

```text
profiles
SELECT → own profile
UPDATE → own profile
INSERT → controlled signup workflow
```

Admin access should use role/permission checks.

---

# 64. HELPER AUTHORIZATION FUNCTIONS

Create helper functions such as:

```text
is_admin()
has_role(role_name)
has_permission(permission_name)
is_content_admin()
is_support_admin()
```

These should be designed carefully to avoid recursive RLS behavior.

Keep authorization logic centralized.

---

# 65. STUDENT CONTENT ACCESS

For public academic content:

```text
status = published
```

plus relevant visibility rules.

For branch-specific content:

```text
student branch = resource branch
```

For semester-specific content:

```text
student semester = resource semester
```

If a user has graduated, their historical access may need to use their academic history rather than current semester.

---

# 66. ACADEMIC HISTORY

For future-proofing, consider:

```text
student_academic_history
```

This can record:

```text
user_id
course_id
branch_id
semester_id
academic_year
status
start_date
end_date
```

This prevents historical records from becoming incorrect when a student changes semester.

---

# 67. STUDENT PROFILE UPDATES

A student can update:

- display name,
- profile picture,
- phone number if permitted,
- avatar,
- preferences.

Potentially restricted:

- course,
- branch,
- roll number,
- registration number.

The exact policy depends on whether BEU BABA treats these as self-declared information or verified academic information.

---

# 68. GENERATED AVATAR SYSTEM

If the app automatically selects a generated character based on gender:

Do not store dozens of images directly in every profile row.

Use:

```text
avatar_type
avatar_id
```

Example:

```text
avatar_type = generated
avatar_id = male_07
```

The frontend can map avatar IDs to known safe assets.

If custom avatar uploads are supported, store them as files.

---

# 69. PROFILE IMAGE VALIDATION

Never trust only:

```text
file.name.endsWith(".jpg")
```

Validate:

- actual MIME type,
- file signature where possible,
- maximum size,
- image dimensions.

Resize images server-side if practical.

---

# 70. DATA PRIVACY

Student data includes:

- name,
- email,
- phone,
- academic information,
- profile image,
- support conversations.

Do not expose these publicly.

Public leaderboards and public resource credits should use only the minimum necessary information.

---

# 71. ADMIN STUDENT DIRECTORY

The admin panel can show:

```text
Student Name
Email
Phone
Course
Branch
Semester
Account Status
Joined Date
Last Active
```

But RLS must restrict this information to authorized administrators.

Do not expose the entire student table to every admin role.

---

# 72. DATA EXPORT

Admins may need CSV export.

Exports must be permission-controlled.

Possible permissions:

```text
students.export
resources.export
analytics.export
```

Sensitive exports should be audited.

---

# 73. DATA IMPORT

Academic content can be imported through CSV/JSON.

Import workflow:

```text
Upload file
↓
Parse
↓
Validate schema
↓
Preview changes
↓
Detect duplicates
↓
Show errors
↓
Admin confirms
↓
Transaction/import
↓
Audit record
```

Never directly import unvalidated data into production tables.

---

# 74. IMPORT VALIDATION

Example:

```text
semester_number = 5
```

must be numeric.

Required fields must exist.

Foreign keys must resolve.

Duplicate subjects should be detected.

Invalid files should produce row-level errors:

```text
Row 17:
Unknown subject code DBMS-999
```

---

# 75. TRANSACTION SAFETY

Multi-step operations should use transactions where possible.

Example:

Publishing a syllabus may require:

1. archive old published version,
2. publish new version,
3. update timestamps,
4. create audit log.

These should happen atomically.

If step 3 fails, the database should not remain in a half-published state.

---

# 76. CONCURRENCY CONTROL

Two administrators may edit the same resource.

Use an optimistic concurrency mechanism.

Example:

```text
updated_at
version_number
```

Admin A edits version 4.

Admin B edits version 4.

Admin A saves → version 5.

Admin B attempts save against version 4 → conflict.

The UI should show:

> This content was changed by another administrator. Reload before saving.

Do not silently overwrite.

---

# 77. PUBLISHED CONTENT SAFETY

Publishing should be deliberate.

Do not publish automatically because an admin saves a draft.

Separate actions:

```text
Save Draft
Submit for Review
Approve
Publish
Schedule
Archive
```

---

# 78. SCHEDULED CONTENT

If scheduling is supported:

```text
publish_at
unpublish_at
```

A scheduled job should process the transition.

Never rely on a user's browser remaining open.

Use server-side scheduled functions/jobs.

---

# 79. NOTIFICATION TRIGGERS

Notifications can be triggered by events:

```text
RESOURCE_PUBLISHED
SUPPORT_MESSAGE_CREATED
SUPPORT_REPLY_CREATED
QUIZ_COMPLETED
SYLLABUS_UPDATED
NOTICE_PUBLISHED
```

Do not send notifications directly from arbitrary frontend code.

The server should create/send them after validating the event.

---

# 80. IDEMPOTENCY

External notification providers can retry.

Therefore sending must be idempotent.

Store a unique event/delivery identifier.

If:

```text
notification_event_id = X
```

has already been processed, do not create duplicate deliveries.

---

# 81. REALTIME

Supabase Realtime can be useful for:

- support chat replies,
- unread notification counts,
- admin moderation queue updates.

Do not use realtime for every UI interaction.

Static academic content does not need realtime.

---

# 82. SUPPORT REALTIME FLOW

Student opens support conversation.

Subscribe to:

```text
support_messages
```

for that conversation.

When a new message arrives:

```text
database insert
↓
RLS verifies subscriber access
↓
Realtime event
↓
UI updates
```

Do not trust a realtime channel name as authorization.

Database policies remain authoritative.

---

# 83. UNREAD COUNTS

Avoid querying every message repeatedly.

For notifications, maintain:

```text
is_read
```

For support, calculate or maintain:

```text
unread_count
```

depending on scale.

If counters are denormalized, update them transactionally.

---

# 84. ERROR HANDLING

Backend errors must be understandable.

Frontend should receive safe messages such as:

```text
You do not have permission to perform this action.
```

rather than:

```text
PostgreSQL policy "xyz" failed because...
```

Detailed database errors belong in server logs.

---

# 85. RATE LIMITING

Rate-limit:

- registration attempts,
- login attempts,
- support message creation,
- resource uploads,
- quiz submissions,
- notification sending,
- expensive searches,
- admin bulk operations.

A normal student should not be able to create thousands of support messages in seconds.

---

# 86. FILE UPLOAD RATE LIMITS

Recommended controls:

```text
max files per request
max file size
max daily uploads
max pending submissions
```

The exact values should be configurable.

---

# 87. RESOURCE MODERATION ANTI-SPAM

Student uploads should include:

```text
uploader
timestamp
subject
title
file checksum
```

Use checksum/hash to detect identical files.

If 20 users upload the exact same PDF, the system can flag duplicates.

---

# 88. CONTENT DUPLICATION

Potential duplicate criteria:

- same checksum,
- same normalized title,
- same subject,
- same academic year.

Do not automatically reject every duplicate because two resources can legitimately share the same title.

Flag for review.

---

# 89. DATABASE BACKUPS

Production must have automated backups.

Backups should be tested.

A backup that has never been restored is not proven recovery.

Define:

```text
RPO
RTO
```

Example targets:

```text
RPO: acceptable maximum data loss
RTO: acceptable maximum recovery time
```

Exact targets depend on the project's scale.

---

# 90. DISASTER RECOVERY

Document:

1. database recovery,
2. storage recovery,
3. authentication recovery,
4. environment variable recovery,
5. deployment recovery,
6. domain recovery,
7. notification provider recovery.

Keep recovery procedures outside the production application itself.

---

# 91. STORAGE CLEANUP

Unused files can accumulate.

Implement a cleanup process for:

- abandoned uploads,
- rejected submissions,
- deleted profile images,
- old temporary files,
- expired exports.

Do not delete immediately if moderation or recovery requires retention.

---

# 92. ORPHAN FILE DETECTION

Periodically identify storage files that have no database reference.

Example:

```text
Storage object exists
↓
No files.id reference
↓
Candidate orphan
```

Review before deleting.

---

# 93. DATABASE CLEANUP

Temporary data may include:

- expired notification deliveries,
- old sessions if applicable,
- activity logs,
- temporary import records.

Use retention rules.

Do not blindly delete academic records.

---

# 94. ANALYTICS MODEL

Analytics should answer useful questions:

- Which subjects are most viewed?
- Which resources are most downloaded?
- Which quizzes are most attempted?
- Which branches use the app most?
- How many students are active?
- How many submissions are pending?
- Which support categories are common?

Avoid collecting data simply because it is technically possible.

---

# 95. ANALYTICS PRIVACY

Analytics should minimize personal information.

Prefer:

```text
resource_id
event_type
timestamp
course_id
branch_id
```

rather than duplicating:

```text
full_name
phone
email
```

inside every event.

---

# 96. ADMIN DASHBOARD METRICS

Potential metrics:

```text
Total Students
Active Students
Published Resources
Pending Submissions
Total Quizzes
Quiz Attempts
Unread Support Messages
Unread Notifications
```

Metrics should be generated efficiently.

Do not load 100,000 rows into the browser to count them.

Use:

```text
COUNT(*)
```

or optimized views/functions.

---

# 97. DATABASE VIEWS

Views can simplify complex read operations.

Examples:

```text
published_resources_view
student_dashboard_view
admin_content_summary_view
quiz_leaderboard_view
```

But remember that views must be reviewed for security and RLS behavior.

Do not create a view that accidentally bypasses privacy assumptions.

---

# 98. MATERIALIZED VIEWS

Use materialized views only when expensive aggregation justifies them.

Examples:

- daily analytics summary,
- monthly resource statistics.

Refresh them on a controlled schedule.

Do not use them for data requiring immediate consistency.

---

# 99. API DESIGN

The frontend should preferably use a small number of well-defined operations.

Examples:

```text
getStudentDashboard()
getPublishedResources()
getResourceDetails()
submitResource()
startQuiz()
submitQuiz()
sendSupportMessage()
markNotificationRead()
```

For complex workflows, use RPC/functions rather than exposing a sequence of fragile client-side mutations.

---

# 100. RPC DESIGN

Good RPC:

```text
submit_quiz_attempt(attempt_id, answers)
```

It can:

1. verify ownership,
2. verify attempt status,
3. grade answers,
4. calculate score,
5. save result,
6. mark attempt submitted,
7. create notification.

This is safer than letting the browser perform six independent updates.

---

# 101. DATABASE-LEVEL VALIDATION

Use constraints where appropriate.

Examples:

```text
percentage >= 0
percentage <= 100
marks >= 0
semester_number BETWEEN 1 AND 12
file_size > 0
```

Do not depend solely on TypeScript validation.

---

# 102. TYPESCRIPT DATABASE TYPES

Generate Supabase database types.

The frontend should use generated types for:

- tables,
- views,
- functions,
- enums.

This prevents mismatches such as:

```text
database: pending_review
frontend: pendingReview
```

without explicit mapping.

---

# 103. ENUMS VS TEXT

Use enums where values are genuinely stable.

For frequently changing workflows, lookup tables can be better.

Example:

```text
role
```

may use a lookup table.

Academic event types may be an enum if the set is controlled.

Do not overuse PostgreSQL enums if administrators need to add custom values frequently.

---

# 104. DATABASE NAMING CONVENTION

Use:

```text
snake_case
```

for PostgreSQL.

Examples:

```text
student_profiles
resource_submissions
created_at
published_at
```

Frontend TypeScript can map them naturally.

---

# 105. TIMESTAMPS

Use:

```text
TIMESTAMPTZ
```

for timestamps.

Store UTC.

Render in local timezone on the frontend.

Do not store:

```text
2026-09-01 10:00
```

as an unqualified timestamp when timezone matters.

---

# 106. DATE VS TIMESTAMP

Use `DATE` for:

- academic dates,
- holidays,
- exam date when time is irrelevant.

Use `TIMESTAMPTZ` for:

- created_at,
- updated_at,
- messages,
- notification events,
- publication timestamps.

---

# 107. SLUGS

Use stable slugs for public routing.

Example:

```text
database-management-systems
```

Slugs should be unique within the intended scope.

Do not use names as permanent identifiers.

A subject can be renamed without changing its UUID.

---

# 108. RESOURCE TAGGING

Use:

```text
tags
resource_tags
```

rather than a comma-separated string.

Examples:

```text
important
exam
unit-1
short-notes
lab
```

This enables filtering.

---

# 109. FAVORITES AND SAVED CONTENT

A future feature can use:

```text
saved_resources
```

or reuse bookmarks.

Keep terminology consistent.

Do not create both unless they have different meanings.

---

# 110. OFFLINE/PWA DATA

The backend should be designed with offline-friendly frontend caching.

However, sensitive data should not be permanently cached.

Safe candidates:

- public academic content,
- syllabus,
- resource metadata,
- static images.

Careful with:

- private messages,
- personal profile data,
- admin content,
- private documents.

---

# 111. PWA NOTIFICATION ARCHITECTURE

For web push:

```text
User grants permission
↓
Browser creates push subscription
↓
Subscription sent to backend
↓
Backend stores subscription
↓
Event occurs
↓
Trusted function sends push
↓
Notification appears
```

The notification system must still work if push permission is denied by falling back to in-app notifications.

---

# 112. LOGIN SESSION SECURITY

Use Supabase Auth session management.

Do not implement a second homemade authentication token system unless there is a compelling reason.

Avoid:

```text
localStorage.authenticated = true
```

as an authentication mechanism.

---

# 113. ADMIN SESSION SECURITY

Administrators should receive stronger protection.

Possible future features:

- MFA,
- short session duration,
- reauthentication for sensitive actions,
- device/session management,
- login alerts.

At minimum, never rely solely on frontend admin route protection.

---

# 114. SENSITIVE ADMIN ACTIONS

Actions requiring additional confirmation:

- deleting content,
- suspending a user,
- assigning super-admin role,
- bulk deletion,
- sending large notification campaigns,
- changing system settings.

The backend must verify permission.

---

# 115. BULK OPERATIONS

Bulk operations should be controlled.

Example:

```text
Publish 200 resources
```

The backend should:

1. verify admin permission,
2. validate all records,
3. process transaction/batches,
4. create audit information,
5. return success/failure summary.

Do not run 200 independent client requests blindly.

---

# 116. QUEUE-STYLE OPERATIONS

For expensive operations:

- generating PDFs,
- sending many notifications,
- processing large imports,
- generating thumbnails,

use asynchronous processing.

The UI can show:

```text
Processing...
```

and later:

```text
Completed
```

---

# 117. SECURITY LOGGING

Log security-relevant events:

```text
login failures
admin role changes
permission changes
suspicious upload activity
bulk exports
account suspension
```

Do not log passwords, tokens, or secret keys.

---

# 118. INPUT SANITIZATION

Any rich text entered by admins must be sanitized before rendering.

Never blindly inject HTML from database into React.

If rich text is required:

```text
Markdown → sanitized HTML
```

or use a trusted editor pipeline.

---

# 119. XSS PREVENTION

Potential dangerous content:

- resource descriptions,
- notices,
- support messages,
- quiz explanations,
- admin announcements.

React escapes normal strings automatically, but unsafe HTML rendering can bypass that protection.

Avoid unnecessary `dangerouslySetInnerHTML`.

---

# 120. SQL INJECTION

Supabase's normal client query methods parameterize values.

Do not construct raw SQL strings from user input.

If dynamic SQL is absolutely required in a database function, use safe parameterization.

---

# 121. STORAGE PATH INJECTION

Never allow users to arbitrarily select:

```text
../../admin/file.pdf
```

Storage paths should be generated by trusted code.

Example:

```text
profile-images/{auth.uid()}/{generated_uuid}.webp
```

---

# 122. MIME TYPE SECURITY

Do not trust:

```text
Content-Type: application/pdf
```

alone.

A malicious file can have a misleading MIME type.

Where feasible:

- inspect file signatures,
- validate extension,
- enforce allowlist,
- scan files.

---

# 123. PDF SECURITY

PDF files can contain active content or malformed structures.

For uploaded PDFs:

- limit size,
- scan where possible,
- avoid executing embedded content,
- consider sanitization/reprocessing for high-risk workflows.

---

# 124. IMAGE SECURITY

Uploaded images can contain:

- oversized dimensions,
- malformed metadata,
- unexpected formats.

Normalize images through a processing pipeline where practical.

---

# 125. FILE SIZE LIMITS

Define limits per category.

Example conceptual policy:

```text
profile image → small
resource PDF → larger
support attachment → medium
admin import → controlled
```

Exact limits should be configurable.

Do not hardcode limits in five different frontend components.

---

# 126. CONTENT ACCESS DECISION TREE

For every content request:

```text
Is user authenticated?
       ↓
Does content exist?
       ↓
Is content published?
       ↓
Is content currently active?
       ↓
Does visibility permit this user?
       ↓
Does course/branch/semester match?
       ↓
Return data
```

The backend should enforce this.

---

# 127. ADMIN CONTENT REQUEST

For an admin operation:

```text
Is authenticated?
       ↓
Has required permission?
       ↓
Is resource editable?
       ↓
Is resource version current?
       ↓
Apply mutation
       ↓
Create audit record
```

---

# 128. STUDENT RESOURCE SUBMISSION REQUEST

```text
Authenticated?
↓
Student account active?
↓
Upload limits okay?
↓
File valid?
↓
Subject exists?
↓
Submission created as pending
↓
Moderator notification
```

---

# 129. SUPPORT MESSAGE REQUEST

```text
Authenticated?
↓
Conversation belongs to user OR user has support permission?
↓
Conversation not closed?
↓
Message valid?
↓
Insert message
↓
Update conversation timestamp
↓
Create notification
```

---

# 130. QUIZ SUBMISSION REQUEST

```text
Authenticated?
↓
Attempt belongs to user?
↓
Attempt still open?
↓
Quiz version valid?
↓
Answers validated?
↓
Grade server-side
↓
Store answers/result
↓
Mark submitted
↓
Notify user
```

---

# 131. DATA CONSISTENCY

Avoid duplicated critical values.

For example, do not store:

```text
resource.branch_name
resource.branch_id
```

and assume they always match.

Store the foreign key and retrieve the name.

Denormalization is acceptable only when intentionally managed.

---

# 132. DENORMALIZATION

Useful examples:

```text
notification.body
```

can remain a snapshot even if the resource title changes.

Analytics may store a snapshot of dimensions for reporting.

But explain why each denormalized field exists.

---

# 133. DELETION STRATEGY

For a subject:

Do not immediately delete all resources.

Instead:

```text
subject inactive
```

Historical resources can remain connected.

This prevents broken historical data.

---

# 134. ARCHIVING

Archiving is preferred for academic content.

Archived content:

- remains in database,
- disappears from normal student search,
- remains visible to authorized admins,
- can be restored.

---

# 135. CONTENT RESTORATION

Restore should create an audit event:

```text
RESOURCE_RESTORED
```

The system should identify:

- who restored it,
- when,
- previous state,
- resulting state.

---

# 136. USER ACCOUNT DEACTIVATION

Instead of deleting immediately:

```text
is_active = false
```

A suspended user should not be able to perform normal application operations.

RLS and trusted server operations must account for account status.

---

# 137. ACCOUNT DELETION

If account deletion is supported:

1. authenticate user,
2. confirm request,
3. revoke active access,
4. remove/anonimize data according to policy,
5. preserve legally/operationally required records where applicable,
6. delete Auth identity when appropriate.

Do not simply delete `profiles` and leave orphaned identity data.

---

# 138. SUPPORT HISTORY AFTER ACCOUNT DELETION

Decide whether support messages should:

- be deleted,
- anonymized,
- retained for operational/legal reasons.

This policy must be explicit.

---

# 139. CONTACT INFORMATION PRIVACY

Phone numbers and emails should not appear in:

- public leaderboards,
- public resource cards,
- public comments,
- public profile pages.

The frontend should receive only fields required for the current screen.

---

# 140. API RESPONSE MINIMIZATION

Do not query:

```text
SELECT *
```

for large or sensitive entities when only five fields are needed.

Request only required columns.

Example:

```text
id
title
thumbnail_url
subject_id
published_at
```

---

# 141. PAGINATION

Never load all resources at once.

Use:

```text
limit
cursor
```

or range pagination.

Cursor-based pagination is preferable for large, frequently changing datasets.

---

# 142. ADMIN TABLE PAGINATION

Admin lists may contain thousands of users/resources.

Use:

```text
search
filter
sort
pagination
```

on the database side.

Do not fetch 50,000 rows and filter in JavaScript.

---

# 143. SEARCH FILTERS

Resources:

```text
course
branch
semester
subject
type
status
year
uploader
```

Students:

```text
course
branch
semester
status
joined_date
```

Quizzes:

```text
subject
difficulty
status
creator
```

---

# 144. PERFORMANCE TARGET

The backend should aim for:

- fast indexed reads,
- minimal payloads,
- predictable queries,
- no N+1 frontend patterns,
- no huge JSON blobs,
- no unnecessary realtime subscriptions.

Performance must be measured, not assumed.

---

# 145. N+1 QUERY PROBLEM

Avoid:

```text
Get 100 resources
↓
Run another query for each subject
↓
100+ queries
```

Instead use relational joins/selects or a dedicated view/query.

---

# 146. DASHBOARD QUERY DESIGN

A student dashboard should not fire 30 independent requests on page load.

Combine logically related information where practical.

Possible:

```text
get_student_dashboard()
```

returns:

- profile summary,
- current semester,
- recent resources,
- unread notifications,
- recent quiz results,
- bookmarks count.

---

# 147. ADMIN DASHBOARD QUERY DESIGN

Similarly:

```text
get_admin_dashboard_summary()
```

can return counts and high-level metrics.

Detailed tables should load only when opened.

---

# 148. CACHE STRATEGY

Cache relatively stable data:

- courses,
- branches,
- semesters,
- subjects,
- syllabus metadata.

Use short/invalidated caching for:

- notifications,
- support messages,
- moderation queues.

Never cache sensitive responses in public shared caches.

---

# 149. CACHE INVALIDATION

When admin publishes content:

```text
publish resource
↓
invalidate relevant cache
↓
student sees new content
```

Do not require users to hard refresh.

---

# 150. FRONTEND/BACKEND CONTRACT

Every API/data function should document:

```text
Input
Output
Errors
Authorization
Side effects
```

Example:

```text
submitResource()

Authorization:
Authenticated student

Input:
title, description, subject_id, file_id

Output:
submission_id, status

Side effects:
Creates pending moderation item
```

---

# 151. ERROR CODES

Use predictable application error codes.

Examples:

```text
AUTH_REQUIRED
FORBIDDEN
RESOURCE_NOT_FOUND
INVALID_FILE
UPLOAD_LIMIT_REACHED
MODERATION_REQUIRED
QUIZ_ALREADY_SUBMITTED
CONFLICT
RATE_LIMITED
```

The UI can map these to friendly messages.

---

# 152. OBSERVABILITY

Track:

- API failures,
- slow queries,
- Edge Function failures,
- storage failures,
- notification failures,
- database connection problems.

Do not expose internal diagnostics to students.

---

# 153. SLOW QUERY INVESTIGATION

When a query becomes slow:

```text
EXPLAIN
EXPLAIN ANALYZE
```

should be used to inspect:

- sequential scans,
- missing indexes,
- poor joins,
- large sorts,
- expensive functions.

Do not add random indexes without understanding the query.

---

# 154. DATABASE FUNCTIONS TESTING

Every important function should have tests for:

- authorized user,
- unauthorized user,
- missing record,
- invalid input,
- duplicate request,
- concurrent request,
- already-completed state.

---

# 155. RLS TESTING

RLS is one of the highest-priority testing areas.

Test as:

```text
Student A
Student B
Moderator
Content Admin
Support Admin
Super Admin
Anonymous
```

Verify each action.

---

# 156. RLS TEST MATRIX EXAMPLE

| Action | Student | Moderator | Content Admin | Support Admin | Super Admin |
|---|---|---|---|---|---|
| View published resources | Yes | Yes | Yes | Yes | Yes |
| Submit resource | Yes | Yes | Yes | Yes | Yes |
| Approve resource | No | Yes | Yes | No | Yes |
| Manage syllabus | No | No/limited | Yes | No | Yes |
| Read student support | Own | No | No | Yes | Yes |
| Manage roles | No | No | No | No | Yes |
| View audit logs | No | Limited | Limited | Limited | Yes |

The exact matrix can evolve, but permissions must be explicit.

---

# 157. SUPPORT ADMIN ISOLATION

A support admin should not automatically gain access to:

- syllabus publishing,
- quiz editing,
- role management,
- academic content deletion.

Least privilege is mandatory.

---

# 158. MODERATOR ISOLATION

A moderator can review student submissions without necessarily accessing:

- student private messages,
- phone numbers,
- authentication information,
- administrative settings.

---

# 159. SUPER ADMIN

Super admin should be extremely limited.

Recommended capabilities:

- role assignment,
- permission management,
- system settings,
- audit access,
- emergency recovery.

Do not create multiple super admins unnecessarily.

---

# 160. EMERGENCY ACCESS

Have a documented emergency procedure for:

- compromised admin,
- accidental bulk deletion,
- broken RLS policy,
- bad migration,
- notification abuse.

Emergency access should be auditable.

---

# 161. DATABASE SCHEMA ORGANIZATION

A practical schema grouping:

```text
Identity
├── profiles
├── student_profiles
├── user_preferences
└── user_devices

Academic
├── universities
├── courses
├── branches
├── semesters
├── subjects
├── semester_subjects
├── syllabi
├── syllabus_units
└── syllabus_topics

Content
├── resources
├── resource_files
├── resource_tags
├── tags
├── resource_versions
└── resource_submissions

Quiz
├── quizzes
├── questions
├── question_options
├── quiz_questions
├── quiz_attempts
├── quiz_answers
└── quiz_results

Communication
├── support_conversations
├── support_messages
└── notifications

Administration
├── roles
├── permissions
├── user_roles
├── role_permissions
└── audit_logs

Analytics
├── user_activity
├── resource_events
└── analytics_daily
```

---

# 162. USER PREFERENCES

Recommended:

```text
user_preferences
```

Fields:

```text
user_id
theme_preference
language
notification_preferences JSONB
reduced_motion
created_at
updated_at
```

The application is primarily light premium glassmorphism, but a user preference system should not be blocked from supporting future themes.

---

# 163. ACCESSIBILITY PREFERENCE

If the UI supports reduced motion:

```text
reduced_motion = true
```

Animations should be reduced on the frontend.

This is not a backend security feature, but storing the preference enables consistency across devices if desired.

---

# 164. RESOURCE DOWNLOAD TRACKING

If download analytics are required:

```text
resource_download_events
```

Do not increment a simple integer from the client and trust it.

Use server-side event insertion.

---

# 165. RESOURCE VIEW COUNT

Same principle.

A user can repeatedly refresh.

Define what constitutes a view.

For example:

```text
one counted view per user/resource within X minutes
```

The exact rule must be documented before implementing analytics.

---

# 166. QUIZ ANTI-CHEAT LIMITATIONS

The backend can enforce:

- attempt ownership,
- time limits,
- submission deadline,
- one attempt,
- answer integrity.

It cannot guarantee that a student did not use another device.

Do not market basic browser controls as impossible cheating prevention.

---

# 167. QUIZ TIMER

The backend should store:

```text
started_at
expires_at
submitted_at
```

The frontend displays the timer.

The backend decides whether an answer submission is still valid.

A user changing the browser clock must not extend the quiz.

---

# 168. QUIZ VERSIONING

If a quiz changes after students have started attempts, the attempt should retain the quiz version.

Example:

```text
Quiz v3
Attempt created against v3
```

Later:

```text
Quiz v4 published
```

The old attempt remains tied to v3.

---

# 169. SYLLABUS PROGRESS

If student progress tracking is added:

```text
student_topic_progress
```

Fields:

```text
user_id
topic_id
status
completed_at
```

Unique:

```text
(user_id, topic_id)
```

This enables:

- percentage completed,
- unit progress,
- semester progress.

---

# 170. STUDY STREAKS

If the app adds streaks:

Do not simply trust the frontend.

Record meaningful study events server-side.

A streak should be derived from defined activity rules.

Avoid gamification that can be manipulated by repeatedly opening the same screen.

---

# 171. BADGES

Future badge system:

```text
badges
user_badges
```

Examples:

```text
First Quiz
10 Quizzes
Resource Contributor
7-Day Study Streak
Top Performer
```

Badge assignment should be server-side or based on trusted event processing.

---

# 172. CONTRIBUTOR REPUTATION

If student uploads become important, consider:

```text
contributor_points
```

But avoid rewarding spam.

Points should be granted for approved, useful contributions.

Possible:

```text
approved resource
helpful resource rating
verified correction
```

---

# 173. RESOURCE RATINGS

Optional:

```text
resource_ratings
```

One rating per user/resource.

Use:

```text
(user_id, resource_id)
```

unique constraint.

Do not let users rate unpublished or rejected resources.

---

# 174. RESOURCE REPORTING

Students should be able to report:

- wrong syllabus,
- incorrect answer,
- duplicate resource,
- inappropriate content,
- broken file.

Recommended:

```text
content_reports
```

Fields:

```text
id
reported_by
resource_id
reason
description
status
reviewed_by
reviewed_at
```

---

# 175. ADMIN REPORT WORKFLOW

```text
Student report
↓
Pending
↓
Moderator review
↓
Valid / Invalid
↓
Action
↓
Resolved
```

Action may include:

- correction,
- removal,
- replacement,
- warning,
- no action.

---

# 176. COURSE UPDATE REQUEST

Students can message the developer for:

- course update,
- syllabus correction,
- broken link,
- bug report,
- feature request.

Support category should distinguish these.

Example categories:

```text
bug
content_correction
syllabus_update
course_request
resource_issue
account_issue
feature_request
other
```

---

# 177. CONTACT DEVELOPER UI BACKEND

The frontend can show:

```text
Contact Developer
```

but backend uses:

```text
support_conversations
```

This keeps all communication in one controlled system.

---

# 178. ADMIN REPLY PRIVACY

Only:

```text
conversation.user_id
```

should receive the response.

Do not broadcast support replies globally.

---

# 179. MESSAGE READ STATES

Messages can have:

```text
read_at
```

rather than only:

```text
is_read
```

Timestamp is more useful for audit and analytics.

---

# 180. DEVELOPER PROFILE

Developer information such as:

- portfolio,
- social links,
- application information

should be stored as configurable public application settings rather than duplicated across components.

Example:

```text
app_settings
```

or structured:

```text
developer_profile
social_links
```

The admin should be able to update these without rebuilding the frontend if desired.

---

# 181. SOCIAL LINKS

The application can expose:

- Instagram,
- Telegram,
- portfolio,
- other official links.

Keep URLs in one configuration source.

Validate URL format.

Do not allow arbitrary JavaScript URLs.

Allowed schemes should generally be:

```text
https
```

and approved social schemes where genuinely required.

---

# 182. APP CONFIGURATION

Potential table:

```text
app_settings
```

Fields:

```text
key
value_json
updated_by
updated_at
```

Examples:

```text
maintenance_mode
support_enabled
max_upload_size
current_app_version
minimum_supported_version
```

Sensitive secrets must never be stored as ordinary client-readable settings.

---

# 183. MAINTENANCE MODE

If maintenance mode is enabled:

```text
Normal users → maintenance screen
Admins → optional access
```

The backend should still restrict dangerous operations.

---

# 184. APP VERSION CONTROL

Store:

```text
app_versions
```

with:

```text
version
platform
release_notes
minimum_supported_version
is_current
released_at
```

This can help with PWA update prompts.

---

# 185. FORCE UPDATE

If a severe security issue exists:

```text
minimum_supported_version
```

can be raised.

Frontend checks:

```text
current version < minimum
```

and shows update instructions.

Do not rely only on frontend if the old client can still access sensitive backend APIs. Backend authorization and API compatibility must also be considered.

---

# 186. API COMPATIBILITY

Avoid breaking database/API contracts unexpectedly.

When changing fields:

```text
Add new field
↓
support old field temporarily
↓
migrate frontend
↓
remove old field later
```

Do not delete a production column just because the current frontend no longer uses it.

---

# 187. DATABASE MIGRATION ROLLBACK

Not every migration can safely be reversed.

For destructive migrations:

- backup first,
- test in staging,
- create recovery procedure.

Prefer additive changes.

---

# 188. STAGING DATA

Staging should use fake/test student data.

Do not copy real student phone numbers and private messages into development environments unless there is a legitimate controlled reason and appropriate protection.

---

# 189. PRODUCTION ADMIN ACCOUNT CREATION

Initial super-admin setup should be done through a secure deployment/setup process.

Never hardcode:

```text
admin@example.com
password123
```

inside seed data.

---

# 190. SECRET MANAGEMENT

Secrets include:

- service role key,
- push notification credentials,
- email provider credentials,
- third-party API keys.

Use environment secrets.

Never store them in:

- database rows accessible to frontend,
- Git,
- screenshots,
- documentation examples containing real values.

---

# 191. SECURITY REVIEW CHECKLIST

Before production:

```text
[ ] RLS enabled
[ ] RLS policies tested
[ ] service key never exposed
[ ] admin role protected
[ ] storage buckets secured
[ ] signed URLs used where needed
[ ] upload limits enabled
[ ] file validation implemented
[ ] rate limits implemented
[ ] audit logs enabled
[ ] backups configured
[ ] migrations tracked
[ ] test data removed
[ ] notification secrets protected
```

---

# 192. DEVELOPMENT PHASE ORDER

Build the backend in this order:

### Phase 1 — Foundation

- Supabase project
- migrations
- profiles
- auth
- basic RLS

### Phase 2 — Academic

- courses
- branches
- semesters
- subjects
- syllabus

### Phase 3 — Content

- resources
- files
- storage
- PYQ
- moderation

### Phase 4 — Quiz

- questions
- quizzes
- attempts
- grading
- results

### Phase 5 — Communication

- support conversations
- support messages
- notifications

### Phase 6 — Administration

- roles
- permissions
- audit
- CMS workflows

### Phase 7 — Analytics

- activity
- dashboard metrics
- reporting

### Phase 8 — Hardening

- rate limits
- file security
- performance
- backup/recovery
- penetration-style testing

---

# 193. FIRST DATABASE MILESTONE

The first usable database should support:

```text
Signup
↓
Profile
↓
Course/branch/semester
↓
Published syllabus
↓
Published resources
↓
Bookmark
↓
Notification
↓
Support message
```

Do not attempt every advanced feature before this core path works.

---

# 194. SECOND MILESTONE

Add:

```text
Student uploads
↓
Moderation
↓
Approval
↓
Publication
```

This establishes the community contribution workflow.

---

# 195. THIRD MILESTONE

Add:

```text
Quiz
↓
Attempt
↓
Server-side grading
↓
Result
↓
Result card
```

---

# 196. FOURTH MILESTONE

Add:

```text
Admin roles
↓
Permissions
↓
Audit logs
↓
Bulk management
```

---

# 197. FIFTH MILESTONE

Add:

```text
Push notifications
Realtime support
analytics
scheduled content
```

Only after the basic architecture is stable.

---

# 198. RECOMMENDED TABLE INVENTORY

A production-ready first version can include approximately:

```text
profiles
student_profiles
user_preferences
user_devices

courses
branches
semesters
subjects
semester_subjects

syllabi
syllabus_units
syllabus_topics
academic_calendars
academic_calendar_events

files
resources
resource_files
resource_versions
resource_submissions
tags
resource_tags
content_reports

quizzes
questions
question_options
quiz_questions
quiz_attempts
quiz_answers
quiz_results

bookmarks
student_topic_progress

notifications
notification_preferences
notification_deliveries

support_conversations
support_messages

roles
permissions
user_roles
role_permissions

audit_logs

user_activity
resource_download_events
```

This is a strong foundation without requiring every future feature immediately.

---

# 199. WHAT MUST NOT BE DONE

Do not:

1. Store passwords in profiles.
2. Store service-role keys in frontend code.
3. Give every user access to every table.
4. Make all storage buckets public.
5. Trust frontend role checks.
6. Let students update their own admin roles.
7. Let students directly publish resources.
8. Let students submit quiz scores.
9. Expose correct quiz answers before submission.
10. Store every relationship inside arbitrary JSON.
11. Delete important content permanently by default.
12. Skip migrations.
13. Use production data in local development casually.
14. Fetch thousands of rows for frontend filtering.
15. Create a realtime channel and assume it provides authorization.
16. Put private support messages in a public table/policy.
17. expose phone numbers in public content.
18. trust file extensions alone.
19. assume a hidden URL is secure.
20. claim that downloadable PDFs have impossible DRM protection.

---

# 200. COMPLETE END-TO-END EXAMPLE — STUDENT REGISTRATION

A student opens BEU BABA.

They select:

```text
Create Account
```

They enter:

```text
Name
Email
Phone
Course
Branch
Semester
Gender
```

They upload a profile image or choose an automatic avatar.

The application sends the authentication request.

Supabase Auth creates the identity.

A database profile is created.

The student academic profile references:

```text
course_id
branch_id
semester_id
```

The user receives default student permissions.

The dashboard loads.

The user can now see only content permitted for their account.

The frontend never decides that the user is a student by itself.

---

# 201. COMPLETE EXAMPLE — SYLLABUS UPDATE

Admin creates:

```text
Syllabus 2026
Version 2
```

Status:

```text
draft
```

Admin edits units and topics.

Admin submits for review.

Authorized reviewer approves.

Admin publishes.

Database transaction:

```text
Old published syllabus → archived
New syllabus → published
audit log → created
notification event → created
```

Students receive an in-app notification.

The old syllabus remains available to administrators for historical reference.

---

# 202. COMPLETE EXAMPLE — STUDENT RESOURCE UPLOAD

Student chooses:

```text
Upload Resource
```

Selects:

```text
DBMS Notes.pdf
```

The backend verifies:

```text
authenticated
file size
file type
upload quota
subject
```

The submission is stored as:

```text
pending_review
```

The student cannot change it to approved.

Moderator sees it in the moderation queue.

Moderator approves.

The resource becomes published.

A notification is sent:

```text
Your resource has been approved.
```

---

# 203. COMPLETE EXAMPLE — SUPPORT MESSAGE

Student chooses:

```text
Contact Developer
```

Category:

```text
Syllabus Correction
```

Message:

```text
Unit 3 topic appears to be missing.
```

A private conversation is created.

Support admin receives:

```text
New support request
```

Admin replies.

Student receives:

```text
Developer replied to your message.
```

Only that student can see the conversation.

---

# 204. COMPLETE EXAMPLE — QUIZ

Student starts:

```text
DBMS Unit 1 Quiz
```

Backend creates:

```text
quiz_attempt
started_at
expires_at
```

Student answers questions.

On submission:

```text
backend validates ownership
backend validates attempt
backend grades answers
backend calculates score
backend stores result
```

The browser cannot submit:

```text
score = 100
```

and expect the database to accept it.

The server computes the score.

---

# 205. COMPLETE EXAMPLE — ADMIN ROLE SECURITY

A normal student attempts:

```text
INSERT INTO user_roles
```

RLS rejects the operation.

A moderator attempts to assign super-admin.

Permission check rejects the operation.

A super-admin assigns a content-admin role.

Operation succeeds.

Audit:

```text
actor
target user
old role
new role
timestamp
```

is recorded.

---

# 206. COMPLETE EXAMPLE — PRIVATE FILE

Student requests a private resource.

Backend verifies:

```text
student is authenticated
resource is accessible
```

Then generates a temporary signed URL.

After expiration, the old URL becomes unusable.

This is much safer than putting:

```text
public-storage/resource.pdf
```

into a database and assuming nobody else will discover it.

---

# 207. DATABASE QUALITY STANDARD

A table should exist because it represents a meaningful business concept.

Bad design:

```text
everything JSON
```

Bad design:

```text
one mega_table
```

Bad design:

```text
separate table for every tiny UI label
```

Good design:

```text
clear entities
clear relationships
clear constraints
clear authorization
clear lifecycle
```

---

# 208. FINAL BACKEND ARCHITECTURE

The BEU BABA backend should ultimately follow:

```text
                    BEU BABA
                       │
                       ▼
                React / PWA Client
                       │
                       ▼
                Supabase Auth
                       │
                       ▼
                PostgreSQL + RLS
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 Academic CMS       Resources        Students
       │               │                │
       ▼               ▼                ▼
   Syllabus          Files          Profiles
   Subjects        Moderation       Academic Data
   Calendar          PYQ            Preferences
       │               │
       └───────┬───────┘
               ▼
             Quiz
               │
               ▼
           Attempts
               │
               ▼
             Results

               +

        Support Messaging
               │
               ▼
          Notifications

               +

       Admin Roles / Permissions
               │
               ▼
           Audit Logs

               +

        Analytics / Activity
```

The architecture must remain modular so that BEU BABA can start as a student-focused academic application and later become a larger educational platform without replacing the database foundation.

---

# 209. IMPLEMENTATION CHECKLIST

## Authentication

- [ ] Supabase Auth configured
- [ ] Email verification decision made
- [ ] Profile creation workflow
- [ ] Student academic profile
- [ ] Default student role
- [ ] Session handling
- [ ] Account deactivation

## Academic

- [ ] Course table
- [ ] Branch table
- [ ] Semester table
- [ ] Subject table
- [ ] Subject mappings
- [ ] Syllabus versioning
- [ ] Academic calendar

## Content

- [ ] Resources
- [ ] Files
- [ ] Storage buckets
- [ ] PYQ
- [ ] Moderation
- [ ] Versioning
- [ ] Publishing

## Quiz

- [ ] Question bank
- [ ] Options
- [ ] Quiz versions
- [ ] Attempts
- [ ] Server-side grading
- [ ] Result cards

## Communication

- [ ] Support conversations
- [ ] Private messages
- [ ] Attachments
- [ ] Read state
- [ ] Notifications
- [ ] Push subscriptions

## Administration

- [ ] Roles
- [ ] Permissions
- [ ] RLS
- [ ] Audit logs
- [ ] Bulk operations
- [ ] Content workflows

## Security

- [ ] RLS test matrix
- [ ] Storage policies
- [ ] File validation
- [ ] Rate limiting
- [ ] Secret management
- [ ] Admin protection
- [ ] Backup strategy

## Performance

- [ ] Indexes
- [ ] Pagination
- [ ] Query optimization
- [ ] Dashboard functions
- [ ] Cache strategy
- [ ] Analytics aggregation

---

# 210. FINAL PRINCIPLE

The most important architectural rule for BEU BABA is:

> **The frontend controls presentation; the backend controls truth.**

The React application should make BEU BABA beautiful, fast, animated, responsive, and premium.

Supabase/PostgreSQL should decide:

- who the user is,
- what the user can access,
- which content is published,
- whether a resource is approved,
- whether a quiz attempt belongs to the user,
- what score the user actually earned,
- which support messages are private,
- who is an administrator,
- what an administrator is allowed to change,
- which files are accessible,
- and what actions happened in the system.

If this principle is followed consistently, BEU BABA can safely grow from a polished student PWA into a serious academic platform without rebuilding its backend every time a new feature is introduced.

# END OF DOCUMENT
