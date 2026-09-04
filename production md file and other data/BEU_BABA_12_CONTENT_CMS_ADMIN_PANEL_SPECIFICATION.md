# BEU BABA — CONTENT MANAGEMENT, CMS & ADMIN PANEL ARCHITECTURE SPECIFICATION

**Document:** BEU_BABA_12_CONTENT_CMS_ADMIN_PANEL_SPECIFICATION.md  
**Project:** BEU BABA  
**Document Type:** Production-grade functional, UX, data, workflow, moderation, and implementation specification  
**Scope:** Admin panel, content management system, academic content operations, moderation, publishing, versioning, approval workflows, resource management, syllabus/calendar management, quizzes, user-submitted resources, developer communication, notifications, audit history, analytics, search indexing, and operational governance.

---

## 0. PURPOSE OF THIS DOCUMENT

This document defines how the BEU BABA administration system must work from the moment an administrator signs in until academic content, resources, quizzes, calendars, notices, user submissions, developer replies, and application configuration are created, reviewed, approved, published, updated, archived, or restored.

This is not a visual-only admin dashboard specification. It defines the operational system behind the dashboard. Every important button, status, form, permission, validation rule, workflow, database relationship, publishing rule, error state, audit requirement, and user-facing consequence is specified.

The primary objective is to make BEU BABA maintainable without requiring a developer to edit application source code whenever ordinary academic information changes. Syllabus information, yearly calendars, semester information, PYQs, notes, notices, resources, quiz questions, categories, links, and other content must be managed through structured administrative interfaces.

The system must separate **content data** from **application code**. The frontend should render approved records from the backend rather than containing large hard-coded collections of academic content.

The administrator must be able to operate the platform safely while the system prevents accidental deletion, accidental publication, unauthorized access, malformed records, duplicate content, unsafe files, and irreversible mistakes.

The architecture must support the following principle:

> **Create → Validate → Draft → Review → Approve → Publish → Monitor → Update → Version → Archive**

No major content type should bypass this lifecycle merely because the administrator has a convenient interface.

---

# 1. PRODUCT OPERATING MODEL

BEU BABA should be treated as two connected products:

1. **Student application**
2. **Administrative content and operations platform**

The student application is optimized for discovery, reading, learning, quiz participation, profile management, notifications, resources, and communication.

The admin platform is optimized for accuracy, speed, moderation, governance, visibility, accountability, and bulk operations.

The two interfaces must not share the same information density.

The student UI can use premium glassmorphism and expressive animations. The admin UI should use a restrained professional interface with excellent hierarchy, compact data tables, clear statuses, keyboard-friendly forms, confirmation dialogs, and efficient workflows.

The admin panel should still belong visually to BEU BABA, but it must not become a decorative showcase. Administrators frequently perform repetitive operations. Productivity is more important than visual effects.

---

# 2. ADMINISTRATIVE ROLES

The backend must not assume that every administrator has unlimited authority.

Recommended roles:

## 2.1 Super Admin

The highest operational role.

Capabilities:

- Manage administrators.
- Assign roles.
- Change global configuration.
- Approve sensitive content.
- Publish and unpublish content.
- Manage academic structures.
- Manage notification campaigns.
- Review audit logs.
- Manage storage policies.
- Restore archived records where permitted.
- Configure developer information.
- View operational analytics.
- Perform emergency maintenance operations.

A Super Admin must still be subject to audit logging.

The system must never treat a Super Admin action as invisible.

## 2.2 Content Admin

Focused on academic and informational content.

Capabilities:

- Create and edit notes.
- Manage PYQs.
- Manage syllabus.
- Manage academic calendar entries.
- Manage notices.
- Manage resources.
- Manage course information.
- Create and edit quiz content.
- Submit content for approval.
- View publishing status.

Content Admin should not automatically receive user-management or security-management privileges.

## 2.3 Moderator

Focused on student-submitted content and communication.

Capabilities:

- Review resource submissions.
- Reject or approve submissions.
- Request corrections.
- View reports associated with content.
- Manage developer/support conversations where assigned.
- Hide inappropriate user-generated content.

## 2.4 Support Admin

Focused on user support.

Capabilities:

- View permitted student profile information.
- Respond to developer/support messages.
- Mark conversations as open, pending, resolved.
- Search users.
- View relevant application context.
- Avoid changing academic content.

## 2.5 Analyst / Read-Only Admin

Can inspect:

- User statistics.
- Content statistics.
- Quiz statistics.
- Submission statistics.
- Notification performance.
- System health.

Cannot modify operational records.

---

# 3. ADMIN ACCESS CONTROL PRINCIPLES

Every administrative operation must be authorized server-side.

The interface hiding a button is not security.

For example, if a Moderator does not see the “Publish” button, the API must also reject a direct publish request from that role.

Permission checks must exist at:

1. UI level
2. Route level
3. API level
4. Database/RLS level where applicable
5. Storage policy level for files

Permissions should be explicit.

Example permission identifiers:

- `users.read`
- `users.update`
- `users.suspend`
- `content.create`
- `content.read`
- `content.update`
- `content.delete`
- `content.publish`
- `content.archive`
- `syllabus.manage`
- `calendar.manage`
- `pyq.manage`
- `quiz.create`
- `quiz.publish`
- `resource.review`
- `resource.approve`
- `resource.reject`
- `messages.read`
- `messages.reply`
- `notifications.create`
- `notifications.send`
- `admins.manage`
- `audit.read`
- `settings.manage`

The implementation should avoid scattering role-name checks throughout frontend code. Prefer a centralized permission map.

---

# 4. ADMIN DASHBOARD INFORMATION ARCHITECTURE

The primary navigation should contain:

1. Dashboard
2. Students
3. Courses
4. Subjects
5. Syllabus
6. Academic Calendar
7. PYQs
8. Notes & Study Material
9. Resources
10. Quizzes
11. Notices
12. Notifications
13. Developer Messages
14. Reports / Moderation
15. Media / Files
16. Analytics
17. Audit Logs
18. Settings
19. Admin Management

The exact navigation can be collapsed on smaller screens.

The sidebar should remember:

- Expanded/collapsed state
- Last active section
- Selected filters where practical

The dashboard must show only information that helps the administrator act.

Recommended dashboard cards:

- Total registered students
- Active students
- Pending resource submissions
- Draft content count
- Content awaiting approval
- Published content count
- Unresolved support messages
- Scheduled notifications
- Quiz participation today
- Recent content changes
- Recent administrator actions

Avoid meaningless decorative metrics.

---

# 5. DASHBOARD DESIGN

The admin dashboard should use a premium light glass interface, but unlike the student interface, glass should remain subtle.

Use:

- Light background
- White/translucent surfaces
- Fine borders
- Soft shadows
- Moderate backdrop blur
- Strong typography
- Compact cards
- Clear status badges
- Minimal gradients
- No RGB glow
- No dark cyberpunk styling
- No giant 3D objects
- No animated background objects

The dashboard should feel like a premium Apple-inspired professional management application.

Animation must be functional:

- Sidebar transitions
- Table row selection
- Modal appearance
- Filter transitions
- Toast notifications
- Loading skeletons
- Status changes

Do not animate every element.

---

# 6. GLOBAL ADMIN SEARCH

A global search should be available from the top navigation.

It should search permitted entities such as:

- Student name
- Student email
- Student contact number
- Student ID
- Course
- Branch
- Subject
- PYQ title
- Note title
- Resource title
- Quiz title
- Notice title
- Message ticket ID

Search results should be grouped by entity type.

Example:

**Students**
- Abhishek Kumar — CSE — 2nd Semester

**PYQs**
- Data Structures — 2025 — Semester 4

**Resources**
- Engineering Mathematics Formula Sheet

Search must respect permissions.

An admin must not receive records through search that they could not access through the normal interface.

---

# 7. CONTENT MODEL

All academic content should use structured records.

A content record should generally include:

- Unique ID
- Content type
- Title
- Slug
- Description
- Course
- Branch
- Semester
- Subject
- Academic year
- Tags
- Thumbnail/media reference
- File reference where applicable
- External URL where applicable
- Status
- Visibility
- Created by
- Updated by
- Created timestamp
- Updated timestamp
- Published timestamp
- Archived timestamp
- Version number

Do not store unrelated information in a single unstructured JSON blob if it deserves its own database field.

JSON can be used for flexible metadata, but core filtering fields must remain queryable.

---

# 8. CONTENT STATUS SYSTEM

Every major content entity should support a predictable lifecycle.

Recommended statuses:

`draft`

`in_review`

`approved`

`published`

`rejected`

`scheduled`

`archived`

`unpublished`

The exact allowed transitions must be controlled.

Example:

Draft → In Review

In Review → Approved

In Review → Rejected

Approved → Published

Approved → Scheduled

Scheduled → Published

Published → Unpublished

Published → Archived

Archived → Draft, only for authorized roles

Rejected → Draft

A normal Content Admin should not be able to move an arbitrary rejected record directly to Published.

---

# 9. DRAFT SYSTEM

Drafts are critical because administrators often enter incomplete information.

A draft must:

- Save without publication.
- Be visible to authorized administrators.
- Not appear to students.
- Be editable.
- Show who created it.
- Show last update time.
- Preserve unsaved-change warnings.

The interface should display:

**Draft — Not visible to students**

This message should be clear.

If an administrator closes a form containing unsaved modifications, show a confirmation.

---

# 10. APPROVAL WORKFLOW

For content types requiring approval:

1. Creator prepares content.
2. Creator validates required fields.
3. Creator submits for review.
4. Reviewer receives pending item.
5. Reviewer inspects content and attachments.
6. Reviewer approves or rejects.
7. Rejection requires a reason.
8. Approved content becomes publishable.
9. Publishing is logged.
10. Student application receives only published content.

Rejection reasons should be stored.

Examples:

- Incorrect semester
- Wrong academic year
- File unreadable
- Duplicate resource
- Incorrect subject
- Missing metadata
- Copyright concern
- Inappropriate content
- Needs correction

---

# 11. VERSION CONTROL

Academic information changes.

Therefore, updating a syllabus or calendar should not destroy historical context.

Every significant published modification should create a new version.

Example:

Syllabus Version 1
- Published: 2026-07-01

Syllabus Version 2
- Published: 2026-08-15
- Changed Unit 4

The admin should be able to compare versions.

A version record should contain:

- Version number
- Snapshot or structured change set
- Author
- Timestamp
- Change summary
- Publication state

The UI should show:

**Version 3 — Current**

and older versions beneath it.

---

# 12. CHANGE SUMMARY

When publishing an update, administrators should provide a short change summary.

Example:

> Updated Unit 3 topics according to the latest university syllabus notification.

This summary is useful for:

- Audit history
- Internal review
- Future maintenance
- Student update notifications

Do not require lengthy explanations for trivial changes.

---

# 13. SYLLABUS MANAGEMENT

The syllabus module must be fully database-driven.

Hierarchy:

University/Board  
→ Course  
→ Branch  
→ Semester  
→ Subject  
→ Unit  
→ Topic

The interface should allow administrators to create and reorder units.

Each unit can contain:

- Unit number
- Unit title
- Description
- Topics
- Estimated importance
- Optional reference material
- External links
- Status

Subjects should have:

- Subject code
- Subject name
- Semester
- Course
- Branch
- Credits where applicable
- Type
- Active/inactive state

The student app should automatically reflect published changes.

The developer should not need to modify frontend code when an administrator changes:

- Unit title
- Topic
- Subject
- Semester
- Academic year

---

# 14. SYLLABUS CHANGE SAFETY

Never overwrite a published syllabus silently.

When changing a published syllabus:

1. Load current version.
2. Create edit version.
3. Show differences.
4. Save draft.
5. Review.
6. Publish new version.
7. Record change summary.
8. Optionally notify students.

This prevents accidental academic misinformation.

---

# 15. ACADEMIC CALENDAR MANAGEMENT

The yearly academic calendar should also be database-driven.

Calendar fields:

- Event title
- Event type
- Date
- Start date
- End date
- Description
- Course
- Semester
- Branch
- Academic year
- Priority
- Visibility
- Attachment/reference
- Status

