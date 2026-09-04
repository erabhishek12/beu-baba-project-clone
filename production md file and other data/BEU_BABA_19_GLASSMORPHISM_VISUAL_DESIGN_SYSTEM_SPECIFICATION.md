# BEU BABA — GLASSMORPHISM VISUAL DESIGN SYSTEM & MATERIAL SPECIFICATION

**Document ID:** BEU-BABA-19  
**Version:** 1.0  
**Status:** Production Design Specification  
**Scope:** Complete light-theme premium translucent glass visual language  
**Primary UI direction:** Apple-inspired, refined, transparent, tactile, calm, academic, premium  
**Explicit exclusions:** dark theme, black glass, RGB/neon styling, cyberpunk styling, AI-themed 3D backgrounds, excessive decorative 3D objects

---

# 1. PURPOSE

This document defines the visual design system for BEU BABA.

BEU BABA is intended to feel like a premium academic application rather than a conventional education website. The interface must communicate trust, simplicity, modernity, academic usefulness, and polish immediately.

The visual system is based on a **light translucent glass material**. Glass is not an ornament added to ordinary cards. It is a material language that controls how surfaces, navigation, sheets, controls, cards, and overlays relate to the environment behind them.

The system must therefore be implemented consistently across the entire application.

A developer must not interpret “glassmorphism” as:

- placing `opacity: 0.5` on every card;
- using a generic white card with a blur;
- adding a large colorful gradient behind every screen;
- putting glowing circles behind components;
- adding RGB borders;
- using black backgrounds;
- adding random 3D objects;
- making every component translucent regardless of readability.

The desired result is a **clean, bright, physically plausible translucent interface**.

The background should feel like a softly illuminated environment. The glass should allow subtle environmental information to pass through it. Foreground content should remain highly readable. Depth should be created primarily through translucency, blur, layering, highlights, and restrained shadows.

---

# 2. CORE DESIGN PHILOSOPHY

## 2.1 Primary principle

The interface should feel:

> **light, transparent, calm, tactile, precise, and premium.**

It should not feel:

> futuristic, gaming-oriented, cyberpunk, neon, artificial, overly animated, or visually noisy.

## 2.2 Academic-first design

BEU BABA is an academic application.

The design must always prioritize:

1. readability;
2. navigation clarity;
3. content discovery;
4. task completion;
5. trust;
6. accessibility;
7. performance.

Visual effects are secondary.

If a glass effect makes text harder to read, the glass effect must be reduced.

If an animation delays access to course material, the animation must be shortened.

If transparency causes performance problems on a low-end device, the interface must fall back to an opaque or lightly translucent material.

## 2.3 Premium does not mean complicated

A premium interface is not created by adding more visual effects.

Premium quality comes from:

- consistent spacing;
- excellent typography;
- restrained colors;
- precise alignment;
- predictable interactions;
- subtle motion;
- carefully controlled shadows;
- consistent corner radii;
- material hierarchy;
- responsive behavior;
- excellent empty/loading/error states.

The application must therefore follow a **less-but-better** approach.

---

# 3. VISUAL NORTH STAR

Every screen must visually answer five questions.

### Question 1 — Is it bright?

Yes.

The base environment is predominantly light.

### Question 2 — Is it glass?

Yes.

Important elevated surfaces use translucent materials rather than conventional solid cards.

### Question 3 — Is it readable?

Always.

Text must never depend on transparency for contrast.

### Question 4 — Is it Apple-inspired?

Yes, in terms of restraint, hierarchy, spacing, material depth, motion, and tactile interaction.

The application must not copy Apple's proprietary UI assets or branding.

### Question 5 — Is it BEU BABA?

Yes.

Academic identity, BEU-related information architecture, student utilities, PYQs, syllabus, quizzes, resources, profile, and developer communication must remain the primary identity.

---

# 4. STRICT VISUAL RULES

The following rules are mandatory.

## 4.1 Light theme is the default

The primary experience must use a light environment.

Do not build the application around a dark theme and then create a light version.

The light theme is the actual design foundation.

## 4.2 No black UI surfaces

Avoid:

- black cards;
- black navigation;
- black modal backgrounds;
- black glass;
- black gradients;
- black neon glow.

Very dark text may be used for typography where required.

## 4.3 No RGB

Do not use:

- RGB borders;
- rainbow gradients;
- neon blue/purple/pink glow;
- gaming-style lighting;
- animated rainbow backgrounds.

## 4.4 No AI-theme visuals

Do not use:

- floating AI brains;
- holographic grids;
- robotic objects;
- futuristic 3D spheres;
- glowing neural networks;
- abstract cyber objects;
- excessive particle fields.

The application should not visually resemble an AI product.

## 4.5 No decorative 3D background

Large 3D background objects are prohibited as a default design pattern.

If a 3D element is ever introduced, it must have a clear functional or academic purpose and must not interfere with readability.

## 4.6 No glass everywhere

Glass must have hierarchy.

If every element is transparent, nothing feels elevated.

Use:

- environment;
- base surfaces;
- primary glass;
- elevated glass;
- floating glass;
- modal glass.

Different layers must have different visual strength.

---

# 5. MATERIAL ARCHITECTURE

BEU BABA should be treated as a layered physical environment.

Recommended conceptual hierarchy:

```text
Layer 0 — Environment
    ↓
Layer 1 — Base content surface
    ↓
Layer 2 — Primary glass
    ↓
Layer 3 — Elevated glass
    ↓
Layer 4 — Floating controls
    ↓
Layer 5 — Modal / sheet glass
    ↓
Layer 6 — Focus / interaction highlight
```

Each layer must be visually distinguishable.

---

# 6. ENVIRONMENT LAYER

The environment is what appears behind glass.

It should not be plain white everywhere.

A completely flat white background can make glass appear like ordinary cards.

The environment should contain extremely subtle tonal variation.

Examples:

- warm white;
- cool white;
- extremely soft blue tint;
- extremely soft lavender tint;
- pale neutral gradient;
- subtle radial light;
- very low-opacity ambient blobs.

These elements must remain almost invisible.

The user should notice the glass first, not the background decoration.

## 6.1 Recommended background strategy

Use a mostly white base:

```text
#F8FAFC
```

or a similarly very light neutral.

Then introduce extremely subtle environmental lighting.

Conceptual example:

```css
background:
  radial-gradient(
    circle at 15% 10%,
    rgba(180, 210, 255, 0.16),
    transparent 32%
  ),
  radial-gradient(
    circle at 85% 20%,
    rgba(220, 205, 255, 0.12),
    transparent 30%
  ),
  #f8fafc;
```

These values are starting points, not immutable requirements.

The visual QA process must determine whether the result remains sufficiently subtle.

---

# 7. GLASS MATERIAL PRINCIPLES

A convincing glass surface normally combines several properties.

## 7.1 Translucency

The surface must have some transparency.

Conceptually:

```css
background: rgba(255, 255, 255, 0.55);
```

However, transparency should vary according to context.

A large content card may require more opacity than a floating navigation control.

## 7.2 Backdrop blur

Backdrop blur is responsible for the characteristic glass behavior.

Example starting point:

```css
backdrop-filter: blur(20px) saturate(125%);
-webkit-backdrop-filter: blur(20px) saturate(125%);
```

Do not blindly apply extreme blur values.

Excessive blur causes:

- performance problems;
- muddy backgrounds;
- loss of depth;
- visual softness;
- reduced distinction between layers.

## 7.3 Border

A very subtle border should define the glass edge.

Example:

```css
border: 1px solid rgba(255, 255, 255, 0.62);
```

The border should usually be brighter than the surface.

Avoid thick borders.

Avoid colored borders unless a component specifically requires semantic emphasis.

## 7.4 Inner highlight

A subtle inner highlight can create the appearance of light passing across glass.

Example:

```css
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.72);
```

This must remain subtle.

## 7.5 Outer shadow

Glass needs depth.

Example:

```css
box-shadow:
  0 10px 30px rgba(30, 50, 80, 0.08);
```

The shadow must be soft.

Avoid heavy black shadows.

---

# 8. GLASS MATERIAL LEVELS

Define reusable material tokens.

## 8.1 Glass 01 — Subtle

Use for:

- secondary controls;
- small floating elements;
- low-priority surfaces.

Concept:

```text
Opacity: low-to-medium
Blur: low
Border: very subtle
Shadow: minimal
```

## 8.2 Glass 02 — Standard

Use for:

- course cards;
- resource cards;
- dashboard cards;
- information panels.

Concept:

