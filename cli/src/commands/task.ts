/**
 * clickup task — Get, create, or update a single task
 */

import * as client from "../client.js";
import { requireConfig } from "../config.js";
import { color, printError, printJson, printKeyValue, printSuccess, progress, useJson } from "../output.js";

// ── Get task ──────────────────────────────────────────

export async function runTaskGetCommand(taskId: string, opts: { json?: boolean }): Promise<void> {
	const config = requireConfig();
	progress("Fetching task...");

	const task = await client.getTask(config.apiToken, taskId);

	if (useJson(opts)) {
		printJson(task);
		return;
	}

	console.log(color.bold(`\n  ${task.name}\n`));

	printKeyValue([
		["ID", task.id],
		["Custom ID", task.custom_id],
		["Status", task.status.status],
		["Priority", task.priority?.priority ?? null],
		["Assignees", task.assignees.map((a) => a.username ?? a.email).join(", ") || null],
		["Creator", task.creator.username],
		["Created", new Date(parseInt(task.date_created, 10)).toLocaleString()],
		["Updated", new Date(parseInt(task.date_updated, 10)).toLocaleString()],
		["Due Date", task.due_date ? new Date(parseInt(task.due_date, 10)).toLocaleString() : null],
		["Start Date", task.start_date ? new Date(parseInt(task.start_date, 10)).toLocaleString() : null],
		["Time Estimate", task.time_estimate ? `${Math.round(task.time_estimate / 3600000)}h` : null],
		["Time Spent", task.time_spent ? `${Math.round(task.time_spent / 3600000)}h` : null],
		["Points", task.points !== null ? String(task.points) : null],
		["Tags", task.tags.map((t) => t.name).join(", ") || null],
		["URL", task.url],
	]);

	if (task.text_content) {
		console.log(color.bold("\n  Description:\n"));
		const lines = task.text_content.split("\n").slice(0, 20);
		for (const line of lines) {
			console.log(`    ${line}`);
		}
		if (task.text_content.split("\n").length > 20) {
			console.log(color.dim("    ... (truncated)"));
		}
	}
}

// ── Create task ───────────────────────────────────────

export async function runTaskCreateCommand(opts: {
	json?: boolean;
	list: string;
	name: string;
	description?: string;
	status?: string;
	priority?: string;
	assignee?: string[];
	tag?: string[];
}): Promise<void> {
	if (!opts.list) {
		printError("--list <id> is required.");
		process.exit(1);
	}
	if (!opts.name) {
		printError("--name is required.");
		process.exit(1);
	}

	const config = requireConfig();
	progress("Creating task...");

	const priorityMap: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
	const data: Record<string, unknown> = {
		name: opts.name,
	};

	if (opts.description) data.description = opts.description;
	if (opts.status) data.status = opts.status;
	if (opts.priority && priorityMap[opts.priority]) {
		data.priority = priorityMap[opts.priority];
	}
	if (opts.assignee?.length) data.assignees = opts.assignee.map(Number);
	if (opts.tag?.length) data.tags = opts.tag;

	const task = await client.createTask(config.apiToken, opts.list, data as any);

	if (useJson(opts)) {
		printJson(task);
		return;
	}

	printSuccess(`Task created: ${color.bold(task.name)} ${color.dim(`(${task.id})`)}`);
	console.log(color.dim(`  ${task.url}`));
}

// ── Update task ───────────────────────────────────────

export async function runTaskUpdateCommand(
	taskId: string,
	opts: {
		json?: boolean;
		name?: string;
		description?: string;
		status?: string;
		priority?: string;
		addAssignee?: string[];
		removeAssignee?: string[];
	},
): Promise<void> {
	const config = requireConfig();
	progress("Updating task...");

	const priorityMap: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
	const data: Record<string, unknown> = {};

	if (opts.name) data.name = opts.name;
	if (opts.description) data.description = opts.description;
	if (opts.status) data.status = opts.status;
	if (opts.priority) {
		data.priority = priorityMap[opts.priority] ?? null;
	}
	if (opts.addAssignee?.length || opts.removeAssignee?.length) {
		data.assignees = {
			add: opts.addAssignee?.map(Number) ?? [],
			rem: opts.removeAssignee?.map(Number) ?? [],
		};
	}

	if (Object.keys(data).length === 0) {
		printError("No update fields provided. Use --name, --status, --priority, etc.");
		process.exit(1);
	}

	const task = await client.updateTask(config.apiToken, taskId, data as any);

	if (useJson(opts)) {
		printJson(task);
		return;
	}

	printSuccess(`Task updated: ${color.bold(task.name)} ${color.dim(`(${task.id})`)}`);
}
