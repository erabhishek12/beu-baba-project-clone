# BEU BABA — FRONTEND ARCHITECTURE, APPLICATION STRUCTURE & ENGINEERING SPECIFICATION

**Document:** `BEU_BABA_07_FRONTEND_ARCHITECTURE_ENGINEERING_SPECIFICATION.md`  
**Project:** BEU BABA  
**Purpose:** Production-grade frontend architecture specification  
**Target stack:** React + Vite + TypeScript + Tailwind CSS + Framer Motion  
**Backend assumption:** Supabase  
**Application type:** Responsive PWA / installable web application  
**Primary visual direction:** Bright premium Apple-inspired glassmorphism  
**Primary audience:** University students  
**Engineering priority:** Maintainability, performance, security, accessibility, scalability and predictable UX

---

# 1. DOCUMENT PURPOSE

This document defines how the BEU BABA frontend should be architected and implemented.

The goal is not merely to describe which technologies can be used. The goal is to define a complete engineering structure so that a developer or AI coding agent can build the application without repeatedly inventing architecture decisions.

BEU BABA is expected to grow beyond a simple notes application.

The application may contain:

- student registration
- authentication
- student academic profile
- courses
- subjects
- syllabus
- yearly calendar
- PYQs
- notes
- quizzes
- quiz history
- student toolbox
- resource uploads
- resource moderation
- notifications
- developer support messaging
- bookmarks
- search
- announcements
- profile customization
- admin dashboard
- content management
- student management
- moderation
- analytics
- PWA installation
- offline-friendly behavior

Therefore the frontend must be structured as a real product rather than a collection of pages.

The architecture must make it possible to add new modules without rewriting existing modules.

---

# 2. CORE ENGINEERING PRINCIPLES

The implementation must follow these principles.

## 2.1 Feature-first organization

Code should be organized primarily around product features rather than technical file types.

Bad structure:

```text
components/
  Button.tsx
  Card.tsx
  Modal.tsx
  Course.tsx
  Quiz.tsx
  Profile.tsx
```

Better structure:

```text
src/
  app/
  features/
    auth/
    courses/
    pyq/
    syllabus/
    calendar/
    quiz/
    resources/
    support/
    notifications/
    profile/
    toolbox/
    admin/
  components/
  lib/
  hooks/
  types/
```

Shared components belong in shared locations.

Feature-specific components remain inside their feature.

---

# 3. RECOMMENDED PROJECT STACK

## 3.1 React

React should be used as the primary UI framework.

Reasons:

- component architecture
- ecosystem maturity
- reusable UI
- strong TypeScript support
- suitable for PWA
- suitable for Supabase
- suitable for animation libraries

React components should remain focused.

Avoid massive components containing:

- database queries
- business rules
- navigation
- UI
- validation
- animation
- state management

all in one file.

---

# 4. VITE

Vite should be used as the development and build environment.

Benefits:

- fast development server
- fast HMR
- efficient production builds
- straightforward environment configuration
- excellent React integration

The project should use separate environment variables for development and production.

Never hardcode secrets in frontend source code.

---

# 5. TYPESCRIPT

TypeScript should be mandatory.

The application contains many related entities:

- Student
- Course
- Branch
- Semester
- Subject
- Resource
- PYQ
- Quiz
- QuizQuestion
- QuizAttempt
- Notification
- SupportConversation
- SupportMessage
- CalendarEvent
- UploadRequest

Using plain JavaScript would make the growing data model harder to maintain.

TypeScript interfaces/types should be centralized where appropriate.

---

# 6. TAILWIND CSS

Tailwind CSS should be used for the majority of styling.

However, Tailwind should not become an excuse for inconsistent styling.

Avoid arbitrary values everywhere:

```tsx
className="mt-[17px] rounded-[23px] ..."
```

Prefer design tokens.

The UI specification in the design-system document should define:

- spacing
- radii
- typography
- shadows
- glass surfaces
- transitions

Tailwind configuration should expose those tokens.

---

# 7. FRAMER MOTION

Framer Motion should be used for intentional interface motion.

Primary uses:

- page transitions
- bottom navigation selection
- course carousel movement
- card interactions
- sheets
- modals
- search focus
- quiz transitions
- list entrance
- notification feedback

Do not animate every element.

Animation should communicate:

- hierarchy
- continuity
- feedback
- state changes

not decoration.

---

# 8. SUPABASE CLIENT ARCHITECTURE

The Supabase client must be initialized once.

Do not repeatedly create clients inside components.

Recommended:

```text
src/lib/supabase/
  client.ts
  types.ts
```

The client module provides the configured Supabase instance.

Components should call feature services/hooks rather than constructing arbitrary database queries everywhere.

---

# 9. ENVIRONMENT VARIABLES

Frontend environment variables may include public configuration such as:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Only values that are safe to expose publicly may be placed in VITE environment variables.

Never expose:

- service-role keys
- private API keys
- admin secrets
- database passwords
- signing secrets

The frontend is public code.

Anything shipped to the browser should be considered discoverable.

---

# 10. HIGH-LEVEL DIRECTORY STRUCTURE

Recommended:

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   ├── providers/
│   └── layouts/
│
├── assets/
│
├── components/
│   ├── ui/
│   ├── glass/
│   ├── navigation/
│   ├── feedback/
│   └── forms/
│
├── features/
│   ├── auth/
│   ├── home/
│   ├── courses/
│   ├── subjects/
│   ├── pyq/
│   ├── syllabus/
│   ├── calendar/
│   ├── quiz/
│   ├── resources/
│   ├── notifications/
│   ├── support/
│   ├── profile/
│   ├── toolbox/
│   └── admin/
│
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
├── utils/
└── main.tsx
```

This structure can evolve as the application grows.

---

# 11. APP LAYER

The `app` directory controls application-level concerns.

It should contain:

- application root
- route configuration
- global providers
- layout selection
- authentication bootstrap
- global error boundaries
- theme initialization
- query provider if used
- notification initialization
- PWA initialization

It should not contain feature-specific business logic.

---

# 12. MAIN ENTRY

`main.tsx` should be intentionally small.

Conceptually:

```tsx
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

The exact provider structure can be expanded as needed.

The entry point should not contain:

- database queries
- page components
- authentication forms
- feature logic

---

# 13. APP COMPONENT

`App.tsx` should compose application-level providers and routing.

Possible structure:

```text
App
 ├── ErrorBoundary
 ├── QueryProvider
 ├── AuthProvider
 ├── AppRouter
 └── GlobalFeedback
```

Providers should have clear responsibility.

Avoid one giant `AppProvider` that owns everything.

---

# 14. ROUTING ARCHITECTURE

Routes should be explicit.

Example conceptual routes:

```text
/
 /login
 /register
 /verify
 /home
 /courses
 /courses/:courseId
 /subjects/:subjectId
 /pyq
 /syllabus
 /calendar
 /quiz
 /quiz/:quizId
 /quiz/:quizId/result
 /resources
 /resources/:resourceId
 /toolbox
 /notifications
 /support
 /profile
 /settings
```

Admin routes:

```text
/admin
/admin/students
/admin/courses
/admin/resources
/admin/quizzes
/admin/notifications
/admin/support
/admin/calendar
/admin/syllabus
/admin/pyq
/admin/settings
```

Exact route names may change, but the conceptual separation should remain.

---

# 15. ROUTE GUARDS

Authentication-protected routes must require a valid authenticated session.

Example concept:

```text
ProtectedRoute
    ↓
session exists?
    ↓ yes
render application
    ↓ no
redirect to login
```

Admin routes require an additional authorization check.

Do not treat:

```text
if (user.email === "admin@example.com")
```

as a proper authorization system.

Authorization must be enforced by the backend/database policies.

Frontend checks improve UX.

They do not replace backend security.

---

# 16. AUTH BOOTSTRAP

When the app starts:

1. Initialize Supabase.
2. Read existing session.
3. Subscribe to authentication state changes.
4. Load the user's profile if authenticated.
5. Determine account status.
6. Determine role.
7. Render the appropriate application state.

Possible states:

```text
initializing
authenticated
unauthenticated
error
```

Do not briefly show the logged-out UI before the existing session is restored.

That creates unnecessary flashing.

---

# 17. AUTH STATE MODEL

Recommended conceptual model:

```ts
type AuthStatus =
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "error";
```

User data should be separate from authentication state.

Authentication tells us:

“Who is signed in?”

Profile tells us:

“What academic/user data belongs to this person?”

These are related but different concepts.

---

# 18. REGISTRATION FLOW

Registration requires:

- name
- email
- contact number if required
- course
- branch
- semester/year where applicable
- password
- profile image or generated avatar selection
- required consent

The form should be divided logically.

Do not overwhelm users with a huge form.

Possible sections:

### Personal

Name

Email

Contact

### Academic

Course

Branch

Semester

### Profile

Photo/avatar

### Security

Password

Confirm password

---

# 19. PROFILE IMAGE FLOW

The user may upload an image from the device.

The frontend should:

1. select file
2. validate file type
3. validate file size
4. create preview
5. allow removal/replacement
6. upload after appropriate validation
7. save resulting reference

Do not trust filename extensions alone.

Validate MIME type and preferably inspect file content server-side where appropriate.

---

# 20. GENERATED AVATAR FLOW

If the user chooses a generated avatar:

Gender selection may determine the available avatar category if that product requirement remains.

However, the implementation should avoid stereotypes.

Possible categories:

```text
Avatar style
  Male
  Female
  Neutral
```

The important design requirement is automatic selection without requiring the user to manually search through dozens of avatars.

The user should still be able to change the avatar later if desired.

---

# 21. AUTH ERROR MESSAGES

Avoid technical errors.

Bad:

“AuthApiError: invalid_credentials”

Good:

“Email or password is incorrect.”

For registration:

“This email may already be registered. Try signing in or resetting your password.”

The exact message must reflect the actual backend state.

Do not reveal sensitive account information unnecessarily.

---

# 22. FORM VALIDATION ARCHITECTURE

Validation should exist at multiple levels.

Frontend validation:

- immediate feedback
- better UX

Backend validation:

- security
- data integrity

Never rely only on frontend validation.

---

# 23. FORM STATE

Forms should have:

```text
idle
editing
submitting
success
error
```

During submission:

- disable duplicate submission
- show progress
- preserve entered data
- display useful error

