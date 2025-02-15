/**
 * @see {@link https://github.com/stylelint/stylelint/tree/main/lib/rules/at-rule-no-unknown}
 */

import { unindent as $ } from '@ntnyq/utils'
import { expect } from 'vitest'
import { run } from '../../src'

/**
 * default
 */
run({
  name: 'at-rule-no-unknown',
  valid: [
    `@charset "UTF-8";`,
    `@CHARSET "UTF-8";`,
    `@position-try --foo {}`,
    `@starting-style { opacity: 0; }`,
    `@container (min-width: 700px)`,
    `@CONTAINER (min-width: 500px)`,
    `@import url("fineprint.css") print;`,
    `@import "custom.css"`,
    `@import url("landscape.css") screen and (orientation:landscape);`,
    `@namespace url(http://www.w3.org/1999/xhtml);`,
    `@namespace prefix url(XML-namespace-URL);`,
    `@media print { body { font-size: 10pt } }`,
    `@media (max-width: 960px) { body { font-size: 13px } }`,
    `@media screen, print { body { line-height: 1.2 } }`,
    `@supports (--foo: green) { body { color: green; } }`,
    `@supports ( (perspective: 10px) or (-webkit-perspective: 10px) ) { font-size: 10pt }`,
    `@counter-style win-list { system: fixed; symbols: url(gold-medal.svg); suffix: ' ';}`,
    `@document url(http://www.w3.org/), url-prefix(http://www.w3.org/Style/), domain(mozilla.org), regexp('https:.*')`,
    `@page :left { margin-left: 4cm; }`,
    `@page { @top-center { content: none } }`,
    `@font-face { font-family: MyHelvetica; src: local("Helvetica"), url(MgOpenModern.ttf); }`,
    `@keyframes identifier { 0% { top: 0; left: 0; } 30% { top: 50px; } 68%, 100% { top: 100px; left: 100%; } }'`,
    `@-webkit-keyframes identifier { 0% { top: 0; left: 0; } 30% { top: 50px; } 68%, 100% { top: 100px; left: 100%; } }`,
    `@viewport { min-width: 640px; max-width: 800px; }`,
    `@viewport { orientation: landscape; }`,
    `@counter-style winners-list { system: fixed; symbols: url(gold-medal.svg); suffix: " "; }`,
    `@font-feature-values Font One { @styleset { nice-style: 12; } }`,
    `.foo { color: red; @nest .parent & { color: blue; } }`,
    `@layer framework { h1 { background: white; } }`,
    `@scroll-timeline foo {}`,
  ],
  invalid: [
    {
      filename: 'unknown.css',
      code: '@unknown-at-rule { }',
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 17,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-unknown",
              "severity": "error",
              "text": "Unexpected unknown at-rule "@unknown-at-rule" (at-rule-no-unknown)",
              "url": "https://stylelint.io/user-guide/rules/at-rule-no-unknown",
            },
          ]
        `)
      },
    },
  ],
})

/**
 * rule options
 */
run({
  name: 'at-rule-no-unknown',
  ruleOptions: [
    true,
    {
      ignoreAtRules: ['unknown', '/^my-/', '/^YOUR-/i'],
    },
  ],
  valid: [
    `@unknown { }`,
    `@my-at-rule { }`,
    `@your-at-rule { }`,
    `@YOUR-at-rule { }`,
  ],
  invalid: [
    {
      code: `@uNkNoWn { }`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 9,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-unknown",
              "severity": "error",
              "text": "Unexpected unknown at-rule "@uNkNoWn" (at-rule-no-unknown)",
              "url": "https://stylelint.io/user-guide/rules/at-rule-no-unknown",
            },
          ]
        `)
      },
    },
    {
      code: `@UNKNOWN { }`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 9,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-unknown",
              "severity": "error",
              "text": "Unexpected unknown at-rule "@UNKNOWN" (at-rule-no-unknown)",
              "url": "https://stylelint.io/user-guide/rules/at-rule-no-unknown",
            },
          ]
        `)
      },
    },
    {
      code: `@unknown-at-rule { }`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 17,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-unknown",
              "severity": "error",
              "text": "Unexpected unknown at-rule "@unknown-at-rule" (at-rule-no-unknown)",
              "url": "https://stylelint.io/user-guide/rules/at-rule-no-unknown",
            },
          ]
        `)
      },
    },
    {
      code: `@unknown { @unknown-at-rule { font-size: 14px; } }`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 12,
              "endColumn": 28,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-unknown",
              "severity": "error",
              "text": "Unexpected unknown at-rule "@unknown-at-rule" (at-rule-no-unknown)",
              "url": "https://stylelint.io/user-guide/rules/at-rule-no-unknown",
            },
          ]
        `)
      },
    },
    {
      code: `@MY-other-at-rule { }`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 18,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-unknown",
              "severity": "error",
              "text": "Unexpected unknown at-rule "@MY-other-at-rule" (at-rule-no-unknown)",
              "url": "https://stylelint.io/user-guide/rules/at-rule-no-unknown",
            },
          ]
        `)
      },
    },
    {
      code: `@not-my-at-rule {}`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 16,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "at-rule-no-unknown",
              "severity": "error",
              "text": "Unexpected unknown at-rule "@not-my-at-rule" (at-rule-no-unknown)",
              "url": "https://stylelint.io/user-guide/rules/at-rule-no-unknown",
            },
          ]
        `)
      },
    },
  ],
})

/**
 * custom syntax
 */
run({
  name: 'at-rule-no-unknown',
  stylelintConfig: {
    customSyntax: 'postcss-less',
  },
  valid: [
    {
      filename: 'mixins.less',
      description: 'ignore less mixin',
      code: $`
        .some-mixin() { margin: 0; }
        span { .some-mixin(); }
      `,
    },
    {
      filename: 'vars.less',
      description: 'ignore less vars',
      code: $`
        @my-variable: #f7f8f9;
        span { background-color: @my-variable; }
      `,
    },
  ],
})
