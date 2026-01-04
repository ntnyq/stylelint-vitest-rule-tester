import { isString } from '@ntnyq/utils'
import { DEFAULT_FILE_NAME } from '../constants'
import type { DefaultFilenames, NormalizedTestCase, TestCase } from '../types'

/**
 * Check if given test case is invalid
 *
 * @param testCase - normalized test case
 * @returns true if given case is invalid
 */
function isInvalidTestCase(testCase: NormalizedTestCase): boolean {
  return (
    !!testCase.warnings
    || !!testCase.deprecations
    || !!testCase.parseErrors
    || !!testCase.invalidOptionWarnings
    || !!testCase.output
  )
}

/**
 * Normalize test case
 *
 * @param testCase - test case
 * @param defaultFilenames - given default file name
 * @param type - case type
 * @returns normalized test case
 */
export function normalizeTestCase<RuleOptions = any>(
  testCase: TestCase<RuleOptions>,
  defaultFilenames: Partial<DefaultFilenames>,
  type?: 'valid' | 'invalid',
): NormalizedTestCase<RuleOptions> {
  const obj = isString(testCase) ? { code: testCase } : { ...testCase }
  const normalized = obj as NormalizedTestCase<RuleOptions>

  normalized.type ||=
    type || (isInvalidTestCase(normalized) ? 'invalid' : 'valid')

  normalized.filename ||= defaultFilenames.css || DEFAULT_FILE_NAME

  return normalized
}
