import { isString, unindent } from '@ntnyq/utils'
import { DEFAULT_FILE_NAME, DEFAULT_RULE_NAME, DEFAULT_RULE_OPTIONS } from './constants'
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
 * @param options - rule tester options
 * @returns rule name
 */
export function getRuleName(options: RuleTesterInitOptions) {
  return options.name || options.rule?.ruleName || DEFAULT_RULE_NAME
}

export function normalizeRuleOptions(testCase: NormalizedTestCase, options: RuleTesterInitOptions) {
  const { rule = {} } = options
  const { url } = rule?.meta || {}

  if (testCase.ruleOptions) {
    if (Array.isArray(testCase.ruleOptions)) {
      return testCase.ruleOptions.length === 1
        ? [testCase.ruleOptions[0], { url }]
        : testCase.ruleOptions
    } else {
      return [testCase.ruleOptions, { url }]
    }
  }
  return url ? [DEFAULT_RULE_OPTIONS, { url }] : DEFAULT_RULE_OPTIONS
}

export function normalizeTestCase(
  c: TestCase,
  defaultFilenames: Partial<DefaultFilenames>,
  type?: 'valid' | 'invalid',
) {
  const obj = isString(c) ? { code: c } : { ...c }
  const normalized = obj as NormalizedTestCase

  normalized.type ||=
    type ||
    (!!obj.warnings ||
    !!obj.deprecations ||
    !!obj.parseErrors ||
    !!obj.invalidOptionWarnings ||
    !!obj.output
      ? 'invalid'
      : 'valid')

  // TODO: filename resolve
  normalized.filename = defaultFilenames.css || DEFAULT_FILE_NAME

  return normalized
}

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
 * safe access from linter result
 */
export function useLinterResult(linterResult: TestExecutionResult) {
  const { fixed = false } = linterResult
  const {
    errored,
    warnings = [],
    parseErrors = [],
    deprecations = [],
    invalidOptionWarnings = [],
  } = linterResult.results?.[0] ?? {}

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
