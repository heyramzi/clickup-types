# ClickUp Types

**Philosophy**: 純粋 (Junsui - Purity) - Pure TypeScript types reflecting ClickUp API responses

## Overview

Universal TypeScript types for ClickUp API integration. Shared across multiple projects (client-glance, upsys-app). Pure type definitions with no business logic, kept in sync with ClickUp API.

## Structure

**Core API**:
- `clickup-api-constants.ts` - Endpoints, HTTP methods, error codes
- `clickup-auth-types.ts` - OAuth, authentication, users

**Hierarchy**:
- `clickup-hierarchy-types.ts` - Workspaces, Spaces, Folders, Lists

**Resources**:
- `clickup-task-types.ts` - Tasks, custom fields, comments, attachments
- `clickup-field-types.ts` - Custom field definitions
- `clickup-doc-types.ts` - ClickUp Docs
- `clickup-time-types.ts` - Time tracking

**Communication**:
- `clickup-chat-types.ts` - Chat channels, messages, DMs

**Transformations**:
- `clickup-transformers.ts` - Flattened types for UI consumption

## Usage

```typescript
// Barrel export
import { ClickUpWorkspace, ClickUpList, Task, FlattenedTask } from './clickup-types'

// Specific files
import { FlattenedTask } from './clickup-types/clickup-transformers'
```

### Contributing

1. Ensure changes reflect actual ClickUp API behavior
2. Update README if adding new type files
3. Test across all consuming projects
4. Keep transformers separate from core API types

## Related

- [ClickUp API v2 Docs](https://clickup.com/api)
- [ClickUp API v3 Chat](https://clickup.com/api/v3)
- `/lib/server/clickup/` - ClickUp service integration
