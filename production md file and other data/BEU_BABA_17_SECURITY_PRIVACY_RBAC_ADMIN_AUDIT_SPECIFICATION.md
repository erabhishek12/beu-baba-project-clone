
# BEU BABA — SECURITY, PRIVACY, RBAC, ADMIN CONTROL & AUDIT SPECIFICATION

## Document Status

- Product: BEU BABA
- Document: Security, Privacy, RBAC, Admin Control & Audit Specification
- Version: 1.0
- Purpose: Production-grade implementation specification
- Architecture target: React + Vite + TypeScript + Supabase + PWA
- Visual direction: premium Apple-inspired light glassmorphism
- Security direction: deny-by-default, least privilege, server-authoritative authorization
- Audience: product owner, UI/UX designer, frontend engineer, backend engineer, database engineer, security reviewer, QA engineer, administrator

---

# 1. DOCUMENT PURPOSE

This document defines the complete security, privacy, authorization, role-based access control, administrator-control, moderation, audit logging, abuse-prevention, data-governance, account-security, and operational-control architecture for BEU BABA.

BEU BABA is intended to function as a student-focused academic platform. The application may contain student registration, profile information, courses, notes, PDFs, syllabus information, academic calendars, previous-year questions, quizzes, downloadable quiz cards, student-submitted resources, developer messaging, announcements, notifications, and administrative management.

Security must therefore be treated as a core product feature rather than an afterthought.

The application must never rely on visual hiding, frontend route protection alone, disabled buttons, obscured API endpoints, or assumptions that users will not inspect network requests.

The fundamental security rule is:

> If a user is not authorized to perform an action, the backend must reject that action even when the user manually constructs the request.

The frontend should provide an excellent experience, but the backend/database/storage layer must remain authoritative.

---

# 2. CORE SECURITY PRINCIPLES

## 2.1 Deny by default

Every new table, storage bucket, API operation, RPC function, admin feature, and sensitive field must begin with the assumption that access is denied.

Access is granted explicitly.

Never implement:

- “Everyone can read it and the UI hides it.”
- “The user cannot see the button.”
- “The route is secret.”
- “The endpoint is difficult to guess.”
- “The storage URL is not displayed.”
- “Only the admin page links to it.”

These are not authorization controls.

---

## 2.2 Least privilege

Every user, role, service, API function, database policy, storage policy, and administrative action must receive only the permissions required to perform its job.

A student should not receive administrator capabilities simply because both accounts authenticate through the same system.

An administrator should not automatically receive unrestricted access to every operational secret.

A moderation administrator may be allowed to review resources but not change billing configuration.

---

## 2.3 Server authority

The server/database must decide:

- who the user is,
- whether the session is valid,
- which role they have,
- which student record belongs to them,
- whether they can read a resource,
- whether they can submit a resource,
- whether they can edit or delete a submission,
- whether they can message the developer,
- whether an administrator can moderate content,
- whether an administrator can change another administrator's permissions,
- whether a sensitive action should be logged.

The frontend can request an action.

The backend decides whether the action is permitted.

---

## 2.4 Explicit ownership

Student-owned records should contain an ownership relationship whenever practical.

Examples:

- `profiles.user_id`
- `quiz_attempts.user_id`
- `developer_messages.user_id`
- `resource_submissions.user_id`
- `notification_preferences.user_id`
- `push_subscriptions.user_id`

Policies should evaluate the authenticated identity against the ownership field.

---

## 2.5 Separation of duties

High-impact administrative operations should be separated where practical.

For example:

- content moderation,
- user management,
- security configuration,
- audit review,
- destructive database operations.

One administrator should not necessarily have unlimited destructive authority.

---

## 2.6 Immutable audit history

Security-relevant events must be recorded in an append-oriented audit system.

Normal administrators should not be able to casually rewrite historical audit records.

If correction is necessary, create a new corrective event rather than silently changing history.

---

# 3. THREAT MODEL

BEU BABA must assume that some users will intentionally attempt to bypass restrictions.

The system must account for:

1. curious students,
2. technically knowledgeable students,
3. malicious users,
4. compromised accounts,
5. stolen sessions,
6. automated bots,
7. spam accounts,
8. abusive resource uploads,
9. malicious files,
10. manipulated API requests,
11. modified JavaScript,
12. browser developer tools,
13. replayed requests,
14. forged client-side role values,
15. unauthorized storage access,
16. excessive notification subscriptions,
17. resource flooding,
18. message flooding,
19. quiz manipulation,
20. administrative-account compromise.

---

# 4. WHAT THE CLIENT MUST NEVER BE TRUSTED TO DECIDE

The following values must never be accepted as authoritative merely because the browser sends them:

- `is_admin`
- `role`
- `is_verified`
- `is_moderator`
- `can_upload`
- `can_download`
- `can_edit`
- `can_delete`
- `is_paid`
- `subscription_active`
- `approved`
- `verified`
- `account_status`
- `user_id`
- `owner_id`
- `created_by`
- `moderated_by`

A malicious user can modify JavaScript, intercept requests, alter request payloads, or call APIs directly.

---

# 5. IDENTITY ARCHITECTURE

BEU BABA should use a managed authentication system such as Supabase Auth.

The authentication identity should be distinct from the application profile.

Conceptually:

```text
auth.users
    |
    | 1:1
    v
profiles
    |
    +---- academic information
    +---- avatar
    +---- contact information
    +---- preferences
    +---- account status
```

The authentication layer answers:

> Who is this person?

The profile layer answers:

> What application information belongs to this authenticated person?

---

# 6. USER REGISTRATION SECURITY

The registration process may request:

- full name,
- email,
- phone/contact number,
- course,
- branch,
- semester/year,
- gender if required for avatar selection,
- profile image,
- password,
- optional academic details.

Only information genuinely required for application functionality should be mandatory.

The registration UI must clearly explain why sensitive fields are collected.

Do not collect unnecessary personal information merely because it may be useful someday.

---

# 7. PASSWORD SECURITY

Passwords must never be stored directly by BEU BABA.

Use the authentication provider's password storage and authentication system.

Never create:

```text
password
password_hash
password_plaintext
```

inside the normal profile table.

Do not log passwords.

Do not send passwords to analytics.

Do not include passwords in error messages.

Do not store passwords in localStorage.

---

# 8. EMAIL VERIFICATION

If email verification is enabled:

1. user creates account,
2. verification email is sent,
3. account remains appropriately restricted until verification,
4. user returns to BEU BABA,
5. backend verifies the authenticated state,
6. frontend updates the account state.

Do not trust a frontend flag such as:

```js
user.emailVerified = true
```

The backend authentication state is authoritative.

---

# 9. PHONE NUMBER PRIVACY

Phone numbers are personal information.

They should not be displayed publicly by default.

Recommended student profile behavior:

```text
Student profile:
Name: visible
Course: visible where necessary
Branch: visible where necessary
Phone: private
Email: private
Internal ID: private
```

Administrators may access phone information only when their role and business purpose justify it.

---

# 10. PROFILE IMAGE SECURITY

Users may upload a profile image.

The upload pipeline must validate:

- file size,
- MIME type,
- extension,
- actual file signature where practical,
- image dimensions,
- image format,
- upload rate.

Do not trust:

```text
filename = photo.jpg
Content-Type = image/jpeg
```

alone.

A malicious file may be renamed to look like an image.

---

# 11. IMAGE PROCESSING

Profile images should preferably be processed into a safe standardized format.

Recommended pipeline:

```text
Browser
  |
  v
Upload
  |
  v
Validation
  |
  v
Image processing
  |
  v
Standardized output
  |
  v
Private/public controlled storage
```

Strip unnecessary metadata where possible.

EXIF metadata may contain information such as:

- device model,
- capture time,
- GPS coordinates.

Do not expose unnecessary metadata.

---

# 12. AUTO-GENERATED CHARACTER AVATARS

BEU BABA may provide generated character avatars based on selected gender.

The system must not use gender as a basis for unrelated permissions.

Gender should only influence avatar selection if that behavior is explicitly part of the product.

The database should not interpret:

```text
gender = female
```

as:

```text
special_permissions = true
```

or any other authorization attribute.

---

# 13. ROLE MODEL

Recommended roles:

```text
student
moderator
content_manager
support_agent
admin
super_admin
```

Potential future role:

```text
developer
```

However, roles must be defined by capability, not title alone.

---

# 14. ROLE DEFINITIONS

## 14.1 Student

Can:

- access public academic content,
- access permitted course content,
- manage own profile,
- submit resources,
- see own resource submissions,
- submit quizzes,
- see own results,
- create/download quiz cards,
- send private messages to developer/support,
- manage own notification preferences,
- manage own push subscription,
- report content,
- request corrections.

Cannot:

- approve resources,
- modify other students,
- read another student's messages,
- access audit logs,
- assign roles,
- modify application configuration,
- access admin storage.

---

## 14.2 Moderator

Can:

- review resource submissions,
- approve/reject appropriate submissions,
- flag inappropriate material,
- moderate reported content.

Cannot:

- change authentication configuration,
- grant administrator privileges,
- view unrelated private student data unless required.

---

## 14.3 Content Manager

Can manage:

- courses,
- syllabus,
- academic calendar,
- PYQs,
- notes metadata,
- educational resources,
- quiz content.

Should not automatically receive access to:

- passwords,
- private messages,
- security settings,
- full student contact database.

---

## 14.4 Support Agent

Can:

- receive developer/support messages,
- reply to assigned conversations,
- view necessary student context,
- close support conversations.

Should not automatically have:

- content publishing rights,
- role-management rights,
- database-level destructive permissions.

---

## 14.5 Admin

Can manage broader application operations.

Possible capabilities:

- users,
- content,
- moderation,
- announcements,
- notifications,
- support,
- analytics,
- configuration.

Sensitive operations should still be separately protected.

---

## 14.6 Super Admin

Reserved for the highest-trust operator.

Can manage:

- administrator roles,
- security policies,
- high-impact settings,
- emergency controls,
- administrator accounts.

There should be very few super-admin accounts.

---

# 15. RBAC VS ABAC

BEU BABA should use role-based access control as the primary model.

However, role alone is not sufficient.

Combine RBAC with ownership and contextual checks.

Example:

```text
role = student
AND user_id = resource.owner_id
```

This is stronger than:

```text
role = student
```

alone.

---

# 16. CAPABILITY-BASED PERMISSION MODEL

Instead of scattering role names throughout the frontend, define capabilities.

Examples:

```text
profile.read.self
profile.update.self

resource.submit
resource.read
resource.delete.self

resource.review
resource.approve
resource.reject

course.read
course.manage

syllabus.read
syllabus.manage

calendar.read
calendar.manage

quiz.play
quiz.manage

support.message.create
support.message.read.self
support.message.reply.assigned

student.read.basic
student.read.private

notification.send
notification.manage

audit.read

role.manage
```

