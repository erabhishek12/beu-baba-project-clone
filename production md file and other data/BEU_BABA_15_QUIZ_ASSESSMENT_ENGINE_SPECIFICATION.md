# BEU BABA — 15. QUIZ, ASSESSMENT, QUESTION BANK & RESULTS ENGINE SPECIFICATION

**Document ID:** BEU-BABA-15  
**Document type:** Production-grade product, UX, frontend, backend, database, security and operations specification  
**Status:** Master implementation specification  
**Scope:** Student quiz experience, question bank, quiz creation, attempts, scoring, result cards, analytics, moderation, anti-abuse controls and administrative workflows  
**Design language:** Premium Apple-inspired light glassmorphism; clean, bright, calm, highly usable; no dark UI, no RGB/neon overload, no artificial 3D background objects.

---

## 0. PURPOSE

This document defines the complete quiz and assessment system for **BEU BABA**. It is intentionally written as an implementation specification rather than a list of ideas. A developer should be able to use this document to understand what the feature does, how the user moves through it, what data must exist, what states must be handled, how scoring works, how the UI should behave, and how the administrator controls the system.

The quiz system must feel like a natural part of BEU BABA rather than a separate quiz website embedded inside the application. The experience should be fast, distraction-free and premium. The visual language must remain consistent with the application's light glassmorphism design system: translucent white surfaces, soft borders, restrained shadows, subtle depth, generous spacing, readable typography and smooth interaction feedback.

The system must support academic quizzes for B.Tech and related BEU/Bihar university preparation, but its data model must remain generic enough to support other courses, branches, semesters, subjects, entrance preparation and custom practice sets later.

The system must support both small practice quizzes and larger examination-style tests. It must also support a user-generated quiz-card result that can be downloaded or shared as an image without exposing private information that the student has not chosen to display.

The feature is not merely "a page containing multiple-choice questions." It is an assessment platform with a complete lifecycle:

1. quiz discovery,
2. quiz information,
3. instructions,
4. attempt initialization,
5. question delivery,
6. answer selection,
7. navigation,
8. timer handling,
9. auto-save,
10. submission,
11. scoring,
12. result presentation,
13. review,
14. performance analytics,
15. retry,
16. leaderboard or comparison where enabled,
17. moderation of user-created material,
18. administrative control,
19. auditability,
20. secure data handling.

Every state must be explicitly designed. Empty states, loading states, error states, expired attempts, interrupted sessions, duplicate submissions, unavailable questions, deleted quizzes and permission failures must not be left to browser defaults.

---

# 1. PRODUCT OBJECTIVES

## 1.1 Primary objective

The primary objective is to make BEU BABA the student's first destination for quick academic practice. A student should be able to open the app, choose a subject or topic, start a quiz within seconds, finish it without confusion, understand mistakes immediately and see measurable progress over time.

## 1.2 Secondary objectives

The system should:

- increase daily engagement without manipulative mechanics;
- encourage revision through short quizzes;
- make PYQ practice more interactive;
- connect quiz questions to course, semester, branch and subject metadata;
- identify weak topics;
- allow administrators to publish verified quizzes;
- allow students to submit useful quiz resources for moderation;
- provide meaningful performance analytics;
- create attractive downloadable result cards;
- preserve academic credibility by clearly separating official and community-created material;
- remain performant on low-end Android devices and ordinary mobile networks.

## 1.3 Non-goals

The initial system is not intended to:

- replace a formal university examination system;
- provide legally binding academic certification;
- guarantee invigilation-level examination security;
- collect unnecessary biometric information;
- require continuous camera access;
- use invasive surveillance;
- create a social-media-style public profile system;
- introduce distracting AI-themed visuals;
- introduce cryptocurrency, gambling, paid loot mechanics or similar engagement systems.

---

# 2. CORE PRODUCT PRINCIPLES

## 2.1 Accuracy before decoration

A quiz interface must prioritize the question, answer choices, remaining time and navigation. Glass effects must never reduce text contrast or make controls difficult to identify.

## 2.2 One obvious action at a time

The primary action on each screen must be visually clear. During an attempt, "Next" and "Submit" must not compete equally with unrelated navigation.

## 2.3 Fast recovery

If the network disappears, the student should not lose an already selected answer. Local state must be retained and synchronized when connectivity returns.

## 2.4 Explain mistakes

A result is useful only when the student can understand what went wrong. Explanations should be supported at the question level.

## 2.5 Verified content is visibly trustworthy

Official/admin-verified quizzes should be distinguishable from student-submitted community quizzes without making the UI noisy. A small verification badge and a clear metadata label are sufficient.

## 2.6 Privacy by default

Only necessary student data should be shown in results, leaderboards and shared cards. Contact number, email and other private profile fields must never appear by default.

## 2.7 Consistent architecture

Quiz data must use the same course, branch, semester, subject and academic-year structures as the rest of BEU BABA. Do not create duplicate naming systems for quiz categories.

---

# 3. USER ROLES

The quiz platform has multiple roles.

### Student

Can discover quizzes, start permitted quizzes, answer questions, submit attempts, review results and manage personal quiz history.

### Content Contributor

Can submit quiz/question resources for moderation if the product enables student contributions.

### Moderator

Can review submitted questions and quizzes, request corrections, reject unsuitable content and approve valid material.

### Content Admin

Can create, edit, publish, archive and version official quizzes.

### Super Admin

Has full control including permissions, destructive operations and system-level configuration.

### Support Admin

Can inspect a student's attempt state when necessary for support but should not receive unrestricted access to unrelated private profile data.

### Analytics/Admin Viewer

Can view aggregate statistics without necessarily being allowed to edit content.

---

# 4. QUIZ CONTENT HIERARCHY

Every quiz should belong to a predictable hierarchy.

Recommended hierarchy:

**Course → Branch → Semester → Subject → Unit/Topic → Quiz**

Example:

B.Tech → Computer Science & Engineering → Semester 3 → Data Structures → Trees → Trees Practice Quiz 01

The same quiz can optionally be associated with:

- academic year;
- regulation/syllabus version;
- difficulty;
- question count;
- estimated duration;
- source;
- tags;
- PYQ status;
- official/community status;
- language;
- negative marking policy;
- publication status.

Do not store human-readable category relationships only inside a JSON blob. Core relationships should be normalized in the database so filtering, permissions, analytics and future migrations remain reliable.

---

# 5. QUIZ TYPES

The system should support a controlled set of quiz types.

## 5.1 Practice Quiz

Short, low-pressure quiz intended for revision.

Typical properties:

- 5–20 questions;
- optional timer;
- immediate or final result;
- explanations enabled;
- retry allowed.

## 5.2 Timed Test

Exam-like assessment.

Typical properties:

- fixed duration;
- fixed question set;
- final submission;
- configurable navigation;
- configurable negative marking;
- result available after submission.

## 5.3 PYQ Quiz

Questions derived from previous-year questions.

Metadata should preserve:

- examination year;
- subject;
- paper/session where known;
- source/reference;
- question number if available.

## 5.4 Topic Challenge

A focused test on a single concept.

## 5.5 Mixed Revision Quiz

Combines multiple topics from a subject.

## 5.6 Custom Quiz

A quiz assembled by an administrator from the question bank.

## 5.7 Community Quiz

Created or submitted by a student and shown only after moderation.

---

# 6. QUESTION TYPES

The first production version should prioritize robust question types rather than attempting every possible assessment format.

## 6.1 Single-choice MCQ

One correct answer.

Required fields:

- question text;
- options;
- correct option;
- explanation;
- difficulty;
- subject/topic metadata.

## 6.2 Multiple-choice

More than one correct answer.

The scoring policy must be explicitly configured. Do not silently reuse single-choice scoring.

Supported policies may include:

- all-or-nothing;
- partial credit;
- no credit unless all correct;
- configurable percentage.

The initial release should preferably use all-or-nothing to reduce ambiguity.

## 6.3 True/False

Two options, represented with the same answer component system.

## 6.4 Assertion/Reason

Two-part academic question. The content model must preserve assertion and reason separately so the presentation remains structured.

## 6.5 Numerical answer

Optional future type. If implemented, define tolerance and decimal handling explicitly.

## 6.6 Match-the-following

Optional future type. It requires a dedicated interaction model and should not be approximated with confusing drag-and-drop on mobile.

---

# 7. QUESTION DATA MODEL

A question should conceptually contain:

- stable ID;
- version ID;
- question type;
- question body;
- optional image;
- optional diagram;
- optional code block;
- options;
- correct answer representation;
- explanation;
- difficulty;
- marks;
- negative marks;
- topic;
- source;
- year;
- language;
- status;
- author;
- reviewer;
- timestamps.

A question must be versionable.

If an administrator corrects an answer after students have already attempted the old version, the historical attempt should remain reproducible. Therefore, an attempt must reference the exact question version presented at attempt time, not only the mutable current question ID.

This is a critical integrity requirement.

---

# 8. QUIZ VERSIONING

A published quiz should behave as an immutable assessment snapshot for active attempts.

Recommended states:

- draft;
- review;
- approved;
- scheduled;
- published;
- paused;
- archived;
- rejected.

When a published quiz changes materially, create a new version rather than modifying the historical version in place.

Examples of material changes:

- question added;
- question removed;
- correct answer changed;
- marks changed;
- timer changed;
- negative marking changed;
- question order policy changed.

Minor presentation edits may be allowed under controlled rules, but historical attempts must remain auditable.

---

# 9. QUIZ DISCOVERY EXPERIENCE

The quiz home screen should not resemble a spreadsheet.

Recommended layout:

1. top greeting/header;
2. compact search field;
3. category chips;
4. featured quiz card;
5. "Continue quiz" section if an unfinished attempt exists;
6. subject-based quiz sections;
7. recent quizzes;
8. performance snapshot;
9. community section where enabled.

The screen should feel light and premium.

Use translucent cards with:

- white/semi-transparent surfaces;
- subtle backdrop blur;
- thin low-opacity border;
- small radius variation based on hierarchy;
- soft shadow;
- restrained highlight.

Do not put large 3D objects behind the quiz list.

---

# 10. QUIZ CARD DESIGN

A quiz card should communicate the most important information without requiring the user to open it.

Recommended information:

**Title**  
Subject/topic  
Question count  
Estimated time  
Difficulty  
Official/verified status  
Attempt status

Example:

> Data Structures — Trees  
> 15 Questions · 12 min  
> Medium · Verified

Optional progress:

> 8/15 completed

The card's visual hierarchy must be consistent across mobile and desktop.

The card may use a very subtle gradient tint derived from the subject category, but avoid loud gradients.

---

# 11. QUIZ DETAIL SCREEN

The detail screen must answer:

- What is this quiz?
- How long will it take?
- How many questions?
- Is there negative marking?
- Can I retry?
- What topics are included?
- Who published it?
- Is it verified?
- What happens to my result?

Sections:

### Header

Quiz title, verification state and subject.

### Statistics

Question count, duration, marks, difficulty.

### Coverage

Topics or units included.

### Rules

Timer, navigation, marking and submission rules.

### Action

Primary "Start Quiz" button.

If an existing unfinished attempt exists, show:

- Continue;
- Restart, if allowed.

Do not hide a potentially recoverable attempt.

---

# 12. START QUIZ FLOW

When the student taps Start:

1. verify authentication;
2. verify quiz is published and available;
3. verify eligibility if restrictions exist;
4. create an attempt record;
5. create or resolve the question snapshot;
6. initialize timer;
7. return first question;
8. store local attempt state;
9. navigate to attempt UI.

The server must be authoritative for eligibility and attempt creation.

The client must never be trusted to say "this user is allowed."

---

# 13. ATTEMPT STATE MACHINE

An attempt should use explicit states.

Recommended:

- initialized;
- in_progress;
- submitted;
- auto_submitted;
- expired;
- cancelled;
- invalidated;
- reviewed.

Transitions must be controlled.

Examples:

`initialized → in_progress`

`in_progress → submitted`

`in_progress → auto_submitted`

`in_progress → expired`

`submitted → reviewed`

An expired attempt must not be treated as a normal abandoned draft.

---

# 14. QUESTION SCREEN

The question screen is the most important interaction surface.

Recommended mobile structure:

- compact top bar;
- question progress;
- timer;
- question content;
- optional image/diagram;
- answer choices;
- mark-for-review control;
- previous/next controls.

Avoid excessive chrome.

The question itself should receive the largest visual attention.

Example top area:

`Question 07 of 20`

`12:48 remaining`

The progress indicator can be a thin capsule or segmented indicator.

---

# 15. ANSWER OPTION DESIGN

Each option should be a large touch target.

States:

1. default;
2. hovered;
3. pressed;
4. selected;
5. disabled;
6. correct after result;
7. incorrect after result;
8. correct answer when user selected another option.

During an active quiz, do not reveal correctness unless the quiz is configured for immediate feedback.

Selected state should be unmistakable through:

- border;
- subtle background tint;
- leading selection indicator;
- slight elevation.

Do not rely only on color.

---

# 16. TIMER

The timer must be trustworthy.

The client may display a countdown, but the server should retain enough information to determine whether the attempt is still valid.

Store:

- attempt start time;
- configured duration;
- server-side expiration time.

Prefer calculating remaining time from server timestamps rather than relying entirely on a JavaScript countdown that can be manipulated.

The UI may locally animate the countdown every second.

At low time thresholds:

- 60 seconds: subtle visual emphasis;
- 15 seconds: stronger emphasis;
- 0 seconds: automatic submission.

Do not use loud flashing or alarming sound by default.

---

# 17. AUTO-SAVE

Every answer change should be persisted.

To reduce unnecessary requests, the client can debounce synchronization, but it must immediately update local state.

Suggested flow:

1. user selects answer;
2. local state changes immediately;
3. UI confirms selection;
4. sync request is queued;
5. server stores answer;
6. local pending state clears.

If synchronization fails:

- keep answer locally;
- show a small non-blocking offline/sync indicator;
- retry automatically.

Never erase an answer because a request failed.

---

# 18. OFFLINE AND NETWORK RECOVERY

The app must tolerate temporary network loss.

At minimum:

- cache the active question set needed for the current attempt;
- persist selected answers locally;
- queue answer updates;
- retry when connectivity returns;
- avoid duplicate writes through idempotent answer operations.

If a submission request times out, the client should not immediately create another attempt. It should check the existing attempt status first.

---

# 19. QUESTION NAVIGATION

Supported navigation:

- Next;
- Previous;
- question palette;
- mark for review;
- unanswered filter.

The question palette can show states such as:

- answered;
- unanswered;
- marked;
- current.

Do not show correct/incorrect during an active assessment unless explicitly configured.

On mobile, the question palette should open as a bottom sheet or modal sheet rather than permanently consuming screen width.

---

# 20. SUBMISSION FLOW

When the student presses Submit:

If unanswered questions remain, show a confirmation sheet:

> You have 3 unanswered questions. Submit anyway?

Buttons:

- Continue quiz;
- Submit test.

If all questions are answered:

> Submit your quiz?

The confirmation must prevent accidental submission.

Once confirmed:

1. lock answer editing;
2. synchronize pending answers;
3. submit attempt idempotently;
4. server calculates final state;
5. client receives result;
6. navigate to result screen.

The server must be the final authority for scoring.

---

# 21. DUPLICATE SUBMISSION PROTECTION

Submission must be idempotent.

If the same request is received twice:

- do not create two results;
- do not double-count analytics;
- do not generate two separate attempts.

Use an attempt ID and controlled state transition.

If an attempt is already submitted, subsequent submission calls should return the existing result state rather than recalculating a different result.

---

# 22. SCORING ENGINE

The scoring engine must be deterministic.

For a simple single-choice quiz:

`score = correct_marks - negative_marks`

Where:

- correct answer = configured positive marks;
- incorrect answer = configured negative marks;
- unanswered = zero unless the quiz explicitly defines another policy.

Example:

20 questions × 1 mark  
5 incorrect × 0.25 negative  
Score = correct count − 1.25

The system should store both raw counts and calculated score.

Recommended result fields:

- total questions;
- answered;
- unanswered;
- correct;
- incorrect;
- marks obtained;
- maximum marks;
- percentage;
- accuracy;
- time used;
- time remaining;
- percentile if enabled;
- rank if enabled.

---

# 23. SCORING SECURITY

Never trust a client-supplied `is_correct` value.

The client should submit the selected option. The server compares it against the immutable question version.

Never send answer keys to the browser before they are needed.

For a normal exam-style quiz, the client should receive question content and option IDs but not the correct option.

Do not place correct answers in obvious hidden HTML, data attributes or client-side configuration.

---

# 24. RESULT SCREEN

The result screen should feel rewarding but calm.

Top:

- score;
- percentage;
- result label.

Example:

**16 / 20**  
**80%**

Then:

- correct;
- incorrect;
- unanswered;
- accuracy;
- time.

