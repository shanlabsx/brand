# Brand Guidelines

## Brand architecture

- **Organization handle:** `@shanlabsx`
- **Display name:** Shan Labs
- **Founder identity:** Alex Shan / `@alxshan`
- **Preferred attribution:** Built by Shan Labs

Use "Shan Labs" as the company and product-studio name. "Labs by Shan" may describe provenance but is not the primary display name. Do not use "Shan's Lab."

## Identity idea

The symbol is an abstract geometric mark: two horizontal rails linked by a bar
sheared exactly 45°. Its angled centre expresses connection, iteration, and
shipping — and it is the only part of the mark that separates it from the
"menu / sort / list" icon vocabulary, so it is never lightened, shortened, or
softened. It must remain abstract: never add a literal rocket, fern, planet,
flame, atom, or code bracket.

Construction is defined in [`logo-usage.md`](logo-usage.md#construction).

## Logos

The primary logo pairs the symbol with the wordmark "Shan Labs" set to its right. Use the approved wordmark letterforms and keep the space between "Shan" and "Labs".

- Use the `primary` variant (coral symbol, ink wordmark) on light backgrounds.
- Use the `white` variant on dark backgrounds.
- Use the `ink` variant for monochrome contexts and print.

## Primary palette

| Role | Name | Value |
| --- | --- | --- |
| Brand | Ignition Coral | `#FD4D6E` |
| Foundation | Cosmic Ink | `#0B1020` |
| Light surface | Cloud White | `#F7F8FA` |
| Warm surface | Moon Cream | `#F3F0EB` |

## Neutral scale

`color.neutral.0` through `950` is the canonical neutral ramp (H 265). The named
foundation tokens are aliases into it and resolve to the same values as before:

| Alias | Step | Value |
| --- | --- | --- |
| `white` | 0 | `#FFFFFF` |
| `cloud` | 50 | `#F7F8FA` |
| — | 100 | `#F0F2F6` |
| `mist` | 200 | `#E5E8EE` |
| — | 300 | `#D3D8E1` |
| — | 400 | `#A9B1C2` |
| `onInkMuted` | 500 | `#7B869C` |
| — | 600 | `#5E697F` |
| `slate` | 700 | `#4E586D` |
| `inkBorder` | 800 | `#2C3245` |
| `inkSurface` | 900 | `#191E30` |
| `ink` | 950 | `#0B1020` |

Borders come in three weights: `borderSubtle` (200), `border` (300), `borderStrong` (400).
A single border value cannot serve a table, an input, and a card at once.

## Product accents

Product accents are functional and subordinate. Each ships a `500` brand anchor,
a step calibrated for accessible text/icons on light surfaces, and a `300` step
calibrated for dark surfaces:

| Family | Hue | 500 anchor | Light text/icon | Dark text/icon | Role |
| --- | --- | --- | --- | --- | --- |
| Aurora Violet | 284 | `#765CFF` | `#573FC7` (700) | `#AEADFF` (300) | AI and experimental capabilities |
| Silver Fern | 165 | `#00A97A` | `#00815D` (700) | `#87C7AB` (300) | Success and growth |
| Solar Gold | 81 | `#F5B942` | `#946900` (700) | `#F4D297` (300) | Achievement and warning |
| Danger | 32 | `#DB3012` | `#C02000` (700) | `#FFA18F` (300) | Destructive and error states |
| Info | 235 | `#008BC1` | `#00729F` (700) | `#7AC8F5` (300) | Neutral notices |

**Danger exists because the brand colour is itself a red.** Ignition sits at hue 14
and stays at lightness 67 or above; Danger sits at hue 32 and stays at 58 or
below. Coral is never used as a filled destructive button, and Danger always
carries an icon.

Recommended visual allocation:

- Foundations and surfaces: 70–80%
- Ignition Coral: 10–20%
- Product accents combined: no more than 10%

## Data visualisation

`color.dataviz.light.1–6` are generated at constant OKLCH L 62 / C 0.135 with
evenly spaced hues, so six series carry identical visual weight. The dark set
sits at L 74 / C 0.115. Semantic accents are not chart colours — they carry
meaning, and charts need neutrality.

## Typography

| Role | Family | Licence | Use |
| --- | --- | --- | --- |
| Display | Instrument Sans | OFL | Marketing headlines, 24px and above |
| UI | Geist | OFL | All product interface text |
| Mono | JetBrains Mono | OFL | Code, identifiers, keys, log output |

Self-host WOFF2 variable files; do not load from a third-party CDN. Preload the
two critical UI weights, subset to Latin, and set `size-adjust` so the fallback
metrics match.

**Weights are 400 / 500 / 600 / 700 only.** Non-standard weights such as 550 and
650 render only on variable fonts and round unpredictably elsewhere. Set
`font-synthesis: none` so a missing weight fails visibly instead of being faked.

The full scale lives in `tokens/brand.tokens.json` under `type.scale`. Product
default is `body-md` (15px / 1.55); consumer surfaces may set `body-lg` (17px)
as their base. Letter-spacing is a function of size — negative above 16px,
positive below it, `+0.14em` for 11px all-caps.

Numerals: `font-variant-numeric: tabular-nums` on every table, metric, and timer;
`slashed-zero` in monospace contexts.

## Dark mode

`color.semantic.dark.*` mirrors the light group role for role. In CSS use the
`--shan-color-semantic-*` aliases, which switch under `prefers-color-scheme: dark`.
Dark mode moves `primary` to Ignition 300 — Ignition 500 reaches only 5.95:1 on
Cosmic Ink, while 300 reaches 8.89:1 and takes dark button text cleanly.

## Accessibility

Verified WCAG AA pairs (4.5:1 for normal text, 3:1 for non-text), computed from
the canonical tokens and enforced on every change:

| Foreground | Background | Ratio |
| --- | --- | --- |
| Cosmic Ink | Ignition 500 (button fill) | 5.83:1 |
| White | Ignition 700 (reversed action) | 5.36:1 |
| Ignition 500 (graphic) | Cloud White | 3.06:1 |
| Cosmic Ink | Cloud White | 17.82:1 |
| Fern 700 | Cloud White | 4.60:1 |
| Solar 700 | Cloud White | 4.62:1 |
| Aurora 700 | Cloud White | 6.72:1 |
| Danger 700 | Cloud White | 5.73:1 |
| Info 700 | Cloud White | 5.06:1 |
| White | Danger 500 (destructive fill) | 4.73:1 |
| Neutral 600 | Cloud White | 5.20:1 |
| Fern / Solar / Aurora / Danger / Info 300 | Cosmic Ink | ≥9.21:1 |
| Neutral 500 | Cosmic Ink / Ink Surface | 5.17:1 / 4.51:1 |

**Semantic state is never carried by colour alone.** Every accessible text step
sits near the 4.5:1 threshold, so in greyscale success, warning, danger, and
info all collapse to roughly the same value. Each state ships colour *and* a
distinct icon shape *and* a text label.

**Focus rings are independent of fills.** `focusRing` is Ignition 700 with a 2px
offset in the surface colour, never the same colour as the element it outlines.

## Governance

The repository status controls eligibility:

- `draft`: exploratory and internal only.
- `candidate`: coherent system under review.
- `approved`: authorized for production and release.
- `deprecated`: retained for migration and historical reference only.
