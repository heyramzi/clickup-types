//===============================================
// CLICKUP CHAT & CHANNELS TYPES
//===============================================

//===============================================
// ENUMS & CONSTANTS
//===============================================

/** Chat channel type */
export enum ChatChannelType {
  CHANNEL = "CHANNEL",
  DM = "DM",
  GROUP_DM = "GROUP_DM",
}

/** Channel subcategory type (chat, project, etc.) */
export enum ChannelSubcategoryType {
  CHAT = 1,
  PROJECT = 2,
  RESOURCE = 3,
  SCHEDULE = 4,
}

/** Channel visibility level */
export enum ChatChannelVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

/** Parent entity types in ClickUp hierarchy */
export enum ChatParentType {
  SPACE = 4,
  FOLDER = 5,
  LIST = 6,
  WORKSPACE = 7,
  WORKSPACE_V2 = 12,
}

/** Message type */
export enum MessageType {
  MESSAGE = "message",
  POST = "post",
}

/** Description/content format for chat messages and channel descriptions */
export enum DescriptionFormat {
  MARKDOWN = "text/md",
  PLAIN = "text/plain",
}

/** Location type for creating a channel */
export enum LocationType {
  SPACE = "space",
  FOLDER = "folder",
  LIST = "list",
}

/** Chat room categories */
export type ChatRoomCategory = "WELCOME_CHANNEL" | null;

/** Triaged action applied to a message */
export type TriagedAction = 1 | 2;

/** Post message data (exact fields undocumented by ClickUp) */
export type PostData = Record<string, unknown>;

//===============================================
// SHARED SUB-TYPES
//===============================================

/** Parent entity reference for a chat channel */
export interface ChatParent {
  id: string;
  type: ChatParentType;
}

/** Default view configuration for a chat channel */
export interface ChatView {
  view_id: string;
  type: number;
  standard: boolean;
}

/** Links to related channel resources */
export interface ChatLinks {
  members: string;
  followers: string;
}

/** Links to message-related resources */
export interface MessageLinks {
  reactions: string;
  replies: string;
  tagged_users: string;
}

/** Reply message links (no replies link on replies themselves) */
export interface ReplyMessageLinks {
  reactions: string;
  tagged_users: string;
}

/** Counts relevant to the user for a chat room */
export type ChannelCounts = Record<string, number>;

/** Location reference for creating a channel */
export interface ChatLocation {
  id: string;
  type: LocationType;
}

/** Chat user reference (used in member/follower/tagged responses) */
export interface ChatUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  initials?: string;
}

//===============================================
// CHANNEL TYPES
//===============================================

/** Main chat channel interface */
export interface ChatChannel {
  id: string;
  type: ChatChannelType;
  visibility: ChatChannelVisibility;
  creator: string;
  parent: ChatParent;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  latest_comment_at?: string;
  links: ChatLinks;
  archived?: boolean;

  // Optional fields
  name?: string;
  description?: string;
  topic?: string;
  default_view?: ChatView;
  chat_room_category?: ChatRoomCategory;
  is_canonical_channel?: boolean;
  is_hidden?: boolean;
  canvas_id?: string;
  counts?: ChannelCounts;
  channel_type?: ChannelSubcategoryType;
}

//===============================================
// CHANNEL QUERY PARAMS
//===============================================

/** Query parameters for listing chat channels */
export interface ChatChannelsQueryParams {
  limit?: number;
  cursor?: string;
  is_follower?: boolean;
  include_closed?: boolean;
  description_format?: DescriptionFormat;
  with_message_since?: number;
  channel_types?: string;
}

/** Query parameters for retrieving a single channel */
export interface GetChannelParams {
  description_format?: DescriptionFormat;
}

/** Paginated query params (shared by member/follower/reaction endpoints) */
export interface ChatPaginationParams {
  cursor?: string;
  limit?: number;
}

//===============================================
// CHANNEL RESPONSES
//===============================================

/** Response for listing chat channels */
export interface ChatChannelsResponse {
  data: ChatChannel[];
  next_cursor: string;
}

/** Response wrapper for a single channel */
export interface ChatChannelResponse {
  data: ChatChannel;
}

//===============================================
// CHANNEL MUTATIONS
//===============================================

