import { assertType, expectTypeOf } from 'vitest'
import { createRuleTester } from '../src'
import type { RuleTester } from '../src'

const tester = createRuleTester({
  name: 'no-empty-source',
  ruleOptions: true,
})

expectTypeOf(tester).toEqualTypeOf<RuleTester<boolean>>()

assertType<Parameters<typeof tester.each>[0]>({ code: '', ruleOptions: null })
assertType<Parameters<typeof tester.valid>[0]>({ code: '', ruleOptions: null })
assertType<Parameters<typeof tester.invalid>[0]>({
  code: '',
  ruleOptions: null,
  warnings: 0,
})

assertType<Parameters<RuleTester<[boolean]>['valid']>[0]>({
  code: '',
  ruleOptions: null,
})
