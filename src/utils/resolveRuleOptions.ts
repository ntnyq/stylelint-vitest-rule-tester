import { isUndefined } from '@ntnyq/utils'
import type Stylelint from 'stylelint'
import type { NormalizedTestCase, RuleTesterInitOptions } from '../types'

/**
 * Normalize rule options
 *
 * @param testCase - test case
 * @param options - tester options
 * @returns normalized rule option
 */
export function resolveRuleOptions(
  testCase: NormalizedTestCase,
  options: RuleTesterInitOptions,
  ruleMeta?: Stylelint.RuleMeta,
) {
  const url = ruleMeta?.url

  // TODO: ruleOptions can be null, make testCase has a higher priority
  const mergedRuleOptions = testCase.ruleOptions || options.ruleOptions
  const resolvedOptions = isUndefined(mergedRuleOptions)
    ? true // use default options if undefined
    : mergedRuleOptions

  if (Array.isArray(resolvedOptions)) {
    if (resolvedOptions.length === 1) {
      return url ? [resolvedOptions[0], { url }] : resolvedOptions
    } else {
      return url && isUndefined(resolvedOptions[1].url)
        ? [resolvedOptions[0], { ...resolvedOptions[1], url }]
        : resolvedOptions
    }
  } else {
    return url ? [resolvedOptions, { url }] : [resolvedOptions]
  }
}
