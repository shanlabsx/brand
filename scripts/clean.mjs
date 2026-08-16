import { reset } from './lib.mjs';

await Promise.all([
  reset('assets/logo/svg'),
  reset('assets/logo/png'),
  reset('assets/icons'),
  reset('tokens/dist'),
  reset('dist')
]);
