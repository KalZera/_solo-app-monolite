module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
  ],
  env: {
    node: true,
    es2022: true,
  },
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
  rules: {
    camelcase: 'off',
    '@stylistic/max-len': ['off', {
      code: 80,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreComments: false,
    }],
  },
};
