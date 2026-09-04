# BEU BABA — ADVANCED AUTHENTICATION, USER IDENTITY, DATABASE SECURITY & ACCESS-CONTROL SYSTEM
## File 21 — Production-Grade Identity, Registration, Sessions, Roles, Privacy, and Data Protection Specification

> **Document purpose:** This document is the authoritative engineering and UX specification for authentication, registration, student identity, profile management, sessions, authorization, database security, privacy boundaries, role separation, and account lifecycle in the BEU BABA application.
>
> **Implementation target:** React + Vite + TypeScript + Tailwind CSS + Framer Motion + Supabase Auth + Supabase PostgreSQL + Supabase Storage, deployed as a responsive PWA.
>
> **Design direction:** premium light-mode Apple-inspired glassmorphism. The application must feel transparent, calm, refined, highly legible, and native-like. It must NOT look like an AI dashboard, gaming UI, RGB interface, crypto product, cyberpunk interface, or dark neon application.
>
> **Strict rule:** authentication is not merely a login screen. Identity, authorization, data ownership, privacy, session handling, database policies, profile editing, upload ownership, admin verification, developer messaging, and logout behavior must all be designed as one coherent system.

---

# 1. PRODUCT PRINCIPLE

BEU BABA is intended to become a single student utility and academic companion rather than a collection of disconnected pages.

The identity system therefore has to support:

1. Student registration.
2. Student login.
3. Secure session persistence.
4. Student profile.
5. Course and branch information.
6. Contact information.
7. Profile image.
8. Automatically selected generated character based on gender.
9. User-created quiz information.
10. Uploaded resources.
11. Favorites/bookmarks.
12. Course progress.
13. Download history where appropriate.
14. Developer messages.
15. Notification preferences.
16. Privacy controls.
17. Account deletion.
18. Administrative review.
19. Admin-only operations.
20. Developer-only operations.
21. Strict ownership boundaries.
22. Future scalability.

The most important architectural principle is:

> **The client can request an operation, but the database and server-side authorization must decide whether that operation is allowed.**

Never trust hidden buttons, disabled buttons, frontend route guards, localStorage flags, or JavaScript variables as security boundaries.

---

# 2. TECHNOLOGY BASELINE

Recommended stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- PWA service worker
- Zod or equivalent runtime validation
- React Hook Form or equivalent form-state system

The frontend should communicate with Supabase through the official client library.

Authentication should use Supabase Auth rather than a custom password system.

Do NOT:

- store plaintext passwords;
- create a custom password table;
- put service-role keys in frontend code;
- use the anon key as a secret;
- trust role values supplied by the browser;
- expose another student's private information;
- put administrator privileges in localStorage;
- decide authorization solely with React conditionals.

---

# 3. IDENTITY MODEL

BEU BABA should separate the authentication identity from the application profile.

Supabase Auth owns the authentication identity.

The application database owns the student profile.

Conceptually:

```text
auth.users
   |
   | one-to-one
   v
profiles
   |
   +---- student preferences
   +---- course progress
   +---- bookmarks
   +---- quiz attempts
   +---- uploaded resources
   +---- developer messages
   +---- notification settings
```

The user's immutable internal identity should be the authenticated UUID.

Never use email address as the primary ownership key.

Why?

Emails can change.

UUID ownership remains stable.

Every user-owned record should contain a `user_id` or equivalent foreign key referencing the authenticated user.

---

# 4. USER ROLES

Minimum supported roles:

```text
student
admin
developer
```

Potential future roles:

```text
moderator
content_editor
teacher
reviewer
support_agent
```

Do not create all future roles immediately unless required.

The initial product should remain simple.

### Student

A student can:

- manage their own profile;
- view public academic content;
- bookmark content;
- maintain their own progress;
- attempt quizzes;
- create personal quiz cards;
- upload resources for review;
- send private messages to developer/support;
- view replies to their own messages;
- manage permitted preferences;
- delete their own account.

### Admin

An admin can:

- review resources;
- approve/reject submitted resources;
- manage academic content;
- manage course metadata;
- manage syllabus entries;
- manage yearly calendar information;
- view permitted student administration information;
- handle moderation;
- manage application content.

### Developer

A developer can:

- access developer communication;
- reply to students;
- manage technical issue reports;
- maintain technical configuration;
- review application health;
- perform privileged maintenance.

A developer should not automatically have unrestricted access to every private field unless the business requirement explicitly requires it.

---

# 5. ROLE SECURITY

The frontend should never decide:

```ts
if (user.role === "admin") {
   // security
}
```

This is only UI logic.

Actual database authorization must use PostgreSQL Row Level Security policies and trusted server-side mechanisms.

The frontend role check exists only to improve UX.

Example:

```text
Frontend:
"Should I display the Admin button?"

Database:
"Is this authenticated user actually allowed to perform this operation?"
```

These are separate questions.

---

# 6. REGISTRATION FLOW

The registration process should be intentionally detailed because BEU BABA wants meaningful student records.

Required information may include:

- Full name
- Email
- Mobile/contact number
- Course/program
- Branch
- Academic year or semester
- Gender
- Password
- Password confirmation
- Terms/privacy acceptance

Optional information:

- Profile image
- Generated character
- College/institute
- Roll number if genuinely required
- Admission year

Avoid collecting unnecessary personal information.

Every field should have a clear product purpose.

---

# 7. REGISTRATION UX

The registration experience should not be a giant intimidating form.

Use a progressive multi-step glass interface.

Suggested structure:

### Step 1 — Identity

Fields:

- Full name
- Email
- Contact number

### Step 2 — Academic profile

Fields:

- Course
- Branch
- Semester/year

### Step 3 — Personalization

Fields:

- Gender
- Profile image
- Generated character

### Step 4 — Security

Fields:

- Password
- Confirm password

### Step 5 — Confirmation

Show a concise review card.

The user can verify their information before creating the account.

---

# 8. REGISTRATION GLASS UI

The screen should use a very light background.

Suggested visual layers:

```text
Base background
↓
very subtle blurred ambient shapes
↓
large translucent glass panel
↓
soft white translucent surface
↓
thin low-opacity border
↓
subtle shadow
↓
clear typography
```

The glass must remain transparent.

Do not make the card opaque white.

Avoid:

- black backgrounds;
- heavy gradients;
- neon outlines;
- glowing borders;
- RGB effects;
- excessive floating 3D objects;
- animated particles.

The glass should feel like polished translucent material.

---

# 9. PASSWORD DESIGN

Password requirements should be reasonable.

Recommended:

- minimum 8 characters;
- preferably encourage 10+;
- reject obviously weak passwords;
- show strength feedback;
- allow password visibility toggle.

Do not force unnecessarily complex rules such as:

```text
1 uppercase
1 lowercase
1 symbol
1 number
1 ancient rune
```

unless the authentication provider specifically requires them.

The purpose is secure usability.

---

# 10. PASSWORD FIELD INTERACTION

Password visibility icon:

- default hidden;
- tap/click reveals;
- second tap hides.

Animation:

- icon transition: approximately 120–180ms;
- no dramatic movement;
- input container should not jump.

Focus:

- subtle glass elevation;
- thin border emphasis;
- soft shadow;
- no neon glow.

Error:

- concise message below field;
- do not shake the entire page.

A very small horizontal movement can be used for invalid submission, but should respect reduced-motion settings.

---

# 11. EMAIL VALIDATION

Client-side validation should provide immediate feedback.

But client validation is not security.

Server-side/auth provider validation must still apply.

Examples:

```text
name@example.com
```

Valid.

```text
name@
```

Invalid.

Avoid aggressive assumptions about valid email formats.

Do not block legitimate international email addresses unnecessarily.

---

# 12. CONTACT NUMBER

Because BEU BABA is intended for students in India, the UI may support Indian phone numbers conveniently.

However, the database should store normalized values.

Example:

```text
+91XXXXXXXXXX
```

Do not store several inconsistent representations.

The UI can accept:

```text
9876543210
+91 9876543210
+91-9876543210
```

and normalize internally.

Do not reveal phone numbers publicly.

---

# 13. PROFILE IMAGE UPLOAD

At signup, a student can optionally upload an image from their device.

Supported formats should preferably include:

- JPG/JPEG
- PNG
- WebP

Use a reasonable size limit.

For example:

```text
Maximum upload size: 5 MB
```

The frontend should compress/rescale oversized images before upload where practical.

Recommended avatar dimensions:

```text
512 × 512
```

The displayed avatar can be smaller.

---

# 14. PROFILE IMAGE SECURITY

Never trust the filename.

Never build storage permissions around a filename.

Use authenticated user ID in storage paths.

Recommended conceptual structure:

```text
avatars/{user_id}/profile.webp
```

This makes ownership clear.

Storage policies must ensure a user cannot upload into another user's directory.

The application should not rely on:

```text
avatars/my-photo.jpg
```

because filenames are not identity.

---

# 15. GENERATED CHARACTER

BEU BABA can provide an optional generated-character/avatar system.

At signup:

```text
Gender = Male
→ select from approved male character collection

Gender = Female
→ select from approved female character collection
```

The generated character should be treated as a visual preference, not authentication data.

Do not infer gender from profile photos.

Do not use facial recognition.

Do not make the system claim to determine a person's gender automatically.

The user explicitly chooses the category.

---

# 16. CHARACTER SELECTION UX

After choosing a gender category, show several approved character options.

Example:

```text
Choose your BEU BABA character

[ Character 1 ]
[ Character 2 ]
[ Character 3 ]
[ Character 4 ]
```

