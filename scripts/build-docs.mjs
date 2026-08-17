import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flattenTokens, readJson, resolveTokenValue, root, toKebabCase, write } from './lib.mjs';

const isToken = (value) => value && typeof value === 'object' && '$value' in value;

const SECTIONS = {
  'brand-ignition': { title: 'Ignition', caption: 'Brand scale', featured: true },
  foundation: { title: 'Foundation', caption: 'Neutrals and surfaces' },
  accent: { title: 'Accent', caption: 'Signal colors' },
  semantic: { title: 'Semantic', caption: 'Role-based aliases' }
};

function displayName(name) {
  return toKebabCase(name).split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

export function generatePalette(document, config) {
  const tokens = flattenTokens(document);
  const sections = [];
  for (const [groupKey, group] of Object.entries(document.color)) {
    const entries = Object.entries(group);
    if (entries.every(([, value]) => isToken(value))) {
      sections.push(describeSection(groupKey, groupKey, group, tokens));
    } else {
      for (const [sectionKey, colors] of entries) {
        sections.push(describeSection(groupKey, sectionKey, colors, tokens));
      }
    }
  }
  return { brand: config.brand, sections };
}

function describeSection(groupKey, sectionKey, colors, tokens) {
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
          ...(token.$description ? { description: token.$description } : {})
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
  const symbolTarget = resolve(root, 'docs/assets/symbol-coral.svg');
  await mkdir(dirname(symbolTarget), { recursive: true });
  await copyFile(resolve(root, 'assets/logos/svg/symbol-coral.svg'), symbolTarget);
  await write('docs/palette.json', `${JSON.stringify(palette, null, 2)}\n`);
  console.log(`✓ Docs built: ${palette.sections.length} sections, ${colorCount} colors.`);
}