```text
Opacity: medium
Blur: medium
Border: subtle
Shadow: soft
```

## 8.3 Glass 03 — Elevated

Use for:

- important floating panels;
- expanded search;
- filter panels;
- selected content.

Concept:

```text
Opacity: medium-high
Blur: medium-high
Border: brighter
Shadow: moderate
```

## 8.4 Glass 04 — Floating

Use for:

- bottom navigation;
- floating action controls;
- persistent toolbars.

This is one of the most visually important materials.

It should appear physically separated from the page.

## 8.5 Glass 05 — Modal

Use for:

- confirmation dialog;
- bottom sheet;
- quiz result overlay;
- developer message composer overlay.

Modal glass must prioritize readability over transparency.

---

# 9. GLASS TOKEN SYSTEM

The implementation must centralize material values.

Example CSS variables:

```css
:root {
  --glass-subtle-bg: rgba(255, 255, 255, 0.42);
  --glass-standard-bg: rgba(255, 255, 255, 0.58);
  --glass-elevated-bg: rgba(255, 255, 255, 0.68);
  --glass-floating-bg: rgba(255, 255, 255, 0.72);
  --glass-modal-bg: rgba(255, 255, 255, 0.82);

  --glass-border: rgba(255, 255, 255, 0.62);
  --glass-border-strong: rgba(255, 255, 255, 0.78);

  --glass-blur-sm: 12px;
  --glass-blur-md: 20px;
  --glass-blur-lg: 28px;
  --glass-blur-xl: 36px;

  --glass-shadow-sm:
    0 4px 16px rgba(40, 60, 90, 0.06);

  --glass-shadow-md:
    0 10px 30px rgba(40, 60, 90, 0.08);

  --glass-shadow-lg:
    0 18px 50px rgba(40, 60, 90, 0.12);
}
```

These variables must be the single source of truth.

Do not hard-code unrelated glass values in individual components.

---

# 10. COLOR SYSTEM

## 10.1 Primary neutral

The application should use a neutral foundation.

Recommended conceptual palette:

```text
Canvas:
#F7F9FC

Surface:
#FFFFFF

Primary text:
#18202B

Secondary text:
#5F6B7A

Tertiary text:
#8993A1

Border:
#E6EAF0
```

The exact values can be tuned.

## 10.2 Accent color

BEU BABA should have a restrained accent.

The accent should be used for:

- selected navigation;
- primary action;
- links;
- progress;
- active tabs;
- success/important academic states where appropriate.

Do not turn the entire UI into the accent color.

## 10.3 Semantic colors

Use semantic colors carefully:

```text
Success → calm green
Warning → warm amber
Error → controlled red
Info → calm blue
```

Semantic colors should never become neon.

---

# 11. TYPOGRAPHY SYSTEM

Typography must feel modern and highly readable.

Recommended hierarchy:

```text
Display
H1
H2
H3
Body Large
Body
Body Small
Caption
Label
```

## 11.1 Display

Used only for major screen introductions.

Do not use oversized text on every page.

## 11.2 Headings

Headings should have strong hierarchy but remain compact.

## 11.3 Body

Body text must be comfortable for students reading academic content.

## 11.4 Numeric typography

Use clear numerals for:

- quiz scores;
- marks;
- question numbers;
- dates;
- progress;
- statistics.

## 11.5 Line height

Academic content requires generous line spacing.

Avoid cramped paragraphs.

---

# 12. SPACING SYSTEM

Use an 8-point foundation with 4-point flexibility.

Recommended tokens:

```text
4
8
12
16
20
24
32
40
48
64
80
```

Do not use random spacing values throughout the application.

Spacing should create rhythm.

---

# 13. CORNER RADIUS SYSTEM

Recommended conceptual levels:

```text
Small controls: 10–12px
Inputs: 14–16px
Cards: 20–24px
Large panels: 28px
Floating navigation: 24–32px
Sheets: 30–36px
```

The radius should depend on component size.

A tiny button should not have a 32px radius unless it is deliberately pill-shaped.

---

# 14. NAVIGATION DESIGN

The bottom navigation is one of the most important visual elements.

The user's preferred interaction is:

> the selected navigation item should appear as a distinct translucent glass selection surface.

The navigation container itself should float above content.

Conceptual structure:

```text
      page content

       ╭──────────────────────────╮
       │  Home  PYQ  Quiz  Tools │
       ╰──────────────────────────╯
             floating glass
```

The selected item:

```text
╭────────╮
│  icon  │
│  Home  │
╰────────╯
```

must have:

- slightly stronger glass;
- subtle inner highlight;
- soft shadow;
- clear icon;
- smooth movement.

Do not use a solid colored rectangle.

---

# 15. NAVIGATION ANIMATION

When changing tabs:

1. selected glass capsule moves toward the new item;
2. old icon reduces emphasis;
3. new icon gains emphasis;
4. label appears or strengthens;
5. content transitions subtly.

Recommended motion:

```text
Duration: 250–380ms
Easing: spring-like / cubic-bezier
Scale: very small
Translation: restrained
```

Do not use:

- bounce;
- elastic overshoot;
- spinning;
- exaggerated zoom;
- particle effects.

---

# 16. SEARCH EXPERIENCE

Search must feel premium.

Initial state:

```text
╭────────────────────────────╮
│  🔍  Search                 │
╰────────────────────────────╯
```

When activated:

- surface expands;
- search field receives focus;
- backdrop glass strengthens;
- results appear with a short fade/slide;
- keyboard remains the primary interaction on mobile.

The animation should communicate:

> “the search surface is expanding from this control”

rather than:

> “a new page is loading.”

Search results should be grouped by type:

- PYQ;
- syllabus;
- course;
- quiz;
- resource;
- toolbox.

---

# 17. COURSE CARD SYSTEM

Course cards are high-value visual components.

They should feel like premium glass objects without becoming oversized.

Structure:

```text
┌──────────────────────────────┐
│       course thumbnail       │
│                              │
├──────────────────────────────┤
│ Course title                 │
│ Short description            │
│                              │
│ Progress              72%    │
└──────────────────────────────┘
```

The thumbnail may remain visually stronger than the glass body.

## 17.1 Course-card scroll behavior

When horizontally scrolling:

- cards may slightly scale according to distance from viewport center;
- opacity may change minimally;
- neighboring cards remain partially visible;
- no dramatic 3D rotation.

Recommended scale range:

```text
center: 1.00
near edge: 0.96–0.98
```

Do not exceed this unless testing proves it improves usability.

The user must never feel motion sickness.

---

# 18. CARD HOVER

Desktop hover:

```text
rest
↓
translateY(-2px)
↓
shadow slightly increases
↓
border highlight increases slightly
```

Do not:

- rotate the card;
- zoom dramatically;
- add glow;
- change the entire background.

---

# 19. CARD PRESS

Touch interaction:

```text
scale(0.985–0.99)
```

The press must be immediate.

Release returns smoothly.

---

# 20. BUTTON SYSTEM

Buttons must not all be glass.

Use three primary categories.

## 20.1 Primary button

A clear filled accent surface.

Use for:

- Start Quiz;
- Save;
- Submit;
- Continue;
- Publish.

## 20.2 Secondary button

Glass surface with subtle border.

## 20.3 Tertiary button

Text or icon button.

This hierarchy prevents visual overload.

---

# 21. INPUT SYSTEM

Inputs should feel like inset translucent surfaces.

States:

- default;
- hover;
- focus;
- filled;
- error;
- disabled.

Focus state must be obvious.

Recommended:

```text
subtle accent ring
+
slightly stronger glass
```

Do not rely only on color.

---

# 22. LOGIN AND REGISTRATION

Registration includes:

- name;
- email;
- contact number;
- course;
- branch;
- academic information;
- gender where required by the product flow;
- profile image;
- password/authentication fields.

The registration screen should use a clean centered glass panel.

Avoid making the entire screen one giant glass card.

Use:

```text
environment
    ↓
header
    ↓
glass form sections
    ↓
primary action
```

Validation errors should appear immediately and clearly.

---

# 23. PROFILE SYSTEM

Profile should visually combine identity and academic information.

The profile image/avatar should be prominent.

The automatically selected character system may show an appropriate character according to the configured profile attributes.

The generated character must remain tasteful and consistent.

Avoid cartoon overload.

Profile glass sections:

```text
Identity
Academic details
Progress
Saved resources
Quiz history
Settings
Developer support
```

---

# 24. DASHBOARD

The dashboard is the primary home screen.

Recommended information hierarchy:

