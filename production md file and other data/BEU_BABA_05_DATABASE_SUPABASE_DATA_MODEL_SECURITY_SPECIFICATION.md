# BEU BABA — 05 DATABASE, SUPABASE, DATA MODEL & SECURITY SPECIFICATION

## Document Status

**Project:** BEU BABA  
**Document:** 05 — Database, Supabase, Data Model & Security Specification  
**Purpose:** Production-grade database, storage, authorization, Row Level Security (RLS), data lifecycle, moderation, audit, privacy, backup, migration, and operational specification  
**Target Stack:** React + Vite + TypeScript + Tailwind CSS + Framer Motion + Supabase  
**Primary Database:** PostgreSQL through Supabase  
**Primary Authentication:** Supabase Auth  
**Primary File Storage:** Supabase Storage or an interchangeable object-storage provider  
**Application Type:** Responsive PWA / installable web application  
**Audience:** Developers, database engineers, backend developers, administrators, moderators, security reviewers, and AI coding agents

---

# 1. PURPOSE OF THIS DOCUMENT

This document defines the complete data layer for BEU BABA.

BEU BABA is not simply a collection of static PDF files. It is a structured student platform containing accounts, student profiles, academic information, courses, branches, semesters, subjects, syllabus versions, PYQs, notices, calendars, quizzes, quiz attempts, quiz cards, student-submitted resources, moderation records, notifications, developer conversations, bug reports, update requests, toolbox configuration, analytics, audit logs, application configuration, and file metadata.

The database must therefore be designed as a proper relational system.

The objective is to create a database that is:

1. Secure.
2. Scalable.
3. Easy to maintain.
4. Easy to query.
5. Resistant to unauthorized access.
6. Friendly to the React frontend.
7. Compatible with Supabase.
8. Suitable for PWA use.
9. Suitable for future native/mobile clients.
10. Flexible enough for academic data changes.
11. Safe for student information.
12. Capable of supporting moderation.
13. Capable of supporting versioned academic content.
14. Capable of supporting future paid/free content without redesigning the entire database.

The most important principle is:

> Never design the database around today's UI alone.

The UI can change completely later. The database should remain stable.

A premium visual redesign should not require rebuilding the academic data model.

---

# 2. CORE DATABASE PRINCIPLES

The following rules are mandatory.

## 2.1 PostgreSQL is the source of truth

The frontend must never become the authoritative source for:

- Student identity.
- User role.
- Course ownership.
- Resource approval.
- Quiz score.
- Syllabus status.
- Notice publication.
- Developer-message ownership.
- Administrative permissions.
- File access permissions.

The frontend only displays information.

The database and authenticated backend rules determine what a user is actually allowed to do.

---

## 2.2 Never trust frontend role checks

A React component may hide an Admin button.

That is useful for UX.

It is NOT security.

A malicious user can still call an API directly.

Therefore:

```text
Frontend role check = UX
Database RLS = security
Server-side validation = security
Storage policies = security
```

Every sensitive operation must be protected independently.

---

## 2.3 Prefer relational data over duplicated text

Bad:

```text
student:
  course = "B.Tech"
  branch = "CSE"
  semester = "5th"
```

Repeated strings create inconsistency.

Better:

```text
students
  course_id
  branch_id
  current_semester_id
```

This permits centralized changes.

---

## 2.4 Use stable IDs

Every major entity should have a UUID.

Recommended:

```sql
id uuid primary key default gen_random_uuid()
```

Do not use visible names as primary keys.

For example:

```text
CSE
```

should not be the primary key.

A branch could eventually be renamed while retaining the same identity.

---

# 3. DATABASE HIGH-LEVEL ARCHITECTURE

The BEU BABA database can be divided into logical domains.

## 3.1 Identity domain

Contains:

- profiles
- student_profiles
- admin_profiles
- user_roles
- avatars

## 3.2 Academic domain

Contains:

- institutions
- courses
- branches
- semesters
- subjects
- academic_years
- syllabus
- syllabus_versions
- academic_calendar
- academic_calendar_events

## 3.3 Learning content domain

Contains:

- resources
- resource_files
- notes
- pyqs
- notices
- courses_content
- topics

## 3.4 Quiz domain

Contains:

- quizzes
- quiz_questions
- quiz_options
- quiz_attempts
- quiz_answers
- quiz_result_cards

## 3.5 Community contribution domain

Contains:

- resource_submissions
- resource_submission_files
- moderation_reviews
- moderation_actions
- contributor_profiles

## 3.6 Communication domain

Contains:

- developer_threads
- developer_messages
- message_attachments
- notifications
- notification_preferences

## 3.7 Support domain

Contains:

- bug_reports
- course_update_requests
- syllabus_update_requests
- general_feedback
- support_categories

## 3.8 Toolbox domain

Contains:

- toolbox_items
- toolbox_categories
- toolbox_usage

## 3.9 Administration domain

Contains:

- admin_actions
- audit_logs
- app_settings
- feature_flags
- maintenance_settings

## 3.10 Analytics domain

Contains:

- user_events
- page_views
- quiz_events
- download_events

---

# 4. AUTHENTICATION ARCHITECTURE

BEU BABA should use Supabase Auth.

Supabase Auth manages authentication identity.

PostgreSQL application tables manage application-specific information.

Do not duplicate the authentication password.

The database should never store:

```text
password
password_confirmation
plain_password
```

Supabase Auth handles password credentials.

The application database stores the user's identity reference:

```text
auth.users.id
```

---

# 5. USER IDENTITY MODEL

The canonical identity is:

```text
auth.users.id
```

The application profile uses the same UUID.

Recommended structure:

```text
auth.users
    |
    | 1:1
    v
profiles
    |
    +---- student_profiles
    |
    +---- admin_profiles
```

A profile should be created automatically after registration.

Recommended trigger flow:

```text
User registers
      ↓
Supabase Auth creates auth.users
      ↓
Database trigger executes
      ↓
profiles row created
      ↓
Student onboarding completed
      ↓
student_profiles row completed
```

The trigger should create only the minimal profile.

Do not put complex business logic into an authentication trigger.

---

# 6. PROFILES TABLE

Recommended conceptual schema:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  avatar_type text not null default 'generated',
  avatar_url text,
  gender text,
  date_of_birth date,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

The actual production schema may add:

- username
- last_seen_at
- onboarding_completed
- profile_completion_percent
- deleted_at

---

# 7. AVATAR SYSTEM

BEU BABA supports two profile-image paths.

## 7.1 Uploaded profile image

The student can select an image from their device.

The database stores metadata.

The actual binary file belongs in object storage.

Never store a large image directly inside PostgreSQL.

Recommended:

```text
profiles
  avatar_url
  avatar_type = "uploaded"
```

Storage:

```text
avatars/{user_id}/profile.webp
```

---

## 7.2 Generated character avatar

The application can automatically choose a character based on the student's selected gender.

Important security rule:

Gender should not be inferred from a person's photograph.

The user explicitly selects the avatar category.

Example:

```text
avatar_type = generated
avatar_character_id = male_03
```

The generated avatar can be stored as an asset identifier rather than duplicating the image for every user.

This reduces storage.

---

# 8. STUDENT PROFILE TABLE

The profile table should remain generic.

Student-specific academic data belongs in:

```text
student_profiles
```

Example:

```sql
create table public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  course_id uuid not null,
  branch_id uuid,
  admission_year integer,
  current_semester_id uuid,
  enrollment_number text,
  college_name text,
  college_code text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Do not force every academic field to be mandatory if different courses require different fields.

---

# 9. USER ROLES

Roles should never be determined by a frontend variable.

Recommended roles:

```text
student
moderator
admin
super_admin
content_manager
support_manager
```

A user may have one or multiple administrative permissions.

A simple role table:

```sql
create table public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
```

However, for highly privileged systems, a permission-based model is preferable.

---

# 10. ROLE AND PERMISSION MODEL

Recommended permission examples:

```text
view_public_content
view_student_profile
edit_own_profile
submit_resource
create_quiz_attempt
message_developer
view_own_messages

manage_students
manage_resources
approve_resources
manage_quizzes
manage_syllabus
manage_calendar
manage_notices
manage_courses
manage_users
manage_settings
view_audit_logs
manage_roles
```

Roles map to permissions.

Example:

```text
student
  → view_public_content
  → edit_own_profile
  → submit_resource
  → create_quiz_attempt
  → message_developer

moderator
  → all student permissions
  → review_resource
  → approve_resource
  → reject_resource

admin
  → moderator permissions
  → manage_courses
  → manage_quizzes
  → manage_syllabus
  → manage_calendar
  → manage_notices
  → manage_students

super_admin
  → all permissions
```

---

# 11. AVOIDING ROLE ESCALATION

This is one of the most important security requirements.

Never allow:

```text
student
→ update user_roles
```

Never allow a normal student to modify:

```text
role = admin
```

Even if the frontend does not expose the field.

The database policy must reject it.

Role assignment should be performed through a privileged server-side operation or carefully controlled admin function.

---

# 12. COURSE STRUCTURE

The academic hierarchy should be:

```text
Course
  ↓
Branch
  ↓
Semester
  ↓
Subject
  ↓
Content
```

Example:

```text
B.Tech
 ├── CSE
 │    ├── Semester 1
 │    ├── Semester 2
 │    └── Semester 3
 │
 └── ECE
      ├── Semester 1
      └── Semester 2
```

This structure allows future courses:

```text
BCA
BBA
MCA
Diploma
MBA
```

without redesigning the entire application.

---

# 13. COURSES TABLE

Concept:

```sql
courses (
  id,
  name,
  short_name,
  description,
  duration_years,
  is_active,
  sort_order,
  created_at,
  updated_at
)
```

Example:

```text
B.Tech
BCA
BBA
```

Use `sort_order` for UI ordering.

Do not depend on alphabetical order.

---

# 14. BRANCHES TABLE

Concept:

```sql
branches (
  id,
  course_id,
  name,
  short_name,
  code,
  description,
  is_active,
  sort_order
)
```

A branch belongs to a course.

The foreign key must enforce:

```text
branches.course_id → courses.id
```

---

# 15. SEMESTERS TABLE

A semester should belong to a course or academic structure.

Concept:

```text
semester 1
semester 2
...
semester 8
```

Recommended fields:

```text
id
course_id
semester_number
name
short_name
is_active
sort_order
```

Avoid storing `"1st Semester"` as the only identifier.

Use:

```text
semester_number = 1
```

and generate display text.

---

# 16. SUBJECTS TABLE

Concept:

```text
subjects (
  id,
  course_id,
  branch_id,
  semester_id,
  code,
  name,
  short_name,
  credits,
  description,
  is_active,
  sort_order
)
```

A subject may be:

```text
Engineering Mathematics
Programming in C
Data Structures
Operating Systems
```

The subject code is useful for searching and importing academic data.

---

# 17. SUBJECT UNIQUENESS

Avoid accidental duplicates.

A suitable unique constraint may be:

```text
course_id + branch_id + semester_id + code
```

But be careful with common subjects.

If a common subject belongs to multiple branches, the model may require a separate subject catalog plus subject mappings.

For a simple first implementation, duplicated subject rows are acceptable only if they represent genuinely different academic records.

---

# 18. ACADEMIC YEAR

Academic year should be a separate entity.

Example:

```text
2025-26
2026-27
2027-28
```

Do not hardcode academic year in frontend code.

Recommended:

```text
academic_years
  id
  label
  start_date
  end_date
  is_current
