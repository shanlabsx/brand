# Migrating to 2.0.0

## Colour values that changed

| Token | 1.0.0 | 2.0.0 | Why |
| --- | --- | --- | --- |
| `color.brand.ignition.500` | `#FF4F70` | `#FD4D6E` | 2.99:1 on Cloud White failed the 3:1 non-text minimum. Darkened 0.6 OKLCH lightness points — 3.06:1, visually identical. |
| `color.accent.aurora.700` | `#7054F7` | `#573FC7` | The old value sat 2.3 lightness points from `500` (ΔE 0.023) — the two steps were indistinguishable. |
| `color.accent.fern.500` | `#2FA67D` | `#00A97A` | Chroma 0.121 against Aurora's 0.231 made the green sink beside the violet. Raised to 0.137; now clears 3:1 on white. |
| `color.accent.solar.300` | `#D6B170` | `#F4D297` | The old `300` was *darker* than `500` (L 77.9 vs 82.1) — the ramp ran backwards. |

Everything else keeps its exact value. All nine `color.foundation.*` names still
exist and still resolve to the same hex; they are now aliases into
`color.neutral.*`.

## Added

- `color.neutral.0–950` — the canonical 12-step neutral ramp. Four steps are new: `100`, `300`, `400`, `600`.
- `color.accent.danger.*` and `color.accent.info.*`.
- `color.brand.ignition.200 / 400 / 600 / 800`; `fern.600`; `solar.400 / 600`; `aurora.600`.
- `color.dataviz.light.1–6` and `color.dataviz.dark.1–6`.
- Semantic roles: `surfaceHover`, `surfaceSunken`, `foregroundSubtle`, `foregroundDisabled`, `borderSubtle`, `borderStrong`, `primaryHover`, `onPrimary`, `focusRing`, `danger`, `dangerFill`, `dangerSubtle`, `info`, `infoSubtle`.
- `type.*` — families, weights, and a 14-step scale.

## Renamed

`color.semantic.light.border` now means the **default** border (`#D3D8E1`). The old
value `#E5E8EE` moved to `borderSubtle`. If you want the 1.0.0 appearance
unchanged, point your consumers at `borderSubtle`; if you want borders that are
actually visible, take the new default.

## Assets

- The symbol is redrawn on a 32-unit grid. Three straight-line paths, no curve segments, no decimals: 1303 B → 331 B.
- `assets/icons/favicon.svg` is now expressed on a 16px grid (mark 10 × 12 at x 3..13, y 2..14) — a 1:32 restatement of the master with identical 3 : 1 : 4 proportions, so every favicon size shares one geometry. The 1.0.0 file scaled the traced master, whose gaps fell to 0.83px at 16px.
- The horizontal lockup ratio changed from 1.60× cap height to **1.30×**, and its viewBox is now `0 0 983.97 165`, tightly bounded to the ink on all four sides (1.0.0 had padding baked in, and its width was taken from the wordmark viewBox, which carries ~40 units of trailing whitespace). If you were relying on that padding, add it in layout. PNG exports are 1024 × 172 and 512 × 86.
- Wordmark letterforms are unchanged.

## Checklist for consumers

1. Search for the four changed hex literals and replace them.
2. Replace any hard-coded `#E5E8EE` border with `var(--shan-color-semantic-border-subtle)` or take the new `border`.
3. Point destructive UI at `danger` / `dangerFill`; remove any coral-filled delete buttons.
4. Add `font-synthesis: none` and drop non-standard font weights (550, 650).
5. Re-export favicons — the old file scaled the master and greyed out below 24px.