1. greeting;
2. academic quick status;
3. continue learning;
4. important academic updates;
5. quick actions;
6. recent PYQs/resources;
7. quiz recommendation;
8. toolbox.

Do not put every feature above the fold.

The dashboard must feel breathable.

---

# 25. PYQ EXPERIENCE

PYQ browsing should prioritize information density while retaining the glass material.

Filters:

- branch;
- semester;
- subject;
- year;
- exam type.

Cards should remain easy to scan.

Each card can show:

```text
Subject
Year
Semester
Question count
Available PDF
```

Opening a PYQ should transition into the document experience rather than presenting unnecessary animation.

---

# 26. SYLLABUS EXPERIENCE

Syllabus should be hierarchical.

Recommended:

```text
Course
 ├── Semester
 │    ├── Subject
 │    │    ├── Unit 1
 │    │    ├── Unit 2
 │    │    └── Unit 3
```

Expandable sections should use restrained accordion animation.

Do not animate every row independently with large delays.

---

# 27. YEARLY CALENDAR

Calendar information must remain highly functional.

Glass can be used for:

- month selector;
- filter control;
- event cards;
- selected date;
- information sheet.

Important dates should have semantic emphasis.

Never sacrifice date readability for transparency.

---

# 28. QUIZ INTERFACE

Quiz is a major engagement feature.

Screen structure:

```text
Top:
Question progress
Timer

Center:
Question card

Bottom:
Answer options
Navigation
```

The question card may use elevated glass.

Answer options should have strong hit targets.

Selected option:

- stronger border;
- subtle accent background;
- clear state indicator.

Correct/incorrect feedback should be clear and restrained.

---

# 29. QUIZ RESULT CARD

After completion:

- score;
- percentage;
- correct answers;
- incorrect answers;
- skipped;
- time;
- performance summary.

The result should be visually suitable for a downloadable/shareable quiz card.

Do not create a social-media-style neon poster.

The downloadable quiz card should look like a premium academic certificate/result card.

---

# 30. RESOURCE UPLOAD

Students may upload resources.

The flow:

```text
Select file
↓
Enter metadata
↓
Preview
↓
Submit
↓
Pending verification
↓
Admin review
↓
Approved / rejected
↓
Published
```

The pending state must be visible to the student.

File upload progress must be clear.

The upload interface must not imply publication before verification.

---

# 31. ADMIN RESOURCE MODERATION

Admin should see:

- uploader;
- file;
- category;
- subject;
- semester;
- upload date;
- verification status;
- actions.

Actions:

- approve;
- reject;
- request correction;
- archive.

Glass should organize the workspace but not hide information.

---

# 32. DEVELOPER MESSAGING

The developer message feature is private.

A student's message must only be visible to:

- that student;
- authorized developer/admin personnel.

The UI should resemble a simple support conversation rather than a social network.

Recommended structure:

```text
Developer Support
-----------------
Previous messages

Student message
Developer reply

[ Write a message... ]
```

Unread messages can have a small indicator.

Do not add unnecessary social features.

---

# 33. STUDENT TOOLBOX

The toolbox contains 10+ practical daily-use tools.

Examples may include:

- calculator;
- percentage calculator;
- CGPA calculator;
- unit converter;
- age calculator;
- date difference;
- study timer;
- stopwatch;
- countdown;
- attendance calculator;
- GPA calculator;
- note helper.

Every tool should use the same visual language.

The toolbox home can use a grid of small glass tiles.

Avoid making every tile visually unique.

---

# 34. MODALS

Modal design:

```text
background
    ↓
soft dimming
    ↓
glass modal
```

The dimming layer must be subtle.

Modal content must have strong contrast.

Opening:

```text
opacity 0 → 1
scale 0.97 → 1
translateY 6px → 0
```

Duration:

```text
200–320ms
```

---

# 35. BOTTOM SHEETS

Bottom sheets are useful on mobile.

They should have:

- rounded top corners;
- translucent surface;
- visible drag handle;
- clear title;
- close behavior;
- safe-area support.

The sheet should not cover more content than necessary.

---

# 36. TOASTS

Toasts can use compact glass.

They should:

- appear quickly;
- remain readable;
- disappear automatically where appropriate;
- support manual dismissal for important messages.

Do not use giant notifications.

---

# 37. LOADING STATES

Loading must feel part of the material system.

Skeletons can use very subtle tonal movement.

Do not use bright flashing effects.

Example:

```text
glass surface
+
soft shimmer
+
low contrast
```

Animation must be disabled or reduced under reduced-motion settings.

---

# 38. EMPTY STATES

Empty states should explain:

1. what is empty;
2. why;
3. what the user can do next.

Example:

```text
No saved PYQs yet

Save a PYQ and it will appear here.

[ Browse PYQs ]
```

Do not use unnecessary illustrations.

---

# 39. ERROR STATES

Errors should be human-readable.

Bad:

```text
ERR_500_DATABASE
```

Better:

```text
Something went wrong

We couldn't load this resource right now.

[ Try again ]
```

Technical details can be logged separately.

---

# 40. SCROLL BEHAVIOR

Scrolling is one of the few areas where animation should be noticeable.

Allowed:

- subtle card scaling;
- sticky glass header;
- navigation depth;
- search bar compression;
- progressive header transformation.

Not allowed:

- excessive parallax;
- large rotation;
- content flying around;
- constant bouncing.

The user should remain in control.

---

# 41. HEADER TRANSFORMATION

A large dashboard header may compress when scrolling.

Initial:

```text
large title
supporting content
```

Scrolled:

```text
compact glass header
```

The transformation should be continuous.

Avoid a sudden jump.

---

# 42. GLASS DEPTH DURING SCROLL

As content passes behind a sticky glass header:

- backdrop blur remains;
- surface opacity can increase slightly;
- shadow becomes subtly stronger.

This creates physical separation.

Example conceptual behavior:

```text
at top:
opacity 0.50
shadow minimal

while scrolling:
opacity 0.68
shadow slightly stronger
```

Do not make the header opaque unless necessary for readability.

---

# 43. PAGE TRANSITIONS

Page transitions should be short.

Recommended:

```text
old content:
opacity 1 → 0.96

new content:
opacity 0.96 → 1
translateY 4px → 0
```

Duration:

```text
180–300ms
```

Do not make users wait through transitions.

---

# 44. REDUCED MOTION

The application must respect:

```css
@media (prefers-reduced-motion: reduce)
```

Under reduced motion:

- remove large transforms;
- disable parallax;
- shorten transitions;
- remove decorative movement;
- preserve functional feedback.

Glass itself does not need to disappear.

---

# 45. PERFORMANCE RULES

Backdrop blur can be expensive.

Therefore:

- do not blur huge full-screen surfaces unnecessarily;
- limit simultaneous backdrop-filter layers;
- avoid deeply nested translucent elements;
- avoid large animated blur regions;
- test on low-end Android devices;
- test with CPU throttling;
- provide fallbacks.

Potential fallback:

```css
@supports not (backdrop-filter: blur(20px)) {
  .glass {
    background: rgba(255,255,255,0.92);
  }
}
```

The fallback must remain attractive.

---

# 46. GLASS NESTING RULE

Do not create:

```text
glass
  └── glass
       └── glass
            └── glass
```

without a reason.

Deep nesting makes interfaces visually muddy.

Recommended:

```text
environment
  └── glass surface
       └── mostly solid content
```

Nested glass should be reserved for special contexts.

---

# 47. ICONOGRAPHY

Icons should be:

- simple;
- consistent;
- thin-to-medium weight;
- highly recognizable.

Do not mix unrelated icon styles.

Avoid:

- 3D icons;
- glossy emoji-like icons;
- neon icons;
- oversized decorative icons.

Icons should support information hierarchy.

---

# 48. NAVBAR ICON SELECTION

Unselected:

```text
lower emphasis
```

Selected:

```text
higher contrast
slightly stronger weight
glass capsule
```

Optional:

```text
small scale increase
```

Never use excessive bouncing.

---

# 49. SEARCH ANIMATION SPECIFICATION

Search should have three states.

## State A — Rest

Compact glass field.

## State B — Focus

Field expands.

## State C — Results

Results appear inside the expanded glass context.

Transitions must share the same origin.

This gives the interface a physically coherent feel.

---

# 50. COURSE CAROUSEL SPECIFICATION

Course carousel should support:

- touch drag;
- mouse drag where appropriate;
- trackpad;
- keyboard navigation;
- snapping.

Cards should snap cleanly.

Avoid uncontrolled momentum that causes users to lose their position.

