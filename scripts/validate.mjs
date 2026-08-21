import { createHash } from 'node:crypto';
import { access, readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { root, flattenTokens, readJson, resolveTokenValue } from './lib.mjs';

const config = await readJson('brand.config.json');
const tokenDocument = await readJson('tokens/brand.tokens.json');
const tokens = flattenTokens(tokenDocument);
const errors = [];

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else files.push(relative(root, path).replaceAll('\\', '/'));
  }
  return files;
}

const assetManifestPath = 'assets/manifest.json';
const assetManifest = await readJson(assetManifestPath);
if (assetManifest.algorithm !== 'sha256') errors.push(`Unsupported asset manifest algorithm: ${assetManifest.algorithm}`);

const approvedAssetPaths = Object.keys(assetManifest.files).sort();
const actualAssetPaths = (await filesUnder(resolve(root, 'assets')))
  .filter((path) => path !== assetManifestPath && !path.split('/').some((part) => part.startsWith('.')))
  .sort();

for (const path of actualAssetPaths.filter((path) => !assetManifest.files[path])) {
  errors.push(`Asset has not been approved: ${path}`);
}
for (const path of approvedAssetPaths.filter((path) => !actualAssetPaths.includes(path))) {
  errors.push(`Approved asset is missing: ${path}`);
}
for (const path of approvedAssetPaths.filter((path) => actualAssetPaths.includes(path))) {
  const digest = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');
  if (digest !== assetManifest.files[path]) errors.push(`Approved asset checksum mismatch: ${path}`);
}

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

const forbiddenContent = ['<script', '<image', 'href=', 'filter=', 'style='];
for (const [name, path] of Object.entries(config.source)) {
  const svg = await readFile(`${root}/${path}`, 'utf8');
  for (const forbidden of forbiddenContent) {
    if (svg.includes(forbidden)) errors.push(`Source ${name} contains forbidden content: ${forbidden}`);
  }
  if (!svg.includes('viewBox="')) errors.push(`Source ${name} must declare a viewBox.`);
  if (name === 'symbol' && !svg.includes('viewBox="0 0 512 512"')) errors.push('Source symbol must use the canonical 512 × 512 viewBox.');
}

const tokenColors = new Set([...tokens.values()]
  .filter((token) => token.$type === 'color')
  .map((token) => resolveTokenValue(token.$value, tokens)));
const functionalMaskColors = new Set(['#FFFFFF', '#000000']);
for (const asset of config.requiredAssets) {
  if (!asset.endsWith('.svg')) continue;
  const svg = await readFile(`${root}/${asset}`, 'utf8');
  for (const forbidden of [...forbiddenContent, 'c2pa:', 'sodipodi:', 'inkscape:']) {
    if (svg.includes(forbidden)) errors.push(`${asset} contains forbidden content: ${forbidden}`);
  }
  for (const color of svg.match(/#[0-9A-Fa-f]{6}/g) ?? []) {
    if (!tokenColors.has(color) && !functionalMaskColors.has(color)) {
      errors.push(`${asset} uses non-token color ${color}`);
    }
  }
}

// docs/styles.css must consume generated CSS custom properties, never
// hand-authored brand hex — guards against the exact drift this once had.
const docsStyles = await readFile(`${root}/docs/styles.css`, 'utf8');
for (const color of docsStyles.match(/#[0-9A-Fa-f]{6}/g) ?? []) {
  errors.push(`docs/styles.css contains literal color ${color}; reference a var(--shan-color-*) custom property from colors.css instead`);
}

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`✓ ${config.brand.name} ${config.brand.version}: ${tokens.size} tokens and ${config.requiredAssets.length} required assets validated.`);
}
