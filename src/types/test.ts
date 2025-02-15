import type Stylelint from 'stylelint'
import type { InvalidTestCase, NormalizedTestCase, ValidTestCase } from './case'

/**
 * Test case options
 */
export interface TestCasesOptions {
  /**
   * invalid cases
   */
  invalid?: (string | InvalidTestCase)[]

  /**
   * valid cases
   */
  valid?: (string | ValidTestCase)[]

  /**
   * callback to be called after each test case
   */
  onResult?: (
    testCase: NormalizedTestCase,
    result: Stylelint.LinterResult,
  ) => Promise<void> | void
}

/**
 * Test execution result
 */
export type TestExecutionResult = Stylelint.LinterResult & {
  /**
   * whether the code was fixed
   */
  fixed?: boolean

  /**
   * if the rule fixes in multiple steps, the result of each step is present here
   */
  steps?: Stylelint.LinterResult[]
}
