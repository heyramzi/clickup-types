/**
 * ClickUp API Client
 *
 * Wraps the existing hierarchy-api functions and adds task/comment endpoints.
 * All methods accept a token and return typed responses.
 */

import type { ClickUpTaskComment, ClickUpTaskCommentsResponse } from "../../types/clickup-comment-types.js";
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

const API_BASE = "https://api.clickup.com/api/v2";

async function request<T>(
	endpoint: string,
	token: string,
	options?: {
		method?: string;
		body?: unknown;
		query?: Record<string, string | undefined>;
	},
): Promise<T> {
	const url = new URL(`${API_BASE}${endpoint}`);

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
		throw new Error(`ClickUp API error (${response.status}): ${errorText}`);
	}

	return response.json() as Promise<T>;
}

// ── User ──────────────────────────────────────────────

export async function getUser(token: string) {
	return request<{ user: { id: number; username: string; email: string; color: string; timezone?: string } }>(
		"/user",
		token,
	);
}

// ── Workspaces ────────────────────────────────────────

export async function getWorkspaces(token: string): Promise<ClickUpWorkspace[]> {
	const res = await request<{ teams: ClickUpWorkspace[] }>("/team", token);
	return res.teams;
}

// ── Team Members ──────────────────────────────────────

export async function getTeamMembers(token: string, teamId: string): Promise<ClickUpTeamMember[]> {
	const res = await request<{ team: { members: ClickUpTeamMember[] } }>(`/team/${teamId}`, token);
	return res.team.members;
}

// ── Spaces ────────────────────────────────────────────

export async function getSpaces(token: string, teamId: string): Promise<ClickUpSpace[]> {
	const res = await request<{ spaces: ClickUpSpace[] }>(`/team/${teamId}/space`, token, {
		query: { archived: "false" },
	});
	return res.spaces;
}

// ── Folders ───────────────────────────────────────────

export async function getFolders(token: string, spaceId: string): Promise<ClickUpFolder[]> {
	const res = await request<{ folders: ClickUpFolder[] }>(`/space/${spaceId}/folder`, token, {
		query: { archived: "false" },
	});
	return res.folders;
}

// ── Lists ─────────────────────────────────────────────

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

// ── Tasks ─────────────────────────────────────────────

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

	return request<ClickUpTasksResponse>(`/list/${listId}/task`, token, { query });
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

	return request<ClickUpTasksResponse>(`/team/${teamId}/task`, token, { query });
}

export async function getTask(token: string, taskId: string): Promise<ClickUpTask> {
	return request<ClickUpTask>(`/task/${taskId}`, token, {
		query: { include_subtasks: "true" },
	});
}

export async function createTask(token: string, listId: string, data: CreateTaskData): Promise<ClickUpTask> {
	return request<ClickUpTask>(`/list/${listId}/task`, token, {
		method: "POST",
		body: data,
	});
}

export async function updateTask(token: string, taskId: string, data: UpdateTaskData): Promise<ClickUpTask> {
	return request<ClickUpTask>(`/task/${taskId}`, token, {
		method: "PUT",
		body: data,
	});
}

// ── Comments ──────────────────────────────────────────

export async function getTaskComments(token: string, taskId: string): Promise<ClickUpTaskComment[]> {
	const res = await request<ClickUpTaskCommentsResponse>(`/task/${taskId}/comment`, token);
	return res.comments;
}

export async function addTaskComment(
	token: string,
	taskId: string,
	commentText: string,
	notifyAll?: boolean,
): Promise<unknown> {
	return request(`/task/${taskId}/comment`, token, {
		method: "POST",
		body: { comment_text: commentText, notify_all: notifyAll ?? false },
	});
}

// ── Time Tracking ─────────────────────────────────────

export async function getTimeEntries(
	token: string,
	teamId: string,
	options?: { start_date?: string; end_date?: string; assignee?: string },
): Promise<TimeEntry[]> {
	const query: Record<string, string | undefined> = {};
	if (options?.start_date) query.start_date = options.start_date;
	if (options?.end_date) query.end_date = options.end_date;
	if (options?.assignee) query.assignee = options.assignee;

	const res = await request<TimeEntriesResponse>(`/team/${teamId}/time_entries`, token, { query });
	return res.data;
}

// ── Tags ──────────────────────────────────────────────

export async function getSpaceTags(token: string, spaceId: string): Promise<Array<{ name: string; tag_fg: string; tag_bg: string }>> {
	const res = await request<{ tags: Array<{ name: string; tag_fg: string; tag_bg: string }> }>(
		`/space/${spaceId}/tag`,
		token,
	);
	return res.tags;
}
