import { mkdir, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { root, readJson, svgWithColor, write } from './lib.mjs';

const config = await readJson('brand.config.json');
const source = await readFile(new URL(`../${config.source.symbol}`, import.meta.url), 'utf8');
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

function render(input, output, size) {
  return new Promise((resolve, reject) => {
    const child = spawn('inkscape', [
      input,
      '--export-type=png',
      `--export-filename=${output}`,
      `--export-width=${size}`,
      `--export-height=${size}`,
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
  const svg = svgWithColor(source, color, `Shan Labs symbol — ${name}`);
  const svgPath = `assets/logo/svg/symbol-${name}.svg`;
  await write(svgPath, svg);
  for (const size of [128, 256, 512, 1024]) {
    await render(`${root}/${svgPath}`, `${root}/assets/logo/png/symbol-${name}-${size}.png`, size);
  }
}

const favicon = svgWithColor(source, '#FF4F70', 'Shan Labs favicon');
await write('assets/icons/favicon.svg', favicon);
for (const size of [16, 32, 48, 180, 192, 512]) {
  await render(`${root}/assets/icons/favicon.svg`, `${root}/assets/icons/favicon-${size}.png`, size);
}

const symbolGeometry = source.match(/<g[\s\S]*<\/g>/)?.[0];
if (!symbolGeometry) throw new Error('Source symbol must contain a root geometry group.');
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="Shan Labs avatar">
  <rect width="1024" height="1024" fill="#0B1020"/>
  <svg x="88" y="88" width="848" height="848" viewBox="0 0 512 512">${symbolGeometry}</svg>
</svg>\n`;
await write('assets/icons/avatar-dark.svg', avatar);
await render(`${root}/assets/icons/avatar-dark.svg`, `${root}/assets/icons/avatar-dark-1024.png`, 1024);