Selected character:

- receives a glass selection ring;
- slight scale increase;
- subtle shadow;
- small checkmark;
- no excessive glow.

Animation:

```text
180–250ms
ease-out
```

The transition should feel like Apple UI selection behavior.

---

# 17. PROFILE IMAGE VS CHARACTER

Allow:

```text
Use my photo
```

or:

```text
Use BEU BABA character
```

The database should store an explicit avatar mode:

```text
avatar_mode:
"profile"
"character"
```

This is better than trying to infer the active source from whichever fields happen to be populated.

---

# 18. PROFILE RECORD

Recommended profile fields:

```text
id
full_name
email_display
phone
course_id
branch_id
semester
academic_year
avatar_mode
avatar_url
character_id
created_at
updated_at
last_seen_at
```

Do not duplicate sensitive authentication secrets.

The email used by Auth should remain authoritative.

If an email is displayed in `profiles`, treat it as a synchronized display field or derive it from the authentication session where appropriate.

---

# 19. DATABASE OWNERSHIP

Every student-owned table must have strict ownership.

Examples:

```text
bookmarks.user_id
quiz_attempts.user_id
uploaded_resources.user_id
developer_messages.user_id
course_progress.user_id
notification_preferences.user_id
```

A student must only be able to access their own private rows.

Conceptual rule:

```sql
auth.uid() = user_id
```

This is the fundamental ownership condition.

---

# 20. ROW LEVEL SECURITY

Supabase PostgreSQL Row Level Security should be enabled on all user-owned tables.

Do not leave private tables without policies.

For a private student table:

```text
SELECT:
user_id = auth.uid()

INSERT:
user_id = auth.uid()

UPDATE:
user_id = auth.uid()

DELETE:
user_id = auth.uid()
```

Administrative policies can be added separately.

Never solve this only in React.

---

# 21. PROFILE RLS

A student should be able to read their own profile.

A student should be able to update only allowed profile fields.

Do not let users update:

- their own role;
- admin flags;
- verification flags;
- moderation status;
- internal notes;
- security metadata.

If a profile table contains sensitive administrative columns, separate public/user-editable data from privileged administrative data.

---

# 22. BETTER PROFILE SCHEMA

A strong architecture can separate:

### `profiles`

User-facing information:

```text
id
full_name
phone
course_id
branch_id
semester
academic_year
avatar_mode
avatar_url
character_id
```

### `user_roles`

Privileged role mapping:

```text
user_id
role
created_at
```

### `admin_user_metadata`

Internal administrative information:

```text
user_id
status
notes
created_at
updated_at
```

Students should not control these tables.

---

# 23. ROLE LOOKUP

The frontend may load the current user's role after authentication.

Example conceptual flow:

```text
Auth session established
        ↓
fetch role
        ↓
load profile
        ↓
initialize app
        ↓
show authorized navigation
```

During loading, do not assume student or admin.

Use:

```text
loading
authenticated
unauthenticated
```

and separately:

```text
role loading
role resolved
```

This prevents accidental admin UI flashes.

---

# 24. ADMIN FLASH PREVENTION

Bad:

```text
initial role = "student"
```

Then:

```text
database says admin
```

This can cause a visible UI transition.

Better:

```text
role = null
roleStatus = loading
```

Render an appropriate loading shell.

Once trusted role data arrives, render the correct interface.

---

# 25. LOGIN FLOW

Login should require:

- email;
- password.

Optional future methods:

- magic link;
- OAuth;
- OTP.

Do not add unnecessary methods just because they exist.

The login screen should be extremely simple.

Suggested layout:

```text
BEU BABA logo

Welcome back
Continue your academic journey.

Email
[________________]

Password
[________________]

[ Continue ]

Forgot password?

New to BEU BABA?
Create account
```

---

# 26. LOGIN GLASS CARD

The login card should appear as translucent glass.

Recommended properties:

```text
background:
rgba(255,255,255,0.50–0.70)

backdrop blur:
24–40px

border:
rgba(255,255,255,0.55)

shadow:
large, soft, low opacity
```

Exact values should adapt to browser performance.

The objective is material depth, not visual noise.

---

# 27. GLASS BACKGROUND

A light glass background can use extremely subtle ambient gradients.

Example concept:

```text
warm white
+
very pale blue
+
very pale lavender
+
soft neutral gray
```

Do not create giant saturated blobs.

The background must remain mostly light.

The user should be able to read black/dark-gray text clearly.

---

# 28. LOGIN SUCCESS

After successful authentication:

```text
button enters loading state
↓
authentication completes
↓
session stored
↓
profile loaded
↓
role loaded
↓
app shell opens
```

Do not redirect immediately before required identity data is loaded.

Otherwise users may briefly see incomplete profile information.

---

# 29. AUTH LOADING STATE

Use a polished skeleton.

Example:

```text
glass card
avatar skeleton
heading skeleton
input skeleton
button skeleton
```

Do not display a giant spinner for several seconds.

A spinner may still be used for short operations.

---

# 30. AUTH ERROR MESSAGES

Never expose raw backend errors unnecessarily.

Avoid:

```text
AuthApiError: invalid_grant ...
```

Instead:

```text
Email or password is incorrect.
```

For network issues:

```text
We couldn't connect right now.
Please check your internet connection and try again.
```

For rate limiting:

```text
Too many attempts.
Please wait a moment and try again.
```

Messages should be understandable.

---

# 31. ACCOUNT ENUMERATION

Do not reveal whether a specific email exists in situations where that could expose account existence.

For password-reset requests, use a neutral response such as:

```text
If an account exists for this email, you'll receive reset instructions.
```

This is preferable to:

```text
No account exists.
```

because it reduces account enumeration.

---

# 32. PASSWORD RESET

Flow:

```text
Forgot password
↓
enter email
↓
request reset
↓
neutral confirmation
↓
email link
↓
new password
↓
session/account update
↓
success
```

Reset UI should maintain the same glass visual language.

The reset screen should not suddenly use a different design system.

---

# 33. PASSWORD RESET SUCCESS

Show:

```text
Password updated

Your account is secure again.

[ Continue to BEU BABA ]
```

Avoid unnecessary celebratory confetti.

The app is academic and premium, not a game.

---

# 34. SESSION MANAGEMENT

The application should use the authentication provider's session mechanism.

Do not invent your own JWT storage system.

The app should listen for authentication state changes.

Conceptually:

```text
onAuthStateChange
        ↓
update auth store
        ↓
refresh profile
        ↓
refresh role
        ↓
update UI
```

---

# 35. SESSION STATES

At minimum:

```text
unknown
loading
authenticated
unauthenticated
expired
```

The application should handle each state explicitly.

Do not assume:

```text
session always exists
```

---

# 36. SESSION EXPIRATION

If the session expires:

1. Preserve the current UI where possible.
2. Show a calm session-expired message.
3. Ask the user to sign in again.
4. Avoid losing unsaved form input where feasible.

Example:

```text
Your session has expired.

Please sign in again to continue.

[ Sign in ]
```

---

# 37. LOGOUT

Logout should be accessible from profile/settings.

Flow:

```text
Tap logout
↓
optional confirmation
↓
sign out
↓
clear in-memory private state
↓
return to public/auth screen
```

Local cached public data can remain.

Private cached data should be handled carefully.

---

# 38. LOGOUT CONFIRMATION

On mobile, a bottom sheet can ask:

```text
Log out of BEU BABA?

You'll need to sign in again to access your account.

Cancel        Log out
```

The destructive action should be visually distinct but not red neon.

Use restrained semantic color.

---

# 39. MULTI-DEVICE SESSIONS

Future-compatible architecture should permit session management.

Potential settings:

```text
Current device
Other sessions
Sign out all devices
```

This may be implemented later.

Do not expose fake session information if backend support is unavailable.

---

# 40. PRIVACY MODEL

BEU BABA should clearly define three data categories.

### Public application data

Examples:

- published syllabus;
- public courses;
- public PYQs;
- approved resources;
- published calendar.

### User-private data

Examples:

- phone number;
- profile settings;
- bookmarks;
- quiz attempts;
- private messages;
- personal uploads before moderation.

### Administrative data

Examples:

- moderation decisions;
- internal notes;
- role mappings;
- audit information.

These categories must never be mixed casually.

---

# 41. STUDENT DIRECTORY

If an admin panel needs student information, that does not mean students should see a student directory.

Students should not be able to query all users.

Avoid endpoints that return:

```text
all profiles
```

to ordinary users.

The database should enforce this.

---

# 42. ADMIN STUDENT VIEW

The admin panel may display:

```text
Student name
Course
Branch
Semester
Email
Contact number
Registration date
Last activity
Account status
```

Only show fields necessary for administrative operations.

Avoid displaying unnecessary sensitive data.

---

# 43. DEVELOPER MESSAGE PRIVACY

BEU BABA's developer message feature is private.

A student sends:

```text
Student A → Developer
```

Developer replies:

```text
Developer → Student A
```

Student A can see their conversation.

Student B cannot see it.

The database must enforce:

```text
message.user_id = auth.uid()
```

for student reads.

Admin/developer access must be explicitly authorized.

---

# 44. MESSAGE THREAD MODEL

Recommended:

### `support_threads`

```text
id
user_id
subject
category
status
created_at
updated_at
```

### `support_messages`

```text
id
thread_id
sender_id
body
created_at
read_at
```

This allows one student to have multiple conversations.

Example:

```text
Bug Report
Course Update
Syllabus Correction
General Help
```

---

