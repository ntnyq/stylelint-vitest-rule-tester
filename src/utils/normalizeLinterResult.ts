import type Stylelint from 'stylelint'

/**
 * Normalize linter result
 *
 * @param result - linter result {@link Stylelint.LinterResult}
 */
export function normalizeLinterResult(result: Stylelint.LinterResult) {
  const { cwd: _, results = [], report: _result, ...rest } = result

  return {
    ...rest,
    results: results.map(({ _postcssResult, source, ...result }) => ({
      ...result,
    })),
  }
}
