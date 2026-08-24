import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

import { sharedConfig } from '../../eslint.config.mjs';

const eslintConfig = defineConfig([
  ...sharedConfig,

  ...nextVitals,
  ...nextTs,

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  {
    rules: {
      'no-console': 'warn',
    },
  },
]);

export default eslintConfig;
