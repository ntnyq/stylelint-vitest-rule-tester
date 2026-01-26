// @ts-check

import { defineESLintConfig } from '@ntnyq/eslint-config'

export default defineESLintConfig({
  oxfmt: true,
  prettier: false,
  test: {
    overridesVitestRules: {
      'vitest/no-standalone-expect': 'off',
    },
  },
})