This allows roles to map to capabilities cleanly.

---

# 17. DATABASE ROLE STORAGE

Do not allow the client to update its own role.

Bad:

```sql
update profiles
set role = 'admin'
where user_id = auth.uid();
```

Even if the UI never shows such a button, a malicious client could attempt the request.

Role modification must require a trusted administrative pathway.

---

# 18. ROW LEVEL SECURITY

Supabase Row Level Security should be enabled for all application tables containing private or user-generated data.

Security posture:

```text
Table created
    ↓
RLS enabled
    ↓
No access
    ↓
Explicit policies added
    ↓
Test unauthorized scenarios
    ↓
Deploy
```

Do not treat RLS as optional.

---

# 19. OWNERSHIP POLICY PATTERN

For a student-owned table:

```text
authenticated user
        |
        v
auth.uid()
        |
        v
row.user_id
```

The read/update/delete policy should compare the authenticated identity with the row owner.

---

# 20. PROFILE POLICIES

Students should normally:

- read their own full profile,
- update permitted fields of their own profile.

They should not:

- change their user ID,
- change their role,
- change verification status,
- change moderation status,
- modify administrative metadata.

Use controlled database functions or triggers where field-level protection is needed.

---

# 21. PROFILE FIELD SEPARATION

For stronger security, consider separating sensitive and less-sensitive profile information.

Example:

```text
profiles
    user-facing profile

private_profiles
    phone
    private email metadata
    internal flags

admin_user_metadata
    moderation state
    internal notes
```

This makes broad read policies safer.

---

# 22. ADMIN STUDENT VIEW

The admin dashboard may display:

- student name,
- email,
- branch,
- course,
- semester,
- contact number where justified,
- registration date,
- last activity,
- account state,
- resource submissions,
- quiz activity,
- support history according to permission.

Do not display everything automatically.

Use permission-based fields.

---

# 23. ADMIN DATA MINIMIZATION

An administrator opening a student list should not receive a massive object containing every private field.

Prefer:

```text
GET student list
→ basic fields

Open student
→ authorized additional fields

Open private information
→ explicit permission check
```

This reduces accidental exposure.

---

# 24. RESOURCE SUBMISSION SECURITY

Student uploads are untrusted input.

Treat every uploaded resource as potentially malicious.

Resources may include:

- PDF,
- JPG,
- PNG,
- DOC/DOCX,
- PPT/PPTX,
- TXT,
- ZIP if explicitly supported.

Every type needs a defined policy.

---

# 25. RESOURCE MODERATION FLOW

Recommended flow:

```text
Student uploads
      ↓
status = pending
      ↓
automated validation
      ↓
moderator review
      ↓
approve / reject / request changes
      ↓
approved content published
```

Never publish a student upload merely because upload succeeded.

---

# 26. RESOURCE STATUS MACHINE

Recommended statuses:

```text
draft
pending
under_review
approved
rejected
needs_changes
hidden
archived
deleted
```

Each status transition must have a defined actor and reason.

---

# 27. MODERATION AUDIT

When a moderator approves or rejects a resource, record:

- resource ID,
- moderator ID,
- previous status,
- new status,
- timestamp,
- reason,
- optional moderation note.

Example:

```text
Resource #1842
pending → approved
Moderator: internal user ID
Reason: Academic resource verified
Timestamp: ...
```

---

# 28. REJECTION REASONS

Use structured rejection reasons where practical:

```text
duplicate
wrong_subject
wrong_course
wrong_semester
poor_quality
copyright_concern
unsafe_file
incorrect_information
spam
incomplete
other
```

Allow an optional human-readable note.

---

# 29. COPYRIGHT AND USER UPLOADS

Students may upload material they do not own.

The platform should provide:

- reporting mechanism,
- takedown workflow,
- moderation status,
- uploader identity internally,
- removal audit trail.

Do not automatically assume that a student-uploaded PDF is authorized for redistribution.

---

# 30. FILE ACCESS CONTROL

If a resource is private or restricted, use protected storage access.

Do not rely on a permanently public URL.

For restricted resources:

```text
authenticated request
      ↓
authorization check
      ↓
short-lived access
      ↓
file delivery
```

Use signed URLs with appropriate expiration where supported.

---

# 31. SIGNED URL SECURITY

Signed URLs should be:

- short-lived,
- generated only after authorization,
- not stored permanently in public database fields,
- not embedded in analytics,
- not logged unnecessarily.

A signed URL is a temporary access mechanism, not a replacement for authorization.

---

# 32. STORAGE BUCKET DESIGN

Use separate buckets according to privacy level.

Example:

```text
avatars
public-course-assets
protected-resources
private-user-uploads
admin-assets
```

Do not place all files into one unrestricted bucket.

---

# 33. STORAGE PATH DESIGN

A safe pattern:

```text
avatars/{user_id}/{uuid}.webp

resource-submissions/{user_id}/{uuid}/original.pdf

course-content/{course_id}/{uuid}.pdf
```

Avoid predictable sensitive filenames.

---

# 34. STORAGE PATH OWNERSHIP

Storage policies should ensure the authenticated user can access only files they are authorized to access.

Never assume:

```text
path contains user_id
```

automatically means ownership is valid.

The storage policy must enforce it.

---

# 35. DELETE SECURITY

Delete operations are high-risk.

Students may delete only their own eligible submissions.

Administrators may delete content according to capability.

Permanent deletion should preferably be replaced by soft deletion for important academic records.

---

# 36. SOFT DELETE

Use:

```text
deleted_at
deleted_by
deletion_reason
```

rather than immediately destroying important records.

This supports:

- recovery,
- audit,
- moderation review,
- accidental deletion recovery.

---

# 37. QUIZ SECURITY

Quiz answers and scores should be calculated server-side where integrity matters.

Do not send the correct answer to the browser before submission if the goal is to prevent inspection.

If the browser receives:

```json
{
  "correctAnswer": "B"
}
```

then a user can inspect it.

---

# 38. QUIZ RESULT INTEGRITY

The server should calculate:

- score,
- correct answers,
- wrong answers,
- unanswered count,
- percentage,
- completion state.

The client should display the server-authoritative result.

---

# 39. QUIZ ANTI-CHEAT LIMITATIONS

A web app cannot guarantee perfect anti-cheating.

Users control their browser.

The system can reduce cheating through:

- server-side scoring,
- randomized question ordering,
- randomized option ordering,
- time validation,
- attempt limits,
- server timestamps,
- suspicious-activity detection.

Never claim impossible security.

---

# 40. DEVELOPER MESSAGE PRIVACY

BEU BABA includes a private student-to-developer/support message feature.

A conversation must be visible only to:

1. the student who created it,
2. authorized support/developer personnel.

Other students must never see it.

---

# 41. MESSAGE OWNERSHIP

Every support conversation should contain:

```text
conversation_id
student_user_id
assigned_agent_id
status
created_at
updated_at
```

Every message should contain:

```text
message_id
conversation_id
sender_user_id
message_body
created_at
```

Authorization must verify conversation ownership or staff capability.

---

# 42. SUPPORT MESSAGE POLICY

Student:

```text
read own conversations
create messages in own conversations
reply in own conversations
```

Support agent:

```text
read assigned conversations
reply to assigned conversations
```

Admin:

```text
read according to support capability
```

Other student:

```text
DENY
```

---

# 43. SUPPORT MESSAGE SECURITY

Messages are untrusted input.

Sanitize displayed content.

Do not render arbitrary HTML from students.

Prefer plain text or controlled Markdown.

Prevent:

- script injection,
- HTML injection,
- malicious links,
- hidden tracking elements.

---

# 44. XSS PROTECTION

Never inject user-generated content directly into HTML.

Dangerous pattern:

```js
element.innerHTML = message;
```

Safer approach:

```js
element.textContent = message;
```

If rich text is required, use a well-maintained sanitizer with a strict allowed-element list.

---

# 45. URL SECURITY IN MESSAGES

Links submitted by users should be handled carefully.

Potentially dangerous schemes include:

```text
javascript:
data:
vbscript:
```

Allow only appropriate protocols such as:

```text
https:
```

and possibly:

```text
http:
```

if product requirements justify it.

---

# 46. NOTIFICATION SECURITY

Notifications must not reveal sensitive information unnecessarily.

Bad:

```text
Your phone number 98XXXXXX has been changed by admin...
```

Better:

```text
Your account profile was updated.
```

For private support messages:

```text
You received a new reply from support.
```

Avoid placing the entire private message in the push payload.

---

# 47. PUSH PAYLOAD MINIMIZATION

Push notification payloads should contain the minimum necessary information.

Example:

```json
{
  "type": "support_reply",
  "conversationId": "..."
}
```

The app can open the relevant screen and fetch authorized content.

---

# 48. NOTIFICATION PREFERENCE SECURITY

Users can manage their own preferences.

They cannot modify another user's preferences.

Admins may manage global notification campaigns but should not silently override personal privacy preferences except where a critical operational notice is legally or technically necessary.

---

# 49. ACCOUNT SESSION SECURITY

Use secure authentication sessions.

Do not store long-lived sensitive credentials in arbitrary browser storage.

Prefer the authentication provider's recommended session management.

When the user signs out:

- invalidate application state,
- clear cached private data where appropriate,
- remove sensitive in-memory state,
- stop private background activity.

---

# 50. MULTI-DEVICE SECURITY

A user may log in from:

- phone,
- tablet,
- laptop,
- desktop,
- installed PWA.

The backend should treat all authenticated sessions independently.

A device should not gain access merely because another device is authenticated.

---

# 51. SESSION REVOCATION

Provide an option for administrators or users to revoke sessions when supported.

Possible feature:

```text
Security
→ Active sessions
→ Device list
→ Revoke
```

At minimum, account password/security changes should trigger appropriate session invalidation behavior according to the authentication provider.

---

# 52. ACCOUNT DEACTIVATION

Account status may include:

```text
active
restricted
suspended
deactivated
deleted
```

A suspended account must be rejected server-side.

Do not rely on:

```text
if (user.status === 'suspended') hide app
```

alone.

---

# 53. RATE LIMITING

Rate limits should exist for:

- registration,
- login attempts where applicable,
- password recovery,
- support messages,
- resource uploads,
- quiz submissions,
- notification operations,
- report creation,
- profile image uploads.

The goal is to reduce:

- spam,
- abuse,
- accidental overload,
- automated attacks.

---

# 54. SUPPORT MESSAGE RATE LIMITING

A student should not be able to generate thousands of support messages in seconds.

Use server-side rate limiting.

Example conceptual policy:

```text
normal user:
limited messages per minute

temporary burst:
small allowance

abuse:
cooldown
```

Exact values should be tuned from real usage.

---

# 55. RESOURCE UPLOAD RATE LIMITING

