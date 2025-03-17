import { createRuleTester } from './tester'
import type { RuleTesterInitOptions, TestCasesOptions } from './types'

/**
 * Shortcut to run test cases for a rule
 */
export function run<RuleOptions = any>(
  options: TestCasesOptions<RuleOptions> & RuleTesterInitOptions<RuleOptions>,
) {
  const tester = createRuleTester<RuleOptions>(options)
  return tester.run(options)
}

/**
 * Shortcut to run test cases for a rule in classic style
 */
export function runClassic<RuleOptions = any>(
  ruleName: string,
  cases: TestCasesOptions<RuleOptions>,
  options?: RuleTesterInitOptions<RuleOptions>,
) {
  const tester = createRuleTester<RuleOptions>({
    name: ruleName,
    ...options,
  })
  return tester.run(cases)
}
