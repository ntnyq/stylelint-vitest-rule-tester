import { isFunction, isNumber, toArray } from '@ntnyq/utils'
import { expect } from 'vitest'
import { normalizeCaseMessage } from './normalizeCaseMessage'
import type {
  LintResultDeprecation,
  LintResultInvalidOptionWarning,
  LintResultParseError,
  LintResultWarning,
  NormalizedTestCase,
} from '../types'

export function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'warnings'
  testCase: NormalizedTestCase
  messages: LintResultWarning[]
}): void
export function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'parseErrors'
  testCase: NormalizedTestCase
  messages: LintResultParseError[]
}): void
export function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'deprecations'
  testCase: NormalizedTestCase
  messages: LintResultDeprecation[]
}): void
export function verifyLintResultMessages({
  type,
  testCase,
  messages,
}: {
  type: 'invalidOptionWarnings'
  testCase: NormalizedTestCase
  messages: LintResultInvalidOptionWarning[]
}): void
export function verifyLintResultMessages({
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
    testCase[type]?.(messages)
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
