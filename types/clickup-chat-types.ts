//===============================================
// CLICKUP CHAT & CHANNELS TYPES
//===============================================

/**
 * Chat channel type - either a public/private channel or a direct message
 */
export enum ChatChannelType {
	CHANNEL = 'CHANNEL',
	DM = 'DM',
	GROUP_DM = 'GROUP_DM'
}

/**
 * Channel subcategory type (chat, project, etc.)
 */
export enum ChannelSubcategoryType {
	CHAT = 1,
	PROJECT = 2,
	TYPE_3 = 3,
	TYPE_4 = 4
}

/**
 * Channel visibility level
 */
export enum ChatChannelVisibility {
	PUBLIC = 'PUBLIC',
	PRIVATE = 'PRIVATE'
}

/**
 * Parent entity types in ClickUp hierarchy
 * These correspond to where a chat channel can be attached
 */
export enum ChatParentType {
	SPACE = 4,
	FOLDER = 5,
	LIST = 6,
	WORKSPACE = 7,
	WORKSPACE_V2 = 12 // Alternative workspace type
}

/**
 * Chat room categories (e.g., welcome channels)
 */
export type ChatRoomCategory = 'WELCOME_CHANNEL' | null

/**
 * Parent entity reference for a chat channel
 */
export interface ChatParent {
	id: string
	type: ChatParentType
}

/**
 * Default view configuration for a chat channel
 */
export interface ChatView {
	view_id: string
	type: number // View type (1=list, 5=?, 6=?)
	standard: boolean
}

/**
 * Counts relevant to the user for a chat room
 */
export interface ChannelCounts {
	// Define specific count fields as needed
	[key: string]: number
}

/**
 * Links to related channel resources
 */
export interface ChatLinks {
	members: string // API endpoint for channel members
	followers: string // API endpoint for channel followers
}

/**
 * Main chat channel interface
 */
export interface ChatChannel {
	id: string
	type: ChatChannelType
	visibility: ChatChannelVisibility
	creator: string // User ID
	parent: ChatParent
	workspace_id: string
	created_at: number | string // Unix timestamp or ISO string
	updated_at: number | string // Unix timestamp or ISO string
	latest_comment_at?: number | string // Unix timestamp or ISO string
	links: ChatLinks

	// Optional fields
	name?: string // Name not present for DMs
	description?: string // Full description of the channel
	topic?: string // Channel topic
	archived?: boolean | null
	default_view?: ChatView
	chat_room_category?: ChatRoomCategory
	is_canonical_channel?: boolean // True for default channels (e.g., space/list channels)
	is_hidden?: boolean // Has user hidden this room from sidebar (DMs/Group DMs)
	canvas_id?: string // Associated canvas ID if any
	counts?: ChannelCounts // Counts relevant to the user
	channel_type?: ChannelSubcategoryType // Subcategory type
}

/**
 * API response for listing chat channels
 */
export interface ChatChannelsResponse {
	data: ChatChannel[]
	next_cursor: string // Pagination cursor
}

/**
 * Query parameters for fetching chat channels
 */
export interface ChatChannelsQueryParams {
	limit?: number // Max 50
	is_follower?: boolean
	include_closed?: boolean
	cursor?: string // Pagination cursor
}

//===============================================
// CREATE CHANNEL TYPES
//===============================================

/**
 * Location type for creating a channel
 */
export enum LocationType {
	SPACE = 'space',
	FOLDER = 'folder',
	LIST = 'list'
}

/**
 * Location reference for creating a channel
 */
export interface ChatLocation {
	id: string
	type: LocationType
}

/**
 * Request body for creating a location-based channel
 */
export interface CreateLocationChannelRequest {
	location: ChatLocation
	description?: string
	topic?: string
	user_ids?: string[] // Max 100 unique user IDs
	visibility?: ChatChannelVisibility
}

/**
 * Request body for creating a direct message
 * Creates a DM between up to 10 users. If no user_ids provided, creates a self DM.
 */
export interface CreateDirectMessageRequest {
	user_ids?: string[] // Max 10 unique user IDs, optional (creates self DM if empty)
}

/**
 * Description format for channel content
 */
export enum DescriptionFormat {
	MARKDOWN = 'text/md',
	PLAIN = 'text/plain'
}

/**
 * Query parameters for retrieving a single channel
 */
export interface GetChannelParams {
	description_format?: DescriptionFormat
}

/**
 * Response wrapper for a single channel
 * Used by: create channel, create DM, get channel
 */
export interface ChatChannelResponse {
	data: ChatChannel
}

//===============================================
// MESSAGE TYPES
//===============================================

/**
 * Message type
 */
export enum MessageType {
	MESSAGE = 'message',
	POST = 'post'
}

/**
 * Triaged action applied to a message
 */
export enum TriagedAction {
	ACTION_1 = 1,
	ACTION_2 = 2
}

