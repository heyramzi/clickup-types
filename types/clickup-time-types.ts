// ClickUp time entry types - matches API v2 time entries endpoint

// Create time entry parameters
export interface CreateTimeEntryParams {
	description: string;
	start: number; // Start time in milliseconds
	duration: number; // Duration in milliseconds
	billable?: boolean;
	tid?: string; // Task ID
	assignee?: number; // User ID
	tags?: string[];
}

// Individual time entry from ClickUp API
export interface TimeEntry {
	id: string;
	task?: {
		id: string;
		name: string;
		status: {
			status: string;
			color: string;
			type?: string;
		};
		custom_id?: string;
	};
	wid: string; // Workspace ID
	user: {
		id: number;
		username: string;
		email: string;
		color: string;
		profilePicture?: string;
	};
	billable: boolean;
	start: string | number; // Unix timestamp in milliseconds
	end: string | number; // Unix timestamp in milliseconds
	duration: string | number; // Duration in milliseconds (negative if running)
	description: string;
	tags?: Array<{ name: string; tag_fg: string; tag_bg: string }>;
	source: string;
	at: string; // ISO timestamp when entry was created
	task_location?: {
		list_id: number;
		folder_id: number;
		space_id: number;
	};
	task_url?: string;
}

//===============================================
// TIME ENTRIES API TYPES
//===============================================

// Query parameters for fetching time entries
export interface TimeEntriesQueryParams {
	workspace_id: string;
	start_date?: number;
	end_date?: number;
	assignee?: string;
	include_location_names?: boolean;
	is_billable?: boolean;
	space_id?: string;
	folder_id?: string;
	list_id?: string;
}

// Response containing multiple time entries
export interface TimeEntriesResponse {
	data: TimeEntry[];
}
