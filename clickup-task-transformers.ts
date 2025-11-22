//===============================================
// CLICKUP TRANSFORMERS - Universal Types for ClickUp Projects
//===============================================
// These types transform ClickUp API responses into simplified
// UI-friendly structures. Reusable across all ClickUp projects.

import type { Task, Tasks, TaskPriority } from './clickup-task-types';

//===============================================
// FLATTENED TASK INTERFACES
//===============================================

// ClickUp priority levels enum (1 = Urgent, 4 = Low)
export enum TaskPriorityLevel {
	URGENT = 1,
	HIGH = 2,
	NORMAL = 3,
	LOW = 4,
}

// Simplified custom field structure for UI consumption
export interface FlattenedCustomField {
	id: string;
	name: string;
	value: unknown; // Resolved value (dropdown shows option name, not index)
}

// Flattened task structure optimized for UI rendering
// Transforms nested ClickUp API response into simple, flat structure
export interface FlattenedTask {
	id: string;
	name: string;
	description: string;
	status: string; // Flattened from status.status
	status_color: string; // Flattened from status.color
	is_completed: boolean; // Computed from status === 'done'
	creator_email: string; // Flattened from creator.email
	assignee_names: string[]; // Array of assignee usernames
	watcher_names: string[]; // Array of watcher usernames
	list_id?: string; // Flattened from list.id
	folder_id?: string; // Flattened from folder.id
	space_id?: string; // Flattened from space.id
	custom_fields: FlattenedCustomField[]; // Simplified custom fields
	tags: string[]; // Array of tag names
	due_date: string | null;
	start_date: string | null;
	date_created: string;
	date_updated: string;
	date_closed: string | null;
	url: string;
	priority: TaskPriority | null;
	time_estimate: number | null;
	time_spent: number | null;
}
