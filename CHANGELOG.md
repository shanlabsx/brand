# Changelog

All notable changes to the Shan Labs brand system are documented here.

The project follows [Semantic Versioning](https://semver.org/):

- **Major:** identity, name, symbol geometry, or core palette changes.
- **Minor:** new approved formats, templates, channels, or product accents.
- **Patch:** corrected exports, metadata, documentation, or non-visual defects.

## [Unreleased]

### Changed

- Symbol geometry redefined as the approved three-bar mark (two horizontal rails linked by a diagonal bar).
- Logo assets reorganized into `symbol-*`, `wordmark-*`, and `logo-horizontal-{primary,white,ink}`; the previous `lockup-horizontal-*` and top-level `shan-labs-*` files are removed.
- Logo directories and package exports renamed from `logo` to `logos` for consistent plural naming.

### Added

- Initial Shan Labs symbol and color system.
- DTCG-compatible source tokens with CSS, JSON, and TypeScript outputs.
- Deterministic SVG, PNG, favicon, avatar, and release archive generation.
- Asset validation, accessibility tests, continuous integration, and release automation.
