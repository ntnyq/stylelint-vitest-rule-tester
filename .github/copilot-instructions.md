# Copilot Instructions

## Project Overview

This is **stylelint-vitest-rule-tester**: a Vitest-based testing framework for Stylelint rules (both built-in and plugin rules). It provides a friendly API similar to ESLint's RuleTester but designed specifically for Stylelint with Vitest integration.

## Architecture

### Core Components

- **[src/tester.ts](../src/tester.ts)**: The `createRuleTester()` factory function that returns a tester instance with `run()`, `each()`, `valid()`, and `invalid()` methods
- **[src/run.ts](../src/run.ts)**: Convenience functions `run()` and `runClassic()` that create and execute a tester in one step
- **[src/utils/](../src/utils/index.ts)**: Utility modules for normalizing test cases, resolving rule options, and validating lint results
- **[src/types/](../src/types/index.ts)**: TypeScript type definitions organized by domain (case, file, stylelint, test, tester)

### Test Case Flow

1. Test cases are normalized via `normalizeTestCase()` (strings → objects, type inference, filename defaults)
2. Rule metadata is resolved via `resolveRuleMeta()` to extract rule name and options
3. Linter options are constructed via `resolveLinterOptions()` merging stylelintConfig, ruleOptions, and test case overrides
4. Stylelint's `lint()` API is invoked, optionally with recursive fix application (default: 10 iterations)
5. Results are validated via `validateLintResult()` and assertions are run

## Key Patterns

### Test Case Types

Test cases can be strings (for simple valid cases) or objects:

```typescript
// String shorthand
'a { color: blue }'

// Object form with all options
{
  code: '$var: 10px',
  filename: 'global.scss',
  description: 'global vars without !default',
  stylelintConfig: { customSyntax: 'postcss-scss' },
  ruleOptions: [true, { ignore: ['custom'] }],
  warnings(warnings) { expect(warnings).toMatchInlineSnapshot(...) }
}
```

### Type Inference

Test cases are automatically classified as `valid` or `invalid` based on presence of `warnings`, `output`, `parseErrors`, `deprecations`, or `invalidOptionWarnings` properties. Explicit `type` property overrides this inference.

### Recursive Fix Verification

By default, fixes are applied recursively up to 10 times to ensure fix stability. Set `recursive: false` to disable or `recursive: N` to customize. After fixing, `verifyAfterFix: true` (default) ensures no warnings remain.

### Custom Assertions

Invalid test cases support flexible assertion patterns:

```typescript
warnings: 1,                           // count
warnings: ['Expected message'],        // array of strings/objects
warnings(w) { expect(w).toHaveLength(1) }  // custom function
```

## Development Workflow

### Commands

- `pnpm build` - Build via tsdown (single ESM output at `dist/index.js`)
- `pnpm dev` - Watch mode build
- `pnpm test` - Run tests with Vitest
- `pnpm typecheck` - TypeScript type checking
- `pnpm lint` - ESLint (uses `@ntnyq/eslint-config`)
- `pnpm release` - Run checks + version bump with bumpp

### Testing Your Changes

Add test files to `tests/rules/` (built-in rules) or `tests/plugins/` (plugin rules like stylelint-scss). Each test file should import `run` or `runClassic` and use Vitest's `expect`:

```typescript
import { run } from '../../src'
import { expect } from 'vitest'

run({
  name: 'rule-name',
  valid: ['...'],
  invalid: [
    {
      code: '...',
      warnings(w) {
        expect(w).toMatchInlineSnapshot(`...`)
      },
    },
  ],
})
```

### Build System

- **tsdown** (not tsc): Bundles TypeScript to ESM with declaration files
- **ESM-only**: `"type": "module"` in package.json, all imports use `.js` extensions
- **pnpm** workspace: Uses pnpm@10.27.0 as package manager

## Code Conventions

### Imports

- Use `@ntnyq/utils` for common utilities (`isString`, `isFunction`, `isUndefined`, etc.)
- Import Vitest's `describe`, `it`, `expect` directly from `vitest`
- Import Stylelint types from `stylelint` (use `LinterOptions`, `LintResult`, etc.)

### Type Definitions

- Generic type `RuleOptions` allows customizing rule-specific option types
- All test case types extend `RuleTesterBehaviorOptions` and `StylelintOptions<RuleOptions>`
- Use `Awaitable<T>` from `@ntnyq/utils` for sync/async function signatures

### File Naming

Default filenames from [src/constants.ts](../src/constants.ts):

- CSS: `input.css`
- SCSS: `input.scss`
- Less: `input.less`
- Override via `defaultFileNames` option

### Error Handling

- Throw explicit errors when fix recursion limit exceeded
- Throw when invalid test case lacks assertions (`warnings`, `output`, etc.)
- Use Vitest's `expect.soft()` for non-blocking assertions

## External Dependencies

- **stylelint** (peer): The linting engine being tested
- **vitest** (peer): Test runner providing `describe`, `it`, `expect`
- **postcss**: CSS parser (required by Stylelint)
- **deepmerge**: Deep merge utility for config merging

### Custom Syntaxes

For non-CSS syntaxes, install and configure via `stylelintConfig.customSyntax`:

- `postcss-scss` for SCSS
- `postcss-less` for Less
- `postcss-html` for HTML/Vue/Svelte
