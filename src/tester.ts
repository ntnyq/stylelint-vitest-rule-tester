import { isEmptyArray, isFunction, isNull, isUndefined } from '@ntnyq/utils'
import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILE_NAMES } from './constants'
import {
  normalizeLinterResult,
  normalizeTestCase,
  resolveLinterOptions,
  resolveRuleMeta,
  resolveRuleOptions,
  validateLintResult,
} from './utils'
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

    const fixed = linterResult.code !== code

    return {
      ...normalizeLinterResult(linterResult),
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

    if (!result.fixed || recursive === false) {
      return result
    }

    let remainingAttempts = recursive

    for (
      remainingAttempts = recursive;
      remainingAttempts >= 0;
      remainingAttempts--
    ) {
      const step = await applyFix(result.code!, linterOptions)

      result.steps?.push(step)
      result.code = step.code

      if (!step.fixed) {
        break
      }
    }

    if (remainingAttempts === 0) {
      const totalAttempts = recursive + 1
      throw new Error(
        `Fix recursion limit exceeded after ${totalAttempts} attempts, possibly the fix is not stable. Last output:\n-------\n${result.code}\n-------`,
      )
    }

    return result
  }

  /**
   * Verify the output matches expected value
   */
  async function verifyOutput(
    testcase: NormalizedTestCase<RuleOptions>,
    result: TestExecutionResult,
  ) {
    const normalizedTestCase = testcase

    if (isUndefined(normalizedTestCase.output)) {
      return
    }

    if (isNull(normalizedTestCase.output)) {
      // null means output should be the same as the input
      expect(result.code, 'output').toBe(normalizedTestCase.code)
    } else if (isFunction(normalizedTestCase.output)) {
      // custom assertion
      await normalizedTestCase.output(
        result.code || '',
        normalizedTestCase.code,
      )
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

    const { results = [] } = await stylelint.lint({
      ...linterOptions,
      code: result.code,
      fix: false,
    })
    const [lintResult] = results

    expect.soft(lintResult, 'no lint result').toBeDefined()
    expect.soft(lintResult.warnings, 'no warnings after fix').toEqual([])
  }

  /**
   * Validate invalid test case has required assertions
   */
  function validateInvalidTestCase(testcase: NormalizedTestCase<RuleOptions>) {
    const normalized = testcase

    if (
      normalized.type === 'invalid'
      && isUndefined(normalized.output)
      && isUndefined(normalized.warnings)
      && isUndefined(normalized.parseErrors)
      && isUndefined(normalized.deprecations)
      && isUndefined(normalized.invalidOptionWarnings)
    ) {
      throw new Error(
        `Invalid test case must have either 'output', 'warnings', 'parseErrors', 'deprecations', or 'invalidOptionWarnings' property.`,
      )
    }
  }

  async function each(c: TestCase<RuleOptions>) {
    const testcase = normalizeTestCase(c, defaultFilenames)

    const { recursive = 10, verifyAfterFix = true } = {
      ...options,
      ...testcase,
    }

    // Resolve rule configuration
    const ruleMeta = await resolveRuleMeta(options)
    const ruleOptions = resolveRuleOptions(testcase, options, ruleMeta)
    const linterOptions = resolveLinterOptions(options, testcase, ruleOptions)

    // Run before hook
    // eslint-disable-next-line no-useless-call
    await testcase.before?.call(testcase, linterOptions)

    // Initial lint without fix
    const linterResult = await stylelint.lint(linterOptions)
    const [lintResult] = linterResult.results

    await validateLintResult(testcase, lintResult)

    // Apply fix and collect result
    const fixedLinterResult = await applyFix(testcase.code, linterOptions)
    let result: TestExecutionResult = {
      ...fixedLinterResult,
      steps: [fixedLinterResult],
    }

    // Apply recursive fix if needed
    result = await applyRecursiveFix(result, linterOptions, recursive)

    // Verify output expectations
    await verifyOutput(testcase, result)

    // Validate invalid test case has assertions
    validateInvalidTestCase(testcase)

    // Verify fixed result has no warnings
    await verifyFixedResult(result, linterOptions, verifyAfterFix)

    // Run after hooks
    await testcase.onResult?.(result)
    // eslint-disable-next-line no-useless-call
    await testcase.after?.call(testcase, result)

    return {
      testcase,
      result,
    }
  }

  async function valid(arg: ValidTestCase<RuleOptions> | string) {
    const { testcase, result } = await each(arg)
    const [lintResult] = result.results

    expect.soft(lintResult, 'no lint result').toBeDefined()
    expect.soft(result.fixed, 'no need to fix for valid cases').toBeFalsy()

    expect.soft(lintResult.warnings, 'no warnings on valid cases').toEqual([])
    expect
      .soft(lintResult.deprecations, 'no deprecations on valid cases')
      .toEqual([])
    expect
      .soft(lintResult.parseErrors, 'no parseErrors on valid cases')
      .toEqual([])
    expect
      .soft(
        lintResult.invalidOptionWarnings,
        'no invalidOptionWarnings on valid cases',
      )
      .toEqual([])

    return {
      testcase,
      result,
    }
  }

  async function invalid(arg: InvalidTestCase<RuleOptions> | string) {
    const { testcase, result } = await each(arg)
    const [lintResult] = result.results

    expect.soft(lintResult, 'no lint result').toBeDefined()

    // This case has been fixed
    if (result.fixed) {
      expect
        .soft(lintResult.warnings, 'expect no warnings on fixed invalid case')
        .toEqual([])
    } else {
      const noMessages =
        isEmptyArray(lintResult.warnings)
        && isEmptyArray(lintResult.deprecations)
        && isEmptyArray(lintResult.parseErrors)
        && isEmptyArray(lintResult.invalidOptionWarnings)

      expect
        .soft(
          noMessages,
          'expect either have warnings, deprecations, parseErrors or invalidOptionWarnings',
        )
        .toBeFalsy()
    }

    return {
      testcase,
      result,
    }
  }

  async function run(cases: TestCasesOptions<RuleOptions>) {
    describe(options.name, () => {
      if (cases.valid?.length) {
        describe('valid', () => {
          cases.valid!.forEach((c, index) => {
            const testCase = normalizeTestCase(c, defaultFilenames, 'valid')
            let run: typeof it | typeof it.only = it

            if (testCase.only) {
              run = it.only
            }
            if (testCase.skip) {
              run = it.skip
            }

            run(
              `Valid #${index}: ${testCase.description || testCase.code}`,
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
            const testCase = normalizeTestCase(c, defaultFilenames, 'invalid')
            let run: typeof it | typeof it.only = it

            if (testCase.only) {
              run = it.only
            }
            if (testCase.skip) {
              run = it.skip
            }

            run(
              `Invalid #${index}: ${testCase.description || testCase.code}`,
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
