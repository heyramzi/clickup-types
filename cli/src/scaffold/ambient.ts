import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { CLIConfig } from "./types.js";

type HookEntry = {
  matcher: string;
  hooks: Array<{ type: string; command: string }>;
};

type ClaudeSettings = {
  hooks?: {
    SessionStart?: HookEntry[];
  };
};

function getSettingsPath(cwd = process.cwd()): string {
  return resolve(cwd, ".claude", "settings.json");
}

function getHookCommand(config: CLIConfig, cwd = process.cwd()): string {
  return `cd ${cwd} && ${config.bin} --ambient`;
}

function readSettings(settingsPath: string): ClaudeSettings {
  try {
    return JSON.parse(readFileSync(settingsPath, "utf8")) as ClaudeSettings;
  } catch {
    return {};
  }
}

function writeSettings(settingsPath: string, settings: ClaudeSettings): void {
  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
}

export function installHook(config: CLIConfig): string {
  const settingsPath = getSettingsPath();
  const settings = readSettings(settingsPath);
  const hookCommand = getHookCommand(config);
  const sessionStart = settings.hooks?.SessionStart ?? [];

  const alreadyInstalled = sessionStart.some((entry) =>
    entry.hooks.some((hook) => hook.command === hookCommand),
  );
  if (alreadyInstalled) {
    return `Hook for ${config.name} already installed`;
  }

  const nextEntry: HookEntry = {
    matcher: "",
    hooks: [{ type: "command", command: hookCommand }],
  };

  settings.hooks = {
    ...settings.hooks,
    SessionStart: [...sessionStart, nextEntry],
  };
  writeSettings(settingsPath, settings);

  return `Installed SessionStart hook for ${config.name}`;
}

export function uninstallHook(config: CLIConfig): string {
  const settingsPath = getSettingsPath();
  const settings = readSettings(settingsPath);
  const hookCommand = getHookCommand(config);
  const sessionStart = settings.hooks?.SessionStart ?? [];
  const nextSessionStart = sessionStart.filter(
    (entry) => !entry.hooks.some((hook) => hook.command === hookCommand),
  );

  if (nextSessionStart.length === sessionStart.length) {
    return `No hook installed for ${config.name}`;
  }

  settings.hooks = {
    ...settings.hooks,
    SessionStart: nextSessionStart,
  };
  writeSettings(settingsPath, settings);

  return `Removed SessionStart hook for ${config.name}`;
}

export function formatAmbient(config: CLIConfig, output: string): string {
  const trimmed = output.trim();
  if (!trimmed) {
    return `[${config.name}] no data`;
  }

  const lines = trimmed.split("\n");
  const countLine = lines.find((line) => line.startsWith("count:") || line.startsWith("0 results"));
  const rows = lines
    .filter((line) => line.startsWith("  "))
    .map((line) => line.trim())
    .slice(0, 3);
  const body = rows.length > 0 ? rows.join(" | ") : trimmed.replace(/\n+/g, " | ");

  if (!countLine || body.startsWith(countLine)) {
    return `[${config.name}] ${body}`;
  }

  return `[${config.name}] ${countLine} | ${body}`;
}