Event types may include:

- Semester start
- Semester end
- Examination
- Result
- Holiday
- Registration
- Form submission
- Practical exam
- Internal assessment
- Admission
- Other

Administrators must be able to change dates without application redeployment.

---

# 16. CALENDAR CONFLICT DETECTION

The admin interface should warn about suspicious overlaps.

Example:

- Examination and holiday on same date
- Duplicate event
- Semester end before semester start
- Start date after end date
- Two events with same title/date

These warnings should not always block saving because some overlaps are legitimate.

Use:

- Error = cannot save
- Warning = can save with confirmation
- Information = advisory

---

# 17. PYQ MANAGEMENT

PYQ records should contain:

- Year
- Course
- Branch
- Semester
- Subject
- Subject code
- Exam type
- Title
- File
- Page count if known
- Tags
- Description
- Status
- Upload source
- Created by
- Verification status

Exam type examples:

- End Semester
- Mid Semester
- Internal
- Practical
- Supplementary
- Entrance
- Other

The admin should be able to filter PYQs by multiple fields simultaneously.

---

# 18. PYQ DUPLICATE DETECTION

The system should detect likely duplicates using:

- File checksum
- Title similarity
- Course
- Subject
- Year
- Semester

A duplicate warning might say:

> A similar PYQ already exists for Data Structures, Semester 4, 2025.

The administrator may still choose to continue if the files are legitimately different.

---

# 19. NOTES AND STUDY MATERIAL

Notes should be treated as structured resources rather than random uploads.

Fields:

- Title
- Subject
- Unit
- Course
- Branch
- Semester
- Academic year
- Type
- Description
- File
- Thumbnail
- Tags
- Author/source
- Verification status
- Publication status

Types:

- Notes
- Handwritten notes
- Formula sheet
- Revision sheet
- Important questions
- Lab material
- Practical file
- Reference PDF
- Other

---

# 20. FILE MANAGEMENT

The CMS must not store large files directly inside database rows.

The database should store metadata and a secure storage reference.

File metadata:

- File ID
- Storage path
- Original name
- MIME type
- Size
- Checksum
- Uploaded by
- Upload time
- Verification status
- Associated entity
- Visibility
- Version

The actual file should be stored in a suitable object storage system.

The application should generate secure access URLs according to authorization rules.

---

# 21. MEDIA LIBRARY

A centralized media library should allow administrators to view:

- PDFs
- Images
- Thumbnails
- Documents
- Other supported assets

Filters:

- File type
- Size
- Upload date
- Uploaded by
- Used/unused
- Verification state

The system should show whether an asset is currently referenced by published content.

Do not allow deleting an actively referenced asset without a clear warning.

---

# 22. SAFE DELETE MODEL

Avoid immediate permanent deletion.

Use:

**Archive / Soft Delete**

first.

A deleted content item should normally move to:

`archived`

or

`deleted`

state.

The admin can restore it if permitted.

Permanent deletion should require:

- High privilege
- Confirmation
- Explicit record identification
- Audit log

For important academic records, permanent deletion should ideally be disabled from the normal UI.

---

# 23. USER RESOURCE SUBMISSION SYSTEM

Students can upload resources.

The flow:

Student selects:
- Resource category
- Subject
- Semester
- Title
- Description
- File

Student submits.

System creates:

`pending_review`

record.

The resource must not immediately appear publicly.

Moderator/Admin sees:

**Pending Resources: 14**

Opening a submission shows:

- Student name
- Student ID
- Course
- Branch
- Submitted date
- Resource details
- File preview/download
- Duplicate warning
- Previous submission history where permitted

Actions:

- Approve
- Reject
- Request correction
- Mark duplicate
- Hide
- Escalate

---

# 24. RESOURCE MODERATION

Approval should require checking:

1. Is the file readable?
2. Is the subject correct?
3. Is the semester correct?
4. Is the content relevant?
5. Is it a duplicate?
6. Does it appear unsafe?
7. Does it contain inappropriate material?
8. Is the title accurate?
9. Is metadata complete?
10. Are there obvious copyright concerns?

The moderator must not need to manually inspect every byte of a normal PDF, but the system should provide sufficient preview and metadata.

---

# 25. RESOURCE REJECTION

A rejection must include a reason.

Recommended predefined reasons:

- Wrong subject
- Wrong semester
- Duplicate
- Poor quality
- Incomplete
- Irrelevant
- Unsafe file
- Copyright concern
- Inappropriate content
- Other

Allow an optional explanation.

The student should receive a notification explaining that their resource was not approved.

Do not expose internal moderation notes if they contain sensitive administrative information.

---

# 26. QUIZ CMS

The quiz system should support:

- Quiz title
- Description
- Course
- Branch
- Semester
- Subject
- Topic
- Difficulty
- Time limit
- Question count
- Passing score
- Attempts
- Randomization
- Negative marking
- Explanation
- Correct answer
- Publication status

Question types:

- Single choice
- Multiple choice
- True/False
- Fill-in-the-blank where appropriate

Avoid introducing unnecessary complex question types until the core system is stable.

---

# 27. QUESTION BANK

The admin should not have to create every quiz from scratch.

Create a reusable question bank.

Each question can have:

- Question text
- Options
- Correct answer
- Explanation
- Subject
- Topic
- Difficulty
- Tags
- Source
- Created by
- Verification status

Then a quiz can select questions from the bank.

This allows:

**Question Bank → Quiz Builder → Published Quiz**

---

# 28. QUIZ BUILDER

Quiz builder workflow:

1. Create quiz metadata.
2. Select question source.
3. Add questions.
4. Reorder questions.
5. Configure scoring.
6. Configure time limit.
7. Preview.
8. Validate.
9. Save draft.
10. Publish.

Validation should detect:

- No questions
- Missing correct answer
- Duplicate questions
- Empty options
- More than one correct answer for single-choice questions
- Invalid negative marking
- Invalid time limit

---

# 29. QUIZ PREVIEW

Before publishing, admins must be able to preview exactly what students will see.

Preview should include:

- Question display
- Option layout
- Timer behavior
- Navigation
- Score behavior
- Result screen
- Explanation

The preview should be read-only.

---

# 30. QUIZ RESULT DATA

The admin should see aggregate statistics without exposing unnecessary personal information.

Metrics:

- Attempts
- Unique students
- Average score
- Median score
- Highest score
- Lowest score
- Pass percentage
- Average completion time
- Question-level correctness

Question analysis:

Question 1:
- Correct: 78%
- Incorrect: 22%

This helps identify bad questions.

---

# 31. NOTICES CMS

Notices should support:

- Title
- Short summary
- Full content
- Publish date
- Expiry date
- Priority
- Target audience
- Attachment
- External link
- Status

Priority levels:

- Normal
- Important
- Urgent

The student application should visually distinguish urgent notices without making everything look urgent.

---

# 32. NOTICE SCHEDULING

An admin should be able to schedule publication.

Example:

Create notice today.

Schedule:
**September 10, 2026 at 09:00**

Before that time:

- Admin can see it.
- Students cannot.

At the scheduled time:

- Backend publishes it.
- Relevant notifications can be generated if configured.

Scheduled jobs must be server-controlled.

Do not rely only on a user's browser being open.

---

# 33. NOTIFICATION MANAGEMENT

Notifications should be separate from notices.

A notice is content.

A notification is a delivery event.

A notification can reference content.

Examples:

- New PYQ added
- New syllabus update
- New quiz
- Resource approved
- Resource rejected
- Developer replied
- Important academic notice

Notification records should include:

- Recipient
- Type
- Title
- Message
- Reference
- Read state
- Created time
- Delivery status

---

# 34. TARGETED NOTIFICATIONS

Admins should be able to target notifications by:

- All students
- Course
- Branch
- Semester
- Subject interest where available
- Specific student
- Selected students

Before sending a large notification, show estimated audience.

Example:

> This notification will reach approximately 1,842 students.

For high-volume notifications, require confirmation.

---

# 35. DEVELOPER MESSAGE SYSTEM

The application should provide a simple direct communication channel from student to developer/admin.

This is not a public chat room.

Each student gets a private support conversation.

Only:

- That student
- Authorized support/admin users

can access the conversation.

The admin interface should show:

- Unread messages
- Student
- Last message
- Time
- Status

Statuses:

- Open
- Waiting for admin
- Waiting for student
- Resolved

---

# 36. SUPPORT MESSAGE SECURITY

A support admin should only see information necessary to respond.

Do not display unnecessary sensitive profile fields.

Messages should be audited.

Admin replies should store:

- Admin ID
- Timestamp
- Message
- Conversation ID

Students should never see internal admin notes.

---

# 37. ADMIN MESSAGE COMPOSER

The message composer should support:

- Plain text
- Basic formatting if needed
- Optional attachment
- Send
- Draft

Avoid excessive formatting.

This is a support system, not a social network.

---

# 38. USER MANAGEMENT

Student management must provide searchable records.

Columns:

- Student name
- Email
- Course
- Branch
- Semester
- Contact number where permitted
- Registration date
- Last active time
- Account status

Possible statuses:

- Active
- Suspended
- Deactivated
- Pending verification

Do not expose passwords.

Passwords must never be displayed to admins.

---

# 39. STUDENT PROFILE ADMIN VIEW

Admin profile view may contain:

- Name
- Email
- Contact
- Course
- Branch
- Semester
- Profile image
- Character/avatar
- Registration date
- Account status
- Submission history
- Quiz summary
- Support conversations
- Notification history where appropriate

Sensitive fields must be permission-restricted.

---

# 40. PROFILE IMAGE AND AVATAR MANAGEMENT

During signup, the student may upload a profile image.

The system may also assign a generated character/avatar according to the application's rules.

Admin can see the selected avatar.

The system should not allow an admin to casually replace a user's personal image without an authorized reason.

Profile images should have:

- File type validation
- File size limits
- Image dimension validation
- Malware/security checks where available
- Safe storage
- Access control

---

# 41. COURSE MANAGEMENT

Courses should be database entities.

Fields:

- Course name
- Short name
- Code
- Description
- Duration
- Active state
- Display order

Branches can belong to courses.

Example:

Course:
B.Tech

Branches:
- CSE
- ECE
- EE
- ME
- CE

The system should avoid hard-coding branch lists into multiple frontend files.

---

# 42. SUBJECT MANAGEMENT

Subjects belong to academic structures.

A subject record should connect:

- Course
- Branch
- Semester
- Subject code
- Subject title
- Credits
- Type
- Active state

Subject mappings must support cases where the same subject exists across multiple branches.

Do not create accidental duplicates merely because the subject appears in two branches.

---

# 43. BULK IMPORT

The admin panel should support bulk import for suitable entities.

Supported formats:

- CSV
- JSON
- Spreadsheet-derived data

Potential import targets:

- Subjects
- Syllabus topics
- PYQ metadata
- Calendar events
- Quiz questions

Do not import directly into published state.

Workflow:

Upload → Parse → Validate → Preview → Import as Draft → Review → Publish

---

# 44. IMPORT VALIDATION

The import system should detect:

- Missing required columns
- Invalid dates
- Unknown course
- Unknown branch
- Unknown semester
- Duplicate IDs
- Duplicate titles
- Invalid status
- Malformed URLs

The preview should show:

**Valid rows: 184**

**Warnings: 7**

**Errors: 3**

The administrator must be able to download an error report.

---

# 45. BULK OPERATIONS

Admin tables should support bulk actions.

Examples:

- Archive selected
- Submit selected for review
- Publish selected where authorized
- Assign category
- Change semester
- Export metadata
- Mark verified

Bulk publish must be treated carefully.

Before executing:

> You are about to publish 37 resources.

Require confirmation.

---

# 46. FILTERING

Every large admin table needs powerful filtering.

Filters should be combinable.

Example:

Course = B.Tech  
Branch = CSE  
Semester = 4  
Subject = DBMS  
Year = 2025

The interface should display active filter chips.

Users should be able to:

- Remove individual filters
- Clear all
- Save filters if useful

---

# 47. SORTING

Tables should support sorting by:

- Created date
- Updated date
- Published date
- Title
- Status
- Year
- Popularity where applicable

