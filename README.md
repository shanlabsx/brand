# Shan Labs Brand

The canonical source for the Shan Labs identity system, design tokens, guidelines, and production-ready assets.

> Status: **Candidate** — assets may be used in Shan Labs-owned prototypes, but are not yet approved for trademark registration or third-party distribution.

## Principles

- **One source of truth.** Edit the master symbol and token document, never generated files.
- **Calm foundation, visible ignition.** Cosmic Ink establishes trust; Ignition Coral supplies energy.
- **Accessible by default.** Brand expression must not compromise legibility or product usability.
- **System over decoration.** Every asset must remain recognizable, reproducible, and useful across products.

## Repository model

| Path | Purpose | Editing policy |
| --- | --- | --- |
| `source/` | Canonical editable masters | Edit intentionally |
| `tokens/brand.tokens.json` | Canonical design tokens | Edit intentionally |
| `assets/` | Generated production exports | Never edit manually |
| `tokens/dist/` | Generated code outputs | Never edit manually |
| `guidelines/` | Brand governance and usage | Review with brand changes |
| `docs/` | GitHub Pages palette site | HTML/CSS/JS authored; `docs/palette.json` and `docs/assets/` generated |
| `dist/` | Local release archives | Not committed |

## Assets

All logos live in `assets/logos/` (`svg/` and `png/`):

| Asset | Files | Use |
| --- | --- | --- |
| `symbol-coral` / `symbol-ink` / `symbol-white` | SVG + PNG (128–1024) | The standalone mark |
| `wordmark-ink` / `wordmark-white` | SVG | The standalone wordmark |
| `logo-horizontal-primary` | SVG + PNG (512, 1024) | Full logo — light backgrounds (default) |
| `logo-horizontal-white` | SVG + PNG (512, 1024) | Full logo — dark backgrounds |
| `logo-horizontal-ink` | SVG + PNG (512, 1024) | Full logo — monochrome and print |

`assets/icons/` holds the app-level icons (favicon, avatar). Import any SVG from the library via `@shanlabsx/brand/logos/<name>`.

## Quick start

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm verify
```

Asset builds require [Inkscape](https://inkscape.org/) on `PATH`. The project has no runtime or development npm dependencies.

Common commands:

```bash
pnpm build          # Generate tokens, SVG variants, PNGs, icons, and docs
pnpm build:docs     # Generate the GitHub Pages palette data
pnpm validate       # Validate token references and asset invariants
pnpm test           # Run deterministic unit tests
pnpm pack:brand     # Create a versioned ZIP and SHA-256 checksum
pnpm verify         # Run the complete release-quality pipeline
```

## Consuming design tokens

CSS:

```css
@import "@shanlabsx/brand/colors.css";

.button {
  color: var(--shan-color-foundation-ink);
  background: var(--shan-color-brand-ignition-500);
}
```

JavaScript or TypeScript:

```ts
import { brandColors, semanticColors } from "@shanlabsx/brand";

console.log(brandColors["color.brand.ignition.500"]);
console.log(semanticColors.dark.background); // "#0B1020"
```

CSS custom properties auto-switch for dark mode — style with
`var(--shan-color-semantic-background)` once and it resolves correctly under
`prefers-color-scheme` in both themes, backed by `@media (prefers-color-scheme: dark)`
in the generated stylesheet.

## Colors

Explore the full palette interactively at **<https://shanlabsx.github.io/brand/>** — click a swatch to copy its HEX value, or click a variable name to copy the CSS variable.

| Group | Colors |
| --- | --- |
| Brand — Ignition (50/100/300/500/700/900) | `#FFF4F6` · `#FFE3E9` · `#FF91A7` · `#FF4F70` · `#C62F4E` · `#6E1329` |
| Foundation | Ink `#0B1020` · Ink Surface `#191E30` · Ink Border `#2C3245` · Ink Muted `#7B869C` · Slate `#4E586D` · Mist `#E5E8EE` · Cloud `#F7F8FA` · Moon `#F3F0EB` · White `#FFFFFF` |
| Accent — Aurora (100/300/500/700) | `#E8E9FF` · `#AEADFF` · `#765CFF` · `#7054F7` |
| Accent — Fern (100/300/500/700) | `#E1EFE8` · `#87C7AB` · `#2FA67D` · `#00815D` |
| Accent — Solar (100/300/500/700) | `#F3EADB` · `#D6B170` · `#F5B942` · `#946900` |
| Semantic — light | `background #F7F8FA` · `foreground #0B1020` · `primary #FF4F70` · `primaryAction #C62F4E` · `success #00815D` · `warning #946900` · `intelligence #7054F7` |
| Semantic — dark | `background #0B1020` · `foreground #FFFFFF` · `primary #FF91A7` · `success #87C7AB` · `warning #D6B170` · `intelligence #AEADFF` |

Every accent family ships a `500` brand anchor plus a `700` step verified for
WCAG AA text/icon contrast on light surfaces and a `300` step verified for
dark surfaces — see [`guidelines/brand-guidelines.md`](guidelines/brand-guidelines.md#accessibility)
for the full, test-enforced contrast table. Colors are never hand-picked:
every derived step comes from `scripts/color.mjs`, an OKLCH-based generator
that preserves hue/chroma from the approved anchor and only shifts
perceptual lightness until the target contrast ratio is met.

## Releasing

1. Move the brand status to `approved` when the release is authorized.
2. Update `brand.version` and `package.json` together.
3. Run `pnpm verify` and review the generated archive.
4. Commit the approved source changes.
5. Create an annotated tag such as `v1.0.0` and push it.

The release workflow validates the repository and publishes the versioned ZIP plus checksum to GitHub Releases.

## Ownership

Shan Labs owns this repository. All brand assets are proprietary unless a specific asset or release explicitly states otherwise. See [LICENSE.md](LICENSE.md).
