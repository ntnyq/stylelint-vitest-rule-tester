# AGENTS

## Purpose

This repository provides a Vitest-based rule tester for Stylelint rules.

Read first:

- [README.md](README.md) for public API and usage examples.

## Environment

- Node.js: `^22.13.0 || >=24.11.0`
- Package manager: `pnpm@11.4.0`
- Module system: ESM (`"type": "module"`)

## High-Value Commands

- Install: `pnpm install --frozen-lockfile`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
- Full pre-release checks: `pnpm run release:check`

CI-relevant behavior:

- `check` job runs lint + typecheck.
- `test` job runs build + test across macOS, Windows, Linux on Node 22/24/26.

## Project Map

- `src/run.ts`: user-facing helpers `run()` and `runClassic()`.
- `src/tester.ts`: core execution engine (`createRuleTester`) and fix/validation flow.
- `src/utils/*`: normalization, option/meta resolution, and lint-result validation.
- `src/types/*`: public and internal type contracts for test cases and results.
- `tests/rules/*` and `tests/plugins/*`: canonical patterns for built-in and plugin rule tests.

## Coding Conventions For Agents

- Keep ESM import style and strict TypeScript conventions used in `src/*`.
- Prefer extending existing utils in `src/utils/*` rather than duplicating logic.
- Avoid broad refactors unrelated to the user request.
- Preserve function signatures for exported APIs unless explicitly requested.

## Test-Case Semantics (Important)

- String test cases are shorthand and are normalized into object cases.
- Invalid cases must include at least one explicit expectation:
  - `output`
  - `warnings`
  - `parseErrors`
  - `deprecations`
  - `invalidOptionWarnings`
- `output: null` means "output should equal original input".
- Fixes may run recursively (default `10`) and throw on unstable/non-converging fixes.

When adding/changing behavior in tester flow, run at minimum:

- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`

## Safe Change Workflow

1. Read related files in `src/*` and matching tests under `tests/*`.
2. Implement the smallest change that satisfies the request.
3. Add or update tests first when behavior changes.
4. Run targeted checks, then full checks if scope is broad.

## Canonical References

- Public usage/API: [README.md](README.md)
- Test examples:
  - [tests/rules/at-rule-no-unknown.test.ts](tests/rules/at-rule-no-unknown.test.ts)
  - [tests/plugins/stylelint-scss/dollar-variable-default.test.ts](tests/plugins/stylelint-scss/dollar-variable-default.test.ts)
- Core engine:
  - [src/tester.ts](src/tester.ts)
  - [src/utils/normalizeTestCase.ts](src/utils/normalizeTestCase.ts)
  - [src/utils/validateLintResult.ts](src/utils/validateLintResult.ts)
