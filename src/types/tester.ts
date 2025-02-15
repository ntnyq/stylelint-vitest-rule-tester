import type { InvalidTestCase, TestCase, ValidTestCase } from './case'
import type { DefaultFilenames } from './file'
import type { RuleModule } from './rule'
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
     * default filenames to be used for tests
     */
    defaultFileNames?: Partial<DefaultFilenames>

    /**
     * rule name to test
     */
    name?: string

    /**
     * rule module to test
     */
    rule?: RuleModule
  }

/**
 * Rule Tester
 * @pg
 */
export interface RuleTester {
  /**
   * run a single test case
   */
  each: (arg: TestCase) => Promise<TestExecutionResult>

  /**
   * run a single invalid test case
   */
  invalid: (arg: InvalidTestCase) => Promise<TestExecutionResult>

  /**
   * run multiple test cases
   */
  run: (options: TestCasesOptions) => void

  /**
   * run a single valid test case
   */
  valid: (arg: ValidTestCase) => Promise<TestExecutionResult>
}
