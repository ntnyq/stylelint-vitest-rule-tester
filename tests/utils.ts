import type { LintResult } from 'stylelint'
import type { LintResultWarning, TestExecutionResult } from '../src'

/**
 * Normalize known warning message prefixes for snapshots shared by Stylelint 17 and 18.
 *
 * Copies each warning and normalizes only the prefixes used by
 * `at-rule-no-unknown`, `at-rule-no-vendor-prefix`, and `no-empty-source`.
 * All other warning properties and the original warnings remain unchanged.
 *
 * @param warnings - Stylelint warnings to prepare for snapshot assertions
 * @returns A new array of warning copies with consistent message prefixes
 */
export function normalizeSnapshotWarnings(warnings: LintResultWarning[]) {
  return warnings.map(warning => ({
    ...warning,
    text: warning.text
      .replace(/^Unexpected unknown at-rule /, 'Unknown at-rule ')
      .replace(
        /^Unexpected vendor-prefixed at-rule /,
        'Vendor-prefixed at-rule ',
      )
      .replace(/^Unexpected empty source /, 'Empty source '),
  }))
}

/**
 * Omit version-dependent autofix metadata from lint results used in snapshots.
 *
 * Stylelint 17.11 added `autofixed`, which is absent in earlier versions.
 * The tester exposes `fixed` on every supported version, so snapshots can
 * verify fix behavior without relying on this additional field.
 * Original lint results are not modified; other property values are retained.
 *
 * @param results - Stylelint lint results to prepare for snapshot assertions
 * @returns A new array of shallow result copies without the `autofixed` property
 */
function normalizeSnapshotLintResults(results: LintResult[]) {
  return results.map(result =>
    Object.fromEntries(
      Object.entries(result).filter(([key]) => key !== 'autofixed'),
    ),
  )
}

/**
 * Prepare a test execution result for snapshots shared by Stylelint 17 and 18.
 *
 * Omits `autofixed` from the final lint results and each recorded fix step's
 * lint results. Other property values, including the tester's `fixed` flags,
 * are retained. The original execution result and fix steps are not modified.
 *
 * @param result - Test execution result, optionally including recorded fix steps
 * @returns A new result object with normalized lint results and copied fix steps;
 * `steps` remains undefined when absent from the input
 */
export function normalizeSnapshotResult(result: TestExecutionResult) {
  return {
    ...result,
    results: normalizeSnapshotLintResults(result.results),
    steps: result.steps?.map(step => ({
      ...step,
      results: normalizeSnapshotLintResults(step.results),
    })),
  }
}
