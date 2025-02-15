import { createRequire } from 'node:module'
import { interopDefault, isString, toArray } from '@ntnyq/utils'
import stylelint from 'stylelint'
import type Stylelint from 'stylelint'
import type { RuleTesterInitOptions } from '../types'

const require = createRequire(import.meta.url)

/**
 * Resolve all stylelint rules by tester options
 *
 * @param options - tester options
 * @returns stylelint rules
 */
async function resolveRulesFromTesterOptions(options: RuleTesterInitOptions) {
  const rules: Stylelint.Rule[] = []

  function loadPluginRule(plugin: Stylelint.Plugin) {
    if ('default' in plugin && plugin.default) {
      rules.push(plugin.default.rule)
    } else if ('rule' in plugin && plugin.rule) {
      rules.push(plugin.rule)
    }
  }

  if (options.stylelintConfig?.plugins) {
    const plugins = toArray(options.stylelintConfig.plugins)

    for await (const plugin of plugins) {
      // package name
      if (isString(plugin)) {
        const pluginRules = toArray(
          (await interopDefault(require(plugin))) as Stylelint.Plugin,
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
 * Resolve rule meta by tester options
 * @param options - tester options
 * @returns a promise resolved rule meta or undefined
 */
export async function resolveRuleMeta(options: RuleTesterInitOptions) {
  let ruleMeta: Stylelint.RuleMeta | undefined

  if (options.name.includes('/')) {
    const rules = await resolveRulesFromTesterOptions(options)
    const matched = rules.find(rule => rule.ruleName === options.name)

    if (matched) {
      ruleMeta = matched.meta
    }
  } else {
    // built-in rule
    ruleMeta = (
      await stylelint.rules[options.name as keyof Stylelint.CoreRules]
    ).meta
  }

  return ruleMeta
}
