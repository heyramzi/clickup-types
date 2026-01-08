/**
 * ClickUp Hierarchy API
 * 純粋 (Junsui - Purity)
 *
 * Pure fetch functions for ClickUp hierarchy endpoints.
 * Zero dependencies, zero side effects, framework-agnostic.
 *
 * Each function takes an access token and returns typed data.
 * Error handling is left to the caller for maximum flexibility.
 */

import type {
	ClickUpWorkspace,
	ClickUpSpace,
	ClickUpFolder,
	ClickUpList,
	ClickUpWorkspacesResponse,
	ClickUpSpacesResponse,
	ClickUpFoldersResponse,
	ClickUpListsResponse,
	ClickUpSharedHierarchyResponse,
	ClickUpTeamResponse,
	ClickUpTeamMember,
} from "../types/clickup-hierarchy-types";
import type { ClickUpUserResponse } from "../types/clickup-auth-types";

const API_BASE = "https://api.clickup.com/api/v2";

//===============================================
// INTERNAL HELPERS
//===============================================

async function request<T>(
	endpoint: string,
	token: string,
	options?: { archived?: boolean },
): Promise<T> {
	const url = new URL(`${API_BASE}${endpoint}`);

	// Add archived parameter if specified
	if (options?.archived !== undefined) {
		url.searchParams.set("archived", String(options.archived));
	}

	const response = await fetch(url.toString(), {
		headers: {
			Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`ClickUp API error (${response.status}): ${errorText}`);
	}

	return response.json();
}

//===============================================
// USER API
//===============================================

/**
 * Get the authenticated user's information
 */
export async function getUser(token: string): Promise<ClickUpUserResponse> {
	return request<ClickUpUserResponse>("/user", token);
}

//===============================================
// WORKSPACE (TEAM) API
//===============================================

/**
 * Get all workspaces (teams) the user has access to
 */
export async function getWorkspaces(
	token: string,
): Promise<ClickUpWorkspace[]> {
	const response = await request<ClickUpWorkspacesResponse>("/team", token);
	return response.teams;
}

/**
 * Get a specific team with members
 */
export async function getTeam(
	token: string,
	teamId: string,
): Promise<ClickUpTeamResponse> {
	return request<ClickUpTeamResponse>(`/team/${teamId}`, token);
}

/**
 * Get team members for a workspace
 */
export async function getTeamMembers(
	token: string,
	teamId: string,
): Promise<ClickUpTeamMember[]> {
	const response = await getTeam(token, teamId);
	return response.team.members;
}

//===============================================
// SPACE API
//===============================================

/**
 * Get all spaces in a workspace
 */
export async function getSpaces(
	token: string,
	teamId: string,
	options?: { archived?: boolean },
): Promise<ClickUpSpace[]> {
	const response = await request<ClickUpSpacesResponse>(
		`/team/${teamId}/space`,
		token,
		{ archived: options?.archived ?? false },
	);
	return response.spaces;
}

//===============================================
// FOLDER API
//===============================================

/**
 * Get all folders in a space
 */
export async function getFolders(
	token: string,
	spaceId: string,
	options?: { archived?: boolean },
): Promise<ClickUpFolder[]> {
	const response = await request<ClickUpFoldersResponse>(
		`/space/${spaceId}/folder`,
		token,
		{ archived: options?.archived ?? false },
	);
	return response.folders;
}

//===============================================
// LIST API
//===============================================

/**
 * Get folderless lists in a space (lists not inside any folder)
 */
export async function getFolderlessLists(
	token: string,
	spaceId: string,
	options?: { archived?: boolean },
): Promise<ClickUpList[]> {
	const response = await request<ClickUpListsResponse>(
		`/space/${spaceId}/list`,
		token,
		{ archived: options?.archived ?? false },
	);
	return response.lists;
}

/**
 * Get all lists in a folder
 */
export async function getLists(
	token: string,
	folderId: string,
	options?: { archived?: boolean },
): Promise<ClickUpList[]> {
	const response = await request<ClickUpListsResponse>(
		`/folder/${folderId}/list`,
		token,
		{ archived: options?.archived ?? false },
	);
	return response.lists;
}

/**
 * Get a single list by ID
 */
export async function getList(
	token: string,
	listId: string,
): Promise<ClickUpList> {
	return request<ClickUpList>(`/list/${listId}`, token);
}

//===============================================
// SHARED HIERARCHY API
//===============================================

/**
 * Get shared hierarchy for a workspace
 * Returns folders and lists that are shared with the user
 */
export async function getSharedHierarchy(
	token: string,
	teamId: string,
): Promise<ClickUpSharedHierarchyResponse> {
	return request<ClickUpSharedHierarchyResponse>(
		`/team/${teamId}/shared`,
		token,
	);
}

//===============================================
// CONVENIENCE FUNCTIONS
//===============================================

/**
 * Get all lists in a space (both folderless and inside folders)
 */
export async function getAllListsInSpace(
	token: string,
	spaceId: string,
	options?: { archived?: boolean },
): Promise<ClickUpList[]> {
	const [folders, folderlessLists] = await Promise.all([
		getFolders(token, spaceId, options),
		getFolderlessLists(token, spaceId, options),
	]);

	// Extract lists from folders
	const folderLists = folders.flatMap((folder) => folder.lists || []);

	return [...folderlessLists, ...folderLists];
}

/**
 * Get the full hierarchy for a workspace
 * Returns spaces with their folders and lists
 */
export async function getFullHierarchy(
	token: string,
	teamId: string,
	options?: { archived?: boolean },
): Promise<{
	spaces: Array<
		ClickUpSpace & {
			folders: Array<ClickUpFolder & { lists: ClickUpList[] }>;
			folderlessLists: ClickUpList[];
		}
	>;
}> {
	const spaces = await getSpaces(token, teamId, options);

	const spacesWithHierarchy = await Promise.all(
		spaces.map(async (space) => {
			const [folders, folderlessLists] = await Promise.all([
				getFolders(token, space.id, options),
				getFolderlessLists(token, space.id, options),
			]);

			// Folders already include their lists from the API
			const foldersWithLists = folders.map((folder) => ({
				...folder,
				lists: folder.lists || [],
			}));

			return {
				...space,
				folders: foldersWithLists,
				folderlessLists,
			};
		}),
	);

	return { spaces: spacesWithHierarchy };
}
