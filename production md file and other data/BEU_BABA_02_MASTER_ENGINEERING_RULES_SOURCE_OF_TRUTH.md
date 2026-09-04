# BEU BABA — 02. MASTER ENGINEERING RULES, SOURCE OF TRUTH & IMPLEMENTATION CONTRACT

> **Status:** Mandatory engineering governance specification
> **Project:** BEU BABA
> **Purpose:** Prevent architectural drift, design drift, security mistakes and undocumented behavior


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

## HOW TO READ THIS DOCUMENT


This document is the operational rulebook for implementing BEU BABA consistently.
It does not replace domain-specific specifications. Instead, it tells developers
and coding agents how to interpret them, which constraints are mandatory, how
to avoid contradictory implementations, and how to decide whether a proposed
feature is ready to enter production.

The repository should be treated as a specification-driven product. The
Markdown documents are not decorative project notes. They define contracts that
should be reflected in route structure, component boundaries, database schema,
RLS policies, storage policies, application services, tests and visual review.

When a rule is ambiguous, the implementation must prefer security, data
correctness, accessibility and existing source-of-truth contracts over visual
convenience. A missing detail should be resolved explicitly rather than hidden
inside a component.

## 01. SOURCE-OF-TRUTH HIERARCHY

### 01. SOURCE-OF-TRUTH HIERARCHY

**Requirement**

Define which specification wins when documents overlap.

**User and system behavior**

Use the most specific document for the relevant domain. Product requirements define why/what; functional architecture defines behavior; design system defines visual language; database architecture defines persistence; security/RLS defines authorization; API specification defines service contracts; QA defines verification.

**Edge cases and failure handling**

Contradictions must not be resolved by guessing in code.

**Implementation guidance**

Every document should reference the source-of-truth document for rules outside its scope.

**Acceptance criteria**

A developer can determine where a rule belongs without searching random components.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 02. NON-NEGOTIABLE VISUAL RULES

### 02. NON-NEGOTIABLE VISUAL RULES

**Requirement**

Protect the intended premium light glass identity.

**User and system behavior**

Use bright backgrounds, translucent surfaces, restrained blur, subtle borders and soft depth. Selected navigation may use a moving glass capsule. Search may expand smoothly. Course cards may have controlled scroll/scale motion.

**Edge cases and failure handling**

Never introduce dark glass as the default, RGB glow, neon outlines, large 3D background scenes, particle fields or excessive gradients.

**Implementation guidance**

Centralize colors, blur, opacity, border, radius, shadow and motion tokens.

**Acceptance criteria**

Visual review confirms the product is recognizably light, transparent, calm and premium.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 03. ARCHITECTURE BOUNDARIES

### 03. ARCHITECTURE BOUNDARIES

**Requirement**

Prevent frontend components from becoming a mixture of UI, database logic and authorization.

**User and system behavior**

Components render state and emit user intent. Hooks manage view state. Service functions handle application operations. Supabase/database policies enforce data access.

**Edge cases and failure handling**

A component must not directly implement privileged business rules merely because a button is hidden.

**Implementation guidance**

Use feature folders, typed service functions, validation schemas and reusable query/mutation helpers.

**Acceptance criteria**

A feature can be tested without mounting the entire application.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 04. ROUTING RULES

### 04. ROUTING RULES

**Requirement**

Define route ownership and access behavior.

**User and system behavior**

Public routes may include landing/login/register and carefully selected informational pages. Protected routes require a valid session. Admin routes require backend-verified roles.

**Edge cases and failure handling**

Expired sessions, direct deep links, unauthorized routes and stale browser history must be handled.

**Implementation guidance**

Use route metadata and centralized guards, while treating backend authorization as the real security boundary.

**Acceptance criteria**

Typing a protected URL manually cannot bypass access control.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 05. DATA OWNERSHIP RULES

### 05. DATA OWNERSHIP RULES

**Requirement**

Make ownership explicit.

**User and system behavior**

Student-owned records reference the authenticated user. Admin-owned actions record the acting administrator. Published academic content has a content owner/source context.

**Edge cases and failure handling**

Do not infer ownership from display names or email strings.

**Implementation guidance**

Use UUIDs and foreign keys, RLS policies and server-authoritative identity.

**Acceptance criteria**

Cross-user access attempts fail at the data layer.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 06. CONTENT PUBLICATION RULES

### 06. CONTENT PUBLICATION RULES

**Requirement**

