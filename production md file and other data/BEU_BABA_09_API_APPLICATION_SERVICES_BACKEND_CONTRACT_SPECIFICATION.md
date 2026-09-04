# BEU BABA — 09 — API, APPLICATION SERVICES & BACKEND CONTRACT SPECIFICATION

**Document status:** Production architecture specification  
**Project:** BEU BABA  
**Document number:** 09  
**Purpose:** Define the complete application-service layer and API contract that sits between the BEU BABA frontend and the Supabase/PostgreSQL backend.  
**Audience:** Developers, architects, AI coding agents, reviewers, administrators, and future maintainers.  
**Implementation principle:** The frontend must consume stable application contracts rather than directly embedding business rules throughout UI components.

---

## 1. DOCUMENT PURPOSE

This document defines how BEU BABA should expose and consume backend functionality. It is intentionally separate from the database architecture specification. The database describes where data lives; this document describes how the application is allowed to request, validate, transform, publish, moderate, search, and mutate that data.

The goal is to prevent a common failure mode in student applications: a frontend becomes tightly coupled to database tables, every screen invents its own query logic, security rules become inconsistent, and later changes to syllabus, PYQ, quizzes, resources, notifications, or student support require rewriting multiple screens.

BEU BABA should instead have a predictable service boundary.

The application-service layer should:

1. Authenticate users.
2. Determine the authenticated student's identity.
3. Enforce authorization.
4. Validate request input.
5. Apply business rules.
6. Read or mutate data through controlled queries/functions.
7. Return predictable response objects.
8. Return useful and safe error messages.
9. Avoid leaking private information.
10. Support pagination and filtering.
11. Support versioned content.
12. Support moderation workflows.
13. Support administrative workflows.
14. Support future expansion without breaking existing clients.
15. Keep UI code focused on presentation and interaction.

This document therefore specifies the contract for:

- authentication;
- onboarding;
- student profiles;
- dashboard;
- courses;
- branches;
- semesters;
- subjects;
- syllabus;
- academic calendar;
- PYQs;
- quizzes;
- quiz attempts;
- student resources;
- moderation;
- bookmarks;
- progress;
- notifications;
- announcements;
- toolbox;
- developer support messages;
- admin operations;
- search;
- uploads;
- downloads;
- reporting;
- analytics;
- feature flags;
- app configuration;
- maintenance mode;
- auditability;
- errors;
- rate limits;
- caching;
- realtime events;
- web push;
- API versioning;
- testing;
- observability.

---

# 2. CORE ARCHITECTURE PRINCIPLE

BEU BABA should be designed as:

```text
┌───────────────────────────────────────────────────────────┐
│                     BEU BABA CLIENT                       │
│                                                           │
│ React + Vite + TypeScript                                 │
│ UI / UX / Animations / State / Client Validation          │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              │ HTTPS / Authenticated Requests
                              ▼
┌───────────────────────────────────────────────────────────┐
│                 APPLICATION SERVICE LAYER                 │
│                                                           │
│ Auth • Profiles • Content • Quiz • Resources • Support     │
│ Search • Notifications • Admin • Uploads • Analytics       │
│ Validation • Authorization • Business Rules                │
└─────────────────────────────┬─────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────────┐   ┌──────────────────────────┐
│ Supabase PostgreSQL       │   │ Supabase Storage         │
│ structured application    │   │ PDFs / images / files    │
│ data, policies, indexes   │   │ private/public objects   │
└───────────────────────────┘   └──────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│ Realtime / Edge Functions / Scheduled Jobs / Notifications│
└───────────────────────────────────────────────────────────┘
```

The frontend is not the security boundary.

A request such as:

```text
GET /api/admin/students
```

must never be considered safe merely because the Admin screen is hidden from normal students.

The backend must independently verify that the authenticated user has the required role.

Likewise, hiding a button such as:

```text
Delete Resource
```

does not provide authorization.

The server must reject the operation when the user does not have permission.

---

# 3. API DESIGN PHILOSOPHY

BEU BABA should use a contract-first approach.

Every important backend capability should have:

- request shape;
- authentication requirement;
- authorization requirement;
- validation rules;
- business rules;
- success response;
- error response;
- pagination behavior;
- caching policy;
- audit requirements;
- rate-limit policy.

The API should be predictable enough that an AI coding agent can implement a new screen without inventing database behavior.

Bad:

```text
Screen directly queries five tables.
Screen calculates publishing state.
Screen decides whether the student is allowed to edit.
Screen manually constructs notification text.
Screen decides whether resource is approved.
```

Good:

```text
Screen requests published resources.
Backend determines which resources are visible.
Backend returns normalized resource objects.
Screen renders the result.
```

The frontend may perform client-side validation for usability, but backend validation is authoritative.

---

# 4. API VERSIONING

The first production API should use a version prefix:

```text
/api/v1/
```

Examples:

```text
/api/v1/me
/api/v1/courses
/api/v1/subjects
/api/v1/syllabus
/api/v1/pyqs
/api/v1/quizzes
/api/v1/resources
/api/v1/notifications
/api/v1/support
```

Do not create random version formats such as:

```text
/api/new/
/api/latest/
/api/final/
/api/v2-final/
```

The version represents a compatibility contract.

If the response shape changes in a breaking way, introduce a new version.

Non-breaking changes may include:

- adding optional fields;
- adding new enum values only when clients safely tolerate them;
- adding metadata;
- adding pagination metadata.

Breaking changes include:

- removing fields;
- changing a field type;
- changing authentication requirements;
- changing semantic meaning;
- changing an existing enum into incompatible values.

---

# 5. AUTHENTICATION MODEL

BEU BABA should use Supabase Auth or an equivalent secure authentication provider.

The client obtains an authenticated session.

Conceptually:

```text
User
 ↓
Login/Register
 ↓
Authentication provider
 ↓
Session / access token
 ↓
Application request
 ↓
Backend verifies token
 ↓
Backend resolves user identity
 ↓
Backend resolves student profile / role
 ↓
Authorization
 ↓
Business operation
```

The application must never trust a user-supplied:

```text
user_id
role
is_admin
is_verified
```

as authoritative security information.

For example, a malicious client could send:

```json
{
  "user_id": "another-user-id",
  "is_admin": true
}
```

The backend must ignore these as authorization inputs.

The authenticated identity should come from the verified session.

---

# 6. AUTHENTICATION ENDPOINT CONTRACTS

## 6.1 Registration

```text
POST /api/v1/auth/register
```

Registration data may include:

```json
{
  "full_name": "Abhishek Kumar",
  "email": "student@example.com",
  "contact_number": "9876543210",
  "course_id": "course-id",
  "branch_id": "branch-id",
  "current_semester": 4,
  "gender": "male",
  "profile_image_path": null
}
```

The API should not blindly trust the supplied course or branch.

The backend verifies:

- course exists;
- branch exists;
- branch belongs to course;
- semester is valid;
- email is syntactically valid;
- contact number is valid;
- required fields exist;
- registration is not rate limited.

The authentication provider handles credential security.

Passwords must never be stored manually in the application's own student table.

---

# 7. PROFILE COMPLETION

After authentication, the user may have an account but an incomplete application profile.

Use:

```text
GET /api/v1/me
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com"
  },
  "profile": {
    "full_name": "Abhishek Kumar",
    "course": {},
    "branch": {},
    "semester": 4,
    "contact_number": "********10",
    "avatar": {}
  },
  "profile_complete": true
}
```

The API should explicitly provide:

```text
profile_complete
```

instead of requiring the frontend to guess based on ten nullable fields.

---

# 8. CURRENT USER ENDPOINTS

Recommended endpoints:

```text
GET    /api/v1/me
PATCH  /api/v1/me/profile
POST   /api/v1/me/avatar
DELETE /api/v1/me/avatar
POST   /api/v1/me/change-contact
POST   /api/v1/me/request-account-deletion
```

The profile update endpoint must only update fields that the student is permitted to change.

For example:

Student-editable:

- name;
- contact number;
- profile image;
- optional bio;
- selected preferences.

Potentially controlled:

- course;
- branch;
- semester.

Administrative or verified fields should not be freely editable if they influence content access.

---

# 9. AVATAR SYSTEM

BEU BABA supports two profile presentation modes:

1. Uploaded profile image.
2. Generated/selected character avatar.

The API should return:

```json
{
  "type": "character",
  "gender": "male",
  "character_id": "male-03",
  "url": "..."
}
```

or:

```json
{
  "type": "uploaded",
  "url": "..."
}
```

Gender-based automatic avatar selection should be treated as an initial selection mechanism, not an immutable identity rule.

A student should be able to select from approved avatar options where the product design allows it.

Never expose arbitrary storage objects as trusted HTML.

Validate:

- MIME type;
- file size;
- extension;
- image dimensions;
- upload ownership.

---

# 10. DASHBOARD SERVICE

The home dashboard should not execute a huge collection of unrelated queries every time it loads.

Recommended:

```text
GET /api/v1/dashboard
```

Response:

```json
{
  "greeting": {
    "name": "Abhishek"
  },
  "academic": {
    "course": {},
    "branch": {},
    "semester": 4
  },
  "quick_actions": [],
  "featured_content": [],
  "recent_pyqs": [],
  "quiz_highlights": [],
  "announcements": [],
  "upcoming_events": [],
  "continue_learning": [],
  "unread_notification_count": 3
}
```

This allows the backend to optimize the dashboard as one application use case.

The frontend should not need to know that the dashboard internally combines:

- profile;
- syllabus;
- PYQ;
- quiz;
- announcement;
- academic calendar;
- notification data.

---

# 11. COURSE API

Courses are foundational taxonomy objects.

```text
GET /api/v1/courses
GET /api/v1/courses/:courseId
```

Response:

```json
{
  "id": "uuid",
  "name": "B.Tech",
  "short_name": "B.Tech",
  "description": "...",
  "status": "active"
}
```

The API should return only active/public courses for normal students.

Admin endpoints may include archived courses.

---

# 12. BRANCH API

```text
GET /api/v1/courses/:courseId/branches
GET /api/v1/branches/:branchId
```

Example:

```json
{
  "id": "uuid",
  "name": "Computer Science and Engineering",
  "short_name": "CSE",
  "course_id": "uuid",
  "status": "active"
}
```

The backend must ensure branch/course relationships are valid.

---

# 13. SEMESTER API

```text
GET /api/v1/semesters
GET /api/v1/me/academic-context
```

A student's academic context should be available in a normalized object:

```json
{
  "course": {},
  "branch": {},
  "semester": {
    "number": 4,
    "label": "Semester 4"
  }
}
```

This context should drive content filtering.

---

# 14. SUBJECT API

```text
GET /api/v1/subjects
GET /api/v1/subjects/:subjectId
```

Filters:

```text
course_id
branch_id
semester
search
status
```

Student requests should normally default to their own academic context.

Example:

```text
GET /api/v1/subjects?semester=current
```

The backend resolves "current" from the authenticated student's profile.

This is safer and simpler than requiring the client to submit every academic identifier.

---

# 15. SYLLABUS API

Syllabus is versioned content.

Recommended endpoints:

```text
GET /api/v1/syllabus
GET /api/v1/syllabus/:syllabusId
GET /api/v1/subjects/:subjectId/syllabus
```

Filters:

```text
course
branch
semester
subject
version
```

Normal student behavior should return the currently published syllabus.

The student should not need to understand draft/version mechanics.

For example:

```text
GET /api/v1/syllabus?semester=current
```

may internally resolve:

```text
student → course → branch → semester → active syllabus version
```

---

# 16. SYLLABUS VERSIONING

A syllabus update must not destroy the historical record.

Use a conceptual lifecycle:

```text
DRAFT
 ↓
REVIEW
 ↓
APPROVED
 ↓
PUBLISHED
 ↓
ARCHIVED
```

Only one version should normally be considered active for a given content scope.

Example:

```text
CSE Semester 4
Version 2025-26
Version 2026-27
```

The API should expose the active version:

```json
{
  "version": "2026-27",
  "status": "published"
}
```

When an administrator updates the syllabus, the frontend should never need to manually modify old records.

---

# 17. ACADEMIC CALENDAR API

```text
GET /api/v1/calendar
GET /api/v1/calendar/events
GET /api/v1/calendar/events/:eventId
```

Filters:

```text
month
year
course
semester
event_type
```

Response:

```json
{
  "events": [
    {
      "id": "uuid",
      "title": "End Semester Examination",
      "start_date": "2026-05-10",
      "end_date": "2026-05-25",
      "event_type": "exam",
      "description": "...",
      "status": "published"
    }
  ]
}
```

The calendar must be server-driven so that administrators can update dates without publishing a new frontend build.

---

# 18. PYQ API

PYQ means Previous Year Questions.

Recommended endpoints:

```text
GET /api/v1/pyqs
GET /api/v1/pyqs/:pyqId
GET /api/v1/subjects/:subjectId/pyqs
POST /api/v1/pyqs/:pyqId/download
POST /api/v1/pyqs/:pyqId/bookmark
```

Filters:

```text
course
branch
semester
subject
year
exam_type
search
```

Example:

```text
GET /api/v1/pyqs?semester=current&subject=...
```

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "CSE Semester 4 2025 PYQ",
      "subject": {},
      "year": 2025,
      "exam_type": "end_semester",
      "file": {
        "name": "cse-sem4-2025.pdf",
        "size": 2840012
      },
      "is_bookmarked": false
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "has_next": true
  }
}
```

---

# 19. FILE DELIVERY FOR PYQs

Do not expose private storage credentials.

The backend should generate controlled signed access where necessary.

Conceptually:

```text
Client requests PYQ
 ↓
Backend verifies user
 ↓
Backend checks content visibility
 ↓
Backend generates short-lived signed URL
 ↓
Client downloads/views file
```

The signed URL should have a limited lifetime.

Do not put permanent private storage URLs into the database response if the object is supposed to be protected.

---

# 20. QUIZ API

Quiz is one of the major differentiating features of BEU BABA.

Core endpoints:

```text
GET  /api/v1/quizzes
GET  /api/v1/quizzes/:quizId
POST /api/v1/quizzes/:quizId/start
POST /api/v1/quizzes/:quizId/attempts
GET  /api/v1/quiz-attempts/:attemptId
POST /api/v1/quiz-attempts/:attemptId/submit
GET  /api/v1/quiz-attempts/:attemptId/result
```

A quiz should have:

- title;
- description;
- subject;
- difficulty;
- question count;
- duration;
- passing score;
- publication status;
- version;
- question set.

---

# 21. QUIZ START CONTRACT

```text
POST /api/v1/quizzes/:quizId/start
```

Response:

```json
{
  "attempt_id": "uuid",
  "quiz_id": "uuid",
  "started_at": "...",
  "expires_at": "...",
  "questions": [],
  "rules": {
    "negative_marking": false,
    "allow_navigation": true,
    "show_result_immediately": true
  }
}
```

The backend should create the attempt.

Do not generate a fake attempt ID only on the frontend.

---

# 22. QUIZ SECURITY

The client must not be the authority for:

- correct answers;
- final score;
- attempt duration;
- pass/fail;
- completion status.

For example, this is insecure:

```javascript
const score = selectedAnswers.filter(a => a.correct).length;
```

because the client could be manipulated.

The backend must evaluate authoritative answers.

The frontend may display a temporary local state, but final scoring must happen server-side.

---

# 23. QUIZ SUBMISSION

```text
POST /api/v1/quiz-attempts/:attemptId/submit
```

Request:

```json
{
  "answers": [
    {
      "question_id": "uuid",
      "selected_option_id": "uuid"
    }
  ]
}
```

Backend:

1. verifies ownership;
2. verifies attempt status;
3. verifies quiz version;
4. validates question IDs;
5. validates selected options;
6. evaluates answers;
7. calculates marks;
8. applies negative marking;
9. determines percentage;
10. determines pass/fail;
11. persists result;
12. returns result.

Response:

```json
{
  "attempt_id": "uuid",
  "score": 17,
  "total_marks": 20,
  "percentage": 85,
  "correct": 17,
  "incorrect": 3,
  "unanswered": 0,
  "passed": true
}
```

---

# 24. QUIZ CARD DOWNLOAD

BEU BABA can allow students to download a personalized result card.

Endpoint:

```text
POST /api/v1/quiz-attempts/:attemptId/result-card
```

The backend may generate a PDF/image containing:

- student display name;
- quiz name;
- subject;
- score;
- percentage;
- date;
- optional badge;
- BEU BABA branding;
- verification ID.

Do not expose unnecessary student information.

A verification QR/code can be added later.

---

# 25. QUIZ LEADERBOARD

If implemented, leaderboard visibility must be privacy-conscious.

Possible endpoint:

```text
GET /api/v1/quizzes/:quizId/leaderboard
```

Do not expose contact numbers or email addresses.

Display:

```text
Rank
Display name
Score
```

Optional privacy setting:

```text
Show me on leaderboard: Yes/No
```

---

# 26. RESOURCE UPLOAD API

Students can upload useful academic resources.

Recommended:

```text
POST /api/v1/resources/submissions
GET  /api/v1/resources
GET  /api/v1/resources/:resourceId
POST /api/v1/resources/:resourceId/report
```

Submission request:

```json
{
  "title": "Operating System Notes",
  "description": "Unit 1 to Unit 4 notes",
  "subject_id": "uuid",
  "resource_type": "notes",
  "file_path": "pending-upload-path"
}
```

The resource should initially have:

```text
pending
```

status.

It must not automatically become visible in the main resource listing.

---

# 27. RESOURCE MODERATION

Lifecycle:

```text
STUDENT SUBMITS
       ↓
PENDING
       ↓
ADMIN REVIEW
   ↙         ↘
REJECTED    APPROVED
              ↓
          PUBLISHED
```

Admin endpoints:

```text
GET  /api/v1/admin/resources/pending
POST /api/v1/admin/resources/:id/approve
POST /api/v1/admin/resources/:id/reject
```

Rejection should optionally require a reason.

Example:

```json
{
  "reason": "File is incomplete or unrelated to the selected subject."
}
```

The student should be able to see:

```text
Submission status: Rejected
Reason: ...
```

but should not see internal moderation notes unless explicitly designed to do so.

---

# 28. RESOURCE REPORTING

Students can report published content.

```text
POST /api/v1/resources/:resourceId/report
```

Possible categories:

```text
wrong_content
broken_file
duplicate
spam
copyright_concern
incorrect_subject
other
```

The backend should prevent repeated report spam.

Use a uniqueness/rate-control strategy.

---

# 29. BOOKMARK API

Bookmarkable content may include:

- PYQ;
- resource;
- syllabus item;
- quiz;
- announcement.

Generic endpoint:

```text
POST   /api/v1/bookmarks
DELETE /api/v1/bookmarks/:bookmarkId
GET    /api/v1/bookmarks
```

Request:

```json
{
  "content_type": "pyq",
  "content_id": "uuid"
}
```

The backend must validate that the content exists and is bookmarkable.

---

# 30. PROGRESS API

For educational content:

```text
GET /api/v1/progress
POST /api/v1/progress
```

Example:

```json
{
  "content_type": "subject",
  "content_id": "uuid",
  "progress_percent": 60,
  "last_opened_at": "..."
}
```

The server should normalize:

```text
-5 → 0
105 → 100
```

or reject invalid input.

Do not trust client-calculated progress for important certificates or eligibility decisions.

---

# 31. NOTIFICATION API

Endpoints:

```text
GET  /api/v1/notifications
POST /api/v1/notifications/:id/read
POST /api/v1/notifications/read-all
GET  /api/v1/notifications/unread-count
```

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "New PYQ Added",
      "body": "A new Semester 4 PYQ has been added.",
      "type": "content_update",
      "read": false,
      "created_at": "..."
    }
  ]
}
```

---

# 32. PUSH NOTIFICATION REGISTRATION

For a PWA, web push requires a browser subscription.

Recommended:

```text
POST /api/v1/push-subscriptions
DELETE /api/v1/push-subscriptions/:id
```

Request:

```json
{
  "endpoint": "...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "device_label": "Chrome Windows"
}
```

The backend should associate the subscription with the authenticated user.

Never allow a client to register a subscription for another user.

---

# 33. NOTIFICATION PREFERENCES

Provide:

```text
GET   /api/v1/me/notification-preferences
PATCH /api/v1/me/notification-preferences
```

Possible preferences:

```json
{
  "new_pyq": true,
  "new_resource": true,
  "quiz": true,
  "announcement": true,
  "academic_calendar": true,
  "support_reply": true
}
```

The notification engine must respect these preferences where applicable.

Critical transactional notifications may follow separate rules.

---

# 34. ANNOUNCEMENT API

```text
GET /api/v1/announcements
GET /api/v1/announcements/:id
```

Admin:

```text
POST   /api/v1/admin/announcements
PATCH  /api/v1/admin/announcements/:id
DELETE /api/v1/admin/announcements/:id
POST   /api/v1/admin/announcements/:id/publish
POST   /api/v1/admin/announcements/:id/archive
```

Announcements may target:

- all students;
- course;
- branch;
- semester;
- specific user group.

The backend must calculate targeting.

---

# 35. STUDENT TOOLBOX API

BEU BABA includes a Student Toolbox containing useful daily-life/academic utilities.

Possible tools:

- GPA calculator;
- CGPA calculator;
- percentage calculator;
- attendance calculator;
- marks calculator;
- unit converter;
- age calculator;
- date difference;
- study timer;
- Pomodoro timer;
- exam countdown;
- semester countdown;
- simple calculator;
- scientific calculator;
- note pad;
- QR generator;
- password generator;
- image compressor;
- PDF tools where legally and technically appropriate;
- text counter;
- BMI calculator only if product scope permits.

Not every toolbox tool requires backend storage.

Pure calculations should preferably run locally.

For example:

```text
CGPA = total grade points / total credits
```

does not require a server request.

This reduces server load and improves responsiveness.

---

# 36. DEVELOPER SUPPORT MESSAGE SYSTEM

The app should provide a direct message channel to the developer/admin.

This is not a public chat room.

Model:

```text
Student A
   ↕
Developer/Admin

Student B
   ↕
Developer/Admin
```

Student A must never see Student B's messages.

Endpoint:

```text
GET  /api/v1/support/conversation
POST /api/v1/support/messages
```

Admin:

```text
GET  /api/v1/admin/support/conversations
GET  /api/v1/admin/support/conversations/:id
POST /api/v1/admin/support/conversations/:id/messages
POST /api/v1/admin/support/conversations/:id/close
```

---

# 37. SUPPORT MESSAGE SECURITY

Every student message must belong to exactly one authenticated student.

The student endpoint should never accept arbitrary:

```text
student_id
```

to select a conversation.

Instead:

```text
authenticated user
       ↓
resolved student profile
       ↓
their support conversation
```

The backend performs ownership filtering.

Admin access requires explicit permission.

---

# 38. SUPPORT MESSAGE TYPES

Messages can have:

```text
bug_report
course_update
syllabus_update
content_request
feature_request
general_question
account_issue
other
```

The UI can offer a category selector before composing the message.

---

# 39. SUPPORT MESSAGE STATUS

Possible statuses:

```text
open
in_progress
waiting_for_student
resolved
closed
```

The system can automatically mark a conversation as:

```text
open
```

when a student sends a new message.

Admin reply can trigger a notification.

---

# 40. REALTIME SUPPORT CHAT

Supabase Realtime can be used for near-instant messages.

Conceptually:

```text
Student sends message
 ↓
Database insert
 ↓
Realtime event
 ↓
Admin dashboard receives event
```

and:

```text
Admin replies
 ↓
Database insert
 ↓
Realtime event
 ↓
Student receives message
```

Realtime is a delivery convenience, not the source of truth.

The database remains authoritative.

If realtime disconnects:

```text
GET conversation
```

must still restore the correct state.

---

# 41. SEARCH API

Global search:

```text
GET /api/v1/search?q=operating+system
```

Response:

```json
{
  "query": "operating system",
  "results": [
    {
      "type": "subject",
      "id": "uuid",
      "title": "Operating System"
    },
    {
      "type": "pyq",
      "id": "uuid",
      "title": "Operating System 2025 PYQ"
    },
    {
      "type": "resource",
      "id": "uuid",
      "title": "Operating System Notes"
    }
  ]
}
```

Search must respect visibility.

A draft syllabus should never appear in student search.

A rejected resource should never appear.

---

# 42. SEARCH RANKING

Search ranking may consider:

1. exact title match;
2. prefix match;
3. subject relevance;
4. academic context;
5. content popularity;
6. recent publication;
7. bookmark count;
8. resource quality signals.

Do not allow popularity to override safety or visibility.

---

# 43. PAGINATION

Every potentially large list must support pagination.

Recommended query parameters:

```text
page
page_size
```

or cursor-based pagination for very large datasets.

Default:

```text
page_size = 20
```

Maximum:

```text
page_size = 100
```

Never allow:

```text
page_size=1000000
```

without backend protection.