```

Only one academic year should normally be marked current.

This allows future updates without deploying new frontend code.

---

# 19. SYLLABUS ARCHITECTURE

Syllabus is versioned content.

This is essential.

Do not overwrite an old syllabus without retaining history.

Recommended:

```text
syllabus
   ↓
syllabus_versions
   ↓
syllabus_subjects
   ↓
syllabus_units
   ↓
syllabus_topics
```

This allows:

```text
2025 syllabus
2026 syllabus
revised 2026 syllabus
```

to coexist.

---

# 20. SYLLABUS VERSIONING

A syllabus version should contain:

```text
id
course_id
branch_id
academic_year_id
version_number
title
status
effective_from
effective_to
published_at
created_by
created_at
updated_at
```

Statuses:

```text
draft
review
published
archived
```

Only one appropriate version should be presented to normal students as current.

---

# 21. SYLLABUS UPDATE WORKFLOW

Admin changes:

```text
Create draft
      ↓
Add subjects
      ↓
Add units
      ↓
Add topics
      ↓
Review
      ↓
Publish
      ↓
Old version archived
```

Do not directly edit published historical records when audit integrity matters.

Instead:

```text
Published v1
     ↓
Create v2
     ↓
modify v2
     ↓
publish v2
```

---

# 22. YEARLY ACADEMIC CALENDAR

The yearly calendar should also be data-driven.

Tables:

```text
academic_calendars
academic_calendar_events
```

Calendar event:

```text
id
calendar_id
title
description
event_type
start_date
end_date
location
is_holiday
is_exam
is_important
created_by
```

Possible event types:

```text
semester_start
semester_end
exam
holiday
registration
result
admission
practical
assignment
other
```

---

# 23. NOTICES

Notices should not be hardcoded.

Recommended fields:

```text
id
title
summary
content
category
priority
published_at
expires_at
is_published
is_pinned
attachment_id
created_by
updated_by
created_at
updated_at
```

The frontend can query:

```text
is_published = true
AND
published_at <= now()
AND
expires_at IS NULL OR expires_at > now()
```

---

# 24. RESOURCE ARCHITECTURE

BEU BABA can contain multiple resource types:

```text
PDF
DOC
PPT
IMAGE
VIDEO LINK
ZIP
QUESTION PAPER
NOTES
LAB MANUAL
ASSIGNMENT
REFERENCE
```

Use a generic resource table.

Example:

```text
resources
  id
  title
  description
  resource_type
  subject_id
  semester_id
  branch_id
  course_id
  visibility
  status
  created_by
  published_at
  created_at
  updated_at
```

---

# 25. RESOURCE STATUS

Recommended statuses:

```text
draft
pending_review
approved
rejected
archived
removed
```

Student-uploaded resources must initially be:

```text
pending_review
```

They must never automatically appear in the public library.

---

# 26. RESOURCE OWNERSHIP

Every resource should have an owner:

```text
created_by
```

This makes it possible to determine:

- Who uploaded it.
- Who created it.
- Who should receive moderation feedback.
- Who should receive contribution credit.
- Who should be contacted if copyright concerns arise.

---

# 27. FILE METADATA

Never assume the database itself is the file.

Store metadata such as:

```text
storage_bucket
storage_path
original_filename
mime_type
size_bytes
checksum
width
height
page_count
uploaded_at
```

This allows storage-provider replacement later.

---

# 28. STORAGE PATH DESIGN

Use deterministic private paths.

Example:

```text
resources/{resource_id}/{file_id}.pdf
```

Profile:

```text
avatars/{user_id}/profile.webp
```

Quiz card:

```text
quiz-cards/{user_id}/{attempt_id}.png
```

Developer attachment:

```text
support/{thread_id}/{message_id}/{file_id}
```

Never use:

```text
random/public/file.pdf
```

for private content.

---

# 29. STORAGE BUCKETS

Recommended buckets:

```text
avatars
resources
quiz-cards
support-attachments
admin-assets
```

Public/private configuration should be deliberate.

For example:

```text
avatars
```

may be public if privacy requirements permit it.

Student documents should generally use private storage with signed access.

---

# 30. PRIVATE FILE ACCESS

For private resources:

```text
Student requests resource
       ↓
Database confirms permission
       ↓
Server creates signed URL
       ↓
URL expires
       ↓
Student opens/downloads file
```

Do not expose permanent storage URLs for private documents.

---

# 31. SIGNED URL PRINCIPLES

Signed URLs should:

- expire quickly enough for the use case;
- not be stored permanently in database records;
- not be embedded into static source code;
- be generated only after authorization.

A signed URL is not a replacement for authorization.

The server should verify access before generating it.

---

# 32. DOWNLOAD SECURITY

A student who can download an approved public PDF can potentially share it.

No web application can guarantee that a user will never redistribute a file after obtaining it.

The goal is to prevent unauthorized direct storage access and make abuse harder.

Use:

- private buckets;
- signed URLs;
- access logging;
- rate limiting;
- watermarking where appropriate;
- contributor moderation;
- copyright reporting.

---

# 33. PYQ DATA MODEL

Previous-year questions can be represented using:

```text
pyq_papers
pyq_files
```

A paper can contain:

```text
year
semester
subject
exam_type
paper_code
title
file
```

Example:

```text
2025
B.Tech
CSE
Semester 3
Data Structures
End Semester
```

---

# 34. QUIZ DATA MODEL

Quiz entities:

```text
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_answers
quiz_result_cards
```

Relationship:

```text
quiz
 ↓
questions
 ↓
options
```

Attempt:

```text
student
 ↓
attempt
 ↓
answers
```

---

# 35. QUIZ TABLE

Recommended conceptual fields:

```text
id
title
description
category
difficulty
course_id
branch_id
semester_id
subject_id
duration_seconds
total_questions
passing_percentage
status
created_by
published_at
created_at
updated_at
```

Status:

```text
draft
published
archived
```

---

# 36. QUIZ QUESTIONS

A question belongs to a quiz.

Fields:

```text
id
quiz_id
question_text
explanation
question_type
marks
negative_marks
sort_order
created_at
updated_at
```

Question types can eventually include:

```text
single_choice
multiple_choice
true_false
```

Do not introduce complicated question types until required.

---

# 37. QUIZ OPTIONS

Fields:

```text
id
question_id
option_text
is_correct
sort_order
```

Important security point:

The frontend should not receive `is_correct` while the quiz is active.

Otherwise a user could inspect the network response and see answers.

Use a server-side query/view/function that excludes answer keys during an active attempt.

---

# 38. QUIZ ANSWER SECURITY

Never trust:

```text
score = 10
```

submitted by the browser.

The client should submit:

```text
selected_option_id
```

The server calculates:

```text
correctness
marks
negative marks
score
percentage
pass/fail
```

This prevents trivial score manipulation.

---

# 39. QUIZ ATTEMPT MODEL

An attempt contains:

```text
id
quiz_id
user_id
started_at
submitted_at
duration_seconds
status
score
max_score
percentage
correct_count
incorrect_count
unanswered_count
passed
```

Status:

```text
in_progress
submitted
expired
abandoned
```

---

# 40. QUIZ TIMER SECURITY

Do not rely only on JavaScript timers.

Bad:

```js
setInterval(() => remaining--, 1000)
```

A user can manipulate the browser.

Instead:

```text
started_at
duration_seconds
```

are authoritative.

Remaining time is calculated:

```text
deadline = started_at + duration
remaining = deadline - current_server_time
```

The server determines whether an attempt is still valid.

---

# 41. QUIZ RESULT CARD

After submission, a result card can be generated.

Database metadata:

```text
id
attempt_id
user_id
storage_path
generated_at
share_count
```

The actual image belongs in storage.

The card can include:

```text
BEU BABA
student name
quiz name
score
percentage
correct
incorrect
date
performance badge
```

Avoid exposing sensitive personal information on public share links.

---

# 42. STUDENT RESOURCE UPLOAD SYSTEM

Student contribution workflow:

```text
Student selects Upload Resource
        ↓
Chooses title
        ↓
Chooses course
        ↓
Chooses branch
        ↓
Chooses semester
        ↓
Chooses subject
        ↓
Adds description
        ↓
Uploads file
        ↓
Accepts contribution/copyright declaration
        ↓
Submission created
        ↓
status = pending_review
        ↓
Moderator reviews
        ↓
Approve / Reject
```

---

# 43. MODERATION TABLES

Recommended:

```text
resource_submissions
moderation_reviews
moderation_actions
```

A moderation record should contain:

```text
reviewer_id
submission_id
decision
reason
notes
created_at
```

Decisions:

```text
approved
rejected
needs_changes
```

---

# 44. COPYRIGHT AND CONTENT POLICY

Before submission, the UI should display a clear declaration.

Example concept:

```text
I confirm that I have permission to share this material and that
I am not knowingly uploading copyrighted or restricted content
without authorization.
```

Store:

```text
copyright_declaration_accepted = true
accepted_at
```

This does not legally guarantee ownership, but it creates a moderation record.

---

# 45. DEVELOPER MESSAGE SYSTEM

The app should not expose a general public chat room.

Instead, each student gets a private support thread.

Structure:

```text
student
   ↓
developer_thread
   ↓
developer_messages
```

Only:

```text
that student
authorized support/admin staff
```

can access the thread.

---

# 46. DEVELOPER THREAD

Fields:

```text
id
student_id
subject
category
status
last_message_at
created_at
updated_at
```

Categories:

```text
bug
course_update
syllabus_update
feature_request
account
resource
general
```

Statuses:

```text
open
waiting_student
waiting_developer
resolved
closed
```

---

# 47. DEVELOPER MESSAGE SECURITY

A student can:

```text
INSERT message where thread.student_id = auth.uid()
```

A student can:

```text
SELECT messages where thread.student_id = auth.uid()
```

A student must NOT be able to:

```text
SELECT another student's thread
SELECT another student's messages
UPDATE another student's message
DELETE developer messages
```

This must be enforced through RLS.

---

# 48. MESSAGE EDITING

For support communication, immutable messages are preferable.

Instead of allowing unrestricted editing:

```text
message
created_at
edited_at
```

If editing is needed, retain the original in an audit history.

For sensitive support systems, deleting messages should generally be restricted.

---

# 49. MESSAGE ATTACHMENTS

Students may need to send:

- screenshots;
- error images;
- PDF examples;
- relevant files.

Attachments should belong to a message.

Recommended:

```text
message_attachments
  id
  message_id
  storage_path
  mime_type
  size_bytes
  created_at
