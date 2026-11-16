import { runClassic } from '../src'
import type { RuleTesterBehaviorOptions } from '../src'

runClassic('no-empty-source', { valid: ['a {}'] }, { recursive: false })

const options = {
  name: 'not-a-rule',
  recursive: false,
} satisfies RuleTesterBehaviorOptions & { name: string }

runClassic('no-empty-source', { valid: ['a {}'] }, options)
