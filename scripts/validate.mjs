import { access, readFile } from 'node:fs/promises';
import { root, flattenTokens, readJson, resolveTokenValue } from './lib.mjs';

const config = await readJson('brand.config.json');
const tokenDocument = await readJson('tokens/brand.tokens.json');
const tokens = flattenTokens(tokenDocument);
const errors = [];

for (const asset of config.requiredAssets) {
  try { await access(`${root}/${asset}`); } catch { errors.push(`Missing required asset: ${asset}`); }
}

for (const [name, token] of tokens) {
  try {
    const value = resolveTokenValue(token.$value, tokens);
    if (token.$type === 'color' && !/^#[0-9A-F]{6}$/.test(value)) {
      errors.push(`Color token ${name} must resolve to uppercase six-digit HEX; received ${value}`);
    }
  } catch (error) {
    errors.push(error.message);
  }
}

const sourceSvg = await readFile(`${root}/${config.source.symbol}`, 'utf8');
for (const forbidden of ['<script', '<image', 'href=', 'filter=', 'style=']) {
  if (sourceSvg.includes(forbidden)) errors.push(`Source SVG contains forbidden content: ${forbidden}`);
}
if (!sourceSvg.includes('viewBox="0 0 512 512"')) errors.push('Source SVG must use the canonical 512 × 512 viewBox.');

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`✓ ${config.brand.name} ${config.brand.version}: ${tokens.size} tokens and ${config.requiredAssets.length} required assets validated.`);
}