```

Storage must remain private.

---

# 50. NOTIFICATION SYSTEM

Notifications are database records plus optional push delivery.

Tables:

```text
notifications
notification_preferences
push_subscriptions
```

Notification examples:

```text
New notice
New PYQ
Quiz result
Resource approved
Resource rejected
Developer replied
Syllabus updated
Course content updated
Important academic alert
```

---

# 51. NOTIFICATION TABLE

Recommended:

```text
id
user_id
type
title
body
data jsonb
is_read
read_at
created_at
```

The `data` object can contain:

```json
{
  "route": "/quiz/abc",
  "quiz_id": "..."
}
```

Do not put untrusted executable content into notification data.

---

# 52. PUSH NOTIFICATIONS

PWA push notifications can be supported using browser Push API/service worker infrastructure.

Database:

```text
push_subscriptions
```

should store the subscription endpoint and cryptographic subscription data.

Never treat a push subscription as permanent.

Users can revoke permission.

Subscriptions can expire or become invalid.

---

# 53. NOTIFICATION PREFERENCES

Users should control categories.

Example:

```text
important announcements
quiz notifications
resource updates
developer replies
academic updates
```

Critical administrative notifications may remain enabled.

---

# 54. TOOLBOX DATA MODEL

The Student Toolbox should not be hardcoded into one giant frontend file.

Create:

```text
toolbox_categories
toolbox_items
```

Each item:

```text
id
category_id
name
description
icon
route
tool_type
is_active
sort_order
```

Possible tools:

```text
CGPA calculator
Percentage calculator
Unit converter
Age calculator
BMI calculator
Attendance calculator
Study timer
Pomodoro timer
Countdown
Random number generator
Scientific calculator
Date difference
GPA converter
File size calculator
```

The exact list can grow without requiring a new schema.

---

# 55. TOOLBOX SECURITY

Tools that perform local calculations do not need database storage unless usage history is required.

For example:

```text
CGPA calculator
```

can calculate entirely in the browser.

Only store history if the product requirement explicitly needs it.

This reduces database load and protects privacy.

---

# 56. FEEDBACK AND BUG REPORTS

Separate support categories can share one table.

Recommended:

```text
support_requests
```

Fields:

```text
id
user_id
category
title
description
priority
status
created_at
updated_at
resolved_at
assigned_to
```

Categories:

```text
bug
syllabus_update
course_update
resource_problem
account_problem
feature_request
general
```

---

# 57. ADMIN DASHBOARD DATA

The admin dashboard should not query every table independently from the browser.

Create secure server-side aggregate queries/functions.

Metrics may include:

```text
total students
active students
new registrations
pending resources
approved resources
pending support requests
published quizzes
quiz attempts
unread developer messages
latest activity
```

Avoid exposing raw student data unnecessarily.

---

# 58. STUDENT DIRECTORY

Admins may need:

```text
student name
email
phone
course
branch
semester
college
registration date
last activity
status
```

This is sensitive information.

RLS must restrict it to authorized administrative roles.

Students must never query the entire student directory.

---

# 59. SEARCH ARCHITECTURE

Search should operate on approved content.

Potential searchable entities:

```text
subjects
notes
PYQs
quizzes
notices
syllabus
toolbox
```

Do not return:

```text
private messages
private student profiles
pending submissions
admin records
audit logs
```

unless the user is explicitly authorized.

---

# 60. DATABASE SEARCH

For a moderate dataset, PostgreSQL full-text search is sufficient.

Potential fields:

```text
title
description
content
subject_name
tags
```

Use:

```text
tsvector
```

and appropriate indexes when necessary.

For larger scale, an external search engine can be added later without redesigning the main relational model.

---

# 61. TAGGING

Resources can have tags.

Recommended:

```text
resource_tags
tags
```

Examples:

```text
important
exam
unit-1
numerical
short-notes
revision
```

This improves filtering.

---

# 62. DATABASE INDEXING

Indexes are critical.

Potential indexes:

```text
student_profiles(course_id)
student_profiles(branch_id)
student_profiles(current_semester_id)

subjects(course_id)
subjects(branch_id)
subjects(semester_id)

resources(subject_id)
resources(status)
resources(published_at)

quizzes(subject_id)
quiz_attempts(user_id)
quiz_attempts(quiz_id)

notifications(user_id, is_read)
developer_threads(student_id)
developer_messages(thread_id)
support_requests(user_id, status)
```

Do not blindly create indexes for every column.

Every index has storage and write cost.

---

# 63. COMPOSITE INDEXES

Use composite indexes based on actual query patterns.

Example:

```text
resources(subject_id, status, published_at)
```

can support:

```text
subject = X
status = approved
ORDER BY published_at DESC
```

The exact index design should be validated using query plans.

---

# 64. FOREIGN KEY POLICY

Use foreign keys wherever relationships are real.

Example:

```text
quiz_questions.quiz_id → quizzes.id
```

This prevents orphaned questions.

However, be careful with deletion.

For academic records, `ON DELETE CASCADE` should not be used blindly.

---

# 65. SOFT DELETE

For important content, prefer:

```text
deleted_at
deleted_by
```

over physical deletion.

Useful for:

- resources;
- notices;
- quizzes;
- syllabus versions;
- support records;
- administrative records.

This allows recovery and auditing.

---

# 66. WHEN HARD DELETE IS APPROPRIATE

Hard deletion may be appropriate for:

- temporary upload records;
- expired sessions;
- invalid push subscriptions;
- temporary processing data.

Personal data deletion may also require actual deletion or anonymization depending on product policy and applicable law.

---

# 67. ACCOUNT DELETION

The application should provide a controlled account deletion process.

Concept:

```text
Delete account request
       ↓
Re-authentication / confirmation
       ↓
Disable account
       ↓
Anonymize or delete personal data according to retention policy
       ↓
Delete auth identity where appropriate
```

Do not casually delete audit records that are legally or operationally required.

---

# 68. PRIVACY PRINCIPLE

Collect only what BEU BABA actually needs.

Possible registration fields:

```text
name
email
phone
course
branch
semester
college
gender
profile image
```

Do not collect unrelated personal information.

---

# 69. PHONE NUMBER

Phone number should be treated as sensitive personal information.

Do not display it publicly.

Admins may see it if required.

A student should only see their own phone number.

---

# 70. EMAIL SECURITY

Do not expose the full email of every student in public APIs.

A student directory should never return all emails to ordinary users.

For admin UI, the email can be visible according to role.

---

# 71. ROW LEVEL SECURITY

RLS is mandatory for tables containing user-owned data.

At minimum:

```text
profiles
student_profiles
notifications
push_subscriptions
developer_threads
developer_messages
message_attachments
support_requests
resource_submissions
quiz_attempts
quiz_answers
```

must have carefully designed RLS policies.

---

# 72. RLS POLICY PRINCIPLE

A policy should answer:

```text
Who?
Can do what?
To which rows?
Under which conditions?
```

Example:

```text
user can SELECT own profile
```

means:

```sql
id = auth.uid()
```

For student profile:

```sql
user_id = auth.uid()
```

---

# 73. PUBLIC CONTENT POLICY

Approved public resources can have:

```text
SELECT
```

available to authenticated users.

But the application may still require login before access.

Therefore distinguish:

```text
database visibility
```

from:

```text
product login requirement
```

---

# 74. LOGIN REQUIREMENT

BEU BABA should require registration/login before accessing student-specific functionality.

Possible public pages:

```text
landing
about
developer
privacy
```

Student application:

```text
dashboard
courses
PYQs
quizzes
toolbox
resources
messages
profile
```

requires authentication.

---

# 75. AUTHENTICATION STATE

Frontend should use the Supabase session.

Never store the actual password in:

```text
localStorage
sessionStorage
IndexedDB
```

Supabase manages authentication tokens.

---

# 76. SERVICE ROLE KEY

Extremely important:

The Supabase service-role key must NEVER appear in:

```text
React source
Vite environment exposed to browser
GitHub repository
public JavaScript bundle
```

It bypasses RLS.

It belongs only in trusted server-side environments.

---

# 77. ENVIRONMENT VARIABLES

Frontend variables such as:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

can be exposed because they are intended for browser use.

But security must come from:

```text
RLS
storage policies
server-side functions
```

The anon key is not a secret.

---

# 78. SECRET MANAGEMENT

Secrets such as:

```text
service role key
push private keys
external API keys
email provider secrets
storage credentials
admin integration secrets
```

must remain server-side.

Use deployment platform secrets.

---

# 79. SUPABASE STORAGE POLICIES

Storage must also have policies.

Database RLS does not automatically secure Storage objects.

A student should be allowed to upload only into their own allowed path.

Example concept:

```text
avatars/{auth.uid()}/...
```

The policy verifies the first folder equals the current user ID.

---

# 80. RESOURCE UPLOAD SECURITY

Never trust:

```text
file extension
mime type
filename
```

Validate:

- MIME;
- extension;
- file size;
- content signature where possible;
- upload ownership;
- storage path.

Consider malware scanning for user-uploaded files.

---

# 81. FILE SIZE LIMITS

Set application-level limits.

Example concept:

```text
profile image: 5 MB
resource PDF: 25 MB
support image: 10 MB
```

The exact limits can be configured.

Do not let users upload unlimited data.

---

# 82. IMAGE PROCESSING

Profile images should be resized and compressed.

Recommended:

```text
WebP
```

where browser compatibility and requirements allow.

Store multiple sizes if needed:

```text
avatar-small
avatar-medium
avatar-large
```

This improves application performance.

---

# 83. RESOURCE FILE VALIDATION

A PDF upload should be validated as a PDF rather than trusting:

```text
notes.pdf
```

A malicious file could be renamed.

For production:

```text
extension check
MIME check
magic-byte validation
virus/malware scanning
```

should be considered.

---

# 84. RATE LIMITING

Important endpoints should have rate limits.

Examples:

```text
login attempts
OTP requests
support messages
resource uploads
quiz submissions
search requests
notification subscriptions
```

Do not rely only on frontend disabled buttons.

---

# 85. DUPLICATE UPLOAD DETECTION

Resource uploads can use a checksum.

Example:

```text
SHA-256
```

Store:

```text
checksum
```

Then detect exact duplicate files.

This can reduce storage waste and repeated moderation.

---

# 86. RESOURCE DUPLICATION

Two files with different checksums may still represent the same document.

Therefore checksum is only one signal.

Moderators may also need:

```text
same title
same subject
same academic year
same page count
```

to detect duplicates.

---

# 87. AUDIT LOG

Every sensitive administrative action should be recorded.

Example:

```text
audit_logs
  id
  actor_id
  action
  entity_type
  entity_id
  old_data
  new_data
  ip_hash_or_metadata
  user_agent
  created_at
```

Possible actions:

```text
resource_approved
resource_rejected
quiz_published
syllabus_published
notice_published
student_disabled
role_changed
settings_changed
```

---

# 88. AUDIT LOG IMMUTABILITY

Ordinary admins should not be able to modify audit logs.

Prefer:

```text
INSERT-only
```

architecture.

If deletion is required for retention policy, it should be handled by a highly privileged controlled process.

---

# 89. AUDIT LOG PRIVACY

Do not blindly store entire records in:

```text
old_data
new_data
```

if they contain sensitive information.

Mask:

```text
passwords
tokens
private file URLs
authentication secrets
```

Audit data must not become a second data leak.

---

# 90. APP SETTINGS

Global application settings should be database-driven.

Example:

```text
app_settings
  key
  value
  type
  description
  updated_by
  updated_at
