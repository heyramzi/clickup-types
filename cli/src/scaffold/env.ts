import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { EnvVar } from "./types.js";

export function loadEnvFile(cwd = process.cwd()): void {
  let dir = cwd;

  while (true) {
    const envPath = resolve(dir, ".env");
    if (existsSync(envPath)) {
      const file = readFileSync(envPath, "utf8");
      for (const line of file.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
          continue;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
          continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (!(key in process.env)) {
          process.env[key] = value;
        }
      }
      return;
    }

    const parent = dirname(dir);
    if (parent === dir) {
      return;
    }
    dir = parent;
  }
}

function missingEnvError(name: string, description?: string): Error {
  const suffix = description ? ` (${description})` : "";
  return new Error(
    `Environment variable ${name}${suffix} is required but not set.\n` +
      "Check that your .env file contains this variable.",
  );
}

export function validateEnv(envDefs: Record<string, EnvVar>): void {
  for (const [name, def] of Object.entries(envDefs)) {
    if (!process.env[name] && def.default !== undefined) {
      process.env[name] = def.default;
    }

    if (def.required && !process.env[name]) {
      throw missingEnvError(name, def.description);
    }
  }
}

export function getEnvVar(name: string, description?: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }

  throw missingEnvError(name, description);
}

export function getEnvVarOptional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}
