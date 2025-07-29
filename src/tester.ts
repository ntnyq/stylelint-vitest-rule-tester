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

  async function each(c: TestCase<RuleOptions>) {
    const testcase = normalizeTestCase(c, defaultFilenames)

    const {
      recursive = 10,
      verifyAfterFix = true,
      // verifyFixChanges = true,
    } = {
      ...options,
      ...testcase,
    }

    const ruleMeta = await resolveRuleMeta(options)
    const ruleOptions = resolveRuleOptions(testcase, options, ruleMeta)
    const linterOptions = resolveLinterOptions(options, testcase, ruleOptions)

    // eslint-disable-next-line no-useless-call
    await testcase.before?.call(testcase, linterOptions)

    const linterResult = await stylelint.lint(linterOptions)
    const [lintResult] = linterResult.results

    await validateLintResult(testcase, lintResult)

    async function fix(code: string) {
      const linterResult = await stylelint.lint({
        ...linterOptions,
        code,
        fix: true,
      })

      // check if the code is changed
      const fixed = linterResult.code !== code

      // // not change after fix
      // if (!fixed && verifyFixChanges) {
      //   throw new Error(
      //     `Expected code to be changed after fix, but it's the same as the input.`,
      //   )
      // }

      return {
        ...normalizeLinterResult(linterResult),
        fixed,
      }
    }

    const fixedLinterResult = await fix(testcase.code)

    const result: TestExecutionResult = {
      ...fixedLinterResult,
      steps: [fixedLinterResult],
    }

    // should recursive fix
    if (result.fixed && recursive !== false) {
      let r = recursive

      for (r = recursive; r >= 0; r--) {
        const step = await fix(result.code!)

        result.steps?.push(step)
        result.code = step.code

        if (!step.fixed) {
          break
        }
      }

      if (r === 0) {
        throw new Error(
          `Fix recursion limit exceeded, possibly the fix is not stable. Last output:\n-------\n${result.code}\n-------`,
        )
      }
    }

    // expected fixed
    if (!isUndefined(testcase.output)) {
      if (isNull(testcase.output)) {
        // null means output should be the same as the input
        expect(result.code, 'output').toBe(testcase.code)
      } else if (isFunction(testcase.output)) {
        // custom assertion
        await testcase.output(result.code || '', testcase.code)
      } else {
        expect(result.code, 'output').toBe(testcase.output)
      }
    }

    if (
      testcase.type === 'invalid'
      && isUndefined(testcase.output)
      && isUndefined(testcase.warnings)
      && isUndefined(testcase.parseErrors)
      && isUndefined(testcase.deprecations)
      && isUndefined(testcase.invalidOptionWarnings)
    ) {
      throw new Error(
        `Invalid test case must have either 'output', 'warnings', 'parseErrors', 'deprecations', or 'invalidOptionWarnings' property.`,
      )
    }

    if (result.fixed && verifyAfterFix) {
      const { results = [] } = await stylelint.lint({
        ...linterOptions,
        code: result.code,
        fix: false,
      })
      const [lintResult] = results

      expect.soft(lintResult, 'no lint result').toBeDefined()
      expect.soft(lintResult.warnings, 'no warnings after fix').toEqual([])
    }

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