/** Request body for creating a location-based channel */
export interface CreateLocationChannelRequest {
  location: ChatLocation;
  description?: string;
  topic?: string;
  user_ids?: string[];
  visibility?: ChatChannelVisibility;
}

/** Request body for creating a named channel (workspace-level) */
export interface CreateChatChannelRequest {
  name: string;
  description?: string;
  topic?: string;
  user_ids?: string[];
  visibility?: ChatChannelVisibility;
}

/** Request body for creating a direct message */
export interface CreateDirectMessageRequest {
  user_ids?: string[];
}

/** Request body for updating a chat channel */
export interface UpdateChatChannelRequest {
  name?: string;
  description?: string;
  topic?: string;
  visibility?: ChatChannelVisibility;
  location?: ChatLocation;
  content_format?: DescriptionFormat;
}

//===============================================
// MEMBER & FOLLOWER TYPES
//===============================================

/** Response for channel members */
export interface ChatChannelMembersResponse {
  data: ChatUser[];
  next_cursor: string;
}

/** Response for channel followers */
export interface ChatChannelFollowersResponse {
  data: ChatUser[];
  next_cursor: string;
}

//===============================================
// MESSAGE TYPES
//===============================================

/** Chat message interface */
export interface ChatMessage {
  id: string;
  parent_channel: string;
  user_id: string;
  content: string;
  type: MessageType;
  date: number;
  resolved: boolean;
  links: MessageLinks;
  replies_count: number;

  // Optional fields
  parent_message?: string;
  assignee?: string;
  assigned_by?: string;
  date_assigned?: number;
  date_resolved?: number;
  date_updated?: number;
  group_assignee?: string;
  post_data?: PostData;
  resolved_by?: string;
  triaged_action?: TriagedAction;
  triaged_object_id?: string;
  triaged_object_type?: number;
}

//===============================================
// MESSAGE QUERY PARAMS
//===============================================

/** Query parameters for fetching channel messages */
export interface GetChannelMessagesParams {
  cursor?: string;
  limit?: number;
  content_format?: DescriptionFormat;
}

/** Query parameters for retrieving message replies */
export interface GetMessageRepliesParams {
  cursor?: string;
  limit?: number;
  content_format?: DescriptionFormat;
}

//===============================================
// MESSAGE RESPONSES
//===============================================

/** Response for channel messages with pagination */
export interface ChatMessagesResponse {
  next_cursor: string;
  data: ChatMessage[];
}

/** Response for message replies with pagination */
export interface MessageRepliesResponse {
  next_cursor: string;
  data: ChatMessage[];
}

//===============================================
// MESSAGE MUTATIONS
//===============================================

/** Request body for creating a chat message */
export interface CreateChatMessageRequest {
  type: MessageType;
  content: string;
  content_format?: DescriptionFormat;
  assignee?: string;
  group_assignee?: string;
  triaged_action?: TriagedAction;
  triaged_object_id?: string;
  triaged_object_type?: number;
  reactions?: MessageReactionData[];
  followers?: string[];
  post_data?: PostData;
}

/** Response for creating a message */
export interface CreateChatMessageResponse {
  data: ChatMessage;
}

/** Request body for creating a reply message */
export type CreateReplyMessageRequest = CreateChatMessageRequest;

/** Response for creating a reply message */
export interface CreateReplyMessageResponse {
  data: ChatMessage;
}

/** Request body for updating (patching) a chat message */
export interface PatchChatMessageRequest {
  content?: string;
  content_format?: DescriptionFormat;
  assignee?: string;
  group_assignee?: string;
  post_data?: PostData;
  resolved?: boolean;
}

//===============================================
// MESSAGE REACTIONS
//===============================================

/** Reaction data (used in both create and read contexts) */
export interface MessageReactionData {
  date: number;
  reaction: string;
  user_id: string;
}

/** Query parameters for retrieving message reactions */
export type GetMessageReactionsParams = ChatPaginationParams;

/** Response for message reactions with pagination */
export interface MessageReactionsResponse {
  next_cursor: string;
  data: MessageReactionData[];
}

//===============================================
// TAGGED USERS
//===============================================

/** Query parameters for retrieving tagged users */
export type GetMessageTaggedUsersParams = ChatPaginationParams;

/** Response for tagged users with pagination */
export interface MessageTaggedUsersResponse {
  next_cursor: string;
  data: ChatUser[];
}
