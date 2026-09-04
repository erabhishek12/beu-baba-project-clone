# BEU BABA — SUPABASE DATABASE, BACKEND & DATA ARCHITECTURE ENGINEERING SPECIFICATION

**Document ID:** BEU-BABA-08  
**Document Type:** Production Engineering Specification  
**Project:** BEU BABA  
**Primary Stack:** React + Vite + TypeScript + Supabase  
**Database:** PostgreSQL  
**Storage:** Supabase Storage / external object storage where appropriate  
**Authentication:** Supabase Auth  
**Audience:** Developers, architects, AI coding agents, database administrators, security reviewers and future maintainers  
**Status:** Production architecture specification

---

# 1. PURPOSE OF THIS DOCUMENT

This document defines the complete backend, database, authentication, authorization, storage, moderation, messaging, notification, content-management, analytics and data-governance architecture for the BEU BABA application.

BEU BABA is intended to be a premium educational platform for students. It is not merely a static notes website. The system must support authenticated students, student profiles, courses, subjects, syllabus information, academic calendars, previous-year questions, quizzes, student-submitted resources, moderation, developer support messaging, notifications, toolbox utilities, profile customization, progress tracking, bookmarks, downloads, administrative operations and future expansion.

The database architecture must therefore be designed as a real product backend rather than as a collection of loosely connected tables.

The system must satisfy the following fundamental principles:

1. Every important entity must have a clear owner.
2. Every user must have a stable identity.
3. Authentication data must remain separate from public profile data.
4. Student information must be protected by Row Level Security.
5. Administrative permissions must never depend only on frontend checks.
6. Published educational content must be separated conceptually from draft or moderation states.
7. User-submitted resources must pass through moderation before becoming public.
8. Developer support messages must be private to the sender and authorized developer/admin personnel.
9. File uploads must never automatically become public educational content.
10. Storage paths must be predictable, secure and associated with database records.
11. Deletes should be conservative because educational records may be referenced elsewhere.
12. Important content should use versioning or audit history where future rollback may be useful.
13. Database constraints must protect data integrity even when a malicious or buggy client bypasses frontend validation.
14. The architecture must remain usable if BEU BABA grows from hundreds to hundreds of thousands of students.
15. The schema must be understandable by another developer without requiring knowledge of the original implementation.
16. Sensitive student data must never be exposed unnecessarily.
17. The system must support future mobile/PWA clients without redesigning the database.
18. All important state transitions must be explicit.
19. Time-related data must use timezone-aware timestamps where appropriate.
20. IDs should be generated server-side and should not depend on sequential public identifiers.
21. API/data access patterns should minimize unnecessary reads.
22. Database indexes must correspond to actual query patterns.
23. RLS policies must be treated as a security boundary, not merely a convenience.
24. The backend should provide a reliable source of truth.
25. The frontend should consume backend data rather than hard-code academic content.

---

# 2. PRODUCT BACKEND PHILOSOPHY

BEU BABA should be treated as a content-driven application.

The frontend provides the visual experience, animation and interaction. The backend provides identity, permissions, content, state and persistence.

The following separation is mandatory:

**Presentation layer**
- React
- TypeScript
- Tailwind/CSS
- Framer Motion
- UI components
- PWA shell

**Application layer**
- Hooks
- Services
- Query functions
- Form validation
- Business workflows

**Backend/data layer**
- Supabase Auth
- PostgreSQL
- Row Level Security
- PostgreSQL functions where justified
- Storage
- Database triggers where justified
- Edge Functions for privileged or external operations

The database must not be designed around individual screens.

For example, the database should not contain a table called `home_screen_cards` simply because the current home screen displays cards. Instead, the home screen should query meaningful domain entities such as courses, announcements, quizzes, resources and academic events.

This distinction is critical.

A screen can change.

The underlying educational data model should remain stable.

---

# 3. CORE BACKEND ENTITIES

The initial backend domain should include, at minimum:

1. Authenticated users
2. Student profiles
3. Roles
4. Courses
5. Branches
6. Academic programs
7. Semesters
8. Subjects
9. Course-subject mappings
10. Syllabus entries
11. Academic calendar events
12. Previous-year question papers
13. Question-paper metadata
14. Quiz categories
15. Quizzes
16. Quiz questions
17. Quiz options
18. Quiz attempts
19. Quiz answers
20. Quiz results
21. Educational resources
22. Resource submissions
23. Resource moderation records
24. Resource files
25. Bookmarks
26. Download records
27. User progress
28. Announcements
29. Notifications
30. Developer support conversations
31. Developer support messages
32. Toolbox definitions
33. User toolbox preferences where necessary
34. User avatars/profile images
35. Audit logs
36. Content versions
37. Application configuration
38. Feature flags
39. Reports
40. User feedback

Not every entity must be implemented on day one, but the architecture should leave room for them without creating structural conflicts.

---

# 4. IDENTITY ARCHITECTURE

Supabase Auth is the authoritative source for authentication identity.

The `auth.users` record identifies the account.

The application should maintain a separate public profile table such as:

`public.profiles`

Recommended conceptual fields:

- `id`
- `user_id`
- `full_name`
- `email`
- `contact_number`
- `gender`
- `course_id`
- `branch_id`
- `semester`
- `enrollment_year`
- `avatar_type`
- `avatar_url`
- `bio`
- `is_active`
- `created_at`
- `updated_at`

However, the exact design should distinguish fields that are duplicated from Auth.

The safest general approach is:

- use `auth.users.id` as the identity;
- use `profiles.id` as the same UUID or a direct foreign key;
- avoid treating email stored in a profile as the authoritative authentication identity;
- use Auth APIs for email/password operations.

If the profile contains an email copy, it should be understood as application metadata and kept synchronized carefully.

---

# 5. PROFILE CREATION FLOW

The registration process should be treated as a transaction-like workflow.

Expected sequence:

1. Student opens registration.
2. Student enters name.
3. Student enters email.
4. Student enters contact number.
5. Student selects course.
6. Student selects branch where applicable.
7. Student selects semester/year.
8. Student selects gender if the avatar-selection experience requires it.
9. Student chooses:
   - uploaded profile image, or
   - generated application avatar.
10. Student creates password.
11. Authentication account is created.
12. Email verification may be required depending on project configuration.
13. Profile record is created.
14. Selected avatar metadata is saved.
15. User receives onboarding state.
16. Dashboard becomes available after authorization checks.

The frontend should never be allowed to assign itself an administrator role during registration.

---

# 6. ROLE ARCHITECTURE

Roles should be explicit.

Recommended roles:

- `student`
- `moderator`
- `developer`
- `admin`
- `super_admin`

A role should not be inferred from a display name, email string or frontend route.

A student should never be able to submit:

`role = admin`

and have the backend trust it.

Role assignment must be controlled by privileged backend logic.

A simple profile boolean such as `is_admin` can work for very small prototypes, but a role system is preferable for BEU BABA because future permissions will become more granular.

Recommended conceptual tables:

`roles`

`user_roles`

This allows one user to potentially hold multiple roles.

For example:

A developer may also be a moderator.

A super admin may have all permissions.

A student should normally have only the student role.

---

# 7. AUTHORIZATION MODEL

Authentication answers:

"Who are you?"

Authorization answers:

"What are you allowed to do?"

These must never be confused.

A logged-in student is authenticated.

That does not mean the student can:

- edit syllabus;
- publish resources;
- send global notifications;
- read another student's support messages;
- access audit logs;
- change user roles;
- view all student contact details;
- delete quizzes;
- modify academic calendars.

Every privileged action must have a backend authorization rule.

---

# 8. ROW LEVEL SECURITY PRINCIPLE

Row Level Security must be enabled for all application tables that contain user-related or content-management data.

The default security philosophy is:

**Deny by default.**

Then explicitly allow required operations.

For example:

A student may read their own profile.

A student may update allowed fields of their own profile.

A student may create a support conversation.

A student may read their own support conversation.

A student may read published educational content.

A student may not read another student's support conversation.

A student may not modify published syllabus records.

A student may not read moderation notes.

A moderator may read pending resource submissions.

A moderator may approve or reject resources.

A developer may read support messages assigned to the developer/support team.

An administrator may manage broader content.

---

# 9. STUDENT PROFILE SECURITY

Profile information can contain:

- full name
- email
- phone
- course
- branch
- semester
- avatar
- enrollment details

This is personal information and should not be publicly queryable.

The frontend must not fetch every student profile for a normal student dashboard.

The normal student query should effectively mean:

"Give me the current authenticated user's profile."

The backend policy should verify the authenticated user's UUID.

Conceptually:

`profile.user_id = auth.uid()`

This is substantially safer than relying on a URL parameter such as:

`/profile/123`

and assuming the user should be allowed to read profile 123.

---

# 10. ADMIN STUDENT DIRECTORY

The admin panel may need to show:

- student name
- email
- contact number
- course
- branch
- semester
- registration date
- activity status
- resource submissions
- quiz activity
- support conversations

This is privileged information.

The frontend should not simply query the entire `profiles` table and hide columns with CSS.

The backend must enforce administrator authorization.

Even if a student manually modifies the frontend request, the database must reject the query.

For sensitive admin interfaces, consider using restricted database views or secure server-side functions rather than exposing broad direct table access.

---

# 11. COURSE DATA MODEL

Courses should be database records.

Example:

`courses`

Possible fields:

- `id`
- `name`
- `short_name`
- `description`
- `duration_years`
- `is_active`
- `display_order`
- `created_at`
- `updated_at`

Examples might include:

- B.Tech
- BCA
- BBA

