import stylelint from 'stylelint'
import { run } from '../../src'
import type { Rule } from 'stylelint'

const ruleName = 'test/no-red'
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'Unexpected red',
})

const rule: Rule = () => (root, result) => {
  root.walkDecls('color', node => {
    if (node.value !== 'red') {
      return
    }

    stylelint.utils.report({
      message: messages.rejected,
      node,
      result,
      ruleName,
      index: 0,
      endIndex: node.toString().length,
      fix() {
        node.value = 'blue'
      },
    })
  })
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = {
  url: 'https://example.com/rules/no-red',
  fixable: true,
}

run({
  name: ruleName,
  stylelintConfig: {
    plugins: [stylelint.createPlugin(ruleName, rule)],
  },
  valid: [
    'a { color: blue; }',
    '/* stylelint-disable test/no-red */ a { color: red; }',
  ],
  invalid: [
    {
      code: 'a { color: red; }',
      warnings: ['Unexpected red (test/no-red)'],
      output: 'a { color: blue; }',
    },
    {
      description: 'respects disableFix',
      code: 'a { color: red; }',
      ruleOptions: [true, { disableFix: true }],
      warnings: ['Unexpected red (test/no-red)'],
      output: null,
    },
  ],
})
