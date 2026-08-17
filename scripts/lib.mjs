import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export const root = resolve(import.meta.dirname, '..');

export async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), 'utf8'));
}

export async function write(path, contents) {
  const output = resolve(root, path);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, contents);
}

export async function reset(path) {
  await rm(resolve(root, path), { recursive: true, force: true });
  await mkdir(resolve(root, path), { recursive: true });
}

export function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[.\s_]+/g, '-').toLowerCase();
}

export function flattenTokens(node, prefix = [], result = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && '$value' in value) {
      result.set([...prefix, key].join('.'), value);
    } else if (value && typeof value === 'object') {
      flattenTokens(value, [...prefix, key], result);
    }
  }
  return result;
}

export function resolveTokenValue(value, tokens, seen = new Set()) {
  const match = typeof value === 'string' && value.match(/^\{(.+)\}$/);
  if (!match) return value;
  const reference = match[1];
  if (seen.has(reference)) throw new Error(`Circular token reference: ${reference}`);
  const token = tokens.get(reference);
  if (!token) throw new Error(`Unknown token reference: ${reference}`);
  return resolveTokenValue(token.$value, tokens, new Set([...seen, reference]));
}

export function svgWithColors(source, replacements, title) {
  let output = source.replace(/(<title[^>]*>).*?(<\/title>)/s, `$1${title}$2`);
  for (const [from, to] of Object.entries(replacements)) output = output.replaceAll(from, to);
  return output;
}

export function svgWithColor(source, color, title) {
  return svgWithColors(source, { '#FF4F70': color }, title);
}
