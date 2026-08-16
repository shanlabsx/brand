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
  assert.doesNotMatch(svg, /<text|<image|<script|href=/);
  assert.equal((svg.match(/#FF4F70/g) ?? []).length, 2);
});