---

# 51. MICROINTERACTIONS

Useful microinteractions:

- bookmark saved;
- quiz answer selected;
- resource uploaded;
- profile updated;
- message sent;
- course progress changed;
- filter selected.

Each should provide immediate feedback.

Feedback should be:

```text
fast
subtle
clear
reversible where possible
```

---

# 52. BOOKMARK ANIMATION

When a bookmark is saved:

```text
icon changes state
+
tiny scale response
+
optional soft highlight
```

Do not use particles.

---

# 53. QUIZ ANSWER ANIMATION

When an answer is selected:

```text
option border strengthens
+
background changes subtly
+
check indicator appears
```

No large movement.

---

# 54. UPLOAD ANIMATION

File upload:

```text
idle
↓
selected
↓
uploading
↓
uploaded
↓
pending verification
```

Progress should be communicated through:

- progress bar;
- percentage;
- state label.

Do not rely on animation alone.

---

# 55. DESIGN FOR TOUCH

Mobile hit targets must be comfortable.

Interactive controls should generally have at least approximately 44px of touch area.

Small visual icons may sit inside larger invisible hit areas.

This is essential for students using the application on phones.

---

# 56. RESPONSIVE MATERIAL BEHAVIOR

Desktop:

- more floating surfaces;
- wider layouts;
- larger spacing;
- more visible glass depth.

Tablet:

- balanced density;
- medium spacing;
- controlled card grids.

Mobile:

- fewer simultaneous surfaces;
- larger touch targets;
- simplified glass layering;
- reduced decorative background;
- optimized blur.

---

# 57. MOBILE BOTTOM NAVIGATION

The mobile navigation should remain fixed above the safe area.

Account for:

- iPhone home indicator;
- Android gesture navigation;
- browser UI;
- PWA standalone mode.

The glass navigation should not overlap important content.

Content needs bottom padding equal to navigation height plus safe-area inset.

---

# 58. PWA VISUAL BEHAVIOR

When installed as a PWA, the application should continue to feel like the same product.

The visual system must not depend on browser chrome.

Splash/loading behavior should be minimal and branded.

Do not use a long animated intro.

---

# 59. DESKTOP SIDEBAR POSSIBILITY

For larger screens, BEU BABA may use a glass sidebar.

The sidebar should follow the same material hierarchy as mobile navigation.

Selected section:

```text
stronger glass capsule
```

Unselected sections:

```text
transparent / low emphasis
```

The sidebar should not become a huge opaque panel.

---

# 60. ACCESSIBILITY

Transparency must never reduce accessibility.

Required:

- sufficient text contrast;
- visible focus state;
- keyboard navigation;
- screen-reader labels;
- accessible form errors;
- semantic buttons;
- semantic headings;
- reduced-motion support.

If the background makes text difficult to read, increase surface opacity.

Accessibility takes priority over visual purity.

---

# 61. FOCUS RING

Keyboard focus must be visible.

Example:

```css
outline: 2px solid rgba(...);
outline-offset: 3px;
```

Do not remove browser focus indicators without replacing them.

---

# 62. CONTRAST TESTING

Every important state must be tested:

- normal;
- hover;
- focus;
- selected;
- disabled;
- error;
- success.

Do not test only the default appearance.

---

# 63. CONTENT DENSITY

Glass UI can become visually busy if too much content is placed into translucent cards.

Therefore:

- use clear sections;
- limit card content;
- use typography hierarchy;
- separate major tasks;
- avoid unnecessary borders.

A glass card should have enough empty space to feel premium.

---

# 64. CARD CONTENT RULE

A card should answer:

> What is this?

> Why does it matter?

> What can I do with it?

If a card requires a long explanation, move details to the destination screen.

---

# 65. DASHBOARD GLASS HIERARCHY

Do not make every dashboard section equally elevated.

Recommended:

```text
Main action       → strongest
Continue course   → strong
Academic update   → standard
Quick actions     → standard
Secondary info    → subtle
```

This creates visual hierarchy.

---

# 66. PROFILE GLASS HIERARCHY

Profile identity should be the visual focus.

Academic details should use standard glass.

Settings should use lower emphasis.

---

# 67. QUIZ GLASS HIERARCHY

Question:

```text
elevated glass
```

Options:

```text
subtle glass
```

Selected option:

```text
accent-enhanced glass
```

Timer:

```text
compact floating glass
```

This creates hierarchy.

---

# 68. ADMIN UI

Admin screens should not look like a separate generic dashboard template.

They must share:

- typography;
- spacing;
- colors;
- glass materials;
- buttons;
- form controls.

However, admin can have higher information density.

Glass must remain functional rather than decorative.

---

# 69. ADMIN TABLES

Tables can use a mostly solid/translucent surface for readability.

Avoid applying heavy blur to every table row.

Recommended:

```text
glass table container
+
light row separators
+
solid-ish row content
```

---

# 70. FILTERS

Filters should use compact glass controls.

When opened:

```text
filter button
↓
expanded glass panel
```

Selected filters must remain obvious.

---

# 71. NOTIFICATION CENTER

Notification panel should use elevated glass.

Group:

- academic;
- quiz;
- resource;
- developer;
- system.

Unread indicator should be subtle but visible.

---

# 72. TOAST VS NOTIFICATION

Use toast for immediate feedback.

Use notification center for persistent information.

Do not turn every event into a notification.

---

# 73. DEVELOPER CONTACT

A “Contact Developer” action should be accessible from:

- profile/settings;
- support section;
- relevant error states.

It should not dominate the dashboard.

---

# 74. UPDATE COURSE/SYLLABUS REQUEST

Users may contact the developer for:

- course updates;
- syllabus corrections;
- missing PYQs;
- incorrect academic information;
- bugs;
- feature requests.

The message form should provide a category.

Example:

```text
Category:
[ Bug ]
[ Syllabus ]
[ Course ]
[ PYQ ]
[ Suggestion ]
[ Other ]
```

---

# 75. VISUAL LANGUAGE FOR STATUS

Status pills should be restrained.

Examples:

```text
Approved
Pending
Rejected
Published
Draft
```

Use subtle semantic backgrounds.

Avoid saturated pills.

---

# 76. DOWNLOADABLE QUIZ CARD

The quiz card must remain attractive outside the application.

It should contain:

- BEU BABA branding;
- student display name;
- quiz title;
- score;
- percentage;
- date;
- optional performance summary.

It should look like a premium academic result card.

Do not include unnecessary personal data.

---

# 77. RESOURCE PREVIEW

A resource preview should show:

- title;
- type;
- size;
- uploader if permitted;
- verification status;
- preview/download action.

Glass should frame the information.

---

# 78. PDF EXPERIENCE

PDF viewing is primarily functional.

The surrounding controls may use glass.

The PDF content itself should remain clean and readable.

Do not put transparent overlays over important document content.

---

# 79. IMAGE RESOURCE EXPERIENCE

Image resources should support:

- preview;
- zoom;
- download where permitted.

Use a clean light viewer.

---

# 80. ERROR RECOVERY

Every network-dependent screen should have a retry mechanism where reasonable.

The retry control should use the same button system.

Do not force users to refresh the entire application.

---

# 81. OFFLINE STATES

For PWA behavior:

```text
online
↓
offline
```

The application should clearly indicate when fresh data cannot be loaded.

Cached academic content may remain accessible when supported.

Do not pretend that unavailable data is current.

---

# 82. ANIMATION PERFORMANCE

Animations should primarily use:

```text
transform
opacity
```

Avoid expensive layout animation wherever possible.

Avoid continuously animating:

- blur;
- large shadows;
- width across huge surfaces;
- filters.

---

# 83. SPRING MOTION

Spring motion should feel physical.

It must not feel playful.

Use small movement.

Conceptually:

```text
stiffness: moderate
damping: high
mass: low-to-moderate
```

Exact values should be tuned through testing.

---

# 84. MOTION DURATION SYSTEM

Recommended:

```text
Instant feedback: 100–160ms
Small interaction: 160–220ms
Component transition: 220–320ms
Large surface transition: 300–420ms
```

Do not exceed these ranges without a strong reason.

---

# 85. EASING

Preferred:

- ease-out;
- custom cubic-bezier;
- spring.

Avoid linear animation for important UI movement.

Linear motion often looks mechanical.

---

# 86. ANIMATION STAGGER

Lists can use very small stagger values.

Example:

```text
20–40ms
```

Never create a long cascading delay for a large list.

Students need information quickly.

---

# 87. FIRST LOAD

Initial application loading must be fast.