The database should not hard-code course names into application logic.

The UI can display database-driven names.

---

# 12. BRANCH DATA MODEL

Branches should be independent records.

Example:

`branches`

Fields:

- `id`
- `course_id`
- `name`
- `short_name`
- `description`
- `is_active`
- `display_order`

This permits branch lists to change without redeploying the application.

A student can be associated with a course and branch.

The backend should validate that the selected branch belongs to the selected course.

Do not trust a client to send logically consistent IDs.

---

# 13. SEMESTER MODEL

Semester should preferably be represented consistently.

Possible representation:

`semester_number`

with integer values such as:

1 through 8.

For systems supporting different programs, a normalized academic structure may instead use:

`academic_terms`

Fields can include:

- course
- semester number
- academic year
- label
- start date
- end date
- status

The second approach is more flexible when different programs have different academic schedules.

---

# 14. SUBJECT MODEL

Subjects should have stable database IDs.

Recommended fields:

- `id`
- `course_id`
- `code`
- `name`
- `short_name`
- `semester`
- `credits`
- `description`
- `is_active`
- `display_order`
- `created_at`
- `updated_at`

Subject codes should have appropriate uniqueness constraints.

For example, if subject codes are unique only within a course, the database constraint should reflect that rather than assuming global uniqueness.

---

# 15. SYLLABUS ARCHITECTURE

Syllabus is content, not frontend configuration.

A syllabus entry can contain:

- course
- branch
- semester
- subject
- unit
- topic
- description
- official reference
- sequence
- version
- effective date
- status

Possible statuses:

- `draft`
- `pending_review`
- `published`
- `archived`

Only published syllabus content should normally be visible to students.

This makes syllabus updates much safer.

The administrator can prepare a new version without immediately changing what students see.

---

# 16. SYLLABUS VERSIONING

Syllabus changes should be traceable.

Suppose an administrator changes:

"Unit 3 — Digital Logic"

to:

"Unit 3 — Digital Logic and Sequential Circuits"

The system should ideally retain the old version or at least an audit record.

Recommended version metadata:

- version number
- created by
- created at
- effective date
- change summary
- status

This prevents accidental loss of historical academic information.

---

# 17. YEARLY ACADEMIC CALENDAR

The academic calendar should also be database-driven.

Possible table:

`academic_calendar_events`

Fields:

- `id`
- `course_id`
- `title`
- `description`
- `event_type`
- `start_at`
- `end_at`
- `is_all_day`
- `location`
- `source`
- `status`
- `created_by`
- `created_at`
- `updated_at`

Event types may include:

- semester_start
- semester_end
- examination
- registration
- holiday
- result
- practical
- project
- admission
- other

If the calendar changes, the administrator updates the database.

The app does not require a new build merely because a date changed.

---

# 18. PYQ ARCHITECTURE

Previous-year questions should be stored as structured metadata plus file references.

Recommended metadata:

- `id`
- `course_id`
- `branch_id`
- `semester`
- `subject_id`
- `exam_year`
- `exam_type`
- `title`
- `description`
- `file_path`
- `file_type`
- `file_size`
- `page_count`
- `is_published`
- `uploaded_by`
- `created_at`
- `updated_at`

Do not store large PDFs directly inside ordinary PostgreSQL rows.

Store the file in object storage and save only secure metadata/path information in PostgreSQL.

---

# 19. STORAGE ARCHITECTURE

Storage should be separated logically by purpose.

Recommended buckets:

- `avatars`
- `resources`
- `pyq`
- `documents`
- `course-assets`
- `quiz-assets`
- `announcement-assets`

The exact bucket strategy can change, but it must remain deliberate.

Do not place every file into a single public bucket.

---

# 20. PRIVATE VS PUBLIC FILES

Files should be classified.

**Public/low-sensitivity assets**
- course thumbnails
- public icons
- approved public educational images

**Authenticated content**
- course PDFs
- approved resources
- PYQs

**Private user content**
- profile images if privacy requires
- draft submissions
- moderation attachments
- support attachments

**Privileged content**
- internal moderation files
- administrative documents

Public accessibility should be granted only where necessary.

For protected files, use signed URLs or controlled access.

---

# 21. FILE PATH DESIGN

Storage paths should be deterministic enough to manage but must not leak sensitive information.

A possible structure:

`avatars/{user_id}/profile.webp`

`resources/{resource_id}/document.pdf`

`pyq/{pyq_id}/paper.pdf`

`quiz-assets/{quiz_id}/{asset_id}.webp`

Avoid using the student's email or phone number as a file path.

Never create storage paths such as:

`uploads/abhishek@gmail.com/file.pdf`

Email addresses are personal information and can also cause encoding and privacy problems.

---

# 22. PROFILE IMAGE UPLOAD

The registration/profile flow should support:

### Option A — Device image

User selects an image.

Client validates:

- file type
- file size
- dimensions

The image is uploaded.

The database stores the resulting storage path.

### Option B — Generated avatar

The application automatically selects an appropriate predefined avatar based on the selected gender preference.

The database stores:

- `avatar_type = generated`
- `avatar_id = ...`

Do not duplicate the same generated image into every user's storage unless required.

If the avatar is application-owned static content, storing an avatar ID is more efficient.

---

# 23. IMAGE PROCESSING

User-uploaded images should ideally be normalized.

Recommended process:

1. Validate MIME type.
2. Validate actual file signature where possible.
3. Decode image server-side or through a trusted image pipeline.
4. Resize.
5. Compress.
6. Convert to an efficient format such as WebP where supported.
7. Strip unnecessary metadata.
8. Store the optimized file.
9. Save dimensions and path.

Do not trust the filename extension alone.

A file named:

`photo.jpg`

can contain something else.

---

# 24. RESOURCE UPLOAD SYSTEM

One of the important BEU BABA features is:

"Students can upload useful resources."

This must be implemented as a moderation workflow.

The user should submit:

- title
- description
- category
- subject
- semester
- resource type
- file
- optional source
- optional notes

The resource starts in:

`pending`

It does not immediately become visible to everyone.

---

# 25. RESOURCE MODERATION STATE MACHINE

Recommended states:

`draft`

↓

`submitted`

↓

`pending_review`

↓

either:

`approved`

or:

`rejected`

or:

`changes_requested`

An approved resource may later become:

`archived`

A rejected resource should retain its moderation history.

Never simply delete rejected submissions by default.

---

# 26. MODERATION RECORD

Each moderation decision should record:

- resource ID
- moderator ID
- action
- reason
- timestamp
- previous status
- new status

This can be stored in:

`resource_moderation_actions`

Example actions:

- submitted
- approved
- rejected
- requested_changes
- archived
- restored

This creates an audit trail.

---

# 27. RESOURCE VISIBILITY RULE

A resource should be visible to ordinary students only when:

- status is approved/published;
- the underlying file exists;
- required metadata is valid;
- the content has not been archived;
- access rules allow the student to view it.

The frontend should never decide visibility alone.

For example, hiding:

`status === pending`

in React is not sufficient.

The database query should prevent unauthorized records from being returned.

---

# 28. RESOURCE REPORTING

Students should be able to report problematic resources.

Possible reasons:

- wrong content
- duplicate
- inappropriate
- misleading
- broken file
- copyright concern
- unrelated subject

Reports can be stored in:

`resource_reports`

Fields:

- `id`
- `resource_id`
- `reported_by`
- `reason`
- `description`
- `status`
- `resolved_by`
- `resolved_at`
- `created_at`

This makes community content safer.

---

# 29. DEVELOPER SUPPORT MESSAGING

BEU BABA should provide a simple private "Contact Developer" or "Developer Support" section.

This is not intended to become a general social chat system.

Its purpose is:

- bug reporting
- syllabus update requests
- course correction requests
- feature requests
- account problems
- resource issues
- feedback

Each conversation belongs to one user.

A student should see only their own support conversation(s).

The developer/admin should be able to see incoming conversations according to support permissions.

---

# 30. SUPPORT CONVERSATION MODEL

Recommended:

`support_conversations`

Fields:

- `id`
- `user_id`
- `subject`
- `category`
- `status`
- `priority`
- `assigned_to`
- `created_at`
- `updated_at`
- `last_message_at`

Categories:

- bug
- syllabus
- course
- account
- resource
- feature_request
- feedback
- other

Statuses:

- open
- in_progress
- waiting_for_user
- resolved
- closed

---

# 31. SUPPORT MESSAGE MODEL

`support_messages`

Fields:

- `id`
- `conversation_id`
- `sender_id`
- `sender_role`
- `message`
- `attachment_path`
- `created_at`
- `edited_at`
- `deleted_at`

The important security relationship is:

`message -> conversation -> user`

The student can read a message only if the conversation belongs to that student.

The developer can read messages if they have appropriate support privileges.

---

# 32. REALTIME SUPPORT

Supabase Realtime can be used for support messages.

However, Realtime subscriptions must obey the same authorization rules as normal database access.

Do not assume:

"Because it is Realtime, it is private."

A client should subscribe only to authorized conversation records.

The message UI can update instantly when a developer replies.

---

# 33. MESSAGE PRIVACY

The system must never expose support messages globally.

Do not create a public query such as:

`select * from support_messages`

for the student client.

Do not expose all conversations and filter them in JavaScript.

The database policy should restrict access.

This is a critical privacy requirement.

---

# 34. NOTIFICATION ARCHITECTURE

BEU BABA should support multiple notification types.

Examples:

- new PYQ added
- syllabus updated
- new resource approved
- quiz published
- exam reminder
- developer replied
- system announcement
- maintenance notice
- course update

