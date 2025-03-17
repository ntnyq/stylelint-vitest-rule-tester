import type { InvalidTestCase, NormalizedTestCase, ValidTestCase } from './case'
import type { StylelintLinterResult } from './stylelint'

/**
 * Test case options
 */
export interface TestCasesOptions<RuleOptions = any> {
  /**
   * invalid cases
   */
  invalid?: (string | InvalidTestCase<RuleOptions>)[]

  /**
   * valid cases
   */
  valid?: (string | ValidTestCase<RuleOptions>)[]

  /**
   * callback to be called after each test case
   */
  onResult?: (
    testCase: NormalizedTestCase<RuleOptions>,
    result: TestExecutionResult,
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