Limit:

- files per hour/day,
- total upload bytes,
- maximum single-file size,
- concurrent uploads.

Maintain separate limits for trusted moderators if required.

---

# 56. FILE VALIDATION

For every uploaded file:

1. inspect declared MIME type,
2. inspect extension,
3. inspect file signature,
4. enforce allowed type,
5. enforce size,
6. optionally scan,
7. store safely,
8. assign moderation status.

Do not trust extension alone.

---

# 57. PDF SECURITY

PDFs can contain active or embedded content.

When serving PDFs:

- use appropriate content type,
- avoid unsafe inline handling where unnecessary,
- consider sanitization/flattening for uploaded files,
- scan suspicious files,
- prevent uploaded HTML from masquerading as PDF.

---

# 58. DOCUMENT SECURITY

Office documents may contain macros or embedded objects.

If DOCX/PPTX support is offered, define whether:

- macros are allowed,
- embedded objects are allowed,
- external links are allowed.

For a student-resource platform, safer policy is usually to prefer sanitized formats such as PDF and images.

---

# 59. ZIP SECURITY

If ZIP uploads are allowed, protect against:

- zip bombs,
- path traversal,
- excessive decompression,
- nested archives,
- enormous file counts.

If ZIP support is not required, do not enable it.

---

# 60. PATH TRAVERSAL

Never extract an uploaded archive blindly.

Reject paths such as:

```text
../../file
..\..\file
```

All extracted files must remain inside the intended directory.

---

# 61. VIRUS/MALWARE SCANNING

For high-risk uploads, integrate an appropriate malware scanning process.

A safe architecture:

```text
upload
 ↓
quarantine
 ↓
scan
 ↓
clean?
 ├── yes → moderation
 └── no → reject/quarantine
```

Never publish the file before security checks complete.

---

# 62. ADMIN DASHBOARD SECURITY

The admin dashboard is one of the highest-risk surfaces.

Use:

- role checks,
- capability checks,
- protected routes,
- server-side authorization,
- audit logging,
- confirmation dialogs,
- re-authentication for highly sensitive operations.

---

# 63. ADMIN ROUTE PROTECTION

Frontend route:

```text
/admin
```

should be inaccessible in the UI to students.

But that is only presentation.

Every admin API operation must independently verify permissions.

---

# 64. ADMIN LOGIN

Administrators should use stronger authentication than ordinary students where practical.

Recommended:

- MFA,
- strong password,
- trusted-device controls,
- session timeout,
- suspicious-login monitoring.

---

# 65. ADMIN MFA

MFA should be strongly recommended or required for:

- admin,
- super-admin.

Possible methods:

- authenticator application,
- passkey,
- security key.

Avoid relying solely on SMS for highest-risk accounts where stronger methods are available.

---

# 66. RE-AUTHENTICATION

Require recent authentication for sensitive actions such as:

- changing administrator roles,
- deleting large datasets,
- changing security settings,
- modifying notification infrastructure,
- disabling security controls.

---

# 67. DESTRUCTIVE ACTION CONFIRMATION

Dangerous operations should require explicit confirmation.

Example:

```text
Delete 2,431 resources?

This action is permanent.
Type DELETE to continue.
```

For especially sensitive actions, require re-authentication.

---

# 68. ADMIN IMPERSONATION

If administrator impersonation is implemented, it must be extremely controlled.

Never silently log in as another user.

Display:

```text
IMPERSONATION MODE
Viewing as: Student
Started by: Administrator
```

Log:

- administrator,
- target user,
- start time,
- end time,
- reason.

Prefer read-only impersonation unless absolutely necessary.

---

# 69. AUDIT LOG ARCHITECTURE

Create a dedicated audit log.

Example fields:

```text
id
actor_user_id
actor_role
action
entity_type
entity_id
target_user_id
metadata
ip_hash_or_redacted_ip
user_agent_summary
created_at
```

Do not store unnecessary sensitive data.

---

# 70. AUDIT EVENT TYPES

Examples:

```text
AUTH_LOGIN
AUTH_LOGOUT
AUTH_FAILED
PASSWORD_RESET_REQUEST
PROFILE_UPDATED
ROLE_CHANGED
USER_SUSPENDED
USER_REACTIVATED
RESOURCE_SUBMITTED
RESOURCE_APPROVED
RESOURCE_REJECTED
RESOURCE_DELETED
COURSE_UPDATED
SYLLABUS_UPDATED
CALENDAR_UPDATED
QUIZ_CREATED
QUIZ_UPDATED
QUIZ_DELETED
SUPPORT_CONVERSATION_CREATED
SUPPORT_MESSAGE_SENT
NOTIFICATION_SENT
NOTIFICATION_CAMPAIGN_CREATED
ADMIN_SETTING_CHANGED
```

---

# 71. AUDIT LOG IMMUTABILITY

Audit logs should be append-only from the application perspective.

Avoid providing a normal UI button:

```text
Delete Audit Logs
```

Audit records are security evidence.

---

# 72. ADMIN AUDIT VIEW

Provide filters:

- date,
- actor,
- action,
- entity,
- target user,
- severity.

Example:

```text
Security Events
--------------------------------
Role changed
Actor: Admin
Target: Student
Old role: student
New role: moderator
Time: ...
```

---

# 73. AUDIT SEVERITY

Possible severity levels:

```text
info
notice
warning
high
critical
```

Examples:

```text
Profile update → info
Resource rejection → notice
Repeated login failure → warning
Role change → high
Super-admin change → critical
```

---

# 74. ADMIN ACTION LOGGING

Every privileged action should be logged.

Especially:

- role changes,
- user suspension,
- resource approval,
- resource deletion,
- syllabus changes,
- calendar changes,
- notification broadcasts,
- security setting changes.

---

# 75. SYLLABUS CHANGE SECURITY

Because syllabus is important academic information, changes must be controlled.

Recommended workflow:

```text
Draft
 ↓
Review
 ↓
Publish
```

Store:

- previous version,
- new version,
- editor,
- publish time,
- reason.

---

# 76. ACADEMIC CALENDAR CHANGE SECURITY

Academic calendar edits should be audited.

If an administrator changes:

```text
Exam date
```

record:

```text
old date
new date
changed by
reason
timestamp
```

This makes accidental changes traceable.

---

# 77. COURSE CONTENT SECURITY

Course content should have:

- ownership,
- version,
- publication state,
- author/editor,
- created time,
- updated time.

Recommended states:

```text
draft
review
published
hidden
archived
```

---

# 78. VERSIONING

Do not overwrite critical academic content without preserving history.

Example:

```text
Syllabus v1
Syllabus v2
Syllabus v3
```

The currently published version is explicit.

---

# 79. ROLLBACK

Administrators should be able to restore a previous valid version.

Rollback must create an audit event.

Example:

```text
v4 → rolled back to v3
Reason: incorrect examination date
Actor: Content Admin
```

---

# 80. ADMIN CONTENT PREVIEW

Before publishing:

```text
Edit
→ Preview
→ Validate
→ Confirm
→ Publish
```

This reduces accidental production changes.

---

# 81. DOUBLE-CHECK HIGH-IMPACT PUBLISH

For critical information such as examination schedules, consider a two-person approval process.

Example:

```text
Content manager prepares
        ↓
Second admin reviews
        ↓
Publish
```

This is especially useful once the platform becomes large.

---

# 82. GLOBAL ANNOUNCEMENTS

Global announcements should support:

- draft,
- scheduled,
- published,
- expired,
- archived.

The system should record:

- author,
- publish time,
- target audience,
- content version.

---

# 83. TARGETED ANNOUNCEMENTS

Target groups may include:

```text
all students
course
branch
semester
specific cohort
```

Targeting must happen server-side.

Do not send sensitive audience data to the browser merely to filter it.

---

# 84. NOTIFICATION ABUSE PREVENTION

Administrators must not accidentally send duplicate notifications.

Use:

- campaign IDs,
- idempotency keys,
- scheduling states,
- duplicate detection.

---

# 85. NOTIFICATION CAMPAIGN STATES

Recommended:

```text
draft
scheduled
processing
sent
partially_failed
failed
cancelled
```

---

# 86. IDEMPOTENCY

If an admin clicks “Send” twice, the system should not necessarily send two identical campaigns.

Use an idempotency mechanism.

Example:

```text
campaign_id
delivery_job_id
deduplication_key
```

---

# 87. SECURITY ALERTS

The system should detect suspicious events such as:

- many failed logins,
- abnormal upload volume,
- repeated forbidden requests,
- rapid role-related failures,
- excessive support messaging,
- unusual admin activity.

---

# 88. ADMIN SECURITY DASHBOARD

Recommended cards:

```text
Failed logins today
Suspicious requests
Pending moderation
High-risk audit events
Active administrators
Recent role changes
```

Avoid making the dashboard visually overwhelming.

Use the premium light glass UI while keeping security information readable.

---

# 89. PRIVACY DASHBOARD

Students should have a simple privacy area:

```text
Privacy & Security
-------------------------
Email
Phone visibility
Profile visibility
Notifications
Push permissions
Active sessions
Data controls
Delete account
```

---

# 90. DATA EXPORT

If implemented, users should be able to request their own data.

Export could include:

- profile,
- preferences,
- quiz history,
- submitted resources,
- support conversations,
- notification preferences.

Never export another user's information.

---

# 91. DATA DELETION

Account deletion should be explicit.

Possible flow:

```text
Settings
→ Delete Account
→ Explain consequences
→ Re-authenticate
→ Confirm
→ Process deletion
```

Academic content may require retention or anonymization depending on product policy.

---

# 92. ANONYMIZATION

If a student's account is deleted but their approved resource remains useful, consider anonymization rather than deleting the resource automatically.

Example:

```text
Uploaded by: Deleted Student
```

instead of exposing personal identity.

---

# 93. PRIVACY POLICY

The application should clearly communicate:

- what data is collected,
- why it is collected,
- how it is used,
- who can access it,
- how long it is retained,
- how users can request deletion,
- how notifications work,
- how uploads are handled.

---

# 94. TERMS OF USE

Define:

- acceptable use,
- upload rules,
- copyright responsibilities,
- abuse,
- account restrictions,
- content moderation,
- platform limitations.

---

# 95. REPORTING SYSTEM

Users should be able to report:

- incorrect syllabus,
- wrong PYQ,
- inappropriate resource,
- broken resource,
- copyright issue,
- technical bug,
- abusive content.

Report records should contain:

```text
reporter
target
category
description
status
created_at
resolved_at
resolver
```

---

# 96. REPORT PRIVACY

A reporter should not automatically see:

- moderator identity,
- internal moderation notes,
- other reports,
- internal user data.

They should see only appropriate status updates.

---

# 97. BUG REPORTING

Provide a structured bug form:

```text
Category
Description
Expected behavior
Actual behavior
Device
Browser
Optional screenshot
```

Do not automatically collect excessive device data.

---

# 98. CONTACT DEVELOPER

The developer-contact area should be private.

Recommended categories:

```text
Bug
Course update
Syllabus correction
PYQ correction
Feature request
Account issue
Resource issue
Other
```

---

# 99. ADMIN SUPPORT UI

Admin support inbox:

```text
New
Open
Waiting
Resolved
Closed
```

Use unread counters and clear priority indicators.

---

# 100. SUPPORT PRIORITY

Possible priorities:

```text
low
normal
high
urgent
```

Students should not be able to mark every message as urgent without controls.

---

# 101. INTERNAL ADMIN NOTES

Internal notes must never be exposed to students.

Store them separately or enforce strict policies.

Example:

```text
Student message:
visible to student + support

Internal note:
staff only
```

---

# 102. DATABASE FUNCTIONS

Database functions must be designed securely.

Use:

- controlled inputs,
- explicit return types,
- authorization checks,
- safe search paths,
- minimal privileges.

Do not create a function that exposes unrestricted table access merely for frontend convenience.

---

# 103. SECURITY DEFINER FUNCTIONS

If `SECURITY DEFINER` functions are used, they require extra care.

They can execute with elevated privileges.

Every such function must:

- validate caller,
- validate inputs,
- use a safe search path,
- expose only intended behavior,
- avoid arbitrary SQL,
- be audited.

---

# 104. SECRET MANAGEMENT

Never commit:

```text
service_role_key
private API key
database password
JWT secret
SMTP password
storage secret
```

to Git.

Never place server-only secrets in Vite client environment variables.

---

# 105. VITE ENVIRONMENT VARIABLES

Anything prefixed for browser exposure must be treated as public.

Do not assume:

```text
VITE_SECRET_KEY
```

is secret.

The compiled frontend can expose it.

Only public configuration belongs in client-side environment variables.

---

# 106. SUPABASE SERVICE ROLE

The Supabase service-role key must never be shipped to the browser.

Use it only in trusted server-side environments where necessary.

Never:

```text
VITE_SUPABASE_SERVICE_ROLE_KEY
```

---

# 107. API SECURITY

Every API endpoint must have:

- authentication requirement,
- authorization requirement,
- input validation,
- output filtering,
- rate limiting where appropriate,
- error handling,
- logging where appropriate.

---

# 108. INPUT VALIDATION

Validate all external input:

- query parameters,
- route parameters,
- JSON body,
- form data,
- uploaded files,
- IDs,
- dates,
- enum values.

Use schemas where practical.

---

# 109. UUID VALIDATION

When expecting a UUID, validate it as a UUID.

Do not assume any arbitrary string is safe.

---

# 110. ENUM VALIDATION

If status must be:

```text
pending
approved
rejected
```

reject:

```text
admin
deleted_all
superuser
```

and other invalid values.

---

# 111. ERROR MESSAGE SECURITY

Do not expose:

- SQL errors,
- internal paths,
- secret values,
- stack traces,
- infrastructure details.

User-facing errors should be useful but safe.

Example:

```text
Something went wrong. Please try again.
```

Detailed information belongs in secure server logs.

---

# 112. LOGGING SECURITY

Logs must not contain:

- passwords,
- authentication tokens,
- full private messages,
- sensitive personal data,
- signed URLs,
- secret keys.

Redact sensitive headers.

---

# 113. ANALYTICS PRIVACY

Analytics should avoid unnecessary personal information.

Prefer anonymous or pseudonymous identifiers.

Do not send:

```text
phone
full email
private message content
```

to third-party analytics without a strong justified reason and appropriate disclosure.

---

# 114. ADMIN ANALYTICS

Administrative analytics may show aggregate metrics:

```text
daily active students
resource uploads
quiz completions
support tickets
```

Avoid exposing unnecessary individual-level data.

---

# 115. SEARCH SECURITY

Search must respect authorization.

A student searching:

```text
Abhishek
```

must not retrieve private records merely because the database contains them.

Search indexes must reflect access boundaries.

---

# 116. AUTOCOMPLETE SECURITY

Autocomplete endpoints are often overlooked.

Never expose private student data through:

```text
/search/users?q=
```

unless explicitly authorized.

---

# 117. PAGINATION SECURITY

Pagination must not allow users to enumerate unauthorized data.

Example:

```text
/users?page=500
```

should not expose private users simply because pagination exists.

---

# 118. OBJECT IDOR PROTECTION

A major threat is Insecure Direct Object Reference.

Example malicious request:

```text
/messages/123
```

changed to:

```text
/messages/124
```

The server must verify ownership.

Never assume that possession of an ID grants access.

---

# 119. RESOURCE IDOR

For:

```text
/resource/abc
```

verify:

```text
resource exists
AND
resource is published
OR
user owns it
OR
user has moderator capability
```

---

# 120. QUIZ ATTEMPT IDOR

For:

```text
/quiz-attempt/123
```

verify that the authenticated user owns the attempt or has the appropriate administrative capability.

---

# 121. SUPPORT CONVERSATION IDOR

For:

```text
/conversation/123
```

verify:

```text
conversation.student_user_id = auth.uid()
```

or authorized support role.

---

# 122. ADMIN API IDOR

Admin endpoints must validate both:

```text
authenticated
+
required capability
```

Not merely:

```text
authenticated
```

---

# 123. CORS

Configure CORS narrowly.

Do not use:

```text
Access-Control-Allow-Origin: *
```

for sensitive authenticated APIs unless there is a specific reason and the authentication model is compatible.

---

# 124. CSRF

Use appropriate CSRF protection depending on the authentication architecture.

Cookie-based authentication requires careful CSRF consideration.

Bearer-token architectures have different tradeoffs.

Do not blindly assume that “using React” eliminates CSRF.

---

# 125. CLICKJACKING

Protect sensitive application pages against unauthorized framing where appropriate.

Use modern security headers.

---

# 126. CONTENT SECURITY POLICY

Implement a carefully designed CSP.

At minimum consider:

```text
default-src
script-src
style-src
img-src
font-src
connect-src
media-src
frame-src
object-src
base-uri
form-action
```

Avoid:

```text
object-src *
```

---

# 127. SECURITY HEADERS

Recommended security headers include, where compatible:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Frame protection
```

Configure according to deployment platform.

---

# 128. HTTPS

Production BEU BABA must use HTTPS.

Never transmit credentials over plain HTTP.

---

# 129. TRANSPORT SECURITY

All sensitive traffic should use encrypted transport.

Third-party APIs should also use HTTPS.

Reject insecure external integrations.

---

# 130. PWA CACHE PRIVACY

Offline caching creates a special privacy risk.

Do not cache sensitive private pages indiscriminately.

Be careful with:

- support messages,
- student profile data,
- admin pages,
- private notifications,
- private resources.

---

# 131. CACHE CLASSIFICATION

Classify cached content:

```text
PUBLIC
AUTHENTICATED_NON_SENSITIVE
PRIVATE
ADMIN
```

Recommended:

```text
PUBLIC → cache aggressively
AUTHENTICATED → controlled cache
PRIVATE → minimal/short-lived
ADMIN → generally no persistent offline cache
```

---

# 132. LOGOUT CACHE CLEARING

On logout:

- clear private cached data,
- clear private IndexedDB records where appropriate,
- remove account-specific state,
- reset query caches,
- unregister private notification context.

Public cached content may remain if it contains no account-specific information.

---

# 133. INDEXEDDB PRIVACY

IndexedDB is not a secure vault.

Do not store highly sensitive information merely because it is “inside IndexedDB.”

Assume that the local device can be inspected by its owner or malware.

---

# 134. OFFLINE QUIZ DATA

If offline quizzes are supported, store only what is required.

Protect against stale attempts.

When reconnecting:

```text
local attempt
→ validate session
→ validate quiz version
→ submit
→ server validates
→ result finalized
```

---

# 135. CONFLICT RESOLUTION SECURITY

A client must not overwrite newer authoritative data simply because it synchronized later.

Use:

- version numbers,
- timestamps,
- server authority,
- optimistic concurrency.

---

# 136. ADMIN OFFLINE MODE

Avoid allowing sensitive admin mutations while offline.

Administrative dashboards may show cached public information, but dangerous operations should require online server validation.

---

# 137. SERVICE WORKER SECURITY

The service worker should cache only intended resources.

Do not intercept all requests blindly.

Avoid accidentally caching:

- authentication responses,
- private API responses,
- admin API responses,
- signed URLs.

---

# 138. SERVICE WORKER UPDATE SECURITY

Updates must be served over HTTPS and from trusted deployment infrastructure.

Do not dynamically execute untrusted downloaded JavaScript.

---

# 139. PWA INSTALLATION SECURITY

The installable app must use the same authentication and authorization rules as the web version.

Installation does not grant additional permissions.

---

# 140. DEVICE LOSS

Because BEU BABA may store local data, users should be warned that device security matters.

Encourage:

- device lock,
- browser security,
- OS updates.

Sensitive data should not be unnecessarily persisted offline.

---

# 141. ACCOUNT RECOVERY

Password recovery must use secure provider-supported mechanisms.

Never ask users to send passwords through:

- Telegram,
- support messages,
- developer chat,
- email.

Support staff must never request passwords.

---

# 142. ADMIN ACCOUNT RECOVERY

Administrative recovery must be stricter than normal user recovery.

Maintain backup administrative access procedures.

Avoid having a single administrator as the only recovery path.

---

# 143. PHISHING RESISTANCE

The app should clearly distinguish official communication.

Support messages should be visually labeled:

```text
BEU BABA Support
```

Do not let ordinary users impersonate staff visually.

---

# 144. STAFF BADGE

Support/admin accounts may display:

```text
Verified Support
Administrator
Content Moderator
```

The badge must come from backend role data, not user-entered profile text.

---

# 145. USERNAME SECURITY

If public usernames exist, prevent impersonation of:

```text
admin
support
developer
beubaba
official
```

Reserve official names.

---

# 146. DISPLAY NAME SECURITY

A student should not be able to create a display name such as:

```text
BEU BABA ADMIN
```

if it could mislead users.

Use verified staff badges rather than trusting names.

---

# 147. SPAM PREVENTION

Protect:

- account registration,
- support messages,
- reports,
- uploads,
- comments if later added.

Possible controls:

- rate limits,
- cooldowns,
- CAPTCHA/turnstile when justified,
- abuse scoring,
- moderation.

---

# 148. CAPTCHA

Do not force CAPTCHA on every normal student interaction.

Use adaptive protection for suspicious behavior.

---

# 149. ABUSE SCORING

Possible internal signals:

```text
many registrations
many failed requests
many uploads
many support messages
many reports
rapid account switching
```

A risk score can trigger additional verification.

Do not use opaque automated punishment without review for serious consequences.

---

# 150. ACCOUNT SUSPENSION

Suspension should require:

- reason,
- actor,
- timestamp,
- optional duration,
- audit record.

---

# 151. TEMPORARY RESTRICTION

For minor abuse, prefer:

```text
cooldown
```

rather than permanent suspension.

Example:

```text
Upload limit temporarily reached.
Try again later.
```

---

# 152. MODERATION FAIRNESS

Moderation actions should be explainable.

If a resource is rejected:

```text
Rejected
Reason: Wrong semester
```

rather than:

```text
Rejected
```

with no explanation.

---

# 153. SECURITY OF MODERATION NOTES

Internal moderation notes may contain sensitive information.

Keep them staff-only.

---

# 154. ADMIN UI PERMISSION RENDERING

The frontend should hide controls the user cannot use.

For example:

```text
if can('resource.approve'):
    show Approve button