Separate drafts from published content.

**User and system behavior**

Content passes through draft, review where required, published, unpublished/archived states.

**Edge cases and failure handling**

A file upload is not equivalent to publication.

**Implementation guidance**

Use status fields, version IDs, publication timestamps, audit records and explicit publish actions.

**Acceptance criteria**

Students only see records that are currently published and permitted.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 07. FILE AND STORAGE RULES

### 07. FILE AND STORAGE RULES

**Requirement**

Protect all uploaded files.

**User and system behavior**

Profile images, student submissions, academic PDFs and private support attachments have different access requirements.

**Edge cases and failure handling**

Never make every bucket public for convenience.

**Implementation guidance**

Use separate storage areas/policies where practical, metadata records, file type/size checks and signed URLs for protected objects.

**Acceptance criteria**

An unauthorized user cannot retrieve a protected object by guessing its path.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 08. FORM VALIDATION

### 08. FORM VALIDATION

**Requirement**

Validate at both client and server layers.

**User and system behavior**

The client provides immediate feedback. The server repeats important validation before accepting the mutation.

**Edge cases and failure handling**

Malformed requests may be intentionally constructed outside the UI.

**Implementation guidance**

Use shared schemas where practical, strict database constraints and normalized error responses.

**Acceptance criteria**

Invalid requests are rejected consistently even when the UI is bypassed.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 09. NOTIFICATION RULES

### 09. NOTIFICATION RULES

**Requirement**

Prevent notification abuse.

**User and system behavior**

Notifications should be relevant, deduplicated, preference-aware and linked to valid destinations.

**Edge cases and failure handling**

Repeated retries must not create notification storms.

**Implementation guidance**

Use event IDs/idempotency keys, notification preferences, delivery status and cleanup of invalid push subscriptions.

**Acceptance criteria**

A single underlying event does not produce accidental duplicate notifications.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 10. QUIZ INTEGRITY RULES

### 10. QUIZ INTEGRITY RULES

**Requirement**

Keep scoring authoritative.

**User and system behavior**

The client records interaction; the server validates the attempt and computes or confirms the result.

**Edge cases and failure handling**

Refresh, duplicate submit, timer expiry and manipulated request payloads must not create false scores.

**Implementation guidance**

Use attempt IDs, server timestamps, versioned question sets and transaction-safe result persistence.

**Acceptance criteria**

Two identical submissions cannot create contradictory final results for one attempt.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 11. MODERATION RULES

### 11. MODERATION RULES

**Requirement**

Treat user uploads as untrusted submissions.

**User and system behavior**

Every submission has an owner, status, metadata and moderation history.

**Edge cases and failure handling**

A moderator may accidentally approve the wrong item or two moderators may act concurrently.

**Implementation guidance**

Use explicit transitions, reasons, actor IDs, timestamps and concurrency protection.

**Acceptance criteria**

The moderation history explains who changed what and when.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 12. SUPPORT MESSAGE PRIVACY

### 12. SUPPORT MESSAGE PRIVACY

**Requirement**

Keep developer conversations private.

**User and system behavior**

Only the student owner and authorized support staff can read a conversation.

**Edge cases and failure handling**

Changing conversation IDs, using search, browser cache or direct API calls must not reveal another student's messages.

**Implementation guidance**

Apply RLS to conversations and messages; protect attachments; avoid putting private message bodies into push payloads.

**Acceptance criteria**

Privacy tests with two synthetic users consistently pass.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 13. ADMIN ROLE RULES

### 13. ADMIN ROLE RULES

**Requirement**

Use least privilege.

**User and system behavior**

Recommended roles include Super Admin, Content Admin, Moderator, Support/Developer and Analytics/Read-only roles, with exact permissions defined in the security specification.

**Edge cases and failure handling**

Do not make every admin a super admin.

**Implementation guidance**

Use database-enforced role checks and an explicit permission matrix.

**Acceptance criteria**

An administrator cannot perform an operation outside their role even if they manually call the endpoint.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 14. SEARCH INDEX RULES

### 14. SEARCH INDEX RULES

**Requirement**

Index only content the current user is allowed to discover.

**User and system behavior**

Published public academic content can be indexed. Private support messages and pending submissions must not be exposed through general search.

**Edge cases and failure handling**

Stale index entries can reveal archived titles or private metadata.

**Implementation guidance**

Index publication state and visibility rules; remove or mark stale entries during archive.

