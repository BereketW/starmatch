# Project: StarMatch Rebuild

## Architecture
StarMatch is a Next.js 16.4.2 (Turbopack, App Router) astrological matchmaking platform. The application homepage is rebuilt as an exact visual and interactive clone of three authoritative reference designs (Reboot, OGREES, and Mantis) on a pure white (`#FFFFFF`) background with zero dark-mode default, zero serif bloat, zero terminal clutter, and zero AI-fluff marketing.

### Visual & Interactive Data Flow
```
[ User Viewport: Pure White #FFFFFF Background ]
  │
  ├── Section 1: Reboot Hero (#FFFFFF)
  │     ├── Floating Borderless Top Nav (3D Cube + Wordmark, 5 Links, Black Pill CTA)
  │     ├── Two-tone Sans-Serif Headline ('Rebooting the' #B0B0B8 / 'Cosmic Connection.' #0A0A0A)
  │     ├── Subtitle + Black Pill CTA ('Join our World' / 'Cross our Stars') with Rainbow Prismatic Underglow
  │     ├── Full-Bleed Edge-to-Edge Halftone Dot-Matrix Hands (#111111 dots on #FFFFFF, 0..0.38 & 0.62..1.0)
  │     └── Bottom Monochrome Feature/Partner Strip
  │
  ├── Section 2: OGREES Scanline Matrix Morpher (#FFFFFF)
  │     ├── 4-Corner / Edge Micro-Navigation Chrome (10px Uppercase Sans)
  │     ├── Center 28×28 Light-Grey Grid (#EAEAEA on #FFFFFF)
  │     ├── 5 Pixel Emblems (01 Ghost, 02 Cherries, 03 Potion Flask, 04 Heart, 05 Split Mask) with #000000 Outlines
  │     ├── Full-Viewport 1px Horizontal Scanline Sweep with ±32px Sine-Wave Slice Displacement
  │     ├── Left-Hand Column: Chapter Number (01-05) + Large Sans-Serif Heading
  │     └── Bottom-Right Editorial Paragraph (indented first line)
  │
  ├── Section 3: Mantis 3D Scribed Wireframe Figure (#E4E4E2)
  │     ├── Full-Viewport Architectural Light-Grey Canvas (#E4E4E2, min-h-[90vh])
  │     ├── Dense 3D Tangled Black Calligraphic Wireframe Figure with Reaching Foreshortened Hand
  │     ├── Overlapping Monumental Sans-Serif Display Type ('we decode feelings.')
  │     ├── Overlapping Off-White Pill CTA ('Compare charts')
  │     └── Left-Edge StarMatch + Neon-Green (#24FF00) Geometric Polygon Ribbon Accent
  │
  ├── Section 4: Pure-White Synastry Studio (#FFFFFF, #synastry-studio)
  │     ├── CompatibilityForm (White Cards, #EAEAEA Borders, Solid #0A0A0A Pill Submit)
  │     ├── PersonInputCard (A/B inputs, telemetry, #FFFFFF surfaces)
  │     ├── LiveCelestialBiWheel (SVG #FFFFFF fill nodes, #EAEAEA borders)
  │     └── RecentPairsList (Pure white cards)
  │
  └── Section 5: Editorial Footer (#FFFFFF)
        └── Clean minimal footer on white
```

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1.1 Pure White Token Defaults | `:root` in `app/globals.css` set to `--background: #ffffff`, `--foreground: #0a0a0a`. Default theme set to `'alabaster'`. | M1 | ORIGINAL_REQUEST §R1 |
| 2 | R1.2 SSR Theme Initialization | `app/layout.tsx` removes `dark` class and `bg-[#050505]`, sets `data-theme="alabaster"`. `ThemeProvider` `getServerSnapshot()` returns `'alabaster'`. | M1 | ORIGINAL_REQUEST §R1 |
| 3 | R1.3 Theme Store Module | `lib/theme-store.ts` re-exports theme store with `'alabaster'` default. | M1 | ORIGINAL_REQUEST §R1 |
| 4 | R1.4 Navigation & Footer Styling | `StudioChrome.tsx` and `EditorialFooter.tsx` cleaned of dark hardcodes to pure white aesthetic. | M1 | ORIGINAL_REQUEST §R1 |
| 5 | R2.1 Reboot Hero Structure | `HeroStage.tsx` full-bleed `#FFFFFF` stage, removing tablist switcher (`NATAL`, `SYNASTRY`, `COMPOSITE`) and sparks. | M1 | ORIGINAL_REQUEST §R2 |
| 6 | R2.2 Reboot Floating Nav | Floating borderless nav with 3D isometric cube, `StarMatch` wordmark, 5 clean links, black pill CTA. | M1 | ORIGINAL_REQUEST §R2 |
| 7 | R2.3 Two-Tone Headline & Prismatic CTA | `Rebooting the` (`#B0B0B8`) / `Cosmic Connection.` (`#0A0A0A`), 2-line subtitle, black pill CTA with multi-stop rainbow blur underglow. | M1 | ORIGINAL_REQUEST §R2 |
| 8 | R2.4 Full-Bleed Halftone Hands | `HalftoneHandsCanvas.tsx` full-bleed `#111111` dots on `#FFFFFF`, left (`0..0.38`) and right (`0.62..1.0`) flanking hands with clean center breathing room. | M1 | ORIGINAL_REQUEST §R2 |
| 9 | R2.5 Partner Strip | Bottom monochrome partner/feature strip (`#111111` at 70% opacity). | M1 | ORIGINAL_REQUEST §R2 |
| 10 | R3.1 OGREES White Stage & Chrome | `ScanlineMatrixMorpher.tsx` pure `#FFFFFF` background, four-corner 10px uppercase `#111111` micro-nav. | M2 | ORIGINAL_REQUEST §R3 |
| 11 | R3.2 28×28 Cartesian Grid | Centered 28×28 square grid with `#EAEAEA` hairlines on `#FFFFFF`. | M2 | ORIGINAL_REQUEST §R3 |
| 12 | R3.3 5 Authentic Pixel Emblems | `lib/emblems/data.ts` exact 5 OGREES emblems (Ghost, Cherries, Potion, Heart, Dual Mask) with `#000000` outlines. | M2 | ORIGINAL_REQUEST §R3 |
| 13 | R3.4 Scanline Sweep & Sine Wave | 1px horizontal dark line sweep with `±32px` sinusoidal row slice displacement (`Math.sin(...) * 24px`). | M2 | ORIGINAL_REQUEST §R3 |
| 14 | R3.5 Typography Cross-Fade | Left-hand 01-05 number + large sans-serif title cross-fading, bottom-right indented paragraph. | M2 | ORIGINAL_REQUEST §R3 |
| 15 | R4.1 Mantis Canvas & Background | `WireframeCelestialSculpture.tsx` full-viewport (`min-h-[90vh]`) on `#E4E4E2` architectural grey. | M2 | ORIGINAL_REQUEST §R4 |
| 16 | R4.2 3D Scribed Human Figure | Dense tangled black ink curves (`#0A0A0A`, alpha 0.15–0.65) forming torso, head, and foreshortened reaching right hand responding to cursor. | M2 | ORIGINAL_REQUEST §R4 |
| 17 | R4.3 Mantis Display Type & Pill CTA | Monumental black sans-serif **`we decode feelings.`** overlapping off-white pill button **`Compare charts`**. | M2 | ORIGINAL_REQUEST §R4 |
| 18 | R4.4 Mantis Edge Accents | Left edge `StarMatch` wordmark with `#24FF00` neon-green ribbon polygon accent, top-right minimal links, edge labels. | M2 | ORIGINAL_REQUEST §R4 |
| 19 | R5.1 Pure-White Synastry Studio | `CompatibilityForm.tsx`, `PersonInputCard.tsx`, `RecentPairsList.tsx` restyled to `#FFFFFF` surfaces with `#EAEAEA` borders and `#0A0A0A` pill submit. | M3 | ORIGINAL_REQUEST §R5 |
| 20 | R5.2 Live Celestial BiWheel Light Mode | `LiveCelestialBiWheel.tsx` SVG node fill bug fixed (`#050505` -> `#ffffff`), preserving all astronomy-engine telemetry. | M3 | ORIGINAL_REQUEST §R5 |
| 21 | R5.3 Homepage Flow & AI-Fluff Deletion | `app/page.tsx` lines 40–156 deleted ("ARCHITECTURE OF SMARTNESS", 3 pillars, 4 portals); direct sequence Hero -> Morpher -> Mantis -> Studio -> Footer. | M3 | ORIGINAL_REQUEST §R5 |
| 22 | R5.4 UI Hero Theme Test Alignment | `tests/unit/ui-hero-theme.test.ts` updated for `'alabaster'` default, new toggle label, and Reboot Hero layout. | M1 | ORIGINAL_REQUEST §R5 |
| 23 | R5.5 UI Interactive Showcase Test Alignment | `tests/unit/ui-interactive-showcase.test.ts` updated for `'alabaster'`, OGREES emblem titles, and Mantis section presence replacing AI-fluff assertions. | M3 | ORIGINAL_REQUEST §R5 |
| 24 | R5.6 26/26 Test Verification & Clean Build | All 26 test files passing (748+ tests), `pnpm lint` 0 errors, `pnpm build` clean under Next.js 16.4.2. | M3 | ORIGINAL_REQUEST §R5 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundations & Section 1 Reboot Hero | Global pure-white theme (`app/globals.css`, `app/layout.tsx`, `components/theme/ThemeProvider.tsx`, `lib/theme-store.ts`, `components/nav/StudioChrome.tsx`, `components/footer/EditorialFooter.tsx`), Section 1 Reboot Hero (`components/hero/HeroStage.tsx`, `components/hero/HalftoneHandsCanvas.tsx`), and theme test alignment (`tests/unit/ui-hero-theme.test.ts`) | None | DONE |
| M2 | Interactive Centerpieces: OGREES Morpher & Mantis Sculpture | Section 2 OGREES Scanline Matrix Morpher (`components/home/ScanlineMatrixMorpher.tsx`, `lib/emblems/data.ts`) and Section 3 Mantis 3D Scribed Wireframe Figure (`components/hero/WireframeCelestialSculpture.tsx`) | M1 | DONE |

