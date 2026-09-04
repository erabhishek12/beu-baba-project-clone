# BEU BABA — 01. PRODUCT REQUIREMENTS & MASTER PRODUCT SPECIFICATION

> **Status:** Mandatory product source of truth
> **Project:** BEU BABA
> **Primary platform:** Responsive Progressive Web App
> **Technical baseline:** React + Vite + TypeScript + Supabase/PostgreSQL
> **Visual baseline:** Premium light transparent Apple-inspired glassmorphism
> **Critical visual exclusions:** No black/dark primary theme, no RGB/neon, no cyberpunk, no AI-style background, no unnecessary 3D background decoration

## 0. DOCUMENT AUTHORITY

This document defines the product-level contract: what BEU BABA is, who it serves, what major capabilities it must provide, what behavior is required, and what quality bar must be met before implementation is considered complete.


BEU BABA is a premium academic Progressive Web App whose primary job is to make
university study information, practice material, utilities, student support,
and managed academic resources available through one coherent product.

The visual direction is mandatory: a bright, light, transparent, physically
believable glass interface inspired by the material discipline of modern
premium mobile operating systems. The product must not use a black primary
theme, dark glass as the dominant surface, RGB/neon lighting, cyberpunk styling,
large decorative 3D objects in the background, AI-looking particle scenes,
or visual effects that compete with academic content. Glass is a material and
hierarchy mechanism, not a decoration applied to everything.

The technical baseline is React + Vite + TypeScript with Supabase/PostgreSQL,
Supabase Auth, controlled storage, a PWA layer, and a service-oriented frontend
architecture. The exact implementation may evolve, but the behavioral contracts
must remain stable.

All academic content must be database/content-management driven wherever the
administrator may reasonably need to change it later. Syllabus, yearly calendar,
PYQ metadata, courses, subjects, notices, quizzes, resources, developer
information, and configurable links must not require a source-code deployment
for ordinary content changes.

Students must authenticate before accessing protected student functionality.
Registration should collect the required academic identity information such as
name, course, branch, semester/year context, email, contact information and
other fields defined by the product owner. The student may upload a profile
image during onboarding. BEU BABA may also assign/select an application
character based on the stored gender selection; this is an application avatar
system and must not be treated as a security identity.

Students can submit educational resources. A submission is never public merely
because an upload succeeded. It enters a moderation lifecycle and becomes
visible to the public student catalog only after an authorized administrator
approves it.

Students can send private messages to the developer/support team. A message
must be visible to the sender and authorized developer/admin personnel only.
Another student must never be able to read the conversation by changing a URL,
ID, request body, or frontend state.

The Student Toolbox contains multiple practical daily-use utilities. Each tool
should have a clear purpose, accessible controls, safe input validation,
responsive behavior, and an obvious reset/restart mechanism where appropriate.

Quizzes are server-authoritative. The client may display progress and choices,
but final scoring and persistence must be protected by backend/database rules.
Quiz results can generate a downloadable/shareable result card, but the card
must be based on verified result data.

The application must support useful notifications, PWA installation, controlled
offline behavior, safe application updates, bookmarks/favorites, search,
loading/empty/error states, accessibility, responsive layouts, analytics,
auditability, and a professional admin panel.

The product should feel simple to a student, powerful to an administrator,
strictly controlled by the backend, and maintainable by another developer who
did not build the original system.


## 01. PRODUCT VISION

### 01. PRODUCT VISION

**Requirement**

Define BEU BABA as a unified academic companion rather than a PDF repository.

**User and system behavior**

A student should open one product and find the academic information normally scattered across university pages, folders, messaging groups and separate utility sites. The product should combine study discovery, academic reference, practice, tools, support and notifications without making the navigation complicated.

**Edge cases and failure handling**

The system must remain useful even when a particular content category has no records. Empty sections must explain what is unavailable instead of rendering broken cards or misleading counts.

**Implementation guidance**

Use a modular feature architecture. Keep product concepts independent enough that PYQ, syllabus, calendar, quiz, resources, support and toolbox can evolve without rewriting the navigation shell.

**Acceptance criteria**

A new student can understand the primary purpose of the app within the first session, reach the main academic areas quickly, and never needs to know the internal database structure.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 02. PRODUCT PRINCIPLES

