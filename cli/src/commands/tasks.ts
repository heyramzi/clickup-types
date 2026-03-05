/**
 * clickup tasks — List tasks from a list or workspace
 */

import * as client from "../client.js";
import { requireConfigWithTeam } from "../config.js";
import { type Column, color, printError, printJson, printTable, progress, useJson } from "../output.js";

interface TaskRow {
	id: string;
	name: string;
	status: string;
	priority: string;
	assignees: string;
	due: string;
}

const columns: Column<TaskRow>[] = [
	{ key: "id", label: "ID", maxWidth: 12 },
	{ key: "name", label: "Name", maxWidth: 50 },
	{ key: "status", label: "Status", maxWidth: 16 },
	{ key: "priority", label: "Priority", maxWidth: 10 },
	{ key: "assignees", label: "Assignees", maxWidth: 20 },
	{ key: "due", label: "Due", maxWidth: 12 },
];

function formatDate(timestamp: string | null): string {
	if (!timestamp) return "";
	const d = new Date(parseInt(timestamp, 10));
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPriority(p: { priority: string } | null): string {
	if (!p) return "";
	const map: Record<string, string> = {
		urgent: color.red("urgent"),
		high: color.yellow("high"),
		normal: "normal",
		low: color.dim("low"),
	};
	return map[p.priority] ?? p.priority;
}

export async function runTasksCommand(opts: {
	json?: boolean;
	list?: string;
	assignee?: string[];
	status?: string[];
	closed?: boolean;
	subtasks?: boolean;
	page?: string;
}): Promise<void> {
	const config = requireConfigWithTeam();

	if (!opts.list) {
		// Workspace-wide task search
		progress("Fetching tasks from workspace...");
		const result = await client.getFilteredTasks(config.apiToken, config.teamId, {
			page: opts.page ? parseInt(opts.page, 10) : 0,
			assignees: opts.assignee,
			statuses: opts.status,
			include_closed: opts.closed,
			subtasks: opts.subtasks,
		});

		if (useJson(opts)) {
			printJson(result);
			return;
		}

		printTaskTable(result.tasks);
		if (!result.last_page) {
			console.log(color.dim(`\n  More results available. Use --page ${(opts.page ? parseInt(opts.page, 10) : 0) + 1} to see next page.`));
		}
		return;
	}

	progress("Fetching tasks...");
	const result = await client.getTasks(config.apiToken, opts.list, {
		page: opts.page ? parseInt(opts.page, 10) : 0,
		assignees: opts.assignee,
		statuses: opts.status,
		include_closed: opts.closed,
		subtasks: opts.subtasks,
	});

	if (useJson(opts)) {
		printJson(result);
		return;
	}

	printTaskTable(result.tasks);
	if (!result.last_page) {
		console.log(color.dim(`\n  More results available. Use --page ${(opts.page ? parseInt(opts.page, 10) : 0) + 1} to see next page.`));
	}
}

function printTaskTable(tasks: Array<{ id: string; name: string; status: { status: string }; priority: { priority: string } | null; assignees: Array<{ username: string | null }>; due_date: string | null }>): void {
	const rows: TaskRow[] = tasks.map((t) => ({
		id: t.id,
		name: t.name,
		status: t.status.status,
		priority: t.priority ? formatPriority(t.priority) : "",
		assignees: t.assignees.map((a) => a.username ?? "?").join(", "),
		due: formatDate(t.due_date),
	}));

	printTable(rows, columns);
}