Notifications should be stored in a database table.

Recommended:

`notifications`

and:

`user_notifications`

or a single table where each row represents a user's notification.

---

# 35. USER NOTIFICATION MODEL

A practical structure:

`notifications`

contains global notification content.

`user_notifications`

contains recipient state.

For example:

Notification:

"New DBMS PYQ added"

User-specific record:

- user_id
- notification_id
- read_at
- dismissed_at

This avoids duplicating the same message content for thousands of students.

---

# 36. TARGETED NOTIFICATIONS

Notifications may target:

- everyone
- course
- branch
- semester
- specific user
- users with a particular role

A targeting system should be explicit.

Do not copy notifications manually to thousands of users unless there is a strong reason.

For large-scale notification delivery, maintain a campaign/targeting model and materialize user notification records when needed.

---

# 37. PUSH NOTIFICATIONS

For PWA/browser notifications, the system can eventually support:

- Web Push
- service worker
- push subscription records

A table such as:

`push_subscriptions`

may contain:

- user_id
- endpoint
- public key
- auth key
- browser/device metadata
- created_at
- last_seen_at
- revoked_at

Push credentials are sensitive and must not be publicly queryable.

---

# 38. QUIZ ARCHITECTURE

The quiz system must be treated as a proper content engine.

Core entities:

- quiz
- quiz question
- quiz option
- quiz attempt
- quiz answer
- quiz result

A quiz contains many questions.

A question contains multiple options.

An attempt belongs to one student and one quiz version.

---

# 39. QUIZ VERSIONING

This is extremely important.

Suppose a student starts a quiz with 20 questions.

Later, an admin edits question 7.

The student's existing attempt should not suddenly change.

Therefore, published quizzes should have versions.

Conceptual structure:

`quizzes`

`quiz_versions`

`quiz_questions`

or an equivalent immutable snapshot approach.

Once a quiz version is published and used by students, avoid destructive modification.

Create a new version for substantial changes.

---

# 40. QUIZ QUESTION TYPES

The initial system can support:

- single choice
- multiple choice
- true/false
- numerical answer
- short answer

The first release may implement only single choice and multiple choice.

The schema should still leave room for future types.

A question should contain:

- question text
- explanation
- marks
- negative marks
- difficulty
- order
- question type

---

# 41. QUIZ OPTIONS

Each option should have:

- id
- question_id
- option text
- order
- correctness metadata

Correct-answer information is sensitive in an active quiz.

The client should not receive correct answers before the attempt is evaluated.

For high-security quizzes, separate public question data from evaluation data.

---

# 42. QUIZ ATTEMPT SECURITY

A quiz attempt belongs to one authenticated student.

The student may:

- create their own attempt;
- answer their own attempt;
- submit their own attempt;
- read their own result.

The student may not:

- modify another student's attempt;
- mark their own score as correct;
- change the quiz's answer key;
- submit arbitrary marks.

Scoring should be calculated by trusted backend logic.

---

# 43. QUIZ SCORING

For example:

Correct answer:

`+1`

Wrong answer:

`-0.25`

Unanswered:

`0`

The exact scoring should come from the quiz version.

The frontend may display estimated score, but the authoritative result should be generated server-side or through trusted database logic.

This prevents a user from editing JavaScript and assigning themselves 100%.

---

# 44. QUIZ RESULT

A result can contain:

- attempt ID
- score
- maximum score
- percentage
- correct count
- wrong count
- skipped count
- time taken
- rank if implemented
- submitted timestamp

The result should be derived from answer data.

Do not let a normal client directly update:

`score = 100`

---

# 45. QUIZ LEADERBOARD

If leaderboards are introduced, privacy should be considered.

Prefer displaying:

- rank
- display name
- avatar
- score

Do not expose:

- email
- phone
- private profile fields

A user should be able to opt out if the product requires it.

---

# 46. STUDENT PROGRESS

Progress can be tracked for:

- course
- subject
- syllabus unit
- quiz
- resource
- learning material

Example:

`user_subject_progress`

Fields:

- user_id
- subject_id
- completion_percent
- last_activity_at
- updated_at

However, progress should not be stored redundantly if it can be derived cheaply.

Use derived values for simple calculations where practical.

---

# 47. BOOKMARKS

Students may bookmark:

- PYQ
- syllabus topic
- resource
- quiz
- course

A generic bookmark table can work:

`bookmarks`

with:

- user_id
- entity_type
- entity_id
- created_at

However, polymorphic foreign keys are not enforced by PostgreSQL automatically.

For strong integrity, separate bookmark tables or carefully controlled database functions may be preferable.

---

# 48. DOWNLOAD TRACKING

If the application tracks downloads, store:

- user_id
- resource_id
- downloaded_at
- file_type
- optional client/device metadata

Do not store unnecessary personal information.

Download analytics should not become invasive tracking.

The goal should be product analytics rather than surveillance.

---

# 49. ANNOUNCEMENTS

Announcements are separate from notifications.

An announcement is content.

A notification is a delivery/read state.

Example announcement:

"Semester 5 syllabus has been updated."

It may appear on the home page.

A notification may tell a particular user:

"New syllabus update available."

---

# 50. ANNOUNCEMENT MODEL

Possible fields:

- id
- title
- body
- image_path
- category
- priority
- status
- publish_at
- expire_at
- created_by
- created_at
- updated_at

Statuses:

- draft
- scheduled
- published
- expired
- archived

---

# 51. HOME SCREEN DATA

The home screen should not have its own giant content table.

Instead it can aggregate:

- user profile
- active course
- announcements
- featured resources
- upcoming academic events
- recent PYQs
- recommended quizzes
- notification count
- support status

The frontend can combine these through query hooks.

For performance, frequently used aggregated data may be exposed through secure database views or RPC functions.

---

# 52. ADMIN CONTENT MANAGEMENT

Admin should be able to manage:

- courses
- branches
- subjects
- syllabus
- academic calendar
- PYQs
- resources
- quizzes
- announcements
- notifications
- toolbox tools
- support conversations
- users
- feature flags

Every write operation should record who performed it.

---

# 53. AUDIT LOGGING

Critical administrative operations should create audit records.

Example:

`audit_logs`

Fields:

- id
- actor_id
- action
- entity_type
- entity_id
- before_data
- after_data
- metadata
- created_at

Actions:

- create
- update
- publish
- archive
- approve
- reject
- delete
- role_change
- notification_send

Audit logs should be protected from normal users.

Ideally, ordinary administrators should not be able to silently erase audit history.

---

# 54. SOFT DELETE VS HARD DELETE

Educational content often benefits from soft deletion.

Instead of:

`DELETE FROM resources`

consider:

`status = archived`

or:

`deleted_at`

This allows recovery.

Hard delete should be reserved for cases where permanent removal is genuinely required.

User privacy requests may require permanent deletion depending on applicable obligations.

---

# 55. CONTENT PUBLISHING WORKFLOW

Important content should generally follow:

Draft → Review → Publish → Archive

For example:

Syllabus:

`draft`

Admin reviews:

`review`

Admin publishes:

`published`

Later update:

new draft/version

Old version:

`archived`

This is much safer than editing production records directly.

---

# 56. CONTENT SOURCE AND VERIFICATION

Academic content should ideally store source metadata.

Examples:

- official university document
- faculty-provided document
- verified moderator submission
- student submission
- manually created content

Possible fields:

- source_type
- source_url where appropriate
- verified_at
- verified_by

Do not imply that student-submitted content is officially issued by the university.

The UI should distinguish:

**Official / Verified**

from:

**Community Submitted**

---

# 57. APPLICATION CONFIGURATION

Some product settings should not require a code deployment.

Possible table:

`app_config`

Examples:

- support email
- maintenance message
- current academic year
- app version
- minimum supported version
- feature toggles
- contact links

Sensitive secrets must never be stored in a publicly readable configuration table.

---

# 58. SOCIAL LINKS

BEU BABA can store official developer/social links in configuration.

Examples provided for the project:

Instagram:
- `naturelensbyabhi`
- `er_abhi2026`

Portfolio:
- `https://erabhi.in`
- `https://i-am-er-abhi.vercel.app`

Telegram:
- `https://t.me/+wnAYQ4wVOxg2M2Rl`

These should be treated as application-level public links.

The frontend should not scatter them across many components.

Store them in one configuration location or a social-links table.

If a link changes, the developer can update one source.

---

# 59. TOOLBOX ARCHITECTURE

The Student Toolbox should support 10+ useful daily-life/student utilities.

Possible tools:

1. Percentage calculator
2. CGPA calculator
3. SGPA calculator
4. Unit converter
5. Age calculator
6. Date difference calculator
7. Attendance calculator
8. Study timer
9. Pomodoro timer
10. GPA target calculator
11. Loan/EMI calculator
12. BMI calculator
13. Scientific calculator
14. Binary/decimal converter
15. File size converter

Many of these tools do not need database storage.

Static computational tools should remain client-side.

Only persist user preferences or history when there is a clear product reason.

---

# 60. TOOLBOX DATABASE RULE

Do not create a database row for every calculation.

For example:

A percentage calculation:

`45 / 60 * 100`

does not need to be stored.

This reduces database load and avoids unnecessary user-data retention.

If history is later introduced, make it opt-in.

---

# 61. DATABASE NORMALIZATION

The schema should avoid storing the same fact repeatedly.

Bad example:

Every PYQ row stores:

`course_name = "B.Tech"`

Every subject row stores:

`course_name = "B.Tech"`

Every quiz row stores:

`course_name = "B.Tech"`

If course names change, many records become inconsistent.

Prefer foreign keys:

