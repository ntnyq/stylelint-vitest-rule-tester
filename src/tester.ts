import { isEmptyArray, isFunction, isNull, isUndefined } from '@ntnyq/utils'
import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILE_NAMES } from './constants'
import {
  normalizeLinterResult,
  normalizeTestCase,
  resolveLinterOptions,
  resolveRuleOptions,
  validateLintResult,
} from './utils'
import { resolveRule } from './utils/resolveRuleMeta'
import type {
  DefaultFilenames,
  InvalidTestCase,
  NormalizedTestCase,
  RuleTester,
  RuleTesterInitOptions,
  TestCase,
  TestCasesOptions,
  TestExecutionResult,
  ValidTestCase,
} from './types'

export function createRuleTester<RuleOptions = any>(
  options: RuleTesterInitOptions<RuleOptions>,
): RuleTester<RuleOptions> {
  const defaultFilenames: Partial<DefaultFilenames> = {
    ...DEFAULT_FILE_NAMES,
    ...options.defaultFileNames,
  }

  function normalizeCase(c: TestCase<RuleOptions>, type?: 'invalid' | 'valid') {
    const testcase = typeof c === 'string' ? { code: c } : c
    const customSyntax =
      testcase.linterOptions?.customSyntax ??
      options.linterOptions?.customSyntax ??
      testcase.stylelintConfig?.customSyntax ??
      options.stylelintConfig?.customSyntax

    return normalizeTestCase(testcase, defaultFilenames, type, customSyntax)
  }

  function getLintResult(result: stylelint.LinterResult) {
    const [lintResult] = result.results

    expect(lintResult, 'no lint result').toBeDefined()
    expect(lintResult.ignored, 'test case was ignored').toBeFalsy()

    return lintResult
  }

  function verifyNoMessages(lintResult: stylelint.LintResult, context: string) {
    for (const type of [
      'warnings',
      'deprecations',
      'parseErrors',
      'invalidOptionWarnings',
    ] as const) {
      expect.soft(lintResult[type], `no ${type} ${context}`).toEqual([])
    }
  }

  /**
   * Apply fix to code and check if the code changed
   */
  async function applyFix(
    code: string,
    linterOptions: stylelint.LinterOptions,
  ) {
    const linterResult = await stylelint.lint({
      ...linterOptions,
      code,
      fix: true,
    })

    getLintResult(linterResult)

    // Parse errors may not have generated output.
    const fixedCode = linterResult.code ?? code
    const fixed = fixedCode !== code

    return {
      ...normalizeLinterResult(linterResult),
      code: fixedCode,
      fixed,
    }
  }

  /**
   * Apply fixes recursively until code stabilizes or limit reached
   */
  async function applyRecursiveFix(
    initialResult: TestExecutionResult,
    linterOptions: stylelint.LinterOptions,
    recursive: number | false,
  ): Promise<TestExecutionResult> {
    const result = { ...initialResult }

    if (!result.fixed || recursive === false || recursive === 0) {
      return result
    }

    for (let attempt = 0; attempt < recursive; attempt++) {
      const step = await applyFix(result.code, linterOptions)

      result.steps?.push(step)
      Object.assign(result, step, { fixed: initialResult.fixed })

      if (!step.fixed) {
        return result
      }
    }

    const totalAttempts = recursive + 1

    throw new Error(
      `Fix recursion limit exceeded after ${totalAttempts} attempts, possibly the fix is not stable. Last output:\n-------\n${result.code}\n-------`,
    )
  }

  /**
   * Verify the output matches expected value
   */
  async function verifyOutput(
    testcase: NormalizedTestCase<RuleOptions>,
    result: TestExecutionResult,
    verifyFixChanges: boolean,
  ) {
    const normalizedTestCase = testcase

    if (isUndefined(normalizedTestCase.output)) {
      return
    }

    if (verifyFixChanges && !isNull(normalizedTestCase.output)) {
      expect(result.code, 'expected fix to change the code').not.toBe(
        normalizedTestCase.code,
      )
    }

    if (isNull(normalizedTestCase.output)) {
      // null means output should be the same as the input
      expect(result.code, 'output').toBe(normalizedTestCase.code)
    } else if (isFunction(normalizedTestCase.output)) {
      // custom assertion
      await normalizedTestCase.output(result.code, normalizedTestCase.code)
    } else {
      expect(result.code, 'output').toBe(normalizedTestCase.output)
    }
  }

  /**
   * Verify fixed result has no warnings
   */
  async function verifyFixedResult(
    result: TestExecutionResult,
    linterOptions: stylelint.LinterOptions,
    verifyAfterFix: boolean,
  ) {
    if (!result.fixed || !verifyAfterFix) {
      return
    }

    const linterResult = await stylelint.lint({
      ...linterOptions,
      code: result.code,
      fix: false,
    })

    verifyNoMessages(getLintResult(linterResult), 'after fix')
  }

  /**
   * Validate invalid test case has required assertions
   */
  function validateInvalidTestCase(testcase: NormalizedTestCase<RuleOptions>) {
    const normalized = testcase

    if (
      normalized.type === 'invalid' &&
      isUndefined(normalized.output) &&
      isUndefined(normalized.warnings) &&
      isUndefined(normalized.parseErrors) &&
      isUndefined(normalized.deprecations) &&
      isUndefined(normalized.invalidOptionWarnings)
    ) {
      throw new Error(
        `Invalid test case must have either 'output', 'warnings', 'parseErrors', 'deprecations', or 'invalidOptionWarnings' property.`,
      )
    }
  }

  async function each(c: TestCase<RuleOptions>, type?: 'invalid' | 'valid') {
    const testcase = normalizeCase(c, type)

    const {
      recursive = 10,
      verifyAfterFix = true,
      verifyFixChanges = true,
    } = {
      ...options,
      ...testcase,
    }

    if (
      recursive !== false &&
      (!Number.isInteger(recursive) || recursive < 0)
    ) {
      throw new Error('recursive must be false or a non-negative integer')
    }

    validateInvalidTestCase(testcase)

    // Resolve rule configuration
    const linterOptions = resolveLinterOptions(options, testcase, true)
    const rule = await resolveRule({
      name: options.name,
      stylelintConfig: linterOptions.config,
      linterOptions,
    })
    const ruleOptions = resolveRuleOptions(
      testcase,
      options,
      rule?.meta,
      rule?.primaryOptionArray,
    )

    linterOptions.config = {
      ...linterOptions.config,
      rules: { [options.name]: ruleOptions },
    }

    // Run before hook
    // eslint-disable-next-line no-useless-call
    await testcase.before?.call(testcase, linterOptions)

    // Initial lint without fix
    const linterResult = await stylelint.lint(linterOptions)
    const lintResult = getLintResult(linterResult)

    await validateLintResult(testcase, lintResult)

    if (type === 'valid') {
      verifyNoMessages(lintResult, 'on valid cases')
    }

    // Apply fix and collect result
    const fixedLinterResult = await applyFix(testcase.code, linterOptions)
    let result: TestExecutionResult = {
      ...fixedLinterResult,
      steps: [fixedLinterResult],
    }

    // Apply recursive fix if needed
    result = await applyRecursiveFix(result, linterOptions, recursive)

    // Verify output expectations
    await verifyOutput(testcase, result, verifyFixChanges)

    if (type === 'valid') {
      expect.soft(result.fixed, 'no need to fix for valid cases').toBeFalsy()
      verifyNoMessages(result.results[0], 'on valid cases')
    } else if (type === 'invalid' && !result.fixed) {
      const noMessages =
        isEmptyArray(lintResult.warnings) &&
        isEmptyArray(lintResult.deprecations) &&
        isEmptyArray(lintResult.parseErrors) &&
        isEmptyArray(lintResult.invalidOptionWarnings)

      expect
        .soft(
          noMessages,
          'expect either have warnings, deprecations, parseErrors or invalidOptionWarnings',
        )
        .toBeFalsy()
    }

    // Verify fixed result has no warnings
    await verifyFixedResult(result, linterOptions, verifyAfterFix)

    // eslint-disable-next-line no-useless-call
    await testcase.after?.call(testcase, result)

    return {
      testcase,
      result,
    }
  }

  async function valid(arg: ValidTestCase<RuleOptions> | string) {
    return each(arg, 'valid')
  }

  async function invalid(arg: InvalidTestCase<RuleOptions> | string) {
    return each(arg, 'invalid')
  }

  async function run(cases: TestCasesOptions<RuleOptions>) {
    describe(options.name, () => {
      if (cases.valid?.length) {
        describe('valid', () => {
          cases.valid!.forEach((c, index) => {
            const testCase = normalizeCase(c, 'valid')
            let run: typeof it | typeof it.only = it

            if (testCase.only) {
              run = it.only
            }

            if (testCase.skip) {
              run = it.skip
            }

            run(
              `Valid #${index}: ${testCase.name || testCase.description || testCase.code}`,
              async () => {
                const { testcase, result } = await valid(testCase)

                await cases?.onResult?.(testcase, result)
              },
            )
          })
        })
      }

      if (cases.invalid?.length) {
        describe('invalid', () => {
          cases.invalid!.forEach((c, index) => {
            const testCase = normalizeCase(c, 'invalid')
            let run: typeof it | typeof it.only = it

            if (testCase.only) {
              run = it.only
            }

            if (testCase.skip) {
              run = it.skip
            }

            run(
              `Invalid #${index}: ${testCase.name || testCase.description || testCase.code}`,
              async () => {
                const { testcase, result } = await invalid(testCase)

                await cases?.onResult?.(testcase, result)
              },
            )
          })
        })
      }
    })
  }

  return {
    each,
    valid,
    invalid,
    run,
  }
}
