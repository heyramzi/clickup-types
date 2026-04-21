# ClickUp CLI Reference

## Location

- **Source**: `clickup-utils/cli/src/`
- **Entry point**: `cli/src/index.ts`
- **API client**: `cli/src/client.ts`
- **Commands**: `cli/src/commands/*.ts`
- **Output utilities**: `cli/src/output.ts`
- **Config**: `cli/src/config.ts` → `~/.config/clickup/config.json`
- **Types**: `clickup-utils/types/clickup-*-types.ts`
- **Generated SDK**: `clickup-utils/generated/api/` (auto-generated, full API coverage)
- **Build**: `tsup` → `cli/dist/bin/clickup.js`
- **Global install**: `cd cli && npm install -g .`

## Architecture

```
index.ts          Commander program, registers all commands
client.ts         API client wrapping fetch, token fallback, typed methods
config.ts         ~/.config/clickup/config.json, env var overrides (CU_API_TOKEN, CU_TEAM_ID)
output.ts         Dual-mode output: tables (TTY) / JSON (piped). Colors, progress, errors.
commands/*.ts     One file per command group, exports handler functions
```

### Output System

- `useJson(opts)` — returns true if `--json` flag or non-TTY (piped to another program)
- `printJson(data)` — JSON to stdout
- `printTable(rows, columns)` — formatted table with truncation and alignment
- `printKeyValue(pairs)` — key-value detail view
- `progress(msg)` — dim text to stderr (only in TTY mode)
- `color.bold/dim/green/yellow/cyan/red/magenta` — respects NO_COLOR env

### Config & Auth

- Multi-token support with priority-based fallback on 401/403
- `requireConfig()` / `requireConfigWithTeam()` — exit with message if not configured
- `requestWithFallback(tokens, fn)` — tries each token in order
- Env vars: `CU_API_TOKEN` (overrides file config), `CU_TEAM_ID`

### Adding a New Command

1. Create `cli/src/commands/new-command.ts`
2. Export handler function(s) following the pattern:
   ```typescript
   export async function runNewCommand(opts: { json?: boolean; team?: string }): Promise<void> {
     const config = requireConfigWithTeam();
     progress("Loading...");
     const data = await client.someMethod(config.apiToken, config.teamId);
     if (useJson(opts)) {
       printJson(data);
       return;
     }
     printTable(rows, columns);
   }
   ```
3. Add client method to `client.ts` if needed
4. Register in `index.ts` with Commander
5. Build: `cd cli && npm run build`
6. Re-install globally: `npm install -g .`

### Adding a Subcommand Group

Use Commander's `.command()` to create a parent, then chain subcommands:

```typescript
const parent = program.command("group").description("Description");

parent
  .command("list", { isDefault: true })
  .description("List items (default)")
  .option("--json", "Output as JSON")
  .action(wrapAction(runListCommand));

parent
  .command("create")
  .requiredOption("--name <name>", "Item name")
  .action(wrapAction(runCreateCommand));
```

## Full Command Reference

### Hierarchy & Navigation

```bash
clickup workspaces                          # List workspaces
clickup spaces [--team <id>]                # List spaces
clickup folders --space <id>                # List folders in space
clickup lists --space <id>                  # Lists in space (folderless)
clickup lists --folder <id>                 # Lists in folder
clickup hierarchy [--team <id>]             # Full tree: spaces > folders > lists
clickup open <taskId>                       # Open task in browser
```

### Tasks

```bash
clickup tasks --list <id>                   # List tasks in a list
clickup tasks --list <id> --closed          # Include closed tasks
clickup tasks --list <id> --subtasks        # Include subtasks
clickup tasks --assignee <id1> <id2>        # Filter by assignee(s)
clickup tasks --status "in progress" done   # Filter by status
clickup tasks --page 1                      # Pagination (0-indexed)

clickup task get <taskId>                   # Full task details
clickup task create --list <id> --name "X"  # Create task
  [--description <text>] [--markdown]
  [--status <s>] [--priority urgent|high|normal|low]
  [--assignee <ids...>] [--tag <tags...>]
clickup task update <taskId>                # Update task
  [--name <n>] [--description <t>] [--markdown]
  [--status <s>] [--priority <p>]
  [--add-assignee <ids...>] [--remove-assignee <ids...>]
```

### Time Tracking

```bash
clickup time [list]                         # List entries (last 30 days default)
  [--start-date <ms>] [--end-date <ms>]
  [--assignee <id>] [--team <id>]

clickup time get <timerId>                  # Get single entry
  [--team <id>]

clickup time create                         # Create entry
  --duration <dur>                          # Required: 1h, 30m, 1h30m, 1.5h, or raw ms
  [--task <id>]                             # Task to log against
  [--start <date>]                          # today, yesterday, -2d, ISO date, unix ms
  [--description <text>]
  [--billable]
  [--assignee <id>]
  [--team <id>]

clickup time update <timerId>               # Update entry
  [--duration <dur>] [--start <date>]
  [--description <text>] [--billable]
  [--task <id>] [--team <id>]

clickup time delete <timerId>               # Delete entry
  [--team <id>]
```