Do not animate every component into existence.

Use:

```text
logo/brand
+
minimal loading state
```

Then show content.

---

# 88. PAGE ENTER ANIMATION

Only the major container should animate.

Do not animate:

- every text line;
- every icon;
- every card;
- every badge.

This is a common source of “AI-generated UI” appearance.

BEU BABA should avoid that.

---

# 89. PREMIUM VISUAL CHECKLIST

A screen is premium when:

- alignment is exact;
- typography is consistent;
- spacing is intentional;
- glass layers are distinct;
- shadows are subtle;
- transparency is controlled;
- animations are short;
- no visual noise exists;
- actions are obvious.

---

# 90. WHAT MAKES THE UI LOOK CHEAP

Avoid:

- excessive gradients;
- too many colors;
- huge shadows;
- thick borders;
- random rounded corners;
- inconsistent icon sizes;
- unnecessary glass;
- excessive blur;
- giant headings;
- excessive animation;
- glowing buttons;
- RGB;
- black backgrounds;
- decorative 3D objects;
- generic dashboard templates.

---

# 91. WHAT MAKES IT LOOK PREMIUM

Prioritize:

- restraint;
- whitespace;
- typography;
- material hierarchy;
- consistent motion;
- subtle highlights;
- consistent radius;
- consistent spacing;
- excellent imagery;
- purposeful interactions.

---

# 92. COMPONENT MATERIAL MAPPING

Recommended mapping:

| Component | Material |
|---|---|
| Page background | Environment |
| Main content | Base |
| Course card | Glass 02 |
| Important card | Glass 03 |
| Bottom navigation | Glass 04 |
| Floating action | Glass 04 |
| Modal | Glass 05 |
| Search expanded | Glass 03/04 |
| Input | Subtle inset glass |
| Tooltip | Elevated glass |
| Toast | Floating glass |
| Sidebar | Glass 04 |
| Table container | Standard glass |
| Quiz question | Elevated glass |
| Quiz options | Subtle glass |
| Filter panel | Elevated glass |

---

# 93. IMPLEMENTATION ARCHITECTURE

The design system must be implemented as reusable components.

Recommended structure:

```text
src/
  design-system/
    tokens/
    materials/
    typography/
    spacing/
    motion/
  components/
    glass/
    navigation/
    cards/
    forms/
    feedback/
    overlays/
  features/
    dashboard/
    pyq/
    syllabus/
    calendar/
    quiz/
    resources/
    toolbox/
    profile/
    support/
```

Do not create independent visual logic inside every page.

---

# 94. GLASS COMPONENT

Create a reusable Glass component.

Conceptual API:

```tsx
<Glass
  variant="standard"
  elevation="medium"
  interactive
>
  ...
</Glass>
```

Possible variants:

```text
subtle
standard
elevated
floating
modal
```

Possible properties:

```text
interactive
blur
border
shadow
```

But defaults should remain consistent.

---

# 95. MATERIAL COMPOSITION

A component should not manually define:

```css
background
border
backdrop-filter
box-shadow
```

everywhere.

Instead:

```tsx
<GlassCard variant="standard">
```

should obtain values from the design system.

This makes future redesign much easier.

---

# 96. TAILWIND STRATEGY

If Tailwind is used, create design tokens rather than scattering arbitrary values.

For example:

```text
glass-standard
glass-elevated
glass-floating
```

should map to centralized styles.

Avoid dozens of classes such as:

```text
bg-white/47
backdrop-blur-[23px]
border-white/63
shadow-[...]
```

throughout the codebase.

That creates maintenance problems.

---

# 97. CSS FALLBACK

Because `backdrop-filter` is not guaranteed everywhere, use a fallback.

Primary:

```css
backdrop-filter: blur(20px) saturate(125%);
```

Fallback:

```css
background: rgba(255, 255, 255, 0.9);
```

The fallback should preserve hierarchy.

---

# 98. GLASS BORDER TECHNIQUE

A premium glass edge can combine:

```text
outer border
+
inner top highlight
```

The top edge should appear slightly brighter because it catches environmental light.

Avoid making every side equally bright if it creates a sticker-like appearance.

---

# 99. SHADOW PHILOSOPHY

Shadows should communicate elevation.

Approximate hierarchy:

```text
subtle → 0–10px
standard → 10–30px
floating → 18–50px
modal → 25–70px
```

Opacity should remain low.

Avoid pure black shadows.

---

# 100. BACKGROUND LIGHTING

Ambient background lighting may use a few very large, extremely soft radial gradients.

The lighting must be:

- static or very slowly moving;
- low opacity;
- non-distracting.

Do not continuously animate large gradients.

---

# 101. OPTIONAL AMBIENT MOTION

If ambient motion is used at all, it should be almost imperceptible.

Example:

```text
very slow movement
30–60 seconds
```

But static lighting is preferable for performance.

---

# 102. VISUAL PRIORITY

Every screen should have:

```text
Primary
Secondary
Tertiary
Background
```

If everything is highlighted, nothing is highlighted.

---

# 103. INFORMATION HIERARCHY

For academic content:

```text
Subject title
↓
metadata
↓
important information
↓
action
```

Do not hide important academic details behind excessive glass.

---

# 104. RESPONSIVE TYPOGRAPHY

Typography should scale gradually.

Do not simply shrink desktop typography.

Mobile headings should remain readable and compact.

---

# 105. RESPONSIVE CARDS

Desktop:

```text
large horizontal cards / grid
```

Mobile:

```text
stacked cards
or horizontal carousel
```

Do not compress desktop cards until text becomes unreadable.

---

# 106. DESKTOP HOVER VS MOBILE TOUCH

Hover-only effects must never contain critical information.

Mobile users must receive equivalent feedback through press/focus states.

---

# 107. GLASS NAVIGATION ACCESSIBILITY

The selected navigation item must be identifiable through:

- shape;
- icon state;
- text;
- contrast.

Do not depend only on a slight background change.

---

# 108. GLASS SEARCH ACCESSIBILITY

Placeholder text must not be the only indication.

Use:

```text
aria-label="Search BEU BABA"
```

and visible context where appropriate.

---

# 109. FORM ACCESSIBILITY

Every input requires:

- label;
- accessible name;
- validation;
- error messaging;
- focus state.

Floating glass labels should not replace semantic labels.

---

# 110. FILE UPLOAD ACCESSIBILITY

Upload controls must support:

- keyboard;
- clear file type information;
- file size limits;
- upload state;
- error state.

---

# 111. QUIZ ACCESSIBILITY

Questions and answers must be navigable using keyboard where desktop use is supported.

Answer state must not depend solely on color.

---

# 112. COLORBLIND SAFETY

Semantic states should use:

```text
color
+
icon
+
text
```

Example:

```text
✓ Approved
! Pending
× Rejected
```

---

# 113. CONTENT SECURITY VISUALIZATION

When displaying user-uploaded resources, clearly indicate verification status.

Example:

```text
Verified resource
```

Only authorized/admin-verified content should receive a trusted badge.

---

# 114. TRUST INDICATORS

Trust should be communicated through:

- verified status;
- official content labels;
- clear source information;
- update date;
- admin verification.

Do not use fake “official-looking” badges without meaning.

---

# 115. EMPTY RESOURCE LIBRARY

The empty resource screen should encourage contribution:

```text
No resources yet

Be the first student to contribute useful study material.

[ Upload Resource ]
```

The upload action should explain that content requires verification.

---

# 116. QUIZ EMPTY STATE

```text
No quizzes available

New quizzes will appear here when published.

[ Explore Courses ]
```

---

# 117. SEARCH EMPTY STATE

```text
No results found

Try another subject, semester, or keyword.
```

---

# 118. MESSAGE EMPTY STATE

```text
No messages yet

Need help with a course, syllabus, PYQ, or bug?

[ Contact Developer ]
```

---

# 119. SETTINGS

Settings should use grouped sections.

Possible groups:

```text
Account
Appearance
Notifications
Privacy
Downloads
Support
About
```

Even if only some settings exist initially, the structure should be scalable.

---

# 120. APPEARANCE SETTING

Because the primary design direction is light glass, the product should not automatically introduce dark mode merely because it is technically possible.

If dark mode is eventually added, it must be separately designed.

Do not create an inverted dark theme by simply changing white to black.

---

# 121. NOTIFICATION SETTINGS

Users should be able to control categories where supported.

Examples:

- academic updates;
- quiz notifications;
- resource updates;
- developer replies.

The UI remains glass-based but simple.

---