Response:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 237,
    "has_next": true
  }
}
```

For high-scale endpoints, prefer:

```text
next_cursor
```

over expensive total counts.

---

# 44. FILTERING

Use predictable query parameters.

Example:

```text
GET /api/v1/pyqs?
course_id=...
&branch_id=...
&semester=4
&subject_id=...
&year=2025
```

Do not create dozens of endpoint variants:

```text
/get-cse-pyq
/get-cse-sem4-pyq
/get-cse-sem4-os-pyq
/get-cse-sem4-os-2025-pyq
```

Prefer one filterable collection endpoint.

---

# 45. SORTING

Allowed sort fields should be whitelisted.

Example:

```text
sort=latest
sort=oldest
sort=popular
```

Never directly interpolate arbitrary client input into SQL `ORDER BY`.

Map allowed values:

```text
latest → created_at DESC
oldest → created_at ASC
popular → download_count DESC
```

---

# 46. ERROR RESPONSE STANDARD

Every API should return predictable errors.

Recommended:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": null,
    "request_id": "req_..."
  }
}
```

Use stable machine-readable codes.

Examples:

```text
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
RATE_LIMITED
FILE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
CONTENT_NOT_PUBLISHED
QUIZ_EXPIRED
ATTEMPT_ALREADY_SUBMITTED
RESOURCE_ALREADY_REPORTED
PROFILE_INCOMPLETE
INTERNAL_ERROR
```

Frontend logic should rely on `code`, not fragile English message matching.

---

# 47. VALIDATION ERROR

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid.",
    "details": {
      "full_name": "Name is required.",
      "contact_number": "Enter a valid contact number."
    }
  }
}
```

This allows the UI to highlight fields correctly.

---

# 48. HTTP STATUS CONVENTION

Recommended:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
413 Payload Too Large
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Do not return HTTP 200 for every failure.

Bad:

```json
{
  "success": false,
  "error": "not allowed"
}
```

with HTTP 200.

Correct authorization failure should use:

```text
403 Forbidden
```

---

# 49. REQUEST ID

Every backend request should have a request ID.

Example:

```text
X-Request-ID: req_8f91...
```

If an error occurs, the user-facing message can say:

```text
Something went wrong.
Reference: req_8f91...
```

This helps debugging without exposing stack traces.

---

# 50. INTERNAL ERROR SAFETY

Never return:

```text
SQL statement
database credentials
stack trace
storage key secrets
server filesystem path
environment variables
```

to the client.

Bad:

```json
{
  "error": "Postgres error at /srv/app/db/service.ts line 193"
}
```

Good:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong. Please try again.",
    "request_id": "req_..."
  }
}
```

Detailed technical information belongs in secure server logs.

---

# 51. ADMIN API ARCHITECTURE

Admin functionality must be isolated under:

```text
/api/v1/admin/
```

Examples:

```text
GET  /api/v1/admin/students
GET  /api/v1/admin/students/:id

GET  /api/v1/admin/resources/pending
POST /api/v1/admin/resources/:id/approve
POST /api/v1/admin/resources/:id/reject

POST /api/v1/admin/announcements
PATCH /api/v1/admin/announcements/:id

GET  /api/v1/admin/support/conversations

GET /api/v1/admin/analytics/overview
GET /api/v1/admin/audit-logs
```

---

# 52. ADMIN STUDENT LIST

```text
GET /api/v1/admin/students
```

Supported filters:

```text
search
course
branch
semester
status
registration_date
```

The response may include:

```json
{
  "id": "uuid",
  "full_name": "Student Name",
  "email": "student@example.com",
  "contact_number": "********10",
  "course": "B.Tech",
  "branch": "CSE",
  "semester": 4,
  "created_at": "...",
  "status": "active"
}
```

Sensitive information should only be shown to administrators who genuinely require it.

---

# 53. ADMIN STUDENT DETAIL

```text
GET /api/v1/admin/students/:studentId
```

May contain:

- profile;
- academic context;
- account status;
- quiz history;
- resource submissions;
- support status;
- bookmarks;
- activity summary.

Avoid returning raw authentication secrets.

---

# 54. ADMIN CONTENT MANAGEMENT

Every content-management endpoint should use a consistent lifecycle.

Example:

```text
create draft
 ↓
edit
 ↓
validate
 ↓
preview
 ↓
publish
 ↓
archive
```

The admin UI should not have a single destructive "Save Everything" action.

Separate:

```text
Save Draft
Publish
Unpublish
Archive
```

This reduces accidental publication.

---

# 55. PUBLISHING CONTRACT

Publishing endpoint:

```text
POST /api/v1/admin/content/:id/publish
```

The backend should verify:

- required fields;
- valid file;
- valid relationships;
- no invalid references;
- correct status;
- authorization.

Only after validation should the state change.

---

# 56. CONTENT PREVIEW

Admins need preview support.

```text
GET /api/v1/admin/content/:id/preview
```

Preview may show draft data to authorized admins while normal student APIs continue showing only published content.

This is essential for syllabus/calendar/resource editing.

---

# 57. FILE UPLOAD ARCHITECTURE

For large files, prefer direct-to-storage upload.

Flow:

```text
1. Client requests upload authorization.
2. Backend validates intended file metadata.
3. Backend returns controlled upload target.
4. Client uploads directly to storage.
5. Client confirms upload.
6. Backend verifies object metadata.
7. Backend attaches object to the database record.
```

Do not send every large PDF through the application server if direct storage upload is available.

---

# 58. UPLOAD INITIATION

```text
POST /api/v1/uploads/initiate
```

Request:

```json
{
  "filename": "notes.pdf",
  "content_type": "application/pdf",
  "size": 4920032,
  "purpose": "resource_submission"
}
```

Backend validates:

```text
allowed MIME
allowed extension
maximum size
user permission
purpose
```

Response:

```json
{
  "upload_id": "uuid",
  "storage_path": "temporary/uuid/notes.pdf",
  "upload_target": "controlled-target"
}
```

---

# 59. UPLOAD CONFIRMATION

```text
POST /api/v1/uploads/:uploadId/complete
```

Backend checks:

- upload belongs to user;
- expected size;
- object exists;
- object path is correct;
- allowed MIME;
- upload has not expired.

Only then should the file be attached to a permanent application object.

---

# 60. FILE NAMING

Never rely on user-provided filenames as storage identifiers.

Bad:

```text
storage/Operating System Notes.pdf
```

Better:

```text
resources/{resource_id}/{random-object-id}.pdf
```

The original filename can remain as display metadata.

This prevents collisions and reduces path manipulation risks.

---

# 61. FILE TYPE SECURITY

Never trust:

```text
.pdf
.jpg
.png
```

alone.

Validate MIME type and actual file characteristics where practical.

For PDF:

```text
application/pdf
```

For images:

```text
image/jpeg
image/png
image/webp
```

Reject executable or dangerous content.

Do not allow arbitrary HTML uploads into a public origin.

---

# 62. DOWNLOAD API

Where tracking is useful:

```text
POST /api/v1/files/:fileId/access
```

The backend can:

1. authenticate;
2. authorize;
3. record access;
4. return signed URL.

Do not record every single byte or request if unnecessary.

Track meaningful download events.

---

# 63. RATE LIMITING

Rate limits should protect:

- login;
- registration;
- OTP/email operations;
- support message sending;
- resource submissions;
- reports;
- quiz submission;
- search;
- upload initiation;
- admin endpoints.

Example conceptual limits:

```text
Support messages:
20/hour/user

Resource submissions:
10/day/user

Reports:
20/day/user

Search:
reasonable burst limit

Admin mutation:
strict per-user limit
```

Exact limits should be configurable.

Do not hard-code limits in UI.

---

# 64. IDEMPOTENCY

Operations that may be retried should support idempotency where appropriate.

Examples:

- payment later;
- resource submission;
- quiz submission;
- notification creation;
- admin publishing.

For sensitive operations:

```text
Idempotency-Key: uuid
```

The backend stores the result for the key during the required window.

This prevents duplicate submissions caused by double clicks or network retries.

---

# 65. DOUBLE SUBMISSION PROTECTION

For quiz submission:

```text
if attempt.status == submitted:
    reject
```

For support message:

avoid accidentally creating duplicate messages after a network retry.

For resource upload:

prevent duplicate permanent attachments.

Frontend buttons should disable during submission, but backend protection remains mandatory.

---

# 66. TRANSACTIONAL OPERATIONS

When several database changes represent one logical operation, use a transaction.

Example quiz submission:

```text
begin
 ↓
validate attempt
 ↓
calculate score
 ↓
insert answer records
 ↓
update attempt
 ↓
commit
```

If a critical step fails:

```text
rollback
```

The student must not end up with:

```text
attempt marked submitted
but no result
```

unless the architecture explicitly supports asynchronous result generation.

---

# 67. ASYNCHRONOUS JOBS

Some tasks should not block the user request:

- generating result cards;
- sending push notifications;
- processing analytics;
- thumbnail generation;
- file inspection;
- cleanup;
- digest notifications.

Flow:

```text
API request
 ↓
database event/job
 ↓
background worker/function
 ↓
task completed
```

The API can immediately return:

```json
{
  "status": "processing"
}
```

where appropriate.

---

# 68. NOTIFICATION EVENT ARCHITECTURE

Do not make every frontend screen manually create notifications.

Instead:

```text
Business event
 ↓
Notification service
 ↓
Determine recipients
 ↓
Check preferences
 ↓
Create notification
 ↓
Optional push delivery
```

Example:

```text
Admin publishes PYQ
 ↓
content.published
 ↓
notification service
 ↓
students matching subject/context
 ↓
in-app notification
 ↓
optional push notification
```

---

# 69. SUPPORT REPLY EVENT

```text
Admin sends reply
 ↓
support.message.created
 ↓
notification service
 ↓
student notification
 ↓
optional web push
```

The notification should link to:

```text
/support
```

or a conversation-specific route.

---

# 70. RESOURCE APPROVAL EVENT

```text
Resource approved
 ↓
student notified
```

Example:

```json
{
  "type": "resource_approved",
  "title": "Your resource was approved",
  "body": "Your Operating System notes are now visible."
}
```

---

# 71. RESOURCE REJECTION EVENT

```text
Resource rejected
 ↓
student notified
 ↓
show reason
```

This creates transparency.

---

# 72. REALTIME EVENT NAMING

Use stable names:

```text
support.message.created
support.conversation.updated
notification.created
resource.status.changed
quiz.attempt.completed
announcement.published
```

Do not use random frontend-specific names.

---

# 73. CLIENT STATE MANAGEMENT

The frontend should distinguish:

```text
server state
local UI state
session state
temporary form state
```

Server state includes:

- subjects;
- PYQs;
- resources;
- announcements;
- quizzes;
- notifications.

Local UI state includes:

- modal open/closed;
- selected tab;
- animation state;
- filter drawer.

Do not put the entire backend database into a global frontend store.

---

# 74. API CLIENT

Create one centralized API client.

Example conceptual structure:

```text
src/
  services/
    api/
      client.ts
      auth.ts
      profile.ts
      courses.ts
      subjects.ts
      syllabus.ts
      pyqs.ts
      quizzes.ts
      resources.ts
      notifications.ts
      support.ts
      admin.ts
```

Components should call service functions:

```text
pyqService.list()
quizService.start()
supportService.sendMessage()
```

rather than manually constructing URLs everywhere.

---

# 75. API CLIENT RESPONSIBILITIES

Central API client should handle:

- base URL;
- authentication token;
- JSON headers;
- request IDs;
- timeout;
- error normalization;
- retry rules;
- logging in development;
- session refresh where needed.

Do not duplicate this logic across 50 components.

---

# 76. RETRY POLICY

Retry only safe requests automatically.

Usually safe:

```text
GET
```

Potentially unsafe:

```text
POST
PATCH
DELETE
```

Unless idempotency or explicit safe retry behavior exists.

Never blindly retry quiz submission.

---

# 77. OFFLINE/PWA BEHAVIOR

BEU BABA can provide graceful offline behavior.

Cache:

- app shell;
- static assets;
- selected recently viewed content;
- non-sensitive configuration.

Be careful caching:

- private student data;
- support messages;
- account information.

A service worker must not accidentally make private content accessible to another user on a shared device.

---

# 78. CACHING

Cache stable content:

- course list;
- branch list;
- subject metadata;
- published syllabus;
- toolbox configuration.

Use shorter cache durations for:

- notifications;
- announcements;
- support messages;
- admin data.

After publishing important content, invalidate relevant caches.

---

# 79. CACHE INVALIDATION EXAMPLE

When admin publishes syllabus:

```text
publish syllabus
 ↓
invalidate syllabus cache
 ↓
invalidate subject cache if needed
 ↓
create notification
```

When a resource is approved:

```text
approve resource
 ↓
invalidate resource listing cache
 ↓
notify submitting student
```

---

# 80. DATA CONSISTENCY

Do not rely on eventually updated frontend caches for authoritative operations.

If the UI says:

```text
Resource approved
```

the backend must have actually committed the status before returning success.

Optimistic UI can be used for low-risk visual actions such as bookmark animations, but it must reconcile with server state.

---

# 81. ADMIN AUDIT LOGGING

Important admin actions should generate audit records:

```text
student account updated
resource approved
resource rejected
syllabus published
calendar event changed
announcement published
admin role changed
content deleted
content archived
```

