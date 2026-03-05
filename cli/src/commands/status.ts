/**
 * clickup status — Show current auth and config status
 */

import * as client from "../client.js";
import { getConfigPath, loadConfig } from "../config.js";
import { color, printError, printJson, printKeyValue, useJson } from "../output.js";

export async function runStatusCommand(opts: { json?: boolean }): Promise<void> {
	const config = loadConfig();

	if (!config) {
		if (useJson(opts)) {
			printJson({ authenticated: false });
		} else {
			printError("Not authenticated. Run `clickup init` to set up.");
		}
		return;
	}

	try {
		const res = await client.getUser(config.apiToken);
		const user = res.user;

		if (useJson(opts)) {
			printJson({
				authenticated: true,
				user: { id: user.id, username: user.username, email: user.email },
				teamId: config.teamId,
				teamName: config.teamName,
				configPath: getConfigPath(),
			});
		} else {
			console.log(color.bold("ClickUp CLI Status\n"));
			printKeyValue([
				["User", `${user.username} (${user.email})`],
				["User ID", String(user.id)],
				["Workspace", config.teamName ?? config.teamId],
				["Team ID", config.teamId],
				["Config", getConfigPath()],
			]);
		}
	} catch (err) {
		if (useJson(opts)) {
			printJson({ authenticated: false, error: (err as Error).message });
		} else {
			printError(`Token validation failed: ${(err as Error).message}`);
		}
	}
}