**Acceptance criteria**

Search results obey the same visibility boundary as direct content access.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 15. CACHING RULES

### 15. CACHING RULES

**Requirement**

Use caching to improve speed without leaking private data.

**User and system behavior**

Static assets and public published content can have longer cache lifetimes. Sensitive user data needs user-aware storage and invalidation.

**Edge cases and failure handling**

Switching accounts on one device must not display the previous user's data.

**Implementation guidance**

Namespace client caches by authenticated identity where appropriate and clear private caches on logout/account change.

**Acceptance criteria**

A second account never inherits the first account's private cached state.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 16. OFFLINE RULES

### 16. OFFLINE RULES

**Requirement**

Be honest about offline capability.

**User and system behavior**

Offline mode should expose cached shell/content only when actually available. Writes that require the server must show pending or unavailable states rather than fake success.

**Edge cases and failure handling**

A user may close the app before synchronization.

**Implementation guidance**

Use explicit local states, idempotent synchronization and conflict handling.

**Acceptance criteria**

The UI never claims a server mutation succeeded until the server confirms it.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 17. ANIMATION RULES

### 17. ANIMATION RULES

**Requirement**

Make motion useful and restrained.

**User and system behavior**

Use short transitions for selection, navigation, search expansion, card movement, modal entry and feedback.

**Edge cases and failure handling**

Excessive motion can hurt accessibility, battery and perceived speed.

**Implementation guidance**

Respect prefers-reduced-motion. Avoid continuous background animation.

**Acceptance criteria**

Users with reduced motion receive the same functionality without unnecessary movement.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 18. ACCESSIBILITY RULES

### 18. ACCESSIBILITY RULES

**Requirement**

Accessibility is a product requirement, not a final polish step.

**User and system behavior**

Use semantic controls, labels, visible focus, sufficient contrast, keyboard access and screen-reader-friendly status messages.

**Edge cases and failure handling**

Glass surfaces can reduce contrast if opacity and background are poorly controlled.

**Implementation guidance**

Test forms, modals, navigation, quizzes, tables and error messages with keyboard and accessibility tooling.

**Acceptance criteria**

Core journeys remain operable without pointer-only interactions.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 19. PERFORMANCE RULES

### 19. PERFORMANCE RULES

**Requirement**

Protect mobile responsiveness.

**User and system behavior**

Lazy-load heavy resources, compress images, avoid rendering huge lists at once, virtualize where needed and keep animation on composited properties.

**Edge cases and failure handling**

Large PDFs, course thumbnails, charts and admin tables can create memory pressure.

**Implementation guidance**

Use pagination, lazy loading, responsive images and measured performance budgets.

**Acceptance criteria**

Performance remains acceptable on ordinary mobile hardware and moderate network conditions.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 20. ERROR AND EMPTY-STATE RULES

### 20. ERROR AND EMPTY-STATE RULES

**Requirement**

Every feature needs a complete state model.

**User and system behavior**

Loading, empty, success, partial, offline, unauthorized, validation-error and server-error states must be considered.

**Edge cases and failure handling**

A generic spinner that never ends is not acceptable.

**Implementation guidance**

Define state machines or explicit async state contracts for important features.

**Acceptance criteria**

A user can always understand whether the app is loading, empty, failed or successfully updated.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 21. ADMIN AUDIT RULES

### 21. ADMIN AUDIT RULES

**Requirement**

Privileged actions must be accountable.

**User and system behavior**

Log important changes such as publication, role changes, moderation decisions, destructive operations and configuration changes.

**Edge cases and failure handling**

Audit logging itself must not expose secrets or private message contents unnecessarily.

**Implementation guidance**

Use append-oriented audit records with actor, action, target, previous/new state summaries and timestamp.

**Acceptance criteria**

A reviewer can reconstruct significant administrative changes.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 22. VERSIONING RULES

### 22. VERSIONING RULES

**Requirement**

Protect historical correctness.

**User and system behavior**

Syllabus, calendar, quiz content and important academic documents may require versions.

**Edge cases and failure handling**

Updating a record in place can make historical quiz attempts or academic references ambiguous.

**Implementation guidance**

Use immutable/versioned records where the meaning of past data must remain stable.

**Acceptance criteria**

Old references continue to resolve to the correct historical version where required.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 23. SECURITY NON-NEGOTIABLES

### 23. SECURITY NON-NEGOTIABLES

**Requirement**

Make the browser an untrusted client.