Do not clear the form until the operation is confirmed.

---

# 24. BUTTON ARCHITECTURE

Shared button variants should be centralized.

Examples:

```text
Primary
Secondary
Ghost
Glass
Danger
Icon
```

Each variant should have:

- default
- hover
- pressed
- focus
- disabled
- loading

Do not create a new button style for every page.

---

# 25. LOADING BUTTON

When a button submits:

```text
Save
↓
Saving...
↓
Saved
```

The loading indicator should not shift the button width unnecessarily.

Prefer stable dimensions.

---

# 26. TOAST ARCHITECTURE

Use toasts for short feedback.

Good:

“Resource submitted for review.”

Bad:

large paragraph inside a toast.

Toasts should not contain essential information that disappears too quickly.

For important failures, use inline feedback or a modal/sheet.

---

# 27. ERROR BOUNDARY

A production application should include error boundaries.

If one feature crashes:

the entire application should not necessarily become unusable.

Provide a graceful fallback:

“Something went wrong.”

Then:

“Reload”

or

“Go home”

Include support/report option when appropriate.

Do not expose stack traces to normal users.

---

# 28. DATA FETCHING ARCHITECTURE

Data fetching should not be scattered randomly across JSX.

Prefer:

```text
component
   ↓
feature hook
   ↓
feature service
   ↓
Supabase
```

Example:

```text
CoursePage
  useCourses()
      courseService.getCourses()
          Supabase
```

This makes testing and replacement easier.

---

# 29. SERVER STATE VS UI STATE

Separate these concepts.

Server state:

- courses
- PYQs
- syllabus
- resources
- notifications
- support messages

UI state:

- search query
- selected filter
- modal open/closed
- active tab
- temporary form values

Do not put all state into one global store.

---

# 30. QUERY CACHING

If a query library such as TanStack Query is used, it should manage server state.

Potential cache keys:

```text
courses
courses:{courseId}
subjects:{courseId}
pyq:{filters}
syllabus:{courseId}:{semester}
notifications
support:{conversationId}
```

Cache invalidation should happen after mutations.

---

# 31. SEARCH ARCHITECTURE

Search should have three stages:

1. local input state
2. debounced query
3. server/search result

Do not request the backend on every keystroke.

Example:

User types:

```text
D
DB
DBM
DBMS
```

The system should wait briefly before querying.

---

# 32. SEARCH UX

Search states:

```text
idle
focused
typing
loading
results
no results
error
```

When focused:

- search field expands subtly if designed that way
- keyboard opens on mobile
- clear button appears when text exists

Avoid full-screen dramatic transitions.

---

# 33. SEARCH RESULT ARCHITECTURE

Results should contain a semantic type:

```text
PYQ
Syllabus
Course
Subject
Resource
Quiz
Announcement
```

This allows a single global search to remain understandable.

---

# 34. FILTER ARCHITECTURE

Academic filters may include:

- course
- branch
- semester
- year
- subject
- resource type

Filters should be represented as structured values.

Do not parse display strings throughout the application.

Example:

```ts
{
  semester: 4,
  year: 2025,
  type: "pyq"
}
```

---

# 35. COURSE DATA MODEL ON FRONTEND

Conceptual type:

```ts
interface Course {
  id: string;
  name: string;
  code?: string;
  description?: string;
  thumbnailUrl?: string;
  isActive: boolean;
}
```

Do not place database implementation details directly into visual components.

---

# 36. SUBJECT MODEL

A subject can contain:

```text
id
courseId
name
code
semester
credits
description
isActive
```

Frontend should treat identifiers as opaque values.

Do not assume IDs are numeric.

Supabase commonly uses UUIDs.

---

# 37. RESOURCE MODEL

Conceptually:

```ts
interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  subjectId?: string;
  courseId?: string;
  semester?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  status: ResourceStatus;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
```

Potential statuses:

```text
pending
approved
rejected
archived
```

Do not expose pending resources to normal students unless explicitly intended.

---

# 38. PYQ MODEL

PYQ records should support:

- year
- subject
- semester
- course
- branch
- exam type
- file/reference
- status

The UI should not need to know how storage works.

---

# 39. SYLLABUS MODEL

A syllabus version may contain:

```text
id
courseId
branchId
academicYear
semester
version
effectiveFrom
resourceId
isActive
createdAt
updatedAt
```

When syllabus changes, create/update the authoritative record rather than hardcoding the content in React.

This allows future changes without rebuilding the frontend.

---

# 40. YEARLY CALENDAR MODEL

Calendar events should be data-driven.

Example:

```ts
interface AcademicEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  category: AcademicEventCategory;
  description?: string;
  courseId?: string;
  isActive: boolean;
}
```

The UI should fetch events.

Do not hardcode academic dates into components.

---

# 41. QUIZ ARCHITECTURE

Separate:

- quiz metadata
- questions
- options
- correct answer
- explanation
- attempt
- result

Never send correct answers to the browser before they are required if doing so creates a meaningful cheating/security issue.

For serious quiz integrity, validation should occur server-side.

---

# 42. QUIZ ATTEMPT STATE

Client may temporarily maintain:

```text
currentQuestion
selectedAnswers
markedQuestions
timeRemaining
```

But final score should be computed from trusted data.

Do not trust a client-submitted score.

---

# 43. QUIZ RESULT

Result can show:

- score
- percentage
- correct
- incorrect
- unanswered
- time
- topic performance
- review questions

The result should encourage learning rather than only ranking.

---

# 44. TOOLBOX ARCHITECTURE

The Student Toolbox should be modular.

Potential tools:

- calculator
- percentage calculator
- CGPA calculator
- unit converter
- age calculator
- date difference
- countdown
- stopwatch
- QR generator if desired
- text tools
- GPA helper
- attendance calculator
- study timer
- note counter/formatter
- file utilities where safe

Each tool should be isolated as a feature.

Example:

```text
features/toolbox/
  index/
  calculator/
  cgpa/
  attendance/
  converter/
```

---

# 45. TOOLBOX PERFORMANCE

Tools that do not require server data should work locally.

For example:

CGPA calculation should not require a backend request.

This makes tools:

- faster
- cheaper
- more private
- usable offline

---

# 46. RESOURCE UPLOAD FLOW

Student upload:

```text
Choose resource
↓
Select file
↓
Enter metadata
↓
Preview
↓
Submit
↓
Pending moderation
```

Required metadata may include:

- title
- subject
- semester
- type
- description

Do not publish immediately if moderation is required.

---

# 47. UPLOAD PROGRESS

Large files need visible progress where supported.

Example:

```text
Uploading

████████████░░░ 82%

82%
```

If progress cannot be accurately measured, do not fake percentage.

Use:

“Uploading…”

instead.

Fake progress damages trust.

---

# 48. STORAGE ABSTRACTION

The frontend should not depend directly on one storage provider throughout the application.

Create a storage abstraction.

Concept:

```text
resourceStorage.upload()
resourceStorage.getPreview()
resourceStorage.getDownloadReference()
```

This makes migration easier.

---

# 49. PRIVATE RESOURCE ACCESS

For private files:

1. user requests access
2. backend verifies authorization
3. backend/storage returns controlled access
4. client displays resource

Do not assume hiding a URL is security.

Any sensitive authorization must happen server-side.

---

# 50. DEVELOPER SUPPORT

The support feature is a private one-to-one conversation.

Core entities:

```text
conversation
message
participant
status
```

A normal student should only retrieve their own conversation.

Admin/developer should retrieve conversations according to backend authorization.

---

# 51. SUPPORT MESSAGE FLOW

Student:

```text
Open support
↓
Select category
↓
Write message
↓
Send
↓
Message appears
↓
Developer replies
↓
Student receives notification
```

Categories may include:

- Bug
- Course request
- Syllabus update
- PYQ request
- Account problem
- Resource issue
- General

---

# 52. REAL-TIME SUPPORT

Supabase Realtime can optionally be used for support messages.

If enabled:

- subscribe only to authorized conversation
- unsubscribe on route change/unmount
- handle reconnects
- avoid duplicate message rendering

Realtime should improve responsiveness without becoming a source of memory leaks.

---

# 53. MESSAGE OPTIMISTIC UI

When sending a support message:

the UI may immediately display:

```text
Sending...
```

Then:

```text
Sent
```

If failed:

```text
Failed to send
Retry
```

Do not mark failed messages as successfully delivered.

---

# 54. NOTIFICATION ARCHITECTURE

Notification types may include:

- new resource
- syllabus update
- calendar update
- quiz availability
- developer reply
- account information
- announcement

Each notification should have:

```text
id
userId / audience
type
title
body
read
createdAt
deepLink
```

---

# 55. DEEP-LINK NOTIFICATIONS

A notification can optionally navigate to:

```text
/course/123
/pyq?subject=...
/syllabus/...
/quiz/...
/support/...
```

The destination must validate that the user can access the target.

Never treat a deep link as permission.

---

# 56. PWA ARCHITECTURE

BEU BABA should behave like a high-quality web app.

PWA considerations:

- manifest
- icons
- installability
- service worker
- caching strategy
- offline fallback
- update handling
- safe-area support

---

# 57. SERVICE WORKER STRATEGY

Do not cache everything blindly.

Potentially cache:

- app shell
- static assets
- safe public resources

Be careful with:

- private student information
- support messages
- admin data
- authentication state

Sensitive information should not be casually persisted in service-worker caches.

---

# 58. PWA UPDATE FLOW

When a new application version is available:

do not silently break the active session.

Possible UI:

“New version available”

[Update]

The update behavior should be tested carefully to avoid losing form/quiz progress.

---

# 59. OFFLINE STRATEGY

Offline mode should be honest.

Possible:

- app shell loads
- cached public content loads
- toolbox works
- previously cached content may be available

But if fresh backend data cannot be loaded:

“You're offline. Showing available saved content.”

Do not pretend the data is current.

---

# 60. IMAGE OPTIMIZATION

Profile and course images should be optimized.

Use:

- appropriate dimensions
- modern formats where supported
- compression
- responsive loading

Do not ship a 5 MB image when a 100 KB optimized image is sufficient.

---

# 61. LAZY LOADING

Lazy-load heavy routes where appropriate:

- admin
- quiz
- resource viewer
- complex toolbox tools

Do not lazy-load every tiny component.

The goal is reducing initial bundle size without creating excessive loading boundaries.

---

