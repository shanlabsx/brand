import { mkdir, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { root, readJson, flattenTokens, resolveTokenValue, svgWithColor, svgWithColors, write } from './lib.mjs';

const config = await readJson('brand.config.json');
const symbolSource = await readFile(new URL(`../${config.source.symbol}`, import.meta.url), 'utf8');
const wordmarkSource = await readFile(new URL(`../${config.source.wordmark}`, import.meta.url), 'utf8');

// Colors come from tokens/brand.tokens.json — the canonical source — never
// hardcoded here, so a token change can't silently drift from the assets it produces.
const tokens = flattenTokens(await readJson('tokens/brand.tokens.json'));
function tokenHex(name) {
  const token = tokens.get(name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  return resolveTokenValue(token.$value, tokens);
}
const CORAL = tokenHex('color.brand.ignition.500');
const INK = tokenHex('color.foundation.ink');
const WHITE = tokenHex('color.foundation.white');

const variants = { coral: CORAL, ink: INK, white: WHITE };

const runtimeHome = `${root}/.cache/render-home`;
await Promise.all([
  mkdir(`${runtimeHome}/.config`, { recursive: true }),
  mkdir(`${runtimeHome}/.cache`, { recursive: true }),
  mkdir(`${runtimeHome}/.local/share`, { recursive: true })
]);

function render(input, output, width, height) {
  return new Promise((resolve, reject) => {
    const child = spawn('inkscape', [
      input,
      '--export-type=png',
      `--export-filename=${output}`,
      `--export-width=${width}`,
      ...(height === undefined ? [] : [`--export-height=${height}`]),
      '--export-background-opacity=0'
    ], {
      stdio: 'inherit',
      env: {
        ...process.env,
        HOME: runtimeHome,
        XDG_CONFIG_HOME: `${runtimeHome}/.config`,
        XDG_CACHE_HOME: `${runtimeHome}/.cache`,
        XDG_DATA_HOME: `${runtimeHome}/.local/share`
      }
    });
    child.once('error', (error) => {
      if (error.code === 'ENOENT') reject(new Error('Inkscape is required to build raster assets. Install Inkscape and retry.'));
      else reject(error);
    });
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`Inkscape exited with status ${code}`)));
  });
}

for (const [name, color] of Object.entries(variants)) {
  const svg = svgWithColor(symbolSource, CORAL, color, `Shan Labs symbol — ${name}`);
  const svgPath = `assets/logos/svg/symbol-${name}.svg`;
  await write(svgPath, svg);
  for (const size of [128, 256, 512, 1024]) {
    await render(`${root}/${svgPath}`, `${root}/assets/logos/png/symbol-${name}-${size}.png`, size);
  }
}

const symbolPaths = symbolSource.match(/<path\b[^>]*(?:\/|>[\s\S]*?<\/path>)/g);
let symbolGeometry = symbolSource.match(/<g[\s\S]*?<\/g>/)?.[0];
const wordmarkGeometry = wordmarkSource.match(/<g[\s\S]*<\/g>/)?.[0];
if (!symbolPaths || symbolPaths.length !== 3) throw new Error('Source symbol must contain three path elements.');
if (!symbolGeometry) {
  symbolGeometry = symbolPaths.map(p => p.replace(/fill="#[^"]*"/g, 'fill="currentColor"')).join('\n  ');
}
if (!wordmarkGeometry) throw new Error('Source wordmark must contain glyph groups.');
const logoTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1079.1701 252.02001" role="img" aria-labelledby="title desc">
  <title id="title">Shan Labs horizontal logo</title>
  <desc id="desc">The Shan Labs symbol and wordmark side by side.</desc>
  <g transform="translate(-14.437913 24)">${symbolPaths.join('\n    ')}</g>
  <g transform="translate(249.945 63.746)">${wordmarkGeometry}</g>
</svg>\n`;

const logoVariants = {
  primary: {},
  ink: { [CORAL]: INK },
  white: { [CORAL]: WHITE, [INK]: WHITE }
};
for (const [name, replacements] of Object.entries(logoVariants)) {
  const svg = svgWithColors(logoTemplate, replacements, `Shan Labs horizontal logo — ${name}`);
  const svgPath = `assets/logos/svg/logo-horizontal-${name}.svg`;
  await write(svgPath, svg);
  for (const width of [512, 1024]) {
    await render(`${root}/${svgPath}`, `${root}/assets/logos/png/logo-horizontal-${name}-${width}.png`, width);
  }
}

await write('assets/logos/svg/wordmark-ink.svg', svgWithColors(wordmarkSource, {}, 'Shan Labs wordmark — ink'));
await write('assets/logos/svg/wordmark-white.svg', svgWithColors(wordmarkSource, { [INK]: WHITE }, 'Shan Labs wordmark — white'));

// Favicon and avatar are hand-crafted to exact specs (1:32 scale, baked coordinates).
// favicon.svg: 16×16 viewBox, mark 10u×12u at x 3..13 y 2..14 (1:32 of master, ratio 3:1:4:1:3)
// avatar-dark.svg: 512×512 viewBox with mark scaled 0.75 and offset to center (coordinates baked, no transforms)
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="img" aria-labelledby="title desc">
  <title id="title">Shan Labs favicon</title>
  <desc id="desc">Two horizontal rails linked by a 45° diagonal bar, constructed on a 32-unit grid.</desc>
  <path fill="${CORAL}" d="M3 2H13V5H3Z"></path>
  <path fill="${CORAL}" d="M3 6H9L13 10H7Z"></path>
  <path fill="${CORAL}" d="M3 11H13V14H3Z"></path>
</svg>\n`;
await write('assets/icons/favicon.svg', favicon);

// Avatar uses scaled symbol geometry with coordinates baked in (no transforms)
const avatarMarkScaled = symbolPaths
  .map(p => p.replace(/fill="#[^"]*"/g, `fill="${CORAL}"`))
  .map(p => p
    .replace(/M(\d+) (\d+)/g, (m, x, y) => `M${Math.round(Number(x) * 0.75 + 88)} ${Math.round(Number(y) * 0.75 + 88)}`)
    .replace(/H(\d+)/g, (m, x) => `H${Math.round(Number(x) * 0.75 + 88)}`)
    .replace(/L(\d+) (\d+)/g, (m, x, y) => `L${Math.round(Number(x) * 0.75 + 88)} ${Math.round(Number(y) * 0.75 + 88)}`)
    .replace(/V(\d+)/g, (m, y) => `V${Math.round(Number(y) * 0.75 + 88)}`)
  )
  .join('\n  ');
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
  <title id="title">Shan Labs avatar — dark</title>
  <desc id="desc">The Shan Labs symbol on Cosmic Ink, padded for circular and rounded-square crops.</desc>
  <rect width="512" height="512" fill="${INK}"/>
  ${avatarMarkScaled}
</svg>\n`;
await write('assets/icons/avatar-dark.svg', avatar);

for (const size of [16, 32, 48, 180, 192, 512]) {
  await render(`${root}/assets/icons/favicon.svg`, `${root}/assets/icons/favicon-${size}.png`, size);
}
await render(`${root}/assets/icons/avatar-dark.svg`, `${root}/assets/icons/avatar-dark-1024.png`, 1024);