```

Possible settings:

```text
maintenance_mode
maintenance_message
support_email
current_academic_year
registration_enabled
resource_upload_enabled
quiz_enabled
```

---

# 91. FEATURE FLAGS

Feature flags allow controlled rollout.

Example:

```text
quiz_system_enabled
resource_upload_enabled
new_search_enabled
new_dashboard_enabled
```

A flag can target:

```text
everyone
admins
specific users
percentage
```

Advanced targeting can be added later.

---

# 92. CONFIGURATION RULE

Do not store highly dynamic configuration inside frontend source code.

Bad:

```js
const CURRENT_SEMESTER = "6";
```

Better:

```text
database configuration
```

This allows academic changes without rebuilding the application.

---

# 93. CONTENT VERSIONING

Important content should have:

```text
version_number
created_at
updated_at
published_at
published_by
```

This is especially important for:

- syllabus;
- notices;
- quizzes;
- course content;
- academic calendars.

---

# 94. CONTENT PUBLISHING

Draft content should be invisible to students.

Flow:

```text
draft
 ↓
review
 ↓
published
 ↓
archived
```

Do not use a simple:

```text
is_visible
```

flag for everything.

Explicit statuses are easier to reason about.

---

# 95. TRANSACTIONAL OPERATIONS

Operations involving multiple related records should use database transactions.

Example quiz submission:

```text
create submission
create answers
calculate result
update attempt
create notification
```

If one critical step fails, inconsistent partial state should be avoided.

Use a secure server-side transaction/function where appropriate.

---

# 96. QUIZ SUBMISSION IDEMPOTENCY

A user may accidentally press Submit multiple times.

The server should prevent duplicate finalization.

Concept:

```text
if attempt.status != in_progress:
    reject duplicate submission
```

This is more reliable than disabling the button.

---

# 97. DATABASE FUNCTIONS

Database functions can be useful for:

- secure score calculation;
- role checks;
- aggregate dashboard metrics;
- atomic counters;
- controlled publishing;
- complex authorization.

However, do not put the entire business logic into PostgreSQL.

Keep responsibilities understandable.

---

# 98. EDGE FUNCTIONS / SERVER FUNCTIONS

Use server-side functions for tasks that require secrets or privileged operations.

Examples:

```text
generate signed file URL
send notification
process push subscription
generate quiz result card
scan upload
perform privileged admin action
```

The browser should call the trusted function.

---

# 99. DATA ACCESS LAYERS

Frontend architecture should not scatter raw SQL-like logic across components.

Use a structured service layer:

```text
src/
  services/
    auth/
    students/
    courses/
    resources/
    quizzes/
    notifications/
    support/
    admin/
```

This keeps database interaction maintainable.

---

# 100. QUERY KEYS AND CACHING

If React Query/TanStack Query is used, define predictable keys.

Example:

```text
["courses"]
["branches", courseId]
["subjects", semesterId]
["resources", subjectId]
["quiz", quizId]
["notifications", userId]
```

Invalidate the correct keys after mutations.

---

# 101. OFFLINE PWA DATA

Do not blindly cache private database responses in public browser caches.

Public/static assets can be cached aggressively.

Private student information should use careful cache controls.

Never cache:

```text
admin data
private messages
student directory
private support attachments
```

into a shared cache.

---

# 102. LOCAL STORAGE

Local storage can contain non-sensitive preferences:

```text
theme preference
sidebar state
selected UI layout
quiz UI preference
```

Do not store:

```text
password
service key
private database records
long-lived sensitive tokens
```

---

# 103. QUIZ OFFLINE MODE

Offline quiz mode is possible but significantly more complex.

For the initial BEU BABA version, prefer:

```text
online quiz attempt
```

with strong server validation.

Offline support can be added later with signed question sets and reconciliation.

---

# 104. DATABASE MIGRATIONS

Never manually modify production schema without a migration.

Every schema change should be represented by a migration file.

Example:

```text
001_initial_schema.sql
002_add_resource_status.sql
003_add_quiz_attempts.sql
004_add_notification_preferences.sql
```

Use version control.

---

# 105. MIGRATION RULE

Every migration must be:

1. Reproducible.
2. Reviewable.
3. Tested.
4. Ordered.
5. Documented.
6. Safe to deploy.

Do not edit an already-applied migration to change history.

Create a new migration.

---

# 106. SEED DATA

Development should have seed data.

Example:

```text
B.Tech
CSE
ECE
Semester 1–8
sample subjects
sample quizzes
sample notices
sample toolbox tools
```

Do not use real student information in development seeds.

---

# 107. DEVELOPMENT VS PRODUCTION

Use separate environments where possible.

```text
development
staging
production
```

Never test destructive database migrations directly on production.

---

# 108. TEST DATA

Use clearly fake:

```text
student@example.com
```

style data.

Never upload real student phone numbers or academic records into test environments.

---

# 109. BACKUPS

Production database backups are essential.

Backup strategy should consider:

```text
daily backups
point-in-time recovery
storage backups
critical configuration backups
migration files in Git
```

The exact Supabase plan determines available automated backup capabilities.

---

# 110. STORAGE BACKUPS

Database backup alone is insufficient.

If a database row says:

```text
resources/abc/file.pdf
```

but the file is gone, the record is useless.

Therefore critical storage objects should have a backup/recovery strategy.

---

# 111. DISASTER RECOVERY

Define:

```text
RPO = acceptable data loss
RTO = acceptable recovery time
```

Example target:

```text
RPO: 24 hours or better
RTO: 4 hours or better
```

These are planning targets, not guarantees.

---

# 112. DATABASE MONITORING

Monitor:

```text
database size
storage usage
query latency
failed requests
authentication failures
RLS errors
storage errors
function errors
```

Look for abnormal patterns.

---

# 113. DATABASE PERFORMANCE

Avoid fetching huge datasets.

Bad:

```text
SELECT * FROM resources;
```

Better:

```text
pagination
filters
limited fields
ordering
indexes
```

---

# 114. PAGINATION

Admin student lists and resource lists should be paginated.

Do not load 20,000 students into one browser response.

Possible page size:

```text
20
50
100
```

depending on UI.

---

# 115. CURSOR PAGINATION

For very large datasets, cursor-based pagination can outperform large offsets.

For example:

```text
created_at < last_seen_created_at
```

This can be useful for:

```text
notifications
resources
audit logs
messages
```

---

# 116. NOTIFICATION PAGINATION

The notification panel should initially load recent records.

Example:

```text
20 latest notifications
```

Then load more when requested.

Marking notifications read should update only necessary rows.

---

# 117. UNREAD COUNT

Do not fetch every notification just to calculate unread count.

Use:

```text
COUNT(*) WHERE user_id = auth.uid()
AND is_read = false
```

or an appropriate cached/aggregate mechanism.

---

# 118. REAL-TIME FEATURES

Supabase Realtime can be used for:

```text
developer messages
notification count
admin moderation updates
```

Do not enable realtime on every table automatically.

Only use it where live updates materially improve UX.

---

# 119. REAL-TIME SECURITY

Realtime subscriptions must respect authorization.

A student must not subscribe to:

```text
all developer_messages
```

They should receive only their own thread messages.

Security must be validated server-side.

---

# 120. MESSAGE ORDERING

Developer messages should have:

```text
created_at
id
```

Use both when ordering to prevent ambiguous ordering if timestamps are identical.

---

# 121. MESSAGE READ STATUS

Add:

```text
read_at
```

to messages or maintain a participant-level read cursor.

For a one-student/one-developer support thread, a simple `read_at` can be sufficient.

---

# 122. DEVELOPER REPLY NOTIFICATION

Flow:

```text
Developer sends message
       ↓
Message stored
       ↓
Notification created
       ↓
Push notification attempted
       ↓
Student opens thread
       ↓
Messages marked read
```

If push delivery fails, the in-app notification remains.

---

# 123. RESOURCE APPROVAL NOTIFICATION

When approved:

```text
resource status = approved
```

then create:

```text
notification:
"Your resource has been approved."
```

When rejected:

```text
notification:
"Your resource needs changes."
```

Include a safe reason.

---

# 124. SYLLABUS UPDATE NOTIFICATION

When a new syllabus version is published:

```text
find affected students
       ↓
create notifications
```

Do not notify every student if only one branch is affected.

Target:

```text
course
branch
semester
```

where appropriate.

---

# 125. ACADEMIC CALENDAR NOTIFICATION

Important events can create scheduled notifications.

For example:

```text
Exam starts tomorrow
```

This should be generated by a scheduled backend process rather than requiring the browser to remain open.

---

# 126. DATA RETENTION

Define retention periods.

Potential categories:

```text
support messages
audit logs
analytics events
quiz attempts
deleted accounts
temporary uploads
notifications
```

Do not retain everything forever by default.

---

# 127. ANALYTICS PRIVACY

Analytics should answer product questions without collecting unnecessary personal data.

Useful:

```text
quiz_started
quiz_completed
resource_opened
search_performed
tool_used
```

Avoid storing sensitive raw values unless required.

---

# 128. ANALYTICS EVENTS

Recommended:

```text
user_events
  id
  user_id
  event_name
  entity_type
  entity_id
  metadata
  created_at
```

Metadata must be validated.

Never let arbitrary users inject huge JSON blobs.

---

# 129. ADMIN ANALYTICS

Admin dashboard can show:

```text
daily active users
weekly active users
quiz completion
resource downloads
popular subjects
popular tools
search terms
```

Sensitive information should be aggregated.

---

# 130. SEARCH ANALYTICS

Store search terms only if product analytics requires it.

Consider privacy.

Avoid storing sensitive user input indefinitely.

---

# 131. DATA VALIDATION

Database constraints should complement frontend validation.

Frontend:

```text
required field
email format
file size
```

Database:

```text
NOT NULL
CHECK
UNIQUE
FOREIGN KEY
```

Server:

```text
authorization
business rules
content validation
```

All three layers matter.

---

# 132. CHECK CONSTRAINTS

Examples:

```text
semester_number between 1 and 12
percentage between 0 and 100
duration_seconds > 0
marks >= 0
```

Do not rely entirely on TypeScript types.

---

# 133. ENUMS VS TEXT

Use enums or constrained text carefully.

Stable states such as:

```text
published
archived
```

can use Postgres enums or check constraints.

For rapidly changing categories, a table can be more flexible.

Do not create dozens of PostgreSQL enums unnecessarily.

---

# 134. TIMESTAMPS

Use:

```text
timestamptz
```

rather than plain timestamp for real-world event times.

Store UTC.

Frontend displays local time.

---

# 135. TIME ZONE

India users will generally see:

```text
Asia/Kolkata
```

but the database should store UTC timestamps.

Example:

```text
2026-09-01T18:30:00Z
```

The frontend formats it according to user locale.

---

# 136. MONEY

If paid courses are added later, do not use floating-point numbers for money.

Use:

```text
integer paise
```

or:

```text
numeric(12,2)
```

with explicit currency.

Example:

```text
49900 paise = ₹499
```

---

# 137. FUTURE PAID COURSE SUPPORT

Even if BEU BABA initially contains free academic content, design for future entitlements.

Potential future tables:

```text
products
orders
payments
subscriptions
entitlements
```

A student purchase should create an entitlement.

Do not make:

```text
has_paid = true
```

the entire payment architecture.

---

# 138. ENTITLEMENT MODEL

Future structure:

```text
student
 ↓
purchase
 ↓
entitlement
 ↓
