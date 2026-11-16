const rule = () => () => {}

rule.ruleName = 'test/noop'
rule.meta = { url: 'https://example.com/rules/noop' }

module.exports = { ruleName: rule.ruleName, rule }
