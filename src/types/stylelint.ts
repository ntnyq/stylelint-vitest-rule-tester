import type Postcss from 'postcss'
import type Stylelint from 'stylelint'

export type StylelintLinterResult = Omit<
  Stylelint.LinterResult,
  'cwd' | 'report'
>

/**
 * @pg
 */
export type LintResultDeprecation = {
  text: string
  reference?: string
}
export type LintResultInvalidOptionWarning = {
  text: string
}
export type LintResultParseError = Postcss.Warning & {
  stylelintType: 'parseError'
}
export type LintResultWarning = Stylelint.Warning

/**
 * @pg
 */
export type LintResultMessage =
  | LintResultDeprecation
  | LintResultInvalidOptionWarning
  | LintResultParseError
  | LintResultWarning

/**
 * Stylelint options
 */
export interface StylelintOptions {
  /**
   * linter options for `stylelint.lint(options)`
   */
  linterOptions?: Stylelint.LinterOptions

  /**
   * rule options
   */
  ruleOptions?: any

  /**
   * stylelint config
   */
  stylelintConfig?: Stylelint.Config
}
