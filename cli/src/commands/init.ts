/**
 * clickup init — Interactive setup wizard
 *
 * Prompts for one or more named API tokens, validates them,
 * selects a workspace, and saves config with priority ordering.
 */

import * as readline from "node:readline";
import * as client from "../client.js";
import type { NamedToken } from "../config.js";
import { getConfigPath, loadConfig, saveConfig } from "../config.js";
import { color, printError, printSuccess } from "../output.js";

function prompt(question: string): Promise<string> {
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
    const tokenCount = existing.tokens?.length ?? 1;
    console.log(color.dim(`  ${tokenCount} token(s) configured`));
    const overwrite = await prompt("Overwrite? (y/N): ");
    if (overwrite.toLowerCase() !== "y") {
      console.log("Aborted.");
      return;
    }
  }

  console.log(color.bold("\nClickUp CLI Setup\n"));
  console.log("Add one or more API tokens in priority order.");
  console.log("The first token will be used by default; others are fallbacks.");
  console.log(color.dim("Get tokens at: https://app.clickup.com/settings/apps\n"));

  const tokens: NamedToken[] = [];
  let addMore = true;

  while (addMore) {
    const ordinal = tokens.length === 0 ? "Primary" : `Fallback #${tokens.length}`;
    const name = await prompt(`${ordinal} token name (e.g. "upsys-team", "ramzi"): `);
    if (!name) {
      if (tokens.length === 0) {
        printError("At least one token is required.");
        continue;
      }
      break;
    }

    const token = await prompt(`API Token for "${name}" (pk_...): `);
    if (!token) {
      printError("No token provided, skipping.");
      continue;
    }

    // Validate
    process.stderr.write(color.dim("Validating...\n"));
    try {
      const res = await client.getUser(token);
      const user = res.user;
      printSuccess(`${name}: ${color.bold(user.username)} (${user.email})`);
      tokens.push({ name, token, userName: user.username });
    } catch (err) {
      printError(`Invalid token: ${(err as Error).message}`);
      continue;
    }

    const more = await prompt("Add another token? (y/N): ");
    addMore = more.toLowerCase() === "y";
  }

  if (tokens.length === 0) {
    printError("No valid tokens provided.");
    process.exit(1);
  }

  // Select workspace using primary token
  const workspaces = await client.getWorkspaces(tokens[0].token);

  if (workspaces.length === 0) {
    printError("No workspaces found for the primary token.");
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
    apiToken: tokens[0].token,
    teamId: selectedWorkspace.id,
    teamName: selectedWorkspace.name,
    userName: tokens[0].userName,
    tokens,
  });

  console.log("");
  printSuccess(`Config saved to ${color.dim(getConfigPath())}`);
  printSuccess(`Workspace: ${color.bold(selectedWorkspace.name)}`);
  console.log(color.dim(`\nTokens (priority order): ${tokens.map((t) => t.name).join(" → ")}`));
  console.log(color.dim("Try `clickup status` or `clickup docs list`."));
}
