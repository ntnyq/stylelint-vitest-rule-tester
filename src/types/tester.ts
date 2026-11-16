import type {
  InvalidTestCase,
  NormalizedTestCase,
  TestCase,
  ValidTestCase,
} from './case'
import type { DefaultFilenames } from './file'
import type { StylelintOptions } from './stylelint'
import type { TestCasesOptions, TestExecutionResult } from './test'

/**
 * Rule tester behavior options
 */
export type RuleTesterBehaviorOptions = {
  /**
   * Maximum additional fix passes after the initial fix.
   * Must be a non-negative integer. Additional passes stop once the code
   * stabilizes and throw if the last allowed pass still changes the code.
   * Set false or 0 to run only the initial fix.
   *
   * @default 10
   */
  recursive?: false | number

  /**
   * run verification after applying the fix
   *
   * @default true
   */
  verifyAfterFix?: boolean

  /**
   * Require a non-null output expectation to change the input code.
   * Set false to allow unchanged string or callback output expectations.
   *
   * @default true
   */
  verifyFixChanges?: boolean
}

/**
 * Rule tester init options
 */
export type RuleTesterInitOptions<RuleOptions = any> =
  RuleTesterBehaviorOptions &
    StylelintOptions<RuleOptions> & {
      /**
       * rule name to test
       */
      name: string

      /**
       * default filenames to be used for tests
       */
      defaultFileNames?: Partial<DefaultFilenames>
    }

/**
 * Rule Tester
 * @pg
 */
export interface RuleTester<RuleOptions = any> {
  /**
   * run multiple test cases
   */
  run: (options: TestCasesOptions<RuleOptions>) => Promise<void>

  /**
   * run a single test case
   */
  each: (arg: TestCase<RuleOptions>) => Promise<{
    result: TestExecutionResult
    testcase: NormalizedTestCase<RuleOptions>
  }>

  /**
   * run a single invalid test case
   */
  invalid: (arg: InvalidTestCase<RuleOptions>) => Promise<{
    result: TestExecutionResult
    testcase: NormalizedTestCase<RuleOptions>
  }>

  /**
   * run a single valid test case
   */
  valid: (arg: ValidTestCase<RuleOptions>) => Promise<{
    result: TestExecutionResult
    testcase: NormalizedTestCase<RuleOptions>
  }>
}
