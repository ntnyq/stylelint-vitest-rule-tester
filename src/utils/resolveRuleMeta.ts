import { pathToFileURL } from 'node:url'
import { interopDefault, isString, toArray } from '@ntnyq/utils'
import stylelint from 'stylelint'
import { DEFAULT_FILE_NAME } from '../constants'
import type Stylelint from 'stylelint'
import type { RuleTesterInitOptions } from '../types'

/**
 * Resolve all stylelint rules by tester options
 *
 * @param options - tester options
 * @returns stylelint rules
 */
async function resolveRulesFromTesterOptions(options: RuleTesterInitOptions) {
  const rules = new Map<string, Stylelint.Rule>()

  function loadPluginRule(plugin: Stylelint.Plugin) {
    if ('default' in plugin && plugin.default) {
      rules.set(plugin.default.ruleName, plugin.default.rule)
    } else if ('rule' in plugin && plugin.rule) {
      rules.set(plugin.ruleName, plugin.rule)
    }
  }

  if (options.stylelintConfig) {
    const config = await stylelint.resolveConfig(
      options.linterOptions?.codeFilename || DEFAULT_FILE_NAME,
      {
        cwd: options.linterOptions?.cwd,
        configBasedir: options.linterOptions?.configBasedir,
        config: {
          rules: {},
          ...options.stylelintConfig,
        },
      },
    )
    const plugins = toArray(config?.plugins || [])

    for await (const plugin of plugins) {
      // Stylelint resolves plugin locators to absolute paths.
      if (isString(plugin)) {
        const pluginRules = toArray(
          (await interopDefault(
            import(pathToFileURL(plugin).href),
          )) as Stylelint.Plugin,
        )

        pluginRules.forEach(rule => {
          loadPluginRule(rule)
        })
      } else {
        loadPluginRule(plugin)
      }
    }
  }

  return rules
}

/**
 * Resolve a rule implementation by tester options
 * @param options - tester options
 * @returns a promise resolving the rule or undefined
 */
export async function resolveRule(options: RuleTesterInitOptions) {
  if (options.name.includes('/')) {
    const rules = await resolveRulesFromTesterOptions(options)

    return rules.get(options.name)
  }

  return stylelint.rules[options.name as keyof Stylelint.CoreRules]
}

/**
 * Resolve rule metadata without exposing the rule implementation
 */
export async function resolveRuleMeta(options: RuleTesterInitOptions) {
  return (await resolveRule(options))?.meta
}
