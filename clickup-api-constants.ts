//===============================================
// CORE API TYPES
//===============================================

// Supported ClickUp API versions for different endpoints
export type ClickUpApiVersion = "v2" | "v3";

// Base URLs for different ClickUp API versions and authentication
export enum ClickUpApiUrl {
	V2 = "https://api.clickup.com/api/v2",
	V3 = "https://api.clickup.com/api/v3",
	AUTH = "https://app.clickup.com/api",
}

// HTTP Methods supported by the ClickUp API
export enum HttpMethod {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	PATCH = "PATCH",
}

// API Endpoints
export enum Endpoint {
	// Auth endpoints
	OAUTH_TOKEN = "/oauth/token",

	// User endpoints
	USER = "/user",

	// Workspace endpoints
	WORKSPACE = "/team",
	SPACE = "/space",
	FOLDER = "/folder",
	LIST = "/list",

	// Task endpoints
	TASK = "/task",
	TASKS = "/list/{list_id}/task",
	COMMENT = "/comment",
	ATTACHMENT = "/attachment",

	// Shared hierarchy endpoints
	SHARED_HIERARCHY = "/shared",
	TIME_ENTRIES = "/team/{team_id}/time_entries",
}

// Centralized path builder for ClickUp API endpoints
export const CLICKUP_PATH = {
	// Authentication endpoint for token exchange
	oauth: () => "/oauth/token",
	// Get current user details
	user: () => "/user",
	// Get workspace (team) information
	workspace: () => "/team",
	// Document-related endpoints grouped together
	docs: {
		// Get all docs in a workspace
		list: (workspaceId: string) => `/workspaces/${workspaceId}/docs`,
		// Get hierarchical page structure of a doc
		pageListing: (workspaceId: string, docId: string) =>
			`/workspaces/${workspaceId}/docs/${docId}/pagelisting`,
		// Get full content of all pages in a doc
		pages: (workspaceId: string, docId: string) =>
			`/workspaces/${workspaceId}/docs/${docId}/pages`,
	},
} as const;

// OAuth related types
export interface ClickUpOAuthParams {
	client_id: string;
	redirect_uri: string;
	state: string;
}

export interface AuthTokenResponse {
	access_token: string;
	token_type: "Bearer";
}

// Union type to handle both successful responses and API errors
export type ApiResponse<T> = T | ClickUpApiError;

// Standard error structure returned by ClickUp API
export interface ClickUpApiError {
	err: string;
	ECODE: string;
}

//===============================================
// ERROR HANDLING TYPES
//===============================================

// Maps error code prefixes to categories for consistent error handling
export const CLICKUP_ERROR_TYPE_MAP: Record<string, string> = {
	OAUTH_01: "AUTH", // Authentication failures
	OAUTH_02: "ACCESS", // Authorization failures
	OAUTH_03: "ACCESS", // Permission denied errors
	OAUTH_17: "WEBHOOK", // Webhook configuration issues
	RATE_: "RATE_LIMIT", // API rate limiting errors
	CORS_: "INVALID_REQUEST", // Cross-origin request issues
	SHARD_: "NOT_FOUND", // Resource not found errors
	GBUSED_: "STORAGE_LIMIT", // Storage quota exceeded
	CRTSK_: "TASK_ERROR", // Task creation/modification errors
	INPUT_: "VALIDATION", // Input validation failures
	NO_: "NO_DATA", // No data available errors
	ATTCH_: "ATTACHMENT", // Attachment handling errors
};

// Query Parameters Types
export interface GetTasksQueryParams {
	page?: number;
	order_by?: string;
	reverse?: boolean;
	subtasks?: boolean;
	include_closed?: boolean;
	assignees?: string[];
	due_date_gt?: number;
	due_date_lt?: number;
	date_created_gt?: number;
	date_created_lt?: number;
	date_updated_gt?: number;
	date_updated_lt?: number;
	[key: string]: any;
}
