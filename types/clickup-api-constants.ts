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

// Convenience constants for common URL access
export const CLICKUP_API_URL = ClickUpApiUrl.V2;
export const CLICKUP_AUTH_URL = ClickUpApiUrl.AUTH;

// HTTP Methods supported by the ClickUp API
export enum HttpMethod {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
	PATCH = "PATCH",
}

// Simple endpoint fragments for building API URLs (legacy pattern)
export const ENDPOINT = {
	WORKSPACE: "/team",
	SPACE: "/space",
	FOLDER: "/folder",
	LIST: "/list",
	TASK: "/task",
	USER: "/user",
	TIME: "/time_entries",
	VIEW: "/view",
	OAUTH: "/oauth/token",
	SHARED: "/shared",
	WEBHOOK: "/webhook",
} as const;

// Type for valid endpoint paths
export type ClickUpEndpoint = `/${string}`;

// Generic endpoint builder type alias
export type BuildEndpoint<T extends string = string> = `/${T}`;

// API Endpoints - standardized as full path templates
export enum Endpoint {
	// Auth endpoints
	OAUTH_TOKEN = "/oauth/token",

	// User endpoints
	USER = "/user",

	// Workspace endpoints
	WORKSPACE = "/team",
	WORKSPACE_SPACES = "/team/{team_id}/space",
	WORKSPACE_SHARED = "/team/{team_id}/shared",

	// Space endpoints
	SPACE_FOLDERS = "/space/{space_id}/folder",
	SPACE_LISTS = "/space/{space_id}/list",

	// Folder endpoints
	FOLDER_LISTS = "/folder/{folder_id}/list",

	// List endpoints
	LIST_TASKS = "/list/{list_id}/task",

	// Task endpoints
	TASK_COMMENTS = "/task/{task_id}/comment",
	TASK_ATTACHMENTS = "/task/{task_id}/attachment",

	// Time tracking endpoints
	TIME_ENTRIES = "/team/{team_id}/time_entries",

	// v3 Chat API endpoints
	CHAT_CHANNELS = "/chat/channels",
	CHAT_CHANNEL = "/chat/channels/{channel_id}",
	CHAT_CHANNEL_LOCATION = "/chat/channels/location",
	CHAT_DIRECT_MESSAGE = "/chat/channels/direct_message",
	CHAT_CHANNEL_MESSAGES = "/chat/channels/{channel_id}/messages",
}

// Simple utility to create endpoints with parameters
export const createEndpoint = (
	endpoint: Endpoint,
	params: Record<string, string> = {},
): string => {
	let url = endpoint as string;
	for (const [key, value] of Object.entries(params)) {
		url = url.replace(`{${key}}`, value);
	}
	return url;
};

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
	message?: string;
	meta?: {
		failures?: Array<{ message: string; index: number }>;
		authorization_failures?: Array<{
			message: string;
			index: number;
			object_type?: string;
			object_id?: string;
			workspace_id?: string;
			code?: string;
			invalid_permissions?: string[];
		}>;
	};
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
	TIMEENTRY_: "TIME_TRACKING", // Time tracking related errors
};

// Specific error codes for common authentication and API failures
export const CLICKUP_AUTH_ERROR_CODES = {
	INVALID_TOKEN: "OAUTH_01_001",
	TOKEN_EXPIRED: "OAUTH_01_002",
	INVALID_GRANT: "OAUTH_02_001",
	INSUFFICIENT_SCOPE: "OAUTH_03_001",
	STORAGE_LIMIT_EXCEEDED: "GBUSED_005",
	INVALID_STATUS: "CRTSK_001", // Task status error code
	INVALID_FOLDER_ID: "INPUT_011", // Invalid folder ID error code
	INVALID_ATTACHMENT_FORMAT: "ATTCH_045",
	NO_DATA_FOUND: "NO_DATA", // Fictive error code, used to indicate if we get empty arrays
} as const;

// Type to ensure only valid auth error codes are used
export type AuthErrorCode =
	(typeof CLICKUP_AUTH_ERROR_CODES)[keyof typeof CLICKUP_AUTH_ERROR_CODES];

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
	[key: string]: string | number | boolean | string[] | undefined;
}

// Type guard to check if a response is a ClickUp API error
export function isClickUpError(response: unknown): response is ClickUpApiError {
	return (
		typeof response === "object" &&
		response !== null &&
		"err" in response &&
		"ECODE" in response
	);
}
