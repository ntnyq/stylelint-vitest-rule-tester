import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'
import { createRuleTester } from '../src'
import type { Rule } from 'stylelint'

function createIncrementPlugin(limit = Number.POSITIVE_INFINITY) {
  const ruleName = 'test/increment'
  const messages = stylelint.utils.ruleMessages(ruleName, {
    rejected: 'Increment z-index',
  })
  const rule: Rule = () => (root, result) => {
    root.walkDecls('z-index', node => {
      const value = Number(node.value)

      if (value >= limit) {
        return
      }

      stylelint.utils.report({
        ruleName,
        node,
        result,
        message: messages.rejected,
        index: 0,
        endIndex: node.toString().length,
        fix() {
          node.value = String(value + 1)
        },
      })
    })
  }

  rule.ruleName = ruleName
  rule.messages = messages
  rule.meta = { fixable: true, url: 'https://example.com/rules/increment' }

  return stylelint.createPlugin(ruleName, rule)
}

describe('recursive fixes', () => {
  it.each([1, 2, 3])(
    'accepts convergence on the final iteration with recursive: %i',
    async recursive => {
      const tester = createRuleTester({
        name: 'test/increment',
        recursive,
        stylelintConfig: { plugins: [createIncrementPlugin(recursive)] },
      })
      const output = `a {z-index:${recursive}}`
      const { result } = await tester.invalid({
        code: 'a {z-index:0}',
        warnings: 1,
        output,
      })

      expect(result.code).toBe(output)
      expect(result.steps).toHaveLength(recursive + 1)
    },
  )

  it.each([1, 2, 3])(
    'rejects an unstable fix with recursive: %i even without output verification',
    async recursive => {
      const tester = createRuleTester({
        name: 'test/increment',
        recursive,
        verifyAfterFix: false,
        stylelintConfig: { plugins: [createIncrementPlugin()] },
      })

      await expect(
        tester.invalid({ code: 'a {z-index:0}', warnings: 1 }),
      ).rejects.toThrow('Fix recursion limit exceeded')
    },
  )

  it.each([false, 0] as const)(
    'skips recursive fixing with recursive: %j',
    async recursive => {
      const tester = createRuleTester({
        name: 'test/increment',
        recursive,
        verifyAfterFix: false,
        stylelintConfig: { plugins: [createIncrementPlugin()] },
      })
      const { result } = await tester.invalid({
        code: 'a {z-index:0}',
        warnings: 1,
        output: 'a {z-index:1}',
      })

      expect(result.steps).toHaveLength(1)
    },
  )
})
