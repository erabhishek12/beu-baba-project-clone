# BEU BABA — ADMIN PANEL, CONTENT MANAGEMENT, MODERATION & OPERATIONS ARCHITECTURE

**Document:** `BEU_BABA_14_ADMIN_PANEL_CONTENT_MANAGEMENT_MODERATION_OPERATIONS.md`  
**Product:** BEU BABA  
**Document Type:** Master implementation specification  
**Priority:** TOP PRIORITY  
**Audience:** Product owner, UI/UX designer, frontend developer, backend developer, Supabase engineer, QA engineer, security reviewer, future maintainers

---

## 0. PURPOSE OF THIS DOCUMENT

The BEU BABA application is not only a student-facing academic application. It is a content-driven platform whose usefulness depends on an administration system that can continuously maintain academic information, resources, quizzes, announcements, support conversations, user accounts, reports, and application configuration.

This document defines the complete architecture and product behavior of the BEU BABA Admin Panel.

The Admin Panel must not be treated as a simple CRUD dashboard. It must be an operational control center.

The administrator should be able to:

1. Manage students.
2. Manage administrators and roles.
3. Manage courses.
4. Manage branches.
5. Manage semesters.
6. Manage subjects.
7. Manage syllabus data.
8. Manage syllabus versions.
9. Manage academic calendars.
10. Manage PYQs.
11. Manage notes and study resources.
12. Review student-submitted resources.
13. Approve, reject, request changes, archive, or remove resources.
14. Manage quizzes.
15. Manage question banks.
16. Review quiz reports.
17. Manage announcements.
18. Send notifications.
19. Reply privately to individual students.
20. Manage developer/support messages.
21. Review bug reports.
22. Review course/syllabus update requests.
23. Manage profile-character configuration.
24. Manage application settings.
25. Manage homepage content.
26. Manage featured resources.
27. Monitor storage.
28. Monitor moderation queues.
29. Review audit logs.
30. Review operational analytics.
31. Handle suspicious activity.
32. Control publication status.
33. Maintain version history.
34. Restore or archive content safely.
35. Prevent accidental destructive actions.

The admin system must follow a strict principle:

> **Every important administrative action must be traceable, permission-controlled, reversible where technically possible, and reflected consistently in the student application.**

---

# 1. CORE ADMIN DESIGN PHILOSOPHY

The Admin Panel should be designed around five principles.

## 1.1 Accuracy

Academic information must be accurate.

A typo in a course title is inconvenient.

A wrong syllabus, wrong semester mapping, wrong examination year, or incorrect PYQ can mislead hundreds or thousands of students.

Therefore academic data must have:

- Draft status
- Review status
- Published status
- Archived status
- Version information
- Updated timestamp
- Updated-by information
- Optional approval information

---

## 1.2 Safety

Admins should not accidentally:

- delete an entire subject,
- remove a published syllabus,
- delete a student's account,
- delete a file while metadata still references it,
- publish unfinished content,
- overwrite important historical information.

Destructive actions must require confirmation.

High-risk actions should require typed confirmation or a second confirmation layer.

---

## 1.3 Speed

The admin may manage thousands of records.

Therefore the interface must support:

- Search
- Filters
- Sorting
- Pagination
- Bulk actions
- Keyboard-friendly workflows
- Quick edit
- Quick publish
- Quick archive
- Saved filters
- Status tabs
- Recent activity

The admin should not need to open ten screens to approve one resource.

---

## 1.4 Transparency

The administrator should always know:

- what changed,
- who changed it,
- when it changed,
- what the previous state was,
- what the current state is,
- whether students can currently see it.

---

## 1.5 Separation of Responsibilities

Not every admin should have unrestricted access.

The system should support roles.

Example:

- Super Admin
- Content Admin
- Moderator
- Support Admin
- Analytics Viewer
- Technical Admin

Permissions should be granular.

---

# 2. ADMIN PANEL INFORMATION ARCHITECTURE

The primary navigation should contain the following modules.

```text
ADMIN PANEL
│
├── Dashboard
│
├── Students
│   ├── All Students
│   ├── Active
│   ├── Suspended
│   └── Student Details
│
├── Academic
│   ├── Courses
│   ├── Branches
│   ├── Semesters
│   ├── Subjects
│   ├── Syllabus
│   └── Academic Calendar
│
├── Resources
│   ├── All Resources
│   ├── Notes
│   ├── PYQs
│   ├── Study Materials
│   ├── Student Submissions
│   └── Featured Resources
│
├── Quiz
│   ├── Dashboard
│   ├── Quizzes
│   ├── Question Bank
│   ├── Categories
│   ├── Attempts
│   └── Reports
│
├── Communication
│   ├── Announcements
│   ├── Notifications
│   ├── Developer Messages
│   └── Bug Reports
│
├── Moderation
│   ├── Pending
│   ├── Reported
│   ├── Rejected
│   └── Audit History
│
├── Analytics
│   ├── Overview
│   ├── Users
│   ├── Content
│   ├── Quiz
│   └── Storage
│
├── Settings
│   ├── App Settings
│   ├── Social Links
│   ├── Developer Profile
│   ├── Characters
│   ├── Feature Flags
│   └── Notification Settings
│
└── Security
    ├── Admin Users
    ├── Roles
    ├── Permissions
    ├── Sessions
    └── Audit Logs
```

The exact navigation can evolve, but the conceptual separation should remain.

---

# 3. ADMIN DASHBOARD

The dashboard is the first screen after successful administrator authentication.

It should not be overloaded with decorative charts.

The purpose is operational awareness.

## 3.1 Dashboard top area

Display:

- Welcome message
- Admin name
- Current date
- Current system status
- Quick action buttons

Example:

```text
Good Morning, Admin

BEU BABA Operations

[ Add Resource ] [ Create Quiz ] [ Publish Announcement ]

System Status
● Database Operational
● Storage Operational
● Notifications Operational
```

---

## 3.2 Key metrics

Cards should display:

- Total students
- Active students
- New registrations
- Pending submissions
- Published resources
- Draft resources
- Active quizzes
- Unread support messages

Do not make every metric visually identical.

Primary metrics should have stronger hierarchy.

---

## 3.3 Moderation alert

A prominent but elegant card should show:

```text
Moderation Queue

24 resources waiting for review

[Review submissions]
```

If there are no pending submissions:

```text
All caught up
No pending submissions
```

---

## 3.4 Support inbox alert

Show:

```text
Developer Messages

7 unread
3 bug reports
4 update requests

[Open inbox]
```

---

## 3.5 Recent activity

Display the latest administrative actions:

```text
10:42 PM
Admin A published B.Tech CSE Semester 3 syllabus

9:18 PM
Moderator approved PYQ submission

8:47 PM
Admin B created Quiz #142
```

Every activity item should link to its source entity.

---

# 4. ADMIN AUTHENTICATION

The Admin Panel must never use the normal student UI as its security boundary.

A student-facing account and an administrator account may use the same Supabase Auth infrastructure, but authorization must be enforced separately.

The backend must determine whether the authenticated user has an appropriate admin role.

Never trust:

- frontend route guards alone,
- hidden buttons,
- localStorage values,
- manually supplied role fields from the browser.

The server/database authorization layer is authoritative.

---

# 5. ADMIN ROLES

Recommended roles:

## 5.1 Super Admin

Full access.

Can:

- manage admins,
- change roles,
- modify system settings,
- publish content,
- delete/archive content,
- access audit logs,
- manage feature flags,
- review security events.

This role should be extremely limited.

---

## 5.2 Content Admin

Can manage:

- courses,
- branches,
- semesters,
- subjects,
- syllabus,
- academic calendars,
- notes,
- PYQs,
- resources,
- quizzes.

Cannot manage administrator accounts unless explicitly granted.

---

## 5.3 Moderator

Can:

- review student uploads,
- approve,
- reject,
- request changes,
- review reports.

Cannot modify critical academic configuration.

---

## 5.4 Support Admin

Can:

- read student support conversations assigned to support,
- reply,
- categorize messages,
- close conversations,
- handle bug reports.

Should not have access to unnecessary academic administration.

---

## 5.5 Analytics Viewer

Read-only access to:

- user statistics,
- content statistics,
- quiz analytics,
- storage statistics.

Cannot modify production data.

---

## 5.6 Technical Admin

Can manage:

- technical settings,
- feature flags,
- storage operations,
- notification infrastructure,
- system health information.

Sensitive actions should still require Super Admin privileges where appropriate.

---

# 6. PERMISSION MODEL

Permissions should be granular.

Example permission names:

```text
students.read
students.update
students.suspend

courses.read
courses.create
courses.update
courses.archive

subjects.read
subjects.create
subjects.update

syllabus.read
syllabus.create
syllabus.update
syllabus.publish
syllabus.archive

resources.read
resources.create
resources.update
resources.publish
resources.archive
resources.moderate

quiz.read
quiz.create
quiz.update
quiz.publish
quiz.archive

support.read
support.reply
support.close

notifications.create
notifications.send

admins.read
admins.create
admins.update
admins.disable

settings.read
settings.update

audit.read
```

This structure makes future permission changes easier.

---

# 7. STUDENT MANAGEMENT

The Students screen must provide a professional data table.

Columns may include:

- Student name
- Email
- Course
- Branch
- Semester
- Contact number
- Registration date
- Last active
- Account status
- Verification state

Avoid showing sensitive data unnecessarily.

The admin should have a search box supporting:

- Name
- Email
- Student identifier where applicable

---

# 8. STUDENT DETAILS PAGE

Clicking a student should open a detailed profile.

Sections:

### Identity

- Name
- Email
- Contact
- Profile image
- Gender selection if stored
- Account creation date

### Academic

- Course
- Branch
- Semester
- Academic year

### Activity

- Last active
- Quiz attempts
- Resources bookmarked
- Resources uploaded
- Support messages

### Account status

- Active
- Suspended
- Disabled

### Administrative history

Show important actions affecting the account.

Do not expose private authentication secrets.

Never show passwords.

Never store plaintext passwords.

---

# 9. STUDENT SUSPENSION

Suspension must not be a simple destructive delete.

Use:

```text
Active
Suspended
Disabled
```

When suspending:

- require a reason,
- record admin identity,
- record timestamp,
- optionally set expiration,
- invalidate relevant sessions if supported,
- prevent prohibited actions.

The student-facing application should display an appropriate account state.

---

# 10. ACADEMIC MANAGEMENT

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
 └── Computer Science & Engineering
      └── Semester 3
           ├── Data Structures
           ├── DBMS
           ├── Digital Electronics
           └── Mathematics
```

This hierarchy should be normalized in the database.

Do not duplicate course names repeatedly inside every resource when a foreign key can represent the relationship.

---

# 11. COURSE MANAGEMENT

Course fields:

```text
id
name
short_name
description
duration
status
display_order
created_at
updated_at
```

Possible status:

```text
draft
active
archived
```

Admin actions:

- Create
- Edit
- Reorder
- Activate
- Archive

A course should not be permanently deleted if it has historical content unless there is a strong administrative reason.

---

# 12. BRANCH MANAGEMENT

Branch fields:

- Course ID
- Branch name
- Short code
- Description
- Display order
- Active status

Example:

```text
Computer Science & Engineering
CSE
```

The display name can be long while the short code remains compact.

---

# 13. SEMESTER MANAGEMENT

Semester should be represented in a stable manner.

Recommended:

```text
semester_number
display_name
course_id
branch_id
status
```

Example:

```text
1 → Semester 1
2 → Semester 2
...
8 → Semester 8
```

Do not rely only on the string `"Semester 3"` for programmatic logic.

---

# 14. SUBJECT MANAGEMENT

Subject fields should support:

- Subject name
- Subject code
- Semester
- Branch
- Course
- Credits
- Type
- Description
- Active state

Subject types may include:

```text
Theory
Practical
Lab
Elective
Project
Workshop
```

The exact classification should be configurable.

---

# 15. SYLLABUS MANAGEMENT

Syllabus management is one of the most important Admin Panel modules.

The system should support:

- Draft syllabus
- Published syllabus
- Version number
- Effective academic year
- Branch
- Semester
- Subject mapping
- PDF/file attachment
- Optional structured syllabus data
- Change notes
- Archive history

Example:

```text
B.Tech CSE
Semester 3
Academic Year 2026–27

Version 2
Status: Published

Updated:
01 September 2026
```

---

# 16. SYLLABUS VERSIONING

Never overwrite an important published syllabus without preserving its previous version.

If a syllabus changes:

```text
Version 1
Published
↓
Version 2
Draft
↓
Version 2
Published
```

Version 1 becomes historical.

This protects against accidental information loss.

The student application should normally show the latest published version.

Admins should be able to inspect historical versions.

---

# 17. ACADEMIC CALENDAR

The Academic Calendar module should allow:

- Create academic calendar
- Select academic year
- Add events
- Edit dates
- Publish
- Archive old calendars

Events may include:

- Semester start
- Semester end
- Examination
- Holiday
- Result
- Registration
- Admission
- Practical examination

Each event should have:

```text
title
event_type
start_date
end_date
description
status
```

---

# 18. CALENDAR CHANGE WORKFLOW

If an academic calendar date changes:

1. Open current calendar.
2. Create change.
3. Save as draft.
4. Review.
5. Publish.
6. Record update history.
7. Optionally send notification to students.

Never silently alter a critical date without recording the change.

---

# 19. RESOURCE MANAGEMENT

Resources should have a unified model.

Resource categories:

```text
Notes
PYQ
Syllabus
Question Bank
Study Material
Reference Material
Lab Material
Other
```

Each resource should have metadata.

Recommended fields:

```text
title
description
resource_type
course_id
branch_id
semester_id
subject_id
academic_year
file_id
thumbnail_id
uploaded_by
source_type
status
visibility
created_at
updated_at
published_at
```

---

# 20. RESOURCE STATUS MACHINE

Use explicit states:

```text
draft
pending_review
approved
published
rejected
changes_requested
archived
removed
```

Do not represent workflow using a single vague boolean such as:

```text
is_approved = true
```

A state machine is more expressive and safer.

---

# 21. STUDENT RESOURCE SUBMISSION

Students can upload resources according to the product requirement.

Submission process:

```text
Student selects Upload Resource
        ↓
Select file
        ↓
Enter title
        ↓
Select course
        ↓
Select branch
        ↓
Select semester
        ↓
Select subject
        ↓
Submit
        ↓
Pending Review
        ↓
Moderator reviews
        ↓
Approve / Reject / Request Changes
        ↓
If approved
        ↓
Publish
```

The student should not immediately make a submitted resource public.

---

# 22. MODERATION QUEUE

The moderation queue should be one of the fastest screens in the admin panel.

Each row should show:

- Resource title
- Student name
- Subject
- File type
- Submitted time
- Status
- Preview action
- Approve button
- Reject button
- Request changes button

Quick actions should not require opening a full page for every simple approval.

---

# 23. RESOURCE REVIEW PAGE

When reviewing a submission, show:

### Left side

Document/file preview.

### Right side

Metadata:

```text
Submitted by
Course
Branch
Semester
Subject
Resource type
Submission date
```

Then moderation controls:

```text
[Approve]
[Request Changes]
[Reject]
```

Admin should be able to enter a moderation note.

---

# 24. APPROVAL RULES

Before approval, validate:

- File exists.
- File type is permitted.
- File is not obviously malicious.
- Metadata is valid.
- Subject mapping exists.
- Student submission is not duplicated where duplicate detection is available.
- Content does not violate platform rules.

The system should never depend exclusively on visual inspection.

---

# 25. REJECTION RULES

Rejection should require a reason.

Example:

```text
Reason:
- Wrong subject
- Duplicate
- Poor quality
- Invalid file
- Incomplete material
- Copyright concern
- Incorrect academic information
- Other
```

The exact taxonomy should be configurable.

---

# 26. REQUEST CHANGES

Sometimes content is useful but metadata is wrong.

Instead of rejecting it permanently:

```text
Changes Requested
```

The student can correct:

- title,
- subject,
- description,
- semester,
- file.

The submission returns to moderation.

---

# 27. PYQ MANAGEMENT

PYQs need more structured metadata than generic files.

Fields:

```text
exam_year
semester
subject
subject_code
course
branch
exam_type
paper_type
file
```

Possible exam types:

```text
University Examination
Mid Semester
Internal
Practical
Supplementary
Model Paper
```

---

# 28. PYQ DUPLICATE DETECTION

Before publishing a PYQ, check for likely duplicates based on:

- course,
- branch,
- semester,
- subject,
- year,
- title,
- file checksum where available.

Do not blindly reject based on title alone.

The same paper can legitimately exist in multiple file formats.

---

# 29. FEATURED RESOURCES

The admin should be able to mark selected resources as featured.

Do not create a separate duplicated resource record.

Use metadata such as:

```text
is_featured
featured_rank
featured_until
```

This allows temporary promotion.

Example:

```text
Most Downloaded
Exam Special
Recommended
New
```

Labels should be configurable.

---

# 30. RESOURCE ARCHIVING

Archive instead of deleting whenever historical data matters.

Archived resources:

- disappear from normal student search,
- remain available to administrators,
- preserve metadata,
- preserve audit history.

If a file must actually be removed from storage, ensure no active record depends on it.

---

# 31. QUIZ ADMINISTRATION

The Quiz module should support:

- Quiz creation
- Question creation
- Question bank
- Categories
- Difficulty
- Time limits
- Marks
- Negative marking
- Randomization
- Attempt limits
- Publication
- Scheduling
- Results

---

# 32. QUIZ LIFECYCLE

Recommended:

```text
Draft
↓
Review
↓
Published
↓
Active
↓
Closed
↓
Archived
```

A quiz should not become active simply because an admin accidentally toggled a switch.

---

# 33. QUESTION BANK

Question fields:

```text
question_text
question_type
options
correct_answer
explanation
difficulty
subject
topic
marks
negative_marks
status
```

Supported types may include:

- Single choice
- Multiple choice
- True/False
- Fill in the blank
- Assertion/Reason where required

The initial release can focus on single-choice MCQ while keeping the database extensible.

---

# 34. ANSWER SECURITY

Correct answers must not be delivered to the student frontend before submission.

Do not send:

```json
{
  "correctAnswer": "B"
}
```

to the browser during an active quiz.

The backend should perform grading or use a secure server-side mechanism.

---

# 35. QUIZ RESULT ADMIN VIEW

Admin should be able to inspect:

- Quiz
- Attempt count
- Average score
- Highest score
- Lowest score
- Completion rate
- Average time
- Question-level accuracy

Question-level analytics:

```text
Question 1
Correct: 82%
Wrong: 18%

