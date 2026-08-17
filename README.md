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

`assets/icons/` holds the app-level icons (favicon, avatar). Import any SVG from the library via `@labsbyshan/brand/logos/<name>`.

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
@import "@labsbyshan/brand/colors.css";

.button {
  color: var(--shan-color-foundation-ink);
  background: var(--shan-color-brand-ignition-500);
}
```

JavaScript or TypeScript:

```ts
import { brandColors } from "@labsbyshan/brand";

console.log(brandColors["color.brand.ignition.500"]);
```

## Colors

Explore the full palette interactively at **<https://labsbyshan.github.io/brand/>** — click a swatch to copy its HEX value, or shift+click to copy its CSS variable.

| Group | Colors |
| --- | --- |
| Brand — Ignition | `#FFF4F6` · `#FFE3E9` · `#FF91A7` · `#FF4F70` · `#C62F4E` · `#6E1329` |
| Foundation | `#0B1020` · `#4E586D` · `#E5E8EE` · `#F7F8FA` · `#F3F0EB` · `#FFFFFF` |
| Accent | `#765CFF` · `#2FA67D` · `#F5B942` |
| Semantic | `background #F7F8FA` · `foreground #0B1020` · `primary #FF4F70` · `primaryAction #C62F4E` · `primarySubtle #FFE3E9` · `success #2FA67D` · `warning #F5B942` · `intelligence #765CFF` |

## Releasing

1. Move the brand status to `approved` when the release is authorized.
2. Update `brand.version` and `package.json` together.
3. Run `pnpm verify` and review the generated archive.
4. Commit the approved source changes.
5. Create an annotated tag such as `v1.0.0` and push it.

The release workflow validates the repository and publishes the versioned ZIP plus checksum to GitHub Releases.

## Ownership

Shan Labs owns this repository. All brand assets are proprietary unless a specific asset or release explicitly states otherwise. See [LICENSE.md](LICENSE.md).