# 45. MESSAGE CATEGORIES

Useful categories:

- Bug report
- Syllabus correction
- Course/PYQ update
- Resource issue
- Account issue
- Suggestion
- Other

Category selection helps the developer/admin process messages efficiently.

---

# 46. MESSAGE STATUS

Thread status:

```text
open
in_progress
waiting_for_student
resolved
closed
```

Students can see a simplified label:

```text
Open
Being reviewed
Waiting for your reply
Resolved
```

---

# 47. MESSAGE UI

Use a premium glass conversation panel.

Student messages:

- aligned right.

Developer messages:

- aligned left.

Avoid copying typical social-media chat styling.

This is support communication, not a social network.

Use:

- small timestamps;
- category label;
- status pill;
- clean message bubbles;
- subtle glass surfaces.

---

# 48. SUPPORT MESSAGE SECURITY

Never allow the student to set:

```text
sender_id = developer_id
```

The server/database should determine sender identity from authentication.

Likewise, a student must not choose arbitrary:

```text
user_id
```

for another student's thread.

Ownership must be derived from trusted authentication context.

---

# 49. RESOURCE UPLOAD SYSTEM

Students may upload resources.

Example:

```text
PDF
JPG
PNG
DOC/DOCX
PPT/PPTX
```

Depending on the product's requirements.

Uploaded resources should enter:

```text
pending review
```

They should NOT immediately become public academic resources.

---

# 50. RESOURCE LIFECYCLE

Recommended:

```text
draft
↓
submitted
↓
pending_review
↓
approved
or
rejected
↓
published / archived
```

Student sees:

```text
Pending verification
```

until approved.

---

# 51. RESOURCE OWNERSHIP

A student's upload record should contain:

```text
uploaded_by
```

or:

```text
user_id
```

A student can manage their own pending submissions.

They should not modify another student's upload.

Once approved, content management may move under admin control.

---

# 52. RESOURCE MODERATION

Admin interface should show:

```text
Resource title
Uploader
Course
Branch
Semester
File type
Upload date
Status
Preview
Approve
Reject
```

Rejecting should optionally require a reason.

Example:

```text
Reason:
Duplicate resource
Wrong subject
Poor quality
Incorrect information
Copyright concern
Other
```

---

# 53. COPYRIGHT AND USER UPLOADS

The app should not encourage students to upload copyrighted material they do not have permission to distribute.

The submission UI can include a confirmation:

```text
I confirm that I have the right to share this resource.
```

This should not be treated as a replacement for moderation.

---

# 54. FILE STORAGE

Use storage buckets according to access requirements.

Possible conceptual buckets:

```text
avatars
resource-submissions
published-resources
course-assets
```

Private student submissions should not necessarily be publicly readable.

Approved resources can be served according to the application's access model.

---

# 55. SIGNED URL PRINCIPLE

For private files, use short-lived signed access where appropriate.

Do not place private permanent file URLs into public database fields and assume obscurity is security.

A URL being hard to guess is not authorization.

Authorization should happen before file access.

---

# 56. ACCOUNT DELETION

Provide an account deletion option in settings.

Use strong confirmation.

Example:

```text
Delete account?

This permanently removes your BEU BABA account and personal data according to the application's retention policy.

[ Cancel ]
[ Delete account ]
```

If legal or operational retention requires certain records to remain, clearly explain this in the privacy policy.

---

# 57. DELETION FLOW

Do not implement account deletion as:

```text
DELETE FROM profiles
```

while leaving the authentication identity and related records unmanaged.

The complete deletion strategy should cover:

- authentication identity;
- profile;
- avatars;
- user-created private data;
- bookmarks;
- progress;
- quiz attempts;
- support records according to retention policy;
- uploaded files.

Some records may need anonymization rather than deletion if legally or operationally required.

---

# 58. SOFT DELETE

For certain entities, soft deletion may be preferable.

Example:

```text
deleted_at
```

But do not use soft deletion as an excuse to retain personal data indefinitely.

Define retention.

---

# 59. DATA RETENTION

BEU BABA should define how long each category is retained.

Example policy framework:

```text
Active account data:
while account exists

Deleted account:
remove/anonymize according to policy

Support conversations:
retain for defined support period

Moderation audit:
retain as required for integrity

Published academic content:
retain independently of uploader account when necessary
```

Exact periods should be decided according to legal/business requirements.

---

# 60. PRIVACY SETTINGS

Recommended settings:

```text
Profile visibility
Notification preferences
Email preferences
Download preferences
Personalization
Account security
Delete account
```

Do not create privacy toggles that do nothing.

Every setting must have real behavior.

---

# 61. PROFILE VISIBILITY

Default should be privacy-first.

Unless there is a real social feature, there is no reason to make student profiles publicly discoverable.

Recommended:

```text
Profile visible to other students:
OFF / unavailable
```

Keep the architecture private.

---

# 62. NOTIFICATION PREFERENCES

Possible settings:

```text
Important academic updates
New approved resources
Course updates
Developer replies
Quiz reminders
System announcements
```

Critical account/security messages may not be optional.

---

# 63. SECURITY SETTINGS

Profile security page:

```text
Password
Last account activity
Sign out
Delete account
```

Future:

```text
Two-factor authentication
Active sessions
```

Do not display fake security metrics.

---

# 64. ROUTE PROTECTION

Public routes:

```text
/
 /login
 /register
 /forgot-password
 /public-content
```

Protected routes:

```text
/dashboard
/profile
/quiz
/bookmarks
/messages
/settings
```

Admin routes:

```text
/admin
/admin/resources
/admin/students
/admin/content
```

Developer routes:

```text
/developer/messages
/developer/tools
```

Route guards improve UX.

Database policies provide security.

Both are required.

---

# 65. DIRECT URL ATTACK

If a student manually enters:

```text
/admin/students
```

the application must not show admin data.

Even if the page component accidentally loads, database policies must reject unauthorized queries.

Expected result:

```text
Unauthorized
```

and safe redirection.

---

# 66. AUTH INITIALIZATION

Recommended app initialization:

```text
1. Start React application.
2. Initialize Supabase client.
3. Read existing session.
4. Listen for auth changes.
5. If unauthenticated → public/auth experience.
6. If authenticated → load profile.
7. Load role.
8. Initialize private stores.
9. Render protected application.
```

Avoid making dozens of independent requests before the identity is known.

---

# 67. AUTH CONTEXT

Create a centralized auth provider/store.

Conceptual state:

```ts
type AuthState = {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: UserRole | null
  status: AuthStatus
}
```

Do not scatter authentication logic across every page.

---

# 68. QUERY INVALIDATION

When the user changes profile data:

```text
update database
↓
update local profile state
↓
invalidate dependent queries if necessary
```

Do not force a full page reload for ordinary profile updates.

---

# 69. PROFILE EDITING

Profile page sections:

```text
Avatar
Personal information
Academic information
Preferences
Security
Support
Account
```

Editable fields should have clear affordances.

Use an inline edit or modal depending on complexity.

---

# 70. UNSAVED CHANGES

If the user edits a form and tries to leave:

```text
Unsaved changes

You have changes that haven't been saved.

[ Stay ]
[ Discard ]
```

Do not interrupt navigation for forms with no changes.

---

# 71. PROFILE SAVE ANIMATION

When save succeeds:

```text
Save
↓
loading indicator
↓
checkmark
↓
"Saved"
↓
return to normal
```

Do not use a giant success modal.

A small status indicator is sufficient.

---

# 72. PROFILE ERROR

If saving fails:

```text
Couldn't save changes.
Please try again.
```

Keep the user's entered values.

Never clear the form on server error.

---

# 73. NETWORK INTERRUPTION

If network is unavailable:

```text
You're offline.

Your changes haven't been uploaded.
```

If safe, keep the draft locally.

Do not claim data was saved if it wasn't.

---

# 74. PWA AUTH BEHAVIOR

Because BEU BABA is a PWA, authentication should behave consistently whether launched from:

- browser;
- installed PWA;
- mobile home screen;
- desktop installed app.

Do not assume the PWA is a separate application identity.

It uses the same web authentication system.

---

# 75. OFFLINE SECURITY

Never cache sensitive student information broadly just to improve offline UX.

Public academic content may be cached.

Private information should have stricter caching rules.

Particularly sensitive data such as:

- phone;
- support messages;
- account settings

should not be unnecessarily stored in publicly accessible browser caches.

---

# 76. LOCAL STORAGE

Acceptable uses:

- UI preferences;
- non-sensitive temporary state;
- onboarding completion;
- theme preference if needed.

Avoid putting sensitive identity data in localStorage when the authentication library provides a safer managed mechanism.

Never store:

```text
password
service role key
admin secret
database password
```

---

# 77. SECRET MANAGEMENT

Frontend environment variables are not automatically secret.

Anything shipped into the browser can potentially be inspected.

Therefore:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

may be exposed according to Supabase architecture.

But:

```text
SUPABASE_SERVICE_ROLE_KEY
```

must NEVER be included in frontend code.

---

# 78. ADMIN OPERATIONS

Privileged admin operations should use trusted authorization.

Examples:

- changing academic content;
- approving resources;
- modifying student administrative status;
- deleting other users' content;
- sending global announcements.

The browser must not be able to manufacture admin privilege.

---

# 79. AUDIT LOG

For important admin operations, create an audit trail.

Potential events:

```text
resource_approved
resource_rejected
course_updated
syllabus_updated
calendar_updated
student_status_changed
admin_role_changed
```

Audit entry:

```text
id
actor_user_id
action
entity_type
entity_id
metadata
created_at
```

Do not store unnecessary sensitive information inside metadata.

---

# 80. ADMIN ROLE CHANGES

Changing roles is highly sensitive.

Never allow:

```text
student → admin
```

through an ordinary client-side update.

This should require privileged server/database operations.

Prefer a controlled administrative procedure.

---

# 81. INPUT VALIDATION

Validate on both:

### Client

For immediate UX.

### Server/database

For actual integrity.

Examples:

```text
full_name length
phone format
course ID validity
branch ID validity
semester range
file type
file size
message length
resource title length
```

---

# 82. TEXT LENGTH LIMITS

Define reasonable limits.

Example:

```text
Name: 100 characters
Message subject: 150
Support message: 5,000
Resource title: 200
Quiz title: 150
```

The exact values can be adjusted.

The important rule is to prevent unlimited arbitrary payloads.

---

# 83. XSS PROTECTION

User-generated content must not be rendered as raw HTML.

Examples:

- developer messages;
- resource descriptions;
- quiz titles;
- user notes.

Render as text.

If rich text is introduced later, sanitize it using a proven sanitizer.

Never directly inject unsanitized user HTML.

---

# 84. FILE TYPE VALIDATION

Do not trust the extension.

A file named:

```text
notes.pdf
```

could contain unexpected content.

Validate MIME type and preferably inspect file signatures where necessary.

Apply server-side restrictions.

---

# 85. UPLOAD ABUSE

Protect upload endpoints from:

- enormous files;
- repeated uploads;
- unsupported formats;
- malicious payloads;
- spam.

Use:

```text
size limits
rate limits
authentication
moderation
storage policies
```

---

# 86. RATE LIMITING

Potentially rate-limit:

- login attempts;
- password reset requests;
- support messages;
- resource uploads;
- quiz submissions;
- public search if expensive.

Do not make rate limiting so aggressive that legitimate students cannot use the app.

---

# 87. BOT/SPAM PROTECTION

If abuse becomes significant, add bot protection around sensitive endpoints.

Do not put CAPTCHA on every screen from day one.

Use friction where it solves a real problem.

---

# 88. SESSION FIXATION

Use the authentication provider's supported session lifecycle.

Do not manually accept arbitrary tokens from query strings and treat them as permanent login credentials.

After sensitive authentication operations, rely on provider-managed session behavior.

---

# 89. AUTH CALLBACKS

For email verification/password reset links:

- validate callback state;
- process only expected auth flows;
- redirect safely;
- do not redirect to arbitrary external URLs supplied by query parameters.

Use allowlisted redirect paths.

---

# 90. OPEN REDIRECT PROTECTION

Never do:

```text
window.location.href = urlFromQuery
```

without validating the destination.

Prefer internal routes.

Example:

```text
/forgot-password?redirect=/dashboard
```

is safer than allowing:

```text
redirect=https://malicious-site.example
```

---

# 91. ACCOUNT VERIFICATION

If email verification is enabled:

```text
register
↓
verification pending
↓
email
↓
verify
↓
login/application access
```

The UI should clearly tell the user what to do.

Do not make them wonder why login is blocked.

---

# 92. VERIFICATION SCREEN

Example:

```text
Check your email

We've sent a verification link to:
a•••••@gmail.com

Open your email and verify your account.

[ Resend email ]
[ Change email ]
```

Resend should be rate-limited.

---

# 93. MOBILE VERIFICATION UX

The screen must work well when users switch between:

```text
BEU BABA PWA
→ Gmail
→ verification link
→ browser/PWA
```

Keep the callback robust.

---

# 94. ACCESSIBILITY

Authentication is a critical flow and must be accessible.

Requirements:

- keyboard navigation;
- visible focus;
- labels for inputs;
- sufficient contrast;
- screen-reader-friendly errors;
- correct input types;
- autocomplete attributes;
- touch targets around 44px where practical.

Do not rely on placeholders as labels.

---

# 95. AUTOCOMPLETE

Use appropriate browser autocomplete:

```text
name
email
tel
new-password
current-password
```

This makes registration and login easier.

Do not disable password managers.

---

# 96. ERROR FOCUS

When a form submission has errors:

- focus the first invalid field;
- keep error text near that field;
- do not move the user unexpectedly.

For screen readers, use appropriate live-region semantics for submission-level errors.

---

# 97. GLASS CONTRAST

Glass effects can harm readability.

Therefore:

```text
If background changes behind text,
the text container must remain sufficiently readable.
```

If necessary, increase the glass surface opacity.

Never prioritize visual transparency over usability.

---

# 98. GLASS PERFORMANCE

Backdrop blur is expensive on some devices.

Use:

```css
backdrop-filter: blur(...)
```

carefully.

Do not apply huge blur surfaces to every element.

Recommended hierarchy:

```text
Page background
1–2 ambient layers

Primary glass card
moderate blur

Secondary glass cards
smaller blur

Inputs
light translucent surfaces
```

Avoid nested blur inside nested blur inside nested blur.

---

# 99. MOBILE GLASS

On mobile:

- reduce blur radius if needed;
- reduce heavy shadows;
- avoid large fixed backdrop layers;
- ensure scrolling remains smooth.

A premium interface is not premium if it drops frames.

---

# 100. AUTH ANIMATION PRINCIPLES

Authentication animation should communicate:

```text
where you are
what changed
whether something succeeded
whether something failed
```

It should never exist merely for decoration.

---

# 101. PAGE ENTER

Recommended:

```text
opacity: 0 → 1
translateY: 8px → 0
duration: 220–300ms
```

Avoid:

```text
scale 0.5 → 1
rotate 360°
```

The latter feels like a template rather than Apple-inspired product UI.

---

# 102. FORM STEP TRANSITION

For multi-step registration:

```text
current step exits subtly
next step enters from a short horizontal direction
```

Duration:

```text
250–350ms
```

Respect reduced motion.

---

# 103. BUTTON LOADING

When login/register is submitted:

```text
button content
↓
small spinner
↓
button remains same width
```

Never allow button width to jump from:

```text
Create account
```

to:

```text
...
```

Maintain layout stability.

---

# 104. DISABLED STATES

Disabled buttons should look disabled but remain legible.

Do not reduce opacity to almost zero.

Recommended concept:

```text
reduced contrast
reduced interaction
```

not:

```text
invisible
```

---

# 105. FOCUS STATES

Inputs should use:

```text
subtle border emphasis
soft shadow
slight surface change
```

Avoid bright blue neon outlines.

The focus effect should blend into the glass material.

---

# 106. VALIDATION ANIMATION

When a field becomes valid:

- optional tiny checkmark;
- subtle opacity/scale transition.

Do not animate every keystroke dramatically.

When invalid:

- error text appears below;
- input border changes semantically;
- optional tiny shake only on submit.

---

# 107. PROFILE AVATAR ANIMATION

On avatar selection:

```text
image preview crossfade
```

If switching between photo and character:

```text
old image opacity 1 → 0
new image opacity 0 → 1
```

Use approximately:

```text
180–250ms
```

---

# 108. UPLOAD PROGRESS

For profile image upload:

```text
Selecting file
↓
Compressing
↓
Uploading
↓
Processing
↓
Saved
```

Show a compact progress state.

Do not freeze the whole screen.

---

# 109. UPLOAD FAILURE

Example:

```text
Couldn't upload this image.

Try JPG, PNG, or WebP under 5 MB.
```

The user should be able to retry immediately.

---

# 110. DELETE AVATAR

If supported:

```text
Remove photo
```

Then fall back to character.

The system should not leave a broken image URL.

---

# 111. DATA SYNCHRONIZATION

When profile is updated on one device, another session may still show old data.

Future architecture can support realtime updates where valuable.

Do not add realtime subscriptions everywhere.

Use them only where immediate synchronization matters.

---

# 112. SECURITY VS CONVENIENCE

BEU BABA should follow:

> Minimum privilege by default.

Examples:

Student:
```text
read public content
read own private content
write own allowed content
```

Admin:
```text
manage assigned content
```

Developer:
```text
manage technical/support responsibilities
```

Nobody should receive broad access simply because implementation is easier.

---

# 113. SUPPORT STAFF PRIVACY

If developer/support users can access messages, they should only see conversations necessary for their role.

Avoid a giant unrestricted student database if support only needs support tickets.

This minimizes privacy exposure.

---

# 114. DATA EXPORT

Future feature:

```text
Download my data
```

Could include:

- profile;
- bookmarks;
- quiz history;
- progress;
- submitted resources metadata;
- support history where appropriate.

Do not include secrets.

---

# 115. ACCOUNT DEACTIVATION

A temporary:

```text
Deactivate account
```

option can be added later if useful.

Do not confuse it with deletion.

A deactivated account may prevent login while preserving data according to policy.

---

# 116. SENSITIVE ADMIN DATA

Do not send admin-only fields in normal profile queries.

Bad architecture:

```text
SELECT * FROM profiles
```

then hide:

```text
admin_notes
```

in React.

Better:

```text
user-safe profile query
```

contains only fields the student needs.

---

# 117. API RESPONSE MINIMIZATION

Return only required fields.

For a profile card:

```text
full_name
avatar
course
branch
```

No need to send:

```text
phone
internal notes
role metadata
security timestamps
```

unless required.

---

# 118. DATABASE FOREIGN KEYS

Use foreign keys for integrity.

Examples:

```text
profiles.course_id → courses.id
profiles.branch_id → branches.id
course_progress.user_id → profiles.id/auth identity
```

