//===============================================
// CLICKUP TASKS BASE INTERFACES
//===============================================

// Custom field as embedded in task.custom_fields (different from ClickUpCustomField API type)
export interface ClickUpTaskCustomField {
	id: string
	name: string
	type: string
	type_config?: {
		options?: Array<{
			id?: string
			name?: string
			label?: string
			orderindex?: number
			color?: string
		}>
	}
	date_created?: string
	hide_from_guests?: boolean
	value?: unknown
	required?: boolean
}

// Base interface for common task properties
export interface ClickUpTask {
	id: string
	custom_id: string | null
	custom_item_id: number | null
	name: string
	text_content: string
	description: string
	status: {
		id?: string
		status: string
		color: string
		type: string
		orderindex?: number
	}
	date_created: string
	date_updated: string
	date_closed: string | null
	date_done: string | null
	archived: boolean
	creator: {
		id: number
		username: string
		color: string
		email?: string
		profilePicture: string
	}
	assignees: Array<{
		id: number
		username: string | null
		color: string | null
		initials: string
		email: string
		profilePicture: string | null
	}>
	tags: Array<{
		name: string
		tag_fg: string
		tag_bg: string
		creator: number
	}>
	parent: string | null
	priority: ClickUpTaskPriority | null
	due_date: string | null
	start_date: string | null
	points: null | number
	time_estimate: number | null
	custom_fields: ClickUpTaskCustomField[] | Record<string, unknown>
	url: string
	markdown_description?: string
	orderindex?: string
	time_spent: number | null
	list?: {
		id: string
	}
	folder?: {
		id: string
	}
	space?: {
		id: string
	}
	team_id?: string
	watchers?: Array<{
		id: number
		username: string | null
		color: string | null
		initials?: string
		email?: string
		profilePicture?: string | null
	}>
	checklists:
		| {
				id: string
				task_id?: string
				name: string
				date_created: string
				orderindex: string | number
				creator: number
				resolved: number
				unresolved: number
				items: Array<{
					id?: string
					name: string
					orderindex: number
					assignee: null | {
						id: number
						username: string
						email?: string
					}
					group_assignee?: null | {
						id: number
						group: string
					}
					resolved: boolean
					parent: null | string
					date_created?: string
					children: Array<{
						id?: string
						name: string
						orderindex: number
						resolved: boolean
					}>
				}>
		  }
		| Array<{
				id: string
				name: string
				items: Array<unknown>
		  }>
}

// Extended task interface with additional fields
export interface ClickUpTasks extends ClickUpTask {
	watchers: Array<{
		id: number
		username: string | null
		color: string | null
		initials: string
		email: string
		profilePicture: string | null
	}>
	dependencies: Array<{
		task_id: string
		depends_on: string
		type?: number
	}>
	linked_tasks: Array<{
		task_id: string
		link_id: string
		type?: number
	}>
}

// Interface for task response from API
export interface ClickUpTasksResponse {
	tasks: ClickUpTasks[]
	last_page: boolean
}

// Types
interface GetTasksRequestParams {
	// ClickUp API request options
	includeSubtasks?: boolean
	includeClosed?: boolean
}

interface LastPageCheckResult {
	// Result of last page check
	exceededLimit: boolean
	shouldContinueSync: boolean
	tasks?: ClickUpTasksResponse['tasks']
}

interface TaskBatchResult {
	// Result of tasks batch fetch
	tasks: ClickUpTasks[]
	hasMore: boolean
}

// Add this enum for validation status
enum ListValidationStatus {
	VALID = 'valid',
	EMPTY_OR_DELETED = 'emptyOrDeleted',
	TOO_MANY_TASKS = 'tooManyTasks',
	ERROR = 'error'
}

interface ListValidationResult {
	status: ListValidationStatus
	error?: string
}

//===============================================
// CLICKUP TASK CREATION INTERFACES
//===============================================

// Simplified request types for task creation
export interface CreateTaskRequestParams {
	name: string
	description?: string
	markdown_content?: string
	tags?: string[]
}

//===============================================
// CLICKUP COMMENT CREATION INTERFACES
//===============================================

// Simplified request types for comments
export interface CreateCommentRequestParams {
	comment_text: string
	notify_all?: boolean
}

