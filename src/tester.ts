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

export function createRuleTester(options: RuleTesterInitOptions): RuleTester {
  const defaultFilenames: Partial<DefaultFilenames> = {
    ...DEFAULT_FILE_NAMES,
    ...options.defaultFileNames,
  }

  async function each(c: TestCase) {
    const testCase = normalizeTestCase(c, defaultFilenames)

    const {
      recursive = 10,
      verifyAfterFix = true,
      // verifyFixChanges = true,
    } = {
      ...options,
      ...testCase,
    }

    const ruleMeta = await resolveRuleMeta(options)
    const ruleOptions = resolveRuleOptions(testCase, options, ruleMeta)
    const linterOptions = resolveLinterOptions(options, testCase, ruleOptions)
    const linterResult = await stylelint.lint(linterOptions)
    const [lintResult] = linterResult.results

    validateLintResult(testCase, lintResult)

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

    const fixedLinterResult = await fix(testCase.code)

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
    if (!isUndefined(testCase.output)) {
      if (isNull(testCase.output)) {
        // null means output should be the same as the input
        expect(result.code, 'output').toBe(testCase.code)
      } else if (isFunction(testCase.output)) {
        // custom assertion
        testCase.output(result.code || '', testCase.code)
      } else {
        expect(result.code, 'output').toBe(testCase.output)
      }
    }

    if (
      testCase.type === 'invalid'
      && isUndefined(testCase.output)
      && isUndefined(testCase.warnings)
      && isUndefined(testCase.parseErrors)
      && isUndefined(testCase.deprecations)
      && isUndefined(testCase.invalidOptionWarnings)
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

    testCase.onResult?.(result)

    return result
  }

  async function valid(arg: ValidTestCase | string) {
    const executionResult = await each(arg)
    const [lintResult] = executionResult.results

    expect.soft(lintResult, 'no lint result').toBeDefined()
    expect
      .soft(executionResult.fixed, 'no need to fix for valid cases')
      .toBeFalsy()

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

    return executionResult
  }

  async function invalid(arg: InvalidTestCase | string) {
    const executionResult = await each(arg)
    const [lintResult] = executionResult.results

    expect.soft(lintResult, 'no lint result').toBeDefined()

    // This case has been fixed
    if (executionResult.fixed) {
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

    return executionResult
  }

  function run(cases: TestCasesOptions) {
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
                const executionResult = await valid(testCase)
                await cases?.onResult?.(testCase, executionResult)
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
                const executionResult = await invalid(testCase)
                await cases?.onResult?.(testCase, executionResult)
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
