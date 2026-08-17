import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { flattenTokens, readJson, resolveTokenValue, root } from '../scripts/lib.mjs';

function luminance(hex) {
  const channels = hex.match(/[0-9A-F]{2}/g).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('all token references resolve', async () => {
  const tokens = flattenTokens(await readJson('tokens/brand.tokens.json'));
  for (const [, token] of tokens) assert.doesNotThrow(() => resolveTokenValue(token.$value, tokens));
});

test('approved interface color pairs meet WCAG AA for normal text', () => {
  assert.ok(contrast('0B1020', 'FF4F70') >= 4.5, 'Cosmic Ink on Ignition Coral 500');
  assert.ok(contrast('FFFFFF', 'C62F4E') >= 4.5, 'White on Ignition Coral 700');
  assert.ok(contrast('0B1020', 'F7F8FA') >= 4.5, 'Cosmic Ink on Cloud White');
});

test('source symbol stays deterministic and self-contained', async () => {
  const svg = await readFile(`${root}/source/logo/symbol.svg`, 'utf8');
  assert.match(svg, /viewBox="0 0 512 512"/);
  assert.doesNotMatch(svg, /<text|<image|<script|href=|mask/);
  assert.equal((svg.match(/fill="#FF4F70"/g) ?? []).length, 3);
  assert.match(svg, /scale\(2\.031746031746032\)/);
});

test('source wordmark spells Shan Labs with a distinct word space', async () => {
  const svg = await readFile(`${root}/source/logo/wordmark.svg`, 'utf8');
  const positions = [...svg.matchAll(/data-x="([-\d.]+)"/g)].map((match) => Number(match[1]));
  assert.equal(positions.length, 8);
  const gaps = positions.slice(1).map((x, index) => x - positions[index]);
  assert.ok(gaps[3] > 60, `word gap of ${gaps[3]} should read clearly as a space`);
  assert.ok(gaps.every((gap, index) => index === 3 || gap < gaps[3]), 'word gap should be the widest gap');
});

test('generated variants carry variant-specific titles', async () => {
  const favicon = await readFile(`${root}/assets/icons/favicon.svg`, 'utf8');
  assert.match(favicon, /<title id="title">Shan Labs favicon<\/title>/);
  const coral = await readFile(`${root}/assets/logo/svg/symbol-coral.svg`, 'utf8');
  assert.match(coral, /<title id="title">Shan Labs symbol — coral<\/title>/);
  const whiteLogo = await readFile(`${root}/assets/logo/svg/logo-horizontal-white.svg`, 'utf8');
  assert.match(whiteLogo, /<title id="title">Shan Labs horizontal logo — white<\/title>/);
});

test('logo variants use token colors without editor cruft', async () => {
  const primary = await readFile(`${root}/assets/logo/svg/logo-horizontal-primary.svg`, 'utf8');
  assert.match(primary, /#FF4F70/);
  assert.match(primary, /#0B1020/);
  const white = await readFile(`${root}/assets/logo/svg/logo-horizontal-white.svg`, 'utf8');
  assert.doesNotMatch(white, /#FF4F70|#0B1020/);
  for (const svg of [primary, white]) {
    const colors = svg.match(/#[0-9A-Fa-f]{6}/g) ?? [];
    assert.ok(colors.every((color) => color === color.toUpperCase()), 'colors must use token casing');
    assert.doesNotMatch(svg, /c2pa:|sodipodi:|inkscape:/, 'no editor or provenance cruft');
  }
});