| M3 | Synastry Studio, Page Flow & Final Hardening | Section 4 Synastry Studio (`CompatibilityForm.tsx`, `PersonInputCard.tsx`, `LiveCelestialBiWheel.tsx`, `RecentPairsList.tsx`), Homepage Flow (`app/page.tsx` AI-fluff removal & section assembly), test alignment (`tests/unit/ui-interactive-showcase.test.ts`), and full verification (27/27 test suites, lint, Next.js build) | M1, M2 | DONE |

---

## Interface Contracts
### Theme Tokens & Store ↔ UI Components
- `themeStore.getServerSnapshot()` MUST return `'alabaster'`.
- `data-theme="alabaster"` provides:
  - `--background: #ffffff`
  - `--foreground: #0a0a0a`
  - `--color-bg-base: #ffffff`
  - `--color-surface-card: #ffffff`
  - `--color-border-card: #eaeaea`
  - `--color-border-subtle: #eaeaea`
  - `--color-text-base: #0a0a0a`
  - `--color-text-dim: #71717a`

### Section 2 `lib/emblems/data.ts` ↔ `ScanlineMatrixMorpher.tsx`
- Emblems export array of 5 chapters:
  1. `id: 'ghost'`, `num: '01'`, `title: 'Giving Our Best'`, `colors: { body: '#FF3B00', eyes: '#FFFFFF', pupils: '#002288', outline: '#000000' }`
  2. `id: 'cherries'`, `num: '02'`, `title: "Adding Value Where Others Don't"`, `colors: { body: '#EE0000', stem: '#4A6B00', outline: '#000000' }`
  3. `id: 'potion'`, `num: '03'`, `title: 'Pushing Boundaries'`, `colors: { body: '#FF1E00', collar: '#D8F0FF', outline: '#000000' }`
  4. `id: 'heart'`, `num: '04'`, `title: 'Connecting Hearts, Stars, and People'`, `colors: { body: '#FF1100', highlight: '#FFFFFF', outline: '#000000' }`
  5. `id: 'split_mask'`, `num: '05'`, `title: 'Driving Truth Through Astronomy'`, `colors: { left: '#00FF66', right: '#EE00FF', outline: '#000000' }`