### 02. PRODUCT PRINCIPLES

**Requirement**

Establish non-negotiable principles for usability, privacy, correctness, maintainability and visual quality.

**User and system behavior**

Every feature should be evaluated for clarity, usefulness, accessibility, security, performance and consistency before being accepted. The product should prefer a smaller number of polished interactions over a large number of decorative effects.

**Edge cases and failure handling**

Avoid feature creep that introduces unnecessary social feeds, public student profiles, noisy gamification, or distracting visual elements merely because they are technically possible.

**Implementation guidance**

Create a requirement checklist and use it during design review, implementation review and release review.

**Acceptance criteria**

Every major feature has an explicit purpose, owner, data source, permissions, lifecycle, failure behavior and acceptance criteria.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 03. TARGET USERS

### 03. TARGET USERS

**Requirement**

Define the primary student user and secondary administrative users.

**User and system behavior**

The primary user is a university student looking for academic resources, practice material, schedules, utilities and support. Secondary users include content administrators, moderators, developers/support personnel and super administrators.

**Edge cases and failure handling**

Do not assume all students have high-end phones, unlimited bandwidth, large screens or permanent connectivity.

**Implementation guidance**

Use mobile-first interaction patterns while supporting tablet and desktop layouts. Keep the admin interface information-dense but still readable.

**Acceptance criteria**

Core student workflows work on ordinary mobile hardware and common desktop browsers; administrator workflows remain efficient with keyboard, mouse and touch.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 04. CORE STUDENT VALUE

### 04. CORE STUDENT VALUE

**Requirement**

Make the product meaningfully more useful than a static university resource list.

**User and system behavior**

The home experience should prioritize the student's current academic context, quick access to common resources, recently used items, important notices, quiz practice, toolbox utilities and support.

**Edge cases and failure handling**

Do not fabricate personalized progress or recommendations when insufficient data exists. Use neutral states such as 'Start exploring' instead.

**Implementation guidance**

Build a data-driven dashboard with small composable modules rather than one giant hard-coded component.

**Acceptance criteria**

The dashboard remains useful for both a new account and an active student with history.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 05. INFORMATION ARCHITECTURE

### 05. INFORMATION ARCHITECTURE

**Requirement**

Define the major navigation domains.

**User and system behavior**

Recommended domains are Home, Courses/Study, PYQ, Syllabus, Calendar, Quiz, Resources, Toolbox, Notifications, Profile and Support, with administration isolated behind privileged routes.

**Edge cases and failure handling**

A feature may have a deep link but must still have a discoverable parent context and a safe back-navigation path.

**Implementation guidance**

Use a central route registry and route metadata so titles, access requirements and deep-link behavior remain consistent.

**Acceptance criteria**

No feature creates its own unrelated navigation convention.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 06. AUTHENTICATION AND ONBOARDING

### 06. AUTHENTICATION AND ONBOARDING

**Requirement**

Require account creation and secure authentication before protected student functions.

**User and system behavior**

Registration collects required academic profile information, validates it, stores authentication separately from profile data, and then completes onboarding. Profile photo upload is optional or required according to the final product decision; the UI must clearly communicate which.

**Edge cases and failure handling**

Handle duplicate email, invalid input, interrupted upload, expired verification, password reset, session expiry and partial onboarding.

**Implementation guidance**

Use Supabase Auth for credentials and a separate profile record for application data. Never store passwords in the application database.

**Acceptance criteria**

A student can register, verify where required, complete profile setup, leave and return, and resume safely without duplicated accounts.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 07. STUDENT PROFILE

### 07. STUDENT PROFILE

**Requirement**

Give each student a controlled academic profile.

**User and system behavior**

The profile should display the student's name, academic identity, contact fields permitted by the privacy policy, profile image or application character, and relevant personal app settings.

**Edge cases and failure handling**

Private fields must not become publicly queryable simply because the profile component renders them for the owner.

**Implementation guidance**

Enforce ownership using database policies. Treat profile image storage as protected user-owned data where appropriate.

**Acceptance criteria**

Student A cannot read or mutate Student B's protected profile data through any client request.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 08. ACADEMIC TAXONOMY

