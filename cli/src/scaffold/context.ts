import type { CommandContext, ListOpts, OutputMode } from "./types.js";
import { toonEmpty, toonError, toonList, toonObject } from "./toon.js";
import { truncateFields, truncateList } from "./truncate.js";

export type InternalContext = CommandContext & {
  hadOutput: boolean;
  pendingNext: string[];
  sdkSuggestions: string[];
};

function selectFields(data: Record<string, unknown>, fields?: string[]): Record<string, unknown> {
  if (!fields) {
    return data;
  }

  return Object.fromEntries(fields.map((field) => [field, data[field]]));
}

function toHumanList(
  items: Record<string, unknown>[],
  fields: string[],
  resourceName: string,
): string {
  if (items.length === 0) {
    return "0 results";
  }

  const matrix = items.map((item) => fields.map((field) => String(item[field] ?? "")));
  const widths = fields.map((field, fi) =>
    Math.max(field.length, ...matrix.map((row) => row[fi].length)),
  );
  const header = fields.map((field, index) => field.padEnd(widths[index])).join("  ");
  const divider = widths.map((width) => "-".repeat(width)).join("  ");
  const rows = matrix.map((row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  "));

  return [`${resourceName} (${items.length})`, header, divider, ...rows].join("\n");
}

export function createContext(
  mode: OutputMode,
  fullOutput: boolean,
  writeStdout: (text: string) => void,
  writeStderr: (text: string) => void = (text) => process.stderr.write(text),
): InternalContext {
  let hadOutput = false;
  const pendingNext: string[] = [];
  const sdkSuggestions: string[] = [];

  const markOutput = () => {
    hadOutput = true;
  };

  return {
    get hadOutput() {
      return hadOutput;
    },
    pendingNext,
    sdkSuggestions,

    output(data: Record<string, unknown>, fields?: string[]) {
      markOutput();
      let item = selectFields(data, fields);

      if (!fullOutput) {
        const result = truncateFields(item);
        item = result.item;
        if (result.truncatedFields.length > 0) {
          sdkSuggestions.push("--full");
        }
      }

      if (mode === "json") {
        writeStdout(`${JSON.stringify(item)}\n`);
        return;
      }

      if (mode === "human") {
        writeStdout(
          `${Object.entries(item)
            .map(([key, value]) => `${key}: ${value ?? ""}`)
            .join("\n")}\n`,
        );
        return;
      }

      writeStdout(`${toonObject(item, fields)}\n`);
    },

    list(items: Record<string, unknown>[], fields?: string[], opts?: ListOpts) {
      markOutput();

      const resolvedFields = fields ?? (items[0] ? Object.keys(items[0]) : []);
      let nextItems = items;

      if (!fullOutput) {
        const result = truncateList(items, opts?.truncate);
        nextItems = result.items;
        if (result.truncatedFields.length > 0) {
          sdkSuggestions.push("--full");
        }
      }

      if (mode === "json") {
        writeStdout(
          `${JSON.stringify({
            count: nextItems.length,
            totalCount: opts?.totalCount,
            items: nextItems.map((item) => selectFields(item, resolvedFields)),
          })}\n`,
        );
        return;
      }

      if (mode === "human") {
        writeStdout(`${toHumanList(nextItems, resolvedFields, opts?.resourceName ?? "items")}\n`);
        return;
      }

      writeStdout(
        `${toonList(
          nextItems.map((item) => selectFields(item, resolvedFields)),
          resolvedFields,
          opts,
        )}\n`,
      );
    },

    empty(message: string) {
      markOutput();
      if (mode === "json") {
        writeStdout(`${JSON.stringify({ count: 0, message })}\n`);
        return;
      }

      writeStdout(`${toonEmpty(message)}\n`);
    },

    error(message: string, details?: Record<string, unknown>[]) {
      markOutput();
      if (mode === "json") {
        writeStdout(`${JSON.stringify({ error: message, details })}\n`);
        return;
      }

      writeStdout(`${toonError(message, details)}\n`);
    },

    status(message: string) {
      if (process.stderr.isTTY) {
        writeStderr(`${message}\n`);
      }
    },

    next(suggestions: string[]) {
      pendingNext.push(...suggestions);
    },

    raw(text: string) {
      markOutput();
      writeStdout(text);
    },
  };
}
