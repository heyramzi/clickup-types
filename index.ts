/**
 * ClickUp Utils
 *
 * Universal types and services for ClickUp API integration.
 * Import directly from subfolders for framework-specific code.
 */

//===============================================
// TYPES
//===============================================

export * from "./types/clickup-api-constants.js";
export * from "./types/clickup-auth-types.js";
export * from "./types/clickup-chat-types.js";
export * from "./types/clickup-comment-types.js";
export * from "./types/clickup-doc-types.js";
export * from "./types/clickup-field-types.js";
export * from "./types/clickup-hierarchy-types.js";
export * from "./types/clickup-task-transformers.js";
export * from "./types/clickup-task-types.js";
export * from "./types/clickup-time-types.js";
export * from "./types/clickup-view-types.js";

//===============================================
// CORE - Framework-agnostic
//===============================================

export {
  buildAuthUrl,
  exchangeCodeForToken,
  type OAuthTokenExchangeParams,
  type OAuthUrlParams,
} from "./core/oauth-protocol.js";

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
} from "./transformers/hierarchy-transformers.js";

export {
  type DescriptionLike,
  normalizeTaskDescription,
} from "./transformers/description-transformers.js";

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
  getSpace,
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
} from "./api/hierarchy-api.js";

//===============================================
// Framework-specific services
// Import directly from:
//   - sveltekit/oauth.service
//   - sveltekit/token.service
//   - nextjs/oauth.service
//===============================================
