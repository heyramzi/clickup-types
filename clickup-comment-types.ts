//===============================================
// CLICKUP COMMENT TYPES
//===============================================

/**
 * ClickUp Task Comment
 * Represents a comment on a task
 */
export interface TaskComment {
	id: string
	comment: Array<{
		text: string
	}>
	comment_text: string
	user: {
		id: number
		username: string
		email?: string
		color: string
		profilePicture: string
	}
	resolved: boolean
	assignee: {
		id: number
		username: string
		email?: string
		color: string
		profilePicture: string
	} | null
	assigned_by: {
		id: number
		username: string
		email?: string
		color: string
		profilePicture: string
	} | null
	reactions: string[]
	date: string
	reply_count: string
}

/**
 * Get Task Comments Response
 */
export interface GetTaskCommentsResponse {
	comments: TaskComment[]
}