# 62. CODE SPLITTING

Route-based code splitting is preferred.

Example conceptual:

```text
main bundle
  ↓
auth
home
courses
pyq
quiz
admin
```

Admin code should not unnecessarily be included in the initial student bundle if route splitting can avoid it.

---

# 63. COMPONENT REUSABILITY

A component should be shared when:

- visual behavior is identical
- interaction is identical
- semantics are compatible

Do not abstract components simply because two things both look like rectangles.

Bad abstraction:

`UniversalCardWithEverything`

Better:

- GlassCard
- ResourceCard
- CourseCard
- QuizCard

---

# 64. GLASS COMPONENT SYSTEM

Create reusable primitives such as:

```text
GlassSurface
GlassCard
GlassButton
GlassInput
GlassSheet
GlassModal
GlassNavigation
```

They should share the same underlying material tokens.

Feature cards can compose them.

---

# 65. CARD COMPOSITION

Example:

```tsx
<GlassCard>
  <CourseThumbnail />
  <CourseInfo />
  <CourseActions />
</GlassCard>
```

This is preferable to putting all behavior into one giant card component.

---

# 66. ICON SYSTEM

Use a consistent icon library.

Do not mix:

- random SVGs
- emoji
- unrelated icon packs
- screenshots of icons

Icons should share:

- stroke weight
- optical size
- alignment

---

# 67. EMOJI POLICY

Emoji should not be the primary iconography for core navigation.

For example, avoid:

```text
📚 Courses
📝 PYQ
👤 Profile
```

if the visual target is polished Apple-like UI.

Use consistent vector icons.

Emoji can appear in user-generated content where appropriate.

---

# 68. TYPOGRAPHY ARCHITECTURE

Define semantic text styles:

```text
Display
Title
Heading
Body
Body Small
Label
Caption
```

Components should consume semantic styles.

Do not manually select font sizes everywhere.

---

# 69. ACCESSIBILITY

Accessibility is a core requirement.

Every interactive element should support:

- keyboard access
- visible focus
- appropriate labels
- sufficient contrast
- semantic structure
- reduced motion

Glass effects must never reduce readability below acceptable contrast.

---

# 70. SCREEN READER LABELS

Icon-only controls require accessible labels.

Example:

```tsx
<button aria-label="Open notifications">
```

Do not assume users know what an icon means.

---

# 71. FOCUS MANAGEMENT

For modals and sheets:

1. move focus into the component
2. trap focus appropriately
3. restore focus when closed

For route changes, ensure meaningful focus behavior where appropriate.

---

# 72. REDUCED MOTION

Respect:

```text
prefers-reduced-motion
```

When enabled:

- remove decorative movement
- reduce transition distance
- remove unnecessary scaling
- keep functional feedback

The interface must remain understandable without animation.

---

# 73. TOUCH TARGETS

Interactive targets should be large enough for comfortable mobile interaction.

Do not create tiny icon buttons merely to preserve visual minimalism.

A premium interface should also be comfortable.

---

# 74. MOBILE SAFE AREAS

Bottom navigation and floating controls must account for device safe areas.

Concept:

```css
padding-bottom:
  max(base-spacing, env(safe-area-inset-bottom))
```

This is particularly important for installed PWAs on modern phones.

---

# 75. RESPONSIVE BREAKPOINTS

Do not design around one phone width.

Test:

- small phones
- standard phones
- large phones
- tablets
- desktop
- wide desktop

The UI should scale through layout rules rather than arbitrary device-specific hacks.

---

# 76. RESPONSIVE COURSE CARDS

Mobile:

- one prominent card
- horizontal swipe

Tablet:

- larger carousel
- potentially two visible cards

Desktop:

- horizontal content rail or grid

Do not simply stretch a mobile card across the entire desktop viewport.

---

# 77. RESPONSIVE NAVIGATION

Mobile:

floating bottom navigation.

Tablet/desktop:

the same information architecture may become:

- floating bottom navigation
- compact side rail
- top navigation

The final choice should remain visually coherent.

---

# 78. NAVIGATION ANIMATION

The selected navigation item should use the BEU BABA signature interaction:

- selected glass capsule/surface
- subtle movement
- icon transition
- optional indicator

The movement must be quick.

Do not create a large bouncing animation.

---

# 79. PAGE TRANSITIONS

Page transitions should maintain continuity.

Preferred:

- short fade
- small translate
- shared element transition where justified

Avoid:

- page spinning
- zooming through the screen
- cinematic transitions

Students use the app repeatedly; navigation should feel fast.

---

# 80. SCROLL ANIMATION

Scroll animation should be sparse.

Examples:

- course cards subtly reveal
- navigation changes state
- header compresses if necessary

Avoid animating every list item on every scroll event.

---

# 81. PERFORMANCE BUDGET

Performance is part of the design.

Watch:

- JavaScript bundle size
- image size
- number of animated elements
- backdrop-filter usage
- unnecessary rerenders
- repeated network requests

A beautiful UI that feels slow is not premium.

---

# 82. GLASS PERFORMANCE

Backdrop blur can be expensive.

Do not apply heavy blur to:

- entire page
- every list item
- every nested component

Prefer a limited number of glass surfaces.

If performance degrades:

1. reduce blur radius
2. reduce number of glass layers
3. use opaque/translucent fallback
4. simplify shadows

---

# 83. RENDERING PERFORMANCE

Avoid unnecessary state at high-level components.

If a search input changes:

do not rerender the entire application.

Keep state close to the component that needs it.

Use memoization only when profiling indicates value.

Do not blindly wrap everything in `memo`.

---

# 84. LIST PERFORMANCE

Long lists should use:

- pagination
- cursor-based fetching
- virtualization where truly necessary
- lazy loading

Do not fetch thousands of resources at once.

---

# 85. IMAGE LOADING STRATEGY

Use placeholders.

Sequence:

```text
placeholder
↓
image loads
↓
image fades in
```

Do not cause the card layout to jump when the image arrives.

Reserve image dimensions.

---

# 86. ERROR HANDLING ARCHITECTURE

Errors should be classified.

Possible:

```text
ValidationError
AuthenticationError
AuthorizationError
NetworkError
NotFoundError
UploadError
ServerError
UnknownError
```

The UI maps these into human-readable messages.

Do not display raw exception objects.

---

# 87. AUTHORIZATION ERROR

If a user is authenticated but lacks permission:

show:

“You don't have access to this content.”

Then provide a reasonable next action.

Do not redirect endlessly between routes.

---

# 88. NOT FOUND EXPERIENCE

For an invalid route:

```text
This page isn't available.
```

Actions:

[Go home]

[Search]

This is better than a technical 404 screen.

---

# 89. GLOBAL ERROR EXPERIENCE

For unexpected failure:

```text
Something went wrong

We couldn't load this section.

[Try again]
[Go home]
```

Keep the application shell usable if possible.

---

# 90. DATA REFRESH

Users may return to the app after content changes.

Freshness strategy should be defined for:

- notifications
- syllabus
- calendar
- courses
- resources

Avoid excessively aggressive polling.

Realtime should be used only where justified.

---

# 91. ADMIN DATA REFRESH

Admin screens may require more frequent updates than student screens.

Examples:

- pending resources
- support inbox
- moderation queue

Use:

- manual refresh
- controlled polling
- realtime subscriptions

depending on the feature.

---

# 92. ADMIN FRONTEND SECURITY

The frontend must hide admin routes from unauthorized users for UX.

But actual authorization must be enforced through backend policies.

A malicious user can manually navigate to:

```text
/admin
```

Therefore the backend must still reject unauthorized data requests.

---

# 93. DATABASE QUERY DISCIPLINE

Frontend queries should request only needed fields where practical.

Avoid:

```text
select *
```

for every large table.

Instead request relevant columns.

This reduces:

- payload size
- processing
- accidental exposure

---

# 94. DATA TRANSFORMATION

Raw database records should be transformed before presentation when needed.

Example:

database:

```text
created_at
```

UI:

```text
Updated 2 hours ago
```

Keep formatting logic out of JSX when complex.

---

# 95. DATE HANDLING

Academic dates must be handled carefully.

Use ISO-compatible values internally.

Format only at the display boundary.

Be careful with timezone conversion.

A date-only academic event should not accidentally move to the previous day because of timezone conversion.

---

# 96. MONEY/NUMERIC FORMATTING

If future paid features exist:

currency should be formatted consistently.

Do not hardcode currency symbols in dozens of components.

Use centralized formatting utilities.

---

# 97. ANALYTICS

Analytics should be privacy-conscious.

Potential events:

- course opened
- PYQ opened
- quiz started
- quiz completed
- resource searched
- support opened

Avoid collecting unnecessary personal information.

Analytics must never bypass access controls.

---

# 98. EVENT NAMING

Use predictable event names.

Example:

```text
course_opened
pyq_opened
quiz_started
quiz_completed
resource_uploaded
support_message_sent
```

Avoid inconsistent names like:

```text
CourseClick
openCoursePage
course_view_1
```

---

# 99. LOGGING

Production logs must not contain:

- passwords
- access tokens
- private messages
- unnecessary contact details
- sensitive academic information

Debug logging should be removable or disabled in production.

---

# 100. FEATURE FLAGS

Feature flags can help release:

- new quiz engine
- redesigned toolbox
- new notification system

But avoid excessive flags.

Every flag creates complexity.

Flags should have ownership and removal plans.

---

# 101. CONTENT-DRIVEN DESIGN

Academic content must be data-driven.

Do not hardcode:

```tsx
const syllabus = [...]
```

inside production pages.

Instead:

```text
database
 ↓
service
 ↓
hook
 ↓
component
```

This allows administrators to update content without rebuilding the app.

---

# 102. CONTENT UPDATE PRINCIPLE

If an administrator changes:

- syllabus
- yearly calendar
- PYQ
- course
- subject
- resource

the student UI should reflect the change based on backend data and cache invalidation.

A content editor should not need to edit React source code.

---

# 103. ADMIN CONTENT MANAGEMENT

Admin forms should support:

- create
- edit
- activate
- deactivate
- archive
- version
- preview

Deletion should be avoided where archival is sufficient.

---

# 104. SOFT DELETE

For important records, consider:

```text
isActive = false
```

or:

```text
deletedAt
```

instead of immediate destructive deletion.

This helps preserve history.

---

# 105. CONTENT AUDIT TRAIL

