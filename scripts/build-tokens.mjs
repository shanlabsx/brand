import { flattenTokens, readJson, resolveTokenValue, toKebabCase, write } from './lib.mjs';

const document = await readJson('tokens/brand.tokens.json');
const tokens = flattenTokens(document);
const resolved = Object.fromEntries(
  [...tokens].map(([name, token]) => [name, resolveTokenValue(token.$value, tokens)])
);

function rolesUnder(prefix) {
  const roles = {};
  for (const [name, value] of Object.entries(resolved)) {
    if (name.startsWith(prefix)) roles[name.slice(prefix.length)] = value;
  }
  return roles;
}

const lightRoles = rolesUnder('color.semantic.light.');
const darkRoles = rolesUnder('color.semantic.dark.');

// Auto-switching aliases: one custom property per semantic role that resolves
// to the light value by default and swaps to the dark value under
// prefers-color-scheme, so consumers write var(--shan-color-semantic-background)
// once instead of hand-authoring their own light/dark CSS.
const switchingVar = (role) => `--shan-color-semantic-${toKebabCase(role)}`;

const css = [
  '/* Generated from tokens/brand.tokens.json. Do not edit. */',
  ':root {',
  ...Object.entries(resolved).map(([name, value]) => `  --shan-${toKebabCase(name)}: ${value};`),
  '',
  '  /* Auto-switching semantic aliases (default: light) */',
  ...Object.entries(lightRoles).map(([role, value]) => `  ${switchingVar(role)}: ${value};`),
  '}',
  '',
  '@media (prefers-color-scheme: dark) {',
  '  :root {',
  ...Object.entries(darkRoles).map(([role, value]) => `    ${switchingVar(role)}: ${value};`),
  '  }',
  '}',
  ''
].join('\n');

const semanticColors = { light: lightRoles, dark: darkRoles };

const js = `// Generated from tokens/brand.tokens.json. Do not edit.
export const brandColors = ${JSON.stringify(resolved, null, 2)};
export const semanticColors = ${JSON.stringify(semanticColors, null, 2)};
export default brandColors;
`;

const dts = `export declare const brandColors: Readonly<${JSON.stringify(resolved, null, 2)}>;
export declare const semanticColors: Readonly<${JSON.stringify(semanticColors, null, 2)}>;
export default brandColors;
`;

await Promise.all([
  write('tokens/dist/colors.css', css),
  write('tokens/dist/index.js', js),
  write('tokens/dist/index.d.ts', dts),
  write('tokens/dist/tokens.json', `${JSON.stringify(resolved, null, 2)}\n`)
]);
