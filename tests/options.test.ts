import { describe, expect, it } from 'vitest'
import {
  createRuleTester,
  normalizeTestCase,
  resolveLinterOptions,
  resolveRuleOptions,
} from '../src'

describe('rule option overrides', () => {
  it('defaults to true when neither level supplies an option', () => {
    expect(
      resolveRuleOptions(normalizeTestCase('', {}), {
        name: 'no-empty-source',
      }),
    ).toEqual([true])
  })

  it('preserves a null override when injecting the rule URL', () => {
    expect(
      resolveRuleOptions(
        normalizeTestCase({ code: '', ruleOptions: null }, {}),
        { name: 'no-empty-source', ruleOptions: true },
        { url: 'https://example.com/rules/no-empty-source' },
      ),
    ).toEqual([null, { url: 'https://example.com/rules/no-empty-source' }])
  })
})

describe('linter option overrides', () => {
  it('selects syntax-specific default filenames and preserves explicit filenames', async () => {
    const tester = createRuleTester({
      name: 'no-empty-source',
      stylelintConfig: { customSyntax: 'postcss-scss' },
      defaultFileNames: { scss: 'custom.scss', less: 'custom.less' },
    })
    const scss = await tester.valid('$value: blue')
    const less = await tester.valid({
      code: '@value: blue;',
      linterOptions: { customSyntax: 'postcss-less' },
    })
    const explicit = await tester.valid({
      code: '$value: blue',
      filename: 'explicit.scss',
    })

    expect(scss.testcase.filename).toBe('custom.scss')
    expect(less.testcase.filename).toBe('custom.less')
    expect(explicit.testcase.filename).toBe('explicit.scss')
  })

  it('inherits tester options and overrides them for the case', () => {
    const linterOptions = { quiet: true, maxWarnings: 5 }
    const testcase = normalizeTestCase(
      { code: 'a {}', linterOptions: { quiet: false } },
      {},
    )

    expect(
      resolveLinterOptions(
        { name: 'no-empty-source', linterOptions },
        testcase,
        true,
      ),
    ).toMatchObject({ quiet: false, maxWarnings: 5 })
    expect(linterOptions).toEqual({ quiet: true, maxWarnings: 5 })
    expect(testcase.linterOptions).toEqual({ quiet: false })
  })

  it('keeps code, filename, rule configuration and initial fix mode under tester control', () => {
    const testcase = normalizeTestCase(
      {
        code: 'a {}',
        filename: 'case.css',
        linterOptions: {
          code: 'other {}',
          codeFilename: 'other.css',
          fix: true,
          config: { rules: { 'block-no-empty': true } },
        },
      },
      {},
    )

    expect(
      resolveLinterOptions({ name: 'no-empty-source' }, testcase, true),
    ).toMatchObject({
      code: 'a {}',
      codeFilename: 'case.css',
      fix: false,
      config: { rules: { 'no-empty-source': true } },
    })
  })

  it('applies a case override during linting without changing later cases', async () => {
    const tester = createRuleTester({
      name: 'at-rule-no-unknown',
      ruleOptions: [true, { severity: 'warning' }],
      linterOptions: { quiet: true },
    })

    const { result } = await tester.invalid({
      code: '@not-my-at-rule {}',
      linterOptions: { quiet: false },
      warnings: 1,
    })

    expect(result.results[0].warnings).toHaveLength(1)
    await tester.valid('@not-my-at-rule {}')
  })
})