/**
 * Post message data
 */
export interface PostData {
	// Define specific post data fields as needed
	[key: string]: unknown
}

/**
 * Links to message-related resources
 */
export interface MessageLinks {
	// Define specific link fields as API provides them
	[key: string]: string
}

/**
 * Chat message interface
 */
export interface ChatMessage {
	id: string
	parent_channel: string // Channel ID this message belongs to
	user_id: string // User who created the message
	content: string // Full message content
	type: MessageType
	date: number // Created timestamp (Unix epoch milliseconds)
	resolved: boolean
	links: MessageLinks
	replies_count: number

	// Optional fields
	parent_message?: string // ID of message this is replying to
	assignee?: string // User ID of assignee
	assigned_by?: string // User ID who assigned
	date_assigned?: number // Unix epoch milliseconds
	date_resolved?: number // Unix epoch milliseconds
	date_updated?: number // Unix epoch milliseconds
	group_assignee?: string // Group assignee ID
	post_data?: PostData // Post-specific data
	resolved_by?: string // User ID who resolved
	triaged_action?: TriagedAction
	triaged_object_id?: string
	triaged_object_type?: number
}

/**
 * Query parameters for fetching channel messages
 */
export interface GetChannelMessagesParams {
	cursor?: string // Pagination cursor
	limit?: number // 1-100, defaults to 50
	content_format?: DescriptionFormat // Reuse for DRY (text/md or text/plain)
}

/**
 * Response for channel messages with pagination
 */
export interface ChatMessagesResponse {
	next_cursor: string
	data: ChatMessage[]
}

//===============================================
// CREATE MESSAGE TYPES
//===============================================

/**
 * Content format for chat messages
 * Reusing DescriptionFormat for consistency
 */
export type ContentFormat = DescriptionFormat

/**
 * Reaction on a message (at creation time)
 * Used when creating messages with initial reactions
 */
export interface MessageReaction {
	// Define specific reaction fields as the API documents them
	// Currently undocumented in API, using flexible structure
	[key: string]: unknown
}

/**
 * Reaction data retrieved from the API
 * Used in GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/reactions
 */
export interface MessageReactionData {
	/** The date & time the reaction was created (Unix epoch milliseconds) */
	date: number

	/** The reaction emoji/string */
	reaction: string

	/** The ID of the user who created the reaction */
	user_id: string
}

/**
 * Request body for creating a chat message
 * POST /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/messages
 */
export interface CreateChatMessageRequest {
	/** Type of message - must be "message" */
	type: MessageType.MESSAGE

	/** Full content of the message to be created (max 40000 chars) */
	content: string

	/** Format of the message content (defaults to text/md) */
	content_format?: ContentFormat

	/** User ID of the assignee */
	assignee?: string

	/** Group assignee ID */
	group_assignee?: string

	/** Triaged action applied to the message (1 or 2) */
	triaged_action?: TriagedAction

	/** Message triaged action object ID */
	triaged_object_id?: string

	/** Message triaged action object type */
	triaged_object_type?: number

	/** Reactions to the message that exist at creation time (max 10) */
	reactions?: MessageReaction[]

	/** IDs of the followers of the message (max 10) */
	followers?: string[]

	/** Data of the post message */
	post_data?: PostData
}

/**
 * Response for creating a message
 */
export interface CreateChatMessageResponse {
	data: ChatMessage
}

/**
 * Request body for creating a reply message
 * POST /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/replies
 *
 * Uses the same structure as CreateChatMessageRequest
 */
export type CreateReplyMessageRequest = CreateChatMessageRequest

/**
 * Response for creating a reply message
 */
export interface CreateReplyMessageResponse {
	data: ChatMessage
}

/**
 * Query parameters for retrieving message replies
 * GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/replies
 */
export interface GetMessageRepliesParams {
	/** Pagination cursor */
	cursor?: string

	/** Maximum number of results to fetch (1-100, defaults to 50) */
	limit?: number

	/** Format of the message content (defaults to text/md) */
	content_format?: ContentFormat
}

/**
 * Response for message replies with pagination
 */
export interface MessageRepliesResponse {
	next_cursor: string
	data: ChatMessage[]
}

/**
 * Delete message operation
 * DELETE /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}
 *
 * Returns 204 No Content on success (no response body)
 * Path params: workspace_id (number), message_id (string)
 */

//===============================================
// MESSAGE REACTIONS
//===============================================

/**
 * Query parameters for retrieving message reactions
 * GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/reactions
 */
export interface GetMessageReactionsParams {
	/** Pagination cursor */
	cursor?: string

	/** Maximum number of results to fetch (1-100, defaults to 50) */
	limit?: number
}

/**
 * Response for message reactions with pagination
 */
export interface MessageReactionsResponse {
	/** Pagination cursor for the next page */
	next_cursor: string

	/** Array of reaction data */
	data: MessageReactionData[]
}