Sorting must be server-side for large datasets.

Do not load thousands of rows into the browser merely to sort them.

---

# 48. PAGINATION

Use server-side pagination.

The admin can select:

- 25
- 50
- 100
- 250

rows where reasonable.

Show:

> Showing 1–50 of 1,842

Do not fetch all records unnecessarily.

---

# 49. CONTENT DETAIL PAGE

A content detail page should use a consistent layout.

Header:

- Title
- Status
- Content type
- Last updated
- Actions

Main area:

- Content details
- Preview
- Metadata

Side panel:

- Publishing status
- Created by
- Updated by
- Version
- Audit summary

Bottom:

- Change history
- Related records

---

# 50. EDIT FORM DESIGN

Forms should be divided into logical sections.

Example:

## Basic Information

Title  
Description  
Category

## Academic Mapping

Course  
Branch  
Semester  
Subject  
Year

## Resource

File  
External URL  
Thumbnail

## Publishing

Status  
Visibility  
Schedule

## Advanced

Tags  
Internal notes  
Version information

Avoid a single enormous unstructured form.

---

# 51. FORM VALIDATION

Validation should happen:

- On input where helpful
- On blur for field-level errors
- On submit
- On backend

Examples:

Title cannot be empty.

Date must be valid.

End date cannot precede start date.

A PDF field must contain a valid PDF reference.

A single-choice question must have exactly one correct answer.

Frontend validation improves UX.

Backend validation provides actual security and correctness.

---

# 52. AUTOSAVE

Long forms should optionally autosave drafts.

Autosave must not publish.

Display:

> Saved 8 seconds ago

If offline or network failure occurs:

> Changes not synced

The system should avoid creating hundreds of unnecessary versions from every keystroke.

Autosave should update a draft record rather than create a permanent version for each keystroke.

---

# 53. UNSAVED CHANGES

If an admin attempts to leave a modified form:

> You have unsaved changes. Leave without saving?

Buttons:

- Stay
- Save Draft
- Leave

Do not lose content silently.

---

# 54. FILE UPLOAD UX

The file uploader should show:

- Drag/drop area
- Select file
- Upload progress
- File name
- Size
- Validation state
- Preview where supported
- Remove button

After upload:

**Verified upload**

or

**Processing**

or

**Upload failed**

The user should never be left wondering whether a file uploaded.

---

# 55. FILE UPLOAD RESTRICTIONS

Define maximum sizes by category.

Example policy:

- Profile image: small
- Thumbnail: small
- PDF: moderate
- Admin document: configurable
- Large media: separate storage policy

Allowed MIME types should be allowlisted.

Do not trust only the filename extension.

The backend should inspect the actual content where practical.

---

# 56. STORAGE CLEANUP

The media library should identify orphaned files.

An orphaned file is stored but no longer referenced by any active record.

The admin may review orphaned files before cleanup.

Never automatically delete a file merely because it is not currently referenced unless a deliberate retention policy exists.

---

# 57. AUDIT LOGGING

Every sensitive admin operation should generate an audit entry.

Examples:

- Admin login
- Failed admin login
- Content created
- Content updated
- Content published
- Content unpublished
- Content archived
- Resource approved
- Resource rejected
- Student suspended
- Notification sent
- Settings changed
- Admin role changed

Audit fields:

- Event ID
- Actor
- Action
- Entity type
- Entity ID
- Timestamp
- IP information where appropriate
- Request metadata where appropriate
- Before/after summary where safe

Never store secrets in logs.

---

# 58. AUDIT LOG UI

Audit logs should be searchable.

Filters:

- Admin
- Action
- Entity
- Date range
- Severity

Example:

> 2026-09-01 10:24 — Content Admin — Published PYQ #839

Clicking an event should show contextual details.

---

# 59. ADMIN SETTINGS

Settings should be separated into categories:

## General
- App name
- Logo
- Support information

## Academic
- Current academic year
- Current semester
- Default settings

## Notifications
- Notification defaults
- Templates

## Storage
- Upload limits
- Allowed types

## Security
- Session policy
- Admin access controls

## Appearance
- Admin logo
- Branding

## Developer
- Developer name
- Portfolio links
- Social links

Sensitive credentials must never be editable through a normal text field.

Secrets belong in secure environment/secret management systems.

---

# 60. DEVELOPER INFORMATION

The BEU BABA application can contain a Developer section.

It should be database/configuration-driven so links can be updated without changing frontend source code.

Configured links can include:

- Instagram
- Telegram
- Portfolio
- Other official contact links

The admin panel should allow authorized administrators to update these values.

URL validation should prevent malformed links.

If a social link changes, the student application should reflect the updated value after cache refresh.

---

# 61. CONTACT DEVELOPER FLOW

The student should have a simple:

**Contact Developer**

interface.

Categories:

- Bug Report
- Course Update
- Syllabus Update
- PYQ Issue
- Resource Issue
- Feature Request
- Account Issue
- Other

This makes support messages easier to route.

The submitted conversation should automatically contain the selected category.

---

# 62. BUG REPORTING

For bug reports, the system may collect:

- App version
- Browser/device type
- Operating system
- Current page
- Optional screenshot
- User description

Only collect what is useful.

Do not collect unnecessary personal data.

Admin sees:

> Bug Report  
> Android / Chrome  
> App version 1.4.0  
> Page: Quiz

This dramatically reduces support friction.

---

# 63. CONTENT REPORTING

Students should be able to report problematic content.

Reasons:

- Wrong information
- Broken file
- Wrong subject
- Wrong year
- Duplicate
- Inappropriate
- Other

Reports enter moderation.

The content itself should not automatically disappear after one report.

Use thresholds and moderator decisions.

---

# 64. MODERATION QUEUE

The moderation queue should prioritize:

1. Safety-related reports
2. Incorrect academic information
3. Broken resources
4. Duplicate reports
5. General suggestions

Each queue item should show:

- Type
- Severity
- Age
- Related content
- Reporter
- Status

Status:

- New
- In Review
- Action Required
- Resolved
- Dismissed

---

# 65. ADMIN NOTIFICATION CENTER

Administrators need their own notifications.

Examples:

- 12 new resource submissions
- Student reported broken PYQ
- Quiz has unusually high failure rate
- Scheduled notice published
- Support message waiting
- Import completed with warnings

Notifications should be actionable.

Clicking a notification should open the relevant record.

---

# 66. ERROR HANDLING

Admin interfaces must use meaningful errors.

Bad:

> Something went wrong.

Better:

> The resource could not be published because the subject is missing.

For server errors:

> We could not complete this action. Your draft has been preserved. Please retry.

Never discard form data because an API request failed.

---

# 67. NETWORK FAILURE

If the network disappears:

- Preserve local form state where appropriate.
- Show offline state.
- Do not claim the save succeeded.
- Retry safely where possible.
- Avoid duplicate submissions.

For publish actions, never blindly retry an operation that could create duplicate records.

Use idempotency where appropriate.

---

# 68. LOADING STATES

Every data-heavy interface needs clear loading states.

Use:

- Skeleton rows
- Skeleton cards
- Inline spinners for small actions
- Progress indicators for uploads

Do not freeze the entire dashboard while one table loads.

---

# 69. EMPTY STATES

Every module should have an intentional empty state.

Example:

**No pending resources**

> New student submissions will appear here for review.

Provide an appropriate action if relevant.

Do not show a blank white screen.

---

# 70. CONFIRMATION DIALOGS

Confirmation should be proportional to risk.

Low-risk:

> Save draft?

High-risk:

> Archive this published syllabus?

Critical:

> Permanently delete this storage object?

For critical actions, require explicit confirmation.

Where practical, require typing a short confirmation phrase.

---

# 71. PUBLISHING CONFIRMATION

Before publishing academic content, show a summary:

**Ready to publish**

Title  
Course  
Branch  
Semester  
Subject  
Academic year  
Attachment  
Visibility

Then:

> This content will become visible to eligible students.

Buttons:

- Cancel
- Publish

This is one of the most important safeguards in the entire CMS.

---

# 72. SCHEDULED CONTENT

Scheduled content should have a clear countdown/state.

Example:

**Scheduled**

Publish:
September 12, 2026 — 09:00

Actions:

- Edit
- Reschedule
- Cancel schedule
- Preview

The backend must handle the actual publication.

---

# 73. CONTENT EXPIRY

Some notices should expire.

Expired content:

- Remains in database
- Is hidden from normal student feeds
- Remains accessible to admins
- Can be restored if needed

Expiry should not mean deletion.

---

# 74. HOME PAGE CONTENT MANAGEMENT

If the BEU BABA home page contains dynamic sections, the admin should be able to control them.

Possible sections:

- Featured course
- Latest PYQs
- New notes
- Trending quiz
- Important notice
- Featured resource
- Academic update

The admin should not need to manually edit frontend code.

However, avoid allowing administrators to arbitrarily redesign the whole application from the CMS. Use controlled content slots.

---

# 75. FEATURED CONTENT

A record can be marked:

`featured = true`

but the system should enforce limits.

Example:

Maximum 5 featured items in a section.

If the administrator attempts to add a sixth:

> This section already contains 5 featured items. Remove one or change its priority.

---

# 76. DISPLAY ORDER

For ordered lists, use explicit ordering.

Example:

`display_order = 1, 2, 3...`

Drag-and-drop can make reordering easier.

After reordering, save the new order through a backend endpoint.

Do not rely on array order in frontend memory.

---

# 77. CONTENT TAGGING

Tags should support discovery.

Examples:

- Important
- Exam
- Revision
- Beginner
- Advanced
- Formula
- Practical
- Previous Year

Tags should be normalized where practical.

Avoid creating hundreds of near-duplicate tags such as:

`exam`, `Exam`, `EXAM`, `exams-important`.

---

# 78. SEARCH INDEXING

When content becomes published:

- Update searchable fields.
- Refresh search index/cache if used.
- Make content discoverable according to permissions.

When content is unpublished:

- Remove or deactivate its public search index entry.

Search results must never expose drafts.

---

# 79. CACHE INVALIDATION

If BEU BABA caches academic content, publishing a change must invalidate the appropriate cache.

Example:

Admin changes syllabus.

The system should ensure students do not continue receiving the old syllabus indefinitely.

Cache strategy should be predictable.

Avoid overly aggressive global cache clearing.

Invalidate only affected entities where possible.

---

# 80. API BOUNDARY

The frontend should communicate with a well-defined backend API.

Example conceptual endpoints:

`GET /api/admin/content`

`POST /api/admin/content`

`PATCH /api/admin/content/:id`

`POST /api/admin/content/:id/submit-review`

`POST /api/admin/content/:id/approve`

`POST /api/admin/content/:id/publish`

`POST /api/admin/content/:id/archive`

`GET /api/admin/audit-logs`

`GET /api/admin/resources/pending`

The exact endpoint naming can vary, but responsibilities must remain separated.

---

# 81. DATABASE TRANSACTION REQUIREMENTS

Publishing operations may involve multiple changes.

Example:

Publishing a notice may require:

1. Change status.
2. Set published timestamp.
3. Create version record.
4. Create audit log.
5. Queue notification.
6. Update search indexing state.

These operations should be designed so that partial success does not leave the system inconsistent.

Use database transactions for database-side operations.

External services should use reliable queues or retry mechanisms where necessary.

---

# 82. CONCURRENCY CONTROL

Two admins may edit the same record.

The system should detect this.

Example:

Admin A opens syllabus version.

Admin B edits and publishes.

Admin A later attempts to save old data.

The system should warn:

> This record was updated by another administrator. Review the latest version before saving.

Avoid silent overwrites.

Use updated timestamps or version numbers.

---

# 83. OPTIMISTIC UI RULES

Optimistic UI is acceptable for low-risk actions such as:

- Mark notification read
- Toggle a local preference
- Reorder draft items

For critical actions such as:

- Publish
- Archive
- Delete
- Suspend user

wait for server confirmation before displaying final success.

---

# 84. DATA EXPORT

Authorized admins may export permitted data.

Exports can include:

- Student metadata
- Content metadata
- Quiz statistics
- Resource submissions
- Audit logs

Exports must respect role permissions.

