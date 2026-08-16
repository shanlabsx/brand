import { flattenTokens, readJson, resolveTokenValue, toKebabCase, write } from './lib.mjs';

const document = await readJson('tokens/brand.tokens.json');
const tokens = flattenTokens(document);
const resolved = Object.fromEntries(
  [...tokens].map(([name, token]) => [name, resolveTokenValue(token.$value, tokens)])
);

const css = [
  '/* Generated from tokens/brand.tokens.json. Do not edit. */',
  ':root {',
  ...Object.entries(resolved).map(([name, value]) => `  --shan-${toKebabCase(name)}: ${value};`),
  '}',
  ''
].join('\n');

const js = `// Generated from tokens/brand.tokens.json. Do not edit.\nexport const brandColors = ${JSON.stringify(resolved, null, 2)};\nexport default brandColors;\n`;
const dts = `export declare const brandColors: Readonly<${JSON.stringify(
  Object.fromEntries(Object.entries(resolved).map(([key, value]) => [key, value])),
  null,
  2
)}>;\nexport default brandColors;\n`;

await Promise.all([
  write('tokens/dist/colors.css', css),
  write('tokens/dist/index.js', js),
  write('tokens/dist/index.d.ts', dts),
  write('tokens/dist/tokens.json', `${JSON.stringify(resolved, null, 2)}\n`)
]);