Audit record:

```json
{
  "actor_id": "uuid",
  "action": "resource.approved",
  "entity_type": "resource",
  "entity_id": "uuid",
  "metadata": {},
  "created_at": "..."
}
```

Never allow ordinary students to modify audit records.

---

# 82. ADMIN ROLE MODEL

At minimum:

```text
student
admin
super_admin
```

Potential future:

```text
content_editor
moderator
support_agent
analytics_viewer
```

Authorization should be capability-oriented.

For example:

```text
can_manage_resources
can_manage_syllabus
can_manage_calendar
can_reply_support
can_manage_students
can_manage_admins
```

This is safer than sprinkling:

```text
if role === "admin"
```

everywhere.

---

# 83. AUTHORIZATION LAYERS

Use multiple layers:

```text
Layer 1: authentication
Layer 2: role/capability
Layer 3: resource ownership
Layer 4: content visibility
Layer 5: business rule
```

Example:

A student requests another student's support conversation.

Authentication passes.

Role check passes as student.

Ownership check fails.

Result:

```text
403 Forbidden
```

---

# 84. ROW LEVEL SECURITY

Where Supabase RLS is used, application code should assume that database policies are part of the security model.

Examples:

Student can:

```text
SELECT own profile
UPDATE own profile
SELECT published content
INSERT own support message
SELECT own support conversation
SELECT own quiz attempts
```

Student cannot:

```text
SELECT all profiles
UPDATE another profile
SELECT pending moderation notes
SELECT admin audit logs
UPDATE resource approval status
```

---

# 85. ADMIN RLS

Admin queries must be restricted to authorized roles.

Do not solve this by:

```text
frontend checks admin
```

or:

```text
hidden admin route
```

The database/application layer must enforce it.

---

# 86. CONTENT VISIBILITY

Define a common visibility model.

Possible:

```text
draft
pending
approved
published
archived
rejected
```

Student APIs should generally return:

```text
published
```

only.

Special cases should be explicit.

---

# 87. SOFT DELETE

Important educational content should generally not be immediately hard-deleted.

Prefer:

```text
archived
```

or:

```text
deleted_at
```

This helps recover accidental changes.

Hard deletion should be reserved for:

- legal/privacy requirements;
- cleanup of temporary files;
- explicit account deletion workflows;
- data retention policies.

---

# 88. PROFILE PRIVACY

Admin panels may display student data according to administrator permissions.

Students should never have an API allowing arbitrary student lookup.

Avoid endpoints like:

```text
GET /api/v1/students/:id
```

for normal student clients unless the data is explicitly public.

---

# 89. CONTACT NUMBER PROTECTION

Contact numbers are sensitive personal information.

Do not expose them in:

- leaderboards;
- public resource pages;
- search;
- announcements;
- student community listings.

If admins need the number, return it only to authorized admin endpoints.

---

# 90. EMAIL PROTECTION

Likewise, email addresses should not appear in public content.

Use:

```text
display_name
```

for student-facing public contexts.

---

# 91. ACCOUNT DELETION

Recommended:

```text
POST /api/v1/me/request-account-deletion
```

The deletion process should consider:

- profile;
- support messages;
- quiz attempts;
- resource submissions;
- uploaded files;
- analytics;
- audit records.

Not every record can necessarily be physically deleted immediately if legal or operational requirements require retention.

Where appropriate, anonymize:

```text
Student Name → Deleted User
Email → anonymized identifier
Contact → removed
```

---

# 92. DATA EXPORT

Future feature:

```text
POST /api/v1/me/request-data-export
GET  /api/v1/me/data-export/:id
```

Export may contain:

- profile data;
- bookmarks;
- quiz history;
- resource submissions;
- preferences.

Never include:

- internal admin notes;
- other students' messages;
- secrets;
- service credentials.

---

# 93. API RESPONSE NORMALIZATION

Do not return wildly different shapes.

List:

```json
{
  "items": [],
  "pagination": {}
}
```

Single item:

```json
{
  "data": {}
}
```

Mutation:

```json
{
  "data": {},
  "message": "..."
}
```

The exact envelope can be selected once and used consistently.

---

# 94. NULL HANDLING

The API must document nullable fields.

Do not randomly alternate:

```json
"profile_image": null
```

and:

```json
"profile_image": ""
```

Choose one semantic representation.

Prefer:

```text
null = unavailable/not set
```

Empty strings should generally not represent missing structured data.

---

# 95. DATE/TIME CONTRACT

Use ISO 8601.

Example:

```text
2026-09-01T18:30:00Z
```

Date-only fields:

```text
2026-09-01
```

Do not send ambiguous:

```text
09/01/26
```

The frontend can localize dates for Indian users.

---

# 96. TIME ZONES

Store timestamps in UTC where appropriate.

Display in the user's local timezone.

Academic dates that represent a local calendar day should be modeled as date-only values if time is not meaningful.

Do not convert an exam date into a timestamp merely because the database supports timestamps.

---

# 97. ENUM MANAGEMENT

Enums such as:

```text
resource_type
event_type
notification_type
message_type
```

must be documented.

Frontend should have safe fallback behavior for unknown future values.

For example:

```text
unknown notification type → generic notification renderer
```

This helps backward compatibility.

---

# 98. FEATURE FLAGS

Feature flags can enable gradual rollout.

Endpoint:

```text
GET /api/v1/config/features
```

Example:

```json
{
  "quiz_v2": true,
  "resource_upload": true,
  "leaderboard": false,
  "new_dashboard": true
}
```

Do not use feature flags as security authorization.

They control product availability, not permissions.

---

# 99. APP CONFIGURATION

Remote configuration may contain:

```text
app name
support email
social links
developer portfolio
minimum supported version
latest version
maintenance mode
announcement banner
default avatar configuration
```

This allows non-code content changes without rebuilding the frontend.

The social links supplied for BEU BABA should be maintained as configuration rather than hard-coded across components.

---

# 100. MAINTENANCE MODE

Endpoint:

```text
GET /api/v1/config/app
```

May return:

```json
{
  "maintenance_mode": false,
  "maintenance_message": null,
  "latest_version": "1.0.0",
  "minimum_version": "1.0.0"
}
```

If maintenance mode is enabled, the frontend can show a premium maintenance screen.

Critical admin routes may remain available.

---

# 101. FORCE UPDATE

The backend can specify:

```text
minimum_version
```

If the installed PWA/app version is below it:

```text
soft update
```

or:

```text
mandatory update
```

depending on severity.

The API should communicate the policy clearly.

---

# 102. SOCIAL LINKS

BEU BABA's configurable developer/social section can contain:

```json
{
  "instagram": [
    "naturelensbyabhi",
    "er_abhi2026"
  ],
  "telegram": "https://t.me/+wnAYQ4wVOxg2M2Rl",
  "portfolio": [
    "https://erabhi.in",
    "https://i-am-er-abhi.vercel.app"
  ]
}
```

These values should ideally live in app configuration.

Do not duplicate them in:

```text
footer
about page
developer page
support page
profile menu
```

Instead, all UI components consume the same configuration source.

---

# 103. DEVELOPER PROFILE

The developer information can be represented as:

```json
{
  "name": "...",
  "role": "...",
  "portfolio": [],
  "social_links": {},
  "support_enabled": true
}
```

The API should return only intended public information.

Private developer information must never be included.

---

# 104. API SECURITY CHECKLIST

Every endpoint must answer:

1. Who can call it?
2. What authentication is required?
3. What fields can be supplied?
4. Which fields are server-controlled?
5. What database records can be touched?
6. Can the caller access another user's record?
7. Is rate limiting needed?
8. Does the operation need auditing?
9. Is it idempotent?
10. Does it expose private data?
11. Can the response be cached?
12. Can it be called offline?
13. What happens if the network request is repeated?
14. What happens if the user loses authorization during the request?

If these questions cannot be answered, the endpoint is not production-ready.

---

# 105. API DOCUMENTATION FORMAT

Every endpoint specification should use this structure:

```text
Endpoint
Method
Authentication
Authorization
Purpose
Request
Path parameters
Query parameters
Validation
Business rules
Success response
Error responses
Pagination
Caching
Rate limit
Audit event
Realtime event
Notes
```

Example:

```text
POST /api/v1/resources/:id/report

Authentication: required
Authorization: authenticated student

Purpose:
Report a published resource.

Validation:
- resource exists
- resource is visible
- reason is valid
- duplicate report prevented

Success:
201 Created

Errors:
404 RESOURCE_NOT_FOUND
409 RESOURCE_ALREADY_REPORTED
429 RATE_LIMITED
```

---

# 106. API TESTING STRATEGY

Tests must exist at several levels.

## Unit tests

Test:

- validation;
- scoring;
- permissions;
- date calculations;
- filters;
- utility functions.

## Integration tests

Test:

- API + database;
- RLS;
- authentication;
- storage;
- notification creation.

## End-to-end tests

Test real user journeys:

```text
Register
 ↓
Complete profile
 ↓
Open dashboard
 ↓
Open syllabus
 ↓
Open PYQ
 ↓
Start quiz
 ↓
Submit quiz
 ↓
Download result card
 ↓
Send support message
```

---

# 107. AUTHORIZATION TEST MATRIX

For every protected endpoint test at least:

```text
Unauthenticated → rejected
Student own record → allowed
Student another user's record → rejected
Admin → allowed where appropriate
Unauthorized admin action → rejected
```

Example:

```text
GET own support conversation → 200
GET another student's support conversation → 403
POST approve resource as student → 403
POST approve resource as moderator → allowed if capability exists
```

---

# 108. QUIZ TEST MATRIX

Test:

```text
valid submission
empty submission
duplicate submission
expired attempt
invalid question ID
invalid option ID
tampered score
negative marking
unanswered questions
maximum score
zero score
partial answers
network retry
```

The server result must always be authoritative.

---

# 109. RESOURCE MODERATION TEST MATRIX

Test:

```text
student submits valid resource
student submits unsupported file
student submits oversized file
student edits pending resource
admin approves
admin rejects
student tries to approve own resource
student accesses rejected resource
student reports published resource
duplicate report
```

---

# 110. SUPPORT CHAT TEST MATRIX

Test:

```text
Student A sends message
Admin receives message
Admin replies
Student A receives reply
Student B cannot see Student A conversation
Student B creates separate conversation
Realtime disconnects
Messages remain available after refresh
Closed conversation receives new message
```

---

# 111. NETWORK FAILURE UX

The API contract should allow the frontend to distinguish:

```text
offline
timeout
authentication expired
validation failure
permission failure
server failure
rate limit
```

UI responses:

```text
offline → "You're offline. We'll retry when connection returns."
401 → refresh session/login
403 → "You don't have permission."
422 → field-level errors
429 → "Too many requests. Try again later."
500 → generic error + retry
```

---

# 112. LOADING STATES

Every API-backed screen should have:

```text
initial loading
refreshing
empty
error
success
partial success
```

Do not use a full-screen spinner for every small request.

The premium BEU BABA UI should use:

- skeleton cards;
- subtle shimmer;
- content-preserving transitions;
- inline loading indicators.

Animations must never hide the actual network state.

---

# 113. EMPTY STATES

Examples:

No PYQs:

```text
No previous-year papers found
Try another semester or subject.
```

No bookmarks:

```text
Your saved resources will appear here.
```

No support messages:

```text
Need help?
Start a conversation with the BEU BABA developer.
```

No quiz attempts:

```text
You haven't completed a quiz yet.
```

Empty states should include a relevant action where appropriate.

---

# 114. ERROR UX

Never show:

```text
Error 500
```

as the only user-facing message.

Use:

```text
Something went wrong
We couldn't load your resources right now.
Please try again.
```

Provide:

```text
Retry
```

where useful.

---

# 115. API AND PREMIUM UI COORDINATION

The backend contract should provide enough semantic information for the frontend to create the premium Apple-inspired glass interface.

For example:

```json
{
  "title": "Operating System",
  "subtitle": "Semester 4",
  "accent": "system",
  "status": "published",
  "progress": 72
}
```

The frontend can transform this into:

```text
glass card
progress ring
subject icon
micro animation
```

The backend should not return CSS.

Never send:

```json
{
  "background": "rgba(...)",
  "blur": "20px"
}
```

unless a remote theming system explicitly requires it.

Presentation belongs to the frontend.

---

# 116. CONTENT METADATA FOR UI

Content APIs may provide semantic metadata:

```text
type
category
difficulty
status
featured
updated_at
thumbnail
icon_key
```

For example:

```json
{
  "type": "pyq",
  "icon_key": "document",
  "difficulty": null
}
```

`icon_key` is semantic, not a CSS class.

The frontend maps:

```text
document → appropriate icon
```

This prevents backend/frontend visual coupling.

---

# 117. FEATURED CONTENT

Admin can mark content as featured.

