// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettier = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')
const unusedImports = require('eslint-plugin-unused-imports')

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'expo-env.d.ts'],
  },
  {
    plugins: {
      prettier,
      'unused-imports': unusedImports,
    },
    rules: {
      // Prettier violations surface as lint errors.
      'prettier/prettier': 'error',
      // i18next exposes a named `use` export alongside its default; the default
      // instance's `.use()` is intentional here.
      'import/no-named-as-default-member': 'off',
      // No file (screen/component) may exceed 250 lines — keeps components focused.
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      // Unused imports are removed automatically; unused vars are warnings.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
])