Important admin actions should ideally record:

- who changed it
- what changed
- when
- previous state where practical

This is particularly useful for:

- syllabus
- calendar
- resources
- student accounts

---

# 106. ADMIN CONFIRMATION

Destructive actions should require confirmation.

But routine actions should not be overloaded with confirmation dialogs.

Do not ask:

“Are you sure?”

for every small change.

---

# 107. AUTOSAVE

Autosave should be used only when it genuinely improves UX.

Potential use:

- long admin content forms
- draft announcements

Do not autosave:

- quiz submission
- destructive actions

without explicit semantics.

---

# 108. DRAFT STATE

If drafts are supported:

```text
Draft
Published
Archived
```

Users should understand what students can see.

---

# 109. PUBLISHING MODEL

Recommended:

```text
Draft
↓
Review
↓
Published
↓
Archived
```

Not every content type needs every state, but important academic content benefits from controlled publishing.

---

# 110. CONTENT PREVIEW

Admin should preview student-facing content before publishing.

Preview should use the same presentation component where practical.

This reduces differences between:

“what admin sees”

and

“what student sees.”

---

# 111. COMPONENT TESTING

Critical shared components should be tested.

Examples:

- Button
- Input
- Modal
- Sheet
- Navigation
- CourseCard
- ResourceCard

Tests should cover behavior, not only snapshots.

---

# 112. FEATURE TESTING

High-value workflows:

### Authentication

register → verify → login → profile

### Resource

upload → pending → approve → visible

### Quiz

open → answer → submit → result

### Support

send → admin reply → student receives

### Content

admin update → cache refresh → student sees new content

---

# 113. END-TO-END TESTING

The application should have automated end-to-end tests for critical paths where feasible.

Test at minimum:

- login
- protected route
- course navigation
- resource access
- quiz submission
- support message
- admin moderation

---

# 114. ACCESSIBILITY TESTING

Run automated accessibility checks where possible.

Also perform manual keyboard testing.

Check:

- focus
- labels
- contrast
- modal behavior
- navigation
- reduced motion

---

# 115. BROWSER TESTING

Test modern versions of:

- Chrome
- Edge
- Safari
- Firefox

Pay special attention to Safari/PWA behavior because the visual direction is Apple-inspired.

Do not assume CSS backdrop blur behaves identically everywhere.

---

# 116. MOBILE TESTING

Test actual touch devices where possible.

Verify:

- keyboard behavior
- bottom navigation
- safe areas
- scrolling
- file picker
- image upload
- PWA installation
- notification behavior
- viewport resizing

---

# 117. DESIGN QA

Before release, compare implementation with the design specification.

Check:

- spacing
- typography
- glass opacity
- blur
- shadows
- card radius
- selected navigation
- animations
- empty states
- error states

Do not approve only the happy path.

---

# 118. CONTENT QA

Check:

- spelling
- academic labels
- semester names
- course names
- branch names
- date formatting
- notification text

A premium UI with incorrect academic content is still a poor product.

---

# 119. INTERNATIONALIZATION READINESS

Even if the first release is English-only, avoid architecture that makes future localization impossible.

Do not scatter user-facing text across complicated logic.

Centralized translation support can be introduced later.

---

# 120. HINGLISH / LANGUAGE POLICY

If BEU BABA later supports Hindi or Hinglish content, language should be a content/data decision rather than hardcoded assumptions in components.

UI labels should remain consistent.

Academic terms should not be translated unpredictably.

---

# 121. ACCESSIBLE LANGUAGE

Use simple language for:

- errors
- permissions
- support
- upload instructions
- account settings

Academic content can retain official terminology.

---

# 122. EMPTY STATE SYSTEM

Every data-driven screen should define an empty state.

Examples:

No courses:

“No courses available yet.”

No PYQs:

“No PYQs found for these filters.”

No notifications:

“You're all caught up.”

No support messages:

“Start a conversation with BEU BABA support.”

---

# 123. SKELETON SYSTEM

Skeletons should match final geometry.

If final card has:

- image
- title
- metadata
- button

the skeleton should approximate the same structure.

Do not use a generic full-page spinner for everything.

---

# 124. SKELETON ANIMATION

Skeleton shimmer must be subtle.

Avoid:

- bright flashing
- high-frequency movement
- rainbow gradients

The animation should communicate loading without becoming distracting.

---

# 125. GLOBAL LOADER

Use a global loader only for genuinely global initialization.

Examples:

- app bootstrap
- authentication restoration

Do not show a global loader while a small card is loading.

---

# 126. PARTIAL LOADING

Different sections can load independently.

Home page:

```text
Header → available immediately
Quick actions → available immediately
Courses → loading
Announcements → loading
```

Do not block the entire page because one request is slow.

---

# 127. SUSPENSE

React Suspense can be used where appropriate for route-level code splitting or future data-loading architecture.

Do not introduce Suspense solely because it sounds modern.

Use it when it improves architecture.

---

# 128. CACHE INVALIDATION

After admin changes a resource:

invalidate relevant student queries.

Example:

```text
resource changed
↓
invalidate resources
↓
invalidate resource detail
↓
refresh relevant list
```

Avoid refreshing the entire application unnecessarily.

---

# 129. OPTIMISTIC MUTATIONS

Safe examples:

- bookmark toggle
- read/unread notification

Riskier:

- resource deletion
- quiz submission
- account changes

Optimistic UI should only be used where rollback is reliable.

---

# 130. RACE CONDITIONS

Search, filters and rapidly changing screens can create stale responses.

Example:

User searches:

```text
DBMS
```

then immediately:

```text
Operating System
```

The DBMS response should not overwrite the newer result.

Use request cancellation, query libraries, or request identity handling.

---

# 131. DUPLICATE SUBMISSION PREVENTION

Disable submission while an operation is pending.

For uploads/messages:

also consider backend idempotency.

Frontend-only disabling is not enough if the user has multiple tabs or unstable networks.

---

# 132. FILE UPLOAD VALIDATION

Frontend should validate:

- file type
- size
- extension
- filename length

Backend should validate again.

Never trust the browser.

---

# 133. FILENAME NORMALIZATION

User-provided filenames may contain:

- spaces
- Unicode
- special characters
- duplicate names

Storage naming should use safe generated identifiers.

Display the original filename to the user where useful.

---

# 134. RESOURCE PREVIEW

Before submission:

show:

- filename
- size
- type
- title
- metadata

Allow replacement.

Do not upload a file simply because it was selected unless that behavior is explicitly intended.

---

# 135. PROFILE IMAGE CROPPING

A premium profile flow can optionally support:

- square crop
- zoom
- reposition

Do not force complicated editing for a simple profile image.

---

# 136. AVATAR FALLBACK

If no profile image exists:

show generated avatar.

If image fails:

show generated/default avatar.

Do not show broken image icons.

---

# 137. NOTIFICATION READ STATE

Unread notifications should have a clear but restrained indicator.

Example:

- small dot
- slightly stronger surface

Do not make the entire card bright.

---

# 138. MARK-ALL-READ

If implemented:

provide:

“Mark all as read”

It should update the backend reliably.

---

# 139. NOTIFICATION GROUPING

Large notification feeds may group by:

- Today
- Yesterday
- Earlier

This improves scanning.

---

# 140. SUPPORT NOTIFICATION

When developer replies:

notification:

“Developer replied to your support message.”

Deep link directly to the conversation.

---

# 141. ADMIN SUPPORT STATUS

Support conversations may have:

```text
Open
Waiting for student
Waiting for developer
Resolved
```

The student should understand whether action is expected.

---

# 142. SUPPORT CLOSURE

When resolved:

show:

“This conversation has been marked resolved.”

Allow reopening if product rules permit.

Do not delete conversation history simply because it is resolved.

---

# 143. USER DATA EXPORT

If future compliance/product requirements demand it, architecture should allow exporting relevant user data.

Do not build inaccessible data silos.

---

# 144. ACCOUNT DELETION

If account deletion is offered:

clearly explain consequences.

Use a dedicated confirmation flow.

The frontend must not claim deletion is complete until backend confirmation exists.

---

# 145. SESSION MANAGEMENT

Users may sign in on multiple devices.

The UI can optionally provide:

- sign out
- session/security controls

Avoid building a fake device list unless backend support exists.

---

# 146. PASSWORD RESET

Password reset should have:

1. request
2. email/deep link
3. new password
4. confirmation

Keep user informed about the process.

---

# 147. EMAIL VERIFICATION

If enabled:

show clear status.

Do not allow an unverified account to appear fully active if product rules require verification.

---

# 148. ACCOUNT STATUS

Possible states:

```text
active
pending
suspended
disabled
```

Frontend should render the correct experience.

Suspended accounts should not simply look like network failures.

---

# 149. ADMIN STUDENT LIST

Student list should support:

- search
- filters
- pagination
- view profile
- status
- academic fields

Avoid loading every student into the browser.

---

# 150. STUDENT DATA DISPLAY

Admin may see fields such as:

- name
- email
- contact
- course
- branch
- semester
- account status
- registration date

Only display information authorized for the current admin role.

---

# 151. ADMIN SEARCH

Admin search should be debounced.

Do not issue a database query for every keystroke.

For large datasets, search should be server-side.

---

# 152. ADMIN PAGINATION

Use server-side pagination.

Display:

```text
1–20 of 438
```

where reliable count data is available.

Provide next/previous navigation.

---

# 153. ADMIN RESOURCE QUEUE

Sort pending resources by:

- newest
- oldest
- priority

Do not silently hide older submissions.

---

# 154. MODERATION REASON

When rejecting:

require a reason if the product workflow needs transparency.

Example:

“Please upload a clearer PDF.”

The reason can be shown to the uploader.

---

# 155. MODERATION SECURITY

Admin actions must be protected by backend authorization.

Never implement:

```text
if (isAdmin) {
  showDeleteButton
}
```

as the only security mechanism.

The backend must reject unauthorized requests.

---

# 156. ADMIN CONTENT PREVIEW

The admin preview should resemble the actual student UI.

This is particularly important for:

- announcements
- resource metadata
- syllabus
- calendar
- quiz questions

---

# 157. QUIZ ADMIN BUILDER

Admin quiz builder should support:

- title
- description
- duration
- question
- options
- correct answer
- explanation
- marks
- ordering
- publish status

Avoid creating an overly complex editor initially.