A compact performance message may appear:

> Strong attempt. Revise Trees Traversal and Heap Operations to improve further.

The message should be based on actual analytics and not make unsupported claims.

---

# 25. RESULT RING / SCORE VISUALIZATION

A circular progress indicator may show percentage.

It must remain accessible.

The percentage must also be written as text.

Avoid oversized dashboard-style gauges that consume most of the screen.

A glass card containing the score and a subtle progress ring is sufficient.

---

# 26. QUESTION REVIEW

After submission, the student can review questions according to quiz configuration.

For each question:

- question number;
- question;
- selected answer;
- correct answer;
- explanation;
- topic;
- source where appropriate.

Incorrect answers should be easy to scan.

Use labels:

**Your answer**

**Correct answer**

**Explanation**

The design should avoid shaming language.

---

# 27. EXPLANATIONS

Explanation content should be authored by admins/moderators.

A good explanation should answer:

1. Why is the correct answer correct?
2. Why are the common alternatives incorrect?
3. What concept should the student remember?

Keep explanations concise enough for mobile reading, but allow detailed explanations where academic content requires them.

Markdown-like formatting can be supported for:

- bold terms;
- lists;
- equations;
- code;
- references.

Sanitize all rendered content.

---

# 28. PERFORMANCE ANALYTICS

The system should calculate useful metrics.

### Accuracy

`correct / answered × 100`

### Attempt completion

`answered / total × 100`

### Score percentage

`marks obtained / maximum marks × 100`

### Average time per question

`time used / answered questions`

### Topic accuracy

`topic correct / topic answered × 100`

### Improvement

Compare current performance with prior attempts where meaningful.

Do not show an improvement percentage when there is insufficient historical data.

---

# 29. WEAK-TOPIC DETECTION

The app can identify topics requiring revision.

For example:

- Arrays: 88%
- Linked Lists: 72%
- Trees: 48%
- Graphs: 61%

The UI can recommend:

> Revise Trees before your next attempt.

Recommendations must be based on sufficient sample size. A single question should not permanently label a topic as weak.

A minimum threshold such as 3–5 answered questions can be configured.

---

# 30. RETRY

Retry behavior should be configurable.

Possible modes:

- unlimited;
- limited attempts;
- one attempt;
- retry after cooldown.

Practice quizzes should normally allow retry.

Timed or competitive tests may restrict retries.

When retrying, create a new attempt rather than mutating the old attempt.

Historical attempts must remain available.

---

# 31. PERSONAL QUIZ HISTORY

The student profile can contain:

- recent attempts;
- best score;
- average score;
- total quizzes completed;
- strongest subjects;
- improvement trend.

Do not overload the profile.

A compact "Quiz Progress" card can link to a dedicated history screen.

---

# 32. LEADERBOARD

A leaderboard is optional and should be enabled only where it provides genuine value.

Possible modes:

- quiz-specific;
- weekly;
- subject-specific;
- campus/community.

Privacy requirements:

- display nickname or chosen display name;
- never expose email or phone;
- allow leaderboard opt-out;
- avoid showing exact personal ranking when data volume is too low.

Do not build a leaderboard that encourages unhealthy comparison as the central engagement mechanism.

---

# 33. DOWNLOADABLE QUIZ RESULT CARD

After completion, provide:

**Download Result Card**

The generated card can contain:

- BEU BABA logo/name;
- quiz title;
- subject;
- score;
- percentage;
- correct/incorrect/unanswered;
- date;
- optional display name;
- optional streak/progress indicator.

Do not include:

- phone number;
- email;
- internal user ID;
- private database identifiers.

The user should have a preview before downloading.

The visual design should match the app's premium light glass identity.

---

# 34. RESULT CARD GENERATION

Prefer generating the card deterministically from structured data.

Possible implementation approaches:

- browser canvas;
- SVG;
- HTML-to-image;
- server-generated image for controlled environments.

The card must work on mobile.

Text must remain readable at social-media dimensions.

If an avatar is used, the user must have control over whether it appears.

---

# 35. QUESTION BANK ADMINISTRATION

The question bank is the foundation of the quiz system.

Admins should be able to:

- create;
- edit;
- duplicate;
- archive;
- search;
- filter;
- tag;
- bulk import;
- bulk export;
- review;
- version;
- attach media;
- associate questions with subjects/topics.

Filters:

- course;
- branch;
- semester;
- subject;
- unit;
- topic;
- difficulty;
- question type;
- source;
- year;
- status;
- author;
- reviewer.

---

# 36. QUESTION AUTHORING UI

The question editor should have a clear sequence.

### Section A — Metadata

- course;
- branch;
- semester;
- subject;
- topic;
- difficulty;
- source;
- year.

### Section B — Question

Rich text editor.

### Section C — Options

Dynamic option fields.

### Section D — Answer

Correct option selection.

### Section E — Explanation

Explanation editor.

### Section F — Validation

Warnings for:

- missing answer;
- duplicate options;
- empty explanation;
- unsupported media;
- invalid metadata.

### Section G — Save

Draft / Submit for review / Publish depending on role.

---

# 37. QUESTION VALIDATION

Before publishing:

- question text must not be empty;
- required options must exist;
- correct answer must exist;
- question type must match answer schema;
- marks must be valid;
- negative marks must not be invalid;
- referenced media must exist;
- required metadata must exist;
- unsafe HTML must be sanitized;
- duplicate question detection should be considered.

Validation errors should be shown near the relevant field and in a summary at the top.

---

# 38. DUPLICATE QUESTION DETECTION

The system should detect likely duplicates using normalized text and optionally semantic similarity later.

Exact duplicate detection:

1. normalize whitespace;
2. normalize punctuation where appropriate;
3. compare normalized question content;
4. compare source/year metadata.

Potential duplicates should warn admins but should not automatically delete content.

---

# 39. BULK QUESTION IMPORT

Support structured CSV/JSON import.

A CSV template can contain:

- question;
- option_a;
- option_b;
- option_c;
- option_d;
- correct_option;
- explanation;
- subject;
- topic;
- difficulty;
- marks;
- negative_marks;
- source;
- year.

Import must be staged:

1. upload;
2. parse;
3. validate;
4. preview;
5. identify errors;
6. confirm;
7. create drafts.

Never directly publish an uploaded spreadsheet.

---

# 40. QUIZ BUILDER

Admins should be able to create a quiz manually or from filters.

Example:

> Subject: Data Structures  
> Topic: Trees  
> Difficulty: Medium  
> Questions: 20

The builder can select matching questions.

Optional randomization:

- random question selection from a pool;
- random option order.

If randomization is enabled, store the resolved question order for each attempt so historical review remains reproducible.

---

# 41. RANDOM QUESTION POOLS

A quiz may define a pool rather than a fixed list.

Example:

Pool = 100 questions  
Attempt receives = 20 questions

Important requirements:

- selection must be deterministic for an individual attempt once created;
- question distribution should be auditable;
- archived/deleted questions should not break active attempts;
- difficulty balancing can be configured.

A pool-based quiz should specify its selection policy explicitly.

---

# 42. RANDOM OPTION ORDER

Option randomization can reduce answer-position memorization.

The system must store the displayed option ordering in the attempt snapshot.

The correct answer should be represented independently from its visual position.

---

# 43. COMMUNITY QUIZ SUBMISSION

Students may be allowed to submit:

- question sets;
- quiz documents;
- topic quizzes;
- explanatory resources.

Community content must never automatically become official content.

Workflow:

**Submitted → Automated validation → Moderator review → Changes requested / Rejected / Approved → Published**

The original submitter can see status.

---

# 44. COMMUNITY SUBMISSION RULES

The upload UI must explain:

- only educational content;
- no copyrighted material that the user is not permitted to distribute;
- no personal information;
- no malicious files;
- accurate answer keys required;
- moderators may edit formatting;
- publication is not guaranteed.

This reduces moderation burden.

---

# 45. MODERATION

Moderators should review:

- correctness;
- clarity;
- relevance;
- duplicate status;
- source attribution;
- formatting;
- inappropriate content;
- answer-key accuracy.

Each moderation action should be logged.

Actions:

- approve;
- reject;
- request changes;
- archive;
- escalate.

---

# 46. MODERATION COMMENTS

When rejecting or requesting changes, a moderator should provide a reason.

Examples:

- incorrect answer key;
- duplicate question;
- unclear wording;
- unsupported source;
- incomplete explanation;
- wrong subject mapping.

The student should receive a human-readable status message rather than an internal moderation code.

---

# 47. ADMIN QUIZ DASHBOARD

