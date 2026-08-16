import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { readJson, root, write } from './lib.mjs';

const config = await readJson('brand.config.json');
const roots = ['assets', 'tokens/dist', 'guidelines', 'README.md', 'LICENSE.md'];

async function filesAt(path) {
  const absolute = resolve(root, path);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = resolve(absolute, entry.name);
    if (entry.isDirectory()) files.push(...await filesAt(relative(root, child)));
    else files.push(relative(root, child));
  }
  return files;
}

const files = [];
for (const path of roots) {
  if (path.includes('.')) files.push(path);
  else files.push(...await filesAt(path));
}
files.sort();

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let value = n;
  for (let i = 0; i < 8; i += 1) value = (value & 1) ? 0xEDB88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
const crc32 = (buffer) => {
  let crc = 0xFFFFFFFF;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
};
const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; };

const local = [];
const central = [];
let offset = 0;
for (const path of files) {
  const name = Buffer.from(path.replaceAll('\\', '/'));
  const data = await readFile(resolve(root, path));
  const compressed = deflateRawSync(data, { level: 9 });
  const crc = crc32(data);
  const header = Buffer.concat([
    Buffer.from('504b0304', 'hex'), u16(20), u16(0), u16(8), u16(0), u16(0),
    u32(crc), u32(compressed.length), u32(data.length), u16(name.length), u16(0), name
  ]);
  local.push(header, compressed);
  central.push(Buffer.concat([
    Buffer.from('504b0102', 'hex'), u16(20), u16(20), u16(0), u16(8), u16(0), u16(0),
    u32(crc), u32(compressed.length), u32(data.length), u16(name.length), u16(0), u16(0),
    u16(0), u16(0), u32(0), u32(offset), name
  ]));
  offset += header.length + compressed.length;
}

const centralDirectory = Buffer.concat(central);
const archive = Buffer.concat([
  ...local,
  centralDirectory,
  Buffer.from('504b0506', 'hex'), u16(0), u16(0), u16(files.length), u16(files.length),
  u32(centralDirectory.length), u32(offset), u16(0)
]);
const basename = `shan-labs-brand-v${config.brand.version}`;
await write(`dist/${basename}.zip`, archive);
await write(`dist/${basename}.sha256`, `${createHash('sha256').update(archive).digest('hex')}  ${basename}.zip\n`);
console.log(`✓ Packed ${files.length} files into ${basename}.zip`);
