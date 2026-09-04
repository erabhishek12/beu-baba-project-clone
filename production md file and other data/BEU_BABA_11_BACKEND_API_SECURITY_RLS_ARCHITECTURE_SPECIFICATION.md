# BEU BABA — BACKEND, API, SECURITY & RLS ARCHITECTURE SPECIFICATION

**Document:** BEU_BABA_11_BACKEND_API_SECURITY_RLS_ARCHITECTURE_SPECIFICATION.md  
**Project:** BEU BABA  
**Document Series:** Advanced Product Engineering Specification  
**Priority:** TOP / PRODUCTION CRITICAL  
**Status:** Authoritative engineering specification  
**Primary Stack:** React + Vite + TypeScript + Tailwind CSS + Framer Motion + Supabase  
**Application Type:** Premium responsive PWA / installable web application  
**Audience:** Lead developer, frontend developer, backend developer, database engineer, security reviewer, QA engineer, administrator  
**Purpose:** Define the complete backend, API, authentication, authorization, Row Level Security, storage-security, validation, abuse-prevention, privacy, and operational architecture required to build BEU BABA as a secure production-grade application.

---

# TABLE OF CONTENTS

1. Document Purpose and Authority
2. Product Security Philosophy
3. Core Architectural Principles
4. System Boundary
5. Trust Boundaries
6. Frontend vs Backend Responsibilities
7. Supabase Architecture
8. Authentication Architecture
9. Registration Workflow
10. Student Identity Model
11. Session Management
12. Password and Credential Rules
13. Email Verification
14. Password Recovery
15. Account Lifecycle
16. Account Deactivation
17. Admin Authentication
18. Admin Authorization
19. Role-Based Access Control
20. Permission Model
21. Organization of Privileges
22. API Architecture
23. API Contract Principles
24. Request Validation
25. Response Validation
26. Error Contract
27. HTTP Status Strategy
28. Rate Limiting
29. Abuse Prevention
30. Bot and Automation Protection
31. Input Sanitization
32. SQL Injection Prevention
33. XSS Prevention
34. CSRF Considerations
35. Clickjacking Protection
36. Open Redirect Protection
37. SSRF Considerations
38. File Upload Security
39. Storage Architecture
40. Storage Bucket Design
41. File Ownership
42. Private vs Public Files
43. Signed URLs
44. PDF Security
45. Image Security
46. Resource Upload Workflow
47. User-Submitted Content Moderation
48. Admin Verification
49. Content Publishing Security
50. Syllabus Security
51. Academic Calendar Security
52. PYQ Security
53. Course Content Security
54. Quiz Security
55. Quiz Attempt Security
56. Quiz Scoring Integrity
57. Developer Messaging Security
58. Notification Security
59. Push Subscription Security
60. Social Links Configuration
61. Developer Profile Configuration
62. Database Schema Security
63. Row Level Security Fundamentals
64. RLS Policy Design Rules
65. Student Policies
66. Profile Policies
67. Course Policies
68. Subject Policies
69. Syllabus Policies
70. Academic Calendar Policies
71. PYQ Policies
72. Resource Policies
73. Quiz Policies
74. Quiz Attempt Policies
75. Message Policies
76. Notification Policies
77. Admin Policies
78. Audit Log Policies
79. Storage RLS
80. Database Functions
81. Security Definer Functions
82. Trigger Security
83. Service Role Rules
84. Secrets Management
85. Environment Variables
86. Frontend Security
87. Admin Panel Security
88. Secure Data Fetching
89. Pagination
90. Filtering
91. Sorting
92. Search Security
93. Caching Security
94. Offline/PWA Security
95. Local Storage Rules
96. IndexedDB Rules
97. Sensitive Data Handling
98. Privacy Architecture
99. Student Data Protection
100. Data Minimization
101. Data Retention
102. Audit Logging
103. Security Events
104. Administrative Actions
105. Content Change Tracking
106. Versioning
107. Approval Workflow
108. Draft/Review/Publish Model
109. Rollback
110. Backup and Recovery
111. Migration Security
112. Importing Existing Data
113. Data Integrity Constraints
114. Referential Integrity
115. Concurrency
116. Race Conditions
117. Transactions
118. Idempotency
119. Duplicate Prevention
120. Optimistic UI Security
121. Server-Authoritative State
122. Quiz Anti-Cheat
123. Resource Abuse Controls
124. Messaging Abuse Controls
125. Notification Abuse Controls
126. Admin Abuse Controls
127. Monitoring
128. Logging
129. Observability
130. Security Alerts
131. Incident Response
132. Compromised Account Response
133. Compromised Admin Response
134. Storage Leak Response
135. Database Leak Response
136. Dependency Security
137. Third-Party Integration Security
138. YouTube Integration Security
139. Google Drive Integration Security
140. External Links
141. CSP
142. Security Headers
143. CORS
144. Domain Configuration
145. Production Deployment
146. Development Environment
147. Staging Environment
148. Production Environment
149. CI/CD Security
150. Code Review Rules
151. Secret Scanning
152. Dependency Scanning
153. Database Migration Review
154. RLS Testing
155. API Testing
156. Authentication Testing
157. Authorization Testing
158. Storage Testing
159. Penetration-Test Checklist
160. Threat Model
161. Attack Scenarios
162. Security Controls
163. Failure Modes
164. Recovery Procedures
165. Performance/Security Tradeoffs
166. Secure UX
167. Security Messages
168. Admin Safety UX
169. Developer Support Workflow
170. Data Export
171. Account Deletion
172. Privacy Requests
173. Compliance-Oriented Design
174. Production Checklist
175. Definition of Done
176. Non-Negotiable Rules
177. Final Architecture Summary

---

# 1. DOCUMENT PURPOSE AND AUTHORITY

This document defines how BEU BABA must handle identity, permissions, backend communication, database access, files, user-generated content, administrative actions, and security-sensitive operations.

This is not a visual design document.

It does not define colors, typography, glass effects, card shapes, animation curves, or screen layouts except where security requires a specific UX behavior.

This document exists because a premium educational application cannot be considered production-ready merely because its interface looks polished.

BEU BABA will contain:

- student accounts;
- personal information;
- branch and course information;
- contact information;
- profile images;
- academic records generated by application activity;
- uploaded resources;
- quizzes;
- quiz attempts;
- messages to the developer;
- notifications;
- administrative content;
- syllabus information;
- academic calendars;
- previous-year questions;
- course information;
- resource metadata;
- potentially private file references;
- administrative audit information.

Therefore, security must be designed into the architecture rather than added after the UI has been completed.

The fundamental rule is:

> The frontend is a user interface, not a security boundary.

Anything visible in React can be modified by a malicious user.

Anything stored in browser JavaScript can potentially be inspected.

Anything sent from a browser must be considered attacker-controlled.

Anything that affects authorization, ownership, publishing, scoring, moderation, or privileged data must be enforced on the server/database side.

---

# 2. PRODUCT SECURITY PHILOSOPHY

BEU BABA should follow a practical security philosophy:

1. Default deny.
2. Explicitly grant access.
3. Never trust the client.
4. Validate every important input.
5. Enforce ownership at database level.
6. Enforce administrator privileges at database/backend level.
7. Keep secrets outside frontend code.
8. Keep private files private.
9. Use short-lived signed URLs for protected files.
10. Record sensitive administrative actions.
11. Make destructive operations difficult to trigger accidentally.
12. Prefer reversible operations where possible.
13. Never store unnecessary personal information.
14. Never expose service-role credentials to users.
15. Never depend on hidden buttons for authorization.
16. Never depend on route guards alone.
17. Never depend on JavaScript conditions alone.
18. Treat uploaded files as untrusted.
19. Treat external URLs as untrusted.
20. Treat user-generated text as untrusted.
21. Make the database authoritative for state.
22. Make the backend authoritative for privileged operations.
23. Make quiz scoring server-authoritative.
24. Make content publishing controlled by permissions.
25. Make audit logs append-oriented.
26. Design for account compromise.
27. Design for administrator compromise.
28. Design for accidental deletion.
29. Design for rollback.
30. Design security controls before production launch.

---

# 3. CORE ARCHITECTURAL PRINCIPLES

## 3.1 Separation of concerns

The system should be divided conceptually into:

```text
Presentation Layer
        ↓
Application/API Layer
        ↓
Authentication Layer
        ↓
Authorization Layer
        ↓
Database Layer
        ↓
Storage Layer
        ↓
External Services
```

No layer should assume that another layer has already performed all necessary validation.

---

## 3.2 Server-authoritative operations

The following must never be trusted from the client:

- user role;
- admin status;
- verification status;
- resource approval;
- resource publication;
- quiz answer correctness;
- quiz score;
- quiz completion state;
- ownership;
- account deletion authorization;
- notification broadcast permission;
- syllabus publication permission;
- academic calendar editing permission;
- PYQ publishing permission;
- developer-message deletion by another user;
- audit-log creation claims;
- storage access permissions.

For example, the frontend must never send:

```json
{
  "user_id": "...",
  "role": "admin"
}
```

and expect the backend to believe it.

The authenticated identity must come from the trusted authentication context.

---

# 4. SYSTEM BOUNDARY

The BEU BABA system can be represented as:

```text
                    ┌─────────────────────┐
                    │     BEU BABA PWA    │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                         HTTPS / TLS
                               │
                    ┌──────────▼──────────┐
                    │ Authentication/API  │
                    │     Boundary        │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
       ┌────────▼────────┐          ┌────────▼────────┐
       │ PostgreSQL DB   │          │ Supabase Storage │
       │ + RLS           │          │ private/public   │
       └────────┬────────┘          └────────┬─────────┘
                │                            │
                └────────────┬───────────────┘
                             │
                 ┌───────────▼───────────┐
                 │ Trusted Server/Admin  │
                 │ operations/functions  │
                 └───────────────────────┘
```

External services such as YouTube or Google Drive should be treated as external trust boundaries.

---

# 5. TRUST BOUNDARIES

The architecture has several distinct trust zones.

## Zone A — Public visitor

A visitor may be able to see:

- landing information;
- public course metadata;
- public academic information;
- publicly published resources;
- public developer links;
- public announcements.

No authenticated privileges exist here.

---

## Zone B — Authenticated student

A logged-in student may access:

- own profile;
- own account settings;
- published educational content;
- own quiz attempts;
- own uploaded resources;
- own resource status;
- own developer messages;
- own notifications;
- allowed student tools.

The student must not automatically gain access to:

- other students' profiles;
- other students' contact details;
- admin-only data;
- pending moderation queues;
- audit logs;
- private administrative conversations;
- unpublished content;
- private storage objects belonging to another user.

---

## Zone C — Moderator/content manager

If BEU BABA eventually introduces moderators, their permissions must be narrower than full administrators.

For example:

```text
moderator
├── review resources
├── approve/reject resources
└── view moderation queue

but NOT:
├── change admin permissions
├── delete student accounts
├── access sensitive student data unnecessarily
└── modify security configuration
```

---

## Zone D — Administrator

Administrators can perform privileged operations according to explicit permission.

Do not make the word `admin` itself the only long-term authorization architecture.

Use permissions such as:

```text
students.read
students.update
resources.review
resources.publish
syllabus.manage
calendar.manage
pyq.manage
quiz.manage
notifications.send
messages.reply
analytics.read
settings.manage
```

---

# 6. FRONTEND VS BACKEND RESPONSIBILITIES

## Frontend responsibilities

The frontend is responsible for:

- displaying content;
- collecting input;
- client-side validation for better UX;
- loading data;
- rendering errors;
- showing loading states;
- showing permission-aware UI;
- managing local interface state;
- caching non-sensitive information;
- requesting authenticated operations.

---

## Backend/database responsibilities

The backend/database must enforce:

- authentication;
- authorization;
- ownership;
- RLS;
- storage access;
- content publication;
- moderation state;
- quiz scoring;
- privileged changes;
- destructive operations;
- sensitive data access;
- audit events;
- notification authorization;
- account lifecycle.

Client validation should improve the experience but must never replace server validation.

---

# 7. SUPABASE ARCHITECTURE

BEU BABA can use Supabase as the central backend platform.

Logical components:

```text
Supabase
├── Auth
├── PostgreSQL
├── Row Level Security
├── Storage
├── Edge Functions where needed
└── Realtime only where justified
```

The project should avoid unnecessary backend complexity.

However, simplicity must not mean bypassing security.

---

# 8. AUTHENTICATION ARCHITECTURE

The user has specified that students must register with proper details such as:

- name;
- course;
- branch;
- email;
- contact number;
- academic information;
- profile image or generated character.

Authentication should separate:

### Identity credentials

Managed by the authentication system.

Examples:

- email;
- password;
- session;
- refresh token.

### Application profile

Managed by the application database.

Examples:

```text
profiles
├── id
├── full_name
├── course_id
├── branch_id
├── semester
├── contact_number
├── profile_image_url
├── avatar_type
├── avatar_gender
├── created_at
├── updated_at
└── status
```

Do not duplicate password information in the profile table.

---

# 9. REGISTRATION WORKFLOW

Recommended registration flow:

```text
User opens app
      ↓
Register
      ↓
Enter identity credentials
      ↓
Enter student information
      ↓
Client validation
      ↓
Authentication account creation
      ↓
Profile creation
      ↓
Email verification if enabled
      ↓
Profile setup completion
      ↓
Dashboard
```

The application must not treat an incomplete profile as a fully configured student.

Use:

```text
profile_completion_status
```

or derive completion safely from required fields.

---

# 10. STUDENT IDENTITY MODEL

A student profile should have a stable immutable identity.

The authentication user ID should be the primary reference.

Example conceptual relationship:

```text
auth.users.id
       │
       ▼
profiles.id
       │
       ├── resource_uploads.user_id
       ├── quiz_attempts.user_id
       ├── support_messages.user_id
       ├── notifications.user_id
       └── push_subscriptions.user_id
```

Never use:

- email;
- phone number;
- display name;

as the primary identity key.

Emails and phone numbers can change.

The authenticated UUID should remain stable.

---

# 11. SESSION MANAGEMENT

The application should use the authentication provider's session system rather than implementing its own password/session protocol.

Rules:

1. Never store raw passwords.
2. Never manually implement password hashing if Supabase Auth is being used.
3. Never expose refresh tokens unnecessarily.
4. Never place credentials in URLs.
5. Always use HTTPS in production.
6. Clear local authenticated state on sign-out.
7. Re-check authentication for sensitive actions.
8. Do not assume that a page opened earlier still has valid authorization.

A session expiring should produce a controlled UX:

```text
Session expired
        ↓
Save non-sensitive local draft if appropriate
        ↓
Ask user to sign in
        ↓
Return to previous safe location
```

---

# 12. PASSWORD AND CREDENTIAL RULES

Do not create custom password storage.

Minimum UX rules should include:

- meaningful password guidance;
- prevention of obviously weak credentials where supported;
- password recovery;
- email verification where configured;
- clear authentication error messages without leaking whether a sensitive account exists.

Avoid overly detailed authentication errors such as:

> This email exists but the password is incorrect.

A safer generic response is:

> Email or password is incorrect.

---

# 13. EMAIL VERIFICATION

If email verification is enabled:

```text
registration
   ↓
verification pending
   ↓
verification link
   ↓
verified
   ↓
full application access
```

The UI should clearly indicate:

```text
Email verification required
Resend verification
Change email
```

Resend operations should be rate-limited.

---

# 14. PASSWORD RECOVERY

Password reset flow:

```text
Forgot password
      ↓
enter email
      ↓
generic confirmation
      ↓
email link
      ↓
secure reset page
      ↓
new password
      ↓
session/security handling
```

Do not expose account existence through reset responses.

---

# 15. ACCOUNT LIFECYCLE

Recommended states:

```text
pending
active
restricted
suspended
deactivated
deleted
```

A student account should not simply disappear from the database without considering:

- quiz history;
- uploaded resources;
- messages;
- audit records;
- moderation records;
- notification history.

Deletion must therefore be carefully designed.

---

# 16. ACCOUNT DEACTIVATION

Prefer reversible deactivation where practical.

Example:

```text
status = deactivated
```

instead of immediate physical deletion.

The user should not be able to access normal student functions while deactivated.

Administrative restoration may be possible if policy permits.

---

# 17. ADMIN AUTHENTICATION

Admin access must not be created through a hidden frontend route.

This is insecure:

```text
/admin
```

combined with:

```javascript
if (user.email === "admin@example.com")
```

Frontend code can be inspected.

Admin authorization must be enforced through trusted backend/database policy.

---

# 18. ADMIN AUTHORIZATION

A secure model can use:

```text
profiles
      ↓
roles
      ↓
permissions
```

Example:

```text
admin
content_manager
moderator
support_agent
analytics_viewer
```

The exact roles can evolve.

The important requirement is that privileged access must be explicit.

---

# 19. ROLE-BASED ACCESS CONTROL

Conceptual table:

```text
roles
├── id
├── name
└── description

permissions
├── id
├── code
└── description

role_permissions
├── role_id
└── permission_id

user_roles
├── user_id
└── role_id
```