### 08. ACADEMIC TAXONOMY

**Requirement**

Create a consistent hierarchy for course, branch, semester, subject and content.

**User and system behavior**

Academic records should use stable IDs and explicit relationships. Content can then be filtered by the student's course/branch/semester without duplicating the same PDF metadata everywhere.

**Edge cases and failure handling**

Academic structures change over time. A subject name may change, a branch may be renamed, or a semester structure may differ by curriculum/version.

**Implementation guidance**

Use normalized taxonomy tables plus content-version records where historical correctness matters.

**Acceptance criteria**

An administrator can update academic structure without editing frontend source code, and existing content remains traceable.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 09. SYLLABUS

### 09. SYLLABUS

**Requirement**

Provide syllabus information as a first-class feature.

**User and system behavior**

Students should be able to select course, branch, semester and curriculum/version, then see the currently published syllabus and relevant historical versions where the product chooses to expose them.

**Edge cases and failure handling**

Never silently replace a syllabus in a way that changes historical references without recording the change.

**Implementation guidance**

Use versioned syllabus records, publication status, effective dates, file references and audit history.

**Acceptance criteria**

An administrator can publish a new syllabus while retaining enough metadata to explain what changed.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 10. YEARLY ACADEMIC CALENDAR

### 10. YEARLY ACADEMIC CALENDAR

**Requirement**

Make academic calendar information editable without redeploying the application.

**User and system behavior**

The calendar can contain an official document plus structured event records such as semester start, examinations, holidays, result dates and important academic milestones.

**Edge cases and failure handling**

Calendar events may be revised. A correction must not produce duplicate events or leave an obsolete event marked as current.

**Implementation guidance**

Store structured event records separately from uploaded documents where filtering and notifications require it. Use explicit effective status and audit history.

**Acceptance criteria**

An administrator can correct a calendar event, preview it, publish it and verify the student-facing result.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 11. PYQ SYSTEM

### 11. PYQ SYSTEM

**Requirement**

Make previous-year questions searchable and easy to use.

**User and system behavior**

Students should filter by course, branch, semester, subject, year, exam/session and paper type where applicable. Metadata should be visible before a file is opened.

**Edge cases and failure handling**

Duplicate files, mislabeled years, missing subjects, broken files and inaccessible storage must be handled without corrupting the catalog.

**Implementation guidance**

Store metadata separately from the file object. Use controlled storage and a validation workflow before publication.

**Acceptance criteria**

Students can find a relevant PYQ using multiple filters and open the correct file without ambiguous duplicates.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 12. COURSE AND LESSON SYSTEM

### 12. COURSE AND LESSON SYSTEM

**Requirement**

Support courses as structured learning content rather than only links.

**User and system behavior**

A course can contain modules, lessons, videos, notes, quizzes, resources and progress markers. YouTube-hosted videos can use detected thumbnails and safe embed metadata.

**Edge cases and failure handling**

A video may be unavailable, private, deleted or changed externally. The UI must not pretend the content is playable if it is not.

**Implementation guidance**

Use content records with explicit provider metadata, duration, thumbnail state, publication state and optional access rules.

**Acceptance criteria**

A course can be reordered and updated by an administrator without rewriting screen components.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 13. QUIZ EXPERIENCE

### 13. QUIZ EXPERIENCE

**Requirement**

Provide repeatable practice with trustworthy results.

**User and system behavior**

Students see a clear start state, question progress, options, optional explanation behavior, timer rules where enabled, submission confirmation and a result screen.

**Edge cases and failure handling**

Network loss, refresh, duplicate submission, timer expiry and browser closure must have defined behavior.

**Implementation guidance**

Use server-authoritative attempt IDs and result persistence. Client state is for interaction; server state is authoritative.

**Acceptance criteria**

A completed quiz produces one trustworthy result and cannot be submitted repeatedly to create duplicate attempts accidentally.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 14. QUIZ RESULT CARD

### 14. QUIZ RESULT CARD

**Requirement**

Allow students to download/share a polished quiz result card.

**User and system behavior**

The card should show verified result information, quiz title, score/percentage, date and optional student display name according to privacy settings.

**Edge cases and failure handling**

