//===============================================
// CLICKUP DOCS API TYPES
//===============================================
// Pure ClickUp API response types for Docs v3
// All types prefixed with ClickUp for clarity

// Document (ClickUp Docs v3 API response)
export interface ClickUpDoc {
	id: string
	name: string
	date_created: number
	date_updated: number
	parent: {
		id: string
		type: number
	}
	public?: boolean
	workspace_id: number
	creator: number
	deleted: boolean
	type: number
}

// Search Docs query parameters
export interface ClickUpSearchDocsParams {
	id?: string
	creator?: number
	deleted?: boolean
	archived?: boolean
	parent_id?: string
	parent_type?: string
	limit?: number // 10-100, default 50
	cursor?: string
}

// Documents list response
export interface ClickUpDocsResponse {
	docs: ClickUpDoc[]
	next_cursor: string
}

// Single document response
export interface ClickUpDocResponse extends ClickUpDoc {}

// Create Doc request
export interface ClickUpCreateDocRequest {
	name: string
	parent?: {
		id: string
		type: number
	}
	visibility?: 'PUBLIC' | 'PRIVATE' | number
	create_page?: boolean // defaults to true
}

// Document Page Listing response
export interface ClickUpDocPageListing {
	id: string
	doc_id: string
	workspace_id: number
	name: string
	pages?: Partial<ClickUpPage>[]
}

// Document Page Listing array response
export type ClickUpDocPageListingResponse = ClickUpDocPageListing[]

// Page Presentation Details
export interface ClickUpPagePresentationDetails {
	font: string
	line_height: number
	page_width: number
	show_author_header: boolean
	show_contributor_header: boolean
	show_cover_header: boolean
	show_date_header: boolean
	show_page_outline: boolean
	show_sub_pages: boolean
	sub_page_size: string
	show_sub_title_header: boolean
	show_title_icon_header: boolean
	font_size: number
}

// Document Page (ClickUp Docs v3 API response)
export interface ClickUpPage {
	id: string
	doc_id: string
	workspace_id: number
	name: string
	sub_title?: string
	date_created: number
	date_updated: number
	content: string
	avatar?: {
		value: string
	}
	creator_id: number
	deleted: boolean
	archived: boolean
	cover?: {
		image_url: string
	}
	protected: boolean
	presentation_details: ClickUpPagePresentationDetails
	pages?: ClickUpPage[] // Recursive - pages can contain sub-pages
	parent_page_id?: string
}

// Document Pages array response
export type ClickUpDocPagesResponse = ClickUpPage[]

// Single page response
export interface ClickUpPageResponse extends ClickUpPage {}

// Page creation request
export interface ClickUpCreatePageRequest {
	name?: string
	sub_title?: string
	content?: string
	content_format?: 'text/md' | 'text/plain'
	parent_page_id?: string
}
