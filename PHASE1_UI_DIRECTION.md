# PHASE1_UI_DIRECTION.md — binding design decisions (record)

**Date:** 2026-09-04 · **Phase:** 1 (Foundation / Design System) · **Status:** COMPLETE
**Authority:** owner's custom Phase 1 UI direction (2026-09-04) + blueprint v2.0 §5/§45/§50.
Reference images were visual inspiration ONLY; product is BEU BABA (zero StudyHub references — verified by grep).

## 1. Themes (both fully tokenized)
- Single source of truth: CSS variables in `src/index.css`. `:root` = light
  (soft WHITE neumorphism + frosted glass), `[data-theme='dark']` = soft DARK
  neumorphism (deep charcoals `#20242e/#262b36/#2c313d`, never pure black, no neon/RGB).
- `src/app/providers/ThemeProvider.tsx` + `themeContext.ts`: persisted choice
  (`localStorage['beubaba:theme']`), follows OS until the user chooses; inline script in
  `index.html` applies the theme BEFORE first paint (no flash); meta theme-color synced.
- Toggle: `ThemeToggle` (Sun/Moon Lucide, cross-fade) in the header at ALL breakpoints.
- Tailwind `darkMode: ['class','[data-theme="dark"]']` registered for structural dark tweaks;
  colors themselves always come from variables.

## 2. Material system
- **Glass** (5 levels) stays for floating chrome: header, bottom nav, modals, sheets, toasts.
- **Neumorphism** added for content surfaces: tokens `--neu-hi/--neu-lo/--neu-surface` and
  shadow levels `--neu-sm/md/lg`, `--neu-inset(-sm)`; utilities `.neu .neu-sm .neu-lg
  .neu-inset .neu-inset-sm .neu-press`; Tailwind shadows `shadow-neu*`.
- `Card as="neu"`, `Button variant="soft"`, `.input-neu` (inset search wells/fields),
  `.nav-pill` (desktop nav; active = accent-soft + inset well).
- Interactive feel: `.liquid-depth` (glass) and `.neu-press` (neu) — press = settle, no bounce.

## 3. Typography (CF-1 RESOLVED)
- KEEP self-hosted **Sora (display) + Plus Jakarta Sans (body)** — already loaded offline,
  premium and readable; reference's Poppins was inspiration only. Scale tokens unchanged.

## 4. Navigation & layout (CF-2/CF-4 addressed)
- `navItems.ts` = single source for primary destinations (Home/Study/Quiz/Tools/Profile).
- Desktop (md+): fixed glass **header** carries brand + nav pills + search/theme/bell/avatar.
  Bottom nav is `md:hidden` → no duplicated navigation.
- Mobile: compact branded header (brand + search/theme/bell) + existing notched wave bottom nav.
- Shell width: `max-w-2xl` (phone) → `lg:max-w-shell` (72rem) → `xl:max-w-shell-lg` (80rem);
  header height token `--header-h` 56px/64px; AppLayout offsets use it.
- Home = two-column dashboard at lg+ (main + 336/368px right rail: Upcoming, Jump back in,
  brand card). No permanent sidebar — header nav owns navigation (owner: "do not duplicate").

## 5. Icons
- Functional chrome keeps **Lucide** line icons.
- Existing PNG soft-3D family (`AppIcon`, /assets/icons) kept for current features.
- NEW `Icon3D.tsx`: inline-SVG soft-3D family (shared squircle tile + top-light + bottom-depth)
  for categories without PNGs: courses, resources, progress, profile, notifications, search,
  notes, exams, assistant, revision, mathmind, focus, ocr, translator. Works on both themes.
- **No emoji as UI icons** (verified by scan). Greeting uses Lucide time-of-day glyphs.

## 6. Branding
- `LogoMark` is theme-aware via `--logo-*` tokens; `Wordmark` = BEU (ink) + BABA (violet).
- Owner-provided mascot saved at `public/assets/brand-mascot.png`, used ONLY as static brand
  identity on the Home brand card (chatbot behaviour is Phase 9 — not implemented).

## 7. Data-integrity fixes made inside Phase 1 (owner standing policy)
- `seed_content.ts`: SEED_NOTICES / SEED_EVENTS → **empty** (fabricated notices removed).
- `seed_calendar.ts`: SEED_ACADEMIC_EVENTS → **empty** (invented BEU 2026 dates removed).
- `notificationService.seedFor`: only the honest "Welcome" notification remains.
- Empty states are production-spec; services/types/queries stay wired for real CMS data.
- ⛔ Still BLOCKED on real BEU calendar + notices (Phase 4/11).

## 8. Theme-hostile hardcodes eliminated
- All `bg-white/xx`, `border-white/xx`, `ring-white` replaced by tokens
  (`bg-chip`, `bg-chip-strong`, `border-[var(--glass-border*)]`, `ring-canvas`) across ~20 files.
- BottomNav wave fill/stroke/drop-shadow now `--nav-fill/--nav-stroke/--nav-drop`.

## 9. Verification evidence
- `npm run build` exit 0 · `npm run lint` 0 errors (7 pre-existing warnings).
- Real-browser screenshots: `/home/user/phase1_shots/` (home light/dark desktop + mobile,
  quiz desktop dark) via Playwright headless chromium (installed in /tmp, not workspace).
- Prohibited-pattern scan: no dark-first neon/RGB/3D-particles/emoji-icons introduced.

## 10. NOT implemented (later phases)
MCQ import (6) · chatbot/mascot behaviour (9) · Math Mind/revision/focus games (8) ·
Admin CMS (10) · OCR/Translator tools (7) · PDF result (5) · Web Push (13) ·
Supabase live integration (2, ⛔ credentials) · font-family change (rejected, see §3).

## v2 addendum (2026-09-04): reference-matched kid-app redesign
- Icon system = TRUE 3D clay renders (48 PNGs, /assets/icons3d), image-based AppIcon; no emoji, no neon; StudyHub branding unchanged.
- Rounded display face Baloo 2 Var for headings/hero/nav; Noto Sans Devanagari Var for Hindi lines (onboarding bilingual).
- Surfaces: pastel gradient tiles (bb-tile-*), gradient heroes (bb-hero*), circular soft buttons, floating rounded bottom nav, bb-chip pills. All theme-token driven; dark mode = deep toned variants, never pure black.
- Onboarding: 3 bilingual slides, once per browser (beubaba:onboarded).