Question 2
Correct: 41%
Wrong: 59%
```

This can identify difficult concepts.

---

# 36. ANNOUNCEMENTS

Announcements should support:

- Title
- Message
- Category
- Priority
- Publish date
- Expiry date
- Target audience
- Attachment
- Status

Target audience can include:

```text
All students
Specific course
Specific branch
Specific semester
```

---

# 37. NOTIFICATION SYSTEM

The Admin Panel should distinguish between:

### In-app announcements

Visible inside BEU BABA.

### Push notifications

Delivered through supported browser/PWA notification infrastructure.

### Important system alerts

Used for urgent academic information.

Do not send notifications for every small content update.

Notification fatigue reduces engagement.

---

# 38. NOTIFICATION COMPOSER

The admin interface should include:

```text
Title
Message
Audience
Priority
Schedule
Link
Preview
```

Before sending:

```text
Audience:
B.Tech CSE Semester 3

Estimated recipients:
1,284

[Cancel] [Send]
```

---

# 39. SCHEDULED NOTIFICATIONS

Support:

- Send now
- Schedule for later
- Cancel scheduled notification

Scheduled notification records should preserve:

- creator,
- target audience,
- message,
- schedule,
- execution status.

---

# 40. DEVELOPER MESSAGE SYSTEM

BEU BABA should allow students to directly message the developer/support team.

This is not a general social chat system.

It is a support/contact channel.

Each conversation should belong to a specific student.

Conceptually:

```text
Student A
   ↓
Conversation A
   ↓
Developer/Admin

Student B
   ↓
Conversation B
   ↓
Developer/Admin
```

Student A must never see Student B's messages.

---

# 41. SUPPORT INBOX

Admin inbox should show:

- Student
- Subject/category
- Last message
- Time
- Unread count
- Status
- Assigned admin

Statuses:

```text
Open
In Progress
Waiting for Student
Resolved
Closed
```

---

# 42. SUPPORT MESSAGE CATEGORIES

Recommended:

```text
Bug Report
Course Update
Syllabus Update
PYQ Issue
Resource Issue
Quiz Issue
Account Issue
Suggestion
Other
```

This makes support analytics useful.

---

# 43. SUPPORT REPLY RULES

An admin reply should:

- belong to the same conversation,
- be timestamped,
- record the sender,
- update unread state,
- optionally trigger a notification.

Do not expose internal admin notes to students.

---

# 44. INTERNAL ADMIN NOTES

Support conversations can have private notes.

Example:

```text
INTERNAL NOTE
Checked issue. Likely caused by stale cache.
```

This note must never appear in the student's message stream.

Use separate message visibility/type fields.

---

# 45. BUG REPORTS

Bug reports should capture:

- Student
- Description
- Category
- Device/browser if voluntarily provided
- App version
- Page/feature
- Screenshot attachment if uploaded
- Status
- Priority

Statuses:

```text
Reported
Confirmed
In Progress
Fixed
Released
Closed
Not Reproducible
Duplicate
```

---

# 46. BUG REPORT PRIORITY

Suggested:

```text
Critical
High
Medium
Low
```

Critical examples:

- Authentication broken for many users.
- Major data exposure.
- App unavailable.
- Content integrity failure.

Low examples:

- Small visual alignment issue.

---

# 47. SETTINGS MANAGEMENT

Global settings should be centralized.

Possible settings:

```text
App name
Support email
Developer name
Portfolio URL
Instagram URLs
Telegram URL
Default profile character behavior
Maintenance mode
Upload limits
Allowed file types
Quiz feature enabled
Student uploads enabled
Push notifications enabled
```

Sensitive infrastructure secrets must never be stored as normal client-readable configuration.

---

# 48. BEU BABA BRAND SETTINGS

Current product identity:

```text
App Name:
BEU BABA
```

Social links supplied for the application include:

```text
Instagram:
naturelensbyabhi
er_abhi2026

Portfolio:
erabhi.in
i-am-er-abhi.vercel.app

Telegram:
the supplied BEU BABA Telegram community link
```

These should be stored as configurable values rather than hard-coded across many frontend components.

This allows future changes from the Admin Panel.

---

# 49. DEVELOPER PROFILE

The application can have a developer/contact section.

It should contain:

- Developer name
- Short biography
- Portfolio links
- Social links
- Contact route
- Profile image if desired

The application should read these values from configuration.

Do not duplicate the same URL in:

- footer,
- settings,
- support,
- about,
- contact,

as separate hard-coded values.

Centralize them.

---

# 50. PROFILE CHARACTER MANAGEMENT

The student profile can use:

1. Uploaded personal image.
2. Auto-selected generated character based on selected gender.

The Admin Panel should manage the available character library.

Character record:

```text
id
name
gender_category
image_path
active
display_order
```

The client should receive only active character options.

Do not hard-code image URLs in frontend source files.

---

# 51. CHARACTER SELECTION RULES

If the user chooses a character:

```text
selected_character_id
```

If the user uploads a personal profile image:

```text
profile_image_path
```

The application can prioritize:

```text
profile image
↓
selected character
↓
default avatar
```

The exact rule should be documented and consistent.

---

# 52. ADMIN FEATURE FLAGS

Feature flags are useful for gradual releases.

Examples:

```text
quiz_enabled
student_uploads_enabled
support_enabled
calendar_enabled
new_home_enabled
experimental_search_enabled
```

A feature flag should be checked on the backend when security or access is involved.

Frontend feature flags are useful for UI control but should not be treated as authorization.

---

# 53. AUDIT LOGGING

Every significant administrative action should create an audit log.

Example:

```text
Admin:
Content Admin

Action:
PUBLISHED_RESOURCE

Entity:
Resource #4832

Timestamp:
2026-09-01 21:42

Metadata:
Status changed from approved → published
```

Audit logs should be append-oriented.

Do not allow ordinary admins to edit history.

---

# 54. AUDIT EVENT TYPES

Examples:

```text
ADMIN_LOGIN
ADMIN_LOGOUT
STUDENT_SUSPENDED
STUDENT_REACTIVATED
RESOURCE_CREATED
RESOURCE_UPDATED
RESOURCE_APPROVED
RESOURCE_REJECTED
RESOURCE_PUBLISHED
RESOURCE_ARCHIVED
SYLLABUS_CREATED
SYLLABUS_PUBLISHED
CALENDAR_UPDATED
QUIZ_CREATED
QUIZ_PUBLISHED
ANNOUNCEMENT_SENT
NOTIFICATION_SENT
SUPPORT_REPLY_SENT
SETTING_UPDATED
ADMIN_CREATED
ADMIN_ROLE_CHANGED
```

---

# 55. CHANGE HISTORY

For important records, provide a history panel.

Example:

```text
Version 3
Updated by Admin A
Today

Version 2
Updated by Admin B
2 days ago

Version 1
Created by Admin A
1 week ago
```

The admin should be able to compare versions where practical.

---

# 56. BULK ACTIONS

Tables should support selection.

Example:

```text
☐ Resource A
☐ Resource B
☐ Resource C

3 selected

[Approve]
[Archive]
[Export]
```

Bulk destructive actions must require explicit confirmation.

Do not place dangerous actions beside harmless actions without visual distinction.

---

# 57. SEARCH

Search should be contextual.

Students:

```text
name/email
```

Resources:

```text
title/subject/code
```

PYQs:

```text
subject/year/code
```

Support:

```text
student/category/message
```

Avoid one enormous global search implementation initially unless there is a real requirement.

---

# 58. FILTER SYSTEM

Useful filters:

```text
Status
Course
Branch
Semester
Subject
Date
Uploader
Resource type
Moderation state
```

Filters should be combinable.

Example:

```text
Course = B.Tech
Branch = CSE
Semester = 3
Status = Pending Review
```

---

# 59. PAGINATION

Never load thousands of records into the browser at once.

Use server-side pagination.

Support:

- page size,
- cursor pagination where appropriate,
- total count where useful,
- loading states.

For very large tables, cursor-based pagination is generally preferable.

---

# 60. FILE STORAGE ADMINISTRATION

The Admin Panel should show storage usage.

Metrics:

```text
Total storage used
Resource files
Student uploads
Profile images
Quiz attachments
Other files
```

The admin should be able to identify orphaned files.

---

# 61. ORPHAN FILES

An orphan file is a storage object that has no valid database reference.

Possible causes:

- failed upload,
- abandoned draft,
- deleted record,
- interrupted workflow.

A cleanup process can identify orphan objects.

Do not automatically delete immediately.

Use:

```text
Detected
↓
Grace period
↓
Review
↓
Delete
```

---

# 62. FILE VALIDATION

Allowed file types should be explicitly configured.

Potential types:

```text
PDF
JPG
JPEG
PNG
WEBP
DOC/DOCX if required
PPT/PPTX if required
XLS/XLSX if required
```

Do not allow arbitrary executable file types.

File size limits must be enforced.

Validation should occur before the file becomes publicly accessible.

---

# 63. FILE NAMING

Do not depend on user-provided filenames for storage identity.

Use generated object paths.

Example:

```text
resources/{resource_id}/{uuid}.pdf
```

This avoids collisions and reduces path manipulation risks.

Original filename can remain metadata.

---

# 64. PRIVATE VS PUBLIC STORAGE

Use private buckets for:

- student private profile images where appropriate,
- pending submissions,
- private support attachments,
- sensitive files.

Use public or controlled delivery only for content intentionally available to students.

For private content, use authenticated access or short-lived signed URLs.

---

# 65. ADMIN CONTENT PREVIEW

Admins need to preview files without making them public.

Therefore preview access should respect admin authorization.

A pending student resource must be reviewable by authorized moderators even if students cannot yet access it.

---

# 66. CONTENT PUBLICATION PIPELINE

Recommended architecture:

```text
Uploaded
   ↓
Validated
   ↓
Database record created
   ↓
Pending Review
   ↓
Approved
   ↓
