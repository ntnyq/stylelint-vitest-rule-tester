/**
 * @see {@link https://github.com/stylelint-scss/stylelint-scss/tree/master/src/rules/dollar-variable-default}
 */

import stylelintSCSS from 'stylelint-scss'
import { expect } from 'vitest'
import { $, run } from '../../../src'

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
              "fix": undefined,
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
    {
      description: 'local vars without !default',
      filename: 'local.scss',
      code: $`
        $global: 10px !default;
        a {
          $local-var: 10px;
        }
      `,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 3,
              "endColumn": 20,
              "endLine": 3,
              "fix": undefined,
              "line": 3,
              "rule": "scss/dollar-variable-default",
              "severity": "error",
              "text": "Expected !default flag for "$local-var" (scss/dollar-variable-default)",
              "url": undefined,
            },
          ]
        `)
      },
    },
    {
      description: 'nested vars without !default',
      filename: 'nested.scss',
      code: $`
        $global: 10px !default;
        .class {
          a {
            $nested-var: 10px;
          }
        }
      `,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 5,
              "endColumn": 23,
              "endLine": 4,
              "fix": undefined,
              "line": 4,
              "rule": "scss/dollar-variable-default",
              "severity": "error",
              "text": "Expected !default flag for "$nested-var" (scss/dollar-variable-default)",
              "url": undefined,
            },
          ]
        `)
      },
    },
  ],
})

/**
 * options `ignore`
 */
run({
  name: 'scss/dollar-variable-default',
  stylelintConfig: {
    plugins: stylelintSCSS,
    customSyntax: 'postcss-scss',
  },
  ruleOptions: [true, { ignore: 'local' }],
  valid: [
    `a { color: blue }`,
    `$var: 10px !default`,
    `a { $var: 10px !default }`,
    `.class { a { $var: 10px !default } }`,
    `a { $var: 10px }`,
    `.class { a { $var: 10px } }`,
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
              "fix": undefined,
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
