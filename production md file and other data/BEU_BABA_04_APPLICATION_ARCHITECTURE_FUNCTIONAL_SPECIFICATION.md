# BEU BABA — 04. APPLICATION ARCHITECTURE & FUNCTIONAL SPECIFICATION

**Document status:** Production Planning Specification  
**Project:** BEU BABA  
**Document purpose:** Define the complete application architecture, functional behavior, data flow, feature contracts, role permissions, validation rules, error handling, navigation model, and implementation boundaries required to build BEU BABA as a premium, production-ready student platform.

---

## 0. DOCUMENT CONTROL AND NON-NEGOTIABLE IMPLEMENTATION RULES

This document is the functional architecture contract for BEU BABA. It is intentionally detailed. A developer, coding agent, UI engineer, backend engineer, or future maintainer should be able to read this document without relying on hidden assumptions.

The design system is defined separately. This document does not replace the visual design specification. Instead, it defines **what the application does, how features behave, what information they require, how data moves, who can access it, and what must happen in edge cases**.

### 0.1 Primary objective

BEU BABA is a student-focused academic utility platform intended to bring commonly required university resources into one application.

The application should reduce the need for a student to visit multiple websites, search through scattered PDFs, repeatedly look for notices, manually calculate academic information, or use unrelated websites for everyday student utilities.

The application must feel like a single coherent product rather than a collection of unrelated tools.

The major functional areas are:

1. Authentication and student onboarding.
2. Student profile.
3. Home/dashboard.
4. Courses and academic resources.
5. Previous Year Questions (PYQ).
6. Syllabus.
7. Academic/yearly calendar.
8. Notices and updates.
9. Quiz.
10. Quiz result and shareable quiz card.
11. Student Toolbox.
12. Student-submitted resources.
13. Resource verification/moderation.
14. Developer contact/support.
15. Private student-to-developer messaging.
16. Notifications.
17. Search.
18. Favorites/bookmarks.
19. Downloads and saved resources.
20. Admin dashboard.
21. Admin resource management.
22. Admin student management.
23. Admin quiz management.
24. Admin notification management.
25. Admin support inbox.
26. Analytics and operational monitoring.
27. PWA/offline behavior.
28. Security and access control.
29. Data lifecycle and moderation.
30. Error, empty, loading, and recovery states.

---

# 1. PRODUCT PHILOSOPHY

## 1.1 BEU BABA is a utility-first academic product

The application should prioritize usefulness over visual decoration.

Premium UI is important, but premium does not mean:

- excessive gradients,
- glowing RGB elements,
- animated 3D objects in the background,
- unnecessary particles,
- AI-looking neon interfaces,
- constantly moving backgrounds,
- excessive glass blur,
- decorative animations that slow down navigation.

The product should instead communicate:

- trustworthy,
- organized,
- fast,
- modern,
- academic,
- calm,
- premium,
- reliable.

The interface can use advanced glassmorphism, but the glass should support hierarchy and interaction rather than becoming the entire visual identity.

## 1.2 Light theme is the default product identity

BEU BABA should be designed primarily around a bright, clean interface.

The application should not depend on a black or dark canvas to look premium.

The visual language should use:

- translucent white surfaces,
- subtle backdrop blur,
- soft borders,
- restrained shadows,
- clean typography,
- gentle neutral backgrounds,
- carefully selected accent colors,
- strong content contrast.

A dark mode may be technically possible later, but it is not the default design target in this architecture.

## 1.3 Apple-inspired interaction quality, not Apple copying

The product may take inspiration from modern iOS interaction principles:

- clear hierarchy,
- smooth transitions,
- direct manipulation,
- rounded surfaces,
- tactile feedback,
- contextual controls,
- fluid navigation,
- predictable gestures.

However, BEU BABA must not copy Apple's exact branding, proprietary icons, layouts, or screens.

The implementation should be an original BEU BABA interface.

---

# 2. TECHNOLOGY BASELINE

## 2.1 Recommended frontend

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- a robust icon library such as Lucide
- a small internal component library
- PWA support

The architecture should be component-driven.

Do not build the entire application as one giant component.

## 2.2 Recommended backend

Use Supabase for:

- authentication,
- PostgreSQL database,
- Row Level Security,
- storage where appropriate,
- server-side functions where required,
- realtime functionality only where genuinely useful.

The system should keep academic metadata separate from large file binaries.

## 2.3 File storage strategy

Large PDFs, images, documents, and other uploaded resources should not be stored as giant database text/blob fields.

Database records should contain metadata such as:

- file ID,
- resource ID,
- storage path,
- file name,
- MIME type,
- file size,
- checksum if implemented,
- upload timestamp,
- uploader,
- verification status,
- version,
- visibility.

The actual file should be stored in a suitable object-storage layer.

## 2.4 YouTube/video strategy

If educational videos are hosted externally, the database should store:

- video provider,
- external video ID,
- title,
- thumbnail URL or provider-derived thumbnail,
- duration when known,
- visibility,
- course/lesson association.

Do not expose unnecessary private implementation details in the frontend.

---

# 3. HIGH-LEVEL APPLICATION ARCHITECTURE

The application should follow this logical structure:

```text
BEU BABA
│
├── Public Layer
│   ├── Landing
│   ├── Login
│   ├── Register
│   ├── Password Recovery
│   └── Public Information
│
├── Authenticated Student Layer
│   ├── Home
│   ├── Courses
│   ├── PYQ
│   ├── Syllabus
│   ├── Calendar
│   ├── Notices
│   ├── Quiz
│   ├── Toolbox
│   ├── Resources
│   ├── Saved
│   ├── Notifications
│   ├── Profile
│   └── Developer Support
│
├── Administrative Layer
│   ├── Admin Dashboard
│   ├── Students
│   ├── Resources
│   ├── PYQ
│   ├── Syllabus
│   ├── Courses
│   ├── Quiz
│   ├── Calendar
│   ├── Notices
│   ├── Notifications
│   ├── Support
│   ├── Reports
│   └── Settings
│
└── Infrastructure Layer
    ├── Auth
    ├── Database
    ├── Storage
    ├── Notification Service
    ├── Search
    ├── Analytics
    ├── Moderation
    └── Error Monitoring
```

---

# 4. USER ROLES

The minimum role model should contain:

## 4.1 Student

A normal authenticated user.

Capabilities:

- create account,
- maintain profile,
- browse resources,
- search,
- save content,
- download permitted resources,
- take quizzes,
- generate quiz cards,
- submit resources,
- contact developer,
- receive notifications,
- manage own settings.

A student must never access admin operations.

## 4.2 Moderator

Optional but strongly recommended for scale.

Capabilities may include:

- review resource submissions,
- approve/reject resources,
- flag inappropriate content,
- manage selected content.

A moderator should not automatically receive access to:

- student private contact information beyond operational necessity,
- authentication credentials,
- system-level settings,
- financial configuration,
- unrestricted admin controls.

## 4.3 Admin

Full application management.

Capabilities:

- manage academic content,
- manage students,
- manage resources,
- manage quizzes,
- manage notices,
- manage calendar,
- send notifications,
- respond to student messages,
- review reports,
- manage selected configuration.

## 4.4 Super Admin

Optional highest privilege.

Capabilities:

- manage admins,
- change critical settings,
- access operational logs,
- perform emergency moderation,
- manage role assignments.

Do not create multiple super-admin accounts casually.

---

# 5. AUTHENTICATION AND REGISTRATION

Authentication is mandatory before accessing protected student features.

## 5.1 Registration flow

Recommended flow:

```text
Register
 ↓
Basic identity
 ↓
Academic information
 ↓
Contact information
 ↓
Profile image/avatar
 ↓
Terms/privacy confirmation
 ↓
Email verification if enabled
 ↓
Account creation
 ↓
Student profile creation
 ↓
Home
```

## 5.2 Required registration fields

At minimum:

- full name,
- email,
- mobile/contact number,
- course,
- branch,
- semester/year,
- gender selection if used for avatar selection,
- profile image or generated avatar choice,
- password,
- confirmation password,
- acceptance of terms/privacy policy.

Do not collect unnecessary personal information.

## 5.3 Email

Email should be unique.

Validation:

- trim whitespace,
- lowercase for comparison/storage where appropriate,
- validate format,
- reject duplicate account registration,
- provide useful error message.

Never display a raw database error to the student.

## 5.4 Mobile number

The application should:

- normalize input,
- validate expected Indian phone number format if the application is India-focused,
- prevent accidental spaces or unsupported characters,
- avoid displaying the complete number publicly.

If OTP verification is not implemented initially, clearly treat the number as profile information rather than claiming it is verified.

## 5.5 Password

Password policy should be reasonable rather than unnecessarily complicated.

Recommended:

- minimum length,
- reject extremely weak passwords,
- confirmation field,
- password visibility toggle.

Never store passwords manually in the BEU BABA database.

Use the authentication provider.

## 5.6 Gender and avatar

If the user chooses an application avatar instead of uploading a photo:

- male selection can map to the male avatar pool,
- female selection can map to the female avatar pool,
- additional neutral avatar option should ideally exist.

The generated character should be treated as an avatar preference, not as an identity claim.

Random selection should be deterministic after selection unless the user explicitly changes it.

## 5.7 Profile image

Allow:

- JPG,
- JPEG,
- PNG,
- WebP.

Recommended maximum upload size should be enforced.

Client-side processing should:

1. check MIME type,
2. check size,
3. preview image,
4. optionally resize/compress,
5. upload,
6. show progress,
7. save storage reference.

Do not trust only the file extension.

## 5.8 Registration errors

Examples:

- "Email already registered."
- "Please enter a valid email."
- "Password is too short."
- "Passwords do not match."
- "Please select your course."
- "Please select your branch."
- "Profile image is too large."

Errors must appear near the relevant field.

---

# 6. LOGIN

Login should be minimal.

Fields:

- email,
- password.

Actions:

- login,
- forgot password,
- create account.

Optional:

- remember session through secure authentication persistence.

Do not store raw passwords in localStorage.

## 6.1 Login state

Show:

```text
Signing you in…
```

with a small non-blocking loading indicator.

Avoid full-screen loading unless absolutely necessary.

## 6.2 Failed login

Use a generic security-safe message.

Example:

"Email or password is incorrect."

Do not reveal whether an email exists.

---

# 7. STUDENT PROFILE

The profile is the student's central identity area.

## 7.1 Profile data

Display:

- avatar/photo,
- name,
- email,
- contact number,
- course,
- branch,
- semester,
- academic year if relevant,
- account creation date where useful,
- quiz statistics,
- saved-resource count,
- submitted-resource count.

Avoid displaying sensitive information unnecessarily.

## 7.2 Profile editing

Editable:

- profile image,
- display name where policy permits,
- contact number,
- course/branch/semester according to admin configuration,
- avatar,
- selected preferences.

Some academic fields may be locked after account creation to prevent incorrect analytics. If locked, provide an edit-request mechanism.

## 7.3 Profile completion

Optional profile completion indicator:

```text
Profile 80% complete
```

Do not force users to fill irrelevant data just to reach 100%.

---

# 8. HOME DASHBOARD

The home screen should answer three questions immediately:

1. What should I look at?
2. What academic resources are available?
3. What has changed recently?

## 8.1 Home hierarchy

Recommended:

```text
Header
 ├── Greeting
 ├── Avatar
 └── Notification button

Search

Quick actions
 ├── PYQ
 ├── Syllabus
 ├── Calendar
 └── Quiz

Continue/Recent
 ├── Recently opened
 └── Saved

Academic highlights
 ├── Notices
 ├── New resources
 └── Upcoming events

Toolbox preview

Developer/support entry
```

## 8.2 Personal greeting

Example:

"Good evening, Abhishek"

Avoid excessive personalization if the user has not provided a name.

## 8.3 Home content must be dynamic

The home page should not require redeployment every time:

- a new notice is added,
- a PYQ is uploaded,
- a quiz is published,
- a calendar event changes.

Content should come from the database.

---

# 9. GLOBAL SEARCH

Search is one of the most important utility features.

## 9.1 Search targets

Search across:

- courses,
- subjects,
- PYQs,
- syllabus,
- notices,
- quizzes,
- resources,
- calendar items,
- toolbox tools.

## 9.2 Search behavior

The search box should support:

- keyword search,
- partial matching,
- subject names,
- course names,
- semester,
- year,
- resource titles.

Example:

```text
Search: "DBMS"

Results:
PYQ — DBMS 2025
Syllabus — DBMS Unit 1
Notes — DBMS Complete Notes
Quiz — DBMS Basics
```

## 9.3 Search ranking

Prefer:

1. exact title match,
2. exact subject match,
3. keyword match,
4. metadata match,
5. fuzzy match.

## 9.4 Search empty state

Example:

"No results found."

Then provide:

- spelling suggestion,
- popular categories,
- clear search action.

---

# 10. COURSES AND ACADEMIC STRUCTURE

The course structure should be hierarchical.

Recommended model:

```text
Course
 └── Branch
      └── Semester
           └── Subject
                ├── Syllabus
                ├── PYQ
                ├── Notes
                ├── Quiz
                └── Videos/resources
```

## 10.1 Course

Examples can be configured by admin.

Fields:

- name,
- short name,
- description,
- duration,
- active status.

## 10.2 Branch

Fields:

- branch name,
- code,
- course ID,
- active status.

## 10.3 Semester

Fields:

- semester number,
- academic year,
- active status.

## 10.4 Subject

Fields:

- subject name,
- subject code,
- semester,
- branch/course,
- credits if required,
- description,
- active status.

This structure prevents duplicated data.

---

# 11. PYQ SYSTEM

PYQ is a core feature.

## 11.1 PYQ metadata

Each paper should have:

- title,
- course,
- branch,
- semester,
- subject,
- examination type,
- year,
- paper code if available,
- file URL/storage path,
- file size,
- page count if available,
- uploader,
- verification status,
- published date,
- version.

## 11.2 PYQ browsing

Allow filters:

- course,
- branch,
- semester,
- subject,
- year,
- exam type.

## 11.3 PYQ detail

Display:

- title,
- subject,
- year,
- exam type,
- metadata,
- preview if available,
- open/view,
- download,
- save/bookmark,
- report.

## 11.4 Duplicate PYQs

The system should attempt to detect duplicates using:

- title similarity,
- subject,
- year,
- file checksum if available.

Do not automatically delete suspected duplicates. Flag them for admin review.

## 11.5 PYQ upload

Admin/moderator workflow:

```text
Upload
 ↓
Validate
 ↓
Metadata
 ↓
Preview
 ↓
Verify
 ↓
Publish
```

---

# 12. SYLLABUS SYSTEM

Syllabus is frequently changed, so it must be database-driven.

## 12.1 Syllabus structure

Possible structure:

```text
Syllabus
 ├── Course
 ├── Branch
 ├── Semester
 ├── Academic session
 ├── Effective date
 ├── Version
 ├── Status
 └── Document/content
```

## 12.2 Versioning

Never overwrite historical syllabus blindly.

Example:

```text
B.Tech CSE
Semester 3

2024–25 — Archived
2025–26 — Active
2026–27 — Active/Future
```

## 12.3 Publish logic

Only one version should normally be marked active for a specific scope and effective period unless the university officially has multiple applicable versions.

## 12.4 Student behavior

Student opens syllabus:

```text
Course
→ Branch
→ Semester
→ Current Syllabus
```

Optional:

"View previous syllabus versions"

---

# 13. YEARLY ACADEMIC CALENDAR

Calendar content must be editable without code changes.

## 13.1 Event fields

- title,
- event type,
- start date,
- end date,
- description,
- applicable course,
- applicable branch,
- semester,
- priority,
- source/reference,
- status.

## 13.2 Event types

Examples:

- examination,
- result,
- registration,
- admission,
- holiday,
- semester start,
- semester end,
- form submission,
- practical examination,
- other.

## 13.3 Calendar views

Support:

- monthly,
- list,
- upcoming events.

## 13.4 Important dates

The home page may show:

```text
Upcoming
12 Sep — Exam Form Deadline
18 Sep — Semester Examination
```

## 13.5 Notification connection

Admin can optionally mark an event as notification-worthy.

The system should not automatically spam students for every calendar entry.

---

# 14. NOTICES

Notices should be managed dynamically.

## 14.1 Notice fields

- title,
- summary,
- full content,
- published date,
- expiry date,
- category,
- priority,
- attachment,
- source,
- target audience,
- status.

## 14.2 Notice priority

Recommended:

- normal,
- important,
- urgent.

Urgent notices should be visually distinct but not use alarming animation.

## 14.3 Expiry

Expired notices should:

- disappear from active feed,
- remain in archive if required.

---

# 15. QUIZ SYSTEM

Quiz is a major differentiating feature.

## 15.1 Quiz goals

Students should be able to:

- choose a quiz,
- answer questions,
- see progress,
- submit,
- receive score,
- review answers,
- generate a result card,
- save/share the result.

## 15.2 Quiz metadata

Fields:

- title,
- description,
- subject,
- course,
- branch,
- semester,
- difficulty,
- question count,
- duration,
- passing score,
- creator,
- publication status.

## 15.3 Question model

Each question should contain:

- question text,
- options,
- correct option,
- explanation,
- marks,
- negative marks if applicable,
- question image if required.

## 15.4 Quiz states

```text
Draft
Published
Paused
Archived
```

## 15.5 Quiz start

Before starting, show:

- title,
- question count,
- time,
- rules,
- scoring,
- negative marking,
- start button.

## 15.6 Quiz interface

Show:

- question number,
- question,
- options,
- progress,
- previous/next,
- mark for review,
- timer.

Do not allow accidental navigation away to silently lose progress.

## 15.7 Timer

Timer should:

- update accurately,
- warn near end,
- automatically submit when time expires.

If network connectivity is lost, the client should preserve local quiz state temporarily.

## 15.8 Submission

Before final submission:

```text
You have answered 18/20 questions.
2 questions are unanswered.

Submit quiz?
```

Allow cancellation.

## 15.9 Result

Display:

- score,
- percentage,
- correct,
- incorrect,
- unanswered,
- time used,
- rank/percentile only if statistically meaningful.

Do not claim a rank if there are too few participants.

---

# 16. QUIZ RESULT CARD

This is a strong shareable feature.

## 16.1 Card contents

Possible:

- BEU BABA logo/name,
- student display name,
- quiz title,
- score,
- percentage,
- correct/incorrect,
- date,
- optional streak,
- unique result ID or verification code.

Do not expose email or phone number on the public/shareable card.

## 16.2 Download

Allow generation as:

- PNG,
- optionally PDF.

The generated card should be visually premium and consistent.

## 16.3 Share

Use Web Share API where supported.

Fallback:

- download image,
- copy result text.

---

# 17. STUDENT TOOLBOX

The toolbox should contain practical everyday tools.

The exact tool list can grow.

Initial 10+ tools may include:

1. CGPA calculator.
2. Percentage calculator.
3. Attendance calculator.
4. Marks calculator.
5. SGPA calculator.
6. Age calculator.
7. Unit converter.
8. Scientific calculator.
9. Study timer/Pomodoro.
10. Date difference calculator.
11. GPA target calculator.
12. Exam countdown.
13. QR generator.
14. Password generator.
15. Text formatter.

Tools should work locally whenever possible.

Do not send basic calculations to a server.

## 17.1 Calculator principle

User inputs:

```text
Current CGPA
Target CGPA
Credits
```

The tool should clearly explain the formula and assumptions.

Never pretend an estimated formula is an official university calculation if it is not.

---

# 18. RESOURCE SUBMISSION SYSTEM

Students can contribute resources.

This requires moderation.

## 18.1 Submission flow

```text
Student
 ↓
Choose resource type
 ↓
Upload file
 ↓
Enter metadata
 ↓
Submit
 ↓
Pending moderation
 ↓
Admin/Moderator review
 ↓
Approve OR Reject
 ↓
If approved → Publish
```

## 18.2 Resource types

Examples:

- notes,
- PYQ,
- syllabus,
- study material,
- practical file,
- lab manual,
- important questions,
- reference material.

## 18.3 Submission metadata

Require:

- title,
- subject,
- course,
- branch,
- semester,
- resource type,
- description,
- file,
- confirmation that user has permission to submit/share it.

## 18.4 Copyright/moderation warning

The application should make it clear that users should not upload material they do not have permission to distribute.

Admin should have:

- report,
- takedown,
- rejection,
- archive.

## 18.5 Submission status

Student can see:

```text
Pending
Approved
Rejected
Needs changes
```

If rejected, provide a reason when appropriate.

---

# 19. RESOURCE DETAIL PAGE

Show:

- title,
- resource type,
- subject,
- semester,
- uploader display name only if appropriate,
- verification badge,
- published date,
- file size,
- preview,
- open,
- download,
- save,
- report.

Avoid exposing personal uploader contact information.

---

# 20. BOOKMARKS AND SAVED CONTENT

Users should be able to save:

- PYQs,
- syllabus,
- notes,
- quizzes,
- notices,
- calendar items.

The saved section should be filterable.

Database relation:

```text
user
resource
saved_at
```

Use a unique constraint to prevent duplicate bookmarks.

---

# 21. RECENTLY VIEWED

Optional but highly useful.

Store lightweight activity:

- resource ID,
- user ID,
- viewed timestamp.

