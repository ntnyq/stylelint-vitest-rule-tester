# stylelint-vitest-rule-tester

[![CI](https://github.com/ntnyq/stylelint-vitest-rule-tester/workflows/CI/badge.svg)](https://github.com/ntnyq/stylelint-vitest-rule-tester/actions)
[![NPM VERSION](https://img.shields.io/npm/v/stylelint-vitest-rule-tester.svg)](https://www.npmjs.com/package/stylelint-vitest-rule-tester)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/stylelint-vitest-rule-tester.svg)](https://www.npmjs.com/package/stylelint-vitest-rule-tester)
[![LICENSE](https://img.shields.io/github/license/ntnyq/stylelint-vitest-rule-tester.svg)](https://github.com/ntnyq/stylelint-vitest-rule-tester/blob/main/LICENSE)

> Stylelint rule tester with Vitest integration — powerful, friendly, and modern testing framework for Stylelint rules

## Install

```shell
npm install stylelint-vitest-rule-tester -D
```

```shell
yarn add stylelint-vitest-rule-tester -D
```

```shell
pnpm add stylelint-vitest-rule-tester -D
```

## Usage

```ts
import stylelintSCSS from 'stylelint-scss'
import { $, run } from 'stylelint-vitest-rule-tester'
import { expect } from 'vitest'

run({
  name: 'scss/dollar-variable-default',

  /**
   * stylelint config
   *
   * @see https://stylelint.io/user-guide/configure
   */
  stylelintConfig: {
    plugins: stylelintSCSS,
    customSyntax: 'postcss-scss',
  },

  /**
   * valid cases
   */
  valid: [
    `a { color: blue }`,
    `$var: 10px !default`,
    `a { $var: 10px !default }`,
    `.class { a { $var: 10px !default } }`,
  ],

  /**
   * invalid cases
   */
  invalid: [
    {
      description: 'global vars without !default',
      filename: 'global.scss',
      code: $`
        $var: 10px
      `,
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 11,
              "endLine": 1,
              "fix": undefined,
              "line": 1,
              "rule": "scss/dollar-variable-default",
              "severity": "error",
              "text": "Expected !default flag for "$var" (scss/dollar-variable-default)",
              "url": "https://github.com/stylelint-scss/stylelint-scss/blob/master/src/rules/dollar-variable-default",
            },
          ]
        `)
      },
    },
  ],
})
```

<details>
<summary>🟩 Built-in rule test</summary>

<br>

```ts
import { run } from 'stylelint-vitest-rule-tester'
import { expect } from 'vitest'

