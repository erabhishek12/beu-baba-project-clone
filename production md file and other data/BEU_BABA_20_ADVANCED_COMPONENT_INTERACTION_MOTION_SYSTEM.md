# BEU BABA — 20. ADVANCED COMPONENT INTERACTION, MICRO-INTERACTION & MOTION SYSTEM
## Production Specification for a Premium Light Glassmorphism Educational PWA

**Document status:** Production-ready design and engineering specification  
**Project:** BEU BABA  
**Document number:** 20  
**Primary purpose:** Define every interaction, transition, animation, gesture, state change, feedback pattern, and motion rule used throughout BEU BABA.  
**Theme requirement:** Premium LIGHT transparent glassmorphism only.  
**Hard visual exclusions:** No dark/black visual system, no RGB glow, no cyberpunk treatment, no AI-themed animated backgrounds, no excessive 3D objects, no decorative motion that competes with educational content.

---

# 1. DOCUMENT PURPOSE

This document defines the motion and interaction language of BEU BABA at production depth.

The objective is not to make the application “animated.” The objective is to make the application feel **physically coherent, premium, responsive, calm, intelligent, and unmistakably polished**.

Every interaction must communicate one or more of the following:

1. What just happened.
2. What can happen next.
3. Where the user moved.
4. Which object has priority.
5. Whether an action succeeded.
6. Whether an action is loading.
7. Whether an object is interactive.
8. Whether content is being expanded, selected, dismissed, or replaced.
9. Whether the application is waiting for a network response.
10. Whether a destructive or important action requires confirmation.

Motion must never exist only because animation is technically possible.

BEU BABA is an educational application. Students may use it repeatedly for long sessions. Therefore motion must remain comfortable during repeated use. The interface should feel alive without feeling noisy.

The core principle is:

> **Motion explains interface behavior; it does not decorate the interface unnecessarily.**

---

# 2. NON-NEGOTIABLE EXPERIENCE DIRECTION

The following requirements are mandatory.

## 2.1 Light visual environment

The complete application uses a light visual foundation.

The background may use:

- white
- warm white
- extremely pale blue-white
- extremely pale neutral gray
- subtle translucent atmospheric layers

The background must never become a black or dark canvas.

## 2.2 Real transparent glass

Glass must appear translucent rather than painted.

A glass surface should allow controlled background information to remain visible through it.

The material hierarchy should generally combine:

- translucent fill
- backdrop blur
- thin low-contrast border
- soft ambient shadow
- subtle internal highlight
- controlled saturation
- sufficient text contrast

Do not use a simple opaque white rectangle and call it glass.

## 2.3 No RGB aesthetic

Do not use:

- rainbow borders
- RGB shadows
- gaming-style neon
- multicolor glow loops
- cyberpunk gradients
- rapidly changing hue animations

Accent colors should be restrained and product-oriented.

## 2.4 No AI-themed decoration

Do not animate:

- floating neural networks
- glowing particles
- artificial intelligence brains
- random 3D geometry
- holographic grids
- orbiting nodes
- futuristic circuit backgrounds

BEU BABA is an education product, not an AI visual demo.

## 2.5 Animation hierarchy

Not everything should move.

Highest priority motion:

1. Navigation transitions.
2. Search expansion.
3. Course card interaction.
4. Modal presentation.
5. Sheet presentation.
6. Content loading.
7. Quiz answer feedback.
8. Download progress.
9. Upload progress.
10. Toast and status feedback.

Lower priority motion:

- decorative section entrances
- icon micro-bounces
- subtle card hover movement

Lowest priority:

- continuous ambient animation

Continuous ambient animation should normally be avoided.

---

# 3. MOTION PHILOSOPHY

BEU BABA should feel like a collection of physical surfaces.

A user taps a glass card. The card should respond as if it has a small amount of physical depth.

A user opens a page. The page should not suddenly teleport into existence. It should transition from the previous state.

A user opens search. The search control should transform rather than abruptly replace the navbar.

A user opens a modal. The modal should emerge from the interface hierarchy while the underlying content becomes temporarily secondary.

This creates a consistent spatial model.

The motion model is based on five concepts:

- **continuity**
- **hierarchy**
- **feedback**
- **direction**
- **restraint**

---

# 4. MOTION TOKENS

All motion should use centralized tokens.

Do not scatter arbitrary durations such as `137ms`, `287ms`, `413ms`, and `621ms` throughout the codebase.

Recommended base tokens:

```css
:root {
  --motion-instant: 80ms;
  --motion-fast: 140ms;
  --motion-standard: 220ms;
  --motion-emphasis: 320ms;
  --motion-slow: 420ms;

  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

These values are starting tokens, not permission to animate everything.

---

# 5. MOTION CATEGORIES

Every animation must belong to one of these categories.

## 5.1 Micro feedback

Used for:

- button press
- checkbox
- favorite
- bookmark
- copy
- toggle
- icon action

Typical duration:

`100ms–180ms`

## 5.2 Component transformation

Used when one component becomes another state.

Examples:

- compact search → expanded search
- collapsed accordion → expanded accordion
- inactive tab → active tab
- download button → progress state

Typical duration:

`180ms–320ms`

## 5.3 Surface presentation

Used for:

- modal
- bottom sheet
- command/search panel
- profile menu

Typical duration:

`250ms–420ms`

## 5.4 Page transition

Used between major application routes.

Typical duration:

`220ms–360ms`

Page transitions must be restrained.

## 5.5 Progress animation

Used for:

- file upload
- resource download
- quiz submission
- synchronization

Progress animation must communicate real progress whenever possible.

Do not use fake progress that jumps randomly merely to look animated.

---

# 6. GLOBAL INTERACTION STATES

Every interactive component should define:

1. default
2. hover where applicable
3. focus
4. pressed
5. disabled
6. loading
7. success
8. error
9. selected where applicable

For touch devices, hover is not a primary state.

The pressed state is extremely important.

A glass card can respond through a combination of:

- 1–2px translation
- very small scale change
- shadow reduction
- border highlight
- surface brightness change

Example conceptual behavior:

```text
Default
↓
Pointer/touch down
↓
Slightly compressed
↓
Pointer/touch release
↓
Returns to resting state
↓
Optional navigation/content transition
```

Avoid large bounce animations.

---

# 7. BUTTON MOTION SYSTEM

Buttons must feel responsive immediately.

## Primary button

On press:

- scale approximately `0.98`
- reduce elevation slightly
- maintain glass integrity
- return using the standard easing curve

The button must never visually jump.

## Secondary glass button

On hover:

- slightly increase surface opacity
- subtly strengthen border
- slightly increase shadow

On press:

- reduce elevation
- tiny scale reduction

## Icon-only button

Icon buttons should have a small glass hit area.

The icon itself should not dramatically rotate unless rotation communicates state.

For example:

- menu → close can rotate/morph
- play → pause can morph
- bookmark outline → filled can transition

Do not rotate ordinary icons simply for decoration.

---

# 8. NAVIGATION BAR MOTION

The navigation bar is one of the most important motion systems in BEU BABA.

The selected navigation item should visually transform into a premium glass capsule or pill-like active surface.

The behavior should feel fluid rather than switching backgrounds abruptly.

Concept:

```text
[ Home ] [ Courses ] [ Quiz ] [ Resources ] [ Profile ]

Tap Courses

[ Home ] [  Courses  ] [ Quiz ] [ Resources ] [ Profile ]
          └─ glass active surface
