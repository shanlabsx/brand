import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { DOCS_BRAND_ASSETS, generatePalette } from '../scripts/build-docs.mjs';
import { flattenTokens, readJson, resolveTokenValue, root } from '../scripts/lib.mjs';
import { contrastRatio, hexToOklch, oklchToHex } from '../scripts/color.mjs';

const tokenDocument = await readJson('tokens/brand.tokens.json');
const tokens = flattenTokens(tokenDocument);
const at = (path) => {
  const token = tokens.get(path);
  if (!token) throw new Error(`Unknown token: ${path}`);
  return resolveTokenValue(token.$value, tokens);
};

test('all token references resolve', () => {
  for (const [, token] of tokens) assert.doesNotThrow(() => resolveTokenValue(token.$value, tokens));
});

test('color math round-trips every token through OKLCH without drift', () => {
  for (const [name, token] of tokens) {
    if (token.$type !== 'color') continue;
    const hex = resolveTokenValue(token.$value, tokens);
    assert.equal(oklchToHex(hexToOklch(hex)), hex, `${name} (${hex}) should round-trip through OKLCH`);
  }
});

// Every pairing a consumer is expected to render as text, an icon, or a
// filled UI control on top of another token. Declared once here so a future
// token edit that breaks contrast fails the build instead of shipping.
const TEXT_PAIRS = [
  // Light mode — content directly on a surface.
  ['color.semantic.light.foreground', 'color.semantic.light.background', 4.5, 'body text on page background'],
  ['color.semantic.light.foreground', 'color.semantic.light.surface', 4.5, 'body text on card surface'],
  ['color.semantic.light.foregroundMuted', 'color.semantic.light.background', 4.5, 'secondary text on page background'],
  ['color.semantic.light.foregroundMuted', 'color.semantic.light.surface', 4.5, 'secondary text on card surface'],
  ['color.semantic.light.success', 'color.semantic.light.background', 4.5, 'success text/icon on page background'],
  ['color.semantic.light.success', 'color.semantic.light.surface', 4.5, 'success text/icon on card surface'],
  ['color.semantic.light.warning', 'color.semantic.light.background', 4.5, 'warning text/icon on page background'],
  ['color.semantic.light.warning', 'color.semantic.light.surface', 4.5, 'warning text/icon on card surface'],
  ['color.semantic.light.intelligence', 'color.semantic.light.background', 4.5, 'intelligence text/icon on page background'],
  ['color.semantic.light.intelligence', 'color.semantic.light.surface', 4.5, 'intelligence text/icon on card surface'],
  // Light mode — text set on top of a filled control.
  ['color.semantic.light.foreground', 'color.semantic.light.primary', 4.5, 'ink text on Ignition 500 primary button'],
  ['color.foundation.white', 'color.brand.ignition.700', 4.5, 'white text on Ignition 700 reversed action'],
  ['color.semantic.light.toastForeground', 'color.semantic.light.toastBackground', 4.5, 'toast text on toast fill'],
  // Dark mode — content directly on a surface.
  ['color.semantic.dark.foreground', 'color.semantic.dark.background', 4.5, 'dark body text on page background'],
  ['color.semantic.dark.foreground', 'color.semantic.dark.surface', 4.5, 'dark body text on elevated surface'],
  ['color.semantic.dark.foregroundMuted', 'color.semantic.dark.background', 4.5, 'dark secondary text on page background'],
  ['color.semantic.dark.foregroundMuted', 'color.semantic.dark.surface', 4.5, 'dark secondary text on elevated surface'],
  ['color.semantic.dark.primary', 'color.semantic.dark.background', 4.5, 'dark accent text on page background'],
  ['color.semantic.dark.primary', 'color.semantic.dark.surface', 4.5, 'dark accent text on elevated surface'],
  ['color.semantic.dark.success', 'color.semantic.dark.background', 4.5, 'dark success text/icon on page background'],
  ['color.semantic.dark.success', 'color.semantic.dark.surface', 4.5, 'dark success text/icon on elevated surface'],
  ['color.semantic.dark.warning', 'color.semantic.dark.background', 4.5, 'dark warning text/icon on page background'],
  ['color.semantic.dark.warning', 'color.semantic.dark.surface', 4.5, 'dark warning text/icon on elevated surface'],
  ['color.semantic.dark.intelligence', 'color.semantic.dark.background', 4.5, 'dark intelligence text/icon on page background'],
  ['color.semantic.dark.intelligence', 'color.semantic.dark.surface', 4.5, 'dark intelligence text/icon on elevated surface'],
  ['color.semantic.dark.toastForeground', 'color.semantic.dark.toastBackground', 4.5, 'dark toast text on toast fill']
];

for (const [fgPath, bgPath, minRatio, label] of TEXT_PAIRS) {
  test(`WCAG AA (${minRatio}:1): ${label} [${fgPath} on ${bgPath}]`, () => {
    const ratio = contrastRatio(at(fgPath), at(bgPath));
    assert.ok(ratio >= minRatio, `${label}: ${ratio.toFixed(2)}:1, need ${minRatio}:1`);
  });
}

test('source symbol stays deterministic and self-contained', async () => {
  const svg = await readFile(`${root}/source/logos/symbol.svg`, 'utf8');
  assert.match(svg, /viewBox="0 0 512 512"/);
  assert.doesNotMatch(svg, /<text|<image|<script|href=|mask/);
  assert.equal((svg.match(/fill="#FD4D6E"/g) ?? []).length, 3);
  assert.doesNotMatch(svg, /scale\(2\.031746031746032\)/, 'v2.0.0 symbol is grid-constructed without scale transforms');
});