`course_id`

Then join to the course table.

However, denormalization may be appropriate for carefully selected read-heavy cases.

Optimization should follow actual performance measurements.

---

# 62. FOREIGN KEY STRATEGY

Foreign keys must be used for important relationships.

Examples:

- branch → course
- subject → course
- syllabus → subject
- PYQ → subject
- resource → subject
- quiz → course
- quiz question → quiz
- quiz option → question
- attempt → user
- attempt → quiz version
- support conversation → user
- support message → conversation

Foreign keys protect database integrity.

---

# 63. CASCADE STRATEGY

Do not blindly use `ON DELETE CASCADE`.

For example, deleting a user should not accidentally delete valuable academic content uploaded by that user if the content is already approved.

Use appropriate relationships such as:

- `RESTRICT`
- `SET NULL`
- controlled cascade

depending on the entity.

User-owned temporary records may be safely cascaded.

Public educational content may require preservation.

---

# 64. UNIQUE CONSTRAINTS

Use unique constraints for business rules.

Examples:

- one profile per user
- one course/branch combination where applicable
- one subject code within a program
- one notification read-state per user/notification
- one bookmark per user/entity
- one active generated avatar selection where appropriate

Database uniqueness is stronger than frontend checks.

---

# 65. CHECK CONSTRAINTS

Use check constraints for simple domain validation.

Examples:

Semester:

`semester_number between 1 and 12`

Priority:

`priority >= 0`

Marks:

`marks >= 0`

Percentage:

`percentage between 0 and 100`

These checks protect against malformed direct database writes.

---

# 66. ENUMS VS TEXT

PostgreSQL enums can be useful for stable values.

However, enums are less flexible when statuses change frequently.

For rapidly evolving application states, a text field plus a check constraint or lookup table may be easier to maintain.

The project should avoid creating dozens of rigid enums for values likely to evolve.

---

# 67. TIMESTAMP STRATEGY

Use timezone-aware timestamps where possible.

Prefer:

`timestamptz`

for:

- created_at
- updated_at
- published_at
- start_at
- end_at
- submitted_at
- resolved_at

Store timestamps in UTC at the backend level.

Render them in the user's local timezone.

---

# 68. CREATED_AT AND UPDATED_AT

Most mutable tables should contain:

`created_at`

and:

`updated_at`

`updated_at` should be updated automatically using a database trigger or controlled server-side logic.

Do not rely on every React form to remember to set it.

---

# 69. IMMUTABLE RECORDS

Some records should be treated as append-only or effectively immutable.

Examples:

- audit logs
- quiz answers after submission
- moderation actions
- published content versions

If correction is needed, create a new record/version rather than silently changing history.

---

# 70. DATABASE FUNCTIONS

Use PostgreSQL functions/RPC when an operation:

- requires multiple database writes;
- must be atomic;
- performs server-authoritative scoring;
- needs controlled permission checks;
- performs complex aggregation;
- should not expose raw tables.

Examples:

`submit_quiz_attempt()`

`publish_resource()`

`approve_resource()`

`mark_notification_read()`

The exact use of RPC should remain limited to workflows where it improves correctness or security.

Do not move every simple SELECT into RPC unnecessarily.

---

# 71. EDGE FUNCTIONS

Supabase Edge Functions are appropriate for:

- sending push notifications
- calling external APIs
- privileged processing
- file inspection
- email notifications
- scheduled jobs
- server-only secrets
- integrations

Never place secret API keys in React environment variables if those keys are supposed to remain private.

Frontend-exposed variables are not secrets.

---

# 72. ENVIRONMENT VARIABLES

Public client configuration can include:

- Supabase URL
- Supabase anonymous/publishable key

Private secrets must remain server-side.

Examples:

- service role key
- private webhook secret
- push private key
- external API secret

Never commit secrets to Git.

Never put a service-role credential into a Vite frontend variable.

---

# 73. SERVICE ROLE KEY RULE

The Supabase service role key bypasses Row Level Security.

Therefore:

**It must never be shipped to the browser.**

It should exist only in trusted server-side environments.

If an AI coding agent suggests:

`VITE_SUPABASE_SERVICE_ROLE_KEY`

reject that implementation.

This is a severe security issue.

---

# 74. STORAGE SECURITY

Storage policies must mirror database permissions.

Example:

A student can upload their own resource into an appropriate submission path.

A student cannot overwrite another student's file.

A student cannot upload directly into a public-approved folder if approval is required.

The moderation workflow should control publication.

---

# 75. RESOURCE FILE LIFECYCLE

Recommended:

1. User selects file.
2. Upload to private submission storage.
3. Create submission record.
4. Validate metadata.
5. Moderator reviews.
6. On approval, move/copy into published storage.
7. Database status becomes published.
8. Student access becomes available.

Alternatively, the same private bucket can be used with access controlled by signed URLs.

Choose one consistent strategy.

---

# 76. FILE SIZE LIMITS

Define explicit limits.

Example policy:

- profile image: 5 MB
- PDF resource: 25–50 MB
- image resource: 10 MB
- quiz image: 5 MB

Exact limits depend on infrastructure.

The important requirement is that limits exist.

Never allow unlimited user uploads without considering storage abuse.

---

# 77. MIME TYPE VALIDATION

Allowed educational file types might include:

- PDF
- JPG
- JPEG
- PNG
- WEBP
- DOCX
- PPTX

Only allow formats the application can safely handle.

Do not allow executable formats such as:

- `.exe`
- `.bat`
- `.cmd`
- `.scr`
- `.msi`

unless there is a very specific and controlled reason.

---

# 78. CONTENT SECURITY

Uploaded documents may contain:

- malicious macros
- embedded scripts
- misleading content
- oversized files

Where feasible, scan uploads using an appropriate security pipeline.

Never assume that "PDF" automatically means harmless.

The application should also avoid rendering arbitrary HTML from user submissions.

---

# 79. XSS PROTECTION

Student-entered content includes:

- support messages
- resource descriptions
- quiz explanations
- feedback
- announcement text if administrators can enter HTML

The preferred approach is to treat text as plain text.

Do not inject arbitrary user strings with:

`dangerouslySetInnerHTML`

unless the content is sanitized by a trusted sanitizer and there is a clear reason to allow rich HTML.

---

# 80. SUPPORT ATTACHMENTS

Support messages may optionally contain attachments.

Use strict rules:

- authenticated users only
- private storage
- size limit
- allowed MIME types
- attachment associated with conversation
- access checked through conversation ownership

A student must not be able to guess another conversation's attachment path.

---

# 81. SEARCH ARCHITECTURE

Search should initially support:

- subjects
- courses
- PYQs
- resources
- quizzes
- syllabus topics

Do not implement search by downloading every record into React and filtering there.

Use database queries and appropriate indexes.

For more advanced search later, PostgreSQL full-text search can be introduced.

---

# 82. SEARCH INDEXES

Potential indexed fields:

- subject name
- subject code
- resource title
- resource category
- PYQ title
- exam year
- quiz title
- announcement title

Do not add indexes blindly.

Every index adds write and storage cost.

Indexes should correspond to actual query patterns.

---

# 83. COMPOSITE INDEXES

Composite indexes are valuable when queries repeatedly filter by multiple fields.

For example:

PYQ search may commonly filter by:

`subject_id + exam_year`

A composite index can improve this query.

Likewise resources may query:

`status + subject_id + created_at`

Index design should follow real query patterns.

---

# 84. PAGINATION

Do not load thousands of resources at once.

Use pagination.

For simple administrative lists, page-based pagination can work.

For large feeds, cursor-based pagination is preferable.

Examples:

- recent resources
- support messages
- notifications
- audit logs

The UI should support loading more records without causing a massive database request.

---

# 85. QUERY SELECT DISCIPLINE

Avoid:

`SELECT *`

for large tables.

Select only required columns.

For example, a resource card may need:

- id
- title
- thumbnail
- subject
- created_at
- author display name

It does not need:

- moderation notes
- internal audit metadata
- private uploader contact number

This reduces bandwidth and accidental data exposure.

---

# 86. DATABASE VIEWS

Views can simplify read-heavy data.

Possible views:

- published resources
- published syllabus
- upcoming calendar events
- student dashboard summary
- admin resource queue

However, views must still be secured appropriately.

Do not assume a view automatically fixes authorization.

---

# 87. SECURITY DEFINER FUNCTIONS

If using PostgreSQL functions with `SECURITY DEFINER`, they must be designed extremely carefully.

Always consider:

- search path
- caller permissions
- input validation
- privilege escalation
- unintended table access

Do not create broad "admin_execute_anything" functions.

Functions should expose narrow operations.

---

# 88. ADMIN ACTION CONFIRMATION

Destructive operations should require confirmation in the UI.

Examples:

- delete quiz
- archive syllabus
- reject resource
- remove announcement
- disable account

But UI confirmation is not a security mechanism.

The backend must still validate permissions.

---

# 89. ADMIN AUDIT REQUIREMENTS

At minimum, log:

- role changes
- content publication
- content deletion/archive
- resource approval/rejection
- quiz publication
- syllabus changes
- calendar changes
- global notifications
- account status changes

This creates accountability.

---

# 90. USER ACCOUNT DEACTIVATION

Do not necessarily delete a user immediately when they are deactivated.

Use:

`is_active = false`

or account status.

A disabled student should be prevented from normal application access.

Historical content and audit records can remain.

---

# 91. EMAIL VERIFICATION

If email verification is enabled:

Registration states should support:

- created
- email_pending
- verified
- active
- disabled

The application should not treat an unverified account as fully trusted if verification is part of the product's security model.

