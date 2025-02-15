import type { DefaultFilenames } from './types'

export const DEFAULT_FILE_NAMES = Object.freeze<DefaultFilenames>({
  css: 'file.css',
  less: 'file.less',
  postcss: 'file.postcss',
  sass: 'file.sass',
  scss: 'file.scss',
  styl: 'file.styl',
  stylus: 'file.stylus',
})
export const DEFAULT_FILE_NAME = DEFAULT_FILE_NAMES.css

export const DEFAULT_RULE_OPTIONS = true
export const DEFAULT_RULE_NAME = 'rule-to-test'
