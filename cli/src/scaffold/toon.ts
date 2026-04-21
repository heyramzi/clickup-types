import type { ListOpts } from "./types.js";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function toonObject(data: Record<string, unknown>, fields?: string[]): string {
  const keys = fields ?? Object.keys(data);
  return keys.map((key) => `${key}: ${formatValue(data[key])}`).join("\n");
}

export function toonList(
  items: Record<string, unknown>[],
  fields: string[],
  opts: ListOpts = {},
): string {
  if (items.length === 0) {
    return "0 results";
  }

  const countLine =
    opts.totalCount !== undefined
      ? `count: ${items.length} of ${opts.totalCount} total`
      : `count: ${items.length}`;
  const resourceName = opts.resourceName ?? "items";
  const header = `${resourceName}[${items.length}]{${fields.join(",")}}:`;
  const rows = items.map(
    (item) => `  ${fields.map((field) => formatValue(item[field])).join(",")}`,
  );

  return [countLine, header, ...rows].join("\n");
}

export function toonError(message: string, details?: Record<string, unknown>[]): string {
  const lines = [`error: ${message}`];

  if (details && details.length > 0) {
    const fields = Object.keys(details[0]);
    lines.push(`details[${details.length}]{${fields.join(",")}}:`);
    for (const detail of details) {
      lines.push(`  ${fields.map((field) => formatValue(detail[field])).join(",")}`);
    }
  }

  return lines.join("\n");
}

export function toonEmpty(message?: string): string {
  return message ? `0 results: ${message}` : "0 results";
}
