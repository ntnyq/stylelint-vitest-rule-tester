import { createRuleTester } from './tester'
import type { RuleTesterInitOptions, TestCasesOptions } from './types'

/**
 * Shortcut to run test cases for a rule
 */
export function run(options: TestCasesOptions & RuleTesterInitOptions) {
  const tester = createRuleTester(options)
  return tester.run(options)
}

/**
 * Shortcut to run test cases for a rule in classic style
 */
export function runClassic(
  ruleName: string,
  cases: TestCasesOptions,
  options?: RuleTesterInitOptions,
) {
  const tester = createRuleTester({
    name: ruleName,
    ...options,
  })
  return tester.run(cases)
}
