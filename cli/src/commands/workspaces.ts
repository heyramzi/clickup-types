/**
 * clickup workspaces — List all workspaces
 */

import * as client from "../client.js";
import { requireConfig } from "../config.js";
import { type Column, printJson, printTable, progress, useJson } from "../output.js";

interface WorkspaceRow {
	id: string;
	name: string;
	members: string;
}

const columns: Column<WorkspaceRow>[] = [
	{ key: "id", label: "ID", maxWidth: 12 },
	{ key: "name", label: "Name", maxWidth: 40 },
	{ key: "members", label: "Members", maxWidth: 10, align: "right" },
];

export async function runWorkspacesCommand(opts: { json?: boolean }): Promise<void> {
	const config = requireConfig();
	progress("Fetching workspaces...");

	const workspaces = await client.getWorkspaces(config.apiToken);

	if (useJson(opts)) {
		printJson(workspaces);
		return;
	}

	const rows: WorkspaceRow[] = workspaces.map((ws) => ({
		id: ws.id,
		name: ws.name,
		members: String(ws.members?.length ?? "—"),
	}));

	printTable(rows, columns);
}