This architecture allows:

```text
admin
  → all necessary permissions

content_manager
  → course management
  → syllabus management
  → PYQ management
  → resource moderation

support_agent
  → support messages
  → limited student context
```

---

# 20. PERMISSION MODEL

Permission names should be machine-readable.

Examples:

```text
students.read
students.update
students.restrict

resources.read
resources.review
resources.publish
resources.archive

courses.read
courses.manage

syllabus.read
syllabus.manage

calendar.read
calendar.manage

pyq.read
pyq.manage

quiz.read
quiz.manage
quiz.review

messages.read
messages.reply

notifications.read
notifications.send

settings.read
settings.manage

audit.read
```

Do not create hundreds of unnecessary permissions initially.

Use a clear, extensible naming system.

---

# 21. ORGANIZATION OF PRIVILEGES

Permissions should be checked at the narrowest meaningful boundary.

For example:

A user who can:

```text
resources.review
```

should not automatically receive:

```text
students.delete
```

This is the principle of least privilege.

---

# 22. API ARCHITECTURE

BEU BABA should avoid arbitrary database calls scattered throughout components.

Instead, establish an application data-access layer.

Example:

```text
src/
├── features/
│   ├── courses/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── components/
│   ├── quizzes/
│   ├── resources/
│   ├── messages/
│   └── profile/
│
└── lib/
    ├── supabase/
    ├── validation/
    └── security/
```

This makes security review easier.

---

# 23. API CONTRACT PRINCIPLES

Every important operation should have a clear contract.

Example:

```text
POST /resource-submissions
```

Input:

```json
{
  "title": "Operating Systems Notes",
  "subject_id": "uuid",
  "description": "Unit 1 notes"
}
```

The server derives:

```text
user_id
created_at
submission_status
```

It must not trust the client to define:

```text
user_id
approved_by
approved_at
published
```

---

# 24. REQUEST VALIDATION

Validate:

- type;
- required fields;
- length;
- format;
- allowed enum values;
- UUID format;
- numeric boundaries;
- date ranges;
- ownership;
- relationship validity.

Example:

```text
semester must be one of:
1,2,3,4,5,6,7,8
```

Do not accept:

```text
semester = "administrator"
```

because the frontend dropdown supposedly prevents it.

---

# 25. RESPONSE VALIDATION

The frontend should not assume that every backend response is perfect.

For critical structures, define TypeScript schemas/types and validate where appropriate.

Example:

```text
Quiz
├── id
├── title
├── duration
├── question_count
├── status
└── published_at
```

Unexpected structures should fail safely.

---

# 26. ERROR CONTRACT

Errors should be structured.

Conceptually:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource could not be found."
  }
}
```

Do not expose:

- SQL statements;
- stack traces;
- internal database schema;
- service credentials;
- filesystem paths;
- internal tokens.

---

# 27. HTTP STATUS STRATEGY

Use meaningful status classes.

```text
200 OK
201 Created
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests

500 Internal Server Error
```

Do not use `200` for every failure.

---

# 28. RATE LIMITING

Rate limiting should exist for:

- login attempts;
- password reset requests;
- verification resend;
- resource uploads;
- support messages;
- notification requests;
- quiz submission;
- admin actions;
- expensive search;
- file generation;
- public APIs.

The exact limits should be based on real usage.

The goal is not to punish legitimate users.

The goal is to prevent:

- spam;
- brute force;
- automated abuse;
- accidental request storms;
- resource exhaustion.

---

# 29. ABUSE PREVENTION

Student-uploaded resources are especially vulnerable to abuse.

Possible attacks:

```text
upload malware
upload huge files
upload thousands of files
upload illegal content
upload unrelated content
upload duplicated content
spam resource titles
```

Controls should include:

- file size limits;
- MIME validation;
- extension validation;
- upload rate limits;
- per-user quotas;
- moderation;
- duplicate detection;
- abuse reporting;
- administrator removal.

---

# 30. BOT AND AUTOMATION PROTECTION

Do not automatically add CAPTCHA to every screen.

Use friction where abuse risk justifies it.

High-risk operations may require additional protection.

Examples:

```text
repeated login failures
mass message attempts
high-volume resource uploads
suspicious quiz submission patterns
notification abuse
```

The user experience should remain smooth for normal students.

---

# 31. INPUT SANITIZATION

All user-generated text is untrusted.

Examples:

- resource titles;
- descriptions;
- messages;
- quiz answers;
- profile names;
- comments if added later;
- report reasons.

Never render raw HTML from users unless it has been intentionally sanitized.

Prefer plain text.

---

# 32. SQL INJECTION PREVENTION

Do not construct SQL using string concatenation with user input.

Prefer:

- Supabase query builders;
- parameterized queries;
- safe database functions.

Never do:

```text
"SELECT * FROM students WHERE name = '" + userInput + "'"
```

---

# 33. XSS PREVENTION

The application should not use unsafe HTML rendering for normal user content.

Avoid unnecessary:

```text
dangerouslySetInnerHTML
```

If rich text is eventually required, sanitize it with a trusted allowlist.

Never allow arbitrary:

```html
<script>
```

or event attributes.

---

# 34. CSRF CONSIDERATIONS

The authentication architecture should use secure browser/session mechanisms provided by the selected platform.

For custom server endpoints, explicitly evaluate:

- cookie authentication;
- SameSite policy;
- CSRF tokens where applicable;
- origin checking.

Do not assume that CORS is a CSRF defense.

---

# 35. CLICKJACKING PROTECTION

Production deployment should use appropriate security headers so malicious sites cannot frame sensitive BEU BABA interfaces where inappropriate.

Administrative pages especially should not be casually embeddable.

---

# 36. OPEN REDIRECT PROTECTION

If BEU BABA supports:

```text
?redirect=/dashboard
```

allow only safe internal destinations.

Do not redirect users to arbitrary attacker-controlled domains.

---

# 37. SSRF CONSIDERATIONS

If the backend ever fetches a user-provided URL, validate it.

This is particularly relevant if future features include:

- URL import;
- resource preview;
- metadata extraction;
- external file importing.

Do not create a generic server endpoint:

```text
/fetch?url=ANYTHING
```

without strict controls.

---

# 38. FILE UPLOAD SECURITY

Uploaded files are untrusted.

Supported file types should be explicit.

For example:

```text
PDF
JPG
JPEG
PNG
WEBP
```

Additional types should be enabled only when genuinely required.

Never trust:

```text
filename extension
```

alone.

---

# 39. STORAGE ARCHITECTURE

Use separate logical storage areas.

Example:

```text
avatars/
resources/
course-assets/
pyq/
syllabus/
calendar/
quiz-assets/
```

Private and public content must not be mixed carelessly.

---

# 40. STORAGE BUCKET DESIGN

A practical design:

```text
public-assets
private-user-files
protected-course-assets
admin-assets
```

Public:

- app logos;
- public thumbnails;
- public avatars if intentionally public.

Private:

- user-uploaded resources before moderation;
- private support attachments;
- sensitive student uploads.

Protected:

- paid/private course assets if required.

---

# 41. FILE OWNERSHIP

Every user-generated object should map to its owner.

Example:

```text
resource_uploads.user_id
```

Storage object paths should also be predictable and ownership-aware.

Example:

```text
resources/{user_id}/{resource_id}/file.pdf
```

This is preferable to:

```text
random-folder/file.pdf
```

because ownership becomes easier to reason about.

---

# 42. PRIVATE VS PUBLIC FILES

Default rule:

> New user-uploaded files should be private until explicitly approved for publication.

Do not immediately make every student upload public.

Workflow:

```text
upload
  ↓
private
  ↓
review
  ↓
approved
  ↓
published
```

---

# 43. SIGNED URLS

For private files, use short-lived signed URLs where appropriate.

Do not store permanent public links to sensitive files.

A signed URL should:

- expire;
- provide access only for intended duration;
- not be logged unnecessarily;
- not be placed in persistent analytics;
- not be embedded in public database fields.

---

# 44. PDF SECURITY

PDFs should be treated as untrusted documents.

Potential risks include:

- malicious embedded content;
- enormous files;
- malformed PDFs;
- unexpected MIME types;
- duplicate spam.

At minimum:

- enforce size limits;
- validate file type;
- store privately before moderation;
- restrict direct public exposure.

If server-side processing is later introduced, isolate that processing.

---

# 45. IMAGE SECURITY

Profile images and resource images should have:

- size limits;
- dimensions limits where practical;
- MIME validation;
- safe transformations;
- randomized or controlled object paths.

Do not trust user-provided filenames.

---

# 46. RESOURCE UPLOAD WORKFLOW

Required workflow:

```text
Student
  ↓
