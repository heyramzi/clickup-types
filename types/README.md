# Types

Hand-written TypeScript types for ClickUp API v2 and v3.

These types reflect actual API response shapes observed across 30+ ClickUp workspaces. They are the primary source of truth for consuming projects.

## Files

| File | Domain | Key Exports |
|------|--------|-------------|
| `clickup-api-constants.ts` | Core | `Endpoint` enum, `ClickUpApiUrl`, `HttpMethod`, `createEndpoint()`, `isClickUpError()` |
| `clickup-auth-types.ts` | Auth | `ClickUpOAuthConfig`, `ClickUpTokenResponse`, `ClickUpUser` |
| `clickup-hierarchy-types.ts` | Hierarchy | `ClickUpWorkspace`, `ClickUpSpace`, `ClickUpFolder`, `ClickUpList` |
| `clickup-task-types.ts` | Tasks | `ClickUpTask`, `ClickUpTasks`, `CreateTaskData`, `UpdateTaskData`, `BaseTaskParams` |
| `clickup-field-types.ts` | Custom Fields | `ClickUpCustomFieldType` enum, `DropdownField`, `CurrencyField`, `UserField`, etc. |
| `clickup-doc-types.ts` | Docs (v3) | `ClickUpDoc`, `ClickUpPage`, `ClickUpCreateDocRequest` |
| `clickup-time-types.ts` | Time Tracking | `TimeEntry`, `CreateTimeEntryParams`, `TimeEntriesResponse` |
| `clickup-chat-types.ts` | Chat (v3) | `ChatChannel`, `ChatMessage`, `CreateChatMessageRequest` |
| `clickup-comment-types.ts` | Comments | `ClickUpTaskComment`, `ClickUpTaskCommentsResponse` |
| `clickup-view-types.ts` | Views | `ClickUpView`, `ClickUpViewsResponse` |
| `clickup-task-transformers.ts` | UI Types | `FlattenedTask`, `FlattenedCustomField`, `TaskPriorityLevel` |

## Hand-Written vs Generated

These types are **hand-written and battle-tested** across consuming projects. The auto-generated types in [`generated/types/`](../generated/types/) provide broader API coverage but may have weaker typing on complex fields.

For consuming projects, prefer importing from these hand-written types when available.

## Import Patterns

```typescript
// Via barrel (recommended for most cases)
import type { ClickUpTask, ClickUpList } from 'clickup-utils'

// Direct import (when you need only one domain)
import type { ClickUpTask } from 'clickup-utils/types/clickup-task-types'
```
