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
| `dist/` | Local release archives | Not committed |

## Quick start

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm verify
```

Asset builds require [Inkscape](https://inkscape.org/) on `PATH`. The project has no runtime or development npm dependencies.

Common commands:

```bash
pnpm build          # Generate tokens, SVG variants, PNGs, and icons
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

## Releasing

1. Move the brand status to `approved` when the release is authorized.
2. Update `brand.version` and `package.json` together.
3. Run `pnpm verify` and review the generated archive.
4. Commit the approved source changes.
5. Create an annotated tag such as `v1.0.0` and push it.

The release workflow validates the repository and publishes the versioned ZIP plus checksum to GitHub Releases.

## Ownership

Shan Labs owns this repository. All brand assets are proprietary unless a specific asset or release explicitly states otherwise. See [LICENSE.md](LICENSE.md).
