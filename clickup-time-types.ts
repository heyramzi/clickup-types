// Time Entry Types
export interface CreateTimeEntryParams {
	description: string;
	start: number; // Start time in milliseconds
	duration: number; // Duration in milliseconds
	billable?: boolean; // Optional billable flag
	task_id?: string; // Optional task ID
	assignee?: number; // Optional assignee user ID
	tags?: string[]; // Optional time tracking tags
	tid?: string; // Optional task ID
}

// Response type for time entry creation/retrieval
export interface TimeEntryResponse {
	id: string;
	task?: {
		id: string;
		name: string;
		status: {
			status: string;
			color: string;
		};
	};
	wid: string; // Workspace ID
	user: {
		id: number;
		username: string;
		email: string;
		color: string;
	};
	billable: boolean;
	start: number;
	end: number;
	duration: number;
	description: string;
	tags?: string[];
	source: string;
	at: string; // Timestamp when the entry was created
	task_location?: {
		list_id: string;
		folder_id: string;
		space_id: string;
		workspace_id: string;
	};
}
