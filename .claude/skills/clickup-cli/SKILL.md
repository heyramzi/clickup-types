---
name: clickup-cli
description: Manage ClickUp workspaces via the `clickup` CLI — tasks, time tracking, docs, comments, hierarchy. This skill should be used when interacting with ClickUp data from the terminal, creating/updating tasks, logging time entries, managing docs, or scripting ClickUp workflows. Triggers on "clickup", "time tracking", "ClickUp tasks", "log time", "ClickUp docs".
---

# ClickUp CLI

Command-line interface for the ClickUp API. Installed globally as `clickup` (alias `cu`).

## When to Use

- Reading or modifying ClickUp tasks, time entries, comments, or docs
- Bulk operations on ClickUp data (batch time logging, mass status updates)
- Extracting ClickUp data for reporting or cross-referencing
- Any task referencing a ClickUp URL (`app.clickup.com/...`)

## Prerequisites

The CLI must be initialized: `clickup init`. Verify with `clickup status`.

If the CLI is not installed or needs rebuilding:

```bash
cd <path-to-clickup-utils>/cli && npm run build && npm install -g .
```

## Quick Reference

Read `references/cli-reference.md` for the full command reference, API client methods, types, and architecture guide.

## Core Commands

```bash
# Hierarchy
clickup hierarchy                           # Full workspace tree
clickup tasks --list <listId> --json        # Tasks in a list

# Task CRUD
clickup task get <taskId>
clickup task create --list <id> --name "Task name"
clickup task update <taskId> --status "done"

# Time tracking
clickup time list --start-date <ms> --end-date <ms>
clickup time create --duration 2h --task <taskId> --start -3d
clickup time update <timerId> --duration 3h
clickup time delete <timerId>

# Docs
clickup docs get <url>
clickup docs update <url> --content "new content" --mode append

# Comments
clickup comments list <taskId>
clickup comments add <taskId> --text "Comment"
```

## Key Conventions

### Output Modes

All commands support `--json` for machine-readable output. Non-TTY (piped) output defaults to JSON automatically.

### Team/Workspace Override

Commands that need a workspace ID use the configured default. Override with `--team <id>`. The numeric ID from ClickUp URLs (`app.clickup.com/{workspaceId}/...`) works as the team ID.

### Time Tracking Formats

- **Duration**: `1h`, `30m`, `1h30m`, `1.5h`, or raw milliseconds
- **Start date**: `now`, `today`, `yesterday`, `-2d` (days ago), ISO date, or unix ms

### Extracting IDs from URLs

```
https://app.clickup.com/90132511039/v/li/901326771079
                        └─ workspace    └─ list ID

https://app.clickup.com/90132511039/v/dc/180407336/180407337
                        └─ workspace    └─ doc ID  └─ page ID
```

## Extending the CLI

### Source Location

The CLI lives at `clickup-utils/cli/`. Key files:

- `src/index.ts` — Commander program registration
- `src/client.ts` — API client (add new methods here)
- `src/commands/*.ts` — Command handlers
- `src/output.ts` — Table/JSON output helpers
- `src/config.ts` — Auth config management

### Adding a New Command

1. Add API method to `client.ts`
2. Create command handler in `src/commands/`
3. Register in `src/index.ts` with Commander
4. Build and reinstall: `cd cli && npm run build && npm install -g .`

Refer to `references/cli-reference.md` for the handler pattern, the full list of existing client methods, and type locations.

### Types

Hand-written types are in `clickup-utils/types/clickup-*-types.ts`. The generated SDK at `clickup-utils/generated/api/` covers the full ClickUp API and can be referenced for endpoints not yet in the CLI.

## Common Workflows

### Bulk Time Logging

To log time across multiple tasks spread over a date range:

```bash
clickup time create --task <id1> --duration 3h --start -5d --team <wsId>
clickup time create --task <id2> --duration 2h --start -3d --team <wsId>
```

### Task Reporting

```bash
clickup tasks --list <id> --closed --json | jq '.tasks[] | {name, status: .status.status}'
```

### Moving Tasks Through Statuses

```bash
clickup task update <taskId> --status "in progress"
clickup task update <taskId> --status "done"
```