Use constraints to prevent invalid references.

---

# 119. ACADEMIC DATA OWNERSHIP

Syllabus, yearly calendar, courses, PYQs, and public academic content are not student-owned.

They should be managed separately.

Example:

```text
courses
subjects
syllabus
academic_calendar
pyqs
resources
```

Student identity should reference these entities rather than duplicating their names everywhere.

---

# 120. BRANCH AND COURSE SELECTORS

Do not let users type arbitrary branch values if the application has a controlled academic catalog.

Prefer:

```text
Course dropdown
↓
Branch dropdown filtered by course
↓
Semester/year
```

This improves data quality.

---

# 121. DEPENDENT DROPDOWNS

Example:

```text
Course:
B.Tech

Branch:
CSE
ECE
EE
ME
...

Semester:
1
2
3
...
```

If the selected course changes, reset incompatible branch values.

Do not submit stale branch IDs.

---

# 122. REGISTRATION DRAFT

Multi-step signup can temporarily store a non-sensitive draft in memory.

If persistence is needed, avoid storing sensitive password values.

Never persist plaintext passwords in localStorage.

---

# 123. SESSION RESTORE

When the app opens:

```text
loading shell
↓
session restore
↓
profile restore
↓
dashboard
```

Do not show the login screen for a moment and then jump to the dashboard.

That creates flicker.

---

# 124. AUTH GATE

Use a centralized route/auth gate.

Conceptual:

```tsx
<AuthGate>
  <ProtectedApp />
</AuthGate>
```

The gate should understand:

```text
checking session
unauthenticated
authenticated
```

Role gates should be separate.

---

# 125. ROLE GATE

Conceptual:

```tsx
<RoleGate allowedRoles={["admin"]}>
   <AdminPage />
</RoleGate>
```

Again:

This is UX protection.

Database policies remain the actual security boundary.

---

# 126. ERROR BOUNDARIES

Authentication and profile pages should be inside React error boundaries.

If a profile component crashes, the entire application should not become unusable.

Provide:

```text
Something went wrong.

[ Try again ]
```

---

# 127. OBSERVABILITY

Production errors should be logged through an appropriate monitoring solution if used.

Never log:

- passwords;
- auth tokens;
- private message bodies unnecessarily;
- complete phone numbers;
- sensitive personal data.

Log safe diagnostic information.

---

# 128. DEVELOPMENT ENVIRONMENT

Use separate environments where practical:

```text
development
staging
production
```

Never test destructive database policies directly against production.

---

# 129. DATABASE MIGRATIONS

All schema changes should be version-controlled.

Example:

```text
001_create_profiles
002_create_roles
003_create_support
004_create_resources
```

Do not manually alter production tables without tracking the change.

---

# 130. SEED DATA

Academic reference data can be seeded:

```text
courses
branches
semesters
subjects
```

Use stable IDs.

Do not hard-code hundreds of academic records into React components.

---

# 131. CONTENT CHANGE

One of BEU BABA's requirements is that syllabus, yearly calendar, courses, and similar content can change without rebuilding the frontend.

Therefore:

```text
UI
↓
database/API
↓
current academic data
```

not:

```text
React source code
↓
hard-coded syllabus
```

Admin should be able to update content through a controlled interface.

---

# 132. STUDENT PROFILE AFTER CONTENT CHANGE

If a course or branch is renamed, student records should reference stable IDs.

Example:

```text
branch_id = 123
```

instead of relying entirely on:

```text
branch_name = "Computer Science..."
```

The UI can display the latest name.

---

# 133. DEVELOPER CONTACT INFORMATION

The application can expose developer contact/social links where appropriate.

However, the developer's private personal data should never be embedded into public source code unless intentionally public.

Public links can be stored as configuration.

---

# 134. ADMIN CONTACT

If a student reports:

```text
Syllabus wrong
```

the message should reach the appropriate developer/admin support workflow.

The user should not need to leave the app to contact support.

---

# 135. SECURITY SETTINGS UI

Recommended layout:

```text
Security

Password
Change your password

Sessions
Manage active sessions

Account
Delete account
```

Use separate glass cards.

No huge dashboard.

---

# 136. PROFILE PAGE UI

Recommended hierarchy:

```text
Header
   Avatar
   Name
   Course + Branch

Personal
   Name
   Contact

Academic
   Course
   Branch
   Semester

Appearance/Preferences

Security

Support

Danger zone
```

Use section spacing rather than dozens of borders.

---

# 137. APPLE-LIKE GLASS DETAILS

The premium glass language should use:

- high-quality spacing;
- large corner radii;
- restrained translucency;
- thin borders;
- soft shadows;
- smooth spring interactions;
- crisp typography;
- clear hierarchy.

It should NOT use:

- excessive glass everywhere;
- rainbow gradients;
- chrome-like 3D;
- neon edges;
- floating holograms;
- dark cyber backgrounds.

---

# 138. TYPOGRAPHY

Recommended hierarchy:

```text
Large title:
32–40px desktop

Section title:
20–24px

Body:
15–17px

Secondary:
13–14px

Metadata:
12–13px
```

Exact values should be responsive.

Use a clean system-like font stack.

---

# 139. CORNER RADIUS

Use a coherent radius system.

Example:

```text
small:
12px

medium:
16px

large:
22px

hero glass:
28–32px
```

Do not randomly use 7px, 13px, 19px, 27px on different components.

---

# 140. SHADOW SYSTEM

Use very soft shadows.

Concept:

```text
low elevation:
0 4px 16px rgba(...)

medium:
0 10px 30px rgba(...)

large:
0 20px 50px rgba(...)
```

Exact opacity should remain subtle.

Avoid black-heavy shadows.

---

# 141. BORDER SYSTEM

Glass border:

```text
1px solid rgba(255,255,255,0.45–0.70)
```

But contrast must be tested against the background.

Some cards may use a darker low-opacity border for accessibility.

---

# 142. AUTH SCREEN RESPONSIVENESS

Desktop:

```text
centered glass card
comfortable width
```

Tablet:

```text
slightly narrower
```

Mobile:

```text
near full width
safe horizontal padding
```

Do not make the mobile card unnecessarily tiny.

---

# 143. SAFE AREAS

PWA/mobile screens must account for:

- top notch;
- bottom home indicator;
- browser UI;
- keyboard.

Use safe-area CSS where appropriate.

---

# 144. KEYBOARD BEHAVIOR

When keyboard opens on mobile:

- focused input must remain visible;
- form should scroll naturally;
- bottom buttons must not cover the input;
- avoid fixed decorative elements over the keyboard.

---

# 145. MOBILE REGISTRATION

On mobile, multi-step registration should feel like a native onboarding flow.

Top:

```text
← Back
Step 2 of 5
```

Center:

```text
Academic profile
```

Bottom:

```text
Continue
```

Keep navigation predictable.

---

# 146. DESKTOP REGISTRATION

Desktop can use a centered large glass surface with a step indicator.

Potential structure:

```text
left:
brand / contextual illustration

right:
form
```

But do not introduce decorative 3D clutter.

---

# 147. PROFILE IMAGE CROPPER

If cropping is added:

- square crop;
- pinch/zoom on mobile;
- drag;
- rotate only if needed;
- preview;
- cancel;
- save.

Do not make the cropper unnecessarily complex.

---

# 148. IMAGE PREVIEW

Before upload:

```text
Selected image
[ Preview ]

Change
Use this photo
```

This avoids accidental upload.

---

# 149. CHARACTER FALLBACK

If character assets fail to load:

Use:

```text
default BEU BABA avatar
```

Do not show broken image icons.

---

# 150. PROFILE DATA VALIDATION

When profile is loaded, validate its shape.

Do not assume database data is always perfectly formed.

Unexpected/null values should result in safe fallbacks.

---

# 151. NULL HANDLING

Example:

```text
phone = null
```

UI:

```text
Not added
```

not:

```text
null
```

Similarly:

```text
semester = null
```

should be handled gracefully.

---

# 152. EMAIL CHANGE

If email changes are supported:

```text
Change email
↓
new email
↓
confirmation
↓
verification
↓
update
```

The application should follow Supabase's supported email-change behavior.

Do not manually rewrite authentication email records.

---

# 153. PHONE CHANGE

If phone is merely profile metadata:

- validate;
- normalize;
- save.

If phone is later used for authentication/OTP, treat it as a separate security feature.

Do not pretend ordinary profile phone numbers are verified identity.

---

# 154. VERIFIED CONTACT INDICATORS

Only show:

```text
Verified
```

if verification actually occurred.

Never label a user-entered email/phone as verified just because it passed formatting validation.

---

# 155. ACCOUNT STATUS

Possible internal statuses:

```text
active
suspended
deleted
pending_verification
```

Students should see understandable descriptions.

Example:

```text
Your account is temporarily unavailable.
Please contact support.
```

Do not expose internal moderation notes.

---

# 156. SUSPENSION

If an account is suspended:

- stop access to protected features;
- explain safe next step;
- provide support route;
- avoid exposing sensitive internal reason if inappropriate.

Admin should be able to manage status securely.

---

# 157. BRUTE FORCE

Use provider-supported protection plus rate limiting.

Do not create a custom lockout that permanently locks legitimate students because of a few mistakes.

---

# 158. SECURITY NOTIFICATIONS

Future feature:

```text
New login detected
Password changed
Email changed
```

These can be valuable.

But only implement if reliable backend signals are available.

---

# 159. LOGIN ACTIVITY

Future profile section:

```text
Recent security activity
```

Possible entries:

```text
Password changed
Email updated
New session
Logged out
```

Do not claim exact device/location information unless the platform actually provides reliable data.

---

# 160. PRIVACY-FRIENDLY ANALYTICS

Analytics can track product events without collecting unnecessary personal information.

Useful events:

```text
login_success
registration_complete
course_opened
quiz_started
quiz_completed
resource_submitted
support_thread_created
```

Avoid recording message contents.

---

# 161. AUTH EVENT NAMES

Use consistent naming.

Bad:

```text
LoginDone
login_done2
userLoginFinal
```

Better:

```text
auth_login_success
auth_login_failed
auth_register_started
auth_register_completed
auth_logout
```

---

# 162. AUTH UX TELEMETRY

Track failure categories rather than raw sensitive error content.

Example:

```text
invalid_credentials
network_error
rate_limited
verification_required
```

This helps debugging.

---

# 163. DATABASE POLICY TESTING

Every policy should have tests for:

### Student A

Can:
- read own profile.

Cannot:
- read Student B profile.

### Student A

Can:
- update own support thread.

Cannot:
- update Student B thread.

### Admin

Can:
- review resources.

Student:
- cannot approve resource.

### Developer

Can:
- reply to assigned/allowed support messages.

---

# 164. NEGATIVE TESTING

Security testing must include attempts to:

```text
change user_id
change role
read another UUID
update another student's row
delete another student's file
approve own upload
access admin route
```

A system is not secure because the normal path works.

The unauthorized paths must fail.

---

# 165. CLIENT MANIPULATION TEST

Using browser DevTools, a tester should be able to change:

```text
role = "admin"
```

without gaining actual admin privileges.

If that grants access, the architecture is broken.

---

# 166. NETWORK REQUEST TEST

Inspect requests.

Ask:

```text
Does the browser send a service-role key?
Does the request allow arbitrary user_id?
Can the user change another user's ID?
Does the database reject it?
```

These tests should be part of release QA.

---

# 167. STORAGE SECURITY TEST

Attempt:

```text
upload to another user's avatar directory
read another user's private resource
delete another user's file
```

All should fail.

---

# 168. SUPPORT PRIVACY TEST

Create:

```text
Student A
Student B
```

Student A creates a message.

Then authenticate as Student B.

Verify:

```text
Student B cannot query Student A thread.
```

This is a mandatory test.

---

# 169. ADMIN PRIVACY TEST

Verify that a student cannot query:

```text
admin_notes
audit_logs
role_assignments
moderation metadata
```

even if they know table names.

RLS and schema separation should enforce this.

---

# 170. ERROR SAFETY

Database errors returned to the client should not expose:

- SQL statements;
- database structure unnecessarily;
- secrets;
- internal paths.

Convert internal failures into user-safe messages.

---

# 171. AUTH REDIRECT SAFETY

After login:

```text
return to intended internal route
```

but validate the destination.

Do not trust arbitrary external redirect URLs.

---

# 172. DEEP LINKING

If user opens:

```text
/beu-baba/quiz/123
```

while logged out:

```text
login
↓
authentication
↓
return to quiz/123
```

This makes the app feel polished.

---

# 173. DEEP LINK SECURITY

The destination must still be authorized after login.

Example:

```text
/support/thread/abc
```

If thread belongs to another student, opening the URL must fail.

Never assume deep links are safe because the user is authenticated.

---

# 174. CONTENT ACCESS

Some academic content may be public.

Other content may be restricted to:

```text
authenticated users
```

Potential future paid-course content may require:

```text
subscription/purchase authorization
```

Design the authorization architecture so it can evolve.

---

# 175. FUTURE COURSE ACCESS

If paid courses are added later:

```text
user
↓
enrollment
↓
course entitlement
↓
lesson access
```

Do not encode paid access as:

```text
isPaidUser = true
```

in localStorage.

Entitlements must be server-authoritative.

---

# 176. QUIZ OWNERSHIP

A user-created quiz should belong to its creator.

If quiz cards are private:

```text
creator_id = auth.uid()
```

If the user explicitly publishes a quiz:

```text
visibility = public
```

Even then, moderation may be required.

---

# 177. QUIZ CARD DOWNLOAD

Generating a quiz card can happen client-side.

The resulting image does not automatically need to be stored in the database.

Store the quiz data.

Generate the card when requested.

This reduces storage usage.

---

# 178. QUIZ ATTEMPTS

Quiz attempt records should belong to the authenticated user.

Possible fields:

```text
id
user_id
quiz_id
score
total_questions
started_at
completed_at
```

Students can see their own attempts.

They cannot alter score records after submission.

---

# 179. SCORE INTEGRITY

Do not trust:

```text
score = 100
```

sent from the browser.

For important quiz integrity, calculate the result from trusted quiz data/server-side logic.

For casual practice quizzes, client calculation may be acceptable, but the product must not treat client-provided results as authoritative if rewards/leaderboards depend on them.

---

# 180. LEADERBOARDS

If future leaderboards are introduced:

- never trust client scores;
- validate attempts;
- prevent duplicate manipulation;
- rate-limit submissions;
- use server-side scoring.

---

# 181. BOOKMARKS

Bookmark table:

```text
user_id
content_type
content_id
created_at
```

Policy:

```text
user can only manage own bookmarks
```

Use unique constraints to prevent duplicate bookmarks.

---

# 182. COURSE PROGRESS

Progress should be user-owned.

Example:

```text
user_id
lesson_id
completed
progress_percent
updated_at
```

Prevent users from modifying another student's progress.

---

# 183. ADMIN STUDENT ANALYTICS

Admin may eventually see aggregate data:

```text
registered students
active users
quiz participation
resource submissions
```

Prefer aggregated analytics instead of exposing unnecessary individual details.

---

# 184. DATA MINIMIZATION

Ask for every field:

> Why does BEU BABA need this?

If there is no strong reason, remove it.

Premium products feel simpler because they avoid unnecessary friction.

---

# 185. CONSENT

Registration should include links to:

```text
Terms of Use
Privacy Policy
```

Do not hide consent inside tiny unreadable text.

The user should understand what they are agreeing to.

---

# 186. AGE CONSIDERATION

If the service has age-related legal requirements, implement an appropriate age/consent flow based on applicable law and the actual target audience.

Do not collect date of birth merely because it is available.

---

# 187. PRIVACY POLICY ACCESS

The privacy policy should be reachable from:

- signup;
- settings;
- account section;
- footer/about.

Do not make it impossible to find after registration.

---

# 188. ACCOUNT DATA PAGE

A polished account page can show:

```text
Your data

Profile information
Academic information
Activity
Submitted resources
Support conversations
```

This reinforces transparency.

---

# 189. DATA EXPORT UX

If implemented:

```text
Prepare my data
↓
processing
↓
download package
```

Use a time-limited secure download.

---

# 190. DELETE CONFIRMATION

For destructive account deletion, require a strong explicit confirmation.

Example:

```text
Type DELETE to confirm
```

This is appropriate because the action is irreversible.

Do not require this for ordinary logout.

---

# 191. AUTHENTICATION COMPONENT ARCHITECTURE

Recommended component structure:

```text
auth/
  LoginPage
  RegisterPage
  ForgotPasswordPage
  ResetPasswordPage
  VerifyEmailPage
  AuthLayout
  AuthGuard
  RoleGuard
  PasswordField
  AuthButton
  FormError
  StepIndicator
```

Profile:

```text
profile/
  ProfilePage
  AvatarPicker
  CharacterPicker
  PersonalInfoForm
  AcademicInfoForm
  SecuritySection
  AccountDangerZone
```

Support:

```text
support/
  SupportPage
  ThreadList
  ThreadView
  MessageComposer
```

---

# 192. SERVICE ARCHITECTURE

Avoid putting Supabase queries directly into every visual component.

Prefer:

```text
components
↓
hooks
↓
service/repository functions
↓
Supabase
```

Example conceptual:

```text
useProfile()
profileService.updateProfile()
```

This keeps UI and data logic separate.

---

# 193. TYPE SAFETY

Use TypeScript types generated from the database schema where possible.

Avoid:

```ts
const user: any
```

for identity-critical objects.

Strong types reduce mistakes around:

- roles;
- nullable profile fields;
- IDs;
- statuses.

---

# 194. VALIDATION SCHEMAS

Define reusable schemas.

Example:

```text
registerSchema
profileSchema
supportMessageSchema
resourceSubmissionSchema
```

Client and server validation should remain conceptually aligned.

---

# 195. FORM ARCHITECTURE

Use controlled or form-library-based state.

Each field should track:

```text
value
touched
dirty
valid
error
```

Avoid custom ad-hoc form logic scattered across pages.

---

# 196. AUTOSAVE

Do not autosave sensitive registration fields aggressively.

For profile editing, autosave can be useful for non-sensitive preferences.

If autosave is introduced, make the status clear:

```text
Saving...
Saved
Offline
```

---

# 197. TOAST SYSTEM

Authentication events can use restrained toast messages.

Examples:

```text
Profile saved
Password updated
Message sent
Resource submitted
```

Toasts should not replace inline form errors.

---

# 198. TOAST GLASS

Use:

```text
translucent glass
backdrop blur
subtle border
soft shadow
```

Keep it compact.

Avoid giant notification banners for small actions.

---

# 199. CONFIRMATION MODALS

Use modal only for meaningful decisions.

Examples:

- delete account;
- discard unsaved changes;
- logout all devices.

Do not use modals for:

- every save;
- every bookmark;
- every quiz selection.

---

# 200. FINAL AUTHENTICATION ACCEPTANCE CRITERIA

The BEU BABA identity system is complete only when all of the following are true:

## Registration

- [ ] Student can register.
- [ ] Required academic fields are validated.
- [ ] Password is never stored by application code.
- [ ] Profile image upload works securely.
- [ ] Character selection works.
- [ ] Registration handles errors gracefully.
- [ ] Verification flow works if enabled.

## Login

- [ ] Student can log in.
- [ ] Invalid credentials show a safe error.
- [ ] Session restores correctly.
- [ ] Login does not flicker between pages.
- [ ] Password reset works.

## Profile

- [ ] Student sees own data.
- [ ] Student can edit permitted fields.
- [ ] Student cannot edit role/admin fields.
- [ ] Avatar changes correctly.
- [ ] Character fallback works.

## Authorization

- [ ] RLS enabled.
- [ ] Student A cannot access Student B's private data.
- [ ] Student cannot access admin data.
- [ ] Frontend role manipulation does not grant privilege.
- [ ] Admin operations are protected.

## Support

- [ ] Student can create private thread.
- [ ] Student sees only own threads.
- [ ] Developer/admin can reply according to role.
- [ ] Student cannot impersonate developer.
- [ ] Messages are not publicly exposed.

## Resources

- [ ] Uploads require authentication.
- [ ] Ownership is enforced.
- [ ] File restrictions exist.
- [ ] Resources require moderation before publication where required.
- [ ] Students cannot approve their own resources.

## Privacy

- [ ] Privacy policy is accessible.
- [ ] Account deletion is implemented correctly or clearly marked as pending.
- [ ] Sensitive information is minimized.
- [ ] Private data is not unnecessarily cached.
- [ ] Admin data is separated from user data.

## UX

- [ ] Light premium glass UI.
- [ ] No dark theme.
- [ ] No RGB.
- [ ] No cyberpunk styling.
- [ ] No excessive 3D background.
- [ ] Animations are subtle and meaningful.
- [ ] Mobile keyboard behavior works.
- [ ] Accessibility basics pass.

## Security

- [ ] No service-role key in frontend.
- [ ] No plaintext passwords.
- [ ] No trusted role in localStorage.
- [ ] RLS policies tested.
- [ ] Storage policies tested.
- [ ] Deep links enforce authorization.
- [ ] User IDs cannot be manipulated to bypass ownership.
- [ ] Admin operations are server/database-authorized.
- [ ] Error responses do not leak sensitive implementation details.

---

# 201. MASTER ARCHITECTURAL RULE

The most important rule for the entire BEU BABA project is:

> **Never confuse a polished interface with secure architecture.**

A beautiful glass login screen does not make authentication secure.

A hidden admin button does not make an admin panel secure.

A random file URL does not make a resource private.

A localStorage role does not make someone an admin.

A frontend `user_id` does not prove ownership.

A disabled button does not enforce authorization.

The complete BEU BABA architecture must work like this:

```text
USER
 ↓
PREMIUM UI
 ↓
VALIDATION
 ↓
AUTHENTICATION
 ↓
TRUSTED IDENTITY
 ↓
AUTHORIZED REQUEST
 ↓
DATABASE RLS / SERVER AUTHORIZATION
 ↓
OWNED DATA
 ↓
SAFE RESPONSE
 ↓
UI UPDATE
```

Every important operation should pass through this chain.

---

# 202. FINAL DESIGN PHILOSOPHY

BEU BABA should feel like a carefully designed Apple-inspired academic product.

The identity experience should communicate:

```text
Simple
Private
Reliable
Premium
Calm
Fast
Professional
```

The visual system should communicate:

```text
transparent glass
soft depth
light surfaces
clean typography
precise spacing
restrained motion
```

The security system should communicate:

```text
least privilege
explicit ownership
server-authoritative permissions
private-by-default data
safe uploads
controlled administration
```

The student should never need to understand the complexity behind the system.

They should simply experience:

```text
Open BEU BABA
↓
Sign in
↓
Profile loads
↓
Academic identity appears
↓
Courses, PYQs, syllabus, quizzes and tools are ready
↓
Private data remains private
↓
Support is one tap away
```

That is the target.

---

# 203. IMPLEMENTATION PRIORITY

Implement in this order:

### Priority 1
Supabase Auth

### Priority 2
Profiles

### Priority 3
RLS

### Priority 4
Roles

### Priority 5
Protected routes

### Priority 6
Profile image storage

### Priority 7
Character system

### Priority 8
Password reset/verification

### Priority 9
Developer support threads

### Priority 10
Resource submissions

### Priority 11
Admin moderation

### Priority 12
Account deletion/privacy

### Priority 13
Advanced security/activity

### Priority 14
Advanced offline/PWA identity behavior

Do not build the visual admin dashboard before the authorization model is correctly implemented.

---

# 204. NON-NEGOTIABLE SECURITY CHECKLIST

Before production:

```text
[ ] RLS enabled on every private table
[ ] Storage policies enabled
[ ] Service role key never shipped
[ ] Passwords never stored manually
[ ] Role cannot be edited by students
[ ] User ownership cannot be overridden
[ ] Support threads private
[ ] Student directory not publicly queryable
[ ] Admin routes protected
[ ] Admin database operations protected
[ ] File upload limits active
[ ] Input validation active
[ ] Rate limiting considered
[ ] Account deletion tested
[ ] Password reset tested
[ ] Email verification tested
[ ] Session expiration tested
[ ] Logout tested
[ ] Deep-link authorization tested
[ ] Cross-user access tests passed
[ ] Mobile authentication tested
[ ] PWA authentication tested
[ ] Accessibility tested
[ ] Reduced-motion tested
```

---

# 205. FINAL DEFINITION OF DONE

BEU BABA authentication is production-ready only when the following statement is true:

> A normal student can register with their academic information, choose a profile photo or BEU BABA character, securely log in, maintain their own profile, use private features, send a private message to the developer, submit resources for moderation, and use the application from browser or installed PWA without seeing another student's private data; administrators and developers can perform their authorized responsibilities; and every sensitive operation is enforced by backend/database authorization rather than frontend assumptions.

The interface should look effortless.

The architecture underneath should be strict.

That combination is the standard BEU BABA must follow.


# APPENDIX A — IMPLEMENTATION CONTRACT FOR AI CODING AGENTS

This appendix defines how an AI coding agent should interpret this document when implementing BEU BABA. It is intentionally explicit because authentication is an area where an apparently working implementation can still contain serious authorization flaws.

## A.1 Source of truth

The coding agent must treat the database schema, RLS policies, storage policies, authentication provider configuration, and server-side authorization as authoritative.

The agent must not create an alternative authorization mechanism in:

- localStorage;
- sessionStorage;
- URL parameters;
- cookies created manually;
- React state;
- environment variables exposed to the browser;
- hidden UI routes.

UI state can mirror trusted authorization state but cannot replace it.

## A.2 Do not invent credentials

Never generate:

- service-role secrets;
- database passwords;
- private API keys;
- SMTP passwords;
- signing secrets.

Use environment variables and documented deployment configuration.

If a required secret is missing, the implementation should fail safely and clearly rather than inserting a placeholder that could accidentally reach production.

## A.3 Database-first implementation

Before creating profile screens, define:

1. profile schema;
2. role schema;
3. foreign keys;
4. constraints;
5. RLS;
6. storage policies;
7. safe queries;
8. update policies.

Then build UI against that contract.

Do not build a fake frontend model first and attempt to secure it later.

## A.4 Migration discipline

Each schema change must have a migration.

Migrations should be:

- deterministic;
- repeatable in a clean environment;
- reviewed;
- named clearly;
- free from production-only assumptions.

Avoid destructive migrations unless explicitly intended.

## A.5 Seed academic references

Seed only non-sensitive reference data.

Examples:

```text
courses
branches
semesters
subjects
```

Do not seed real student information into source-controlled files.

## A.6 Environment separation

Use separate Supabase projects or otherwise isolated environments for:

```text
development
staging
production
```

Never point local destructive testing at production.

## A.7 Type generation

Generate database types from the actual schema.

The frontend should consume typed records.

If a database field is nullable, TypeScript should represent that nullability.

Do not suppress errors with `as any`.

## A.8 Service boundaries

A good structure is:

```text
src/
  app/
  components/
  features/
    auth/
    profile/
    quiz/
    resources/
    support/
    admin/
  hooks/
  lib/
  services/
  types/
```

Auth logic belongs in the auth feature/service boundary.

Profile logic belongs in profile services.

Support queries belong in support services.

This prevents security-sensitive queries from being copied into arbitrary components.

## A.9 Query rules

Every query should answer:

```text
Who is requesting this?
What entity are they requesting?
Why are they allowed to see it?
```

For private data, the ownership condition must be enforced at the database layer.

## A.10 Mutation rules

Every mutation must define:

```text
authentication requirement
authorization requirement
validation
rate-limit requirement
audit requirement
error behavior
```

For example, approving a resource:

```text
authenticated
+
admin/developer authorization
+
resource exists
+
resource pending
+
audit record
=
approved
```

A frontend click alone must never cause approval.

## A.11 UI behavior when authorization fails

If a database operation returns unauthorized:

```text
Do not crash.
Do not reveal SQL details.
Do not retry endlessly.
Do not silently pretend success.
```

Instead:

```text
You don't have permission to perform this action.
```

or redirect to a safe page.

## A.12 Optimistic UI restrictions

