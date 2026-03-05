/**
 * ClickUp CLI
 *
 * Command-line interface for the ClickUp API.
 * Dual-mode output: human-friendly tables (TTY) or JSON (piped/agents).
 *
 * Usage:
 *   clickup init                     Set up API token and workspace
 *   clickup status                   Show auth status
 *   clickup workspaces               List workspaces
 *   clickup spaces                   List spaces
 *   clickup folders --space <id>     List folders in a space
 *   clickup lists --space <id>       List lists in a space
 *   clickup hierarchy                Show full workspace tree
 *   clickup tasks --list <id>        List tasks
 *   clickup task get <id>            Get task details
 *   clickup task create --list <id>  Create a task
 *   clickup task update <id>         Update a task
 *   clickup members                  List team members
 *   clickup comments list <taskId>   List task comments
 *   clickup comments add <taskId>    Add a comment
 *   clickup time                     List time entries
 *   clickup tags --space <id>        List space tags
 *   clickup open <taskId>            Open task in browser
 */

import { Command } from "commander";
import { runInitCommand } from "./commands/init.js";
import { runStatusCommand } from "./commands/status.js";
import { runWorkspacesCommand } from "./commands/workspaces.js";
import { runSpacesCommand } from "./commands/spaces.js";
import { runFoldersCommand } from "./commands/folders.js";
import { runListsCommand } from "./commands/lists.js";
import { runTasksCommand } from "./commands/tasks.js";
import { runTaskGetCommand, runTaskCreateCommand, runTaskUpdateCommand } from "./commands/task.js";
import { runMembersCommand } from "./commands/members.js";
import { runCommentsListCommand, runCommentAddCommand } from "./commands/comments.js";
import { runTimeCommand } from "./commands/time.js";
import { runHierarchyCommand } from "./commands/hierarchy.js";
import { runOpenCommand } from "./commands/open.js";
import { runTagsCommand } from "./commands/tags.js";

export const program = new Command();

function wrapAction(fn: (...args: any[]) => Promise<void>): (...args: any[]) => void {
	return (...args: any[]) => {
		fn(...args).catch((err: Error) => {
			process.stderr.write(`Error: ${err.message}\n`);
			process.exit(1);
		});
	};
}

program
	.name("clickup")
	.description("ClickUp CLI — manage workspaces, tasks, and more from the terminal")
	.version("0.1.0");

// ── Auth ──────────────────────────────────────────────

program
	.command("init")
	.description("Set up API token and select workspace")
	.action(wrapAction(runInitCommand));

program
	.command("status")
	.description("Show current authentication and config status")
	.option("--json", "Output as JSON")
	.action(wrapAction(runStatusCommand));

// ── Hierarchy ─────────────────────────────────────────

program
	.command("workspaces")
	.description("List all workspaces")
	.option("--json", "Output as JSON")
	.action(wrapAction(runWorkspacesCommand));

program
	.command("spaces")
	.description("List spaces in the current workspace")
	.option("--json", "Output as JSON")
	.option("--team <id>", "Override workspace/team ID")
	.action(wrapAction(runSpacesCommand));

program
	.command("folders")
	.description("List folders in a space")
	.requiredOption("--space <id>", "Space ID")
	.option("--json", "Output as JSON")
	.action(wrapAction(runFoldersCommand));

program
	.command("lists")
	.description("List lists in a space or folder")
	.option("--space <id>", "Space ID (lists all lists in space)")
	.option("--folder <id>", "Folder ID (lists only folder's lists)")
	.option("--json", "Output as JSON")
	.action(wrapAction(runListsCommand));

program
	.command("hierarchy")
	.description("Show full workspace hierarchy (spaces > folders > lists)")
	.option("--json", "Output as JSON")
	.option("--team <id>", "Override workspace/team ID")
	.action(wrapAction(runHierarchyCommand));

// ── Tasks ─────────────────────────────────────────────

program
	.command("tasks")
	.description("List tasks in a list or across the workspace")
	.option("--list <id>", "List ID (omit for workspace-wide search)")
	.option("--assignee <ids...>", "Filter by assignee user IDs")
	.option("--status <statuses...>", "Filter by status names")
	.option("--closed", "Include closed tasks")
	.option("--subtasks", "Include subtasks")
	.option("--page <n>", "Page number (0-indexed)")
	.option("--json", "Output as JSON")
	.action(wrapAction(runTasksCommand));

const task = program
	.command("task")
	.description("Get, create, or update a task");

task
	.command("get <taskId>")
	.description("Get full task details")
	.option("--json", "Output as JSON")
	.action(wrapAction(runTaskGetCommand));

task
	.command("create")
	.description("Create a new task")
	.requiredOption("--list <id>", "List ID to create task in")
	.requiredOption("--name <name>", "Task name")
	.option("--description <text>", "Task description")
	.option("--status <status>", "Task status")
	.option("--priority <level>", "Priority: urgent, high, normal, low")
	.option("--assignee <ids...>", "Assignee user IDs")
	.option("--tag <tags...>", "Tag names")
	.option("--json", "Output as JSON")
	.action(wrapAction(runTaskCreateCommand));

task
	.command("update <taskId>")
	.description("Update an existing task")
	.option("--name <name>", "New task name")
	.option("--description <text>", "New description")
	.option("--status <status>", "New status")
	.option("--priority <level>", "New priority: urgent, high, normal, low")
	.option("--add-assignee <ids...>", "Add assignees by user ID")
	.option("--remove-assignee <ids...>", "Remove assignees by user ID")
	.option("--json", "Output as JSON")
	.action(wrapAction(runTaskUpdateCommand));

// ── Team ──────────────────────────────────────────────

program
	.command("members")
	.description("List team members in the workspace")
	.option("--json", "Output as JSON")
	.option("--team <id>", "Override workspace/team ID")
	.action(wrapAction(runMembersCommand));

// ── Comments ──────────────────────────────────────────

const comments = program
	.command("comments")
	.description("List or add comments on a task");

comments
	.command("list <taskId>")
	.description("List comments on a task")
	.option("--json", "Output as JSON")
	.action(wrapAction(runCommentsListCommand));

comments
	.command("add <taskId>")
	.description("Add a comment to a task")
	.requiredOption("--text <text>", "Comment text")
	.option("--notify", "Notify all assignees")
	.option("--json", "Output as JSON")
	.action(wrapAction(runCommentAddCommand));

// ── Time Tracking ─────────────────────────────────────

program
	.command("time")
	.description("List time entries")
	.option("--json", "Output as JSON")
	.option("--team <id>", "Override workspace/team ID")
	.option("--start-date <ms>", "Start date (unix ms)")
	.option("--end-date <ms>", "End date (unix ms)")
	.option("--assignee <id>", "Filter by user ID")
	.action(wrapAction(runTimeCommand));

// ── Tags ──────────────────────────────────────────────

program
	.command("tags")
	.description("List tags in a space")
	.requiredOption("--space <id>", "Space ID")
	.option("--json", "Output as JSON")
	.action(wrapAction(runTagsCommand));

// ── Browser ───────────────────────────────────────────

program
	.command("open <taskId>")
	.description("Open a task in the browser")
	.action(wrapAction(runOpenCommand));