```

But remember:

This improves UX.

It is not security.

The backend must still reject unauthorized requests.

---

# 155. PERMISSION HOOK

In React, use a centralized permission system.

Conceptual example:

```ts
can("resource.approve")
can("student.read.private")
can("audit.read")
```

Do not scatter role checks across dozens of components.

---

# 156. ROLE CHECK ANTI-PATTERN

Avoid:

```ts
if (user.role === "admin") {
  // everything
}
```

Prefer capabilities:

```ts
if (can("notification.send")) {
  ...
}
```

This allows more precise permissions.

---

# 157. ROUTE GUARD

Use route guards for UX:

```text
/admin
/support
/moderation
```

But always combine them with server authorization.

---

# 158. SECURITY-BOUNDARY DOCUMENTATION

Every protected feature should document:

```text
Who can access?
Who owns the data?
What database policy enforces it?
What API validates it?
What audit event is generated?
```

---

# 159. DATABASE POLICY TESTING

For every important table, test:

```text
student A reads own row → ALLOW
student A reads student B → DENY
student A updates own row → ALLOW
student A updates student B → DENY
student A changes role → DENY
moderator approves resource → ALLOW
student approves resource → DENY
```

---

# 160. NEGATIVE TESTING

Security testing must focus heavily on actions that should fail.

A secure system is not proven only by:

```text
valid request succeeds
```

It is also proven by:

```text
invalid request fails
```

---

# 161. AUTHORIZATION TEST MATRIX

Create a matrix:

| Action | Student | Moderator | Content Manager | Support | Admin | Super Admin |
|---|---:|---:|---:|---:|---:|---:|
| Own profile | Yes | Yes | Yes | Yes | Yes | Yes |
| Other profile private | No | No | No | No | Limited | Yes |
| Submit resource | Yes | Yes | Yes | No | Yes | Yes |
| Approve resource | No | Yes | Yes | No | Yes | Yes |
| Manage syllabus | No | No | Yes | No | Yes | Yes |
| Read own support chat | Yes | Yes | Yes | Assigned | Yes | Yes |
| Read arbitrary student chat | No | No | No | Assigned | Limited | Yes |
| Send global notification | No | No | Limited | No | Yes | Yes |
| Manage roles | No | No | No | No | Limited | Yes |
| Read audit logs | No | Limited | Limited | Limited | Yes | Yes |

This matrix should be treated as a living security document.

---

# 162. FIELD-LEVEL AUTHORIZATION

Sometimes role-based access is too broad.

Example:

A support agent may see:

```text
name
course
branch
ticket history
```

but not:

```text
phone
internal moderation notes
security events
```

Implement field-level restrictions where necessary.

---

# 163. ADMIN SEARCH FILTERS

Filters should operate on authorized fields only.

Do not accidentally allow query parameters to expose hidden columns.

---

# 164. BULK OPERATIONS

Bulk actions are dangerous.

Examples:

```text
Suspend 200 users
Delete 100 resources
Send notification to 10,000 students
```

Require:

- explicit selection,
- count confirmation,
- capability check,
- audit record,
- optional second confirmation.

---

# 165. BULK USER SUSPENSION

Before bulk suspension:

```text
Selected: 27 users
Reason: Spam
Duration: 24 hours

[Cancel] [Confirm Suspension]
```

---

# 166. BULK NOTIFICATION

Before sending:

```text
Audience: B.Tech CSE 3rd Semester
Recipients: 742
Estimated delivery: 742

[Cancel]
[Schedule]
[Send]
```

---

# 167. AUDIENCE PREVIEW

Administrators should see the audience count before sending.

Do not expose individual private recipient information unnecessarily.

---

# 168. NOTIFICATION CONTENT VALIDATION

Prevent administrators from accidentally inserting unsafe content.

Sanitize HTML.

Prefer controlled rich text.

---

# 169. ADMIN URL SECURITY

Do not put secrets into query parameters.

Bad:

```text
/admin?service_role=...
```

Never.

---

# 170. DOWNLOAD SECURITY

When users download a file, ensure authorization is checked at the moment of access.

Do not assume:

```text
user was authorized yesterday
```

means they are authorized today.

---

# 171. EXPIRING ACCESS

Signed links should expire.

If a user loses access, new links must stop being issued.

Existing short-lived links may naturally expire.

---

# 172. PRIVATE RESOURCE REVOKE

If a resource becomes:

```text
hidden
rejected
deleted
```

new access requests should be denied.

---

# 173. ADMIN RESOURCE PREVIEW

Moderators need access to pending files.

This access must be role-controlled.

Students must not gain access simply by guessing the storage path.

---

# 174. STORAGE ENUMERATION

Do not expose a bucket listing to ordinary users.

A user should not be able to list:

```text
all student uploads
```

unless explicitly intended.

---

# 175. DATABASE ENUMERATION

API endpoints should not expose sequential private IDs when avoidable.

UUIDs can reduce accidental enumeration, but UUIDs are not authorization.

---

# 176. UUID SECURITY WARNING

Even if IDs are unpredictable:

```text
authorization is still required.
```

Never say:

> “Nobody can guess the UUID.”

That is not security.

---

# 177. RATE LIMIT BY USER AND IP

Where practical, use multiple dimensions:

```text
per account
per IP
per device/session
```

This prevents attackers from bypassing a per-account limit by creating many accounts.

---

# 178. ACCOUNT CREATION LIMITS

Registration should have abuse protection.

Possible signals:

- repeated registration attempts,
- same IP creating many accounts,
- suspicious email patterns.

Do not permanently block shared networks without care because colleges may use common networks.

---

# 179. COLLEGE NETWORK CONSIDERATION

Many students may share:

```text
same Wi-Fi
same NAT IP
```

Therefore, IP-based limits must not be so aggressive that an entire campus is blocked.

Combine IP and account-level signals.

---

# 180. SECURITY INCIDENT RESPONSE

If a breach is suspected:

1. identify incident,
2. contain access,
3. revoke compromised credentials,
4. disable suspicious accounts,
5. preserve audit evidence,
6. inspect logs,
7. patch vulnerability,
8. validate fix,
9. assess affected data,
10. communicate appropriately.

---

# 181. INCIDENT SEVERITY

Possible levels:

```text
SEV-4
minor issue

SEV-3
limited user impact

SEV-2
significant security impact

