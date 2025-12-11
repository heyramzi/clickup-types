//===============================================
// CLICKUP DOCS API TYPES
//===============================================
// Pure ClickUp API response types for Docs v3
// All types prefixed with ClickUp for clarity

// Document (ClickUp Docs v3 API response)
export interface ClickUpDoc {
	id: string;
	name: string;
	date_created: number;
	date_updated: number;
	parent: {
		id: string;
		type: number;
	};
	public?: boolean;
	workspace_id: number;
	creator: number;
	deleted: boolean;
	type: number;
}

// Search Docs query parameters
export interface ClickUpSearchDocsParams {
	id?: string;
	creator?: number;
	deleted?: boolean;
	archived?: boolean;
	parent_id?: string;
	parent_type?: string;
	limit?: number; // 10-100, default 50
	cursor?: string;
}

// Documents list response
export interface ClickUpDocsResponse {
	docs: ClickUpDoc[];
	next_cursor: string;
}

// Create Doc request
export interface ClickUpCreateDocRequest {
	name: string;
	parent?: {
		id: string;
		type: number;
	};
	visibility?: "PUBLIC" | "PRIVATE" | number;
	create_page?: boolean; // defaults to true
}

// Document Page Listing item (lightweight - from page_listing endpoint)
// Recursive structure: pages can contain nested pages
export interface ClickUpDocPageListing {
	id: string;
	doc_id: string;
	workspace_id: number;
	name: string;
	parent_page_id?: string; // Present for nested pages
	pages?: ClickUpDocPageListing[]; // Recursive nested pages
}

// Document Page Listing array response (top-level response from page_listing endpoint)
export type ClickUpDocPageListingResponse = ClickUpDocPageListing[];

// Page Presentation Details (all fields optional - API returns only what's set)
export interface ClickUpPagePresentationDetails {
	font?: string;
	line_height?: number;
	page_width?: number;
	show_author_header?: boolean;
	show_contributor_header?: boolean;
	show_cover_header?: boolean;
	show_date_header?: boolean;
	show_page_outline?: boolean;
	show_sub_pages?: boolean;
	sub_page_size?: string;
	show_sub_title_header?: boolean;
	show_title_icon_header?: boolean;
	font_size?: number;
}

// Document Page (ClickUp Docs v3 API response)
export interface ClickUpPage {
	id: string;
	doc_id: string;
	workspace_id: number;
	name: string;
	sub_title?: string;
	date_created: number;
	date_updated: number;
	date_edited?: number; // When content was last edited
	edited_by?: number; // User ID who last edited
	content: string;
	avatar?: {
		value: string;
	};
	creator_id: number;
	deleted: boolean;
	archived: boolean;
	date_archived?: number; // When page was archived (if archived)
	archived_by?: number; // User ID who archived (if archived)
	cover?: {
		image_url: string;
	};
	protected: boolean;
	presentation_details?: ClickUpPagePresentationDetails;
	pages?: ClickUpPage[]; // Recursive - pages can contain sub-pages
	parent_page_id?: string;
}

// Document Pages array response
export type ClickUpDocPagesResponse = ClickUpPage[];

// Page creation request
export interface ClickUpCreatePageRequest {
	name?: string;
	sub_title?: string;
	content?: string;
	content_format?: "text/md" | "text/plain";
	parent_page_id?: string;
}

// Page edit request (PUT endpoint)
export interface ClickUpEditPageRequest extends ClickUpCreatePageRequest {
	content_edit_mode?: "replace" | "append" | "prepend";
}
