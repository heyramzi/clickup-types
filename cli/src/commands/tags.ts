/**
 * clickup tags — List tags in a space
 */

import * as client from "../client.js";
import { requireConfig } from "../config.js";
import { type Column, printError, printJson, printTable, progress, useJson } from "../output.js";

interface TagRow {
	name: string;
	foreground: string;
	background: string;
}

const columns: Column<TagRow>[] = [
	{ key: "name", label: "Name", maxWidth: 30 },
	{ key: "foreground", label: "FG Color", maxWidth: 10 },
	{ key: "background", label: "BG Color", maxWidth: 10 },
];

export async function runTagsCommand(opts: { json?: boolean; space: string }): Promise<void> {
	if (!opts.space) {
		printError("--space <id> is required.");
		process.exit(1);
	}

	const config = requireConfig();
	progress("Fetching tags...");

	const tags = await client.getSpaceTags(config.apiToken, opts.space);

	if (useJson(opts)) {
		printJson(tags);
		return;
	}

	const rows: TagRow[] = tags.map((t) => ({
		name: t.name,
		foreground: t.tag_fg,
		background: t.tag_bg,
	}));

	printTable(rows, columns);
}
