/**
 * clickup comments — List or add comments on a task
 */

import * as client from "../client.js";
import { requireConfig } from "../config.js";
import { color, printError, printJson, printSuccess, progress, useJson } from "../output.js";

// ── List comments ─────────────────────────────────────

export async function runCommentsListCommand(taskId: string, opts: { json?: boolean }): Promise<void> {
	const config = requireConfig();
	progress("Fetching comments...");

	const comments = await client.getTaskComments(config.apiToken, taskId);

	if (useJson(opts)) {
		printJson(comments);
		return;
	}

	if (comments.length === 0) {
		console.log(color.dim("  No comments on this task."));
		return;
	}

	for (const c of comments) {
		const date = new Date(parseInt(c.date, 10)).toLocaleString();
		console.log(`${color.bold(c.user.username)} ${color.dim(date)}`);
		console.log(`  ${c.comment_text}`);
		if (c.resolved) console.log(color.green("  [Resolved]"));
		console.log("");
	}
}

// ── Add comment ───────────────────────────────────────

export async function runCommentAddCommand(
	taskId: string,
	opts: { json?: boolean; text: string; notify?: boolean },
): Promise<void> {
	if (!opts.text) {
		printError("--text is required.");
		process.exit(1);
	}

	const config = requireConfig();
	progress("Adding comment...");

	const result = await client.addTaskComment(config.apiToken, taskId, opts.text, opts.notify);

	if (useJson(opts)) {
		printJson(result);
		return;
	}

	printSuccess(`Comment added to task ${taskId}.`);
}
