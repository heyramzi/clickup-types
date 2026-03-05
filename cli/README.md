# ClickUp CLI

Command-line interface for the ClickUp API. Designed for both humans and AI agents.

- **Dual output**: Human-friendly tables in the terminal, JSON when piped or with `--json`
- **Full hierarchy navigation**: Workspaces > Spaces > Folders > Lists > Tasks
- **Task management**: List, get, create, update tasks with filters
- **Agent-friendly**: Structured JSON output, progress messages to stderr, `NO_COLOR` support

## Quick Start

```bash
cd cli
npm install
npm run build

# Set up authentication
node dist/bin/clickup.js init

# Explore your workspace
node dist/bin/clickup.js workspaces
node dist/bin/clickup.js spaces
node dist/bin/clickup.js hierarchy
```

After `npm link` or global install, use `clickup` or `cu` directly:

```bash
clickup init
clickup hierarchy
clickup tasks --list 901234567
```

## Authentication

The CLI uses a personal API token (`pk_...`).

1. Get your token at https://app.clickup.com/settings/apps
2. Run `clickup init` to save it
3. Or set `CU_API_TOKEN` and `CU_TEAM_ID` environment variables

Config is stored at `~/.config/clickup/config.json` with restrictive file permissions (0600).

## Commands

### Setup

| Command | Description |
|---|---|
| `clickup init` | Interactive setup wizard |
| `clickup status` | Show auth and workspace info |

### Hierarchy Navigation

| Command | Description |
|---|---|
| `clickup workspaces` | List all workspaces |
| `clickup spaces` | List spaces in current workspace |
| `clickup folders --space <id>` | List folders in a space |
| `clickup lists --space <id>` | List all lists in a space |
| `clickup lists --folder <id>` | List lists in a folder |
| `clickup hierarchy` | Full tree view (spaces > folders > lists) |

### Tasks

| Command | Description |
|---|---|
| `clickup tasks --list <id>` | List tasks in a list |
| `clickup tasks` | Workspace-wide task search |
| `clickup task get <id>` | Full task details |
| `clickup task create --list <id> --name "..."` | Create a task |
| `clickup task update <id> --status "done"` | Update a task |

Task filters: `--assignee`, `--status`, `--closed`, `--subtasks`, `--page`

### Collaboration

| Command | Description |
|---|---|
| `clickup members` | List team members |
| `clickup comments list <taskId>` | List task comments |
| `clickup comments add <taskId> --text "..."` | Add a comment |

### Other

| Command | Description |
|---|---|
| `clickup time` | List time entries |
| `clickup tags --space <id>` | List space tags |
| `clickup open <taskId>` | Open task in browser |

## Output Modes

**Interactive terminal (TTY):** Formatted tables with colors.

```
ID          Name                Status    Priority  Assignees
──────────  ──────────────────  ────────  ────────  ─────────
abc123      Fix login bug       in prog   high      alice
def456      Add dark mode       open      normal    bob, carol
```

**Piped or `--json`:** Raw JSON for scripting and AI agents.

```bash
clickup tasks --list 123 --json | jq '.tasks[].name'
clickup tasks --list 123 | jq '.tasks[].id'  # auto-JSON when piped
```

## Environment Variables

| Variable | Description |
|---|---|
| `CU_API_TOKEN` | API token (overrides config file) |
| `CU_TEAM_ID` | Workspace/team ID (overrides config file) |
| `NO_COLOR` | Disable colors |

## AI Agent Usage

The CLI is designed to be used by AI agents (Claude, GPT, etc.) via tool execution:

```bash
# Agents get JSON automatically (non-TTY)
clickup hierarchy --json
clickup tasks --list 123 --json
clickup task get abc123 --json

# Create and update tasks programmatically
clickup task create --list 123 --name "New task" --status "open" --json
clickup task update abc123 --status "complete" --json
```

Progress messages go to stderr so they don't pollute JSON output.

## Development

```bash
cd cli
npm install
npm run build    # Build with tsup
npm run dev      # Watch mode
```
