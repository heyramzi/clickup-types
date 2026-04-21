# ClickUp CLI

Terminal interface for managing ClickUp workspaces, tasks, docs, and time tracking.

## Usage

Run the CLI directly from the UpSys workspace root with `tsx`:

```bash
pnpm exec tsx packages/clickup-utils/cli/bin/clickup.ts init
```

You will be prompted for one or more named API tokens (from [ClickUp Settings > Apps](https://app.clickup.com/settings/apps)) and asked to select a workspace.

Config is stored at `~/.config/clickup/config.json` with restrictive permissions (0600).

The CLI supports multiple tokens in priority order — if the first token returns 401/403, the next is tried automatically. This is useful for teams where docs are owned by a shared account.

```bash
pnpm exec tsx packages/clickup-utils/cli/bin/clickup.ts <command> [args...]
```

## Commands

### Auth

| Command          | Description                                     |
| ---------------- | ----------------------------------------------- |
| `clickup init`   | Interactive setup: add tokens, select workspace |
| `clickup status` | Show auth status and validate all tokens        |

### Workspaces

| Command                        | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `clickup workspaces`           | List all accessible workspaces              |
| `clickup spaces`               | List spaces in current workspace            |
| `clickup folders --space <id>` | List folders in a space                     |
| `clickup lists --space <id>`   | List all lists in a space (foldered + free) |
| `clickup lists --folder <id>`  | List lists in a specific folder             |
| `clickup hierarchy`            | Full tree view: spaces > folders > lists    |
| `clickup members`              | List team members                           |

### Structure (write)

| Command                                           | Description                               |
| ------------------------------------------------- | ----------------------------------------- |
| `clickup folder create --space <id> --name "..."` | Create a folder in a space                |
| `clickup folder update <folderId> --name "..."`   | Rename a folder                           |
| `clickup folder delete <folderId>`                | Delete a folder (and all its lists)       |
| `clickup list create --space <id> --name "..."`   | Create a folderless list in a space       |
| `clickup list create --folder <id> --name "..."`  | Create a list inside a folder             |
| `clickup list update <listId> --name "..."`       | Update name, content, priority, or status |
| `clickup list delete <listId>`                    | Delete a list (and all tasks)             |

List create/update flags: `--content "..."`, `--priority urgent|high|normal|low`, `--status <default>`.

### Tasks

| Command                                        | Description                  |
| ---------------------------------------------- | ---------------------------- |
| `clickup tasks --list <id>`                    | List tasks in a list         |
| `clickup tasks`                                | Workspace-wide task search   |
| `clickup task get <id>`                        | Full task details            |
| `clickup task create --list <id> --name "..."` | Create a task                |
| `clickup task update <id> --status done`       | Update a task                |
| `clickup task checklist create <id>`           | Create a checklist on a task |
| `clickup task dependency add <id>`             | Add a dependency to a task   |
| `clickup comments list <taskId>`               | List comments on a task      |
| `clickup comments add <taskId> --text "..."`   | Add a comment to a task      |
| `clickup open <taskId>`                        | Open a task in the browser   |

Task filters: `--assignee <ids>`, `--status <names>`, `--closed`, `--subtasks`, `--page <n>`

Task create flags: `--name`, `--description "..."` or `--description-file <path>` with `--markdown`, `--status`, `--priority`, `--assignee <ids>`, `--tag <names>`, `--parent <taskId>` (subtask), `--custom-item <id>` (custom task type).

Task update flags: `--name`, `--status`, `--priority`, `--add-assignee <ids>`, `--remove-assignee <ids>`

### Custom Fields

| Command                                                         | Description                                    |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `clickup fields list --list <id>`                               | List custom fields on a list (with option IDs) |
| `clickup fields create --team <id> --name ... --type ...`       | Create a custom field at workspace level       |
| `clickup fields create --list <id> --name ... --type ...`       | Create a custom field on a list                 |
| `clickup task field set <taskId> --field <fieldId> --value <v>` | Set a custom field value on a task             |

Use `--json-value` on `task field set` when the value is a complex object (relationship, user field, etc.).
Use `--options-json` on `fields create` to define dropdown or labels options.

**ClickUp API limitation**: custom fields can be created via API, but custom task types still need the UI.

### Views

| Command                          | Description                 |
| -------------------------------- | --------------------------- | --------------------------------------- | ------------------------------------------ |
| `clickup views list --list <id>` | List custom views on a list |
| `clickup view create (--list     | --folder                    | --space) <id> --name --type --group-by` | Create a view with minimal ergonomic flags |
| `clickup view delete <viewId>`   | Delete a view               |

View types: `list`, `board`, `table`, `calendar`, `gantt`, `timeline`, `workload`, `activity`, `map`, `conversation`, `doc`.

Simple shortcut: `--group-by status` (or `--group-by cf_<fieldId>` for a custom field).

JSON passthrough flags for advanced shapes: `--grouping-json`, `--filters-json`, `--sorting-json`, `--columns-json`, `--settings-json`. Each takes a raw JSON object matching the ClickUp view schema.

Example, a board grouped by Phase (custom field) with a filter excluding `Fini`:

```bash
clickup view create --list 901217362151 \
  --name "Portefeuille actif" --type board \
  --group-by cf_8b0a1fbc-04d0-448f-b5ae-9ba45b8fc384 \
  --filters-json '{"op":"AND","fields":[{"field":"cf_8b0a1fbc-04d0-448f-b5ae-9ba45b8fc384","op":"NOT EQUALS","value":"Fini"}]}'
```

### Docs

| Command                               | Description                                         |
| ------------------------------------- | --------------------------------------------------- |
| `clickup docs list`                   | List all docs (types: 1=Doc, 2=Wiki, 3=Meeting)     |
| `clickup docs list --type 3`          | Filter to meeting notes only                        |
| `clickup docs pages <docId>`          | List pages in a doc (nested hierarchy)              |
| `clickup docs get <url>`              | Get page content by full ClickUp URL                |
| `clickup docs get <pageId> --doc <d>` | Get page content by page ID and doc ID              |
| `clickup docs update <url>`           | Update page (--mode replace/append/prepend)         |
| `clickup docs create <docId>`         | Create a new page in a doc                          |
| `clickup docs scan`                   | Scan all docs for call pages (date-suffixed titles) |

Docs commands accept a full ClickUp URL (`https://app.clickup.com/{team}/v/dc/{doc}/{page}`) or a page ID with `--doc <docId>`.

Content can come from `--content "..."`, `--file path/to/file.md`, or stdin:

```bash
cat notes.md | clickup docs update <url> --mode append
clickup docs update <url> --file notes.md --mode replace
```

### Time

| Command                     | Description                         |
| --------------------------- | ----------------------------------- |
| `clickup time`              | List time entries for the workspace |
| `clickup time --start-date` | Filter by start date (unix ms)      |
| `clickup time --end-date`   | Filter by end date (unix ms)        |
| `clickup time --assignee`   | Filter by user ID                   |

### Tags

| Command                     | Description          |
| --------------------------- | -------------------- |
| `clickup tags --space <id>` | List tags in a space |

## Examples

```bash
# View workspace structure
clickup hierarchy

# Find a list ID, then list tasks
clickup spaces
clickup lists --space 12345678
clickup tasks --list 901234567

# Get and update a task
clickup task get abc123xyz
clickup task update abc123xyz --status "in review" --priority high

# Work with docs
clickup docs list
clickup docs pages doc123
clickup docs get https://app.clickup.com/12345/v/dc/doc123/page456
clickup docs update https://app.clickup.com/12345/v/dc/doc123/page456 --file notes.md

# Find all call pages across all docs
clickup docs scan
```

## Output

The SDK produces TOON output in the terminal and JSON with `--json`:

```bash
clickup tasks --list 123 --json | jq '.[].name'
```

Pass `--human` for padded plain-text output (useful in scripts that parse tables).

## Environment Variables

| Variable       | Description                               |
| -------------- | ----------------------------------------- |
| `CU_API_TOKEN` | API token override (bypasses config file) |
| `CU_TEAM_ID`   | Workspace ID override                     |
