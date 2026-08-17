import { mkdir, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { root, readJson, svgWithColor, svgWithColors, write } from './lib.mjs';

const config = await readJson('brand.config.json');
const symbolSource = await readFile(new URL(`../${config.source.symbol}`, import.meta.url), 'utf8');
const wordmarkSource = await readFile(new URL(`../${config.source.wordmark}`, import.meta.url), 'utf8');
const variants = {
  coral: '#FF4F70',
  ink: '#0B1020',
  white: '#FFFFFF'
};

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
  const svg = svgWithColor(symbolSource, color, `Shan Labs symbol — ${name}`);
  const svgPath = `assets/logo/svg/symbol-${name}.svg`;
  await write(svgPath, svg);
  for (const size of [128, 256, 512, 1024]) {
    await render(`${root}/${svgPath}`, `${root}/assets/logo/png/symbol-${name}-${size}.png`, size);
  }
}

const symbolMask = symbolSource.match(/<mask[\s\S]*?<\/mask>/)?.[0];
const symbolGeometry = symbolSource.match(/<g[\s\S]*?<\/g>/)?.[0];
const wordmarkGeometry = wordmarkSource.match(/<g[\s\S]*<\/g>/)?.[0];
if (!symbolMask || !symbolGeometry) throw new Error('Source symbol must contain a connector-cut mask and a root geometry group.');
if (!wordmarkGeometry) throw new Error('Source wordmark must contain glyph groups.');
const lockupTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1327.4 288" role="img" aria-labelledby="title desc">
  <title id="title">Shan Labs horizontal lockup</title>
  <desc id="desc">The Shan Labs symbol and wordmark side by side.</desc>
  <g transform="translate(24 24) scale(0.46875)">${symbolMask}${symbolGeometry}</g>
  <g transform="translate(312 66) scale(1.1728)">${wordmarkGeometry}</g>
</svg>\n`;

const lockupVariants = {
  coral: {},
  ink: { '#FF4F70': '#0B1020' },
  white: { '#FF4F70': '#FFFFFF', '#0B1020': '#FFFFFF' }
};
for (const [name, replacements] of Object.entries(lockupVariants)) {
  const svg = svgWithColors(lockupTemplate, replacements, `Shan Labs horizontal lockup — ${name}`);
  const svgPath = `assets/logo/svg/lockup-horizontal-${name}.svg`;
  await write(svgPath, svg);
  for (const width of [512, 1024]) {
    await render(`${root}/${svgPath}`, `${root}/assets/logo/png/lockup-horizontal-${name}-${width}.png`, width);
  }
}

const favicon = svgWithColor(symbolSource, '#FF4F70', 'Shan Labs favicon');
await write('assets/icons/favicon.svg', favicon);
for (const size of [16, 32, 48, 180, 192, 512]) {
  await render(`${root}/assets/icons/favicon.svg`, `${root}/assets/icons/favicon-${size}.png`, size);
}

const avatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Shan Labs avatar">
  <rect width="1024" height="1024" fill="#0B1020"/>
  <g transform="translate(88 88) scale(1.65625)">${symbolMask}${symbolGeometry}</g>
</svg>\n`;
await write('assets/icons/avatar-dark.svg', avatar);
await render(`${root}/assets/icons/avatar-dark.svg`, `${root}/assets/icons/avatar-dark-1024.png`, 1024);

// Canonical top-level brand files mirror the library exports above.
await write('assets/shan-labs-horizontal-coral.svg', svgWithColors(lockupTemplate, {}, 'Shan Labs horizontal lockup — coral'));
await render(`${root}/assets/shan-labs-horizontal-coral.svg`, `${root}/assets/shan-labs-horizontal-coral.png`, 1024);
await write('assets/shan-labs-symbol-coral.svg', svgWithColor(symbolSource, '#FF4F70', 'Shan Labs symbol — coral'));
await render(`${root}/assets/shan-labs-symbol-coral.svg`, `${root}/assets/shan-labs-symbol-coral.png`, 512);