run({
  name: 'no-empty-source',
  valid: [
    // string case
    `.class {}`,

    // object case with rule options
    {
      filename: 'disable.css',
      code: '',
      ruleOptions: [null],
    },

    // object case with stylelint config
    {
      description: 'HTML without CSS',
      stylelintConfig: {
        customSyntax: 'postcss-html',
      },
      code: '<html></html>',
    },
  ],
  invalid: [
    // invalid case
    {
      filename: 'empty.css',
      code: '',
      warnings(warnings) {
        expect(warnings).toHaveLength(1)
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 1,
              "line": 1,
              "rule": "no-empty-source",
              "severity": "error",
              "text": "Unexpected empty source (no-empty-source)",
              "url": undefined,
            },
          ]
        `)
      },
    },

    // invalid case with rule options url
    {
      filename: 'empty-with-url.css',
      code: '',
      ruleOptions: [
        true,
        {
          url: 'https://github.com/stylelint/stylelint/tree/main/lib/rules/no-empty-source',
        },
      ],
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 1,
              "line": 1,
              "rule": "no-empty-source",
              "severity": "error",
              "text": "Unexpected empty source (no-empty-source)",
              "url": "https://github.com/stylelint/stylelint/tree/main/lib/rules/no-empty-source",
            },
          ]
        `)
      },
    },

    // invalid case with stylelint config
    {
      description: 'CSS block in HTML',
      stylelintConfig: {
        customSyntax: 'postcss-html',
      },
      code: '<style>\n</style>',
      warnings(warnings) {
        expect(warnings).toMatchInlineSnapshot(`
          [
            {
              "column": 1,
              "endColumn": 2,
              "endLine": 2,
              "line": 2,
              "rule": "no-empty-source",
              "severity": "error",
              "text": "Unexpected empty source (no-empty-source)",
              "url": undefined,
            },
          ]
        `)
      },
    },
  ],
})
```

</details>

## API

### `run(options)`

Create a rule tester and run all test cases with a single function call.

- **Type**: `(options: TestCasesOptions & RuleTesterInitOptions) => Promise<void>`

```ts
run({
  name: 'rule-name',
  valid: [
    '.class {}',
    {
      code: '',
      ruleOptions: [null],
    },
  ],
  invalid: [
    {
      code: '',
      warnings(warnings) {
        expect(warnings).toHaveLength(1)
        expect(warnings[0].rule).toBe('no-empty-source')
      },
    },
  ],
})
```

### `runClassic(ruleName, cases, options?)`

Classic-style function for running tests with explicit arguments.

- **Type**: `(ruleName: string, cases: TestCasesOptions, options?: Omit<RuleTesterInitOptions, 'name'>) => Promise<void>`

```ts
import { runClassic } from 'stylelint-vitest-rule-tester'
import { expect } from 'vitest'

runClassic('no-empty-source', {
  valid: [
    '.class {}',
    {
      code: '',
      ruleOptions: [null],
    },
  ],
  invalid: [
    {
      code: '',
      warnings(warnings) {
        expect(warnings).toHaveLength(1)
        expect(warnings[0].rule).toBe('no-empty-source')
      },
    },
  ],
})
```

### `createRuleTester(options)`

Create a reusable tester instance with granular control over test execution.

- **Returns**: `RuleTester<RuleOptions>`

Available methods on the tester instance:

#### `tester.run(cases)`

Run all test cases with a describe/it structure.

#### `tester.each(testCase)`

Run a single test case and return the result. Useful for custom test orchestration.

```ts
async function runTest() {
  const tester = createRuleTester({ name: 'rule-name' })
  const { testcase, result } = await tester.each('a { color: blue }')
}

runTest()
```

#### `tester.valid(testCase)`

Run a single valid test case with automatic assertions.

#### `tester.invalid(testCase)`

Run a single invalid test case with automatic assertions.

## Interface

<details>
<summary>🟦 RuleTesterInitOptions</summary>

<br>

Configuration options for initializing a rule tester.

```ts
export type RuleTesterInitOptions<RuleOptions = any> = {
  /**
   * Rule name to test
   */
  name: string

  /**
   * Default filenames for named postcss-* syntaxes (e.g. postcss-scss).
   * Other syntax objects or paths use the CSS default; set filename explicitly.
   *
   * Defaults: { css: 'file.css', scss: 'file.scss', sass: 'file.sass',
   *             less: 'file.less', postcss: 'file.postcss', styl: 'file.styl' }
   */
  defaultFileNames?: Partial<DefaultFilenames>

  /**
   * Maximum additional fix passes after the initial fix.
   * Must be a non-negative integer. Additional passes stop once the code
   * stabilizes and throw if the last allowed pass still changes the code.
   * Set false or 0 to run only the initial fix.
   *
   * @default 10
   */
  recursive?: false | number

  /**
   * Verify that fixed code has no warnings
   *
   * @default true
   */
  verifyAfterFix?: boolean

  /**
   * Require string or callback output expectations to change the input.
   * Use output: null to assert unchanged code, or set this to false.
   *
   * @default true
   */
  verifyFixChanges?: boolean

  /**
   * Stylelint configuration (rules, plugins, customSyntax, etc.)
   *
   * @see https://stylelint.io/user-guide/configure
   */
  stylelintConfig?: Stylelint.Config

  /**
   * Rule-specific options passed to the rule. Set null to disable the rule.
   */
  ruleOptions?: RuleOptions | null

  /**
   * Direct stylelint.lint() options (rarely needed)
   */
  linterOptions?: Stylelint.LinterOptions
}
```

</details>

<details>
<summary>🟦 TestCasesOptions</summary>

<br>

Options for running multiple test cases.

```ts
export interface TestCasesOptions<RuleOptions = any> {
  /**
   * Array of valid test cases (code that should pass the rule)
   */
  valid?: (string | ValidTestCase<RuleOptions>)[]

