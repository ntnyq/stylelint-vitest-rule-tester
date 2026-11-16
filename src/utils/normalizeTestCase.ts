import { isString, isUndefined } from '@ntnyq/utils'
import { DEFAULT_FILE_NAME } from '../constants'
import type Stylelint from 'stylelint'
import type { DefaultFilenames, NormalizedTestCase, TestCase } from '../types'

/**
 * Check if given test case is invalid
 *
 * @param testCase - normalized test case
 * @returns true if given case is invalid
 */
function isInvalidTestCase(testCase: NormalizedTestCase): boolean {
  return (
    !isUndefined(testCase.warnings) ||
    !isUndefined(testCase.deprecations) ||
    !isUndefined(testCase.parseErrors) ||
    !isUndefined(testCase.invalidOptionWarnings) ||
    !isUndefined(testCase.output)
  )
}

/**
 * Normalize test case
 *
 * @param testCase - test case
 * @param defaultFilenames - given default file name
 * @param type - case type
 * @param customSyntax - effective custom syntax for choosing a default filename
 * @returns normalized test case
 */
export function normalizeTestCase<RuleOptions = any>(
  testCase: TestCase<RuleOptions>,
  defaultFilenames: Partial<DefaultFilenames>,
  type?: 'valid' | 'invalid',
  customSyntax?: Stylelint.Config['customSyntax'],
): NormalizedTestCase<RuleOptions> {
  const obj = isString(testCase) ? { code: testCase } : { ...testCase }
  const normalized = obj as NormalizedTestCase<RuleOptions>

  normalized.type =
    type ||
    normalized.type ||
    (isInvalidTestCase(normalized) ? 'invalid' : 'valid')

  const syntax =
    customSyntax ??
    normalized.linterOptions?.customSyntax ??
    normalized.stylelintConfig?.customSyntax
  const syntaxName = isString(syntax)
    ? /^postcss-(\w+)$/.exec(syntax)?.[1]
    : undefined

  normalized.filename ||=
    (syntaxName && defaultFilenames[syntaxName]) ||
    defaultFilenames.css ||
    DEFAULT_FILE_NAME

  return normalized
}