---

# 158. QUESTION VALIDATION

Before publishing a quiz:

validate:

- at least one question
- valid options
- exactly one correct answer for single-answer questions
- valid duration if timed
- non-empty title

Block publishing when invalid.

---

# 159. QUIZ QUESTION ORDER

Question ordering should be explicit.

Possible:

```text
position: 1
position: 2
position: 3
```

Do not depend on database insertion order.

---

# 160. QUIZ VERSIONING

If students have already attempted a quiz, changing questions can affect historical interpretation.

Consider versioning published quizzes.

Example:

```text
Quiz v1
Quiz v2
```

Historical attempts should remain linked to the version used.

---

# 161. PYQ ADMIN MANAGEMENT

Admin can:

- add PYQ
- edit metadata
- replace resource
- activate/deactivate
- archive

PYQ content should remain data-driven.

---

# 162. SYLLABUS ADMIN MANAGEMENT

Admin should be able to update:

- course
- branch
- semester
- academic year
- document
- effective date
- active status

The frontend should make the currently active version obvious.

---

# 163. CALENDAR ADMIN MANAGEMENT

Calendar admin:

- create event
- edit
- duplicate
- deactivate
- preview

For recurring annual events, avoid manually retyping everything if a reusable template system is eventually implemented.

---

# 164. ANNOUNCEMENT ADMIN

Announcement editor:

```text
Title
Message
Audience
Priority
Link
Publish
```

Priority should be semantic:

```text
normal
important
critical
```

Avoid arbitrary visual colors.

---

# 165. AUDIENCE TARGETING

Possible audiences:

- all students
- course
- branch
- semester
- selected users

The backend must enforce the audience.

---

# 166. NOTIFICATION DELIVERY

The frontend is not responsible for securely sending push notifications.

A trusted backend/server process should handle privileged notification delivery.

The client can:

- register subscription/token
- display notifications
- react to notification events

Do not put push provider secrets in the frontend.

---

# 167. PUSH NOTIFICATION UX

Users should understand why notifications are useful.

Examples:

- new PYQ
- syllabus change
- quiz
- developer reply

Avoid excessive promotional notifications.

---

# 168. NOTIFICATION FREQUENCY

The product should avoid becoming noisy.

Important notifications should remain important.

Do not notify every time a student opens a resource.

---

# 169. HOME PERSONALIZATION

The home screen can eventually personalize:

- continue learning
- recently opened
- recommended quizzes
- saved resources
- latest academic updates

But personalization should not make navigation unpredictable.

Primary navigation remains stable.

---

# 170. CONTINUE LEARNING

If implemented:

show the most relevant unfinished/recent activity.

Example:

```text
Continue
DBMS — Unit 3
```

Do not show arbitrary content simply because it was recently fetched.

---

# 171. RECENT ACTIVITY

Recent activity can include:

- opened PYQ
- opened course
- attempted quiz

Keep it compact.

Allow clearing if privacy expectations require it.

---

# 172. BOOKMARK ARCHITECTURE

Bookmarks should be generic where practical.

A bookmark record may contain:

```text
userId
contentType
contentId
createdAt
```

This supports:

- PYQ bookmarks
- resource bookmarks
- course bookmarks

Backend constraints must prevent invalid references.

---

# 173. RECENTLY VIEWED

Recently viewed should be lightweight.

Avoid storing every page visit forever.

Use a reasonable limit.

Example:

last 20 relevant academic items.

---

# 174. HOME PERFORMANCE

Home should prioritize above-the-fold rendering.

Do not wait for:

- all PYQs
- all notifications
- all calendar events

before showing the home shell.

---

# 175. ROUTE PREFETCHING

Where useful, prefetch data for likely next actions.

Example:

when user opens a course:

prefetch subject list.

But avoid aggressive prefetching on mobile networks.

---

# 176. NETWORK AWARENESS

The application can adapt non-critical behavior based on network conditions where supported.

On slower connections:

- reduce prefetch
- load lower-resolution images
- avoid unnecessary animations

Do not make the app feel broken because of network heuristics.

---

# 177. DATA SAVER

Optional setting:

“Reduce data usage”

Could disable:

- autoplay
- aggressive prefetch
- large decorative assets

This is especially useful for student users.

---

# 178. BATTERY AWARENESS

Avoid continuous:

- canvas animations
- particle systems
- video backgrounds
- rapid timers

The app should be usable for long study sessions without unnecessary battery consumption.

---

# 179. NO BACKGROUND VISUAL ENGINE

BEU BABA should not run an expensive animated background.

The background should be mostly static.

Glass depth comes from:

- transparency
- blur
- shadow
- layering

not from continuously animated objects.

---

# 180. VISUAL PERFORMANCE RULE

If an animation consumes meaningful CPU/GPU but provides little usability value:

remove it.

This is a product requirement, not merely an optimization.

---

# 181. ARCHITECTURE FOR FUTURE VIDEO

If course videos are introduced:

the video player should remain isolated from the general UI architecture.

Possible:

```text
features/video/
  VideoPlayer
  VideoProgress
  VideoAccess
```

Access control must be backend-driven.

---

# 182. VIDEO THUMBNAILS

Video cards can display thumbnails.

Prefer optimized thumbnails.

Do not preload full video merely to show a card.

---

# 183. VIDEO ACCESS

If a video is restricted:

verify access before providing protected playback information.

Never assume frontend route protection is sufficient.

---

# 184. EXTERNAL VIDEO PROVIDERS

If videos are hosted on external providers:

store metadata such as:

```text
provider
videoId
thumbnail
duration
```

rather than hardcoding provider URLs throughout components.

---

# 185. FUTURE PAYMENT ARCHITECTURE

If paid courses are added later:

the frontend should treat entitlement as backend state.

Example:

```text
user
 ↓
entitlement
 ↓
course access
```

Do not unlock premium content based only on a local flag.

---

# 186. ENTITLEMENT UI

Possible states:

```text
Available
Locked
Purchased
Expired
```

The exact state should come from trusted backend data.

---

# 187. COURSE ACCESS

A user may have:

- no access
- free access
- paid access
- expired access

The course UI should represent these clearly.

---

# 188. ARCHITECTURE FOR FEATURE GROWTH

New features should follow:

```text
feature/
  components/
  hooks/
  services/
  types/
  utils/
  pages/
```

Only create subfolders that are actually necessary.

Do not create 20 empty directories on day one.

---

# 189. IMPORT RULES

Prefer clear dependency direction.

Example:

```text
features
   ↓
shared components
   ↓
lib
```

A low-level shared component should not import a page-specific feature.

This avoids circular dependencies.

---

# 190. BARREL EXPORTS

Barrel files can improve imports:

```ts
export { CourseCard } from "./CourseCard";
export { CourseHeader } from "./CourseHeader";
```

But avoid giant global barrels that hide dependency relationships.

---

# 191. NAMING CONVENTIONS

Use predictable naming.

Components:

```text
CourseCard.tsx
QuizHeader.tsx
SupportThread.tsx
```

Hooks:

```text
useCourses.ts
useQuizAttempt.ts
useSupportMessages.ts
```

Services:

```text
courseService.ts
quizService.ts
resourceService.ts
```

Types:

```text
course.types.ts
quiz.types.ts
```

Consistency matters more than the exact convention.

---

# 192. FILE SIZE

Avoid giant files.

A component file containing 1,500 lines should be questioned.

Split by responsibility.

However, do not split every five lines into a component.

Use meaningful boundaries.

---

# 193. BUSINESS LOGIC LOCATION

Business logic should not live inside visual JSX.

Bad:

```tsx
if (student.branch === "CSE" && semester === 4 && ...)
```

repeated throughout components.

Create domain functions or selectors.

---

# 194. UTILITY FUNCTIONS

Utilities can include:

- date formatting
- file size formatting
- percentage calculation
- academic label formatting
- debounce helpers
- safe URL handling

Keep them generic enough to justify shared placement.

---

# 195. DOMAIN FUNCTIONS

Domain logic belongs closer to its feature.

Example:

```text
quiz/
  utils/
    calculateQuizSummary.ts
```

Do not put quiz-specific logic in a generic `utils.ts`.

---

# 196. FORM LIBRARY

A form library may be used for complex forms.

Good candidates:

- registration
- admin resource creation
- quiz builder
- syllabus management

Simple search inputs do not require a form library.

---

# 197. SCHEMA VALIDATION

A schema validation library such as Zod can provide shared runtime validation.

Useful for:

- forms
- API responses
- query parameters
- admin inputs

Frontend runtime validation is especially useful when external data can change shape.

---

# 198. API RESPONSE VALIDATION

For critical external/backend responses, validate assumptions where appropriate.

The UI should fail gracefully if the backend returns unexpected data.

---

# 199. TYPE SAFETY LIMITATION

TypeScript types disappear at runtime.

Therefore:

```ts
type Resource = ...
```

does not prove that backend data is actually a Resource.

Runtime validation is separate.

---

# 200. FRONTEND ARCHITECTURE CHECKLIST

Before considering the frontend architecture complete, verify:

### Structure

- feature-first organization
- shared component library
- clear app layer
- clear service layer

### Authentication

- session bootstrap
- protected routes
- admin authorization UX
- proper logout
- reset flow

### Data

- server/UI state separation
- caching
- invalidation
- pagination
- error handling

### Academic modules

- courses
- subjects
- syllabus
- PYQ
- calendar
- quiz

### Community

- resource upload
- moderation
- bookmarks
- support

### Product

- notifications
- toolbox
- profile
- PWA

### Design

- bright glass system
- no dark theme
- no RGB
- no neon
- restrained animation
- consistent navigation

### Accessibility

- keyboard
- focus
- labels
- reduced motion
- contrast

### Performance

- lazy loading
- image optimization
- limited blur
- limited animation
- efficient queries

### Security

- backend authorization
- no secrets in frontend
- protected resources
- safe uploads
- safe support messages

---

# 201. SCREEN-BY-SCREEN VISUAL BLUEPRINT

This section defines the expected composition of the major screens so that implementation agents do not interpret “premium glassmorphism” differently on every route.

## 201.1 Splash Screen

The splash screen should be minimal.

Composition:

- soft light background
- BEU BABA mark centered
- tiny loading indicator only if initialization actually takes time

Animation:

- logo fades in
- optional 1–2px scale transition
- loading indicator appears only when necessary

