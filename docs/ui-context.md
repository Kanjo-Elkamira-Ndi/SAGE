# SAGE — UI Context & Design System

## 1. Design Brief (from client)

> "Clean and professional design. Primary: Royal Blue for nav bar, buttons, and main headings. Secondary: White for background. Accent: Gold for highlights — notifications, progress indicators, important icons, achievement badges. Text: Dark Grey for readability."

The client explicitly said they're "not good with colours" and asked us to improvise — the palette below honors their four described roles exactly, but refines the raw color names into a full, accessible, professional token system so it doesn't end up looking like a default Bootstrap theme.

## 2. Color Palette (Final)

### Primary — Royal Blue
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#1E3A8A` | Nav bar background, primary buttons, main headings, active nav state |
| `--color-primary-hover` | `#16306F` | Button/link hover state |
| `--color-primary-light` | `#3B5FCC` | Secondary emphasis, links on white background (better contrast than the deep shade for body-text links) |
| `--color-primary-subtle` | `#EEF2FF` | Light tinted backgrounds — selected rows, info banners, hover backgrounds on cards |

> Rationale: pure "royal blue" (`#4169E1`) is vivid but a touch light for large nav-bar fills against white content — text/icons on it can feel low-contrast at a glance. `#1E3A8A` keeps the same blue family but is deep enough for strong white-text contrast (WCAG AA+ for white text at this shade), while `#3B5FCC` gives you a true "royal blue" moment for links and lighter accents.

### Secondary — White / Neutral Backgrounds
| Token | Hex | Usage |
|---|---|---|
| `--color-background` | `#FFFFFF` | Page background |
| `--color-surface` | `#F8F9FB` | Card backgrounds, section alternation (very subtle off-white, avoids flat white-on-white edges) |
| `--color-border` | `#E4E7EC` | Dividers, card borders, table lines |

### Accent — Gold
| Token | Hex | Usage |
|---|---|---|
| `--color-accent` | `#D4A017` | Notification badges, progress bar fill, achievement badges, important icon highlights |
| `--color-accent-hover` | `#B8890F` | Hover/pressed state on gold elements |
| `--color-accent-subtle` | `#FBF3DD` | Background wash behind gold badges/callouts so gold-on-white doesn't feel like a random sticker |

> Rationale: a pure bright gold/yellow (`#FFD700`) reads as "caution sign" next to royal blue and reduces perceived professionalism. `#D4A017` is a deeper, slightly muted gold — closer to "achievement medal" than "highlighter" — and holds up as an accent without fighting the blue for attention.

### Text
| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#2D2E33` | Body text, primary headings on white background |
| `--color-text-secondary` | `#5B5F69` | Secondary text, captions, metadata (dates, byline-style info) |
| `--color-text-on-primary` | `#FFFFFF` | Text/icons placed on Royal Blue backgrounds |
| `--color-text-on-accent` | `#2D2E33` | Text placed on Gold backgrounds (dark grey reads better on gold than white does) |

### Semantic (not in client brief, required for a functional academic system)
| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#1E8E5A` | Graded/submitted/on-track states |
| `--color-warning` | `#D4A017` | Reuses accent gold — deadline approaching, at-risk "medium" |
| `--color-danger` | `#C0362C` | Overdue, at-risk "high", destructive actions |
| `--color-info` | `#3B5FCC` | Reuses primary-light — informational banners |

## 3. Typography

- **Font family**: `Inter` (or `system-ui` fallback stack) — clean, highly legible, professional without being sterile. Avoid serif fonts; this is a functional academic tool, not an editorial site.
- **Headings**: Royal Blue (`--color-primary`) per client brief, `font-weight: 600–700`.
- **Body**: Dark Grey (`--color-text-primary`), `font-weight: 400`, base size `16px`, line-height `1.6` for long-form content like course outlines/notes.
- **Scale**: `text-xs (12px)` → `text-sm (14px)` → `text-base (16px)` → `text-lg (18px)` → `text-xl (20px)` → `text-2xl (24px)` → `text-3xl (30px)` → `text-4xl (36px, marketing hero only)`.

