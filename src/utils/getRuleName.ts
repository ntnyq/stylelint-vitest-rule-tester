import { DEFAULT_RULE_NAME } from '../constants'
import type { RuleTesterInitOptions } from '../types'

/**
 * Get rule name
 *
 * @param options - rule tester options
 * @returns rule name
 */
export function getRuleName(options: RuleTesterInitOptions) {
  return options.name || options.rule?.ruleName || DEFAULT_RULE_NAME
}