SEV-1
critical compromise
```

---

# 182. SECURITY INCIDENT LOG

Maintain:

```text
incident_id
detected_at
severity
description
affected_component
containment
resolution
owner
closed_at
```

---

# 183. ADMIN COMPROMISE

If an administrator account is compromised:

Immediately consider:

- disabling account,
- revoking sessions,
- rotating affected credentials,
- checking role changes,
- checking notification campaigns,
- checking content changes,
- checking audit logs.

---

# 184. SERVICE-ROLE COMPROMISE

If a service credential leaks:

Treat it as critical.

Actions:

1. revoke/rotate,
2. inspect access,
3. inspect logs,
4. invalidate affected credentials,
5. audit database/storage changes,
6. redeploy securely.

Never leave a leaked credential active while “planning” the fix.

---

# 185. BACKUP SECURITY

Backups may contain:

- student data,
- private messages,
- resources,
- administrative data.

Backups require access control and encryption according to infrastructure capabilities.

---

# 186. RESTORE TESTING

A backup that has never been restored is not a proven backup.

Test restoration periodically.

---

# 187. DATA RETENTION

Define retention periods for:

- support conversations,
- audit logs,
- rejected uploads,
- deleted resources,
- inactive accounts,
- analytics.

Do not retain everything forever without a reason.

---

# 188. ADMIN DATA RETENTION

Admin audit logs should generally be retained longer than ordinary UI cache data because they support security investigation.

Exact retention should match operational/legal requirements.

---

# 189. TIME AND TIMESTAMPS

Store authoritative timestamps server-side.

Do not trust the browser's:

```text
createdAt
submittedAt
approvedAt
```

for security decisions.

---

# 190. CLOCK MANIPULATION

A user can change their local clock.

Do not use browser time for:

- quiz expiration,
- moderation timestamps,
- notification scheduling,
- account restrictions.

Server time must be authoritative.

---

# 191. QUIZ TIME LIMITS

For timed quizzes:

```text
serverStart
serverEnd
```

should define the authoritative attempt window.

The client timer is a visual representation.

---

# 192. RESOURCE SUBMISSION TIMING

Store:

```text
server_created_at
server_updated_at
```

not merely browser-provided timestamps.

---

# 193. ADMIN SCHEDULE SECURITY

Scheduled syllabus/calendar/notification changes must be stored server-side.

A user's local clock must not control publication.

---

# 194. SECURITY OF CRON/JOBS

Background jobs must be authenticated and authorized.

Do not create a publicly callable endpoint that triggers:

```text
send all notifications
```

without protection.

---

# 195. JOB IDEMPOTENCY

Background jobs should safely retry.

If a job runs twice, it should not duplicate destructive effects.

---

# 196. QUEUE SECURITY

Queue messages should not contain unnecessary personal data.

Prefer IDs and fetch authorized data when processing.

---

# 197. NOTIFICATION WORKER

A notification worker should verify:

- campaign status,
- audience,
- user preference,
- subscription validity,
- duplicate status.

---

# 198. PUSH SUBSCRIPTION OWNERSHIP

Each push subscription must be associated with the authenticated user.

Users must not be able to register a subscription against another user's account.

---

# 199. PUSH SUBSCRIPTION CLEANUP

Remove invalid subscriptions when delivery indicates they are no longer valid.

This reduces stale data.

---

# 200. DEEP LINK SECURITY

A notification may open:

```text
/resource/123
```

but the destination must perform its own authorization.

Never assume that opening through an official notification grants permission.

---

# 201. DEEP LINK IDOR

If a student receives a malicious link:

```text
beubaba.app/support/another-user-conversation
```

the server must reject access.

---

# 202. MOBILE/PWA SECURITY

The PWA should not assume it is running in a trustworthy native environment.

The browser is user-controlled.

All authorization remains server-side.

---

# 203. DEVTOOLS

Users can inspect:

- JavaScript,
- network calls,
- local storage,
- IndexedDB,
- DOM,
- CSS.

Therefore:

> Never put secrets in frontend code.

---

# 204. SOURCE MAPS

Production source maps should be configured according to security requirements.

If exposed, they may reveal source structure.

Do not rely on source-code obscurity for security.

---

# 205. FRONTEND BUNDLE

The frontend bundle may contain public configuration.

Anything included in it should be considered discoverable.

---

# 206. API KEY CLASSIFICATION

Every key must be classified:

```text
PUBLIC
SERVER-ONLY
HIGHLY-SENSITIVE
```

Only public keys may enter browser bundles.

---

# 207. THIRD-PARTY SERVICES

For each third-party service document:

- data shared,
- purpose,
- API credentials,
- retention,
- failure behavior,
- privacy implications.

---

# 208. ERROR FALLBACK

If a third-party service fails:

Do not expose internal provider errors.

Show:

```text
This service is temporarily unavailable.
Please try again later.
```

Log technical details securely.

---

# 209. SUPABASE STORAGE ERRORS

Do not expose raw storage errors if they reveal private paths or infrastructure information.

Map them to safe application errors.

---

# 210. SECURITY UX

Security should not make the application feel hostile.

Use friendly messages.

Bad:

```text
403 FORBIDDEN
```

Better:

```text
You don't have permission to open this page.
```

For developers/admin logs, retain the technical status.

---

# 211. SESSION EXPIRATION UX

If a session expires:

```text
Your session has expired.
Please sign in again.
```

Do not silently lose unsaved work.

---

# 212. UNSAVED WORK

For support messages or resource submissions:

- save safe drafts locally,
- warn before navigation,
- retry after reconnecting,
- never duplicate submissions.

---

# 213. DUPLICATE SUBMISSION PROTECTION

If a student taps upload twice:

The backend should detect duplicate requests through idempotency where practical.

---

# 214. DOUBLE MESSAGE SEND

If the network is slow and the student taps Send multiple times:

- disable/lock the action briefly,
- generate a client request ID,
- backend deduplicates repeated requests.

---

# 215. DELETE RETRY SAFETY

A repeated delete request should not cause inconsistent state.

Use idempotent semantics.

---

# 216. SECURITY TEST CASES

At minimum test:

### Authentication
- wrong password
- expired session
- deleted account
- suspended account
- unverified account

### Authorization
- student → another student's profile
- student → admin endpoint
- moderator → role management
- support → unrelated support chat
- user → private resource

### Storage
- guessed file path
- old signed URL
- rejected resource
- deleted resource

### Uploads
- oversized file
- wrong MIME
- malicious extension
- renamed executable
- malformed PDF
- archive traversal

### Messaging
- XSS
- unauthorized conversation
- duplicate send
- rate limit

### Admin
- privilege escalation
- role modification
- bulk operation
- notification duplication

---

# 217. SECURITY REGRESSION TESTING

Every major feature release should run authorization tests.

Especially after:

- schema changes,
- RLS policy changes,
- authentication changes,
- storage changes,
- admin UI changes,
- notification changes.

---

# 218. MIGRATION SECURITY

Database migrations should be reviewed.

Never casually disable RLS during migration and forget to re-enable it.

After migration:

```text
verify RLS
verify policies
verify indexes
verify grants
```

---

# 219. DATABASE GRANTS

Application roles should have only required database privileges.

Do not grant broad privileges merely because development is easier.

---

# 220. SECURITY REVIEW BEFORE PRODUCTION

Before production launch:

- inspect all tables,
- confirm RLS,
- inspect storage policies,
- inspect functions,
- inspect exposed API routes,
- search code for secrets,
- inspect environment variables,
- test role escalation,
- test IDOR,
- test XSS,
- test uploads.

---

# 221. SECRET SCANNING

Use automated secret scanning in Git/CI where practical.

Look for:

```text
service_role
private_key
secret
password
token
apikey
```

False positives must be reviewed, but secret scanning should be standard.

---

# 222. DEPENDENCY SECURITY

React/Vite dependencies can contain vulnerabilities.

Regularly:

- update dependencies,
- inspect security advisories,
- remove unused packages,
- pin/lock versions appropriately.

Do not install a package merely because it provides a tiny visual effect without reviewing its maintenance/security posture.

---

# 223. PACKAGE MINIMIZATION

Fewer dependencies mean:

- smaller bundle,
- smaller attack surface,
- easier updates,
- fewer supply-chain risks.

---

# 224. SUPPLY CHAIN SECURITY

Third-party packages can execute code during installation/build.

Use trusted packages.

Review:

- publisher,
- maintenance,
- downloads,
- security history,
- package permissions.

---

# 225. BUILD SECURITY

CI/CD should protect production credentials.

Do not print secrets into build logs.

---

# 226. DEPLOYMENT SECURITY

Production deployment should use:

```text
development
→ staging
→ production
```

rather than directly testing risky changes in production.

---

# 227. STAGING DATA

Avoid copying real student private data into staging unless absolutely necessary and properly protected.

Prefer synthetic data.

---

# 228. TEST ACCOUNTS

Create explicit test accounts:

```text
student_test
moderator_test
content_test
support_test
admin_test
```

Never use real student accounts for routine security testing.

---

# 229. SECURITY QA ENVIRONMENT

QA should have:

- fake students,
- fake resources,
- fake support messages,
- fake notifications,
- fake academic data.

---

# 230. ACCESS REVIEW

Periodically review:

- who is an admin,
- who is moderator,
- who is support,
- which capabilities they have.

Remove unused accounts.

---

# 231. ADMIN OFFBOARDING

When an administrator leaves:

1. disable account,
2. revoke sessions,
3. remove roles,
4. transfer ownership,
5. review recent activity,
6. preserve audit logs.

---

# 232. DEVELOPER OFFBOARDING

If a developer leaves:

- rotate shared secrets,
- remove repository access,
- remove deployment access,
- remove database access,
- remove third-party credentials.

---

# 233. EMERGENCY KILL SWITCHES

For severe incidents, consider controlled emergency switches such as:

```text
disable new uploads
disable resource publishing
pause notifications
disable public registration
maintenance mode
```

These controls must be protected and audited.

---

# 234. MAINTENANCE MODE

Maintenance mode should not accidentally lock out super-admin recovery.

Provide a secure administrative bypass.

---

# 235. FEATURE FLAGS

Feature flags should not be treated as security controls.

Example:

```text
enable_admin_feature = false
```

does not replace authorization.

---

# 236. ADMIN FEATURE FLAGS

Use feature flags to control rollout.

Authorization still applies when the flag is enabled.

---

# 237. CONTENT VISIBILITY

Every content item should have explicit visibility where necessary:

```text
public
authenticated
course_restricted
branch_restricted
semester_restricted
admin_only
```

---

# 238. CONTENT TARGETING SECURITY

Server determines whether a student matches:

```text
course
branch
semester
```

Do not allow a student to modify their request parameters to access another cohort's restricted content.

---

# 239. STUDENT PROFILE CHANGE SECURITY

Changing course/branch/semester can affect content access.

Therefore, these fields must be protected.

Consider requiring verification or administrative review if changing them changes eligibility.

---

# 240. ACADEMIC IDENTITY

If the app eventually requires college enrollment verification, store only the minimum information needed.

Do not expose identity documents publicly.

---

# 241. DOCUMENT VERIFICATION

If users upload identity/academic documents:

- store privately,
- restrict staff access,
- encrypt where supported,
- minimize retention,
- never expose through public resource buckets.

---

# 242. ADMIN PRIVATE DOCUMENT ACCESS

Access to sensitive verification documents should be capability-specific and audited.

---

# 243. SCREENSHOT PRIVACY

If users submit screenshots for bugs, they may accidentally include:

- email,
- phone,
- notifications,
- personal documents.

Provide a warning:

> Please remove sensitive information before uploading screenshots.

---

# 244. SUPPORT ATTACHMENTS

Support attachments must follow the same security pipeline as resources.

Do not let support attachments bypass malware validation.

---

# 245. MESSAGE ATTACHMENT ACCESS

Attachments belong to the conversation.

Only authorized participants/staff may access them.

---

# 246. PRIVATE RESOURCE PREVIEWS

Preview endpoints must enforce the same authorization as downloads.

Do not secure download while leaving preview publicly accessible.

---

# 247. THUMBNAIL SECURITY

Generated thumbnails should not expose private content publicly unless intentionally configured.

---

# 248. IMAGE URL SECURITY

If a private image is used in the UI:

- fetch securely,
- use short-lived access,
- do not place permanent private URLs in public HTML.

---

# 249. ADMIN AVATAR PRIVACY

Staff avatars may be public within the support interface, but avoid exposing unnecessary personal details.

---

# 250. USER DIRECTORY

Do not create a public student directory unless explicitly required.

If a community feature is added later, privacy settings must be explicit.

---

# 251. FUTURE CHAT FEATURE

If full student-to-student chat is added later, it requires:

- conversation ownership,
- blocking,
- reporting,
- abuse controls,
- moderation policy,
- message privacy,
- attachment security.

Until then, the developer/support message system remains simpler and safer.

---

# 252. BLOCKING FUTURE CHAT

Design database architecture so that future messaging does not require exposing all users.

---

# 253. USER BLOCKING

Even in support messaging, staff can restrict abusive users without deleting evidence.

---

# 254. SECURITY OF REPORTS

Users should not be able to manipulate another user's reports.

A report is owned by its creator, but moderation state is controlled by authorized staff.

---

# 255. REPORT SPAM

Rate-limit reports.

Repeated false reports may trigger review.

---

# 256. SECURITY OF QUIZ CARDS

Generated quiz cards may contain student names or scores.

Allow users to choose:

```text
Name visible
Score visible
Course visible
```

before downloading/sharing.

---

# 257. SHARING PRIVACY

If a quiz card is publicly shared, warn the user that the generated image may contain personal information.

---

# 258. STUDENT TOOLBOX

Student toolbox tools should avoid sending private data to third-party APIs unless clearly disclosed.

Examples:

- calculator,
- unit converter,
- percentage calculator,
- GPA/CGPA calculator,
- attendance calculator,
- age/date calculator,
- study timer.

Prefer local calculations where possible.

---

# 259. CALCULATOR SECURITY

Never evaluate arbitrary user input with JavaScript `eval()`.

Bad:

```js
eval(userExpression)
```

Use a safe parser or controlled calculation logic.

---

# 260. URL TOOLS

If a future tool fetches external URLs, protect against SSRF.

Never allow arbitrary server-side fetching without strict controls.

---

# 261. ADMIN URL PREVIEW

If admins can preview external links, use a controlled server-side mechanism and validate destinations.

---

# 262. SECURITY OF SEARCH

If full-text search is implemented, sanitize query inputs and enforce access control at the data layer.

---

# 263. SQL INJECTION

Use parameterized queries and Supabase APIs/RPCs appropriately.

Never concatenate untrusted input into SQL.

---

# 264. COMMAND INJECTION

Do not pass user-controlled strings to shell commands.

If server-side file processing requires command execution, use fixed arguments and strong validation.

---

# 265. TEMPLATE INJECTION

Do not interpolate untrusted input into executable templates.

---

# 266. OPEN REDIRECT

If BEU BABA supports redirects:

```text
/login?next=
```

validate allowed destinations.

Do not redirect users to arbitrary external sites.

---

# 267. EXTERNAL LINKS

External academic resources should open with safe browser behavior where applicable.

---

# 268. LINK PREVIEWS

If link previews are added, do not automatically fetch arbitrary URLs from the server without SSRF protections.

---

# 269. SECURITY OF QR CODES

If BEU BABA generates QR codes for resources or quiz cards, encode identifiers rather than sensitive data.

---

# 270. ADMIN QR

Administrative QR links must not contain secrets.

---

# 271. PASSWORDLESS/PASSKEY FUTURE SUPPORT

Passkeys can be considered for future authentication.

They can improve phishing resistance and user experience.

---

# 272. SECURITY NOTIFICATION UX

Users should be informed about meaningful security events:

```text
New sign-in
Password changed
Email changed
Security settings changed
```

Do not overwhelm users with meaningless events.

---

# 273. ACCOUNT ACTIVITY

Optional activity screen:

```text
Today
Windows laptop
Chrome
India
Successful login

