import type Stylelint from 'stylelint'

/**
 * Normalize test execution result
 *
 * @param result - test execution result {@link TestExecutionResult}
 */
export function normalizeTestExecutionResult(result: Stylelint.LinterResult) {
  const { cwd: _, results = [], report: _result, ...rest } = result

  return {
    ...rest,
    results: results.map(({ _postcssResult, source, ...result }) => ({
      ...result,
    })),
  }
}
