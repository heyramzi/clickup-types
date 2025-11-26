# SvelteKit ClickUp Integration

Framework-specific implementations for ClickUp OAuth integration in SvelteKit.

## Available Services

- **`oauth.service.ts`** - OAuth flow helpers
- **`token.service.ts`** - Supabase token storage

## Usage

### OAuth Callback Handler

```typescript
// routes/api/clickup/callback/+server.ts
import { handleClickUpCallback } from 'clickup-utils/sveltekit/oauth.service'
import { ClickUpTokenStorage } from 'clickup-utils/sveltekit/token.service'
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
  const { locals: { supabase, user } } = event

  if (!user) throw redirect(303, '/auth')

  await handleClickUpCallback(event, {
    clientId: PUBLIC_CLICKUP_CLIENT_ID,
    clientSecret: CLICKUP_CLIENT_SECRET,
    onSuccess: async (token) => {
      await ClickUpTokenStorage.save(
        supabase,
        user.organization_id,
        token,
        TokenEncryptionService
      )
    }
  })

  throw redirect(303, '/dashboard?success=clickup-connected')
}
```

### Getting OAuth URL

```typescript
// +page.svelte or +page.ts
import { getClickUpAuthUrl } from 'clickup-utils/sveltekit/oauth.service'

const authUrl = getClickUpAuthUrl(
  PUBLIC_CLICKUP_CLIENT_ID,
  window.location.origin,
  crypto.randomUUID() // CSRF protection
)
```

### Retrieving Stored Token

```typescript
import { ClickUpTokenStorage } from 'clickup-utils/sveltekit/token.service'

const token = await ClickUpTokenStorage.get(
  supabase,
  organizationId,
  TokenEncryptionService
)
```

## Requirements

- `@supabase/supabase-js` >= 2.0.0
- Encryption service with `encrypt()` and `decrypt()` methods
- Database table `organizations` with `clickup_access_token` column