Select file
  ↓
Client validates basic size/type
  ↓
Upload to private storage
  ↓
Create submission metadata
  ↓
Status = pending
  ↓
Admin/moderator review
  ↓
Approve / Reject
  ↓
If approved:
    publish metadata
    expose safe file
  ↓
Student receives status
```

The client must not be able to set:

```text
approved = true
```

---

# 47. USER-SUBMITTED CONTENT MODERATION

Every resource submission should have status:

```text
pending
approved
rejected
archived
removed
```

Optional:

```text
needs_changes
```

The student should see:

```text
Pending review
Approved
Rejected
Archived
```

If rejected, provide a safe reason when appropriate.

---

# 48. ADMIN VERIFICATION

Approval should record:

```text
reviewed_by
reviewed_at
review_reason
status
```

Example:

```text
resource_submission
├── id
├── user_id
├── title
├── file_path
├── status
├── reviewed_by
├── reviewed_at
├── rejection_reason
├── created_at
└── updated_at
```

---

# 49. CONTENT PUBLISHING SECURITY

Approval and publication should not be conflated.

Possible states:

```text
draft
pending_review
approved
published
archived
```

This allows an administrator to approve content without immediately making it visible if scheduling is required.

---

# 50. SYLLABUS SECURITY

Syllabus data must be editable through the admin system but read-only for normal students.

Students:

```text
SELECT published syllabus
```

Admins:

```text
SELECT
INSERT
UPDATE
ARCHIVE
```

The frontend must not expose database write privileges simply because an admin button exists.

---

# 51. ACADEMIC CALENDAR SECURITY

Academic calendar entries should support versioning.

Example:

```text
calendar_events
├── id
├── title
├── event_date
├── category
├── description
├── status
├── version
├── created_by
├── updated_by
├── created_at
└── updated_at
```

Changing an important date should be auditable.

---

# 52. PYQ SECURITY

Previous-year question data may be public after publication.

However, administrative modifications should be protected.

Students:

```text
read published PYQs
```

Admins:

```text
manage PYQs
```

Potential metadata:

```text
university
course
branch
semester
subject
year
exam_type
file_path
status
```

---

# 53. COURSE CONTENT SECURITY

Course content can have:

```text
free
paid
private
draft
published
archived
```

The UI must not be responsible for enforcing paid access.

If content is restricted, backend/database/storage access must also be restricted.

---

# 54. QUIZ SECURITY

Quiz metadata can be visible:

```text
title
description
duration
question_count
difficulty
```

But answer keys must not be delivered to the client before submission.

Never send:

```json
{
  "correct_answer": "B"
}
```

with the quiz question if the student can inspect the response.

---

# 55. QUIZ ATTEMPT SECURITY

An attempt should belong to one authenticated student.

Conceptually:

```text
quiz_attempts
├── id
├── quiz_id
├── user_id
├── started_at
├── submitted_at
├── status
├── score
└── metadata
```

Ownership is enforced through RLS.

---

# 56. QUIZ SCORING INTEGRITY

The client should submit answers.

The server/database computes:

```text
score
correct_count
incorrect_count
unanswered_count
```

Do not trust:

```json
{
  "score": 95
}
```

from the client.

The client should submit something like:

```json
{
  "attempt_id": "...",
  "answers": [...]
}
```

and the trusted system calculates the result.

---

# 57. DEVELOPER MESSAGING SECURITY

BEU BABA will include a simple private developer support/message feature.

The requirement is:

```text
Student A sends message
        ↓
Developer/admin sees it
        ↓
Developer replies
        ↓
