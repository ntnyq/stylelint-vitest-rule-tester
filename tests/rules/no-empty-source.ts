import stylelint from 'stylelint'
import type { CoreRules } from 'stylelint'

const { report, ruleMessages, validateOptions } = stylelint.utils

const ruleName = 'no-empty-source'

const messages = ruleMessages(ruleName, {
  rejected: 'Unexpected empty source',
})

const meta = {
  url: 'https://stylelint.io/user-guide/rules/no-empty-source',
}

const rule: CoreRules['no-empty-source'] = (primary, _secondaryOptions, context) => {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, { actual: primary })

    if (!validOptions) {
      return
    }

    // after a fix has been applied root.toString() may differ from root.source.input.css
    // i.e. root.source.input.css remains unchanged after a fix
    const rootString = context.fix ? root.toString() : (root.source && root.source.input.css) || ''

    if (rootString.trim()) {
      return
    }

    report({
      message: messages.rejected,
      node: root,
      result,
      ruleName,
    })
  }
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta

export default rule
