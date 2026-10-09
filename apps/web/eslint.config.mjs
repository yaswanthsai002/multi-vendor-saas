import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

import { sharedConfig } from '../../eslint.config.mjs';

// ponytail: ESLint 9 Flat Config throws if Next's preset re-declares plugins already configured in sharedConfig
function stripDuplicatePlugins(configs) {
  return configs.map((config) => {
    if (!config.plugins) return config;
    const restPlugins = { ...config.plugins };
    delete restPlugins.import;
    delete restPlugins['@typescript-eslint'];
    return {
      ...config,
      plugins: restPlugins,
    };
  });
}

const eslintConfig = defineConfig([
  ...sharedConfig,

  ...stripDuplicatePlugins(nextVitals),
  ...stripDuplicatePlugins(nextTs),

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  {
    rules: {
      'no-console': 'warn',
    },
  },
]);

export default eslintConfig;