Limit history to a reasonable number such as the most recent 20–50 items.

Do not store every UI click forever.

---

# 22. DOWNLOADS

Downloaded files may be handled by the browser/PWA.

The backend should not assume a successful download merely because a download button was clicked.

If tracking download analytics is required, record an event separately.

Do not expose signed storage URLs permanently if protected access is required.

---

# 23. DEVELOPER SUPPORT / PRIVATE MESSAGING

The application should include a simple private support channel rather than a public social chat.

## 23.1 Purpose

Students can contact the developer regarding:

- bugs,
- syllabus updates,
- course updates,
- missing resources,
- feature requests,
- account problems,
- incorrect information,
- general feedback.

## 23.2 Privacy model

A message from Student A must be visible only to:

- Student A,
- authorized developer/admin staff.

Student B must never see Student A's conversation.

## 23.3 Conversation model

```text
Conversation
 ├── student_id
 ├── status
 ├── created_at
 └── updated_at

Message
 ├── conversation_id
 ├── sender_id
 ├── sender_role
 ├── message
 ├── attachment
 ├── created_at
 └── read_at
```

## 23.4 Conversation status

- open,
- awaiting student,
- awaiting developer,
- resolved,
- archived.

## 23.5 Attachments

Allow optional:

- screenshot,
- image,
- PDF if needed.

Apply strict file-size and MIME validation.

## 23.6 Message UI

Keep it simple:

```text
Developer Support

[Conversation]

Student message
Developer reply

[Write your message...]

[Send]
```

No need for a full social-media chat system.

## 23.7 Read state

Student should see:

- sent,
- delivered where supported,
- read where implemented.

Admin sees unread count.

---

# 24. NOTIFICATION SYSTEM

Notifications should be useful, not spammy.

## 24.1 Notification types

- new PYQ,
- new syllabus,
- important notice,
- quiz published,
- developer reply,
- resource approved,
- resource rejected,
- calendar reminder,
- system update.

## 24.2 In-app notifications

Every authenticated user should have a notification center.

Each notification contains:

- title,
- body,
- type,
- target route,
- created time,
- read status.

## 24.3 Deep linking

If a notification relates to a specific resource, tapping it should open that resource.

Example:

```text
New PYQ available
→ /pyq/abc123
```

## 24.4 Push notifications

Because BEU BABA is intended as a PWA, browser push notifications can be supported where permission and platform support allow.

However:

- notification permission must be requested thoughtfully,
- do not request permission immediately on first page load,
- explain the benefit first,
- provide settings to disable notification categories.

---

# 25. PWA ARCHITECTURE

BEU BABA can be deployed as a web app and installed as a PWA.

## 25.1 PWA requirements

Include:

- manifest,
- icons,
- theme metadata,
- service worker,
- installability requirements,
- offline fallback,
- caching strategy.

## 25.2 What should work offline

Potentially:

- app shell,
- previously loaded static UI,
- toolbox calculations,
- cached recent resources where legally/technically appropriate.

Do not claim that every PDF is offline unless it is actually cached.

## 25.3 Update strategy

The app should detect a new deployment and update the service worker safely.

The user should not get trapped on an outdated version.

Provide a gentle update prompt:

"New version available — refresh to update."

---

# 26. ADMIN DASHBOARD

The admin dashboard is the operational center.

## 26.1 Dashboard metrics

Possible cards:

- total students,
- active students,
- resources,
- pending submissions,
- quizzes,
- notices,
- unread support messages.

Avoid showing vanity metrics without meaning.

## 26.2 Recent activity

Show:

- new student,
- new resource submission,
- support message,
- quiz publication,
- content update.

## 26.3 Quick actions

Examples:

- Add PYQ,
- Add syllabus,
- Add notice,
- Create quiz,
- Review resources,
- Reply to messages.

---

# 27. ADMIN STUDENT MANAGEMENT

Admin can view student records according to authorization.

Fields:

- student name,
- email,
- contact,
- course,
- branch,
- semester,
- registration date,
- last activity,
- status.

## 27.1 Search and filter

Filters:

- course,
- branch,
- semester,
- account status,
- registration date.

## 27.2 Student detail

Admin can inspect operational information.

Do not display authentication secrets.

## 27.3 Account status

Possible:

- active,
- suspended,
- deactivated.

Suspension should be auditable.

---

# 28. ADMIN RESOURCE MANAGEMENT

Admin needs:

- list,
- search,
- filter,
- preview,
- edit metadata,
- approve,
- reject,
- archive,
- restore.

## 28.1 Bulk operations

Useful later:

- bulk publish,
- bulk archive,
- bulk categorization.

Bulk deletion should require extra confirmation.

---

# 29. ADMIN QUIZ MANAGEMENT

Admin should be able to:

- create quiz,
- add questions,
- reorder questions,
- edit questions,
- set correct answers,
- set marks,
- set timer,
- publish,
- pause,
- archive,
- inspect results.

## 29.1 Draft autosave

Quiz creation should autosave drafts where practical.

A browser crash should not destroy 30 questions.

---

# 30. ADMIN SYLLABUS MANAGEMENT

Admin needs explicit version control.

Fields:

- academic session,
- course,
- branch,
- semester,
- document,
- effective date,
- status.

Publishing should warn:

"Another active syllabus exists for this scope."

Require deliberate confirmation.

---

# 31. ADMIN CALENDAR MANAGEMENT

Admin can:

- create event,
- edit event,
- delete/archive,
- assign audience,
- set reminder eligibility.

A change should be reflected dynamically in the student application.

---

# 32. ADMIN NOTICE MANAGEMENT

Admin can:

- draft,
- publish,
- schedule,
- expire,
- archive.

Scheduled publication is preferable to manual midnight operations.

---

# 33. ADMIN NOTIFICATION MANAGEMENT

Admin can send notifications to:

- all students,
- course,
- branch,
- semester,
- selected segment.

Every notification should have:

- title,
- body,
- target audience,
- optional route,
- priority,
- publish time,
- expiry.

Avoid unrestricted "send to everyone" actions without confirmation.

---

# 34. ADMIN SUPPORT INBOX

Support should be organized like a lightweight ticket inbox.

Columns:

- student,
- subject/topic,
- last message,
- status,
- last updated,
- priority.

Admin can open a private thread and reply.

## 34.1 Support categories

Allow:

- Bug report,
- Syllabus update,
- Course/resource request,
- Account issue,
- Feature request,
- Other.

This makes support analytics useful.

---

# 35. DATABASE MODEL

A suggested relational model:

```text
profiles
courses
branches
semesters
subjects

resources
resource_versions
resource_submissions

pyqs
syllabi
calendar_events
notices

quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_answers
quiz_results

bookmarks
recent_views

notifications
notification_preferences

support_conversations
support_messages

admin_actions
reports
```

The exact schema can evolve, but relationships must remain normalized.

---

# 36. PROFILE TABLE

Suggested fields:

```text
id
auth_user_id
full_name
email
phone
course_id
branch_id
semester_id
avatar_type
avatar_url
gender_selection
role
status
created_at
updated_at
```

Do not duplicate authentication password fields.

---

# 37. RESOURCE TABLE

Suggested fields:

```text
id
title
description
resource_type
course_id
branch_id
semester_id
subject_id
storage_path
mime_type
file_size
thumbnail_path
verification_status
uploaded_by
published_by
published_at
created_at
updated_at
```

---

# 38. SECURITY MODEL

Security must be enforced on the server/database, not only through frontend route guards.

## 38.1 Principle

Frontend restrictions improve UX.

Backend/database policies provide actual security.

Never rely on:

```javascript
if (role === "admin") {
  showAdmin();
}
```

as the only protection.

The database must enforce authorization.

## 38.2 Row Level Security

Recommended rules:

Student can:

- read published public academic resources,
- read own profile,
- update own profile,
- read own submissions,
- create own submissions,
- read own support conversations,
- create messages in own support conversation.

Student cannot:

- read another student's profile,
- read another student's support conversation,
- modify published resources,
- modify quizzes,
- modify syllabus,
- modify notices.

Admin can access according to role policy.

---

# 39. FILE SECURITY

Uploaded files must be validated.

Check:

- MIME type,
- file size,
- extension,
- storage location,
- authorization.

For high-risk file types, restrict uploads entirely.

Avoid allowing arbitrary executable files.

Recommended resource formats:

- PDF,
- JPG,
- JPEG,
- PNG,
- WebP.

Additional formats can be introduced later if required.

---

# 40. CONTENT MODERATION

Student uploads require moderation.

## 40.1 Status lifecycle

```text
pending
   ↓
under_review
   ↓
approved → published

pending → rejected
pending → needs_changes
published → archived
```

## 40.2 Rejection reason

Examples:

- duplicate,
- incorrect subject,
- unreadable file,
- incomplete metadata,
- inappropriate content,
- copyright concern,
- unsupported format.

Do not insult or blame the student.

---

# 41. AUDIT LOGGING

Admin changes should be logged.

Record:

- admin ID,
- action,
- entity type,
- entity ID,
- timestamp,
- optional before/after metadata.

Examples:

```text
Admin approved resource 123
Admin published syllabus 456
Admin rejected submission 789
Admin sent notification
```

Audit logs are especially important for academic content changes.

---

# 42. ERROR HANDLING

Every major feature needs:

- loading state,
- empty state,
- error state,
- success state.

## 42.1 Generic error

Use:

"Something went wrong. Please try again."

Provide:

[Retry]

Do not display stack traces.

## 42.2 Network error

Use:

"You appear to be offline."

If cached content is available, show it.

## 42.3 Permission error

Use:

"You don't have permission to access this content."

Do not reveal database authorization details.

---

# 43. LOADING ARCHITECTURE

Use skeletons instead of blank screens.

Examples:

- card skeleton,
- list skeleton,
- profile skeleton,
- quiz question skeleton.

Avoid giant spinners for every small action.

Buttons should show localized loading:

```text
Publish → Publishing…
```

---

# 44. EMPTY STATES

Every collection needs a meaningful empty state.

Examples:

Saved:

"You haven't saved anything yet."

Submissions:

"No resource submissions yet."

Notifications:

"You're all caught up."

PYQ filter:

"No papers found for these filters."

The empty state should suggest the next action where possible.

---

# 45. ROUTING

Suggested route architecture:

```text
/
 /login
 /register
 /forgot-password

/app
 /app/home
 /app/courses
 /app/pyq
 /app/syllabus
 /app/calendar
 /app/notices
 /app/quiz
 /app/toolbox
 /app/resources
 /app/saved
 /app/notifications
 /app/profile
 /app/support

/admin
 /admin/dashboard
 /admin/students
 /admin/resources
 /admin/pyq
 /admin/syllabus
 /admin/courses
 /admin/subjects
 /admin/calendar
 /admin/notices
 /admin/quizzes
 /admin/notifications
 /admin/support
 /admin/reports
 /admin/settings
```

