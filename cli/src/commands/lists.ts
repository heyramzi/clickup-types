/**
 * clickup lists — List lists in a space or folder
 */

import * as client from "../client.js";
import { requireConfig } from "../config.js";
import { type Column, printError, printJson, printTable, progress, useJson } from "../output.js";

interface ListRow {
	id: string;
	name: string;
	tasks: string;
	status: string;
	folder: string;
}

const columns: Column<ListRow>[] = [
	{ key: "id", label: "ID", maxWidth: 12 },
	{ key: "name", label: "Name", maxWidth: 40 },
	{ key: "tasks", label: "Tasks", maxWidth: 8, align: "right" },
	{ key: "folder", label: "Folder", maxWidth: 20 },
	{ key: "status", label: "Status", maxWidth: 12 },
];

export async function runListsCommand(opts: {
	json?: boolean;
	space?: string;
	folder?: string;
}): Promise<void> {
	if (!opts.space && !opts.folder) {
		printError("Provide --space <id> or --folder <id>. Use `clickup spaces` or `clickup folders` to find IDs.");
		process.exit(1);
	}

	const config = requireConfig();
	progress("Fetching lists...");

	let lists;
	if (opts.folder) {
		lists = await client.getListsInFolder(config.apiToken, opts.folder);
	} else {
		// Get both folderless lists and lists inside folders
		const [folderless, folders] = await Promise.all([
			client.getFolderlessLists(config.apiToken, opts.space!),
			client.getFolders(config.apiToken, opts.space!),
		]);
		const folderLists = folders.flatMap((f) => f.lists ?? []);
		lists = [...folderless, ...folderLists];
	}

	if (useJson(opts)) {
		printJson(lists);
		return;
	}

	const rows: ListRow[] = lists.map((l) => ({
		id: l.id,
		name: l.name,
		tasks: String(l.task_count ?? "—"),
		folder: l.folder?.name ?? "—",
		status: l.status?.status ?? "—",
	}));

	printTable(rows, columns);
}
