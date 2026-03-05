# Transformers

Pure functions that convert ClickUp API responses into simplified storage formats.

## Files

### `hierarchy-transformers.ts`

Converts full API response objects into `Stored*` types suitable for UI rendering and database storage.

| Function | Input | Output |
|----------|-------|--------|
| `transformWorkspace(w)` | `ClickUpWorkspace` | `StoredWorkspace` |
| `transformWorkspaces(ws)` | `ClickUpWorkspace[]` | `StoredWorkspace[]` |
| `transformSpace(s)` | `ClickUpSpace` | `StoredSpace` |
| `transformSpaces(ss)` | `ClickUpSpace[]` | `StoredSpace[]` |
| `transformFolder(f, opts?)` | `ClickUpFolder` | `StoredFolder` |
| `transformFolders(fs, opts?)` | `ClickUpFolder[]` | `StoredFolder[]` |
| `transformList(l, ctx?)` | `ClickUpList` | `StoredList` |
| `transformLists(ls, ctx?)` | `ClickUpList[]` | `StoredList[]` |
| `transformView(v)` | `ClickUpView` | `StoredView` |
| `transformViews(vs)` | `ClickUpView[]` | `StoredView[]` |
| `transformUser(u)` | `ClickUpUser` | `StoredUser` |

### Usage

```typescript
import { transformWorkspaces, transformLists } from 'clickup-utils/transformers/hierarchy-transformers'
import { getWorkspaces } from 'clickup-utils/api/hierarchy-api'

const apiWorkspaces = await getWorkspaces(token)
const stored = transformWorkspaces(apiWorkspaces.teams)
// → StoredWorkspace[] with { id, name, color, avatar }
```
