# Core

Framework-agnostic ClickUp functions. Zero dependencies, zero side effects.

## Files

### `oauth-protocol.ts`

Pure OAuth 2.0 functions for ClickUp authentication.

| Function | Description |
|----------|-------------|
| `buildAuthUrl(params)` | Build ClickUp OAuth authorization URL |
| `exchangeCodeForToken(params)` | Exchange authorization code for access token |

### Usage

```typescript
import { buildAuthUrl, exchangeCodeForToken } from 'clickup-utils/core/oauth-protocol'

// Step 1: Redirect user to ClickUp auth
const authUrl = buildAuthUrl({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/api/clickup/callback',
})

// Step 2: Exchange code for token (in callback handler)
const token = await exchangeCodeForToken({
  clientId: 'your-client-id',
  clientSecret: 'your-secret',
  code: authCode,
})
```

For framework-specific OAuth handlers, see [`sveltekit/`](../sveltekit/) or [`nextjs/`](../nextjs/).
