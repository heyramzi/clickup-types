# Code Structure

## Directory Layout

```
clickup-utils/
├── index.ts                    # Root barrel export
├── types/                      # Hand-written ClickUp API types (11 files)
│   ├── clickup-api-constants   # Endpoints, enums, error codes
│   ├── clickup-auth-types      # OAuth config, token, user
│   ├── clickup-hierarchy-types # Workspace, space, folder, list
│   ├── clickup-task-types      # Task CRUD types
│   ├── clickup-field-types     # Custom field variants
│   ├── clickup-doc-types       # Docs v3 API
│   ├── clickup-time-types      # Time tracking
│   ├── clickup-chat-types      # Chat channels & messages
│   ├── clickup-comment-types   # Task comments
│   ├── clickup-view-types      # View configurations
│   └── clickup-task-transformers # Flattened task types
├── core/
│   └── oauth-protocol.ts       # buildAuthUrl, exchangeCodeForToken
├── api/
│   └── hierarchy-api.ts        # getWorkspaces, getSpaces, getFolders, getLists, etc.
├── transformers/
│   └── hierarchy-transformers.ts # transformWorkspace, transformList, etc.
├── sveltekit/
│   ├── oauth.service.ts        # handleClickUpCallback, getClickUpAuthUrl
│   └── token.service.ts        # ClickUpTokenStorage (Supabase)
├── nextjs/
│   └── oauth.service.ts        # handleClickUpCallback (Next.js App Router)
├── generated/                  # Gitignored — auto-generated SDK
│   ├── types/{group}.ts        # ~30 type files
│   └── api/{group}.api.ts      # ~30 API client files
└── scripts/generate-sdk/       # OpenAPI → TypeScript generator
    ├── index.mjs               # Orchestrator
    ├── download-specs.mjs      # Fetch v2 + v3 specs
    ├── parse-schemas.mjs       # Resolve refs, group by tag
    ├── generate-types.mjs      # Emit TypeScript types
    ├── generate-api-client.mjs # Emit fetch functions
    └── generate-barrel.mjs     # Emit index.ts files
```

## Naming Conventions

- Type files: `clickup-{domain}-types.ts` (e.g., `clickup-task-types.ts`)
- API files: `{domain}-api.ts` (e.g., `hierarchy-api.ts`)
- Service files: `{feature}.service.ts` (e.g., `oauth.service.ts`)
- Generated type files: `{group}.ts` (kebab-case from API tag)
- Generated API files: `{group}.api.ts`
