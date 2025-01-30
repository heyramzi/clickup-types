// Time Entry Types
export interface CreateTimeEntryParams {
	description: string;
	start: number;        // Start time in milliseconds
	duration: number;     // Duration in milliseconds
	billable?: boolean;   // Optional billable flag
	task_id?: string;     // Optional task ID
	assignee?: number;    // Optional assignee user ID
	tags?: string[];      // Optional time tracking tags
    tid?: string;         // Optional task ID
}
