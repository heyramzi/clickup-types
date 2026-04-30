/**
 * ClickUp Task Description Transformers
 * 純粋 (Junsui - Purity)
 *
 * Pure functions for normalizing ClickUp task descriptions into plain text.
 *
 * WHY: ClickUp can return several description shapes across editors and task types,
 * but this app intentionally uses only the plain `description` field.
 *
 * WHY: this is the shared description write strategy used by both sync paths
 * (Apps Script first/full sync and Convex live sync). The rule is intentionally
 * narrow: write the task's plain `description` string or "".
 *
 * Zero dependencies, zero side effects, framework-agnostic.
 */

//===============================================
// TYPES
//===============================================

interface QuillOp {
  insert?: unknown;
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    list?: "bullet" | "ordered" | "checked" | "unchecked";
  } & Record<string, unknown>;
}

interface QuillDelta {
  ops?: QuillOp[];
}

export interface DescriptionLike {
  description?: string | null;
  markdown_description?: string | null;
  text_content?: string | null;
}

//===============================================
// PUBLIC API
//===============================================

/**
 * Detects raw Quill Delta JSON shape. Cheap structural check, no full parse.
 * Returns true for strings that start with `{` and reference `"ops"` early.
 */
export function isQuillDeltaJson(value: string): boolean {
  if (typeof value !== "string" || value.length < 2) return false;
  const trimmed = value.trimStart();
  if (!trimmed.startsWith("{")) return false;
  // WHY: scan only the first 64 chars so a stray "ops" later in a long
  // legitimate string can't trigger a false positive.
  return trimmed.slice(0, 64).includes('"ops"');
}

/**
 * Converts a Quill Delta JSON string to markdown.
 *
 * Supports: bold, italic, ordered list, unordered (bullet) list, checked /
 * unchecked checklist items. Unknown attributes pass through as plain text.
 *
 * Returns "" if the input is not parseable as Quill Delta.
 */
export function quillDeltaToMarkdown(json: string): string {
  const delta = parseQuillDelta(json);
  if (!delta) return "";

  // WHY: Quill encodes line-level attributes (lists, checkboxes) on a "\n"
  // insert that follows the line's text inserts. We accumulate text per line,
  // then commit it with the trailing newline's attributes.
  const lines: string[] = [];
  let current = "";
  let orderedCounter = 0;

  for (const op of delta.ops ?? []) {
    if (typeof op.insert !== "string") {
      current += "";
      continue;
    }

    const attrs = op.attributes;
    const segments = op.insert.split("\n");

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLineBreak = i < segments.length - 1;

      if (segment.length > 0) {
        current += applyInlineFormatting(segment, attrs);
      }

      if (isLineBreak) {
        const listType = attrs?.list;
        if (listType === "ordered") {
          orderedCounter += 1;
          lines.push(`${orderedCounter}. ${current}`);
        } else {
          orderedCounter = 0;
          if (listType === "bullet") lines.push(`- ${current}`);
          else if (listType === "checked") lines.push(`- [x] ${current}`);
          else if (listType === "unchecked") lines.push(`- [ ] ${current}`);
          else lines.push(current);
        }
        current = "";
      }
    }
  }

  if (current.length > 0) lines.push(current);

  return lines.join("\n");
}

/**
 * Canonical normalizer used by all callers. Always returns markdown.
 *
 * Order of preference:
 *   1. `markdown_description` (clean markdown, requires
 *      `include_markdown_description=true` on the API call).
 *   2. `quillDeltaToMarkdown(description)` when `description` is raw Quill JSON.
 *   3. `quillDeltaToMarkdown(text_content)` when only `text_content` contains raw
 *      Quill JSON.
 *   4. `description ?? ""` (legacy plain/markdown tasks).
 */
export function normalizeTaskDescription(task: DescriptionLike | null | undefined): string {
  if (!task) return "";

  const md = task.markdown_description;
  if (typeof md === "string" && md.length > 0) return md;

  const description = task.description;
  if (typeof description === "string" && description.length > 0) {
    if (isQuillDeltaJson(description)) return quillDeltaToMarkdown(description);

    return description;
  }

  const textContent = task.text_content;
  if (typeof textContent === "string" && textContent.length > 0 && isQuillDeltaJson(textContent)) {
    return quillDeltaToMarkdown(textContent);
  }

  return "";
}

//===============================================
// INTERNAL HELPERS
//===============================================

function parseQuillDelta(json: string): QuillDelta | null {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    const ops = (parsed as { ops?: unknown }).ops;
    if (!Array.isArray(ops)) return null;
    return { ops: ops as QuillOp[] };
  } catch {
    return null;
  }
}

function applyInlineFormatting(text: string, attrs: QuillOp["attributes"]): string {
  let result = text;
  if (attrs?.italic) result = `*${result}*`;
  if (attrs?.bold) result = `**${result}**`;
  return result;
}
