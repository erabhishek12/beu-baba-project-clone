# BEU BABA — 10. PRODUCT ARCHITECTURE, DATA MODEL & CONTENT MANAGEMENT SPECIFICATION

## 0. Document Purpose

This document defines the complete product architecture, database model, content-management model, ownership model, lifecycle rules, validation rules, and operational data structures for BEU BABA.

BEU BABA is designed as a premium student-focused educational Progressive Web App (PWA) for BEU students. The application must provide a reliable single place for academic information and useful student utilities while remaining maintainable by a small development/admin team.

The architecture in this document is deliberately strict. The goal is not merely to describe tables. It defines what data exists, why it exists, who can create or modify it, how it moves through the system, what happens when academic information changes, how old information remains traceable, how uploaded resources are moderated, and how the frontend should consume the resulting data.

The application must not be designed around hardcoded academic content. Syllabus, academic calendars, PYQs, notices, resources, quizzes, course information, social links, developer information, and similar changing information must be represented as managed records.

The core principle is:

> Code controls behavior. Database content controls changing information.

Therefore, changing a syllabus should not require rebuilding the application. Updating a yearly calendar should not require publishing a new APK/PWA build. Adding a PYQ should not require changing JavaScript source code. Updating a developer social link should not require editing a frontend constant and redeploying.

---

# 1. Product Data Philosophy

## 1.1 Single source of truth

Every important piece of dynamic information should have one authoritative location.

Examples:

- Student profile → database
- Course list → database
- Branch list → database
- Semester list → database
- Syllabus → database/storage metadata
- Academic calendar → database
- PYQ metadata → database
- PDF/JPG/file → object/file storage
- Quiz → database
- Quiz questions → database
- User-submitted resource → database + file storage
- Moderation status → database
- Developer contact links → database/configuration
- Notifications → database
- Support messages → database
- App announcements → database
- Feature flags → database/configuration

The frontend should consume these records through application services/API contracts.

## 1.2 No academic content hardcoding

Do not write logic such as:

```js
const semesters = ["1st", "2nd", "3rd", "4th"];
```

when those values are actually content.

Instead, retrieve semesters from the database.

Similarly, avoid:

```js
const syllabusPdf = "/assets/cse-3rd-sem.pdf";
```

because a syllabus can change.

Use a record such as:

```json
{
  "course_id": "...",
  "branch_id": "...",
  "semester_id": "...",
  "academic_year": "2026-27",
  "version": 2,
  "status": "published",
  "file_id": "..."
}
```

The frontend then renders the current published version.

## 1.3 Stable IDs over names

Never use display names as primary identifiers.

Bad:

```text
"CSE"
```

as the database primary key.

Better:

```text
branch_id = UUID
code = "CSE"
name = "Computer Science and Engineering"
```

A display name can change. An identifier should remain stable.

## 1.4 Auditability

Academic information may be updated by administrators.

Every important modification should be traceable.

At minimum, store:

- who changed it
- when it changed
- previous version/reference
- new version/reference
- reason, when appropriate

This is especially important for:

- syllabus
- academic calendar
- notices
- PYQs
- published resources
- quiz content
- admin settings

---

# 2. High-Level Product Architecture

BEU BABA should be logically divided into these layers:

```text
Presentation Layer
        ↓
Frontend Application
        ↓
API / Application Service Layer
        ↓
Authorization + Validation
        ↓
Domain Services
        ↓
Database / Storage / Notification Services
```

The main product domains are:

1. Authentication
2. Student identity/profile
3. Academic structure
4. Syllabus
5. Academic calendar
6. PYQs
7. Study resources
8. Quiz
9. Student toolbox
10. Notices/announcements
11. Notifications
12. Developer support messaging
13. Search
14. Admin/content moderation
15. App configuration
16. Analytics
17. File management
18. Audit logs

---

# 3. Recommended Technology Mapping

A practical implementation can use:

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- TanStack Query
- PWA service worker

### Backend/data

- Supabase Auth
- PostgreSQL
- Supabase Storage
- Supabase Realtime where required
- Edge Functions/API services when business logic must remain server-side

### Why PostgreSQL?

BEU BABA contains strongly related data:

```text
student
  ↓
course
  ↓
branch
  ↓
semester
  ↓
subjects
  ↓
syllabus
  ↓
resources
```

A relational model makes these relationships explicit and queryable.

---

# 4. Identity Model

A student has two distinct concepts:

1. Authentication identity
2. Application profile

Authentication answers:

> Can this person sign in?

Profile answers:

> Who is this student inside BEU BABA?

Do not mix these concepts.

The authentication provider owns credentials and sessions.

The application database owns student-specific information.

---

# 5. Users Table

Suggested table:

```text
profiles
```

Fields:

```text
id UUID PRIMARY KEY
auth_user_id UUID UNIQUE NOT NULL
full_name TEXT NOT NULL
email TEXT NOT NULL
phone TEXT
course_id UUID
branch_id UUID
semester_id UUID
roll_number TEXT
registration_number TEXT
gender TEXT
profile_image_url TEXT
generated_avatar_id UUID
bio TEXT
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
last_seen_at TIMESTAMPTZ
```

## 5.1 Sensitive fields

Some student information should receive additional protection.

Examples:

- phone
- email
- registration number
- roll number

These should not be exposed through public queries.

A student should normally retrieve only their own complete profile.

Admins may retrieve permitted student fields according to role.

## 5.2 Profile image

The user can select:

- device image
- generated avatar

At signup:

```text
gender selected
      ↓
avatar category determined
      ↓
available avatar set loaded
      ↓
one avatar selected
      ↓
avatar ID stored
```

Do not permanently store a large generated image in the profile row.

Store an avatar identifier.

---

# 6. Avatar Data Model

Suggested table:

```text
avatars
```

Fields:

```text
id UUID PRIMARY KEY
name TEXT
gender_category TEXT
image_file_id UUID
is_active BOOLEAN
sort_order INTEGER
created_at TIMESTAMPTZ
```

Possible categories:

```text
male
female
neutral
```

The system should not force a user to use an automatically selected avatar. The automatic avatar can be the default, while the user may change it later.

---

# 7. Academic Hierarchy

The academic model should be normalized.

Recommended hierarchy:

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
   ↓
Content
```

Example:

```text
B.Tech
 └── Computer Science and Engineering
      └── Semester 3
           ├── Data Structures
           ├── DBMS
           ├── Operating Systems
           └── Mathematics
```

---

# 8. Courses

Table:

```text
courses
```

Fields:

```text
id UUID PRIMARY KEY
code TEXT UNIQUE NOT NULL
name TEXT NOT NULL
short_name TEXT
description TEXT
duration_years INTEGER
is_active BOOLEAN DEFAULT TRUE
sort_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Examples:

```text
BTECH
BCA
MCA
```

Only add courses actually supported by BEU BABA.

---

# 9. Branches

Table:

```text
branches
```

Fields:

```text
id UUID PRIMARY KEY
course_id UUID REFERENCES courses(id)
code TEXT NOT NULL
name TEXT NOT NULL
short_name TEXT
description TEXT
is_active BOOLEAN DEFAULT TRUE
sort_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

A branch belongs to a course.

---

# 10. Semesters

Table:

```text
semesters
```

Fields:

```text
id UUID PRIMARY KEY
course_id UUID REFERENCES courses(id)
semester_number INTEGER NOT NULL
name TEXT NOT NULL
short_name TEXT
is_active BOOLEAN DEFAULT TRUE
sort_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Do not assume every course has the same semester structure.

The database should allow different academic structures.

---

# 11. Subjects

Table:

```text
subjects
```

Fields:

```text
id UUID PRIMARY KEY
course_id UUID REFERENCES courses(id)
branch_id UUID REFERENCES branches(id)
semester_id UUID REFERENCES semesters(id)
code TEXT
name TEXT NOT NULL
short_name TEXT
credits NUMERIC
description TEXT
is_active BOOLEAN DEFAULT TRUE
sort_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

A subject can be:

- core
- elective
- practical
- project
- lab

Add:

```text
subject_type
```

with values such as:

```text
theory
lab
practical
project
elective
```

---

# 12. Academic Year

Academic year must be a first-class concept.

Table:

```text
academic_years
```

Fields:

```text
id UUID PRIMARY KEY
label TEXT UNIQUE NOT NULL
start_date DATE
end_date DATE
is_current BOOLEAN DEFAULT FALSE
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Example:

```text
2025-26
2026-27
2027-28
```

Never assume the current year in frontend code.

The admin should be able to mark a new academic year as current.

---

# 13. Syllabus Architecture

Syllabus is not just a PDF.

The application should support two layers:

### Layer A — structured syllabus

Contains:

- subjects
- units
- topics
- credits
- marks
- practical information

### Layer B — official document

Contains:

- PDF
- official circular
- source document

This gives BEU BABA both a useful interactive syllabus experience and a source-document experience.

---

# 14. Syllabus Versions

Table:

```text
syllabus_versions
```

Fields:

```text
id UUID PRIMARY KEY
course_id UUID
branch_id UUID
semester_id UUID
academic_year_id UUID
version_number INTEGER
title TEXT
description TEXT
document_file_id UUID
status TEXT
effective_from DATE
effective_to DATE
source TEXT
created_by UUID
published_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Status:

```text
draft
review
published
archived
rejected
```

Only one version should normally be the active published version for a given academic scope unless an explicit exception exists.

---

# 15. Why Syllabus Versioning Matters

Suppose the university publishes:

```text
2026 syllabus
```

Later:

```text
2026 revised syllabus
```

Do not overwrite the original.

Instead:

```text
Version 1 → Archived
Version 2 → Published
```

This provides:

- historical accuracy
- rollback
- auditability
- user trust
- debugging capability

---

# 16. Structured Syllabus Units

Table:

```text
syllabus_units
```

Fields:

```text
id UUID PRIMARY KEY
syllabus_version_id UUID
subject_id UUID
unit_number INTEGER
title TEXT
description TEXT
hours NUMERIC
marks NUMERIC
sort_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Topics:

```text
syllabus_topics
```

Fields:

```text
id UUID PRIMARY KEY
unit_id UUID
title TEXT
description TEXT
sort_order INTEGER
is_optional BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

# 17. Academic Calendar

Academic calendar must be independently managed.

Table:

```text
academic_calendars
```

Fields:

```text
id UUID PRIMARY KEY
academic_year_id UUID
course_id UUID
title TEXT
description TEXT
document_file_id UUID
status TEXT
created_by UUID
published_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Calendar events:

```text
academic_calendar_events
```

Fields:

```text
id UUID PRIMARY KEY
calendar_id UUID
title TEXT
description TEXT
event_type TEXT
start_date DATE
end_date DATE
is_all_day BOOLEAN
priority TEXT
location TEXT
sort_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Examples:

```text
Registration
Examination
Holiday
Result
Admission
Semester Start
Semester End
Practical Exam
```

---

# 18. Calendar Changes

If the university changes an examination date:

Do not edit the frontend.

Admin:

```text
Calendar
→ Event
→ Edit
→ Change date
→ Save
→ Publish
```

The frontend retrieves the latest published record.

If desired, a notification can automatically be generated:

```text
Academic calendar updated
"End Semester Examination date changed."
```

---

# 19. PYQ Architecture

PYQ means previous-year question paper.

Table:

```text
pyq_papers
```

Fields:

```text
id UUID PRIMARY KEY
course_id UUID
branch_id UUID
semester_id UUID
subject_id UUID
exam_year INTEGER
exam_type TEXT
title TEXT
file_id UUID
source TEXT
status TEXT
uploaded_by UUID
verified_by UUID
verified_at TIMESTAMPTZ
download_count INTEGER DEFAULT 0
view_count INTEGER DEFAULT 0
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Possible exam types:

```text
end_semester
mid_semester
internal
practical
supplementary
other
```

---

# 20. PYQ Search

Students should be able to filter:

```text
Course
Branch
Semester
Subject
Year
Exam Type
```

The backend should apply indexed filters.

Do not download every PDF and filter client-side.

---

# 21. Resource Architecture

BEU BABA should support official and community resources.

Resource examples:

- notes
- handwritten notes
- question papers
- study guides
- lab manuals
- practical files
- reference PDFs
- cheat sheets
- important questions
- solved papers

Table:

```text
resources
```

Fields:

```text
id UUID PRIMARY KEY
title TEXT NOT NULL
description TEXT
resource_type TEXT
course_id UUID
branch_id UUID
semester_id UUID
subject_id UUID
file_id UUID
thumbnail_file_id UUID
source_type TEXT
uploaded_by UUID
status TEXT
verified_by UUID
verified_at TIMESTAMPTZ
rejection_reason TEXT
view_count INTEGER DEFAULT 0
download_count INTEGER DEFAULT 0
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

# 22. Resource Moderation

Student-uploaded resources must never immediately become public.

Lifecycle:

```text
Student Upload
      ↓
Pending Review
      ↓
Admin Review
   ↙       ↘
Approve   Reject
   ↓
Published
```

Status:

```text
pending
under_review
approved
rejected
archived
```

The student should be able to see:

```text
Pending
Approved
Rejected
```

If rejected, show a safe reason.

Example:

> This file could not be published because the document was incomplete.

Avoid exposing internal moderation notes.

---

# 23. Resource Ownership

Every uploaded resource must record its uploader.

This allows:

- accountability
- profile attribution
- moderation
- abuse investigation
- upload history

Never make anonymous student uploads the default.

---

# 24. File Metadata

Do not store file blobs inside ordinary database rows.

Use object storage.

Table:

```text
files
```

Fields:

```text
id UUID PRIMARY KEY
storage_provider TEXT
bucket_name TEXT
object_path TEXT
original_name TEXT
mime_type TEXT
extension TEXT
size_bytes BIGINT
checksum TEXT
uploaded_by UUID
visibility TEXT
status TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Visibility:

```text
private
authenticated
public
```

Use private storage for student-submitted or sensitive content whenever possible.

---

# 25. File Security

Never trust:

```text
filename
extension
mime type supplied by browser
```

Validate files server-side.

Recommended controls:

- MIME validation
- file extension validation
- size limits
- filename sanitization
- storage path isolation
- malware scanning where practical
- signed URLs for private files
- authorization before issuing file access

---

# 26. Quiz Architecture

Quiz should be a major engagement feature.

Core entities:

```text
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_answers
quiz_results
```

---

# 27. Quiz Table

```text
quizzes
```

Fields:

```text
id UUID PRIMARY KEY
title TEXT NOT NULL
description TEXT
course_id UUID
branch_id UUID
semester_id UUID
subject_id UUID
difficulty TEXT
duration_seconds INTEGER
question_count INTEGER
passing_percentage NUMERIC
thumbnail_file_id UUID
status TEXT
created_by UUID
published_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Difficulty:

```text
easy
medium
hard
mixed
```

---

# 28. Quiz Questions

```text
quiz_questions
```

Fields:

```text
id UUID PRIMARY KEY
quiz_id UUID
question_text TEXT NOT NULL
question_type TEXT
explanation TEXT
marks NUMERIC
negative_marks NUMERIC
sort_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Question types:

```text
single_choice
multiple_choice
true_false
```

Additional types can be added later.

---

# 29. Quiz Options

```text
quiz_options
```

Fields:

```text
id UUID PRIMARY KEY
question_id UUID
option_text TEXT
is_correct BOOLEAN
sort_order INTEGER
```

For security, never expose `is_correct` to the browser before submission.

The frontend should receive options without the correct-answer flag.

---

# 30. Quiz Attempts

```text
quiz_attempts
```

Fields:

```text
id UUID PRIMARY KEY
quiz_id UUID
student_id UUID
started_at TIMESTAMPTZ
submitted_at TIMESTAMPTZ
status TEXT
score NUMERIC
percentage NUMERIC
correct_count INTEGER
incorrect_count INTEGER
unanswered_count INTEGER
time_taken_seconds INTEGER
```

Status:

```text
in_progress
submitted
expired
abandoned
```

---

# 31. Quiz Security

Do not calculate the final score solely in frontend JavaScript.

A malicious user could modify:

```js
score = 100;
```

The server must evaluate answers.

The secure flow:

```text
Client
 ↓
Submit answers
 ↓
Server validates attempt
 ↓
Server loads correct answers
 ↓
Server calculates score
 ↓
Server stores result
 ↓
Client receives result
```

---

# 32. Quiz Result Card

After completion, generate a shareable result representation.

Example:

```text
BEU BABA
QUIZ RESULT

Data Structures
Score: 18/20
Accuracy: 90%
Time: 07:42

Keep learning.
```

The result card can be:

- downloaded as image
- shared
- saved locally
- copied

The generated image should not expose private student information beyond what the student chooses.

---

# 33. Student Toolbox

The toolbox is a collection of practical utilities.

Potential tools:

1. CGPA Calculator
2. SGPA Calculator
3. Percentage Calculator
4. Attendance Calculator
5. Marks Calculator
6. Age Calculator
7. Unit Converter
8. Length Converter
9. Weight Converter
10. Temperature Converter
11. Time Converter
12. EMI Calculator
13. Simple Interest Calculator
14. Compound Interest Calculator
15. Discount Calculator
16. GPA conversion helper
17. Study timer
18. Pomodoro timer
19. Date difference calculator
20. Exam countdown

The toolbox should be modular.

Each tool should have:

```text
tool_id
name
description
icon
category
route
is_active
sort_order
```

---

# 34. Toolbox Configuration

Table:

```text
tools
```

Fields:

```text
id UUID PRIMARY KEY
slug TEXT UNIQUE
name TEXT
description TEXT
category TEXT
icon TEXT
route TEXT
is_active BOOLEAN
sort_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

This allows administrators to hide an unfinished tool without deploying the application.

---

# 35. Developer Support Messaging

BEU BABA should include a private support channel.

This is not a social chat system.

Purpose:

- bug reports
- syllabus update requests
- course update requests
- content correction
- feature requests
- general developer communication

Architecture:

```text
Student
  ↓
Private conversation
  ↓
Developer/Admin
```

Only:

```text
student
developer/admin
```

should access that conversation.

---

# 36. Support Conversations

Table:

```text
support_conversations
```

Fields:

```text
id UUID PRIMARY KEY
student_id UUID NOT NULL
subject TEXT
category TEXT
status TEXT
priority TEXT
assigned_admin_id UUID
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
closed_at TIMESTAMPTZ
```

Category:

```text
bug
syllabus_update
course_update
resource_issue
account_issue
feature_request
general
```

Status:

```text
open
in_progress
waiting_for_student
resolved
closed
```

---

# 37. Support Messages

```text
support_messages
```

Fields:

```text
id UUID PRIMARY KEY
conversation_id UUID
sender_id UUID
sender_role TEXT
message_text TEXT
attachment_file_id UUID
is_read BOOLEAN
created_at TIMESTAMPTZ
edited_at TIMESTAMPTZ
```

Never use a global public message table for this feature.

Authorization must verify conversation membership.

---

# 38. Support Privacy Rule

For a student:

```text
student_id = current_user.id
```

must be enforced.

A student cannot query another student's conversation by changing:

```text
conversation_id
```

in a request.

Authorization must be performed server-side/database-side.

---

# 39. Developer Profile

Developer information should be configurable.

Suggested table:

```text
developer_profile
```

Fields:

```text
id UUID PRIMARY KEY
display_name TEXT
title TEXT
bio TEXT
profile_image_file_id UUID
portfolio_url TEXT
secondary_portfolio_url TEXT
instagram_url_1 TEXT
instagram_url_2 TEXT
telegram_url TEXT
email TEXT
is_visible BOOLEAN
updated_at TIMESTAMPTZ
```

Current provided social destinations should be stored as configuration rather than hardcoded throughout the application.

Configured destinations include:

```text
Instagram:
naturelensbyabhi
er_abhi2026

Portfolio:
https://erabhi.in
https://i-am-er-abhi.vercel.app

Telegram:
https://t.me/+wnAYQ4wVOxg2M2Rl
```

The frontend should read these from one configuration source.

Do not duplicate these links across ten components.

---

# 40. App Configuration

Table:

```text
app_settings
```

Possible fields:

```text
id UUID PRIMARY KEY
key TEXT UNIQUE
value JSONB
description TEXT
is_public BOOLEAN
updated_by UUID
updated_at TIMESTAMPTZ
```

Examples:

```text
app_name
support_email
maintenance_mode
minimum_app_version
latest_app_version
enable_quiz
enable_resource_upload
enable_support_chat
enable_notifications
```

---

# 41. Why Configuration Matters

Suppose the app is renamed from:

```text
BEU BABA
```

to:

```text
BEU BABA Plus
```

If the name is configuration-driven, it can be updated centrally.

However, branding assets and app-store/PWA metadata may still require a deployment.

Dynamic text and operational switches should remain configurable.

---

# 42. Notices and Announcements

Table:

```text
announcements
```

Fields:

```text
id UUID PRIMARY KEY
title TEXT
message TEXT
description TEXT
type TEXT
priority TEXT
image_file_id UUID
target_type TEXT
target_course_id UUID
target_branch_id UUID
target_semester_id UUID
published_at TIMESTAMPTZ
expires_at TIMESTAMPTZ
status TEXT
created_by UUID
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Types:

```text
general
academic
exam
result
update
maintenance
important
```

---

# 43. Targeted Announcements

An announcement can target:

```text
everyone
specific course
specific branch
specific semester
```

Example:

```text
CSE + Semester 5
```

gets a specific notice.

The notification engine should respect these targeting rules.

---

# 44. Notifications

Table:

```text
notifications
```

Fields:

```text
id UUID PRIMARY KEY
recipient_id UUID
title TEXT
body TEXT
type TEXT
reference_type TEXT
reference_id UUID
deep_link TEXT
is_read BOOLEAN
created_at TIMESTAMPTZ
read_at TIMESTAMPTZ
```