course/content
```

This allows:

```text
monthly access
yearly access
lifetime access
specific subject access
bundle access
```

---

# 139. CONTENT ACCESS

A resource can eventually have:

```text
visibility = public
visibility = authenticated
visibility = enrolled
visibility = paid
visibility = admin_only
```

Authorization must happen server-side.

---

# 140. ADMIN CONTENT MANAGEMENT

Admins should be able to:

```text
create
edit
draft
preview
publish
archive
restore
```

for content.

Publishing should be a deliberate action.

---

# 141. PREVIEW MODE

Admins should be able to preview draft content without publishing it.

The preview endpoint must require admin permission.

Do not make draft resources publicly accessible just because an admin wants to preview them.

---

# 142. CONTENT IMPORT

BEU BABA may use JSON imports for:

```text
courses
branches
subjects
syllabus
calendar
PYQ metadata
toolbox
```

Import pipeline:

```text
upload JSON
 ↓
validate schema
 ↓
show preview
 ↓
detect duplicates
 ↓
admin confirms
 ↓
transactional import
 ↓
audit log
```

Never directly insert arbitrary uploaded JSON into production.

---

# 143. JSON SCHEMA VALIDATION

An import should validate:

```text
required fields
field types
IDs
relationships
allowed statuses
dates
duplicate keys
```

Reject invalid data with human-readable errors.

---

# 144. PARTIAL IMPORTS

For critical academic data, prefer atomic import:

```text
all valid → commit
any critical error → rollback
```

This prevents half-updated syllabus data.

---

# 145. ACADEMIC DATA UPDATE WITHOUT APP UPDATE

The frontend should query:

```text
current syllabus
current academic year
calendar events
notices
subjects
```

from the database.

Therefore an admin can change:

```text
syllabus
calendar
notice
PYQ
subject
```

without publishing a new PWA version.

This is a core BEU BABA requirement.

---

# 146. STATIC ASSETS VS DATABASE DATA

Static:

```text
logo
icons
illustrations
default avatars
UI assets
```

can be bundled or stored in asset storage.

Dynamic:

```text
syllabus
PYQ
notices
quizzes
student data
resources
calendar
```

belongs in database/storage.

---

# 147. DATA OWNERSHIP

Every major dynamic record should answer:

```text
Who created it?
Who modified it?
Who published it?
When?
```

Recommended:

```text
created_by
updated_by
published_by
```

where relevant.

---

# 148. ADMIN DEACTIVATION

If a staff account is removed, historical records should not become ownerless.

Do not cascade-delete all content created by an admin.

Instead:

```text
user account disabled
content remains
audit history remains
```

---

# 149. DEVELOPER ACCOUNT

Developer/support personnel should use the same authentication foundation but have controlled roles.

Avoid a special hidden login URL that bypasses normal authentication.

---

# 150. SUPER ADMIN

Super admin should be extremely limited.

Capabilities:

```text
role management
security settings
application settings
maintenance mode
audit access
```

Only trusted accounts should receive it.

---

# 151. ADMIN SESSION SECURITY

Admin sessions should have stronger protections where practical:

```text
MFA
shorter session lifetime
reauthentication for dangerous actions
```

For example:

```text
delete user
change role
disable application
```

may require recent authentication.

---

# 152. DANGEROUS ADMIN ACTIONS

Require confirmation for:

```text
delete
archive
publish
reject
disable user
change role
```

For irreversible actions, require explicit confirmation.

---

# 153. AUDITABLE PUBLISHING

When an admin publishes a syllabus:

```text
actor
version
time
old current version
new current version
```

should be auditable.

---

# 154. CONTENT ROLLBACK

If a new syllabus is wrong:

```text
v2 published
 ↓
problem discovered
 ↓
rollback to v1
```

The database should preserve both versions.

Do not delete v2 merely to undo it.

---

# 155. NOTICE EXPIRATION

Notices should support:

```text
published_at
expires_at
```

so old notices can disappear automatically without manual deletion.

---

# 156. PINNED NOTICES

A notice may have:

```text
is_pinned
```

but UI should impose a reasonable maximum number of pinned notices.

Do not allow 100 notices to appear as pinned.

---

# 157. RESOURCE APPROVAL QUEUE

Admin interface should show:

```text
pending count
```

and filter by:

```text
course
branch
semester
subject
upload date
contributor
status
```

---

# 158. MODERATION PRIORITY

A submission can have:

```text
normal
high
urgent
```

Priority should be controlled to avoid students marking every upload urgent.

---

# 159. CONTRIBUTOR REPUTATION

Future feature:

```text
contributor_score
approved_count
rejected_count
```

This can help prioritize moderation.

Do not automatically grant moderation rights based only on score.

---

# 160. STUDENT PROFILE COMPLETION

A profile completion percentage can be calculated from required fields.

Example:

```text
name = yes
email = yes
phone = yes
course = yes
branch = yes
avatar = yes
```

The frontend can display:

```text
Profile 90% complete
```

This is UX data and does not need to be authoritative.

---

# 161. DATA NORMALIZATION

Avoid duplicate student identity fields across:

```text
profiles
student_profiles
quiz_attempts
support_requests
```

Quiz attempt should reference:

```text
user_id
```

rather than storing the student's name again.

When generating a historical certificate/result card, snapshot data may be stored intentionally.

---

# 162. HISTORICAL SNAPSHOTS

For documents that should preserve what was shown at a point in time, snapshots are appropriate.

Example quiz result card:

```text
student_name_snapshot
quiz_title_snapshot
```

This means a later profile name change does not alter an already generated result artifact.

---

# 163. RESOURCE TITLE SNAPSHOTS

Usually not required.

A resource should reference the subject.

Historical export may optionally snapshot labels.

Avoid unnecessary duplication.

---

# 164. DATABASE NAMING CONVENTION

Use:

```text
snake_case
```

for database identifiers.

Example:

```text
student_profiles
academic_calendar_events
quiz_attempts
```

Use singular/plural convention consistently.

Prefer plural table names throughout.

---

# 165. PRIMARY KEY CONVENTION

Use:

```text
id uuid
```

for major entities.

Join tables may use:

```text
composite primary key
```

when appropriate.

---

# 166. CREATED/UPDATED TIMESTAMPS

Most mutable tables should have:

```text
created_at
updated_at
```

Use a database trigger to automatically update:

```text
updated_at
```

rather than trusting the frontend.

---

# 167. AUDITABLE USER CHANGES

For profile updates, consider storing:

```text
profile_updated_at
```

and possibly a profile history table if necessary.

Do not audit every keystroke.

Audit meaningful changes.

---

# 168. DATABASE VIEWS

Views can simplify secure read models.

Examples:

```text
published_resources_view
current_syllabus_view
student_dashboard_summary
admin_dashboard_metrics
```

A view can expose only required columns.

This is safer than repeatedly exposing raw tables.

---

# 169. SECURITY DEFINER FUNCTIONS

If using `SECURITY DEFINER`, be extremely careful.

Requirements:

- fixed search path;
- explicit permission checks;
- no user-controlled SQL;
- limited privileges;
- reviewed code.

Never use security-definer functions casually.

---

# 170. SQL INJECTION

Supabase client libraries and parameterized queries reduce SQL injection risk.

Never concatenate user text into raw SQL.

Bad:

```text
"... WHERE title = '" + userInput + "'"
```

Use parameters or typed query APIs.

---

# 171. XSS

Database security does not automatically prevent XSS.

Student-uploaded:

```text
resource title
description
support message
quiz content
```

must be safely rendered.

Do not use dangerous raw HTML rendering unless sanitized.

---

# 172. RICH TEXT

If admin content requires rich text:

```text
Markdown
or
sanitized HTML
```

can be used.

Sanitize HTML before display.

Never trust stored HTML just because it came from an authenticated admin.

---

# 173. USER-GENERATED CONTENT

Treat student submissions as untrusted.

This includes:

```text
filename
title
description
resource tags
support message
quiz card sharing text
```

Escape output.

---

# 174. FILE NAMES

Never use the original filename as the actual storage path.

Original:

```text
Important Notes Final.pdf
```

should become something like:

```text
resources/{resource_id}/{file_id}.pdf
```

The original name remains metadata.

---

# 175. RESOURCE DOWNLOAD LOG

Optional:

```text
resource_downloads
```

can record:

```text
user_id
resource_id
created_at
```

Do not store the raw signed URL.

---

# 176. QUIZ ANALYTICS

Store useful events:

```text
started
answered
paused
submitted
expired
```

But avoid recording every second of timer movement.

That creates unnecessary data.

---

# 177. QUIZ QUESTION ANALYTICS

Useful aggregates:

```text
question_attempt_count
correct_count
incorrect_count
accuracy
```

These can identify difficult questions.

---

# 178. QUESTION QUALITY

Admin can use analytics to identify:

```text
too easy
too hard
ambiguous
high skip rate
```

Then update the question.

Do not expose internal question-quality analytics to students.

---

# 179. RESULT INTEGRITY

The score stored in the database should be the server-calculated result.

A client-side score can be shown optimistically but must be replaced with authoritative server result.

---

# 180. DATABASE TRANSACTION FOR RESULT

Concept:

```text
BEGIN
  lock attempt
  verify status
  verify deadline
  validate answers
  calculate score
  insert answer records
  update attempt
  create result metadata
COMMIT
```

This protects against race conditions.

---

# 181. CONCURRENCY

Two browser tabs can attempt the same quiz.

The server must handle:

```text
same attempt
multiple submissions
```

using row locking/status checks.

---

# 182. SUPPORT THREAD CONCURRENCY

A student may send two messages rapidly.

The system should permit valid messages without corrupting:

```text
last_message_at
```

Use database timestamps and atomic updates where necessary.

---

# 183. NOTIFICATION DUPLICATION

If an event is processed twice, users should not receive duplicate notifications.

Consider an idempotency key such as:

```text
event_type + entity_id + user_id
```

for critical notifications.

---

# 184. BACKGROUND JOBS

Some tasks should not block the frontend request.

Examples:

```text
push notification
quiz card generation
file scanning
image optimization
analytics aggregation
```

Use background jobs/edge functions/scheduled processes as appropriate.

---

# 185. SCHEDULED JOBS

Academic reminders can be generated using scheduled backend jobs.

Example:

```text
exam tomorrow
```

The job checks calendar events and eligible students.

Avoid relying on an open browser tab.

---

# 186. CLEANUP JOBS

Scheduled cleanup can remove:

```text
expired temporary files
invalid push subscriptions
old transient sessions
unfinished stale processing jobs
```

Keep cleanup conservative.

Do not delete important academic records automatically.

---

# 187. STORAGE QUOTA

Monitor:

```text
total storage
largest files
upload rate
per-user upload volume
```

Set quotas.

Example:

```text
student contribution quota
```

prevents one user from filling the entire storage bucket.

---

# 188. ABUSE PREVENTION

Resource upload should limit:

```text
uploads per hour
uploads per day
file size
total pending submissions
```

This protects the moderation queue.

---

# 189. ADMIN RESOURCE REVIEW

Admin should see:

```text
preview
metadata
uploader
submission date
subject
file size
file type
duplicate warning
copyright declaration
```

Admin can:

```text
approve
reject
request changes
archive
```

---

# 190. RESOURCE REJECTION REASON

Do not send only:

```text
Rejected
```

Give structured reasons:

```text
duplicate
wrong subject
poor quality
copyright concern
invalid file
missing information
other
```

Optional admin notes can provide details.

---

# 191. STUDENT REVISION

If status is:

```text
needs_changes
```

student can modify and resubmit.

The system should preserve moderation history.

---

# 192. MODERATION HISTORY

Do not overwrite:

```text
reviewer
decision
reason
```

Each review should be a separate record.

This creates an audit trail.

---

# 193. CONTENT OWNERSHIP AFTER MODERATION

Once approved, a resource remains attributable to its contributor.

If contributor account is later deleted, the product must decide whether to:

```text
remove resource
anonymize contributor
retain content
```

This should be documented in privacy policy.

---

# 194. DATA CONSISTENCY EXAMPLE

If a branch is deleted, what happens to its subjects?

Never leave orphan records.

Possible approach:

```text
branch disabled
```

rather than deleted.

Academic entities should generally be archived rather than physically deleted.

---

# 195. ACADEMIC RECORD ARCHIVAL

Use:

```text
is_active
archived_at
```

This allows old students and historical documents to continue referencing old branches.

---

# 196. CURRENT VS HISTORICAL DATA

The UI needs:

```text
current
```

while administrators need:

```text
historical
```

The database must support both.

This is why:

```text
academic_year
version
status
effective dates
```

are important.

---

# 197. COURSE CONTENT VERSIONING

Course notes can also have versions.

Example:

```text
Data Structures Notes v1
Data Structures Notes v2
```

A resource may have:

```text
version_number
replaces_resource_id
```

if version history is required.

---

# 198. RESOURCE REPLACEMENT

If a PDF is wrong:

```text
old resource
 ↓