Only Student A can see that conversation
```

Student A must never be able to query Student B's messages.

RLS should enforce:

```text
user_id = auth.uid()
```

for student-owned conversations.

Administrators/support staff receive controlled access.

---

# 58. NOTIFICATION SECURITY

Notifications can be:

```text
personal
course-specific
branch-specific
global
```

A student should only receive notifications intended for their audience.

Do not create a client-controlled:

```text
recipient_ids
```

mechanism for arbitrary notification injection.

---

# 59. PUSH SUBSCRIPTION SECURITY

Push subscriptions should be tied to the authenticated user.

Conceptually:

```text
push_subscriptions
├── id
├── user_id
├── endpoint
├── public_key
├── auth_key
├── device_metadata
├── created_at
└── last_seen_at
```

Users must not be able to read another user's subscription endpoint.

---

# 60. SOCIAL LINKS CONFIGURATION

BEU BABA's developer links can be stored as controlled application settings.

Current required social destinations include:

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

These should be treated as application configuration, not hard-coded throughout components.

For example:

```text
app_settings
└── developer_links
```

Only authorized administrators should be able to change them.

---

# 61. DEVELOPER PROFILE CONFIGURATION

Developer information should be centrally configurable.

Possible structure:

```text
developer_profile
├── display_name
├── bio
├── portfolio_primary
├── portfolio_secondary
├── instagram_primary
├── instagram_secondary
├── telegram
├── updated_at
└── updated_by
```

The app should read this configuration rather than duplicating the same data in multiple screens.

---

# 62. DATABASE SCHEMA SECURITY

Every important table must have:

- appropriate primary key;
- foreign keys;
- NOT NULL where required;
- CHECK constraints where useful;
- unique constraints where appropriate;
- indexes;
- timestamps;
- RLS;
- documented ownership model.

Never enable unrestricted public access simply to make development easier.

---

# 63. ROW LEVEL SECURITY FUNDAMENTALS

RLS is a core BEU BABA security layer.

The fundamental rule:

> If a table contains user-owned data, RLS should be considered mandatory.

A frontend query such as:

```text
select *
from profiles
```

must not automatically return every student.

RLS should restrict the result.

---

# 64. RLS POLICY DESIGN RULES

Policies should be explicit.

Do not create broad policies like:

```text
authenticated users can do everything
```

unless the table genuinely contains no sensitive information and the operation is intentionally broad.

Separate:

```text
SELECT
INSERT
UPDATE
DELETE
```

policies.

---

# 65. STUDENT POLICIES

For profiles:

```text
student can read own profile
student can update allowed profile fields
student cannot change role
student cannot change approval status
student cannot change another user
```

Some fields may be immutable or admin-controlled.

---

# 66. PROFILE POLICIES

Editable:

```text
display name
profile image
avatar selection
allowed contact information
```

Potentially controlled:

```text
course
branch
student status
verification status
role
```

Do not let a user self-promote by changing:

```text
role = admin
```

---

# 67. COURSE POLICIES

Students should read only published courses.

Admins/content managers may manage them according to permission.

Draft courses must remain invisible to normal students.

---

# 68. SUBJECT POLICIES

Subjects follow course/branch/semester relationships.

The backend should validate that a requested subject actually belongs to the intended academic hierarchy.

Do not trust a client to submit:

```text
branch_id = A
subject_id = subject-from-branch-B
```

and assume the relationship is valid.

---

# 69. SYLLABUS POLICIES

Students:

```text
read published syllabus
```

Authorized admins:

```text
create
update
publish
archive
```

Every publication action should be attributable.

---

# 70. ACADEMIC CALENDAR POLICIES

Students:

```text
read published calendar events
```

Admins:

```text
manage calendar
```

Historical events should preferably be archived rather than silently destroyed.

---

# 71. PYQ POLICIES

Students:

```text
read published
```

Admins:

```text
create/update/archive/publish
```

Student uploads of PYQ-like material should enter the resource moderation workflow rather than directly modifying official PYQ data.

---

# 72. RESOURCE POLICIES

A student can:

```text
create own submission
read own submissions
update own pending submission where allowed
```

A student cannot:

```text
approve own submission
publish own submission
review another student's submission
change reviewer
```

---

# 73. QUIZ POLICIES

Students can read:

```text
published quiz
published questions required to play
```

but must not read:

```text
answer key
internal moderation notes
private quiz configuration
```

Admins can manage according to permissions.

---

# 74. QUIZ ATTEMPT POLICIES

Student:

```text
create own attempt
read own attempt
submit own attempt
```

Student cannot:

```text
read another student's attempt
modify another student's score
modify submitted score
```

After submission, score should become effectively immutable except through controlled administrative correction.

---

# 75. MESSAGE POLICIES

Student:

```text
create message in own conversation
read own conversation
read own replies
```

Developer/support:

```text
read assigned/authorized conversations
reply
update status
```

Student must never receive a query result containing other students' messages.

---

# 76. NOTIFICATION POLICIES

Student can read:

```text
notifications targeted to user
global published notifications
relevant course/branch notifications
```

Student cannot create global notifications.

---

# 77. ADMIN POLICIES

Admin access should be policy-based.

Avoid:

```text
auth.role() = authenticated
```

for sensitive administrative tables.

Instead evaluate a trusted role/permission model.

Where complex authorization is required, use carefully reviewed database functions.

---

# 78. AUDIT LOG POLICIES

Students generally should not access internal audit logs.

Audit logs may contain:

- actor;
- action;
- entity;
- entity ID;
- timestamp;
- metadata;
- IP information if intentionally collected and legally appropriate.

Keep access restricted.

---

# 79. STORAGE RLS

Storage policies must match database ownership.

If:

```text
resources/{user_id}/...
```

then storage policy can enforce that the authenticated user owns the path.

Never assume:

```text
database says user owns it
```

means storage automatically knows that.

Both layers must be aligned.

---

# 80. DATABASE FUNCTIONS

Database functions can encapsulate trusted operations.

Good candidates:

```text
submit_quiz_attempt()
approve_resource()
publish_content()
create_notification()
```

But functions must be carefully secured.

Do not create a function that accepts arbitrary user IDs and blindly performs privileged actions.

---

# 81. SECURITY DEFINER FUNCTIONS

Security-definer functions are powerful and dangerous.

Use them only when necessary.

Rules:

1. Keep them small.
2. Validate all arguments.
3. Set safe search paths.
4. Avoid dynamic SQL.
5. Restrict execute privileges.
6. Review every privileged function.
7. Do not expose them unnecessarily to anonymous users.

---

# 82. TRIGGER SECURITY

Triggers can enforce consistency.

Examples:

- updated timestamps;
- audit events;
- profile creation;
- notification creation.

Do not hide complicated business logic inside dozens of triggers.

Business-critical logic should remain understandable and testable.

---

# 83. SERVICE ROLE RULES

The Supabase service-role key is highly privileged.

Non-negotiable:

> NEVER place the service-role key in the React frontend.

Not in:

```text
.env for Vite public variables
source code
GitHub
browser storage
HTML
client network requests
```

Only trusted server-side environments may use it.

---

# 84. SECRETS MANAGEMENT

Secrets may include:

- service-role credentials;
- webhook secrets;
- push notification private keys;
- external API credentials.

Store them in secure deployment environment variables/secrets management.

Never commit secrets.

---

# 85. ENVIRONMENT VARIABLES

Frontend-exposed variables should contain only values that are safe to expose.

For example, public Supabase project URL and intended public client key can be exposed according to Supabase's model, but privileged service-role credentials cannot.

Use separate environment files:

```text
.env.local
.env.staging
.env.production
```

with appropriate secret handling.

---

# 86. FRONTEND SECURITY

The frontend should:

- never contain service-role credentials;
- never decide authorization alone;
- never expose hidden admin secrets;
- never trust URL parameters;
- never trust local storage role values;
- never calculate official scores as authoritative;
- never construct unsafe HTML;
- never expose private storage paths unnecessarily.

---

# 87. ADMIN PANEL SECURITY

The admin panel should use:

```text
authentication
+
authorization
+
RLS
+
server-side checks
```

not merely:

```text
if (isAdmin) showAdminPanel
```

The UI can hide unauthorized features for usability, but backend protection is mandatory.

---

# 88. SECURE DATA FETCHING

Avoid fetching unnecessary sensitive data.

Bad:

```text
select all columns from profiles
```

Better:

```text
select fields needed for this screen
```

For student lists, administrators may need:

```text
name
course
branch
email
contact
status
created_at
```

But do not expose:

```text
authentication internals
private tokens
unnecessary metadata
```

---

# 89. PAGINATION

Admin lists must be paginated.

Examples:

- students;
- resources;
- messages;
- quiz attempts;
- audit logs.

Do not load thousands of records into the browser by default.

---

# 90. FILTERING

Filtering should be validated.

Examples:

```text
course
branch
semester
status
date range
```

Never let arbitrary database column names from users become dynamic SQL without an allowlist.

---

# 91. SORTING

Sorting fields should be allowlisted.

Allowed:

```text
created_at
name
status
updated_at
```

Not:

```text
any string from request
```

converted directly into SQL.

---

# 92. SEARCH SECURITY

Search should:

- use safe query methods;
- limit result size;
- avoid leaking sensitive fields;
- respect RLS;
- rate-limit expensive searches.

Search results must never bypass authorization.

---

# 93. CACHING SECURITY

Do not cache private student responses globally.

A response containing:

```text
student profile
private messages
quiz attempts
```

must never accidentally be served to another student through shared caching.

Cache keys must include authorization context when private caching is used.

---

# 94. OFFLINE/PWA SECURITY

BEU BABA is intended as a PWA.

Offline functionality should be selective.

Safe offline candidates:

- public syllabus;
- published PYQ metadata;
- public course metadata;
- static UI assets;
- non-sensitive academic information.

Avoid storing sensitive private data offline unless there is a strong reason.

---

# 95. LOCAL STORAGE RULES

Do not store:

```text
passwords
service-role keys
sensitive admin data
private message histories
long-lived secrets
```

Prefer short-lived UI preferences:

```text
theme preference
last selected semester
non-sensitive onboarding state
```

---

# 96. INDEXEDDB RULES

If IndexedDB is used for offline caching:

- cache only necessary data;
- define expiration;
- clear user-specific data on sign-out;
- namespace data by user;
- never assume offline data is authoritative;
- revalidate on reconnect.

---

# 97. SENSITIVE DATA HANDLING

Sensitive student information should be minimized.

Examples:

```text
contact number
email
private messages
profile details
```

Only collect fields that genuinely support the product.

---

# 98. PRIVACY ARCHITECTURE

The privacy model should follow:

```text
collect minimum
store securely
use for stated purpose
restrict access
retain only when needed
delete when appropriate
```

Do not turn BEU BABA into a general-purpose data collection system.

---

# 99. STUDENT DATA PROTECTION

Student data should be partitioned logically.

Example:

```text
public academic data
student-owned data
admin-only data
system-only data
```

This classification should influence:

- RLS;
- API responses;
- storage;
- logs;
- analytics;
- caching.

---

# 100. DATA MINIMIZATION

For every new field ask:

1. Why do we need it?
2. Who needs access?
3. How long should we retain it?
4. What happens if it leaks?
5. Can the feature work without it?

If a field has no strong purpose, do not collect it.

---

# 101. DATA RETENTION

Define retention categories.

For example:

```text
active profile → retained while account exists
support messages → retained according to support policy
audit logs → retained for security/accountability
temporary upload → deleted if abandoned
rejected resources → retained or purged according to policy
push subscriptions → removed when invalid
```

Exact periods should be decided operationally and documented.

---

# 102. AUDIT LOGGING

Important actions should generate audit records.

Examples:

```text
ADMIN_LOGIN
ROLE_CHANGED
RESOURCE_APPROVED
RESOURCE_REJECTED
RESOURCE_PUBLISHED
SYLLABUS_UPDATED
CALENDAR_UPDATED
PYQ_PUBLISHED
QUIZ_PUBLISHED
MESSAGE_REPLIED
NOTIFICATION_SENT
STUDENT_RESTRICTED
STUDENT_DEACTIVATED
```

---

# 103. SECURITY EVENTS

Security-relevant events include:

- repeated failed logins;
- suspicious upload volume;
- repeated forbidden requests;
- admin permission changes;
- unexpected privilege errors;
- unusual notification volume.

Monitoring should prioritize actionable signals.

---

# 104. ADMINISTRATIVE ACTIONS

Every sensitive admin action should record:

```text
who
what
when
which entity
what changed
```

For example:

```text
actor = admin UUID
action = SYLLABUS_UPDATE
entity = syllabus UUID
timestamp = ...
```

---

# 105. CONTENT CHANGE TRACKING

For high-value academic content, maintain version information.

A syllabus should not become impossible to reconstruct after an accidental edit.

Use:

```text
version = 1
version = 2
version = 3
```

or a revision table.

---

# 106. VERSIONING

Versioned entities may include:

- syllabus;
- academic calendar;
- course descriptions;
- important announcements;
- PYQ metadata;
- official resources.

Versioning should support rollback.

---

# 107. APPROVAL WORKFLOW

Recommended:

```text
Draft
 ↓
Review
 ↓
Approved
 ↓
Published
 ↓
