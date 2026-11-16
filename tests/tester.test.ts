/* eslint-disable unicorn/no-this-outside-of-class -- Test the documented hook context. */

import stylelint from 'stylelint'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRuleTester, normalizeTestCase } from '../src'
import type { Plugin, Rule } from 'stylelint'
import type { RuleTesterBehaviorOptions } from '../src'

function createFixingPlugin(transform: (value: string) => string): Plugin {
  const ruleName = 'test/step-value'
  const messages = stylelint.utils.ruleMessages(ruleName, {
    rejected: 'Unexpected value',
  })
  const rule: Rule = () => (root, result) => {
    root.walkDecls(node => {
      const value = transform(node.value)

      if (value === node.value) {
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
          node.value = value
        },
      })
    })
  }

  rule.ruleName = ruleName
  rule.messages = messages
  rule.meta = { fixable: true, url: 'https://example.com/rules/step-value' }

  return stylelint.createPlugin(ruleName, rule)
}

function createFixingTester(
  transform: (value: string) => string,
  options: RuleTesterBehaviorOptions = {},
) {
  return createRuleTester({
    name: 'test/step-value',
    stylelintConfig: { plugins: [createFixingPlugin(transform)] },
    verifyAfterFix: false,
    ...options,
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('single case execution', () => {
  it('labels direct valid cases and their hooks as valid', async () => {
    const tester = createRuleTester({ name: 'no-empty-source' })
    const { testcase } = await tester.valid({
      code: 'a {}',
      before() {
        expect(this.type).toBe('valid')
      },
      after() {
        expect(this.type).toBe('valid')
      },
    })

    expect(testcase.type).toBe('valid')
  })

  it('labels output-only invalid cases and their hooks as invalid', async () => {
    const tester = createRuleTester({ name: 'at-rule-no-unknown' })
    const { testcase } = await tester.invalid({
      code: '@not-my-at-rule {}',
      output: null,
      before() {
        expect(this.type).toBe('invalid')
      },
      after() {
        expect(this.type).toBe('invalid')
      },
    })

    expect(testcase.type).toBe('invalid')
  })

  it.each(['@-webkit-keyframes x {}', { code: '@-webkit-keyframes x {}' }])(
    'rejects invalid cases without assertions: %j',
    async testcase => {
      const tester = createRuleTester({ name: 'at-rule-no-vendor-prefix' })
      const lint = vi.spyOn(stylelint, 'lint')

      await expect(tester.invalid(testcase)).rejects.toThrow(
        'Invalid test case must have',
      )
      expect(lint).not.toHaveBeenCalled()
    },
  )

  it('uses the direct method type even for previously normalized cases', async () => {
    const tester = createRuleTester({ name: 'no-empty-source' })
    const input = normalizeTestCase('a {}', {}, 'invalid')
    const { testcase } = await tester.valid(input)

    expect(testcase.type).toBe('valid')
    expect(input.type).toBe('invalid')
  })

  it.each([
    { warnings: 0 },
    { deprecations: 0 },
    { parseErrors: 0 },
    { invalidOptionWarnings: 0 },
    { output: null },
    { output: '' },
  ])('infers invalid cases from defined expectations: %j', expectation => {
    expect(normalizeTestCase({ code: '', ...expectation }, {}).type).toBe(
      'invalid',
    )
  })
})

describe('recursive fixes', () => {
  it('records multiple passes and stops once the fix stabilizes', async () => {
    const tester = createFixingTester(
      value => String(Math.min(Number(value) + 1, 2)),
      {
        recursive: 3,
      },
    )
    const { result } = await tester.invalid({
      code: 'a { z-index: 0; }',
      warnings: 1,
      output: 'a { z-index: 2; }',
    })

    expect(result.steps?.map(step => step.code)).toEqual([
      'a { z-index: 1; }',
      'a { z-index: 2; }',
      'a { z-index: 2; }',
    ])
  })

  it('skips recursive passes when the first fix does not change code', async () => {
    const tester = createFixingTester(value => value, { recursive: 1 })
    const lint = vi.spyOn(stylelint, 'lint')
    const { result } = await tester.valid('a { color: blue; }')

    expect(result.fixed).toBe(false)
    expect(result.steps).toHaveLength(1)
    expect(lint).toHaveBeenCalledTimes(2)
  })

  it.each([-1, 0.5, NaN, Infinity, -Infinity])(
    'rejects an invalid recursion limit %j before linting',
    async recursive => {
      const tester = createFixingTester(() => 'blue', { recursive })
      const lint = vi.spyOn(stylelint, 'lint')

      await expect(tester.each('a { color: red; }')).rejects.toThrow(
        'recursive must be false or a non-negative integer',
      )
      expect(lint).not.toHaveBeenCalled()
    },
  )

  it('lets a case override the tester recursion limit', async () => {
    const tester = createFixingTester(
      value => (value === 'red' ? 'blue' : 'red'),
      {
        recursive: 2,
      },
    )
    const { result } = await tester.each({
      code: 'a { color: red; }',
      recursive: false,
    })

    expect(result.steps).toHaveLength(1)
  })
})