Examples:

```text
New PYQ added
Quiz result ready
Resource approved
Calendar updated
Support reply received
Important notice
```

---

# 45. Push Notification Subscriptions

PWA push requires a subscription record.

Table:

```text
push_subscriptions
```

Fields:

```text
id UUID PRIMARY KEY
user_id UUID
endpoint TEXT
p256dh TEXT
auth TEXT
device_label TEXT
is_active BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
last_used_at TIMESTAMPTZ
```

One user may have multiple devices.

Therefore:

```text
one student
→ many subscriptions
```

---

# 46. Notification Preferences

Students should control notification categories.

Table:

```text
notification_preferences
```

Fields:

```text
user_id UUID PRIMARY KEY
academic_updates BOOLEAN
new_pyq BOOLEAN
new_resources BOOLEAN
quiz_updates BOOLEAN
support_messages BOOLEAN
general_announcements BOOLEAN
marketing BOOLEAN
updated_at TIMESTAMPTZ
```

Do not assume every notification should always be sent.

Critical academic notifications may be treated differently from optional notifications.

---

# 47. Search Architecture

Search should be designed as a unified discovery feature.

Searchable entities:

- subjects
- PYQs
- resources
- quizzes
- notices
- syllabus
- toolbox tools

A search result should contain:

```text
type
id
title
subtitle
route
thumbnail
metadata
```

Example:

```json
{
  "type": "pyq",
  "id": "...",
  "title": "Data Structures 2025",
  "subtitle": "B.Tech CSE Semester 3",
  "route": "/pyq/..."
}
```

---

# 48. Search Ranking

Prioritize:

1. Exact title match
2. Prefix match
3. Subject match
4. Metadata match
5. Description match
6. General relevance

Do not make the search engine unnecessarily complicated in version one.

PostgreSQL full-text search or trigram search can provide a strong starting point.

---

# 49. Admin Architecture

Admin should not be a visually separate random page collection.

It should be a controlled content-management application.

Core modules:

```text
Dashboard
Students
Courses
Branches
Semesters
Subjects
Syllabus
Academic Calendar
PYQs
Resources
Quizzes
Announcements
Notifications
Support
Files
Developer Profile
App Settings
Audit Logs
```

---

# 50. Admin Roles

Recommended roles:

```text
super_admin
content_admin
moderator
support_admin
```

Permissions should be role-based.

Example:

```text
content_admin
→ syllabus
→ PYQ
→ resources
→ quizzes
```

```text
support_admin
→ support conversations
```

```text
super_admin
→ everything
```

---

# 51. Role Table

Table:

```text
user_roles
```

Fields:

```text
id UUID PRIMARY KEY
user_id UUID
role TEXT
created_at TIMESTAMPTZ
created_by UUID
```

A user can have multiple roles if necessary.

---

# 52. Permission Model

Instead of writing checks everywhere:

```js
if (user.email === "admin@example.com")
```

use permission checks.

Example:

```text
can_manage_syllabus
can_publish_resources
can_manage_quizzes
can_view_students
can_reply_support
can_manage_settings
```

Permissions can be mapped to roles.

---

# 53. Audit Logs

Table:

```text
audit_logs
```

Fields:

```text
id UUID PRIMARY KEY
actor_id UUID
action TEXT
entity_type TEXT
entity_id UUID
old_data JSONB
new_data JSONB
ip_hash TEXT
user_agent TEXT
created_at TIMESTAMPTZ
```

Do not necessarily store sensitive values in raw audit logs.

Audit logs are for traceability, not for collecting unnecessary personal information.

---

# 54. Content Lifecycle

All major content should follow a lifecycle.

Generic:

```text
Draft
 ↓
Review
 ↓
Published
 ↓
Archived
```

Optional:

```text
Rejected
```

The frontend should normally expose only:

```text
Published
```

unless the user is an administrator.

---

# 55. Publishing Rule

Saving content is not equivalent to publishing content.

Example:

```text
Admin creates syllabus
→ draft

Admin edits
→ draft

Admin submits
→ review

Admin approves
→ published
```

This prevents incomplete information from appearing publicly.

---

# 56. Scheduled Publishing

The architecture should support:

```text
publish_at
expires_at
```

for content.

This is useful for:

- notices
- event announcements
- exam reminders
- temporary banners

A record can automatically become visible at the correct time.

---

# 57. Deletion Strategy

Avoid hard deletion for important academic records.

Instead use:

```text
is_active
status
archived_at
```

Why?

Suppose an admin accidentally removes a PYQ.

If the record was hard deleted:

```text
recovery = difficult
```

If archived:

```text
restore = possible
```

---

# 58. Soft Delete

Recommended:

```text
deleted_at
deleted_by
```

for records where deletion is necessary.

Frontend queries should normally exclude deleted records.

---

# 59. Database Indexing

Indexes should exist on frequently filtered fields.

Examples:

```text
profiles.email
profiles.branch_id
profiles.course_id
profiles.semester_id

subjects.branch_id
subjects.semester_id

pyq_papers.subject_id
pyq_papers.exam_year
pyq_papers.status

resources.subject_id
resources.status

quizzes.subject_id
quizzes.status

notifications.recipient_id
notifications.is_read

support_conversations.student_id
support_messages.conversation_id
```

Do not index every column blindly.

Indexes consume storage and affect writes.

---

# 60. Foreign Keys

Relationships must use foreign keys.

Example:

```text
subjects.semester_id
REFERENCES semesters(id)
```

This prevents orphan records.

Do not depend only on frontend validation.

---

# 61. Referential Integrity

When deleting a branch, ask:

```text
What happens to subjects?
What happens to syllabus?
What happens to PYQs?
What happens to resources?
```

Usually:

```text
Do not hard-delete.
Deactivate/archive.
```

This protects historical data.

---

# 62. JSONB Usage

Use JSONB where data is genuinely flexible.

Good:

```text
app_settings.value
audit_logs.old_data
audit_logs.new_data
```

Avoid putting the entire academic database into one giant JSONB field.

Bad:

```text
academic_data JSONB
```

containing all courses, subjects, PYQs, users, and calendars.

Relational structure is required for reliable filtering and authorization.

---

# 63. API/Data Contract Principles

Frontend should not know internal database structure.

Example frontend request:

```text
GET /api/v1/pyqs
```

Response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

Do not expose raw database joins unnecessarily.

---

# 64. DTO Philosophy

Use response DTOs.

Database row:

```text
internal columns
```

API response:

```text
safe public fields
```

This allows the database to evolve without breaking the frontend.

---

# 65. Pagination

All potentially large lists must support pagination.

Examples:

- students
- PYQs
- resources
- notifications
- support messages
- audit logs

Avoid:

```text
SELECT * FROM resources
```

without limits.

---

# 66. Cursor Pagination

For very large or frequently changing lists, cursor pagination is preferred.

Example:

```text
GET /resources?cursor=abc&limit=20
```

This is more reliable than large page offsets when records change frequently.

---

# 67. Caching Strategy

Cache mostly read-heavy academic content.

Good candidates:

- courses
- branches
- semesters
- subjects
- published syllabus
- calendar
- published PYQs
- published resources

Do not aggressively cache:

- support messages
- private profile data
- unread notification state
- admin actions

---

# 68. Cache Invalidation

When admin publishes a syllabus:

```text
Publish
 ↓
Invalidate syllabus cache
 ↓
Next request gets new version
```

Do not rely on arbitrary short cache durations if immediate correctness matters.

---

# 69. Offline Data

PWA can cache:

- app shell
- icons
- static UI
- recently viewed public academic metadata

Be cautious with:

- private student information
- support conversations
- authentication state
- private files

Do not blindly cache every API response.

---

# 70. Database Security

Every user-facing table must have an authorization strategy.

At minimum ask:

```text
Who can SELECT?
Who can INSERT?
Who can UPDATE?
Who can DELETE?
```

Example:

```text
students
→ student can read own profile
→ admin can read permitted student data
→ student cannot read another student
```

---

# 71. Row-Level Security

If Supabase/PostgreSQL is used, RLS should be considered mandatory for exposed application tables.

Example conceptual policy:

```text
student can select profile
WHERE profile.auth_user_id = auth.uid()
```

Support:

```text
student can select conversation
WHERE conversation.student_id = auth.uid()
```

Messages:

```text
student can select messages
WHERE message.conversation_id
belongs to a conversation owned by auth.uid()
```

---

# 72. Storage Security

Private files should not be globally accessible.

Use:

```text
authenticated request
→ authorization
→ signed URL
→ temporary access
```

For official public documents that truly need public access, public storage may be acceptable.

Default should favor private storage.

---

# 73. Upload Limits

Define limits by category.

Example policy:

```text
Profile image: 5 MB
PDF resource: 25 MB
Quiz image: 5 MB
Admin document: 50 MB
```

Actual limits should be configurable based on infrastructure.

---

# 74. File Naming

Never use user-provided filename directly as storage path.

Bad:

```text
/uploads/My Resume Final.pdf
```

Better:

```text
resources/{resource_id}/{uuid}.pdf
```

Keep original filename only as metadata.

---

# 75. File Replacement

When an admin replaces a syllabus PDF:

```text
Old file
→ retained or archived
New file
→ uploaded
Metadata updated
Version updated
Published
```

Do not overwrite files in place if historical versioning matters.

---

# 76. Content Import

BEU BABA may initially require importing extracted data from an existing application or source files.

The import system should never directly insert unvalidated data into production.

Pipeline:

```text
Raw extraction
 ↓
Staging JSON
 ↓
Validation
 ↓
Normalization
 ↓
Duplicate detection
 ↓
Admin review
 ↓
Production import
```

---

# 77. Import JSON Structure

Example:

```json
{
  "courses": [],
  "branches": [],
  "semesters": [],
  "subjects": [],
  "syllabus": [],
  "academic_calendars": [],
  "pyqs": [],
  "resources": []
}
```

Each record should include enough metadata for mapping.

---

# 78. Duplicate Detection

Before importing:

Check combinations such as:

```text
course + branch + semester + subject
```

for subjects.

For PYQs:

```text
subject + exam_year + exam_type
```

For resources:

```text
title + subject + uploader
```

Do not rely exclusively on title matching.

---

# 79. Data Validation

Validation must check:

- required fields
- valid UUIDs
- valid dates
- valid enum values
- valid references
- duplicate constraints
- file existence
- supported MIME types

Invalid records should enter an error report rather than partially importing.

---

# 80. Admin Data Dashboard

Admin dashboard should summarize:

```text
Total Students
Active Students
Published PYQs
Pending Resources
Published Resources
Active Quizzes
Open Support Chats
Unread Support Messages
Current Academic Year
Latest Notices
Recent Uploads
```

Use cards for high-level numbers.

Avoid making the dashboard a decorative analytics wall.

---

# 81. Student Dashboard Data

Student dashboard should be assembled from relevant services.

Possible sections:

```text
Greeting
Profile summary
Current semester
Upcoming academic event
Recent notices
Quick access
Recent PYQs
Recommended quizzes
Toolbox
Recent resources
Support status
```

The dashboard should not require one enormous database query.

Use multiple efficient service calls or a dedicated dashboard aggregation endpoint.

---

# 82. Recommendation Logic

Version one should remain deterministic.

Examples:

```text
student branch = CSE
student semester = 3
→ prioritize CSE semester 3 resources
```

Quiz recommendation:

```text
recently viewed subject
+
same semester
+
not attempted
```

Do not add AI merely for marketing.

A simple relevance system can provide a better user experience with less complexity.

---

# 83. Student Activity

Optional table:

```text
student_activity
```

Fields:

```text
id UUID PRIMARY KEY
student_id UUID
activity_type TEXT
entity_type TEXT
entity_id UUID
metadata JSONB
created_at TIMESTAMPTZ
```

Examples:

```text
viewed_pyq
opened_resource
started_quiz
completed_quiz
opened_tool
viewed_syllabus
```

Avoid collecting unnecessary behavioral data.

Only collect what provides clear product value.

---

# 84. Privacy by Design

BEU BABA should collect the minimum information needed.

Signup may require:

- name
- email
- contact number
- course
- branch
- semester
- optional roll/registration details
- gender if avatar selection depends on it
- profile image/avatar

Do not collect unrelated information.

---

# 85. Student Data Visibility

Student-facing profile can show:

```text
Name
Course
Branch
Semester
Avatar/profile image
```

It should not publicly expose:

```text
phone
email
registration number
```

unless the product explicitly requires it.

---

# 86. Admin Student View

Admin can have a student detail screen.

Sections:

```text
Profile
Academic Details
Activity Summary
Resource Uploads
Quiz History
Support Conversations
Account Status
```

Sensitive fields should be visible only to authorized roles.

---

# 87. Account Deactivation

Student account should support:

```text
active
suspended
deactivated
```

A suspended account may be blocked from login/application access.

Do not delete the user's academic contribution history unnecessarily.

---

# 88. Content Attribution

For community resources:

```text
Uploaded by
Verified by BEU BABA
```

can be shown.

However, decide whether real student names should be public.

A safer default is:

```text
Uploaded by student
```

unless the student explicitly opts into attribution.

---

# 89. Resource Reporting

Students should be able to report:

- incorrect resource
- duplicate
- broken file
- inappropriate content
- wrong subject
- outdated information

Table:

```text
content_reports
```

Fields:

```text
id UUID PRIMARY KEY
reporter_id UUID
entity_type TEXT
entity_id UUID
reason TEXT
description TEXT
status TEXT
resolved_by UUID
resolved_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

---

# 90. Moderation Queue

Admin should have:

```text
Pending
Reported
Recently Published
Rejected
Archived
```

The queue should support filters.

Example:

```text
Resource
Subject
Uploader
Date
Status
Report count
```

---

# 91. Versioning for Important Content

Version these whenever meaningful:

- syllabus
- calendar
- official notices
- developer information
- app policy content

PYQs usually need record permanence rather than revision.

Quiz questions may use revisions if administrators edit them after publication.

---

# 92. Published Content Immutability

Once a high-impact academic document is published, editing it directly should be discouraged.

Better:

```text
Published Version 1
      ↓
Create Revision
      ↓
Version 2
      ↓
Review
      ↓
Publish Version 2
```

This prevents accidental historical corruption.

---

# 93. App Update Strategy

PWA has two separate update categories.

### Code update

Requires deployment:

```text
React
CSS
JavaScript
components
logic
```

### Content update

Does not necessarily require deployment:

```text
PYQ
syllabus
calendar
notice
quiz
resource
developer links
```

This distinction is fundamental to BEU BABA.

---

# 94. Content Update Example

Admin changes:

```text
2026-27 Academic Calendar
```

Flow:

```text
Admin Panel
 ↓
Calendar
 ↓
Select 2026-27
 ↓
Edit event
 ↓
Save
 ↓
Publish
 ↓
Database updated
 ↓
Cache invalidated
 ↓
PWA retrieves new content
```

No frontend code modification is necessary.

---

# 95. Syllabus Update Example

Suppose:

```text
CSE Semester 4
```

syllabus changes.

Admin:

```text
Create new syllabus version
Upload PDF
Update structured subjects/units
Submit for review
Publish
```

Students automatically see:

```text
Latest published syllabus
```

Historical version remains archived.

---

# 96. Academic Calendar Update Example

If an exam moves:

```text
20 May → 27 May
```

Admin changes one event.

The frontend automatically displays:

```text
27 May
```

If notification rules are enabled:

```text
Exam schedule updated
```

is created.

---

# 97. Developer Link Update Example

If the Telegram URL changes:

Admin:

```text
Settings
→ Developer Profile
→ Telegram
→ Update
→ Save
```

Every component reading the developer profile gets the new value.

Do not hardcode it into:

```text
Footer
Support screen
About screen
Contact modal
Settings
```

individually.

---

# 98. API Error Model

Use a consistent error shape.

Example:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "request_id": "..."
  }
}
```

Do not expose:

```text
SQL errors
database table names
stack traces
secret keys
internal paths
```

to users.

---

# 99. Error Codes

Examples:

```text
AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
FILE_TOO_LARGE
INVALID_FILE_TYPE
RESOURCE_PENDING
RESOURCE_REJECTED
QUIZ_EXPIRED
RATE_LIMITED
SERVER_ERROR
```

Frontend can map these to friendly messages.

---

# 100. Loading States

Every data-driven screen must handle:

```text
Loading
Success
Empty
Error
Offline
```

Example PYQ page:

### Loading

Skeleton cards.

### Empty

> No PYQs found for the selected filters.

### Error

> We couldn't load PYQs. Please try again.

### Offline

> You're offline. Showing saved content where available.

---

# 101. Empty-State Data

Empty states should be intentional.

Examples:

```text
No saved quizzes yet.
```

with CTA:

```text
Explore quizzes
```

For support:

```text
No conversations yet.
```

CTA:

```text
Contact developer
```

---

# 102. API Contract Stability

Use:

```text
/api/v1/
```

instead of exposing unstable routes directly.

Future:

```text
/api/v2/
```

can coexist when breaking changes are required.

Do not break the existing PWA unnecessarily.

---

# 103. Service Boundaries

Recommended application services:

```text
AuthService
ProfileService
AcademicService
SyllabusService
CalendarService
PYQService
ResourceService
QuizService
ToolService
NotificationService
SupportService
SearchService
FileService
AdminService
AnalyticsService
```

Each service should have a clear responsibility.

---

# 104. Do Not Create One Giant Service

Avoid:

```text
AppService.js
```

containing:

- authentication
- quiz
- syllabus
- files
- admin
- notifications

This becomes difficult to maintain.

Use domain-oriented services.

---

# 105. Data Fetching Strategy

Frontend should use a query library such as TanStack Query.

Benefits:

- caching
- stale state management
- retries
- invalidation
- loading states
- optimistic updates

Example conceptual query:

```text
usePublishedSyllabus(branchId, semesterId)
```

instead of raw fetch logic repeated in components.

---

# 106. Mutation Strategy

Mutations should invalidate relevant queries.

Example:

```text
Admin publishes resource
 ↓
resource list invalidated
 ↓
student list refreshes
```

Do not manually refresh the entire application.

---

# 107. Realtime

Use realtime selectively.

Good:

- support messages
- unread support count
- urgent notifications

Not necessary for:

- syllabus
- PYQ
- academic calendar

These can use normal API/database fetching.

---

# 108. Support Realtime Flow

```text
Developer sends reply
 ↓
message inserted
 ↓
realtime event
 ↓
student receives update
 ↓
message appears
 ↓
notification badge updates
```

If realtime fails, normal polling/refetch should still recover the state.

---

# 109. Notification Delivery Architecture

Separate:

```text
Notification record
```

from:

```text
Push delivery
```

Creating a notification means:

```text
database notification exists
```

Push delivery means:

```text
device was notified
```

A push can fail while the notification remains available inside the app.

---

# 110. Notification Reliability

When push fails:

```text
database notification remains
```

The student can still see it in:

```text
Notification Center
```

This prevents lost information.

---

# 111. Notification Deduplication

Do not send the same notification repeatedly.

Use a logical deduplication key where useful:

```text
announcement_id + user_id
```

or:

```text
calendar_event_id + change_version + user_id
```

---

# 112. Analytics Events

Useful events:

```text
app_open
login_success
signup_complete
pyq_view
pyq_download
resource_view
resource_upload
resource_report
quiz_start
quiz_complete
tool_open
support_conversation_created
support_message_sent
notification_open
```

Avoid recording unnecessary personal content.

---

# 113. Performance Data

Track:

```text
API latency
error rate
file upload failures
quiz submission failures
PWA install events
notification delivery failures
```

These are more useful operationally than excessive user tracking.

---

# 114. Database Backups

Production database must have a backup strategy.

At minimum:

```text
regular automated backups
```

Additionally:

```text
restore testing
```

A backup that has never been restored is not fully trusted.

---

# 115. Migration Strategy

Database changes must be migration-based.

Example:

```text
001_initial_schema
002_add_quiz
003_add_support
004_add_calendar_versions
```

Never manually change production tables without recording the change.

---

# 116. Seed Data

Development environments should have seed data.

Example:

```text
courses
branches
semesters
subjects
sample quizzes
sample tools
sample announcements
```

Never copy real student data into development.

---

# 117. Environment Separation

Use:

```text
development
staging
production
```

with separate:

- databases
- storage buckets
- credentials
- authentication configuration

Do not point local development at production accidentally.

---

# 118. Secrets

Never place:

```text
service_role key
database password
private API key
push private key
```

in frontend JavaScript.

Frontend code is visible to users.

Only public configuration belongs there.

---

# 119. Admin API Security

Admin APIs must verify:

1. authenticated user
2. active account
3. admin role
4. permission
5. input validation
6. operation-specific authorization

Do not rely on hiding admin buttons.

---

# 120. Frontend Route Protection

Routes:

```text
/dashboard
/profile
/quiz
/support
```

may require authentication.

Admin:

```text
/admin/*
```

must require both authentication and authorization.

A hidden route is not a security control.

---

# 121. Student Signup Flow

Recommended:

```text
Welcome
 ↓
Create account
 ↓
Name
 ↓
Email
 ↓
Phone
 ↓
Course
 ↓
Branch
 ↓
Semester
 ↓
Gender
 ↓
Profile image/avatar
 ↓
Verification
 ↓
Profile created
 ↓
Dashboard
```

Avoid forcing unnecessary information before account creation if it harms conversion.

A two-stage onboarding flow can be used if appropriate.

---

# 122. Profile Completion

If optional information remains:

```text
Profile completion: 80%
```

Prompt the user later.

Do not block basic app usage unnecessarily.

---

# 123. Course/Branch Validation

When course changes:

```text
Course
 ↓
Branch options update
```

When branch changes:

```text
Branch
 ↓
semester options update
```

The frontend should retrieve valid options rather than maintaining a huge static mapping.

---

# 124. Student Academic Context

Store the current academic context:

```text
course_id
branch_id
semester_id
academic_year_id
```

This allows personalized dashboard results.

---

# 125. Historical Student Context

If the student advances semester, avoid destroying history.

For example:

```text
2025-26 → Semester 3
2026-27 → Semester 4
```

An optional table:

```text
student_academic_history
```

can record:

```text
student_id
course_id
branch_id
semester_id
academic_year_id
start_date
end_date
```

This is useful for analytics and historical quiz results.

---

# 126. Quiz History

A student's old quiz attempt should remain tied to the quiz version/context that existed at the time.

If a quiz is later edited significantly, consider versioning it.

Otherwise, an old score could become confusing.

---

# 127. Quiz Versioning

Optional table:

```text
quiz_versions
```

with:

```text
quiz_id
version_number
status
published_at
created_by
```

Questions can belong to a version.

This is especially useful if BEU BABA eventually supports serious examination practice.

---

# 128. Resource Metadata Quality

Every resource should ideally have:

```text
title
type
course
branch
semester
subject
description
file
source
status
```

Do not allow vague uploads such as:

```text
notes.pdf
```

without classification.

---

# 129. Upload Wizard

Student resource upload UI:

```text
Step 1 — Select resource type
Step 2 — Select course
Step 3 — Select branch
Step 4 — Select semester
Step 5 — Select subject
Step 6 — Add title/description
Step 7 — Upload file
Step 8 — Review
Step 9 — Submit
```

Show a clear privacy/moderation message:

> Your resource will be reviewed before it appears publicly.

---

# 130. Admin Resource Review Screen

Admin should see:

```text
File preview
Title
Description
Academic classification
Uploader
Upload date
File size
Reports
```

Actions:

```text
Approve
Reject
Request correction
Archive
```

---

# 131. Request Correction

Instead of rejecting every imperfect submission, support:

```text
needs_changes
```

Student receives:

> Please select the correct subject and resubmit.

This improves content quality.

---

# 132. Content Quality Flags

Resources can have flags:

```text
verified
community
outdated
reported
duplicate
```

These are metadata, not necessarily user-facing labels.

---

# 133. Official vs Community Content

Every content item should identify:

```text
source_type
```

Example:

```text
official
admin
community
imported
```

The UI can show:

```text
Official
```

or:

```text
Community Resource
```

to maintain trust.

---

# 134. Trust Indicators

For official academic information:

```text
Verified
Official Document
Updated recently
```

Do not falsely label third-party material as official.

---

# 135. Academic Source Metadata

For imported or official content:

```text
source_name
source_url
source_reference
retrieved_at
```

can be stored.

This helps future verification.

---

# 136. Data Freshness

Dynamic academic records can store:

```text
last_verified_at
```

This is especially useful for:

- syllabus
- calendar
- notices

Admin can see which content needs review.

---

# 137. Expiration

Temporary information should support:

```text
expires_at
```

Examples:

- admission notice
- exam reminder
- temporary maintenance announcement

Expired content should not clutter the main interface.

---

# 138. Home Feed Architecture

The home feed can combine:

```text
important notice
upcoming event
recent PYQ
recommended quiz
new resource
```

Each card should reference a real entity.

Avoid storing an entire feed as static JSON.

---

# 139. Feed Priority

Suggested priority:

```text
Critical academic notice
Upcoming exam event
Important update
New useful content
General content
```

Do not let promotional content dominate academic information.

---

# 140. Home Feed Personalization

For a CSE semester 4 student:

```text
CSE semester 4 resources
```

should rank higher than:

```text
other branch semester 2 resources
```

unless the student explicitly explores broader content.

---

# 141. Favorites

Optional feature:

```text
student_favorites
```

Fields:

```text
id
student_id
entity_type
entity_id
created_at
```

Allow favorites for:

- PYQs
- resources
- quizzes
- tools

This improves retention without requiring a complicated social system.

---

# 142. Recently Viewed

Optional:

```text
recently_viewed
```

Use it to provide:

```text
Continue learning
Recently viewed
```

Limit stored history.

For example:

```text
last 50 items
```

---

# 143. Downloads

If tracking downloads:

```text
download_events
```

can record:

```text
student_id
file_id
entity_type
entity_id
created_at
```

Do not rely solely on a global integer counter if detailed analytics are needed.

---

# 144. Counters

Fields such as:

```text
view_count
download_count
```

are convenient for UI.

But high-frequency counters should be updated carefully to avoid database contention.

---

# 145. Searchable Content

Each content type should expose a normalized search representation.

Potential:

```text
search_documents
```

or PostgreSQL full-text columns.

But do not duplicate massive document contents unnecessarily.

---

# 146. PDF Text Search

Future enhancement:

Extract text from PDFs into a search index.

This can enable:

> Search “deadlock” and find resources/PYQs containing deadlock.

This should be optional and asynchronous.

---

# 147. Background Processing

Heavy operations should not block the user request.

Examples:

- PDF text extraction
- thumbnail generation
- image compression
- malware scanning
- notification fan-out
- analytics aggregation

Use asynchronous jobs where infrastructure permits.

---

# 148. Image Optimization

Profile images and thumbnails should be optimized.

Pipeline:

```text
Upload
 ↓
Validate
 ↓
Resize
 ↓
Compress
 ↓
Store optimized version
```

Do not serve 8 MB camera images in profile cards.

---

# 149. Thumbnail Architecture

For PDFs/resources:

```text
original PDF
+
generated thumbnail
```

Store thumbnail separately.

The frontend should use thumbnails for cards and load the PDF only when needed.

---

# 150. Content Cards

Each card should receive a compact DTO:

```json
{
  "id": "...",
  "title": "...",
  "subtitle": "...",
  "thumbnailUrl": "...",
  "badge": "Official",
  "metadata": {
    "year": 2025
  }
}
```

Do not return unnecessary database fields to every card.

---

# 151. Mobile Data Efficiency

The application is mobile-first.

API responses should avoid:

- huge JSON payloads
- unnecessary joins
- full descriptions in list pages
- original image files
- large PDF downloads before user action

Use:

```text
list endpoint
detail endpoint
```

separation.

---

# 152. Detail Endpoint

List:

```text
GET /pyqs
```

returns compact metadata.

Detail:

```text
GET /pyqs/:id
```

returns:

- full metadata
- description
- related subject
- file access
- related resources

---

# 153. Related Content

Detail screens can show:

```text
Related PYQs
Related Resources
More from Subject
Recommended Quizzes
```

The service layer should generate these efficiently.

---

# 154. Student Toolbox Data

Tool calculations generally do not need server requests.

Prefer local calculation for:

- percentage
- unit conversion
- age
- basic finance
- timer

This provides instant response and can work offline.

---

# 155. Tool Accuracy

Calculators must have tests.

For example:

```text
CGPA calculation
SGPA calculation
attendance calculation
EMI
percentage
```

should have known input/output test cases.

Never rely only on manual testing.

---

# 156. Attendance Calculator

If included, make assumptions explicit.

Example:

```text
Current classes attended
Current classes held
Upcoming classes
Required attendance
```

Output:

```text
You can miss X more classes
```

or:

```text
You need to attend X consecutive classes
```

The mathematical model must be clearly documented.

---

# 157. Academic Calendar Countdown

If the calendar has an event:

```text
Exam starts in 12 days
```

The countdown should be calculated locally from the event timestamp/date.

Do not store:

```text
days_remaining = 12
```

because it becomes stale.

---

# 158. Date/Timezone

Store timestamps in UTC where time matters.

Display in the user's appropriate local timezone.

Academic date-only events such as:

```text
15 May 2027
```

should be treated as dates rather than accidentally shifting due to timezone conversion.

---

# 159. Time-Sensitive Events

For events with a specific time:

```text
start_at
end_at
timezone
```

should be considered.

Do not assume UTC for an event whose intended timezone is India.

---

# 160. Student Locale

Optional preferences:

```text
language
timezone
```

BEU BABA can initially default to:

```text
English
Asia/Kolkata
```

but the architecture should allow future localization.

---

# 161. Localization

Do not put all UI strings directly inside components.

Use a translation structure.

Example:

```text
common.login
common.logout
dashboard.welcome
quiz.start
```

Academic content remains database-driven.

---

# 162. English/Hinglish/Hindi

If multilingual support is later added, separate:

```text
UI translations
```

from:

```text
academic source content
```

Do not automatically translate official university text without verification.

---

# 163. Content Safety

Community uploads require moderation.

At minimum:

- report
- review
- reject
- archive

Potential future checks:

- malware scanning
- duplicate detection
- unsafe content detection

Do not automatically publish arbitrary student uploads.

---

# 164. Abuse Protection

Protect:

```text
signup
login
support messages
resource upload
quiz submission
search
notification triggers
```

with rate limits where appropriate.

---

# 165. Spam Protection

For support messaging:

```text
message frequency limit
```

can prevent flooding.

For uploads:

```text
daily upload quota
```

can be used.

Limits should be configurable.

---

# 166. Upload Quota

Possible initial policy:

```text
maximum uploads per day
maximum total pending uploads
maximum file size
```

The exact numbers should be decided after observing usage.

---

# 167. Support Attachments

Allow attachments optionally for:

```text
bug screenshots
error screenshots
wrong syllabus page
resource problem
```

Attachments must follow the same security rules as resources.

---

# 168. Bug Reporting

A support message may automatically include optional diagnostic metadata:

```text
app version
browser
OS
screen/route
```

Do not automatically include sensitive content.

This can dramatically improve debugging.

---

# 169. Support Ticket Context

When user taps:

```text
Report a bug
```

the app can prefill:

```text
Category: Bug
App version: 1.0.x
Current screen: /quiz/...
```

The user still controls the final message.

---

# 170. App Version Table

Optional:

```text
app_versions
```

Fields:

```text
id
version
build_number
release_notes
minimum_supported
released_at
is_current
```

Useful for PWA update messaging.

---

# 171. Maintenance Mode

App settings may include:

```text
maintenance_mode
maintenance_message
```

When enabled:

```text
Normal users
→ maintenance screen
```

Admins can still access the admin panel if deliberately supported.

---

# 172. Feature Flags

Feature flags can control:

```text
quiz_enabled
resource_upload_enabled
support_enabled
notifications_enabled
new_dashboard_enabled
```

This allows safe rollout.

---

# 173. Feature Flag Rule

Never use feature flags as a replacement for authorization.

Example:

```text
quiz_enabled = false
```

means the feature is disabled.

It does not mean:

```text
user is allowed to administer quizzes
```

Authorization remains separate.

---

# 174. Data Ownership Matrix

