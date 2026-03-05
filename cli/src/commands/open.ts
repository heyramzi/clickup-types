/**
 * clickup open — Open a task in the browser
 */

import { exec } from "node:child_process";
import { platform } from "node:os";
import * as client from "../client.js";
import { requireConfig } from "../config.js";
import { color, printError, printSuccess, progress } from "../output.js";

function openUrl(url: string): void {
	const os = platform();
	const cmd = os === "darwin" ? "open" : os === "win32" ? "start" : "xdg-open";
	exec(`${cmd} ${url}`);
}

export async function runOpenCommand(taskId: string): Promise<void> {
	const config = requireConfig();
	progress("Fetching task URL...");

	try {
		const task = await client.getTask(config.apiToken, taskId);
		if (task.url) {
			openUrl(task.url);
			printSuccess(`Opened ${color.dim(task.url)}`);
		} else {
			printError("Task has no URL.");
		}
	} catch (err) {
		printError((err as Error).message);
		process.exit(1);
	}
}