Published
   ↓
Student-visible
```

Publication should be a deliberate state transition.

---

# 67. RLS AND ADMIN ACCESS

Supabase Row Level Security must remain enabled for sensitive tables.

Do not solve admin access by disabling RLS.

Instead:

- define authenticated access,
- define role checks,
- use secure server-side operations where necessary,
- minimize privileged paths.

The frontend must never receive a service-role key.

---

# 68. SERVICE ROLE KEY

The Supabase service-role key is highly privileged.

It must:

- never be embedded in frontend code,
- never be exposed through public environment variables,
- never be stored in a Git repository,
- never be sent to browsers.

Use server-side functions or trusted backend environments for privileged operations.

---

# 69. ADMIN ROUTE PROTECTION

The frontend may have:

```text
/admin
/admin/students
/admin/resources
/admin/settings
```

But route protection alone is insufficient.

Every data operation must independently verify authorization.

A malicious user should not gain access by manually typing:

```text
/admin/resources
```

or directly calling an API.

---

# 70. ADMIN SESSION MANAGEMENT

Admin sessions should support:

- secure authentication,
- session expiration,
- logout,
- optional reauthentication for critical operations.

Critical actions may require a recent authentication state.

Examples:

- changing another admin's role,
- disabling an admin,
- deleting critical data,
- changing security settings.

---

# 71. SECURITY EVENT MONITORING

Track suspicious behavior such as:

- repeated failed admin logins,
- unusual bulk deletions,
- rapid permission changes,
- repeated moderation actions,
- unexpected storage activity.

The first version does not need an enterprise SIEM, but audit records should make investigation possible.

---

# 72. CONTENT QUALITY CONTROL

Before publishing academic content, the admin should have a checklist.

Example:

```text
☑ Correct course
☑ Correct branch
☑ Correct semester
☑ Correct subject
☑ Correct year
☑ File opens correctly
☑ Title is correct
☑ No duplicate
☑ Appropriate category
```

This can be presented as a compact moderation checklist.

---

# 73. DRAFT AUTOSAVE

For long forms such as:

- syllabus,
- quiz,
- announcement,
- resource metadata,

autosave may be valuable.

But autosave should create a draft rather than silently publishing changes.

---

# 74. UNSAVED CHANGES PROTECTION

If the admin edits a form and attempts to leave:

```text
You have unsaved changes.

[Stay]
[Discard]
```

This prevents accidental data loss.

---

# 75. FORM VALIDATION

Validation should occur:

1. During input where possible.
2. Before submission.
3. On the backend/database.

Never rely solely on browser validation.

---

# 76. ERROR HANDLING

Errors should be actionable.

Bad:

```text
Something went wrong.
```

Better:

```text
The resource could not be published because its subject is missing.
```

For infrastructure failures:

```text
We couldn't complete the upload right now.
Your draft has been preserved.
Please try again.
```

Never expose raw database errors to normal administrators.

---

# 77. LOADING STATES

Every async admin action should have clear feedback.

Examples:

```text
Publishing...
Uploading...
Saving...
Sending...
Approving...
```

Buttons should prevent duplicate submission during an active request.

---

# 78. SUCCESS FEEDBACK

Use compact notifications:

```text
Resource published successfully.
```

Do not use intrusive full-screen modals for routine actions.

---

# 79. DELETE CONFIRMATION

For destructive operations:

```text
Archive resource?

This resource will no longer appear in normal student searches.

[Cancel]
[Archive]
```

For irreversible deletion:

```text
Delete permanently?

This action cannot be undone.

Type DELETE to confirm:
[________]

[Cancel] [Delete Permanently]
```

---

# 80. SOFT DELETE

Prefer soft deletion when possible.

Example fields:

```text
deleted_at
deleted_by
```

This provides recovery and auditability.

---

# 81. RESTORE

Archived/deleted content should have a restore path where technically safe.

Example:

```text
Resource archived.

[Restore]
```

Restoration should not automatically republish content if policy requires review.

---

# 82. ADMIN TABLE UX

The admin table should support:

- sticky header,
- compact rows,
- hover state,
- status badges,
- responsive horizontal scrolling,
- column visibility,
- search,
- filter chips.

Avoid excessive rounded cards everywhere.

The Admin Panel is an operational tool; clarity is more important than decoration.

---

# 83. ADMIN VISUAL LANGUAGE

BEU BABA's student application can use premium light glassmorphism.

The Admin Panel should use the same design language but with a more functional density.

Use:

- translucent white surfaces,
- subtle background gradients,
- thin borders,
- soft shadows,
- restrained blur,
- strong typography,
- clean iconography.

Avoid:

- black-heavy dashboards,
- neon RGB,
- cyberpunk aesthetics,
- unnecessary 3D backgrounds,
- excessive glowing effects,
- giant decorative objects.

---

# 84. GLASSMORPHISM RULES

Glass should be used as a material, not as decoration.

Recommended:

```css
background: rgba(255,255,255,0.68);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.65);
box-shadow: 0 12px 40px rgba(...);
```

Exact values should be established in the design token document.

The background should remain light.

Glass surfaces must maintain sufficient contrast.

---

# 85. ADMIN SIDEBAR

The sidebar should be:

- clean,
- compact,
- collapsible,
- responsive.

Active navigation should use a premium selected-state treatment inspired by the product's iOS-like navigation.

Example:

```text
Dashboard
Students
Academic
Resources
Quiz
Communication
Analytics
Settings
```

Active item can use:

- translucent pill,
- subtle border,
- soft highlight,
- icon emphasis.

Do not use loud gradients.

---

# 86. ADMIN TOP BAR

Top bar can contain:

- global search,
- notification indicator,
- admin avatar,
- role label,
- theme/system controls if needed.

Do not put too many controls in the header.

---

# 87. RESPONSIVE ADMIN PANEL

Desktop is the primary target.

Tablet:

- collapsible sidebar,
- responsive tables,
- drawer filters.

Mobile:

- bottom navigation or compact menu only if admin mobile use is expected,
- stacked cards,
- horizontal data tables,
- full-screen drawers.

The admin UI should not become unusable on smaller screens.

---

# 88. RESOURCE DETAIL DRAWER

For quick inspection, use a right-side drawer.

Example:

```text
Resource
──────────────
Title
Student
Subject
Status

Preview

[Approve]
[Reject]
```

This can be faster than navigating away from the queue.

---

# 89. COMMAND CENTER

A future enhancement can add a command palette.

Keyboard shortcut:

```text
Ctrl/Cmd + K
```

Actions:

```text
Search student
Open pending resources
Create quiz
Create announcement
Open support inbox
Go to syllabus
```

This should remain optional, not mandatory for MVP.

---

# 90. ANALYTICS DASHBOARD

Analytics should focus on decisions rather than vanity numbers.

Useful metrics:

### Users

- total registered,
- active,
- new users,
- retention.

### Content

- published resources,
- uploads,
- approvals,
- rejections.

### Quiz

- attempts,
- average score,
- completion rate.

### Support

- open conversations,
- response time,
- resolved issues.

### Storage

- total used,
- growth,
- file categories.

---

# 91. CONTENT ANALYTICS

Show:

```text
Most viewed resources
Most downloaded resources
Most bookmarked resources
Most searched subjects
Most requested syllabus
```

These can guide content priorities.

---

# 92. SEARCH ANALYTICS

If search analytics are implemented, record privacy-conscious aggregate events.

Examples:

```text
query
result_count
timestamp
course_context
```

Avoid collecting unnecessary sensitive information.

---

# 93. QUIZ ANALYTICS

Useful metrics:

```text
Attempts
Unique participants
Average score
Median score
Completion rate
Average duration
Question accuracy
```

Do not expose individual student results unnecessarily to analytics viewers.

---

# 94. SUPPORT ANALYTICS

Metrics:

- messages received,
- first response time,
- average resolution time,
- open tickets,
- closed tickets,
- category distribution.

This helps identify recurring problems.

---

# 95. ADMIN EXPORTS

Authorized admins may export selected data.

Possible exports:

- student directory,
- resource list,
- moderation history,
- quiz results,
- support statistics.

Exports should respect permission rules.

Sensitive exports should be audited.

---

# 96. CSV EXPORT SAFETY

When exporting spreadsheet-compatible data, protect against spreadsheet formula injection.

Values beginning with formula characters should be sanitized or escaped according to the export strategy.

---

# 97. BACKUP STRATEGY

Important production data must have backups.

At minimum:

- database backup strategy,
- storage backup strategy,
- migration history,
- configuration backup.

Do not assume that application code in Git is a backup of user-uploaded files.

---

# 98. MIGRATIONS

Database schema changes should be made through version-controlled migrations.

Never make random production schema changes manually without recording them.

Each migration should be:

- deterministic,
- reviewable,
- testable,
- documented.

---

# 99. SEED DATA

Development/staging should have seed data for:

- courses,
- branches,
- semesters,
- subjects,
- sample resources,
- sample quizzes,
- sample admin users.

Do not copy real student data into development casually.

---

# 100. STAGING ENVIRONMENT

Before major production changes:

```text
Development
↓
Staging
↓
Production
```

Test:

- RLS,
- migrations,
- uploads,
- publication workflow,
- notifications,
- quiz grading.

---

# 101. ADMIN QA TEST MATRIX

Every module should test:

### Authentication

- valid admin,
- invalid admin,
- student attempting admin route,
- disabled admin.

### Resources

- create,
- edit,
- approve,
- reject,
- publish,
- archive,
- restore.

### Student uploads

- valid upload,
- invalid type,
- oversized file,
- duplicate,
- rejection,
- resubmission.

### Quiz

- create,
- edit,
- publish,
- attempt,
- grading,
- result.

### Support

- student sends,
- admin receives,
- admin replies,
- student receives,
- other student cannot see.

---

# 102. RLS TESTING

Test authorization as a matrix.

Example:

| Action | Student | Moderator | Content Admin | Super Admin |
|---|---:|---:|---:|---:|
| View public resources | Yes | Yes | Yes | Yes |
| Approve submission | No | Yes | Yes if granted | Yes |
| Publish syllabus | No | No | Yes | Yes |
| Manage admins | No | No | No | Yes |
| Read private support conversation | Own | Assigned/authorized | Assigned/authorized | Yes |
| Change global settings | No | No | Limited | Yes |

Exact policy implementation belongs in the backend architecture.

---

# 103. ADMIN MESSAGE PRIVACY

Support messages are private.

A student can access only conversations where:

```text
conversation.student_id = authenticated_user_id
```

An admin can access only according to role/assignment.

The client must never fetch all support conversations and hide unauthorized ones in JavaScript.

Authorization must happen at the data layer.

---

# 104. MODERATION PRIVACY

A moderator may need to see uploader identity.

However, unnecessary private student information should not be displayed.

Show only information required to moderate.

---

# 105. AUDIT PRIVACY

Audit logs can contain sensitive operational information.

Therefore:

- limit access,
- avoid exposing unnecessary PII,
- redact secrets,
- preserve immutable history.

---

# 106. ADMIN NOTIFICATION CENTER

The admin should receive internal alerts for:

- new resource submission,
- new bug report,
- new support message,
- urgent report,
- system error.

The notification center should support:

```text
Unread
Read
All
```

---

# 107. PRIORITY SYSTEM

Operational records should have priority.

Example:

```text
Critical
High
Normal
Low
```

Use color sparingly and do not rely on color alone.

Icons/text should communicate priority.

---

# 108. ADMIN HOME QUICK ACTIONS

Recommended quick actions:

```text
Add Resource
Add PYQ
Create Quiz
Add Syllabus
Add Calendar Event
Send Announcement
Open Moderation Queue
Open Support Inbox
```

Quick actions should open focused forms.

---

# 109. EMPTY STATES

Good empty states:

```text
No pending submissions

