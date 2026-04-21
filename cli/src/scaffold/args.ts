import type { ArgDef, FlagDef } from "./types.js";

export type ParsedArgs = {
  command: string | undefined;
  args: Record<string, string>;
  flags: Record<string, unknown>;
};

function parseFlagToken(token: string): { name: string; value?: string } {
  const eqIndex = token.indexOf("=");
  if (eqIndex === -1) {
    return { name: token.slice(2) };
  }

  return {
    name: token.slice(2, eqIndex),
    value: token.slice(eqIndex + 1),
  };
}

function coerceFlagValue(rawValue: unknown, type: FlagDef["type"]): unknown {
  if (type === "boolean") {
    if (rawValue === undefined) return true;
    if (typeof rawValue === "boolean") return rawValue;
    return rawValue === "true";
  }

  if (type === "number") {
    return Number(rawValue);
  }

  return rawValue;
}

export function parseArgs(
  argv: string[],
  argDefs: Record<string, ArgDef>,
  flagDefs: Record<string, FlagDef>,
): ParsedArgs {
  const tokens = argv.slice(2);
  const command = tokens[0] && !tokens[0].startsWith("--") ? tokens[0] : undefined;
  const rest = command ? tokens.slice(1) : tokens;

  const rawFlags: Record<string, unknown> = {};
  const positionals: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const { name, value } = parseFlagToken(token);
    const def = flagDefs[name];

    if (value !== undefined) {
      rawFlags[name] = value;
      continue;
    }

    if (def?.type && def.type !== "boolean") {
      const nextToken = rest[index + 1];
      if (nextToken && !nextToken.startsWith("--")) {
        rawFlags[name] = nextToken;
        index += 1;
        continue;
      }
    }

    rawFlags[name] = true;
  }

  const flags: Record<string, unknown> = {};
  for (const [name, def] of Object.entries(flagDefs)) {
    if (rawFlags[name] !== undefined) {
      flags[name] = coerceFlagValue(rawFlags[name], def.type);
      continue;
    }

    if (def.type === "boolean") {
      flags[name] = false;
      continue;
    }

    if (def.default !== undefined) {
      flags[name] = def.default;
    }
  }

  const args: Record<string, string> = {};
  const sortedArgDefs = Object.entries(argDefs).sort(
    ([, left], [, right]) => left.position - right.position,
  );

  for (const [name, def] of sortedArgDefs) {
    const value = positionals[def.position];
    if (value !== undefined) {
      args[name] = value;
      continue;
    }

    if (def.required) {
      throw new Error(`Missing required argument: <${name}>`);
    }
  }

  return { command, args, flags };
}

export function hasGlobalFlag(argv: string[], name: string): boolean {
  return argv.includes(`--${name}`) || argv.includes(`-${name}`);
}