Endpoint:

```text
POST /api/v1/admin/content/:id/feature
POST /api/v1/admin/content/:id/unfeature
```

Dashboard API returns only currently eligible featured content.

The frontend does not decide:

```text
first five resources are featured
```

---

# 118. RECENT CONTENT

Backend should return recent content using:

```text
published_at
```

rather than:

```text
created_at
```

because an old draft may have been created months ago but published today.

This distinction is important.

---

# 119. CONTENT UPDATE DATE

For students, display:

```text
Updated recently
```

based on meaningful content update timestamps.

Do not expose internal database modification timestamps if they create confusion.

Maintain:

```text
created_at
updated_at
published_at
```

with clear semantics.

---

# 120. ACADEMIC CONTEXT FILTERING

The student's course, branch, and semester should automatically influence content discovery.

For example:

```text
Student:
B.Tech
CSE
Semester 4
```

Dashboard requests:

```text
GET /api/v1/dashboard
```

Backend resolves relevant:

```text
CSE Semester 4
```

content.

This produces a personalized experience without requiring users to repeatedly select filters.

---

# 121. USER OVERRIDE FILTERS

Students should still be able to browse other semesters if product requirements permit.

For example:

```text
My Semester
All Semesters
```

The backend must distinguish:

```text
default context
```

from:

```text
explicit browsing context
```

---

# 122. CONTENT DISCOVERY

A premium home experience can include:

```text
Continue Learning
Recently Added
Popular PYQs
Recommended Quizzes
Important Announcements
Upcoming Exams
Saved Resources
```

The dashboard service should return these as independent sections.

If one optional section fails, the entire dashboard should not necessarily fail.

---

# 123. PARTIAL DASHBOARD FAILURE

If:

```text
calendar service fails
```

but:

```text
profile
PYQ
quiz
```

work, return:

```json
{
  "sections": {
    "calendar": {
      "status": "error"
    },
    "pyqs": {
      "status": "success",
      "items": []
    }
  }
}
```

The frontend can gracefully hide or retry the failed section.

---

# 124. BULK ADMIN OPERATIONS

Admin may need:

```text
bulk publish
bulk archive
bulk assign
bulk delete/archive
bulk notify
```

These operations require special care.

Never accept unlimited arbitrary IDs.

Validate:

- maximum selection size;
- permissions;
- current state;
- ownership/scope;
- operation validity.

Audit the operation.

---

# 125. IMPORT API

If BEU BABA initially imports extracted app data from JSON, create an admin-only import workflow.

Example:

```text
POST /api/v1/admin/import/validate
POST /api/v1/admin/import/execute
```

Validation should happen before mutation.

Flow:

```text
Upload JSON
 ↓
Schema validation
 ↓
Relationship validation
 ↓
Duplicate detection
 ↓
Preview changes
 ↓
Admin confirmation
 ↓
Transactional import
 ↓
Audit record
```

Never directly dump arbitrary JSON into production tables.

---

# 126. EXPORT API

Admin export:

```text
GET /api/v1/admin/export/pyqs
GET /api/v1/admin/export/syllabus
GET /api/v1/admin/export/calendar
```

Exports should respect administrator permissions.

For large exports, create an asynchronous job.

---

# 127. JSON CONTRACT VERSION

Imported JSON should contain:

```json
{
  "schema_version": "1.0",
  "generated_at": "...",
  "source": "BEU_BABA_IMPORT",
  "data": {}
}
```

When the schema changes:

```text
1.0
1.1
2.0
```

The importer can support migrations.

---

# 128. BACKWARD COMPATIBILITY

If old mobile/PWA clients still exist, backend changes must not unexpectedly break them.

For breaking changes:

```text
v1
v2
```

or a carefully designed compatibility period.

Avoid silently changing:

```text
string → object
```

or:

```text
integer → string
```

---

# 129. API DEPRECATION

When an endpoint is deprecated:

1. document it;
2. keep it temporarily;
3. identify replacement;
4. monitor usage;
5. remove only after migration.

Example header:

```text
Deprecation: true
```

if supported by infrastructure.

---

# 130. OBSERVABILITY

Track:

- request latency;
- error rate;
- endpoint usage;
- database errors;
- storage errors;
- notification failures;
- realtime failures;
- upload failures.

Never log:

- passwords;
- access tokens;
- private keys;
- full authentication headers;
- unnecessary personal information.

---

# 131. PERFORMANCE TARGETS

The API should aim for:

```text
Fast simple reads:
<300ms when warm

Normal application reads:
<500ms

Complex administrative queries:
<1–2s where practical

Large processing:
asynchronous
```

These are engineering targets, not guarantees.

Optimize measured bottlenecks rather than prematurely optimizing everything.

---

# 132. DATABASE QUERY RULE

Never make a list endpoint execute:

```text
1 query for students
+ 1 query per student
```

This N+1 pattern is dangerous.

Prefer:

- joins;
- batched queries;
- aggregated queries;
- carefully designed views/functions.

---

# 133. API N+1 EXAMPLE

Bad:

```text
GET students
for every student:
    GET branch
    GET course
    GET semester
```

Good:

```text
GET students
with necessary joined academic context
```

---

# 134. RESPONSE SIZE

Do not return unnecessary fields.

A PYQ list does not need:

```text
full PDF text
internal moderation notes
audit history
storage credentials
```

Return lightweight list objects.

Detailed endpoint can return additional information.

---

# 135. LIST VS DETAIL RESPONSE

List:

```json
{
  "id": "uuid",
  "title": "...",
  "subject": {},
  "year": 2025,
  "thumbnail": "..."
}
```

Detail:

```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "subject": {},
  "year": 2025,
  "file": {},
  "metadata": {},
  "bookmarked": true
}
```

This reduces unnecessary data transfer.

---

# 136. IMAGE OPTIMIZATION

Profile and resource images should support optimized variants where useful:

```text
thumbnail
medium
large
```

The API can return:

```json
{
  "thumbnail_url": "...",
  "medium_url": "...",
  "large_url": "..."
}
```

The frontend chooses based on context.

---

# 137. FILE THUMBNAILS

PDF resources may have generated thumbnails.

Example:

```json
{
  "file": {
    "type": "pdf",
    "thumbnail_url": "...",
    "page_count": 18
  }
}
```

Thumbnail generation can be asynchronous.

---

# 138. RESOURCE QUALITY SIGNALS

Optional fields:

```text
file_valid
has_thumbnail
page_count
resource_type
subject_match
moderation_status
```

These can help admin moderation.

Do not expose internal moderation scoring to students unless intentionally designed.

---

# 139. DUPLICATE DETECTION

Resource submission can use:

- filename similarity;
- file hash;
- title similarity;
- subject match.

A file hash is particularly useful for exact duplicate detection.

The backend can flag:

```text
possible_duplicate
```

instead of automatically rejecting every similarity.

---

# 140. COPYRIGHT/LEGAL REPORTING

The application should provide a reporting pathway for potentially unauthorized material.

Possible endpoint:

```text
POST /api/v1/resources/:id/report
```

with:

```text
copyright_concern
```

Admin moderation can then review.

The system should avoid presenting unverified claims as established facts.

---

# 141. SECURITY HEADERS

Deployment should use appropriate security headers, including where compatible:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Exact CSP must account for:

- Supabase;
- storage;
- authentication;
- analytics if any;
- web push;
- required external resources.

---

# 142. CORS

Restrict API access to approved origins.

Do not use:

```text
Access-Control-Allow-Origin: *
```

for authenticated private APIs unless there is a deliberate security design.

---

# 143. CSRF CONSIDERATIONS

The exact requirement depends on authentication transport.

If credentials are cookie-based, use appropriate CSRF protection.

If bearer tokens are used from the client, still carefully protect tokens and storage.

Never place long-lived sensitive tokens in unsafe storage without understanding the threat model.

---

# 144. SECRET MANAGEMENT

Secrets belong in environment variables or secure secret management.

Examples:

```text
SUPABASE_SERVICE_ROLE_KEY
VAPID_PRIVATE_KEY
INTERNAL_API_SECRET
```

Never put them in:

```text
React source
Vite public env
GitHub repository
JSON config served to users
```

Important:

A Vite environment variable prefixed for frontend exposure should be considered public.

---

# 145. SERVICE ROLE KEY

A Supabase service role key bypasses normal RLS protections and must never be exposed to the browser.

It belongs only in trusted backend/server-side functions.

This is one of the most critical BEU BABA security rules.

---

# 146. EDGE FUNCTIONS

Supabase Edge Functions may be appropriate for:

- secure server operations;
- push notification sending;
- privileged imports;
- PDF generation;
- admin automation;
- webhook processing.

Do not move every simple database read into an Edge Function if direct secure database access is already sufficient.

Use functions where they add security or orchestration value.

---

# 147. SERVER FUNCTION AUTHORIZATION

An Edge Function must still verify the caller.

Never assume:

```text
function URL = admin
```

means the caller is admin.

Verify:

```text
session
 ↓
user
 ↓
role/capability
```

before privileged action.

---

# 148. WEB PUSH SERVER FLOW

```text
Student grants browser notification permission
 ↓
Browser creates subscription
 ↓
POST subscription to backend
 ↓
Backend stores subscription
 ↓
Admin publishes announcement
 ↓
Notification event generated
 ↓
Worker/function loads eligible subscriptions
 ↓
Push provider/browser protocol sends notification
```

Expired subscriptions should be cleaned up.

---

# 149. PUSH FAILURE HANDLING

If a subscription is invalid:

```text
remove/disable subscription
```

Do not repeatedly retry permanently invalid endpoints.

Track delivery outcomes without storing unnecessary data.

---

# 150. NOTIFICATION DE-DUPLICATION

A single event should not accidentally generate ten identical notifications.

Use an event ID:

```text
event_id
```

and, where appropriate:

```text
recipient_id + event_id
```

as a deduplication key.

---

# 151. ADMIN NOTIFICATION COMPOSER

Admin can create:

```text
title
body
target audience
deep link
send immediately / schedule
```

But the backend must validate targeting.

Do not allow an arbitrary SQL-like filter from the frontend.

Use structured filters:

```text
course_id
branch_id
semester
```

---

# 152. SCHEDULED NOTIFICATIONS

Future capability:

```text
POST /api/v1/admin/notifications/scheduled
```

The backend creates a scheduled event.

At execution time:

```text
resolve audience
check preferences
create in-app notification
send push
```

If the user changes preferences before the send time, the latest valid preference should normally apply.

---

# 153. SUPPORT NOTIFICATION PRIVACY

Notification preview should avoid exposing sensitive message content on a shared lock screen.

Instead of:

```text
Abhishek: My phone number is...
```

prefer:

```text
You have a new reply from BEU BABA support.
```

The detailed message remains inside the authenticated app.

---

# 154. STUDENT ACTIVITY ANALYTICS

Useful anonymous/authorized analytics:

```text
PYQ opens
PYQ downloads
Quiz starts
Quiz completions
Resource views
Resource downloads
Search queries
Toolbox usage
Support conversations
```

Do not collect data merely because it is technically possible.

Collect only what has a product or operational purpose.

---

# 155. ADMIN ANALYTICS API

```text
GET /api/v1/admin/analytics/overview
GET /api/v1/admin/analytics/content
GET /api/v1/admin/analytics/quizzes
GET /api/v1/admin/analytics/resources
```

Metrics:

```text
registered students
active students
published resources
pending resources
quiz attempts
completion rate
popular PYQs
support tickets
```

---

# 156. ANALYTICS PRIVACY

Avoid exposing raw personal data in analytics dashboards.

Prefer aggregates:

```text
125 students
```

instead of unnecessary:

```text
Student X opened PYQ at 11:03 PM
```

unless the latter is required for a legitimate operational feature.

---

# 157. RATE-LIMIT RESPONSE

When rate limited:

```http
429 Too Many Requests
```

Response:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "retry_after_seconds": 60
  }
}
```

Frontend can respect the retry delay.

---

# 158. ABUSE PREVENTION

Protect:

- spam support messages;
- fake reports;
- resource flooding;
- quiz automation;
- account creation;
- search abuse;
- upload abuse.

Potential controls:

- rate limits;
- CAPTCHA where necessary;
- email verification;
- file size limits;
- moderation;
- anomaly detection.

Do not add CAPTCHA everywhere and harm usability without evidence of abuse.

---

# 159. SESSION SECURITY

If a session expires while the student is using the app:

```text
API returns 401
 ↓
client attempts safe session refresh
 ↓
retry original safe request if appropriate
 ↓
