/**
 * CLI Configuration
 *
 * Manages persistent config stored at ~/.config/clickup/config.json.
 * Environment variables CU_API_TOKEN and CU_TEAM_ID override file values.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CliConfig {
	apiToken: string;
	teamId: string;
	teamName?: string;
	userName?: string;
}

const CONFIG_DIR = join(
	process.env.XDG_CONFIG_HOME || join(homedir(), ".config"),
	"clickup",
);
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

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

	const apiToken = process.env.CU_API_TOKEN || fileConfig.apiToken || "";
	const teamId = process.env.CU_TEAM_ID || fileConfig.teamId || "";

	if (!apiToken) return null;

	return {
		apiToken,
		teamId,
		teamName: fileConfig.teamName,
		userName: fileConfig.userName,
	};
}

/**
 * Require config or exit with a helpful message.
 */
export function requireConfig(): CliConfig {
	const config = loadConfig();
	if (!config) {
		process.stderr.write(
			"Not authenticated. Run `clickup init` to set up your API token.\n",
		);
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
		process.stderr.write(
			"No workspace selected. Run `clickup init` to select a workspace.\n",
		);
		process.exit(1);
	}
	return config as CliConfig & { teamId: string };
}

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
