//===============================================
// CLICKUP DOCS API TYPES
//===============================================
// Pure ClickUp API response types for Docs v3
// All types prefixed with ClickUp for clarity

//===============================================
// SHARED TYPES
//===============================================

/** Content format for doc/page content */
export type DocContentFormat = "text/md" | "text/plain";

/** Doc visibility levels */
export type DocVisibility = "PUBLIC" | "PRIVATE" | "PERSONAL" | "HIDDEN";

/** Doc parent type numeric values: 4=Space, 5=Folder, 6=List, 7=Everything, 12=Workspace */
export type DocParentType = 4 | 5 | 6 | 7 | 12;

/** Doc parent type string values (used in search params) */
export type DocParentTypeString = "SPACE" | "FOLDER" | "LIST" | "EVERYTHING" | "WORKSPACE";

/** Doc type: 1=Doc, 2=Wiki, 3=Meeting (SyncUp/call notes) */
export type ClickUpDocType = 1 | 2 | 3;

/** Parent entity reference */
export interface DocParent {
  id: string;
  type: DocParentType;
}

/** Page presentation/formatting details */
export interface ClickUpPagePresentationDetails {
  font?: string;
  font_size?: number;
  line_height?: number;
  page_width?: number;
  paragraph_spacing?: number;
  show_author_header?: boolean;
  show_contributor_header?: boolean;
  show_cover_header?: boolean;
  show_date_header?: boolean;
  show_page_outline?: boolean;
  show_sub_pages?: boolean;
  sub_page_size?: string;
  show_sub_title_header?: boolean;
  show_title_icon_header?: boolean;
  show_relationships?: boolean;
  show_relationships_compact?: boolean;
  show_sub_pages_author?: boolean;
  show_sub_pages_thumbnail?: boolean;
  show_sub_pages_compact?: boolean;
  sub_pages_style?: string;
}

/** Page cover image */
export interface ClickUpPageCover {
  color?: string;
  image_url?: string;
  position?: { x: number; y: number };
}

/** Page emoji/icon avatar */
export interface ClickUpPageAvatar {
  color?: string;
  value?: string;
  source?: string;
}

/** Relationship between a task and a doc/page */
export interface ClickUpTaskDocRelationship {
  doc_id: string;
  page_id?: string;
  type: "embed" | "mentionedBy" | "mentioning" | "linked" | "attached";
}

/** Paginated response for task doc relationships */
export interface ClickUpTaskDocRelationshipsResponse {
  data: ClickUpTaskDocRelationship[];
  next_cursor?: string;
}

//===============================================
// DOCUMENT TYPES
//===============================================

/** Document (ClickUp Docs v3 API response) */
export interface ClickUpDoc {
  id: string;
  name: string;
  type: ClickUpDocType;
  date_created: number;
  date_updated?: number;
  parent: DocParent;
  public: boolean;
  workspace_id: number;
  creator: number;
  deleted: boolean;
  deleted_by?: number;
  date_deleted?: number;
  archived?: boolean;
  archived_by?: number;
  date_archived?: number;
  page_defaults?: ClickUpPagePresentationDetails;
}

/** Documents list response */
export interface ClickUpDocsResponse {
  docs: ClickUpDoc[];
  next_cursor?: string;
}

//===============================================
// DOCUMENT QUERY PARAMS
//===============================================

/** Search Docs query parameters */
export interface ClickUpSearchDocsParams {
  id?: string;
  creator?: number;
  deleted?: boolean;
  archived?: boolean;
  parent_id?: string;
  parent_type?: `${DocParentType}` | DocParentTypeString;
  limit?: number;
  cursor?: string;
}

//===============================================
// DOCUMENT MUTATIONS
//===============================================

/** Create Doc request */
export interface ClickUpCreateDocRequest {
  name: string;
  parent?: DocParent;
  visibility?: DocVisibility | DocParentType;
  create_page?: boolean;
}

//===============================================
// PAGE TYPES
//===============================================

/** Document Page (full content from pages endpoint) */
export interface ClickUpPage {
  id: string;
  doc_id: string;
  workspace_id: number;
  name: string;
  sub_title?: string;
  date_created: number;
  date_updated?: number;
  date_edited?: number;
  edited_by?: number;
  content: string;
  avatar?: ClickUpPageAvatar;
  creator_id: number;
  deleted: boolean;
  deleted_by?: number;
  date_deleted?: number;
  archived: boolean;
  archived_by?: number;
  date_archived?: number;
  authors?: number[];
  contributors?: number[];
  cover?: ClickUpPageCover;
  protected: boolean;
  protected_by?: number;
  protected_note?: string;
  presentation_details?: ClickUpPagePresentationDetails;
  pages?: ClickUpPage[];
  parent_page_id?: string;
}

/** Lightweight page listing item (from page_listing endpoint) */
export interface ClickUpDocPageListing {
  id: string;
  doc_id: string;
  workspace_id: number;
  name: string;
  parent_page_id?: string;
  pages?: ClickUpDocPageListing[];
}

//===============================================
// PAGE QUERY PARAMS
//===============================================

/** Query params for page listing endpoint */
export interface ClickUpDocPageListingParams {
  max_page_depth?: number;
}

/** Query params for doc pages endpoint */
export interface ClickUpDocPagesParams {
  max_page_depth?: number;
  content_format?: DocContentFormat;
}

/** Query params for single page endpoint */
export interface ClickUpGetPageParams {
  content_format?: DocContentFormat;
}

//===============================================
// PAGE MUTATIONS
//===============================================

/** Page creation request */
export interface ClickUpCreatePageRequest {
  name?: string;
  sub_title?: string;
  content?: string;
  content_format?: DocContentFormat;
  parent_page_id?: string;
}

/** Page edit request (PUT endpoint) */
export interface ClickUpEditPageRequest extends ClickUpCreatePageRequest {
  content_edit_mode?: "replace" | "append" | "prepend";
}

//===============================================
// RESPONSE ALIASES
//===============================================

/** Page listing array response */
export type ClickUpDocPageListingResponse = ClickUpDocPageListing[];

/** Document pages array response */
export type ClickUpDocPagesResponse = ClickUpPage[];