Optimistic updates are acceptable for low-risk interactions such as bookmarks.

They are risky for:

- role changes;
- moderation;
- account deletion;
- permissions;
- security settings.

For sensitive actions, wait for trusted server/database confirmation.

## A.13 Caching

Use query caching for performance.

But private cache keys must be user-aware.

Never reuse one student's private query cache for another authenticated session.

When logout occurs, clear private client state.

## A.14 Query-key discipline

Conceptually:

```text
profile:userId
bookmarks:userId
progress:userId
support:userId
```

Never use a generic:

```text
profile
```

cache key if it could accidentally survive user switching.

## A.15 User switching

Testing should explicitly cover:

```text
login Student A
↓
load profile
↓
logout
↓
login Student B
↓
verify Student A private state is not visible
```

This catches many cache/state bugs.

## A.16 Account deletion state

After successful account deletion:

```text
private stores cleared
session cleared
auth state unauthenticated
protected routes unavailable
```

Do not leave the deleted user's profile in active client state.

## A.17 Browser back button

After logout, pressing Back should not reveal usable private pages from browser cache.

Route protection should run again.

Sensitive pages should not rely solely on browser history behavior.

## A.18 Tab synchronization

If multiple tabs are open and the user logs out in one tab, authentication state should eventually synchronize.

Use the auth provider's session event behavior rather than inventing custom security signals.

## A.19 Developer message notifications

If a developer replies:

```text
thread.updated
```

the student may receive a notification.

But notification content should avoid exposing private message content in unsafe contexts.

A lock-screen notification might say:

```text
You have a new BEU BABA support reply.
```

rather than displaying sensitive text.

## A.20 Resource approval notification

After approval:

```text
Your resource has been approved.
```

After rejection:

```text
Your resource needs changes.
```

If a rejection reason is shown, ensure it does not expose internal moderation information.

## A.21 Admin dashboard privacy

Admin tables should not fetch every column merely because the table can display them.

Use purpose-built queries.

For example:

```text
student list:
id
name
course
branch
email
status
created_at
```

A student detail view may fetch additional fields only when needed.

## A.22 Pagination

Admin student/resource lists must be paginated.

Never load thousands of rows into the browser by default.

Use:

```text
page
limit
cursor
```

according to the chosen query architecture.

## A.23 Search

Search should be server-side for large datasets.

Never download the entire student database and filter it in JavaScript.

## A.24 Search privacy

Search results must still respect authorization.

A search endpoint that can find another student's phone number is a privacy failure even if the normal student directory is hidden.

## A.25 Support search

Developer/support users may search support threads.

The scope of the search should match their role.

Do not create a universal search that exposes all application data.

## A.26 Logging

Use structured logs.

Safe:

```text
action: resource_approved
actor: internal_user_id
resource: resource_id
```

Unsafe:

```text
password: ...
token: ...
full_private_message: ...
```

## A.27 Error monitoring

Errors should include technical context where safe:

```text
feature
operation
request ID
environment
```

Avoid private user content.

## A.28 Request IDs

For important support operations, a request/correlation ID can help troubleshooting.

If a student reports:

```text
"Something went wrong"
```

support can correlate the event without exposing internal infrastructure.

## A.29 File names

Normalize uploaded file names.

Do not allow path traversal-like values to influence storage paths.

Never construct storage paths directly from arbitrary raw user filenames.

## A.30 File previews

PDF/image previews must respect the same authorization as downloads.

A preview is still data access.

## A.31 Public resource publishing

When a resource becomes approved:

```text
moderation status
↓
publish state
↓
public access policy
```

must all align.

Do not mark a row public while the storage policy remains private unless that behavior is intentional.

## A.32 Resource replacement

If an admin replaces an approved file:

- preserve metadata where appropriate;
- update storage safely;
- invalidate old access where required;
- audit the change.

Do not orphan unlimited old files.

## A.33 Avatar privacy

If avatars are private, use private storage and authorized access.

If avatars are intentionally public, store only what is necessary and document that visibility.

Do not accidentally make every profile image public because it simplifies `<img src>` usage.

## A.34 Signed URL lifecycle

If signed URLs are used:

- keep expiry reasonable;
- generate them only for authorized requests;
- avoid persisting them permanently;
- refresh when necessary.

A signed URL is an access credential for its validity period.

## A.35 Academic content integrity

Students should not be able to modify published syllabus/calendar records.

A correction should go through:

```text
student report
↓
admin review
↓
content update
```

This is especially important because students may rely on academic dates.

## A.36 Change history

For syllabus/calendar updates, consider storing:

```text
version
updated_by
updated_at
change_note
```

This helps identify what changed.

## A.37 Rollback

Admin content updates should be designed so a mistake can be corrected.

For critical academic data, prefer versioned records or an audit trail.

## A.38 Student data correction

A student should be able to request correction if:

```text
branch incorrect
name incorrect
contact incorrect
```

The system can permit direct editing for low-risk fields and support review for sensitive academic identity fields.

## A.39 Academic identity fields

If roll number or enrollment ID is later introduced, consider stronger restrictions than ordinary profile fields.

Do not let students freely edit an official institutional identifier if it is used for academic verification.

## A.40 Data import

If administrators import student data from CSV:

- validate columns;
- validate identifiers;
- preview changes;
- require confirmation;
- audit the import;
- avoid overwriting unrelated data.

## A.41 Bulk operations

Bulk admin actions should have explicit confirmation.

Example:

```text
Approve 24 resources?
```

Do not allow an accidental click to alter hundreds of records.

## A.42 Destructive bulk actions

Require stronger confirmation for:

```text
delete
suspend
unpublish
```

Provide a summary of affected records.

## A.43 Accessibility of security UI

Security controls must remain usable with keyboard and screen readers.

Do not use icon-only buttons without accessible labels.

## A.44 Reduced motion

If:

```text
prefers-reduced-motion: reduce
```

then:

- remove page slide transitions;
- remove avatar bounce;
- reduce modal movement;
- eliminate decorative parallax;
- retain essential feedback through opacity/state changes.

## A.45 Glass fallback

If backdrop blur is unsupported:

```text
use translucent opaque-ish surface
```

rather than breaking readability.

The product should still look premium without blur.

## A.46 High contrast

Glass transparency must not make text disappear.

If contrast testing fails:

```text
increase surface opacity
reduce background complexity
increase text contrast
```

The visual concept is subordinate to accessibility.

## A.47 Network state

Authentication should distinguish:

```text
invalid credentials
network unavailable
server unavailable
session expired
account blocked
verification required
```

These have different user actions.

## A.48 Retry behavior

Only retry operations that are safe to retry.

For example:

```text
GET profile
```

may be retried.

A mutation such as:

```text
submit resource
```

must be protected against accidental duplicate submissions.

## A.49 Idempotency

Where practical, important mutations should be idempotent.

Example:

A bookmark creation request should not create ten identical rows if the user taps rapidly.

Database unique constraints are an excellent safety layer.

## A.50 Double submission

Buttons must enter a pending state immediately.

But the backend should still protect against duplicate requests.

Frontend protection alone is insufficient.

## A.51 Message duplicate protection

A support message should not be sent twice because of:

```text
slow network
double tap
browser retry
```

Use appropriate database design and client mutation handling.

## A.52 Resource duplicate protection

If the same upload is submitted twice, the admin panel should be able to identify duplicates.

This is a moderation/product feature rather than solely a security feature.

## A.53 User-facing security language

Avoid scary technical language.

Bad:

```text
RLS POLICY DENIED
```

Better:

```text
You don't have permission to access this.
```

## A.54 Developer-facing security language

Developer/admin dashboards may show more technical diagnostics, but never secrets.

Useful:

```text
Policy denied
Resource ownership mismatch
Validation failed
```

## A.55 Testing matrix

At minimum test:

```text
Chrome desktop
Edge desktop
Android Chrome
iOS Safari
installed Android PWA
installed desktop PWA
slow network
offline
expired session
multiple tabs
small screen
large screen
keyboard open
reduced motion
```

## A.56 Auth QA scenario

Scenario:

```text
1. Register.
2. Verify email if required.
3. Login.
4. Close browser.
5. Reopen PWA.
6. Confirm session restoration.
7. Open profile.
8. Edit avatar.
9. Send developer message.
10. Logout.
11. Attempt protected URL.
12. Confirm login gate.
```

## A.57 Cross-account QA

Scenario:

```text
1. Login A.
2. Create private message.
3. Logout.
4. Login B.
5. Attempt to access A thread.
6. Confirm denial.
7. Check client cache.
8. Confirm A data is not displayed.
```

## A.58 Admin QA

Scenario:

```text
1. Student attempts admin route.
2. Confirm denial.
3. Admin logs in.
4. Open admin dashboard.
5. Approve resource.
6. Verify audit record.
7. Student receives correct published status.
```

## A.59 Storage QA

Scenario:

```text
1. Student A uploads avatar.
2. Student B attempts direct path access if private.
3. Confirm denial.
4. Student A updates avatar.
5. Confirm old file handling.
```

## A.60 Final coding-agent rule

If a feature request conflicts with privacy or authorization:

```text
security wins.
```

If a visual requirement conflicts with readability:

```text
readability wins.
```

If an animation conflicts with performance:

```text
performance wins.
```

If a shortcut conflicts with data integrity:

```text
data integrity wins.
```

If a feature can be implemented securely in a simpler way:

```text
choose the simpler secure implementation.
```

BEU BABA should feel sophisticated to the student while remaining deliberately conservative underneath.