---

# 92. PASSWORD MANAGEMENT

Do not store passwords in PostgreSQL application tables.

Supabase Auth handles password authentication.

The application stores only profile and business information.

Password reset should use Auth's supported reset flow.

---

# 93. CONTACT NUMBER

Contact number should be validated and normalized.

Do not store multiple inconsistent formats such as:

`+91 9876543210`

`09876543210`

`98765-43210`

without a strategy.

For Indian phone numbers, a consistent normalized representation should be used.

Do not expose phone numbers to other students.

---

# 94. STUDENT PROFILE EDITING

Students should be able to edit permitted fields such as:

- display name
- profile image
- selected avatar
- maybe contact number
- maybe academic semester

Sensitive academic identity fields may require admin verification depending on the product.

The UI should distinguish editable and locked fields.

---

# 95. ACADEMIC DATA CHANGE

If a student changes:

`semester 4 → semester 5`

the backend should validate the course/branch relationship.

If academic data affects content visibility, the dashboard queries should use the updated profile state.

Do not duplicate semester information into dozens of unrelated records.

---

# 96. COURSE-SPECIFIC CONTENT

A content record may be scoped by:

- course
- branch
- semester
- subject

The access query should correctly handle null/general scope.

For example, a PYQ may apply to:

- all branches
- one branch
- one course
- one semester

Define these semantics clearly.

---

# 97. GENERAL VS BRANCH-SPECIFIC SUBJECTS

Some subjects may be common to multiple branches.

Avoid duplicating the same subject unnecessarily.

Use mapping tables when a subject can belong to multiple programs.

For example:

`subject_offerings`

can map:

- subject
- course
- branch
- semester
- academic year

This is more flexible than embedding everything into the subject row.

---

# 98. ACADEMIC YEAR

Academic year should be represented explicitly where required.

Examples:

`2025-26`

`2026-27`

Do not infer academic year solely from the calendar year.

For Indian academic systems, an academic year commonly spans two calendar years.

Store a clear label and start/end dates.

---

# 99. CONTENT EFFECTIVE DATE

Syllabus and calendar updates may have future effective dates.

For example:

A new syllabus may be published today but effective from a future semester.

Therefore content can have:

- publication date
- effective date
- expiration date

These concepts should not be mixed.

---

# 100. FEATURE FLAGS

Feature flags allow controlled rollout.

Examples:

- quiz_enabled
- resource_upload_enabled
- developer_chat_enabled
- push_notifications_enabled
- leaderboard_enabled
- new_dashboard_enabled

A feature flag should be read securely.

Admin-only configuration should not be writable by students.

---

# 101. MAINTENANCE MODE

The backend can provide a maintenance configuration:

- enabled
- title
- message
- expected_end
- bypass_roles

The frontend displays a premium maintenance screen.

Admins/developers may bypass maintenance.

Again, this is not security by frontend logic alone.

Backend writes can also be restricted during maintenance if necessary.

---

# 102. APP VERSION MANAGEMENT

PWA clients may remain installed for a long time.

Store:

- current_version
- minimum_version
- update_message

The app can compare the running version.

If the version is below the minimum supported version, show an update-required screen.

---

# 103. OFFLINE DATA

Some public academic data can be cached.

Examples:

- previously viewed syllabus
- recently viewed PYQs metadata
- toolbox definitions
- static UI configuration

Sensitive data should not be cached indefinitely.

Do not store:

- support conversations
- private admin data
- secrets

in unrestricted browser storage.

---

# 104. CACHE INVALIDATION

When an admin publishes a new syllabus:

1. Database changes.
2. Relevant cache/query is invalidated.
3. Students fetch new data.
4. Optional notification is sent.

The frontend should not continue displaying stale content indefinitely.

---

# 105. DATA FRESHNESS

Different data requires different freshness:

**High freshness**
- support messages
- notification count
- admin moderation queue

**Medium freshness**
- announcements
- quizzes
- resources

**Low freshness**
- course list
- subjects
- toolbox definitions

Caching should reflect this.

---

# 106. REALTIME USAGE

Realtime should be used where it improves user experience.

Good examples:

- developer support replies
- unread notification count
- moderation queue updates for admins

Do not subscribe every client to every database table.

That can create unnecessary traffic and complexity.

---

# 107. SUPPORT UNREAD COUNT

A useful query:

"How many unresolved developer replies are waiting for this student?"

This can power a badge on the support icon.

The count should be scoped to the authenticated user.

---

# 108. NOTIFICATION READ STATE

When a student opens a notification:

`read_at` is set.

Avoid deleting the notification merely because it was read.

Read history can be useful.

The UI can hide old notifications based on product rules.

---

# 109. NOTIFICATION CLEANUP

Old notifications can eventually be archived or deleted according to retention policy.

Do not create indefinite data growth.

For example, a system notification from five years ago may not need to remain in the active table.

---

# 110. DATA RETENTION

Define retention categories.

Potentially long-lived:

- academic content
- published syllabus
- PYQ metadata
- quiz definitions

Potentially shorter-lived:

- logs
- notification delivery records
- temporary uploads
- failed push attempts

Potentially user-controlled:

- support messages
- profile information

Retention should be intentional.

---

# 111. PRIVACY PRINCIPLE

Collect only data that has a legitimate product purpose.

The registration form should not ask for random information simply because a database column exists.

Required student information should have a reason.

For example:

Name:
needed for profile.

Course:
needed for content personalization.

Branch:
needed for branch-specific academic material.

Email:
needed for account identity/communication.

Phone:
only if there is a legitimate product/admin purpose.

---

# 112. ADMIN PRIVACY

Even administrators should receive only the information required for their role.

For example:

A content moderator may not need access to every student's phone number.

A support developer may need:

- name
- email
- relevant account details

but not necessarily complete academic records.

Role-specific views can improve privacy.

---

# 113. DATABASE SECURITY CHECKLIST

Before production:

- [ ] RLS enabled
- [ ] RLS policies reviewed
- [ ] No service role key in frontend
- [ ] Storage policies reviewed
- [ ] Admin permissions tested
- [ ] Student-to-student isolation tested
- [ ] Support message isolation tested
- [ ] Quiz answer leakage tested
- [ ] File upload restrictions tested
- [ ] SQL injection vectors considered
- [ ] XSS vectors tested
- [ ] Audit logs protected
- [ ] Secrets removed from repository
- [ ] Database backups configured
- [ ] Recovery process tested

---

# 114. DATABASE MIGRATIONS

All schema changes should be represented as migrations.

Do not manually change production tables without recording the change.

Migration naming can follow:

`001_initial_schema.sql`

`002_profiles.sql`

`003_courses_subjects.sql`

`004_syllabus.sql`

`005_pyq.sql`

`006_resources.sql`

`007_quizzes.sql`

etc.

The migration history should be committed to version control.

---

# 115. MIGRATION RULE

Never rely on:

"it works on my Supabase dashboard."

If the schema exists only in a dashboard and not in the repository, another developer cannot reliably recreate the environment.

The database should be reproducible.

---

# 116. SEED DATA

Development environments may need seed data.

Seed records can include:

- demo course
- demo branches
- demo subjects
- sample syllabus
- sample PYQ
- sample quiz
- sample announcement

Seed data should never contain real student personal information.

---

# 117. PRODUCTION DATA SEPARATION

Development and production databases should be separate.

Never test destructive migrations against production.

Never use real student records as casual test data.

---

# 118. TESTING RLS

RLS must be tested explicitly.

Test cases:

Student A attempts to read Student B profile.

Expected:

Denied.

Student A attempts to read Student B support conversation.

Expected:

Denied.

Student attempts to approve resource.

Expected:

Denied.

Moderator attempts to approve resource.

Expected:

Allowed if role permits.

Developer attempts to modify syllabus.

Expected:

Allowed only if role/permission permits.

---

# 119. AUTHORIZATION TEST MATRIX

Maintain a matrix:

| Action | Student | Moderator | Developer | Admin | Super Admin |
|---|---:|---:|---:|---:|---:|
| Read published content | Yes | Yes | Yes | Yes | Yes |
| Submit resource | Yes | Yes | Yes | Yes | Yes |
| Approve resource | No | Yes | Maybe | Yes | Yes |
| Edit syllabus | No | Maybe | Yes | Yes | Yes |
| Send global notification | No | No | Maybe | Yes | Yes |
| Read own support chat | Yes | Yes | Yes | Yes | Yes |
| Read all support chats | No | Maybe | Yes | Yes | Yes |
| Change roles | No | No | No | Yes | Yes |
| Read audit logs | No | No | Maybe | Yes | Yes |

Exact permissions should be finalized during implementation.

---

# 120. ADMIN ROLE GRANULARITY

If the admin panel becomes large, introduce permission-based authorization.

Example permissions:

- `content.read`
- `content.write`
- `syllabus.publish`
- `resource.moderate`
- `quiz.manage`
- `users.read`
- `users.manage`
- `support.read`
- `support.reply`
- `notifications.send`
- `audit.read`

This scales better than adding dozens of roles.

---

# 121. DEVELOPER CONTACT FLOW

Student flow:

1. Open Contact Developer.
2. Select category.
3. Enter subject.
4. Write message.
5. Optionally attach file.
6. Submit.
7. Conversation created.
8. Developer receives notification.
9. Developer replies.
10. Student receives notification.
11. Student opens conversation.
12. Student replies if needed.
13. Developer resolves.
14. Conversation remains accessible in history.

This creates a simple support system without turning the app into a social network.

---

# 122. BUG REPORT DATA

Bug reports can optionally capture:

- app version
- browser
- operating system
- current route
- timestamp

Do not automatically collect excessive device information.

A helpful bug report might contain:

"Quiz submit button does nothing."

The system can automatically attach:

`app_version = 1.2.0`

`route = /quiz/abc`

This improves debugging.

---

# 123. FEATURE REQUEST DATA

Feature requests can be categorized and optionally voted on later.

Fields:

- title
- description
- submitted_by
- status
- priority
- created_at

Statuses:

- submitted
- reviewing
- planned
- in_development
- released
- declined

---

# 124. USER FEEDBACK

Feedback should be distinct from support where possible.

Support:

"Something is broken."

Feedback:

"I like the app but would prefer calendar reminders."

This separation improves admin workflows.

---

# 125. ANALYTICS

Basic product analytics can measure:

- active users
- quiz starts
- quiz completions
- resource views
- PYQ downloads
- search usage
- toolbox usage
- support volume

Avoid collecting unnecessary personal information.

Use aggregated analytics where possible.

---

# 126. ADMIN DASHBOARD METRICS

Potential cards:

- total students
- active students
- pending resources
- published resources
- quizzes attempted today
- unread support conversations
- unread reports
- upcoming exams
- notification delivery status

Each metric should use efficient queries.

Do not load entire tables just to count rows.

Use database aggregation.

---

# 127. RATE LIMITING

User-generated actions should have limits.

Examples:

- resource submissions
- support messages
- feedback
- quiz attempts
- notification subscriptions

Without limits, a malicious client can spam the database.

Rate limiting can be implemented at the application/server layer and, where practical, through database checks.

---

# 128. RESOURCE SUBMISSION LIMIT

Example policy:

A student may submit a limited number of resources per day.

The exact number should be configurable.

The limit protects storage and moderation capacity.

---

# 129. SUPPORT SPAM PROTECTION

Prevent a student from creating hundreds of support conversations.

Possible approach:

- one open conversation per category, or
- cooldown between new conversations.

The UI should explain the reason politely.

---

# 130. QUIZ ABUSE

If quizzes have limited attempts:

The backend must enforce the limit.

Do not rely on localStorage.

For example:

`attempt_count < max_attempts`

must be checked server-side.

---

# 131. DUPLICATE RESOURCE DETECTION

Resources can be checked for duplicates using:

- normalized title
- file hash
- subject
- semester

A file hash can identify identical files.

This can reduce duplicate submissions.

---

# 132. FILE HASH

For uploaded files, store a cryptographic hash where appropriate.

For example:

`sha256`

This can help detect:

- duplicate uploads
- changed files
- integrity issues

The hash should not be used as the only authorization mechanism.

---

# 133. RESOURCE AUTHOR DISPLAY

For student-contributed resources, the UI can show:

"Submitted by Abhishek"

or:

"Community Contributor"

depending on privacy design.

Never expose the uploader's private contact details.

The database can contain the user ID while the public UI uses a safe display name.

---

# 134. OFFICIAL BADGE

Approved official/admin content may receive:

`is_verified = true`

or a source/verification state.

The UI can display:

**Verified**

The meaning must be clearly defined.

A student-uploaded resource should not automatically receive an official badge merely because a moderator approved it.

---

# 135. CONTENT MODERATION NOTES

Internal moderation notes should never be visible to ordinary students.

Store them separately or protect them with strict RLS.

For example:

"Possible duplicate of resource 492."

This is internal information.

---

# 136. ADMIN CONTENT PREVIEW

Before publishing, administrators should be able to preview:

- title
- description
- file
- metadata
- target audience
- effective date

Preview mode should not automatically make content publicly accessible.

---

# 137. SCHEDULED PUBLISHING

For syllabus, announcements and resources, scheduled publishing may be useful.

Fields:

- `publish_at`
- `status = scheduled`

A trusted scheduled function/job can transition the content to published.

Do not rely on a user's browser being open at the scheduled time.

---

# 138. ARCHIVING

Archived content should generally be excluded from normal student queries.

However, administrators should retain access.

Archive instead of deleting when historical traceability matters.

---

# 139. DATABASE BACKUPS

Production database backups must be configured according to the selected Supabase plan and recovery requirements.

Do not assume that "cloud database" means "we never need backups."

Important data includes:

- student profiles
- quizzes
- syllabus
- calendar
- resources
- moderation history
- support conversations

---

# 140. RECOVERY PLAN

A recovery plan should define:

1. What data is backed up?
2. How often?
3. How long retained?
4. Who can restore?
5. How restoration is tested?
6. What happens if storage files are lost?
7. How database and storage consistency is restored?

A backup that has never been tested is not a reliable recovery strategy.

---

# 141. STORAGE/DATABASE CONSISTENCY

A common problem:

Database says:

`resource_file.pdf`

but the actual file was deleted.

Therefore file lifecycle operations should be controlled.

Do not allow arbitrary users to delete storage objects without updating related metadata.

A cleanup job can detect orphaned files.

---

# 142. ORPHAN FILE CLEANUP

Potential orphan examples:

- upload succeeded but database insert failed
- database record deleted but file remained
- moderation rejected file but temporary file was never removed

A periodic cleanup process can identify temporary/unreferenced objects.

Be careful not to delete files that are intentionally referenced indirectly.

---

# 143. DATABASE PERFORMANCE

Initial BEU BABA traffic may be small.

Do not prematurely build an overly complex distributed architecture.

Supabase + PostgreSQL is sufficient for a large amount of educational application traffic when queries, indexes and security policies are designed correctly.

Scale based on measurements.

---

# 144. N+1 QUERY PROBLEM

Avoid patterns such as:

1. fetch 50 resources;
2. perform one subject query per resource;
3. perform one user query per resource.

Instead, use joins or batched queries.

The frontend should not accidentally create dozens of database requests for one screen.

---

# 145. DASHBOARD QUERY STRATEGY

A dashboard may use several independent queries:

- profile
- announcements
- calendar
- notifications
- resources
- quizzes

These can be executed concurrently where appropriate.

Do not create one enormous SQL query merely because it sounds efficient.

Balance readability and performance.

---

# 146. DATABASE NAMING CONVENTIONS

Use consistent naming.

Recommended:

- lowercase
- snake_case
- singular or plural convention chosen once

Example:

`student_profiles`

`courses`

`subjects`

`quiz_attempts`

Do not mix:

`userProfile`

`Student_Data`

`quizAttempts`

inside PostgreSQL.

---

# 147. PRIMARY KEY FORMAT

UUIDs are recommended for externally exposed entities.

Benefits:

- non-sequential public IDs
- distributed generation
- reduced enumeration risk

Do not treat UUIDs as a complete security mechanism.

Authorization is still mandatory.

---

# 148. PUBLIC URL DESIGN

Routes can use:

`/resources/{uuid}`

or a stable slug.

For SEO/public content, a slug can be useful.

For private student records, avoid predictable numeric IDs.

---

# 149. SLUGS

Content can have:

`slug`

Example:

`dbms-2025-pyq`

Slug uniqueness should be enforced.

If content titles change, decide whether slugs should change or remain stable.

Stable URLs are generally preferable.

---

# 150. CONTENT IDENTIFIERS

Use UUID for database identity.

Use slug for human-readable URL.

Use display title for presentation.

Do not use title as primary key.

---

# 151. ERROR HANDLING

Database errors should not expose raw internal details to users.

Bad:

"ERROR: relation public.secret_table does not exist"

Good:

"Something went wrong while loading this resource."

Detailed errors can be logged securely for developers.

---

# 152. CLIENT ERROR MAPPING

The application should map common backend errors:

- unauthorized
- forbidden
- not found
- validation failed
- duplicate
- rate limited
- storage failure
- network error

Each should have a clear user-facing state.

---

# 153. TRANSACTIONAL OPERATIONS

Use transactions for operations that must succeed or fail together.

Example:

Publishing a resource might require:

1. update resource status;
2. create moderation action;
3. create audit record.

If one fails, the system should avoid an inconsistent partial state.

A database function can perform the workflow atomically.

---

# 154. RESOURCE APPROVAL TRANSACTION

Conceptually:

1. verify moderator role;
2. lock resource;
3. verify current status is pending;
4. update status;
5. create moderation record;
6. create audit record;
7. optionally create notification;
8. commit.

This prevents race conditions where two moderators approve/reject the same resource simultaneously.

---

# 155. CONCURRENCY

Admin workflows can be concurrent.

Two admins may edit the same syllabus.

Optimistic concurrency can be implemented using:

- `updated_at`
- version number

A client submits:

"Update record where id = X and version = 4."

If the current version is 5, reject and ask the admin to refresh.

This prevents silent overwrites.

---

# 156. CONTENT VERSION NUMBER

Use an integer version where practical:

`version = 1`

`version = 2`

`version = 3`

Each published version is immutable.

The current active version can be referenced by the parent content entity.

---

# 157. QUIZ SNAPSHOT

For maximum integrity, a submitted quiz attempt should reference the exact quiz version.

Never depend on the current quiz table after submission.

This guarantees historical accuracy.

---

# 158. QUESTION RANDOMIZATION

If questions/options are randomized:

The attempt should store enough information to reproduce the presented order.

Otherwise reviewing an old attempt may show a different order than the student saw.

Possible fields:

- question_order
- option_order

or an attempt snapshot.

---

# 159. QUIZ TIMER

The frontend timer is for display.

The backend should store:

- started_at
- allowed_duration
- submitted_at

If strict timing is required, backend logic should determine whether the attempt was submitted within the allowed duration.

Do not trust the browser clock.