Protected routes should redirect unauthenticated users to login.

---

# 46. NAVIGATION ARCHITECTURE

The student application should use a primary bottom navigation inspired by modern mobile interaction.

Possible primary destinations:

- Home
- Explore/Resources
- Quiz
- Toolbox
- Profile

Academic modules such as PYQ and syllabus can appear under Home/Explore or be exposed as prominent quick actions.

Do not overload the bottom bar with 8–10 items.

## 46.1 Active state

The active navigation item should have:

- clear selected capsule/surface,
- subtle motion,
- icon transition,
- strong text contrast.

The active state should be obvious even without animation.

---

# 47. RESPONSIVE BEHAVIOR

The application must work across:

- mobile,
- tablet,
- desktop.

Mobile is a first-class experience.

## 47.1 Mobile

Use:

- bottom navigation,
- full-width cards,
- touch-friendly controls,
- large enough hit targets.

## 47.2 Desktop

Use:

- wider content area,
- optional side navigation,
- multi-column layouts,
- hover interactions.

Do not simply stretch mobile UI across a 1920px screen.

---

# 48. STATE MANAGEMENT

Use local state for local UI.

Use server state for backend data.

Avoid putting every piece of data into one global state store.

Examples:

Local:

- modal open,
- selected tab,
- temporary form input.

Server:

- current profile,
- resources,
- notifications,
- quiz data.

Persistent:

- user preferences,
- selected filters where useful.

---

# 49. DATA FETCHING

Use caching and request deduplication.

Avoid:

```text
Open Home
→ fetch courses
→ fetch courses again
→ fetch subjects
→ fetch courses again
```

Use structured query keys and invalidation.

After admin publishes a resource:

- invalidate relevant resource lists,
- refresh dashboard counts,
- avoid full application reload.

---

# 50. OPTIMISTIC UI

Use optimistic updates only where failure can be safely reversed.

Good examples:

- bookmark toggle,
- mark notification read.

Be cautious with:

- publish,
- delete,
- approve,
- reject,
- account suspension.

These should wait for server confirmation.

---

# 51. CACHE STRATEGY

Cache:

- course metadata,
- branch metadata,
- subject metadata,
- published resources,
- syllabus metadata.

Do not cache sensitive student data indiscriminately.

Invalidate cache after:

- content updates,
- user profile changes,
- admin publishing actions.

---

# 52. PERFORMANCE REQUIREMENTS

Target:

- fast initial load,
- lazy-loaded admin modules,
- optimized images,
- compressed thumbnails,
- minimal JavaScript on public routes,
- no unnecessary animation loops.

Large PDF files should not be bundled into the frontend.

---

# 53. IMAGE STRATEGY

Profile images:

- resize,
- compress,
- generate thumbnail if needed.

Resource thumbnails:

- use optimized images,
- lazy-load below the fold.

Do not load full-resolution images just to display a 100px card.

---

# 54. ANIMATION ARCHITECTURE

Animation should exist mainly in:

- course-card entrance,
- horizontal scrolling,
- search expansion,
- bottom navigation active state,
- modal transitions,
- page transitions,
- quiz progress,
- bookmark feedback,
- loading transitions.

Avoid:

- animated background objects,
- RGB glow,
- floating 3D objects everywhere,
- constant particles,
- excessive parallax.

Animations should generally be:

- short,
- smooth,
- interruptible,
- purposeful.

---

# 55. SEARCH ANIMATION

The search interaction can use:

```text
Compact search pill
        ↓ tap
Expanded search surface
        ↓ type
Results animate in
        ↓ select
Search surface collapses
```

Do not make search animation so elaborate that it delays typing.

---

# 56. COURSE CARD INTERACTION

Course cards may use subtle:

- scale on press,
- elevation shift,
- glass highlight,
- thumbnail movement,
- content reveal.

The entire card should remain accessible as one obvious interaction.

---

# 57. QUIZ INTERACTION

Quiz transitions should communicate progress.

When moving from Question 4 to Question 5:

- old question exits smoothly,
- new question enters,
- progress indicator updates.

Do not make the user wait for animation.

---

# 58. NOTIFICATION UX

When a new notification arrives:

- update badge,
- optionally subtle icon feedback.

Avoid loud animations.

---

# 59. ACCESSIBILITY

Support:

- keyboard navigation,
- visible focus,
- semantic buttons,
- labels,
- sufficient contrast,
- reduced motion.

If user prefers reduced motion, simplify or disable non-essential animation.

---

# 60. REDUCED MOTION

Respect:

```text
prefers-reduced-motion
```

For users who enable it:

- remove large transitions,
- reduce parallax,
- remove unnecessary movement,
- retain essential state changes.

---

# 61. FORM VALIDATION

Validation should occur:

- while typing where useful,
- on blur,
- on submit.

Do not show ten errors immediately on first page render.

Validation messages must be actionable.

Bad:

"Invalid."

Better:

"Enter a valid 10-digit mobile number."

---

# 62. CONFIRMATION RULES

Confirmation is required for destructive actions.

Examples:

Delete:

"Delete this resource? This action cannot be easily undone."

Archive:

"Archive this resource?"

Reject:

"Reject this submission?"

Publish:

"Publish this content to students?"

Do not ask confirmation for harmless actions such as opening a resource.

---

# 63. DEVELOPER SOCIAL LINKS

BEU BABA developer/contact information should be configurable.

Current intended links include:

Instagram:

- naturelensbyabhi
- er_abhi2026

Portfolio:

- erabhi.in
- i-am-er-abhi.vercel.app

Telegram:

- https://t.me/+wnAYQ4wVOxg2M2Rl

These should ideally be stored in application configuration rather than hard-coded across components.

If a link changes, admin should be able to update it in one place where practical.

---

# 64. DEVELOPER PROFILE DATA

Developer information should be retrieved from the configured developer portfolio information when required.

Do not duplicate long biographies across multiple pages.

Recommended:

```text
Developer
Name
Role
Short bio
Portfolio
Instagram
Telegram
```

The support screen can include:

"Contact developer"

rather than forcing users to leave the application.

---

# 65. CONTENT CONFIGURATION

Academic content must be data-driven.

Never hard-code:

- syllabus lists,
- yearly calendar dates,
- PYQ years,
- notices,
- course lists,
- quiz questions.

Hard-coded UI labels are acceptable.

Hard-coded academic records are not.

---

# 66. HOW A SYLLABUS UPDATE SHOULD WORK

Admin flow:

```text
Admin opens Syllabus
↓
Select course
↓
Select branch
↓
Select semester
↓
Create new version
↓
Upload PDF/content
↓
Enter academic session
↓
Set effective date
↓
Preview
↓
Publish
```

Student application automatically sees the new active version after cache refresh.

No frontend code modification should be necessary.

---

# 67. HOW A CALENDAR UPDATE SHOULD WORK

Admin changes:

```text
Exam date
```

The system updates:

- calendar,
- upcoming events,
- relevant notice if configured,
- notification if admin chooses.

Do not duplicate the date manually in multiple frontend files.

---

# 68. HOW A COURSE UPDATE SHOULD WORK

Admin should be able to:

- add course,
- rename course,
- deactivate course,
- add branch,
- add subject.

Historical records should remain linked to stable IDs.

Do not use subject names as database primary keys.

---

# 69. IDENTIFIERS

Every major entity should have a stable unique ID.

Examples:

```text
course_id
branch_id
subject_id
resource_id
quiz_id
notification_id
conversation_id
```

Never identify records only by title.

---

# 70. SOFT DELETE

For academic records, prefer archiving/soft deletion.

Examples:

A PYQ should not disappear permanently because an admin clicked delete.

Use:

```text
status = archived
```

and retain audit history.

Hard deletion should be restricted.

---

# 71. VERSIONING

Version important documents.

Example:

```text
Resource
 ├── Version 1
 ├── Version 2
 └── Version 3
```

The student normally sees the current version.

Historical versions may be available when academically meaningful.

---

# 72. SEARCH INDEXING

If the database grows significantly, search should eventually use dedicated full-text search.

Start simple if the dataset is small.

Do not prematurely build a complicated search engine.

The architecture should leave room for:

- PostgreSQL full-text search,
- trigram matching,
- external search service if needed later.

---

# 73. ANALYTICS

Useful non-sensitive analytics:

- resource views,
- downloads,
- quiz starts,
- quiz completions,
- search terms,
- most-used toolbox tools,
- support categories,
- active resources.

Do not collect unnecessary personal tracking.

Analytics should serve product improvement.

---

# 74. EVENT TRACKING

Example events:

```text
resource_viewed
resource_downloaded
quiz_started
quiz_completed
bookmark_added
search_performed
tool_opened
support_message_sent
resource_submitted
```

Events should avoid storing unnecessary sensitive content.

---

# 75. RATE LIMITING

Protect:

- login attempts,
- support message submission,
- resource uploads,
- quiz submission,
- notification operations,
- search endpoints if server-intensive.

Rate limits should be server-side.

---

# 76. ANTI-SPAM RESOURCE SUBMISSIONS

Possible controls:

- authenticated users only,
- upload size limits,
- daily submission limits,
- duplicate detection,
- moderation queue,
- abuse reporting.

Do not make submission impossible for legitimate students.

---

# 77. NOTIFICATION PREFERENCES

Students should eventually control categories:

```text
Academic notices
Quiz updates
New resources
Developer replies
Calendar reminders
System updates
```

Critical security/account notifications may not be optional.

---

# 78. ACCOUNT SETTINGS

Settings can include:

- notification preferences,
- profile,
- privacy,
- appearance,
- reduced motion,
- logout,
- account deletion/request.

Keep settings understandable.

---

# 79. ACCOUNT DELETION

If implemented:

```text
Settings
→ Delete account
→ Explain consequences
→ Confirm
→ Re-authenticate if needed
→ Process deletion/deactivation
```

Do not delete records blindly if legal/audit retention is required.

Anonymize where appropriate.

---

# 80. PRIVACY PRINCIPLES

The application should follow data minimization.

Only collect data needed for:

- account,
- academic personalization,
- communication,
- application operation.

Never expose:

- passwords,
- authentication tokens,
- private conversations,
- hidden admin data.

---

# 81. STUDENT DATA IN ADMIN

Admin dashboard can show operational student details required for administration.

However, role-based access should determine who can see:

- contact number,
- email,
- support history,
- account status.

Do not make all information publicly searchable.

---

# 82. PRIVATE SUPPORT ACCESS CONTROL

Critical rule:

```text
Student A
   ↓
Conversation A
   ↓
Messages A

Student B
   ↓
Conversation B
   ↓
Messages B
```