# 122. PRIVACY SETTINGS

Privacy UI should be clear.

Explain:

- what information is stored;
- who can see it;
- what profile information is public;
- how uploaded resources are handled.

Do not bury privacy information inside decorative UI.

---

# 123. DEVELOPER PROFILE

Developer information can be shown in an About/Developer section.

The visual treatment should remain academic and professional.

Avoid a flashy developer portfolio inside the student app.

---

# 124. BRANDING

BEU BABA logo/wordmark must remain clear.

Do not place the logo inside excessive glow.

A clean logo on glass is more premium than a glowing logo.

---

# 125. APP ICON

The app icon should remain visually independent from the glass UI.

It can use:

- BEU BABA initials;
- academic symbol;
- clean geometric mark.

Avoid RGB and black-heavy icon treatment.

---

# 126. SPLASH SCREEN

Use:

```text
light background
+
BEU BABA logo
+
minimal fade
```

Keep it brief.

---

# 127. NOTIFICATION VISUALS

Notifications should not visually overwhelm the interface.

Use small indicators.

Examples:

```text
●
```

or compact count badges.

Avoid huge red circles.

---

# 128. BADGE SYSTEM

Badges should communicate concise information.

Examples:

```text
New
Updated
Verified
Pending
```

Use semantic styling.

---

# 129. PROGRESS BAR

Progress should use a clean track and restrained accent.

For course progress:

```text
0% ───────────── 100%
        █████
```

Avoid gradients unless they are extremely subtle and part of the established brand.

---

# 130. SLIDERS

Sliders should have:

- clear track;
- clear thumb;
- accessible focus;
- touch-friendly size.

Glass can frame the control but should not obscure the track.

---

# 131. TOGGLE

Toggles should have obvious on/off states.

Animation should be short.

Do not use glowing switches.

---

# 132. SEGMENTED CONTROL

Useful for:

- Semester;
- All / Saved;
- Daily / Weekly;
- categories.

Selected segment should use the same glass selection philosophy as navigation.

---

# 133. TAB SYSTEM

Tabs should have:

- clear active state;
- optional moving indicator;
- smooth transition;
- horizontal scrolling when required.

Do not animate content unnecessarily.

---

# 134. ACCORDION

Syllabus and FAQ can use accordions.

Animation:

```text
height/clip
+
opacity
```

Keep duration around 200–300ms.

---

# 135. LISTS

Lists should not turn every row into a floating glass card.

Instead:

```text
glass container
+
clean rows
+
subtle separators
```

This looks more premium and is easier to scan.

---

# 136. DATA TABLES

Admin tables should prioritize:

- sorting;
- filtering;
- pagination;
- readability.

Material effects must remain secondary.

---

# 137. MOBILE ADMIN

If admin access is supported on mobile, simplify tables into cards.

Do not squeeze a desktop table into a tiny screen.

---

# 138. DESIGN TOKEN GOVERNANCE

All visual values must have ownership.

Recommended token groups:

```text
color
spacing
radius
shadow
glass
motion
typography
z-index
breakpoints
```

A change to the design system should propagate globally.

---

# 139. Z-INDEX SYSTEM

Use semantic layers:

```text
base
content
sticky
navigation
floating
overlay
modal
toast
```

Avoid random z-index values such as:

```text
999999
9999999
```

throughout the codebase.

---

# 140. OVERLAY BLUR

Modal background may use slight blur/dimming.

Do not blur the entire page excessively.

The user should still understand where the modal came from.

---

# 141. SHEET DISMISSAL

Bottom sheets should support:

- close button;
- outside tap where appropriate;
- swipe down on mobile;
- Escape on desktop.

Do not make dismissal ambiguous.

---

# 142. TOUCH FEEDBACK

Touch feedback must happen quickly.

Use:

```text
scale
+
surface change
```

Do not delay the visual response until an API request finishes.

---

# 143. ASYNC ACTION FEEDBACK

For actions requiring server processing:

```text
pressed
↓
loading
↓
success/error
```

Disable duplicate submission where necessary.

---

# 144. SUCCESS FEEDBACK

Success should be calm.

Example:

```text
✓ Resource submitted

Your resource is now waiting for verification.
```

This is better than a large animated celebration.

---

# 145. ERROR FEEDBACK

Errors should explain next steps.

Example:

```text
Upload failed

The file could not be uploaded. Check your connection and try again.

[ Retry ]
```

---

# 146. NETWORK LATENCY

Do not make the UI feel frozen while waiting for APIs.

Use optimistic UI only where data consistency permits.

For example, bookmark state may update immediately and synchronize in the background.

---

# 147. SKELETON MATERIAL

Skeletons should match the final layout.

This prevents layout shift.

Skeleton animation should be subtle.

---

# 148. LAYOUT STABILITY

Reserve space for:

- images;
- course thumbnails;
- profile avatars;
- navigation;
- banners.

Avoid content jumping when images load.

---

# 149. IMAGE TREATMENT

Images should use consistent:

- aspect ratios;
- radius;
- cropping;
- object positioning.

Do not randomly crop academic thumbnails.

---

# 150. COURSE THUMBNAILS

Course thumbnails can have a slightly stronger visual identity than the glass card.

Recommended:

```text
thumbnail
+
soft radius
+
clean title overlay only if required
```

Do not place too much text over thumbnails.

---

# 151. IMAGE OVERLAY

If text is placed over an image, use a subtle gradient or separate glass layer for readability.

Do not use thick black overlays.

---

# 152. AVATAR

Avatar should remain clear against the environment.

A thin glass ring may be used.

Do not add glowing rings.

---

# 153. PROFILE CHARACTER

Generated profile characters should fit inside the same visual frame.

Character backgrounds should be neutral or transparent where possible.

The character must not clash with the light glass interface.

---

# 154. VISUAL CONSISTENCY OF GENERATED CHARACTERS

If male/female character variants exist, their:

- lighting;
- illustration style;
- scale;
- framing;
- quality

must be consistent.

Do not mix unrelated art styles.

---

# 155. ACADEMIC BRAND TONE

The interface should feel:

```text
modern student companion
+
academic utility
+
premium software
```

Not:

```text
gaming app
+
AI laboratory
+
crypto dashboard
```

---

# 156. DO NOT OVERUSE PASTEL COLORS

Soft colors can be used in the environment.

But excessive pastel cards create a childish appearance.

Keep most UI surfaces neutral glass.

---

# 157. GLASS + WHITE SPACE

Glass works best when surrounded by empty space.

Do not pack cards edge-to-edge.

Allow the environment to show around surfaces.

---

# 158. VISUAL RHYTHM

A screen should alternate between:

```text
content
space
content
space
```

This gives the interface a premium rhythm.

---

# 159. CARD GRID

Cards should align perfectly.

Grid:

```text
same width
same radius
same spacing
same baseline
```

unless a deliberate featured-card layout is used.

---

# 160. FEATURED CARD

A featured course can be larger.

It should still use the same material system.

Do not create a completely different design language.

---

# 161. GLASS CONTAINER WIDTH

Large glass surfaces should not stretch unnecessarily across the entire desktop.

Use maximum content width.

Example conceptual range:

```text
max-width: 1200–1440px
```

depending on layout.

---

# 162. MOBILE CONTENT WIDTH

Mobile content should use comfortable side padding.

Typical starting point:

```text
16–20px
```

Tune according to device width.

---

# 163. DESKTOP CONTENT WIDTH

Use centered content.

Avoid extremely wide paragraphs.

Academic reading width should remain comfortable.

---

# 164. READING EXPERIENCE

For notes and syllabus explanations:

- line length should be controlled;
- body text should be readable;
- headings should be distinct;
- links should be obvious;
- important terms can be highlighted.

Glass should not dominate reading content.

---

# 165. LONG DOCUMENT VIEW

When displaying long content:

Use a stable reading surface.

Do not animate the entire page based on scroll.

---

# 166. QUIZ TIMER

Timer should be visible but not alarming by default.

As time becomes critical, semantic warning styling can increase.

Do not flash continuously.

---

# 167. QUIZ NAVIGATION

Question navigation may use small numbered glass buttons.

States:

```text
unvisited
answered
marked
current
```

Use shape and text as well as color.

---

# 168. QUIZ REVIEW

Before submission:

```text
Answered: 18
Unanswered: 2
Marked: 1
```

Use a clean glass summary panel.

---

# 169. QUIZ SUBMISSION

Confirmation should clearly state:

> Are you sure you want to submit?

Show unresolved questions.

Avoid accidental submission.

---

