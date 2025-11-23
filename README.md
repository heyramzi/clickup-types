# ClickUp Types

Universal TypeScript types for ClickUp API integration. Shared across multiple projects.

## Contents

### Core API Types

- **clickup-api-constants.ts** - API endpoints, HTTP methods, error codes, base URLs
- **clickup-auth-types.ts** - OAuth, authentication, user types

### Hierarchy Types

- **clickup-hierarchy-types.ts** - Workspaces, Spaces, Folders, Lists

### Resource Types

- **clickup-task-types.ts** - Tasks, custom fields, comments, attachments
- **clickup-field-types.ts** - Custom field definitions
- **clickup-doc-types.ts** - ClickUp Docs types
- **clickup-time-types.ts** - Time tracking types

### Communication Types

- **clickup-chat-types.ts** - Chat channels, messages, DMs

### Transformation Types

- **clickup-transformers.ts** - Flattened types for UI consumption

## Usage

```typescript
// Import from the barrel export
import { ClickUpWorkspace, ClickUpList, Task, FlattenedTask, ChatChannel } from './clickup-types'

// Or import specific files
import { FlattenedTask } from './clickup-types/clickup-transformers'
```

## Philosophy

These types reflect the actual ClickUp API responses:

- **Pure types** - No business logic, just type definitions
- **Reusable** - Shared across all ClickUp integration projects
- **Up-to-date** - Kept in sync with ClickUp API changes
- **DRY** - Single source of truth for ClickUp types

## Projects Using These Types

- client-glance
- upsys-app
- (Add your project here)

## Contributing

When updating types:

1. Ensure changes reflect actual ClickUp API behavior
2. Update this README if adding new type files
3. Test across all consuming projects before committing
4. Keep transformers separate from core API types

## ClickUp API Reference

- [ClickUp API v2 Docs](https://clickup.com/api)
- [ClickUp API v3 Chat](https://clickup.com/api/v3)
