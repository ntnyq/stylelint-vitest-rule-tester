import deepmerge from 'deepmerge'
import type Stylelint from 'stylelint'
import type { NormalizedTestCase, RuleTesterInitOptions } from '../types'

/**
 * Resolve linter options of stylelint
 *
 * @param options - tester init options
 * @param testCase - normalized test case
 * @returns resolved linter options
 */
export function resolveLinterOptions(
  options: RuleTesterInitOptions,
  testCase: NormalizedTestCase,
  ruleOptions: any,
) {
  const linterOptions: Stylelint.LinterOptions = {
    ...options.linterOptions,
    config: {
      ...deepmerge(
        options.stylelintConfig || {},
        testCase.stylelintConfig || {},
      ),
      rules: {
        [options.name]: ruleOptions,
      },
    },
    code: testCase.code,
    codeFilename: testCase.filename,
    fix: false,
    quietDeprecationWarnings: true,
  }

  return linterOptions
}