  /**
   * Array of invalid test cases (code that should violate the rule)
   */
  invalid?: (string | InvalidTestCase<RuleOptions>)[]

  /**
   * Callback invoked after each test case completes
   */
  onResult?: (
    testcase: NormalizedTestCase<RuleOptions>,
    result: TestExecutionResult,
  ) => Awaitable<void>
}
```

</details>

<details>
<summary>🟦 Test Cases</summary>

<br>

### ValidTestCase

Represents valid CSS/styling code that should not trigger the rule.

```ts
export type ValidTestCase<RuleOptions = any> =
  | string
  | {
      /**
       * Code to test
       */
      code: string

      /**
       * Human-readable test description
       */
      description?: string

      /**
       * Filename (if not provided, auto-selected from defaultFileNames)
       */
      filename?: string

      /**
       * Skip this test case
       */
      skip?: boolean

      /**
       * Only run this test case (useful for debugging)
       */
      only?: boolean

      /**
       * Stylelint configuration for this specific case
       */
      stylelintConfig?: Stylelint.Config

      /**
       * Rule options override for this case. Set null to disable the rule.
       */
      ruleOptions?: RuleOptions | null

      /**
       * Hook: called before linting
       */
      before?: (
        this: NormalizedTestCase,
        linterOptions: LinterOptions,
      ) => Awaitable<void>

      /**
       * Hook: called after linting
       */
      after?: (
        this: NormalizedTestCase,
        result: TestExecutionResult,
      ) => Awaitable<void>

      /**
       * Custom recursion setting for this case
       */
      recursive?: false | number

      /**
       * Skip verification after fixing for this case
       */
      verifyAfterFix?: boolean
    }
```

### InvalidTestCase

Represents CSS/styling code that should trigger the rule violation(s). Requires at least one assertion.

```ts
export type InvalidTestCase<RuleOptions = any> =
  | string
  | {
      code: string
      description?: string
      filename?: string
      // ... extends ValidTestCase options ...

      /**
       * Expected number of warnings or array of warning matchers
       *
       * Matchers can be:
       * - `number` to check count
       * - `string` to match warning message
       * - `object` to match warning properties (e.g., { rule: 'my-rule' })
       * - `function` for custom assertions
       */
      warnings?:
        | number
        | (string | Partial<LintResultWarning>)[]
        | ((w: LintResultWarning[]) => Awaitable<void>)

      /**
       * Assert the fixed output matches expected code
       *
       * - `string` to check exact output
       * - `null` to verify code is unchanged after fixing
       * - `function` for custom output assertions
       */
      output?:
        | string
        | null
        | ((fixed: string, input: string) => Awaitable<void>)

      /**
       * Expected parse errors (same matcher format as warnings)
       */
      parseErrors?:
        | number
        | (string | Partial<LintResultParseError>)[]
        | ((e: LintResultParseError[]) => Awaitable<void>)

      /**
       * Expected deprecation warnings
       */
      deprecations?:
        | number
        | (string | Partial<LintResultDeprecation>)[]
        | ((d: LintResultDeprecation[]) => Awaitable<void>)

      /**
       * Expected invalid option warnings
       */
      invalidOptionWarnings?:
        | number
        | (string | Partial<LintResultInvalidOptionWarning>)[]
        | ((w: LintResultInvalidOptionWarning[]) => Awaitable<void>)
    }