Admin dashboard cards:

- published quizzes;
- drafts;
- pending moderation;
- reported questions;
- recent submissions;
- active attempts;
- completion rate;
- average score.

The dashboard should prioritize actionable information.

Avoid decorative charts without operational value.

---

# 48. REPORTING A QUESTION

Students should be able to report a question after submission.

Reasons:

- incorrect answer;
- typo;
- confusing question;
- broken image;
- duplicate;
- inappropriate;
- wrong subject.

Optional comment field.

The report should create a moderation ticket linked to the question version.

---

# 49. REPORT LIFECYCLE

States:

- open;
- reviewing;
- resolved;
- dismissed;
- escalated.

Resolution should record:

- action;
- reviewer;
- timestamp;
- optional note.

If the answer key is corrected, create a new question version where required.

---

# 50. SECURITY MODEL

The quiz engine must assume that the client is untrusted.

Never trust:

- score;
- correct-answer flags;
- remaining time;
- attempt permissions;
- quiz publication status;
- user role;
- completion state.

The backend must validate all critical operations.

Use database row-level security for user-owned attempt data.

A student should only be able to access their own private attempts unless an explicit aggregate or administrative policy permits otherwise.

---

# 51. DATABASE CONCEPTS

Recommended entities include:

- quizzes;
- quiz_versions;
- quiz_questions;
- questions;
- question_versions;
- question_options;
- attempts;
- attempt_questions;
- answers;
- results;
- result_topic_metrics;
- reports;
- moderation_actions;
- quiz_tags;
- quiz_topics.

Exact table naming may follow the broader BEU BABA database convention, but relationships must preserve these concepts.

---

# 52. ATTEMPT SNAPSHOT

When an attempt begins, preserve enough information to reproduce what the student saw.

Snapshot may include:

- quiz version;
- question version IDs;
- question order;
- option order;
- marks;
- negative marks;
- timer configuration.

This prevents later content edits from changing historical results.

---

# 53. ANALYTICS EVENTS

Useful events:

- quiz_viewed;
- quiz_started;
- question_answered;
- question_marked;
- question_unmarked;
- quiz_submitted;
- quiz_auto_submitted;
- result_viewed;
- question_reviewed;
- result_card_generated;
- result_card_downloaded;
- quiz_reported;
- community_quiz_submitted.

Do not log sensitive answer content unnecessarily.

Analytics should support product decisions without becoming surveillance.

---

# 54. PERFORMANCE REQUIREMENTS

Quiz question transitions should feel immediate.

Targets:

- local question navigation: near-instant;
- answer selection: immediate local feedback;
- background synchronization: asynchronous;
- result loading: fast after submission.

Avoid refetching the entire quiz after every answer.

Use caching and normalized state where appropriate.

---

# 55. FRONTEND STATE ARCHITECTURE

Separate:

### Server state

- quiz metadata;
- question content;
- attempt status;
- saved answers;
- final result.

### Local interaction state

- currently selected option;
- current question;
- open palette;
- confirmation modal;
- local timer display.

### Persistence state

- unsynced answer queue;
- cached attempt snapshot.

Do not place the entire application into one uncontrolled global state object.

---

# 56. COMPONENT ARCHITECTURE

Suggested components:

- `QuizHome`
- `QuizSearch`
- `QuizCard`
- `QuizDetail`
- `QuizRules`
- `QuizAttempt`
- `QuestionHeader`
- `QuestionContent`
- `AnswerOption`
- `QuestionPalette`
- `AttemptTimer`
- `AttemptFooter`
- `SubmitConfirmation`
- `QuizResult`
- `ScoreCard`
- `ResultStats`
- `QuestionReview`
- `TopicPerformance`
- `ResultCardPreview`
- `QuestionReport`
- `AdminQuizDashboard`
- `QuestionEditor`
- `QuizBuilder`
- `ModerationQueue`

Components should remain composable and not contain database logic directly.

---

# 57. ROUTING

Recommended routes:

`/quiz`

`/quiz/:quizId`

`/quiz/:quizId/instructions`

`/quiz/:quizId/attempt/:attemptId`

`/quiz/:quizId/result/:attemptId`

`/quiz/:quizId/review/:attemptId`

Admin:

`/admin/quizzes`

`/admin/quizzes/new`

`/admin/quizzes/:id`

`/admin/questions`

`/admin/questions/new`

`/admin/moderation/quizzes`

`/admin/moderation/questions`

Route guards must verify authentication and role.

---

# 58. LOADING STATES

Loading must use the same glass visual language.

For quiz cards:

- skeleton blocks;
- not spinning loaders everywhere.

For question loading:

- retain previous shell;
- show subtle content placeholder.

For result:

- show score card skeleton.

Avoid layout shifts.

---

# 59. ERROR STATES

Examples:

### Quiz unavailable

> This quiz is currently unavailable.

### Attempt expired

> Your time for this quiz has ended. We saved the attempt and submitted it automatically.

### Network failure

> You're offline. Your latest answer is saved on this device and will sync when you're back online.

### Permission error

> You don't have permission to access this quiz.

Do not expose database errors to students.

---

# 60. EMPTY STATES

Quiz home with no results:

> No quizzes found  
> Try another subject or topic.

Question history empty:

> Your completed quizzes will appear here.

Community section empty:

> No community quizzes are available yet.

Empty states should include a useful next action where possible.

---

# 61. PREMIUM LIGHT GLASS UI RULES

The quiz feature must follow the BEU BABA light theme.

Use:

- bright base background;
- translucent white cards;
- subtle blur;
- thin borders;
- soft neutral shadows;
- restrained accent color;
- dark readable text;
- medium-weight typography;
- rounded controls.

Do not use:

- black backgrounds;
- cyberpunk neon;
- RGB borders;
- excessive glow;
- floating 3D objects;
- AI-style particle backgrounds;
- excessive gradients;
- glass that reduces readability.

Glass is a surface treatment, not the entire visual identity.

---

# 62. NAVIGATION ANIMATION

The bottom navigation can use the selected-item treatment established for BEU BABA.

When Quiz is selected:

- icon remains stable;
- selected capsule/glass highlight appears;
- transition is smooth;
- label can fade/slide slightly.

Do not use bouncy cartoon animation.

---

# 63. QUIZ CARD ANIMATION

On entry:

- cards can fade and rise a few pixels;
- stagger should be subtle.

On press:

- card scales down very slightly;
- shadow reduces;
- release returns smoothly.

The animation must never delay the interaction.

---

# 64. SEARCH ANIMATION

Quiz search should use a premium compact field.

When focused:

- border/accent becomes slightly clearer;
- surrounding surface subtly increases contrast;
- results update smoothly.

Do not expand the search field into a giant animated panel unless there is a strong UX reason.

---

# 65. QUESTION TRANSITIONS

Question changes should use a short horizontal or fade transition.

Avoid long page animations because students may navigate dozens of questions quickly.

The animation duration should generally be around 150–250 ms.

Respect reduced-motion preferences.

---

# 66. RESULT REVEAL

The result can have a subtle reveal:

1. score card fades in;
2. progress ring draws;
3. statistics appear;
4. recommendation card appears.

Keep the full reveal short.

No confetti by default. If celebratory effects are introduced later, they should be optional and restrained.

---

# 67. ACCESSIBILITY

Required:

- keyboard navigation on desktop;
- visible focus state;
- sufficient contrast;
- screen-reader labels;
- semantic buttons;
- no color-only state;
- large mobile touch targets;
- reduced-motion support.

Timer information must be accessible to assistive technologies.

---

# 68. RESPONSIVE DESIGN

Mobile is the primary quiz environment.

### Mobile

- one-column;
- sticky bottom navigation for normal app pages;
- quiz attempt uses dedicated controls;
- large answer targets.

### Tablet

- slightly wider question card;
- optional two-column result layout.

### Desktop

- centered assessment shell;
- question area plus optional question palette sidebar;
- keyboard shortcuts may be supported.

Never simply stretch the mobile UI to desktop.

---

# 69. KEYBOARD SHORTCUTS

Optional desktop shortcuts:

- `1–4` select option;
- `N` next;
- `P` previous;
- `M` mark;
- `Enter` confirm where appropriate.

Shortcuts must never cause accidental destructive actions without confirmation.

---

# 70. CONTENT SAFETY

All user-generated quiz content must be sanitized.

Prevent:

- script injection;
- malicious HTML;
- unsafe URLs;
- executable uploads;
- dangerous SVG content.

Uploaded images should be processed safely.