Do not create:

- long animated logo sequences
- spinning 3D logos
- particle explosions
- black backgrounds

The splash screen must disappear as soon as the application is ready.

## 201.2 Home Screen

The first viewport should establish hierarchy immediately.

Recommended composition:

```text
[status-safe area]

Good morning
Student name                         [avatar]

[ Search glass pill ]

[ Quick Action ] [ Quick Action ]
[ Quick Action ] [ Quick Action ]

Continue learning
[ Large course glass card ]

Important
[ notice ]

Your courses
[ horizontal course carousel ]

[ bottom navigation ]
```

The user should understand the application's main purpose within seconds.

## 201.3 Courses Screen

Header:

“Your Courses”

Secondary context:

course / branch / semester

Then:

- current course
- subject list
- recently opened content

Course cards can use stronger visual treatment than ordinary list items.

## 201.4 PYQ Screen

The top should contain:

- title
- search
- filter button

Below:

- active filters
- result count
- PYQ list

The list should be compact enough that multiple papers can be scanned without excessive scrolling.

## 201.5 Syllabus Screen

The screen should immediately expose:

- academic year
- course
- branch
- semester

Then:

- subjects
- units
- official document
- update metadata

If multiple syllabus versions exist, the latest active version should be visually prioritized while older versions remain accessible where required.

## 201.6 Quiz Screen

The quiz screen should remove distractions.

Recommended:

```text
Quiz title
Question 4 / 20                         Timer

Question text

○ Option A
○ Option B
○ Option C
○ Option D

[Next]
```

The bottom area should remain reachable without covering answer choices.

## 201.7 Profile Screen

Profile should feel like an account hub rather than a database record.

Top:

- avatar
- name
- academic identity

Sections:

- Academic Profile
- Saved Content
- Quiz History
- Notifications
- Support
- Settings
- Privacy

## 201.8 Developer Support Screen

The support screen should be extremely simple.

Header:

“Developer Support”

Conversation:

```text
Developer Support
────────────────────

You
[ message ]

Developer
[ reply ]

────────────────────
[ Write a message... ] [Send]
```

Optional category selector can be shown before the first message.

The UI must communicate privacy clearly:

“Your support conversation is visible only to you and authorized BEU BABA support staff.”

Only show this wording if it accurately reflects backend permissions.

---

# 202. INTERACTION PRIORITY MATRIX

Not every component deserves the same animation intensity.

| Component | Interaction | Animation Intensity |
|---|---|---|
| Bottom navigation | selection | Medium |
| Course carousel | scroll | Medium |
| Search | focus | Medium |
| Button | press | Low |
| Card | press | Low |
| Bottom sheet | open/close | Medium |
| Modal | open/close | Medium |
| Quiz option | select | Low |
| Quiz question | change | Medium |
| Upload | progress | Functional |
| Toast | appear/disappear | Low |
| Skeleton | loading | Low |
| Background | idle | None |
| Academic text | reading | None |
| Admin table | row interaction | Low |

This matrix should prevent animation inflation during implementation.

---

# 203. VISUAL HIERARCHY TEST

Every screen should pass a five-second test.

Ask a person unfamiliar with the screen:

1. What is this page?
2. What is the primary action?
3. What information is most important?
4. Where would you tap first?
5. Can you understand the hierarchy without reading every word?

If the answers are unclear, visual hierarchy must be revised.

---

# 204. GLASS LAYERING EXAMPLE

A typical page may contain:

Layer 1:

light background.

Layer 2:

content.

Layer 3:

soft glass cards.

Layer 4:

floating navigation.

Layer 5:

temporary sheet/modal.

Each layer should have enough contrast to distinguish it from the layer beneath it.

Do not place a translucent glass card over another translucent glass card unless there is a clear structural reason.

Nested transparency often makes text and borders muddy.

---

# 205. BORDER RULE

Glass borders should be extremely subtle.

Use borders primarily to:

- separate glass from background
- preserve shape
- communicate focus
- communicate selected state

Do not use borders as decoration.

Avoid:

```text
bright blue border
bright purple border
rainbow border
animated gradient border
```

Preferred:

```text
very subtle neutral/white border
```

---

# 206. SELECTED STATE SYSTEM

Every interactive component should have an obvious selected state.

For example, selected filter:

- stronger surface
- accent icon
- stronger label
- optional small indicator

Unselected:

- neutral surface
- secondary text

The selected state must remain understandable without relying only on color.

---

# 207. FAVORITES AND BOOKMARKS

If bookmark functionality is implemented, the icon should transition between:

unselected → selected

The selected state can use:

- filled icon
- slight scale
- short transition

Do not use a large animation.

The action should feel instant.

---

# 208. DOWNLOAD INTERACTION

When a user downloads a resource:

1. Verify permission.
2. Begin download.
3. Show progress if supported.
4. Change state when complete.

Visual state:

```text
Download
↓
Downloading
↓
Downloaded
```

Do not show “Downloaded” merely because the button was tapped.

The state should reflect actual application logic.

---

# 209. OPEN RESOURCE INTERACTION

For protected resources:

- authorize access before exposing content
- show loading state
- open viewer when permitted

If access fails:

“Unable to open this resource.”

Then offer:

“Try again”

or

“Contact support”

Do not expose raw storage errors.

---

# 210. RESOURCE CARD DESIGN

Community resource card:

```text
[Type icon]

Resource title
Subject • Semester

Verified / Pending / Official

[Open]       [Save]
```

The visual priority should be the title.

Metadata must remain secondary.

---

# 211. OFFICIAL RESOURCE CARD

Official resources should have a slightly stronger trust hierarchy.

Example:

```text
✓ Official

B.Tech CSE Semester 4 Syllabus

Updated 28 Aug 2026

[Open]
```

Do not use fake verification indicators.

The backend must determine whether content is official.

---

# 212. COMMUNITY RESOURCE CARD

Community resources can show:

“Community resource”

If approved:

“Verified by BEU BABA”

Only use this wording if moderation actually happened.

This distinction builds user trust.

---

# 213. CONTENT VERSION DISPLAY

When content can be revised, the UI may show:

Version 2

Updated:

28 August 2026

For users, the important information is which version is currently active.

Do not force users to understand database version identifiers.

---

# 214. CALENDAR EVENT DESIGN

Events should have a semantic type.

Examples:

- Exam
- Holiday
- Result
- Registration
- Semester start
- Semester end

Each type should have a consistent visual marker.

Avoid assigning a different random color to every event.

---

# 215. CALENDAR EVENT DETAIL

Tap an event:

Open a sheet containing:

- event title
- date
- time if applicable
- description
- course/semester
- source/status

The sheet should open without navigating away from the calendar when possible.

---

# 216. QUIZ TIMER DESIGN

If a timer exists:

- keep it visible
- avoid constant movement
- change semantic state when time is low

Example:

Normal:

“18:42”

Low time:

“02:15”

Critical:

“00:30”

Do not make the timer flash continuously.

---

# 217. QUIZ NAVIGATION

If questions can be revisited, provide a question navigator.

Example:

```text
1  2  3  4  5
✓  ✓  —  ?  —
```

Legend:

- answered
- unanswered
- current

Do not rely only on color.

---

# 218. QUIZ EXIT CONFIRMATION

If a quiz has progress:

“Leave quiz?”

“Your current attempt may be lost.”

Actions:

Continue quiz

Leave

The exact wording should reflect actual persistence behavior.

Never falsely claim progress will be lost if it is saved.

---

# 219. QUIZ SUBMISSION CONFIRMATION

Before final submission:

Show:

- answered
- unanswered
- flagged if implemented

Then:

“Submit quiz”

This reduces accidental submission.

---

# 220. PROFILE EDIT EXPERIENCE

Profile editing should not expose every field as immediately editable.

Use clear sections.

Example:

Personal:

- name
- profile image

Academic:

- course
- branch
- semester

Contact:

- email
- contact number

Some identity fields may require verification or admin rules.

The UI must communicate when a field cannot be freely changed.

---

# 221. ADMIN STUDENT PROFILE

Admin profile view should prioritize operational information.

Sections:

- identity
- academic data
- account status
- resource activity where permitted
- support history where authorized

Do not present sensitive information unless the admin role actually needs it.

---

# 222. ADMIN MODERATION CARD

A pending resource should show:

```text
Pending Review

Resource title
Uploader
Course / Branch / Semester
Uploaded date

[Preview]

[Approve] [Reject] [Request Changes]
```

Buttons should not be ambiguous.

Reject and approve should not be visually identical.

---

# 223. MODERATION CONFIRMATION

Approve:

“Approve this resource?”

Reject:

“Reject this resource?”

For rejection, request a reason where required.

The reason should be stored with the moderation action if the backend supports it.

---

# 224. SUPPORT MESSAGE ADMIN UI

Admin/developer view:

```text
Support Inbox

Unread 12

Student A
Bug — Syllabus
2m

Student B
Course request
15m

Student C
General question
1h
```

Selecting a conversation opens the message thread.

Do not show every conversation's contents in the inbox list.

---

# 225. MESSAGE SEARCH

Admin can search:

- student
- message
- category
- status

Search must respect permissions.

A search feature must never become an authorization bypass.

---

# 226. NOTIFICATION COMPOSER

Admin notification composer should contain:

- title
- message
- audience
- category
- optional deep link
- schedule if implemented

Before sending:

show recipient scope clearly.

Example:

“All CSE Semester 4 students”

This prevents accidental broad notifications.

---

# 227. NOTIFICATION PREVIEW

Preview should look like the actual student notification.

This lets admin catch:

- overly long title
- poor line breaks
- unclear action

before sending.

---

# 228. DANGER ZONE DESIGN

Administrative destructive actions should be isolated.

Examples:

- delete content
- disable account
- archive course
- remove resource

Use a clearly labeled danger zone.

Do not place destructive actions directly beside routine save buttons.

---

# 229. ADMIN ROLE VISUALIZATION

If multiple admin roles exist:

show the current role subtly.

Examples:

Administrator

Moderator

Content Manager

Do not expose internal permission codes.

---

# 230. RESPONSIVE ADMIN TABLE FALLBACK

On small screens, tables should transform into cards or horizontally scroll only when necessary.

Do not force users to zoom.

For a student row, mobile card can show:

Name

Course

Branch

Status

Actions

Secondary information can be hidden behind “View details.”

