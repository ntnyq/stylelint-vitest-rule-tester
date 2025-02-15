import deepmerge from 'deepmerge'
import { normalizeRuleOptions } from './normalizeRuleOptions'
import type Stylelint from 'stylelint'
import type { NormalizedTestCase, RuleTesterInitOptions } from '../types'

/**
 * Resolve linter options of stylelint
 *
 * @param ruleName - rule name
 * @param options - tester init options
 * @param testCase - normalized test case
 * @returns resolved linter options
 */
export function resolveLinterOptions(
  ruleName: string,
  options: RuleTesterInitOptions,
  testCase: NormalizedTestCase,
) {
  const linterOptions: Stylelint.LinterOptions = {
    ...options.linterOptions,
    config: {
      ...deepmerge(
        options.stylelintConfig || {},
        testCase.stylelintConfig || {},
      ),
      rules: {
        [ruleName]: normalizeRuleOptions(testCase, options),
      },
    },
    code: testCase.code,
    codeFilename: testCase.filename,
    fix: false,
    quietDeprecationWarnings: true,
  }

  return linterOptions
}