Archived
```

Not:

```text
Edit database → instantly public
```

for high-impact academic content.

---

# 108. DRAFT / REVIEW / PUBLISH MODEL

Example:

```text
content_versions
├── id
├── content_id
├── version_number
├── content_snapshot
├── status
├── created_by
├── reviewed_by
├── published_at
└── created_at
```

This provides a safety net.

---

# 109. ROLLBACK

If an administrator accidentally changes:

```text
exam date
syllabus unit
subject mapping
PYQ metadata
```

the system should support restoration.

Rollback should itself be audited.

---

# 110. BACKUP AND RECOVERY

Production database backups must be configured according to the selected Supabase plan and operational requirements.

Do not assume:

> Database provider = complete backup strategy.

Maintain documented recovery procedures.

Critical information includes:

- database;
- storage;
- configuration;
- migrations;
- environment configuration;
- source code.

---

# 111. MIGRATION SECURITY

Every database migration should be:

- version-controlled;
- reviewed;
- reproducible;
- tested on staging;
- reversible where practical.

Never make manual production database edits the normal workflow.

---

# 112. IMPORTING EXISTING DATA

If data is extracted from another app/system:

```text
source
 ↓
raw import
 ↓
validation
 ↓
normalization
 ↓
deduplication
 ↓
mapping
 ↓
staging
 ↓
verification
 ↓
production import
```

Do not directly insert unknown JSON into production tables.

---

# 113. DATA INTEGRITY CONSTRAINTS

Use database constraints.

Examples:

```text
email unique where appropriate
foreign keys valid
semester within valid range
status limited to known values
version positive
score within valid range
```

Database constraints provide a second line of defense.

---

# 114. REFERENTIAL INTEGRITY

Example:

```text
course
  ↓
branch
  ↓
semester
  ↓
subject
  ↓
resource
```

Deleting a parent should not accidentally destroy unrelated data.

Choose:

```text
RESTRICT
CASCADE
SET NULL
```

deliberately for every relationship.

---

# 115. CONCURRENCY

Two administrators may edit the same syllabus.

Potential problem:

```text
Admin A opens version 4
Admin B opens version 4

A saves version 5
B saves old data over version 5
```

Use optimistic concurrency/version checking where needed.

---

# 116. RACE CONDITIONS

Sensitive operations must be safe when executed twice simultaneously.

Example:

```text
two quiz submissions
two resource approvals
two publication requests
two notification sends
```

Use transactions, unique constraints, idempotency, or state checks.

---

# 117. TRANSACTIONS

Operations that must remain atomic should be transactional.

Example:

```text
publish resource
+
create audit record
```

should not leave the system in an inconsistent state if one operation fails.

---

# 118. IDEMPOTENCY

For operations that may be retried:

```text
notification send
quiz submit
resource processing
payment-like future operation
```

consider idempotency keys.

The same request should not accidentally create duplicate records.

---

# 119. DUPLICATE PREVENTION

Resources can be duplicated accidentally.

Use combinations such as:

```text
owner
title
subject
file hash
```

to detect likely duplicates.

Do not rely on title alone.

---

# 120. OPTIMISTIC UI SECURITY

Optimistic UI is allowed for visual responsiveness.

Example:

```text
Like button
```

But the backend remains authoritative.

For critical actions:

```text
resource approval
quiz submission
account deletion
```

do not permanently display success until server confirmation.

---

# 121. SERVER-AUTHORITATIVE STATE

The following must be server authoritative:

```text
account role
resource status
published state
quiz score
quiz completion
notification targeting
message ownership
content access
```

---

# 122. QUIZ ANTI-CHEAT

No client-side system can make an online quiz completely cheat-proof.

However, BEU BABA can make cheating harder and preserve score integrity.

Controls:

- server-authoritative answers;
- no answer-key exposure;
- attempt timestamps;
- attempt state;
- server-side scoring;
- optional time limits;
- submission locking;
- duplicate submission prevention.

Do not claim:

> 100% cheat-proof.

---

# 123. RESOURCE ABUSE CONTROLS

Potential quotas:

```text
maximum file size
maximum uploads/day
maximum storage/user
maximum pending submissions
```

Exact values should be configurable.

Do not hard-code values throughout the frontend.

---

# 124. MESSAGING ABUSE CONTROLS

Developer messaging should not become an unlimited spam channel.

Controls:

- message length limit;
- attachment limit if attachments are supported;
- rate limit;
- cooldown after repeated spam;
- report/block capability for administrators if needed.

---

# 125. NOTIFICATION ABUSE CONTROLS

Only authorized administrators should broadcast.

Require confirmation for broad sends.

Example admin UX:

```text
Audience:
All students

Estimated recipients:
2,846

Message:
...

[Cancel] [Review] [Send]
```

For very large sends, consider a second confirmation.

---

# 126. ADMIN ABUSE CONTROLS

Administrators are powerful users.

Reduce accidental harm with:

- confirmation;
- permission separation;
- audit logs;
- soft deletion;
- rollback;
- change previews;
- restricted destructive operations.

---

# 127. MONITORING

Monitor:

```text
database errors
authentication failures
storage failures
API latency
function failures
upload errors
quiz submission errors
notification failures
```

Do not log sensitive content indiscriminately.

---

# 128. LOGGING

Good logs:

```text
request ID
operation
status
duration
safe error code
actor type
```

Bad logs:

```text
password
access token
private message body
signed storage URL
full sensitive profile
```

---

# 129. OBSERVABILITY

Production observability should answer:

1. Is the app available?
2. Are authentication operations working?
3. Are database requests failing?
4. Are uploads failing?
5. Are quizzes submitting?
6. Are notifications working?
7. Is latency increasing?
8. Is abuse increasing?

---

# 130. SECURITY ALERTS

Alerts should focus on high-value signals.

Examples:

```text
unexpected admin role changes
large upload spike
abnormal login failures
repeated authorization failures
unexpected database errors
```

Avoid alerting on every ordinary user error.

---

# 131. INCIDENT RESPONSE

A documented incident process should exist:

```text
Detect
 ↓
Contain
 ↓
Investigate
 ↓
Remediate
 ↓
Recover
 ↓
Review
```

---

# 132. COMPROMISED ACCOUNT RESPONSE

If a student account is compromised:

1. revoke/expire sessions where possible;
2. reset credentials;
3. review suspicious activity;
4. inspect uploads/messages if needed;
5. restore account access safely;
6. document incident.

---

# 133. COMPROMISED ADMIN RESPONSE

This is higher severity.

Immediately consider:

- revoke admin sessions;
- disable compromised account;
- review role changes;
- review content modifications;
- inspect audit logs;
- rotate relevant secrets if necessary;
- restore changed data.

---

# 134. STORAGE LEAK RESPONSE

If private files become publicly accessible:

```text
identify bucket/path
 ↓
disable public exposure
 ↓
invalidate/rotate access where possible
 ↓
review logs
 ↓
identify affected files
 ↓
restore correct policies
 ↓