if refresh fails → login screen
```

Do not infinitely retry.

---

# 160. AUTHENTICATION STATE

Frontend should have:

```text
loading
authenticated
unauthenticated
session_error
```

Protected routes should wait for authentication initialization before redirecting.

Otherwise users may see a login screen briefly during startup even though they have a valid session.

---

# 161. PROFILE ROUTING

Recommended:

```text
/register
/login
/complete-profile
/home
```

Flow:

```text
Not logged in → Login/Register
Logged in + incomplete → Complete Profile
Logged in + complete → Home
```

This logic should be coordinated with backend profile state.

---

# 162. DEEP LINKS

Every important content object should have a stable route.

Examples:

```text
/pyqs/:id
/quizzes/:id
/resources/:id
/subjects/:id
/syllabus/:id
/support
```

Notifications can deep-link to these routes.

---

# 163. DEEP LINK AUTHORIZATION

A user opening:

```text
/support/conversation/abc
```

must still pass authorization.

Never assume that knowing the URL is permission.

---

# 164. DEEP LINK NOT FOUND

If an item was archived after a notification was sent:

```text
404 / archived
```

The UI should show:

```text
This content is no longer available.
```

and offer navigation back to relevant content.

---

# 165. API CONTRACT FOR NAVIGATION

Backend should provide IDs and semantic route targets, not hard-coded React routes when possible.

Example:

```json
{
  "action": {
    "type": "open_content",
    "content_type": "pyq",
    "content_id": "uuid"
  }
}
```

The frontend maps this to its route.

---

# 166. FRONTEND API TYPE GENERATION

If practical, generate TypeScript types from the API/OpenAPI schema.

Benefits:

- fewer mismatched fields;
- safer refactoring;
- autocomplete;
- compile-time validation.

The database types alone are not necessarily equivalent to public API types.

Do not expose raw database row types as your entire application contract.

---

# 167. DTO PRINCIPLE

Use DTOs:

```text
Database model
        ↓
Application transformation
        ↓
API DTO
        ↓
Frontend
```

This prevents internal columns from accidentally becoming public API fields.

---

# 168. API SCHEMA DOCUMENTATION

Maintain:

```text
openapi.yaml
```

or equivalent generated API documentation.

Every production endpoint should be documented.

AI coding agents should use the API specification instead of guessing request shapes.

---

# 169. EXAMPLE OPENAPI STRUCTURE

Conceptually:

```text
openapi/
  schemas/
    Student.yaml
    Subject.yaml
    PYQ.yaml
    Quiz.yaml
    Resource.yaml
    Notification.yaml
    SupportMessage.yaml
  paths/
    auth.yaml
    profile.yaml
    pyqs.yaml
    quizzes.yaml
    resources.yaml
    support.yaml
    admin.yaml
```

---

# 170. API CONTRACT AS SOURCE OF TRUTH

When frontend and backend disagree:

```text
API contract
```

should be the reference.

Do not fix mismatches by silently adding random fallback fields everywhere.

Example bad pattern:

```javascript
data.name || data.full_name || data.studentName || "Student"
```

This hides contract failures.

Use one canonical field.

---

# 171. BACKEND BUSINESS RULE EXAMPLES

Business rules must be centralized.

Example:

```text
Only published resources are visible.
Only resource owners can edit pending submissions.
Only moderators can approve resources.
Only attempt owners can submit quiz answers.
Only admins can publish syllabus.
Only conversation participants/admins can read support messages.
```

Do not distribute these rules across UI components.

---

# 172. ADMIN CONTENT CONFLICTS

If two admins edit the same content:

Use:

```text
updated_at
version number
```

or optimistic locking.

Example:

```json
{
  "version": 7
}
```

Update request:

```json
{
  "version": 7,
  "title": "Updated title"
}
```

If current version is 8:

```text
409 CONFLICT
```

This prevents accidental overwrites.

---

# 173. DRAFT AUTOSAVE

If implemented:

```text
PATCH /api/v1/admin/content/:id/draft
```

Autosave should be:

- debounced;
- small;
- version-aware;
- rate limited.

Do not send a database write on every keystroke.

---

# 174. PREVIEW/PUBLISH SEPARATION

The frontend may display a live preview of draft content.

But:

```text
Preview ≠ Published
```

The backend must preserve that distinction.

---

# 175. ADMIN DELETE CONFIRMATION

Destructive API calls should require deliberate confirmation in UI.

Backend should still protect against accidental deletion where possible.

For example, archive may be preferred over hard delete.

---

# 176. API LOGGING

Log:

```text
request ID
endpoint
method
status
latency
authenticated user ID where appropriate
error code
```

Avoid logging:

```text
password
access token
private message body unnecessarily
full uploaded file contents
```

---

# 177. SENSITIVE SUPPORT LOGGING

Support messages may contain personal information.

Do not dump full message bodies into generic debug logs.

Instead log:

```text
support_message_created
conversation_id
sender_type
request_id
```

---

# 178. ADMIN ACTION CONFIRMATION

For high-impact operations, return a clear result:

```json
{
  "data": {
    "id": "uuid",
    "status": "published"
  },
  "message": "Content published successfully."
}
```

The UI can then update state based on authoritative response.

---

# 179. API HEALTH ENDPOINT

Provide:

```text
GET /api/v1/health
```

or infrastructure-specific health endpoints.

It should expose only safe information.

Example:

```json
{
  "status": "ok"
}
```

Do not expose:

```text
database password
environment
internal IP
service role key
```

---

# 180. DEPENDENCY HEALTH

Internal monitoring may check:

```text
database
storage
notification provider
realtime
```

but public health responses should remain minimal.

---

# 181. DISASTER RECOVERY

Application APIs should fail gracefully when optional services fail.

If push notifications are down:

```text
in-app notifications still work
```

If thumbnail generation fails:

```text
resource can still be available
```

If analytics is down:

```text
core learning flow continues
```

Core academic functionality should not depend on non-essential analytics.

---

# 182. CRITICAL VS NON-CRITICAL SERVICES

Critical:

```text
authentication
database
content retrieval
quiz scoring
support messages
```

Non-critical:

```text
analytics
thumbnail generation
push notifications
recommendation ranking
```

Architecture should isolate failures accordingly.

---

# 183. RECOMMENDATION SERVICE

Future recommendation endpoint:

```text
GET /api/v1/recommendations
```

Could use:

- academic context;
- recent activity;
- bookmarks;
- completed quizzes;
- content freshness.

Do not build an "AI recommendation engine" merely for appearance.

A simple rules engine may be more reliable:

```text
current semester
+
recently opened subject
+
newly published relevant content
```

---

# 184. PREMIUM EXPERIENCE THROUGH DATA

A premium app does not require an overcomplicated backend.

Good backend data enables:

```text
personalized dashboard
smart recent section
continue learning
new content alerts
saved resources
quiz history
academic calendar
support replies
```

The premium feeling should come from reliability, speed, clarity, and UI quality—not unnecessary complexity.

---

# 185. API CONTRACT FOR FUTURE PAID COURSES

Although BEU BABA may initially be free, design future compatibility.

Possible future endpoints:

```text
GET /api/v1/catalog
GET /api/v1/courses/:id/entitlement
POST /api/v1/orders
GET /api/v1/me/purchases
```

Do not build payment logic into today's PYQ API.

Keep entitlement as a separate authorization concern.

---

# 186. CONTENT ENTITLEMENT

Future resource access may depend on:

```text
public
authenticated
course_member
purchased
admin
```

The visibility layer should be extensible.

For now:

```text
public academic content
```

can remain simple.

---

# 187. API CONTRACT FOR COURSE ACCESS

Future:

```json
{
  "access": {
    "allowed": true,
    "reason": "purchased"
  }
}
```

The frontend should not assume:

```text
if price === 0 then accessible
```

The backend remains authoritative.

---

# 188. PAYMENT SAFETY

When payments are eventually introduced:

- never trust client payment success;
- verify payment provider webhooks;
- create entitlements server-side;
- make webhook handling idempotent;
- audit changes.

Payment architecture should remain isolated from academic content APIs.

---

# 189. VERSIONED QUIZ CONTENT

A quiz attempt should reference a specific quiz version.

Example:

```text
Quiz OS Mock Test
Version 3
```

If an admin changes question 4 later, old attempts should remain historically correct.

This prevents a student's old result from changing after content edits.

---

# 190. VERSIONED SYLLABUS CONTENT

Likewise:

```text
Syllabus version 2026-27
```

should remain identifiable.

The active syllabus can change without rewriting history.

---

# 191. ACADEMIC CALENDAR CHANGES

When dates change:

```text
old event
 ↓
update
 ↓
audit
 ↓
optional notification
```

The API should preserve:

```text
updated_at
updated_by
```

and optionally change history.

---

# 192. IMPORTANT CONTENT UPDATE NOTIFICATIONS

Not every edit needs a notification.

Possible rules:

Notify for:

- exam date change;
- major syllabus revision;
- important PYQ addition;
- important announcement;
- quiz availability.

Do not notify for:

- typo correction;
- thumbnail replacement;
- internal metadata changes.

---

# 193. SUPPORT SLA METADATA

Future support system can include:

```text
priority
created_at
last_reply_at
first_response_at
resolved_at
```

This allows admin dashboards to identify unanswered messages.

---

# 194. SUPPORT PRIORITY

Possible:

```text
low
normal
high
urgent
```

Students should not necessarily be able to mark everything urgent without abuse controls.

Admin can change priority.

---

# 195. BUG REPORT STRUCTURE

A bug report can capture:

```text
title
description
category
device
browser
app version
page
steps to reproduce
screenshot
```

Automatically capture safe technical context where possible:

```text
app_version
platform
browser family
screen size
```

Do not automatically collect unnecessary personal data.

---

# 196. BUG REPORT ENDPOINT

```text
POST /api/v1/support/bug-reports
```

The backend creates:

```text
support conversation
+
bug metadata
```

This provides a structured developer workflow.

---

# 197. COURSE/SYLLABUS UPDATE REQUEST

Students can send:

```text
course_update
syllabus_update
```

The backend stores the request.

Admin can mark:

```text
received
reviewing
completed
rejected
```

This creates a feedback loop without exposing admin tools to students.

---

# 198. API FOR CONTACT DEVELOPER

The app can expose:

```text
GET /api/v1/developer/profile
```

with public details:

```text
name
portfolio
social links
support availability
```

This keeps developer information centralized.

---

# 199. SOCIAL LINK VALIDATION

Admin-entered URLs should be validated.

Allowed schemes:

```text
https
```

Avoid allowing arbitrary:

```text
javascript:
```

or unsafe URL schemes.

---

# 200. ADMIN SETTINGS API

```text
GET   /api/v1/admin/settings
PATCH /api/v1/admin/settings
```

Settings may include:

```text
maintenance mode
announcement banner
support status
feature flags
social links
app version
```

High-risk settings should be audited.

---

# 201. REMOTE UI CONFIGURATION

Remote configuration should not become a hidden replacement for code.

Good:

```text
feature enabled
banner text
social link
content order
```

Bad:

```text
entire React application stored as JSON
```

Keep architecture understandable.

---

# 202. UI CONTENT VS APPLICATION LOGIC

Backend can control:

```text
title
subtitle
featured status
availability
```

Frontend controls:

```text
glass blur
spring animation
card radius
navigation animation
icon motion
layout
```

This separation is essential for maintainability.

---

# 203. API AND ANIMATION PERFORMANCE

Animations should never wait unnecessarily for large API responses.

Use:

```text
skeleton → content transition
```

rather than:

```text
blank screen → API → everything appears
```

Prefetch likely next screens where useful.

Example:

```text
Student taps Subject
 ↓
subject detail loads
 ↓
prefetch PYQs
```

---

# 204. PREFETCHING

Safe candidates:

- subject detail;
- syllabus;
- PYQ list;
- quiz metadata.

Do not aggressively prefetch:

- large PDFs;
- private support conversations;
- huge admin datasets.

---

# 205. MOBILE NETWORK OPTIMIZATION

BEU BABA may be used on variable mobile connections.

API responses should be compact.

Prefer:

```text
pagination
compressed JSON
optimized thumbnails
signed file URLs
lazy loading
```

Do not send 500 full-resolution images on the home screen.

---

# 206. API TIMEOUTS

Every client request should have reasonable timeout behavior.

A request that hangs forever is worse than an error.

For long operations:

```text
return job ID
```

rather than keeping HTTP open indefinitely.

---

# 207. ASYNC JOB STATUS

Example:

```text
POST /api/v1/jobs/result-card
```

Response:

```json
{
  "job_id": "uuid",
  "status": "queued"
}
```

Then:

```text
GET /api/v1/jobs/:jobId
```

Response:

```json
{
  "status": "completed",
  "download_url": "..."
}
```

---

# 208. JOB AUTHORIZATION

A student may only see their own jobs.

An admin may see authorized administrative jobs.

Never expose arbitrary job IDs as access tokens.

---

# 209. FILE EXPIRATION

Temporary uploads should expire.

Example:

```text
temporary upload created
 ↓
not completed
 ↓