new resource
```

Do not necessarily delete the old file immediately.

Archive it and retain audit information.

---

# 199. ADMIN PREVIEW OF FILES

Private files should be accessible to admins through controlled signed URLs.

Do not make the entire resource bucket public just for admin preview.

---

# 200. DATABASE SECURITY CHECKLIST

Before production:

```text
[ ] RLS enabled
[ ] RLS tested
[ ] Storage policies tested
[ ] Service role key protected
[ ] Admin role protected
[ ] Student directory private
[ ] Messages private
[ ] Support attachments private
[ ] Quiz answer keys protected
[ ] Server-side score calculation
[ ] Upload limits configured
[ ] Rate limits configured
[ ] Audit logs enabled
[ ] Backups configured
[ ] Migrations versioned
[ ] Secrets not committed
```

---

# 201. RLS TEST MATRIX

Test:

```text
anonymous
student A
student B
moderator
admin
super admin
```

For each role test:

```text
SELECT
INSERT
UPDATE
DELETE
```

for every sensitive table.

---

# 202. STUDENT A / STUDENT B ISOLATION TEST

This is mandatory.

Create:

```text
Student A
Student B
```

Then verify:

Student A cannot:

```text
read B profile
read B messages
read B support tickets
read B quiz answers
read B private files
```

Student B must also be isolated from A.

---

# 203. ADMIN ISOLATION

A moderator should not automatically gain:

```text
role management
global settings
audit deletion
```

unless explicitly granted.

Permissions should be granular.

---

# 204. STORAGE ISOLATION TEST

Attempt:

```text
Student A requests Student B avatar
Student A requests Student B private attachment
Student A requests pending resource
```

All unauthorized requests must fail.

---

# 205. API SECURITY

Even if frontend routes hide pages, direct API requests must enforce authorization.

Test with:

```text
browser devtools
curl
Postman
direct Supabase queries
```

where permitted during security testing.

---

# 206. SECURITY HEADERS

The deployment should consider:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Configure carefully so PWA functionality is not broken.

---

# 207. CSP

A strict Content Security Policy can reduce XSS risk.

However, third-party integrations such as:

```text
YouTube embeds
Supabase
analytics
```

must be explicitly considered.

Do not use:

```text
unsafe-inline
```

unnecessarily.

---

# 208. ERROR MESSAGES

Do not expose database errors directly to users.

Bad:

```text
Postgres error: relation public.student_profiles...
```

Good:

```text
Something went wrong while loading your profile.
Please try again.
```

Log detailed errors server-side.

---

# 209. ADMIN ERROR LOGGING

Admin/developer dashboards can show:

```text
error ID
timestamp
operation
severity
```

Avoid exposing sensitive stack traces to normal users.

---

# 210. DATABASE CONNECTION SAFETY

The browser should not create arbitrary database connections.

Use the Supabase client.

For server workloads, use appropriate connection pooling.

---

# 211. DATA FETCHING PRINCIPLE

Fetch only fields required for the current UI.

For a resource card:

```text
id
title
resource_type
thumbnail
subject
created_at
```

Do not fetch:

```text
full content
audit data
private uploader details
```

unless needed.

---

# 212. ADMIN STUDENT CARD

A student card can show:

```text
avatar
name
course
branch
semester
email
phone
status
```

but the underlying query should return only authorized fields.

---

# 213. PROFILE API

Student profile response should contain:

```text
own profile
own academic data
own preferences
```

not:

```text
all users
```

---

# 214. DATA EXPORT

A student may eventually request their data.

Export could contain:

```text
profile
academic information
quiz attempts
resource submissions
support conversations
preferences
```

Do not include internal audit metadata unnecessarily.

---

# 215. ADMIN EXPORT

Admin exports of student data should be restricted.

Potential format:

```text
CSV
XLSX
JSON
```

Exports should be logged.

---

# 216. EXPORT SECURITY

Generated exports should be:

```text
temporary
private
signed
expiring
```

Do not create permanent public download links containing student data.

---

# 217. DATABASE SECRETS IN LOGS

Never log:

```text
password
auth token
service role key
signed URL
push private key
```

Mask sensitive data.

---

# 218. USER ENUMERATION

Authentication errors should avoid revealing whether an email belongs to an account when that distinction creates abuse risk.

Use generic responses where appropriate.

---

# 219. EMAIL VERIFICATION

If email verification is enabled:

```text
registration
 ↓
verification email
 ↓
verified
 ↓
onboarding
```

Application should decide whether unverified users can access limited functionality.

---

# 220. ACCOUNT STATUS

Profiles can have:

```text
active
suspended
pending
deleted
```

Suspended users should be denied application access through server-side authorization.

---

# 221. SUSPENSION REASON

Store a private admin reason.

Do not expose internal moderation notes automatically.

Student-facing message can be:

```text
Your account is currently unavailable.
Please contact support.
```

---

# 222. MAINTENANCE MODE

Global setting:

```text
maintenance_mode = true
```

When enabled:

```text
normal users
→ maintenance screen

admins
→ admin access
```

The bypass must be server-side.

---

# 223. EMERGENCY KILL SWITCH

Feature flags can disable:

```text
resource uploads
quiz
developer attachments
registration
```

if a security problem occurs.

This is valuable in production.

---

# 224. DATA MODEL DOCUMENTATION

Every table should eventually have:

```text
purpose
columns
relationships
RLS rules
storage dependencies
API usage
retention policy
```

This document provides the architecture; implementation should maintain table-level documentation alongside migrations.

---

# 225. RECOMMENDED CORE TABLE MAP

The initial production database can include:

```text
profiles
user_roles
student_profiles

courses
branches
semesters
subjects
academic_years
syllabus_versions
syllabus_subjects
syllabus_units
syllabus_topics
academic_calendars
academic_calendar_events

resources
resource_files
pyq_papers
pyq_files
notices

quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_answers
quiz_result_cards

resource_submissions
resource_submission_files
moderation_reviews

developer_threads
developer_messages
message_attachments

notifications
notification_preferences
push_subscriptions

support_requests

toolbox_categories
toolbox_items
toolbox_usage

audit_logs
app_settings
feature_flags
user_events
```

---

# 226. RECOMMENDED RELATIONSHIP MAP

```text
AUTH.USERS
   │
   └── PROFILES
        │
        ├── STUDENT_PROFILES
        │       │
        │       ├── COURSE
        │       ├── BRANCH
        │       └── SEMESTER
        │
        ├── USER_ROLES
        │
        ├── QUIZ_ATTEMPTS
        │
        ├── RESOURCE_SUBMISSIONS
        │
        ├── DEVELOPER_THREADS
        │
        ├── SUPPORT_REQUESTS
        │
        └── NOTIFICATIONS

COURSE
  │
  └── BRANCH
       │
       └── SEMESTER
            │
            └── SUBJECT
                 │
                 ├── RESOURCES
                 ├── PYQs
                 └── QUIZZES
```

---

# 227. RECOMMENDED CONTENT RELATIONSHIP

```text
COURSE
  ↓
BRANCH
  ↓
SEMESTER
  ↓
SUBJECT
  ↓
RESOURCE / PYQ / QUIZ
```

This should be the dominant academic navigation structure.

---

# 228. DATABASE API DESIGN

Frontend should think in terms of business operations:

```text
getCourses()
getBranches(courseId)
getSemesters(courseId)
getSubjects(semesterId)
getResources(subjectId)
getCurrentSyllabus(...)
getCalendar(...)
getPublishedNotices()
startQuiz(quizId)
submitQuiz(attemptId, answers)
getMyMessages()
sendDeveloperMessage(...)
submitResource(...)
```

Avoid spreading raw table logic throughout UI components.

---

# 229. SECURITY OF BUSINESS FUNCTIONS

Functions such as:

```text
submitQuiz()
approveResource()
publishSyllabus()
sendDeveloperMessage()
```

must verify authorization.

Do not trust a client-provided:

```text
user_id
role
created_by
approved_by
```

Use authenticated identity.

---

# 230. AUTH.UID AS IDENTITY

Whenever possible:

```text
auth.uid()
```

should determine the current user.

Not:

```text
request.user_id
```

provided by the browser.

---

# 231. CREATED_BY SECURITY

When inserting:

```text
created_by
```

should be derived from:

```text
auth.uid()
```

rather than accepted from arbitrary client input.

---

# 232. ADMIN ACTOR SECURITY

For admin operations:

```text
actor_id = auth.uid()
```

and role/permission is checked server-side.

---

# 233. STUDENT RESOURCE OWNERSHIP

When a student uploads a resource:

```text
created_by = auth.uid()
```

The student cannot submit on behalf of another account.

---

# 234. SUPPORT THREAD OWNERSHIP

When creating a developer thread:

```text
student_id = auth.uid()
```

The student cannot choose another student ID.

---

# 235. QUIZ ATTEMPT OWNERSHIP

When starting a quiz:

```text
user_id = auth.uid()
```

The client cannot specify another user.

---

# 236. QUIZ ANSWER OWNERSHIP

Answers must belong to:

```text
attempt
```

and attempt must belong to:

```text
auth.uid()
```

Do not authorize answers independently without verifying the parent attempt.

---

# 237. NESTED AUTHORIZATION

For nested entities:

```text
message
 → thread
 → student
