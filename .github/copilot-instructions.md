# Copilot Instructions

## Project Overview

**stylelint-vitest-rule-tester** is a Vitest-based testing framework for Stylelint rules (both built-in and plugin). It provides a friendly API inspired by ESLint's RuleTester but optimized for Stylelint with Vitest integration.

**Key insight**: This is a library for testing Stylelint rules, not Stylelint itself. Think of it as the toolchain that rule developers use to validate rule behavior across valid/invalid CSS cases.

## Architecture

### Core Components

- [src/tester.ts](../src/tester.ts): `createRuleTester()` factory returns instance with `run()`, `each()`, `valid()`, `invalid()` methods
- [src/run.ts](../src/run.ts): Convenience functions `run()` (full options) and `runClassic()` (rule name + cases) for single-step execution
- [src/utils/](../src/utils/): Domain-specific utilities (normalizeTestCase, resolveRuleMeta, resolveLinterOptions, validateLintResult)
- [src/types/](../src/types/): TypeScript definitions by domain (case.ts, stylelint.ts, test.ts, tester.ts, file.ts)

### Test Case Execution Flow

1. **Normalize**: Convert string shortcuts to objects, infer valid/invalid type, apply filename defaults
2. **Resolve**: Extract rule metadata and merge stylelintConfig + ruleOptions + test case overrides
3. **Lint**: Run stylelint.lint() without fix, then with fix enabled
4. **Fix Loop**: Apply fixes recursively (default 10 times) until code stabilizes or verify fixes produced no warnings
5. **Assert**: Run custom assertions (warnings count, output snapshot, parse errors, etc.)
6. **Hooks**: Call before/after lifecycle hooks

## Key Patterns

### Test Case Shape

Two styles: string shorthand for simple cases, or objects with full configuration.

```
// Simple (valid only)
'a { color: blue }'

// Full form
{
  code: '$var: 10px',
  filename: 'file.scss',
  description: 'description for test output',
  stylelintConfig: { customSyntax: 'postcss-scss' },
  ruleOptions: [true, { ignore: ['custom'] }],
  warnings(w) { expect(w).toMatchInlineSnapshot(...) }
}
```

### Automatic Type Inference

Test cases self-classify as `valid` or `invalid` based on presence of assertion properties:

- **Invalid indicators**: `warnings`, `output`, `parseErrors`, `deprecations`, `invalidOptionWarnings`
- **Valid**: Everything else or explicitly `type: 'valid'`
- **Override**: Set explicit `type` property to force classification

### Assertion Patterns

Invalid test cases support multiple assertion styles:

```
// Count-based
warnings: 1

// Message matching (strings or objects)
warnings: ['Expected X', { rule: 'my-rule' }]

// Custom function
warnings(w) { expect(w).toHaveLength(1) }

// Output verification (null = no change)
output: 'fixed-code'     // must match exactly
output: null             // code unchanged after fixing
output(fixed, input) { expect(fixed).toMatch(/pattern/) }
```

### Recursive Fixing & Verification

- **Default**: Apply fixes up to 10 times, verify no warnings remain (`verifyAfterFix: true`)
- **Customize**: `recursive: 5` (apply 5 times), `recursive: false` (skip fixing), `verifyAfterFix: false` (skip final check)
- **Error handling**: Throws if fix doesn't stabilize within limit (detects infinite loops)
- **Rule requirement**: If test is `invalid` and has no assertions, must specify one of: `warnings`, `output`, `parseErrors`, `deprecations`, or `invalidOptionWarnings`

## Development Workflow

### Key Commands

- `pnpm test` - Run all tests with Vitest
- `pnpm build` - Bundle to ESM via tsdown (output: `dist/index.mjs` + `dist/index.d.mts`)
- `pnpm dev` - Watch mode for development
- `pnpm typecheck` - Type checking with TypeScript
- `pnpm lint` - ESLint (uses `@ntnyq/eslint-config`)
- `pnpm release` - Full release: lint → format check → typecheck → test → version bump

### Adding Rule Tests

Create test files in [tests/rules/](../tests/rules/) (built-in Stylelint rules) or [tests/plugins/](../tests/plugins/) (plugins like stylelint-scss).

Use `run()` or `runClassic()` with Vitest's `expect`:

```typescript
import { run } from '../../src'
import { expect } from 'vitest'

run({
  name: 'rule-name',
  stylelintConfig: {
    /* ... */
  }, // optional, for custom syntaxes
  valid: ['a { color: blue }', { code: '...', description: '...' }],
  invalid: [
    {
      code: '...',
      warnings(w) {
        expect(w).toMatchInlineSnapshot('...')
      },
    },
  ],
})
```

### Build System Details

- **tsdown**: Preferred over tsc - produces single ESM bundle with types
- **ESM-only**: All imports must use `.js` extensions (enforced by `"type": "module"`)
- **Entry point**: [src/index.ts](../src/index.ts) exports all public APIs
- **Export map**: package.json defines `.mjs` default and `.d.mts` types

## Code Conventions

### Imports

- Use `@ntnyq/utils` for utilities: `isString`, `isFunction`, `isUndefined`, `toArray`, `unindent` (aliased as `$`)
- Import Vitest from `vitest`: `describe`, `it`, `it.only`, `it.skip`, `expect`, `expect.soft()`
- Import Stylelint types from `stylelint` module directly
- Export utilities via [src/utils/index.ts](../src/utils/index.ts)

### Type System

- Generic `RuleOptions` type parameter for rule-specific option types
- All test case types extend `RuleTesterBehaviorOptions` + `StylelintOptions<RuleOptions>`
- Use `Awaitable<T>` from `@ntnyq/utils` for sync/async function support
- Message types: `LintResultWarning`, `LintResultParseError`, `LintResultDeprecation`, `LintResultInvalidOptionWarning`

### Default File Names

Auto-selected from [src/constants.ts](../src/constants.ts) based on syntax:

- `.css`, `.scss`, `.sass`, `.less`, `.postcss`, `.styl`, `.stylus`
- Override via `defaultFileNames` in options or `filename` in individual test cases

### Error Handling

- **Fix recursion**: Throws if fix doesn't stabilize within limit (detects infinite loop bugs in rules)
- **Invalid test validation**: Throws if invalid case lacks required assertion (`warnings`, `output`, etc.)
- **Soft assertions**: Use `expect.soft()` to collect errors without stopping test execution

## External Dependencies

- **stylelint** (peer): The linting engine being tested (v17+)
- **vitest** (peer): Test runner providing `describe`, `it`, `expect` (v1+, v2+, v3+, v4+)
- **@ntnyq/utils**: Common utilities (isString, isFunction, unindent, etc.)
- **deepmerge**: Deep merge utility for config merging
- **postcss**: CSS parser (required by Stylelint)

### Custom Syntaxes

For non-CSS syntaxes, install and configure via `stylelintConfig.customSyntax`:

- `postcss-scss` for SCSS
- `postcss-less` for Less
- `postcss-html` for HTML/Vue/Svelte

### Node Version & Package Manager

- **Node**: ≥20.19.0
- **pnpm**: 10.28.1+ required
