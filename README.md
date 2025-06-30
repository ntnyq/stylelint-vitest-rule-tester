# stylelint-vitest-rule-tester

[![CI](https://github.com/ntnyq/stylelint-vitest-rule-tester/workflows/CI/badge.svg)](https://github.com/ntnyq/stylelint-vitest-rule-tester/actions)
[![NPM VERSION](https://img.shields.io/npm/v/stylelint-vitest-rule-tester.svg)](https://www.npmjs.com/package/stylelint-vitest-rule-tester)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/stylelint-vitest-rule-tester.svg)](https://www.npmjs.com/package/stylelint-vitest-rule-tester)
[![LICENSE](https://img.shields.io/github/license/ntnyq/stylelint-vitest-rule-tester.svg)](https://github.com/ntnyq/stylelint-vitest-rule-tester/blob/main/LICENSE)

> Styellint rule tester with Vitest, with more powerful and friendly APIs

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
import { run } from 'stylelint-vitest-rule-tester'
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
      ruleOptions: [false],
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

### `run`

- `Type:`: `(options: TestCasesOptions & RuleTesterInitOptions) => void`

Create a tester and run.

### `runClassic`

- `Type:`: `(ruleName: string, cases: TestCasesOptions, options?: RuleTesterInitOptions) => void`

Create a classic style tester and run.

## Interface

<details>
<summary>🟦 RuleTesterInitOptions types</summary>

<br>

```ts
import type Stylelint from 'stylelint'

/**
 * default filename when not provided
 */
export interface DefaultFilenames {
  css: string
  less: string
  postcss: string
  sass: string
  scss: string
  styl: string
  stylus: string
  [key: string]: string
}

/**
 * Stylelint options
 */
export interface StylelintOptions {
  /**
   * linter options for `stylelint.lint(options)`
   */
  linterOptions?: Stylelint.LinterOptions

  /**
   * rule options
   */
  ruleOptions?: any

  /**
   * stylelint config
   */
  stylelintConfig?: Stylelint.Config
}

/**
 * Rule tester behavior options
 */
export type RuleTesterBehaviorOptions = {
  /**
   * the number of times to recursively apply the rule
   *
   * @default 10
   */
  recursive?: false | number

  /**
   * run verification after applying the fix
   *
   * @default true
   */
  verifyAfterFix?: boolean

  /**
   * verify that fix allways changes the code
   *
   * @default true
   */
  verifyFixChanges?: boolean
}

/**
 * Rule tester init options
 */
export type RuleTesterInitOptions = RuleTesterBehaviorOptions
  & StylelintOptions & {
    /**
     * rule name to test
     */
    name: string

    /**
     * default filenames to be used for tests
     */
    defaultFileNames?: Partial<DefaultFilenames>
  }
```

</details>

<details>
<summary>🟦 TestCasesOptions types</summary>

<br>

```ts
import type Stylelint from 'stylelint'

/**
 * Test case options
 */
export interface TestCasesOptions {
  /**
   * invalid cases
   */
  invalid?: (string | InvalidTestCase)[]

  /**
   * valid cases
   */
  valid?: (string | ValidTestCase)[]

  /**
   * callback to be called after each test case
   */
  onResult?: (
    testCase: NormalizedTestCase,
    result: TestExecutionResult,
  ) => Promise<void> | void
}

/**
 * Invalid test case
 */
export type InvalidTestCase = string | InvalidTestCaseBase
export type InvalidTestCaseBase = ValidTestCaseBase & {
  /**
   * Assert if output is expected.
   * Pass `null` to assert that the output is the same as the input.
   */
  output?: string | ((output: string, input: string) => void) | null

  /**
   * expect for {@link LintResultDeprecation}
   */
  deprecations?:
    | number
    | (string | LintResultDeprecation)[]
    | ((deprecations: LintResultDeprecation[]) => void)

  /**
   * expect for {@link LintResultInvalidOptionWarning}
   */
  invalidOptionWarnings?:
    | number
    | (string | LintResultInvalidOptionWarning)[]
    | ((invalidOptionWarnings: LintResultInvalidOptionWarning[]) => void)

  /**
   * expect for {@link LintResultParseError}
   */
  parseErrors?:
    | number
    | (string | LintResultParseError)[]
    | ((parseErrors: LintResultParseError[]) => void)

  /**
   * expect for {@link LintResultWarning}
   */
  warnings?:
    | number
    | (string | LintResultWarning)[]
    | ((warnings: LintResultWarning[]) => void)
}

/**
 * Valid test case
 */
export type ValidTestCase = string | ValidTestCaseBase
export type ValidTestCaseBase = RuleTesterBehaviorOptions
  & StylelintOptions & {
    /**
     * code to test
     */
    code: string

    /**
     * test case description
     */
    description?: string

    /**
     * test case filename
     */
    filename?: string

    /**
     * test case name
     */
    name?: string

    /**
     * only run this test case
     */
    only?: boolean

    /**
     * skip this test case
     */
    skip?: boolean

    /**
     * lint result
     */
    onResult?: (result: TestExecutionResult) => void
  }

/**
 * Test case
 * @pg
 */
export type TestCase = InvalidTestCase | ValidTestCase

/**
 * Normalized test case
 * @pg
 */
export type NormalizedTestCase = InvalidTestCaseBase & {
  code: string
  filename: string
  type: 'invalid' | 'valid'
}

export type LintResultDeprecation = {
  text: string
  reference?: string
}
export type LintResultInvalidOptionWarning = {
  text: string
}
export type LintResultParseError = Postcss.Warning & {
  stylelintType: 'parseError'
}
export type LintResultWarning = Stylelint.Warning

export type LintResultMessage =
  | LintResultDeprecation
  | LintResultInvalidOptionWarning
  | LintResultParseError
  | LintResultWarning

export type StylelintLinterResult = Omit<
  Stylelint.LinterResult,
  'cwd' | 'report'
>

/**
 * Test execution result
 */
export type TestExecutionResult = StylelintLinterResult & {
  /**
   * whether the code was fixed
   */
  fixed?: boolean

  /**
   * if the rule fixes in multiple steps, the result of each step is present here
   */
  steps?: StylelintLinterResult[]
}
```

</details>

## Credits

- [antfu/eslint-vitest-rule-tester](https://github.com/antfu/eslint-vitest-rule-tester)

## License

[MIT](./LICENSE) License © 2024-PRESENT [ntnyq](https://github.com/ntnyq)
