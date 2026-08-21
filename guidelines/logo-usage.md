# Logo Usage

## Construction

The symbol is built on a 32-unit grid inside a 512 viewBox. One unit `u = 32`.

| Part | Size |
| --- | --- |
| Mark box | 10u × 12u (320 × 384) |
| Horizontal rail | 3u tall (96), full mark width |
| Gap | 1u (32) |
| Diagonal bar | 4u vertical extent (128), sheared exactly 45° |
| Stack | 3u + 1u + 4u + 1u + 3u = 12u |

The diagonal's stroke measured perpendicular to its own axis is `128 × cos45° = 90.5`
against the rails' 96 — a 5.7% reduction, the correct optical correction for a
diagonal. Every coordinate is a multiple of 32, so at 16 / 32 / 48 / 64px every
edge lands on a whole pixel.

**Never re-derive the geometry by tracing.** Edit `source/logos/symbol.svg`, which
contains three straight-line paths and no curve segments.

## Preferred forms

1. Ignition Coral symbol on Cloud White.
2. White symbol on Cosmic Ink.
3. Cosmic Ink symbol for monochrome or restrained contexts.

Use SVG whenever possible. PNG exports are provided only for systems that cannot consume SVG.

## Lockup

The horizontal logo places the symbol left of the wordmark:

- Symbol height = wordmark cap height × **1.30**.
- Gap between symbol and wordmark = symbol width × **0.30**.
- The symbol's vertical centre aligns with the wordmark's cap-height centre — measured
  on the `L`, not on the `S`, whose overshoot would pull the alignment 2.7 units low.

Exported lockup SVGs use `viewBox="0 0 983.97 165"`, tightly bounded to the ink on
all four sides. Note that `wordmark-*.svg` is **not** tightly bounded — its viewBox
carries ~40 units of trailing whitespace, so derive lockup geometry from the ink
bounding box, never from that viewBox.

## Clear space

Clear space is 3u (96 units at the 512 master scale) on the left and right, and
2u (64 units) above and below — the proportion already baked into
`source/logos/symbol.svg`, where the 320 × 384 mark sits at x 96..416, y 64..448.
Equal padding on a non-square mark reads as too much air at the sides. The avatar
asset includes additional space for circular and rounded-square crops.

## Minimum size

- `assets/icons/favicon.svg` — the dedicated 16px grid version — at 16px, 24px, and 32px.
- The master symbol at 24px and above.
- Print symbol: 6 mm minimum.

The favicon version is a separate drawing on a 16px grid (rails 3px, gaps 2px,
diagonal 4px). The master symbol's 1u gap resolves to 1px at 16px, which
anti-aliasing greys out; the favicon version widens the gap to survive it. Do not
substitute one for the other.

## Prohibited use

Do not:

- alter geometry, proportions, or internal spacing;
- rotate, skew, outline, crop, or stretch the mark;
- introduce gradients, shadows, glow, glass, or metallic treatments into the master logo;
- recolor the mark outside the approved variants;
- place the mark on a background that reduces legibility;
- combine it with another icon or create product-specific mutations.
