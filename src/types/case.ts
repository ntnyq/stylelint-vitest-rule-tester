import type { Awaitable } from '@ntnyq/utils'
import type { LinterOptions } from 'stylelint'
import type {
  LintResultDeprecation,
  LintResultInvalidOptionWarning,
  LintResultParseError,
  LintResultWarning,
  StylelintOptions,
} from './stylelint'
import type { TestExecutionResult } from './test'
import type { RuleTesterBehaviorOptions } from './tester'

/**
 * Invalid test case
 */
export type InvalidTestCase = string | InvalidTestCaseBase
export type InvalidTestCaseBase = ValidTestCaseBase & {
  /**
   * Assert if output is expected.
   * Pass `null` to assert that the output is the same as the input.
   */
  output?: string | ((output: string, input: string) => Awaitable<void>) | null

  /**
   * expect for {@link LintResultDeprecation}
   */
  deprecations?:
    | number
    | (string | LintResultDeprecation)[]
    | ((deprecations: LintResultDeprecation[]) => Awaitable<void>)

  /**
   * expect for {@link LintResultInvalidOptionWarning}
   */
  invalidOptionWarnings?:
    | number
    | (string | LintResultInvalidOptionWarning)[]
    | ((
        invalidOptionWarnings: LintResultInvalidOptionWarning[],
      ) => Awaitable<void>)

  /**
   * expect for {@link LintResultParseError}
   */
  parseErrors?:
    | number
    | (string | LintResultParseError)[]
    | ((parseErrors: LintResultParseError[]) => Awaitable<void>)

  /**
   * expect for {@link LintResultWarning}
   */
  warnings?:
    | number
    | (string | LintResultWarning)[]
    | ((warnings: LintResultWarning[]) => Awaitable<void>)
}

/**
 * Valid test case
 */
export type ValidTestCase = string | ValidTestCaseBase
export type ValidTestCaseBase = RuleTesterBehaviorOptions
  & StylelintOptions & {
    /**
     * code to test
     */
    code: string

    /**
     * test case description
     */
    description?: string

    /**
     * test case filename
     */
    filename?: string

    /**
     * test case name
     */
    name?: string

    /**
     * only run this test case
     */
    only?: boolean

    /**
     * skip this test case
     */
    skip?: boolean

    /**
     * lint result
     *
     * @deprecated use `after` instead
     */
    onResult?: (result: TestExecutionResult) => Awaitable<void>

    /**
     * hook after run test case
     */
    after?: (
      this: NormalizedTestCase,
      result: TestExecutionResult,
    ) => Awaitable<void>

    /**
     * hook before run test case
     */
    before?: (
      this: NormalizedTestCase,
      linterOptions: LinterOptions,
    ) => Awaitable<void>
  }

/**
 * Test case
 * @pg
 */
export type TestCase = InvalidTestCase | ValidTestCase

/**
 * Normalized test case
 * @pg
 */
export type NormalizedTestCase = InvalidTestCaseBase & {
  code: string
  filename: string
  type: 'invalid' | 'valid'
}
