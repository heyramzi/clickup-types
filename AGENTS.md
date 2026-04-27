# AGENTS.md

Guidelines to reduce common LLM coding mistakes. Bias toward caution; use judgment for trivial tasks.

## 1. Think Before Coding

Don't assume. Surface tradeoffs.

- State assumptions explicitly. Ask if uncertain.
- Present multiple interpretations, don't pick silently.
- Suggest simpler approaches. Push back when warranted.
- If unclear, stop and ask.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No unrequested "flexibility."
- No error handling for impossible scenarios.
- 200 lines that could be 50, rewrite.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style.
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

Define success criteria. Loop until verified.

- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan with verification checks.

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Project Overview

**clickup-utils** is a pure TypeScript library for ClickUp API integration, published to GitHub Packages as `@heyramzi/clickup-utils`. The repo also ships `@heyramzi/clickup-cli` (in `cli/`), a terminal CLI that consumes the library directly.

Both packages are released via release-please on push to `main`.

## Architecture

```
+-----------------------------------------+
|  Transformers (transformers/)           |  Pure functions, API -> storage format
+-----------------------------------------+
|  API Functions (api/)                   |  Pure fetch, uses types
+-----------------------------------------+
|  Core (core/)                           |  Framework-agnostic (OAuth protocol)
+-----------------------------------------+
|  Types (types/)                         |  Zero-dependency type definitions
+-----------------------------------------+
```

The CLI (`cli/`) sits on top of all of these and ships as its own package.

**Key design decisions:**

- Library has no runtime dependencies. Type-only at the boundary.
- Build is `tsc` to `dist/`. ESM, NodeNext-compatible. Relative imports must end in `.js` so the emitted output resolves.
- CLI builds to `cli/dist/` and ships compiled JS, not TS.

## Commands

```bash
# From repo root: build the library
pnpm install
pnpm run build

# From cli/: build the CLI
cd cli && pnpm install && pnpm run build

# Type-check only (no emit)
pnpm exec tsc -p tsconfig.build.json --noEmit
cd cli && pnpm exec tsc --noEmit
```

## Directory Map

| Directory       | Purpose                                                       | Edit? |
| --------------- | ------------------------------------------------------------- | ----- |
| `types/`        | Hand-written ClickUp API types                                | Yes   |
| `core/`         | OAuth protocol (pure functions, zero deps)                    | Yes   |
| `api/`          | Hierarchy fetch functions (workspaces, spaces, folders, lists)| Yes   |
| `transformers/` | API response -> StoredWorkspace/List/etc.                     | Yes   |
| `cli/`          | `@heyramzi/clickup-cli` source. Separate package, separate build | Yes   |
| `index.ts`      | Library barrel export                                         | Yes   |
| `dist/`         | Build output (gitignored)                                     | No    |

## Consuming Projects

Consumed via GitHub Packages by:

- **save-to-clickup**
- **clickup-to-blog**
- **client-glance**
- **clickup-to-sheets**

Changes here affect all of them. Bump the dep in each consumer after a release.

## Conventions

- Pure functions, zero side effects in core/api/transformers.
- Types reflect actual ClickUp API responses (no invented abstractions).
- `Stored*` types (StoredWorkspace, StoredList, etc.) are the simplified format for UI/storage.
- OAuth functions accept explicit params (no global state or singletons).
- Relative imports in `.ts` files always end in `.js` (NodeNext ESM resolution).
- Conventional Commits: `fix:` for patch, `feat:` for minor, `feat!:` or `BREAKING CHANGE:` for major. release-please reads these.

## Releasing

release-please runs on push to `main`:

1. It opens (or updates) a release PR for each package with the next version and changelog.
2. Merging that PR tags and publishes via the publish workflow.
3. Both packages release independently. The library is `@heyramzi/clickup-utils`, the CLI is `@heyramzi/clickup-cli`.

## Workflow

- Read `AGENTS.md` first.
- Keep changes focused and minimal.
- Run `pnpm run build` (and `cd cli && pnpm run build`) before finishing.
- Stage only intended files.
