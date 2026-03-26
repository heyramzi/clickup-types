/**
 * ClickUp API Client
 *
 * Wraps the ClickUp API with typed methods.
 * Supports priority-based token fallback: if the first token gets a 401/403,
 * automatically retries with the next token in the list.
 */

import type {
  ClickUpTaskComment,
  ClickUpTaskCommentsResponse,
  CreateCommentBody,
} from "../../types/clickup-comment-types.js";
import type {
  ClickUpCreatePageRequest,
  ClickUpDoc,
  ClickUpDocPageListing,
  ClickUpDocsResponse,
  ClickUpEditPageRequest,
  ClickUpPage,
} from "../../types/clickup-doc-types.js";
import type {
  ClickUpFolder,
  ClickUpList,
  ClickUpSpace,
  ClickUpTeamMember,
  ClickUpWorkspace,
} from "../../types/clickup-hierarchy-types.js";
import type {
  ClickUpTask,
  ClickUpTasksResponse,
  CreateTaskData,
  UpdateTaskData,
} from "../../types/clickup-task-types.js";
import type { TimeEntry, TimeEntriesResponse } from "../../types/clickup-time-types.js";
import type { NamedToken } from "./config.js";

const API_V2 = "https://api.clickup.com/api/v2";
const API_V3 = "https://api.clickup.com/api/v3";

// ── Core request ─────────────────────────────────────

async function request<T>(
  endpoint: string,
  token: string,
  options?: {
    method?: string;
    body?: unknown;
    query?: Record<string, string | undefined>;
    apiVersion?: "v2" | "v3";
  },
): Promise<T> {
  const base = options?.apiVersion === "v3" ? API_V3 : API_V2;
  const url = new URL(`${base}${endpoint}`);

  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
  }

  const init: RequestInit = {
    method: options?.method || "GET",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  };

  if (options?.body) {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), init);

  if (!response.ok) {
    const errorText = await response.text();
    const err = new Error(`ClickUp API error (${response.status}): ${errorText}`);
    (err as any).status = response.status;
    throw err;
  }

  // Handle empty responses (e.g. PUT/DELETE returning 200 with no body)
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ── Token fallback ───────────────────────────────────

function isAccessError(status: number): boolean {
  return status === 401 || status === 403;
}

/**
 * Try a request with each token in priority order.
 * On 401/403, falls back to the next token. Other errors throw immediately.
 */
