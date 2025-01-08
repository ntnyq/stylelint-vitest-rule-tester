import { isEmptyArray, isFunction, isNull, isNumber, isUndefined, toArray } from '@ntnyq/utils'
import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILE_NAMES } from './constants'
import {
  getRuleName,
  normalizeCaseMessage,
  normalizeRuleOptions,
  normalizeTestCase,
  useLinterResult,
} from './utils'
import type { Config as LinterConfig, LinterOptions } from 'stylelint'
import type {
  DefaultFilenames,
  InvalidTestCase,
  LintResultDeprecation,
  LintResultInvalidOptionWarning,
  LintResultParseError,
  LintResultWarning,
  NormalizedTestCase,
  RuleTester,
  RuleTesterInitOptions,
  TestCase,
  TestCasesOptions,
  TestExecutionResult,
  ValidTestCase,
} from './types'

function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'warnings'
  testCase: NormalizedTestCase
  messages: LintResultWarning[]
}): void
function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'parseErrors'
  testCase: NormalizedTestCase
  messages: LintResultParseError[]
}): void
function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'deprecations'
  testCase: NormalizedTestCase
  messages: LintResultDeprecation[]
}): void
function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'invalidOptionWarnings'
  testCase: NormalizedTestCase
  messages: LintResultInvalidOptionWarning[]
}): void
function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'warnings' | 'parseErrors' | 'deprecations' | 'invalidOptionWarnings'
  testCase: NormalizedTestCase
  messages: any[]
  // | LintResultWarning[]
  // | LintResultParseError[]
  // | LintResultDeprecation[]
  // | LintResultInvalidOptionWarning[]
}) {
  if (!testCase[type]) {
    return
  }

  if (isFunction(testCase[type])) {
    testCase[type]?.(messages)
  } else if (isNumber(testCase[type])) {
    expect.soft(messages.length, `number of ${type}`).toBe(testCase[type])
  } else {
    const testCaseMessages = toArray(testCase[type]).map(message => normalizeCaseMessage(message))

    expect(testCaseMessages.length, `number of ${type}`).toBe(testCase[type].length)

    testCaseMessages.forEach((expected, idx) => {
      expect.soft(messages[idx], `object of ${type}-${idx}`).toMatchObject(expected)
    })
  }
}

export function createRuleTester(options: RuleTesterInitOptions): RuleTester {
  const defaultFilenames: Partial<DefaultFilenames> = {
    ...DEFAULT_FILE_NAMES,
    ...options.defaultFileNames,
  }
  const ruleName = getRuleName(options)

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

    const linterConfig: LinterConfig = {
      ...options.stylelintConfig,
      ...testCase.stylelintConfig,
      rules: {
        [ruleName]: normalizeRuleOptions(testCase, options),
      },
    }

    const lintOptions: LinterOptions = {
      ...options.linterOptions,
      config: linterConfig,
      code: testCase.code,
      codeFilename: testCase.filename,
      fix: false,
      quietDeprecationWarnings: true,
    }

    const linterResult = await stylelint.lint(lintOptions)
    const {
      // errored,
      warnings,
      parseErrors,
      deprecations,
      invalidOptionWarnings,
    } = useLinterResult(linterResult)

    verifyLintResultMessages({
      type: 'warnings',
      testCase,
      messages: warnings,
    })
    verifyLintResultMessages({
      type: 'parseErrors',
      testCase,
      messages: parseErrors,
    })
    verifyLintResultMessages({
      type: 'deprecations',
      testCase,
      messages: deprecations,
    })
    verifyLintResultMessages({
      type: 'invalidOptionWarnings',
      testCase,
      messages: invalidOptionWarnings,
    })

    async function fix(code: string) {
      const linterResult = await stylelint.lint({
        ...lintOptions,
        code,
        fix: true,
      })

      // check only invalid should change after fix
      // maybe check linterResult.report is an empty string
      // if (linterResult.code === code && verifyFixChanges) {
      //   throw new Error(`Expected code to be changed after fix, but it's the same as the input.`)
      // }
      return {
        ...linterResult,
        fixed: linterResult.code !== code, // check if the code is changed
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
      testCase.type === 'invalid' &&
      isUndefined(testCase.output) &&
      isUndefined(testCase.warnings) &&
      isUndefined(testCase.parseErrors) &&
      isUndefined(testCase.deprecations) &&
      isUndefined(testCase.invalidOptionWarnings)
    ) {
      throw new Error(
        `Invalid test case must have either 'output', 'warnings', 'parseErrors', 'deprecations', or 'invalidOptionWarnings' property.`,
      )
    }

    if (result.fixed && verifyAfterFix) {
      const linterResult = await stylelint.lint({
        ...lintOptions,
        code: result.code,
        fix: false,
      })

      expect.soft(useLinterResult(linterResult).warnings, 'no warnings after fix').toEqual([])
    }

    testCase.onResult?.(result)

    return result
  }

  async function valid(arg: ValidTestCase | string) {
    const linterResult = await each(arg)
    const result = useLinterResult(linterResult)

    expect.soft(result.fixed, 'no need to fix for valid cases').toBeFalsy()
    expect.soft(result.warnings, 'no warnings on valid cases').toEqual([])
    // expect.soft(result.deprecations, 'no deprecations on valid cases').toEqual([])
    // expect.soft(result.parseErrors, 'no parseErrors on valid cases').toEqual([])
    // expect.soft(result.invalidOptionWarnings, 'no invalidOptionWarnings on valid cases').toEqual([])

    return linterResult
  }

  async function invalid(arg: InvalidTestCase | string) {
    const linterResult = await each(arg)
    const result = useLinterResult(linterResult)

    const noMessages =
      isEmptyArray(result.warnings) &&
      isEmptyArray(result.deprecations) &&
      isEmptyArray(result.parseErrors) &&
      isEmptyArray(result.invalidOptionWarnings)

    expect
      .soft(
        noMessages,
        'expect either have warnings, deprecations, parseErrors or invalidOptionWarnings',
      )
      .toBeFalsy()

    return linterResult
  }

  function run(cases: TestCasesOptions) {
    describe(ruleName, () => {
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

            run(`Valid #${index}: ${testCase.description || testCase.code}`, async () => {
              const result = await valid(testCase)
              await cases?.onResult?.(testCase, result)
            })
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

            run(`Invalid #${index}: ${testCase.description || testCase.code}`, async () => {
              const result = await invalid(testCase)
              await cases?.onResult?.(testCase, result)
            })
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
