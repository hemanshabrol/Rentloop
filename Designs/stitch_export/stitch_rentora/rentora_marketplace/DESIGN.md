---
name: Rentora Marketplace
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#43474c'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#74777c'
  outline-variant: '#c3c7cc'
  surface-tint: '#4e6071'
  primary: '#021625'
  on-primary: '#ffffff'
  primary-container: '#182b3a'
  on-primary-container: '#7f93a5'
  inverse-primary: '#b5c9dc'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#201200'
  on-tertiary: '#ffffff'
  tertiary-container: '#3b2500'
  on-tertiary-container: '#b68842'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e5f9'
  primary-fixed-dim: '#b5c9dc'
  on-primary-fixed: '#091d2c'
  on-primary-fixed-variant: '#364959'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffddb1'
  tertiary-fixed-dim: '#f1be72'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-trust, editorial-grade peer-to-peer rental ecosystem tailored for academic campuses. It bridges the gap between utilitarian student exchanges and the polished credibility of high-end consumer marketplaces. The aesthetic rejects disposable, scrappy classified vibes in favor of calm architectural clarity, institutional reliability, and effortless modernity.

The emotional signature is composed, verified, and warm. Visual priority centers on high-contrast object imagery, crisp typography, and deliberate negative space, making student-to-student transactions feel secure, intentional, and premium. Design cues blend modern editorial layouts with structured utilitarian mechanics: clear surface segregation, crisp hairline boundaries, and restrained color accents that draw focus strictly to states of trust, condition, and availability.

## Colors

The palette balances institutional gravitas with approachable warmth. 

- **Primary Canvas & Surfaces**: The base background defaults to `#F8F7F3` (with `#FAF9F6` for secondary canvas backing). Elevated structural cards sit on pure `#FFFFFF` to enforce tactile separation against the warm canvas. Hairline boundaries utilize `#E8E6DF` (or `#E5E3DC` for low-contrast divisions) to preserve physical structure without visual noise.
- **Deep Navy (`#182B3A`)**: Used as the primary authority tone. It drives primary interactive triggers, dominant headers, and key structural frames, grounding the interface in reliability.
- **Accent Teal (`#0F766E`)**: The verification and activity vector. Used intentionally for `.edu` campus verification markers, active filters, primary status chips, and confirmation flows.
- **Muted Amber (`#E9B66B`)**: Dedicated strictly to qualitative metrics—star ratings, lender response highlights, and key deposit notices.
- **Typography & Tonal Contrast**: Text hierarchy employs `#182B3A` for high-impact titles, `#475569` (Slate) for high-legibility body descriptions, and `#64748B` for metadata, rental periods, and secondary specs.

## Typography

The typographic system relies on **Plus Jakarta Sans** across all roles to convey clean, modern, and friendly authority. Precise tracking and proportionate line-heights deliver crisp legibility for gear listings, specs, and pricing structures.

- **Display & Headlines**: Tightly tracked (`-0.025em` to `-0.015em`) with a deliberate bold or semibold weight, creating commanding, editorial product titles and clear visual entry points.
- **Body & Metadata**: Generous line heights ensure frictionless consumption of rental terms, pickup logistics, and condition notes.
- **Labels & Microcopy**: Form labels, tags, and verified badges feature slight positive letter spacing and medium-to-semibold weights to ensure fast visual scanning across dense grid items.

## Layout & Spacing

The layout is anchored by an adaptable 12-column grid designed for marketplace listings, item discovery, and trust-oriented detail pages:

- **Desktop (1200px+)**: 12-column fluid grid, `3rem` (48px) exterior margin, `1.5rem` (24px) gutters. Product grids typically span 3 or 4 columns (yielding 3-up or 4-up cards).
- **Tablet (768px - 1199px)**: 8-column layout, `2rem` (32px) margin, `1.25rem` (20px) gutters. Cards reflow to 2-up configurations.
- **Mobile (<768px)**: 4-column layout, `1rem` (16px) margin, `1rem` (16px) gutters. Grid collapses into full-width stacked cards or single-column carousels.

Component padding strictly aligns with the base 8pt spacing rhythm (4px micro-steps). Layout gaps use `space-md` (16px) within cards and `space-xl` (40px) between distinct marketplace sections.

