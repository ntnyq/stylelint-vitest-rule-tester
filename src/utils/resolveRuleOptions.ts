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

  // Helper to inject url into secondary options
  const injectUrl = (opts: any) => (url ? { ...opts, url } : opts)

  // Handle non-array case: convert to array format with optional url
  if (!Array.isArray(resolvedOptions)) {
    return url ? [resolvedOptions, { url }] : [resolvedOptions]
  }

  // Handle array case
  const [primary, secondary] = resolvedOptions

  // Single element array: add url as secondary option if present
  if (resolvedOptions.length === 1) {
    return url ? [primary, { url }] : resolvedOptions
  }

  // Multiple elements: only inject url if secondary options don't have it already
  if (url && isUndefined(secondary?.url)) {
    return [primary, injectUrl(secondary)]
  }

  return resolvedOptions
}
