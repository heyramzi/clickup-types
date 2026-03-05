/**
 * clickup time — List time entries
 */

import * as client from "../client.js";
import { requireConfigWithTeam } from "../config.js";
import { type Column, color, printJson, printTable, progress, useJson } from "../output.js";

interface TimeRow {
	id: string;
	task: string;
	user: string;
	duration: string;
	description: string;
	billable: string;
}

const columns: Column<TimeRow>[] = [
	{ key: "id", label: "ID", maxWidth: 16 },
	{ key: "task", label: "Task", maxWidth: 30 },
	{ key: "user", label: "User", maxWidth: 20 },
	{ key: "duration", label: "Duration", maxWidth: 10, align: "right" },
	{ key: "description", label: "Description", maxWidth: 30 },
	{ key: "billable", label: "Billable", maxWidth: 8 },
];

function formatDuration(ms: string | number): string {
	const totalMs = typeof ms === "string" ? parseInt(ms, 10) : ms;
	if (totalMs < 0) return "running";
	const hours = Math.floor(totalMs / 3600000);
	const minutes = Math.floor((totalMs % 3600000) / 60000);
	return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export async function runTimeCommand(opts: {
	json?: boolean;
	team?: string;
	startDate?: string;
	endDate?: string;
	assignee?: string;
}): Promise<void> {
	const config = requireConfigWithTeam();
	const teamId = opts.team || config.teamId;
	progress("Fetching time entries...");

	const entries = await client.getTimeEntries(config.apiToken, teamId, {
		start_date: opts.startDate,
		end_date: opts.endDate,
		assignee: opts.assignee,
	});

	if (useJson(opts)) {
		printJson(entries);
		return;
	}

	const rows: TimeRow[] = entries.map((e) => ({
		id: e.id,
		task: e.task?.name ?? color.dim("—"),
		user: e.user.username,
		duration: formatDuration(e.duration),
		description: e.description || color.dim("—"),
		billable: e.billable ? "Yes" : "No",
	}));

	printTable(rows, columns);
}
