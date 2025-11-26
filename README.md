# ClickUp Utils

**Philosophy**: 純粋 (Junsui - Purity) • 簡潔 (Kanketsu - Simplicity)

Universal TypeScript types and services for ClickUp API integration.
Shared across multiple projects with framework-specific implementations.

## Overview

**What's included:**
- ✅ **Types** - Pure TypeScript types for ClickUp API v2 & v3
- ✅ **Core** - Framework-agnostic OAuth protocol functions
- ✅ **SvelteKit** - SvelteKit + Supabase integration
- ✅ **Next.js** - Next.js App Router integration (placeholder)

**What's NOT included:**
- ❌ Business logic
- ❌ Framework dependencies (imported as peer dependencies)
- ❌ Opinionated abstractions

## Structure

```
clickup-utils/
├── types/                      # Pure TypeScript types
│   ├── clickup-task-types.ts
│   ├── clickup-auth-types.ts
│   ├── clickup-hierarchy-types.ts
│   ├── clickup-chat-types.ts
│   ├── clickup-doc-types.ts
│   ├── clickup-field-types.ts
│   ├── clickup-time-types.ts
│   ├── clickup-view-types.ts
│   ├── clickup-comment-types.ts
│   ├── clickup-task-transformers.ts
│   └── clickup-api-constants.ts
│
├── core/                       # Framework-agnostic
│   └── oauth-protocol.ts       # Pure OAuth functions
│
├── sveltekit/                  # SvelteKit-specific
│   ├── oauth.service.ts
│   ├── token.service.ts
│   └── README.md
│
├── nextjs/                     # Next.js-specific
│   ├── oauth.service.ts
│   └── README.md
│
└── index.ts                    # Barrel exports
```

## Installation

As a git submodule:

```bash
git submodule add https://github.com/heyramzi/clickup-utils src/lib/types/clickup-utils
```

## Usage

### 1. Types Only (Most Common)

```typescript
// Import specific types
import type { Task, ClickUpWorkspace, ClickUpList } from '$lib/types/clickup-utils'

// Or use barrel export from root
import type { Task, FlattenedTask } from 'clickup-utils'
```

### 2. Core OAuth (Framework-Agnostic)

```typescript
import { exchangeCodeForToken, buildAuthUrl } from 'clickup-utils/core/oauth-protocol'

// Exchange code for token (pure function)
const token = await exchangeCodeForToken({
  clientId: 'your-client-id',
  clientSecret: 'your-secret',
  code: 'auth-code-from-callback'
})

// Build OAuth URL
const authUrl = buildAuthUrl({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/api/clickup/callback',
  state: 'csrf-token'
})
```

### 3. SvelteKit Integration

```typescript
// OAuth callback handler
import { handleClickUpCallback } from 'clickup-utils/sveltekit/oauth.service'
import { ClickUpTokenStorage } from 'clickup-utils/sveltekit/token.service'

export const GET: RequestHandler = async (event) => {
  await handleClickUpCallback(event, {
    clientId: PUBLIC_CLICKUP_CLIENT_ID,
    clientSecret: CLICKUP_CLIENT_SECRET,
    onSuccess: async (token) => {
      await ClickUpTokenStorage.save(
        supabase,
        organizationId,
        token,
        TokenEncryptionService
      )
    }
  })

  throw redirect(303, '/dashboard')
}
```

See [sveltekit/README.md](./sveltekit/README.md) for full examples.

### 4. Next.js Integration

```typescript
import { handleClickUpCallback } from 'clickup-utils/nextjs/oauth.service'

export async function GET(request: NextRequest) {
  await handleClickUpCallback(request, {
    clientId: process.env.CLICKUP_CLIENT_ID!,
    clientSecret: process.env.CLICKUP_CLIENT_SECRET!,
    onSuccess: async (token) => {
      // Store token in your database
    }
  })

  return NextResponse.redirect('/dashboard')
}
```

See [nextjs/README.md](./nextjs/README.md) for full examples.

## Import Patterns

### Option A: Direct imports (recommended)

```typescript
// Types
import type { Task } from 'clickup-utils/types/clickup-task-types'

// Core
import { exchangeCodeForToken } from 'clickup-utils/core/oauth-protocol'

// SvelteKit
import { handleClickUpCallback } from 'clickup-utils/sveltekit/oauth.service'
```

### Option B: Barrel exports (convenience)

```typescript
// All types available at root
import type { Task, ClickUpWorkspace } from 'clickup-utils'

// Framework services with suffix
import {
  handleClickUpCallbackSvelteKit,
  ClickUpTokenStorageSvelteKit
} from 'clickup-utils'
```

## Philosophy

### 純粋 (Junsui - Purity)
- Types reflect actual ClickUp API responses
- No business logic in types
- Framework-agnostic core functions

### 簡潔 (Kanketsu - Simplicity)
- One file, one purpose
- No unnecessary abstractions
- Direct implementations over adapters

### 効率 (Kōritsu - Efficiency)
- Import only what you need
- Zero dependencies for types
- Minimal dependencies for services

## Contributing

When updating types:
1. Ensure changes reflect actual ClickUp API behavior
2. Test across all consuming projects
3. Keep transformers separate from core API types
4. Update README if adding new type files

When adding services:
1. Keep framework-specific code in framework folders
2. Extract truly shared logic to `core/`
3. No abstractions for the sake of abstractions
4. Provide clear usage examples in folder READMEs

## Projects Using This

- **client-glance** - SaaS client dashboard platform (SvelteKit)
- **clickup-to-blog** - ClickUp → Blog automation (Next.js)
- **upsys-app** - Internal agency tool (Next.js)

## Related

- [ClickUp API v2 Documentation](https://clickup.com/api)
- [ClickUp API v3 Chat Documentation](https://clickup.com/api/v3)

---

**Remember**: 完璧は善の敵 (Perfect is the enemy of good)

The best code is the simplest code that works correctly.