There must be no query that returns all conversations to normal students.

Only authorized staff can view the support inbox.

---

# 83. QUIZ SECURITY

If the application wants meaningful quiz results, avoid sending all correct answers to the client before completion.

For casual practice quizzes, client-side answers may be acceptable.

For competitive/exam-style quizzes:

- server should validate answers,
- result should be calculated securely,
- attempt IDs should be protected.

---

# 84. QUIZ ANTI-CHEAT EXPECTATIONS

Do not promise impossible anti-cheating.

Possible measures:

- random question order,
- random option order,
- time limits,
- one attempt,
- server-side timestamps.

These reduce casual cheating but do not guarantee exam-level integrity.

---

# 85. QUIZ ATTEMPT MODEL

Store:

```text
attempt_id
user_id
quiz_id
started_at
submitted_at
score
status
```

Answers:

```text
attempt_id
question_id
selected_option
is_correct
marks_awarded
```

---

# 86. RESUME QUIZ

If the user accidentally closes the page:

- restore the active attempt if allowed,
- restore selected answers,
- restore timer based on server start time.

Do not trust only local timer state.

---

# 87. COURSE CONTENT ACCESS

If future paid courses are added, access control must be introduced separately.

Do not assume that every logged-in user automatically gets access to premium content.

Possible future fields:

```text
access_level
subscription
purchase
course_enrollment
```

This document keeps the architecture extensible.

---

# 88. FUTURE PREMIUM CONTENT

The architecture should allow:

```text
Free
Premium
Restricted
Coming Soon
```

without redesigning the entire database.

However, do not implement payment complexity until there is a concrete business requirement.

---

# 89. UI DATA CONTRACT

Every screen should consume structured data.

Example resource object:

```text
{
  id,
  title,
  type,
  subject,
  semester,
  thumbnail,
  verificationStatus,
  publishedAt
}
```

The UI should not parse random strings to infer application logic.

---

# 90. COMPONENT BOUNDARIES

Recommended component categories:

```text
layout/
navigation/
cards/
forms/
feedback/
modals/
academic/
quiz/
resources/
toolbox/
profile/
notifications/
support/
admin/
```

Keep domain-specific logic close to the domain.

---

# 91. API/SERVICE BOUNDARIES

Create service functions such as:

```text
authService
profileService
courseService
resourceService
pyqService
syllabusService
calendarService
noticeService
quizService
toolboxService
notificationService
supportService
adminService
```

Do not place all database queries in UI components.

---

# 92. ERROR BOUNDARIES

Use application-level error boundaries.

If one widget crashes:

- do not crash the entire application,
- show a local fallback,
- provide retry.

For example, if "Upcoming Events" fails, the rest of Home should remain usable.

---

# 93. OFFLINE FORM BEHAVIOR

For non-critical forms:

- preserve draft locally,
- show offline status,
- retry when connection returns where appropriate.

For support messages, avoid claiming successful sending while offline.

Display:

"Message saved locally. It will be sent when you're online."

Only implement automatic retry if the system can guarantee no duplicates.

---

# 94. DUPLICATE SUBMISSION PROTECTION

For important actions, use idempotency where practical.

Examples:

- support message,
- quiz submission,
- resource submission.

A user double-clicking Submit should not create two records.

---

# 95. BUTTON BEHAVIOR

Every action button needs a clear state:

```text
Default
Hover
Pressed
Loading
Success
Disabled
Error
```

Never leave a user wondering whether their action succeeded.

---

# 96. TOASTS

Use toast notifications for lightweight feedback.

Examples:

"Saved to bookmarks."

"Resource submitted for review."

"Notification marked as read."

Do not use toasts as the only place for critical errors.

---

# 97. MODALS

Use modals for:

- confirmation,
- focused forms,
- quick previews.

Do not put entire complex application pages into modal windows.

---

# 98. DRAWERS

Useful for:

- filters,
- mobile navigation,
- resource details,
- admin quick actions.

The drawer must be dismissible and keyboard accessible.

---

# 99. FILTER STATE

Filters should be represented explicitly.

Example:

```text
subject = DBMS
semester = 3
year = 2025
```

A clear-all button should reset them.

On mobile, show a filter count:

```text
Filters · 3
```

---

# 100. DEEP LINKING

Every important resource should have a stable URL.

Examples:

```text
/app/pyq/{id}
/app/syllabus/{id}
/app/quiz/{id}
/app/resources/{id}
```

A user should be able to refresh the page without losing the resource context.

---

# 101. SHAREABLE LINKS

Shareable academic resource links should:

- verify access,
- resolve to the correct content,
- work from a fresh browser session.

If login is required, redirect to login and then return to the intended resource.

---

# 102. SEO

The authenticated app is not the primary SEO target.

Public pages may have:

- proper titles,
- metadata,
- social preview.

Do not expose private student pages to search engines.

---

# 103. ADMIN ROUTE PROTECTION

Admin routes require:

1. authenticated session,
2. admin/moderator role,
3. server-side authorization.

If unauthorized:

```text
403 — Access denied
```

Do not simply hide the route.

---

# 104. SESSION HANDLING

Handle:

- session restoration,
- expiration,
- logout,
- invalid token,
- password reset.

When session expires:

"Your session has expired. Please sign in again."

Avoid losing unsaved form content where possible.

---

# 105. LOGOUT

Logout should:

- clear local session state,
- clear sensitive cached data,
- return to login/public page.

Do not leave private student information visible after logout.

---

# 106. ADMIN CONTENT PREVIEW

Before publishing, admin should be able to preview exactly what students will see.

This is especially important for:

- notices,
- quizzes,
- syllabus,
- resources.

---

# 107. PUBLISH CHECKLIST

Before publication, validate:

- title,
- category,
- course,
- branch,
- semester,
- file,
- status,
- visibility.

Show validation errors before publication.

---

# 108. CONTENT QUALITY

Admin UI should encourage consistency.

For example, subject selection should use a dropdown from the subject table rather than requiring admins to type "Database Management System" manually every time.

This reduces duplicates.

---

# 109. RESOURCE TAXONOMY

Resource type should be controlled.

Example enum:

```text
PYQ
NOTES
SYLLABUS
PRACTICAL
LAB_MANUAL
IMPORTANT_QUESTIONS
REFERENCE
OTHER
```

Admin can extend this list through configuration later if needed.

---

# 110. ACADEMIC FILTER CONSISTENCY

The same course/branch/semester/subject taxonomy should be used everywhere.

Do not create:

```text
CSE
Computer Science
Computer Science Engineering
C.S.E.
```

as four unrelated values.

Use canonical IDs.

---

# 111. DATA IMPORT

If academic data is extracted from an existing app or dataset, import it into normalized tables.

Do not simply dump a giant JSON file into one database column.

Use JSON for:

- seed data,
- migration,
- static configuration where appropriate.

Use relational tables for frequently queried academic data.

---

# 112. INITIAL DATA SEEDING

A seed process may populate:

- courses,
- branches,
- semesters,
- subjects,
- PYQ metadata,
- syllabus metadata,
- calendar data,
- initial toolbox configuration.

After import, admin should manage live data through the application.

---

# 113. JSON IMPORT/EXPORT

Admin may eventually have:

```text
Export academic data
Import academic data
```

This is useful for backup and migration.

Validate imported JSON against schema before modifying production records.

Never blindly overwrite production data from an uploaded JSON file.

---

# 114. BACKUP STRATEGY

Database backups should be handled by the backend infrastructure.

Important content should also have a recoverable storage strategy.

Do not treat the frontend repository as the only backup.

---

# 115. DATA CONSISTENCY

When deleting a subject:

Do not automatically delete:

- PYQs,
- quizzes,
- resources,
- results.

Instead:

- prevent deletion if dependent data exists,
- deactivate the subject,
- preserve relationships.

---

# 116. ADMIN SAFETY

For destructive actions:

- require confirmation,
- display affected entity,
- optionally require typed confirmation for high-risk operations,
- write audit log.

---

# 117. SUPPORT PRIORITY

Support tickets can have:

```text
low
normal
high
urgent
```

Urgent should be reserved for:

- account access,
- severe incorrect academic information,
- application-breaking problems.

Do not allow students to abuse urgency without review.

---

# 118. BUG REPORT FLOW

Student selects:

```text
Bug report
```

Then optionally:

- screen/page,
- description,
- screenshot,
- device/browser information.

Do not automatically collect excessive device information.

---

# 119. SYLLABUS UPDATE REQUEST

Student can send:

```text
Syllabus update
```

Include:

- current course,
- branch,
- semester,
- requested correction,
- optional source/document.

This makes developer support actionable.

---

# 120. COURSE UPDATE REQUEST

Similarly:

```text
Course/resource request
```

Student can specify:

- course,
- subject,
- desired material,
- reason.

---

# 121. FEATURE REQUEST

Allow users to suggest features.

Admin can categorize:

- new tool,
- academic content,
- UI,
- performance,
- other.

This can become a product feedback pipeline.

---

# 122. REPORT CONTENT

Every published user-generated resource should ideally have:

```text
Report
```

Reasons:

- incorrect,
- duplicate,
- inappropriate,
- copyright concern,
- broken file,
- wrong category.

Reports go to admin/moderator.

---

# 123. REPORT LIFECYCLE

```text
reported
→ reviewing
→ resolved
```

Possible resolution:

- keep,
- edit,
- archive,
- remove,
- contact uploader.

---

# 124. CONTENT TRUST

A verified resource can display a subtle verification badge.

Verification should mean:

"The resource was reviewed/approved by BEU BABA."

Do not imply that it is officially issued by the university unless it genuinely is.

---

# 125. SOURCE ATTRIBUTION

Where academic documents originate from an official source, preserve source information.

Possible field:

```text
source_name
source_reference
```

This improves trust.

---

# 126. LEGAL/CONTENT DISCLAIMER

The application should clearly distinguish:

- official university documents,
- community-uploaded resources,
- BEU BABA-created content.

Do not create false authority.

---

# 127. APP INFORMATION

Include:

- app name: BEU BABA,
- version,
- developer information,
- support,
- privacy policy,
- terms,
- content disclaimer.

Version should come from application configuration.

---

# 128. FEATURE FLAGS

For future development, use feature flags for features that are not ready.

Examples:

```text
quiz_enabled
student_uploads_enabled
push_notifications_enabled
developer_chat_enabled
```

Do not leave broken experimental UI visible to students.

---

# 129. MAINTENANCE MODE

Admin should optionally enable maintenance mode.

Student experience:

```text
BEU BABA is temporarily under maintenance.

Please try again shortly.
```

Admin access should remain available if configured.

---

# 130. SYSTEM STATUS

Optional status information:

- database operational,
- storage operational,
- notification service operational.

Do not expose internal infrastructure details publicly.