cleanup after expiration
```

This prevents abandoned uploads from accumulating storage costs.

---

# 210. STORAGE QUOTA

Track per-user or global quotas where needed.

Example:

```text
resource upload daily quota
profile image size limit
```

Do not let users consume unlimited storage simply by repeatedly submitting files.

---

# 211. STORAGE CLEANUP

When a resource is rejected permanently:

```text
database record retained if useful
temporary file deleted
```

When a resource is deleted:

```text
application record archived
storage object cleaned according to policy
```

Cleanup should be safe and auditable.

---

# 212. RESOURCE REPLACEMENT

If a student is allowed to replace a pending file:

```text
POST /api/v1/resources/:id/replace-file
```

Backend should:

- verify ownership;
- verify status;
- validate new file;
- attach new file;
- clean old temporary object.

---

# 213. RESOURCE EDITING

Only pending/rejected resources may be editable by students, depending on policy.

Published content should normally require moderation for changes.

Example:

```text
published
 ↓
student edit request
 ↓
new pending revision
 ↓
moderation
 ↓
new published version
```

This prevents bypassing moderation.

---

# 214. RESOURCE VERSIONING

For high-quality resources:

```text
resource version 1
resource version 2
```

This can preserve:

- who changed it;
- when;
- previous file;
- moderation result.

---

# 215. CONTENT REVISION API

Future:

```text
GET /api/v1/resources/:id/revisions
```

Admin-only unless product requires student visibility.

---

# 216. SEARCH INDEXING

For larger datasets, PostgreSQL full-text search can be used.

Searchable fields:

```text
title
description
subject name
course
branch
tags
```

Do not search binary PDF content synchronously on every request.

PDF text extraction can be an asynchronous process.

---

# 217. TAGGING

Resources can support tags:

```text
unit-1
important
exam
short-notes
numerical
theory
```

Tags should be normalized where possible.

Admin moderation can control tags.

---

# 218. RESOURCE CATEGORIES

Recommended:

```text
notes
pyq
assignment
lab
question_bank
study_material
reference
other
```

Use stable machine values.

---

# 219. SUBJECT-SPECIFIC RESOURCES

Every academic resource should ideally have:

```text
course_id
branch_id
semester
subject_id
```

where applicable.

This allows precise discovery.

---

# 220. GENERAL RESOURCES

Some resources may not belong to one subject:

```text
placement preparation
general engineering
college notices
tool guides
```

The API should allow a general category without forcing fake subject relationships.

---

# 221. NOTIFICATION DEEP LINKS

Every notification can contain:

```json
{
  "action": {
    "type": "open",
    "route": "/pyqs/uuid"
  }
}
```

But safer is a semantic target:

```json
{
  "action": {
    "type": "content",
    "content_type": "pyq",
    "content_id": "uuid"
  }
}
```

The frontend then generates the route.

---

# 222. NOTIFICATION READ STATE

Read state is per user.

Never store:

```text
notification.read = true
```

globally if a notification is delivered to multiple students.

Use per-recipient state.

---

# 223. ANNOUNCEMENT READ STATE

Similarly, if the product tracks announcement reads:

```text
announcement_reads
```

should be user-specific.

---

# 224. UNREAD COUNT

Use:

```text
GET /api/v1/notifications/unread-count
```

rather than loading every notification merely to calculate a badge.

This is especially useful for the navigation bar.

---

# 225. NAVIGATION BADGE

The frontend can display:

```text
Bell icon
   ●
```

based on:

```text
unread_count > 0
```

The backend should return the count.

---

# 226. NAVBAR PERSONALIZATION

The API can return:

```json
{
  "unread_notifications": 4,
  "support_unread": 1
}
```

The frontend can animate badges subtly.

The backend does not control animation.

---

# 227. SUPPORT UNREAD COUNT

```text
GET /api/v1/support/unread-count
```

This should count messages requiring the student's attention.

When student opens the conversation, mark appropriate messages as read.

---

# 228. MESSAGE READ API

```text
POST /api/v1/support/messages/:id/read
```

Authorization:

```text
message belongs to user's conversation
```

Admin can have separate read state if required.

---

# 229. CONVERSATION READ MODEL

A simpler design can track:

```text
student_last_read_at
admin_last_read_at
```

on the conversation.

This avoids storing a read row for every message.

Choose based on product requirements.

---

# 230. ADMIN SUPPORT INBOX

Admin dashboard should show:

```text
unread
open
high priority
recent
```

with filters.

API:

```text
GET /api/v1/admin/support/conversations?
status=open
&priority=high
```

---

# 231. SUPPORT SEARCH

Admin can search:

```text
conversation
student name
subject
message category
```

But access must remain permission-controlled.

---

# 232. STUDENT SUPPORT HISTORY

Student should see their own historical conversations.

Possible:

```text
GET /api/v1/support/conversations
```

This allows multiple tickets rather than one permanent conversation if desired.

The product can choose:

```text
one continuous thread
```

or:

```text
multiple support tickets
```

The architecture should support both.

---

# 233. RECOMMENDED SUPPORT MODEL

For BEU BABA, a ticket/thread model is preferable:

```text
Ticket #1001
  ↳ student message
  ↳ developer reply
  ↳ student message
  ↳ developer reply
```

New issue:

```text
Ticket #1002
```

This keeps unrelated problems separated.

---

# 234. SUPPORT TICKET CREATION

```text
POST /api/v1/support/conversations
```

Request:

```json
{
  "category": "bug_report",
  "subject": "Quiz result not loading",
  "message": "..."
}
```

The first message is created transactionally with the conversation.

---

# 235. SUPPORT TICKET REPLY

```text
POST /api/v1/support/conversations/:id/messages
```

Request:

```json
{
  "message": "The issue occurs after submitting the quiz."
}
```

Backend verifies ownership.

---

# 236. ADMIN REPLY

Same message service, different authorization:

```text
POST /api/v1/admin/support/conversations/:id/messages
```

or a unified endpoint with capability-aware authorization.

Both are acceptable.

Choose one consistent convention.

---

# 237. API DESIGN FOR SIMPLE FRONTEND

The frontend developer should be able to build:

```text
const data = await api.pyqs.list({
  semester: "current"
});
```

instead of:

```text
fetch(...)
  .then(...)
  .then(...)
```

repeated across components.

Service functions hide transport details.

---

# 238. ERROR HANDLING IN SERVICE LAYER

Normalize:

```text
HTTP 404
HTTP 403
HTTP 422
```

into typed errors.

Conceptually:

```text
ApiError {
  code
  message
  details
  status
  requestId
}
```

Components can then decide how to render.

---

# 239. TYPES

Recommended TypeScript types:

```text
Student
Course
Branch
Semester
Subject
Syllabus
PYQ
Quiz
QuizQuestion
QuizAttempt
QuizResult
Resource
Notification
Announcement
SupportConversation
SupportMessage
```

Keep API DTO types separate from UI view models where needed.

---

# 240. VIEW MODEL TRANSFORMATION

Example:

```text
API:
progress = 0.72

