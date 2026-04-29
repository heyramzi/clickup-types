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
  ClickUpCustomField,
  ClickUpCustomFieldResponse,
} from "../../types/clickup-field-types.js";
import type {
  ClickUpFolder,
  ClickUpList,
  ClickUpSpace,
  ClickUpTeamMember,
  ClickUpWorkspace,
} from "../../types/clickup-hierarchy-types.js";
import type {
  AddTaskDependencyData,
  ClickUpChecklist,
  ClickUpTask,
  ClickUpTasks,
  ClickUpTasksResponse,
  CreateChecklistData,
  CreateChecklistItemData,
  CreateTaskData,
  SetCustomFieldValueOptions,
  UpdateTaskData,
} from "../../types/clickup-task-types.js";
import type { TimeEntry, TimeEntriesResponse } from "../../types/clickup-time-types.js";
import type {
  ClickUpView,
  ClickUpViewResponse,
  ClickUpViewsResponse,
  ViewType,
} from "../../types/clickup-view-types.js";
import type { NamedToken } from "./config.js";

const API_V2 = "https://api.clickup.com/api/v2";
const API_V3 = "https://api.clickup.com/api/v3";

interface ClickUpApiError extends Error {
  status: number;
}

function isClickUpApiError(error: unknown): error is ClickUpApiError {
  return error instanceof Error && typeof (error as { status?: unknown }).status === "number";
}

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
    throw Object.assign(new Error(`ClickUp API error (${response.status}): ${errorText}`), {
      status: response.status,
    }) as ClickUpApiError;
  }

  // Handle empty responses (e.g. PUT/DELETE returning 200 with no body)
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ── Token fallback ───────────────────────────────────

function isAccessError(err: unknown): boolean {
  const status = isClickUpApiError(err) ? err.status : undefined;
  if (status === 401 || status === 403) return true;
  // ClickUp returns 404 with ECODE ACCESS_999 for permission-denied (not truly missing)
  if (status === 404 && err instanceof Error && err.message.includes("ACCESS_999")) return true;
  return false;
}

