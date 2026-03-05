/**
 * clickup init — Interactive setup wizard
 *
 * Prompts for API token, validates it, selects a workspace, and saves config.
 */

import * as readline from "node:readline";
import * as client from "../client.js";
import { getConfigPath, loadConfig, saveConfig } from "../config.js";
import { color, printError, printSuccess } from "../output.js";

function prompt(question: string, options?: { hidden?: boolean }): Promise<string> {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stderr,
		});

		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

export async function runInitCommand(): Promise<void> {
	const existing = loadConfig();

	if (existing) {
		console.log(color.dim(`Existing config found at ${getConfigPath()}`));
		const overwrite = await prompt("Overwrite? (y/N): ");
		if (overwrite.toLowerCase() !== "y") {
			console.log("Aborted.");
			return;
		}
	}

	console.log(color.bold("\nClickUp CLI Setup\n"));
	console.log("You need a personal API token from ClickUp.");
	console.log(color.dim("Get one at: https://app.clickup.com/settings/apps\n"));

	const token = await prompt("API Token (pk_...): ");

	if (!token) {
		printError("No token provided.");
		process.exit(1);
	}

	// Validate token
	process.stderr.write(color.dim("Validating token...\n"));

	let user: { id: number; username: string; email: string };
	try {
		const res = await client.getUser(token);
		user = res.user;
	} catch (err) {
		printError(`Invalid token: ${(err as Error).message}`);
		process.exit(1);
	}

	printSuccess(`Authenticated as ${color.bold(user.username)} (${user.email})`);

	// Select workspace
	const workspaces = await client.getWorkspaces(token);

	if (workspaces.length === 0) {
		printError("No workspaces found for this account.");
		process.exit(1);
	}

	let selectedWorkspace = workspaces[0];

	if (workspaces.length > 1) {
		console.log(color.bold("\nAvailable Workspaces:"));
		workspaces.forEach((ws, i) => {
			console.log(`  ${color.cyan(String(i + 1))}. ${ws.name} ${color.dim(`(${ws.id})`)}`);
		});

		const choice = await prompt(`\nSelect workspace (1-${workspaces.length}): `);
		const idx = parseInt(choice, 10) - 1;
		if (idx >= 0 && idx < workspaces.length) {
			selectedWorkspace = workspaces[idx];
		}
	}

	saveConfig({
		apiToken: token,
		teamId: selectedWorkspace.id,
		teamName: selectedWorkspace.name,
		userName: user.username,
	});

	console.log("");
	printSuccess(`Config saved to ${color.dim(getConfigPath())}`);
	printSuccess(`Workspace: ${color.bold(selectedWorkspace.name)}`);
	console.log(color.dim("\nYou're all set! Try `clickup workspaces` or `clickup tasks --list <id>`."));
}
