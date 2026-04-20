/**
 * ClickUp CLI
 *
 * Single createCLI entry point. All commands are inlined here.
 * Config file auth via config.ts — no env block needed.
 */

import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { platform } from "node:os";
import * as readline from "node:readline";

import { createCLI } from "@heyramzi/cli";

import * as client from "./client.js";
import { requestWithFallback } from "./client.js";
import type { ClickUpDocPageListing } from "../../types/clickup-doc-types.js";
import type { NamedToken } from "./config.js";
import {
  getConfigPath,
  getTokens,
  loadConfig,
  requireConfig,
  requireConfigWithTeam,
  saveConfig,
} from "./config.js";

// ── Helpers ───────────────────────────────────────────

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stderr,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function openUrl(url: string): void {
  const os = platform();
  const cmd = os === "darwin" ? "open" : os === "win32" ? "start" : "xdg-open";
  exec(`${cmd} ${url}`);
}

interface DocUrlParts {
  workspaceId: string;
  docId: string;
  pageId: string;
}

function parseDocUrl(urlOrId: string): DocUrlParts | null {
  const match = urlOrId.match(/clickup\.com\/(\d+)\/(?:v\/dc|docs)\/([^/]+)\/([^/?#]+)/);
  if (match) {
    return { workspaceId: match[1], docId: match[2], pageId: match[3] };
  }
  return null;
}

function flattenPages(pages: ClickUpDocPageListing[]): ClickUpDocPageListing[] {
  const result: ClickUpDocPageListing[] = [];
  for (const page of pages) {
    result.push(page);
    if (page.pages?.length) result.push(...flattenPages(page.pages));
  }
  return result;
}

const DATE_SUFFIX_RE = /(\d{2})\/(\d{2})\/(\d{4})$/;
function looksLikeCallPage(name: string): boolean {
  return DATE_SUFFIX_RE.test(name);
}

function formatDate(timestamp: string | null): string {
  if (!timestamp) return "";
  const d = new Date(parseInt(timestamp, 10));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(ms: string | number): string {
  const totalMs = typeof ms === "string" ? parseInt(ms, 10) : ms;
  if (totalMs < 0) return "running";
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function renderCustomFieldValue(field: {
  type: string;
  value?: unknown;
  type_config?: { options?: Array<{ id: string; name?: string; label?: string; orderindex?: number }> };
}): string {
  const v = field.value;
  if (v === null || v === undefined || v === "") return "(empty)";

  const options = field.type_config?.options ?? [];
  const resolveOption = (optId: string | number): string => {
    const opt = options.find((o) => o.id === optId || o.orderindex === optId);
    return opt?.name ?? opt?.label ?? String(optId);
  };

  if (field.type === "drop_down") {
    return resolveOption(v as string | number);
  }
  if (field.type === "labels" && Array.isArray(v)) {
    return (v as (string | number)[]).map(resolveOption).join(", ");
  }
  if (field.type === "date" && typeof v === "string") {
    return new Date(parseInt(v, 10)).toLocaleDateString();
  }
  if (field.type === "users" && Array.isArray(v)) {
    return (v as Array<{ username?: string; email?: string }>)
      .map((u) => u.username ?? u.email ?? "?")
      .join(", ");
  }
  if (field.type === "tasks" && Array.isArray(v)) {
    return (v as Array<{ id: string }>).map((t) => t.id).join(", ");
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

// ── CLI ───────────────────────────────────────────────

createCLI({
  name: "clickup",
  bin: "clickup",
  description: "Manage ClickUp workspaces, tasks, docs, and time tracking from the terminal",
  home: async (ctx) => {
    const config = loadConfig();
    if (!config) {
      ctx.error("Not authenticated. Run `clickup init` first.");
      return;
    }
    ctx.output({
      workspace: config.teamName || config.teamId,
      user: config.userName || "unknown",
      tokens: config.tokens?.map((t) => t.name).join(" → ") || "1 token",
    });
    ctx.next(["status", "tasks --list <id>", "docs list", "hierarchy"]);
  },
  commands: {
    // ── Auth ──────────────────────────────────────────

    init: {
      description: "Interactive setup: add API tokens and select a workspace",
      run: async ({ ctx }) => {
        const existing = loadConfig();

        if (existing) {
          ctx.raw(`Existing config found at ${getConfigPath()}`);
          const tokenCount = existing.tokens?.length ?? 1;
          ctx.raw(`  ${tokenCount} token(s) configured`);
          const overwrite = await prompt("Overwrite? (y/N): ");
          if (overwrite.toLowerCase() !== "y") {
            ctx.raw("Aborted.");
            return;
          }
        }

        ctx.raw("\nClickUp CLI Setup\n");
        ctx.raw("Add one or more API tokens in priority order.");
        ctx.raw("The first token will be used by default; others are fallbacks.");
        ctx.raw("Get tokens at: https://app.clickup.com/settings/apps\n");

        const tokens: NamedToken[] = [];
        let addMore = true;

        while (addMore) {
          const ordinal = tokens.length === 0 ? "Primary" : `Fallback #${tokens.length}`;
          const name = await prompt(`${ordinal} token name (e.g. "upsys-team", "ramzi"): `);
          if (!name) {
            if (tokens.length === 0) {
              ctx.error("At least one token is required.");
              continue;
            }
            break;
          }

          const token = await prompt(`API Token for "${name}" (pk_...): `);
          if (!token) {
            ctx.error("No token provided, skipping.");
            continue;
          }

          ctx.status("Validating...");
          try {
            const res = await client.getUser(token);
            const user = res.user;
            ctx.raw(`✓ ${name}: ${user.username} (${user.email})`);
            tokens.push({ name, token, userName: user.username });
          } catch (err) {
            ctx.error(`Invalid token: ${(err as Error).message}`);
            continue;
          }

          const more = await prompt("Add another token? (y/N): ");
          addMore = more.toLowerCase() === "y";
        }

        if (tokens.length === 0) {
          ctx.error("No valid tokens provided.");
          process.exit(1);
        }

        const workspaces = await client.getWorkspaces(tokens[0].token);

        if (workspaces.length === 0) {
          ctx.error("No workspaces found for the primary token.");
          process.exit(1);
        }

        let selectedWorkspace = workspaces[0];

        if (workspaces.length > 1) {
          ctx.raw("\nAvailable Workspaces:");
          workspaces.forEach((ws, i) => {
            ctx.raw(`  ${i + 1}. ${ws.name} (${ws.id})`);
          });

          const choice = await prompt(`\nSelect workspace (1-${workspaces.length}): `);
          const idx = parseInt(choice, 10) - 1;
          if (idx >= 0 && idx < workspaces.length) {
            selectedWorkspace = workspaces[idx];
          }
        }

        saveConfig({
          apiToken: tokens[0].token,
          teamId: selectedWorkspace.id,
          teamName: selectedWorkspace.name,
          userName: tokens[0].userName,
          tokens,
        });

        ctx.raw("");
        ctx.raw(`✓ Config saved to ${getConfigPath()}`);
        ctx.raw(`✓ Workspace: ${selectedWorkspace.name}`);
        ctx.raw(`\nTokens (priority order): ${tokens.map((t) => t.name).join(" → ")}`);
        ctx.next(["status", "docs list"]);
      },
    },

    status: {
      description: "Show current authentication and config status",
      run: async ({ ctx }) => {
        const config = loadConfig();

        if (!config) {
          ctx.error("Not authenticated. Run `clickup init` to set up.");
          return;
        }

        const tokens = getTokens(config);
        const tokenResults: Array<{
          name: string;
          priority: number;
          valid: string;
          user: string;
        }> = [];

        ctx.status("Validating tokens...");

        for (let i = 0; i < tokens.length; i++) {
          const t = tokens[i];
          try {
            const res = await client.getUser(t.token);
            tokenResults.push({
              name: t.name,
              priority: i + 1,
              valid: "yes",
              user: `${res.user.username} (${res.user.email})`,
            });
          } catch (err) {
            tokenResults.push({
              name: t.name,
              priority: i + 1,
              valid: "no",
              user: (err as Error).message,
            });
          }
        }

        ctx.output({
          workspace: config.teamName ?? config.teamId,
          teamId: config.teamId,
          configPath: getConfigPath(),
        });

        ctx.list(tokenResults, ["priority", "name", "valid", "user"], {
          resourceName: "tokens",
        });

        ctx.next(["workspaces", "hierarchy"]);
      },
    },

    // ── Workspaces ────────────────────────────────────

    workspaces: {
      description: "List all workspaces",
      run: async ({ ctx }) => {
        const config = requireConfig();
        ctx.status("Fetching workspaces...");

        const workspaces = await client.getWorkspaces(config.apiToken);

        ctx.list(
          workspaces.map((ws) => ({
            id: ws.id,
            name: ws.name,
            members: ws.members?.length ?? 0,
          })),
          ["id", "name", "members"],
          { resourceName: "workspaces" },
        );

        ctx.next(["spaces", "hierarchy"]);
      },
    },

    spaces: {
      description: "List spaces in the current workspace",
      flags: {
        team: { type: "string", description: "Override workspace/team ID" },
      },
      run: async ({ flags, ctx }) => {
        const config = requireConfigWithTeam();
        const teamId = (flags.team as string | undefined) || config.teamId;
        ctx.status("Fetching spaces...");

        const spaces = await client.getSpaces(config.apiToken, teamId);

        ctx.list(
          spaces.map((s) => ({
            id: s.id,
            name: s.name,
            private: s.private ? "yes" : "no",
          })),
          ["id", "name", "private"],
          { resourceName: "spaces" },
        );

        ctx.next(["folders --space <id>", "lists --space <id>", "hierarchy"]);
      },
    },

    folders: {
      description: "List folders in a space",
      flags: {
        space: { type: "string", description: "Space ID (required)" },
      },
      run: async ({ flags, ctx }) => {
        const spaceId = flags.space as string | undefined;
        if (!spaceId) {
          ctx.error("--space <id> is required. Use `clickup spaces` to find space IDs.");
          process.exit(1);
        }

        const config = requireConfig();
        ctx.status("Fetching folders...");

        const folders = await client.getFolders(config.apiToken, spaceId);

        ctx.list(
          folders.map((f) => ({
            id: f.id,
            name: f.name,
            lists: f.lists?.length ?? 0,
            hidden: f.hidden ? "yes" : "no",
          })),
          ["id", "name", "lists", "hidden"],
          { resourceName: "folders" },
        );

        ctx.next(["lists --folder <id>", "hierarchy"]);
      },
    },

    lists: {
      description: "List lists in a space or folder",
      flags: {
        space: { type: "string", description: "Space ID" },
        folder: { type: "string", description: "Folder ID" },
      },
      run: async ({ flags, ctx }) => {
        const spaceId = flags.space as string | undefined;
        const folderId = flags.folder as string | undefined;

        if (!spaceId && !folderId) {
          ctx.error(
            "Provide --space <id> or --folder <id>. Use `clickup spaces` or `clickup folders`.",
          );
          process.exit(1);
        }

        const config = requireConfig();
        ctx.status("Fetching lists...");

        let lists;
        if (folderId) {
          lists = await client.getListsInFolder(config.apiToken, folderId);
        } else {
          const [folderless, folders] = await Promise.all([
            client.getFolderlessLists(config.apiToken, spaceId!),
            client.getFolders(config.apiToken, spaceId!),
          ]);
          const folderLists = folders.flatMap((f) => f.lists ?? []);
          lists = [...folderless, ...folderLists];
        }

        ctx.list(
          lists.map((l) => ({
            id: l.id,
            name: l.name,
            tasks: l.task_count ?? "",
            folder: l.folder?.name ?? "",
            status: l.status?.status ?? "",
          })),
          ["id", "name", "tasks", "folder", "status"],
          { resourceName: "lists" },
        );

        ctx.next(["tasks --list <id>"]);
      },
    },

    hierarchy: {
      description: "Show full workspace hierarchy (spaces > folders > lists)",
      flags: {
        team: { type: "string", description: "Override workspace/team ID" },
      },
      run: async ({ flags, ctx }) => {
        const config = requireConfigWithTeam();
        const teamId = (flags.team as string | undefined) || config.teamId;
        ctx.status("Fetching full hierarchy...");

        const spaces = await client.getSpaces(config.apiToken, teamId);

        const hierarchy = await Promise.all(
          spaces.map(async (space) => {
            const [folders, folderlessLists] = await Promise.all([
              client.getFolders(config.apiToken, space.id),
              client.getFolderlessLists(config.apiToken, space.id),
            ]);
            return { ...space, folders, folderlessLists };
          }),
        );

        const lines: string[] = [];
        for (const space of hierarchy) {
          lines.push(`\n${space.name} (${space.id})`);
          for (const folder of space.folders) {
            lines.push(`  > ${folder.name} (${folder.id})`);
            for (const list of folder.lists ?? []) {
              lines.push(`    - ${list.name} (${list.id}) [${list.task_count} tasks]`);
            }
          }
          for (const list of space.folderlessLists) {
            lines.push(`  - ${list.name} (${list.id}) [${list.task_count} tasks]`);
          }
        }

        ctx.raw(lines.join("\n") + "\n");
        ctx.next(["tasks --list <id>", "docs list"]);
      },
    },

    // ── Tasks ─────────────────────────────────────────

    tasks: {
      description: "List tasks in a list or across the workspace",
      flags: {
        list: { type: "string", description: "List ID (omit for workspace-wide search)" },
        assignee: { type: "string", description: "Filter by assignee user IDs (comma-separated)" },
        status: { type: "string", description: "Filter by status names (comma-separated)" },
        closed: { type: "boolean", description: "Include closed tasks" },
        subtasks: { type: "boolean", description: "Include subtasks" },
        page: { type: "string", description: "Page number (0-indexed)" },
      },
      run: async ({ flags, ctx }) => {
        const config = requireConfigWithTeam();
        const listId = flags.list as string | undefined;
        const assignees = flags.assignee ? (flags.assignee as string).split(",") : undefined;
        const statuses = flags.status ? (flags.status as string).split(",") : undefined;
        const page = flags.page ? parseInt(flags.page as string, 10) : 0;

        ctx.status(listId ? "Fetching tasks..." : "Fetching tasks from workspace...");

        let result;
        if (listId) {
          result = await client.getTasks(config.apiToken, listId, {
            page,
            assignees,
            statuses,
            include_closed: flags.closed as boolean | undefined,
            subtasks: flags.subtasks as boolean | undefined,
          });
        } else {
          result = await client.getFilteredTasks(config.apiToken, config.teamId, {
            page,
            assignees,
            statuses,
            include_closed: flags.closed as boolean | undefined,
            subtasks: flags.subtasks as boolean | undefined,
          });
        }

        const rows = result.tasks.map((t) => ({
          id: t.id,
          name: t.name,
          status: t.status.status,
          priority: t.priority?.priority ?? "",
          assignees: t.assignees.map((a) => a.username ?? "?").join(", "),
          due: formatDate(t.due_date),
        }));

        if (rows.length === 0) {
          ctx.empty("No tasks found.");
        } else {
          ctx.list(rows, ["id", "name", "status", "priority", "assignees", "due"], {
            resourceName: "tasks",
          });
        }

        if (!result.last_page) {
          ctx.next([`tasks --list ${listId ?? ""} --page ${page + 1}`]);
        } else {
          ctx.next(["task get <id>", "task create --list <id> --name <name>"]);
        }
      },
    },

    "task get": {
      description: "Get full task details",
      args: {
        taskId: { position: 0, required: true, description: "Task ID" },
      },
      flags: {
        fields: { type: "boolean", description: "Show custom fields (resolves dropdown option IDs to labels)" },
      },
      run: async ({ args, flags, ctx }) => {
        const config = requireConfig();
        ctx.status("Fetching task...");

        const task = await client.getTask(config.apiToken, args.taskId);

        ctx.output({
          id: task.id,
          customId: task.custom_id ?? "",
          name: task.name,
          status: task.status.status,
          priority: task.priority?.priority ?? "",
          assignees: task.assignees.map((a) => a.username ?? a.email).join(", ") || "",
          creator: task.creator.username,
          created: new Date(parseInt(task.date_created, 10)).toLocaleString(),
          updated: new Date(parseInt(task.date_updated, 10)).toLocaleString(),
          due: task.due_date ? new Date(parseInt(task.due_date, 10)).toLocaleString() : "",
          start: task.start_date ? new Date(parseInt(task.start_date, 10)).toLocaleString() : "",
          timeEstimate: task.time_estimate ? `${Math.round(task.time_estimate / 3600000)}h` : "",
          timeSpent: task.time_spent ? `${Math.round(task.time_spent / 3600000)}h` : "",
          points: task.points !== null ? String(task.points) : "",
          tags: task.tags.map((t) => t.name).join(", ") || "",
          url: task.url,
        });

        if (task.text_content) {
          const lines = task.text_content.split("\n").slice(0, 20);
          const truncated = task.text_content.split("\n").length > 20;
          ctx.raw("\nDescription:\n");
          ctx.raw(lines.join("\n") + (truncated ? "\n... (truncated)" : ""));
        }

        if (flags.fields) {
          const customFields = (task as { custom_fields?: unknown[] }).custom_fields ?? [];
          if (customFields.length > 0) {
            ctx.raw("\n\nCustom Fields:\n");
            for (const rawField of customFields) {
              const f = rawField as {
                name: string;
                type: string;
                value?: unknown;
                type_config?: { options?: Array<{ id: string; name?: string; label?: string; orderindex?: number }> };
              };
              const rendered = renderCustomFieldValue(f);
              ctx.raw(`  ${f.name} (${f.type}): ${rendered}\n`);
            }
          } else {
            ctx.raw("\n\nCustom Fields: (none)\n");
          }
        }

        ctx.next([
          `task update ${args.taskId}`,
          `comments list ${args.taskId}`,
          `open ${args.taskId}`,
        ]);
      },
    },

    "task create": {
      description: "Create a new task",
      flags: {
        list: { type: "string", description: "List ID to create task in (required)" },
        name: { type: "string", description: "Task name (required)" },
        description: { type: "string", description: "Task description" },
        markdown: { type: "boolean", description: "Treat description as markdown" },
        status: { type: "string", description: "Task status" },
        priority: { type: "string", description: "Priority: urgent, high, normal, low" },
        assignee: { type: "string", description: "Assignee user IDs (comma-separated)" },
        tag: { type: "string", description: "Tag names (comma-separated)" },
      },
      run: async ({ flags, ctx }) => {
        const listId = flags.list as string | undefined;
        const name = flags.name as string | undefined;

        if (!listId) {
          ctx.error("--list <id> is required.");
          process.exit(1);
        }
        if (!name) {
          ctx.error("--name is required.");
          process.exit(1);
        }

        const config = requireConfig();
        ctx.status("Creating task...");

        const priorityMap: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
        const data: Record<string, unknown> = { name };

        if (flags.description) {
          const key = flags.markdown ? "markdown_description" : "description";
          data[key] = flags.description;
        }
        if (flags.status) data.status = flags.status;
        const priorityStr = flags.priority as string | undefined;
        if (priorityStr && priorityMap[priorityStr]) {
          data.priority = priorityMap[priorityStr];
        }
        const assigneeStr = flags.assignee as string | undefined;
        if (assigneeStr) data.assignees = assigneeStr.split(",").map(Number);
        const tagStr = flags.tag as string | undefined;
        if (tagStr) data.tags = tagStr.split(",");

        const task = await client.createTask(
          config.apiToken,
          listId,
          data as unknown as Parameters<typeof client.createTask>[2],
        );

        ctx.output({ id: task.id, name: task.name, url: task.url });
        ctx.next([`task get ${task.id}`, `task update ${task.id}`]);
      },
    },

    "task update": {
      description: "Update an existing task",
      args: {
        taskId: { position: 0, required: true, description: "Task ID" },
      },
      flags: {
        name: { type: "string", description: "New task name" },
        description: { type: "string", description: "New description" },
        markdown: { type: "boolean", description: "Treat description as markdown" },
        status: { type: "string", description: "New status" },
        priority: { type: "string", description: "New priority: urgent, high, normal, low" },
        "add-assignee": {
          type: "string",
          description: "Add assignees by user ID (comma-separated)",
        },
        "remove-assignee": {
          type: "string",
          description: "Remove assignees by user ID (comma-separated)",
        },
      },
      run: async ({ args, flags, ctx }) => {
        const config = requireConfig();
        ctx.status("Updating task...");

        const priorityMap: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
        const data: Record<string, unknown> = {};

        if (flags.name) data.name = flags.name;
        if (flags.description) {
          const key = flags.markdown ? "markdown_description" : "description";
          data[key] = flags.description;
        }
        if (flags.status) data.status = flags.status;
        const priorityStr = flags.priority as string | undefined;
        if (priorityStr) {
          data.priority = priorityMap[priorityStr] ?? null;
        }
        const addStr = flags["add-assignee"] as string | undefined;
        const removeStr = flags["remove-assignee"] as string | undefined;
        if (addStr || removeStr) {
          data.assignees = {
            add: addStr ? addStr.split(",").map(Number) : [],
            rem: removeStr ? removeStr.split(",").map(Number) : [],
          };
        }

        if (Object.keys(data).length === 0) {
          ctx.error("No update fields provided. Use --name, --status, --priority, etc.");
          process.exit(1);
        }

        const task = await client.updateTask(
          config.apiToken,
          args.taskId,
          data as unknown as Parameters<typeof client.updateTask>[2],
        );

        ctx.output({ id: task.id, name: task.name, status: task.status.status });
        ctx.next([`task get ${args.taskId}`]);
      },
    },

    // ── Team ──────────────────────────────────────────

    members: {
      description: "List team members in the workspace",
      flags: {
        team: { type: "string", description: "Override workspace/team ID" },
      },
      run: async ({ flags, ctx }) => {
        const config = requireConfigWithTeam();
        const teamId = (flags.team as string | undefined) || config.teamId;
        ctx.status("Fetching members...");

        const members = await client.getTeamMembers(config.apiToken, teamId);

        ctx.list(
          members.map((m) => ({
            id: String(m.user.id),
            username: m.user.username,
            email: m.user.email,
            role: m.user.role_key ?? String(m.user.role),
          })),
          ["id", "username", "email", "role"],
          { resourceName: "members" },
        );
      },
    },

    // ── Comments ──────────────────────────────────────

    "comments list": {
      description: "List comments on a task",
      args: {
        taskId: { position: 0, required: true, description: "Task ID" },
      },
      run: async ({ args, ctx }) => {
        const config = requireConfig();
        ctx.status("Fetching comments...");

        const comments = await client.getTaskComments(config.apiToken, args.taskId);

        if (comments.length === 0) {
          ctx.empty("No comments on this task.");
          return;
        }

        const lines: string[] = [];
        for (const c of comments) {
          const date = new Date(parseInt(c.date, 10)).toLocaleString();
          lines.push(`[${c.id}] ${c.user.username}  ${date}`);
          lines.push(`  ${c.comment_text}`);
          if (c.resolved) lines.push("  [Resolved]");
          lines.push("");
        }
        ctx.raw(lines.join("\n"));

        ctx.next([
          `comments add ${args.taskId} --text <text>`,
          `comments update <commentId> --text <text>`,
          `comments delete <commentId>`,
        ]);
      },
    },

    "comments add": {
      description: "Add a comment to a task",
      args: {
        taskId: { position: 0, required: true, description: "Task ID" },
      },
      flags: {
        text: { type: "string", description: "Comment text (required)" },
        notify: { type: "boolean", description: "Notify all assignees" },
      },
      run: async ({ args, flags, ctx }) => {
        const text = flags.text as string | undefined;
        if (!text) {
          ctx.error("--text is required.");
          process.exit(1);
        }

        const config = requireConfig();
        ctx.status("Adding comment...");

        await client.addTaskComment(config.apiToken, args.taskId, {
          comment_text: text,
          notify_all: flags.notify as boolean | undefined,
        });

        ctx.output({ taskId: args.taskId, status: "comment added" });
        ctx.next([`comments list ${args.taskId}`]);
      },
    },

    "comments update": {
      description: "Update an existing comment",
      args: {
        commentId: { position: 0, required: true, description: "Comment ID (see `comments list`)" },
      },
      flags: {
        text: { type: "string", description: "New comment text (required)" },
        resolved: { type: "boolean", description: "Mark the comment as resolved" },
      },
      run: async ({ args, flags, ctx }) => {
        const text = flags.text as string | undefined;
        if (!text) {
          ctx.error("--text is required.");
          process.exit(1);
        }

        const config = requireConfig();
        ctx.status("Updating comment...");

        await client.updateComment(config.apiToken, args.commentId, {
          comment_text: text,
          resolved: flags.resolved as boolean | undefined,
        });

        ctx.output({ commentId: args.commentId, status: "comment updated" });
      },
    },

    "comments delete": {
      description: "Delete a comment",
      args: {
        commentId: { position: 0, required: true, description: "Comment ID (see `comments list`)" },
      },
      run: async ({ args, ctx }) => {
        const config = requireConfig();
        ctx.status("Deleting comment...");

        await client.deleteComment(config.apiToken, args.commentId);

        ctx.output({ commentId: args.commentId, status: "comment deleted" });
      },
    },

    // ── Time Tracking ─────────────────────────────────

    time: {
      description: "List time entries",
      flags: {
        team: { type: "string", description: "Override workspace/team ID" },
        "start-date": { type: "string", description: "Start date (unix ms)" },
        "end-date": { type: "string", description: "End date (unix ms)" },
        assignee: { type: "string", description: "Filter by user ID" },
      },
      run: async ({ flags, ctx }) => {
        const config = requireConfigWithTeam();
        const teamId = (flags.team as string | undefined) || config.teamId;
        ctx.status("Fetching time entries...");

        const entries = await client.getTimeEntries(config.apiToken, teamId, {
          start_date: flags["start-date"] as string | undefined,
          end_date: flags["end-date"] as string | undefined,
          assignee: flags.assignee as string | undefined,
        });

        ctx.list(
          entries.map((e) => ({
            id: e.id,
            task: e.task?.name ?? "",
            user: e.user.username,
            duration: formatDuration(e.duration),
            description: e.description || "",
            billable: e.billable ? "yes" : "no",
          })),
          ["id", "task", "user", "duration", "description", "billable"],
          { resourceName: "time entries" },
        );
      },
    },

    // ── Tags ──────────────────────────────────────────

    tags: {
      description: "List tags in a space",
      flags: {
        space: { type: "string", description: "Space ID (required)" },
      },
      run: async ({ flags, ctx }) => {
        const spaceId = flags.space as string | undefined;
        if (!spaceId) {
          ctx.error("--space <id> is required.");
          process.exit(1);
        }

        const config = requireConfig();
        ctx.status("Fetching tags...");

        const tags = await client.getSpaceTags(config.apiToken, spaceId);

        ctx.list(
          tags.map((t) => ({
            name: t.name,
            fg: t.tag_fg,
            bg: t.tag_bg,
          })),
          ["name", "fg", "bg"],
          { resourceName: "tags" },
        );
      },
    },

    // ── Browser ───────────────────────────────────────

    open: {
      description: "Open a task in the browser",
      args: {
        taskId: { position: 0, required: true, description: "Task ID" },
      },
      run: async ({ args, ctx }) => {
        const config = requireConfig();
        ctx.status("Fetching task URL...");

        const task = await client.getTask(config.apiToken, args.taskId);
        if (task.url) {
          openUrl(task.url);
          ctx.output({ url: task.url, status: "opened" });
        } else {
          ctx.error("Task has no URL.");
        }
      },
    },

    // ── Docs ──────────────────────────────────────────

    "docs list": {
      description: "List docs in the workspace (includes type 3 meeting notes)",
      flags: {
        workspace: { type: "string", description: "Override workspace ID" },
        type: { type: "string", description: "Filter by doc type: 1 (Doc), 2 (Wiki), 3 (Meeting)" },
      },
      run: async ({ flags, ctx }) => {
        const config = requireConfigWithTeam();
        const tokens = getTokens(config);
        const workspaceId = (flags.workspace as string | undefined) || config.teamId;

        ctx.status("Fetching docs...");
        const { result: docs, tokenUsed } = await requestWithFallback(tokens, (t) =>
          client.getAllDocs(t, workspaceId),
        );

        const typeFilter = flags.type ? Number(flags.type) : undefined;
        const filtered = typeFilter ? docs.filter((d) => d.type === typeFilter) : docs;

        const docTypeLabel = (type: number) =>
          type === 1 ? "Doc" : type === 2 ? "Wiki" : "Meeting";

        ctx.list(
          filtered.map((d) => ({
            id: d.id,
            name: d.name,
            type: docTypeLabel(d.type as number),
            created: d.date_created ? new Date(d.date_created).toLocaleDateString() : "",
          })),
          ["id", "name", "type", "created"],
          { resourceName: "docs" },
        );

        ctx.status(`${filtered.length} docs (via ${tokenUsed.name})`);
        ctx.next(["docs pages <docId>", "docs get <url>"]);
      },
    },

    "docs pages": {
      description: "List pages in a doc",
      args: {
        docId: { position: 0, required: true, description: "Doc ID" },
      },
      flags: {
        workspace: { type: "string", description: "Override workspace ID" },
      },
      run: async ({ args, flags, ctx }) => {
        const config = requireConfigWithTeam();
        const tokens = getTokens(config);
        const workspaceId = (flags.workspace as string | undefined) || config.teamId;

        ctx.status("Fetching page listing...");
        const { result: pages, tokenUsed } = await requestWithFallback(tokens, (t) =>
          client.getDocPageListing(t, workspaceId, args.docId),
        );

        type FlatPage = { id: string; name: string; depth: number; parentId: string };
        const flat: FlatPage[] = [];
        function flatten(items: typeof pages, depth: number, parentId: string): void {
          for (const p of items) {
            flat.push({ id: p.id, name: "  ".repeat(depth) + p.name, depth, parentId });
            if (p.pages?.length) flatten(p.pages, depth + 1, p.id);
          }
        }
        flatten(pages, 0, "");

        ctx.list(
          flat.map((p) => ({ id: p.id, name: p.name })),
          ["id", "name"],
          { resourceName: "pages" },
        );

        ctx.status(`(via ${tokenUsed.name})`);
        ctx.next([`docs get <url>`, `docs create ${args.docId} --name <title>`]);
      },
    },

    "docs get": {
      description: "Get page content (accepts full ClickUp URL or page ID with --doc)",
      args: {
        urlOrPageId: { position: 0, required: true, description: "ClickUp URL or page ID" },
      },
      flags: {
        workspace: { type: "string", description: "Override workspace ID" },
        doc: { type: "string", description: "Doc ID (required if not using URL)" },
      },
      run: async ({ args, flags, ctx }) => {
        const config = requireConfigWithTeam();
        const tokens = getTokens(config);

        const parsed = parseDocUrl(args.urlOrPageId);
        const workspaceId =
          parsed?.workspaceId || (flags.workspace as string | undefined) || config.teamId;
        const docId = parsed?.docId || (flags.doc as string | undefined);
        const pageId = parsed?.pageId || args.urlOrPageId;

        if (!docId) {
          ctx.error("Provide a full ClickUp URL or use --doc <docId> with a page ID.");
          process.exit(1);
        }

        ctx.status("Fetching page...");
        const { result: page, tokenUsed } = await requestWithFallback(tokens, (t) =>
          client.getPage(t, workspaceId, docId, pageId),
        );

        ctx.output({
          pageId: page.id,
          name: page.name,
          docId: page.doc_id,
          updated: page.date_updated ? new Date(page.date_updated).toLocaleString() : "",
        });
        ctx.raw(`\n${"─".repeat(60)}\n`);
        ctx.raw(page.content);
        ctx.status(`\n(via ${tokenUsed.name})`);

        ctx.next([`docs update ${args.urlOrPageId}`]);
      },
    },

    "docs update": {
      description: "Update a page (accepts full ClickUp URL or page ID with --doc)",
      args: {
        urlOrPageId: { position: 0, required: true, description: "ClickUp URL or page ID" },
      },
      flags: {
        workspace: { type: "string", description: "Override workspace ID" },
        doc: { type: "string", description: "Doc ID (required if not using URL)" },
        content: { type: "string", description: "Content to write" },
        file: { type: "string", description: "Read content from file" },
        name: { type: "string", description: "Update page title" },
        mode: { type: "string", description: "Edit mode: replace (default), append, or prepend" },
      },
      run: async ({ args, flags, ctx }) => {
        const config = requireConfigWithTeam();
        const tokens = getTokens(config);

        const parsed = parseDocUrl(args.urlOrPageId);
        const workspaceId =
          parsed?.workspaceId || (flags.workspace as string | undefined) || config.teamId;
        const docId = parsed?.docId || (flags.doc as string | undefined);
        const pageId = parsed?.pageId || args.urlOrPageId;

        if (!docId) {
          ctx.error("Provide a full ClickUp URL or use --doc <docId> with a page ID.");
          process.exit(1);
        }

        let content: string | undefined;
        const fileFlag = flags.file as string | undefined;
        const contentFlag = flags.content as string | undefined;

        if (fileFlag) {
          content = readFileSync(fileFlag, "utf-8");
        } else if (contentFlag) {
          content = contentFlag;
        } else if (!process.stdin.isTTY) {
          const chunks: Buffer[] = [];
          for await (const chunk of process.stdin) {
            chunks.push(chunk as Buffer);
          }
          content = Buffer.concat(chunks).toString("utf-8");
        }

        if (!content && !flags.name) {
          ctx.error("Provide content via --content, --file, or stdin pipe.");
          process.exit(1);
        }

        const editMode = ((flags.mode as string | undefined) || "replace") as
          | "replace"
          | "append"
          | "prepend";

        ctx.status(`Updating page (${editMode})...`);

        const { result: page, tokenUsed } = await requestWithFallback(tokens, (t) =>
          client.updatePage(t, workspaceId, docId, pageId, {
            ...(flags.name ? { name: flags.name as string } : {}),
            ...(content
              ? {
                  content,
                  content_edit_mode: editMode,
                  content_format: "text/md",
                }
              : {}),
          }),
        );

        ctx.output({
          pageId,
          name: page.name,
          mode: editMode,
          status: "updated",
        });

        ctx.status(`(via ${tokenUsed.name})`);
        ctx.next([`docs get ${args.urlOrPageId}`]);
      },
    },

    "docs create": {
      description: "Create a new page in a doc",
      args: {
        docId: { position: 0, required: true, description: "Doc ID" },
      },
      flags: {
        workspace: { type: "string", description: "Override workspace ID" },
        name: { type: "string", description: "Page title" },
        content: { type: "string", description: "Page content (markdown)" },
        file: { type: "string", description: "Read content from file" },
        parent: { type: "string", description: "Parent page ID (for nesting)" },
      },
      run: async ({ args, flags, ctx }) => {
        const config = requireConfigWithTeam();
        const tokens = getTokens(config);
        const workspaceId = (flags.workspace as string | undefined) || config.teamId;

        let content: string | undefined;
        const fileFlag = flags.file as string | undefined;
        const contentFlag = flags.content as string | undefined;

        if (fileFlag) {
          content = readFileSync(fileFlag, "utf-8");
        } else if (contentFlag) {
          content = contentFlag;
        }

        ctx.status("Creating page...");
        const { result: page, tokenUsed } = await requestWithFallback(tokens, (t) =>
          client.createPage(t, workspaceId, args.docId, {
            name: flags.name as string | undefined,
            content,
            content_format: "text/md",
            parent_page_id: flags.parent as string | undefined,
          }),
        );

        ctx.output({
          id: page.id,
          name: page.name,
          url: `https://app.clickup.com/${workspaceId}/v/dc/${args.docId}/${page.id}`,
        });

        ctx.status(`(via ${tokenUsed.name})`);
        ctx.next([`docs get https://app.clickup.com/${workspaceId}/v/dc/${args.docId}/${page.id}`]);
      },
    },

    "docs scan": {
      description: "Scan all workspace docs for call pages (date-suffixed titles)",
      flags: {
        workspace: { type: "string", description: "Override workspace ID" },
      },
      run: async ({ flags, ctx }) => {
        const config = requireConfigWithTeam();
        const tokens = getTokens(config);
        const workspaceId = (flags.workspace as string | undefined) || config.teamId;

        ctx.status("Fetching all docs...");
        const { result: docs, tokenUsed } = await requestWithFallback(tokens, (t) =>
          client.getAllDocs(t, workspaceId),
        );

        const activeDocs = docs.filter((d) => !d.deleted);

        type FoundCallPage = {
          pageId: string;
          pageName: string;
          docId: string;
          docName: string;
          docType: number;
          url: string;
        };
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
          ctx.status(
            `Scanning docs ${i + 1}-${Math.min(i + BATCH_SIZE, regularDocs.length)} of ${regularDocs.length}...`,
          );
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

        if (found.length === 0) {
          ctx.empty("No call pages found outside expected locations.");
          return;
        }

        const docTypeLabel = (type: number) =>
          type === 1 ? "Doc" : type === 2 ? "Wiki" : "Meeting";

        ctx.list(
          found.map((f) => ({
            pageName: f.pageName,
            docName: f.docName,
            type: docTypeLabel(f.docType),
            pageId: f.pageId,
          })),
          ["pageName", "docName", "type", "pageId"],
          { resourceName: "call pages" },
        );

        ctx.status(`${found.length} call pages found (via ${tokenUsed.name})`);
      },
    },
  },
});