test('source wordmark spells Shan Labs with a distinct word space', async () => {
  const svg = await readFile(`${root}/source/logos/wordmark.svg`, 'utf8');
  const positions = [...svg.matchAll(/data-x="([-\d.]+)"/g)].map((match) => Number(match[1]));
  assert.equal(positions.length, 8);
  const gaps = positions.slice(1).map((x, index) => x - positions[index]);
  assert.ok(gaps[3] > 60, `word gap of ${gaps[3]} should read clearly as a space`);
  assert.ok(gaps.every((gap, index) => index === 3 || gap < gaps[3]), 'word gap should be the widest gap');
});

test('routine build cannot rewrite approved visual assets', async () => {
  const [packageDocument, cleanScript] = await Promise.all([
    readJson('package.json'),
    readFile(`${root}/scripts/clean.mjs`, 'utf8')
  ]);
  assert.doesNotMatch(packageDocument.scripts.build, /assets/);
  assert.equal(packageDocument.scripts['build:assets'], undefined);
  assert.doesNotMatch(cleanScript, /reset\(['"]assets\//);
});

test('approved visual assets preserve reviewed geometry', async () => {
  const [favicon, avatar, primaryLogo] = await Promise.all([
    readFile(`${root}/assets/icons/favicon.svg`, 'utf8'),
    readFile(`${root}/assets/icons/avatar-dark.svg`, 'utf8'),
    readFile(`${root}/assets/logos/svg/logo-horizontal-primary.svg`, 'utf8')
  ]);

  assert.match(favicon, /viewBox="0 0 16 16"/);
  assert.match(favicon, /aria-label="Shan Labs"/);
  assert.match(favicon, /M3 2H13V5H3Z/);
  assert.match(favicon, /M3 6H9L13 10H7Z/);
  assert.match(favicon, /M3 11H13V14H3Z/);

  assert.match(avatar, /viewBox="0 0 512 512"/);
  assert.match(avatar, /M136 112H376V184H136Z/);
  assert.match(avatar, /M136 208H280L376 304H232Z/);
  assert.match(avatar, /M136 328H376V400H136Z/);

  assert.match(primaryLogo, /viewBox="0 0 983\.97 165"/);
  assert.match(primaryLogo, /Symbol height = cap height × 1\.30; gap = symbol width × 0\.30\./);
  assert.match(primaryLogo, /transform="scale\(0\.4296875\) translate\(-96 -64\)"/);
  assert.match(primaryLogo, /transform="translate\(178\.75 15\.96\)"/);
});

test('docs palette.json stays in sync with canonical tokens', async () => {
  const palette = generatePalette(tokenDocument, await readJson('brand.config.json'));
  assert.deepEqual(JSON.parse(await readFile(`${root}/docs/palette.json`, 'utf8')), palette);
});

test('docs colors.css stays in sync with tokens/dist/colors.css', async () => {
  const [generated, copy] = await Promise.all([
    readFile(`${root}/tokens/dist/colors.css`, 'utf8'),
    readFile(`${root}/docs/assets/colors.css`, 'utf8')
  ]);
  assert.equal(copy, generated);
});

test('docs use Pages-safe approved brand assets', async () => {
  for (const source of DOCS_BRAND_ASSETS) {
    const [approved, published] = await Promise.all([
      readFile(resolve(root, source)),
      readFile(resolve(root, 'docs/assets', basename(source)))
    ]);
    assert.deepEqual(published, approved, `${basename(source)} must match its approved asset`);
  }

  const pages = [
    ['index.html', './'],
    ['logos.html', './logos.html']
  ];
  for (const [page, currentHref] of pages) {
    const html = await readFile(resolve(root, 'docs', page), 'utf8');
    const brandLink = html.match(/<a class="brand"[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.match(brandLink, /assets\/logo-horizontal-white\.svg/);
    assert.equal((brandLink.match(/<img\b/g) ?? []).length, 1, `${page} header must use one integrated logo image`);
    assert.doesNotMatch(brandLink, /<span>Shan Labs<\/span>/);
    assert.match(html, new RegExp(`<a href="${currentHref.replaceAll('.', '\\.')}" aria-current="page">`));
    assert.doesNotMatch(html, /(?:src|href)="\.\.\/assets\//, `${page} must not escape the GitHub Pages root`);

    for (const [, source] of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
      await assert.doesNotReject(access(resolve(root, 'docs', source)), `${page}: missing ${source}`);
    }
  }
});

test('shared docs script tolerates pages without a palette', async () => {
  const script = await readFile(`${root}/docs/app.js`, 'utf8');
  assert.match(script, /if \(!paletteRoot\) return;/);
  assert.match(script, /if \(paletteRoot\) \{/);
});

test('logo variants use token colors without editor cruft', async () => {
  const primary = await readFile(`${root}/assets/logos/svg/logo-horizontal-primary.svg`, 'utf8');
  assert.match(primary, /#FD4D6E/, 'v2.0.0 ignition.500 primary color');
  assert.match(primary, /#0B1020/, 'ink color');
  const white = await readFile(`${root}/assets/logos/svg/logo-horizontal-white.svg`, 'utf8');
  assert.doesNotMatch(white, /#FD4D6E|#0B1020/, 'white variant replaces brand colors');
  for (const svg of [primary, white]) {
    const colors = svg.match(/#[0-9A-Fa-f]{6}/g) ?? [];
    assert.ok(colors.every((color) => color === color.toUpperCase()), 'colors must use token casing');
    assert.doesNotMatch(svg, /c2pa:|sodipodi:|inkscape:/, 'no editor or provenance cruft');
  }
});