```

The active glass indicator should move between destinations.

Prefer one moving indicator layer instead of independently fading unrelated backgrounds.

This creates continuity.

## Active indicator

Recommended properties:

- translucent white surface
- subtle border
- low-radius glass capsule
- soft shadow
- internal highlight

Animation:

- horizontal movement
- width interpolation
- opacity interpolation
- slight blur adjustment if needed

Duration:

`220ms–300ms`

The active indicator should never overshoot excessively.

---

# 9. NAVIGATION PAGE TRANSITIONS

When a user switches primary sections, avoid full-screen theatrical transitions.

The new content should appear quickly.

Recommended sequence:

1. Current content begins leaving.
2. New section establishes immediately.
3. New section content performs a small opacity/translation entrance.
4. Navigation indicator completes its movement.

Avoid:

- long zoom transitions
- 3D page rotations
- cube transitions
- dramatic parallax
- screen spinning

The educational content is more important than the transition.

---

# 10. SEARCH INTERACTION SYSTEM

Search must feel like a transformation.

The compact search control can exist as a glass pill.

When activated:

1. Search control expands.
2. Search field receives focus.
3. Search icon remains visible.
4. Clear button appears when text exists.
5. Search results surface beneath or within the appropriate glass layer.
6. Keyboard interaction remains uninterrupted.

Do not navigate to an entirely unrelated-looking search screen unless the search experience requires it.

## Search expansion

Animation:

- width expansion
- border refinement
- background glass strengthening
- placeholder transition
- icon alignment

Duration:

`220ms–320ms`

The expansion should use the existing component as the visual origin.

---

# 11. COURSE CARD SCROLL ANIMATION

Course cards are important because they represent one of the application's primary content types.

The cards should have subtle scroll-linked motion.

Allowed effects:

- slight scale adjustment
- subtle opacity adjustment
- controlled vertical translation
- small elevation variation

Example:

```text
Card entering viewport
→ scale 0.97
→ opacity 0.82

Card reaches focus zone
→ scale 1.00
→ opacity 1.00

