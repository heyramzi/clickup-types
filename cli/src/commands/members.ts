/**
 * clickup members — List team members
 */

import * as client from "../client.js";
import { requireConfigWithTeam } from "../config.js";
import { type Column, printJson, printTable, progress, useJson } from "../output.js";

interface MemberRow {
	id: string;
	username: string;
	email: string;
	role: string;
}

const columns: Column<MemberRow>[] = [
	{ key: "id", label: "ID", maxWidth: 12 },
	{ key: "username", label: "Username", maxWidth: 24 },
	{ key: "email", label: "Email", maxWidth: 36 },
	{ key: "role", label: "Role", maxWidth: 10 },
];

export async function runMembersCommand(opts: { json?: boolean; team?: string }): Promise<void> {
	const config = requireConfigWithTeam();
	const teamId = opts.team || config.teamId;
	progress("Fetching members...");

	const members = await client.getTeamMembers(config.apiToken, teamId);

	if (useJson(opts)) {
		printJson(members);
		return;
	}

	const rows: MemberRow[] = members.map((m) => ({
		id: String(m.user.id),
		username: m.user.username,
		email: m.user.email,
		role: m.user.role_key ?? String(m.user.role),
	}));

	printTable(rows, columns);
}
