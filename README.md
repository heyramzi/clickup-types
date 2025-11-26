# ClickUp Utils

Universal TypeScript types and services for ClickUp API integration.
Shared across multiple projects with framework-specific implementations.

## Overview

**Included:**
- Pure TypeScript types for ClickUp API v2 & v3
- Framework-agnostic OAuth protocol functions
- SvelteKit + Supabase integration
- Next.js App Router integration (placeholder)

**Not included:**
- Business logic
- Framework dependencies (peer dependencies only)
- Opinionated abstractions

## Structure

```
clickup-utils/
├── types/          # Pure TypeScript types
├── core/           # Framework-agnostic OAuth protocol
├── sveltekit/      # SvelteKit + Supabase services
└── nextjs/         # Next.js services (placeholder)
```

## Installation

As a git submodule:

```bash
git submodule add https://github.com/heyramzi/clickup-utils src/lib/types/clickup-utils
```

## Usage

### Types Only

```typescript
import type { Task, ClickUpWorkspace, ClickUpList } from '$lib/types/clickup-utils'
```

### Core OAuth (Framework-Agnostic)

```typescript
import { exchangeCodeForToken, buildAuthUrl } from 'clickup-utils/core/oauth-protocol'

const token = await exchangeCodeForToken({
  clientId: 'your-client-id',
  clientSecret: 'your-secret',
  code: 'auth-code'
})

const authUrl = buildAuthUrl({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/api/clickup/callback',
  state: 'csrf-token'
})
```

### SvelteKit Integration

```typescript
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

### Next.js Integration

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

### Direct imports (recommended)

```typescript
// Types
import type { Task } from 'clickup-utils/types/clickup-task-types'

// Core
import { exchangeCodeForToken } from 'clickup-utils/core/oauth-protocol'

// SvelteKit
import { handleClickUpCallback } from 'clickup-utils/sveltekit/oauth.service'
```

### Barrel exports

```typescript
// All types available at root
import type { Task, ClickUpWorkspace } from 'clickup-utils'

// Framework services with suffix
import {
  handleClickUpCallbackSvelteKit,
  ClickUpTokenStorageSvelteKit
} from 'clickup-utils'
```

## Contributing

**Types:**
- Reflect actual ClickUp API behavior
- Test across all consuming projects
- Keep transformers separate from core API types

**Services:**
- Keep framework-specific code in framework folders
- Extract truly shared logic to `core/`
- No abstractions for abstractions' sake
- Provide clear usage examples

## Related

- [ClickUp API v2 Documentation](https://clickup.com/api)
- [ClickUp API v3 Chat Documentation](https://clickup.com/api/v3)