**User and system behavior**

The frontend may be inspected and modified. Backend authorization, RLS, storage policies and server-side validation must remain authoritative.

**Edge cases and failure handling**

Hidden buttons, secret URLs and disabled controls are not security controls.

**Implementation guidance**

Perform IDOR, role escalation, storage access, XSS, input validation and session tests.

**Acceptance criteria**

Security remains intact even when requests are manually crafted.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 24. CHANGE MANAGEMENT

### 24. CHANGE MANAGEMENT

**Requirement**

Prevent documentation drift.

**User and system behavior**

Any change to data shape, route, permission, UI contract, notification event, content lifecycle or design token must update the appropriate specification and tests.

**Edge cases and failure handling**

A developer may otherwise fix one screen while leaving another contract inconsistent.

**Implementation guidance**

Use versioned migrations, changelog entries, document cross-references and release checklists.

**Acceptance criteria**

The repository documentation and implementation describe the same behavior.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## 25. CODING-AGENT EXECUTION PROTOCOL

### 25. CODING-AGENT EXECUTION PROTOCOL

**Requirement**

Give AI coding agents a deterministic implementation process.

**User and system behavior**

Agents should first read the relevant source-of-truth documents, inspect the existing repository, identify reusable components, make the smallest coherent change, update types/tests, and verify all affected flows.

**Edge cases and failure handling**

Agents must not invent tables, routes, fields, permissions or visual effects simply because something is missing from a mockup.

**Implementation guidance**

Require a change plan, affected files, migration implications, security implications, test plan and acceptance criteria before large modifications.

**Acceptance criteria**

Another coding agent can continue the project without needing undocumented assumptions.

The important principle is that this area must remain understandable without
requiring the reader to infer hidden behavior from source code. A coding agent
should be able to identify the responsibility of the frontend, the application
service layer, the database, storage, and administrator interface. If a future
change affects ownership, publishing, privacy, scoring, or academic correctness,
the change must be reviewed against the existing source-of-truth documents
before implementation. A visually attractive screen is not considered complete
if the underlying state, error behavior, accessibility behavior, and security
behavior are undefined.

## MASTER IMPLEMENTATION CHECKLIST

1. **Read the relevant BEU BABA Markdown specifications before coding.**
2. **Identify whether the requested change is product, visual, motion, frontend, backend, database, security, content, PWA or QA work.**
3. **Identify the source-of-truth document for the requested domain.**
4. **Inspect existing routes, components, hooks, services, types, migrations and tests before creating duplicates.**
5. **Do not hard-code academic content that an administrator may need to change.**
6. **Do not put service-role secrets or privileged credentials in frontend code.**
7. **Do not treat hidden UI controls as authorization.**
8. **Do not make private storage objects public for convenience.**
9. **Do not publish student uploads automatically.**
10. **Do not expose private support messages through search or notifications.**
11. **Do not trust client-submitted user IDs, roles, scores or ownership claims.**
12. **Do not create notification storms on retry.**
13. **Do not create duplicate quiz attempts through repeated submission.**
14. **Do not silently replace version-sensitive academic content.**
15. **Do not introduce dark/RGB/neon/AI-background visual treatment.**
16. **Use transparent light glass only where it creates hierarchy.**
17. **Use animation only when it communicates state, continuity or feedback.**
18. **Respect reduced-motion preferences.**
19. **Use accessible semantic controls.**
20. **Test loading, empty, error, unauthorized and offline states.**
21. **Test mobile and desktop behavior.**
22. **Update tests and documentation when behavior changes.**
23. **Use migrations for database changes.**
24. **Verify RLS and storage policies independently of frontend behavior.**
25. **Review performance impact before shipping large assets or expensive effects.**
26. **Record important privileged operations in audit history.**
27. **Prefer reversible archive operations for important academic content.**
28. **Use stable IDs rather than display names as relationships.**
29. **Keep private caches isolated between accounts.**
30. **Never claim a feature is offline-capable unless the implementation actually supports it.**

## RELEASE GATE


A BEU BABA change is production-ready only when the product requirement,
implementation behavior, data model, security boundary, visual behavior,
accessibility behavior, error handling and verification method agree.

A feature is not complete because its happy path works.

The minimum review should ask:

1. What is the user trying to accomplish?
2. What data is read or changed?
3. Who owns that data?
4. Who is allowed to read it?
5. Who is allowed to mutate it?
6. What happens if the network fails?
7. What happens if the user repeats the action?
8. What happens if the user refreshes?
9. What happens if the session expires?
10. What happens if the content is archived?
11. What happens if two administrators act concurrently?
12. What is cached?
13. What is stored locally?
14. What is exposed in notifications?
15. What is recorded in audit logs?
16. What is the reduced-motion behavior?
17. What happens on a narrow screen?
18. What happens for keyboard-only users?
19. What tests prove the behavior?
20. Which Markdown document becomes the source of truth for future changes?

The visual gate has an equally strict requirement. The interface must remain
light, transparent and premium. Glass surfaces should reveal the layer behind
them subtly. Blur must not destroy text clarity. Shadows must be soft and
physically plausible. Selected navigation should feel like a floating glass
control rather than a glowing neon button. Search expansion should feel smooth,
not theatrical. Course-card scrolling should provide a sense of depth without
turning the dashboard into a carousel advertisement. Backgrounds should remain
calm and mostly static.

The security gate is absolute. Any implementation that relies only on client
checks for authorization is incomplete. Any private record that can be read
through an altered identifier is a release blocker. Any protected file that is
retrievable without proper authorization is a release blocker. Any quiz whose
final result can be forged by changing client payloads is a release blocker.

The content gate is also strict. Syllabus, calendar, PYQ, course and notice
records shown as current must actually be the published records selected by
the content workflow. Student-submitted resources must remain pending until
approved. Administrative changes must be traceable.

The operational gate requires enough observability to understand failures.
The application should report actionable errors without exposing secrets. Admin
actions that materially change the product should be auditable.

The final BEU BABA standard is therefore:

**beautiful on the surface, strict underneath, predictable in behavior, honest
about limitations, and easy to maintain.**

# EXTENDED ENGINEERING SCENARIO MATRIX


### ENGINEERING SCENARIO GROUP 01 — 01. SOURCE-OF-TRUTH HIERARCHY

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


### ENGINEERING SCENARIO GROUP 02 — 02. NON-NEGOTIABLE VISUAL RULES

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


### ENGINEERING SCENARIO GROUP 03 — 03. ARCHITECTURE BOUNDARIES

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


### ENGINEERING SCENARIO GROUP 04 — 04. ROUTING RULES

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


### ENGINEERING SCENARIO GROUP 05 — 05. DATA OWNERSHIP RULES

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


### ENGINEERING SCENARIO GROUP 06 — 06. CONTENT PUBLICATION RULES

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


### ENGINEERING SCENARIO GROUP 07 — 07. FILE AND STORAGE RULES

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


### ENGINEERING SCENARIO GROUP 08 — 08. FORM VALIDATION

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


### ENGINEERING SCENARIO GROUP 09 — 09. NOTIFICATION RULES

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


### ENGINEERING SCENARIO GROUP 10 — 10. QUIZ INTEGRITY RULES

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


### ENGINEERING SCENARIO GROUP 11 — 11. MODERATION RULES

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


### ENGINEERING SCENARIO GROUP 12 — 12. SUPPORT MESSAGE PRIVACY

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


### ENGINEERING SCENARIO GROUP 13 — 13. ADMIN ROLE RULES

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


### ENGINEERING SCENARIO GROUP 14 — 14. SEARCH INDEX RULES

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


### ENGINEERING SCENARIO GROUP 15 — 15. CACHING RULES

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


### ENGINEERING SCENARIO GROUP 16 — 16. OFFLINE RULES

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


### ENGINEERING SCENARIO GROUP 17 — 17. ANIMATION RULES

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


### ENGINEERING SCENARIO GROUP 18 — 18. ACCESSIBILITY RULES

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


### ENGINEERING SCENARIO GROUP 19 — 19. PERFORMANCE RULES

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


### ENGINEERING SCENARIO GROUP 20 — 20. ERROR AND EMPTY-STATE RULES

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


### ENGINEERING SCENARIO GROUP 21 — 21. ADMIN AUDIT RULES

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


### ENGINEERING SCENARIO GROUP 22 — 22. VERSIONING RULES

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


### ENGINEERING SCENARIO GROUP 23 — 23. SECURITY NON-NEGOTIABLES

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


### ENGINEERING SCENARIO GROUP 24 — 24. CHANGE MANAGEMENT

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


### ENGINEERING SCENARIO GROUP 25 — 25. CODING-AGENT EXECUTION PROTOCOL

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