---

# 231. SEARCH NO-RESULT STATE

Example:

“No results for ‘DBMS 2022’.”

Then:

“Try a different subject, year, or keyword.”

Optional:

“Request missing resource”

This can connect search failure directly to developer support/resource request.

---

# 232. MISSING CONTENT EXPERIENCE

If a user searches for something that does not exist:

Do not simply say “404.”

Show:

“We don’t have this resource yet.”

Then:

“Request this resource”

This turns missing content into a useful feedback opportunity.

---

# 233. CONTENT REQUEST FLOW

User can request:

- syllabus
- PYQ
- course
- notes
- quiz

Request UI:

- requested item
- subject
- semester
- optional details

This should go into an admin/developer queue.

---

# 234. ANNOUNCEMENT DESIGN

Important announcements should not hijack the entire home screen.

Use a compact banner/card.

Example:

“New Semester 5 syllabus available”

[View]

Dismiss only if the announcement system supports dismissal.

---

# 235. FIRST-RUN PERMISSIONS

Permission prompts should be contextual.

Do not request:

- notifications
- camera
- file access

all at once.

Explain why a permission is useful before requesting it.

---

# 236. NOTIFICATION PERMISSION UX

Instead of immediately asking:

“Allow notifications?”

Explain:

“Get notified when new PYQs, syllabus updates, and developer replies are available.”

Then request permission.

The text must accurately represent actual notification behavior.

---

# 237. FILE PERMISSION UX

When a user uploads a profile image/resource:

Explain what will happen.

For community resources:

“Your upload will be reviewed before it becomes visible to other students.”

This is important because it establishes expectations.

---

# 238. DATA-SAVING UX

If bandwidth matters, images and heavy resources should load progressively.

Use:

- thumbnails
- lazy loading
- compressed previews

The interface should still feel premium on slower networks.

---

# 239. SLOW NETWORK EXPERIENCE

When network is slow:

Do not repeatedly restart animations.

Keep skeleton state stable.

If loading exceeds a reasonable duration:

show useful status.

Example:

“Still loading…”

Then:

“Try again”

---

# 240. RETRY DESIGN

Retry should repeat the failed operation safely.

For example:

- fetch resources
- reload notification list
- reopen support thread

Do not duplicate submissions.

Backend idempotency remains required for operations such as uploads and messages.

---

# 241. NETWORK STATUS

Optional global status:

“Offline”

It should be subtle.

When connection returns:

“Back online”

Then hide automatically.

Do not show a permanent banner after connectivity is restored.

---

# 242. INSTALL-APP NAVIGATION

When running as an installed PWA, the interface should not depend on browser controls.

Ensure:

- navigation works
- back behavior works
- safe areas work
- external documents have predictable behavior

---

# 243. DESKTOP PWA WINDOW

For installed desktop PWA:

- content should remain centered
- navigation should adapt
- no giant empty margins
- keyboard shortcuts may be added later

Do not simply display the mobile UI enlarged.

---

# 244. KEYBOARD SHORTCUTS

Optional desktop shortcuts:

- `/` → focus search
- `Esc` → close sheet/modal
- `?` → shortcut help if implemented

Shortcuts must never conflict with text input.

---

# 245. DESIGN SYSTEM GOVERNANCE

Every new component should be reviewed against:

1. Existing component library.
2. Existing tokens.
3. Existing motion rules.
4. Accessibility requirements.
5. Mobile layout.
6. Desktop layout.

No feature should introduce its own isolated design language.

---

# 246. CHANGE MANAGEMENT

When changing a design token:

check all dependent components.

For example, changing card radius may affect:

- course cards
- toolbox
- notices
- profile
- resource cards

Design tokens should therefore be centralized.

---

# 247. DESIGN VERSIONING

The design system can use versions:

`BEU UI 1.0`

Future major visual changes:

`BEU UI 2.0`

Do not silently mix old and new design patterns.

---

# 248. IMPLEMENTATION ORDER

Recommended UI implementation order:

1. Global tokens
2. Typography
3. Glass materials
4. Buttons
5. Inputs
6. Navigation
7. Cards
8. Sheets/modals
9. Feedback components
10. Home
11. Course
12. PYQ
13. Syllabus
14. Quiz
15. Profile
16. Support
17. Toolbox
18. Admin
19. Accessibility pass
20. Performance pass
21. Responsive QA
22. Animation polish

This order minimizes rework.

---

# 249. FINAL IMPLEMENTATION COMMANDMENT

Do not begin by adding visual effects.

Begin by creating:

- hierarchy
- spacing
- typography
- components
- states
- responsive structure

Then add glass.

Then add restrained animation.

The final polish should be the last layer, not the foundation.

---

# 250. BEU BABA SIGNATURE

The final product should have a recognizable signature:

**Bright background.**

**Translucent premium surfaces.**

**Soft depth.**

**Rounded but disciplined geometry.**

**Floating navigation with an animated selected capsule.**

**Beautiful course-card scrolling.**

**Fast search interaction.**

**Subtle page transitions.**

**Clear academic hierarchy.**

**No dark futuristic background.**

**No RGB.**

**No neon.**

**No unnecessary 3D.**

**No AI-themed visual clutter.**

The result should feel like a calm, polished, modern academic product rather than a template.

---

# 251. FINAL RELEASE GATE

The UI/UX specification is considered successfully implemented only when a complete walkthrough can be performed without encountering:

- inconsistent component styles
- accidental dark backgrounds
- excessive blur
- unreadable glass text
- broken mobile layouts
- inaccessible controls
- missing loading states
- missing empty states
- confusing errors
- unnecessary animations
- slow transitions
- layout jumps
- overlapping navigation
- keyboard-covered controls
- unsafe content exposure
- arbitrary colors
- arbitrary border radii
- arbitrary shadows
- arbitrary motion curves

The application should look deliberate from the first screen to the last administrative screen.

The quality standard is not “looks good in one screenshot.”

The quality standard is:

**every screen, state, transition, breakpoint, loading condition, error condition, and interaction feels like it belongs to the same product.**

---

# 252. HANDOFF REQUIREMENT FOR DEVELOPERS

Before implementing any screen, the developer or coding agent should produce a short internal checklist:

```text
Screen:
Purpose:
Primary action:
Secondary actions:
Data required:
Loading state:
Empty state:
Error state:
Responsive behavior:
Glass level:
Animation:
Accessibility:
Performance considerations:
```

This checklist is not necessarily displayed to the end user. It exists to prevent incomplete implementation.

---

# 253. HANDOFF REQUIREMENT FOR AI CODING AGENTS

An AI coding agent must read this document before generating UI.

It must preserve existing design tokens and components.

If the requested feature is unclear, the agent should infer from the established design language rather than inventing an unrelated visual pattern.

When a feature requires a new visual component, the agent should first determine whether an existing component can be extended.

The agent must never silently introduce:

- dark backgrounds
- neon colors
- RGB effects
- large 3D decorative assets
- AI-style floating objects
- excessive animation
- inaccessible contrast

The agent should optimize for a real student using the application daily, not for a one-time marketing screenshot.

---

# 254. DEFINITION OF “PREMIUM”

For BEU BABA, premium means:

- fast
- calm
- intentional
- readable
- polished
- consistent
- responsive
- accessible
- trustworthy
- visually refined

Premium does not mean:

- expensive-looking decoration
- excessive blur
- excessive gradients
- complex animation
- maximum visual density

This distinction must remain central throughout development.

---

# 255. FINAL PRODUCT QUALITY STATEMENT

BEU BABA should be capable of standing beside polished modern mobile products in terms of interface quality while remaining completely original in branding and visual execution.

The interface must make students want to continue using it because it is genuinely useful and pleasant, not because it constantly demands attention.

The best animation is the animation the user notices for a fraction of a second and immediately understands.

The best glass effect is the one that creates depth without making text difficult to read.

The best card is the one that makes information easier to scan.

The best navigation is the one that makes the destination obvious.

The best premium design is the one that disappears behind an excellent user experience.

That is the visual and interaction standard for BEU BABA.


---

# 256. ARCHITECTURE DECISION RECORDS

This section records important architectural decisions so future developers do not accidentally reverse them.

## ADR-001: React + Vite

### Decision

Use React with Vite as the frontend foundation.

### Reason

BEU BABA requires:

- component reuse
- route-level code splitting
- TypeScript
- PWA support
- modern animation
- a maintainable frontend

Vite provides a lightweight build environment without imposing unnecessary backend conventions.

### Rejected alternative

A plain HTML/CSS/JavaScript application.

Plain HTML/CSS/JS can absolutely build small applications, but BEU BABA has enough stateful modules that component and state management would become increasingly difficult to maintain.

---

# 257. ADR-002: TypeScript

### Decision

Use TypeScript throughout the application.

### Reason

The application has a complex domain model.

Without strong typing, mistakes can occur when:

- a resource has no subject
- semester is represented differently in different modules
- quiz answers use inconsistent IDs
- admin actions expect different payloads
- notification types diverge

TypeScript catches many of these problems before deployment.

---

# 258. ADR-003: Supabase

### Decision

Use Supabase for authentication, database and selected backend capabilities.

### Reason

The project requires:

- authentication
- relational academic data
- row-level security
- storage integration
- realtime support
- scalable structured data

The frontend should not assume Supabase is the security boundary. Database policies remain essential.

---

# 259. ADR-004: Data-Driven Academic Content

### Decision

Academic content must be stored as data rather than hardcoded into UI components.

### Reason

The user needs to change:

- syllabus
- calendar
- PYQ
- courses
- subjects
- resources

without editing source code.

Therefore content management is a first-class architecture requirement.

---

# 260. ADR-005: Bright Glassmorphism

### Decision

The visual system uses bright premium glassmorphism.

### Explicit exclusions

The following are not part of the BEU BABA visual system:

- black/dark futuristic backgrounds
- RGB lighting
- neon borders
- cyberpunk visuals
- AI-themed floating objects
- excessive 3D backgrounds
- particle systems
- animated wallpaper

### Reason

The product is an academic application.

The interface should feel:

- calm
- trustworthy
- premium
- readable
- modern

rather than visually aggressive.

---

# 261. ADR-006: Animation as Functional Communication

### Decision

Animation is allowed only when it improves:

- feedback
- hierarchy
- continuity
- orientation

### Example

When selecting bottom navigation:

