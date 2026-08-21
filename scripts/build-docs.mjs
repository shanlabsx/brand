import { copyFile, mkdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flattenTokens, readJson, resolveTokenValue, root, toKebabCase, write } from './lib.mjs';

const isToken = (value) => value && typeof value === 'object' && '$value' in value;

export const DOCS_BRAND_ASSETS = Object.freeze([
  'assets/logos/svg/logo-horizontal-primary.svg',
  'assets/logos/svg/logo-horizontal-ink.svg',
  'assets/logos/svg/logo-horizontal-white.svg',
  'assets/logos/svg/symbol-coral.svg',
  'assets/logos/svg/symbol-ink.svg',
  'assets/logos/svg/symbol-white.svg',
  'assets/logos/svg/wordmark-ink.svg',
  'assets/logos/svg/wordmark-white.svg',
  'assets/icons/avatar-dark.svg',
  'assets/icons/favicon.svg'
]);

const SECTIONS = {
  'brand-ignition': { title: 'Ignition', caption: 'Brand scale', featured: true },
  foundation: { title: 'Foundation', caption: 'Neutrals and surfaces, light and dark' },
  'accent-aurora': { title: 'Aurora', caption: 'AI and experimental features' },
  'accent-fern': { title: 'Fern', caption: 'Success and growth' },
  'accent-solar': { title: 'Solar', caption: 'Warning and achievement' },
  'semantic-light': { title: 'Semantic — light', caption: 'Role-based aliases for light surfaces' },
  'semantic-dark': { title: 'Semantic — dark', caption: 'Role-based aliases for dark surfaces' }
};

function displayName(name) {
  return toKebabCase(name).split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

// Reverse index: for every primitive a semantic token points at, record which
// role(s) and mode(s) use it — e.g. ignition.500 is both light.primary and
// dark.primaryAction. Built from the tokens themselves so a swatch's "used
// as" label can never drift from what the token file actually says.
function buildUsageIndex(tokens) {
  const usage = new Map();
  for (const [name, token] of tokens) {
    const match = /^color\.semantic\.(light|dark)\.(.+)$/.exec(name);
    if (!match) continue;
    const [, mode, role] = match;
    if (typeof token.$value !== 'string' || !token.$value.startsWith('{')) continue;
    const reference = token.$value.slice(1, -1);
    if (!usage.has(reference)) usage.set(reference, []);
    usage.get(reference).push({ mode, label: displayName(role) });
  }
  return usage;
}

export function generatePalette(document, config) {
  const tokens = flattenTokens(document);
  const usage = buildUsageIndex(tokens);
  const sections = [];
  for (const [groupKey, group] of Object.entries(document.color)) {
    const entries = Object.entries(group);
    if (entries.every(([, value]) => isToken(value))) {
      sections.push(describeSection(groupKey, groupKey, group, tokens, usage));
    } else {
      for (const [sectionKey, colors] of entries) {
        sections.push(describeSection(groupKey, sectionKey, colors, tokens, usage));
      }
    }
  }
  return { brand: config.brand, sections };
}

function describeSection(groupKey, sectionKey, colors, tokens, usage) {
  const id = groupKey === sectionKey ? groupKey : `${groupKey}-${sectionKey}`;
  const prefix = groupKey === sectionKey ? `color.${groupKey}` : `color.${groupKey}.${sectionKey}`;
  const presentation = SECTIONS[id] ?? {};
  return {
    id,
    title: presentation.title ?? displayName(sectionKey),
    caption: presentation.caption ?? 'Brand colors',
    featured: presentation.featured === true,
    colors: Object.entries(colors)
      .filter(([name]) => !name.startsWith('$'))
      .map(([name, token]) => {
        const path = `${prefix}.${name}`;
        return {
          name: displayName(name),
          token: path,
          hex: resolveTokenValue(token.$value, tokens),
          cssVar: `--shan-${toKebabCase(path)}`,
          ...(typeof token.$value === 'string' && token.$value.startsWith('{')
            ? { reference: token.$value.slice(1, -1) }
            : {}),
          ...(token.$description ? { description: token.$description } : {}),
          ...(usage.get(path)?.length ? { usedAs: usage.get(path) } : {})
        };
      })
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const [document, config] = await Promise.all([
    readJson('tokens/brand.tokens.json'),
    readJson('brand.config.json')
  ]);
  const palette = generatePalette(document, config);
  const colorCount = palette.sections.reduce((total, section) => total + section.colors.length, 0);
  const docsAssetDirectory = resolve(root, 'docs/assets');
  await mkdir(docsAssetDirectory, { recursive: true });
  await Promise.all([
    ...DOCS_BRAND_ASSETS.map((source) => copyFile(resolve(root, source), resolve(docsAssetDirectory, basename(source)))),
    copyFile(resolve(root, 'tokens/dist/colors.css'), resolve(docsAssetDirectory, 'colors.css'))
  ]);
  await write('docs/palette.json', `${JSON.stringify(palette, null, 2)}\n`);
  console.log(`✓ Docs built: ${palette.sections.length} sections, ${colorCount} colors.`);
}