export async function requestWithFallback<T>(
  tokens: NamedToken[],
  fn: (token: string) => Promise<T>,
): Promise<{ result: T; tokenUsed: NamedToken }> {
  let lastError: Error = new Error("No tokens configured");

  for (const namedToken of tokens) {
    try {
      const result = await fn(namedToken.token);
      return { result, tokenUsed: namedToken };
    } catch (error) {
      lastError = error as Error;
      if (isAccessError((error as any).status) && tokens.length > 1) {
        // Access error — try next token
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

// ── User ─────────────────────────────────────────────

export async function getUser(token: string) {
  return request<{
    user: {
      id: number;
      username: string;
      email: string;
      color: string;
      timezone?: string;
    };
  }>("/user", token);
}

// ── Workspaces ───────────────────────────────────────

export async function getWorkspaces(token: string): Promise<ClickUpWorkspace[]> {
  const res = await request<{ teams: ClickUpWorkspace[] }>("/team", token);
  return res.teams;
}

// ── Team Members ─────────────────────────────────────

export async function getTeamMembers(token: string, teamId: string): Promise<ClickUpTeamMember[]> {
  const res = await request<{ team: { members: ClickUpTeamMember[] } }>(`/team/${teamId}`, token);
  return res.team.members;
}

// ── Spaces ───────────────────────────────────────────

export async function getSpaces(token: string, teamId: string): Promise<ClickUpSpace[]> {
  const res = await request<{ spaces: ClickUpSpace[] }>(`/team/${teamId}/space`, token, {
    query: { archived: "false" },
  });
  return res.spaces;
}

// ── Folders ──────────────────────────────────────────

export async function getFolders(token: string, spaceId: string): Promise<ClickUpFolder[]> {
  const res = await request<{ folders: ClickUpFolder[] }>(`/space/${spaceId}/folder`, token, {
    query: { archived: "false" },
  });
  return res.folders;
}

// ── Lists ────────────────────────────────────────────

export async function getFolderlessLists(token: string, spaceId: string): Promise<ClickUpList[]> {
  const res = await request<{ lists: ClickUpList[] }>(`/space/${spaceId}/list`, token, {
    query: { archived: "false" },
  });
  return res.lists;
}

export async function getListsInFolder(token: string, folderId: string): Promise<ClickUpList[]> {
  const res = await request<{ lists: ClickUpList[] }>(`/folder/${folderId}/list`, token, {
    query: { archived: "false" },
  });
  return res.lists;
}

export async function getList(token: string, listId: string): Promise<ClickUpList> {
  return request<ClickUpList>(`/list/${listId}`, token);
}

// ── Tasks ────────────────────────────────────────────

export async function getTasks(
  token: string,
  listId: string,
  options?: {
    page?: number;
    assignees?: string[];
    statuses?: string[];
    include_closed?: boolean;
    subtasks?: boolean;
    order_by?: string;
    reverse?: boolean;
  },
): Promise<ClickUpTasksResponse> {
  const query: Record<string, string | undefined> = {
    page: String(options?.page ?? 0),
    include_closed: String(options?.include_closed ?? false),
    subtasks: String(options?.subtasks ?? false),
  };
  if (options?.order_by) query.order_by = options.order_by;
  if (options?.reverse !== undefined) query.reverse = String(options.reverse);
  if (options?.assignees?.length) query["assignees[]"] = options.assignees.join(",");
  if (options?.statuses?.length) query["statuses[]"] = options.statuses.join(",");

  return request<ClickUpTasksResponse>(`/list/${listId}/task`, token, {
    query,
  });
}

export async function getFilteredTasks(
  token: string,
  teamId: string,
  options?: {
    page?: number;
    assignees?: string[];
    statuses?: string[];
    list_ids?: string[];
    space_ids?: string[];
    include_closed?: boolean;
    subtasks?: boolean;
    order_by?: string;
    reverse?: boolean;
  },
): Promise<ClickUpTasksResponse> {
  const query: Record<string, string | undefined> = {
    page: String(options?.page ?? 0),
    include_closed: String(options?.include_closed ?? false),
    subtasks: String(options?.subtasks ?? false),
  };
  if (options?.order_by) query.order_by = options.order_by;
  if (options?.reverse !== undefined) query.reverse = String(options.reverse);
  if (options?.assignees?.length) query["assignees[]"] = options.assignees.join(",");
  if (options?.statuses?.length) query["statuses[]"] = options.statuses.join(",");
  if (options?.list_ids?.length) query["list_ids[]"] = options.list_ids.join(",");
  if (options?.space_ids?.length) query["space_ids[]"] = options.space_ids.join(",");

  return request<ClickUpTasksResponse>(`/team/${teamId}/task`, token, {
    query,
  });
}

export async function getTask(token: string, taskId: string): Promise<ClickUpTask> {
  return request<ClickUpTask>(`/task/${taskId}`, token, {
    query: { include_subtasks: "true" },
  });
}

export async function createTask(
  token: string,
  listId: string,
  data: CreateTaskData,
): Promise<ClickUpTask> {
  return request<ClickUpTask>(`/list/${listId}/task`, token, {
    method: "POST",
    body: data,
  });
}

export async function updateTask(
  token: string,
  taskId: string,
  data: UpdateTaskData,
): Promise<ClickUpTask> {
  return request<ClickUpTask>(`/task/${taskId}`, token, {
    method: "PUT",
    body: data,
  });
}

// ── Comments ─────────────────────────────────────────

export async function getTaskComments(
  token: string,
  taskId: string,
): Promise<ClickUpTaskComment[]> {
  const res = await request<ClickUpTaskCommentsResponse>(`/task/${taskId}/comment`, token);
  return res.comments;
}

export async function addTaskComment(
  token: string,
  taskId: string,
  body: CreateCommentBody,
): Promise<unknown> {
  return request(`/task/${taskId}/comment`, token, {
    method: "POST",
    body: { ...body, notify_all: body.notify_all ?? false },
  });
}

// ── Time Tracking ────────────────────────────────────

export async function getTimeEntries(
  token: string,
  teamId: string,
  options?: {
    start_date?: string;
    end_date?: string;
    assignee?: string;
  },
): Promise<TimeEntry[]> {
  const query: Record<string, string | undefined> = {};
  if (options?.start_date) query.start_date = options.start_date;
  if (options?.end_date) query.end_date = options.end_date;
  if (options?.assignee) query.assignee = options.assignee;

  const res = await request<TimeEntriesResponse>(`/team/${teamId}/time_entries`, token, { query });
  return res.data;
}

// ── Tags ─────────────────────────────────────────────

export async function getSpaceTags(
  token: string,
  spaceId: string,
): Promise<Array<{ name: string; tag_fg: string; tag_bg: string }>> {
  const res = await request<{
    tags: Array<{ name: string; tag_fg: string; tag_bg: string }>;
  }>(`/space/${spaceId}/tag`, token);
  return res.tags;
}

// ── Docs (v3 API) ────────────────────────────────────

export async function getDocs(token: string, workspaceId: string): Promise<ClickUpDoc[]> {
  const res = await request<ClickUpDocsResponse>(`/workspaces/${workspaceId}/docs`, token, {
    apiVersion: "v3",
  });
  return res.docs;
}

export async function getDocPages(
  token: string,
  workspaceId: string,
  docId: string,
): Promise<ClickUpPage[]> {
  return request<ClickUpPage[]>(`/workspaces/${workspaceId}/docs/${docId}/pages`, token, {
    apiVersion: "v3",
    query: { content_format: "text/md" },
  });
}

export async function getDocPageListing(
  token: string,
  workspaceId: string,
  docId: string,
): Promise<ClickUpDocPageListing[]> {
  return request<ClickUpDocPageListing[]>(
    `/workspaces/${workspaceId}/docs/${docId}/page_listing`,
    token,
    { apiVersion: "v3" },
  );
}

export async function getPage(
  token: string,
  workspaceId: string,
  docId: string,
  pageId: string,
): Promise<ClickUpPage> {
  return request<ClickUpPage>(`/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`, token, {
    apiVersion: "v3",
    query: { content_format: "text/md" },
  });
}

export async function createPage(
  token: string,
  workspaceId: string,
  docId: string,
  page: ClickUpCreatePageRequest,
): Promise<ClickUpPage> {
  return request<ClickUpPage>(`/workspaces/${workspaceId}/docs/${docId}/pages`, token, {
    apiVersion: "v3",
    method: "POST",
    body: page,
  });
}

export async function updatePage(
  token: string,
  workspaceId: string,
  docId: string,
  pageId: string,
  page: ClickUpEditPageRequest,
): Promise<ClickUpPage> {
  return request<ClickUpPage>(`/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`, token, {
    apiVersion: "v3",
    method: "PUT",
    body: page,
  });
}