Do not put private identifiers, internal database IDs, email addresses or sensitive profile fields onto a shareable image.

**Implementation guidance**

Generate from validated result data. If client-side rendering is used, use only fields the server has already authorized for display.

**Acceptance criteria**

The downloaded card matches the stored result and does not expose private information.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 15. STUDENT TOOLBOX

### 15. STUDENT TOOLBOX

**Requirement**

Provide 10+ useful everyday student utilities in one consistent section.

**User and system behavior**

Each tool should have a short explanation, clean input controls, immediate results, reset behavior and mobile-friendly layout. Examples may include calculator utilities, percentage/CGPA helpers, unit conversion, age/date calculations, timers, study session tools, file-size helpers and other non-sensitive daily tools.

**Edge cases and failure handling**

Invalid numeric input, impossible dates, division by zero, extremely large values and unsupported units must produce safe messages rather than NaN/Infinity or broken layouts.

**Implementation guidance**

Implement each tool as an isolated module sharing common form, result and validation components.

**Acceptance criteria**

Every published toolbox utility has a documented formula or rule, test cases and accessible controls.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 16. STUDENT RESOURCE SUBMISSION

### 16. STUDENT RESOURCE SUBMISSION

**Requirement**

Allow students to contribute useful academic resources while protecting the public catalog.

**User and system behavior**

A student selects resource type, title, subject/category, optional description and file, accepts submission rules and submits. The system displays a pending state immediately after successful upload/record creation.

**Edge cases and failure handling**

Large files, unsupported formats, duplicate submissions, abusive text, malicious filenames and interrupted uploads must be handled.

**Implementation guidance**

Store uploads in a non-public or moderation-controlled location first. Create a database submission record with status and owner.

**Acceptance criteria**

Uploading never automatically publishes. The owner can see their own submission status, while other students cannot see private pending data.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 17. MODERATION

### 17. MODERATION

**Requirement**

Create a controlled review pipeline for student-submitted content.

**User and system behavior**

Administrators see a moderation queue with file preview/download where permitted, metadata, submitter information appropriate to their role, validation warnings and actions such as approve, reject, request changes or archive.

**Edge cases and failure handling**

Two administrators may review the same item. The system must prevent conflicting final states or clearly resolve them.

**Implementation guidance**

Use explicit status transitions, transactional updates where needed, audit events and optimistic concurrency controls.

**Acceptance criteria**

Every moderation action has an actor, timestamp, previous state, new state and reason where required.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 18. DEVELOPER SUPPORT

### 18. DEVELOPER SUPPORT

**Requirement**

Provide direct private communication from student to developer/support.

**User and system behavior**

A student can start a support conversation, choose a category such as bug, course update, syllabus update, resource issue or general request, write a message and optionally attach permitted evidence.

**Edge cases and failure handling**

Messages must remain private. A student cannot alter another conversation ID to gain access.

**Implementation guidance**

Use conversation ownership plus RLS. Store attachments separately with protected policies. Notify authorized support staff when a new message arrives.

**Acceptance criteria**

Student A can only see Student A's conversations; authorized support staff can respond; Student B cannot access the thread.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 19. NOTIFICATIONS

### 19. NOTIFICATIONS

**Requirement**

Notify students about genuinely useful changes.

**User and system behavior**

Notifications may cover syllabus updates, calendar changes, new quizzes, resource moderation results, support replies, notices and important app events.

**Edge cases and failure handling**

Do not spam. Respect user preferences, permission state, duplicate prevention, invalid push subscriptions and deep-link validity.

**Implementation guidance**

Use in-app notifications as the source of user-visible history, with web push as an optional delivery channel.

**Acceptance criteria**

A notification can be traced to an event, has a read state, respects permissions, and opens only to an authorized destination.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 20. SEARCH

### 20. SEARCH

**Requirement**

Make academic content discoverable without forcing students to navigate multiple screens.

**User and system behavior**

Search should find titles, subjects, course names, resource labels, notices and other indexed content. Results must show type and context.

**Edge cases and failure handling**

Do not leak private resources, pending submissions, private support messages or admin-only records through search indexing.

**Implementation guidance**

Build a server-side or controlled search index from published content only. Apply user-specific visibility rules.

**Acceptance criteria**