Do not provide unrestricted database dumps through the admin UI.

---

# 85. PRIVACY IN ADMIN TABLES

Not every administrator needs every field.

Example:

A Moderator may need:

- Student name
- Student ID
- Course
- Branch

but may not need:

- Full contact number
- Private account metadata

Use field-level minimization.

---

# 86. RATE LIMITING

Admin endpoints must have rate limits.

Especially:

- Login
- Search
- Bulk operations
- Notification sending
- File uploads
- Export generation

Rate limiting protects against accidental loops and malicious requests.

---

# 87. ADMIN SESSION SECURITY

Admin sessions should be stricter than student sessions.

Recommended:

- Shorter inactivity timeout
- Secure cookies
- Refresh-token rotation as appropriate
- Reauthentication for sensitive operations
- Logout from all devices option

High-risk operations can require recent authentication.

---

# 88. TWO-STEP VERIFICATION

For high-privilege administrator accounts, support an additional authentication factor if available in the chosen authentication stack.

The exact mechanism can be:

- Authenticator app
- Passkey
- Security key
- Provider-supported MFA

Do not implement homemade password-plus-code systems unnecessarily.

---

# 89. ADMIN PASSWORD POLICY

If passwords are handled by an authentication provider:

- Do not store passwords in the BEU BABA database.
- Do not display them.
- Do not log them.
- Do not email passwords.

Password reset should use the authentication provider's secure process.

---

# 90. SECURITY OF ADMIN FILE PREVIEWS

PDF/document previews can become a security boundary.

Files must be accessed using authorized URLs.

Do not expose unrestricted permanent storage URLs for private admin files.

If a file is public academic content, its public access policy can be separate.

---

# 91. CONTENT ACCESS VISIBILITY

Every content record should distinguish:

- Draft/private
- Admin-only
- Authenticated students
- Targeted students
- Public

The student app should only query content the current user is authorized to see.

Do not download all content and filter it in JavaScript.

Authorization belongs at the backend/database level.

---

# 92. STUDENT-SPECIFIC CONTENT

Some content may target specific cohorts.

Example:

Course = B.Tech  
Branch = CSE  
Semester = 5

Only matching students should see it if the content is cohort-restricted.

The authorization rule must be server-side.

---

# 93. ADMIN CONTENT PREVIEW AS STUDENT

A powerful feature is:

**Preview as student**

The admin can choose:

Course  
Branch  
Semester

and see how eligible content appears.

This helps identify:

- Incorrect visibility
- Wrong academic mapping
- Missing content
- Broken links

The preview must remain a preview and must not bypass actual permissions.

---

# 94. CONTENT HEALTH CHECK

Create an administrative health report.

Check for:

- Published content without file
- Broken external links where checkable
- Missing subject
- Invalid academic mapping
- Empty descriptions where required
- Duplicate records
- Missing thumbnails
- Orphaned storage references
- Expired featured items
- Unpublished scheduled records

Display:

**Content Health: 97.8%**

with actionable issues.

---

# 95. BROKEN LINK CHECKER

External links may stop working.

The admin system can periodically check eligible URLs.

Status:

- Working
- Redirected
- Failed
- Timeout
- Not checked

Do not aggressively crawl third-party sites.

Respect reasonable rate limits.

---

# 96. CONTENT QUALITY SCORE

A non-blocking quality score can help administrators.

Example:

100 points:

- Required metadata: 30
- File validity: 20
- Academic mapping: 20
- Description quality: 10
- Thumbnail: 10
- Tags: 10

Show:

**Quality: 92/100**

This should guide admins, not replace human review.

---

# 97. DUPLICATE CONTENT DETECTION

Potential duplicate matching can use:

- File checksum
- Exact title
- Normalized title
- Subject/year/semester combination
- Similarity algorithm where available

Never automatically delete duplicates.

Flag them for review.

---

# 98. ADMIN ACTIVITY FEED

Dashboard should contain a compact recent activity feed.

Examples:

- Syllabus updated
- PYQ published
- Resource approved
- Quiz created
- Student message received

Each event should link to the relevant record if permitted.

---

# 99. ANALYTICS MODULE

Admin analytics should answer operational questions.

Examples:

- Which resources are most viewed?
- Which PYQs are downloaded most?
- Which quizzes have highest participation?
- Which subjects have low content coverage?
- Which resources are frequently reported?
- How many students are active?

Avoid vanity metrics that cannot influence decisions.

---

# 100. CONTENT COVERAGE ANALYTICS

One especially useful metric:

**Academic Coverage**

For each course/branch/semester:

Subjects:
- Total
- With syllabus
- With notes
- With PYQs
- With quizzes

Example:

CSE — Semester 4

Subjects: 6  
Syllabus: 6/6  
Notes: 5/6  
PYQs: 4/6  
Quiz: 3/6

This immediately shows administrators what needs attention.

---

# 101. RESOURCE PERFORMANCE

Track:

- Views
- Downloads
- Saves/bookmarks if implemented
- Reports
- Quiz references if applicable

Use aggregated analytics.

Do not expose unnecessary individual behavioral data.

---

# 102. QUIZ PERFORMANCE ANALYTICS

Admin can identify:

- Difficult topics
- Weak questions
- High-abandonment quizzes
- Average completion time
- Question error rates

If one question has only 5% correct responses, review whether:

- The question is too difficult
- The answer is wrong
- Options are ambiguous
- Topic is inadequately taught

---

# 103. NOTIFICATION ANALYTICS

Where technically supported, show:

- Sent
- Delivered
- Opened
- Failed

Avoid claiming delivery when the underlying provider does not confirm it.

---

# 104. CONTENT RETENTION

Academic content may have long-term value.

Do not automatically purge old PYQs simply because they are old.

Instead:

- Archive
- Mark historical
- Filter by academic year

Historical records are often valuable to students.

---

# 105. ARCHIVE INTERFACE

The archive should have:

- Search
- Filters
- Restore
- Permanent deletion where allowed

Archived content must not accidentally appear in student lists.

---

# 106. RESTORE WORKFLOW

Restoring a record should revalidate it.

Do not assume that an old record is still valid.

For example, a 2024 syllabus may no longer be the current syllabus.

Restoration may mean:

- Restore as archived historical content
- Restore as draft for review

Prefer the second option for academic content.

---

# 107. ADMIN HELP SYSTEM

Each complex module should include a small help area.

Example:

**What does “Publish” do?**

> Publishing makes this content available to eligible students according to its visibility rules.

Avoid giant instruction manuals inside every screen.

A centralized admin documentation area can contain full explanations.

---

# 108. KEYBOARD PRODUCTIVITY

Admin users perform repetitive tasks.

Support:

- `/` or configured shortcut for search
- Escape to close modal
- Enter to submit appropriate forms
- Arrow navigation where useful
- Tab order
- Bulk selection shortcuts where safe

Do not create shortcuts that can accidentally publish/delete data without confirmation.

---

# 109. ACCESSIBILITY

Admin interface must support:

- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Proper form labels
- Adequate contrast
- Error announcements
- Accessible dialogs
- Reduced motion preference

Glassmorphism must not reduce readability.

---

# 110. RESPONSIVE ADMIN PANEL

Primary target:

Desktop/laptop.

But it should remain usable on tablets and smaller screens.

On mobile:

- Sidebar becomes drawer
- Tables become cards or horizontally scrollable containers
- Large forms become stacked sections
- Critical actions remain reachable

Do not attempt to compress a 12-column data table into unreadable tiny text.

---

# 111. ADMIN ANIMATION SYSTEM

Animation must communicate state.

Use:

- 150–250ms micro-interactions
- Smooth drawer transitions
- Modal scale/fade
- Skeleton shimmer
- Row hover
- Toast slide
- Status transition

Avoid:

- Constant floating elements
- RGB lighting
- Excessive parallax
- Large background 3D objects
- AI-looking glowing blobs
- Excessive particle systems

The admin interface should feel premium because of precision, not spectacle.

---

# 112. GLASSMORPHISM RULES

Use:

- translucent white surfaces
- subtle blur
- thin borders
- soft shadows
- gentle depth

Do not use:

- black glass
- neon borders
- rainbow gradients
- glowing text
- excessive transparency that hurts readability

A good glass panel should still look excellent if the blur effect is temporarily disabled.

---

# 113. ADMIN TABLE DESIGN

Table rows should be compact but breathable.

Columns should have consistent alignment.

Use:

- Checkbox
- Primary title
- Secondary metadata
- Status badge
- Updated date
- Owner
- Actions

Do not place ten icons into every row.

Use a contextual menu for secondary actions.

---

# 114. STATUS BADGES

Status colors must not be the only indicator.

Example:

`● Published`

`● Draft`

`● Pending Review`

`● Rejected`

Include text.

This improves accessibility and reduces ambiguity.

---

# 115. TOAST SYSTEM

Success:

> Syllabus draft saved.

Warning:

> 2 records were skipped because required fields were missing.

Error:

> Publication failed. No student-facing changes were made.

Toasts should disappear automatically for normal informational messages.

Critical errors should remain visible until understood.

---

# 116. ADMIN HOME QUICK ACTIONS

Provide shortcuts:

- Add PYQ
- Add Note
- Add Syllabus
- Add Calendar Event
- Create Quiz
- Review Submissions
- Send Notice
- Open Messages

These should open directly into the relevant workflow.

---

# 117. RECENT WORK

A useful feature:

**Continue where you left off**

Show recently edited drafts.

Example:

- DBMS Notes — Draft
- 2026 Calendar — Draft
- Quiz: Data Structures — Draft

This reduces navigation time.

---

# 118. DRAFT OWNERSHIP

Drafts can have:

- Creator
- Assigned reviewer
- Last editor

A reviewer can claim an item where appropriate.

Example:

**Assigned to Rahul**

This prevents multiple admins unknowingly reviewing the same submission.

---

# 119. REVIEW COMMENTS

For complex workflows, reviewers should be able to leave internal comments.

Comments should be separate from student-visible rejection messages.

Example internal:

> Verify whether Unit 5 wording matches the official notification.

Student-visible:

> Please upload a clearer version of the document.

---

# 120. APPROVAL CHECKLISTS

For important content, create checklists.

Example syllabus checklist:

- Correct course
- Correct branch
- Correct semester
- Correct academic year
- Subject codes checked
- Units checked
- Publication visibility checked

Reviewer can mark each item.

This reduces human error.

---

# 121. PUBLISH BLOCKERS

The CMS should block publication when critical fields are missing.

Examples:

- Missing title
- Missing academic mapping
- Missing required file
- Invalid status
- Missing correct answer

Warnings may be overridden where appropriate.

Errors may not.

---

# 122. ADMIN CONTENT PREVIEW

Every content type should have preview.

For PDFs:

- Embedded preview where supported
- Metadata

For notices:

- Student card preview
- Full notice preview

For quizzes:

- Full quiz simulation

For syllabus:

- Student syllabus layout

This ensures administrators see the result before publication.

---

# 123. STUDENT EXPERIENCE INTEGRATION

The CMS must be designed around how the student app consumes data.

Student screens may include:

- Home
- Courses
- Syllabus
- PYQs
- Notes
- Resources
- Quiz
- Calendar
- Notices
- Profile
- Developer support

Each screen should consume published backend records.

The admin should not need to understand frontend implementation details.

---

# 124. API RESPONSE DESIGN

API responses should be predictable.

For lists:

- Data
- Pagination
- Total
- Filters if useful

For errors:

- Stable error code
- Human-readable message
- Field errors where applicable

Example conceptual response:

`CONTENT_VALIDATION_FAILED`

with field-level errors.

Frontend should not have to parse arbitrary error strings to understand what happened.

---

# 125. CONTENT SLUGS

Human-readable slugs can improve URLs.

Example:

`/pyq/data-structures-2025`

Slugs should be unique.

If a title changes, decide whether the slug changes.

For stable links, retain old slug mappings where practical.

---

# 126. SEO AND PUBLIC CONTENT

If portions of BEU BABA are publicly accessible, public content can be indexed.

Private student content should not be exposed.

Admin panel itself should never be publicly indexable.

Use authentication and appropriate HTTP/security policies.

---