| Domain | Student | Admin | Public |
|---|---|---|---|
| Own profile | Read/Edit | Read | No |
| Other profiles | No | Limited | No |
| Syllabus | Read | CRUD/Publish | Published only |
| Calendar | Read | CRUD/Publish | Published only |
| PYQ | Read | CRUD | Published only |
| Resource | Upload/View own status | Moderate | Approved only |
| Quiz | Attempt | CRUD/Publish | Published metadata |
| Support | Own conversations | Assigned/admin | No |
| Notifications | Own | Create/manage | No |
| App settings | No | Super admin | Public subset |
| Audit logs | No | Authorized admin | No |

---

# 175. Database Naming Rules

Use:

```text
snake_case
```

for database identifiers.

Example:

```text
academic_years
student_academic_history
support_conversations
```

Use:

```text
camelCase
```

only at the API/frontend layer if desired.

---

# 176. Timestamp Rules

Every major table should have:

```text
created_at
updated_at
```

where appropriate.

Use database-generated timestamps.

Do not trust the browser clock for authoritative creation time.

---

# 177. UUID Strategy

Use UUIDs for externally exposed entities.

Avoid sequential IDs where exposing IDs could reveal record counts or facilitate enumeration.

Example:

```text
resource_id = UUID
```

---

# 178. Slugs

Human-readable slugs can be useful.

Example:

```text
/data-structures-2025
```

But slugs should not replace IDs.

Store:

```text
id
slug
```

and make slug uniqueness explicit.

---

# 179. Slug Changes

If a slug changes, old links should ideally redirect or resolve.

Do not make user-facing deep links permanently dependent on mutable titles.

---

# 180. Deep Linking

Every important entity should have a stable route.

Examples:

```text
/pyq/:id
/resource/:id
/quiz/:id
/syllabus/:id
/notice/:id
```

Push notifications can link directly to these routes.

---

# 181. Notification Deep Link Validation

A notification should not blindly navigate to arbitrary URLs.

Use allowed internal routes or validated references.

Avoid storing arbitrary executable navigation targets.

---

# 182. API Authorization Context

Every request should have:

```text
user_id
role
permissions
```

derived from authenticated identity.

Do not accept:

```json
{
  "user_id": "someone-else"
}
```

as proof that the requester is that user.

---

# 183. Ownership Checks

For every update/delete operation ask:

```text
Does this user own this record?
```

or:

```text
Does this role have permission?
```

Examples:

```text
student edits own profile → yes
student edits another profile → no
student edits published syllabus → no
moderator approves resource → yes if permitted
```

---

# 184. Admin Impersonation

Do not build admin impersonation in version one unless genuinely required.

If ever added, it must be heavily audited.

---

# 185. Password Management

Authentication provider should handle:

- password hashing
- reset
- email verification
- session management

Do not implement custom password storage.

---

# 186. Session Management

Use secure session handling.

Avoid storing long-lived authentication secrets in arbitrary local storage when the authentication system provides safer mechanisms.

---

# 187. Account Verification

Email/phone verification requirements should be configurable.

If contact number is collected only for profile purposes, do not imply it is verified unless actual verification occurs.

Store:

```text
phone_verified_at
```

only when verified.

---

# 188. Student Profile Editing

Allow editing of non-critical fields directly.

For important academic identity fields:

```text
course
branch
registration number
```

consider additional validation or admin review.

---

# 189. Data Change History

For critical profile changes, optionally record:

```text
profile_change_logs
```

This helps detect accidental or malicious changes.

---

# 190. Database Constraints

Use constraints for invariants.

Examples:

```text
exam_year > 1900
semester_number > 0
percentage between 0 and 100
negative_marks >= 0
```

The database should enforce what the database can logically enforce.

---

# 191. Enum Strategy

For rapidly changing business values, lookup tables can be preferable to rigid database enums.

For stable values, enums/check constraints are acceptable.

Examples:

```text
resource_status
quiz_status
support_status
```

must be controlled.

---

# 192. Transaction Boundaries

Multi-step operations should be atomic where possible.

Example resource publishing:

```text
update resource status
create moderation record
create notification
```

If these logically belong together, use a transaction or robust workflow.

---

# 193. Resource Approval Transaction

Conceptual:

```text
BEGIN
  mark resource approved
  record verifier
  create notification
  COMMIT
```

If notification creation fails and it is non-critical, a background retry can be used instead.

The publication itself must not silently roll back unless the product requires atomicity.

---

# 194. Quiz Submission Transaction

Conceptual:

```text
BEGIN
  validate attempt
  store answers
  calculate score
  store result
  mark attempt submitted
COMMIT
```

This prevents duplicate or inconsistent attempts.

---

# 195. Idempotency

Operations such as quiz submission and upload confirmation may need idempotency.

If the client retries due to poor network:

```text
same request
```

should not create:

```text
two quiz results
```

or:

```text
two identical resources
```

Use idempotency keys where appropriate.

---

# 196. Network Failure Handling

Mobile networks fail.

Frontend should distinguish:

```text
request failed before server received it
```

from:

```text
server processed request but response was lost
```

This is another reason idempotent operations matter.

---

# 197. Offline Quiz

Version one can require online submission.

If offline quiz is later supported:

- cache quiz safely
- prevent answer tampering
- sync attempts
- resolve duplicate submissions

Do not claim full offline examination security without implementing it.

---

# 198. Local Storage

Safe candidates:

- UI preferences
- selected filters
- recently opened public content IDs
- draft support message if clearly indicated
- toolbox preferences

Avoid storing sensitive data unnecessarily.

---

# 199. IndexedDB

For richer PWA caching, IndexedDB can store:

- cached academic metadata
- recent resources metadata
- offline tool state

Use a versioned local schema.

---

# 200. Cache Versioning

When app schema changes:

```text
IndexedDB v1
→ migrate
→ v2
```

or clear incompatible caches.

Never allow old cached structures to crash the new application.

---

# 201. API Contract Documentation

The repository should contain API documentation.

Each endpoint should specify:

```text
Purpose
Authentication
Authorization
Request
Query parameters
Response
Errors
Pagination
Caching
Examples
```

This allows frontend and backend development to proceed independently.

---

# 202. API Naming

Use resource-oriented naming.

Good:

```text
GET /api/v1/pyqs
GET /api/v1/pyqs/:id
POST /api/v1/resources
PATCH /api/v1/resources/:id
```

Avoid inconsistent verbs:

```text
/getAllPyqs
/doUploadResource
/fetchSingleQuiz
```

---

# 203. HTTP Semantics

Prefer:

```text
GET → retrieve
POST → create/action
PATCH → partial update
DELETE → delete/archive where appropriate
```

Return meaningful status codes.

Examples:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Rate Limited
500 Server Error
```

---

# 204. API Response Consistency

List:

```json
{
  "data": [],
  "meta": {
    "count": 20
  },
  "pagination": {
    "next_cursor": "..."
  }
}
```

Single object:

```json
{
  "data": {}
}
```

Error:

```json
{
  "error": {}
}
```

Consistency reduces frontend complexity.

---

# 205. Admin Bulk Operations

Admin may need:

```text
bulk publish
bulk archive
bulk assign
bulk delete/disable
bulk import
```

Bulk operations must:

- validate every item
- show count
- record audit action
- report failures individually

Do not silently skip failed records.

---

# 206. Bulk Import Preview

Before import:

```text
Total records: 250
Valid: 236
Duplicates: 9
Invalid: 5
```

Admin can review before confirmation.

---

# 207. Import Rollback

For large imports, record an import batch:

```text
import_batches
```

Fields:

```text
id
source_name
created_by
total_records
successful_records
failed_records
status
created_at
```

Records can reference:

```text
import_batch_id
```

This makes rollback and debugging easier.

---

# 208. Data Quality Dashboard

Admin should eventually see:

```text
Subjects without syllabus
PYQs without subject
Resources awaiting moderation
Calendars without current year
Broken files
Duplicate resources
Expired notices
```

This helps maintain content quality.

---

# 209. Broken File Detection

A scheduled check can verify:

```text
file metadata exists
storage object exists
```

Broken references should enter an admin queue.

---

# 210. Missing Content Detection

For each active subject:

```text
syllabus?
PYQ?
resource?
quiz?
```

The dashboard can identify gaps.

This is more useful than merely showing total content.

---

# 211. Course Completeness

A course dashboard can show:

```text
Semester 1
✓ Syllabus
✓ Calendar
✓ 18 PYQs
✓ 12 Resources
✓ 4 Quizzes

Semester 2
✓ Syllabus
⚠ No PYQs
...
```

This guides admins on where to add content.

---

# 212. Student Experience from Data

The student should not see database concepts.

They see:

```text
CSE
Semester 3
Data Structures
PYQs
```

The complexity stays behind the interface.

---

# 213. API Aggregation

For high-value screens, an aggregation service may return:

```text
dashboard summary
```

instead of requiring 15 independent network requests.

However, avoid building a giant endpoint that becomes impossible to maintain.

Use modular internal services behind the aggregation endpoint.

---

# 214. Dashboard Endpoint

Conceptually:

```text
GET /api/v1/dashboard
```

returns:

```json
{
  "student": {},
  "currentAcademicContext": {},
  "upcomingEvents": [],
  "importantAnnouncements": [],
  "recentPyqs": [],
  "recommendedQuizzes": [],
  "recentResources": [],
  "unreadNotifications": 3
}
```

---

# 215. Profile Endpoint

```text
GET /api/v1/me
PATCH /api/v1/me
```

Never:

```text
GET /users/:id
```

for ordinary student profile retrieval unless carefully authorized.

---

# 216. Academic Endpoints

Conceptual:

```text
GET /api/v1/courses
GET /api/v1/courses/:id/branches
GET /api/v1/branches/:id/semesters
GET /api/v1/semesters/:id/subjects
```

These can support onboarding and filtering.

---

# 217. Syllabus Endpoints

```text
GET /api/v1/syllabus
GET /api/v1/syllabus/:id
GET /api/v1/subjects/:id/syllabus
```

Admin:

```text
POST /api/v1/admin/syllabus
PATCH /api/v1/admin/syllabus/:id
POST /api/v1/admin/syllabus/:id/publish
```

---

# 218. Calendar Endpoints

```text
GET /api/v1/calendar
GET /api/v1/calendar/:id
GET /api/v1/calendar/events
```

Admin:

```text
POST /api/v1/admin/calendar
PATCH /api/v1/admin/calendar/events/:id
```

---

# 219. PYQ Endpoints

```text
GET /api/v1/pyqs
GET /api/v1/pyqs/:id
POST /api/v1/admin/pyqs
PATCH /api/v1/admin/pyqs/:id
```

Student upload should not necessarily use the same admin endpoint.

---

# 220. Resource Endpoints

```text
GET /api/v1/resources
GET /api/v1/resources/:id
POST /api/v1/resources
GET /api/v1/me/resources
```

Admin:

```text
GET /api/v1/admin/resources/pending
POST /api/v1/admin/resources/:id/approve
POST /api/v1/admin/resources/:id/reject
```

---

# 221. Quiz Endpoints

```text
GET /api/v1/quizzes
GET /api/v1/quizzes/:id
POST /api/v1/quizzes/:id/start
POST /api/v1/quiz-attempts/:id/submit
GET /api/v1/quiz-attempts/:id/result
```

Correct answers should never be exposed through the normal quiz payload.

---

# 222. Support Endpoints

```text
GET /api/v1/support/conversations
POST /api/v1/support/conversations
GET /api/v1/support/conversations/:id/messages
POST /api/v1/support/conversations/:id/messages
```

Admin:

```text
GET /api/v1/admin/support
POST /api/v1/admin/support/:id/reply
PATCH /api/v1/admin/support/:id
```

---

# 223. Notification Endpoints

```text
GET /api/v1/notifications
POST /api/v1/notifications/:id/read
POST /api/v1/notifications/read-all
```

Push subscription:

```text
POST /api/v1/push-subscriptions
DELETE /api/v1/push-subscriptions/:id
```

---

# 224. Search Endpoint

```text
GET /api/v1/search?q=data+structures
```

Optional:

```text
&type=pyq,resource,quiz
```

and:

```text
&course_id=
&branch_id=
&semester_id=
```

---

# 225. Admin Settings Endpoints

```text
GET /api/v1/admin/settings
PATCH /api/v1/admin/settings/:key
```

Public-safe settings can have:

```text
GET /api/v1/app/config
```

Only return settings marked public.

---

# 226. File Access Endpoint

For private files:

```text
POST /api/v1/files/:id/access
```

Server checks authorization, then returns temporary signed access.

Do not expose storage credentials.

---

# 227. File Upload Lifecycle

```text
Request upload
 ↓
