## [2.0.0] - 2026-08-21

### Changed

- **Symbol geometry rebuilt on a 32-unit grid.** The 1.0.0 mark was traced, not constructed: 15 of its 41 edges were cubic Bézier segments with up to 0.81 units of bow, the three bars' left edges sat at x 38.44 / 38.74 / 39.01, the two gaps were opposing wedges (13.03→13.34 and 13.45→13.06), and the transform carried `scale(2.031746031746032)`. The new mark is three straight-line paths on integer coordinates (1303 B → 331 B).
- **The diagonal's optical weight is corrected.** Its perpendicular stroke was 40.5 against the rails' 60 — 32% lighter. It is now `128 × cos45° = 90.5` against 96, a 5.7% reduction.
- **Horizontal lockup ratio 1.60× → 1.30× cap height**, gap defined as symbol width × 0.30, cap height measured on the `L` rather than the overshooting `S`. The exported viewBox (`0 0 983.97 165`) is tightly bounded to the ink; 1.0.0 sized the lockup off the wordmark viewBox, which carries ~40 units of trailing whitespace.
- **Breaking colour changes:** `ignition.500` `#FF4F70`→`#FD4D6E`, `aurora.700` `#7054F7`→`#573FC7`, `fern.500` `#2FA67D`→`#00A97A`, `solar.300` `#D6B170`→`#F4D297`. See [MIGRATION.md](MIGRATION.md).
- `color.foundation.*` are now aliases into `color.neutral.*`. Every name and value is preserved.
- `semantic.border` now resolves to `#D3D8E1`; the former value is `semantic.borderSubtle`.

### Added

- `color.neutral.0–950`, a 12-step ramp; `100 / 300 / 400 / 600` are new.
- `color.accent.danger.*` (H 32) and `color.accent.info.*` (H 235). The brand primary is a red, so a destructive colour could not be derived from it.
- Missing steps: `ignition.200 / 400 / 600 / 800`, `fern.600`, `solar.400 / 600`, `aurora.600`.
- `color.dataviz.light.1–6` and `color.dataviz.dark.1–6` at constant OKLCH lightness and chroma.
- Semantic roles for hover surfaces, three border weights, disabled foreground, `onPrimary`, and an independent `focusRing`.
- `type.*`: Instrument Sans (display), Geist (UI), JetBrains Mono (mono), four weights, and a 14-step scale with per-size letter-spacing.
- A dedicated 16px-grid `assets/icons/favicon.svg`. The master symbol's gap resolved to 0.83px at the documented 16px minimum.

### Fixed

- Solar's ramp ran backwards: `300` (L 77.9) was darker than `500` (L 82.1).
- Aurora's `700` was 2.3 lightness points from its `500` — ΔE 0.023, effectively the same colour.
- `ignition.500` reached only 2.99:1 on Cloud White, below the 3:1 non-text minimum the 1.0.0 guidelines documented as a known caveat.
