/**
 * clickup folders — List folders in a space
 */

import * as client from "../client.js";
import { requireConfig } from "../config.js";
import { type Column, printError, printJson, printTable, progress, useJson } from "../output.js";

interface FolderRow {
	id: string;
	name: string;
	lists: string;
	hidden: string;
}

const columns: Column<FolderRow>[] = [
	{ key: "id", label: "ID", maxWidth: 12 },
	{ key: "name", label: "Name", maxWidth: 40 },
	{ key: "lists", label: "Lists", maxWidth: 8, align: "right" },
	{ key: "hidden", label: "Hidden", maxWidth: 8 },
];

export async function runFoldersCommand(opts: { json?: boolean; space: string }): Promise<void> {
	if (!opts.space) {
		printError("--space <id> is required. Use `clickup spaces` to find space IDs.");
		process.exit(1);
	}

	const config = requireConfig();
	progress("Fetching folders...");

	const folders = await client.getFolders(config.apiToken, opts.space);

	if (useJson(opts)) {
		printJson(folders);
		return;
	}

	const rows: FolderRow[] = folders.map((f) => ({
		id: f.id,
		name: f.name,
		lists: String(f.lists?.length ?? 0),
		hidden: f.hidden ? "Yes" : "No",
	}));

	printTable(rows, columns);
}
