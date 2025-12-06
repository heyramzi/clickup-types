//===============================================
// CLICKUP VIEW TYPES
//===============================================

// View type values supported by ClickUp
export type ViewType =
	| "list"
	| "board"
	| "calendar"
	| "gantt"
	| "table"
	| "timeline"
	| "workload"
	| "activity"
	| "map"
	| "conversation"
	| "doc";

// Core view interface
export interface ClickUpView {
	id: string;
	name: string;
	type: ViewType;
	parent?: {
		id: string;
		type: number;
	};
	grouping?: {
		field: string;
		dir: number;
		hide_empty: boolean;
	};
	divide?: {
		field: string | null;
		dir: number;
		collapsed: boolean;
	};
	sorting?: {
		fields: Array<{
			field: string;
			dir: number;
		}>;
	};
	filters?: {
		op: string;
		fields: unknown[];
		search: string;
		show_closed: boolean;
	};
	columns?: {
		fields: Array<{
			field: string;
			hidden: boolean;
			width?: number;
		}>;
	};
	team_sidebar?: {
		assignees: unknown[];
		assigned_comments: boolean;
		unassigned_tasks: boolean;
	};
	settings?: {
		show_task_locations: boolean;
		show_subtasks: number;
		show_subtask_parent_names: boolean;
		show_closed_subtasks: boolean;
		show_assignees: boolean;
		show_images: boolean;
		collapse_empty_columns: boolean | null;
		me_comments: boolean;
		me_subtasks: boolean;
		me_checklists: boolean;
	};
	date_protected: boolean;
	protected_note?: string;
	protected?: boolean;
	orderindex?: number;
	visibility?: "private" | "team" | "workspace";
	creator?: number;
}

// Response for getting a single view
export interface ClickUpViewResponse {
	view: ClickUpView;
}

// Response for getting multiple views
export interface ClickUpViewsResponse {
	views: ClickUpView[];
	default_view?: ClickUpView;
	required_views?: Record<string, ClickUpView>;
}
