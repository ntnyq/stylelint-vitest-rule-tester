import stylelint from 'stylelint'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRuleTester, resolveRuleMeta } from '../src'
import type { Rule } from 'stylelint'
import type { RuleTesterBehaviorOptions } from '../src'

const ruleName = 'test/reliability'

function createTester(
  ruleFunction: (...args: Parameters<Rule>) => ReturnType<Rule>,
  options: RuleTesterBehaviorOptions = {},
) {
  const rule: Rule = Object.assign(ruleFunction, {
    ruleName,
    messages: {},
    meta: { fixable: true, url: 'https://example.com/reliability' },
  })

  return createRuleTester({
    name: ruleName,
    ...options,
    stylelintConfig: { plugins: [stylelint.createPlugin(ruleName, rule)] },
  })
}

describe('diagnostic and fix reliability', () => {
  beforeEach(() => {
    // Catch tester assertion failures without failing the enclosing test.
    vi.spyOn(expect, 'soft').mockImplementation(expect)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps the input when Stylelint cannot produce fixed code', async () => {
    const tester = createRuleTester({ name: 'no-empty-source' })
    const { result } = await tester.invalid({
      code: 'a {',
      warnings: 1,
      output: null,
    })

    expect(result.fixed).toBe(false)
    expect(result.code).toBe('a {')
    expect(result.steps).toHaveLength(1)
  })

  it('rejects valid cases with diagnostics only in the initial lint', async () => {
    const tester = createTester(() => (root, result) => {
      if (!result.stylelint.config?.fix) {
        stylelint.utils.report({
          ruleName,
          result,
          node: root,
          message: 'Initial warning',
        })
      }
    })

    await expect(tester.valid('a {}')).rejects.toThrow(
      'no warnings on valid cases',
    )
  })

  it('accepts an unchanged invalid case whose diagnostic disappears in fix mode', async () => {
    const tester = createTester(() => (root, result) => {
      if (!result.stylelint.config?.fix) {
        stylelint.utils.report({
          ruleName,
          result,
          node: root,
          message: 'Initial warning',
        })
      }
    })

    const { result } = await tester.invalid({ code: 'a {}', output: null })

    expect(result.fixed).toBe(false)
  })

  it('honors verifyAfterFix when a fix leaves unfixable warnings', async () => {
    const tester = createTester(
      () => (root, result) => {
        root.walkDecls(node => {
          stylelint.utils.report({
            ruleName,
            result,
            node,
            message: 'Unexpected declaration',
            fix:
              node.value === 'red'
                ? () => {
                    node.value = 'blue'
                  }
                : undefined,
          })
        })
      },
      { verifyAfterFix: false },
    )

    const { result } = await tester.invalid({
      code: 'a { color: red }',
      warnings: 1,
      output: 'a { color: blue }',
    })

    expect(result.results[0].warnings).toHaveLength(1)
  })

  it('returns diagnostics from the final recursive pass', async () => {
    const tester = createTester(() => (root, result) => {
      root.walkDecls(node => {
        if (Number(node.value) < 2) {
          stylelint.utils.report({
            ruleName,
            result,
            node,
            message: 'Increment value',
            fix() {
              node.value = String(Number(node.value) + 1)
            },
          })
        }

        if (node.value === '1') {
          stylelint.utils.report({
            ruleName,
            result,
            node,
            message: 'Intermediate value',
          })
        }
      })
    })

    const { result } = await tester.invalid({
      code: 'a { z-index: 0 }',
      warnings: 1,
      output: 'a { z-index: 2 }',
    })

    expect(result.results[0].warnings).toEqual([])
    expect(result.results).toEqual(result.steps?.at(-1)?.results)
  })

  it('rejects diagnostics introduced by a fix beyond ordinary warnings', async () => {
    const tester = createTester(() => (root, result) => {
      root.walkDecls(node => {
        if (node.value === 'red') {
          stylelint.utils.report({
            ruleName,
            result,
            node,
            message: 'Change value',
            fix() {
              node.value = 'blue'
            },
          })
        } else {
          result.warn('Invalid fixed value', {
            node,
            stylelintType: 'parseError',
          })
        }
      })
    })

    await expect(
      tester.invalid({ code: 'a { color: red }', warnings: 1 }),
    ).rejects.toThrow('no parseErrors after fix')
  })

  it('rejects an ignored test case instead of silently passing it', async () => {
    const tester = createRuleTester({
      name: 'no-empty-source',
      stylelintConfig: { ignoreFiles: ['**/*.css'] },
    })

    await expect(tester.valid('a {}')).rejects.toThrow('test case was ignored')
  })

  it('checks that an expected fix changes the code by default', async () => {
    const tester = createRuleTester({ name: 'at-rule-no-unknown' })

    await expect(
      tester.invalid({
        code: '@unknown {}',
        warnings: 1,
        output: '@unknown {}',
      }),
    ).rejects.toThrow('expected fix to change the code')
    await tester.invalid({
      code: '@unknown {}',
      warnings: 1,
      output: '@unknown {}',
      verifyFixChanges: false,
    })
  })

  it('resolves an unknown core rule without a metadata TypeError', async () => {
    await expect(
      resolveRuleMeta({ name: 'not-a-core-rule' }),
    ).resolves.toBeUndefined()
  })

  it('keeps the initial lint unfixed when config enables fixing', async () => {
    const tester = createRuleTester({
      name: 'at-rule-no-vendor-prefix',
      stylelintConfig: { fix: true },
    })

    const { result } = await tester.invalid({
      code: '@-webkit-keyframes x {}',
      warnings: 1,
      output: '@keyframes x {}',
    })

    expect(result.fixed).toBe(true)
  })
})
