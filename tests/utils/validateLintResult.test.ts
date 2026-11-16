import { Warning } from 'postcss'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { normalizeTestCase, validateLintResult } from '../../src'
import type { LintResult } from 'stylelint'

function createLintResult(): LintResult {
  const messages = ['first diagnostic', 'second diagnostic']

  return {
    warnings: messages.map(text => ({
      text,
      rule: 'test/rule',
      severity: 'error',
      line: 1,
      column: 1,
    })),
    deprecations: messages.map(text => ({
      text,
    })),
    invalidOptionWarnings: messages.map(text => ({
      text,
    })),
    parseErrors: messages.map(text =>
      Object.assign(new Warning(text), {
        stylelintType: 'parseError' as const,
      }),
    ),
  }
}

describe.each([
  'warnings',
  'deprecations',
  'invalidOptionWarnings',
  'parseErrors',
] as const)('%s assertions', type => {
  beforeEach(() => {
    // Make assertion failures catchable without marking the outer test as failed.
    vi.spyOn(expect, 'soft').mockImplementation(expect)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([{ expected: ['first diagnostic'] }, { expected: [] }])(
    'rejects unexpected diagnostics with an array matcher $expected',
    async ({ expected }) => {
      const testcase = normalizeTestCase({ code: '', [type]: expected }, {})

      await expect(
        validateLintResult(testcase, createLintResult()),
      ).rejects.toThrow(`number of ${type}`)
    },
  )

  it('rejects diagnostics when the expected count is zero', async () => {
    const testcase = normalizeTestCase({ code: '', [type]: 0 }, {})

    await expect(
      validateLintResult(testcase, createLintResult()),
    ).rejects.toThrow(`number of ${type}`)
  })

  it('accepts matching diagnostic arrays', async () => {
    const testcase = normalizeTestCase(
      { code: '', [type]: ['first diagnostic', 'second diagnostic'] },
      {},
    )

    await expect(
      validateLintResult(testcase, createLintResult()),
    ).resolves.toBeUndefined()
  })

  it('accepts the exact diagnostic count', async () => {
    const testcase = normalizeTestCase({ code: '', [type]: 2 }, {})

    await expect(
      validateLintResult(testcase, createLintResult()),
    ).resolves.toBeUndefined()
  })

  it('awaits custom diagnostic assertions', async () => {
    const result = createLintResult()
    let completed = false
    const assertion = vi.fn(async () => {
      await Promise.resolve()
      completed = true
    })
    const testcase = normalizeTestCase({ code: '', [type]: assertion }, {})

    await validateLintResult(testcase, result)

    expect(completed).toBe(true)
    expect(assertion).toHaveBeenCalledWith(result[type])
  })

  it.each([{ expected: 0 }, { expected: [] }])(
    'accepts no diagnostics with matcher $expected',
    async ({ expected }) => {
      const testcase = normalizeTestCase({ code: '', [type]: expected }, {})
      const result = createLintResult()

      result[type] = []

      await expect(
        validateLintResult(testcase, result),
      ).resolves.toBeUndefined()
    },
  )
})