---

# 131. NOTIFICATION DELIVERY ARCHITECTURE

Use a central notification service.

Flow:

```text
Event occurs
↓
Create notification record
↓
Determine target users
↓
In-app notification
↓
Optional push notification
```

A developer reply should create a notification for that student.

---

# 132. NOTIFICATION DEDUPLICATION

Do not send five identical notifications because five frontend components refreshed.

Notifications should originate from backend events, not UI rendering.

---

# 133. USER PREFERENCES

Store preferences such as:

```text
notifications_enabled
quiz_notifications
resource_notifications
calendar_notifications
developer_messages
reduced_motion
```

Defaults should be sensible.

---

# 134. MOBILE PERFORMANCE

Avoid loading:

- all admin code,
- all resources,
- all quiz data,
- all thumbnails

on initial launch.

Use lazy loading.

---

# 135. DESKTOP PERFORMANCE

Large screens can display more content, but do not fetch thousands of records.

Use:

- pagination,
- infinite scrolling where appropriate,
- server-side filtering.

---

# 136. PAGINATION

Admin lists should use pagination.

Examples:

```text
Students: 25/page
Resources: 25/page
Support: 20/page
```

Exact number can be configured.

---

# 137. INFINITE SCROLL

Good for:

- resource feed,
- notices,
- recent activity.

Less ideal for:

- admin tables,
- academic selection pages.

---

# 138. TABLE DESIGN

Admin tables should support:

- sorting,
- filtering,
- pagination,
- row actions.

On mobile, convert tables into cards or horizontally scrollable views rather than forcing tiny text.

---

# 139. SEARCH DEBOUNCE

Search-as-you-type should debounce requests.

Do not send a backend request for every single keystroke.

---

# 140. IMAGE FALLBACKS

If thumbnail fails:

Show a neutral resource placeholder based on type.

Examples:

PDF → PDF icon  
Quiz → Quiz icon  
Syllabus → document icon

Never show broken-image icons as the main experience.

---

# 141. RESOURCE PREVIEW

If browser PDF preview is supported, show it.

Otherwise:

- provide open/download action,
- show metadata.

Do not build a custom PDF engine unnecessarily.

---

# 142. LARGE PDF HANDLING

Large PDFs should:

- stream/download,
- not be converted into huge base64 strings,
- use lazy preview where possible.

---

# 143. SECURITY OF DOWNLOAD LINKS

For private/protected files:

- generate short-lived signed URLs,
- verify user access,
- avoid permanent public URLs.

For genuinely public academic documents, public URLs may be acceptable.

---

# 144. ADMIN FILE UPLOAD

Show:

- filename,
- size,
- type,
- upload progress,
- validation,
- success.

If upload fails:

"Upload failed. Try again."

Do not reset the entire form unless necessary.

---

# 145. FORM DRAFTS

Long admin forms should preserve draft state.

Especially:

- quiz creation,
- notice creation,
- resource metadata.

Use secure/local draft storage carefully.

Never store sensitive secrets in browser drafts.

---

# 146. QUIZ QUESTION EDITOR

The editor should allow:

- question text,
- options,
- correct answer,
- explanation,
- marks,
- optional image.

Question ordering should be drag-and-drop on desktop with accessible alternatives.

---

# 147. QUIZ VALIDATION

Cannot publish if:

- no questions,
- no correct answer,
- duplicate option IDs,
- invalid marks,
- missing title.

If negative marking is enabled, validate the configured values.

---

# 148. QUIZ RESULTS PRIVACY

A student should see their own results.

Admin can see aggregate results where authorized.

Do not publicly expose student performance unless the student explicitly chooses to share it.

---

# 149. LEADERBOARD

A leaderboard can be added later.

If implemented:

- use display names,
- allow privacy controls,
- avoid exposing email/phone,
- explain scoring period.

Do not rank students unfairly based on incomplete attempts.

---

# 150. STREAKS

Optional:

- daily quiz streak,
- study streak.

Do not use manipulative notifications.

Streaks should remain secondary to learning.

---

# 151. FAVORITES VS BOOKMARKS

Use one consistent concept.

Recommended label:

"Saved"

Students understand it quickly.

---

# 152. RECENT ACTIVITY

Home can show:

```text
Continue where you left off
```

Examples:

- last opened PYQ,
- last quiz,
- last syllabus.

Keep this compact.

---

# 153. QUICK ACTIONS

Recommended high-priority quick actions:

```text
PYQ
Syllabus
Calendar
Quiz
```

Toolbox can be a separate prominent destination.

---

# 154. HOME PERSONALIZATION

Personalize based on registered:

- course,
- branch,
- semester.

For example, prioritize relevant subjects.

But allow students to browse outside their branch when appropriate.

---

# 155. CROSS-SEMESTER ACCESS

Students may need older-semester PYQs.

Do not lock all academic browsing strictly to the current semester.

Current-semester personalization should be a convenience, not a hard restriction.

---

# 156. ACADEMIC CONTENT DISCOVERY

Explore can include:

```text
Your Semester
All Subjects
PYQ
Notes
Syllabus
Quizzes
```

This makes the platform useful beyond the dashboard.

---

# 157. TOOLBOX CALCULATOR VALIDATION

Tool results should include:

- output,
- formula,
- assumptions,
- reset.

Do not hide calculation logic when the formula is educationally relevant.

---

# 158. TOOLBOX PRIVACY

Toolbox calculations should generally remain local.

Do not send:

- marks,
- personal dates,
- passwords,
- arbitrary calculator inputs

to a server unless necessary.

---

# 159. PASSWORD GENERATOR

If included, generate locally.

Never transmit generated passwords to backend.

Allow:

- length,
- symbols,
- numbers,
- uppercase,
- lowercase.

---

# 160. QR GENERATOR

Generate locally if possible.

Allow:

- text,
- URL.

Do not automatically upload generated QR content.

---

# 161. STUDY TIMER

A Pomodoro timer can operate entirely client-side.

Support:

- work duration,
- short break,
- long break,
- pause,
- reset.

Optionally store preferences.

---

# 162. EXAM COUNTDOWN

Use calendar events where available.

Student can choose an event and see:

```text
18 days
4 hours
```

Do not display stale countdowns due to incorrect timezone handling.

---

# 163. TIMEZONE

The application should consistently handle India Standard Time for India-focused academic events.

Backend timestamps should preferably be stored in UTC and rendered in the user's relevant timezone.

---

# 164. DATE FORMATTING

Use consistent date formatting.

Example:

```text
12 September 2026
```

For compact cards:

```text
12 Sep
```

Avoid inconsistent formats across screens.

---

# 165. ADMIN TIMEZONE

Scheduled notifications and publications should clearly display the timezone.

For an India-first deployment, default to IST while retaining a timezone-aware implementation.

---

# 166. ACCESSIBILITY OF GLASS UI

Glass surfaces must still maintain text contrast.

Do not place light gray text over bright translucent glass where it becomes unreadable.

Blur is decorative, not a substitute for contrast.

---

# 167. MOTION PERFORMANCE

Prefer transform/opacity animations.

Avoid animating:

- large box-shadow changes,
- expensive filters on huge surfaces,
- layout properties repeatedly.

Backdrop blur should be used selectively.

---

# 168. GLASS LAYERING

Use a hierarchy such as:

```text
Page background
→ glass shell
→ glass card
→ elevated glass card
→ modal glass surface
```

Do not give every element the same blur and opacity.

---

# 169. PREMIUM FEEL

Premium quality should come from:

- spacing,
- typography,
- consistency,
- restraint,
- micro-interactions,
- polished states,
- fast performance.

Not from adding more effects.

---

# 170. ADMIN DESIGN

Admin can share the same design language but should prioritize information density.

Do not make admin screens overly decorative.

Students need elegance.

Admins need efficiency.

---

# 171. STUDENT VS ADMIN NAVIGATION

Student:

```text
Home
Explore
Quiz
Toolbox
Profile
```

Admin:

```text
Dashboard
Content
Students
Quiz
Support
Settings
```

Use role-appropriate navigation.

---

# 172. NOTIFICATION BADGES

Badge counts should be capped visually:

```text
99+
```

Do not display giant numbers that break the navigation layout.

---

# 173. SUPPORT BADGES

Admin support icon can show:

```text
3 unread
```

Student sees:

```text
1 reply
```

---

# 174. RESOURCE APPROVAL NOTIFICATION

When approved:

"Your resource has been approved and is now available on BEU BABA."

When rejected:

"Your resource submission needs attention."

Do not expose internal moderation notes unnecessarily.

---

# 175. SUPPORT REPLY NOTIFICATION

Student receives:

"You received a reply from BEU BABA Support."

Tap opens the private conversation.

---

# 176. RESOURCE VERSION UPDATE

If a resource is updated, existing bookmarks should continue to resolve to the current valid version.

Do not break saved links unnecessarily.

---

# 177. BROKEN RESOURCE HANDLING

If a file is missing:

Show:

"This resource is temporarily unavailable."

Admin should receive an operational flag.

Do not show a blank PDF viewer.

---

# 178. CONTENT CACHE INVALIDATION

When admin changes a resource:

- update database,
- invalidate cache,
- refresh relevant lists,
- keep stable resource ID.

---

# 179. ADMIN CONTENT SEARCH

Admin search should support:

- title,
- subject,
- ID,
- uploader,
- status.

This is essential once hundreds/thousands of resources exist.

---

# 180. STUDENT SEARCH FILTERS

Student search can show filter chips:

```text
All
PYQ
Syllabus
Notes
Quiz
Notice
```

Selecting a chip should update results smoothly.

---

# 181. SEARCH RECENT HISTORY

Optional.

Store a small number of recent search terms locally.

Provide:

"Clear search history."

Do not sync search history unless there is a genuine product reason.

---

# 182. HOME CONTENT PRIORITY

Priority order:

1. urgent academic information,
2. personalized academic resources,
3. upcoming dates,
4. recently added content,
5. toolbox/discovery.

Do not put promotional material above critical academic information.

---

# 183. PROMOTIONAL CONTENT

If the application later includes developer/course promotions, clearly separate them from academic notices.

Do not make advertising look like official university notices.

---

# 184. TRUST SIGNALS

Useful signals:

- verified,
- updated date,
- academic session,
- source,
- reviewed.

These are more valuable than decorative badges.

---

# 185. CONTENT FRESHNESS

Show:

```text
Updated 2 days ago
```

where helpful.

Do not show "updated just now" if the timestamp is stale or manually changed.

---

# 186. ADMIN CONTENT PREVIEW

Preview should show:

- mobile view,
- desktop view where feasible,
- actual metadata,
- links,
- attachments.

This prevents publishing mistakes.

---

# 187. RELEASE MANAGEMENT

Application releases should follow:

```text
Development
→ Testing
→ Staging
→ Production
```

Do not test experimental database migrations directly on production.

---

# 188. DATABASE MIGRATIONS

Every schema change should be versioned.

Examples:

```text
001_initial_schema
002_add_quiz
003_add_support
004_add_resource_versioning
```

Never manually change production schema without recording the change.

---

# 189. ENVIRONMENT VARIABLES

Secrets belong in environment variables.

Examples:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

Never commit secrets into Git.

Frontend public keys must still be protected by proper database policies.

---

# 190. LOGGING

Application logs should include useful technical context without exposing secrets.

Never log:

- passwords,
- auth tokens,
- private message contents unnecessarily.

---

# 191. ERROR MONITORING

Production should ideally have error monitoring.

Capture:

- frontend crashes,
- failed critical operations,
- unexpected API errors.

Do not include sensitive user data in error payloads.

---

# 192. TESTING STRATEGY

Minimum testing layers:

1. unit tests,
2. component tests,
3. integration tests,
4. end-to-end tests,
5. security checks,
6. responsive checks.

---

# 193. CRITICAL E2E FLOWS

Must test:

### Registration

```text
Register
→ profile created
→ home opens
```

### Login

```text
Login
→ authenticated
→ home
```

### PYQ

```text
Search
→ filter
→ open
→ save
→ download
```

### Quiz

```text
Open
→ start
→ answer
→ submit
→ result
→ generate card
```

### Submission

```text
Upload
→ pending
→ admin approves
→ published
```

### Support

```text
Student sends
→ admin sees
→ admin replies
→ student receives
```

---

# 194. SECURITY TESTS

Test:

- student cannot access admin,
- student cannot read another student's support,
- student cannot modify resources,
- invalid file upload rejected,
- expired session rejected,
- unauthorized API calls blocked.

---

# 195. RESPONSIVE TEST MATRIX

Test at least:

- small mobile,
- modern Android,
- iPhone-sized viewport,
- tablet,
- 1366px desktop,
- 1920px desktop.

Check:

- bottom nav,
- glass cards,
- modal,
- search,
- quiz,
- tables,
- admin forms.

---

# 196. BROWSER SUPPORT

Prioritize modern:

- Chrome,
- Edge,
- Safari,
- Firefox.

PWA behavior may vary by browser/platform.

Gracefully degrade features such as push notifications if unsupported.

---

# 197. INSTALL PROMPT

Do not aggressively show:

"Install App!!!"

Instead use contextual messaging:

"Install BEU BABA for quicker access."

Only show when installation criteria are met.

---

# 198. APP ICON AND BRAND

App icon should be simple and recognizable at small size.

Avoid overly detailed illustrations.

The BEU BABA brand should remain legible in:

- favicon,
- PWA icon,
- notification icon,
- profile/app launch context.

---

# 199. BRAND NAME

Official application name:

**BEU BABA**

Use consistently.

Do not randomly alternate:

- BEU Baba,
- BeuBaba,
- BEU-BABA.

Internal code can use:

```text
beu-baba
```

where appropriate.

---

# 200. APPLICATION VERSION

Display:

```text
BEU BABA v1.0.0
```

in settings/about if desired.

Follow semantic versioning where practical.

---

# 201. FEATURE PRIORITY

### P0 — Must have

- Authentication
- Profile
- Home
- PYQ
- Syllabus
- Calendar
- Notices
- Search
- Quiz
- Toolbox
- Resource submission
- Admin moderation
- Developer support
- Notifications
- Security/RLS
- PWA foundation

### P1 — High value

- Saved resources
- Recently viewed
- Push notifications
- Quiz card sharing
- Resource reports
- Advanced admin filters
- Content versioning

### P2 — Later

- Leaderboards
- Study streaks
- Advanced analytics
- AI-assisted content discovery if ever desired
- Social/community functionality

Do not add P2 features before P0 is stable.

---

# 202. MVP BOUNDARY

The first production version should not become an enormous social platform.

The MVP should focus on:

```text
Student
↓
Login
↓
Academic dashboard
↓
Find resources
↓
Study
↓
Quiz
↓
Use tools
↓
Send feedback/support
```

Admin:

```text
Manage students
Manage academic content
Verify uploads
Manage quizzes
Reply to students
Send notifications
```

---

# 203. DEVELOPMENT ORDER

Recommended implementation sequence:

## Phase 1 — Foundation

- React/Vite/TypeScript
- routing
- design tokens
- layout
- Supabase setup
- auth
- database schema
- RLS

## Phase 2 — Student Core

- registration
- login
- profile
- home
- navigation
- search

## Phase 3 — Academic Content

- courses
- subjects
- PYQ
- syllabus
- calendar
- notices

## Phase 4 — Engagement

- quiz
- results
- result card
- toolbox
- bookmarks

## Phase 5 — Contribution

- resource upload
- moderation
- reports

## Phase 6 — Communication

- developer support
- notifications
- push

## Phase 7 — Admin

- dashboard
- student management
- content management
- quiz management
- support
- analytics

## Phase 8 — PWA and optimization

- service worker
- install
- caching
- performance
- offline support

## Phase 9 — QA

- security
- responsive
- accessibility
- E2E
- production testing

---

# 204. DEFINITION OF DONE

A feature is not complete merely because the main screen works.

A feature is complete when it includes:

- UI,
- responsive behavior,
- loading state,
- empty state,
- error state,
- success state,
- validation,
- authorization,
- database integration,
- appropriate caching,
- accessibility,
- testing,
- analytics if required,
- documentation.

---

# 205. CODING AGENT RULES

If this specification is given to an AI coding agent, the agent must not:

- invent database tables without checking existing schema,
- hard-code academic data,
- replace working architecture unnecessarily,
- install random packages without reason,
- create fake API responses in production code,
- bypass authentication,
- expose admin routes,
- store passwords manually,
- place secrets in frontend source,
- add dark/RGB/AI-themed decorative backgrounds,
- create unnecessary 3D backgrounds,
- remove accessibility,
- remove loading/error states,
- use placeholder content as final academic content.

Before changing architecture, inspect the current project.

---

# 206. AI AGENT IMPLEMENTATION LOOP

For each feature:

```text
1. Inspect repository
2. Inspect existing architecture
3. Inspect database schema
4. Identify reusable components
5. Implement backend/data contract
6. Implement UI
7. Implement states
8. Implement authorization
9. Test
10. Fix errors
11. Verify responsive behavior
12. Document changes
```

Never jump directly from request to massive code generation without inspecting the current system.

---

# 207. NO FAKE FUNCTIONALITY

If a button says:

"Download"

it must actually download or open the configured file.

If it says:

"Send"

it must actually submit the message.

If it says:

"Save"

it must persist the bookmark.

If a feature is not implemented, label it:

"Coming soon"

rather than pretending it works.

---

# 208. NO HARDCODED USER DATA

Do not hard-code:

```text
Abhishek
CSE
Semester 3
```

as the active user's information.

Use authenticated profile data.

---

# 209. NO HARDCODED ACADEMIC CONTENT

Do not hard-code:

```text
DBMS
Operating System
2025 PYQ
2026 Exam
```

into React components.

Store content in the database.

---

# 210. DATA SOURCE OF TRUTH

For each entity, define one source of truth.

Example:

```text
Subjects → subjects table
PYQs → pyqs/resources table
Syllabus → syllabi table
Calendar → calendar_events table
Students → profiles/auth
Notifications → notifications table
```

Do not maintain competing copies in:

- frontend JSON,
- database,
- local constants.

Seed data is acceptable for initial setup but should eventually flow into the production database.

---

# 211. CONTENT UPDATE PRINCIPLE

The administrator should be able to change academic content without asking a developer to edit code.

This is especially important for:

- syllabus,
- calendar,
- PYQs,
- notices,
- subjects,
- resources.

This principle should guide the database and admin UI.

---

# 212. ADMIN CONTENT EDITOR EXPERIENCE

Admin should not need technical knowledge.

Use:

- dropdowns,
- date pickers,
- file upload,
- structured fields,
- previews,
- clear publish buttons.

Avoid requiring raw JSON for ordinary content management.

---

# 213. IMPORT TOOL

A future admin import screen may allow JSON/CSV upload.

The system should first:

```text
Validate
→ Preview changes
→ Show errors
→ Confirm
→ Import
```

Never import immediately without preview for bulk production changes.

---

# 214. CHANGE PREVIEW

For bulk imports:

```text
12 new subjects
4 updated resources
2 archived records
3 errors
```

Admin can fix errors before committing.

---

# 215. CONTENT AUDIT

Each important content item should show:

```text
Created by
Created at
Last updated by
Last updated at
Published by
Published at
```

This makes maintenance easier.

---

# 216. SUPPORT AUDIT

Support messages should preserve:

- sender,
- timestamp,
- message order.

Do not allow an admin edit to silently rewrite historical student messages.

If deletion is necessary, record moderation/audit information.

---

# 217. MESSAGE ATTACHMENTS

Support attachments should be associated with the message.

Access must follow the same conversation permissions.

Never put private support attachments into a globally public bucket.

---

# 218. NOTIFICATION ATTACHMENTS

Avoid large attachments in push notifications.

Use notification → deep link → content page.

---

# 219. DEVELOPER CONTACT SCREEN

The contact screen can include:

```text
Need help?

Report a bug
Request syllabus update
Request course/resource
Suggest a feature
Other

Private message
```

Below:

```text
Developer links
Instagram
Portfolio
Telegram
```

The private message remains inside BEU BABA.

---

# 220. CONTACT MESSAGE LIMITS

Prevent accidental spam with:

- reasonable message length,
- attachment size limit,
- cooldown if necessary.

Do not make normal support communication frustrating.

---

# 221. CONTENT REQUEST STATUS

A student may optionally see:

```text
Submitted
Under review
Completed
```

for structured requests.

This reduces repeated messages.

---

# 222. ADMIN RESPONSE TEMPLATES

Optional canned replies:

- "Your issue has been received."
- "The syllabus is being reviewed."
- "The requested resource has been added."
- "Please provide a screenshot."

Templates save time but should remain editable.

---

# 223. STUDENT FEEDBACK

After resolving a support conversation, optionally ask:

"Was this helpful?"

Use a simple yes/no or 1–5 rating.

Do not make it mandatory.

---

# 224. NOTIFICATION CENTER UX

Group notifications by:

- Today,
- Earlier.

Allow:

- mark read,
- mark all read,
- open notification.

Do not delete notifications automatically unless retention policy allows.

---

# 225. HOME NOTIFICATION BADGE

Unread count should update without requiring a complete page refresh when practical.

Realtime can be used selectively.

---

# 226. REALTIME USE

Realtime is useful for:

- developer replies,
- notification count,
- admin support inbox.

