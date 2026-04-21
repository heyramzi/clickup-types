import type { CLIConfig, Command } from "./types.js";

export function resolveCommand(
  config: CLIConfig,
  argv: string[],
): { name: string; command: Command; consumedTokens: number } | undefined {
  const tokens = argv.slice(2).filter((token) => !token.startsWith("--"));
  if (tokens.length === 0) {
    return undefined;
  }

  const maxDepth = Math.max(
    0,
    ...Object.keys(config.commands).map((name) => name.split(" ").length),
  );
  for (let count = Math.min(maxDepth, tokens.length); count > 0; count -= 1) {
    const candidate = tokens.slice(0, count).join(" ");
    const command = config.commands[candidate];
    if (command) {
      return { name: candidate, command, consumedTokens: count };
    }
  }

  return undefined;
}

export function generateHelp(config: CLIConfig): string {
  const lines = [`bin: ${config.bin}`, `description: ${config.description}`, ""];
  const commandNames = Object.keys(config.commands);
  const width = commandNames.length > 0 ? Math.max(...commandNames.map((name) => name.length)) : 0;

  lines.push("commands:");
  for (const name of commandNames) {
    lines.push(`  ${name.padEnd(width + 2)}${config.commands[name].description}`);
  }

  if (config.env && Object.keys(config.env).length > 0) {
    lines.push("", "env:");
    for (const [name, def] of Object.entries(config.env)) {
      const required = def.required ? " required" : " optional";
      const description = def.description ? ` -- ${def.description}` : "";
      lines.push(`  ${name}${required}${description}`);
    }
  }

  lines.push("", `help: Run \`${config.bin} <command> --help\` for command details`);
  return lines.join("\n");
}

export function generateCommandHelp(config: CLIConfig, name: string, command: Command): string {
  const lines = [`bin: ${config.bin} ${name}`, `description: ${command.description}`];

  if (command.args && Object.keys(command.args).length > 0) {
    lines.push("", "args:");
    const argEntries = Object.entries(command.args).sort(
      ([, left], [, right]) => left.position - right.position,
    );
    for (const [argName, def] of argEntries) {
      const required = def.required ? " required" : " optional";
      const description = def.description ? ` -- ${def.description}` : "";
      lines.push(`  <${argName}>${required}${description}`);
    }
  }

  if (command.flags && Object.keys(command.flags).length > 0) {
    lines.push("", "flags:");
    for (const [flagName, def] of Object.entries(command.flags)) {
      const defaultValue = def.default !== undefined ? ` (default: ${String(def.default)})` : "";
      const description = def.description ? ` -- ${def.description}` : "";
      lines.push(`  --${flagName}${defaultValue}${description}`);
    }
  }

  return lines.join("\n");
}