**Duration formats**: `1h`, `30m`, `1h30m`, `1.5h`, or raw milliseconds
**Start date formats**: `now`, `today`, `yesterday`, `-2d` (days ago), ISO date string, unix ms

### Comments

```bash
clickup comments list <taskId>              # List comments
clickup comments add <taskId> --text "X"    # Add comment
  [--notify]                                # Notify assignees
```

### Docs (v3 API)

```bash
clickup docs list [--workspace <id>]        # List docs
clickup docs pages <docId>                  # List pages in doc
clickup docs get <url|pageId>               # Get page content
  [--doc <id>]                              # Required if using pageId
clickup docs update <url|pageId>            # Update page
  [--content <text>] [--file <path>]
  [--name <title>]
  [--mode replace|append|prepend]
clickup docs create <docId>                 # Create page
  [--name <title>] [--content <text>]
  [--file <path>] [--parent <pageId>]
```

### Members & Tags

```bash
clickup members [--team <id>]               # List team members
clickup tags --space <id>                   # List space tags
```

### Auth & Config

```bash
clickup init                                # Set up token + workspace
clickup status                              # Show auth status
```

## API Client Methods (client.ts)

All methods take `token: string` as first arg.

| Method                                          | Endpoint                              | HTTP   |
| ----------------------------------------------- | ------------------------------------- | ------ |
| `getWorkspaces(token)`                          | `/team`                               | GET    |
| `getTeamMembers(token, teamId)`                 | `/team/{id}`                          | GET    |
| `getSpaces(token, teamId)`                      | `/team/{id}/space`                    | GET    |
| `getFolders(token, spaceId)`                    | `/space/{id}/folder`                  | GET    |
| `getFolderlessLists(token, spaceId)`            | `/space/{id}/list`                    | GET    |
| `getListsInFolder(token, folderId)`             | `/folder/{id}/list`                   | GET    |
| `getList(token, listId)`                        | `/list/{id}`                          | GET    |
| `getTasks(token, listId, opts?)`                | `/list/{id}/task`                     | GET    |
| `getFilteredTasks(token, teamId, opts?)`        | `/team/{id}/task`                     | GET    |
| `getTask(token, taskId)`                        | `/task/{id}`                          | GET    |
| `createTask(token, listId, data)`               | `/list/{id}/task`                     | POST   |
| `updateTask(token, taskId, data)`               | `/task/{id}`                          | PUT    |
| `getTaskComments(token, taskId)`                | `/task/{id}/comment`                  | GET    |
| `addTaskComment(token, taskId, body)`           | `/task/{id}/comment`                  | POST   |
| `getTimeEntries(token, teamId, opts?)`          | `/team/{id}/time_entries`             | GET    |
| `getTimeEntry(token, teamId, timerId)`          | `/team/{id}/time_entries/{id}`        | GET    |
| `createTimeEntry(token, teamId, data)`          | `/team/{id}/time_entries`             | POST   |
| `updateTimeEntry(token, teamId, timerId, data)` | `/team/{id}/time_entries/{id}`        | PUT    |
| `deleteTimeEntry(token, teamId, timerId)`       | `/team/{id}/time_entries/{id}`        | DELETE |
| `getSpaceTags(token, spaceId)`                  | `/space/{id}/tag`                     | GET    |
| `getDocs(token, workspaceId)`                   | v3 `/workspaces/{id}/docs`            | GET    |
| `getDocPages(token, wid, docId)`                | v3 `/workspaces/{id}/docs/{id}/pages` | GET    |
| `getPage(token, wid, docId, pageId)`            | v3 `…/pages/{id}`                     | GET    |
| `createPage(token, wid, docId, page)`           | v3 `…/pages`                          | POST   |
| `updatePage(token, wid, docId, pageId, page)`   | v3 `…/pages/{id}`                     | PUT    |

## Types Location

| File                               | Types                                                              |
| ---------------------------------- | ------------------------------------------------------------------ |
| `types/clickup-task-types.ts`      | `ClickUpTask`, `CreateTaskData`, `UpdateTaskData`                  |
| `types/clickup-hierarchy-types.ts` | `ClickUpSpace`, `ClickUpFolder`, `ClickUpList`, `ClickUpWorkspace` |
| `types/clickup-time-types.ts`      | `TimeEntry`, `CreateTimeEntryParams`, `TimeEntriesResponse`        |
| `types/clickup-comment-types.ts`   | `ClickUpTaskComment`, `CreateCommentBody`                          |
| `types/clickup-doc-types.ts`       | `ClickUpDoc`, `ClickUpPage`, `ClickUpCreatePageRequest`            |

## Common Patterns

### Extracting IDs from ClickUp URLs

```
https://app.clickup.com/{workspaceId}/v/li/{listId}
https://app.clickup.com/{workspaceId}/v/dc/{docId}
```

### Team ID vs Workspace ID

Some commands use the configured `teamId` from `clickup init`. For multi-workspace setups, override with `--team <id>`. The workspace ID from ClickUp URLs can be used as the team ID.

### JSON Output for Scripting

All commands support `--json`. When piped (non-TTY), JSON is the default output. Use `jq` or `python3 -c` for filtering:

```bash
clickup tasks --list 123 --json | jq '.tasks[] | {id, name, status: .status.status}'
```