---

# 160. QUIZ AUTO-SAVE

If answers are autosaved:

- save only the student's own attempt;
- validate question ownership;
- avoid sending a database request on every keystroke;
- debounce updates;
- batch updates where possible.

---

# 161. OFFLINE QUIZ CONSIDERATION

Offline quizzes are significantly more complex because cheating and synchronization become concerns.

Initial implementation should preferably require connectivity for authoritative quiz submission.

Offline mode can be considered later with signed quiz packages and synchronization logic.

---

# 162. RESOURCE DOWNLOAD SECURITY

If educational PDFs are protected, use signed URLs with expiration.

Do not expose permanent private storage URLs.

However, signed URLs cannot completely prevent a user from copying a file once they have access.

The goal is controlled access, not impossible copying.

---

# 163. CONTENT PROTECTION REALITY

No web application can guarantee that a user can view a PDF/video but can never save it.

Screenshots, screen recording and browser tools exist.

The correct goal is:

- authenticated access
- authorization
- expiring URLs
- reasonable anti-abuse controls
- watermarking where appropriate
- monitoring
- legal/content policies

Do not build fake "unbreakable" protection.

---

# 164. WATERMARKING

For sensitive educational PDFs, optional watermarking can include:

- user display name
- user ID fragment
- timestamp

This can discourage redistribution.

Watermarking should be implemented server-side for meaningful protection.

---

# 165. USER-SPECIFIC DOWNLOAD URL

A secure flow:

1. Student requests document.
2. Backend verifies entitlement.
3. Backend creates short-lived signed URL.
4. Student downloads.
5. Optional download event recorded.

The permanent storage path does not need to be exposed.

---

# 166. COURSE ENTITLEMENT

If BEU BABA later adds paid courses, create an entitlement model.

Potential entities:

- products
- courses
- purchases
- subscriptions
- entitlements

A student should access premium content based on an active entitlement.

Do not simply store:

`is_paid = true`

in the profile.

A proper entitlement record can support expiration, refunds and multiple products.

---

# 167. FUTURE PAYMENT ARCHITECTURE

If payments are added later:

`orders`

`order_items`

`payments`

`entitlements`

`subscriptions`

The payment gateway should remain the source of transaction status where appropriate, while the application stores verified results.

Never trust a frontend "payment successful" boolean.

---

# 168. COURSE CONTENT ACCESS

Premium content should be checked server-side.

For example:

Student requests premium PDF.

Backend verifies:

- authenticated user;
- active entitlement;
- content published;
- course association.

Then access is granted.

---

# 169. DATA EXPORT

A future account settings feature may allow users to request their data.

Exportable data may include:

- profile
- quiz results
- bookmarks
- support conversations
- uploaded resources

Do not export internal moderation notes or secrets.

---

# 170. ACCOUNT DELETION

Account deletion is a serious workflow.

Potential sequence:

1. user requests deletion;
2. identity is verified;
3. account enters deletion state;
4. personal profile data is deleted/anonymized according to policy;
5. required legal/audit records are retained only where necessary;
6. user-owned private files are removed;
7. approved educational content may be anonymized rather than deleted;
8. Auth account is removed.

Do not automatically delete valuable public resources if they have become part of the educational library without first deciding ownership policy.

---

# 171. ANONYMIZATION

For approved community content, after account deletion the system could display:

"Community Contributor"

instead of a deleted user's name.

This preserves educational value while removing personal identity.

---

# 172. DATA OWNERSHIP POLICY

The product must define:

- who owns student-submitted resources;
- whether admins may edit metadata;
- whether resources can be removed;
- whether user deletion removes public submissions;
- how copyright complaints are handled.

These are product/legal decisions, but the database should support them.

---

# 173. COPYRIGHT REPORTING

A resource reporting workflow should allow a rights holder or user to flag potentially unauthorized material.

Do not automatically republish files merely because they were uploaded.

Moderation must consider source and rights.

---

# 174. OFFICIAL CONTENT DISTINCTION

The database should distinguish:

`source_type = official`

from:

`source_type = community`

This prevents accidental claims that every document is an official university publication.

---

# 175. ACADEMIC CALENDAR SOURCE

Calendar records should ideally include source information.

Example:

`source_name = official notice`

`source_reference = ...`

This helps administrators verify changes.

---

# 176. CONTENT IMPORT

If academic data is initially extracted from another application, PDF or dataset, the import process should create normalized records.

Do not permanently depend on scraped HTML if the source is not stable.

Imported content should pass validation.

---

# 177. JSON IMPORT/EXPORT

For initial migration, JSON can be useful.

Example conceptual structure:

```json
{
  "courses": [],
  "branches": [],
  "subjects": [],
  "syllabus": [],
  "academic_calendar": [],
  "pyq": []
}
```

The JSON should be treated as an import/export format, not necessarily the live database.

PostgreSQL remains the source of truth after migration.

---

# 178. IMPORT VALIDATION

Before importing JSON:

- validate schema;
- verify required IDs;
- detect duplicates;
- validate references;
- normalize strings;
- validate dates;
- validate semester values;
- detect missing files.

Never blindly insert arbitrary JSON into production.

---

# 179. DATABASE SEED IMPORT ORDER

A safe order:

1. courses
2. branches
3. academic years
4. subjects
5. subject mappings
6. syllabus
7. calendar
8. PYQ metadata
9. resources
10. quizzes

Parent records should exist before dependent records.

---

# 180. DATABASE DOCUMENTATION

Every table should have documentation covering:

- purpose
- important columns
- relationships
- RLS expectations
- write ownership
- lifecycle
- deletion behavior

This document itself is part of that documentation.

---

# 181. RECOMMENDED INITIAL TABLE GROUPS

### Identity
- profiles
- roles
- user_roles

### Academic
- courses
- branches
- academic_years
- subjects
- subject_offerings
- syllabus
- syllabus_versions
- academic_calendar_events

### PYQ
- pyqs

### Quiz
- quizzes
- quiz_versions
- quiz_questions
- quiz_options
- quiz_attempts
- quiz_answers
- quiz_results

### Community resources
- resources
- resource_files
- resource_moderation_actions
- resource_reports

### Communication
- support_conversations
- support_messages
- feedback
- feature_requests

### Notifications
- notifications
- user_notifications
- push_subscriptions

### Product
- announcements
- app_config
- feature_flags
- toolbox_tools

### Security/operations
- audit_logs
- system_events

---

# 182. PROFILE TABLE EXAMPLE DESIGN

Conceptually:

```sql
profiles
---------
id uuid primary key
full_name text not null
contact_number text
gender text
course_id uuid
branch_id uuid
semester_number integer
avatar_type text
avatar_id text
avatar_path text
bio text
is_active boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

The actual implementation should include foreign keys and constraints.

Do not copy this blindly without reviewing the final product requirements.

---

# 183. COURSE TABLE EXAMPLE

```sql
courses
-------
id uuid primary key
name text not null
short_name text
description text
duration_years numeric
is_active boolean default true
display_order integer default 0
created_at timestamptz
updated_at timestamptz
```

Course records are administrative content.

Students should generally have read access.

Only authorized roles should write.

---

# 184. SUBJECT TABLE EXAMPLE

```sql
subjects
--------
id uuid primary key
course_id uuid not null
code text not null
name text not null
short_name text
description text
is_active boolean default true
display_order integer default 0
created_at timestamptz
updated_at timestamptz
```

If subjects can belong to multiple courses, revise this design to use a mapping table.

---

# 185. RESOURCE TABLE EXAMPLE

```sql
resources
---------
id uuid primary key
submitted_by uuid
title text not null
description text
subject_id uuid
semester_number integer
resource_type text
status text not null
is_verified boolean default false
created_at timestamptz
updated_at timestamptz
published_at timestamptz
```

Files should be separate storage objects.

---

# 186. SUPPORT CONVERSATION EXAMPLE

```sql
support_conversations
---------------------
id uuid primary key
user_id uuid not null
subject text not null
category text not null
status text not null
priority text not null
assigned_to uuid
created_at timestamptz
updated_at timestamptz
last_message_at timestamptz
```

The user foreign key is the central privacy boundary.

---

# 187. SUPPORT MESSAGE EXAMPLE

```sql
support_messages
----------------
id uuid primary key
conversation_id uuid not null
sender_id uuid not null
message text not null
attachment_path text
created_at timestamptz
edited_at timestamptz
deleted_at timestamptz
```

RLS must ensure the sender can access the conversation.

---

# 188. NOTIFICATION EXAMPLE

```sql
notifications
-------------
id uuid primary key
title text not null
body text not null
type text not null
target_type text not null
created_by uuid
created_at timestamptz
publish_at timestamptz
```

Recipient targeting can be represented separately.

---

# 189. AUDIT LOG EXAMPLE

```sql
audit_logs
----------
id uuid primary key
actor_id uuid
action text not null
entity_type text not null
entity_id uuid
before_data jsonb
after_data jsonb
metadata jsonb
created_at timestamptz not null
```

Audit records should be append-only from the application's perspective.

---

# 190. JSONB USAGE

JSONB is useful for flexible metadata.

Good uses:

- optional notification metadata
- quiz configuration
- audit snapshots
- tool configuration

Bad use:

Putting the entire normalized academic database into one giant JSONB column.

Example of poor design:

`course_data jsonb`

containing courses, subjects, syllabus, PYQs and users.

This destroys relational integrity and makes querying harder.

---

# 191. WHEN TO NORMALIZE

Normalize when:

- entities have independent lifecycle;
- relationships matter;
- data is queried separately;
- integrity constraints are needed.

Use JSONB when:

- structure is genuinely variable;
- metadata is auxiliary;
- relational querying is unnecessary.

---

# 192. DATABASE SECURITY ANTI-PATTERNS

Never:

1. expose service-role keys;
2. disable RLS for convenience;
3. trust frontend roles;
4. store passwords manually;
5. store private files in public buckets without reason;
6. expose all student profiles;
7. trust client-generated scores;
8. allow arbitrary file types;
9. put secrets in database rows readable by clients;
10. use email as storage path;
11. use sequential IDs for sensitive resources and assume authorization is unnecessary;
12. return internal moderation notes to students.

---

# 193. FRONTEND/BACKEND CONTRACT

The frontend should know:

- what fields it may read;
- what fields it may submit;
- what status values exist;
- what errors can occur.

It should not assume that every database column is public.

Prefer typed data models.

For TypeScript, generated Supabase database types can help maintain consistency.

---

# 194. TYPE GENERATION

Use generated database types where practical.

This reduces mistakes such as:

`semester: "four"`

when the database expects:

`4`

It also helps detect renamed columns during development.

---

# 195. SERVICE LAYER

Frontend code should not scatter raw Supabase queries everywhere.

Prefer:

`resourceService`

`quizService`

`supportService`

`syllabusService`

`notificationService`

This centralizes:

- query logic
- mutations
- error handling
- transformations

---

# 196. QUERY HOOKS

React hooks can wrap service calls.

Examples:

`useCurrentProfile()`

`usePublishedSyllabus()`

`useResources()`

`useQuiz()`

`useSupportConversation()`

`useNotifications()`

The hooks should remain focused.

Do not put giant business workflows into one hook.

---

# 197. CACHE KEYS

Use predictable query keys.

Examples:

`['profile', userId]`

`['syllabus', courseId, branchId, semester]`

`['resources', filters]`

`['quiz', quizId, version]`

This makes invalidation reliable.

---

# 198. MUTATION INVALIDATION

After approving a resource:

Invalidate:

- moderation queue;
- published resources if applicable;
- relevant subject resource list;
- user submission history.

After publishing syllabus:

Invalidate:

- syllabus query;
- dashboard relevant-content query.

Do not refresh the entire application unnecessarily.

---

# 199. REALTIME + CACHE

Realtime events can trigger targeted cache invalidation.

Example:

Developer sends message.

Realtime event arrives.

Invalidate:

`['support-conversation', conversationId]`

and:

`['support-unread-count']`

This keeps UI responsive without reloading everything.

---

# 200. FINAL BACKEND ARCHITECTURE RULES

The following rules are mandatory for the BEU BABA implementation:

1. PostgreSQL is the authoritative application data source.
2. Supabase Auth is the authoritative authentication identity system.
3. RLS is mandatory for protected tables.
4. Frontend checks are never sufficient for authorization.
5. Service-role credentials never enter the frontend.
6. Student data is private by default.
7. Developer support messages are private per conversation.
8. Student resource uploads are moderated before public visibility.
9. Published academic content is database-driven.
10. Syllabus and calendar changes must not require a frontend redeploy.
11. PYQs should use storage plus metadata rather than huge database blobs.
12. Quiz scoring must be server-authoritative.
13. Published quiz versions should be immutable.
14. Audit history should be preserved for important administrative actions.
15. Storage access must follow database authorization.
16. User-uploaded files require validation.
17. Public and private files must be deliberately separated.
18. Database migrations must be version-controlled.
19. Production and development databases must be separated.
20. Backup and recovery must be planned before production launch.
21. Data collection must be minimal and purposeful.
22. Search must use database-side filtering rather than downloading entire datasets.
23. Pagination is mandatory for potentially large lists.
24. Indexes must follow real query patterns.
25. Realtime should be used selectively.
26. Sensitive data must never be exposed through broad views.
27. Content must support lifecycle states.
28. Future paid-course entitlements should be modeled separately from profiles.
29. Account deletion must consider public educational content and audit requirements.
30. Every major workflow must be understandable and reproducible by another developer.

---

# 201. IMPLEMENTATION PHASE PLAN

## Phase 1 — Foundation

Implement:

- Supabase project
- Auth
- profiles
- roles
- RLS
- courses
- branches
- subjects
- migrations
- generated TypeScript types

Do not start with decorative admin features before security foundation.

## Phase 2 — Academic Content

Implement:

- syllabus
- academic calendar
- PYQ
- storage
- publishing states

## Phase 3 — Quiz

Implement:

- quizzes
- versions
- questions
- options
- attempts
- answers
- scoring
- results

## Phase 4 — Community

Implement:

- resource submission
- moderation
- reports
- approved resource library

## Phase 5 — Communication

Implement:

- support conversations
- support messages
- Realtime
- notifications

## Phase 6 — Admin

Implement:

- student management
- content management
- moderation
- notification composer
- audit logs

## Phase 7 — Optimization

Implement:

- caching
- indexes
- pagination
- analytics
- push notifications
- advanced search

---

# 202. AI CODING AGENT INSTRUCTIONS

Any AI coding agent working on BEU BABA must follow these backend rules.

Never:

- disable RLS to fix an error;
- use service-role keys in browser code;
- expose all rows and filter client-side;
- store passwords;
- trust frontend role values;
- return private student data unnecessarily;
- make quiz scores client-authoritative;
- publish user uploads immediately;
- use public storage for private messages;
- hard-delete important content without confirmation.

When implementing a new feature, the agent must first answer:

1. What database entities are involved?
2. Who owns each record?
3. Who can read it?
4. Who can insert it?
5. Who can update it?
6. Who can delete/archive it?
7. What RLS policy enforces those rules?
8. Does the feature require storage?
9. Does it require a transaction?
10. Does it require an audit log?
11. Does it require notification?
12. Does it need pagination?
13. Does it need indexes?
14. What happens if two users perform the action simultaneously?
15. What happens if the operation partially fails?
16. What data should remain after account deletion?
17. Is any personal information unnecessarily collected?
18. Is the feature safe against direct API manipulation?

The agent must not consider a feature complete until these questions have reasonable answers.

---

# 203. FINAL DATA FLOW

The intended BEU BABA data flow is:

**Student**

↓

**Supabase Auth**

↓

**Authenticated UUID**

↓

**RLS-protected profile**

↓

**Academic context**

↓

**Course / Branch / Semester**

↓

**Personalized educational content**

↓

- Syllabus
- PYQ
- Quiz
- Resources
- Calendar
- Announcements
- Toolbox

Parallel communication path:

**Student**

↓

**Support conversation**

↓

**Developer/Admin**

↓

**Reply**

↓

**Notification**

↓

**Student**

Community contribution path:

**Student**

↓

**Resource upload**

↓

**Private storage**

↓

**Pending submission**

↓

**Moderator**

↓

**Approved**

↓

**Published resource**

↓

**Students**

Administrative path:

**Admin**

↓

**Content Management**

↓

**Draft**

↓

**Review**

↓

**Publish**

↓

**Database**

↓

**Student application**

---

# 204. DEFINITION OF DONE

The backend should not be considered production-ready merely because:

- registration works;
- data appears in Supabase;
- admin can edit records;
- the frontend looks beautiful.

Production readiness requires:

### Identity
- Auth works.
- Profile creation works.
- Verification works if enabled.

### Authorization
- RLS is enabled.
- Student isolation is verified.
- Admin permissions are verified.

### Content
- Academic data is normalized.
- Publishing states work.
- Versioning exists where required.

### Storage
- Private/public boundaries are correct.
- Upload limits exist.
- File validation exists.

### Community
- Resource moderation works.
- Reports work.
- Approved content is separated from pending content.

### Quiz
- Attempts are private.
- Scoring is authoritative.
- Versions are stable.

### Support
- Conversations are private.
- Realtime works if enabled.
- Developer replies reach the correct user.

### Notifications
- Recipient targeting works.
- Read state works.
- Push infrastructure is secure if enabled.

### Operations
- Migrations are versioned.
- Backups exist.
- Audit logging exists for critical actions.
- Monitoring/error reporting exists.

### Privacy
- Minimal data collection.
- No accidental student directory exposure.
- No secret leakage.
- Account lifecycle is defined.

---

# 205. CONCLUSION

BEU BABA should be built as a serious data-driven educational product rather than as a static frontend connected to a few tables.

The most important architectural decision is to make the database the source of truth while keeping the frontend responsible for presentation and interaction.

A premium UI can make BEU BABA look polished, but the backend determines whether it is reliable.

The application must therefore be designed around:

**Identity → Authorization → Academic Data → Content Lifecycle → Community Moderation → Quiz Integrity → Private Support → Notifications → Storage Security → Auditability → Scalability.**

The database must remain understandable.

The permissions must remain explicit.

The content must remain editable without rebuilding the app.

The user must remain in control of their private information.

The administrator must have powerful tools without bypassing security.

The student contribution system must encourage useful resources without allowing unmoderated material to become official-looking content.

The quiz system must preserve historical accuracy.

The support system must remain private.

The storage layer must not become an uncontrolled file dump.

The final architecture should allow BEU BABA to start small while preserving a clean path toward:

- more courses;
- more branches;
- more students;
- more quizzes;
- richer analytics;
- premium courses;
- push notifications;
- advanced search;
- community resources;
- mobile applications;
- additional administrators;
- faculty/teacher accounts;
- recommendation systems;
- and future integrations.

The key principle is simple:

**Do not design the backend around what the application looks like today. Design the backend around the educational entities, relationships, permissions and workflows that BEU BABA will need to remain reliable as the product grows.**
