# stylelint-vitest-rule-tester

[![CI](https://github.com/ntnyq/stylelint-vitest-rule-tester/workflows/CI/badge.svg)](https://github.com/ntnyq/stylelint-vitest-rule-tester/actions)
[![NPM VERSION](https://img.shields.io/npm/v/stylelint-vitest-rule-tester.svg)](https://www.npmjs.com/package/stylelint-vitest-rule-tester)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/stylelint-vitest-rule-tester.svg)](https://www.npmjs.com/package/stylelint-vitest-rule-tester)
[![CODECOV](https://codecov.io/github/ntnyq/stylelint-vitest-rule-tester/graph/badge.svg?token=34A8PZF57N)](https://codecov.io/github/ntnyq/stylelint-vitest-rule-tester)
[![LICENSE](https://img.shields.io/github/license/ntnyq/stylelint-vitest-rule-tester.svg)](https://github.com/ntnyq/stylelint-vitest-rule-tester/blob/main/LICENSE)

> Styelint rule tester with Vitest.

## Install

```shell
npm install stylelint-vitest-rule-tester -D
```

```shell
yarn add stylelint-vitest-rule-tester -D
```

```shell
pnpm add stylelint-vitest-rule-tester -D
```

## Usage

### Built-in rules

```ts
import { run } from 'stylelint-vitest-rule-tester'
import { expect } from 'vitest'

run({
  name: 'no-empty-source',
  valid: [
    // string case
    `.class {}`,

    // object case with rule options
    {
      filename: 'disable.css',
      code: '',
      ruleOptions: [false],
    },

    // object case with stylelint config
    {
      description: 'HTML without CSS',
      stylelintConfig: {
        customSyntax: 'postcss-html',
      },
      code: '<html></html>',
    },
  ],
  invalid: [
    // invalid case
    {
      filename: 'empty.css',
      code: '',
      warnings(warnings) {
        expect(warnings).toHaveLength(1)
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 1,
              "line": 1,
              "rule": "no-empty-source",
              "severity": "error",
              "text": "Unexpected empty source (no-empty-source)",
              "url": undefined,
            },
          ]
        `)
      },
    },

    // invalid case with rule options url
    {
      filename: 'empty-with-url.css',
      code: '',
      ruleOptions: [
        true,
        {
          url: 'https://github.com/stylelint/stylelint/tree/main/lib/rules/no-empty-source',
        },
      ],
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 1,
              "line": 1,
              "rule": "no-empty-source",
              "severity": "error",
              "text": "Unexpected empty source (no-empty-source)",
              "url": "https://github.com/stylelint/stylelint/tree/main/lib/rules/no-empty-source",
            },
          ]
        `)
      },
    },

    // invalid case with stylelint config
    {
      description: 'CSS block in HTML',
      stylelintConfig: {
        customSyntax: 'postcss-html',
      },
      code: '<style>\n</style>',
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 2,
              "line": 2,
              "rule": "no-empty-source",
              "severity": "error",
              "text": "Unexpected empty source (no-empty-source)",
              "url": undefined,
            },
          ]
        `)
      },
    },
  ],
})
```

### Plugin rules

```ts
import stylelintSCSS from 'stylelint-scss'
import { run } from 'stylelint-vitest-rule-tester'
import { expect } from 'vitest'

run({
  name: 'scss/dollar-variable-default',
  stylelintConfig: {
    plugins: stylelintSCSS,
    customSyntax: 'postcss-scss',
  },
  valid: [
    `a { color: blue }`,
    `$var: 10px !default`,
    `a { $var: 10px !default }`,
    `.class { a { $var: 10px !default } }`,
  ],
  invalid: [
    {
      description: 'global vars without !default',
      filename: 'global.scss',
      code: $`
        $var: 10px
      `,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 11,
              "endLine": 1,
              "line": 1,
              "rule": "scss/dollar-variable-default",
              "severity": "error",
              "text": "Expected !default flag for "$var" (scss/dollar-variable-default)",
              "url": undefined,
            },
          ]
        `)
      },
    },
  ],
})
```

## Credits

- [antfu/eslint-vitest-rule-tester](https://github.com/antfu/eslint-vitest-rule-tester)

## License

[MIT](./LICENSE) License © 2024-PRESENT [ntnyq](https://github.com/ntnyq)