Card leaves focus zone
→ scale 0.98
→ opacity 0.88
```

Do not scale cards dramatically.

Do not use:

- card spinning
- 3D flipping during scroll
- extreme perspective
- RGB glow
- floating cards detached from the page

The animation should reinforce hierarchy.

---

# 12. COURSE CARD PRESS

On touch:

- card compresses subtly
- glass surface becomes slightly denser
- shadow contracts

After release:

- card returns
- navigation/content transition begins

If navigation takes time, show a controlled loading state instead of leaving the user wondering whether the tap worked.

---

# 13. COURSE CARD HOVER

Desktop hover may use:

- `translateY(-2px)`
- slightly increased glass highlight
- slight shadow increase
- thumbnail scale around `1.01–1.03`

Do not make the entire card float significantly.

The goal is premium subtlety.

---

# 14. COURSE CARD THUMBNAIL MOTION

The image should not constantly animate.

On hover:

- image may scale very slightly
- overlay gradient can subtly change opacity

On card focus:

- title and metadata remain stable

Do not animate every text element independently.

That creates visual noise.

---

# 15. QUIZ INTERACTION MOTION

Quiz interactions need stronger feedback than ordinary navigation because the user needs to know whether an answer was accepted.

## Answer selection

When an option is selected:

1. Option receives active glass state.
2. Selection indicator appears.
3. Border/highlight transitions.
4. Text remains stable.
5. Optional checkmark appears.

Duration:

`140ms–220ms`

## Correct answer

Use:

- subtle success highlight
- check icon
- short confirmation animation

Do not use giant celebratory effects for every question.

## Incorrect answer

Use:

- restrained error highlight
- small horizontal shake if appropriate
- clear visual indication

The shake should be short and low amplitude.

---

# 16. QUIZ RESULT ANIMATION

When the quiz is completed:

1. Submission state appears.
2. Loading indicator appears if calculation is asynchronous.
3. Result surface enters.
4. Score number may animate from zero or from a close baseline.
5. Summary cards appear with small staggered entrances.

The score animation should not take too long.

A student wants to see the result.

Recommended score count duration:

`500ms–900ms`

Use this only for meaningful result numbers.

---

# 17. QUIZ CARD DOWNLOAD ANIMATION

When the user downloads a generated quiz/result card:

1. Download button becomes active loading.
2. Progress indicator appears if generation takes time.
3. Success state appears.
4. Download action returns to normal.

Do not make the button disappear.

State continuity is important.

---

# 18. RESOURCE UPLOAD MOTION

Users can upload educational resources.

The upload experience must be clear and trustworthy.

Sequence:

```text
Choose file
↓
File preview
↓
Validation
↓
Upload
↓
Processing
↓
Admin verification pending
↓
Approved / rejected
```

Each state needs a distinct visual representation.

Do not pretend that a file is approved immediately.

## Upload progress

If real progress is available, display it.

Example:

```text
Uploading
████████████░░░░ 72%
```

After upload:

```text
Uploaded successfully
Waiting for admin verification
```

The user should understand that submission and publication are separate stages.

---

# 19. ADMIN VERIFICATION STATUS MOTION

Resources can have states:

- pending
- approved
- rejected
- changes requested

Status changes may use subtle transitions.

When a pending resource becomes approved:

- status badge changes
- check icon appears
- content list updates

Avoid dramatic animations for administrative events.

---

# 20. MODAL SYSTEM

Modals must feel like a layer above the current interface.

Opening sequence:

1. Background receives a controlled dim/softening layer.
2. Modal scales from approximately `0.98` to `1`.
3. Modal opacity moves from `0` to `1`.
4. Shadow establishes depth.

Do not zoom from the entire screen.

The modal should appear close to its logical origin when possible.

---

# 21. BOTTOM SHEET SYSTEM

Mobile interfaces should use bottom sheets for actions that are naturally contextual.

Examples:

- filter
- sort
- resource actions
- profile actions
- share options

Opening:

- translate upward
- fade slightly
- background overlay appears

Closing:

- translate downward
- overlay disappears

Use spring-like easing carefully.

The sheet should never bounce excessively.

---

# 22. GLASS OVERLAY BEHAVIOR

When an overlay is active, underlying glass should not remain equally prominent.

The system can reduce:

- saturation
- brightness
- contrast
- opacity

This creates hierarchy.

However, do not blur the entire screen excessively because it can reduce perceived quality and accessibility.

---

# 23. TOAST SYSTEM

Toasts communicate lightweight status.

Examples:

- “Resource submitted”
- “Link copied”
- “Download started”
- “Profile updated”
- “Message sent”

Toast animation:

Enter:

- opacity `0 → 1`
- translateY `8px → 0`

Exit:

- opacity `1 → 0`
- translateY `0 → 4px`

Typical duration:

`2–4 seconds`

Error messages may remain longer.

Do not use toasts for information that requires user action.

---

# 24. DEVELOPER MESSAGE SYSTEM

BEU BABA includes direct messaging to the developer.

A user can send:

- bug reports
- course update requests
- syllabus update requests
- resource concerns
- general feedback

The message flow should feel like a simple support inbox rather than a social chat platform.

When sending:

1. Message appears optimistically only if the backend contract permits it.
2. Sending state is represented.
3. Server confirmation changes the status.
4. Failure provides retry.

Example states:

```text
Sending…
Sent
Failed — Retry
```

The user should not see another user's messages.

---

# 25. MESSAGE COMPOSER

The message composer should be glass.

It may contain:

- text field
- attachment button if supported
- send button

The send button should become visually active only when valid content exists.

Avoid excessive button animation.

A small activation transition is enough.

---

# 26. PROFILE IMAGE UPLOAD MOTION

During signup/profile editing:

1. User taps avatar.
2. Picker opens.
3. Selected image previews immediately.
4. Image can be validated/cropped.
5. Upload begins.
6. Progress state appears.
7. Success state confirms completion.

The preview must not wait for the server if local preview is available.

---

# 27. GENERATED CHARACTER SELECTION

BEU BABA supports automatically selected generated/profile characters according to signup information such as gender.

The selected character should appear through a subtle reveal.

Do not use a dramatic character entrance.

Recommended:

- opacity fade
- small scale from `0.97`
- subtle vertical movement

Character selection should feel like part of profile personalization.

---

# 28. LOGIN AND REGISTER TRANSITIONS

Login and registration should be a single coherent authentication experience.

Switching between:

- Login
- Register

should not feel like loading a completely new website.

Use a content transition.

Fields can crossfade or slide slightly.

Do not make the entire screen rotate.

---

# 29. FORM VALIDATION MOTION

Validation should happen close to the field.

For an invalid field:

- border transitions to error state
- helper text appears
- optional small shake

Avoid shaking the entire page.

The error message should not suddenly push content by a large amount without transition.

---

# 30. PASSWORD VISIBILITY

When toggling password visibility:

- eye icon morphs or swaps smoothly
- input content does not animate
- focus remains inside the field

Never move focus unexpectedly.

---

# 31. LOADING SYSTEM

BEU BABA must distinguish between:

- loading
- empty
- error
- success

These are not interchangeable.

## Skeleton loading

Use glass-compatible skeleton surfaces.

Skeletons should be subtle.

Avoid aggressive shimmer.

If shimmer is used:

- low contrast
- slow
- limited to loading regions
- never full-screen

---

# 32. SKELETON CARD MOTION

Course card skeleton:

```text
[ image skeleton ]
[ title skeleton ]
[ metadata skeleton ]
[ action skeleton ]
```

The skeleton may have a very subtle gradient movement.

The movement must not resemble an advertisement or flashy animation.

---

# 33. PULL TO REFRESH

On mobile, pull-to-refresh can be supported where appropriate.

Interaction:

1. User pulls content.
2. Refresh indicator progressively appears.
3. Threshold is reached.
4. Indicator locks into refreshing state.
5. Content refreshes.
6. Indicator exits.

Do not over-stretch the page.

---

# 34. SCROLL BEHAVIOR

Scrolling is the most common interaction.

Therefore scrolling must remain:

- smooth
- predictable
- low latency
- free of unnecessary effects

Do not attach expensive blur calculations to every scroll frame.

Avoid continuously animating large glass shadows.

Prefer CSS compositor-friendly properties such as:

- transform
- opacity

Use backdrop blur carefully.

---

# 35. STICKY HEADER BEHAVIOR

The header may change subtly when scrolling.

At the top:

- more transparent
- less elevation

After scrolling:

- slightly stronger glass surface
- stronger shadow
- subtle border

This transition should be gradual.

The header must not suddenly become an opaque block.

---

# 36. NAVBAR HIDE/SHOW

On mobile, hiding the bottom navigation while scrolling can be considered only if it improves content space.

If implemented:

- hide on deliberate downward scrolling
- show on upward scrolling or when the user pauses

Do not hide it unpredictably.

Navigation accessibility takes priority.

---

# 37. FILTER INTERACTION

Filter chips should use glass capsules.

Selected filter:

- stronger surface
- subtle accent
- check icon if useful

Changing filters should update the content with a short transition.

Avoid reanimating the entire page.

---

# 38. SORT INTERACTION

Sort menus should use a glass sheet or popover.

Selection:

- radio/check indicator
- small state transition

After selection:

- close menu
- update list

The list may use a short fade/translation but should not completely disappear.

---

# 39. ACCORDION ANIMATION

Used for:

- syllabus sections
- FAQ
- course modules
- settings

Opening:

- content height expands
- chevron rotates
- content opacity increases

Closing:

- content collapses
- chevron returns

Do not hard-code height where dynamic content exists.

Prefer an implementation that handles variable content safely.

---

# 40. CHEVRON MOTION

Chevron rotation should normally be:

`0° → 180°`

Duration:

`160ms–220ms`

No bounce.

---

# 41. TAB MOTION

Tabs should have a moving glass indicator.

Avoid separate animated backgrounds for each tab.

The indicator can interpolate:

- position
- width

This provides continuity.

---

# 42. FAVORITE / BOOKMARK MOTION

Favorite interaction can use a small icon transformation.

Recommended:

```text
Outline bookmark
→ scale 1.08
→ fill/active state
→ scale 1.00
```

Do not explode the icon into particles.

---

# 43. COPY ACTION

When copying text:

- copy icon can become a checkmark
- return after a short period

Example:

```text
Copy → Check → Copy
```

Duration:

`180ms–250ms`

This gives confirmation without a toast if appropriate.

---

# 44. DOWNLOAD ACTION

A download button should be stateful.

States:

```text
Download
↓
Preparing
↓
Downloading
↓
Downloaded
```

If the file is already available locally:

```text
Downloaded
```

The button should not pretend every tap starts a new download.

---

# 45. OFFLINE BEHAVIOR

Because BEU BABA is a PWA, motion must work correctly during offline mode.

When network is unavailable:

- show offline state
- preserve cached content where possible
- avoid indefinite loading spinners

If an operation requires the network:

```text
No connection
Try again
```

The animation should stop when the system knows the request cannot proceed.

---

# 46. NETWORK ERROR MOTION

Do not keep a spinner running forever.

Recommended:

1. loading indicator
2. request timeout/error
3. error state enters
4. retry action becomes available

This is critical for trust.

---

# 47. EMPTY STATE ANIMATION

Empty states should be calm.

Examples:

- no saved courses
- no messages
- no uploaded resources
- no quiz history

Use:

- simple illustration or icon
- text
- action button

Avoid animated mascots constantly moving.

A one-time subtle entrance is enough.

---

# 48. ERROR STATE ANIMATION

Error states should be stable and clear.

Use:

- icon fade/scale
- message appearance
- retry button

Avoid flashing red UI.

---

# 49. SUCCESS STATE ANIMATION

Success should be brief.

Examples:

- profile saved
- resource submitted
- message sent
- quiz completed

A check icon can draw itself or transition from outline to filled state.

Do not use confetti by default.

---

# 50. CONFETTI POLICY

Confetti is permitted only for genuinely celebratory events such as:

- major quiz milestone
- course completion
- exceptional achievement

Even then:

- short duration
- restrained quantity
- accessible alternative
- no constant particles

It must never become the default success animation.

---

# 51. COURSE COMPLETION

Course completion can use:

1. progress reaches 100%
2. completion state appears
3. certificate or completion card becomes available
4. next recommended action appears

The progress bar should transition smoothly.

The completion state should feel rewarding but professional.

---

# 52. PROGRESS BAR SYSTEM

Progress bars must represent actual progress.

Use:

- width interpolation
- subtle glass track
- clear fill
- percentage where meaningful

Avoid animated stripes unless they represent an active processing state.

---

# 53. CIRCULAR PROGRESS

Circular progress is useful for:

- quiz score
- course completion
- upload

The arc should animate from previous value to new value.

Do not continuously rotate a full ring when actual progress is known.

---

# 54. STUDENT TOOLBOX INTERACTION

The Student Toolbox contains 10+ daily-life tools.

Each tool should open quickly.

Tool cards can use:

- subtle hover elevation
- icon scale
- glass highlight

The toolbox grid should not animate every card at the same time.

Use small stagger only when entering the section.

---

# 55. TOOL STAGGER RULE

When a grid enters:

- first visible row begins
- following cards enter with small delays

Suggested stagger:

`25ms–45ms`

Maximum total stagger should remain short.

Do not create a 2-second cascading animation.

---

# 56. TOOL CALCULATOR INTERACTION

Calculator buttons require immediate feedback.

Press:

- subtle compression
- immediate display update

Do not delay functional output until animation completes.

Function must always have priority over visual motion.

---

# 57. TOOL CONVERSION ANIMATION

For unit/currency conversion:

- input remains stable
- output updates smoothly
- changed number may use subtle fade or count transition

Do not make numbers fly around the screen.

---

# 58. SEARCH RESULTS ANIMATION

When search results update:

Do not animate every result from scratch after every keystroke.

Instead:

- keep stable results
- update changed results
- show loading indicator when required

This prevents visual fatigue.

---

# 59. DEBOUNCING AND MOTION

Search animation and backend requests must be coordinated.

Typing should never trigger visible loading flicker for every character.

Use request debouncing.

The visual system should display meaningful loading only when the query actually requires it.

---

# 60. IMAGE LOADING

Images should use:

1. placeholder
2. image decode
3. fade into final image

Fade duration:

`120ms–220ms`

Avoid huge zoom-in effects.

---

# 61. IMAGE ERROR FALLBACK

If an image fails:

- show neutral glass placeholder
- show appropriate icon
- preserve layout dimensions

Do not cause layout collapse.

---

# 62. LAZY LOADING

Lazy-loaded content should not create sudden layout shifts.

Reserve image dimensions before loading.

This is both a performance and UX requirement.

---

# 63. INFINITE SCROLL

If used:

- load more before the user reaches the end
- display small loading indicator
- append content smoothly

Do not replace the entire list.

---

# 64. PAGINATION

If pagination is used:

- current page indicator transitions
- list content updates
- scroll position behavior is predictable

Do not animate the entire page like a carousel.

---

# 65. PROFILE MENU

Profile menu can appear as a glass popover.

Opening:

- scale from `0.97`
- opacity `0 → 1`
- translate `4–8px`

Closing:

- reverse quickly

The menu must appear anchored to the profile control.

---

# 66. NOTIFICATION CENTER

If notifications are implemented, each notification can have:

- unread glass emphasis
- read transition
- dismiss interaction

Unread → read should be subtle.

Do not animate all notifications whenever one becomes read.

---

# 67. PUSH NOTIFICATION HANDOFF

The web application may use PWA/browser notification capabilities where supported.

The in-app animation should not imply that a push notification was delivered unless delivery is actually confirmed by the supported infrastructure.

When permission is requested:

- explain why
- use native permission at the correct time
- do not repeatedly force the prompt

---

# 68. PERMISSION REQUEST MOTION

Permission education cards should use a calm glass modal/sheet.

Example:

```text
Stay updated
Receive important course and announcement notifications.

