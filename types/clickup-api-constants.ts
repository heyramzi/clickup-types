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
  CHAT_CHANNEL_MEMBERS = "/chat/channels/{channel_id}/members",
  CHAT_CHANNEL_FOLLOWERS = "/chat/channels/{channel_id}/followers",
  CHAT_MESSAGE = "/chat/messages/{message_id}",
  CHAT_MESSAGE_REPLIES = "/chat/messages/{message_id}/replies",
  CHAT_MESSAGE_REACTIONS = "/chat/messages/{message_id}/reactions",
  CHAT_MESSAGE_REACTION = "/chat/messages/{message_id}/reactions/{reaction}",
  CHAT_MESSAGE_TAGGED_USERS = "/chat/messages/{message_id}/tagged_users",

  // v3 Docs API endpoints
  DOCS = "/docs",
  DOC = "/docs/{doc_id}",
  DOC_PAGE_LISTING = "/docs/{doc_id}/pagelisting",
  DOC_PAGES = "/docs/{doc_id}/pages",
  DOC_PAGE = "/docs/{doc_id}/pages/{page_id}",

  // v3 Attachments API endpoints
  ENTITY_ATTACHMENTS = "/{entity_type}/{entity_id}/attachments",

  // v3 Audit Logs API endpoint
  AUDIT_LOGS = "/auditlogs",

  // v3 ACLs API endpoint
  ACLS = "/{object_type}/{object_id}/acls",
}

// Simple utility to create endpoints with parameters
export const createEndpoint = (endpoint: Endpoint, params: Record<string, string> = {}): string => {
  let url = endpoint as string;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, value);
  }
  return url;
};

// Centralized path builder for ClickUp API endpoints
// v2 paths are relative to /api/v2, v3 paths are relative to /api/v3/workspaces/{workspace_id}
export const CLICKUP_PATH = {
  oauth: () => "/oauth/token",
  user: () => "/user",
  workspace: () => "/team",
  docs: {
    list: (workspaceId: string) => `/workspaces/${workspaceId}/docs`,
    get: (workspaceId: string, docId: string) => `/workspaces/${workspaceId}/docs/${docId}`,
    pageListing: (workspaceId: string, docId: string) =>
      `/workspaces/${workspaceId}/docs/${docId}/pagelisting`,
    pages: (workspaceId: string, docId: string) => `/workspaces/${workspaceId}/docs/${docId}/pages`,
    page: (workspaceId: string, docId: string, pageId: string) =>
      `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`,
  },
  chat: {
    channels: (workspaceId: string) => `/workspaces/${workspaceId}/chat/channels`,
    channel: (workspaceId: string, channelId: string) =>
      `/workspaces/${workspaceId}/chat/channels/${channelId}`,
    locationChannel: (workspaceId: string) => `/workspaces/${workspaceId}/chat/channels/location`,
    directMessage: (workspaceId: string) =>
      `/workspaces/${workspaceId}/chat/channels/direct_message`,
    messages: (workspaceId: string, channelId: string) =>
      `/workspaces/${workspaceId}/chat/channels/${channelId}/messages`,
    members: (workspaceId: string, channelId: string) =>
      `/workspaces/${workspaceId}/chat/channels/${channelId}/members`,
    followers: (workspaceId: string, channelId: string) =>
      `/workspaces/${workspaceId}/chat/channels/${channelId}/followers`,
    message: (workspaceId: string, messageId: string) =>
      `/workspaces/${workspaceId}/chat/messages/${messageId}`,
    replies: (workspaceId: string, messageId: string) =>
      `/workspaces/${workspaceId}/chat/messages/${messageId}/replies`,
    reactions: (workspaceId: string, messageId: string) =>
      `/workspaces/${workspaceId}/chat/messages/${messageId}/reactions`,
    taggedUsers: (workspaceId: string, messageId: string) =>
      `/workspaces/${workspaceId}/chat/messages/${messageId}/tagged_users`,
  },
} as const;

// OAuth related types
export interface ClickUpOAuthParams {
  client_id: string;
  redirect_uri: string;
  state: string;
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

// Type guard to check if a response is a ClickUp API error
export function isClickUpError(response: unknown): response is ClickUpApiError {
  return (
    typeof response === "object" && response !== null && "err" in response && "ECODE" in response
  );
}
