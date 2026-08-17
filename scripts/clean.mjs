import { reset } from './lib.mjs';

await Promise.all([
  reset('assets/logos/svg'),
  reset('assets/logos/png'),
  reset('assets/icons'),
  reset('tokens/dist'),
  reset('dist')
]);