document incident
```

---

# 135. DATABASE LEAK RESPONSE

If unauthorized data exposure occurs:

- stop exposure;
- identify affected tables;
- review RLS;
- review credentials;
- rotate secrets where applicable;
- inspect audit/logging;
- patch policies;
- assess affected users;
- document incident.

---

# 136. DEPENDENCY SECURITY

React/Vite projects rely on many packages.

Rules:

- keep dependencies current;
- remove unused packages;
- review major dependency updates;
- scan vulnerabilities;
- avoid abandoned libraries for security-critical operations;
- pin/lock versions through the package lock.

---

# 137. THIRD-PARTY INTEGRATION SECURITY

External services must be isolated.

Examples:

```text
YouTube
Google Drive
push provider
analytics
future payment provider
```

Do not expose unnecessary credentials.

---

# 138. YOUTUBE INTEGRATION SECURITY

If course videos are hosted on YouTube:

- store video IDs/metadata;
- do not expose private API keys unnecessarily;
- do not rely on hiding the URL as security;
- understand that client-side embedded video cannot be made absolutely impossible to capture.

Access control should apply to the application layer where feasible.

---

# 139. GOOGLE DRIVE INTEGRATION SECURITY

If notes/PDFs are hosted on Google Drive:

- store metadata in BEU BABA;
- keep private resources protected;
- do not expose privileged Google credentials;
- avoid putting sensitive service-account credentials into frontend code.

---

# 140. EXTERNAL LINKS

All external links should be validated/configured.

Avoid accepting arbitrary links from users and immediately presenting them as trusted official resources.

For administrator-managed links, provide a controlled editor.

---

# 141. CONTENT SECURITY POLICY

A production CSP should be designed around actual application requirements.

Do not blindly copy an internet CSP.

Start from:

```text
default-src
script-src
style-src
img-src
font-src
connect-src
media-src
frame-src
```

Then explicitly allow trusted services.

Because BEU BABA may use YouTube, Supabase, and external assets, CSP must be tested carefully.

---

# 142. SECURITY HEADERS

Consider appropriate headers such as:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

Some older headers are obsolete; use current browser guidance rather than blindly adding legacy headers.

---

# 143. CORS

CORS should allow only intended origins where backend endpoints require it.

Do not use:

```text
Access-Control-Allow-Origin: *
```

for sensitive authenticated APIs unless there is a deliberate reason.

---

# 144. DOMAIN CONFIGURATION

Production should use HTTPS.

Recommended conceptual environments:

```text
development
staging
production
```

Do not use production secrets in local development.

---

# 145. PRODUCTION DEPLOYMENT

Production deployment should verify:

- environment variables;
- domain;
- HTTPS;
- Supabase configuration;
- redirect URLs;
- authentication URLs;
- storage policies;
- RLS;
- CSP;
- CORS;
- PWA configuration;
- error monitoring.

---

# 146. DEVELOPMENT ENVIRONMENT

Development should use test data.

Never use real student personal information unnecessarily.

Seed realistic fake data:

```text
Student A
Student B
Student C
```

with fake contact details.

---

# 147. STAGING ENVIRONMENT

Staging should mirror production architecture as closely as practical.

Use it for:

- migration tests;
- RLS tests;
- admin workflow tests;
- upload tests;
- quiz tests;
- notification tests.

---

# 148. PRODUCTION ENVIRONMENT

Production should be treated as a separate security boundary.

Only reviewed migrations and code should reach it.

---

# 149. CI/CD SECURITY

CI/CD must not print secrets.

Protect:

- deployment credentials;
- database credentials;
- service-role keys;
- signing keys.

Use repository secret storage.

---

# 150. CODE REVIEW RULES

Review every change touching:

```text
auth
RLS
storage
admin
roles
quiz scoring
file upload
notifications
database migrations
```

A visual-only review is insufficient.

---

# 151. SECRET SCANNING

Use secret scanning where available.

Check for:

```text
service-role keys
private API keys
tokens
passwords
webhook secrets
private signing keys
```

---

# 152. DEPENDENCY SCANNING

Run dependency vulnerability checks regularly.

Prioritize:

```text
critical
high
```

issues first, then assess medium/low issues according to exposure.

---

# 153. DATABASE MIGRATION REVIEW

Migration review must ask:

1. Does this change expose data?
2. Does it preserve RLS?
3. Are existing users affected?
4. Are foreign keys safe?
5. Are indexes required?
6. Can rollback occur?
7. Does storage policy need updating?
8. Does application code expect the old schema?

---

# 154. RLS TESTING

Test as:

```text
anonymous
student A
student B
moderator
admin
```

For each role test:

```text
SELECT
INSERT
UPDATE
DELETE
```

Expected results should be explicitly documented.

---

# 155. API TESTING

Test:

```text
valid request
missing fields
wrong types
wrong UUID
unauthorized request
forbidden request
duplicate request
oversized request
malformed request
```

---

# 156. AUTHENTICATION TESTING

Test:

- registration;
- verification;
- login;
- logout;
- password reset;
- expired session;
- invalid credentials;
- repeated failures;
- account restriction.

---

# 157. AUTHORIZATION TESTING

Critical tests:

```text
Student A requests Student B profile
→ DENY

Student A reads Student B message
→ DENY

Student A approves resource
→ DENY

Student changes role
→ DENY

Student reads admin audit log
→ DENY
```

---

# 158. STORAGE TESTING

Test:

```text
Student A uploads file
→ allowed

Student B accesses A's private file
→ denied

Student A accesses own private file
→ allowed

Unapproved resource public URL
→ unavailable

Approved resource
→ available according to policy
```

---

# 159. PENETRATION-TEST CHECKLIST

At minimum test:

- auth bypass;
- role escalation;
- IDOR;
- RLS bypass;
- storage path manipulation;
- XSS;
- SQL injection;
- upload abuse;
- rate-limit bypass;
- open redirects;
- sensitive data exposure;
- admin endpoint exposure.

---

# 160. THREAT MODEL

Major BEU BABA assets:

```text
student accounts
student contact information
student resources
quiz integrity
official academic data
private support messages
admin privileges
storage
database
developer configuration
```

Threat actors:

```text
ordinary curious student
malicious student
automated bot
compromised account
compromised admin
external attacker
```

---

# 161. ATTACK SCENARIOS

## Scenario A — Change own role

Attacker modifies request:

```json
{
  "role": "admin"
}
```

Defense:

```text
RLS
+
trusted role table
+
no client role authority
```

---

## Scenario B — Read another student's message

Attacker changes:

```text
conversation_id
```

Defense:

```text
RLS ownership check
```

---

## Scenario C — Publish own upload

Attacker changes:

```text
status = published
```

Defense:

```text
student INSERT/UPDATE policy excludes status change
```

---

## Scenario D — Fake quiz score

Attacker sends:

```text
score = 100
```

Defense:

```text
server-authoritative scoring
```

---

# 162. SECURITY CONTROLS

Security should be layered:

```text
HTTPS
 ↓
Authentication
 ↓
Authorization
 ↓
RLS
 ↓
Input validation
 ↓
Database constraints
 ↓
Storage policies
 ↓
Audit
 ↓
Monitoring
```

No single mechanism should be considered sufficient.

---

# 163. FAILURE MODES

If the backend fails:

Do not show:

```text
Success
```

when the operation was not confirmed.

Use:

```text
Something went wrong.
Please try again.
```

For critical operations, provide retry-safe behavior.

---

# 164. RECOVERY PROCEDURES

Every critical feature should answer:

> What happens if the request succeeds on the server but the client loses connection before receiving the response?

This is why idempotency and server state matter.

---

# 165. PERFORMANCE / SECURITY TRADEOFFS

Security should not destroy usability.

Example:

Instead of:

```text
ask for password on every screen
```

use:

```text
normal authenticated session
+
step-up authentication for highly sensitive operations if required
```

---

# 166. SECURE UX

Security errors should be understandable.

Bad:

```text
RLS policy violation: SQLSTATE 42501
```

Good:

```text
You don't have permission to perform this action.
```

Technical details belong in internal logs, not normal student UI.

---

# 167. SECURITY MESSAGES

Recommended messages:

### Unauthorized

> Please sign in to continue.

### Forbidden

> You don't have permission to perform this action.

### Expired session

> Your session has expired. Please sign in again.

### Upload failure

> We couldn't upload this file. Please check the file type and size and try again.

---

# 168. ADMIN SAFETY UX

For destructive operations:

```text
Delete student?
This action may affect profile access and stored data.

[Cancel]
[Continue]
```

For high-impact publication:

```text
Publish syllabus?
This will make the selected version visible to students.

[Cancel]
[Publish]
```

---

# 169. DEVELOPER SUPPORT WORKFLOW

The developer-message feature should have:

```text
conversation
message
status
timestamps
```

Possible conversation status:

```text
open
waiting_for_student
resolved
closed
```

The student sees only their conversation.

The developer/admin sees authorized conversations.

---

# 170. DATA EXPORT

If BEU BABA eventually supports student data export, export only the user's own data.

Potential export:

```text
profile
quiz history
own resources
own support messages
```

Do not export internal security metadata.

---

# 171. ACCOUNT DELETION

Account deletion should be deliberate.

Workflow:

```text
settings
 ↓
delete account
 ↓
explain consequences
 ↓
confirm
 ↓
reauthenticate if required
 ↓
process deletion/deactivation
 ↓
