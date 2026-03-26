# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**clickup-utils** is a pure TypeScript library for ClickUp API integration, distributed as a **git submodule** across 6+ projects. It has zero runtime dependencies for core functionality and provides:

- Hand-written types for ClickUp API v2 & v3
- Auto-generated SDK from OpenAPI specs (types + API client for every endpoint)
- Framework-agnostic OAuth, hierarchy API, and transformers
- Framework-specific integrations (SvelteKit + Supabase, Next.js placeholder)

## Architecture

The codebase follows a layered architecture where each layer depends only on the layers below it:

```
┌─────────────────────────────────────────┐
│  Framework Integrations (sveltekit/, nextjs/)  │  ← Framework-specific, import from core
├─────────────────────────────────────────┤
│  Transformers (transformers/)           │  ← Pure functions, API → storage format
├─────────────────────────────────────────┤
│  API Functions (api/)                   │  ← Pure fetch, uses types
├─────────────────────────────────────────┤
│  Core (core/)                           │  ← Framework-agnostic (OAuth protocol)
├─────────────────────────────────────────┤
│  Types (types/)                         │  ← Zero-dependency type definitions
├─────────────────────────────────────────┤
│  Generated SDK (generated/)             │  ← Auto-generated, gitignored
└─────────────────────────────────────────┘
```

**Key design decisions:**

- **No package.json** — this is not an npm package, it's consumed as a submodule
- **No build step** — consuming projects import TypeScript directly
- **`generated/` is gitignored** — re-generate with `node scripts/generate-sdk/index.mjs`
- **Hand-written types coexist with generated types** — hand-written are battle-tested and richer; generated provide full API coverage

## Commands

```bash
# Re-generate SDK from ClickUp OpenAPI specs (downloads specs, generates types + API client)
node scripts/generate-sdk/index.mjs

# Type-check (run from consuming project, since this has no tsconfig)
# This project has no package.json or tsconfig — type checking happens in consumer projects
```

## Directory Map

| Directory               | Purpose                                                        | Edit?                         |
| ----------------------- | -------------------------------------------------------------- | ----------------------------- |
| `types/`                | Hand-written ClickUp API types (11 files)                      | Yes — primary source of truth |
| `core/`                 | OAuth protocol (pure functions, zero deps)                     | Yes                           |
| `api/`                  | Hierarchy fetch functions (workspaces, spaces, folders, lists) | Yes                           |
| `transformers/`         | API response → StoredWorkspace/List/etc.                       | Yes                           |
| `sveltekit/`            | OAuth callback handler + Supabase token storage                | Yes                           |
| `nextjs/`               | OAuth callback handler (token storage TBD)                     | Yes                           |
| `generated/`            | Auto-generated from OpenAPI specs                              | **No** — re-run generator     |
| `scripts/generate-sdk/` | OpenAPI → TypeScript generator pipeline                        | Yes                           |
| `index.ts`              | Barrel export (types, core, transformers, API)                 | Yes                           |

## Type Files Quick Reference

| File                           | Key Exports                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `clickup-api-constants.ts`     | `Endpoint` enum, `ClickUpApiVersion`, `HttpMethod`, error type map |
| `clickup-auth-types.ts`        | `ClickUpOAuthConfig`, `ClickUpTokenResponse`, `ClickUpUser`        |
| `clickup-hierarchy-types.ts`   | `ClickUpWorkspace`, `ClickUpSpace`, `ClickUpFolder`, `ClickUpList` |
| `clickup-task-types.ts`        | `ClickUpTask`, `ClickUpTasks`, `CreateTaskData`, `UpdateTaskData`  |
| `clickup-field-types.ts`       | `ClickUpCustomFieldType` enum, field variant types                 |
| `clickup-task-transformers.ts` | `FlattenedTask`, `FlattenedCustomField`, `TaskPriorityLevel`       |

## Consuming Projects

This submodule is used in:

- **save-to-clickup** → `src/types/clickup-utils`
- **clickup-to-blog** → `src/types/clickup-utils`
- **client-glance** → `src/lib/types/clickup-utils`
- **upsys-app** → `src/types/clickup-utils`
- **upsys-consulting** → `types/clickup-utils`
- **clickup-to-sheets** → `src/types/clickup-utils`

Changes here affect all of them — test accordingly.

## Conventions

- Pure functions, zero side effects in core/api/transformers
- Types reflect actual ClickUp API responses (no invented abstractions)
- Framework-specific code stays in its framework folder
- `Stored*` types (StoredWorkspace, StoredList, etc.) are the simplified format for UI/storage
- OAuth functions accept explicit params (no global state or singletons)

## SDK Generator Pipeline

`scripts/generate-sdk/` runs as a Node.js pipeline (zero npm deps):

1. **download-specs.mjs** — Fetches v2 + v3 OpenAPI specs, caches in `.claude/specs/`
2. **parse-schemas.mjs** — Resolves `$ref`s, groups endpoints by tag, normalizes
3. **generate-types.mjs** — Emits `generated/types/{group}.ts` (interfaces + type aliases)
4. **generate-api-client.mjs** — Emits `generated/api/{group}.api.ts` (typed fetch functions)
5. **generate-barrel.mjs** — Emits barrel `index.ts` files

The generator detects dynamic maps, handles circular refs, unifies response types across status codes, and supports multipart uploads.

## Workflow

- Read `AGENTS.md` first (it links to this file).
- Keep changes focused and minimal.
- Run relevant checks before finishing.
- Stage only intended files.

## Bug-Fix Protocol

When a bug is reported, do NOT start by trying to fix it. Instead:

1. First, write a test that reproduces the bug (the test should fail)
2. Then, use subagents to fix the bug and prove the fix with the now-passing test