UI:
progressPercent = 72
```

Transformation belongs in a mapper/service layer, not randomly inside JSX.

---

# 241. API CONTRACT FOR GLASS CARD DATA

A resource card can receive:

```json
{
  "id": "uuid",
  "title": "Operating System Notes",
  "subtitle": "Semester 4",
  "type": "notes",
  "thumbnail": {},
  "metadata": {
    "pages": 24,
    "size": "4.2 MB"
  },
  "status": "published",
  "is_bookmarked": true
}
```

The UI then creates the visual card.

---

# 242. NO VISUAL COUPLING

Never send:

```text
glass_card_variant
blur_amount
shadow_strength
animation_duration
```

from backend for ordinary content.

These belong to the design system.

---

# 243. DESIGN SYSTEM COMPATIBILITY

The API should provide semantic states:

```text
new
featured
locked
completed
in_progress
published
```

The design system decides how those states look.

For example:

```text
featured → elevated glass treatment
completed → subtle success indicator
locked → lock icon
```

---

# 244. LOCKED CONTENT

If future paid/private content exists:

```json
{
  "access": {
    "allowed": false,
    "reason": "requires_entitlement"
  }
}
```

The UI can show a premium locked card.

Do not send the protected file URL.

---

# 245. ACCESS REASON ENUMS

Use:

```text
unauthenticated
not_published
not_entitled
wrong_academic_context
restricted
```

Avoid exposing internal security details that help attackers.

---

# 246. API SECURITY AGAINST IDOR

Insecure:

```text
GET /quiz-attempts/:attemptId
```

without checking owner.

Secure:

```text
authenticated user
+
attempt.user_id == auth.user.id
```

IDOR prevention must be systematically tested.

---

# 247. OBJECT OWNERSHIP

Every user-owned object should have an ownership concept.

Examples:

```text
resource_submission.user_id
quiz_attempt.user_id
support_conversation.user_id
bookmark.user_id
progress.user_id
```

Queries must scope by authenticated user where appropriate.

---

# 248. ADMIN IMPERSONATION

Avoid an "impersonate student" feature initially.

If ever implemented, it requires:

- explicit authorization;
- audit;
- visible impersonation state;
- read/write restrictions;
- strong security.

It should not be a casual admin convenience.

---

# 249. SECURITY OF ADMIN ROUTES

Admin frontend route:

```text
/admin
```

is not security.

API:

```text
/api/v1/admin/*
```

must independently enforce authorization.

---

# 250. ADMIN SESSION

Admin sessions should ideally have stronger controls:

- shorter session duration where practical;
- MFA;
- audit logs;
- role verification.

This is especially important when the admin can modify academic content.

---

# 251. ADMIN MFA

For production administration, multi-factor authentication is strongly recommended.

Especially for:

```text
super_admin
```

or accounts with:

```text
student management
content deletion
configuration changes
```

---

# 252. API SECRET ROTATION

Secrets should be rotatable.

Never design a system where changing one key requires rewriting source code.

Use environment/configuration management.

---

# 253. DATABASE MIGRATION COORDINATION

API changes should follow migration order:

```text
1. Add compatible DB structure
2. Deploy backend supporting old + new
3. Migrate data
4. Deploy frontend
5. Remove old structure later
```

Avoid:

```text
delete DB column
 ↓
old frontend crashes
```

---

# 254. SAFE MIGRATION EXAMPLE

If changing:

```text
name
```

to:

```text
display_name
```

do:

```text
add display_name
backfill
backend supports both temporarily
frontend migrates
remove old field later
```

---

# 255. API CONTRACT CHANGE PROCESS

Before changing an endpoint:

```text
identify consumers
 ↓
update schema
 ↓
update tests
 ↓
update backend
 ↓
update frontend
 ↓
deploy
 ↓
monitor
```

---

# 256. PRODUCTION CHECKLIST — AUTH

- [ ] Login works.
- [ ] Registration works.
- [ ] Session persistence works.
- [ ] Session expiry handled.
- [ ] Logout works.
- [ ] Protected routes protected.
- [ ] Backend validates identity.
- [ ] No secrets exposed.
- [ ] Profile completion enforced where needed.

---

# 257. PRODUCTION CHECKLIST — CONTENT

- [ ] Courses load.
- [ ] Branches load.
- [ ] Subjects load.
- [ ] Syllabus loads.
- [ ] Calendar loads.
- [ ] PYQs load.
- [ ] Resources load.
- [ ] Draft content hidden.
- [ ] Archived content handled.
- [ ] Signed file access works.

---

# 258. PRODUCTION CHECKLIST — QUIZ

- [ ] Quiz starts.
- [ ] Attempt created.
- [ ] Timer state is authoritative.
- [ ] Submission works.
- [ ] Duplicate submission blocked.
- [ ] Score calculated server-side.
- [ ] Result stored.
- [ ] Result card generated.
- [ ] Old attempts remain stable after quiz edits.

---

# 259. PRODUCTION CHECKLIST — RESOURCES

- [ ] Upload validation.
- [ ] Storage security.
- [ ] Pending state.
- [ ] Admin approval.
- [ ] Admin rejection.
- [ ] Student status visibility.
- [ ] Reports.
- [ ] Duplicate protection.
- [ ] File cleanup.

---

# 260. PRODUCTION CHECKLIST — SUPPORT

- [ ] Student can create ticket.
- [ ] Student can reply.
- [ ] Admin can view.
- [ ] Admin can reply.
- [ ] Ownership enforced.
- [ ] Realtime optional.
- [ ] Messages persist.
- [ ] Read state works.
- [ ] Notifications work.

---

# 261. PRODUCTION CHECKLIST — NOTIFICATIONS

- [ ] In-app notifications.
- [ ] Unread count.
- [ ] Mark read.
- [ ] Preferences.
- [ ] Push subscription.
- [ ] Push delivery.
- [ ] Invalid subscriptions cleaned.
- [ ] Notification deduplication.
- [ ] Deep links validated.

---

# 262. PRODUCTION CHECKLIST — ADMIN

- [ ] Role checks.
- [ ] Capability checks.
- [ ] Student list.
- [ ] Resource moderation.
- [ ] Syllabus publishing.
- [ ] Calendar management.
- [ ] Announcement management.
- [ ] Support inbox.
- [ ] Audit logs.
- [ ] Configuration controls.

---

# 263. PRODUCTION CHECKLIST — SECURITY

- [ ] RLS configured.
- [ ] IDOR tests.
- [ ] Rate limits.
- [ ] File validation.
- [ ] Secret protection.
- [ ] CORS.
- [ ] Security headers.
- [ ] No service role key in frontend.
- [ ] No sensitive logs.
- [ ] Admin MFA recommended.
- [ ] Account deletion workflow.

---

# 264. PRODUCTION CHECKLIST — PERFORMANCE

- [ ] Pagination.
- [ ] Proper indexes.
- [ ] No N+1.
- [ ] Optimized images.
- [ ] Signed URLs.
- [ ] Caching.
- [ ] Lazy loading.
- [ ] API timeout.
- [ ] Async heavy jobs.
- [ ] Monitoring.

---

# 265. RECOMMENDED DIRECTORY STRUCTURE

A practical backend-aware project may look like:

```text
BEU-BABA/
├── src/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── profile.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── courses.ts
│   │   │   ├── subjects.ts
│   │   │   ├── syllabus.ts
│   │   │   ├── calendar.ts
│   │   │   ├── pyqs.ts
│   │   │   ├── quizzes.ts
│   │   │   ├── resources.ts
│   │   │   ├── bookmarks.ts
│   │   │   ├── notifications.ts
│   │   │   ├── support.ts
│   │   │   └── admin.ts
│   │   └── mappers/
│   ├── types/
│   ├── utils/
│   └── design-system/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
├── docs/
│   ├── architecture/
│   └── api/
│
└── openapi/
    └── openapi.yaml
```

---

# 266. FRONTEND SERVICE EXAMPLE

Conceptually:

```text
pyqService.list({
  subjectId,
  year,
  page
})
```

returns:

```text
Promise<PagedResult<PYQ>>
```

The UI should not know whether the backend uses:

```text
REST
RPC
Edge Function
direct Supabase query
```

That implementation can change behind the service boundary.

---

# 267. SUPABASE DIRECT QUERY VS API

Not every read necessarily needs an HTTP API layer if the Supabase client is safely configured with RLS.

However, important business operations should use controlled server-side logic when they involve:

- complex validation;
- privileged access;
- multi-table transactions;
- external services;
- secret credentials;
- scoring;
- notification delivery;
- imports;
- admin actions.

The correct architecture is hybrid rather than dogmatic.

---

# 268. SAFE DIRECT SUPABASE USE

Suitable examples:

```text
read published subject list
read published syllabus
read own bookmarks
read own notifications
```

when RLS and query design are strong.

---

# 269. SERVER-SIDE SERVICE USE

Prefer server-side service/function for:

```text
quiz scoring
push sending
admin publishing
bulk import
privileged configuration
signed upload authorization
complex moderation
```

---

# 270. NEVER EXPOSE SERVICE ROLE

This rule is absolute:

```text
service role key = server only
```

Never:

```text
VITE_SUPABASE_SERVICE_ROLE_KEY
```

Never put it in:

```text
public JSON
frontend source
GitHub
browser local storage
```

---

# 271. ENVIRONMENT SEPARATION

Use:

```text
development
staging
production
```

where practical.

Each environment should have appropriate:

- Supabase project;
- storage;
- secrets;
- API URLs;
- feature flags.

Do not test destructive admin operations against production.

---

# 272. SEED DATA

Development seed data may include:

```text
test course
test branch
test subjects
sample PYQs
sample quizzes
sample resources
sample announcements
```

Never seed real student personal information into development.

---

# 273. TEST USERS

Create controlled accounts:

```text
student@test
moderator@test
admin@test
```

with fake data.

Never use real passwords in documentation.

---

# 274. API CONTRACT FOR AI CODING AGENTS

Any AI coding agent working on BEU BABA must follow these rules:

1. Read API specification before implementation.
2. Never invent endpoint names when an existing service exists.
3. Never bypass authentication.
4. Never use service-role secrets in frontend.
5. Never directly modify authorization logic in UI only.
6. Use typed service functions.
7. Handle loading/error/empty states.
8. Preserve existing response contracts.
9. Ask before breaking API changes.
10. Update tests when changing behavior.

---

# 275. AI AGENT PROHIBITED BEHAVIOR

The agent must not:

```text
create duplicate API services
hard-code student IDs
hard-code admin authorization
store passwords in profiles
expose private storage URLs permanently
calculate authoritative quiz score only on client
show unpublished resources
return another student's support messages
put secrets in Vite frontend env
```

---

# 276. AI AGENT IMPLEMENTATION SEQUENCE

When implementing a new backend feature:

```text
1. Understand requirement
2. Identify data model
3. Identify authorization
4. Define API contract
5. Define validation
6. Implement service
7. Implement database interaction
8. Add RLS/policies if applicable
9. Add tests
10. Add frontend service
11. Add UI
12. Test complete flow
```

Do not begin by editing UI only.

---

# 277. API REVIEW CHECKLIST

Before merging any endpoint:

```text
□ Authentication documented
□ Authorization documented
□ Input validated
□ Output typed
□ Error codes defined
□ Ownership checked
□ RLS considered
□ Rate limit considered
□ Audit considered
□ Pagination considered
□ Caching considered
□ Realtime considered
□ Tests written
□ Documentation updated
```

---

# 278. EXAMPLE END-TO-END FLOW — NEW PYQ

```text
ADMIN
 ↓
Create PYQ draft
 ↓
Upload PDF
 ↓
Validate metadata
 ↓
Preview
 ↓
Publish
 ↓
Database status = published
 ↓
Cache invalidated
 ↓
Notification event
 ↓
Eligible students notified
 ↓
Student opens PYQ
 ↓
Backend authorizes
 ↓
Signed URL generated
 ↓
Student views/downloads
 ↓
Download event recorded
```

---

# 279. EXAMPLE END-TO-END FLOW — STUDENT RESOURCE

```text
STUDENT
 ↓
Select resource
 ↓
Upload file
 ↓
Upload authorization
 ↓
Storage upload
 ↓
Complete upload
 ↓
Create pending submission
 ↓
Admin receives moderation item
 ↓
Admin reviews
 ↓
Approve
 ↓
Resource becomes published
 ↓
Student receives notification
 ↓
Resource appears in listing
```

---

# 280. EXAMPLE END-TO-END FLOW — SYLLABUS UPDATE

```text
ADMIN
 ↓
Create new syllabus version
 ↓
Attach subjects/topics
 ↓
Validate
 ↓
Preview
 ↓
Publish
 ↓
Previous active version archived
 ↓
New version active
 ↓
Cache invalidated
 ↓
Relevant students notified
 ↓
Student opens syllabus
```

---

# 281. EXAMPLE END-TO-END FLOW — QUIZ

```text
STUDENT
 ↓
GET quiz metadata
 ↓
START
 ↓
Backend creates attempt
 ↓
Question set/version locked
 ↓
Student answers
 ↓
SUBMIT
 ↓
Backend validates attempt
 ↓
Server scores
 ↓
Result persisted
 ↓
Result returned
 ↓
Result card optional
 ↓
Progress/history updated
```

---

# 282. EXAMPLE END-TO-END FLOW — SUPPORT

```text
STUDENT
 ↓
Create ticket
 ↓
Database conversation
 ↓
Message inserted
 ↓
Realtime event
 ↓
Admin inbox updates
 ↓
Admin replies
 ↓
Message inserted
 ↓
Realtime event
 ↓
Student notification
 ↓
Student opens support
 ↓
Message marked read
```

---

# 283. EXAMPLE END-TO-END FLOW — CALENDAR CHANGE

```text
ADMIN
 ↓
Edit event
 ↓
Conflict/version check
 ↓
Save
 ↓
Audit log
 ↓
Determine importance
 ↓
If important → notification event
 ↓
Invalidate calendar cache
 ↓
Students receive updated event
```

---

# 284. FINAL API PRINCIPLE

The BEU BABA backend should be:

```text
secure
predictable
typed
versioned
auditable
observable
performant
privacy-conscious
extensible
```

The frontend should be:

```text
beautiful
responsive
animated
Apple-inspired
glassmorphic
fast
accessible
```

The two should communicate through clean contracts.

---

# 285. FINAL PRODUCTION ARCHITECTURE

The intended final relationship is:

```text
                     BEU BABA
                         │
          ┌──────────────┴──────────────┐
          │                             │
      FRONTEND                       BACKEND
          │                             │
 React + Vite                    API / Services
 TypeScript                           │
 Glass UI                             │
 Motion UI                            │
 PWA                                  │
          │                             │
          └──────────── HTTPS ─────────┘
                                        │
                           ┌────────────┼────────────┐
                           │            │            │
                        Supabase     Storage      Realtime
                        Database                   / Events
                           │            │            │
                           └────────────┼────────────┘
                                        │
                                 Background Jobs
                                        │
                                  Notifications
```

---

# 286. DEFINITION OF DONE

The BEU BABA API/application-service layer is considered production-ready only when:

### Authentication

- registration works;
- login works;
- session management works;
- profile completion works;
- protected APIs enforce authentication.

### Authorization

- student ownership is enforced;
- admin capabilities are enforced;
- RLS is configured;
- IDOR tests pass.

### Academic content

- courses work;
- branches work;
- subjects work;
- syllabus versioning works;
- calendar works;
- PYQs work;
- resources work.

### Quiz

- attempts work;
- scoring is server authoritative;
- duplicate submission is blocked;
- results are persistent;
- historical versions remain stable.

### Resources

- uploads are secure;
- moderation works;
- approval/rejection works;
- reporting works;
- storage cleanup works.

### Support

- private conversations work;
- student ownership is enforced;
- admin replies work;
- realtime is optional but reliable;
- notifications work.

### Notifications

- in-app notifications work;
- unread count works;
- preferences work;
- push registration works;
- invalid subscriptions are handled.

### Administration

- student management works;
- content moderation works;
- publishing works;
- announcements work;
- support inbox works;
- audit logs work.

### Reliability

- errors are normalized;
- request IDs exist;
- rate limits exist;
- pagination exists;
- retries are safe;
- heavy jobs are asynchronous.

### Security

- no service-role key reaches frontend;
- private files are protected;
- sensitive student data is restricted;
- admin endpoints are protected;
- secrets are not logged;
- security headers/CORS are configured.

### Maintainability

- API types exist;
- service layer exists;
- endpoint documentation exists;
- tests exist;
- migrations are tracked;
- environment separation exists.

---

# 287. MASTER RULE FOR FUTURE DEVELOPMENT

Whenever a new BEU BABA feature is requested, do not immediately add a button and database table.

First answer:

```text
What is the user trying to do?

What data is involved?

Who owns that data?

Who can read it?

Who can modify it?

What validation is required?

What is the lifecycle?

What happens if the network fails?

What happens if the request is repeated?

Does the operation need a transaction?

Does it need realtime?

Does it need notification?

Does it need audit logging?

Does it contain personal information?

Does it involve files?

Does it need pagination?

Does it need caching?

Does it need rate limiting?

What happens when the content is archived?

What happens after an account is deleted?

What should an AI coding agent implement?

What should the frontend display?

What should remain strictly server-side?
```

Only after these questions are answered should implementation begin.

---

# 288. FINAL ARCHITECTURAL RULE

**BEU BABA must never depend on the frontend behaving honestly.**

The browser is controlled by the user.

Therefore:

```text
Frontend validation = convenience
Backend validation = authority

Frontend route guard = UX
Backend authorization = security

Frontend score = display
Backend score = truth

Frontend hidden button = interface
Backend permission = access control

Frontend storage URL = reference
Storage policy = protection

Frontend notification state = presentation
Database notification state = source of truth
```

This principle should govern every future BEU BABA feature.

The result is a backend that can support the premium Apple-style glassmorphism interface, PWA installation, student dashboard, academic content, quizzes, uploads, moderation, private developer support, notifications, toolbox, administration, and future expansion without allowing the frontend to become the security or business-logic authority.

---

# 289. DOCUMENT COMPLETION STANDARD

This specification should be treated as the **API and application-service contract baseline** for BEU BABA.

Future changes should:

1. preserve existing contracts where possible;
2. document breaking changes;
3. update types;
4. update tests;
5. update API documentation;
6. update security rules;
7. update frontend service functions;
8. update database migrations when necessary;
9. verify the complete end-to-end flow;
10. never sacrifice security for frontend convenience.

**BEU BABA's backend should remain boring, predictable, secure, and reliable so that the frontend can be bold, premium, animated, and visually exceptional.**