```

authorization must traverse the relationship.

The fact that a message has an ID does not prove ownership.

---

# 238. STORAGE OBJECT OWNERSHIP

Storage policies must use:

```text
auth.uid()
```

and path rules.

Do not trust metadata supplied by the browser.

---

# 239. ADMIN FILE ACCESS

Admin access should be policy-based.

Not every staff member should automatically see every private student file.

For example:

```text
support manager → support attachments
content manager → resource files
admin → broader access
```

---

# 240. LEAST PRIVILEGE

Every role should receive the minimum permissions necessary.

This limits damage if an account is compromised.

---

# 241. DATABASE SECURITY REVIEW

Before launch, review:

```text
every table
every policy
every storage bucket
every function
every admin endpoint
every public view
```

Do not assume a policy is secure because it "looks correct."

Test it.

---

# 242. PERFORMANCE REVIEW

Before launch:

```text
EXPLAIN ANALYZE
```

important queries.

Look for:

```text
sequential scans
slow joins
unnecessary data transfer
missing indexes
```

---

# 243. LARGE RESOURCE LIBRARY

If BEU BABA eventually contains:

```text
100,000 PYQs
50,000 notes
```

do not redesign the application from scratch.

Use:

```text
pagination
indexes
full-text search
filters
CDN/object storage
```

---

# 244. DATABASE SIZE MANAGEMENT

Large binary files should never be stored directly in PostgreSQL.

PostgreSQL stores:

```text
metadata
relationships
indexes
```

Object storage stores:

```text
PDF
images
documents
result cards
```

---

# 245. THUMBNAILS

Resource cards should not download full PDFs just to show a preview.

Store:

```text
thumbnail_path
```

or generate thumbnails asynchronously.

---

# 246. PDF PREVIEW

A PDF preview can use:

```text
first-page thumbnail
```

rather than loading the entire document.

This makes the premium UI faster.

---

# 247. CONTENT DELIVERY

Large public assets can use CDN delivery.

Private documents should use secure signed access.

---

# 248. FILE CACHE STRATEGY

Static:

```text
logo
icons
default avatars
```

can have long cache lifetimes.

Dynamic:

```text
student files
private support attachments
```

must have controlled caching.

---

# 249. VERSIONED ASSETS

Static assets should use hashed filenames:

```text
app.83f91a.js
```

This prevents stale PWA assets.

---

# 250. PWA UPDATE VS DATABASE UPDATE

Two update types are different.

## App update

Requires:

```text
new frontend build
service worker update
```

## Content update

Requires:

```text
database/storage update
```

Changing syllabus should normally be the second type.

---

# 251. DATABASE-DRIVEN UI

Examples:

```text
Current academic year
Notice priority
Quiz availability
Toolbox ordering
Resource category
```

can be controlled through database records.

But core UI structure should remain in code.

---

# 252. DO NOT OVER-CONFIGURE UI

Do not put every CSS property into database settings.

Database configuration should control business content.

UI design remains in the codebase.

---

# 253. CONTENT ADMIN UX

Admin should be able to edit content without knowing SQL.

Forms should validate:

```text
required fields
relationships
file type
publish status
dates
```

---

# 254. ADMIN CONFIRMATION

Publishing should display:

```text
What will change?
Who will see it?
Will notifications be sent?
```

before confirmation.

This prevents accidental mass notifications.

---

# 255. BULK OPERATIONS

Admins may eventually need:

```text
bulk publish
bulk archive
bulk import
bulk notify
```

Bulk operations must have:

```text
preview
confirmation
audit log
```

---

# 256. BULK STUDENT IMPORT

If student data is imported:

```text
CSV
```

pipeline should validate:

```text
email
phone
course
branch
semester
duplicates
```

and provide row-level errors.

---

# 257. DUPLICATE STUDENTS

Email can be unique if business rules require it.

Phone may also be unique, but this should be carefully decided.

Do not assume one person can never share a phone number.

---

# 258. ACADEMIC IDENTITY

Enrollment number can be unique within an institution/course/year rather than globally.

Use the correct uniqueness scope.

---

# 259. COLLEGE DATA

If multiple colleges are supported later:

```text
colleges
```

should become a separate table.

Then:

```text
student_profiles.college_id
```

rather than repeated college names.

---

# 260. FUTURE MULTI-INSTITUTION SUPPORT

Even if BEU BABA initially focuses on one university ecosystem, a clean architecture can support:

```text
university
 ↓
college
 ↓
course
 ↓
branch
 ↓
semester
 ↓
subject
```

without forcing this complexity into the first UI.

---

# 261. BEU-SPECIFIC CONTENT

University-specific academic records should be represented as data.

Do not hardcode university names into every database table.

A future:

```text
universities
```

table can provide extensibility.

---

# 262. INITIAL SCOPE

For the first production release, keep the model understandable.

Recommended initial hierarchy:

```text
course
branch
semester
subject
```

Add:

```text
university
college
```

only when needed.

---

# 263. DATABASE DOCUMENTATION FILE STRUCTURE

The project repository should eventually contain:

```text
docs/
  database/
    schema.md
    rls.md
    storage.md
    migrations.md
    backup.md
    data-retention.md
```

This prevents critical backend knowledge from being lost.

---

# 264. MIGRATION REPOSITORY

Suggested:

```text
supabase/
  migrations/
    001_extensions.sql
    002_profiles.sql
    003_academic.sql
    004_resources.sql
    005_quizzes.sql
    006_support.sql
    007_notifications.sql
    008_admin.sql
    009_indexes.sql
    010_rls.sql
```

Actual migrations can be split differently based on project workflow.

---

# 265. RLS TEST FILES

Maintain automated policy tests where practical.

Test cases should cover:

```text
student ownership
admin access
moderator access
cross-user isolation
storage isolation
draft visibility
published visibility
```

---

# 266. DATABASE TYPES

Generate TypeScript types from the Supabase schema where possible.

This provides:

```text
autocomplete
compile-time checking
safer queries
```

Do not manually duplicate hundreds of database interfaces if generated types can be maintained.

---

# 267. TYPE SAFETY

A change such as:

```text
resource.status
```

should propagate into TypeScript.

Avoid:

```ts
any
```

for database responses.

---

# 268. NULL HANDLING

Design nullable fields deliberately.

For example:

```text
phone
avatar_url
branch_id
```

may legitimately be nullable during onboarding.

Do not make everything nullable simply to avoid errors.

---

# 269. ONBOARDING STATE

Registration may be two-stage:

```text
Auth registration
 ↓
profile setup
 ↓
academic setup
 ↓
avatar setup
 ↓
onboarding complete
```

Store:

```text
onboarding_completed
```

so the app knows whether to continue setup.

---

# 270. PARTIAL REGISTRATION

If a user closes the app halfway through onboarding, their Auth account still exists.

The next login should resume onboarding.

Do not create duplicate Auth accounts.

---

# 271. PROFILE UPDATE

Students can update permitted fields:

```text
name
phone
avatar
bio
```

Academic fields such as:

```text
course
branch
semester
```

may require validation or admin approval depending on business rules.

---

# 272. ACADEMIC CHANGE REQUEST

If students should request a branch/semester correction, use:

```text
support_requests
```

rather than allowing arbitrary academic identity changes.

This protects data quality.

---

# 273. DATA QUALITY

Admin interfaces should prevent:

```text
duplicate subject
wrong branch mapping
invalid semester
published empty syllabus
```

Validation should happen before publish.

---

# 274. PUBLISH VALIDATION

A syllabus cannot be published if:

```text
course missing
academic year missing
no subjects
invalid subject relationship
```

Likewise a quiz cannot be published if:

```text
no questions
question has no options
no correct answer
duration invalid
```

---

# 275. QUIZ PUBLISH CHECKLIST

Before publishing:

```text
[ ] title
[ ] description
[ ] duration
[ ] at least one question
[ ] every question has options
[ ] exactly appropriate correct option(s)
[ ] marks configured
[ ] negative marks configured
[ ] subject/category assigned
[ ] status validated
```

---

# 276. RESOURCE PUBLISH CHECKLIST

Before approval:

```text
[ ] valid file
[ ] correct subject
[ ] correct semester
[ ] title
[ ] contributor
[ ] copyright declaration
[ ] moderation completed
```

---

# 277. NOTICE PUBLISH CHECKLIST

```text
[ ] title
[ ] content
[ ] category
[ ] target audience
[ ] publication date
[ ] expiry date if needed
[ ] attachment if required
```

---

# 278. TARGET AUDIENCE

Notices can target:

```text
all students
course
branch
semester
```

The notification system should use the same targeting model.

---

# 279. AUDIENCE TARGETING TABLE

If advanced targeting becomes necessary:

```text
notification_targets
```

can contain:

```text
notification_id
course_id
branch_id
semester_id
```

But for a first version, generating recipient notifications from query criteria may be sufficient.

---

# 280. NOTIFICATION FAN-OUT

For thousands of users, inserting one notification per user can be expensive.

Possible strategies:

```text
per-user notification
```

for important messages, or:

```text
targeted broadcast record
```

that the application resolves dynamically.

Choose based on scale.

---

# 281. INITIAL NOTIFICATION STRATEGY

For BEU BABA's initial scale, per-user notification records are easier to implement and reason about.

Optimize only when actual volume requires it.

---

# 282. DEVELOPER INBOX

Developer dashboard should aggregate:

```text
unread threads
open threads
urgent requests
latest message
student name
category
```

The database should support sorting by:

```text
last_message_at DESC
```

---

# 283. SUPPORT ASSIGNMENT

Future:

```text
assigned_to
```

can assign a thread to a developer/admin.

Students continue seeing the same thread.

---

# 284. SUPPORT INTERNAL NOTES

Future internal admin notes should be stored separately:

```text
support_internal_notes
```

Students must never receive them.

Do not put internal notes into the same visible message table without a strong visibility field and policy.

---

# 285. MESSAGE VISIBILITY

If shared message table is used, define:

```text
visibility = student
visibility = internal
```

RLS must enforce it.

A separate table is often safer.

---

# 286. ADMIN NOTIFICATION

Admins can receive:

```text
new resource submission
new support message
new bug report
```

These are operational notifications.

---

# 287. NOTIFICATION PRIORITY

Support notification priority:

```text
normal
high
urgent
```

Avoid excessive push notifications.

---

# 288. USER NOTIFICATION SETTINGS

Allow students to disable non-critical notifications.

Do not make important academic notices impossible to deliver.

---

# 289. DATA RETENTION EXAMPLE

A practical starting policy might be:

```text
notifications: retain until user clears or system cleanup
analytics events: limited retention
temporary upload records: short retention
audit logs: long retention
support messages: long enough for support history
quiz attempts: retain for student history
```

Exact periods should be defined by the product/legal requirements.

---

# 290. PRIVACY POLICY ALIGNMENT

The database design must match the application's privacy policy.

If the policy says:

```text
we delete data after X days
```

the backend must actually enforce it.

---

# 291. CONSENT RECORDS

If consent is required for:

```text
terms
privacy policy
resource contribution declaration
notifications
```

store the necessary consent record.

Example:

```text
policy_consents
user_id
policy_version
accepted_at
```

---

# 292. POLICY VERSIONING

When Terms or Privacy Policy changes:

```text
policy version 1
policy version 2
```

Users can be asked to accept the latest version.

---

# 293. SECURITY INCIDENT RESPONSE

If a security issue occurs:

```text
disable affected feature
rotate secrets
invalidate affected access
inspect audit logs
patch policy
notify affected users if required
```

Feature flags can be valuable for emergency shutdown.

---

# 294. SECRET ROTATION

Secrets should be rotatable without code changes.

Examples:

```text
API keys
service credentials
push keys
storage credentials
```

Never hardcode them.

---

# 295. DATABASE PASSWORD

If managed by Supabase, use the platform's secure secret management.

Do not place database credentials into frontend code.

---

# 296. PRODUCTION DEPLOYMENT

Deployment checklist:

```text
database migrated
RLS enabled
storage policies applied
seed production academic data
environment variables configured
service functions deployed
push notification configuration
backup verified
admin account configured
monitoring enabled
```

---

# 297. PRE-LAUNCH DATA IMPORT

Academic data should be imported through controlled scripts.

Example:

```text
courses.json
branches.json
subjects.json
syllabus.json
calendar.json
pyq.json
```

Each importer should validate relationships.

---

# 298. IMPORT ORDER

Recommended:

```text
courses
 ↓
