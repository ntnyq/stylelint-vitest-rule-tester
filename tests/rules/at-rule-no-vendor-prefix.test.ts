/**
 * @see {@link https://github.com/stylelint/stylelint/tree/main/lib/rules/at-rule-no-vendor-prefix}
 */

import { unindent as $ } from '@ntnyq/utils'
import { expect } from 'vitest'
import { run } from '../../src'

/**
 * default
 */
run({
  name: 'at-rule-no-vendor-prefix',
  valid: [
    `@keyframes { 0% { top: 0; } }`,
    {
      code: `@viewport { orientation: landscape; }`,
      onResult(result) {
        expect(result).toMatchSnapshot()
      },
    },
  ],
  invalid: [
    {
      code: $`
        @-webkit-keyframes { 0% { top: 0; } }
      `,
      output(output) {
        expect(output).toMatchInlineSnapshot(`"@keyframes { 0% { top: 0; } }"`)
      },
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 19,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-vendor-prefix",
              "severity": "error",
              "text": "Unexpected vendor-prefixed at-rule "@-webkit-keyframes" (at-rule-no-vendor-prefix)",
              "url": undefined,
            },
          ]
        `)
      },
    },
    {
      code: $`
        @-wEbKiT-kEyFrAmEs { 0% { top: 0; } }
      `,
      output(output) {
        expect(output).toMatchInlineSnapshot(`"@kEyFrAmEs { 0% { top: 0; } }"`)
      },
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 19,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-vendor-prefix",
              "severity": "error",
              "text": "Unexpected vendor-prefixed at-rule "@-wEbKiT-kEyFrAmEs" (at-rule-no-vendor-prefix)",
              "url": undefined,
            },
          ]
        `)
      },
    },
    {
      code: $`
        @-WEBKIT-KEYFRAMES { 0% { top: 0; } }
      `,
      output(output) {
        expect(output).toMatchInlineSnapshot(`"@KEYFRAMES { 0% { top: 0; } }"`)
      },
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 19,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-vendor-prefix",
              "severity": "error",
              "text": "Unexpected vendor-prefixed at-rule "@-WEBKIT-KEYFRAMES" (at-rule-no-vendor-prefix)",
              "url": undefined,
            },
          ]
        `)
      },
    },
    {
      code: $`
        @-moz-keyframes { 0% { top: 0; } }
      `,
      output(output) {
        expect(output).toMatchInlineSnapshot(`"@keyframes { 0% { top: 0; } }"`)
      },
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 16,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-vendor-prefix",
              "severity": "error",
              "text": "Unexpected vendor-prefixed at-rule "@-moz-keyframes" (at-rule-no-vendor-prefix)",
              "url": undefined,
            },
          ]
        `)
      },
    },
    {
      code: $`
        @-ms-viewport { orientation: landscape; }
      `,
      output(output) {
        expect(output).toMatchInlineSnapshot(
          `"@viewport { orientation: landscape; }"`,
        )
      },
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 14,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-vendor-prefix",
              "severity": "error",
              "text": "Unexpected vendor-prefixed at-rule "@-ms-viewport" (at-rule-no-vendor-prefix)",
              "url": undefined,
            },
          ]
        `)
      },
      onResult(result) {
        expect(result).toMatchSnapshot()
      },
    },
  ],
})
