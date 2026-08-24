import { sharedConfig } from '../../eslint.config.mjs';

export default [
  ...sharedConfig,

  {
    ignores: ['drizzle/**'],
  },

  {
    files: ['src/**/*.ts', 'drizzle.config.ts'],

    rules: {
      'no-console': 'off',
    },
  },
];
