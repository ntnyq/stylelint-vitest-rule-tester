import stylelint from 'stylelint'
import type { Rule } from 'stylelint'

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint

const ruleName = 'no-empty-source'

const messages = ruleMessages(ruleName, {
  rejected: 'Unexpected empty source',
})

const meta = {
  url: 'https://stylelint.io/user-guide/rules/no-empty-source',
}

const ruleFunction: Rule = (primary, secondaryOptions, context) => {
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

ruleFunction.ruleName = ruleName
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(ruleName, ruleFunction)
