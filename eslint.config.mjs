// @ts-check

import globals from "globals";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ['src/types.ts'],
  },
  {
    languageOptions: {
      globals: globals.browser
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
);
