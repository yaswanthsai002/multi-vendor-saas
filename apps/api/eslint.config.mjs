import { sharedConfig } from '../../eslint.config.mjs';

export default [
  ...sharedConfig,

  {
    files: ['src/**/*.ts'],

    rules: {
      'no-console': 'off',
    },
  },

  {
    files: ['tests/**/*.ts', 'scripts/**/*.ts'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
