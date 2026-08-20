# Changelog

All notable changes to the Shan Labs brand system are documented here.

The project follows [Semantic Versioning](https://semver.org/):

- **Major:** identity, name, symbol geometry, or core palette changes.
- **Minor:** new approved formats, templates, channels, or product accents.
- **Patch:** corrected exports, metadata, documentation, or non-visual defects.

## [1.0.0] - 2026-08-20

### Fixed

- **`tokens/dist/` was never actually committed to git.** `.gitignore`'s unanchored `dist/` pattern matched it at any depth, so CI's "generated assets are committed" check never caught it — a fresh clone was missing the exact files `package.json`'s package entry point resolves to. Anchored the pattern to `/dist/` (the local release folder only) and committed the generated token outputs.

### Changed

- **Breaking token restructure:** `color.accent.*` families (Aurora, Fern, Solar) are now `100`/`300`/`700` scales generated around the existing `500` anchor instead of a single hex; `color.semantic.*` is split into parallel `light` and `dark` groups. The `500` anchors are unchanged — only their surrounding scale is new.
- `color.semantic.{light,warning,success,intelligence}` roles now resolve to a WCAG AA-verified `700` step (light) or `300` step (dark) instead of the raw `500` anchor, which failed text contrast for two of the three accents.
- `tokens/dist/colors.css` now emits an auto-switching `--shan-color-semantic-*` alias layer under `@media (prefers-color-scheme: dark)`, in addition to the explicit `light`/`dark` custom properties.
- `docs/styles.css` now consumes the generated `colors.css` instead of hand-authored hex; its hand-invented dark-mode palette is replaced with real, token-backed dark surfaces.
- `scripts/build-assets.mjs` reads brand colors from `tokens/brand.tokens.json` instead of hardcoding them, closing the single-source-of-truth gap between the token file and generated logos.
- Symbol geometry redefined as the approved three-bar mark (two horizontal rails linked by a diagonal bar).
- Logo assets reorganized into `symbol-*`, `wordmark-*`, and `logo-horizontal-{primary,white,ink}`; the previous `lockup-horizontal-*` and top-level `shan-labs-*` files are removed.
- Logo directories and package exports renamed from `logo` to `logos` for consistent plural naming.

### Added

- `scripts/color.mjs`: OKLCH color science (sRGB↔OKLCH, WCAG contrast, gamut-aware tone generation) used to derive every new color step from an approved anchor instead of hand-picking hex.
- `color.foundation.{inkSurface,inkBorder,onInkMuted}`: dark-mode neutral primitives, WCAG AA-verified against both `ink` and `inkSurface`.
- Automated contrast tests now cover every semantic text/icon pairing in both light and dark mode (previously 3 hand-picked pairs), plus an OKLCH round-trip check for every color token.
- `scripts/validate.mjs` flags any literal hex color reintroduced into `docs/styles.css`.
- Initial Shan Labs symbol and color system.
- DTCG-compatible source tokens with CSS, JSON, and TypeScript outputs.
- Deterministic SVG, PNG, favicon, avatar, and release archive generation.
- Asset validation, accessibility tests, continuous integration, and release automation.