Validate metadata
 ↓
Generate upload target
 ↓
Client uploads
 ↓
Server verifies object
 ↓
Create/complete file record
 ↓
Attach file to entity
```

This is safer than allowing arbitrary storage paths.

---

# 228. Upload Orphan Handling

If user uploads a file but closes the browser before completing the resource:

```text
orphan file
```

should eventually be cleaned up.

Use:

```text
temporary uploads
```

with expiration.

---

# 229. Content Relationship Rules

Examples:

```text
PYQ → must belong to subject
Resource → should belong to subject
Quiz → may belong to subject
Subject → belongs to semester
Semester → belongs to course
Branch → belongs to course
```

Enforce these relationships.

---

# 230. Academic Filter Integrity

A resource should not be able to claim:

```text
course = BCA
branch = CSE
```

if CSE does not belong to BCA.

The backend must validate the hierarchy.

---

# 231. Consistency Validation

Before publishing content:

```text
course matches branch
branch matches semester
semester matches subject
subject matches content
```

If mismatch:

```text
publication blocked
```

This prevents incorrect content appearing under the wrong academic category.

---

# 232. Admin UX for Relationships

Instead of allowing admins to select unrelated dropdowns:

```text
Course
→ Branch
→ Semester
→ Subject
```

should be cascading.

This reduces mistakes.

---

# 233. Search UX Data Requirements

Search result should include enough context:

```text
Data Structures
CSE · Semester 3
PYQ · 2025
```

Students should know what they are opening before tapping.

---

# 234. Sorting

Useful sorting:

```text
Newest
Oldest
Most viewed
Most downloaded
Year
Relevance
```

Do not allow arbitrary unindexed sorting across massive tables.

---

# 235. Filters as Query Parameters

Example:

```text
/api/v1/pyqs?
course_id=...
&branch_id=...
&semester_id=...
&subject_id=...
&year=2025
```

This keeps filter state shareable and deep-linkable.

---

# 236. URL State

Frontend should encode meaningful filters in URL where useful.

Example:

```text
/pyqs?semester=3&subject=data-structures
```

Benefits:

- back button
- sharing
- reload persistence

---

# 237. User Preferences

Table:

```text
user_preferences
```

Fields:

```text
user_id
theme
reduced_motion
language
notification settings
created_at
updated_at
```

The visual design remains light premium glassmorphism as the primary theme.

If dark mode is later offered, it should be a preference rather than forcing it.

---

# 238. Accessibility Preference

Respect:

```text
reduced_motion
```

If enabled:

- reduce decorative transitions
- avoid excessive parallax
- keep functional animation short
- preserve usability

---

# 239. Design/Data Separation

The database should not store visual styling for every card.

Bad:

```text
card_background = "#..."
```

unless an admin-configurable promotional component explicitly requires it.

Normal UI styling belongs in the frontend design system.

---

# 240. Content vs Presentation

Database:

```text
title
description
image
metadata
```

Frontend:

```text
glass card
blur
border
shadow
animation
layout
```

This keeps the content model clean.

---

# 241. Data Contract for Cards

Recommended generic shape:

```json
{
  "id": "uuid",
  "title": "Data Structures",
  "subtitle": "CSE • Semester 3",
  "type": "subject",
  "thumbnail": null,
  "badges": ["Core"],
  "metadata": {}
}
```

The UI can transform this into different visual cards.

---

# 242. Data Contract for Academic Content

Example:

```json
{
  "id": "uuid",
  "subject": {
    "id": "uuid",
    "name": "Data Structures",
    "code": "CS301"
  },
  "semester": {
    "number": 3,
    "name": "Semester 3"
  },
  "status": "published"
}
```

Keep nested data compact.

---

# 243. API Security Headers

Production should use appropriate headers such as:

- HTTPS
- HSTS
- content security policy where practical
- frame protections
- MIME sniffing protection

Exact implementation depends on hosting architecture.

---

# 244. CORS

Allow only known application origins.

Do not use:

```text
Access-Control-Allow-Origin: *
```

for sensitive authenticated APIs unless there is a deliberate reason.

---

# 245. Rate Limits

Potential limits:

```text
Login attempts
Signup
Support messages
Resource uploads
Quiz submission
File access
Search
```

The exact values should be tuned based on real usage.

---

# 246. Abuse Detection

Track suspicious patterns such as:

```text
many uploads in short time
repeated failed authentication
massive support messages
rapid automated requests
```

Admin can review.

---

# 247. Student Content Ownership

A student may edit a resource only while:

```text
draft
needs_changes
```

Once approved:

```text
published
```

editing may require moderation again.

This prevents bypassing moderation.

---

# 248. Moderation Re-review

If an approved resource is edited:

```text
published
 ↓
edited
 ↓
pending_review
```

The changed version must not silently replace the approved version.

---

# 249. Resource Versioning

For important community resources:

```text
resource_versions
```

can store:

```text
resource_id
version_number
file_id
metadata_snapshot
created_by
created_at
status
```

This provides rollback.

---

# 250. Student Upload History

Student profile can show:

```text
Uploads
Pending
Approved
Rejected
```

This encourages responsible contribution.

---

# 251. Contribution Recognition

Future feature:

```text
Contributor badge
```

based on approved resources.

Do not reward raw upload volume.

Reward:

```text
approved quality contributions
```

to avoid spam.

---

# 252. Gamification Data

If later added:

```text
student_points
achievements
badges
streaks
```

should be separate from core academic data.

Do not let gamification contaminate academic records.

---

# 253. Quiz Leaderboards

If added, default to privacy-safe display.

Instead of:

```text
Full Name + phone/email
```

use:

```text
Display name
Avatar
Score
```

with opt-in participation.

---

# 254. Student Privacy Controls

Potential settings:

```text
show my name on leaderboard
show contributor name
allow notifications
allow analytics
```

Respect these preferences.

---

# 255. Content Moderation Policy Data

Store moderation reason codes.

Example:

```text
wrong_category
duplicate
incomplete
broken_file
copyright_concern
inappropriate
outdated
other
```

This allows analytics on common quality problems.

---

# 256. Admin Notes

Internal notes should be separate from public descriptions.

Never accidentally return:

```text
admin_note
```

through a public API.

---

# 257. Internal vs Public DTO

Admin resource:

```json
{
  "id": "...",
  "title": "...",
  "status": "pending",
  "adminNotes": "..."
}
```

Student resource:

```json
{
  "id": "...",
  "title": "...",
  "status": "approved"
}
```

Never reuse privileged DTOs blindly.

---

# 258. Data Migration from Existing Sources

When extracting old app data:

1. identify source
2. extract
3. normalize
4. map fields
5. validate
6. deduplicate
7. preview
8. import
9. verify counts
10. publish

Keep raw source files separately.

---

# 259. Import Verification

After import compare:

```text
Source:
120 PYQs

