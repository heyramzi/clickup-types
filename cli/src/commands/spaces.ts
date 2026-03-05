/**
 * clickup spaces — List spaces in a workspace
 */

import * as client from "../client.js";
import { requireConfigWithTeam } from "../config.js";
import { type Column, printJson, printTable, progress, useJson } from "../output.js";

interface SpaceRow {
	id: string;
	name: string;
	private: string;
}

const columns: Column<SpaceRow>[] = [
	{ key: "id", label: "ID", maxWidth: 12 },
	{ key: "name", label: "Name", maxWidth: 40 },
	{ key: "private", label: "Private", maxWidth: 8 },
];

export async function runSpacesCommand(opts: { json?: boolean; team?: string }): Promise<void> {
	const config = requireConfigWithTeam();
	const teamId = opts.team || config.teamId;
	progress("Fetching spaces...");

	const spaces = await client.getSpaces(config.apiToken, teamId);

	if (useJson(opts)) {
		printJson(spaces);
		return;
	}

	const rows: SpaceRow[] = spaces.map((s) => ({
		id: s.id,
		name: s.name,
		private: s.private ? "Yes" : "No",
	}));

	printTable(rows, columns);
}
