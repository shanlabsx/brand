import { readJson } from './lib.mjs';

const tag = process.argv[2];
const config = await readJson('brand.config.json');
const packageDocument = await readJson('package.json');
const expected = `v${config.brand.version}`;

if (tag !== expected || packageDocument.version !== config.brand.version) {
  console.error(`Version mismatch: tag=${tag}, brand=${expected}, package=v${packageDocument.version}`);
  process.exitCode = 1;
} else {
  console.log(`✓ Release versions match ${expected}`);
}