```

</details>

<details>
<summary>🟦 Result Types</summary>

<br>

```ts
export type TestExecutionResult = {
  /**
   * The final code after all fixes applied
   */
  code: string

  /**
   * Whether the code was modified by the rule
   */
  fixed?: boolean

  /**
   * Each fix pass, including the initial pass and the stabilizing pass
   */
  steps?: StylelintLinterResult[]

  /**
   * Lint result with warnings, parseErrors, etc.
   */
  results: Stylelint.LintResult[]

  /**
   * Other properties from stylelint.lint() result
   */
  // ... see Stylelint.LinterResult
}
```

</details>

## Advanced Usage

### Lifecycle Hooks

Test cases support `before` and `after` hooks for setup/teardown:

```ts
run({
  name: 'rule-name',
  invalid: [
    {
      code: 'a { color: red; }',
      before(linterOptions) {
        // Called before linting
        console.log('Testing:', linterOptions.code)
      },
      after(result) {
        // Called after linting
        console.log('Result:', result.fixed)
      },
      warnings(w) {
        expect(w).toHaveLength(1)
      },
    },
  ],
})
```

### Recursive Fix Verification

The tester always applies an initial fix. By default, it then runs up to 10
additional fix passes, stopping once a pass leaves the code unchanged. It throws
if the last allowed pass still changes the code.

`recursive` accepts `false` or a non-negative integer. With `recursive: 0` or
`recursive: false`, only the initial fix runs. `verifyAfterFix` independently
controls whether the final output is linted again to check for diagnostics
(warnings, deprecations, parse errors, and invalid options). Control
this behavior per tester or per case:

```ts
invalid: [
  {
    code: 'a { color: red; }',
    recursive: false, // Skip recursive fixing
    verifyAfterFix: false, // Skip verification after fix
    warnings: 1,
  },
]
```

### Custom Assertion Matchers

All assertion properties accept multiple matcher types:

```ts
invalid: [
  {
    code: 'a { color: red; }',

    // Exact count
    warnings: 1,

    // Match warning message or properties
    warnings: [
      'Unexpected named color "red"',
      { rule: 'color-no-invalid-hex' },
    ],

    // Custom function
    warnings(w) {
      expect(w).toHaveLength(1)
      expect(w[0].rule).toBe('my-rule')
    },

    // Output verification
    output: 'a { color: blue; }', // exact match
    output: null, // no change expected
    output(fixed, input) {
      expect(fixed).not.toBe(input)
    },
  },
]
```

## Requirements

- **Node.js**: `^22.13.0 || >=24.11.0`; Stylelint 18 requires `^22.22.2 || ^24.15.0 || >=26.0.0`
- **Peer Dependencies**:
  - stylelint: v17 or v18
  - vitest: v1, v2, v3, v4, or v5

The same tester API supports both Stylelint versions. Rule availability, options,
messages, and result fields follow the installed Stylelint version, so snapshots
may need updating when switching versions.

When testing plugins with Stylelint 18, use a `fix` callback in
`stylelint.utils.report()` and set `rule.meta.fixable` to `true`. The removed
`context.fix` API cannot be restored by the tester; the callback API works with
both Stylelint 17 and 18. Relative plugin and config paths must include the
filename and extension, for example `./plugin.js`.

See the [Stylelint 18 migration guide](https://stylelint.io/migration-guide/to-18/)
for the complete list of breaking changes.

For non-CSS syntaxes, install the appropriate parser:

- SCSS: `postcss-scss`
- Less: `postcss-less`
- HTML/Vue/Svelte: `postcss-html`

## Credits

- Inspired by [antfu/eslint-vitest-rule-tester](https://github.com/antfu/eslint-vitest-rule-tester)

## License

[MIT](./LICENSE) License © 2024-PRESENT [ntnyq](https://github.com/ntnyq)