All student uploads have been reviewed.
```

Not:

```text
No data.
```

Empty states can include a useful action.

---

# 110. ERROR EMPTY STATES

Differentiate:

```text
No records found
```

from:

```text
Unable to load records
```

The first is a valid state.

The second is an error.

---

# 111. ADMIN PERFORMANCE

The dashboard should not load every dataset on initial render.

Use:

- lazy loading,
- server-side aggregation,
- pagination,
- cached summary metrics,
- selective queries.

A dashboard with 20 charts that each executes expensive queries is poor architecture.

---

# 112. DATABASE INDEXING

Index fields commonly used for:

- status,
- course_id,
- branch_id,
- semester_id,
- subject_id,
- created_at,
- uploaded_by,
- published_at.

Composite indexes should be based on actual query patterns.

Do not create indexes blindly on every column.

---

# 113. TRANSACTIONS

Use database transactions for multi-step state changes where consistency matters.

Example publication:

```text
Update resource status
+
Create publication audit event
+
Update published_at
```

These operations should not leave the resource half-published.

---

# 114. CONCURRENCY

Two admins may review the same resource.

The system should handle:

```text
Admin A opens submission
Admin B opens same submission
Admin A approves
Admin B tries to reject
```

The backend should reject stale transitions or safely resolve them.

Use status conditions/versioning as appropriate.

---

# 115. OPTIMISTIC UI

Optimistic updates may be used for low-risk interactions.

For high-risk operations:

- approval,
- publication,
- deletion,
- permission changes,

wait for server confirmation before showing final state.

---

# 116. ADMIN MOBILE NOTIFICATIONS

If administrators receive push notifications, notifications should be useful.

Example:

```text
12 new resources are waiting for review.
```

Instead of:

```text
New resource.
New resource.
New resource.
```

Batch related events where practical.

---

# 117. BULK MODERATION

Bulk moderation can be useful.

Example:

```text
10 selected

[Approve All]
```

But the interface should clearly communicate that all selected items will become visible to students.

For sensitive content, batch actions may require an additional confirmation.

---

# 118. CONTENT PREVIEW BEFORE PUBLISH

For syllabus, announcements, and major resources, include a preview.

Example:

```text
Student Preview

[content exactly as students will see it]
```

This prevents formatting mistakes.

---

# 119. STUDENT-FACING PREVIEW

Admin should be able to inspect:

- title,
- thumbnail,
- category,
- metadata,
- download/open action.

The preview should resemble the real student interface.

---

# 120. HOMEPAGE CONTENT CONTROL

Future Admin Panel can control:

- featured resources,
- announcements,
- exam alerts,
- quick links,
- recommended quizzes.

But avoid turning the homepage into an advertisement board.

The student experience should remain academic-first.

---

# 121. RESOURCE RECOMMENDATION CONTROL

Admins can optionally mark resources:

```text
Recommended
Exam Important
New
Popular
```

These labels should be metadata.

Do not manually duplicate the resource in multiple tables.

---

# 122. ACADEMIC CHANGE REQUESTS

Students can send requests:

```text
Please update Semester 4 syllabus.
```

The admin should be able to convert a request into an operational task.

Example:

```text
Request #481
Category: Syllabus
Status: Open

