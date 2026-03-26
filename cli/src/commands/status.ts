/**
 * clickup status — Show current auth and config status
 *
 * Validates all configured tokens and shows their priority order.
 */

import * as client from "../client.js";
import { getConfigPath, getTokens, loadConfig } from "../config.js";
import { color, printError, printJson, printKeyValue, printTable, useJson } from "../output.js";

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

  const tokens = getTokens(config);
  const tokenResults: Array<{
    name: string;
    priority: number;
    valid: boolean;
    userName?: string;
    email?: string;
    error?: string;
  }> = [];

  // Validate each token
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    try {
      const res = await client.getUser(t.token);
      tokenResults.push({
        name: t.name,
        priority: i + 1,
        valid: true,
        userName: res.user.username,
        email: res.user.email,
      });
    } catch (err) {
      tokenResults.push({
        name: t.name,
        priority: i + 1,
        valid: false,
        error: (err as Error).message,
      });
    }
  }

  if (useJson(opts)) {
    printJson({
      authenticated: tokenResults.some((t) => t.valid),
      teamId: config.teamId,
      teamName: config.teamName,
      configPath: getConfigPath(),
      tokens: tokenResults,
    });
    return;
  }

  console.log(color.bold("ClickUp CLI Status\n"));
  printKeyValue([
    ["Workspace", config.teamName ?? config.teamId],
    ["Team ID", config.teamId],
    ["Config", getConfigPath()],
  ]);

  console.log(`\n${color.bold("Tokens")} (priority order):\n`);
  printTable(tokenResults, [
    { key: "priority", label: "#", align: "right" },
    { key: "name", label: "Name" },
    {
      key: (t) => (t.valid ? color.green("✓") : color.red("✗")),
      label: "",
    },
    {
      key: (t) => (t.valid ? `${t.userName} (${t.email})` : color.red(t.error ?? "invalid")),
      label: "User",
      maxWidth: 50,
    },
  ]);
}
