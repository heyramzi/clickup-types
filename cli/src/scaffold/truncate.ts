const DEFAULT_LIMIT = 200;

export type TruncateResult = {
  item: Record<string, unknown>;
  truncatedFields: string[];
};

export function truncateFields(
  item: Record<string, unknown>,
  limits: Record<string, number> = {},
): TruncateResult {
  const nextItem: Record<string, unknown> = {};
  const truncatedFields: string[] = [];

  for (const [key, value] of Object.entries(item)) {
    if (typeof value !== "string") {
      nextItem[key] = value;
      continue;
    }

    const limit = limits[key] ?? DEFAULT_LIMIT;
    if (value.length <= limit) {
      nextItem[key] = value;
      continue;
    }

    truncatedFields.push(key);
    nextItem[key] =
      `${value.slice(0, limit)}... ` +
      `(truncated, ${value.length} chars -- use --full to see complete ${key})`;
  }

  return { item: nextItem, truncatedFields };
}

export function truncateList(
  items: Record<string, unknown>[],
  limits: Record<string, number> = {},
): { items: Record<string, unknown>[]; truncatedFields: string[] } {
  const truncatedFields = new Set<string>();
  const nextItems = items.map((item) => {
    const result = truncateFields(item, limits);
    for (const field of result.truncatedFields) {
      truncatedFields.add(field);
    }
    return result.item;
  });

  return {
    items: nextItems,
    truncatedFields: [...truncatedFields],
  };
}