# 170. QUIZ RESULTS MOTION

Result reveal can use a restrained sequence:

```text
result panel
↓
score appears
↓
secondary statistics
↓
actions
```

Avoid confetti unless explicitly desired and only for an optional celebratory mode.

The default BEU BABA experience should remain professional.

---

# 171. RESOURCE MODERATION VISUALS

Pending resources should clearly show:

```text
Pending verification
```

Approved:

```text
Verified
```

Rejected:

```text
Needs correction / Rejected
```

These states must be consistent across student and admin screens.

---

# 172. SEARCH INDEX PRESENTATION

Search results should visually prioritize:

```text
title
category
metadata
action
```

Do not display irrelevant technical metadata.

---

# 173. RECENT SEARCHES

If implemented, recent searches can use subtle glass rows.

Provide a clear “Clear” action.

---

# 174. FAVORITES/SAVED

Saved content should be accessible from a clear location.

Bookmark state should be consistent everywhere.

---

# 175. OFFLINE SAVED CONTENT

If content is cached for offline use, indicate:

```text
Available offline
```

Do not imply every resource is offline-ready.

---

# 176. UPDATE INDICATORS

When academic content changes:

```text
Updated
```

may appear briefly.

The system should avoid permanently cluttering cards with update labels.

---

# 177. VERSIONED CONTENT

Syllabus and calendar changes should display update information when important.

Example:

```text
Updated Aug 2026
```

This improves trust.

---

# 178. ACADEMIC CORRECTION FLOW

If a student reports incorrect syllabus/PYQ information:

```text
content
↓
Report issue
↓
category
↓
message
↓
developer/admin review
```

The UI should make this process straightforward.

---

# 179. SUPPORT TICKET FEEL WITHOUT COMPLEXITY

The developer messaging system can internally categorize conversations without exposing a complicated ticketing interface.

Student experience should remain simple.

---

# 180. PRIVACY UI

Never visually expose private messages in public/shared views.

Do not include private content in downloadable cards.

---

# 181. PROFILE DATA DISPLAY

Student data shown in profile should be grouped.

For example:

```text
Personal
Name
Email
Contact

Academic
Course
Branch
Semester
```

Avoid showing all data in one dense paragraph.

---

# 182. ADMIN STUDENT PROFILE

Admin can have a more detailed student view.

However, private information should only be accessible to authorized personnel.

---

# 183. ADMIN VISUAL DENSITY

Admin can use:

- compact cards;
- tables;
- filters;
- side panels.

The glass effect should remain subtle enough that large datasets remain readable.

---

# 184. SECURITY SHOULD NOT DEPEND ON UI

A hidden UI element is not a security mechanism.

Private developer messages, student data, and admin actions must be protected at the backend/database/storage layer.

The design system only communicates access state visually.

---

# 185. AUTHENTICATION STATES

Login screen:

```text
welcome
credentials
action
support
```

Registration:

```text
identity
academic information
profile
authentication
```

Avoid one giant endlessly scrolling glass form when possible.

Use sections or steps.

---

# 186. MULTI-STEP REGISTRATION

If registration becomes long, use steps.

Example:

```text
1 Personal
2 Academic
3 Profile
4 Account
```

Progress indicator should be subtle.

Do not force users through unnecessary steps.

---

# 187. FORM AUTOSAVE

If supported, clearly show:

```text
Saved
```

using a tiny status indicator.

Do not use distracting animations.

---

# 188. SESSION STATES

When session expires:

Use a clean modal:

```text
Your session has expired.

Please sign in again.
```

Do not abruptly dump users onto a generic error page.

---

# 189. CONTENT LOADING

When a page requires multiple data sources, avoid showing many unrelated spinners.

Prefer:

```text
layout skeleton
```

or independent section loading only where necessary.

---

# 190. DATA ERROR ISOLATION

If one dashboard section fails, do not necessarily destroy the whole dashboard.

Example:

```text
Courses loaded
PYQs loaded
Calendar failed → Retry
```

This feels significantly more professional.

---

# 191. COMPONENT STATES

Every reusable component should define:

```text
default
hover
focus
pressed
selected
disabled
loading
success
error
empty
```

Not every component requires every state, but state behavior must be intentional.

---

# 192. GLASS COMPONENT ACCEPTANCE CRITERIA

A glass component passes visual QA only if:

- background remains subtly visible;
- text is readable;
- border is visible but not thick;
- shadow is soft;
- material feels elevated;
- component does not look like a white opaque card;
- component does not look like a dark glass card;
- component does not use RGB/neon;
- blur does not cause performance problems.

---

# 193. NAVIGATION ACCEPTANCE CRITERIA

Navigation passes if:

- selected state is immediately obvious;
- selected glass moves smoothly;
- touch target is comfortable;
- content remains visible;
- safe-area spacing works;
- no excessive animation occurs.

---

# 194. COURSE CARD ACCEPTANCE CRITERIA

Pass conditions:

- readable title;
- clear thumbnail;
- useful metadata;
- consistent radius;
- subtle glass depth;
- smooth press/hover;
- good mobile behavior;
- no excessive 3D movement.

---

# 195. SEARCH ACCEPTANCE CRITERIA

Pass conditions:

- focus is immediate;
- expansion feels natural;
- keyboard works;
- results are categorized;
- empty state exists;
- loading state exists;
- errors can be retried.

---

# 196. QUIZ ACCEPTANCE CRITERIA

Pass conditions:

- question is dominant;
- options are easy to tap;
- current state is clear;
- timer is readable;
- submission is protected;
- results are understandable;
- downloadable result card works.

---

# 197. RESOURCE ACCEPTANCE CRITERIA

Pass conditions:

- upload progress visible;
- metadata clear;
- pending state clear;
- admin verification state clear;
- errors recoverable;
- private/unapproved resources cannot be visually or functionally treated as published.

---

# 198. DEVELOPER MESSAGE ACCEPTANCE CRITERIA

Pass conditions:

- private conversation is clear;
- sender identity is obvious;
- reply status is clear;
- unread state is visible;
- message sending feedback exists;
- only authorized participants can access the conversation.

---

# 199. PERFORMANCE ACCEPTANCE CRITERIA

Test on:

- modern desktop;
- mid-range Android;
- low-end Android;
- iPhone-class mobile browser/PWA;
- slow network;
- offline;
- reduced motion.

Glass must degrade gracefully.

---

# 200. VISUAL REGRESSION

The project should maintain screenshots for major screens:

- login;
- signup;
- home;
- course list;
- course detail;
- PYQ;
- syllabus;
- calendar;
- quiz;
- result;
- resources;
- upload;
- toolbox;
- profile;
- developer chat;
- admin dashboard.

Any significant design-system change should be reviewed against these screenshots.

---

# 201. DESIGN REVIEW PROCESS

Before a component is accepted:

1. review desktop;
2. review mobile;
3. test light environment;
4. test with long content;
5. test loading;
6. test errors;
7. test accessibility;
8. test reduced motion;
9. test performance;
10. compare against design tokens.

---

# 202. “DO NOT” MASTER LIST

Never introduce the following without explicit design approval:

- black glass;
- dark neon UI;
- RGB borders;
- glowing neon buttons;
- cyberpunk backgrounds;
- AI brains;
- holographic grids;
- random 3D floating objects;
- giant animated spheres;
- excessive particles;
- rainbow gradients;
- excessive glass layers;
- excessive blur;
- giant shadows;
- glass text with poor contrast;
- long page transitions;
- constant card rotation;
- unnecessary parallax;
- excessive bounce;
- animated gradients everywhere.

---

# 203. VISUAL QUALITY TARGET

The final application should make a user think:

> “This feels like a polished premium mobile product.”

It should not make the user think:

> “This is a template with some glass effects.”

That distinction is critical.

---

# 204. PRODUCT FEEL

The product should feel similar in *quality principles* to high-end platform interfaces:

- coherent materials;
- strong typography;
- precise spacing;
- fluid transitions;
- clear hierarchy;
- restrained color.

It should remain uniquely BEU BABA.

---

# 205. DESIGN SYSTEM EXTENSIBILITY

The system must support future features without redesigning the entire product.

Potential future features:

- attendance;
- notices;
- exam reminders;
- study plans;
- bookmarks;
- personalized recommendations;
- faculty information;
- event calendar;
- announcements;
- assignment tracker.

New features must consume existing materials and tokens.

---

# 206. DESIGN TOKEN CHANGE POLICY

If a developer wants to change:

- glass opacity;
- blur;
- radius;
- shadow;
- accent;
- typography;