the selected capsule moves smoothly.

This tells the user:

“This destination is now active.”

### Bad example

A decorative background continuously moving.

It communicates nothing useful.

---

# 262. ADR-007: Backend as Authorization Boundary

### Decision

The frontend never serves as the final authorization mechanism.

### Reason

Users can inspect frontend code.

Therefore:

```text
hidden button ≠ security
hidden route ≠ security
obfuscated URL ≠ security
```

Security must be enforced server-side.

---

# 263. ADR-008: Feature Isolation

### Decision

Each major domain is isolated into a feature module.

Examples:

```text
features/quiz
features/resources
features/support
features/admin
```

### Reason

This makes it easier to:

- debug
- test
- modify
- remove
- expand

features without creating a monolithic application.

---

# 264. ADR-009: Shared UI Primitives

### Decision

Visual primitives should be reusable.

Examples:

```text
GlassCard
GlassButton
GlassInput
BottomSheet
Modal
Navigation
```

### Reason

Without shared primitives, visual drift occurs.

One screen may use:

```text
24px radius
```

another:

```text
18px radius
```

and another:

```text
32px radius
```

without a reason.

A design system prevents this.

---

# 265. ADR-010: No Hardcoded User Data

Student-specific information should come from authenticated profile data.

Do not hardcode:

```text
Abhishek
CSE
Semester 4
```

inside the application.

Development mock data may exist temporarily, but production rendering must use real data.

---

# 266. ROUTE DATA CONTRACT

Every major route should have a documented data contract.

Example:

## `/courses`

Required:

- authenticated student
- active course
- accessible subjects

Optional:

- recently viewed courses

Loading:

- skeleton

Empty:

- no courses assigned

Error:

- retry

---

# 267. `/pyq` DATA CONTRACT

Required:

- authenticated session if PYQ access is restricted

Query parameters:

```text
course
branch
semester
subject
year
```

Response:

- paginated PYQs
- metadata
- total/continuation information

UI states:

- loading
- results
- empty
- error

---

# 268. `/syllabus` DATA CONTRACT

Inputs:

- course
- branch
- semester

Output:

- active syllabus
- version
- effective date
- subjects/units
- resource reference

The frontend must not assume the current syllabus is permanently the same.

---

# 269. `/calendar` DATA CONTRACT

Input:

- course
- branch
- semester
- date range

Output:

- events
- category
- date
- description
- active state

Date range should be bounded to avoid unnecessarily large responses.

---

# 270. `/quiz/:quizId` DATA CONTRACT

The client needs:

- quiz metadata
- questions
- answer options
- attempt state where applicable

Sensitive answer validation must remain server-side where required.

---

# 271. `/resources` DATA CONTRACT

Filters:

```text
course
branch
semester
subject
type
status where authorized
```

Student result status should generally be limited to publishable resources.

Admin can access moderation states according to permissions.

---

# 272. `/support` DATA CONTRACT

Student:

- own conversation
- own messages

Admin:

- authorized support conversations
- message history
- status
- student identity fields required for support

The frontend must never request every student's private conversation for a normal user.

---

# 273. API/SERVICE NAMING

Services should use verbs representing actions.

Examples:

```text
getCourses()
getCourseById()
searchPYQs()
getSyllabus()
createResourceRequest()
sendSupportMessage()
markNotificationRead()
submitQuiz()
```

Avoid vague functions:

```text
doThing()
handleData()
getStuff()
```

---

# 274. SERVICE ERROR CONTRACT

Services should throw or return structured errors.

Concept:

```ts
{
  code: "RESOURCE_NOT_FOUND",
  message: "Resource not found"
}
```

The UI can map known codes to human-friendly messages.

Do not expose internal database error details.

---

# 275. QUERY KEY GOVERNANCE

If using TanStack Query, define query keys centrally or consistently.

Example:

```text
["courses"]
["course", courseId]
["pyq", filters]
["syllabus", courseId, branchId, semester]
```

Inconsistent keys create cache bugs.

---

# 276. CACHE STALENESS

Different data requires different freshness.

High freshness:

- support messages
- notifications

Moderate:

- resources
- announcements

Longer:

- static toolbox configuration

Potentially long:

- course metadata

The exact durations should be selected based on real usage.

---

# 277. CACHE INVALIDATION AFTER ADMIN UPDATE

When admin changes syllabus:

invalidate:

```text
syllabus queries
home announcements if relevant
course detail if syllabus metadata is shown there
```

Do not refresh unrelated quiz data.

---

# 278. AUTH CACHE INVALIDATION

When user logs out:

clear user-specific cached data.

This is important.

A second person using the same browser should not see stale private data from the previous session.

---

# 279. ACCOUNT SWITCHING

If account switching is ever supported:

the cache must be scoped to the current authenticated user.

Never allow:

```text
Student A cache
```

to render for:

```text
Student B
```

---

# 280. PRIVATE DATA CACHE POLICY

Private information should be handled carefully.

Potentially private:

- profile
- support messages
- quiz history
- personal notifications
- student activity

Avoid persisting these in broad shared browser storage unnecessarily.

---

# 281. LOCAL STORAGE POLICY

Local storage can be used for low-risk preferences:

- theme preference if applicable
- toolbox settings
- dismissed non-sensitive UI state

Do not store:

- passwords
- service-role secrets
- raw private messages
- sensitive tokens unnecessarily

Use the authentication library's recommended secure session strategy.

---

# 282. SESSION TOKEN POLICY

Never manually expose session tokens in:

- URLs
- logs
- analytics events
- support messages
- error screenshots

Use the authentication SDK's recommended mechanism.

---

# 283. URL QUERY SECURITY

Query parameters can be visible in:

- browser history
- analytics
- copied links
- screenshots

Do not place sensitive information in URLs.

IDs may be acceptable, but authorization must still be checked.

---

# 284. CONTENT ACCESS CHECK

Every protected content request should follow:

```text
user
↓
authorization
↓
resource lookup
↓
content delivery
```

Not:

```text
URL
↓
open file
```

---

# 285. STORAGE URL POLICY

Avoid permanently exposing private storage paths when signed/controlled access is required.

Use appropriate storage access patterns.

---

# 286. XSS PREVENTION

User-generated content can include:

- resource titles
- descriptions
- support messages
- quiz explanations

Never render arbitrary HTML from users unless sanitized and explicitly required.

Prefer plain text rendering.

---

# 287. RICH TEXT

If rich text is later introduced:

use a trusted sanitizer.

Never directly render unsanitized user HTML.

---

# 288. FILE SECURITY

Uploaded files can be malicious.

Frontend validation is not enough.

Backend/storage pipeline should consider:

- MIME validation
- file size
- allowed formats
- malware scanning where appropriate
- access control

The frontend should present upload failures cleanly.

---

# 289. DENIAL-OF-SERVICE CONSIDERATIONS

Users should not be able to repeatedly trigger expensive operations without reasonable controls.

Examples:

- massive searches
- unlimited uploads
- repeated support message spam
- repeated notification actions

Backend rate limiting may be required.

---

# 290. CLIENT RATE LIMIT UX

If backend returns a rate-limit response:

show:

“Too many requests. Please wait a moment and try again.”

Do not show a technical HTTP status as the primary message.

---

# 291. SEARCH RATE LIMITING

Debouncing reduces accidental load.

Backend rate limiting provides actual protection.

Both layers are useful.

---

# 292. UPLOAD RATE LIMITING

Consider limits for:

- number of files
- file size
- frequency

The frontend should communicate limits before upload where possible.

---

# 293. SUPPORT SPAM PREVENTION

A support composer can prevent accidental duplicate submissions.

For example:

- disable send while sending
- prevent blank messages
- optionally limit repeated identical messages

Do not make legitimate support communication difficult.

---

# 294. FORM DRAFTS

For longer forms, preserve draft state where useful.

Examples:

- admin announcement
- resource metadata
- quiz builder

Avoid preserving sensitive information indefinitely.

---

# 295. BROWSER REFRESH

Refreshing should not unexpectedly destroy important progress.

For quiz:

if persistence is supported, restore the attempt.

For a simple search:

restoring query is optional.

For support message:

unsent draft may be preserved temporarily if useful.

---

# 296. DEEP LINK RESTORATION

If an unauthenticated user opens:

```text
/quiz/123
```

then gets redirected to login:

after successful login, return them to the intended route if appropriate.

Do not redirect everyone to home unnecessarily.

---

# 297. INVALID DEEP LINK

If target content no longer exists:

show a meaningful not-found state.

Do not repeatedly attempt the same request.

---

# 298. BACK NAVIGATION

Mobile back behavior should be predictable.

Examples:

Sheet open:

Back → close sheet

Modal open:

Back → close modal

Nested route:

Back → previous page

Root:

Back behavior should follow platform expectations.

---

# 299. SCROLL POSITION

When returning to a list:

preserving scroll position can improve UX.

Example:

PYQ list → open paper → back → return to same location.

Implement only where it improves navigation and does not create stale UI problems.

---

# 300. FINAL FRONTEND ARCHITECTURE STANDARD

The BEU BABA frontend must be treated as a long-term product codebase.

The architecture must support:

```text
Student
  ↓
Authentication
  ↓
Profile
  ↓
Academic context
  ↓
Courses
  ├── Subjects
  ├── Syllabus
  ├── PYQ
  ├── Resources
  └── Quizzes
       ↓
      Results

Home
  ├── Search
  ├── Announcements
  ├── Continue
  └── Recent content

Community
  ├── Upload
  ├── Moderation
  └── Verified resources

Support
  └── Private developer conversation

Toolbox
  └── 10+ utilities

Admin
  ├── Students
  ├── Courses
  ├── Subjects
  ├── Syllabus
  ├── PYQ
  ├── Calendar
  ├── Resources
  ├── Quizzes
  ├── Notifications
  └── Support
```

The implementation must remain modular even as this graph grows.

The frontend is successful when a new developer can answer:

- where a feature belongs
- where its data comes from
- where its authorization is enforced
- where its UI components live
- how its loading/error states work
- how it behaves on mobile
- how it behaves offline
- how it is animated
- how it is tested
- how it interacts with the design system

without reverse-engineering the entire codebase.

The ultimate engineering objective is therefore:

**BEU BABA should be easy to extend without becoming easy to break.**

A premium product requires premium engineering discipline underneath the visual layer.