## Elevation & Depth

Visual depth is achieved through quiet, multi-layered ambient diffusion combined with hairline borders rather than heavy, harsh shadows.

- **Card Elevation**: Default resting cards sit on `#FFFFFF` and feature a dual-layer shadow: `0 1px 2px rgba(24, 43, 58, 0.04), 0 8px 24px -4px rgba(24, 43, 58, 0.06)`. This deep-navy-tinted diffusion softens the transition against the `#F8F7F3` backdrop.
- **Active / Hover State**: Interactive cards lift cleanly: `0 12px 32px -6px rgba(24, 43, 58, 0.10)`, accompanied by a subtle border shift from `#E8E6DF` to `#0F766E33`.
- **Modals & Flyouts**: High-order overlays utilize `0 24px 48px -12px rgba(24, 43, 58, 0.16)` backed by an ultra-fine backdrop blur (`backdrop-blur-md` over `rgba(24, 43, 58, 0.2)`).
- **Structural Separation**: Flat architectural dividers maintain a uniform `1px solid #E8E6DF` stroke, avoiding artificial floating tiers where spatial hierarchy is already evident.

## Shapes

The design uses a balanced geometric curve language that avoids generic boxiness without lapsing into toy-like, full-pill silhouettes:

- **Cards & Surfaces (`rounded-xl` / 16px)**: High-level containers, listing cards, modal views, and media frames strictly use 16px corner radii to establish an inviting, modern frame.
- **Interactive Controls (`rounded-lg` / 10px-12px)**: Buttons, text inputs, date pickers, and select dropdowns use 10px to 12px corners, preserving a structured and tactile feel.
- **Micro-Badges & Filter Chips**: Pill shapes are reserved exclusively for trust badges, campus indicators, and secondary filter tags to distinguish metadata from actionable buttons.

## Components

### Buttons
- **Primary**: Solid Deep Navy (`#182B3A`) background, `#FFFFFF` text, `rounded-lg` (10px). Vertical padding `12px`, horizontal `20px`. Hover triggers a brightness shift to `#223C52` with minimal shadow.
- **Secondary / Accent**: Soft Teal tint (`#0F766E14`) with `#0F766E` label, or pure white surface with `1px solid #E8E6DF` stroke and `#182B3A` text.
- **Destructive / Caution**: Muted warm rose with `#182B3A` text for non-jarring, safe cancellation flows.

### Cards (Item & Listing)
- Standard cards feature a pure `#FFFFFF` background, `rounded-xl` (16px), and a `1px solid #E8E6DF` perimeter.
- Image aspect ratio is locked at 4:3 or 1:1, inset with `12px` padding or flushed to the top with matching `16px` outer border rounding.
- Internal metadata is segmented using `space-sm` (8px) gaps: price per day emphasized in Deep Navy (`font-weight: 700`), distance from dorm/campus marked in Slate (`#64748B`).

### Campus Trust Badges & Verified Markers
- **Verified Student Badge**: Pill-shaped chip, `#0F766E0F` background, `#0F766E` border (`1px`), containing a micro-check icon and label in `label-sm` (e.g., "Stanford Verified").
- **Rating Indicator**: Muted amber (`#E9B66B`) filled star accompanied by numeric average and rental counter in Slate (`#475569`).

### Input Fields & Controls
- Form inputs feature a `#FFFFFF` fill, `1px solid #E8E6DF` frame, and `12px` rounded corners.
- Active/Focus state transitions the border to `#0F766E` with a subtle focus ring (`0 0 0 3px rgba(15, 118, 110, 0.12)`).
- Placeholder text is muted `#64748B` with optical vertical centering.

### Chips & Filters
- Inactive state: `#FFFFFF` fill, `#E8E6DF` border, `#475569` text, `pill-shaped` (9999px).
- Active state: `#182B3A` fill with `#FFFFFF` text, or `#0F766E` fill for active campus/verification toggles.

### Checkboxes & Radio Buttons
- Crisp `1.25rem` boxes with a `1px solid #E8E6DF` border, rounding to `4px` (checkbox) or circular (radio).
- Checked state fills with `#0F766E` featuring an interior white checkmark or dot.