Do not render arbitrary HTML from database content.

---

# 71. FILE UPLOADS FOR QUESTIONS

If questions support images:

Allowed formats should be controlled.

Recommended:

- JPG/JPEG;
- PNG;
- WebP;
- optionally PDF for source material, not inline question rendering.

Validate:

- MIME type;
- extension;
- file size;
- actual file signature where practical.

Store files in controlled storage buckets.

---

# 72. IMAGE OPTIMIZATION

Question images can heavily affect mobile performance.

On upload:

- resize oversized images;
- generate WebP/optimized variants where practical;
- create thumbnails for admin lists;
- retain original only where necessary.

Do not load full-resolution images in question lists.

---

# 73. ANTI-ABUSE

The quiz system should defend against obvious abuse without invasive surveillance.

Controls:

- rate limit attempt creation;
- rate limit submission;
- prevent multiple active attempts where policy says one;
- validate ownership;
- enforce server-side expiration;
- detect impossible state transitions;
- protect result endpoints.

Do not attempt to promise "100% cheating prevention" in product messaging.

---

# 74. ADMIN AUDIT LOGGING

Record important administrative actions:

- quiz created;
- quiz edited;
- quiz published;
- quiz unpublished;
- question edited;
- answer changed;
- quiz deleted/archived;
- moderation decision;
- scoring configuration changed.

Audit records should include:

- actor;
- action;
- target;
- timestamp;
- relevant metadata.

Avoid storing unnecessary private data in logs.

---

# 75. PUBLISHING WORKFLOW

Official quiz:

`Draft → Review → Approved → Published`

Optional scheduling:

`Approved → Scheduled → Published`

If an issue is discovered:

`Published → Paused`

After correction:

`Paused → New Version → Review → Approved → Published`

Do not silently alter a live assessment's historical version.

---

# 76. SCHEDULED QUIZZES

The admin can configure:

- publication time;
- closing time;
- timezone;
- visibility;
- availability period.

The backend should determine current availability using authoritative timestamps.

Client clocks must not control publication.

---

# 77. QUIZ ACCESS RULES

Potential restrictions:

- authenticated users only;
- course;
- branch;
- semester;
- subscription/access level if the product later introduces paid content;
- date window;
- attempt limit.

The UI should explain why access is unavailable when possible.

---

# 78. RESULT VISIBILITY

Possible policies:

- immediate;
- after submission window;
- after quiz closes;
- admin release.

The quiz definition should store result visibility policy.

Do not hardcode "results always immediate."

---

# 79. QUESTION ANSWER POLICY

The system should distinguish:

- unanswered;
- selected;
- marked for review;
- submitted.

Marking a question for review does not remove its selected answer.

A student can have:

`answered + marked`

or

`unanswered + marked`

Both states are valid.

---

# 80. TIME TRACKING

For advanced analytics, optionally store per-question timing.

However, this should be minimized to necessary data.

Possible:

- question opened timestamp;
- answer submitted timestamp;
- accumulated active time.

Do not continuously transmit every second.

Aggregate locally and sync meaningful events.

---

# 81. RESULT ANALYTICS UI

Recommended result sections:

### Score

Primary result.

### Breakdown

Correct / Incorrect / Unanswered.

### Topic performance

Small horizontal bars or cards.

### Time

Total and average.

### Review

Question-by-question analysis.

### Next step

One or two useful revision recommendations.

The student should never need to interpret a complicated analytics dashboard to understand performance.

---

# 82. PERSONAL BEST

If retries are allowed, show:

- current;
- best;
- average.

Example:

> Best: 18/20  
> This attempt: 16/20

If the current score is a new best, show a subtle badge.

---

# 83. QUIZ STREAK

A streak can be used if BEU BABA already has a broader streak system.

Rules:

- count completed quizzes, not merely opening them;
- define one completion per day;
- do not reward spam attempts indefinitely;
- avoid manipulative pressure.

If a streak system is not otherwise present, it should not be introduced solely to make the quiz screen busier.

---

# 84. SEARCH AND FILTERS

Student filters:

- subject;
- semester;
- topic;
- difficulty;
- quiz type;
- duration;
- verified only.

Admin filters should be more comprehensive.

Search should support title and relevant metadata.

Debounce text search.

---

# 85. SORTING

Student sorting:

- recommended;
- newest;
- popular;
- shortest;
- difficulty.

Admin sorting:

- newest;
- updated;
- pending;
- most attempted;
- most reported.

Do not use "popular" unless analytics are sufficiently populated.

---

# 86. RECOMMENDATION LOGIC

Basic recommendation can use:

1. student's course;
2. branch;
3. semester;
4. recent subjects;
5. weak topics;
6. unfinished quizzes.

Start with deterministic rules.

Do not introduce an AI recommendation layer just for appearance.

---

# 87. QUIZ NOTIFICATIONS

Optional notifications:

- new quiz for student's subject;
- scheduled quiz starting;
- moderation result for submitted quiz;
- result available;
- reminder for unfinished practice.

Notifications must be useful and rate-limited.

Never spam students after every quiz.

---

# 88. DEEP LINKING

Notification or shared links should open the exact quiz.

Example conceptual route:

`/quiz/<quiz-id>`

If the user is not logged in:

1. show login;
2. preserve intended destination;
3. return to quiz after authentication.

---

# 89. AUTHENTICATION DEPENDENCY

Because BEU BABA requires account registration, quiz access should integrate with the existing authentication system.

Student profile data such as:

- name;
- course;
- branch;
- semester;
- email;
- contact number

must not be duplicated into every quiz table.

Use the canonical student profile relationship.

---

# 90. ADMIN STUDENT VIEW

When support/admin opens a student's quiz history, show only information appropriate to their permission.

Example:

- student display name;
- course/branch/semester;
- quiz attempts;
- scores;
- timestamps.

Do not expose authentication secrets or unnecessary private profile information.

---

# 91. DATA RETENTION

Define retention rules before production.

Keep completed assessment records long enough for:

- student history;
- analytics;
- support;
- audit.

If a quiz is archived, historical attempts should generally remain intact.

Deleting content should not casually cascade-delete academic results.

---

# 92. DELETION POLICY

Prefer archive/soft-delete for:

- quizzes;
- questions;
- categories.

Hard deletion should require elevated permission and should be prevented when historical integrity depends on the record.

---

# 93. TRANSACTIONAL INTEGRITY

Important operations should be transactional where supported.

Submission should ensure:

- attempt becomes submitted;
- final scoring is generated;
- result is stored;
- duplicate submission cannot create a second result.

Quiz publication should ensure:

- version is valid;
- required questions exist;
- referenced content is available.

---

# 94. CONCURRENCY

Potential race:

Student has two browser tabs open.

The backend must prevent:

- conflicting submission;
- duplicate result;
- stale answer overwriting newer answer unexpectedly.

Use timestamps/version counters or controlled update conditions.

The UI can warn:

> This quiz is open in another tab.

But server-side protection remains mandatory.

---

# 95. TESTING STRATEGY

Test layers:

### Unit

- scoring;
- negative marking;
- percentage;
- topic analytics;
- answer validation.

### Integration

- start attempt;
- save answer;
- submit;
- result creation.

### Security

- unauthorized attempt access;
- result access;
- admin-only operations;
- tampered score;
- tampered attempt ID.

### UI

- mobile layout;
- timer;
- question navigation;
- result card.

### Failure

- network disconnect;
- refresh during quiz;
- browser close;
- duplicate submission;
- expired attempt.

---

# 96. SCORING TEST EXAMPLES

Example A:

10 questions  
1 mark each  
8 correct  
2 incorrect  
No negative marking

Score = 8/10 = 80%.

Example B:

10 questions  
1 mark each  
8 correct  
2 incorrect  
−0.25 per incorrect

Score = 8 − 0.5 = 7.5/10 = 75%.

Example C:

10 questions  
8 answered  
6 correct  
2 incorrect  
2 unanswered  
−0.25 incorrect

Score = 6 − 0.5 = 5.5/10 = 55%.

All such calculations should be covered by automated tests.

---

# 97. ADMIN QUIZ PREVIEW

Before publishing, admins must be able to preview the quiz exactly as a student would see it.

Preview should include:

- question order;
- options;
- timer;
- navigation;
- submission;
- result.

Preview must use a safe test mode and must not create real student analytics.

---

# 98. DRAFT PREVIEW SECURITY

A draft quiz should not be publicly accessible.

Preview access must require an authorized admin session.

Do not expose draft IDs through publicly accessible APIs.

---

