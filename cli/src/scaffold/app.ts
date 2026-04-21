import { installHook, uninstallHook, formatAmbient } from "./ambient.js";
import { hasGlobalFlag, parseArgs } from "./args.js";
import { createContext } from "./context.js";
import { loadEnvFile, validateEnv } from "./env.js";
import { generateCommandHelp, generateHelp, resolveCommand } from "./router.js";
import type { CLIConfig, OutputMode } from "./types.js";

function determineMode(argv: string[]): OutputMode {
  if (hasGlobalFlag(argv, "json")) return "json";
  if (hasGlobalFlag(argv, "human")) return "human";
  return "toon";
}

function writeHelp(suggestions: string[], config: CLIConfig): void {
  if (suggestions.length === 0) {
    return;
  }

  const uniqueSuggestions = [...new Set(suggestions)];
  process.stdout.write(`help[${uniqueSuggestions.length}]:\n`);
  for (const suggestion of uniqueSuggestions) {
    process.stdout.write(`  Run \`${config.bin} ${suggestion}\`\n`);
  }
}

function buildCommandArgv(argv: string[], consumedTokens: number): string[] {
  const leading = argv.slice(0, 2);
  const tokens = argv.slice(2);
  const commandTokens: string[] = [];
  const otherTokens: string[] = [];

  for (const token of tokens) {
    if (!token.startsWith("--") && commandTokens.length < consumedTokens) {
      commandTokens.push(token);
      continue;
    }

    otherTokens.push(token);
  }

  return [...leading, commandTokens.join(" "), ...otherTokens];
}

function buildDefaultCommandArgv(argv: string[], commandName: string): string[] {
  return [...argv.slice(0, 2), commandName, ...argv.slice(2)];
}

async function runAmbient(config: CLIConfig): Promise<void> {
  if (!config.home) {
    process.stdout.write(`[${config.name}] no home view configured\n`);
    return;
  }

  const chunks: string[] = [];
  const ctx = createContext("toon", false, (text) => chunks.push(text));
  await config.home(ctx);
  process.stdout.write(`${formatAmbient(config, chunks.join(""))}\n`);
}

export function createCLI(config: CLIConfig): Promise<void> {
  return runCLI(config);
}

async function runCLI(config: CLIConfig): Promise<void> {
  loadEnvFile();

  const argv = process.argv;
  const mode = determineMode(argv);
  const isHelp = hasGlobalFlag(argv, "help") || hasGlobalFlag(argv, "h");
  const isAmbient = hasGlobalFlag(argv, "ambient");
  const isFull = hasGlobalFlag(argv, "full");
  const topLevelCommand = argv.slice(2).find((token) => !token.startsWith("--"));

  if (topLevelCommand === "install") {
    process.stdout.write(`${installHook(config)}\n`);
    return;
  }

  if (topLevelCommand === "uninstall") {
    process.stdout.write(`${uninstallHook(config)}\n`);
    return;
  }

  const ctx = createContext(mode, isFull, (text) => process.stdout.write(text));

  try {
    if (isAmbient) {
      if (config.env) {
        validateEnv(config.env);
      }
      await runAmbient(config);
      return;
    }

    let effectiveArgv = argv;
    let resolved = resolveCommand(config, effectiveArgv);
    if (!resolved && config.defaultCommand && !isHelp) {
      effectiveArgv = buildDefaultCommandArgv(argv, config.defaultCommand);
      resolved = resolveCommand(config, effectiveArgv);
    }

    if (!resolved) {
      if (!config.home || isHelp) {
        process.stdout.write(`${generateHelp(config)}\n`);
        return;
      }

      if (config.env) {
        validateEnv(config.env);
      }

      await config.home(ctx);
      if (!ctx.hadOutput) {
        ctx.empty("No output");
      }
      writeHelp([...ctx.pendingNext, ...ctx.sdkSuggestions], config);
      return;
    }

    if (isHelp) {
      process.stdout.write(`${generateCommandHelp(config, resolved.name, resolved.command)}\n`);
      return;
    }

    if (config.env) {
      validateEnv(config.env);
    }

    const parsed = parseArgs(
      buildCommandArgv(effectiveArgv, resolved.consumedTokens),
      resolved.command.args ?? {},
      resolved.command.flags ?? {},
    );

    await resolved.command.run({ args: parsed.args, flags: parsed.flags, ctx });

    if (!ctx.hadOutput) {
      ctx.empty("No output");
    }

    const commandSuggestions =
      resolved.command.next?.({
        args: parsed.args,
        flags: parsed.flags,
      }) ?? [];

    writeHelp([...ctx.pendingNext, ...ctx.sdkSuggestions, ...commandSuggestions], config);
  } catch (error) {
    ctx.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