Imported:
118 valid
2 invalid
```

Do not claim full migration until discrepancies are understood.

---

# 260. Content Reconciliation

After migration, compare:

```text
Course count
Branch count
Semester count
Subject count
PYQ count
Syllabus count
Calendar count
```

against source.

---

# 261. Data Backup Before Import

Before a large production import:

```text
backup
→ import
→ verify
```

Never perform destructive mass operations without recovery capability.

---

# 262. Production Data Seeding

Production should be seeded only with verified content.

Never seed:

```text
fake students
test support messages
development passwords
```

into production.

---

# 263. Test Data

Use clearly marked fixtures:

```text
TEST_COURSE
TEST_SUBJECT
TEST_RESOURCE
```

in development/staging only.

---

# 264. Automated Tests

Core services should have tests for:

### Profile

- create
- update
- authorization

### Academic

- hierarchy validation

### Syllabus

- versioning
- publishing

### Resources

- upload
- moderation
- ownership

### Quiz

- scoring
- negative marking
- duplicate submission

### Support

- privacy
- message access

### Notifications

- recipient filtering

---

# 265. Security Test Cases

Test:

```text
Student A tries to read Student B profile
Student A tries to read Student B support chat
Student tries to approve own resource
Student tries to publish syllabus
Student modifies quiz score
Student accesses private file without authorization
```

All should fail.

---

# 266. Data Integrity Test

Test invalid relationships:

```text
B.Tech branch assigned to BCA course
subject assigned to wrong semester
PYQ assigned to unrelated subject
resource assigned to wrong branch
```

Backend must reject them.

---

# 267. API Contract Tests

Frontend should be able to rely on:

```text
field names
types
nullable behavior
error format
pagination
```

Changes should be reviewed as contract changes.

---

# 268. Backward Compatibility

When adding a new field:

```text
usually safe
```

When removing or renaming a field:

```text
breaking
```

Prefer additive changes.

---

# 269. Database Performance Monitoring

Monitor:

```text
slow queries
high connection usage
storage growth
index performance
failed queries
```

Do not optimize prematurely, but do not ignore slow production queries.

---

# 270. Storage Cost Management

Files are likely to consume more storage than database rows.

Use:

- thumbnails
- compression
- duplicate detection
- orphan cleanup
- archival policies

Do not store duplicate copies of the same PDF unnecessarily.

---

# 271. File Deduplication

Checksum:

```text
SHA-256
```

can identify identical files.

If two users upload exactly the same file:

```text
same checksum
```

the system can flag it as a possible duplicate.

Do not automatically reject all duplicates without considering legitimate use cases.

---

# 272. Content Retention

Define retention policies.

Examples:

```text
temporary upload → delete after X days if incomplete
expired announcement → archive
old syllabus → retain
audit logs → retain according to policy
```

Academic historical records should generally be retained rather than automatically deleted.

---

# 273. Data Export

Students may eventually need:

```text
export profile
quiz history
contribution history
```

A data-export service can create structured files.

---

# 274. Account Deletion

If account deletion is supported:

```text
authentication identity
profile
support content
resource contributions
quiz history
```

must be handled according to the application's retention/privacy policy.

Do not blindly cascade-delete everything if it would destroy important public academic records.

---

# 275. Anonymization

If a student deletes an account but approved resources remain:

```text
Uploaded by former student
```

can be used rather than retaining identifiable personal information.

---

# 276. Developer Contact Architecture

The Contact Developer screen should read:

```text
developer_profile
```

and display:

```text
Portfolio
Instagram
Telegram
Email
```

It should also offer support categories:

```text
Report Bug
Request Syllabus Update
Request Course Update
Suggest Feature
Report Wrong Content
General Message
```

---

# 277. Support Priority

Students can optionally choose:

```text
Low
Normal
High
```

Admins can override priority.

Do not allow students to mark everything critical without safeguards.

---

# 278. Support SLA Data

Optional fields:

```text
first_response_at
resolved_at
```

This helps measure support quality.

---

# 279. Support Read State

Unread messages should be tracked per participant.

A simple `is_read` may become insufficient for group/admin workflows.

For one-student/one-developer conversation it is acceptable initially.

---

# 280. Developer Dashboard

Developer/admin support dashboard:

```text
New
In Progress
Waiting
Resolved
```

Filters:

```text
Bug
Syllabus
Course
Resource
Feature
General
```

Each ticket should display:

```text
student
academic context
last message
time
priority
status
```

---

# 281. Support Notification

When admin replies:

```text
database notification created
push notification attempted
```

If push is disabled:

```text
in-app notification remains
```

---

# 282. Academic Update Notification

When admin publishes a new syllabus version:

```text
find affected students
→ create notification
→ push where permitted
```

Target only relevant students.

---

# 283. Bulk Notification

Admin can send:

```text
everyone
course
branch
semester
```

But require a confirmation step.

Example:

```text
You are about to notify 1,284 students.
```

This prevents accidental mass notification.

---

# 284. Notification Preview

Before sending:

```text
Title
Message
Audience
Estimated recipients
```

Admin confirms.

---

# 285. Notification History

Admin should see:

```text
Sent
Audience
Date
Delivery status
```

This helps diagnose communication issues.

---

# 286. Announcement vs Notification

Keep separate concepts.

### Announcement

Persistent content displayed in app.

### Notification

User-specific alert pointing to content/action.

One announcement can generate many notifications.

---

# 287. Content Publication Pipeline

Generic:

```text
Create
 ↓
Validate
 ↓
Draft
 ↓
Review
 ↓
Publish
 ↓
Index
 ↓
Cache invalidation
 ↓
Optional notification
```

This is the standard content pipeline.

---

# 288. Search Index Update

After publication:

```text
content published
→ search index update
```

If asynchronous:

```text
content visible
→ search index shortly after
```

The system should tolerate eventual consistency.

---

# 289. Cache + Search Ordering

Preferred:

```text
Publish transaction
 ↓
database committed
 ↓
cache invalidated
 ↓
search indexing triggered
```

This avoids serving stale published content for long periods.

---

# 290. Admin Audit

Every publish action should record:

```text
actor
entity
action
timestamp
```

For high-impact documents:

```text
version
```

as well.

---

# 291. Data Model Summary

Core tables:

```text
profiles
avatars

courses
branches
semesters
subjects
academic_years

syllabus_versions
syllabus_units
syllabus_topics

academic_calendars
academic_calendar_events

files
pyq_papers
resources

quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_answers

tools

support_conversations
support_messages

developer_profile
app_settings

announcements
notifications
push_subscriptions
notification_preferences

user_roles
audit_logs

content_reports
student_academic_history
student_favorites
student_activity
```

Optional advanced tables:

```text
quiz_versions
resource_versions
import_batches
profile_change_logs
download_events
search_documents
app_versions
```

---

# 292. Recommended Build Order

Build data architecture in this order:

## Phase 1

```text
Auth
Profiles
Courses
Branches
Semesters
Subjects
```

## Phase 2

```text
Files
Syllabus
Calendar
PYQ
```

## Phase 3

```text
Resources
Moderation
Reports
```

## Phase 4

```text
Quiz
Attempts
Results
```

## Phase 5

```text
Support
Notifications
Push
```

## Phase 6

```text
Search
Favorites
Activity
Analytics
```

## Phase 7

```text
Advanced admin
versioning
imports
data quality
```

---

# 293. Minimum Viable Database

If implementation must start small, the minimum useful schema is:

```text
profiles
courses
branches
semesters
subjects
files
syllabus_versions
academic_calendars
academic_calendar_events
pyq_papers
resources
quizzes
quiz_questions
quiz_options
quiz_attempts
support_conversations
support_messages
notifications
developer_profile
app_settings
user_roles
```

Do not remove security-related concepts merely to reduce table count.

---

# 294. What Must Never Be Hardcoded

Never hardcode dynamic:

```text
course list
branch list
semester list
subject list
syllabus PDF
calendar PDF
calendar events
PYQ metadata
resource list
quiz content
developer links
support categories
notification content
important announcements
current academic year
```

These belong to managed data/configuration.

---

# 295. What Can Be Hardcoded

Reasonably static application behavior can remain in code:

```text
route definitions
UI component structure
animation definitions
design tokens
validation algorithms
calculator formulas
API client structure
permission-checking code
```

Even these should be configurable when there is a strong reason.

---

# 296. Critical Principle: Database Is Not the Design

The database should store facts.

It should not attempt to store the entire interface.

Do not create tables such as:

```text
glass_card_style
animation_speed
blur_amount
navbar_radius
```

for normal application UI.

Those belong in the design system.

---

# 297. Critical Principle: API Is Not the Database

The API is a contract.

The database can evolve internally.

Frontend should consume stable application-level objects.

This protects the UI from database implementation changes.

---

# 298. Critical Principle: Admin Is Not the Database

Admins should never be forced to edit raw SQL or JSON to perform ordinary content operations.

The admin panel should provide:

```text
forms
dropdowns
file upload
preview
validation
publish workflow
```

The database remains the underlying storage system.

---

# 299. Critical Principle: Student Should Not Need Admin Knowledge

A student should be able to:

```text
find subject
→ open PYQ
→ download
→ take quiz
→ view result
→ upload resource
→ track approval
→ contact developer
```

without understanding the internal architecture.

---

# 300. Final BEU BABA Data Architecture

The complete conceptual flow is:

```text
                    ┌─────────────────────┐
                    │      STUDENT        │
                    └──────────┬──────────┘
                               │
                     Authentication
                               │
                               ▼
                    ┌─────────────────────┐
                    │      PROFILE        │
                    └──────────┬──────────┘
                               │
                   Academic Context
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
       Course               Branch              Semester
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                           Subjects
                               │
          ┌────────────┬───────┼────────┬────────────┐
          ▼            ▼       ▼        ▼            ▼
      Syllabus       PYQs   Resources Quiz      Calendar
          │            │       │        │            │
          └────────────┴───────┴────────┴────────────┘
                               │
                               ▼
                         Student Experience
                               │
            ┌──────────────────┼───────────────────┐
            ▼                  ▼                   ▼
         Toolbox          Notifications         Support
                               │                   │
                               ▼                   ▼
                         Push / In-App        Developer/Admin
```

---

# 301. Final Non-Negotiable Rules

The following rules should be treated as architecture requirements.

### Rule 1

Never expose private student data publicly.

### Rule 2

Never trust frontend authorization.

### Rule 3

Never expose quiz correct answers before submission.

### Rule 4

Never publish student-uploaded resources without moderation.

### Rule 5

Never hardcode changing academic content.

### Rule 6

Never overwrite important syllabus history without versioning.

### Rule 7

Never store private files as unrestricted public objects without a deliberate decision.

### Rule 8

Never let students access another student's support conversation.

### Rule 9

Never put service secrets in frontend code.

### Rule 10

Never use names as primary identifiers.

### Rule 11

Never use one giant JSON document as the entire academic database.

### Rule 12

Never make deletion the default for historical academic records.

### Rule 13

Never let an API return privileged admin fields to ordinary students.

### Rule 14

Never assume an uploaded filename or MIME type is trustworthy.

### Rule 15

Never make notification delivery the only place an important notification exists.

### Rule 16

Never calculate authoritative quiz scores only in the browser.

### Rule 17

Never make dynamic links exist in multiple hardcoded components.

### Rule 18

Never publish content without validating its academic relationships.

### Rule 19

Never perform mass production imports without backup and validation.

### Rule 20

Never confuse application code updates with content updates.

---

# 302. Definition of Done for the Data Layer

The BEU BABA data architecture is ready for production implementation when:

- authentication identity and profile identity are separated
- student profile authorization works
- academic hierarchy is normalized
- current academic year is configurable
- syllabus supports versioning
- calendar supports editable events
- PYQs are filterable
- resources support moderation
- files have metadata and secure access
- quizzes calculate results server-side
- quiz attempts are protected from duplicate submission
- support conversations are private
- developer information is centralized
- notifications are user-specific
- push subscriptions support multiple devices
- admin roles are permission-based
- audit logs exist for important administrative actions
- public APIs expose only safe fields
- private storage is protected
- database indexes exist for major query paths
- import validation exists
- backups exist
- migrations are version-controlled
- staging and production are separated
- content updates can occur without frontend redeployment
- syllabus/calendar/PYQ/resource publishing workflows are tested
- student-to-student data leakage tests pass
- admin privilege escalation tests pass
- file authorization tests pass
- quiz answer leakage tests pass

---

# 303. Final Product Principle

BEU BABA should not merely be an attractive frontend placed on top of a collection of PDFs.

It should be a structured academic platform.

The correct architecture is:

```text
Reliable Identity
        +
Structured Academic Data
        +
Versioned Official Content
        +
Moderated Community Content
        +
Secure Files
        +
Useful Quiz System
        +
Student Toolbox
        +
Private Developer Support
        +
Reliable Notifications
        +
Powerful Admin CMS
        +
Strict Authorization
        +
PWA Performance
```

The result should be a system where the developer can continuously maintain the academic ecosystem without repeatedly modifying application code.

A new semester can be added.

A new branch can be added.

A syllabus can be replaced with a new version.

An academic calendar can be corrected.

A PYQ can be uploaded.

A student can contribute a resource.

An administrator can verify it.

A quiz can be published.

A developer can reply to a private support request.

A notification can be delivered.

And all of these operations should happen through controlled data and application services rather than requiring a new frontend build for every content change.

That is the foundation required for BEU BABA to grow from a simple student PWA into a maintainable, premium, long-term academic platform.