### Astronomy Engine & Form Telemetry ↔ Section 4 Synastry Studio
- `CompatibilityForm` accepts `initialPersonA`, `initialPersonB`, `onCalculated`.
- `LiveCelestialBiWheel` accepts calculated synastry aspects and natal placements, rendering accurate degrees on SVG bi-wheel without modifying astronomy calculation logic.

---

## Code Layout
- `app/globals.css`: Global CSS tokens and variables
- `app/layout.tsx`: Root HTML layout, font setup, theme script
- `app/page.tsx`: Homepage composition: Section 1 (HeroStage) -> Section 2 (ScanlineMatrixMorpher) -> Section 3 (WireframeCelestialSculpture) -> Section 4 (#synastry-studio) -> Section 5 (EditorialFooter)
- `lib/theme-store.ts`: Theme store definition and helpers
- `components/theme/ThemeProvider.tsx`: Theme React context and provider
- `components/hero/HeroStage.tsx`: Reboot Section 1 hero layout
- `components/hero/HalftoneHandsCanvas.tsx`: Reboot full-bleed halftone dot hands
- `components/home/ScanlineMatrixMorpher.tsx`: OGREES Section 2 5-chapter matrix morpher
- `lib/emblems/data.ts`: OGREES 28×28 pixel emblem data matrices
- `components/hero/WireframeCelestialSculpture.tsx`: Mantis Section 3 3D scribed tangled figure
- `components/form/CompatibilityForm.tsx`: Synastry studio form container
- `components/form/PersonInputCard.tsx`: Individual chart input card
- `components/form/LiveCelestialBiWheel.tsx`: Interactive celestial bi-wheel
- `components/form/RecentPairsList.tsx`: Recent pairs gallery
- `tests/unit/ui-hero-theme.test.ts`: SSR and theme unit tests
- `tests/unit/ui-interactive-showcase.test.ts`: Interactive sections unit tests
- `tests/unit/ui-m3.test.ts`: Form & utility unit tests