Yesterday
Android
Chrome
Successful login
```

Avoid storing exact location unless required.

---

# 274. IP PRIVACY

IP addresses can be sensitive.

If audit logs require IP information, consider:

- retention limits,
- access restrictions,
- hashing/pseudonymization where suitable.

---

# 275. USER AGENT PRIVACY

Store a summarized device/browser identifier rather than huge raw user-agent strings if detailed data is unnecessary.

---

# 276. DATA ACCESS AUDIT

For highly sensitive data, consider logging not only modifications but sensitive reads.

Example:

```text
Admin viewed private student contact details.
```

---

# 277. ADMIN READ AUDIT

Sensitive admin reads should be auditable.

This discourages curiosity-driven access.

---

# 278. BREAK-GLASS ACCESS

For emergencies, a super-admin may have emergency access.

Every break-glass event should require:

- reason,
- actor,
- target,
- timestamp,
- audit entry.

---

# 279. NO SILENT PRIVILEGE ESCALATION

Role changes must be explicit.

If an admin becomes super-admin:

```text
old role
new role
who changed it
why
when
```

---

# 280. ROLE CHANGE APPROVAL

For high-trust roles:

```text
request
→ approval
→ activation
```

may be preferable.

---

# 281. ADMIN ROLE UI

Show capabilities clearly:

```text
Content Manager
✓ Courses
✓ Syllabus
✓ Calendar
✗ Student private data
✗ Roles
```

---

# 282. PERMISSION EXPLANATION

The UI should help administrators understand what a permission means.

---

# 283. SECURITY DESIGN SYSTEM

The premium Apple-inspired glass UI should not compromise security.

Security states need strong contrast.

Use:

- readable typography,
- clear labels,
- sufficient contrast,
- large touch targets,
- obvious destructive states.

Avoid glass effects that reduce text readability.

---

# 284. LIGHT GLASSMORPHISM SECURITY UI

Recommended:

```text
warm/light background
semi-transparent white surfaces
soft blur
subtle borders
restrained shadows
clean dark text
```

Avoid:

```text
black panels
RGB neon
cyberpunk
glowing borders everywhere
AI dashboard aesthetic
```

---

# 285. ADMIN COLOR SEMANTICS

Use restrained semantic signals:

```text
success → green family
warning → amber family
danger → red family
info → blue family
```

Do not turn the interface into a neon dashboard.

---

# 286. DANGEROUS ACTION DESIGN

Delete/suspend actions should be visually clear.

Use:

```text
Delete
Suspend
Revoke
Disable
```

with confirmation.

Do not rely only on color.

---

# 287. ACCESSIBILITY

Security interfaces must support:

- keyboard navigation,
- screen readers,
- visible focus,
- sufficient contrast,
- reduced motion,
- touch accessibility.

---

# 288. REDUCED MOTION

If the user prefers reduced motion:

- reduce glass transitions,
- disable unnecessary floating effects,
- simplify admin animations,
- keep state changes understandable.

---

# 289. SECURITY TOASTS

Do not communicate critical security decisions only through disappearing toasts.

Use persistent status where necessary.

---

# 290. CONFIRMATION DIALOGS

Confirmation dialogs should explain:

```text
What will happen?
Who will be affected?
Can it be undone?
```

---

# 291. BULK ACTION WARNING

Example:

> You are about to suspend 47 accounts. This will immediately prevent those students from signing in.

Then:

```text
Cancel
Confirm Suspension
```

---

# 292. ERROR RECOVERY

Security failures should provide a next step.

Example:

```text
You don't have access to this resource.
If you believe this is an error, contact support.
```

---

# 293. SECURITY SUPPORT

Support should never ask:

- password,
- OTP,
- recovery code,
- authentication token.

---

# 294. OTP SECURITY

If OTP is used:

- short expiration,
- attempt limits,
- one-time use,
- no logging of actual code.

---

# 295. RECOVERY CODE SECURITY

Recovery codes should be displayed only when generated and stored securely by the user.

Support must not request them.

---

# 296. EMAIL CHANGE

Changing email is a sensitive action.

Require appropriate verification.

Notify the previous/current email as appropriate.

---

# 297. PHONE CHANGE

Changing phone should similarly require verification if phone is used for security.

---

# 298. PROFILE SECURITY EVENTS

Notify user when important account information changes.

---

# 299. ADMIN PROFILE SECURITY

Administrator profile changes should be audited.

---

# 300. DATABASE BACKUP ACCESS

Only authorized infrastructure administrators should access raw database backups.

Application admins should not automatically receive raw backup access.

---

# 301. SUPPORT DATA ACCESS

Support staff should access only the conversations assigned or permitted by policy.

---

# 302. CONTENT MANAGER DATA ACCESS

Content managers should not receive support/private-message access by default.

---

# 303. MODERATOR DATA ACCESS

Moderators should see uploader identity only when required for moderation.

---

# 304. ADMIN DATA EXPORT

Bulk student export is high-risk.

Require:

- capability,
- confirmation,
- audit,
- secure delivery,
- minimal columns.

---

# 305. EXPORT FORMAT

Export should avoid unnecessary fields.

For example, content manager export:

```text
name
course
branch
semester
```

not:

```text
password
tokens
private messages
```

---

# 306. EXPORT LINK SECURITY

Generated exports should be:

- private,
- short-lived,
- restricted,
- auditable.

---

# 307. ADMIN CSV INJECTION

If CSV exports contain user-controlled strings beginning with characters such as:

```text
=
+
-
@
```

protect against spreadsheet formula injection.

Sanitize or prefix dangerous values appropriately.

---

# 308. HTML EXPORT SECURITY

If generating HTML exports, sanitize user content.

---

# 309. PDF EXPORT SECURITY

Generated PDFs should not unintentionally embed secrets or private metadata.

---

# 310. SECURITY OF GENERATED FILES

Generated quiz cards, reports, exports, and certificates should follow the same access model as their underlying data.

---

# 311. CERTIFICATE SECURITY

If certificates are added:

- unique identifier,
- verification page,
- signed/verified metadata,
- revocation status.

Do not expose student contact information.

---

# 312. VERIFICATION PAGES

Public certificate verification should display only intended fields.

---

# 313. PUBLIC RESOURCE SECURITY

Even public resources should be moderated before publication if uploaded by users.

---

# 314. OFFICIAL CONTENT BADGE

Official content may display:

```text
BEU BABA Verified
```

The badge should be generated from trusted database state.

---

# 315. USER CONTENT BADGE

Student-submitted content may display:

```text
Community Resource
```

rather than implying official endorsement.

---

# 316. RESOURCE TRUST MODEL

Recommended labels:

```text
Official
Verified Community
Community
Pending Review
```

---

# 317. ADMIN CONTENT EDIT HISTORY

For important content:

```text
Version history
Author
Editor
Change summary
Published date
```

---

# 318. CHANGE SUMMARY

Require administrators to provide a change reason for important updates.

Example:

```text
Reason:
University updated semester examination schedule.
```

---

# 319. AUDIT CORRELATION ID

For complex operations, generate a request/correlation ID.

Example:

```text
REQ-7F2A...
```

This allows support to connect UI errors with backend logs without exposing sensitive details.

---

# 320. SECURITY LOG CORRELATION

Errors may show:

```text
Reference ID: 7F2A9C
```

Support can locate the event internally.

---

# 321. RATE-LIMIT RESPONSE

Do not reveal exact internal limits to attackers unnecessarily.

Use:

```text
Too many requests. Please wait and try again.
```

---

# 322. ACCOUNT ENUMERATION

Login/recovery flows should avoid revealing whether an email exists where that information could create privacy/security problems.

Use generic messages where appropriate.

---

# 323. EMAIL ENUMERATION

Avoid:

```text
This email is registered.
```

in sensitive recovery contexts if account existence should remain private.

---

# 324. REGISTRATION DUPLICATES

If the product requires unique emails, the backend must enforce uniqueness.

Do not rely only on frontend validation.

---

# 325. CONTACT NUMBER UNIQUENESS

If phone uniqueness is required, enforce it server-side and consider privacy implications.

---

# 326. DATABASE CONSTRAINTS

Use database constraints for critical invariants:

- unique email/profile identifiers where appropriate,
- valid status,
- required ownership,
- foreign keys,
- non-null fields.

---

# 327. FOREIGN KEY SECURITY

Foreign keys maintain data integrity but do not provide authorization.

You still need RLS/policy enforcement.

---

# 328. TRANSACTION SAFETY

Multi-step privileged actions should use transactions where appropriate.

Example:

```text
approve resource
+
publish metadata
+
audit event
```

should not leave the system half-updated.

---

# 329. ATOMIC ROLE CHANGE

Changing role and recording audit event should be coordinated so the system does not end up with:

```text
role changed
audit missing
```

---

# 330. ATOMIC MODERATION

Approval should update:

```text
status
approved_by
approved_at
```

consistently.

---

# 331. ADMIN CONCURRENCY

Two administrators may edit the same syllabus.

Use version checks.

Example:

```text
You are editing version 7.
Current version is 8.
Reload before publishing.
```

---

# 332. LOST UPDATE PREVENTION

Do not silently overwrite another administrator's changes.

---

# 333. MODERATION CONCURRENCY

If two moderators open the same resource:

```text
Moderator A approves
Moderator B rejects
```

the backend should handle the conflict deterministically.

---

# 334. STATE TRANSITION VALIDATION

Do not permit:

```text
deleted → pending
```

unless explicitly supported.

Define valid state transitions.

---

# 335. ADMIN WORKFLOW

For resource moderation:

```text
Pending
→ Review
→ Approve
```

or:

```text
Pending
→ Review
→ Needs Changes
→ Resubmitted
→ Review
→ Approve
```

---

# 336. STUDENT RESUBMISSION

A rejected resource may be resubmitted as a new version rather than mutating the original audit history.

---

# 337. RESOURCE VERSION HISTORY

Maintain:

```text
resource
resource_versions
moderation_events
```

This creates a clean audit trail.

---

# 338. PRIVATE DRAFTS

Student drafts should not be visible to moderators until submitted, unless required.

---

# 339. DRAFT SECURITY

Draft ownership must be enforced.

---

# 340. DELETE DRAFT

Students may delete their own drafts.

---

# 341. ADMIN DRAFT VISIBILITY

Admins should see drafts only if their role requires it.

---

# 342. SECURITY OF COURSE PURCHASES

If paid courses are later added, never trust:

```text
localStorage.paid = true
```

or:

```text
user.isPaid = true
```

The backend must verify entitlements.

---

# 343. FUTURE ENTITLEMENT MODEL

Potential table:

```text
user_entitlements
user_id
course_id
status
starts_at
expires_at
```

Authorization checks this server-side.

---

# 344. COURSE CONTENT ACCESS

Before delivering protected content:

```text
authenticated
AND
entitlement active
AND
course content published
```

---

# 345. VIDEO SECURITY

If protected videos are later added:

- avoid exposing permanent private source URLs,
- use controlled playback,
- authorize access,
- consider signed playback mechanisms.

No browser-based system can completely prevent screen recording.

---

# 346. SCREEN RECORDING LIMITATION

The product must never claim:

> Video cannot be recorded.

A better statement:

> Access is restricted to authorized accounts, but no web technology can fully prevent screen recording.

---

# 347. SECURITY DOCUMENTATION

Each protected feature must include a security note.

Example:

```text
Resource upload
Auth: required
Ownership: student
Moderation: required
Storage: private
Audit: yes
Rate limit: yes
```

---

# 348. FEATURE SECURITY TEMPLATE

For every feature document:

```text
Feature:
Purpose:
Actors:
Data:
Authentication:
Authorization:
Ownership:
Storage:
Validation:
Rate limits:
Audit:
Failure states:
Privacy:
Offline behavior:
```

---

# 349. RELEASE SECURITY CHECKLIST

Before release:

### Auth
- [ ] signup tested
- [ ] login tested
- [ ] logout tested
- [ ] session expiration tested
- [ ] password recovery tested

### RBAC
- [ ] student cannot access admin
- [ ] moderator cannot manage roles
- [ ] support cannot access unrelated private data
- [ ] admin actions audited

### Database
- [ ] RLS enabled
- [ ] policies reviewed
- [ ] ownership tested
- [ ] functions reviewed

### Storage
- [ ] buckets reviewed
- [ ] private files protected
- [ ] signed URLs expire
- [ ] upload validation works

### Messaging
- [ ] conversation privacy tested
- [ ] XSS tested
- [ ] rate limits tested

### Notifications
- [ ] targeting tested
- [ ] privacy tested
- [ ] duplicates prevented

### Admin
- [ ] MFA
- [ ] re-auth for critical actions
- [ ] audit logs
- [ ] bulk-action confirmation

---

# 350. PRODUCTION SECURITY ACCEPTANCE CRITERIA

BEU BABA is not security-ready until:

1. no user can self-promote to administrator,
2. students cannot access other students' private data,
3. support conversations are private,
4. private resources require authorization,
5. uploaded resources cannot bypass moderation,
6. admin operations are audited,
7. sensitive credentials are never shipped to the browser,
8. RLS policies are tested,
9. storage policies are tested,
10. rate limiting exists for abuse-prone operations,
11. sensitive caches are controlled,
12. account deletion/restriction works,
13. critical administrator accounts use stronger authentication,
14. security incidents can be investigated using audit records.

---

# 351. 100 CRITICAL SECURITY EDGE CASES

## Authentication

1. User signs out while a request is pending.
2. Session expires during quiz submission.
3. User opens an old notification after logout.
4. User switches accounts without refreshing the PWA.
5. Suspended account still has an old browser tab open.
6. Deleted account attempts an old API request.
7. Email verification changes while app is open.
8. Password reset completes on another device.
9. User has multiple sessions.
10. User attempts repeated password recovery.

## Authorization

11. Student changes `role` in request body.
12. Student changes `user_id`.
13. Student changes `owner_id`.
14. Student accesses another student's conversation.
15. Student accesses rejected resource.
16. Student accesses deleted resource.
17. Student guesses another quiz attempt ID.
18. Moderator attempts role management.
19. Support agent accesses unassigned conversation.
20. Content manager accesses private student messages.

## Storage

21. User guesses a storage path.
22. Old signed URL is reused.
23. Resource becomes private after link generation.
24. User deletes a resource while it is being downloaded.
25. Pending file is opened by non-moderator.
26. Thumbnail is public while original is private.
27. Malicious file renamed `.pdf`.
28. Oversized file upload.
29. Malformed image.
30. Archive path traversal.

## Messaging

31. User sends HTML.
32. User sends JavaScript URL.
33. User sends extremely long message.
34. User rapidly clicks Send.
35. Network retry duplicates message.
36. User modifies conversation ID.
37. Support closes conversation while student replies.
38. Staff member loses permission while viewing conversation.
39. Attachment URL leaks.
40. Deleted account still accesses old chat.

## Admin

41. Student visits `/admin`.
42. Student manually calls admin endpoint.
43. Admin loses role while page is open.
44. Two admins edit same record.
45. Admin double-clicks delete.
46. Admin sends notification twice.
47. Admin selects unintended audience.
48. Admin exports excessive private data.
49. Moderator attempts super-admin action.
50. Admin account session stolen.

## Content

51. Student submits spam.
52. Student submits duplicate PDF.
53. Student submits wrong branch.
54. Student submits malicious document.
55. Moderator approves then another moderator rejects.
56. Resource is approved then deleted.
57. Resource version conflict.
58. Student edits approved resource.
59. Student changes resource ownership.
60. Hidden resource remains in search.

## Notifications

61. Notification sent to wrong course.
62. User disabled category but receives it.
63. Duplicate campaign delivery.
64. Push subscription belongs to old account.
65. Push payload contains private message.
66. Notification opens unauthorized resource.
67. User revokes notification permission.
68. Subscription endpoint becomes invalid.
69. Scheduled notification runs after cancellation.
70. Admin sends huge campaign accidentally.

## Offline/PWA

71. Private data cached before logout.
72. Another person opens same device.
73. Offline mutation syncs after permission revocation.
74. Offline quiz version is outdated.
75. Offline support message duplicates.
76. Service worker caches admin API.
77. Old app bundle uses outdated security policy.
78. Signed URL is cached.
79. IndexedDB contains another user's data.
80. User changes account while offline.

## Privacy

81. Phone shown publicly.
82. Email appears in exported CSV.
83. EXIF GPS survives profile upload.
84. Support attachment leaks.
85. Audit log exposes private message body.
86. Analytics receives phone number.
87. Screenshot includes sensitive data.
88. Deleted user remains personally identifiable unnecessarily.
89. Public verification page exposes too much.
90. Admin can browse students without business need.

## Infrastructure

91. Service-role key reaches browser.
92. Secret committed to Git.
93. Production credential printed in CI logs.
94. Backup exposed.
95. Database function bypasses authorization.
96. `SECURITY DEFINER` function is unsafe.
97. CORS is too broad.
98. CSP allows unsafe scripts.
99. Error response exposes SQL details.
100. Security policy changed without audit.

---

# 352. SECURITY ARCHITECTURE SUMMARY

The final architecture should follow:

```text
                         ┌─────────────────────┐
                         │     BEU BABA PWA    │
                         │ React + Vite + TS   │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │ Authentication      │
                         │ Supabase Auth       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Authorization       │
                         │ RBAC + Ownership    │
                         │ Capability checks   │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
             ┌────────────┐  ┌─────────────┐  ┌──────────────┐
             │ PostgreSQL │  │ Storage     │  │ Server APIs  │
             │ RLS        │  │ Policies    │  │ Validation   │
             └─────┬──────┘  └──────┬──────┘  └──────┬───────┘
                   │                │                │
                   └────────────────┼────────────────┘
                                    ▼
                           ┌─────────────────┐
                           │ Audit Logging   │
                           │ Security Events │
                           └─────────────────┘
