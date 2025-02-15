import { DEFAULT_RULE_OPTIONS } from '../constants'
import type { NormalizedTestCase, RuleTesterInitOptions } from '../types'

/**
 * Normalize rule options
 *
 * @param testCase - test case
 * @param options - tester options
 * @returns normalized rule option
 */
export function normalizeRuleOptions(
  testCase: NormalizedTestCase,
  options: RuleTesterInitOptions,
) {
  const { rule = {} } = options
  const { url } = rule?.meta || {}

  const resolvedOptions = testCase.ruleOptions || options.ruleOptions

  if (resolvedOptions) {
    if (Array.isArray(resolvedOptions)) {
      return resolvedOptions.length === 1
        ? [resolvedOptions[0], { url }]
        : resolvedOptions
    } else {
      return [resolvedOptions, { url }]
    }
  }

  return url ? [DEFAULT_RULE_OPTIONS, { url }] : DEFAULT_RULE_OPTIONS
}