// Response type for comment creation/retrieval
export interface CommentResponse {
	id: string
	comment: string[] // Array of comment content blocks
	user: {
		id: number
		username: string
		email: string
		profilePicture?: string
	}
	resolved: boolean
	assignee?: {
		id: number
		username: string
	}
}

//===============================================
// CLICKUP ATTACHMENT INTERFACES
//===============================================

// Simplified request types for attachments
export interface CreateAttachmentRequestParams {
	attachment: File[]
	filename: string
}

export interface AttachmentResponse {
	id: string
	version: string
	date: number
	name: string
	title: string
	extension: string
	source: number
	thumbnail_small: string
	thumbnail_medium: string
	thumbnail_large: string
	url: string
	url_w_query: string
	url_w_host: string
}

// Define Priority type
export interface ClickUpTaskPriority {
	color: string
	id: string
	orderindex: string
	priority: 'urgent' | 'high' | 'normal' | 'low'
}

// Define TypeConfig interface based on common field types
export interface CustomFieldTypeConfig {
	default?: number | string | boolean
	options?: Array<{
		id: string
		name: string
		color?: string
		orderindex?: number
	}>
	currency?: string
	precision?: number
	tracking?: {
		subtasks?: boolean
		checklists?: boolean
		assigned_comments?: boolean
	}
}

//===============================================
// TASK QUERY PARAMETERS
//===============================================

// Custom field filter operators
export type CustomFieldOperator =
	| '='
	| '!='
	| '>'
	| '<'
	| '>='
	| '<='
	| 'IS_EMPTY'
	| 'IS_NOT_EMPTY'
	| 'RANGE'

// Custom field filter for advanced queries
export interface CustomFieldFilter {
	field_id: string
	operator: CustomFieldOperator
	value: string | number | boolean | [number, number] // RANGE uses tuple
}

// Base parameters for task queries
export interface BaseTaskParams {
	archived?: boolean
	page?: number | 'all'
	order_by?: string
	reverse?: boolean
	subtasks?: boolean
	statuses?: string[]
	include_closed?: boolean
	assignees?: number[]
	tags?: string[]
	due_date_gt?: number
	due_date_lt?: number
	date_created_gt?: number
	date_created_lt?: number
	date_updated_gt?: number
	date_updated_lt?: number
	custom_fields?: CustomFieldFilter[]
}

// Parameters for fetching tasks from a specific list
export interface GetTasksParams extends BaseTaskParams {
	list_id: string // Required
}

// Parameters for workspace-wide filtered task queries
export interface GetFilteredTasksParams extends BaseTaskParams {
	team_id: string // Required
	space_ids?: string[]
	project_ids?: string[]
	list_ids?: string[]
}

//===============================================
// TASK MUTATION INTERFACES
//===============================================

// Data for creating a new task
export interface CreateTaskData {
	name: string // Required
	description?: string
	assignees?: number[]
	tags?: string[]
	status?: string
	priority?: ClickUpTaskPriority
	due_date?: number
	start_date?: number
	time_estimate?: number
	custom_fields?: Array<{
		id: string
		value: unknown
	}>
}

// Data for updating an existing task
export interface UpdateTaskData {
	name?: string
	description?: string
	status?: string
	priority?: ClickUpTaskPriority | null
	due_date?: number | null
	start_date?: number | null
	time_estimate?: number | null
	assignees?: {
		add?: number[]
		rem?: number[]
	}
	watchers?: {
		add?: number[]
		rem?: number[]
	}
}

//===============================================
// BATCH OPERATION TYPES
//===============================================

// Progress event types for batch operations
export type BatchProgressEventType = 'batchStart' | 'batchComplete' | 'waiting' | 'complete'

// Progress event for batch task creation
export interface BatchProgressEvent {
	type: BatchProgressEventType
	currentBatch?: number
	totalBatches?: number
	batchSize?: number
	completedTasks?: number
	totalTasks?: number
	waitTime?: number
}

// Options for batch task creation
export interface BatchCreateOptions {
	batchSize?: number // Default: 100
	delayBetweenBatches?: number // Default: 60000ms
	verbose?: boolean
	onProgress?: (event: BatchProgressEvent) => void
}
