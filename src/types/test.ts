import type { InvalidTestCase, NormalizedTestCase, ValidTestCase } from './case'
import type { StylelintLinterResult } from './stylelint'

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
    result: StylelintLinterResult,
  ) => Promise<void> | void
}

/**
 * Test execution result
 */
export type TestExecutionResult = StylelintLinterResult & {
  /**
   * whether the code was fixed
   */
  fixed?: boolean

  /**
   * if the rule fixes in multiple steps, the result of each step is present here
   */
  steps?: StylelintLinterResult[]
}
