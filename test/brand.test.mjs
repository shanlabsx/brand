import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generatePalette } from '../scripts/build-docs.mjs';
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

test('generated variants carry variant-specific titles', async () => {
  const favicon = await readFile(`${root}/assets/icons/favicon.svg`, 'utf8');
  assert.match(favicon, /<title id="title">Shan Labs favicon<\/title>/);
  const coral = await readFile(`${root}/assets/logos/svg/symbol-coral.svg`, 'utf8');
  assert.match(coral, /<title id="title">Shan Labs symbol — coral<\/title>/);
  const whiteLogo = await readFile(`${root}/assets/logos/svg/logo-horizontal-white.svg`, 'utf8');
  assert.match(whiteLogo, /<title id="title">Shan Labs horizontal logo — white<\/title>/);
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