## 4. Component Guidance

### Navigation Bar
- Background: `--color-primary`. Logo/text: white. Active link: white text + a subtle gold (`--color-accent`) underline/indicator — this is the one place gold and blue sit directly adjacent, and it reads as "premium" rather than clashing, since it's a thin 2px accent, not a fill.

### Buttons
- **Primary button**: `--color-primary` background, white text, `--color-primary-hover` on hover.
- **Secondary/outline button**: white background, `--color-primary` border + text.
- **Accent/achievement button** (rare — e.g. "Claim badge," "View achievement"): `--color-accent` background, dark grey text (per `--color-text-on-accent`).
- **Destructive button**: `--color-danger` background, white text — used sparingly (deactivate account, delete course).

### Cards
- Background `--color-surface` or white with `--color-border` 1px border, `rounded-lg`, subtle shadow (`shadow-sm`) — avoid heavy shadows, keep it flat and clean per "clean and professional."

### Notifications & Badges
- Unread notification dot/badge: `--color-accent` fill.
- Achievement badges: gold fill with a white or dark-grey icon, small drop shadow to give a "medal" feel — this is the client's explicit "achievement badges" use case, worth making it feel distinct/celebratory relative to routine UI chrome.

### Progress Indicators
- Progress bars (course completion, quiz progress): track in `--color-border`, fill in `--color-accent`. This directly matches the client's "progress indicators" instruction.
- Circular progress (e.g. GPA ring, quiz score ring): gold fill on light-grey track, Royal Blue for the numeric label in the center.

### Charts (Performance Tracking)
- Line charts (trend over time): Royal Blue line for the primary metric (e.g. GPA trend), gold line/marker for a secondary comparison (e.g. class average) — gives an immediate, on-brand way to visually compare "you vs benchmark."
- Bar charts (per-course comparison): Royal Blue bars, with the at-risk course(s) called out in `--color-danger` rather than trying to force gold/blue to signal risk.
- Risk indicator badges: `low` = `--color-success`, `medium` = `--color-warning`/gold, `high` = `--color-danger`. This deliberately breaks from pure blue/gold for risk signaling because risk needs universally-understood color semantics (green/amber/red), not brand color — don't force brand consistency where it would confuse meaning.

### Forms
- Input border `--color-border`, focus ring `--color-primary-light`.
- Validation error text/border `--color-danger`.
- Required-field indicator: small gold asterisk — a small, consistent use of accent color for a functional cue.

## 5. Accessibility Notes

- `--color-primary` (`#1E3A8A`) on white passes WCAG AA for normal text and AAA for large text — safe for headings and body-sized links.
- White text on `--color-primary` passes AAA — safe for nav bar and primary buttons.
- `--color-accent` (`#D4A017`) does **not** reliably pass AA for text on white at small sizes — treat gold as a **fill/icon/indicator color**, not as text color on white backgrounds, except at large display sizes. This is why `--color-text-on-accent` is dark grey, not white — dark grey on gold passes comfortably.
- Never rely on color alone for risk/status indicators — always pair with a label or icon (e.g. "High risk" text + red badge, not just a red dot).

## 6. Logo & Brand Feel

- Suggest a simple wordmark or monogram ("SAGE" or "S") in Royal Blue, optionally with a small gold accent mark (e.g. a gold dot, small graduation-cap glyph, or underline flourish) — keeps the "academic + achievement" feel without over-designing a mascot-style logo, which would undercut the "clean and professional" brief.

## 7. Marketing Site Specific

- Hero section: white/`--color-surface` background, Royal Blue headline, dark grey supporting text, primary CTA button in Royal Blue with a gold micro-accent (e.g. small icon) to hint at the "achievement" positioning without overusing gold.
- Module showcase section (the 5 core modules): card grid, Royal Blue icon per module on white cards, consistent with the in-app card style so the marketing site doesn't feel like a different product from the app itself.