# 99. QUIZ QUALITY CHECKLIST

Before publication:

- [ ] Title is clear.
- [ ] Subject is correct.
- [ ] Semester is correct.
- [ ] Topic mapping is correct.
- [ ] Question count is correct.
- [ ] Every question has a valid answer.
- [ ] Explanations are reviewed.
- [ ] Images load.
- [ ] No duplicate questions.
- [ ] Marks are correct.
- [ ] Negative marking is correct.
- [ ] Timer is correct.
- [ ] Retry policy is correct.
- [ ] Result policy is correct.
- [ ] Content source is documented.
- [ ] Quiz version is created.
- [ ] Preview completed.
- [ ] Approval recorded.

---

# 100. STUDENT UX QUALITY CHECKLIST

Before release:

- [ ] Login works.
- [ ] Quiz opens correctly.
- [ ] Start button is obvious.
- [ ] Instructions are understandable.
- [ ] Question text is readable.
- [ ] Options are large enough.
- [ ] Selected state is obvious.
- [ ] Next/Previous work.
- [ ] Palette works.
- [ ] Mark for review works.
- [ ] Timer is correct.
- [ ] Auto-save works.
- [ ] Offline recovery works.
- [ ] Submission confirmation works.
- [ ] Result is correct.
- [ ] Review is correct.
- [ ] Result card works.
- [ ] Retry works.
- [ ] Back navigation cannot accidentally destroy an attempt.

---

# 101. API CONTRACT CONCEPTS

The frontend should communicate through typed application services.

Conceptual operations:

`listQuizzes(filters)`

`getQuiz(quizId)`

`startQuiz(quizId)`

`getAttempt(attemptId)`

`saveAnswer(attemptId, questionId, answer)`

`markQuestion(attemptId, questionId)`

`submitAttempt(attemptId)`

`getResult(attemptId)`

`getReview(attemptId)`

`reportQuestion(questionVersionId, reason)`

Admin:

`createQuestion()`

`updateQuestionDraft()`

`createQuiz()`

`publishQuiz()`

`pauseQuiz()`

`createQuizVersion()`

`moderateSubmission()`

Exact implementation can use Supabase client/server functions according to the broader BEU BABA backend architecture.

---

# 102. IDEMPOTENCY

Operations that can be repeated due to retries should be idempotent where possible.

Especially:

- answer save;
- submit;
- moderation action;
- publish request.

The client should not need to guess whether a timed-out request succeeded.

---

# 103. CACHING

Safe to cache:

- published quiz metadata;
- subject/topic lists;
- public question images.

Be careful with:

- active attempt status;
- remaining time;
- private results.

Never serve a stale authorization decision from a long-lived client cache.

---

# 104. DATABASE INDEXING

Index common access paths:

- quiz status;
- course;
- branch;
- semester;
- subject;
- topic;
- publication date;
- attempt user ID;
- attempt quiz ID;
- attempt status;
- answer attempt ID;
- report status.

Do not create indexes blindly on every column.

Review actual query patterns.

---

# 105. ROW-LEVEL SECURITY PRINCIPLES

Students:

- read published quizzes;
- create their own attempts;
- read their own attempts;
- update only their own in-progress answers;
- read their own results;
- create reports.

Students must not:

- read answer keys before submission;
- modify submitted attempts;
- read another student's private results;
- publish official quizzes.

Admins receive capabilities through role-based policies.

Use server-side privileged operations only where necessary.

---

# 106. ANSWER KEY PROTECTION

This is one of the highest-priority security rules.

For active quiz delivery, the response should contain only what the student needs to answer.

Do not send:

- `correct_option_id`;
- hidden answer fields;
- scoring secrets.

For result/review endpoints, answer keys may be returned only after policy permits review.

Even then, the API should authorize the request.

---

# 107. USER-GENERATED CONTENT TRUST

Community questions are untrusted until moderation.

Store a clear provenance:

- official;
- admin-authored;
- community-submitted;
- imported;
- migrated.

Never allow provenance to be changed casually.

---

# 108. SOURCE ATTRIBUTION

For PYQs and externally sourced questions, preserve source metadata.

Possible fields:

- examination;
- year;
- paper;
- source name;
- source URL where appropriate;
- attribution note.

Do not imply BEU ownership of material that belongs to another source.

---

# 109. MULTILINGUAL SUPPORT

The data model should allow language metadata.

Potential future values:

- English;
- Hindi;
- bilingual.

Question text and explanations may require separate localized versions.

Do not concatenate translations into one uncontrolled text field.

---

# 110. FORMATTING RULES

Questions may need:

- superscript;
- subscript;
- equations;
- code;
- tables;
- diagrams.

The renderer must be safe and responsive.

Long equations must not overflow mobile screens.

Code blocks should scroll horizontally rather than break the layout.

---

# 111. MOBILE SAFE AREAS

Quiz controls near the bottom must respect device safe areas.

Use appropriate CSS environment variables where supported.

Do not place the Submit button under browser gesture areas.

---

# 112. TOUCH INTERACTION

Minimum practical touch target should be comfortable for mobile use.

Do not make answer choices tiny.

Avoid nested clickable elements.

A whole option row should usually be clickable.

---

# 113. HAPTIC FEEDBACK

If the PWA/native wrapper supports haptics, use only subtle feedback:

- selection;
- successful submission;
- important confirmation.

Do not rely on haptics as the only indication.

---

# 114. SOUND

Sound should be off by default.

Do not use sounds for every question transition.

If enabled later, allow user control.

---

# 115. REDUCED MOTION

When the operating system requests reduced motion:

- remove slide transitions;
- remove ring drawing animation;
- remove scale effects;
- keep state changes instantaneous but clear.

The product must remain fully usable.

---

# 116. PWA CONSIDERATIONS

Because BEU BABA may be delivered as a PWA, the quiz system should behave well when installed.

Requirements:

- proper viewport;
- standalone display compatibility;
- offline shell caching;
- resilient attempt state;
- service-worker strategy that does not serve stale quiz authorization;
- notification deep links.

Do not cache mutable exam content indefinitely.

---

# 117. APP UPDATE SAFETY

If the PWA updates while a student has an active attempt:

- preserve attempt data;
- avoid breaking the current screen;
- migrate local state if schema changes;
- avoid clearing local storage blindly.

The service worker must be tested specifically during active quiz sessions.

---

# 118. ADMIN OPERATIONS FOR LIVE QUIZZES

If a serious issue is discovered:

1. pause quiz;
2. prevent new attempts;
3. allow active attempts to follow a documented policy;
4. investigate;
5. create corrected version;
6. communicate if necessary.

Do not silently delete the quiz while students are taking it.

---

# 119. INVALIDATED QUESTIONS

If an administrator discovers that a question is invalid after attempts have occurred, policies may include:

- remove question from scoring;
- award full marks;
- replace question for future attempts;
- recalculate affected results.

The selected policy must be explicit and auditable.

Never manually alter one student's score without an auditable reason.

---

# 120. RESULT RE-CALCULATION

If an official correction changes scoring:

- identify affected attempt versions;
- apply a controlled recalculation;
- store old and new result where audit policy requires;
- notify affected students if meaningful;
- update aggregate analytics consistently.

This is why immutable question/quiz versions are essential.

---

# 121. COMMUNITY MODERATION UI

A moderator card should show:

- submitted title;
- submitter display name;
- subject;
- question count;
- submission date;
- status;
- preview.

Actions:

**Review**

**Request Changes**

**Reject**

**Approve**

Keep dangerous actions visually separated and confirmation-protected.

---

# 122. ADMIN BULK ACTIONS

Allowed bulk operations may include:

- archive;
- change topic;
- change difficulty;
- assign reviewer;
- approve after review where policy allows;
- export.

Bulk publish should require stronger confirmation.

Never allow one accidental click to publish hundreds of unreviewed questions.

---

# 123. AUDITABLE ADMIN UX

After important actions, show a concise confirmation:

> Quiz version published successfully.

For destructive actions:

> Archive this quiz? Existing results will remain available.

The message should describe the actual consequence.

---

# 124. SUPPORT WORKFLOW

If a student reports:

> "My quiz disappeared after I submitted."

Support should be able to inspect:

- attempt status;
- submission timestamp;
- sync state;
- result ID;
- error state.

Support should not directly edit score unless explicitly authorized.

---

# 125. STUDENT FEEDBACK

After a quiz, optional feedback can ask:

- Was the difficulty appropriate?
- Was any question confusing?
- Was there a technical problem?

Keep it optional and short.

Feedback should be connected to quiz/question IDs for analysis.