they should change the token rather than individual components.

This protects consistency.

---

# 207. NO COMPONENT-SPECIFIC CHAOS

Avoid:

```text
CourseCard → blur 18
QuizCard → blur 23
PYQCard → blur 16
CalendarCard → blur 27
```

unless there is a documented material reason.

Prefer:

```text
standard → same material
elevated → same material
floating → same material
```

---

# 208. DESIGN SYSTEM NAMING

Use semantic names.

Good:

```text
glass-standard
glass-elevated
glass-floating
text-primary
text-secondary
surface-base
```

Bad:

```text
white-card-2
new-glass-final
blue-box-new
card-style-7
```

---

# 209. FIGMA / DESIGN HANDOFF

If designs are created in Figma, tokens should be represented there as well.

Required:

- colors;
- typography;
- spacing;
- radius;
- shadows;
- materials;
- motion notes;
- responsive variants.

The developer should not need to guess visual values.

---

# 210. COMPONENT DOCUMENTATION

Every major component should document:

```text
Purpose
Variants
States
Accessibility
Responsive behavior
Motion
Usage examples
Do not use when
```

---

# 211. DESIGN QA CHECKLIST

Before release:

### Visual

- [ ] Light theme
- [ ] Transparent glass
- [ ] Subtle background
- [ ] No black glass
- [ ] No RGB
- [ ] No neon
- [ ] No unnecessary 3D
- [ ] Consistent radius
- [ ] Consistent spacing
- [ ] Correct typography
- [ ] Correct shadows

### Motion

- [ ] Navigation transition
- [ ] Search expansion
- [ ] Course scroll animation
- [ ] Button press
- [ ] Modal transition
- [ ] Sheet transition
- [ ] Reduced motion

### Responsive

- [ ] Mobile
- [ ] Tablet
- [ ] Desktop
- [ ] Safe area
- [ ] PWA

### Accessibility

- [ ] Contrast
- [ ] Keyboard
- [ ] Focus
- [ ] Labels
- [ ] Screen reader
- [ ] Reduced motion

### Performance

- [ ] Blur tested
- [ ] Scroll tested
- [ ] Low-end Android tested
- [ ] Large lists tested
- [ ] Image loading tested
- [ ] Offline tested

---

# 212. FINAL VISUAL ACCEPTANCE TEST

Ask a reviewer to inspect the application for 30 seconds without explaining the design.

The reviewer should identify:

- what screen they are on;
- the main action;
- navigation;
- important content;
- selected state.

If they cannot, the visual design has become too decorative.

---

# 213. GLASS PURITY TEST

Take a screenshot.

Ask:

> Does the interface look like translucent material or simply white cards?

If it looks like ordinary white cards:

- increase environmental visibility slightly;
- refine blur;
- refine border highlight;
- improve depth.

If it looks too transparent:

- increase surface opacity;
- simplify background;
- increase text contrast.

---

# 214. NOISE TEST

Blur your eyes or step back from the screenshot.

The major hierarchy should remain obvious.

If all cards look equally strong:

> reduce material variation.

If nothing looks elevated:

> strengthen floating/elevated material slightly.

---

# 215. PREMIUM TEST

Ask:

- Is anything unnecessarily glowing?
- Is anything unnecessarily moving?
- Is there unnecessary color?
- Are shadows too strong?
- Are cards too rounded?
- Is the background distracting?
- Does typography look intentional?
- Does every animation communicate something?

If unnecessary effects exist, remove them.

---

# 216. FINAL MATERIAL RECIPE

The default BEU BABA glass recipe should be approximately:

```text
LIGHT ENVIRONMENT
+
SUBTLE AMBIENT LIGHT
+
TRANSLUCENT WHITE SURFACE
+
BACKDROP BLUR
+
SLIGHT SATURATION
+
THIN LIGHT BORDER
+
INNER TOP HIGHLIGHT
+
SOFT COOL SHADOW
+
EXCELLENT TYPOGRAPHY
+
RESTRAINED MOTION
```

This combination should be repeated consistently.

---

# 217. THE MOST IMPORTANT RULE

Do not chase the appearance of glass by adding more effects.

Instead:

```text
Better environment
+
better material
+
better hierarchy
+
better typography
+
better motion
=
premium interface
```

---

# 218. IMPLEMENTATION PRIORITY

When coding the design system, implement in this order:

```text
1. Global environment
2. Color tokens
3. Typography tokens
4. Spacing
5. Radius
6. Shadow
7. Glass materials
8. Buttons
9. Inputs
10. Cards
11. Navigation
12. Search
13. Modals
14. Bottom sheets
15. Motion system
16. Responsive behavior
17. Accessibility
18. Performance fallback
```

Do not build individual screens first and attempt to standardize later.

---

# 219. DEVELOPER IMPLEMENTATION RULE

Before writing a new UI component, ask:

> Does an existing design-system component already solve this?

If yes, reuse it.

If not, determine whether a new reusable component is justified.

Do not create one-off visual styles.

---

# 220. FINAL DESIGN DIRECTION

BEU BABA should ultimately look like a **bright, premium, translucent academic operating environment**.

The visual identity is:

```text
Light
Transparent
Soft
Precise
Minimal
Tactile
Academic
Professional
Apple-inspired
Modern
Fast
```

It is explicitly not:

```text
Dark
Black
RGB
Neon
Cyberpunk
AI-themed
Gaming
Over-3D
Over-animated
Visually noisy
```

The application should use glass as a material, not as decoration.

The final objective is not to make every screen look “fancy.”

The objective is to make every interaction feel **intentional, polished, calm, and premium**.

---

# 221. MASTER DESIGN SYSTEM SUMMARY

```text
BEU BABA
│
├── LIGHT ENVIRONMENT
│   ├── warm/cool neutral base
│   ├── subtle ambient lighting
│   └── no decorative 3D
│
├── GLASS MATERIAL
│   ├── translucent white
│   ├── backdrop blur
│   ├── subtle saturation
│   ├── thin highlight border
│   ├── inner highlight
│   └── soft shadow
│
├── NAVIGATION
│   ├── floating glass
│   ├── moving selected capsule
│   └── restrained spring motion
│
├── SEARCH
│   ├── compact glass
│   ├── expanding focus state
│   └── categorized results
│
├── COURSES
│   ├── premium cards
│   ├── controlled horizontal scroll
│   └── subtle scale motion
│
├── ACADEMIC
│   ├── PYQ
│   ├── syllabus
│   ├── yearly calendar
│   └── courses
│
├── ENGAGEMENT
│   ├── quiz
│   ├── result card
│   └── progress
│
├── COMMUNITY
│   ├── resource contribution
│   └── private developer support
│
├── UTILITY
│   └── student toolbox
│
└── QUALITY
    ├── accessibility
    ├── responsive
    ├── PWA
    ├── performance
    ├── testing
    └── visual regression
```

---

# 222. RELEASE GATE FOR VISUAL DESIGN

The visual system is production-ready only when all of the following are true:

- [ ] Light theme is the true default.
- [ ] Glass surfaces are genuinely translucent.
- [ ] Background is visible subtly through glass.
- [ ] Blur is controlled.
- [ ] Text remains highly readable.
- [ ] No black-glass dependency exists.
- [ ] No RGB/neon theme exists.
- [ ] No unnecessary AI-style background exists.
- [ ] No unnecessary 3D objects exist.
- [ ] Bottom navigation has premium selected-glass behavior.
- [ ] Search has smooth expansion animation.
- [ ] Course cards have restrained scroll animation.
- [ ] Major interactions have tactile feedback.
- [ ] Motion respects reduced-motion preferences.
- [ ] Mobile performance is acceptable.
- [ ] Desktop presentation is polished.
- [ ] Fallback exists where backdrop blur is unsupported.
- [ ] Components use shared tokens.
- [ ] Screens do not contain arbitrary visual values.
- [ ] Accessibility requirements pass.
- [ ] Visual regression screenshots are approved.

---

# 223. FINAL PRINCIPLE

The most important instruction for every future BEU BABA developer, designer, or AI coding agent is:

> **Do not add an effect simply because it is technically possible. Add it only when it improves hierarchy, usability, depth, or feedback.**

The glass must remain:

**transparent, light, subtle, readable, and physically believable.**

The animations must remain:

**short, smooth, purposeful, and restrained.**

The background must remain:

**bright, calm, and nearly invisible.**

The overall product must remain:

**BEU BABA first — premium glass second.**

This is the visual foundation against which every future BEU BABA screen and component should be evaluated.
