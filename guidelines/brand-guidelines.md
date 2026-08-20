# Brand Guidelines

## Brand architecture

- **Organization handle:** `@shanlabsx`
- **Display name:** Shan Labs
- **Founder identity:** Alex Shan / `@alxshan`
- **Preferred attribution:** Built by Shan Labs

Use “Shan Labs” as the company and product-studio name. “Labs by Shan” may describe provenance but is not the primary display name. Do not use “Shan's Lab.”

## Identity idea

The symbol is an abstract geometric mark: three stacked bars whose middle bar runs diagonally, linking the two horizontal rails. Its angled center expresses connection, iteration, and shipping. It must remain abstract: never add a literal rocket, fern, planet, flame, atom, or code bracket.

## Logos

The primary logo pairs the symbol with the wordmark “Shan Labs” set to its right. Use the approved wordmark letterforms and keep the space between “Shan” and “Labs”.

- Use the `primary` variant (coral symbol, ink wordmark) on light backgrounds.
- Use the `white` variant on dark backgrounds.
- Use the `ink` variant for monochrome contexts and print.

## Primary palette

| Role | Name | Value |
| --- | --- | --- |
| Brand | Ignition Coral | `#FF4F70` |
| Foundation | Cosmic Ink | `#0B1020` |
| Light surface | Cloud White | `#F7F8FA` |
| Warm surface | Moon Cream | `#F3F0EB` |

Product accents are functional and subordinate. Each ships as a small scale —
a `500` brand anchor for illustration and marketing, a `700` step calibrated
for accessible text/icons on light surfaces, and a `300` step calibrated for
dark surfaces — instead of a single hex, so every role has a WCAG-safe option
built in rather than requiring a one-off pick at the point of use:

| Family | 500 (brand anchor) | 700 (light-mode text/icon) | 300 (dark-mode text/icon) |
| --- | --- | --- | --- |
| Aurora Violet — AI and experimental capabilities | `#765CFF` | `#7054F7` | `#AEADFF` |
| Silver Fern — success, growth, restrained NZ context | `#2FA67D` | `#00815D` | `#87C7AB` |
| Solar Gold — achievement, warning, creative energy | `#F5B942` | `#946900` | `#D6B170` |

The `500` anchors are decorative reference points — use them for large fills,
gradients, or marketing artwork. For interface text, icons, or borders, use
the semantic `success` / `warning` / `intelligence` tokens, which already
resolve to the correct accessible step (`700` in light mode, `300` in dark
mode) rather than the anchor.

Recommended visual allocation:

- Foundations and surfaces: 70–80%
- Ignition Coral: 10–20%
- Product accents combined: no more than 10%

## Dark mode

`tokens/brand.tokens.json` ships a parallel `color.semantic.dark.*` group
(background, surface, foreground, foregroundMuted, border, and the accent
roles above), sourced from the same Cosmic Ink family and OKLCH-derived
accent scale — never invented ad hoc. Consumers that need dark mode should
read these tokens, or in CSS just use the `--shan-color-semantic-*` custom
properties, which already auto-switch under `prefers-color-scheme: dark`.

## Accessibility

Verified WCAG AA pairs (4.5:1 minimum for normal text), computed from the
canonical tokens and enforced by `test/brand.test.mjs` on every change:

| Foreground | Background | Ratio |
| --- | --- | --- |
| Cosmic Ink | Ignition Coral 500 (button fill) | 5.95:1 |
| White | Ignition Coral 700 (reversed action) | 5.36:1 |
| Cosmic Ink | Cloud White | 17.82:1 |
| Fern 700 / Solar 700 / Aurora 700 | Cloud White or White | ≥4.60:1 |
| Fern 300 / Solar 300 / Aurora 300 | Cosmic Ink or Ink Surface | ≥8.05:1 |
| White (dark-mode) | Cosmic Ink | 17.82:1 |
| Ink Muted (`onInkMuted`) | Cosmic Ink or Ink Surface | ≥4.51:1 |

Known caveat: **Ignition Coral 500 sits at 2.99:1 against Cloud White** —
just under the 3:1 non-text minimum for a graphical object perceived by its
fill alone (WCAG 1.4.11). This is acceptable for a labeled button (the text
label satisfies identification, per the pairs above) but not for an
unlabeled icon or a thin outline; add a border or use Ignition Coral 700 for
those cases.

Do not use white body text directly on Ignition Coral 500; the contrast is
approximately `3.18:1`. Never communicate state using color alone.

## Governance

The repository status controls eligibility:

- `draft`: exploratory and internal only.
- `candidate`: coherent system under review.
- `approved`: authorized for production and release.
- `deprecated`: retained for migration and historical reference only.
