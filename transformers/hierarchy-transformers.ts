/**
 * ClickUp Hierarchy Transformers
 * 純粋 (Junsui - Purity)
 *
 * Pure transformation functions for converting ClickUp API responses
 * into simplified storage-friendly structures.
 *
 * Zero dependencies, zero side effects, framework-agnostic.
 */

import type {
	ClickUpWorkspace,
	ClickUpSpace,
	ClickUpFolder,
	ClickUpList,
} from "../types/clickup-hierarchy-types";
import type { ClickUpView } from "../types/clickup-view-types";
import type { ClickUpUserResponse } from "../types/clickup-auth-types";

//===============================================
// STORED TYPES
//===============================================

export interface StoredWorkspace {
	id: string;
	name: string;
	color: string;
	avatar: string | null;
}

export interface StoredSpace {
	id: string;
	name: string;
}

export interface StoredFolder {
	id: string;
	name: string;
	lists?: StoredList[];
}

export interface StoredList {
	id: string;
	name: string;
	space?: { name: string };
	folder?: { name: string };
	status?: { color: string };
}

export interface StoredView {
	id: string;
	name: string;
	type: string;
}

export interface StoredUser {
	id: string;
	username: string;
	email: string;
	timezone?: string;
}

//===============================================
// SINGLE ENTITY TRANSFORMERS
//===============================================

/**
 * Transform a ClickUp workspace to storage format
 */
export function transformWorkspace(
	workspace: ClickUpWorkspace,
): StoredWorkspace {
	return {
		id: workspace.id,
		name: workspace.name,
		color: workspace.color,
		avatar: workspace.avatar ?? null,
	};
}

/**
 * Transform a ClickUp space to storage format
 */
export function transformSpace(space: ClickUpSpace): StoredSpace {
	return {
		id: space.id,
		name: space.name,
	};
}

/**
 * Transform a ClickUp folder to storage format
 * Optionally includes nested lists
 */
export function transformFolder(
	folder: ClickUpFolder,
	options?: { includeLists?: boolean },
): StoredFolder {
	const stored: StoredFolder = {
		id: folder.id,
		name: folder.name,
	};

	if (options?.includeLists && folder.lists) {
		stored.lists = folder.lists.map((list) => transformList(list));
	}

	return stored;
}

/**
 * Transform a ClickUp list to storage format
 * Optionally includes context (space/folder names)
 */
export function transformList(
	list: ClickUpList,
	context?: { spaceName?: string; folderName?: string },
): StoredList {
	const stored: StoredList = {
		id: list.id,
		name: list.name,
	};

	// Add space context if available
	if (list.space?.name || context?.spaceName) {
		stored.space = { name: list.space?.name || context?.spaceName || "" };
	}

	// Add folder context if available
	if (context?.folderName) {
		stored.folder = { name: context.folderName };
	}

	// Add status color if available
	if (list.status?.color) {
		stored.status = { color: list.status.color };
	}

	return stored;
}

/**
 * Transform a ClickUp view to storage format
 */
export function transformView(view: ClickUpView): StoredView {
	return {
		id: view.id,
		name: view.name,
		type: view.type,
	};
}

/**
 * Transform a ClickUp user response to storage format
 */
export function transformUser(response: ClickUpUserResponse): StoredUser {
	return {
		id: String(response.user.id),
		username: response.user.username,
		email: response.user.email,
		timezone: response.user.timezone,
	};
}

//===============================================
// BATCH TRANSFORMERS
//===============================================

/**
 * Transform an array of workspaces
 */
export function transformWorkspaces(
	workspaces: ClickUpWorkspace[],
): StoredWorkspace[] {
	return workspaces.map(transformWorkspace);
}

/**
 * Transform an array of spaces
 */
export function transformSpaces(spaces: ClickUpSpace[]): StoredSpace[] {
	return spaces.map(transformSpace);
}

/**
 * Transform an array of folders
 */
export function transformFolders(
	folders: ClickUpFolder[],
	options?: { includeLists?: boolean },
): StoredFolder[] {
	return folders.map((folder) => transformFolder(folder, options));
}

/**
 * Transform an array of lists
 */
export function transformLists(
	lists: ClickUpList[],
	context?: { spaceName?: string; folderName?: string },
): StoredList[] {
	return lists.map((list) => transformList(list, context));
}

/**
 * Transform an array of views
 */
export function transformViews(views: ClickUpView[]): StoredView[] {
	return views.map(transformView);
}
