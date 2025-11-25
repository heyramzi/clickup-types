//===============================================
// AUTHENTICATION TYPES
//===============================================
// Types for ClickUp OAuth flow
export interface ClickUpOAuthConfig {
	clientId: string
	clientSecret?: string // Required for token exchange (server-side only)
	redirectUri: string
	state?: string // Optional state parameter for auth flow
	code?: string // Optional code for token exchange
	responseType?: 'code' // Always "code" for authorization URL
}

export interface ClickUpTokenResponse {
	access_token: string
	token_type: 'Bearer'
}

//===============================================
// CLICKUP USER INTERFACES
//===============================================

export interface ClickUpUser {
	id: number
	username: string
	email: string
	color: string
	profilePicture?: string
	timezone?: string
}

export interface ClickUpUserResponse {
	user: ClickUpUser
}

export interface TokenStorageResponse {
	success: boolean
	token: string
	error?: string
}

export interface TokenStorageRequest {
	code: string
	state: string
}

// Add new interface for token exchange
export interface TokenExchangeRequest {
	client_id: string
	client_secret: string
	code: string
	redirect_uri: string
}
