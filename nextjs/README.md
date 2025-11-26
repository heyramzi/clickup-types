# Next.js ClickUp Integration

**Status**: Placeholder implementation

This folder contains Next.js-specific implementations for ClickUp OAuth integration.

## Available

- `oauth.service.ts` - OAuth flow helpers for Next.js App Router

## Usage

```typescript
import { handleClickUpCallback, getClickUpAuthUrl } from 'clickup-utils/nextjs/oauth.service'

// In app/api/clickup/callback/route.ts
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

## TODO

- Add token storage service (Prisma/Drizzle adapters)
- Add client-side auth popup handler
- Add examples for Pages Router
