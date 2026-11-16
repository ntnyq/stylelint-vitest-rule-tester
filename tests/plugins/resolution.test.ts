import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createRuleTester, resolveRuleMeta } from '../../src'
import type { Plugin, Rule } from 'stylelint'

const fixtureDirectory = fileURLToPath(
  new URL('../fixtures/plugins/', import.meta.url),
)

describe('plugin resolution', () => {
  it.each([
    { extends: [join(fixtureDirectory, 'config.cjs')] },
    {
      overrides: [
        { files: ['*.css'], plugins: [join(fixtureDirectory, 'noop.cjs')] },
      ],
    },
  ])(
    'resolves metadata from inherited and override plugins: %j',
    async stylelintConfig => {
      await createRuleTester({ name: 'test/noop', stylelintConfig }).valid({
        code: 'a {}',
        before(linterOptions) {
          expect(linterOptions.config?.rules?.['test/noop']).toEqual([
            true,
            { url: 'https://example.com/rules/noop' },
          ])
        },
      })
    },
  )

  it('matches the exported plugin name and respects the last definition', async () => {
    function createPlugin(url: string): Plugin {
      const rule: Rule = Object.assign(() => () => {}, {
        ruleName: 'test/internal-name',
        messages: {},
        meta: { url },
      })

      return {
        ruleName: 'test/noop',
        rule,
      }
    }

    await expect(
      resolveRuleMeta({
        name: 'test/noop',
        stylelintConfig: {
          plugins: [
            createPlugin('https://example.com/first'),
            createPlugin('https://example.com/last'),
          ],
        },
      }),
    ).resolves.toEqual({ url: 'https://example.com/last' })
  })

  it.each(['configBasedir', 'cwd'] as const)(
    'uses the case %s override for plugin metadata and linting',
    async option => {
      const { result } = await createRuleTester({
        name: 'test/noop',
        stylelintConfig: { plugins: ['./noop.cjs'] },
      }).valid({
        code: 'a {}',
        linterOptions: { [option]: fixtureDirectory },
      })

      expect(result.results[0].warnings).toEqual([])
    },
  )

  it('uses case plugins when resolving rule metadata', async () => {
    const { result } = await createRuleTester({ name: 'test/noop' }).valid({
      code: 'a {}',
      stylelintConfig: { plugins: [join(fixtureDirectory, 'noop.cjs')] },
      before(linterOptions) {
        expect(linterOptions.config?.rules?.['test/noop']).toEqual([
          true,
          { url: 'https://example.com/rules/noop' },
        ])
      },
    })

    expect(result.results[0].warnings).toEqual([])
  })

  it.each(['./noop.cjs', './async-noop.mjs'])(
    'resolves %s from configBasedir',
    async plugin => {
      const options = {
        name: 'test/noop',
        stylelintConfig: { plugins: [plugin] },
        linterOptions: { configBasedir: fixtureDirectory },
      }

      await expect(resolveRuleMeta(options)).resolves.toEqual({
        url: 'https://example.com/rules/noop',
      })
      const { result } = await createRuleTester(options).valid('a {}')

      expect(result.results[0].warnings).toEqual([])
    },
  )

  it('resolves relative plugins from cwd when configBasedir is absent', async () => {
    const { result } = await createRuleTester({
      name: 'test/noop',
      stylelintConfig: { plugins: ['./noop.cjs'] },
      linterOptions: { cwd: fixtureDirectory },
    }).valid('a {}')

    expect(result.results[0].warnings).toEqual([])
  })

  it('falls back to cwd when the plugin is absent from configBasedir', async () => {
    const { result } = await createRuleTester({
      name: 'test/noop',
      stylelintConfig: { plugins: ['./noop.cjs'] },
      linterOptions: {
        cwd: fixtureDirectory,
        configBasedir: join(fixtureDirectory, 'missing'),
      },
    }).valid('a {}')

    expect(result.results[0].warnings).toEqual([])
  })

  it('loads absolute plugin paths', async () => {
    const { result } = await createRuleTester({
      name: 'test/noop',
      stylelintConfig: { plugins: [join(fixtureDirectory, 'noop.cjs')] },
    }).valid('a {}')

    expect(result.results[0].warnings).toEqual([])
  })
})