# 127. IMPORTING EXISTING DATA

When migrating extracted app data into BEU BABA:

1. Preserve source information.
2. Normalize fields.
3. Remove duplicates.
4. Validate academic mappings.
5. Import as draft.
6. Review.
7. Publish.

Never dump raw extracted data directly into production tables and immediately display it.

---

# 128. SOURCE ATTRIBUTION

Imported academic records should optionally store:

- Source name
- Source URL
- Original filename
- Import batch ID
- Imported by
- Imported timestamp

This helps administrators trace where information originated.

---

# 129. IMPORT BATCH MANAGEMENT

Every bulk import should create an import batch.

Example:

`IMPORT-2026-09-01-001`

The batch should show:

- Number of rows
- Successes
- Warnings
- Errors
- Creator
- Timestamp
- Imported entities

Admins should be able to review a batch later.

---

# 130. ROLLBACK STRATEGY

For bulk imports, provide a controlled rollback option where practical.

Example:

> Roll back 184 records created by import batch IMPORT-2026-09-01-001.

Rollback should not blindly delete records that have since been manually modified.

The system should detect conflicts.

---

# 131. CONTENT OWNERSHIP

Every record should have clear ownership metadata.

This helps answer:

- Who created this?
- Who last changed it?
- Who approved it?
- Who published it?

This is important for a platform that grows beyond one administrator.

---

# 132. ADMIN TEAM SCALABILITY

Even if BEU BABA initially has one administrator, architecture should support multiple admins.

Do not hard-code:

`admin_email = "example@gmail.com"`

Use role/permission records.

Do not use frontend-only email checks.

---

# 133. EMERGENCY UNPUBLISH

Super Admin should have an emergency action:

**Unpublish immediately**

Use for:

- Incorrect academic information
- Malicious resource
- Broken file
- Serious issue

The action should:

1. Remove student visibility
2. Preserve record
3. Log action
4. Record reason

Avoid permanent deletion during emergencies.

---

# 134. EMERGENCY CONTENT BANNER

For severe issues, admin can optionally display an application-level notice.

Example:

> Some academic documents are temporarily unavailable while being verified.

This should be controlled, time-bound, and auditable.

---

# 135. MAINTENANCE MODE

If required, Super Admin can enable maintenance mode.

Options:

- Full maintenance
- Read-only maintenance
- Admin-only maintenance

The student app should show a polished maintenance screen rather than an unexplained error.

---

# 136. FEATURE FLAGS

Feature flags should control major unfinished features.

Examples:

- Quiz enabled
- Resource uploads enabled
- Developer messaging enabled
- Calendar enabled
- New home section enabled

Flags should be stored securely and evaluated server-side for protected functionality.

---

# 137. RELEASE MANAGEMENT

Application version should be visible in admin settings.

Example:

**BEU BABA v1.4.0**

Admin can see:

- Current version
- Build number
- Release date

Do not allow changing the actual software version from a normal content field.

---

# 138. APP UPDATE NOTICE

If the web/PWA application has a new version:

Admin can publish an update notice.

Student experience:

> A new version of BEU BABA is available.

The implementation should use the PWA/service-worker update mechanism appropriately.

Do not force-refresh users repeatedly.

---

# 139. CONTENT VS APPLICATION UPDATES

The CMS must clearly distinguish:

**Content update**
- New PYQ
- Updated syllabus
- New notice

from

**Application update**
- New feature
- Bug fix
- UI change

Content updates should not require redeploying the application.

Application changes require deployment.

This separation is one of the core architectural goals.

---

# 140. ADMIN DOCUMENTATION

The repository should contain administrative documentation covering:

- Environment setup
- Supabase project setup
- Database migrations
- RLS policies
- Storage buckets
- Admin role setup
- Import workflow
- Backup strategy
- Deployment
- Recovery
- Content publishing

This document defines product behavior; implementation-specific secrets must remain outside the repository.

---

# 141. BACKUP AND RECOVERY

Critical data should have a backup strategy.

Back up:

- Database
- Content metadata
- Configuration
- Important storage assets according to provider capabilities

Test restoration.

A backup that has never been restored/tested should not be considered a reliable recovery strategy.

---

# 142. DATA INTEGRITY CHECKS

Periodic jobs can check:

- Broken references
- Missing related subjects
- Invalid course mappings
- Orphaned files
- Invalid status combinations
- Duplicate records

Results should appear in admin health reports.

---

# 143. CRON / SCHEDULED JOBS

Backend scheduled jobs can handle:

- Scheduled publishing
- Notice expiry
- Notification delivery
- Content health checks
- Link checks
- Orphan detection
- Analytics aggregation

Jobs must be idempotent.

Running a job twice should not publish the same notification twice.

---

# 144. IDEMPOTENCY

Critical actions should support safe retry.

For example:

A notification-send request times out.

The frontend retries.

The backend should recognize the same operation identifier and avoid duplicate sends.

This is especially important for:

- Notifications
- Bulk imports
- Publishing
- File processing

---

# 145. ADMIN API LOGGING

API logs should contain useful operational context without exposing secrets.

Log:

- Request route
- Status
- Duration
- Actor ID
- Request ID
- Error category

Never log:

- Passwords
- Authentication tokens
- Private file URLs unnecessarily
- Full private message bodies unless explicitly justified

---

# 146. REQUEST IDs

Each admin operation should have a request/correlation ID where practical.

If something fails:

> Support reference: REQ-8A2F...

This allows debugging without exposing internal technical details to students.

---

# 147. SUPPORT DEBUG INFORMATION

When a student reports a bug, admins can see:

- App version
- Device category
- Browser
- Route
- Error reference

Do not expose full stack traces to students.

---

# 148. ADMIN ERROR REPORTING

Developer-facing logs can contain stack traces in a secure logging system.

The admin UI should show a safe summary.

Example:

> Failed to process file.

Developer log:

`FILE_PROCESSING_ERROR`

with detailed diagnostic context stored securely.

---

# 149. RATE-LIMITED BULK NOTIFICATIONS

If the platform grows, sending thousands of push notifications should not happen in a single browser request.

Use:

Admin creates campaign  
→ Backend creates job  
→ Queue processes recipients  
→ Provider sends notifications  
→ Status is tracked

The UI can show:

**Processing 1,204 / 1,842**

---

# 150. NOTIFICATION TEMPLATES

Create reusable templates:

**New Resource**

> A new resource has been added for {{subject}}.

**Quiz Available**

> A new {{quiz_title}} quiz is available.

**Developer Reply**

> You have received a reply from BEU BABA support.

Templates should be centrally managed.

Variables must be validated.

---

# 151. NOTIFICATION SAFETY

Do not allow arbitrary notification content to inject unsafe HTML or scripts.

Treat text as text.

If rich content is required, use a controlled editor with sanitization.

---

# 152. ADMIN EDITOR SECURITY

Rich-text editors must sanitize output.

Never trust HTML submitted from the admin browser.

Even administrators can accidentally paste malicious markup.

Store safe content.

Render sanitized output.

---

# 153. STUDENT SUBMISSION SECURITY

Student-uploaded files are untrusted.

The system should:

- Validate size
- Validate type
- Store safely
- Avoid executable file types
- Scan where supported
- Keep uploads isolated
- Prevent direct execution
- Apply access policies

Never assume a PDF is safe merely because its extension says `.pdf`.

---

# 154. ADMIN UI SECURITY

Protect against:

- XSS
- CSRF where relevant
- Broken access control
- Insecure direct object references
- Injection
- Unsafe redirects

Every object ID supplied by the client must be authorization-checked.

A user changing:

`/admin/resources/123`

to:

`/admin/resources/124`

must not automatically grant access to resource 124.

---

# 155. RLS ALIGNMENT

The CMS architecture must align with database Row Level Security.

Student:

- Read published eligible content
- Create own submissions
- Read own submissions
- Read own support conversation

Moderator:

- Read pending submissions
- Update moderation status according to permissions

Admin:

- Manage authorized content

Super Admin:

- Full operational permissions according to security policy

RLS should remain active in production.

Do not disable RLS because the admin panel is inconvenient.

---

# 156. SERVICE-ROLE SECURITY

If using a backend service role with elevated privileges:

- Never expose it in frontend JavaScript.
- Never place it in public environment variables.
- Never send it to the browser.
- Use it only in secure server-side functions.

This rule is absolute.

---

# 157. ADMIN ROUTE GUARDS

Frontend routes:

`/admin`

`/admin/students`

`/admin/content`

etc.

Each should verify authenticated admin state.

But frontend route guards are UX, not the security boundary.

The backend must perform the actual authorization.

---

# 158. DEEP LINK SECURITY

Opening an admin link directly must not bypass authentication.

Example:

`/admin/syllabus/123`

If not authorized:

- Redirect to login or access-denied state.

After login, returning to the requested page can improve UX.

---

# 159. ADMIN AUDIT RETENTION

Audit logs should have a retention strategy.

Do not allow ordinary administrators to delete audit records.

If retention cleanup is automated, the policy should be documented and protected.

---

# 160. DATA CONSISTENCY EXAMPLE

Consider a syllabus update.

Correct sequence:

1. Existing version remains published.
2. Admin creates draft version.
3. Admin modifies Unit 3.
4. Validation passes.
5. Reviewer approves.
6. New version publishes.
7. Old version becomes historical.
8. Audit event is created.
9. Cache invalidates.
10. Student API returns new version.
11. Optional notification is generated.

At no point should students see half-edited content.

---

# 161. CALENDAR UPDATE EXAMPLE

Suppose an examination date changes.

Admin edits the event.

The system displays:

Current:
October 12

New:
October 15

Admin enters reason:

> University revised examination schedule.

After publication:

- Calendar updates
- Version history records change
- Optional notification goes to affected students

This is much safer than editing a static JSON file manually.

---

# 162. RESOURCE APPROVAL EXAMPLE

Student uploads:

`DBMS Important Questions.pdf`

System:

- Validates upload
- Creates pending record
- Notifies moderators

Moderator opens it.

Checks:

- Correct subject
- Correct semester
- File readable
- Relevant

Approves.

System:

- Changes status to published
- Records reviewer
- Adds searchable metadata
- Makes resource available to eligible students
- Optionally notifies relevant students

---

# 163. QUIZ PUBLICATION EXAMPLE

Admin creates:

**DBMS — Normalization Quiz**

Adds 20 questions.

System validates:

- 20 questions
- Every question has valid answer
- Time limit valid
- Score rules valid

Admin previews.

Reviewer approves.

Admin publishes.

Students can now see it.

No student should see the draft during creation.

---

# 164. ADMIN PERFORMANCE TARGETS

The CMS should feel fast.

Targets:

- Navigation should respond quickly.
- Table filters should avoid unnecessary full-page reloads.
- Forms should preserve state.
- Search should provide results rapidly.
- Upload progress should be visible.
- Large lists should be paginated.

Perceived performance matters as much as raw backend speed.

---

# 165. OPTIMIZATION PRINCIPLES

Do not prematurely optimize everything.

Prioritize:

1. Correctness
2. Security
3. Data integrity
4. Maintainability
5. Performance
6. Visual polish

A fast system that publishes incorrect academic information is worse than a slightly slower safe system.

---

# 166. ADMIN DESIGN SYSTEM

Create reusable components:

- AdminShell
- Sidebar
- TopBar
- SearchCommand
- DataTable
- FilterBar
- StatusBadge
- Modal
- ConfirmDialog
- FormSection
- FileUploader
- RichTextEditor
- Pagination
- EmptyState
- ErrorState
- LoadingSkeleton
- Toast
- AuditTimeline
- VersionHistory
- PreviewPanel

This reduces inconsistency.

---

# 167. COMPONENT BEHAVIOR

Each component should have clear states.

DataTable:

- Loading
- Loaded
- Empty
- Error
- Selected
- Pagination

FileUploader:

- Idle
- Selecting
- Uploading
- Processing
- Complete
- Failed

Publishing button:

- Ready
- Validating
- Publishing
- Success
- Failed

---

# 168. DESIGN TOKENS

Admin and student applications should share brand tokens where useful:

- Typography
- Radius
- Spacing
- Border treatment
- Shadow hierarchy