A search result is never more visible than the underlying content permission allows.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 21. BOOKMARKS AND HISTORY

### 21. BOOKMARKS AND HISTORY

**Requirement**

Let students save useful content and continue later.

**User and system behavior**

Students can bookmark eligible resources, and the app may show recently opened items or progress where defined.

**Edge cases and failure handling**

Deleted or unpublished content must not produce broken permanent bookmarks.

**Implementation guidance**

Use stable content IDs and soft-deletion/archive semantics where historical references matter. Resolve unavailable bookmarks gracefully.

**Acceptance criteria**

Bookmarks are private to the owner and remain safe across devices.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 22. ADMINISTRATIVE CONTENT CONTROL

### 22. ADMINISTRATIVE CONTENT CONTROL

**Requirement**

Allow ordinary academic changes without developer intervention.

**User and system behavior**

Admins can create drafts, upload files, edit metadata, preview, publish, unpublish, archive, reorder and restore according to role.

**Edge cases and failure handling**

Accidental publication and deletion are high-impact operations.

**Implementation guidance**

Use draft/review/publish lifecycle, confirmation for destructive operations, version history and audit logging.

**Acceptance criteria**

A non-technical administrator can maintain normal academic content safely.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 23. RESPONSIVE AND ACCESSIBLE EXPERIENCE

### 23. RESPONSIVE AND ACCESSIBLE EXPERIENCE

**Requirement**

Support phone, tablet and desktop users.

**User and system behavior**

Navigation adapts without changing the information model. Touch targets remain usable, text remains readable and tables become scrollable or reorganized rather than squeezed.

**Edge cases and failure handling**

Very narrow screens, large text settings, keyboard-only use, reduced motion and low-contrast environments must not break core workflows.

**Implementation guidance**

Use semantic HTML, logical focus order, accessible labels, responsive containers and reduced-motion media queries.

**Acceptance criteria**

Core workflows pass keyboard, screen-reader-oriented and reduced-motion review.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 24. PWA AND OFFLINE

### 24. PWA AND OFFLINE

**Requirement**

Make the application installable and resilient without making false offline promises.

**User and system behavior**

The app shell can load from cache when supported. Selected content may be available offline only when explicitly cached or stored. Online synchronization remains the authority for server data.

**Edge cases and failure handling**

Authentication expiration, cache corruption, multiple accounts on one device and stale academic content require careful handling.

**Implementation guidance**

Use a service worker with versioned caches, safe cache invalidation and user-aware data isolation. Never cache sensitive data indiscriminately.

**Acceptance criteria**

An installed app can launch reliably, update safely and clearly communicate what is unavailable offline.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 25. PRODUCT SUCCESS CRITERIA

### 25. PRODUCT SUCCESS CRITERIA

**Requirement**

Define success as reliability and usefulness, not the number of visual effects.

**User and system behavior**

Students should be able to complete the primary journey from registration to academic discovery, quiz, toolbox, resource submission and support without confusion.

**Edge cases and failure handling**

A beautiful screen that loses data, exposes private messages, shows stale syllabus information as current or breaks on a low-end device is a product failure.

**Implementation guidance**

Use release gates covering product, design, security, performance, accessibility, content correctness and operations.

**Acceptance criteria**

The product is accepted only when the complete system behaves consistently under normal and failure conditions.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## CROSS-CUTTING REQUIREMENT — CONTENT CORRECTNESS

Academic information is authoritative content. The system must distinguish current/published records from drafts, archived records and historical versions. A correction should be traceable and should never silently rewrite the meaning of a historical record.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — PRIVACY BY DESIGN

Collect only fields needed for product functionality. Student contact details, support conversations, profile images, quiz history and moderation information must be scoped to the people who need them. Public sharing must be deliberate.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — PERFORMANCE BUDGET

The visual quality must never justify oversized assets, unnecessary JavaScript, repeated database reads or expensive animation. Course thumbnails and profile images should be compressed, lazy-loaded and served at appropriate dimensions.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — ERROR DESIGN

Every asynchronous feature needs loading, success, empty, error, retry and unauthorized states. Error messages should explain what the user can do next without exposing database or security internals.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — MOTION DESIGN

