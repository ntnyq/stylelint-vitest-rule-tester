import { expect } from 'vitest'
import { run } from '../../src'
import rule from '../fixtures/rules/no-empty-source'

run({
  rule,
  name: 'no-empty-source',
  valid: [
    `.class {}`,
    `   .class {}   `,
    `/* comment */`,
    `\n.class {}`,
    `\r\n.class {}`,
    `.box { color: red; }`,
    {
      description: 'HTML without CSS',
      stylelintConfig: {
        customSyntax: 'postcss-html',
      },
      code: '<html></html>',
    },
  ],
  invalid: [
    {
      filename: 'empty.css',
      code: '',
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
              "url": undefined,
            },
          ]
        `)
      },
    },
    {
      filename: 'whitespaces.css',
      code: `    `,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 6,
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
    {
      filename: 'tab.css',
      code: `\t`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 3,
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
    {
      filename: 'newline.css',
      code: `\n`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 2,
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
    {
      filename: 'carriage-return-newline.css',
      code: `\r\n`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 2,
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
    {
      filename: 'multi-line.css',
      code: `\n\n\n`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 4,
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
    {
      filename: 'carriage-return-multi-line.css',
      code: `\r\n\r\n\r\n`,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 4,
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
    {
      filename: 'newline-with-whitespace.css',
      code: `   \n    `,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 6,
              "endLine": 2,
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
    {
      filename: 'carriage-return-with-whitespace.css',
      code: `   \r\n    `,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 6,
              "endLine": 2,
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