But admin interface should use denser spacing.

The design system should be implemented through reusable CSS/Tailwind tokens rather than random values scattered throughout components.

---

# 169. LIGHT GLASS ADMIN THEME

Recommended visual hierarchy:

Background:
Very light neutral.

Panels:
Semi-transparent white.

Borders:
Fine, low-contrast.

Text:
Strong dark neutral.

Secondary text:
Muted neutral.

Accent:
One restrained BEU BABA brand accent.

Status:
Semantic colors.

Do not create a rainbow dashboard.

---

# 170. ADMIN DARK MODE

If dark mode is later added, it should be optional.

The architecture should not assume dark mode.

The primary design target remains a premium light interface.

---

# 171. MOBILE ADMIN PRIORITY

The mobile admin interface should prioritize:

- Notifications
- Messages
- Quick moderation
- Quick content edits
- Dashboard health

Complex bulk imports and advanced table operations can remain desktop-first.

---

# 172. CONTENT API CONTRACTS

Frontend should receive normalized, predictable objects.

For example:

PYQ:

- id
- title
- year
- course
- branch
- semester
- subject
- file
- status
- publishedAt

Avoid returning giant unrelated nested objects in every response.

Use dedicated detail endpoints where needed.

---

# 173. API PAGINATION CONTRACT

A list response should provide enough information for pagination.

Example conceptual shape:

```text
items
page
pageSize
total
hasNext
```

The exact JSON structure can be chosen during implementation.

The important requirement is consistency across modules.

---

# 174. API FILTER CONTRACT

Filters should map cleanly to database queries.

Example:

`course=btech`

`branch=cse`

`semester=4`

`status=published`

Do not accept arbitrary SQL-like expressions from clients.

Whitelist supported filters.

---

# 175. SORT CONTRACT

Sort fields should be allowlisted.

Valid:

- created_at
- updated_at
- title

Invalid:

arbitrary SQL expressions.

This reduces injection risk.

---

# 176. ADMIN EXPORT SECURITY

Exports can contain large amounts of data.

Therefore:

- Permission check
- Audit event
- Rate limit
- Optional asynchronous generation
- Expiring download link

Do not create permanent public CSV URLs.

---

# 177. PRIVACY-FIRST DEFAULTS

Default behavior should minimize exposure.

If an admin does not need a field:

Do not show it.

If a student does not need a file publicly:

Do not make it public.

If an analytics metric can be aggregated:

Prefer aggregation.

---

# 178. ADMIN DELETION POLICY

Recommended hierarchy:

Normal:
Archive

Elevated:
Restore

Super Admin:
Permanent delete for non-critical records where necessary

Never make destructive deletion the primary action.

---

# 179. DATA RETENTION FOR SUPPORT MESSAGES

Support conversations should have a documented retention policy.

Do not delete immediately after resolution.

Students may need historical replies.

Admins need context.

Retention should balance usefulness and privacy.

---

# 180. MESSAGE ATTACHMENTS

If support messages allow attachments:

- Validate type
- Limit size
- Secure storage
- Associate with conversation
- Prevent public exposure

Admin should be able to preview safe supported files.

---

# 181. RESOURCE VERSIONING

If a student resource is updated after approval, do not silently replace the original.

Create a new version or submit a new review.

Example:

Version 1 approved.

Student uploads Version 2.

Version 2 enters moderation.

Version 1 remains published until Version 2 is approved.

This prevents broken updates.

---

# 182. CONTENT ROLLBACK

If Version 3 contains an error:

Admin can select Version 2.

Instead of deleting Version 3:

- Mark Version 2 as current
- Record rollback event
- Preserve Version 3 in history

This provides traceability.

---

# 183. ADMIN CHANGE DIFF

For text-based structured content, show differences.

Example:

Unit 3:

Removed:
`Normalization and functional dependency`

Added:
`Functional dependency, closure, normalization`

This is especially valuable for syllabus changes.

---

# 184. ACADEMIC YEAR HANDLING

Do not use only the calendar year to identify academic periods.

Some academic years span two calendar years.

Use explicit academic-year fields.

Example:

`2026-27`

This avoids ambiguity.

---

# 185. SEMESTER VALIDATION

Use controlled semester values.

For example:

1 through 8 for a standard B.Tech structure, while allowing future expansion.

Do not let admins accidentally enter:

`Fourth Semester`

in one record and:

`4`

in another if the database expects a normalized relation.

---

# 186. COURSE-BRANCH VALIDATION

If a branch does not belong to a course, the UI should prevent selection.

Example:

Course selected:
B.Tech

Available branches:
Only branches configured under B.Tech.

This prevents inconsistent academic mappings.

---

# 187. SUBJECT-SEMESTER VALIDATION

Once course, branch, and semester are selected, subject options should be filtered.

This makes forms safer and faster.

---

# 188. DYNAMIC FORM DEPENDENCIES

Example:

Select Course  
↓  
Branch options update

Select Branch  
↓  
Semester options update

Select Semester  
↓  
Subjects update

This should happen in the UI and be validated again on the backend.

---

# 189. ADMIN CONTENT TEMPLATES

Provide templates for common records.

Example:

**PYQ Template**

- Title
- Year
- Subject
- Semester
- File

**Notice Template**

- Title
- Summary
- Content
- Priority
- Expiry

Templates reduce repetitive work.

---

# 190. DUPLICATE-AS-NEW

Allow authorized admins to duplicate an existing record into a draft.

Example:

2025 PYQ → Duplicate as 2026 draft.

The new record should:

- Get a new ID
- Not inherit published status
- Require review where applicable
- Preserve only safe reusable metadata

---

# 191. COPY CONTENT SAFETY

When duplicating a syllabus, be careful with:

- Old academic year
- Old dates
- Old references
- Old publication status

Reset fields that must not be copied.

---

# 192. ADMIN ONBOARDING

When a new administrator is created:

- Assign role
- Assign permissions through role
- Require secure authentication
- Log creation
- Optionally require MFA

Do not send sensitive credentials in plain text.

---

# 193. ADMIN DEACTIVATION

When an admin leaves:

- Disable account
- Preserve historical audit records
- Reassign drafts where necessary
- Reassign pending review items
- Do not delete audit ownership history

Audit history should still say which account performed old actions.

---

# 194. ADMIN INVITATION FLOW

Preferred:

Super Admin invites admin.

Invitation expires.

Admin accepts.

Admin configures authentication.

Admin gets role.

This is safer than manually sharing a common admin password.

---

# 195. SHARED ADMIN ACCOUNT PROHIBITION

Do not use one shared account such as:

`admin@beubaba.com`

for everyone.

Individual identities are required for accountability.

---

# 196. ROLE REVIEW

Super Admin should periodically review:

- Active admins
- Roles
- Permissions
- Last login
- Suspicious activity

Inactive accounts should be disabled.

---

# 197. SUSPICIOUS ADMIN ACTIVITY

Potential indicators:

- Many failed logins
- Unusual bulk exports
- Large-scale deletions
- Massive notification sends
- Sudden permission changes

The system can flag these for review.

Do not automatically accuse an admin based on one event.

---

# 198. ADMIN DASHBOARD HEALTH INDICATORS

Show:

- Database health where available
- Storage status
- Pending jobs
- Failed notification jobs
- Failed imports
- Broken links
- Moderation queue
- Scheduled content

Keep technical metrics separate from student metrics.

---

# 199. JOB MONITORING

Scheduled operations should have states:

- Queued
- Running
- Completed
- Failed
- Retrying

Admins should be able to inspect failed jobs.

Sensitive technical details should remain protected.

---

# 200. FAILED JOB RETRY

Retry should be safe.

If a notification job failed after partial delivery, retry logic must not duplicate already successful deliveries.

Track recipient-level state where required.

---

# 201. CONTENT PUBLICATION EVENTS

Publishing should generate an event that downstream systems can consume.

Example:

`content.published`

Possible consumers:

- Search indexing
- Notification generation
- Analytics
- Cache invalidation

This reduces tight coupling.

---

# 202. EVENT-DRIVEN DESIGN

Use events where they make architecture cleaner.

Do not create a giant function that performs every operation.

Example:

Publishing a resource:

Core database transaction completes.

Then an event triggers:

- Index update
- Analytics update
- Optional notification

If notification fails, the resource should not become unpublished merely because the notification provider had a problem.

---

# 203. TRANSACTIONAL VS NON-TRANSACTIONAL ACTIONS

Transactional:

- Status change
- Version creation
- Audit entry

Non-transactional:

- Push notification
- Search index update
- Analytics aggregation

Design these boundaries explicitly.

---

# 204. CACHE STALENESS

If a student temporarily sees an old cached record immediately after publication, the system should have a defined acceptable behavior.

Critical updates should invalidate quickly.

Non-critical content can tolerate small propagation delays.

Document these expectations.

---

# 205. ADMIN PREVIEW CACHE

Preview should bypass student public cache where safe.

Admins need to see their latest draft.

Draft preview must not accidentally become publicly cached.

---

# 206. SECURITY TESTING

Before production, test:

- Student cannot access admin API
- Moderator cannot perform Super Admin operations
- Student cannot read another student's messages
- Draft content cannot be fetched publicly
- Archived content cannot appear in normal feeds
- Storage URLs are protected appropriately
- Bulk operations enforce permissions
- IDs cannot be manipulated to bypass authorization

These are mandatory tests.

---

# 207. CONTENT WORKFLOW TEST CASES

Test:

1. Create draft.
2. Save draft.
3. Submit review.
4. Reject.
5. Edit rejected item.
6. Resubmit.
7. Approve.
8. Publish.
9. Verify student visibility.
10. Unpublish.
11. Verify disappearance.
12. Restore as draft.
13. Republish.

The same workflow should be tested for major content types.

---

# 208. USER SUBMISSION TEST CASES

Test:

1. Student uploads valid file.
2. Submission appears in moderation.
3. Moderator rejects.
4. Student receives status.
5. Student resubmits.
6. Moderator approves.
7. Resource appears to eligible students.
8. Unauthorized student cannot access restricted resource.

---

# 209. SYLLABUS VERSION TEST CASE

Test:

- Version 1 published
- Version 2 draft
- Version 2 rejected
- Version 2 edited
- Version 2 approved
- Version 2 published
- Version 1 remains historical
- Diff is available
- Audit log is correct

---

# 210. CALENDAR TEST CASE

Test:

- Create event
- Invalid date
- Overlap warning
- Publish
- Edit date
- Version history
- Student update
- Expiry/archive

---

# 211. QUIZ TEST CASE

Test:

- Empty quiz blocked
- Missing answer blocked
- Duplicate question warning
- Draft preview
- Publish
- Student attempt
- Result generation
- Analytics aggregation

---

# 212. ADMIN UX ACCEPTANCE CRITERIA

A feature is not complete merely because the API works.

It is complete when:

- The correct role can access it.
- Unauthorized roles cannot.
- Forms validate.
- Loading states work.
- Empty states work.
- Errors are understandable.
- Data is saved safely.
- Audit logging works.
- Publication behavior is correct.
- Student visibility is correct.
- Mobile/tablet behavior is acceptable where required.

---

# 213. PRODUCTION READINESS CHECKLIST

Before launch:

## Security
- [ ] RLS enabled
- [ ] Admin permissions tested
- [ ] Storage policies tested
- [ ] Service keys protected
- [ ] Rate limits configured
- [ ] Admin MFA considered/enabled
- [ ] Audit logging active

## Content
- [ ] Course structure imported
- [ ] Branches configured
- [ ] Subjects configured
- [ ] Syllabus imported
- [ ] PYQs verified
- [ ] Notes verified
- [ ] Calendar verified

## CMS
- [ ] Drafts work
- [ ] Review works
- [ ] Publish works
- [ ] Archive works
- [ ] Versioning works
- [ ] Preview works

## User features
- [ ] Resource upload works
- [ ] Moderation works
- [ ] Developer messages work
- [ ] Notifications work

## Operations
- [ ] Backups configured
- [ ] Error monitoring configured
- [ ] Scheduled jobs tested
- [ ] Recovery procedure documented

---

