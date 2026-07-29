import config from '@rocketseat/eslint-config/node.mjs'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

export default [
  ...config,
  ...neostandard({
    ignores: resolveIgnoresFromGitignore(),
    ts: true,
  }),
  {
    rules: {
      camelcase: 'off',
      '@stylistic/max-len': ['off', {
        code: 80,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreComments: false,
      }],
    },
  },
]