---

# 126. PRODUCT ANALYTICS

Useful aggregate metrics:

- quiz starts;
- completion rate;
- average completion time;
- average score;
- question accuracy;
- abandonment rate;
- report rate;
- retry rate;
- result-card generation;
- community submission approval rate.

Avoid collecting more personal data than necessary.

---

# 127. ABANDONMENT ANALYSIS

A quiz may be abandoned because:

- timer;
- technical problem;
- difficult content;
- accidental navigation;
- user simply left.

Do not assume the reason.

Use aggregate patterns to improve UX.

---

# 128. ADMIN ANALYTICS

For each quiz:

- total attempts;
- unique students;
- completion;
- average score;
- score distribution;
- most-missed questions;
- reports;
- average time.

Most-missed questions are especially useful for detecting:

- bad wording;
- incorrect answer keys;
- difficult concepts.

---

# 129. QUESTION QUALITY SCORE

A future analytics feature may flag questions with unusual patterns.

Examples:

- almost everyone wrong;
- almost everyone correct;
- one option overwhelmingly selected;
- high report rate.

These are review signals, not automatic judgments.

---

# 130. RELEASE PHASES

### Phase 1 — Core

- MCQ;
- quiz listing;
- start;
- timer;
- auto-save;
- submission;
- scoring;
- result;
- review.

### Phase 2 — Content management

- question bank;
- quiz builder;
- versioning;
- import;
- moderation.

### Phase 3 — Engagement

- result cards;
- performance analytics;
- weak-topic recommendations;
- optional leaderboard.

### Phase 4 — Advanced

- question pools;
- multiple-choice;
- richer question types;
- advanced analytics;
- multilingual content.

Do not delay the core product by building every advanced feature simultaneously.

---

# 131. ACCEPTANCE CRITERIA

A release is acceptable only if:

1. authenticated student can discover a published quiz;
2. student can start an attempt;
3. server creates one valid attempt;
4. student can answer all supported question types;
5. answers survive refresh;
6. temporary network failure does not destroy local selections;
7. timer expires correctly;
8. submission cannot create duplicate results;
9. score is calculated server-side;
10. result matches the configured marking rules;
11. review shows the correct question version;
12. private attempts cannot be accessed by other students;
13. answer keys are not exposed before submission;
14. admin can create and publish a quiz;
15. moderation can approve/reject community content;
16. historical attempts remain reproducible;
17. result card does not expose private profile data;
18. mobile layout is usable;
19. reduced-motion mode works;
20. errors and empty states are handled.

---

# 132. FINAL IMPLEMENTATION RULES

These rules are mandatory:

**Rule 1:** Never trust the frontend for scoring or authorization.

**Rule 2:** Never expose answer keys during an active attempt.

**Rule 3:** Never mutate historical question versions in a way that changes past results.

**Rule 4:** Never delete a student's completed result merely because a quiz is archived.

**Rule 5:** Never make answer selection dependent on network availability.

**Rule 6:** Never make the UI visually impressive at the cost of readability.

**Rule 7:** Never use dark, RGB, cyberpunk or AI-themed visual effects in this feature unless the BEU BABA design direction is explicitly changed.

**Rule 8:** Never publish student-generated content without the configured moderation workflow.

**Rule 9:** Never expose contact number, email or internal identifiers on downloadable result cards by default.

**Rule 10:** Never assume a successful HTTP request means the attempt state is correct; validate state transitions.

**Rule 11:** Never use a mutable current question record as the sole reference for historical scoring.

**Rule 12:** Never allow duplicate submission to create duplicate results.

**Rule 13:** Never clear local quiz state during application updates without migration/recovery logic.

**Rule 14:** Never build a complicated analytics dashboard before the basic result experience is excellent.

**Rule 15:** Every quiz interaction must remain understandable to a first-time student.

---

# 133. RECOMMENDED END-TO-END STUDENT JOURNEY

The ideal journey is:

**Open BEU BABA → Login → Quiz → Search/Subject → Quiz Card → Quiz Details → Instructions → Start → Question 1 → Answer → Next → Navigate/Review → Submit → Result → Review Mistakes → Topic Performance → Retry or Continue Learning → Optional Result Card**

At no point should the student wonder:

- where they are;
- what action is expected;
- whether their answer was saved;
- whether submission succeeded;
- what their score means.

This clarity is more important than decorative complexity.

---

# 134. RECOMMENDED END-TO-END ADMIN JOURNEY

The ideal admin journey is:

**Admin Login → Dashboard → Question Bank → Create/Import Questions → Validate → Review → Build Quiz → Preview → Configure Rules → Publish/Schedule → Monitor Attempts → Review Reports → Correct/Version Content → Analyze Performance → Archive When Appropriate**

The admin system should make the safe workflow the easiest workflow.

---

# 135. DEFINITION OF DONE

The quiz system is not "done" when the quiz screen works.

It is done when:

- content can be safely authored;
- content can be reviewed;
- users can take quizzes reliably;
- answers survive normal failures;
- scoring is deterministic;
- historical results remain correct;
- administrators can operate the system;
- moderation works;
- privacy is respected;
- security controls are tested;
- the mobile experience is polished;
- the light glass design is consistent;
- accessibility is acceptable;
- analytics are meaningful;
- production monitoring is available.

The final product should feel like a polished academic application, not a form with radio buttons.

---

# 136. MASTER BUILD PRIORITY

If engineering time is limited, implement in this exact order:

1. database model and versioning;
2. secure published quiz retrieval;
3. attempt creation;
4. question delivery;
5. local answer state;
6. answer synchronization;
7. timer;
8. submission;
9. server-side scoring;
10. result;
11. review;
12. admin question editor;
13. admin quiz builder;
14. moderation;
15. reporting;
16. analytics;
17. result-card generation;
18. advanced recommendation and leaderboard features.

This order minimizes rework because the security and historical-integrity foundations are established before decorative or engagement features.

---

# 137. FINAL PRODUCT VISION

BEU BABA's quiz system should become a dependable daily revision tool.

A student should be able to think:

> "Mujhe 10 minute free hain. Main BEU BABA par ek quick quiz de deta hoon."

The experience should then be:

**fast → clear → trustworthy → useful → rewarding**

The premium design should make the app feel modern, but the academic utility must remain the center of the experience.

The strongest implementation is therefore not the one with the most animations. It is the one where the student can complete an assessment smoothly, trust the score, understand mistakes and immediately know what to study next.

That principle must guide every database decision, API contract, component, animation, moderation workflow and visual choice in the BEU BABA quiz system.


# A. Field-Level Data Dictionary

## Quiz Identity And Ownership Fields

This subsection defines the production behavior for **quiz identity and ownership fields**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **quiz identity and ownership fields** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Quiz Publication And Lifecycle Fields

This subsection defines the production behavior for **quiz publication and lifecycle fields**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **quiz publication and lifecycle fields** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Quiz Timing And Attempt-Policy Fields

This subsection defines the production behavior for **quiz timing and attempt-policy fields**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **quiz timing and attempt-policy fields** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Question Identity And Version Fields

This subsection defines the production behavior for **question identity and version fields**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **question identity and version fields** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Option Representation

This subsection defines the production behavior for **option representation**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **option representation** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Attempt Lifecycle Fields

This subsection defines the production behavior for **attempt lifecycle fields**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **attempt lifecycle fields** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Answer Synchronization Fields

This subsection defines the production behavior for **answer synchronization fields**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **answer synchronization fields** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Result And Metric Fields

This subsection defines the production behavior for **result and metric fields**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **result and metric fields** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Moderation And Reporting Fields

This subsection defines the production behavior for **moderation and reporting fields**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **moderation and reporting fields** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.


# B. State-by-State UI Specification

## Initial Loading

This subsection defines the production behavior for **initial loading**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **initial loading** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Normal Loaded State

This subsection defines the production behavior for **normal loaded state**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **normal loaded state** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Searching

This subsection defines the production behavior for **searching**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **searching** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Filtering

This subsection defines the production behavior for **filtering**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **filtering** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Quiz Unavailable

This subsection defines the production behavior for **quiz unavailable**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **quiz unavailable** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Authentication Required

This subsection defines the production behavior for **authentication required**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **authentication required** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Attempt Initializing

This subsection defines the production behavior for **attempt initializing**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **attempt initializing** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Active Attempt

This subsection defines the production behavior for **active attempt**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **active attempt** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Offline Active Attempt

This subsection defines the production behavior for **offline active attempt**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **offline active attempt** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Sync Pending

