import { isFunction, isNumber, toArray } from '@ntnyq/utils'
import { expect } from 'vitest'
import { normalizeCaseMessage } from './normalizeCaseMessage'
import type Stylelint from 'stylelint'
import type {
  LintResultDeprecation,
  LintResultInvalidOptionWarning,
  LintResultParseError,
  LintResultWarning,
  NormalizedTestCase,
} from '../types'

async function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'warnings'
  testCase: NormalizedTestCase
  messages: LintResultWarning[]
}): Promise<void>
async function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'parseErrors'
  testCase: NormalizedTestCase
  messages: LintResultParseError[]
}): Promise<void>
async function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'deprecations'
  testCase: NormalizedTestCase
  messages: LintResultDeprecation[]
}): Promise<void>
async function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'invalidOptionWarnings'
  testCase: NormalizedTestCase
  messages: LintResultInvalidOptionWarning[]
}): Promise<void>
async function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'warnings' | 'parseErrors' | 'deprecations' | 'invalidOptionWarnings'
  testCase: NormalizedTestCase
  messages: any[]
}) {
  if (!testCase[type]) {
    return
  }

  if (isFunction(testCase[type])) {
    await testCase[type]?.(messages)
  } else if (isNumber(testCase[type])) {
    expect.soft(messages.length, `number of ${type}`).toBe(testCase[type])
  } else {
    const testCaseMessages = toArray(testCase[type]).map(message =>
      normalizeCaseMessage(message),
    )

    expect(testCaseMessages.length, `number of ${type}`).toBe(
      testCase[type].length,
    )

    testCaseMessages.forEach((expected, idx) => {
      expect
        .soft(messages[idx], `object of ${type}-${idx}`)
        .toMatchObject(expected)
    })
  }
}

export async function validateLintResult(
  testCase: NormalizedTestCase,
  lintResult: Stylelint.LintResult,
) {
  await verifyLintResultMessages({
    type: 'warnings',
    testCase,
    messages: lintResult.warnings,
  })
  await verifyLintResultMessages({
    type: 'parseErrors',
    testCase,
    messages: lintResult.parseErrors,
  })
  await verifyLintResultMessages({
    type: 'deprecations',
    testCase,
    messages: lintResult.deprecations,
  })
  await verifyLintResultMessages({
    type: 'invalidOptionWarnings',
    testCase,
    messages: lintResult.invalidOptionWarnings,
  })
}
