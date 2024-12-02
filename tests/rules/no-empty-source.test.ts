import { expect } from 'vitest'
import { run } from '../../src'
import rule from './no-empty-source'

const valid = [`.box { color: red; }`]

run({
  rule,
  name: rule.ruleName,
  valid,
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
              "url": "https://stylelint.io/user-guide/rules/no-empty-source",
            },
          ]
        `)
      },
    },
  ],
})