Do not use realtime for every academic list.

Static academic content does not need constant subscriptions.

---

# 227. DATABASE INDEXING

Index fields frequently used for:

- course,
- branch,
- semester,
- subject,
- year,
- status,
- published_at,
- user_id.

Do not add indexes blindly; inspect query patterns.

---

# 228. QUERY SECURITY

Every server query must enforce user authorization.

Never accept:

```text
user_id
```

from the frontend and assume it belongs to the authenticated user.

Use the authenticated identity from the server/auth context.

---

# 229. IDOR PREVENTION

A URL such as:

```text
/support/conversation/123
```

must not allow Student B to open Student A's conversation by changing `123` to another value.

Database policies must prevent this.

---

# 230. STORAGE ACCESS CONTROL

Likewise:

```text
/resource-file/student-a-private-file.pdf
```

must not become accessible merely because a user knows the path.

Use appropriate storage policies.

---

# 231. FRONTEND SECURITY

Avoid injecting raw HTML from user submissions.

If rich text is supported:

- sanitize it,
- restrict allowed tags,
- prevent script injection.

Student-uploaded titles/descriptions must be rendered safely.

---

# 232. ADMIN SECURITY

Admin accounts should ideally use stronger authentication such as MFA where supported.

Do not send admin credentials through chat or source code.

---

# 233. SESSION SECURITY

Use secure authentication mechanisms provided by the chosen auth provider.

Do not create custom homemade authentication unless there is a compelling reason.

---

# 234. PASSWORD RESET

Flow:

```text
Forgot password
→ enter email
→ receive reset
→ set new password
→ login
```

Do not reveal account existence through error messages.

---

# 235. EMAIL VERIFICATION

If enabled:

- account can be created,
- verification status tracked,
- restricted actions can require verification.

Do not accidentally lock users out without a recovery path.

---

# 236. PROFILE PHOTO PRIVACY

Profile photos should not automatically become public resources.

A student's profile image should only be visible where required.

---

# 237. DEFAULT AVATAR PRIVACY

Generated avatars are safer for public leaderboard-like features than personal photographs.

If a leaderboard is later added, default to avatar/display name.

---

# 238. DATA RETENTION

Define retention periods for:

- notifications,
- audit logs,
- support messages,
- analytics events.

Do not retain everything forever without reason.

---

# 239. ARCHIVED CONTENT

Archived content can remain accessible to admins.

Students normally see active content only unless historical access is intended.

---

# 240. FUTURE MULTI-UNIVERSITY SUPPORT

The current app is BEU-focused, but architecture can eventually support:

```text
university_id
```

Do not add complexity unless needed.

If multi-university support is anticipated, avoid hard-coding "BEU" into database relationships.

---

# 241. INTERNATIONALIZATION

Initial language may be English.

Architecture should avoid hard-coding all text inside deeply nested components if future Hindi/Hinglish support is desired.

Academic content may remain language-specific.

---

# 242. LANGUAGE SUPPORT

Future:

- English,
- Hindi.

Do not automatically translate academic/legal content without review.

---

# 243. COPYWRITING

Use human language.

Avoid:

- "Initiate authentication sequence."
- "Resource retrieval failed due to network unavailability."

Prefer:

- "Please sign in again."
- "We couldn't load this resource."

---

# 244. MICROCOPY

Buttons should be direct:

- Save
- Open
- Download
- Start Quiz
- Submit
- Reply
- Upload
- Publish
- Approve
- Reject

Avoid unnecessarily clever labels.

---

# 245. FINAL USER JOURNEY

A new student should experience:

```text
Open BEU BABA
↓
See premium light interface
↓
Register
↓
Enter academic details
↓
Choose/upload avatar
↓
Arrive at personalized Home
↓
See PYQ / Syllabus / Calendar / Quiz
↓
Search subject
↓
Open resource
↓
Save it
↓
Take quiz
↓
Generate result card
↓
Use toolbox
↓
Submit useful resource
↓
Receive approval notification
↓
Contact developer if needed
```

This journey should feel coherent from beginning to end.

---

# 246. ADMIN JOURNEY

Admin should experience:

```text
Login
↓
Dashboard
↓
See pending submissions
↓
Review resource
↓
Approve
↓
Resource becomes visible
↓
Student notification
↓
Student opens resource
```

For syllabus:

```text
Admin
↓
Syllabus
↓
Create new version
↓
Upload
↓
Preview
↓
Publish
↓
Student automatically sees new active version
```

For support:

```text
Student sends message
↓
Admin inbox updates
↓
Admin opens conversation
↓
Admin replies
↓
Student gets notification
↓
Student opens private chat
```

---

# 247. QUALITY BAR

BEU BABA should feel like a polished product, not a college project.

That means:

- no broken links,
- no placeholder buttons,
- no inconsistent spacing,
- no fake content presented as official,
- no accidental dark/RGB visual theme,
- no excessive animation,
- no insecure student data,
- no duplicated academic data,
- no unexplained errors,
- no dead-end screens.

Every major interaction must have a clear result.

---

# 248. FINAL ARCHITECTURAL PRINCIPLES

The entire application should follow these rules:

### Rule 1
**Database-driven academic content.**

### Rule 2
**Authentication before protected student data.**

### Rule 3
**Server-side authorization, not frontend-only security.**

### Rule 4
**Private student support conversations remain private.**

### Rule 5
**Student-uploaded resources require moderation.**

### Rule 6
**Important academic documents should support versioning.**

### Rule 7
**The UI must handle loading, empty, error, and success states.**

### Rule 8
**The application must be responsive and PWA-friendly.**

### Rule 9
**Premium visual design must not compromise performance or readability.**

### Rule 10
**No unnecessary AI/RGB/3D background aesthetic.**

### Rule 11
**Animations must communicate interaction or state.**

### Rule 12
**User privacy must be enforced at the data layer.**

### Rule 13
**Never hard-code live academic content into React components.**

### Rule 14
**Admin must be able to update academic content without developer intervention.**

### Rule 15
**No fake functionality.**

### Rule 16
**Stable IDs must be used for database entities.**

### Rule 17
**Important destructive actions require confirmation and auditability.**

### Rule 18
**The application must be maintainable by another developer.**

### Rule 19
**The MVP should prioritize academic utility rather than social features.**

### Rule 20
**Every feature should have a clear reason to exist.**

---

# 249. PRODUCTION ACCEPTANCE CHECKLIST

Before declaring BEU BABA production-ready, verify:

## Authentication
- [ ] Registration works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Password recovery works.
- [ ] Profile is created.
- [ ] Unauthorized users cannot access protected screens.

## Student
- [ ] Profile displays correct data.
- [ ] Profile image works.
- [ ] Avatar selection works.
- [ ] Course/branch/semester are stored correctly.

## Academic
- [ ] Courses load dynamically.
- [ ] Subjects load dynamically.
- [ ] PYQ filtering works.
- [ ] PYQ opening works.
- [ ] Syllabus versioning works.
- [ ] Calendar updates dynamically.
- [ ] Notices update dynamically.

## Quiz
- [ ] Quiz starts.
- [ ] Timer works.
- [ ] Answers persist.
- [ ] Submission works.
- [ ] Results calculate correctly.
- [ ] Result card generates.
- [ ] Results remain private.

## Toolbox
- [ ] Every tool calculates correctly.
- [ ] Inputs validate.
- [ ] Reset works.
- [ ] No unnecessary server requests occur.

## Resources
- [ ] Student can submit.
- [ ] Moderation works.
- [ ] Admin can approve/reject.
- [ ] Approved resource appears.
- [ ] Rejected resource remains private.
- [ ] Reports work.

## Support
- [ ] Student can create conversation.
- [ ] Student can send messages.
- [ ] Admin receives messages.
- [ ] Admin can reply.
- [ ] Student receives reply notification.
- [ ] Student cannot see another student's conversation.

## Notifications
- [ ] In-app notifications work.
- [ ] Read state works.
- [ ] Deep links work.
- [ ] Preferences work where implemented.
- [ ] Push notifications degrade gracefully when unsupported.

## Admin
- [ ] Admin route protected.
- [ ] Student cannot access admin.
- [ ] Content CRUD works.
- [ ] Audit logs work for critical actions.
- [ ] Student management works.

## PWA
- [ ] Manifest valid.
- [ ] Icons valid.
- [ ] Service worker works.
- [ ] Installability works where supported.
- [ ] Update process works.
- [ ] Offline fallback works.

## Design
- [ ] Light premium glass theme is consistent.
- [ ] No unwanted dark background.
- [ ] No RGB/AI-themed decoration.
- [ ] Active navigation state is clear.
- [ ] Search animation is smooth.
- [ ] Course-card motion is restrained.
- [ ] Reduced-motion preference is respected.

## Security
- [ ] RLS policies tested.
- [ ] Private support tested.
- [ ] Storage permissions tested.
- [ ] Admin permissions tested.
- [ ] File validation tested.
- [ ] Rate limits considered.
- [ ] No secrets committed.

---

# 250. FINAL BUILD TARGET

The final BEU BABA application should not merely be "a website containing PDFs."

It should function as a complete academic utility ecosystem:

```text
                 BEU BABA
                    │
        ┌───────────┼───────────┐
        │           │           │
     STUDY       PRACTICE     UTILITY
        │           │           │
     PYQ        QUIZ         Toolbox
     Syllabus   Results      Calculators
     Notes      Quiz Card    Timers
     Calendar
     Notices
        │
        └──────────────┐
                       │
                   COMMUNITY
                       │
                Student Uploads
                Moderation
                Reports
                       │
                       ▼
                  SUPPORT
                       │
                Developer Chat
                Bug Reports
                Requests
                       │
                       ▼
                   ADMIN
                       │
              Content Management
              Student Management
              Quiz Management
              Notifications
              Moderation
              Analytics
```

The defining characteristic of BEU BABA should be **integration**.

A student should not feel that they are opening separate mini-applications for PYQs, quizzes, calculators, resources, calendar, and support. Everything should feel like one carefully designed product.

The technical architecture should therefore prioritize shared:

- authentication,
- profile,
- academic taxonomy,
- search,
- navigation,
- notification infrastructure,
- permissions,
- design system,
- storage,
- analytics,
- error handling.

The visual architecture should prioritize:

- light premium glass surfaces,
- clear hierarchy,
- restrained motion,
- elegant navigation,
- polished micro-interactions,
- excellent readability.

The content architecture should prioritize:

- database-driven data,
- versioning,
- moderation,
- source attribution,
- admin control.

The security architecture should prioritize:

- least privilege,
- RLS,
- private conversations,
- protected files,
- secure authentication,
- auditability.

The product architecture should prioritize:

**simple for students, powerful for admins, maintainable for developers.**

That is the target standard for BEU BABA.
