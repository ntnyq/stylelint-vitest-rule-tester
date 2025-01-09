declare module 'stylelint-scss' {
  type PluginRule = { rule: any; ruleName: string }

  declare const plugin: PluginRule[]

  export = plugin
}