```

---

# 353. FINAL IMPLEMENTATION RULE

The most important BEU BABA security rule is:

> Never trust the browser with authority.

The browser controls the interface.

The backend controls authorization.

The database enforces ownership.

Storage enforces file access.

Authentication proves identity.

RBAC determines capabilities.

Audit logs preserve accountability.

Validation protects inputs.

Rate limiting controls abuse.

Privacy controls minimize exposure.

Together these layers create the security foundation required for BEU BABA to grow from a student utility PWA into a serious academic platform.

---

# 354. FINAL DEVELOPER CHECKLIST

Before writing production code, developers must answer:

1. Who can access this feature?
2. Who owns the underlying data?
3. What happens if the user modifies the request?
4. What happens if the user changes the URL?
5. What happens if the user changes the ID?
6. What happens if the session expires?
7. What happens if the user is suspended?
8. What happens if two admins act simultaneously?
9. What happens if the request is repeated?
10. What happens offline?
11. What happens after logout?
12. What is cached?
13. What is stored locally?
14. Is private information exposed in notifications?
15. Is private information exposed in logs?
16. Is the action rate-limited?
17. Is the action audited?
18. Can the action be rolled back?
19. Can a student perform it directly through the API?
20. Can a compromised account abuse it?

If any answer is unknown, the feature is not ready for production.

---

# 355. DEFINITION OF DONE

A BEU BABA feature is considered security-complete only when:

- authentication requirements are documented,
- authorization requirements are documented,
- ownership rules are documented,
- database policies are implemented,
- storage policies are implemented if files are involved,
- input validation exists,
- abuse controls exist where appropriate,
- audit events exist for privileged actions,
- privacy behavior is defined,
- offline behavior is defined,
- failure behavior is defined,
- authorization tests pass,
- negative security tests pass,
- production secrets are protected,
- documentation is updated.

Security is therefore part of the definition of done, not a separate phase after development.
