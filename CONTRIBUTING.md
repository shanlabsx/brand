# Contributing

Brand changes carry product-wide consequences. Keep each change focused, documented, and reversible.

## Workflow

1. Create a branch from `main`.
2. Change canonical files only: `source/`, `tokens/brand.tokens.json`, configuration, scripts, or guidelines.
3. Run `pnpm verify`.
4. Commit generated assets with their canonical source changes.
5. Open a pull request that explains the intent, affected surfaces, accessibility impact, and migration path.

## Approval states

`draft → candidate → approved → deprecated`

Only approved assets may be released publicly, used in production, or supplied to third parties.

## Pull request requirements

- Include before-and-after previews for visual changes.
- State whether the change affects existing consumers.
- Confirm WCAG contrast for interface colors.
- Never commit unlicensed fonts or third-party marks.
- Never modify generated files without changing their source or generator.
