//===============================================
// CLICKUP DOCS INTERFACES
//===============================================

// Document
export interface Doc {
  id: string;
  name: string;
  date_created: number;  // changed from dateCreated
  date_updated: number;  // changed from dateUpdated
  parent: {
    id: string;
    type: number;
  };
  public?: boolean;     // made optional since some responses don't include it
  workspace_id: number; // changed from workspaceId
  creator: number;      // changed from creatorId
  deleted: boolean;
  type: number;
}

export interface StoredDoc {
  id: string;
  name: string;
}

// Array of Documents Response, when searching for Docs
export interface DocsResponse {
  docs: Doc[];
  next_cursor: string;  // changed from nextCursor
}

// Document Response, when searching for a specific Doc
export interface DocResponse extends Doc {}

// Document Page Listing
export interface DocPageListing {
  id: string;
  doc_id: string;
  workspace_id: number;
  name: string;
  pages?: Partial<Page>[];  // Using Partial<Page> since listing responses contain fewer fields
}

// Array of Document Page Listing
export type DocPageListingResponse = DocPageListing[];


//===============================================
// CLICKUP DOCS INTERFACES
//=============================================== 

// Page Presentation Details
export interface PagePresentationDetails {
  font: string;
  line_height: number;
  page_width: number;
  show_author_header: boolean;
  show_contributor_header: boolean;
  show_cover_header: boolean;
  show_date_header: boolean;
  show_page_outline: boolean;
  show_sub_pages: boolean;
  sub_page_size: string;
  show_sub_title_header: boolean;
  show_title_icon_header: boolean;
  font_size: number;
}

// Document Page
export interface Page {
  id: string;
  doc_id: string;
  workspace_id: number;
  name: string;
  sub_title?: string;
  date_created: number;
  date_updated: number;
  content: string;
  avatar?: {
    value: string;
  };
  creator_id: number;
  deleted: boolean;
  archived: boolean;
  cover?: {
    image_url: string;
  };
  protected: boolean;
  presentation_details: PagePresentationDetails;
  pages?: Page[]; // Recursive - pages can contain sub-pages
  parent_page_id?: string;
}

// Array of Document Pages
export type DocPagesResponse = Page[]; 

// Page Response
export interface PageResponse extends Page {}
