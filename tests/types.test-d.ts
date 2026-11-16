import { expectTypeOf } from 'vitest'
import { createRuleTester, runClassic } from '../src'
import type {
  InvalidTestCase,
  InvalidTestCaseBase,
  NormalizedTestCase,
  RuleTester,
  TestCase,
  ValidTestCase,
} from '../src'

type RuleOptions = [boolean]

expectTypeOf({
  code: 'a {}',
  warnings: [{ rule: 'test/rule' }],
  parseErrors: [{ text: 'Invalid syntax' }],
}).toExtend<InvalidTestCaseBase>()

expectTypeOf<RuleTester<RuleOptions>['each']>()
  .parameter(0)
  .toEqualTypeOf<TestCase<RuleOptions>>()
expectTypeOf<RuleTester<RuleOptions>['valid']>()
  .parameter(0)
  .toEqualTypeOf<ValidTestCase<RuleOptions>>()
expectTypeOf<RuleTester<RuleOptions>['invalid']>()
  .parameter(0)
  .toEqualTypeOf<InvalidTestCase<RuleOptions>>()

const tester = createRuleTester<RuleOptions>({ name: 'no-empty-source' })

expectTypeOf(tester.each)
  .returns.resolves.toHaveProperty('testcase')
  .toEqualTypeOf<NormalizedTestCase<RuleOptions>>()
expectTypeOf(tester.valid)
  .returns.resolves.toHaveProperty('testcase')
  .toEqualTypeOf<NormalizedTestCase<RuleOptions>>()
expectTypeOf(tester.invalid)
  .returns.resolves.toHaveProperty('testcase')
  .toEqualTypeOf<NormalizedTestCase<RuleOptions>>()

tester.each({ code: '', ruleOptions: [true] })
tester.valid({ code: '', ruleOptions: [false] })
tester.invalid({ code: '', ruleOptions: [true], warnings: 1 })

// @ts-expect-error Rule options must match the tester's generic parameter.
tester.each({ code: '', ruleOptions: 'invalid' })
// @ts-expect-error Rule options must match the tester's generic parameter.
tester.valid({ code: '', ruleOptions: 'invalid' })
// @ts-expect-error Rule options must match the tester's generic parameter.
tester.invalid({ code: '', ruleOptions: 'invalid', warnings: 1 })

runClassic('no-empty-source', { valid: ['a {}'] }, { recursive: false })
// @ts-expect-error The rule name must only be supplied as the first argument.
runClassic('no-empty-source', {}, { name: 'another-rule' })
