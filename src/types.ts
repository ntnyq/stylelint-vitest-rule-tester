import type { Config, LinterOptions, LinterResult } from 'stylelint'

/**
 * default filename when not provided
 */
export interface DefaultFilenames {
  css: string
  less: string
  postcss: string
  sass: string
  scss: string
  styl: string
  stylus: string
  [key: string]: string
}

/**
 * rule to test
 */
export type RuleModule = any

/**
 * rule options
 */
export type RuleOptions = any

/**
 * Rule Tester
 */
export interface RuleTester {
  /**
   * run a single test case
   */
  each: (arg: TestCase) => Promise<TestExecutionResult>

  /**
   * run a single valid test case
   */
  valid: (arg: ValidTestCase) => Promise<TestExecutionResult>

  /**
   * run a single invalid test case
   */
  invalid: (arg: InvalidTestCase) => Promise<TestExecutionResult>

  /**
   * run multiple test cases
   */
  run: (options: TestCasesOptions) => void
}
export interface RuleTesterBehaviorOptions {
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
export interface RuleTesterInitOptions extends RuleTesterBehaviorOptions, StylelintOptions {
  /**
   * the rule to test
   */
  rule?: RuleModule

  /**
   * the name of the rule to test
   */
  name?: string

  /**
   * the default filenames to be used for tests
   */
  defaultFileNames?: Partial<DefaultFilenames>
}

/**
 * Test
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
  onResult?: (testCase: NormalizedTestCase, result: LinterResult) => Promise<void> | void
}
export interface TestExecutionResult extends LinterResult {
  /**
   * whether the code was fixed
   */
  fixed?: boolean

  /**
   * if the rule fixes in multiple steps, the result of each step is present here
   */
  steps?: LinterResult[]
}

/**
 * Stylelint
 */
export interface LintResultDeprecation {
  text: string
  reference?: string
}
export interface LintResultInvalidOptionWarning {
  text: string
}
export type LintResultMessage =
  | LintResultDeprecation
  | LintResultInvalidOptionWarning
  | LintResultParseError
  | LintResultWarning
export interface LintResultParseError {
  column: number
  line: number
  endColumn?: number
  endLine?: number
  // postcss node
  node: any
  plugin: string
  stylelintType: 'parseError'
  text: string
  type: 'warning'
}
export interface LintResultWarning {
  column: number
  line: number
  rule: string
  severity: 'error' | 'warning'
  text: string
  endColumn?: number
  endLine?: number
  stylelintType?: 'deprecation' | 'invalidOption' | 'parseError'
  url?: string
}
export interface StylelintOptions {
  /**
   * stylelint config
   */
  stylelintConfig?: Config

  /**
   * linter options for `stylelint.lint(options)`
   */
  linterOptions?: LinterOptions

  /**
   * rule options
   */
  ruleOptions?: RuleOptions
}

/**
 * Test case
 */
export type InvalidTestCase = string | InvalidTestCaseBase
export interface InvalidTestCaseBase extends ValidTestCaseBase {
  warnings?: number | (string | LintResultWarning)[] | ((warnings: LintResultWarning[]) => void)

  deprecations?:
    | number
    | (string | LintResultDeprecation)[]
    | ((deprecations: LintResultDeprecation[]) => void)

  invalidOptionWarnings?:
    | number
    | (string | LintResultInvalidOptionWarning)[]
    | ((invalidOptionWarnings: LintResultInvalidOptionWarning[]) => void)

  parseErrors?:
    | number
    | (string | LintResultParseError)[]
    | ((parseErrors: LintResultParseError[]) => void)

  /**
   * Assert if output is expected.
   * Pass `null` to assert that the output is the same as the input.
   */
  output?: string | ((output: string, input: string) => void) | null
}
export interface NormalizedTestCase extends InvalidTestCaseBase {
  code: string
  type: 'invalid' | 'valid'
}
export type TestCase = InvalidTestCase | ValidTestCase
export type ValidTestCase = string | ValidTestCaseBase
export interface ValidTestCaseBase extends RuleTesterBehaviorOptions, StylelintOptions {
  /**
   * test case name
   */
  name?: string

  /**
   * test case description
   */
  description?: string

  /**
   * code to test
   */
  code: string

  /**
   * test case filename
   */
  filename?: string

  /**
   * only run this test case
   */
  only?: boolean

  /**
   * skip this test case
   */
  skip?: boolean

  /**
   * rule options
   */
  ruleOptions?: RuleOptions

  /**
   * lint result
   */
  onResult?: (result: LinterResult) => void
}