# 214. IMPLEMENTATION PRIORITY

Recommended build order:

### Phase 1 — Foundation
- Database schema
- Authentication
- Admin roles
- RLS
- Storage

### Phase 2 — Core CMS
- Courses
- Branches
- Semesters
- Subjects
- Syllabus
- Calendar

### Phase 3 — Academic Content
- PYQs
- Notes
- Resources
- Media library

### Phase 4 — Moderation
- Student submissions
- Reports
- Approval workflows
- Versioning

### Phase 5 — Quiz
- Question bank
- Quiz builder
- Attempts
- Analytics

### Phase 6 — Communication
- Developer messages
- Notifications
- Notices

### Phase 7 — Operations
- Audit logs
- Analytics
- Health checks
- Imports/exports
- Scheduled jobs

### Phase 8 — Advanced
- Bulk operations
- Advanced search
- Content quality
- Duplicate detection
- Preview-as-student
- Advanced analytics

---

# 215. MVP VS ADVANCED

The first release should not attempt every feature simultaneously.

MVP must have:

- Secure authentication
- Admin roles
- Course/branch/semester/subject
- Syllabus
- PYQ
- Notes
- Calendar
- Resource moderation
- Quiz basics
- Developer messages
- Notices
- Basic notifications
- Audit logging

Advanced features can follow after the foundation is stable.

---

# 216. WHAT MUST NEVER BE HARDCODED

The following should not be hardcoded into frontend components:

- Syllabus
- Academic calendar
- PYQ lists
- Subject lists
- Course lists
- Branch lists
- Notice content
- Resource lists
- Quiz questions
- Developer social links
- Featured content
- Academic years

These belong in database/configuration management.

Static design constants are fine.

Academic data should not be treated as UI code.

---

# 217. WHAT CAN REMAIN IN CODE

It is appropriate to keep:

- UI component definitions
- Animation configuration
- Design tokens
- Form component structure
- Validation schemas
- Permission mapping
- API client functions
- Static explanatory copy
- System-level constants

Even here, values likely to change operationally should be configurable.

---

# 218. ADMIN DATA OWNERSHIP PRINCIPLE

The administrator owns operational content.

The developer owns application behavior.

Therefore:

Admin can:
- Change syllabus
- Add PYQ
- Publish notice
- Approve resources
- Create quizzes

Developer controls:
- Application architecture
- Database migrations
- Security model
- UI components
- Core business logic
- Deployment
- Infrastructure

This boundary keeps BEU BABA maintainable.

---

# 219. NO-CODE CONTENT MAINTENANCE GOAL

An administrator should be able to perform normal academic updates without opening:

- VS Code
- GitHub
- JavaScript files
- JSON files
- React components

For example:

If university changes an examination date, the administrator should edit it from:

**Admin → Academic Calendar → Event → Edit → Publish**

No code change should be required.

---

# 220. DATA MODEL PRINCIPLE

Use normalized relationships for core academic entities.

Example:

Course
→ Branch
→ Semester
→ Subject
→ Content

This allows the same subject and content to be referenced consistently.

Avoid copying full strings into every record where relationships should be used.

---

# 221. RELATIONSHIP INTEGRITY

If a subject is used by 500 PYQs, deleting the subject should not silently destroy the PYQs.

Prefer:

- Deactivate subject
- Preserve historical references

Use foreign-key constraints and safe deletion rules.

---

# 222. ADMIN CONTENT OWNERSHIP AND SOURCE

Every externally sourced academic record should optionally preserve source attribution.

This is useful when an administrator later asks:

> Where did this calendar entry come from?

The record should provide the answer.

---

# 223. CONTENT TRUST MODEL

Not all content has the same trust level.

Suggested states:

- Unverified
- Under Review
- Verified
- Published
- Reported

Student-submitted content begins as unverified.

Official/admin-entered content may begin as verified depending on policy.

The UI can show trust information where useful.

---

# 224. STUDENT RESOURCE CREDIT

If BEU BABA chooses to credit student contributors, use a controlled display.

Example:

> Contributed by a BEU BABA student

Do not expose private information by default.

If the student explicitly opts into attribution, display the selected public name.

---

# 225. CONTENT REPORT FEEDBACK LOOP

When students repeatedly report a resource:

The system can flag it.

Example:

> 8 reports received in 7 days.

Moderator investigates.

Possible actions:

- Verify
- Correct
- Replace
- Unpublish
- Dismiss reports

This turns the student community into a quality-control signal without giving users direct publication power.

---

# 226. ADMIN DASHBOARD PRIORITY ENGINE

Dashboard ordering can prioritize items needing action.

For example:

1. Urgent academic reports
2. Pending review
3. Unresolved developer messages
4. Failed jobs
5. Scheduled events
6. General analytics

The goal is to reduce administrative backlog.

---

# 227. ADMIN WORKFLOW NOTIFICATIONS

Do not notify admins about every insignificant change.

Notify when action is required.

Good:

> 12 resources are awaiting review.

Less useful:

> Resource list was viewed.

The admin notification system should prioritize actionable events.

---

# 228. DAILY ADMIN SUMMARY

An optional operational summary can contain:

- New students
- New submissions
- Published content
- Pending reviews
- Unresolved messages
- Failed jobs
- Important reports

This can later be delivered inside the dashboard or as a scheduled summary.

---

# 229. CONTENT CALENDAR VIEW

For academic planning, provide:

- Month view
- Week view
- List view

Use event colors sparingly.

Clicking an event opens its detail.

Administrators can drag to reschedule only if their permission allows it.

Dragging should require confirmation for published academic events.

---

# 230. BULK CONTENT REVIEW

For many imported records:

Admin can select 50.

Review summary:

- 48 valid
- 2 missing metadata

The system should allow fixing invalid rows before publishing.

This is much more efficient than editing every record individually.

---

# 231. IMPORT PREVIEW UI

Show spreadsheet-like preview.

Columns:

- Row
- Title
- Course
- Branch
- Semester
- Subject
- Status

Errors appear beside the affected row.

The user can correct the source file and re-upload.

---

# 232. ADMIN FILE NAMING

The system should preserve original filename for reference but use internal storage paths based on IDs.

Do not build storage paths solely from user-provided filenames.

This prevents naming collisions and unsafe path manipulation.

---

# 233. FILE REPLACEMENT

When replacing a published file:

Do not delete the old file immediately.

Upload new file.

Validate.

Create new version.

Publish new version.

Then retain or archive old file according to retention policy.

This avoids broken content if the new upload fails.

---

# 234. THUMBNAIL MANAGEMENT

For content requiring thumbnails:

- Upload custom image
- Validate dimensions
- Compress appropriately
- Generate optimized variants where useful

The database stores metadata.

The student app loads the optimized version.

---

# 235. IMAGE PROCESSING

Profile images and thumbnails should be processed safely.

Possible operations:

- Resize
- Compress
- Strip unnecessary metadata
- Generate standard dimensions

Do not rely on client-side compression alone.

---

# 236. CONTENT PREVIEW PERFORMANCE

Large PDFs should not be fully loaded unnecessarily.

Use:

- Streaming
- Page preview
- Lazy loading

Admin can open the original file when needed.

---

# 237. ADMIN SEARCH PERFORMANCE

Search should use indexed fields.

Important indexes may include:

- title
- subject_id
- course_id
- branch_id
- semester
- year
- status
- created_at

Exact indexes depend on database query patterns.

Do not add indexes blindly.

---

# 238. DATABASE MIGRATION POLICY

Schema changes must use migrations.

Do not manually alter production tables without a tracked migration.

Migration naming should clearly describe changes.

Example:

`20260901_add_content_versions`

Keep migrations in source control.

---

# 239. SEED DATA

Development environments may include seed data.

Never seed fake users or sample academic content into production accidentally.

Production initialization must be deliberate.

---

# 240. ENVIRONMENT SEPARATION

Use separate environments where practical:

- Development
- Staging
- Production

Do not connect local development tools to production by default.

---

# 241. STAGING CONTENT

Staging can contain test content.

Clearly mark it.

Never send staging notifications to real students.

Never use real production credentials in development.

---

# 242. DEPLOYMENT SAFETY

Before deploying database changes:

- Backup
- Test migration
- Check RLS
- Check API compatibility
- Check frontend compatibility

Prefer backward-compatible changes when possible.

---

# 243. API VERSIONING

If API contracts change significantly, consider versioning.

Example:

`/api/v1/...`

Do not break an existing production app suddenly because an admin endpoint changed.

---

# 244. ADMIN FRONTEND STATE

Use a predictable state architecture.

Separate:

- Server data
- Form state
- UI state
- Authentication state

Do not place the entire CMS database inside one giant global frontend store.

---

# 245. FORM DRAFT STATE

Long forms should be isolated.

A quiz builder may need local state for:

- Questions
- Options
- Ordering
- Settings

But final truth remains backend data.

---

# 246. DATA REFRESH

After publishing content, update the relevant admin view.

Do not force the administrator to refresh the browser manually.

After mutation:

- Update local data
- Invalidate relevant query
- Refresh counts where needed

---

# 247. ADMIN ROUTE STRUCTURE

A conceptual structure:

`/admin`

`/admin/students`

`/admin/courses`

`/admin/subjects`

`/admin/syllabus`

`/admin/calendar`

`/admin/pyqs`

`/admin/notes`

`/admin/resources`

`/admin/quizzes`

`/admin/notices`

`/admin/notifications`

`/admin/messages`

`/admin/moderation`

`/admin/media`

`/admin/analytics`

`/admin/audit`

`/admin/settings`

`/admin/admins`

The actual implementation may differ, but navigation should remain intuitive.

---

# 248. FINAL ARCHITECTURAL RULES

The following rules are mandatory design principles for BEU BABA:

1. **Database is the source of truth for dynamic academic content.**
2. **Frontend is not the source of truth for permissions.**
3. **Backend authorization is mandatory.**
4. **RLS must remain enabled where applicable.**
5. **Draft content must never accidentally become public.**
6. **Published academic information must be versioned.**
7. **Destructive operations should prefer archive over delete.**
8. **Every sensitive admin action should be auditable.**
9. **Student-submitted resources require moderation before publication.**
10. **Admin roles must be granular.**
11. **Large files belong in object storage, not database rows.**
12. **Service credentials must never reach the browser.**
13. **Bulk operations require validation and safe confirmation.**
14. **Scheduled publication must be backend-controlled.**
15. **Notifications must be separate from content records.**
16. **Support conversations are private per student.**
17. **Admin UI should optimize productivity, not visual spectacle.**
18. **Premium light glassmorphism should remain readable and restrained.**
19. **Academic updates must not require developer code changes.**
20. **The system must preserve historical academic information.**
21. **All important workflows need loading, empty, error, and success states.**
22. **The application must remain maintainable as the number of students and records grows.**
23. **Every new module should follow the same content lifecycle and permission model where applicable.**
24. **Correctness and security take priority over animation and decoration.**
25. **No administrator should need to manually edit production database records for normal content maintenance.**

---

# 249. MASTER ADMIN WORKFLOW

The complete operational model should be:

```text
ADMIN LOGIN
    ↓
ROLE / PERMISSION CHECK
    ↓
ADMIN DASHBOARD
    ↓
CREATE OR REVIEW CONTENT
    ↓
FORM VALIDATION
    ↓
SAVE DRAFT
    ↓
OPTIONAL REVIEW
    ↓
APPROVAL
    ↓
PUBLISH / SCHEDULE
    ↓
DATABASE UPDATE
    ↓
VERSION + AUDIT LOG
    ↓
CACHE / SEARCH UPDATE
    ↓
OPTIONAL NOTIFICATION
    ↓
STUDENT APPLICATION
    ↓
STUDENT VIEWS UPDATED CONTENT
    ↓
STUDENT CAN REPORT ISSUE
    ↓
MODERATION / ADMIN REVIEW
    ↓
CORRECTION / NEW VERSION
```

This lifecycle should be the backbone of BEU BABA's administrative architecture.

---

# 250. FINAL IMPLEMENTATION PHILOSOPHY

BEU BABA should not be built as a beautiful frontend sitting on top of manually maintained JSON files.

