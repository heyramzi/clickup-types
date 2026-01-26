/**
 * ClickUp Utils
 *
 * Universal types and services for ClickUp API integration.
 * Import directly from subfolders for framework-specific code.
 */

//===============================================
// TYPES
//===============================================

export * from "./types/clickup-api-constants";
export * from "./types/clickup-auth-types";
export * from "./types/clickup-chat-types";
export * from "./types/clickup-comment-types";
export * from "./types/clickup-doc-types";
export * from "./types/clickup-field-types";
export * from "./types/clickup-hierarchy-types";
export * from "./types/clickup-task-transformers";
export * from "./types/clickup-task-types";
export * from "./types/clickup-time-types";
export * from "./types/clickup-view-types";

//===============================================
// CORE - Framework-agnostic
//===============================================

export {
	buildAuthUrl,
	exchangeCodeForToken,
	type OAuthTokenExchangeParams,
	type OAuthUrlParams,
} from "./core/oauth-protocol";

//===============================================
// TRANSFORMERS - Pure transformation functions
//===============================================

export {
	type StoredFolder,
	type StoredList,
	type StoredSpace,
	type StoredUser,
	type StoredView,
	// Stored types
	type StoredWorkspace,
	transformFolder,
	transformFolders,
	transformList,
	transformLists,
	transformSpace,
	transformSpaces,
	transformUser,
	transformView,
	transformViews,
	// Single entity transformers
	transformWorkspace,
	// Batch transformers
	transformWorkspaces,
} from "./transformers/hierarchy-transformers";

//===============================================
// API - Pure fetch functions
//===============================================

export {
	// Convenience
	getAllListsInSpace,
	// Lists
	getFolderlessLists,
	// Folders
	getFolders,
	getFullHierarchy,
	getList,
	getLists,
	// Shared
	getSharedHierarchy,
	// Spaces
	getSpaces,
	getTeam,
	getTeamMembers,
	// User
	getUser,
	// Workspaces
	getWorkspaces,
} from "./api/hierarchy-api";

//===============================================
// Framework-specific services
// Import directly from:
//   - sveltekit/oauth.service
//   - sveltekit/token.service
//   - nextjs/oauth.service
//===============================================
