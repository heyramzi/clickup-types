# Tech Stack

## Core Technologies

- **TypeScript** — All source is pure TS, no build step (consumed directly by importing projects)
- **Node.js** — SDK generator scripts use native `fetch`, `fs`, `path` (zero npm dependencies)

## Architecture

Layered design with strict dependency direction (each layer only imports from below):

1. **Types** (`types/`) — Zero-dependency interfaces and enums matching ClickUp API shapes
2. **Core** (`core/`) — Framework-agnostic pure functions (OAuth protocol)
3. **API** (`api/`) — Pure fetch functions for hierarchy endpoints
4. **Transformers** (`transformers/`) — API response → StoredType converters
5. **Framework integrations** (`sveltekit/`, `nextjs/`) — Platform-specific OAuth + storage
6. **Generated SDK** (`generated/`) — Auto-generated from OpenAPI, gitignored

## Distribution

Git submodule (not npm). No `package.json`. Consuming projects reference via `.gitmodules` and import TypeScript directly through path aliases.

## Code Generation

`scripts/generate-sdk/` is a 5-stage Node.js pipeline that downloads ClickUp's OpenAPI specs and generates typed API clients. Run with `node scripts/generate-sdk/index.mjs`.