branches
 ↓
semesters
 ↓
subjects
 ↓
academic years
 ↓
syllabus
 ↓
resources
 ↓
PYQs
 ↓
notices
 ↓
quizzes
```

Foreign keys require parent records first.

---

# 299. IMPORT IDS

When importing static academic data, avoid hardcoding production UUIDs in the frontend.

The importer can resolve by stable codes.

Example:

```text
course_code = BTECH
branch_code = CSE
subject_code = CS301
```

Database IDs remain internal.

---

# 300. STABLE ACADEMIC CODES

Use stable codes where possible:

```text
BTECH
CSE
ECE
CS301
```

Names can change.

Codes provide stable import references.

---

# 301. DATA MIGRATION FROM OLD APP

If existing APK/web-app data is available:

```text
extract
 ↓
normalize
 ↓
validate
 ↓
map
 ↓
deduplicate
 ↓
import
 ↓
verify
```

Do not directly dump scraped data into production.

---

# 302. EXTRACTED DATA QUALITY

Extracted data may contain:

```text
duplicates
missing fields
incorrect titles
wrong years
broken links
HTML artifacts
```

Build a validation stage.

---

# 303. JSON NORMALIZATION

Bad extracted JSON:

```json
{
  "subject": "Data Structures",
  "pyq": "2024.pdf"
}
```

Better:

```json
{
  "subject_code": "CS301",
  "year": 2024,
  "resource_type": "pyq",
  "file_path": "..."
}
```

This maps naturally into relational tables.

---

# 304. DATA VALIDATION REPORT

Import should generate:

```text
records found
records inserted
records skipped
duplicates
invalid records
missing relationships
```

Admin can review before production import.

---

# 305. DATABASE QUALITY GATE

No migration/import is complete until:

```text
row counts verified
foreign keys verified
duplicates checked
RLS tested
sample UI checked
```

---

# 306. FINAL DATABASE ARCHITECTURE

The BEU BABA backend should conceptually operate as:

```text
                    ┌──────────────────────┐
                    │      Supabase Auth    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Profiles        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       Student Domain    Admin Domain     Support Domain
              │                │                │
              ▼                ▼                ▼
       Academic Data      Moderation       Developer Chat
              │                │                │
              └────────────┬───┴────────────────┘
                           ▼
                    Learning Content
                           │
          ┌────────────────┼─────────────────┐
          ▼                ▼                 ▼
        PYQs             Quizzes          Resources
          │                │                 │
          └────────────────┼─────────────────┘
                           ▼
                      Notifications
                           │
                           ▼
                    PWA / React Client
```

---

# 307. IMPLEMENTATION ORDER

Do not build every database table simultaneously.

Recommended implementation phases:

## Phase 1 — Identity

```text
auth
profiles
student_profiles
roles
```

## Phase 2 — Academic

```text
courses
branches
semesters
subjects
academic_years
```

## Phase 3 — Content

```text
resources
PYQs
syllabus
calendar
notices
```

## Phase 4 — Quiz

```text
quizzes
questions
options
attempts
answers
result cards
```

## Phase 5 — Contributions

```text
submissions
moderation
```

## Phase 6 — Support

```text
developer threads
messages
attachments
support requests
```

## Phase 7 — Notifications

```text
notifications
preferences
push subscriptions
```

## Phase 8 — Admin

```text
audit
settings
feature flags
```

## Phase 9 — Analytics

```text
events
usage
reports
```

---

# 308. WHAT MUST NOT BE DONE

The following implementation patterns are prohibited:

```text
❌ Store passwords in profiles
❌ Put service-role key in React
❌ Trust frontend role
❌ Allow client to set created_by arbitrarily
❌ Store private files in public buckets
❌ Return quiz correct answers to browser
❌ Trust client-calculated scores
❌ Allow student to update user_roles
❌ Expose all student records
❌ Hardcode current syllabus in frontend
❌ Hard-delete historical academic data casually
❌ Store large PDFs directly in database
❌ Put permanent private URLs in public JSON
❌ Use SELECT * for large datasets
❌ Skip RLS because "the app requires login"
❌ Assume hidden buttons are security
```

---

# 309. WHAT SHOULD BE DONE

```text
✓ PostgreSQL relational schema
✓ Supabase Auth
✓ RLS everywhere appropriate
✓ private storage for sensitive files
✓ server-side authorization
✓ server-side quiz scoring
✓ versioned syllabus
✓ data-driven calendar
✓ moderation workflow
✓ private developer messages
✓ notification records
✓ audit logs
✓ migrations
✓ backups
✓ indexes
✓ pagination
✓ validation
✓ rate limiting
✓ feature flags
✓ content publishing states
✓ stable academic codes
✓ JSON import validation
```

---

# 310. PRODUCTION ACCEPTANCE CHECKLIST

## Authentication

```text
[ ] Registration works
[ ] Login works
[ ] Logout works
[ ] Email verification configured
[ ] Password reset works
[ ] Onboarding works
[ ] Account deletion flow defined
```

## Student

```text
[ ] Profile isolated
[ ] Academic data isolated
[ ] Avatar upload secured
[ ] Generated avatar supported
[ ] Toolbox available
[ ] Quiz history private
[ ] Support messages private
```

## Academic

```text
[ ] Courses correct
[ ] Branches correct
[ ] Semesters correct
[ ] Subjects correct
[ ] Syllabus versioned
[ ] Calendar versioned/data-driven
[ ] Notices publish correctly
```

## Resources

```text
[ ] Upload works
[ ] Storage private where needed
[ ] Moderation works
[ ] Approval notification works
[ ] Rejection reason works
[ ] Duplicate detection works
```

## Quiz

```text
[ ] Questions secured
[ ] Correct answers hidden
[ ] Timer server validated
[ ] Score server calculated
[ ] Duplicate submission prevented
[ ] Result saved
[ ] Result card generated
```

## Support

```text
[ ] Student thread private
[ ] Developer can reply
[ ] Student cannot see others
[ ] Attachments private
[ ] Notifications work
```

## Admin

```text
[ ] Role security tested
[ ] Student directory protected
[ ] Audit logs working
[ ] Content publishing working
[ ] Settings protected
[ ] Feature flags protected
```

---

# 311. FINAL ARCHITECTURAL RULE

The BEU BABA database should be treated as a long-term product foundation, not merely a storage location.

The frontend can be redesigned.

The Apple-inspired glass UI can change.

Animations can change.

Navigation can change.

Course cards can change.

The PWA can eventually become a native application.

The database should continue working.

Therefore the implementation must keep the following separation:

```text
UI
 ↓
Application services
 ↓
Authorization
 ↓
Supabase
 ↓
PostgreSQL / Storage
```

The frontend presents the product.

The database stores the product's truth.

Authorization protects that truth.

Storage holds large files.

Audit logs explain important changes.

Versioning protects historical academic information.

Moderation protects user-generated resources.

Notifications connect users with changing information.

This architecture gives BEU BABA a foundation that can grow from a student utility PWA into a complete academic platform without repeatedly rebuilding its backend.

---

# 312. AI CODING AGENT NON-NEGOTIABLE RULES

Any AI coding agent working on BEU BABA must follow these rules.

1. Never disable RLS just to make a query work.
2. Never put a secret in client code.
3. Never expose service-role credentials.
4. Never trust client-supplied user IDs for ownership.
5. Never trust client-supplied roles.
6. Never trust client-calculated quiz scores.
7. Never expose quiz answer keys during an active quiz.
8. Never make private storage public to solve an access problem.
9. Never delete historical academic data without explicit product approval.
10. Never change production schema without a migration.
11. Never edit an already-applied migration.
12. Never introduce `any` as a shortcut for database typing.
13. Never bypass validation because the admin UI already validates.
14. Never expose all student records to the frontend.
15. Never put internal support notes into student-visible queries.
16. Never return unnecessary sensitive columns.
17. Never use raw HTML from untrusted users without sanitization.
18. Never assume a hidden frontend button provides security.
19. Never silently change academic relationships.
20. Never overwrite a published syllabus when versioning is required.
21. Never make notification delivery dependent on the browser remaining open.
22. Never store large binary files directly in PostgreSQL.
23. Never create permanent public URLs for private files.
24. Never remove audit logging from privileged operations.
25. Never implement a new feature by weakening an existing security policy.

---

# 313. FINAL DATA FLOW

A typical student experience should look like:

```text
REGISTER
   ↓
AUTH USER
   ↓
PROFILE
   ↓
ACADEMIC PROFILE
   ↓
DASHBOARD
   ↓
COURSE
   ↓
BRANCH
   ↓
SEMESTER
   ↓
SUBJECT
   ↓
PYQ / NOTES / SYLLABUS / QUIZ
   ↓
QUIZ ATTEMPT
   ↓
SERVER SCORE
   ↓
RESULT CARD
   ↓
NOTIFICATION
```

A resource contribution:

```text
STUDENT
   ↓
UPLOAD
   ↓
PRIVATE STORAGE
   ↓
PENDING SUBMISSION
   ↓
MODERATION
   ↓
APPROVED
   ↓
PUBLIC/ELIGIBLE RESOURCE
   ↓
NOTIFICATION
```

A syllabus update:

```text
ADMIN
   ↓
CREATE NEW VERSION
   ↓
DRAFT
   ↓
VALIDATE
   ↓
REVIEW
   ↓
PUBLISH
   ↓
OLD VERSION ARCHIVED
   ↓
TARGETED STUDENT NOTIFICATIONS
```

A developer conversation:

```text
STUDENT
   ↓
SUPPORT THREAD
   ↓
PRIVATE MESSAGE
   ↓
DEVELOPER
   ↓
REPLY
   ↓
NOTIFICATION
   ↓
STUDENT
```

These flows should be implemented using secure database relationships rather than frontend-only state.

---

# 314. CONCLUSION

BEU BABA should use a clean PostgreSQL + Supabase architecture where:

- authentication is handled by Supabase Auth;
- profiles reference authenticated users;
- academic information is relational;
- syllabus is versioned;
- calendars are data-driven;
- PYQs are structured resources;
- quizzes calculate results server-side;
- student uploads enter moderation;
- private developer messages are isolated by user ownership;
- notifications are stored independently from push delivery;
- files live in object storage;
- sensitive storage is private;
- RLS protects rows;
- Storage policies protect files;
- roles and permissions are server-enforced;
- audit logs preserve important administrative history;
- feature flags permit safe rollout;
- migrations preserve database evolution;
- backups protect against operational failures;
- JSON imports allow controlled academic data updates;
- frontend deployment and academic content updates remain independent.

The most important architectural principle is:

> **BEU BABA must remain data-driven, authorization-driven, version-aware, and storage-aware.**

This allows the application to evolve from a premium student PWA into a much larger academic ecosystem without replacing its fundamental backend architecture.