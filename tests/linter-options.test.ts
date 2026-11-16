import { describe, expect, it } from 'vitest'
import { createRuleTester } from '../src'

describe('case linter options', () => {
  it('overrides tester options for linting and fixing', async () => {
    const tester = createRuleTester({
      name: 'at-rule-no-vendor-prefix',
      linterOptions: { ignoreDisables: false },
    })
    const { result } = await tester.invalid({
      code: '/* stylelint-disable */ @-webkit-keyframes foo {}',
      linterOptions: { ignoreDisables: true },
      warnings: 1,
      output: '/* stylelint-disable */ @keyframes foo {}',
    })

    expect(result.fixed).toBe(true)
  })

  it('preserves false overrides and uses tester options for other cases', async () => {
    const tester = createRuleTester({
      name: 'at-rule-no-vendor-prefix',
      linterOptions: { ignoreDisables: true },
    })
    const code = '/* stylelint-disable */ @-webkit-keyframes foo {}'

    await tester.valid({ code, linterOptions: { ignoreDisables: false } })

    const { result } = await tester.invalid({
      code,
      warnings: 1,
      output: '/* stylelint-disable */ @keyframes foo {}',
    })

    expect(result.fixed).toBe(true)
  })
})