Motion should communicate hierarchy, state change and physical continuity. Navigation selection, search expansion, course-card scrolling, modal entry and result transitions may be animated. Backgrounds should remain calm.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — GLASS MATERIAL

Glass should be translucent enough that the layer behind it remains perceptible, while text and controls remain readable. Use restrained blur, thin highlight borders and soft depth. Avoid stacking many opaque translucent layers.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — DATA LIFECYCLE

Every major content entity needs creation, update, publication, archive and deletion semantics. Prefer archive/soft-delete for academic content that may have historical references.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — OBSERVABILITY

Production failures should be diagnosable using structured logs, request IDs where appropriate, error tracking and audit events for privileged changes. Never log passwords, tokens or sensitive private message contents.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — ADMIN PRODUCTIVITY

The admin interface should optimize repeated tasks: search, filters, bulk operations, keyboard navigation, previews, drafts, status chips, audit history and safe confirmation. Decoration must not slow the administrator.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## CROSS-CUTTING REQUIREMENT — AI CODING AGENT COMPATIBILITY

The documentation is intended to be consumed by coding agents. Requirements should be explicit, contradictions should be avoided, and source-of-truth boundaries should be respected. Agents must not invent business rules merely because a UI mockup lacks them.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.

Implementation must preserve the distinction between presentation, application behavior, authorization, persistence and operational policy. Any implementation that moves a security decision entirely into the browser, hard-codes changeable academic content, or makes a visual effect more important than readability is non-compliant.


## FINAL PRODUCT DEFINITION OF DONE


BEU BABA is complete at the product level only when a new student can register,
complete an academic profile, reach the home experience, search for academic
content, open syllabus and calendar information, locate PYQs, use courses and
quizzes, receive a trustworthy result, download a result card, use the Student
Toolbox, submit an academic resource for moderation, see the submission status,
send a private developer/support message, receive a response notification,
manage their profile, bookmark useful content, install the PWA where supported,
and recover gracefully from ordinary network or application failures.

Administrators must be able to manage students within their permitted scope,
maintain academic taxonomy, upload and publish syllabus/calendar/PYQ/course
content, moderate student submissions, manage quizzes, respond to private
support messages, send appropriate notifications, inspect audit information,
and perform safe archive/restore workflows without editing application source
code for ordinary content changes.

The product must preserve a strict separation between what is visually shown
and what the backend authorizes. It must preserve student privacy, protect
uploads, maintain reliable academic versions, prevent accidental publication,
and remain performant on ordinary devices.

The visual identity must remain bright, transparent and premium. The glass
material should look physically layered rather than like a white opaque card.
The interface should feel calm and professional. No dark primary theme, black
glass, RGB/neon lighting, giant background 3D objects or AI-style decorative
effects may become part of the default experience.

The final standard is not "it has many features." The final standard is:
students can trust it, administrators can maintain it, developers can extend
it, and the system can explain its state when something goes wrong.

# EXTENDED PRODUCT SCENARIO MATRIX


### PRODUCT SCENARIO GROUP 01 — 01. PRODUCT VISION

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 02 — 02. PRODUCT PRINCIPLES

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 03 — 03. TARGET USERS

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 04 — 04. CORE STUDENT VALUE

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 05 — 05. INFORMATION ARCHITECTURE

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 06 — 06. AUTHENTICATION AND ONBOARDING

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 07 — 07. STUDENT PROFILE

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 08 — 08. ACADEMIC TAXONOMY

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 09 — 09. SYLLABUS

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 10 — 10. YEARLY ACADEMIC CALENDAR

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 11 — 11. PYQ SYSTEM

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 12 — 12. COURSE AND LESSON SYSTEM

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 13 — 13. QUIZ EXPERIENCE

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 14 — 14. QUIZ RESULT CARD

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 15 — 15. STUDENT TOOLBOX

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 16 — 16. STUDENT RESOURCE SUBMISSION

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 17 — 17. MODERATION

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 18 — 18. DEVELOPER SUPPORT

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 19 — 19. NOTIFICATIONS

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 20 — 20. SEARCH

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 21 — 21. BOOKMARKS AND HISTORY

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 22 — 22. ADMINISTRATIVE CONTENT CONTROL

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 23 — 23. RESPONSIVE AND ACCESSIBLE EXPERIENCE

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 24 — 24. PWA AND OFFLINE

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.