This subsection defines the production behavior for **sync pending**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **sync pending** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Timer Warning

This subsection defines the production behavior for **timer warning**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **timer warning** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Submission Confirmation

This subsection defines the production behavior for **submission confirmation**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **submission confirmation** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Submission Processing

This subsection defines the production behavior for **submission processing**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **submission processing** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Result Loaded

This subsection defines the production behavior for **result loaded**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **result loaded** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Review Mode

This subsection defines the production behavior for **review mode**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **review mode** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Empty History

This subsection defines the production behavior for **empty history**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **empty history** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Server Error

This subsection defines the production behavior for **server error**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **server error** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Permission Denied

This subsection defines the production behavior for **permission denied**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **permission denied** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.


# C. Security Threat Catalogue

## Client Score Tampering

This subsection defines the production behavior for **client score tampering**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **client score tampering** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Answer-Key Extraction

This subsection defines the production behavior for **answer-key extraction**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **answer-key extraction** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Attempt Id Enumeration

This subsection defines the production behavior for **attempt ID enumeration**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **attempt ID enumeration** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Cross-User Result Access

This subsection defines the production behavior for **cross-user result access**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **cross-user result access** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Role Escalation

This subsection defines the production behavior for **role escalation**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **role escalation** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Duplicate Submission

This subsection defines the production behavior for **duplicate submission**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **duplicate submission** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Timer Manipulation

This subsection defines the production behavior for **timer manipulation**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **timer manipulation** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Request Replay

This subsection defines the production behavior for **request replay**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **request replay** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Malicious Content Injection

This subsection defines the production behavior for **malicious content injection**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **malicious content injection** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Unsafe Media

This subsection defines the production behavior for **unsafe media**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **unsafe media** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Rate Abuse

This subsection defines the production behavior for **rate abuse**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **rate abuse** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Bulk Endpoint Abuse

This subsection defines the production behavior for **bulk endpoint abuse**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **bulk endpoint abuse** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.


# D. Admin Operational Playbooks

## Publish A Normal Quiz

This subsection defines the production behavior for **publish a normal quiz**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **publish a normal quiz** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Pause A Live Quiz

This subsection defines the production behavior for **pause a live quiz**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **pause a live quiz** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Correct A Bad Answer Key

This subsection defines the production behavior for **correct a bad answer key**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **correct a bad answer key** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Handle A Reported Question

This subsection defines the production behavior for **handle a reported question**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **handle a reported question** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Approve Community Content

This subsection defines the production behavior for **approve community content**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **approve community content** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Reject Low-Quality Content

This subsection defines the production behavior for **reject low-quality content**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **reject low-quality content** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Recover A Failed Submission

This subsection defines the production behavior for **recover a failed submission**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **recover a failed submission** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Handle Duplicate Attempts

This subsection defines the production behavior for **handle duplicate attempts**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **handle duplicate attempts** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Archive Old Content

This subsection defines the production behavior for **archive old content**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **archive old content** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Perform A Controlled Scoring Correction

This subsection defines the production behavior for **perform a controlled scoring correction**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **perform a controlled scoring correction** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.


# E. QA Test Matrix

## Authentication Tests

This subsection defines the production behavior for **authentication tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **authentication tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Quiz Discovery Tests

This subsection defines the production behavior for **quiz discovery tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **quiz discovery tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Attempt Tests

This subsection defines the production behavior for **attempt tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **attempt tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Answer Tests

This subsection defines the production behavior for **answer tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **answer tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Timer Tests

This subsection defines the production behavior for **timer tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **timer tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Offline Tests

This subsection defines the production behavior for **offline tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **offline tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Submission Tests

This subsection defines the production behavior for **submission tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **submission tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Scoring Tests

This subsection defines the production behavior for **scoring tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **scoring tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Result Tests

This subsection defines the production behavior for **result tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **result tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Security Tests

This subsection defines the production behavior for **security tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **security tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Responsive Tests

This subsection defines the production behavior for **responsive tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **responsive tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Accessibility Tests

This subsection defines the production behavior for **accessibility tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **accessibility tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Admin Tests

This subsection defines the production behavior for **admin tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **admin tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Moderation Tests

This subsection defines the production behavior for **moderation tests**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **moderation tests** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.


# F. UX Copy Library

## Button Labels

This subsection defines the production behavior for **button labels**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **button labels** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Confirmation Messages

This subsection defines the production behavior for **confirmation messages**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **confirmation messages** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Error Messages

This subsection defines the production behavior for **error messages**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **error messages** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Empty States

This subsection defines the production behavior for **empty states**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **empty states** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Timer Warnings

This subsection defines the production behavior for **timer warnings**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **timer warnings** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Submission Messages

This subsection defines the production behavior for **submission messages**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **submission messages** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Moderation Messages

This subsection defines the production behavior for **moderation messages**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **moderation messages** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

## Reporting Messages

This subsection defines the production behavior for **reporting messages**. The implementation must treat this as a first-class system concern rather than a cosmetic detail.

The frontend must represent the state explicitly, the backend must validate the operation independently, and the database must preserve enough information for troubleshooting and audit. The UI should always communicate the current state in plain language. If an operation can fail, the failure path must be designed at the same time as the success path.

For the student experience, the default behavior should be conservative: preserve work, avoid destructive navigation, avoid exposing internal errors, and provide a clear next action. For the administrator experience, the default should be auditable: show what changed, who changed it, when it changed and what downstream records may be affected.

Where a network request is involved, local state should update immediately when safe, while server synchronization happens in the background. A failed request must not cause the interface to revert a student's valid interaction without an explicit recovery strategy. Operations that can be retried must use stable identifiers and idempotent semantics.

For security-sensitive operations, assume the browser is hostile. A user can inspect JavaScript, modify requests, replay requests and alter local state. Therefore, all permissions, scoring decisions, lifecycle transitions and access checks must be enforced on the server/database side.

For data integrity, avoid destructive cascades that can erase historical assessment evidence. Published content should be versioned, and an attempt should point to the exact content snapshot it used. This allows support staff and administrators to reproduce the student's result even after the current quiz has been edited.

For UI implementation, use the BEU BABA light glass system: bright background, translucent white surfaces, subtle border, restrained blur, soft shadow and clear dark text. Animation must communicate state rather than decorate every interaction. Keep transitions short, respect reduced-motion settings and never make a user wait for an animation before an important action can be completed.

The acceptance test for **reporting messages** should include the happy path, the interrupted path, the unauthorized path, the duplicate/retry path and the mobile path. If any one of these is undefined, the feature should not be considered production complete.

# 138. EXTENDED PRODUCTION CHECKLIST

### Engineering Check 001
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 002
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 003
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 004
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 005
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 006
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 007
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 008
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 009
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 010
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 011
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 012
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 013
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 014
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 015
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 016
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 017
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 018
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 019
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 020
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 021
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 022
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 023
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 024
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 025
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 026
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 027
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 028
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 029
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 030
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 031
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 032
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 033
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 034
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 035
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 036
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 037
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 038
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 039
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 040
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 041
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 042
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 043
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 044
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 045
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 046
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 047
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 048
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 049
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 050
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 051
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 052
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 053
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 054
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 055
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 056
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 057
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 058
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 059
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 060
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 061
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 062
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 063
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 064
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 065
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 066
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 067
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 068
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 069
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 070
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 071
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 072
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 073
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 074
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 075
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 076
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 077
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 078
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 079
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 080
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 081
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 082
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 083
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 084
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 085
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 086
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 087
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 088
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 089
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 090
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 091
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 092
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 093
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 094
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 095
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 096
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 097
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 098
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 099
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

### Engineering Check 100
- Define the state explicitly rather than inferring it from missing fields.
- Validate the operation on the server before applying any privileged change.
- Preserve historical assessment data whenever the operation can affect past results.
- Keep student-facing messaging simple and action-oriented.
- Verify the mobile layout at narrow widths and with long academic question text.
- Verify keyboard and reduced-motion behavior where the component is applicable.
- Add automated coverage for the normal path and at least one failure path.

# 139. DOCUMENT CLOSURE

This document is the authoritative quiz/assessment implementation reference for BEU BABA. When implementation decisions differ from this specification, the engineering team should record the deviation, its reason, affected data model/API/UI areas and migration implications rather than silently diverging.

The most important invariant is simple:

**A student's submitted assessment must remain correct, reproducible, private and understandable even if the network fails, the application updates, the quiz content changes later, or an administrator needs to investigate the attempt months afterward.**

All visual polish, animation and engagement features must support that invariant rather than compromise it.