[Allow Notifications]
[Not now]
```

No flashing arrows pointing at browser controls.

---

# 69. DELETE CONFIRMATION

Destructive actions require clarity.

For example:

- delete uploaded resource
- delete account
- remove saved item

Use confirmation modal.

The delete button must not rely solely on color.

Motion:

- modal entrance
- no dramatic warning animation

---

# 70. DOUBLE CONFIRMATION AVOIDANCE

Do not make users confirm harmless actions twice.

If confirmation is necessary, make the consequence explicit.

---

# 71. SWIPE GESTURES

Swipe gestures should be used only where discoverable.

Potential uses:

- dismiss bottom sheet
- image gallery
- carousel

Avoid hidden gestures for critical actions.

---

# 72. CAROUSEL MOTION

Course/resource carousels should snap naturally.

Use:

- horizontal drag
- momentum
- snapping

Cards should not rotate heavily.

A small scale difference between active and neighboring cards is acceptable.

---

# 73. IMAGE GALLERY

Image gallery can use:

- swipe
- pinch zoom where appropriate
- close button
- page indicator

Opening an image should visually originate from its thumbnail where technically practical.

---

# 74. MODAL ORIGIN TRANSITIONS

Shared-element-like transitions are encouraged for premium feel.

Example:

Course thumbnail on card:

```text
thumbnail
   ↓
larger course header image
```

The transition should preserve spatial continuity.

If reliable shared transitions are difficult in the chosen routing architecture, use a simple fade/scale instead of a broken imitation.

---

# 75. PAGE ENTER ANIMATION

Page content can enter with:

```text
opacity: 0 → 1
transform: translateY(8px) → 0
```

Use a short duration.

Do not apply the same animation separately to every child.

---

# 76. SECTION ENTER ANIMATION

Major sections may use small staggered entrances.

Rules:

- only animate when newly revealed
- don't repeat unnecessarily
- don't animate during rapid scrolling

---

# 77. ROUTE RESTORATION

When a user returns to a previous route, do not replay the full entrance animation if the state is restored.

Returning to a course list should feel like returning to a place, not reopening it for the first time.

---

# 78. REDUCED MOTION

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

However, important state feedback must remain understandable.

If animation disappears, state must still be communicated through:

- color
- icon
- text
- position
- border
- opacity

---

# 79. ACCESSIBILITY REQUIREMENTS

Motion must never be the only signal.

For example:

Bad:

> Correct answer is communicated only through a green animation.

Good:

- check icon
- “Correct” label
- appropriate contrast
- optional animation

---

# 80. FOCUS MOTION

Keyboard focus should be clearly visible.

Do not animate focus rings excessively.

Focus should appear immediately enough to support keyboard navigation.

---

# 81. TOUCH TARGETS

Interactive controls should have sufficiently large touch targets.

Animation must not shrink the effective hit area.

A visual scale-down on press must not reduce the actual interactive region.

---

# 82. HAPTIC FEEDBACK

Where supported by platform APIs, haptic feedback can be considered for selected interactions.

Potential use:

- successful quiz answer
- important toggle
- completion

Do not trigger haptics for every tiny interaction.

Web support varies, so haptics must never be required for understanding the interface.

---

# 83. PERFORMANCE PRINCIPLES

Prefer animations of:

- transform
- opacity

Use caution with:

- backdrop-filter
- large box-shadow
- filter
- complex clip-path
- expensive blur
- large fixed translucent surfaces

Do not animate expensive CSS properties continuously.

---

# 84. GLASS PERFORMANCE

Glass is visually important but can be expensive.

Rules:

1. Avoid dozens of huge blurred glass layers stacked together.
2. Avoid full-screen backdrop blur on every section.
3. Avoid animated backdrop blur.
4. Keep glass surfaces bounded.
5. Reduce blur on low-powered devices where needed.
6. Use progressive enhancement.

---

# 85. PERFORMANCE FALLBACK

If the browser/device handles backdrop blur poorly:

Use:

- translucent opaque approximation
- subtle border
- shadow
- gradient

The fallback must still look premium.

It should not suddenly become a plain default HTML UI.

---

# 86. FRAME RATE TARGET

Aim for smooth interactions.

Target:

- approximately 60fps where practical
- no obvious frame drops
- no long main-thread blocking

For lower-end devices, graceful degradation is preferable to forcing complex effects.

---

# 87. JAVASCRIPT ANIMATION POLICY

Do not use JavaScript animation loops for effects that CSS can handle efficiently.

Prefer CSS transitions and transforms.

Use JavaScript for:

- state coordination
- scroll-linked logic when necessary
- physics requiring actual interaction
- progress synchronization

Do not run unnecessary requestAnimationFrame loops.

---

# 88. FRAMER MOTION / MOTION LIBRARY POLICY

If using Framer Motion or an equivalent React motion library:

- centralize transition constants
- create reusable variants
- avoid per-component arbitrary spring settings
- respect reduced motion
- avoid rendering huge animated trees unnecessarily

Example conceptual structure:

```text
motion/
  tokens.ts
  variants.ts
  transitions.ts
  reducedMotion.ts
  shared.ts
