import type { TestExecutionResult } from '../types'

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
