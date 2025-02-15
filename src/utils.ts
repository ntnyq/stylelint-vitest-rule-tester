import { isString, unindent } from '@ntnyq/utils'
import {
  DEFAULT_FILE_NAME,
  DEFAULT_RULE_NAME,
  DEFAULT_RULE_OPTIONS,
} from './constants'
import type {
  DefaultFilenames,
  LintResultMessage,
  NormalizedTestCase,
  RuleTesterInitOptions,
  TestCase,
  TestExecutionResult,
} from './types'

/**
 * Get rule name
 *
 * @param options - rule tester options
 * @returns rule name
 */
export function getRuleName(options: RuleTesterInitOptions) {
  return options.name || options.rule?.ruleName || DEFAULT_RULE_NAME
}

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

/**
 * Check if given test case is invalid
 *
 * @param c - normalized test case
 * @returns true if given case is invalid
 */
function isInvalidTestCase(c: NormalizedTestCase): boolean {
  return (
    !!c.warnings
    || !!c.deprecations
    || !!c.parseErrors
    || !!c.invalidOptionWarnings
    || !!c.output
  )
}

/**
 * Normalize test case
 *
 * @param c - test case
 * @param defaultFilenames - given default file name
 * @param type - case type
 * @returns normalized test case
 */
export function normalizeTestCase(
  c: TestCase,
  defaultFilenames: Partial<DefaultFilenames>,
  type?: 'valid' | 'invalid',
): NormalizedTestCase {
  const obj = isString(c) ? { code: c } : { ...c }
  const normalized = obj as NormalizedTestCase

  normalized.type ||=
    type || (isInvalidTestCase(normalized) ? 'invalid' : 'valid')

  normalized.filename ||= defaultFilenames.css || DEFAULT_FILE_NAME

  return normalized
}

/**
 * Normalize test case message
 *
 * @param message - message string or lint result
 * @returns normalized message
 */
export function normalizeCaseMessage(
  message: string | LintResultMessage,
): Partial<LintResultMessage> {
  if (isString(message)) {
    return {
      text: message,
    }
  }
  const clone = { ...message }

  return clone as Partial<LintResultMessage>
}

/**
 * Safe access from linter result
 */
export function normalizeLinterResult(linterResult: TestExecutionResult) {
  const { fixed = false } = linterResult
  const {
    errored = false,
    warnings = [],
    parseErrors = [],
    deprecations = [],
    invalidOptionWarnings = [],
  } = linterResult.results[0]

  return {
    fixed,
    errored,
    warnings,
    parseErrors,
    deprecations,
    invalidOptionWarnings,
  }
}

export { unindent as $, unindent }