```

---

# 89. REUSABLE MOTION VARIANTS

Recommended reusable variants:

- fadeIn
- fadeUp
- scaleIn
- modalIn
- sheetIn
- popoverIn
- cardPress
- buttonPress
- staggerContainer
- listItem
- pageEnter
- pageExit

Every component should reuse these where appropriate.

---

# 90. DO NOT OVER-ABSTRACT

Do not create one universal animation that is forced onto every component.

Motion should be consistent, but context matters.

A modal and a card do not need identical behavior.

---

# 91. ANIMATION NAMING

Use semantic names.

Good:

```text
pageEnter
glassModalEnter
courseCardPress
navIndicatorTransition
quizAnswerCorrect
```

Bad:

```text
anim1
coolEffect
thingAnimation
newAnim2
```

---

# 92. MOTION TESTING

Every animation should be tested at:

- mobile portrait
- mobile landscape where relevant
- tablet
- desktop
- slow device
- reduced-motion mode
- keyboard navigation
- touch interaction

---

# 93. ANIMATION INTERRUPTION

Users can interrupt animations.

The UI must remain coherent if:

- user taps twice
- user navigates immediately
- user closes a modal during entrance
- user changes tabs rapidly
- network state changes during loading

Never allow stale animation callbacks to corrupt UI state.

---

# 94. DOUBLE-TAP PROTECTION

Important actions such as:

- submit quiz
- upload
- send message
- purchase if ever added
- delete

must prevent accidental duplicate requests.

The visual state should immediately communicate that the action is being processed.

---

# 95. LOADING BUTTON

Example:

```text
Submit
↓
[spinner] Submitting…
↓
Submitted ✓
```

The button should maintain its approximate dimensions to avoid layout shift.

---

# 96. FORM SUBMISSION

When a form is submitted:

1. Validate synchronously.
2. Show field errors immediately.
3. If valid, disable duplicate submission.
4. Show loading.
5. Send request.
6. Show success/error.
7. Restore controls appropriately.

---

# 97. AUTHENTICATION ERROR

If login fails:

- preserve user-entered email if safe
- show password error appropriately
- avoid clearing everything
- focus the relevant field where helpful

Motion should remain minimal.

---

# 98. SESSION EXPIRATION

If the session expires:

1. Detect authentication failure.
2. Preserve relevant unsaved UI state if possible.
3. Show a clear authentication prompt.
4. Avoid silently throwing the user to home.

A session-expiration modal/sheet can explain:

> Your session has expired. Please sign in again.

---

# 99. DATA REFRESH ANIMATION

When data refreshes:

- preserve stable layout
- update changed values
- avoid flashing entire screens

A subtle refresh indicator is sufficient.

---

# 100. ADMIN DASHBOARD MOTION

The admin dashboard needs a different motion density from the student application.

Admin UI should be:

- efficient
- professional
- restrained

Use motion primarily for:

- table updates
- filters
- dialogs
- status changes
- upload queues
- resource verification

Do not make the admin panel feel like a game.

---

# 101. ADMIN RESOURCE APPROVAL

Approval flow:

```text
Pending
↓
Admin opens resource
↓
Review
↓
Approve
↓
Status transitions
↓
Student-facing resource becomes visible
```

The admin must see clear confirmation.

---

# 102. ADMIN REJECTION

If rejecting:

- reason should be captured
- resource status changes
- user should receive appropriate notification if system supports it

The animation should emphasize state change, not drama.

---

# 103. ADMIN STUDENT PROFILE

Student information can include:

- name
- course
- branch
- contact information
- email
- profile image/character
- resource submissions
- quiz information where authorized
- activity metadata

Do not animate every field.

Use smooth modal/page transitions only.

---

# 104. TABLE ROW INTERACTION

Admin tables can use:

- hover highlight
- selected row state
- inline status transition

Rows should not move unexpectedly when status updates.

---

# 105. ADMIN SEARCH

Search should behave consistently with student search:

- glass field
- focus state
- clear control
- result update

Consistency reduces learning cost.

---

# 106. ADMIN FILTER CHIPS

Filters should communicate active state with:

- stronger glass
- accent
- optional count

Animation must be short.

---

# 107. DATA VISUALIZATION

If charts are used:

- bars/lines may draw in
- numbers may count
- legends appear subtly

Do not animate charts continuously after loading.

Animation should explain the data arriving.

---

# 108. ANNOUNCEMENT SYSTEM

When an admin creates an announcement:

Student-side announcement card may enter with:

- fade
- small translation

If important, a notification badge may update.

Do not interrupt the student with full-screen animation unless the announcement is genuinely critical.

---

# 109. COURSE UPDATE SYSTEM

Course changes should appear naturally.

If a course receives new content:

- “New” badge may appear
- lesson count updates
- recently added content can be highlighted

Avoid flashing the entire course card.

---

# 110. SYLLABUS UPDATE SYSTEM

Syllabus updates are important.

The app should show:

- updated timestamp
- changed section where possible
- download/open action

A small “Updated” badge can transition in.

---

# 111. YEARLY CALENDAR UPDATE

The yearly calendar can have a stable document-style interaction.

When updated:

- version/date changes
- update indicator appears
- content refreshes

Do not use decorative calendar animations.

---

# 112. RESOURCE MODERATION

Resources uploaded by students must remain hidden from public/student browsing until approved.

Motion should reinforce this status in the user's own submission history:

```text
Submitted
→ Pending review
→ Approved
```

This prevents confusion.

---

# 113. RESOURCE PREVIEW

When opening a PDF/image/resource:

- preview surface should appear smoothly
- loading state should be shown
- failed preview should offer download/open alternatives where supported

---

# 114. PDF VIEWER

The PDF viewer should prioritize document usability.

Avoid animated page transitions.

Scrolling should remain native and smooth.

Toolbar controls can use glass surfaces.

---

# 115. FILE DOWNLOAD FEEDBACK

When a file is downloaded:

- button state updates
- optional toast appears
- local availability can be represented

Do not force the user to repeatedly download the same file.

---

# 116. SHARING

If sharing is supported:

1. User taps share.
2. Native Web Share API is used where available.
3. Fallback copy link is available.
4. Feedback confirms the result.

Do not create a fake social-sharing animation.

---

# 117. QUIZ SHARE CARD

The generated quiz result card can be visually premium.

The in-app preview may appear through:

- scale/fade
- slight glass elevation

Downloading/sharing should not animate the card excessively.

---

# 118. STUDENT ACHIEVEMENT SYSTEM

Achievement badges may use:

- subtle reveal
- check animation
- progress completion

Avoid game-like flashing unless explicitly designed for a gamified achievement.

---

# 119. FAVORITE COURSE

When a course is favorited:

- icon transitions
- local UI updates immediately
- backend sync follows

If backend sync fails:

- revert or mark pending
- show meaningful error

Do not pretend the action succeeded permanently.

---

# 120. BOOKMARKED RESOURCE

Bookmarking should behave like favorite.

Keep the interaction immediate.

---

# 121. RECENTLY VIEWED

Recently viewed content should update silently.

Do not animate the entire recent-history section every time the user opens a lesson.

---

# 122. CONTINUE LEARNING

The continue-learning card can update progress.

When a lesson is completed:

- progress bar advances
- percentage updates
- next lesson may appear

Only the changed parts should animate.

---

# 123. LESSON COMPLETION

Lesson completion animation should be subtle:

- checkmark
- progress update
- next action

The user should be able to continue immediately.

---

# 124. VIDEO PLAYER UI

If educational videos are embedded:

- controls should remain usable
- surrounding glass UI should not interfere
- fullscreen behavior should be predictable

Do not cover important video controls with animated overlays.

---

# 125. VIDEO THUMBNAIL LOADING

Thumbnail:

- placeholder
- image fade
- play icon stable

Play icon can slightly respond on hover/press.

---

# 126. COURSE MODULE EXPANSION

Module cards should expand without causing chaotic page movement.

The expanded module should reveal:

- lessons
- completion state
- resource links

Chevron rotates.

Content expands.

---

# 127. LESSON LIST ITEM

Lesson item interaction:

Default → hover → pressed → active/completed.

Completed lessons may show a check.

Current lesson can use a subtle active glass state.

---

# 128. ACTIVE LESSON INDICATOR

Do not use aggressive blinking.

Use:

- border
- glass highlight
- accent icon
- progress

A blinking active lesson indicator is prohibited.

---

# 129. BACK NAVIGATION

Back navigation should preserve context.

If the user opened a lesson from a course:

Back should return to the course at the previous scroll position where feasible.

The transition should feel spatially connected.

---

# 130. DEEP LINKING

Opening a deep-linked course/resource should not depend on the user navigating from home first.

Show the relevant content directly after necessary loading.

---

# 131. ROUTER TRANSITIONS

The routing architecture should avoid animation race conditions.

If using React Router:

- coordinate route state with transition state
- prevent old content from receiving interactions after navigation
- avoid duplicate mounting of expensive components

---

# 132. MOBILE BOTTOM NAVIGATION

Bottom navigation must remain easy to reach.

The glass surface should include:

- blur
- translucency
- border
- shadow

The active item uses the user's preferred capsule-style visual.

The navbar should not look like a generic Bootstrap navigation.

---

# 133. NAVBAR SAFE AREA

On modern mobile devices, include safe-area handling.

The bottom navigation should not overlap system gestures.

---

# 134. NAVBAR KEYBOARD BEHAVIOR

When the mobile keyboard opens:

- avoid unnecessary bottom navigation overlap
- search field should remain visible
- layout should adapt naturally

---

# 135. DESKTOP NAVIGATION

On desktop, the same visual language can become a top or side navigation depending on the architecture.

The glass active indicator should remain consistent with the mobile design language.

---

# 136. RESPONSIVE MOTION

Do not simply use desktop animations on mobile.

Mobile:

- shorter transitions
- less simultaneous motion
- smaller translation distances

Desktop:

- hover feedback
- slightly richer card interaction

---

# 137. POINTER DEVICES

Hover animations should exist only where hover exists.

Do not make touch devices emulate hover through sticky states.

---

# 138. MOUSE CURSOR

A custom cursor is optional and generally unnecessary.

Do not add oversized glowing cursor effects.

The product should feel premium through material and interaction quality, not gimmicks.

---

# 139. SCROLL-LINKED EFFECTS POLICY

Scroll-linked effects should be limited to:

- header material change
- course-card emphasis
- subtle section reveals

Avoid excessive scroll-driven parallax.

---

# 140. PARALLAX POLICY

Parallax should not be used on important text or controls.

It can cause:

- motion discomfort
- readability issues
- performance costs

If used at all, keep it extremely subtle.

---

# 141. GLASS HIGHLIGHT MOTION

A glass highlight may change subtly on hover.

Do not create moving light beams across every glass card.

No repeated sweeping shine effect.

This is specifically prohibited because it makes the interface look like a template or advertisement.

---

# 142. BORDER MOTION

Borders should transition opacity/brightness subtly.

Do not animate borders continuously.

---

# 143. SHADOW MOTION

Shadow can change between default and pressed states.

Do not animate giant shadows because they can be expensive.

---

# 144. BLUR MOTION

Backdrop blur should normally remain constant.

Do not animate blur radius for ordinary interactions.

The expensive visual effect provides little value when continuously changing.

---

# 145. OPACITY RULE

Opacity is useful for:

- entrance
- exit
- disabled
- overlay
- secondary states

Do not make primary text low opacity merely for aesthetic glass effect.

---

# 146. TYPOGRAPHY MOTION

Text should rarely move independently.

Avoid:

- letter-by-letter animations
- typing effects
- bouncing headings
- word-by-word entrance

Educational content must remain easy to read.

---

# 147. NUMBER ANIMATION

Count-up animation is acceptable for:

- quiz score
- progress
- statistics

Not for ordinary static metadata.

---

# 148. DATE/TIME UPDATES

Dates should update without unnecessary animations.

Only meaningful changes may receive a subtle status transition.

---

# 149. ICON TRANSITIONS

Icon transitions should be semantic.

Examples:

- plus → minus
- play → pause
- bookmark → saved
- eye → eye-off
- menu → close

Use morph or opacity transitions when supported.

---

# 150. ICON ROTATION

Rotation is appropriate when direction changes.

Examples:

- chevron
- expand/collapse arrow

Avoid rotating unrelated icons.

---

# 151. PRESS FEEDBACK LATENCY

The visual pressed state must appear essentially immediately.

Never wait for the backend response before showing a local press response.

---

# 152. OPTIMISTIC UI

Use optimistic UI only for operations where the application can safely roll back.

Good candidates:

- bookmark
- favorite
- local selection

More sensitive operations should use confirmed states:

- account deletion
- moderation
- resource publication

---

# 153. ROLLBACK ANIMATION

If an optimistic action fails:

- return control to previous state
- show error feedback

The rollback should not be dramatic.

---

# 154. API LATENCY HANDLING

The interface should remain responsive even when APIs are slow.

Use:

- immediate interaction feedback
- skeletons
- progress
- retry

Never freeze the interface waiting for network completion.

---

# 155. SLOW NETWORK

On slow connections:

- prioritize text
- show thumbnails progressively
- avoid blocking entire pages
- preserve layout

The glass UI must not become a performance bottleneck.

---

# 156. OFFLINE CACHE

Cached pages should open with minimal loading motion.

Do not show a full skeleton when content is already locally available.

---

# 157. SERVICE WORKER UPDATE

When a new PWA version is available:

Show a small glass notification:

> A new version is available. Refresh to update.

Actions:

- Refresh
- Later

The update should never silently disrupt active study sessions.

---

# 158. INSTALL PWA PROMPT

The custom install education card should be subtle.

Do not repeatedly interrupt users.

The install action can use a glass modal/sheet.

---

# 159. APP LAUNCH

On initial launch:

Avoid long splash animations.

A brief branded transition is acceptable, but the user should reach useful content quickly.

Do not make the logo animation last several seconds.

---

# 160. PRELOADER

If a preloader is required:

- maximum practical duration should be short
- show only while genuinely initializing
- avoid fake percentage counters

The logo can have a subtle opacity/scale entrance.

---

# 161. AUTHENTICATED APP LAUNCH

After authentication:

- restore user profile
- restore navigation state if appropriate
- load dashboard data

Do not animate every dashboard widget independently.

---

# 162. DASHBOARD ENTRANCE

Recommended order:

1. Header
2. Greeting/profile summary
3. Main course/continue-learning area
4. Quick actions
5. Toolbox/resources
6. Secondary information

This establishes hierarchy.

---

# 163. GREETING ANIMATION

A greeting can fade in once.

Do not type the greeting letter by letter.

---

# 164. QUICK ACTIONS

Quick actions should appear immediately enough to be useful.

A small stagger is acceptable.

---

# 165. RESOURCE GRID

Resource cards may enter with a small fade-up.

On subsequent navigation, avoid replaying the animation unnecessarily.

---

# 166. QUIZ DASHBOARD

Quiz dashboard can animate:

- progress ring
- recent quiz result
- available quizzes

Only meaningful metrics should count up.

---

# 167. HISTORY SCREEN

History should prioritize scanning.

No excessive animation.

Newly loaded records can appear with a short list transition.

---

# 168. SEARCH HISTORY

If recent searches are shown:

- selecting one should immediately populate the search field
- deleting one should remove it smoothly

No full-screen refresh animation.

---

# 169. FILTER RESET

Resetting filters should:

- clear selected chips
- update list
- maintain context

The reset button should not perform a large animation.

---

# 170. SORTING TRANSITION

If sorting changes item order, use a layout transition if stable and performant.

If not, a simple update is better than a broken animation.

Never prioritize animation over correct list ordering.

---

# 171. LIST REORDERING

For favorites or admin queues:

- moved item can animate to new position
- other items shift smoothly

Keep movement low amplitude.

---

# 172. DRAG AND DROP

If resource upload supports drag/drop on desktop:

- drop zone expands slightly when a valid file is dragged over
- border/highlight changes
- release triggers upload

Do not flash the entire area.

---

# 173. INVALID DROP

If the file type is invalid:

- show error state
- clear drag state
- explain accepted formats

---

# 174. UPLOAD QUEUE

Multiple uploads should have independent progress states.

Example:

```text
File A — 82%
File B — Processing
File C — Pending
```

Do not merge all files into one ambiguous progress bar.

---

# 175. ADMIN MODERATION QUEUE

Pending resources can show status transitions.

When an item is approved:

- row status changes
- queue count updates

The queue should remain stable.

---

# 176. DEVELOPER SUPPORT INBOX

The developer support section should distinguish:

- unread
- open
- replied
- resolved

The user should only see their own conversation.

The admin can see conversations according to authorization.

---

# 177. SUPPORT MESSAGE READ STATE

Unread messages can have:

- subtle indicator
- stronger text weight

Marking read should not animate the entire message list.

---

# 178. SUPPORT REPLY

When developer replies:

- message appears at bottom
- scroll to it only when appropriate
- unread state updates

Do not forcibly scroll if the user is reading older content.

---

# 179. AUTO-SCROLL RULE

Auto-scroll only when the user is already near the bottom.

If the user has deliberately scrolled upward, do not pull them back down when a new message arrives.

---

# 180. MESSAGE DELIVERY

Use clear states where possible:

- sending
- sent
- failed

Do not expose technical backend details.

---

# 181. DATA PRIVACY UI

Privacy-sensitive data should not be animated into view unexpectedly.

Student profile information should remain within authorized contexts.

Motion does not replace access control.

---

# 182. SECURITY PRINCIPLE

The animation layer must never determine permissions.

For example:

```text
if admin:
    show admin screen
