import { describe, expect, it } from 'vitest'
import {
  createRuleTester,
  normalizeTestCase,
  resolveRuleOptions,
} from '../../src'

describe('rule option precedence', () => {
  it.each([
    ['foo', 'bar'],
    [['foo', 'bar']],
    [['foo', 'bar'], { severity: 'warning' }],
  ])('preserves array primary options: %j', async (...ruleOptions) => {
    const tester = createRuleTester({
      name: 'at-rule-disallowed-list',
      ruleOptions,
    })

    const { result } = await tester.invalid({
      code: '@bar {}',
      warnings: 1,
      output: null,
    })

    expect(result.results[0].warnings[0].rule).toBe('at-rule-disallowed-list')
  })

  it.each([null, false, 0, ''])('preserves the case option %j', ruleOptions => {
    const testcase = normalizeTestCase({ code: '', ruleOptions }, {})

    expect(
      resolveRuleOptions(testcase, {
        name: 'test/rule',
        ruleOptions: true,
      }),
    ).toEqual([ruleOptions])
  })

  it('uses the tester option when the case option is undefined', () => {
    const testcase = normalizeTestCase({ code: '', ruleOptions: undefined }, {})

    expect(
      resolveRuleOptions(testcase, {
        name: 'test/rule',
        ruleOptions: false,
      }),
    ).toEqual([false])
  })

  it('can disable an enabled rule for a valid case', async () => {
    const tester = createRuleTester({
      name: 'no-empty-source',
      ruleOptions: true,
    })

    const { result } = await tester.valid({ code: '', ruleOptions: null })

    expect(result.results[0].warnings).toEqual([])
  })
})
