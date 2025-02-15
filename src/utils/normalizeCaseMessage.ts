import { isString } from '@ntnyq/utils'
import type { LintResultMessage } from '../types'

/**
 * Normalize test case message
 *
 * @param message - message string or lint result
 * @returns normalized message
 */
export function normalizeCaseMessage(
  message: string | LintResultMessage,
): Partial<LintResultMessage> {
  if (isString(message)) {
    return {
      text: message,
    }
  }
  const clone = { ...message }

  return clone as Partial<LintResultMessage>
}