[Assign]
[Resolve]
```

---

# 123. REQUEST TRACKING

Each request should have:

- requester,
- category,
- description,
- status,
- assigned admin,
- created time,
- resolution note.

This prevents support messages from disappearing into an unstructured inbox.

---

# 124. CONTACT DEVELOPER FLOW

Student:

```text
Contact Developer
↓
Choose category
↓
Write message
↓
Attach screenshot optionally
↓
Send
```

Admin:

```text
Inbox
↓
Open conversation
↓
Reply
↓
Resolve
```

Student sees only their own conversation.

---

# 125. ATTACHMENT SECURITY

Support attachments should:

- have size limits,
- have permitted file types,
- use generated storage paths,
- be access-controlled,
- not become globally public accidentally.

---

# 126. RESOURCE REPORTING

Students should be able to report problematic resources.

Reasons:

```text
Wrong content
Wrong subject
Duplicate
Broken file
Incorrect information
Inappropriate
Other
```

Reported resources should appear in moderation.

---

# 127. REPORT WORKFLOW

```text
Student reports resource
↓
Report created
↓
Moderator reviews
↓
Keep
↓
Update
↓
Archive
↓
Reject report
```

A resource should not automatically disappear after one report unless a policy explicitly requires automatic removal.

---

# 128. REPORT ABUSE PROTECTION

A user should not be able to generate unlimited reports cheaply.

Consider:

- rate limits,
- duplicate report suppression,
- report cooldown,
- abuse detection.

---

# 129. CONTENT OWNERSHIP

Every resource should record who submitted or created it.

Possible source:

```text
admin
student
system
import
```

This helps moderation and audit.

---

# 130. IMPORT SYSTEM

If academic data is initially extracted from an existing application or source, import it through a controlled process.

Do not directly dump unverified data into production.

Use:

```text
Raw Import
↓
Validation
↓
Mapping
↓
Review
↓
Publish
```

---

# 131. IMPORT VALIDATION

Check:

- duplicate subject,
- invalid branch,
- missing semester,
- invalid year,
- broken file,
- invalid URL,
- missing title.

Generate an import report:

```text
Imported: 842
Warnings: 17
Errors: 3
Duplicates: 22
```

---

# 132. DATA CORRECTION

Admins should be able to correct imported data.

Corrections must create audit history.

---

# 133. ADMIN API DESIGN

The frontend should not contain business logic that belongs to the backend.

Example:

Bad:

```text
if admin then publish
```

only in React.

Better:

```text
Frontend requests publication
↓
Backend verifies authenticated user
↓
Backend verifies permission
↓
Backend validates state
↓
Backend performs transaction
↓
Backend returns result
```

---

# 134. RPC / SERVER FUNCTION USE

For sensitive multi-step operations, server-side database functions or secure server endpoints can be appropriate.

Examples:

- publish resource,
- approve submission,
- suspend user,
- send notification,
- finalize quiz,
- modify admin role.

---

# 135. API RESPONSE DESIGN

Return structured results.

Example:

```json
{
  "success": true,
  "resource_id": "...",
  "status": "published"
}
```

Errors should have stable application codes.

Example:

```json
{
  "success": false,
  "code": "RESOURCE_STATE_CONFLICT",
  "message": "This resource was already published."
}
```

---

# 136. IDEMPOTENCY

Important operations should avoid duplicate effects if the request is retried.

Especially:

- notifications,
- publication,
- bulk actions,
- file processing.

A network retry should not send the same critical notification twice.

---

# 137. RATE LIMITING

Potential rate limits:

- admin login attempts,
- student uploads,
- support messages,
- reports,
- notification sending,
- bulk operations.

Rate limits should be enforced server-side.

---

# 138. ADMIN ACTION CONFIRMATION MATRIX

| Action | Confirmation |
|---|---|
| Save draft | No |
| Approve resource | Optional |
| Publish resource | Yes/strong feedback |
| Send notification | Yes |
| Archive | Yes |
| Permanent delete | Typed confirmation |
| Change admin role | Yes |
| Disable admin | Yes |
| Suspend student | Yes |
| Restore | Optional |

---

# 139. ADMIN UX ANIMATION

Animation should be subtle and purposeful.

Use:

- page fade/slide,
- drawer transitions,
- table row insertion,
- status transitions,
- button loading,
- toast appearance.

Avoid:

- bouncing dashboards,
- excessive parallax,
- rotating 3D objects,
- neon effects,
- animated backgrounds.

The admin interface is a productivity tool.

---

# 140. GLASS MATERIAL HIERARCHY

Use three primary surfaces:

### Level 1 — Base

Light background.

### Level 2 — Glass panel

For cards and sections.

### Level 3 — Elevated glass

For:

- drawers,
- dialogs,
- dropdowns,
- popovers.

Do not make every nested element equally translucent.

---

# 141. TYPOGRAPHY

Use a modern system font stack.

Prioritize:

- readable headings,
- compact metadata,
- clear numbers,
- accessible line height.

Do not use decorative fonts for administrative content.

---

# 142. ICONOGRAPHY

Use one consistent icon family.

Icons should:

- have consistent stroke weight,
- communicate meaning,
- include accessible labels where needed.

Do not use random emoji as primary admin icons.

---

# 143. ACCESSIBILITY

Admin Panel must support:

- keyboard navigation,
- visible focus,
- semantic controls,
- accessible labels,
- sufficient contrast,
- reduced-motion preference,
- screen-reader-friendly tables.

Glassmorphism must not compromise readability.

---

# 144. REDUCED MOTION

If a user has enabled reduced motion:

- disable large transitions,
- reduce blur animation,
- remove decorative movement,
- preserve functional feedback.

---

# 145. DARK MODE

The primary BEU BABA design direction is light premium glass.

If dark mode is ever added, it should be a separate deliberate design system.

Do not automatically invert the light glass UI and call it finished.

---

# 146. ADMIN SETTINGS AUDIT

Changing important settings should create an audit record.

Example:

```text
student_uploads_enabled
Old: true
New: false
Changed by: Super Admin
Time: ...
```

---

# 147. MAINTENANCE MODE

Maintenance mode should be used carefully.

When enabled:

Student:

```text
BEU BABA is temporarily under maintenance.
Please try again shortly.
```

Admin:

```text
Maintenance mode active
```

Super Admin should be able to disable it.

---

# 148. SYSTEM HEALTH

Admin dashboard can show:

```text
Database
Storage
Authentication
Notifications
```

Statuses:

```text
Operational
Degraded
Unavailable
```

Do not claim a service is operational unless the system actually checks it.

---

# 149. LOGGING

Application logs should help diagnose:

- upload failures,
- notification failures,
- database errors,
- authentication problems.

Never log:

- passwords,
- service keys,
- access tokens,
- private message content unnecessarily.

---

# 150. DATA RETENTION

Define retention rules for:

- audit logs,
- support conversations,
- rejected uploads,
- deleted resources,
- notification history.

Retention should balance operational needs with privacy and storage costs.

---

# 151. ADMIN ACCOUNT CREATION

Creating an admin should require:

- existing authorized admin,
- email,
- role,
- activation state.

Do not allow arbitrary public registration as admin.

---

# 152. ADMIN ROLE CHANGE

Changing a role is a security-sensitive action.

Workflow:

```text
Select admin
↓
Current role shown
↓
New role
↓
Permission summary
↓
Confirm
↓
Audit event
```

---

# 153. ADMIN DEACTIVATION

Prefer disabling rather than deleting an admin account.

Preserve their historical audit actions.

Example:

```text
Admin status:
Inactive
```

Historical logs remain:

```text
Changed by: Former Admin
```

---

# 154. SUPPORT ASSIGNMENT

Conversations can be assigned to admins.

Example:

```text
Assigned to:
Support Admin A
```

The system can optionally notify the assigned admin.

---

# 155. INTERNAL TASK STATE

Support or moderation tasks may have:

```text
Unassigned
Assigned
In Progress
Waiting
Resolved
Closed
```

This is separate from message delivery.

---

# 156. MODERATION SLA

Future enhancement:

Track how long submissions remain pending.

Example:

```text
Pending for 18 hours
```

Sort oldest first when needed.

---

# 157. CONTENT EXPIRATION

Some content may have an expiration date.

Example:

```text
Exam Alert
Valid until 20 September
```

Expired content should automatically stop being featured.

This does not necessarily mean delete it.

---

# 158. SCHEDULED PUBLICATION

Useful for:

- announcements,
- quizzes,
- exam alerts,
- calendar notices.

Workflow:

```text
Draft
↓
Scheduled
↓
Automatically Published
```

The scheduler must be server-side.

---

# 159. TIMEZONE

Store timestamps consistently.

Display them according to the intended application timezone.

Academic event dates should distinguish between:

- date-only values,
- date-time values.

Do not accidentally shift a date-only examination date because of timezone conversion.

---

# 160. DATE VALIDATION

Calendar events should prevent obvious invalid ranges:

```text
end_date < start_date
```

For exams, allow date-only where appropriate.

---

# 161. NOTIFICATION AUDIENCE PREVIEW

Before sending:

```text
Target:
B.Tech → CSE → Semester 3

Recipients:
1,284

Estimated delivery:
1,284
```

This reduces mistakes.

---

# 162. NOTIFICATION HISTORY

Admin should see:

```text
Sent
Scheduled
Cancelled
Failed
```

Each notification record should preserve target and message.

---

# 163. FAILED NOTIFICATIONS

If delivery fails, record the failure reason where available.

Do not silently mark everything as sent.

---

# 164. CONTENT DEPENDENCIES

Before archiving a subject, check dependencies:

```text
12 resources
4 quizzes
2 syllabus records
```

Show:

```text
This subject has active content.

Archiving it may affect these records.
```

This is much safer than silently breaking relationships.

---

# 165. CASCADE DELETE POLICY

Avoid dangerous cascade deletion for academic entities.

Deleting a subject should not automatically delete:

- resources,
- quiz questions,
- student attempts,
- historical syllabus records.

Prefer archive/deactivation.

---

# 166. FOREIGN KEY INTEGRITY

Use database constraints wherever practical.

Examples:

- resource → subject,
- subject → semester,
- semester → branch,
- branch → course.

The database should prevent impossible relationships.

---

# 167. CONTENT STATUS CONSISTENCY

A resource cannot be:

```text
archived
AND
student-visible
```

The backend should enforce valid states.

---

# 168. ADMIN DASHBOARD DATA REFRESH

Use a sensible refresh strategy.

Possible:

- automatic refresh for moderation count,
- realtime updates for support inbox,
- manual refresh for expensive analytics.

Do not poll every database table every few seconds.

---

# 169. REALTIME SUPPORT

Realtime is particularly useful for:

- support messages,
- unread counts,
- moderation queue updates.

When a new student message arrives:

```text
Admin inbox count +1
```

The admin should not need to refresh manually.

---

# 170. REALTIME SECURITY

Realtime subscriptions must respect authorization.

Never subscribe an admin client to all private messages simply because it is convenient.

---

# 171. RESOURCE PREVIEW PERFORMANCE

Large PDFs should not be downloaded unnecessarily.

Use:

- browser preview,
- signed access,
- appropriate caching,
- thumbnails.

Admin review should feel immediate.

---

# 172. THUMBNAILS

Resources can have generated or uploaded thumbnails.

Recommended hierarchy:

```text
custom thumbnail
↓
generated PDF preview
↓
category fallback
```

Thumbnail metadata should be stored separately from the main file metadata where useful.

---

# 173. FILE PROCESSING

If automatic thumbnail generation is introduced, process it asynchronously.

Do not make the admin wait for a heavy conversion inside the main HTTP request.

Workflow:

```text
Upload
↓
Storage
↓
Job
↓
Thumbnail generation
↓
Metadata update
```

---

# 174. ADMIN RESOURCE EDITOR

The resource editor should include:

```text
Title
Description
Type
Course
Branch
Semester
Subject
Academic Year
Tags
Thumbnail
File
Visibility
Status
```

Separate required fields from optional fields.

---

# 175. TAGGING

Tags can improve search.

Examples:

```text
important
exam
unit-1
unit-2
revision
lab
```

Do not allow uncontrolled tag chaos.

Admin may manage suggested tags.

---

# 176. RESOURCE QUALITY SCORE

A future system can calculate internal quality indicators.

Example:

```text
Metadata complete
File valid
Preview available
Student reports
Download activity
```

Do not expose arbitrary quality scores to students unless validated.

---

# 177. DUPLICATE RESOURCE HANDLING

If a duplicate is found:

```text
Possible duplicate detected

Existing:
DBMS PYQ 2025

