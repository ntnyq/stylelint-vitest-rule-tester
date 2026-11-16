import { isUndefined } from '@ntnyq/utils'
import type Stylelint from 'stylelint'
import type { NormalizedTestCase, RuleTesterInitOptions } from '../types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const prototype = Object.getPrototypeOf(value)

  return prototype === null || prototype === Object.prototype
}

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
  primaryOptionArray = false,
) {
  const url = ruleMeta?.url

  const mergedRuleOptions = isUndefined(testCase.ruleOptions)
    ? options.ruleOptions
    : testCase.ruleOptions
  const resolvedOptions = isUndefined(mergedRuleOptions)
    ? true // use default options if undefined
    : mergedRuleOptions

  // Handle non-array case: convert to array format with optional url
  if (!Array.isArray(resolvedOptions)) {
    return url ? [resolvedOptions, { url }] : [resolvedOptions]
  }

  // Handle array case
  const [primary, secondary] = resolvedOptions
  const isDisabled = resolvedOptions.length > 0 && primary == null
  const isWrappedPrimary =
    resolvedOptions.length === 1 && Array.isArray(primary)
  const hasSecondary =
    resolvedOptions.length === 2 &&
    !isPlainObject(primary) &&
    isPlainObject(secondary)

  // Match Stylelint's distinction between an array primary and an option tuple.
  if (primaryOptionArray && !isDisabled && !isWrappedPrimary && !hasSecondary) {
    return url ? [resolvedOptions, { url }] : [resolvedOptions]
  }

  // Single element array: add url as secondary option if present
  if (resolvedOptions.length === 1) {
    return url ? [primary, { url }] : resolvedOptions
  }

  // Multiple elements: only inject url if secondary options don't have it already
  if (url && isUndefined(secondary?.url)) {
    return [primary, { ...secondary, url }]
  }

  return resolvedOptions
}
