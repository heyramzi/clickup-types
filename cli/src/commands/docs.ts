/**
 * clickup docs — Manage ClickUp Docs and Pages
 *
 * Commands:
 *   docs list                          List docs in workspace
 *   docs pages <docId>                 List pages in a doc
 *   docs get <url|pageId>              Get page content
 *   docs update <url|pageId>           Update page content (--append, --prepend, --replace)
 *   docs create <docId>                Create a new page in a doc
 */

import { readFileSync } from "node:fs";
import * as client from "../client.js";
import { requestWithFallback } from "../client.js";
import type { ClickUpDocPageListing } from "../../../types/clickup-doc-types.js";
import { getTokens, requireConfigWithTeam } from "../config.js";
import {
  color,
  printError,
  printJson,
  printKeyValue,
  printSuccess,
  printTable,
  progress,
  useJson,
} from "../output.js";

// ── URL parser ───────────────────────────────────────

interface DocUrlParts {
  workspaceId: string;
  docId: string;
  pageId: string;
}

function parseDocUrl(urlOrId: string): DocUrlParts | null {
  // https://app.clickup.com/{team_id}/v/dc/{doc_id}/{page_id}
  // https://app.clickup.com/{team_id}/docs/{doc_id}/{page_id}
  const match = urlOrId.match(/clickup\.com\/(\d+)\/(?:v\/dc|docs)\/([^/]+)\/([^/?#]+)/);
  if (match) {
    return { workspaceId: match[1], docId: match[2], pageId: match[3] };
  }
  return null;
}

// ── docs list ────────────────────────────────────────

export async function runDocsListCommand(opts: {
  json?: boolean;
  workspace?: string;
  type?: string;
}): Promise<void> {
  const config = requireConfigWithTeam();
  const tokens = getTokens(config);
  const workspaceId = opts.workspace || config.teamId;

  progress("Fetching docs...");
  const { result: docs, tokenUsed } = await requestWithFallback(tokens, (t) =>
    client.getAllDocs(t, workspaceId),
  );

  const typeFilter = opts.type ? Number(opts.type) : undefined;
  const filtered = typeFilter ? docs.filter((d) => d.type === typeFilter) : docs;

  if (useJson(opts)) {
    printJson(filtered);
    return;
  }

  printTable(filtered, [
    { key: "id", label: "ID" },
    { key: "name", label: "Name", maxWidth: 50 },
    {
      key: (d) => (d.type === 1 ? "Doc" : d.type === 2 ? "Wiki" : "Meeting"),
      label: "Type",
    },
    {
      key: (d) => (d.date_created ? new Date(d.date_created).toLocaleDateString() : ""),
      label: "Created",
    },
  ]);
  progress(`${filtered.length} docs (via ${tokenUsed.name})`);
}

// ── docs pages ───────────────────────────────────────

export async function runDocsPagesCommand(
  docId: string,
  opts: { json?: boolean; workspace?: string },
): Promise<void> {
  const config = requireConfigWithTeam();
  const tokens = getTokens(config);
  const workspaceId = opts.workspace || config.teamId;

  progress("Fetching page listing...");
  const { result: pages, tokenUsed } = await requestWithFallback(tokens, (t) =>
    client.getDocPageListing(t, workspaceId, docId),
  );

  if (useJson(opts)) {
    printJson(pages);
    return;
  }

  // Flatten nested pages for display
  interface FlatPage {
    id: string;
    name: string;
    depth: number;
    parentId: string;
  }
  const flat: FlatPage[] = [];
  function flatten(items: typeof pages, depth: number, parentId: string): void {
    for (const p of items) {
      flat.push({ id: p.id, name: p.name, depth, parentId });
      if (p.pages?.length) flatten(p.pages, depth + 1, p.id);
    }
  }
  flatten(pages, 0, "");

  printTable(flat, [
    { key: "id", label: "Page ID" },
    {
      key: (p) => `${"  ".repeat(p.depth)}${p.name}`,
      label: "Name",
      maxWidth: 60,
    },
  ]);
  progress(`(via ${tokenUsed.name})`);
}

// ── docs get ─────────────────────────────────────────

export async function runDocsGetCommand(
  urlOrPageId: string,
  opts: { json?: boolean; workspace?: string; doc?: string },
): Promise<void> {
  const config = requireConfigWithTeam();
  const tokens = getTokens(config);

  const parsed = parseDocUrl(urlOrPageId);
  const workspaceId = parsed?.workspaceId || opts.workspace || config.teamId;
  const docId = parsed?.docId || opts.doc;
  const pageId = parsed?.pageId || urlOrPageId;

  if (!docId) {
    printError("Provide a full ClickUp URL or use --doc <docId> with a page ID.");
    process.exit(1);
  }

  progress("Fetching page...");
  const { result: page, tokenUsed } = await requestWithFallback(tokens, (t) =>
    client.getPage(t, workspaceId, docId, pageId),
  );

  if (useJson(opts)) {
    printJson(page);
    return;
  }

  printKeyValue([
    ["Page ID", page.id],
    ["Name", page.name],
    ["Doc ID", page.doc_id],
    ["Updated", page.date_updated ? new Date(page.date_updated).toLocaleString() : "—"],
  ]);
  console.log(`\n${color.dim("─".repeat(60))}\n`);
  console.log(page.content);
  progress(`\n(via ${tokenUsed.name})`);
}

// ── docs update ──────────────────────────────────────

export async function runDocsUpdateCommand(
  urlOrPageId: string,
  opts: {
    json?: boolean;
    workspace?: string;
    doc?: string;
    content?: string;
    file?: string;
    name?: string;
    mode?: "replace" | "append" | "prepend";
  },
): Promise<void> {
  const config = requireConfigWithTeam();
  const tokens = getTokens(config);

  const parsed = parseDocUrl(urlOrPageId);
  const workspaceId = parsed?.workspaceId || opts.workspace || config.teamId;
  const docId = parsed?.docId || opts.doc;
  const pageId = parsed?.pageId || urlOrPageId;

  if (!docId) {
    printError("Provide a full ClickUp URL or use --doc <docId> with a page ID.");
    process.exit(1);
  }

  // Resolve content from --content, --file, or stdin
  let content: string | undefined;
  if (opts.file) {
    content = readFileSync(opts.file, "utf-8");
  } else if (opts.content) {
    content = opts.content;
  } else if (!process.stdin.isTTY) {
    // Read from stdin pipe
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    content = Buffer.concat(chunks).toString("utf-8");
  }

  if (!content && !opts.name) {
    printError("Provide content via --content, --file, or stdin pipe.");
    process.exit(1);
  }

  const editMode = opts.mode || "replace";

  progress(`Updating page (${editMode})...`);

  const { result: page, tokenUsed } = await requestWithFallback(tokens, (t) =>
    client.updatePage(t, workspaceId, docId, pageId, {
      ...(opts.name ? { name: opts.name } : {}),
      ...(content
        ? {
            content,
            content_edit_mode: editMode,
            content_format: "text/md",
          }
        : {}),
    }),
  );

  if (useJson(opts)) {
    printJson({ success: true, mode: editMode, pageId, ...page });
    return;
  }

  printSuccess(
    `Page updated (${editMode})${page.name ? `: ${page.name}` : ""} ${color.dim(`(${pageId})`)}`,
  );
  progress(`(via ${tokenUsed.name})`);
}

// ── docs create ──────────────────────────────────────

export async function runDocsCreateCommand(
  docId: string,
  opts: {
    json?: boolean;
    workspace?: string;
    name?: string;
    content?: string;
    file?: string;
    parent?: string;
  },
): Promise<void> {
  const config = requireConfigWithTeam();
  const tokens = getTokens(config);
  const workspaceId = opts.workspace || config.teamId;

  let content: string | undefined;
  if (opts.file) {
    content = readFileSync(opts.file, "utf-8");
  } else if (opts.content) {
    content = opts.content;
  }

  progress("Creating page...");
  const { result: page, tokenUsed } = await requestWithFallback(tokens, (t) =>
    client.createPage(t, workspaceId, docId, {
      name: opts.name,
      content,
      content_format: "text/md",
      parent_page_id: opts.parent,
    }),
  );

  if (useJson(opts)) {
    printJson(page);
    return;
  }

  printSuccess(`Page created: ${page.name} ${color.dim(`(${page.id})`)}`);
  console.log(`  ${color.dim(`https://app.clickup.com/${workspaceId}/v/dc/${docId}/${page.id}`)}`);
  progress(`(via ${tokenUsed.name})`);
}

// ── docs scan ───────────────────────────────────────

/** Simple check: does a page/doc name end with MM/DD/YYYY? */
const DATE_SUFFIX_RE = /(\d{2})\/(\d{2})\/(\d{4})$/;
function looksLikeCallPage(name: string): boolean {
  return DATE_SUFFIX_RE.test(name);
}

function flattenPages(pages: ClickUpDocPageListing[]): ClickUpDocPageListing[] {
  const result: ClickUpDocPageListing[] = [];
  for (const page of pages) {
    result.push(page);
    if (page.pages?.length) result.push(...flattenPages(page.pages));
  }
  return result;
}

type FoundCallPage = {
  pageId: string;
  pageName: string;
  docId: string;
  docName: string;
  docType: number;
  url: string;
};

/**
 * Scan all workspace docs for pages that look like call pages (date-suffixed titles).
 * Outputs discovered call pages with doc context.
 */
export async function runDocsScanCommand(opts: {
  json?: boolean;
  workspace?: string;
}): Promise<void> {
  const config = requireConfigWithTeam();
  const tokens = getTokens(config);
  const workspaceId = opts.workspace || config.teamId;

  progress("Fetching all docs...");
  const { result: docs, tokenUsed } = await requestWithFallback(tokens, (t) =>
    client.getAllDocs(t, workspaceId),
  );

  const activeDocs = docs.filter((d) => !d.deleted);
  const found: FoundCallPage[] = [];

  // Type 3 docs: the doc name itself is the call page
  const type3Docs = activeDocs.filter((d) => (d.type as number) === 3);
  for (const doc of type3Docs) {
    if (looksLikeCallPage(doc.name)) {
      found.push({
        pageId: doc.id,
        pageName: doc.name,
        docId: doc.id,
        docName: doc.name,
        docType: doc.type as number,
        url: `https://app.clickup.com/${workspaceId}/docs/${doc.id}/${doc.id}`,
      });
    }
  }

  // Type 1+2 docs: scan page listings in parallel batches
  const regularDocs = activeDocs.filter((d) => (d.type as number) !== 3);
  const BATCH_SIZE = 5;
  for (let i = 0; i < regularDocs.length; i += BATCH_SIZE) {
    const batch = regularDocs.slice(i, i + BATCH_SIZE);
    progress(`Scanning docs ${i + 1}-${Math.min(i + BATCH_SIZE, regularDocs.length)} of ${regularDocs.length}...`);
    const results = await Promise.all(
      batch.map(async (doc) => {
        try {
          const { result: pages } = await requestWithFallback(tokens, (t) =>
            client.getDocPageListing(t, workspaceId, doc.id),
          );
          return flattenPages(pages)
            .filter((p) => looksLikeCallPage(p.name))
            .map(
              (p): FoundCallPage => ({
                pageId: p.id,
                pageName: p.name,
                docId: doc.id,
                docName: doc.name,
                docType: doc.type as number,
                url: `https://app.clickup.com/${workspaceId}/docs/${doc.id}/${p.id}`,
              }),
            );
        } catch {
          return [];
        }
      }),
    );
    found.push(...results.flat());
  }

  if (useJson(opts)) {
    printJson({ callPages: found, total: found.length });
    return;
  }

  if (found.length === 0) {
    printSuccess("No call pages found outside expected locations.");
    return;
  }

  printTable(found, [
    { key: "pageName", label: "Page", maxWidth: 60 },
    { key: "docName", label: "Doc", maxWidth: 30 },
    {
      key: (f) => (f.docType === 1 ? "Doc" : f.docType === 2 ? "Wiki" : "Meeting"),
      label: "Type",
    },
    { key: "pageId", label: "Page ID" },
  ]);
  progress(`${found.length} call pages found (via ${tokenUsed.name})`);
}
