//===============================================
// CORE API TYPES
//===============================================

// Define allowed API versions
export type ClickUpApiVersion = 'v2' | 'v3';

// Define API base URLs
export enum ClickUpApiUrl {
  V2 = 'https://api.clickup.com/api/v2',
  V3 = 'https://api.clickup.com/api/v3',
  AUTH = 'https://app.clickup.com/api'
}

// Define allowed HTTP methods for making requests to ClickUp API
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

// Map of all available ClickUp API endpoint paths
export enum ClickUpEndpoint {
  OAUTH_TOKEN = '/oauth/token',
  WORKSPACE = '/team',
  SPACE = '/space',
  LIST = '/list',
  FOLDER = '/folder',
  TASKS = '/tasks',
  USER = '/user',
  TASK = '/task',
  COMMENT = '/comment',
  ATTACHMENT = '/attachment',
  SHARED_HIERARCHY = '/shared'
}

// Update the ApiResponse type to handle both success and error cases
export type ApiResponse<T> = T | ClickUpApiError;

// Standard error response format from ClickUp API
export interface ClickUpApiError {
  err: string;
  ECODE: string;
}


//===============================================
// AUTHENTICATION TYPES
//===============================================

// Parameters required for OAuth authorization and token exchange flows
export interface ClickUpOAuthParams {
  client_id: string;
  client_secret?: string;  // Optional as only needed for token exchange
  redirect_uri: string;
  state?: string;         // Optional as only needed for initial auth
  code?: string;          // Optional as only needed for token exchange
}

// Response format when successfully obtaining an access token
export interface AuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
}

//===============================================
// ERROR HANDLING TYPES
//===============================================

// Map error code prefixes to high-level error categories for handling
export const CLICKUP_ERROR_TYPE_MAP: Record<string, string> = {
  'OAUTH_01': 'AUTH',     // Authentication errors
  'OAUTH_02': 'ACCESS',   // Authorization errors
  'OAUTH_03': 'ACCESS',   // Access control errors
  'OAUTH_17': 'WEBHOOK',  // Webhook errors
  'RATE_': 'RATE_LIMIT',
  'CORS_': 'INVALID_REQUEST',
  'SHARD_': 'NOT_FOUND',
  'GBUSED_': 'STORAGE_LIMIT',  // Storage limit error category
  'CRTSK_': 'TASK_ERROR',
  'INPUT_': 'VALIDATION', // Input validation errors
  'NO_': 'NO_DATA',
  'ATTCH_': 'ATTACHMENT',  // Add this line for attachment errors
};

// Specific error codes for common authentication failures
export const CLICKUP_AUTH_ERROR_CODES = {
  INVALID_TOKEN: 'OAUTH_01_001',
  TOKEN_EXPIRED: 'OAUTH_01_002',
  INVALID_GRANT: 'OAUTH_02_001',
  INSUFFICIENT_SCOPE: 'OAUTH_03_001',
  STORAGE_LIMIT_EXCEEDED: 'GBUSED_005',
  INVALID_STATUS: 'CRTSK_001',  // Task status error code
  INVALID_FOLDER_ID: 'INPUT_011', // Invalid folder ID error code
  INVALID_ATTACHMENT_FORMAT: 'ATTCH_045',  // Add this line
  NO_DATA_FOUND: 'NO_DATA',  // Fictive error code, used to indicate if we get empty arrays
} as const;

// Type to ensure only valid auth error codes are used
export type AuthErrorCode = typeof CLICKUP_AUTH_ERROR_CODES[keyof typeof CLICKUP_AUTH_ERROR_CODES];

