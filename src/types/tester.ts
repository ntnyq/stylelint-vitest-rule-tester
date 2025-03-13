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
   * the number of times to recursively apply the rule
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
   * verify that fix allways changes the code
   *
   * @default true
   */
  verifyFixChanges?: boolean
}

/**
 * Rule tester init options
 */
export type RuleTesterInitOptions = RuleTesterBehaviorOptions
  & StylelintOptions & {
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
export interface RuleTester {
  /**
   * run multiple test cases
   */
  run: (options: TestCasesOptions) => Promise<void>

  /**
   * run a single test case
   */
  each: (arg: TestCase) => Promise<{
    result: TestExecutionResult
    testcase: NormalizedTestCase
  }>

  /**
   * run a single invalid test case
   */
  invalid: (arg: InvalidTestCase) => Promise<{
    result: TestExecutionResult
    testcase: NormalizedTestCase
  }>

  /**
   * run a single valid test case
   */
  valid: (arg: ValidTestCase) => Promise<{
    result: TestExecutionResult
    testcase: NormalizedTestCase
  }>
}