It should be built as a real content-driven educational platform.

The student application should feel effortless.

The administrator application should feel controlled.

The database should preserve structure.

The permission system should preserve security.

The CMS should preserve content quality.

The version system should preserve history.

The audit system should preserve accountability.

The moderation system should preserve trust.

The storage architecture should preserve file safety.

The notification system should preserve communication.

The analytics system should preserve operational visibility.

And the overall architecture should ensure that when BEU BABA grows from a small student project into a platform with thousands of students and thousands of academic resources, the administrator does not need to rewrite the application every time the university changes a syllabus, publishes a calendar, releases a new PYQ, or updates an examination date.

The ultimate goal is:

> **Developer builds the platform. Admin operates the platform. Database stores the knowledge. Students consume verified knowledge. Every important change is controlled, traceable, reversible, and secure.**

That separation is the foundation of a production-grade BEU BABA system.


# APPENDIX A — ENTITY RELATIONSHIP BLUEPRINT

The recommended conceptual relationships are: Course has many Branches; Branch has many Semester mappings; Semester mapping has many Subjects; Subject has many Syllabus Units; Subject has many PYQs; Subject has many Notes; Subject has many Quizzes; Students belong to a Course/Branch/Semester profile; Resource submissions belong to the submitting student and may become published resources; Notices may target a broad or restricted audience; Conversations belong to exactly one student and contain many messages; Notifications belong to recipients and may reference an entity; Versions belong to versionable entities; Audit events belong to actors and reference affected entities. Foreign keys should enforce referential integrity. Historical records should remain meaningful even when current academic structures change, so deletion should generally be replaced with deactivation or archival.


# APPENDIX B — DATABASE TABLE FAMILIES

A practical schema can be organized into identity tables, academic structure tables, content tables, moderation tables, communication tables, notification tables, storage metadata tables, analytics tables, and audit tables. Identity includes profiles, roles, permissions, and role assignments. Academic structure includes courses, branches, semesters, academic years, subjects, units, and topics. Content includes PYQs, notes, resources, notices, calendars, quizzes, questions, and versions. Moderation includes submissions, reviews, reports, and review comments. Communication includes conversations and messages. Notifications include notification records, templates, and campaigns. Storage metadata includes uploaded assets and associations. Audit includes append-only events. Keeping these families conceptually separated makes migrations, permissions, testing, and maintenance easier.


# APPENDIX C — PUBLISHING STATE MACHINE

The state machine should be deterministic. Draft means editable and invisible. In Review means submitted and waiting for a reviewer. Rejected means review found a problem and the creator must correct it. Approved means content passed review but may not yet be visible. Scheduled means an approved record has a future publication time. Published means eligible students can retrieve it. Unpublished means the record was intentionally removed from student visibility but retained. Archived means it is no longer part of active content. A transition table should be implemented rather than allowing arbitrary status assignment. This prevents malformed states such as a rejected record being simultaneously published.


# APPENDIX D — ADMIN UX PRINCIPLES

The admin interface should reduce clicks for common operations while increasing friction for dangerous operations. Adding a PYQ should be quick. Publishing a syllabus should require review. Deleting a file should be difficult. Searching should be immediate. Tables should preserve filters. Returning from a detail page should not unexpectedly reset the list. Forms should retain drafts. Success messages should identify what changed. Error messages should explain how to recover. The interface should never make administrators guess whether an action succeeded.


# APPENDIX E — OPERATIONAL RUNBOOK

For normal content maintenance: sign in, review dashboard action items, open the relevant module, search/filter the target academic context, create or edit a draft, attach/verify files, validate academic mapping, submit for review when required, review the preview, publish or schedule, verify the published student-facing result, and inspect the audit event. For a correction: never directly overwrite history; create a new version, document the correction, publish, and optionally notify affected students. For an emergency: unpublish first, preserve evidence and version history, investigate, correct, and republish only after verification.


# APPENDIX F — FAILURE SCENARIOS

If a file upload fails, preserve the form and allow retry. If publication fails, do not claim success and do not create a second version unless the backend confirms the first transaction did not complete. If a notification provider fails after content publication, keep the content published and mark notification delivery separately as failed. If a scheduled job fails, retry safely using idempotency. If two admins edit the same record, detect stale versions and require conflict resolution. If a student loses connectivity during submission, do not create duplicate records on retry. If a storage object disappears, mark the content unhealthy and alert administrators instead of silently serving a broken link.


# APPENDIX G — QA MATRIX

Every content module should be tested across roles, status transitions, invalid input, concurrency, file failures, permission failures, mobile layout, accessibility, and student visibility. Every API should have positive and negative authorization tests. Every storage bucket should have tests for allowed and denied access. Every scheduled operation should have duplicate-execution tests. Every destructive operation should have audit tests. Every migration should be tested against a realistic copy of production-shaped data before release.


# APPENDIX H — SCALING STRATEGY

At small scale, a straightforward relational database, object storage, and server-rendered or client-rendered admin panel are sufficient. As records grow, add indexes based on real query patterns, server-side pagination, asynchronous file processing, job queues, notification batching, search indexing, analytics aggregation, and cache invalidation. Do not introduce distributed architecture merely because the application is called advanced. Complexity should be justified by actual workload. The database remains the authoritative source for transactional state.


# APPENDIX I — DATA GOVERNANCE

Dynamic academic information should have an owner, source, status, publication state, and update history. Sensitive student information should have restricted visibility. Support messages should not become public content. Student submissions should preserve contributor context without exposing private details. Administrative exports should be controlled and auditable. Old academic information should remain available where educationally useful, but clearly labeled as historical so it is not mistaken for the current syllabus.


# APPENDIX J — DEFINITION OF DONE

A CMS feature is done only when database structure, RLS/authorization, API contract, frontend screens, form validation, loading states, empty states, error handling, audit behavior, version behavior, storage behavior, responsive behavior, accessibility, and student-facing consequences have all been defined and tested. A button existing on the screen is not completion. A record appearing in the database is not completion. The full end-to-end workflow is the unit of completion.


# APPENDIX K — FIELD-LEVEL DATA CONTRACT REFERENCE

## Course

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **name** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **short_name** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **code** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **description** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **duration** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **active** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **display_order** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **created_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
10. **updated_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Branch

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **course_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **name** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **short_name** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **code** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **active** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **display_order** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Subject

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **course_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **branch_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **semester_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **code** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **name** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **credits** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **type** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **active** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Syllabus

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **subject_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **academic_year_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **version** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **title** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **description** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **status** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **published_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **created_by** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
10. **updated_by** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## PYQ

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **subject_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **academic_year_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **year** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **exam_type** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **title** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **file_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **status** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **verified** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
10. **created_by** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Resource

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **student_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **subject_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **title** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **description** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **file_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **submission_status** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **published_status** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **reviewed_by** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
10. **reviewed_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Notice

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **title** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **summary** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **body** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **priority** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **target_rule** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **publish_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **expires_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **status** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Quiz

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **title** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **subject_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **difficulty** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **duration_seconds** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **passing_score** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **negative_marking** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **status** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **published_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Question

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **quiz_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **question_bank_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **type** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **body** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **options** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **correct_answer** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **explanation** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **difficulty** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Conversation

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **student_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **category** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **status** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **last_message_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **assigned_admin_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Message

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **conversation_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **sender_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **sender_type** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **body** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **attachment_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **created_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **read_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## Notification

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **recipient_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **type** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **title** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **body** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **reference_type** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **reference_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **read_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **created_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## AuditEvent

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **actor_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **action** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **entity_type** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **entity_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **request_id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **metadata** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **created_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.

## MediaAsset

1. **id** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
2. **storage_path** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
3. **original_name** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
4. **mime_type** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
5. **size_bytes** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
6. **checksum** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
7. **visibility** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
8. **uploaded_by** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.
9. **created_at** — This field must have one clearly defined meaning, validation rule, ownership rule, and lifecycle. It should not be reused to represent another concept merely because the database column already exists.



# APPENDIX L — END-TO-END OPERATIONAL SCENARIOS

## Scenario 1 — University Changes Syllabus

The administrator opens Syllabus, filters to the correct course/branch/semester, opens the currently published version, selects Create New Version, edits only the changed units, enters the source/change summary, previews the student view, submits for review, reviewer verifies each checklist item, approves, and publishes. The old version becomes historical. The application cache is invalidated. The student endpoint returns the new version. If notification is enabled, a separate notification event is queued. Audit history records creator, reviewer, publisher, version, and reason.
## Scenario 2 — New PYQ Arrives

Admin selects Add PYQ, chooses academic mapping, uploads the PDF, waits for processing, checks metadata and duplicate warning, saves draft, previews the file, publishes after verification, and verifies that the PYQ appears under the correct subject. If the file is a student submission, the workflow instead begins in moderation and remains hidden until approval.
## Scenario 3 — Student Reports Wrong Resource

The report is associated with the resource. Moderator sees the report in the moderation queue, opens the resource and its version history, verifies the issue, unpublishes if necessary, records a reason, and either requests a corrected version or dismisses the report. The student's report status is updated. The original record remains auditable.
## Scenario 4 — Developer Support

Student selects Contact Developer, chooses Bug Report, enters details, and optionally attaches a screenshot. The backend creates a private conversation. Support Admin sees the unread conversation, reviews the permitted student context, replies, and changes the status. Only the same student and authorized support staff can retrieve the conversation.
## Scenario 5 — Mass Academic Notice

Admin creates a notice, selects a target audience, previews the audience estimate, schedules the publication, and confirms the notification separately. At publication time, the content becomes visible. The notification campaign is processed asynchronously and recipient delivery is tracked separately from the notice's publication state.

# APPENDIX M — IMPLEMENTATION DECISION RECORD

The implementation team must record decisions whenever a requirement has multiple technically valid solutions. Examples include storage provider selection, search implementation, notification provider, PDF preview strategy, background job execution, analytics aggregation, and authentication configuration.

Each decision should document:

- Problem
- Constraints
- Options considered
- Chosen option
- Reason
- Security implications
- Cost implications
- Migration implications
- Rollback strategy

This avoids future developers guessing why an architectural decision was made.

# APPENDIX N — CONTENT ADMIN DAILY CHECKLIST

At the beginning of an administrative session:

1. Check pending moderation.
2. Check urgent academic reports.
3. Check unresolved developer messages.
4. Check failed scheduled jobs.
5. Check important calendar changes.
6. Review content-health warnings.
7. Review scheduled publications.
8. Process normal content additions.
9. Verify critical publications.
10. Resolve completed tasks and leave a useful audit trail.

At the end of a session:

1. Ensure no important draft is unintentionally abandoned.
2. Review failed operations.
3. Confirm urgent messages are assigned.
4. Confirm scheduled content has valid publication times.
5. Confirm no critical content remains accidentally unpublished.
6. Log out from shared/public devices.

# APPENDIX O — RULES FOR FUTURE MODULES

When adding a future feature such as attendance, placement information, study plans, assignments, flashcards, events, certificates, or other educational functionality, the feature must answer the same questions before development:

- What entity owns the data?
- Who can create it?
- Who can edit it?
- Who can review it?
- Who can publish it?
- Who can see it?
- What is its lifecycle?
- Does it require versioning?
- Does it contain files?
- Does it contain personal data?
- Does it require audit logs?
- Can it be archived?
- What happens if it is wrong?
- How does a student report an issue?
- How does it appear in search?
- How is it cached?
- How is it tested?
- What happens during failure?
- How does the admin undo or correct an action?

No future module should bypass these questions simply because it appears small.

# APPENDIX P — CORE PRINCIPLE

BEU BABA should behave as a controlled information system rather than a collection of pages.

The student sees a simple result:

> “The syllabus has been updated.”

Behind that simple experience, the platform should have:

- a version,
- a source,
- an editor,
- a reviewer,
- a publication event,
- an audit event,
- an access policy,
- a cache invalidation action,
- and optionally a notification.

That hidden operational discipline is what makes the visible application reliable.

The objective of this specification is therefore not merely to create a large admin dashboard. The objective is to create a dependable operating layer for BEU BABA where content can evolve continuously without sacrificing security, correctness, history, usability, or maintainability.
