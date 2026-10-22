# E2E Test Infra: StarMatch Rebuild

## Test Philosophy
- Requirement-driven, opaque-box testing covering the StarMatch application surface.
- Verifies visual integrity (pure-white `#FFFFFF` default, zero dark-mode SSR leaks, zero AI-fluff strings), interactive math and animation helpers (Hooke's law physics, 3D projection, scanline displacement), form inputs, and geocentric astronomical ephemeris calculus without modifying test or calculation invariants.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Requirement | Tier 1 (Features) | Tier 2 (Boundaries) | Tier 3 (Interactions) | Tier 4 (Scenarios) |
|---|---------|-------------|:-----------------:|:-------------------:|:---------------------:|:------------------:|
| 1 | Pure-White Default Theme | R1 | ✓ | ✓ | ✓ | ✓ |
| 2 | Reboot Hero Stage & Halftone Hands | R2 | ✓ | ✓ | ✓ | ✓ |
| 3 | OGREES 5-Chapter Matrix Morpher | R3 | ✓ | ✓ | ✓ | ✓ |
| 4 | Mantis 3D Scribed Wireframe Figure | R4 | ✓ | ✓ | ✓ | ✓ |
| 5 | Section 4 Synastry Studio & Form | R5 | ✓ | ✓ | ✓ | ✓ |
| 6 | Geocentric Ephemeris Telemetry | R5 | ✓ | ✓ | ✓ | ✓ |

## Test Architecture
- **Runner**: Vitest v3 (`vitest run`) in Node.js environment with React 19 `renderToString` SSR string verification and mathematical engine unit testing.
- **Suite Breakdown**:
  - `tests/e2e/`: 4 suites (Tier 1 Features, Tier 2 Boundaries, Tier 3 Interactions, Tier 4 Scenarios) — 301 tests.
  - `tests/unit/astro/`: 3 suites — 12 tests.
  - `tests/unit/synastry/`: 5 suites — 24 tests.
  - `tests/unit/`: 14 suites (including `ui-hero-theme.test.ts`, `ui-interactive-showcase.test.ts`, `ui-m3.test.ts`) — 411 tests.
  - **Total**: 26 test files, 748 passing tests.
- **Pass/Fail Semantics**: All 26 test files must pass with exit code 0 (`pnpm test`).
- **Lint Semantics**: `pnpm lint` must exit with 0 errors.
- **Build Semantics**: Next.js 16.4.2 Turbopack `pnpm build` must compile and prerender 99/99 routes cleanly.