sign out
```

Because academic history and moderation records may have dependencies, deletion architecture must be decided carefully.

---

# 172. PRIVACY REQUESTS

If users request:

- correction;
- deletion;
- access;
- account information;

there should be a documented process.

Do not promise legal rights or deadlines without establishing the applicable legal requirements.

---

# 173. COMPLIANCE-ORIENTED DESIGN

BEU BABA should be built with privacy and security principles from the beginning.

Important considerations include:

- purpose limitation;
- data minimization;
- access control;
- retention;
- transparency;
- deletion;
- auditability.

The exact legal/compliance requirements depend on deployment context and should be reviewed separately.

---

# 174. PRODUCTION CHECKLIST

Before launch:

## Authentication

- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Password recovery works
- [ ] Verification flow works if enabled
- [ ] Sessions handled safely

## Authorization

- [ ] Student cannot access another student's data
- [ ] Student cannot become admin
- [ ] Admin permissions are enforced server-side
- [ ] Moderation permissions are scoped

## Database

- [ ] RLS enabled
- [ ] Policies tested
- [ ] Foreign keys validated
- [ ] Constraints present
- [ ] Indexes reviewed

## Storage

- [ ] Private buckets protected
- [ ] Upload validation active
- [ ] File size limits active
- [ ] Signed URLs used where required
- [ ] Ownership policies tested

## Quiz

- [ ] Answer keys hidden
- [ ] Score server-authoritative
- [ ] Attempts protected
- [ ] Duplicate submission controlled

## Resources

- [ ] Uploads private by default
- [ ] Moderation required
- [ ] Publication restricted
- [ ] Rejection supported

## Messaging

- [ ] Student sees own messages only
- [ ] Admin access controlled
- [ ] Spam protection exists

## Admin

- [ ] Sensitive actions audited
- [ ] Destructive actions confirmed
- [ ] Rollback/versioning implemented where required

---

# 175. DEFINITION OF DONE

A feature is NOT complete when:

```text
button works
```

A feature is complete when:

```text
UI works
+
API works
+
validation works
+
authorization works
+
RLS works
+
error handling works
+
loading state works
+
empty state works
+
security tests pass
+
audit behavior is defined where required
+
production behavior is understood
```

---

# 176. NON-NEGOTIABLE RULES

These rules must never be violated during BEU BABA development.

## Rule 1

Never expose service-role credentials to the frontend.

## Rule 2

Never trust frontend role values.

## Rule 3

Never trust client-provided user IDs for ownership.

## Rule 4

Never allow students to modify approval state.

## Rule 5

Never expose quiz answer keys before submission.

## Rule 6

Never calculate official quiz scores solely on the client.

## Rule 7

Never make private student files public by default.

## Rule 8

Never allow one student to read another student's private messages.

## Rule 9

Never use hidden UI elements as the only security control.

## Rule 10

Never disable RLS merely to solve a development problem.

## Rule 11

Never store passwords in application tables.

## Rule 12

Never log secrets.

## Rule 13

Never assume an external URL is safe merely because an admin entered it.

## Rule 14

Never allow unrestricted arbitrary SQL from client input.

## Rule 15

Never ship production without testing authorization boundaries.

## Rule 16

Never make destructive admin operations irreversible unless absolutely necessary.

## Rule 17

Never expose more student information than the current screen requires.

## Rule 18

Never treat local storage as a trusted source of identity or permissions.

## Rule 19

Never allow a client to claim that an academic resource is official.

## Rule 20

Never let a security-sensitive operation depend only on React state.

---

# 177. FINAL ARCHITECTURE SUMMARY

The BEU BABA backend should be understood as a security-first system:

```text
                         BEU BABA
                            │
                  ┌─────────▼─────────┐
                  │ React PWA Client  │
                  └─────────┬─────────┘
                            │
                      HTTPS / Auth
                            │
                  ┌─────────▼─────────┐
                  │ Application Layer │
                  │ Validation / API  │
                  └─────────┬─────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
      ┌───────▼────────┐         ┌────────▼───────┐
      │ PostgreSQL     │         │ Storage         │
      │ + RLS          │         │ + Policies      │
      └───────┬────────┘         └────────┬────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                   Trusted Operations
                            │
                ┌───────────▼───────────┐
                │ Admin / Moderation    │
                │ Audit / Publishing    │
                └───────────────────────┘
```

The most important architectural idea is simple:

> BEU BABA must never depend on the browser to protect the application.

The browser displays the interface.

The database protects ownership.

RLS protects rows.

Storage policies protect files.

Authentication protects identity.

Authorization protects privileges.

Server-side functions protect sensitive operations.

Audit logs provide accountability.

Validation protects data integrity.

Versioning protects official content.

Monitoring protects operations.

Together these layers create the foundation on which the premium BEU BABA interface can safely operate.

The visual experience may be highly polished, fluid, glass-based, animated, and Apple-inspired, but the underlying architecture must remain strict, predictable, boring, and secure.

That is the correct engineering tradeoff:

```text
Premium UI
      +
Simple UX
      +
Strong backend
      +
Strict RLS
      +
Secure storage
      +
Server-authoritative state
      +
Auditable administration
      =
Production-grade BEU BABA
```

---

# APPENDIX A — RECOMMENDED CORE TABLE GROUPS

```text
profiles
roles
permissions
user_roles
courses
branches
semesters
subjects
syllabus
syllabus_versions
academic_calendar
calendar_versions
pyqs
resource_submissions
resources
resource_versions
quizzes
quiz_questions
quiz_attempts
quiz_answers
support_conversations
support_messages
notifications
push_subscriptions
developer_profile
app_settings
audit_logs
```

The exact schema should be finalized alongside the database specification and migrations.

---

# APPENDIX B — CORE SECURITY MATRIX

| Data / Action | Student | Moderator | Admin |
|---|---|---|---|
| Own profile | Read/limited update | Limited | Manage |
| Other student profile | No | Limited | Authorized |
| Published syllabus | Read | Read | Manage |
| Draft syllabus | No | According to permission | Manage |
| Published PYQ | Read | Read | Manage |
| Resource upload | Create own | Review | Review/manage |
| Approve resource | No | If permitted | Yes |
| Publish resource | No | If permitted | Yes |
| Own quiz attempt | Read/create/submit | No | Authorized |
| Other quiz attempts | No | No/limited | Authorized |
| Own support messages | Read/create | Assigned if permitted | Authorized |
| Other support messages | No | Assigned | Authorized |
| Global notifications | Read | Send if permitted | Send |
| Audit logs | No | Limited | Authorized |
| Roles | No | No | Authorized |

---

# APPENDIX C — SECURE REQUEST LIFECYCLE

Every sensitive request should conceptually follow:

```text
REQUEST
  ↓
Identify caller
  ↓
Authenticate
  ↓
Validate request structure
  ↓
Authorize action
  ↓
Check ownership
  ↓
Check business rules
  ↓
Execute transaction
  ↓
Write audit event if required
  ↓
Return minimum necessary response
```

This pattern should be used repeatedly throughout BEU BABA.

---

# APPENDIX D — STUDENT RESOURCE EXAMPLE

```text
Student uploads PDF
        ↓
Authentication confirmed
        ↓
File type/size validated
        ↓
Storage upload to private path
        ↓
Submission record created
        ↓
status = pending
        ↓
Student sees "Under Review"
        ↓
Moderator/Admin reviews
        ↓
Approve
        ↓
resource becomes publishable
        ↓
Published resource appears
        ↓
Student receives notification
```

At no stage should the student be able to skip:

```text
pending → review
```

by changing frontend state.

---

# APPENDIX E — SYLLABUS UPDATE EXAMPLE

```text
Admin opens syllabus
        ↓
Current version = 7
        ↓
Edit
        ↓
Create version 8
        ↓
Review changes
        ↓
Publish version 8
        ↓
Version 7 archived
        ↓
Audit event recorded
        ↓
Students receive updated syllabus
```

This architecture makes future syllabus changes safe and traceable.

---

# APPENDIX F — DEVELOPER MESSAGE EXAMPLE

```text
Student A
   ↓
Conversation A
   ↓
Message 1
   ↓
Developer reply
   ↓
Message 2
```

Student B:

```text
cannot query Conversation A
```

Even if Student B manually changes:

```text
conversation_id
```

the database must return:

```text
permission denied / no accessible row
```

This is precisely the type of protection RLS is intended to provide.

---

# APPENDIX G — FINAL ENGINEERING STANDARD

Before adding a new feature to BEU BABA, the developer must answer:

1. What data does this feature create?
2. Who owns that data?
3. Who can read it?
4. Who can create it?
5. Who can update it?
6. Who can delete it?
7. Does it require authentication?
8. Does it require a role?
9. Does it require a permission?
10. Does it require RLS?
11. Does it require storage policy?
12. Can the client manipulate the request?
13. What happens if the request is repeated?
14. What happens if the network fails?
15. What happens if two admins perform it simultaneously?
16. What happens if the user is logged out?
17. What happens if the user's account is restricted?
18. What happens if the referenced entity does not exist?
19. What happens if the uploaded file is malicious?
20. What should be logged?
21. What should never be logged?
22. Can the operation be rolled back?
23. Does the feature expose private student data?
24. Does the feature require rate limiting?
25. What are the abuse scenarios?
26. What are the RLS policies?
27. What are the database constraints?
28. What are the production tests?
29. What happens during an outage?
30. What is the definition of done?

If these questions cannot be answered, the feature is not architecturally complete.

---

# END OF DOCUMENT

**BEU BABA backend security principle:**

> Build the interface to feel effortless. Build the backend so that trust is never assumed.
