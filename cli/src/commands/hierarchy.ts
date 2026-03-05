/**
 * clickup hierarchy — Show full workspace hierarchy tree
 */

import * as client from "../client.js";
import { requireConfigWithTeam } from "../config.js";
import { color, printJson, progress, useJson } from "../output.js";
import type { ClickUpFolder, ClickUpList } from "../../../types/clickup-hierarchy-types.js";

export async function runHierarchyCommand(opts: { json?: boolean; team?: string }): Promise<void> {
	const config = requireConfigWithTeam();
	const teamId = opts.team || config.teamId;
	progress("Fetching full hierarchy...");

	const spaces = await client.getSpaces(config.apiToken, teamId);

	// Fetch folders and folderless lists for each space in parallel
	const hierarchy = await Promise.all(
		spaces.map(async (space) => {
			const [folders, folderlessLists] = await Promise.all([
				client.getFolders(config.apiToken, space.id),
				client.getFolderlessLists(config.apiToken, space.id),
			]);
			return { ...space, folders, folderlessLists };
		}),
	);

	if (useJson(opts)) {
		printJson(hierarchy);
		return;
	}

	for (const space of hierarchy) {
		console.log(color.bold(`\n${space.name}`) + color.dim(` (${space.id})`));

		for (const folder of space.folders) {
			console.log(`  ${color.cyan("▸")} ${folder.name} ${color.dim(`(${folder.id})`)}`);
			for (const list of folder.lists ?? []) {
				console.log(`    ${color.dim("─")} ${list.name} ${color.dim(`(${list.id})`)} ${color.dim(`[${list.task_count} tasks]`)}`);
			}
		}

		if (space.folderlessLists.length > 0) {
			for (const list of space.folderlessLists) {
				console.log(`  ${color.dim("─")} ${list.name} ${color.dim(`(${list.id})`)} ${color.dim(`[${list.task_count} tasks]`)}`);
			}
		}
	}

	console.log("");
}
