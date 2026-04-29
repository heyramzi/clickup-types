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

export interface DescriptionLike {
  description?: string | null;
  markdown_description?: string | null;
}

/**
 * Canonical normalizer used by all callers. Always returns plain description text.
 */
export function normalizeTaskDescription(task: DescriptionLike | null | undefined): string {
  return typeof task?.description === "string" ? task.description : "";
}