```

must be backed by actual authorization, not merely hidden UI.

---

# 183. ANIMATION AND SECURITY

Do not preload sensitive admin content into the student client merely because it is hidden by animation or CSS.

The data architecture must enforce access.

---

# 184. CONTENT VISIBILITY

Resource approval status must be enforced server-side.

A card appearing with a nice animation does not make it authorized.

---

# 185. ERROR RECOVERY

Every asynchronous animation must have a termination condition.

Bad:

```text
loading forever
```

Good:

```text
loading
→ success
or
→ error
or
→ retry
```

---

# 186. TIMEOUT POLICY

Long operations should eventually communicate their state.

For example:

```text
Still working…
```

can appear when processing genuinely takes longer.

Do not fake completion.

---

# 187. ANIMATION QUEUES

Avoid stacking too many queued animations.

If a user rapidly changes filters:

- cancel obsolete transitions
- prioritize latest state

The interface must represent current truth, not historical clicks.

---

# 188. INTERRUPTIBLE MOTION

Motion should be interruptible.

For example:

```text
Modal opening
↓
User taps close
↓
Modal closes cleanly
```

Do not force the user to wait for an entrance animation to finish.

---

# 189. MOTION PRIORITY

When multiple animations compete:

Priority order:

1. user action feedback
2. system state
3. navigation
4. content transition
5. decoration

User feedback always wins.

---

# 190. STAGGER LIMIT

Maximum recommended stagger for ordinary interfaces:

approximately `300–500ms` total.

If a list has many items, do not delay every item individually.

Animate only the visible first few items or use a shared reveal.

---

# 191. MODAL EXIT SPEED

Exit animations can be slightly faster than entrance.

Example:

- enter `280ms`
- exit `180ms`

This creates responsiveness.

---

# 192. SHEET EXIT SPEED

Similarly:

- enter `320ms`
- exit `220ms`

The user should feel that closing is immediate.

---

# 193. NAVIGATION INDICATOR SPEED

The active navbar indicator should not lag behind the user's tap.

Target:

`200–280ms`

---

# 194. SEARCH EXPANSION SPEED

Search should feel immediate.

Target:

`220–300ms`

Keyboard focus should happen as early as technically practical.

---

# 195. BUTTON PRESS SPEED

Target:

`100–160ms`

The press response should be visible even for fast taps.

---

# 196. CARD HOVER SPEED

Target:

`140–220ms`

Hover should not feel sluggish.

---

# 197. PAGE TRANSITION SPEED

Target:

`220–360ms`

Avoid transitions longer than necessary.

---

# 198. SUCCESS FEEDBACK SPEED

Target:

`160–300ms`

Meaningful celebratory effects can be longer, but should remain optional.

---

# 199. REDUCED-MOTION DESIGN ALTERNATIVES

When motion is disabled:

- active navbar uses static glass capsule
- search instantly expands
- modal instantly appears with minimal fade
- progress changes directly
- quiz feedback uses icon/state
- course card state changes without scale

The UI must remain visually premium without motion.

---

# 200. DESIGN SYSTEM DOCUMENTATION

Every reusable component should document:

- default state
- interaction states
- motion
- duration
- easing
- accessibility
- reduced-motion behavior
- mobile behavior
- desktop behavior
- performance notes

---

# 201. COMPONENT CONTRACT

A production component specification should look conceptually like:

```text
Component: GlassCourseCard