### PRODUCT SCENARIO GROUP 25 — 25. PRODUCT SUCCESS CRITERIA

**Normal flow.** The expected path must be short, obvious and reversible where possible. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**First-time user.** Do not assume previous history, cached data or familiarity with the feature. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Returning user.** Preserve useful state without displaying stale or unauthorized information. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Slow network.** Show progress and retain the user's safe input rather than appearing frozen. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Offline.** Expose only genuinely available cached capabilities and never fake server success. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Session expiry.** Protect private data, explain the need to sign in again and avoid losing safe local input. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Repeated action.** Prevent accidental duplicate writes, notifications, submissions or payments if any future paid feature appears. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Invalid input.** Provide field-level guidance and repeat validation on the server for important mutations. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Unauthorized request.** Reject it at the backend/database boundary regardless of frontend state. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Concurrent admin action.** Prevent silent overwrites and preserve auditability. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Archived content.** Keep references safe and communicate that the record is no longer current. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Small screen.** Maintain readable hierarchy and reachable controls without horizontal layout breakage. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Reduced motion.** Remove nonessential movement while preserving state and hierarchy. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Accessibility.** Provide semantic labels, focus, status messaging and keyboard operation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.

**Performance pressure.** Avoid unnecessary rendering, asset loading and expensive animation. The implementation must document the expected state before the action, the state during the action, the confirmed state after success, and the recovery state after failure. Where data changes, the authoritative server response must determine the final UI state. Where a local optimistic state is used, it must be reversible and must not be presented as confirmed persistence before the server responds.



## DOCUMENT CROSS-REFERENCE MAP

01 Product Requirements & Master Product Specification
→ defines product purpose, user value, feature scope and product-level acceptance.

02 Master Engineering Rules / Source of Truth
→ defines governance, precedence, implementation discipline and non-negotiable rules.

03 Design System
→ visual source of truth for typography, spacing, colors, glass materials, components and hierarchy.

04 Application Architecture & Functional Specification
→ functional behavior, navigation, feature contracts and system boundaries.

05 Database / Supabase Data Model & Security Specification
→ database entities, relationships, constraints and security considerations.

06 Design System / UI / UX / Animation Specification
→ detailed interaction patterns and motion behavior.

07 Frontend Architecture Engineering Specification
→ React/Vite/TypeScript structure, state management, reusable services and frontend engineering.

08 Supabase Database / Backend Data Architecture
→ backend persistence and data architecture.

09 API / Application Services / Backend Contract Specification
→ application-service interfaces and request/response contracts.

10 Product Architecture / Data Model / Content Management
→ structured content taxonomy and content lifecycle.

11 Backend API / Security / RLS Architecture
→ backend security boundary, RLS and protected operations.

12 Content CMS / Admin Panel Specification
→ content administration and publishing workflows.

13 Database / Supabase / Storage / RLS Backend Architecture
→ storage and backend implementation boundaries.

14 Admin Panel / Content Management / Moderation Operations
→ administrator operational workflows.

15 Quiz / Assessment Engine Specification
→ quiz lifecycle, attempts, scoring and results.

16 Notification / PWA / Offline / Sync Specification
→ web push, PWA, caching, offline and update behavior.

17 Security / Privacy / RBAC / Admin Audit Specification
→ security, roles, privacy, audit and abuse controls.

18 Production Testing / QA / Release Engineering
→ verification, regression, release gates and acceptance tests.

19 Glassmorphism Visual Design System
→ detailed light transparent glass material rules.

20 Advanced Component / Interaction / Motion System
→ component behavior and advanced motion.

21 Advanced Auth / Identity / Security System
→ identity, registration, profile security and session behavior.

22 Advanced Database / Data / Content Architecture
→ deeper data lifecycle and content architecture.

23 Advanced Admin Panel / CMS / Moderation System
→ advanced administrative control, moderation, versioning and operational management.

When a rule appears to overlap, the more domain-specific document governs its
implementation details while these two documents govern product intent and
engineering discipline. No document should be copied blindly into another.
Use references instead of creating contradictory duplicate rules.
