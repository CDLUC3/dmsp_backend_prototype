// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

// Use standard rules AND one to check for missing awaits!
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic
);