New:
DBMS University Paper 2025
```

Admin can:

- merge metadata,
- keep both,
- reject,
- archive one.

---

# 178. MERGE OPERATIONS

If resource merging is introduced, preserve:

- original IDs,
- references,
- audit records.

Never destroy historical traceability during merge.

---

# 179. QUIZ QUESTION VERSIONING

Published questions should be treated carefully.

If an answer changes after students have attempted a quiz, historical results can become inconsistent.

Therefore either:

- version the question,
- freeze the quiz question snapshot,
- or preserve the exact question/answer state used for each attempt.

---

# 180. QUIZ PUBLICATION SAFETY

Before publishing:

```text
Question count > 0
All questions valid
Every question has correct answer
Marks valid
Time limit valid
```

Display validation errors before allowing publication.

---

# 181. QUIZ DRAFT PREVIEW

Admin should be able to play the quiz as a preview.

This helps catch:

- wrong options,
- missing answers,
- formatting errors,
- confusing ordering.

---

# 182. STUDENT RESULT CARD

Quiz results can generate downloadable/shareable result cards as part of the student feature.

Admin does not need to manually generate every card.

The backend should provide trusted result data.

---

# 183. RESULT INTEGRITY

A student should not be able to modify their score through frontend manipulation.

Results should be derived from trusted server-side data.

---

# 184. ADMIN QUIZ REGRADING

If a question is found to be incorrect, admin may need to regrade affected attempts.

This must be a controlled operation.

Workflow:

```text
Identify incorrect question
↓
Review affected quiz
↓
Define correction
↓
Calculate impact
↓
Apply regrade
↓
Audit event
```

---

# 185. ACADEMIC DATA IMPORT VERSIONING

Imported datasets should have:

```text
source
import batch ID
import timestamp
mapping version
```

This helps diagnose incorrect imported content.

---

# 186. ADMIN CONTENT CALENDAR

A future operations calendar can show:

- scheduled announcements,
- quiz launches,
- syllabus updates,
- calendar events.

This can help prevent conflicting releases.

---

# 187. RELEASE CHECKLIST

Before a major academic update:

```text
☐ Correct course
☐ Correct branch
☐ Correct semester
☐ Correct subject
☐ Correct year
☐ Files tested
☐ Preview checked
☐ Old version preserved
☐ Notification reviewed
☐ Publish time confirmed
```

---

# 188. EMERGENCY CONTENT UNPUBLISH

Super Admin should have an emergency action:

```text
Unpublish
```

This should immediately remove student visibility while preserving data.

Use only for:

- incorrect academic information,
- harmful content,
- broken content,
- serious policy issues.

Audit the action.

---

# 189. EMERGENCY COMMUNICATION

If incorrect information was published, admin can:

1. Unpublish it.
2. Correct it.
3. Publish corrected version.
4. Send correction notification.

This is much better than silently editing history.

---

# 190. CHANGE ANNOUNCEMENTS

For important syllabus/calendar changes, support:

```text
What changed?
Why?
Effective from?
```

Students can receive a concise change summary.

---

# 191. DATA CONSISTENCY CHECKER

A future admin tool can scan for:

- resources pointing to archived subjects,
- missing files,
- missing thumbnails,
- invalid semester mappings,
- duplicate PYQs,
- published resources without valid metadata.

Display:

```text
Integrity Check

3 warnings
0 critical errors
```

---

# 192. ADMIN COMMAND SAFETY

Avoid hidden dangerous commands.

If a maintenance function exists, it should:

- require correct permission,
- clearly describe impact,
- log execution,
- provide results.

---

# 193. DATABASE MAINTENANCE

Admin should not directly run arbitrary SQL from the production UI.

If a maintenance console is ever built, it should be restricted to technical administrators and strongly protected.

For normal operations, use predefined safe actions.

---

# 194. SEPARATION OF PRODUCTION AND DEVELOPMENT

Never let the admin accidentally point a production UI at development data or vice versa.

Environment configuration should be explicit.

---

# 195. ENVIRONMENT LABEL

For non-production deployments, show a small label:

```text
STAGING
```

This prevents accidental publishing to the wrong environment.

Production should not display confusing development labels.

---

# 196. ADMIN DESIGN TOKENS

Create shared tokens for:

```text
glass surface
border
shadow
radius
spacing
text
muted text
success
warning
error
info
```

Do not define arbitrary values in every component.

---

# 197. COMPONENT LIBRARY

Admin components should include:

```text
AdminShell
Sidebar
Topbar
MetricCard
DataTable
StatusBadge
FilterBar
SearchInput
Drawer
Modal
ConfirmDialog
Toast
FilePreview
ResourceReview
QuizEditor
QuestionEditor
SupportInbox
AuditTimeline
```

Build reusable components.

---

# 198. DATA TABLE COMPONENT

The table should support:

- loading,
- empty,
- error,
- pagination,
- sorting,
- selection,
- responsive layout.

This component can be reused across:

- students,
- resources,
- quizzes,
- reports.

---

# 199. DRAWER COMPONENT

Drawers are useful for:

- quick details,
- moderation,
- student profile,
- support conversation.

Do not use drawers for complex multi-step workflows where a dedicated page is clearer.

---

# 200. MODAL COMPONENT

Use modal for:

- confirmation,
- small forms,
- quick actions.

Avoid putting huge editors inside small modals.

---

# 201. ADMIN DESIGN PRINCIPLE

The interface should feel like:

> **A premium Apple-inspired operational workspace for managing an academic platform.**

It should not feel like:

- a generic Bootstrap dashboard,
- a gaming dashboard,
- a crypto dashboard,
- an AI startup dashboard,
- a dark SaaS template.

---

# 202. STUDENT VS ADMIN VISUAL DIFFERENCE

Student app:

- more spacious,
- more visual,
- stronger discovery,
- premium glass,
- course cards,
- smooth navigation.

Admin panel:

- more information density,
- clearer tables,
- operational status,
- fewer decorative animations,
- faster workflows.

Both should share the same brand DNA.

---

# 203. ADMIN ROUTE MAP

Recommended route structure:

```text
/admin
/admin/students
/admin/students/:id

/admin/academic/courses
/admin/academic/branches
/admin/academic/semesters
/admin/academic/subjects
/admin/academic/syllabus
/admin/academic/calendar

/admin/resources
/admin/resources/:id
/admin/resources/submissions
/admin/resources/reports

/admin/quizzes
/admin/quizzes/new
/admin/quizzes/:id
/admin/questions
/admin/quiz-attempts

/admin/communication/announcements
/admin/communication/notifications
/admin/communication/messages
/admin/communication/bugs

/admin/analytics
/admin/settings
/admin/security/admins
/admin/security/roles
/admin/security/audit
```

---

# 204. FRONTEND STATE MANAGEMENT

Use local state for simple forms.

Use a server-state solution or disciplined data fetching strategy for:

- tables,
- caches,
- mutations,
- pagination.

Avoid duplicating server data in many unrelated global stores.

---

# 205. CACHE INVALIDATION

After:

```text
Publish resource
```

invalidate/update:

- resource list,
- moderation queue,
- dashboard count,
- relevant student-facing cache.

A successful mutation should not leave stale admin data.

---

# 206. OFFLINE ADMIN

Full offline admin is not recommended.

Some draft forms can potentially use local persistence.

But critical operations must require online confirmation.

---

# 207. SECURITY CHECKLIST

Before production:

```text
☐ RLS enabled
☐ Admin role verified server-side
☐ Service key hidden
☐ File access protected
☐ Private messages isolated
☐ Upload validation enabled
☐ Rate limits enabled
☐ Audit logging enabled
☐ Admin accounts controlled
☐ Destructive actions protected
☐ Secrets absent from frontend
☐ Production environment verified
```

---

# 208. PRIVACY CHECKLIST

```text
☐ Collect only required student information
☐ Avoid exposing unnecessary contact data
☐ Restrict admin visibility by role
☐ Protect support conversations
☐ Protect private attachments
☐ Avoid sensitive information in logs
☐ Provide appropriate account controls
☐ Define data retention
```

---

# 209. MODERATION CHECKLIST

```text
☐ Submission status
☐ File validation
☐ Metadata validation
☐ Duplicate check
☐ Preview
☐ Approve
☐ Reject
☐ Request changes
☐ Moderation note
☐ Audit record
```

---

# 210. PRODUCTION READINESS CHECKLIST

## Authentication

- [ ] Student login tested
- [ ] Admin login tested
- [ ] Role checks tested
- [ ] Suspended accounts tested
- [ ] Logout tested

## Academic

- [ ] Course CRUD tested
- [ ] Branch CRUD tested
- [ ] Semester CRUD tested
- [ ] Subject CRUD tested
- [ ] Syllabus versioning tested
- [ ] Calendar tested

## Resources

- [ ] Upload tested
- [ ] Moderation tested
- [ ] Publication tested
- [ ] Archive tested
- [ ] Restore tested
- [ ] Storage access tested

## Quiz

- [ ] Question creation tested
- [ ] Publication validation tested
- [ ] Grading tested
- [ ] Attempt integrity tested
- [ ] Results tested

## Communication

- [ ] Announcement tested
- [ ] Notification tested
- [ ] Support messaging tested
- [ ] Private conversation isolation tested
- [ ] Bug report tested

## Security

- [ ] RLS policies tested
- [ ] Admin permissions tested
- [ ] Service key protected
- [ ] Audit logs verified
- [ ] Rate limiting tested

---

# 211. MVP ADMIN PANEL

The first production release should prioritize:

### Must have

1. Admin authentication.
2. Role system.
3. Dashboard.
4. Student list.
5. Course/branch/semester/subject management.
6. Syllabus management.
7. Calendar management.
8. Resource management.
9. Student upload moderation.
10. PYQ management.
11. Quiz management.
12. Support messages.
13. Announcements.
14. Basic notifications.
15. Audit logs.
16. Storage controls.
17. Settings.

### Can come later

- Advanced analytics.
- Command palette.
- sophisticated duplicate detection.
- automatic document processing.
- advanced scheduling.
- data integrity scanner.
- automated moderation assistance.

---

# 212. DO NOT OVERBUILD THE FIRST VERSION

The Admin Panel should be advanced internally but not unnecessarily complicated visually.

A common mistake is building:

```text
100 charts
50 filters
20 dashboards
```

before there is enough data to justify them.

Build strong foundations first.

---

# 213. RECOMMENDED DEVELOPMENT ORDER

```text
PHASE 1
Admin authentication
↓
Role/permission system
↓
Admin shell
↓
Dashboard

PHASE 2
Academic hierarchy
↓
Courses
↓
Branches
↓
Semesters
↓
Subjects

