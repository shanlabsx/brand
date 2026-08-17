import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reset, root } from './lib.mjs';

await Promise.all([
  reset('assets/logos/svg'),
  reset('assets/logos/png'),
  reset('assets/icons'),
  reset('tokens/dist'),
  reset('dist'),
  reset('docs/assets'),
  rm(resolve(root, 'docs/palette.json'), { force: true })
]);
