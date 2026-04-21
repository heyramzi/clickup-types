/**
 * CLI Configuration
 *
 * Manages persistent config stored at ~/.config/clickup/config.json.
 * Supports multiple named API tokens with priority-ordered fallback.
 *
 * Token resolution order:
 *   1. CU_API_TOKEN env var (single-token override)
 *   2. Named tokens from config file, in priority order
 *
 * Environment variables CU_API_TOKEN and CU_TEAM_ID override file values.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { getEnvVarOptional } from "./scaffold/index.js";

// ── Types ────────────────────────────────────────────

/** A named API token with optional metadata */
export interface NamedToken {
  name: string;
  token: string;
  userName?: string;
}

export interface CliConfig {
  /** @deprecated Single token — kept for backward compat. First token wins. */
  apiToken: string;
  teamId: string;
  teamName?: string;
  userName?: string;
  /** Ordered list of named tokens. First = highest priority. */
  tokens?: NamedToken[];
}

// ── Paths ────────────────────────────────────────────

const CONFIG_DIR = join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "clickup");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

// ── Load ─────────────────────────────────────────────

/**
 * Load config from file, with environment variable overrides.
 */
export function loadConfig(): CliConfig | null {
  let fileConfig: Partial<CliConfig> = {};

  if (existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    } catch {
      // Corrupted config file — ignore
    }
  }

  const envToken = getEnvVarOptional("CU_API_TOKEN", "");
  const teamId = getEnvVarOptional("CU_TEAM_ID", fileConfig.teamId || "");

  // Build tokens list from config
  const tokens = fileConfig.tokens ?? [];

  // If env var set, it becomes the only token (override mode)
  if (envToken) {
    return {
      apiToken: envToken,
      teamId,
      teamName: fileConfig.teamName,
      userName: fileConfig.userName,
      tokens: [{ name: "env", token: envToken }],
    };
  }

  // If tokens array exists, use the first as the primary
  if (tokens.length > 0) {
    return {
      apiToken: tokens[0].token,
      teamId,
      teamName: fileConfig.teamName,
      userName: tokens[0].userName ?? fileConfig.userName,
      tokens,
    };
  }

  // Legacy: single apiToken field
  const apiToken = fileConfig.apiToken || "";
  if (!apiToken) return null;

  return {
    apiToken,
    teamId,
    teamName: fileConfig.teamName,
    userName: fileConfig.userName,
    tokens: [{ name: "default", token: apiToken, userName: fileConfig.userName }],
  };
}

// ── Require ──────────────────────────────────────────

/**
 * Require config or exit with a helpful message.
 */
export function requireConfig(): CliConfig {
  const config = loadConfig();
  if (!config) {
    process.stderr.write("Not authenticated. Run `clickup init` to set up your API token.\n");
    process.exit(1);
  }
  return config;
}

/**
 * Require config with a team ID or exit.
 */
export function requireConfigWithTeam(): CliConfig & { teamId: string } {
  const config = requireConfig();
  if (!config.teamId) {
    process.stderr.write("No workspace selected. Run `clickup init` to select a workspace.\n");
    process.exit(1);
  }
  return config as CliConfig & { teamId: string };
}

// ── Token helpers ────────────────────────────────────

/**
 * Get all tokens in priority order.
 */
export function getTokens(config: CliConfig): NamedToken[] {
  return config.tokens ?? [{ name: "default", token: config.apiToken }];
}

// ── Save ─────────────────────────────────────────────

/**
 * Save config to disk with restrictive permissions.
 */
export function saveConfig(config: CliConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
}

/**
 * Get the config file path (for display purposes).
 */
export function getConfigPath(): string {
  return CONFIG_FILE;
}