PHASE 3
Syllabus
↓
Calendar
↓
Resources
↓
PYQs

PHASE 4
Student uploads
↓
Moderation
↓
Reports
↓
Audit

PHASE 5
Quiz
↓
Question bank
↓
Attempts
↓
Analytics

PHASE 6
Support
↓
Developer messages
↓
Bug reports

PHASE 7
Notifications
↓
Settings
↓
Feature flags

PHASE 8
Advanced analytics
↓
Integrity tools
↓
Operational automation
```

---

# 214. FINAL ARCHITECTURAL RULES

These rules should be treated as strict.

### Rule 1

The frontend is never the final authority for permissions.

### Rule 2

Published academic content must have a traceable state.

### Rule 3

Important content changes should preserve history.

### Rule 4

Student submissions must pass moderation before public visibility.

### Rule 5

Private student messages must remain private to the relevant conversation.

### Rule 6

Admin actions must be auditable.

### Rule 7

Service credentials must never reach the browser.

### Rule 8

Storage objects and database records must remain consistent.

### Rule 9

Destructive operations should prefer archive/soft delete.

### Rule 10

Critical academic entities should not be casually deleted.

### Rule 11

Notifications must be targeted and deliberate.

### Rule 12

The Admin Panel should prioritize productivity over visual spectacle.

### Rule 13

The BEU BABA light glassmorphism identity should remain consistent.

### Rule 14

Animations should communicate state, not decorate every interaction.

### Rule 15

Every production workflow must have a clear error state.

### Rule 16

Every important user-generated content workflow must have moderation and reporting capability.

### Rule 17

Versioning must be used wherever historical academic accuracy matters.

### Rule 18

Admin roles must follow least privilege.

### Rule 19

Backend validation is mandatory even when frontend validation exists.

### Rule 20

No feature is considered production-ready until authorization, error handling, auditability, and failure recovery are considered.

---

# 215. COMPLETE ADMIN WORKFLOW EXAMPLE

A student uploads a new CSE Semester 3 DBMS PYQ.

```text
Student
  ↓
Select Upload Resource
  ↓
Select:
Course = B.Tech
Branch = CSE
Semester = 3
Subject = DBMS
Type = PYQ
Year = 2025
  ↓
Upload PDF
  ↓
Storage validation
  ↓
Database submission
  ↓
Status = pending_review
  ↓
Moderator receives notification
  ↓
Moderator opens review drawer
  ↓
PDF preview
  ↓
Checks metadata
  ↓
Checks duplicate
  ↓
Approves
  ↓
Audit log created
  ↓
Status = approved
  ↓
Admin/system publishes
  ↓
Status = published
  ↓
Student-facing resource index updates
  ↓
Resource becomes visible
  ↓
Search index/cache updates
  ↓
Analytics begins tracking
```

This is the type of end-to-end thinking required throughout BEU BABA.

---

# 216. COMPLETE SYLLABUS CHANGE EXAMPLE

Suppose a university updates Semester 4 CSE syllabus.

Admin:

```text
Academic
↓
Syllabus
↓
B.Tech
↓
CSE
↓
Semester 4
↓
Create New Version
```

System:

```text
Current:
Version 1
Published

New:
Version 2
Draft
```

Admin uploads the new file.

Checks:

```text
☑ Correct branch
☑ Correct semester
☑ Correct academic year
☑ File opens
☑ New version identified
```

Admin publishes.

System:

```text
Version 1 → Archived
Version 2 → Published
```

Audit:

```text
SYLLABUS_PUBLISHED
```

Optional announcement:

```text
Semester 4 CSE syllabus has been updated.
```

This workflow protects academic history while keeping students current.

---

# 217. COMPLETE SUPPORT WORKFLOW EXAMPLE

Student:

```text
Contact Developer
Category: Bug Report

"Quiz result is not showing."
```

System:

```text
Conversation created
Status = Open
```

Admin:

```text
Support Inbox
↓
Open conversation
↓
Review student message
↓
Reply
```

Student sees:

```text
Developer:
Thanks for reporting this. We are checking the issue.
```

Admin may add:

```text
Internal note:
Issue reproduced on mobile browser.
```

Student cannot see the internal note.

After fixing:

```text
Status = Resolved
```

Student receives notification if enabled.

---

# 218. COMPLETE MODERATION WORKFLOW EXAMPLE

Student uploads a PDF.

The system checks:

```text
File size valid
File extension valid
Storage upload successful
Metadata valid
```

Submission becomes:

```text
pending_review
```

Moderator sees it.

Moderator notices wrong semester.

Instead of rejection:

```text
Request Changes
```

Reason:

```text
Please select Semester 4 instead of Semester 3.
```

Student updates.

Submission returns:

```text
pending_review
```

Moderator approves.

This creates a better user experience than forcing the student to start again.

---

# 219. COMPLETE ADMIN SECURITY MODEL

The security chain should conceptually be:

```text
User
 ↓
Authentication
 ↓
Authenticated identity
 ↓
Role lookup
 ↓
Permission check
 ↓
Resource ownership/context check
 ↓
Input validation
 ↓
State validation
 ↓
Database operation
 ↓
Audit event
 ↓
Response
```

Skipping the middle layers creates security weaknesses.

---

# 220. FINAL IMPLEMENTATION PRINCIPLE

BEU BABA should be treated as a continuously maintained academic platform.

The student application is only one side.

The Admin Panel is the operational engine behind it.

The final system should make it easy for an authorized administrator to answer:

- What content is currently published?
- What changed recently?
- What needs review?
- Which students need support?
- Which resources are being reported?
- Which syllabus is current?
- Which calendar is active?
- Which quizzes are running?
- What is failing?
- Who changed something?
- Can the change be reversed?
- Are students seeing the correct information?

If the Admin Panel can answer these questions quickly and safely, BEU BABA can remain maintainable as the amount of academic content and number of students grows.

The target is not merely:

> **"An admin dashboard."**

The target is:

> **"A secure, versioned, auditable academic content operations system that controls the BEU BABA student experience."**

---

# APPENDIX A — ADMIN MODULE MASTER LIST

```text
01 Authentication
02 Roles
03 Permissions
04 Dashboard
05 Students
06 Student Details
07 Student Status
08 Courses
09 Branches
10 Semesters
11 Subjects
12 Syllabus
13 Syllabus Versions
14 Academic Calendar
15 Resources
16 PYQs
17 Student Uploads
18 Moderation
19 Reports
20 Featured Content
21 Quiz Dashboard
22 Quiz Builder
23 Question Bank
24 Attempts
25 Quiz Analytics
26 Announcements
27 Notifications
28 Developer Messages
29 Bug Reports
30 Support Assignment
31 App Settings
32 Developer Profile
33 Social Links
34 Character Library
35 Feature Flags
36 Storage
37 Audit Logs
38 Admin Accounts
39 Roles
40 Security
41 Analytics
42 Data Export
43 Integrity Checks
44 Maintenance Mode
45 System Health
```

---

# APPENDIX B — MINIMUM DATABASE DOMAIN MAP

```text
profiles
admin_roles
admin_permissions
admin_role_permissions

courses
branches
semesters
subjects

syllabus
syllabus_versions
academic_calendar
academic_calendar_events

resources
resource_files
resource_reports
resource_moderation

quizzes
quiz_questions
quiz_attempts
quiz_answers

announcements
notifications
notification_deliveries

support_conversations
support_messages
support_assignments
support_internal_notes
bug_reports

character_library
app_settings
feature_flags

audit_logs
storage_records
```

The exact schema belongs to the database architecture document, but this domain map should remain aligned with the implementation.

---

# APPENDIX C — ADMIN UI QUALITY STANDARD

Every production admin screen should answer these questions:

```text
1. Where am I?
2. What data am I looking at?
3. What is the current status?
4. What actions can I perform?
5. Which actions are dangerous?
6. Is the data loading?
7. Is there an error?
8. Is there no data?
9. What changed?
10. What happens after I click the action?
```

If these answers are unclear, the screen needs UX refinement.

---

# APPENDIX D — STRICT DO / DON'T

## DO

- Use light premium glass.
- Use restrained animation.
- Use clear status badges.
- Use version history.
- Use audit logs.
- Use role-based permissions.
- Use server-side validation.
- Use private storage where appropriate.
- Use moderation workflows.
- Use pagination.
- Use searchable tables.
- Preserve historical academic data.
- Give administrators clear feedback.

## DON'T

- Don't use RGB neon dashboards.
- Don't use black cyberpunk styling.
- Don't expose service keys.
- Don't trust frontend role checks.
- Don't permanently delete academic content casually.
- Don't publish student uploads automatically.
- Don't expose private support messages.
- Don't send unlimited notifications.
- Don't load thousands of records into the browser.
- Don't hide errors.
- Don't silently overwrite published syllabus versions.
- Don't make every screen a decorative glass card.

---

# APPENDIX E — DEFINITION OF DONE

The Admin Panel is considered ready for production only when:

```text
Authentication works.
Authorization works.
RLS is tested.
Roles are tested.
Academic hierarchy works.
Syllabus versioning works.
Calendar management works.
Resource management works.
Student uploads work.
Moderation works.
Reports work.
Quiz management works.
Support messaging works.
Notifications work.
Storage security works.
Audit logs work.
Destructive actions are protected.
Error states are implemented.
Loading states are implemented.
Responsive behavior is tested.
Accessibility basics are tested.
Production environment variables are secured.
Backups exist.
Migration process exists.
Monitoring exists.
```

**END OF DOCUMENT**