/**
 * Try a request with each token in priority order.
 * On 401/403/ACCESS_999 404, falls back to the next token. Other errors throw immediately.
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
      if (isAccessError(error) && tokens.length > 1) {
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

export async function getSpace(token: string, spaceId: string): Promise<ClickUpSpace> {
  return request<ClickUpSpace>(`/space/${spaceId}`, token);
}

// ── Folders ──────────────────────────────────────────

export async function getFolders(token: string, spaceId: string): Promise<ClickUpFolder[]> {
  const res = await request<{ folders: ClickUpFolder[] }>(`/space/${spaceId}/folder`, token, {
    query: { archived: "false" },
  });
  return res.folders;
}

export async function createFolder(
  token: string,
  spaceId: string,
  name: string,
): Promise<ClickUpFolder> {
  return request<ClickUpFolder>(`/space/${spaceId}/folder`, token, {
    method: "POST",
    body: { name },
  });
}

export async function updateFolder(
  token: string,
  folderId: string,
  data: { name?: string },
): Promise<ClickUpFolder> {
  return request<ClickUpFolder>(`/folder/${folderId}`, token, {
    method: "PUT",
    body: data,
  });
}

export async function deleteFolder(token: string, folderId: string): Promise<void> {
  await request<void>(`/folder/${folderId}`, token, { method: "DELETE" });
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

export interface CreateListData {
  name: string;
  content?: string;
  due_date?: number;
  due_date_time?: boolean;
  priority?: 1 | 2 | 3 | 4;
  assignee?: number;
  status?: string;
}

export interface CreateCustomFieldOptionInput {
  name?: string;
  label?: string;
  color?: string | null;
  orderindex?: number;
}

export interface CreateCustomFieldData {
  name: string;
  type: string;
  type_config?: {
    sorting?: string;
    default?: number;
    placeholder?: string;
    currency_type?: string;
    code_point?: string;
    count?: number;
    options?: CreateCustomFieldOptionInput[];
    [key: string]: unknown;
  };
  required?: boolean;
}

export interface CreateCustomFieldResponse {
  field: ClickUpCustomField & {
    required?: boolean;
  };
}

export async function createListInSpace(
  token: string,
  spaceId: string,
  data: CreateListData,
): Promise<ClickUpList> {
  return request<ClickUpList>(`/space/${spaceId}/list`, token, {
    method: "POST",
    body: data,
  });
}

export async function createListInFolder(
  token: string,
  folderId: string,
  data: CreateListData,
): Promise<ClickUpList> {
  return request<ClickUpList>(`/folder/${folderId}/list`, token, {
    method: "POST",
    body: data,
  });
}

export async function updateList(
  token: string,
  listId: string,
  data: Partial<CreateListData> & { unset_status?: boolean },
): Promise<ClickUpList> {
  return request<ClickUpList>(`/list/${listId}`, token, {
    method: "PUT",
    body: data,
  });
}

export async function deleteList(token: string, listId: string): Promise<void> {
  await request<void>(`/list/${listId}`, token, { method: "DELETE" });
}

// ── Custom Fields ────────────────────────────────────

export async function getListCustomFields(
  token: string,
  listId: string,
): Promise<ClickUpCustomField[]> {
  const res = await request<ClickUpCustomFieldResponse>(`/list/${listId}/field`, token);
  return res.fields;
}

export async function createListCustomField(
  token: string,
  listId: string,
  data: CreateCustomFieldData,
): Promise<CreateCustomFieldResponse> {
  return request<CreateCustomFieldResponse>(`/list/${listId}/field`, token, {
    method: "POST",
    body: data,
  });
}

export async function createWorkspaceCustomField(
  token: string,
  teamId: string,
  data: CreateCustomFieldData,
): Promise<CreateCustomFieldResponse> {
  return request<CreateCustomFieldResponse>(`/team/${teamId}/field`, token, {
    method: "POST",
    body: data,
  });
}

export async function setTaskCustomFieldValue(
  token: string,
  taskId: string,
  fieldId: string,
  value: unknown,
  options?: SetCustomFieldValueOptions,
): Promise<void> {
  await request<void>(`/task/${taskId}/field/${fieldId}`, token, {
    method: "POST",
    body: {
      value,
      value_options: options?.time === undefined ? undefined : { time: options.time },
    },
  });
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

export async function getTask(token: string, taskId: string): Promise<ClickUpTasks> {
  return request<ClickUpTasks>(`/task/${taskId}`, token, {
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

export async function deleteTask(token: string, taskId: string): Promise<void> {
  await request<void>(`/task/${taskId}`, token, {
    method: "DELETE",
  });
}

export async function createTaskChecklist(
  token: string,
  taskId: string,
  data: CreateChecklistData,
): Promise<ClickUpChecklist> {
  return request<ClickUpChecklist>(`/task/${taskId}/checklist`, token, {
    method: "POST",
    body: data,
  });
}

export async function createChecklistItem(
  token: string,
  checklistId: string,
  data: CreateChecklistItemData,
): Promise<unknown> {
  return request(`/checklist/${checklistId}/checklist_item`, token, {
    method: "POST",
    body: data,
  });
}

export async function deleteTaskChecklist(token: string, checklistId: string): Promise<unknown> {
  return request(`/checklist/${checklistId}`, token, {
    method: "DELETE",
  });
}

export async function addTaskDependency(
  token: string,
  taskId: string,
  data: AddTaskDependencyData,
): Promise<unknown> {
  return request(`/task/${taskId}/dependency`, token, {
    method: "POST",
    body: data,
  });
}

export async function removeTaskDependency(
  token: string,
  taskId: string,
  data: AddTaskDependencyData,
): Promise<unknown> {
  return request(`/task/${taskId}/dependency`, token, {
    method: "DELETE",
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

export async function updateComment(
  token: string,
  commentId: string,
  body: { comment_text: string; assignee?: string; resolved?: boolean },
): Promise<unknown> {
  return request(`/comment/${commentId}`, token, {
    method: "PUT",
    body,
  });
}

export async function deleteComment(token: string, commentId: string): Promise<unknown> {
  return request(`/comment/${commentId}`, token, {
    method: "DELETE",
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

// ── Views ────────────────────────────────────────────

export interface CreateViewData {
  name: string;
  type: ViewType;
  grouping?: {
    field: string;
    dir?: number;
    collapsed?: string[];
    ignore?: boolean;
  };
  divide?: {
    field: string | null;
    dir?: number | null;
    collapsed?: boolean;
  };
  sorting?: {
    fields: Array<{ field: string; dir: number }>;
  };
  filters?: {
    op: "AND" | "OR";
    fields: Array<Record<string, unknown>>;
    search?: string;
    show_closed?: boolean;
  };
  columns?: {
    fields: Array<{ field: string; hidden?: boolean; width?: number }>;
  };
  team_sidebar?: {
    assignees: number[];
    assigned_comments?: boolean;
    unassigned_tasks?: boolean;
  };
  settings?: Record<string, unknown>;
}

export async function getListViews(token: string, listId: string): Promise<ClickUpView[]> {
  const res = await request<ClickUpViewsResponse>(`/list/${listId}/view`, token);
  return res.views ?? [];
}

export async function createListView(
  token: string,
  listId: string,
  data: CreateViewData,
): Promise<ClickUpView> {
  const res = await request<ClickUpViewResponse>(`/list/${listId}/view`, token, {
    method: "POST",
    body: data,
  });
  return res.view;
}

export async function createFolderView(
  token: string,
  folderId: string,
  data: CreateViewData,
): Promise<ClickUpView> {
  const res = await request<ClickUpViewResponse>(`/folder/${folderId}/view`, token, {
    method: "POST",
    body: data,
  });
  return res.view;
}

export async function createSpaceView(
  token: string,
  spaceId: string,
  data: CreateViewData,
): Promise<ClickUpView> {
  const res = await request<ClickUpViewResponse>(`/space/${spaceId}/view`, token, {
    method: "POST",
    body: data,
  });
  return res.view;
}

export async function deleteView(token: string, viewId: string): Promise<void> {
  await request<void>(`/view/${viewId}`, token, { method: "DELETE" });
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

export async function getDocs(
  token: string,
  workspaceId: string,
  params?: { parent_type?: string; cursor?: string },
): Promise<ClickUpDocsResponse> {
  const query: Record<string, string | undefined> = {};
  if (params?.parent_type) query.parent_type = params.parent_type;
  if (params?.cursor) query.cursor = params.cursor;

  return request<ClickUpDocsResponse>(`/workspaces/${workspaceId}/docs`, token, {
    apiVersion: "v3",
    query,
  });
}

/** Fetch all docs (types 1+2 default, plus type 3 via parent_type=12), auto-paginating. */
export async function getAllDocs(token: string, workspaceId: string): Promise<ClickUpDoc[]> {
  const allDocs: ClickUpDoc[] = [];
  const seen = new Set<string>();

  async function paginate(params?: { parent_type?: string }) {
    let cursor: string | undefined;
    let prevCursor: string | undefined;
    do {
      const res = await getDocs(token, workspaceId, { ...params, cursor });
      for (const doc of res.docs) {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          allDocs.push(doc);
        }
      }
      prevCursor = cursor;
      cursor = res.next_cursor;
      // Guard against API returning the same cursor (infinite loop)
      if (cursor === prevCursor) break;
    } while (cursor);
  }

  // Fetch type 1+2 (default) then type 3 (parent_type=12)
  await paginate();
  await paginate({ parent_type: "12" });

  return allDocs;
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
