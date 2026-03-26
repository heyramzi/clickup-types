# ClickUp Utils

Universal TypeScript types and services for ClickUp API integration.
Shared across multiple projects as a git submodule with framework-specific implementations.

## What's Inside

- **Pure TypeScript types** for ClickUp API v2 & v3 (hand-written, battle-tested)
- **Auto-generated SDK** from OpenAPI specs (types + API client for every endpoint)
- **Framework-agnostic core** — OAuth protocol, hierarchy API, transformers
- **Framework integrations** — SvelteKit + Supabase, Next.js (placeholder)

## Structure

```
clickup-utils/
├── index.ts              # Barrel export (types, core, transformers, API)
├── types/                # Hand-written ClickUp API types (v2 & v3)
├── core/                 # Framework-agnostic OAuth protocol
├── api/                  # Pure fetch functions (hierarchy endpoints)
├── transformers/         # API response → simplified storage format
├── sveltekit/            # SvelteKit + Supabase OAuth & token storage
├── nextjs/               # Next.js OAuth (placeholder)
├── generated/            # Auto-generated SDK from OpenAPI specs (gitignored)
│   ├── types/            # Generated types per API resource
│   └── api/              # Generated fetch functions per API resource
└── scripts/generate-sdk/ # OpenAPI → TypeScript generator
```

## Installation

As a git submodule:

```bash
git submodule add https://github.com/heyramzi/clickup-utils src/lib/types/clickup-utils
```

## Usage

### Types Only

```typescript
import type { Task, ClickUpWorkspace, ClickUpList } from "clickup-utils";
```

### Core OAuth (Framework-Agnostic)

```typescript
import { exchangeCodeForToken, buildAuthUrl } from "clickup-utils/core/oauth-protocol";

const token = await exchangeCodeForToken({
  clientId: "your-client-id",
  clientSecret: "your-secret",
  code: "auth-code",
});

const authUrl = buildAuthUrl({
  clientId: "your-client-id",
  redirectUri: "https://yourapp.com/api/clickup/callback",
});
```

### Hierarchy API

```typescript
import { getWorkspaces, getFullHierarchy } from "clickup-utils/api/hierarchy-api";

const workspaces = await getWorkspaces(token);
const hierarchy = await getFullHierarchy(token, teamId);
```

### Transformers

```typescript
import {
  transformWorkspaces,
  transformLists,
} from "clickup-utils/transformers/hierarchy-transformers";

const stored = transformWorkspaces(apiWorkspaces); // → StoredWorkspace[]
```

### SvelteKit Integration

```typescript
import { handleClickUpCallback } from "clickup-utils/sveltekit/oauth.service";
import { ClickUpTokenStorage } from "clickup-utils/sveltekit/token.service";
```

See [sveltekit/README.md](./sveltekit/README.md) for full examples.

### Generated SDK (Full API Coverage)

```typescript
import { getTasks, createTask } from "clickup-utils/generated/api/tasks.api";
import type { GetTasksResponse } from "clickup-utils/generated/types/tasks";
```

Re-generate with: `node scripts/generate-sdk/index.mjs`

## Import Patterns

**Direct imports (recommended):**

```typescript
import type { Task } from "clickup-utils/types/clickup-task-types";
import { exchangeCodeForToken } from "clickup-utils/core/oauth-protocol";
import { handleClickUpCallback } from "clickup-utils/sveltekit/oauth.service";
```

**Barrel exports:**

```typescript
import type { Task, ClickUpWorkspace } from "clickup-utils";
import { getWorkspaces, transformLists } from "clickup-utils";
```

## Contributing

- Types should reflect actual ClickUp API behavior
- Test changes across all consuming projects
- Keep framework-specific code in framework folders
- Extract shared logic to `core/`

## Related

- [ClickUp API Documentation](https://developer.clickup.com/reference)