Purpose:
Display course information.

States:
Default
Hover
Pressed
Loading
Disabled
Completed

Motion:
Hover: translateY(-2px), 180ms
Pressed: scale(0.985), 120ms
Enter: fade-up, 240ms

Reduced motion:
No transform; opacity-only or instant.

Accessibility:
Keyboard focus, semantic link/button, adequate contrast.

Performance:
No continuous animation.
```

---

# 202. DESIGN TOKEN ARCHITECTURE

Motion should be represented as tokens.

Example:

```ts
export const motionTokens = {
  duration: {
    instant: 80,
    fast: 140,
    standard: 220,
    emphasis: 320,
    slow: 420
  },
  easing: {
    standard: [0.2, 0.8, 0.2, 1],
    enter: [0.16, 1, 0.3, 1],
    exit: [0.4, 0, 1, 1]
  }
};
```

The exact library syntax may differ.

The important requirement is centralized control.

---

# 203. MOTION AUDIT

Before production release, inspect the entire app and classify every animation.

For each animation ask:

1. Why does it exist?
2. What state does it communicate?
3. Is it repeated frequently?
4. Can it cause motion discomfort?
5. Does it affect performance?
6. Does reduced motion work?
7. Is it consistent with the design system?
8. Does it distract from study content?

If an animation has no strong answer to its purpose, remove it.

---

# 204. GLASSMORPHISM MOTION RULES

Glass is the visual foundation, but glass should remain calm.

Allowed:

- surface opacity transitions
- border emphasis
- shadow depth
- subtle press compression
- active indicator movement

Avoid:

- glass wobbling
- liquid distortion everywhere
- glass continuously glowing
- moving shine bands
- rainbow reflections
- animated background particles

The application should look like premium translucent material, not a visual-effects showcase.

---

# 205. APPLE-INSPIRED PRINCIPLE

The design may take inspiration from Apple's general principles of:

- clarity
- hierarchy
- physical continuity
- restrained animation
- translucent surfaces
- responsive controls

However, BEU BABA must have its own identity.

Do not copy proprietary layouts, exact assets, or branding.

The goal is **Apple-quality interaction discipline**, not a replica.

---

# 206. PREMIUM QUALITY CHECK

A premium interaction should satisfy all of these:

- immediate
- smooth
- predictable
- restrained
- purposeful
- accessible
- responsive
- consistent

If it is merely flashy, it is not premium.

---

# 207. “WOW” EFFECT POLICY

BEU BABA should have memorable moments, but they must be strategic.

Good wow moments:

- beautiful glass navigation indicator
- fluid search transformation
- polished course-card interaction
- elegant quiz completion
- smooth course progress
- excellent page continuity

Bad wow moments:

- random 3D background
- RGB glow
- constant particle effects
- excessive parallax
- spinning UI
- giant animated logos

The former creates product quality. The latter creates visual noise.

---

# 208. FINAL INTERACTION HIERARCHY

The application should feel like this:

```text
CONTENT
  ↓
USER ACTION
  ↓
IMMEDIATE FEEDBACK
  ↓
STATE CHANGE
  ↓
SMOOTH TRANSITION
  ↓
NEXT AVAILABLE ACTION
```

Never:

```text
USER ACTION
  ↓
LONG ANIMATION
  ↓
USER WAITS
  ↓
