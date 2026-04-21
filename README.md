# ClickUp Utils

Universal TypeScript types and services for ClickUp API integration.

## What's Inside

- **Pure TypeScript types** for ClickUp API v2 & v3 — tasks, hierarchy, chat, docs, views, time tracking, comments, custom fields
- **Auto-generated SDK** from OpenAPI specs (172 endpoints, 301 types across 29 groups)
- **Framework-agnostic core** — OAuth protocol, hierarchy API, transformers
- **Framework integrations** — SvelteKit + Supabase or Convex, Next.js (placeholder)
- **CLI** — terminal + AI-agent-friendly interface for tasks, hierarchy, and more

## Structure

```
clickup-utils/
├── index.ts              # Barrel export (types, core, transformers, API)
├── types/                # Hand-written ClickUp API types (v2 & v3)
├── core/                 # Framework-agnostic OAuth protocol
├── api/                  # Pure fetch functions (hierarchy endpoints)
├── transformers/         # API response → simplified storage format
├── sveltekit/            # SvelteKit OAuth & token storage (Supabase or Convex)
├── nextjs/               # Next.js OAuth (placeholder)
├── cli/                  # Command-line interface
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
// Also available: ClickUpChatChannel, ClickUpDoc, ClickUpPage, ClickUpView, TimeEntry, Comment
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

Token storage supports both **Supabase** and **Convex**:

```typescript
import { handleClickUpCallback } from "clickup-utils/sveltekit/oauth.service";

// Supabase
import { ClickUpTokenStorage } from "clickup-utils/sveltekit/token.service.supabase";

// Convex
import { ClickUpTokenStorage } from "clickup-utils/sveltekit/token.service.convex";
```

See [sveltekit/README.md](./sveltekit/README.md) for full examples.

### Generated SDK (Full API Coverage)

```typescript
import { getTasks, createTask } from "clickup-utils/generated/api/tasks.api";
import type { GetTasksResponse } from "clickup-utils/generated/types/tasks";
```

Re-generate with: `node scripts/generate-sdk/index.mjs`

## CLI

A terminal-first, AI-agent-friendly CLI for ClickUp. See [cli/README.md](./cli/README.md) for full docs.

```bash
pnpm exec tsx packages/clickup-utils/cli/bin/clickup.ts init
pnpm exec tsx packages/clickup-utils/cli/bin/clickup.ts hierarchy
pnpm exec tsx packages/clickup-utils/cli/bin/clickup.ts tasks --list <id>
pnpm exec tsx packages/clickup-utils/cli/bin/clickup.ts task create --list <id> --name "..."
pnpm exec tsx packages/clickup-utils/cli/bin/clickup.ts task update <id> --status "done"
```

**Dual output:** formatted tables in the terminal, JSON when piped or with `--json`.

```bash
pnpm exec tsx packages/clickup-utils/cli/bin/clickup.ts tasks --list 123 --json | jq '.tasks[].name'
```

| Command group                                               | What it does                    |
| ----------------------------------------------------------- | ------------------------------- |
| `init` / `status`                                           | Auth setup and workspace info   |
| `workspaces` / `spaces` / `folders` / `lists` / `hierarchy` | Navigate the full hierarchy     |
| `tasks` / `task get/create/update`                          | List, inspect, and manage tasks |
| `members` / `comments` / `time` / `tags` / `open`           | Collaboration and extras        |

Config is stored at `~/.config/clickup/config.json`. Auth can also be set via `CU_API_TOKEN` and `CU_TEAM_ID` env vars.

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
