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
// Framework-specific services
// Import directly from:
//   - sveltekit/oauth.service
//   - sveltekit/token.service
//   - nextjs/oauth.service
//===============================================
