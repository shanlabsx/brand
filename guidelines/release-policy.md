# Release Policy

## Source and distribution

The private repository is the source of truth. GitHub Releases are the distribution channel for approved, versioned asset bundles. A package registry is used only when multiple software products need machine-consumable tokens or SVGs.

## Versioning

- Major: breaking identity change.
- Minor: additive asset or token change.
- Patch: correction without intended visual change.

Every release archive includes approved assets, compiled tokens, guidelines, the repository README, and the brand license. Editable source files are intentionally excluded.

## Publication checklist

- Brand status is `approved`.
- Required assets validate successfully.
- Generated artifacts match the canonical source.
- Contrast tests pass.
- No restricted font or third-party trademark is included.
- `CHANGELOG.md` describes the change.
- Release ZIP checksum is generated and verified.