CONTENT
```

---

# 209. FINAL NAVBAR SPECIFICATION

The navbar is a signature interaction.

Mandatory characteristics:

- light translucent glass
- soft blur
- thin border
- subtle shadow
- rounded capsule active state
- moving active indicator
- immediate press feedback
- no RGB
- no neon
- no dark theme
- no excessive bounce

The selected item must look clearly selected without overwhelming the other navigation items.

---

# 210. FINAL SEARCH SPECIFICATION

Mandatory characteristics:

- glass search pill
- smooth expansion
- preserved icon position
- focused text field
- clear action
- results transition
- no full-screen theatrical effect
- mobile keyboard compatibility

---

# 211. FINAL COURSE CARD SPECIFICATION

Mandatory characteristics:

- premium glass surface
- controlled image treatment
- subtle hover
- subtle press
- scroll emphasis
- stable typography
- no constant animation
- no 3D spinning
- no neon

---

# 212. FINAL QUIZ SPECIFICATION

Mandatory characteristics:

- immediate option feedback
- correct/incorrect state clarity
- progress animation
- result transition
- optional restrained celebration
- accessible text/icon signals

---

# 213. FINAL RESOURCE SPECIFICATION

Mandatory characteristics:

- upload progress
- processing state
- pending verification state
- approved state
- rejected state
- retry/error state

Each state must be honest and distinguishable.

---

# 214. FINAL SUPPORT MESSAGE SPECIFICATION

Mandatory characteristics:

- glass conversation surface
- clear sending state
- sent state
- failure/retry
- developer reply state
- unread state
- no access to other users' conversations
- stable scroll behavior

---

# 215. FINAL ADMIN SPECIFICATION

Mandatory characteristics:

- restrained motion
- efficient workflow
- clear resource verification state
- student information visibility according to authorization
- stable tables
- smooth filters
- confirmation for destructive actions

---

# 216. PROHIBITED MOTION LIST

The following should not be used as standard BEU BABA effects:

1. RGB glow loops.
2. Rainbow gradients moving continuously.
3. Rotating 3D backgrounds.
4. Floating AI brains.
5. Animated neural networks.
6. Cyberpunk grids.
7. Excessive particles.
8. Constant card levitation.
9. Infinite logo spinning.
10. Full-page 3D rotations.
11. Excessive page zoom.
12. Text typing animations.
13. Flashing active controls.
14. Continuous glass shine.
15. Giant cursor effects.
16. Excessive confetti.
17. Repeated bounce loops.
18. Fake loading percentages.
19. Infinite skeleton shimmer.
20. Motion that blocks interaction.

---

# 217. QUALITY ASSURANCE CHECKLIST

Before shipping any screen, verify:

## Visual

- Light theme only.
- Glass remains translucent.
- Background is not black.
- No RGB.
- No unnecessary 3D.
- No AI decoration.

## Interaction

- Buttons respond immediately.
- Cards respond appropriately.
- Navigation indicator moves correctly.
- Search expands smoothly.
- Modals open and close naturally.
- Loading states are meaningful.

## Accessibility

- Keyboard focus works.
- Reduced motion works.
- Text contrast is sufficient.
- Animation is not the only state signal.
- Touch targets are usable.

## Performance

- No obvious frame drops.
- No unnecessary animation loops.
- Blur is controlled.
- Images reserve layout space.
- Slow network does not create indefinite spinners.

---

# 218. MOBILE QA

Test:

- 360px width
- 390px width
- 412px width
- common Android browsers
- iOS Safari where applicable
- PWA installed mode

Verify:

- navbar
- search
- bottom sheets
- keyboard
- scrolling
- safe areas
- touch states

---

# 219. DESKTOP QA

Test:

- 1280px
- 1440px
- 1920px

Verify:

- hover
- keyboard focus
- pointer interactions
- glass surfaces
- modal placement
- admin tables
- course cards

---

# 220. LOW-END DEVICE QA

The app must remain usable when:

- CPU is limited
- memory is limited
- network is slow
- GPU is weak

Reduce decorative effects before reducing functional usability.

---

# 221. BROWSER FALLBACK QA

Check browsers with limited backdrop-filter support.

The fallback should:

- preserve contrast
- preserve hierarchy
- remain visually coherent

Never allow unsupported glass CSS to make text unreadable.

---

# 222. FINAL ACCEPTANCE CRITERIA

BEU BABA's interaction system is approved only when:

1. Every major interaction has a defined state model.
2. Motion is centralized through tokens.
3. Navigation has a premium glass active indicator.
4. Search has a smooth transformation.
5. Course cards use restrained interaction motion.
6. Quiz feedback is immediate and accessible.
7. Resource uploads expose truthful processing states.
8. Developer messaging exposes sending/sent/error states.
9. Admin workflows remain efficient.
10. Reduced-motion mode works.
11. Performance remains acceptable.
12. No prohibited visual effects appear.
13. No animation blocks core functionality.
14. Loading states eventually terminate.
15. Failed operations can recover.
16. Mobile and desktop behavior are intentionally designed.
17. Glass remains transparent and premium.
18. The app never drifts into a dark, neon, RGB, or AI-themed aesthetic.

---

# 223. MASTER PRINCIPLE

The complete BEU BABA motion language can be summarized as:

> **Soft surfaces. Immediate response. Continuous spatial logic. Minimal distraction. Maximum clarity.**

BEU BABA should not feel like an application filled with animations.

It should feel like an application where **everything responds naturally**.

The user should notice the quality without having to notice the animation itself.

That distinction is the foundation of the entire interaction system.

---

# 224. IMPLEMENTATION DIRECTIVE FOR AI CODING AGENTS

Any AI coding agent implementing BEU BABA must follow this document as a strict interaction contract.

The agent must not introduce:

- dark UI
- RGB effects
- neon effects
- cyberpunk effects
- random 3D objects
- AI-themed background effects
- unnecessary particle systems
- excessive animation
- arbitrary animation durations

Before implementing a new animation, the agent must determine:

1. What user problem does this animation solve?
2. Which component state does it represent?
3. Which motion token should be used?
4. What is the reduced-motion alternative?
5. Does it work on touch?
6. Does it work on keyboard?
7. Does it impact performance?
8. Does it remain consistent with the transparent glass material system?

If these questions cannot be answered, the animation should not be added.

---

# 225. MASTER MOTION TOKEN TABLE

| Purpose | Duration | Typical behavior |
|---|---:|---|
| Immediate press | 80–140ms | scale/elevation |
| Icon state | 140–200ms | morph/opacity |
| Button transition | 140–180ms | surface/transform |
| Card hover | 160–220ms | elevation/scale |
| Search expansion | 220–300ms | width/focus |
| Navbar indicator | 220–300ms | position/width |
| Accordion | 180–260ms | height/opacity |
| Popover | 180–260ms | scale/fade |
| Modal enter | 250–360ms | scale/fade |
| Sheet enter | 280–380ms | translate |
| Page transition | 220–360ms | fade/translate |
| Quiz result | 400–900ms | meaningful score |
| Major celebration | 500–1200ms | optional |

These are design-system ranges, not mandatory values for every component.

---

# 226. MASTER “DO” LIST

Always:

- use subtle movement
- prioritize feedback
- preserve spatial continuity
- use glass material consistently
- keep content readable
- support reduced motion
- optimize performance
- use real progress
- preserve interaction state
- allow interruption
- test on touch and desktop
- centralize motion tokens
- keep educational content dominant

---

# 227. MASTER “DON'T” LIST

Never:

- animate everything
- make users wait for animation
- use motion as the only status signal
- use RGB
- use dark visual treatment
- add random 3D backgrounds
- add AI-themed decorative objects
- use infinite shimmer everywhere
- use fake progress
- create giant page transitions
- force auto-scroll unexpectedly
- animate every text node
- hide navigation unpredictably
- compromise performance for decoration

---

# 228. FINAL PRODUCT FEEL

The desired final feeling is:

**premium + calm + modern + translucent + responsive + educational + trustworthy**

Not:

**gaming + neon + futuristic + noisy + AI-demo + over-animated**

The interface should feel like a carefully engineered premium mobile product.

The glass should be visible.

The motion should be felt.

Neither should dominate the educational purpose.

---

# 229. HANDOFF SUMMARY

This specification should be implemented together with the BEU BABA visual design system.

The visual system defines:

- materials
- colors
- typography
- spacing
- glass surfaces
- borders
- shadows

This motion system defines:

- interaction
- transition
- timing
- easing
- gestures
- state feedback
- loading
- navigation movement
- responsive behavior
- accessibility
- performance

Together they establish the behavioral foundation for the production UI.

---

# 230. FINAL STRICT RULE

If there is ever a conflict between:

**visual effect** and **usability**,

choose usability.

If there is a conflict between:

**animation** and **performance**,

choose performance.

If there is a conflict between:

**glass decoration** and **readability**,

choose readability.

If there is a conflict between:

**brand styling** and **accessibility**,

choose accessibility.

If there is a conflict between:

**complexity** and **clarity**,

choose clarity.

BEU BABA should be remembered because it is **excellent to use**, not because it contains the most effects.

---

## END OF DOCUMENT

**BEU BABA — Advanced Component Interaction, Micro-Interaction & Motion System**

This document is intended to be treated as a strict production specification by designers, frontend developers, backend-aware UI developers, QA engineers, and AI coding agents working on the BEU BABA application.
