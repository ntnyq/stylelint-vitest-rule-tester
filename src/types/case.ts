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
export type InvalidTestCase<RuleOptions = any> =
  | string
  | InvalidTestCaseBase<RuleOptions>
export type InvalidTestCaseBase<RuleOptions = any> =
  ValidTestCaseBase<RuleOptions> & {
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
     * Assert if output is expected.
     * Pass `null` to assert that the output is the same as the input.
     */
    output?:
      | string
      | ((output: string, input: string) => Awaitable<void>)
      | null

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
export type ValidTestCase<RuleOptions = any> =
  | string
  | ValidTestCaseBase<RuleOptions>
export type ValidTestCaseBase<RuleOptions = any> = RuleTesterBehaviorOptions
  & StylelintOptions<RuleOptions> & {
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
      this: NormalizedTestCase<RuleOptions>,
      result: TestExecutionResult,
    ) => Awaitable<void>

    /**
     * hook before run test case
     */
    before?: (
      this: NormalizedTestCase<RuleOptions>,
      linterOptions: LinterOptions,
    ) => Awaitable<void>
  }

/**
 * Test case
 * @pg
 */
export type TestCase<RuleOptions = any> =
  | InvalidTestCase<RuleOptions>
  | ValidTestCase<RuleOptions>

/**
 * Normalized test case
 * @pg
 */
export type NormalizedTestCase<RuleOptions = any> =
  InvalidTestCaseBase<RuleOptions> & {
    code: string
    filename: string
    type: 'invalid' | 'valid'
  }
