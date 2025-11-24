//===============================================
// CLICKUP HIERARCHY API TYPES
//===============================================
// Pure ClickUp API response types with ClickUp prefix for clarity

export enum ClickUpPermissionLevel {
	FULL = 'create',
	EDIT = 'edit',
	COMMENT = 'comment',
	READ = 'read'
}

//===============================================
// WORKSPACES (TEAMS)
//===============================================

export interface ClickUpWorkspace {
	id: string
	name: string
	color: string
	avatar?: string | null
}

export interface ClickUpWorkspacesResponse {
	teams: ClickUpWorkspace[]
}

// Team member types
export interface ClickUpTeamMember {
	user: {
		id: number
		username: string
		email: string
		color: string
		profilePicture?: string | null
		initials: string
		role: number // 1=owner, 2=admin, 3=member, 4=guest
		role_subtype: number
		role_key: 'owner' | 'admin' | 'member' | 'guest'
		custom_role: string | null
		date_joined: string | null
		date_invited: string | null
	}
	invited_by?: {
		id: number
		username: string
		color: string
		email: string
		initials: string
		profilePicture: string | null
	}
	can_see_time_spent?: boolean
	can_see_time_estimated?: boolean
	can_see_points_estimated?: boolean
	can_edit_tags?: boolean
	can_create_views?: boolean
}

export interface ClickUpTeamResponse {
	team: {
		id: string
		name: string
		color: string
		avatar: string | null
		members: ClickUpTeamMember[]
	}
}

//===============================================
// SPACES
//===============================================

export interface ClickUpSpaceFeatures {
  due_dates: {
    enabled: boolean
    start_date: boolean
    remap_due_dates: boolean
    remap_closed_due_date: boolean
  }
  sprints: {
    enabled: boolean
  }
}

export interface ClickUpSpace {
	id: string
	name: string
	color?: string
	private?: boolean
	features?: ClickUpSpaceFeatures
}

export interface ClickUpSpacesResponse {
	spaces: ClickUpSpace[]
}

//===============================================
// FOLDERS
//===============================================

export interface ClickUpFolder {
	id: string
	name: string
	hidden?: boolean
	lists?: ClickUpList[]
	space?: {
		id: string
		name: string
	}
	permission_level?: ClickUpPermissionLevel
}

export interface ClickUpFoldersResponse {
	folders: ClickUpFolder[]
}

//===============================================
// LISTS
//===============================================

export interface ClickUpListStatus {
	id: string
	status: string
	orderindex: number
	color: string
	type: 'open' | 'custom' | 'done' | 'closed'
	status_group?: string
}

export interface ClickUpListAssignee {
	id: number
	username: string
	color: string
	initials: string
	profilePicture: string | null
}

export interface ClickUpList {
	id: string
	name: string
	deleted: boolean
	orderindex: number
	content?: string
	status?: {
		status: string
		color: string
	}
	priority: null | {
		priority: string
		color: string
	}
	assignee: ClickUpListAssignee | null
	task_count: number
	due_date: string | null
	start_date: string | null
	folder: {
		id: string
		name: string
		hidden: boolean
		access: boolean
	} | null
	space: {
		id: string
		name: string
		access: boolean
	}
	inbound_address?: string
	archived: boolean
	override_statuses: boolean
	statuses: ClickUpListStatus[]
	permission_level: ClickUpPermissionLevel
}

export interface ClickUpListsResponse {
	lists: ClickUpList[]
}

//===============================================
// CUSTOM ITEM TYPES (TASK TYPES)
//===============================================

export interface ClickUpCustomItemType {
	id: number
	name: string
	enabled: boolean
	deleted: boolean
	avatar?: {
		attachment_id: string
		url: string
		thumbnail_url: string
	} | null
}

export interface ClickUpCustomItemTypesResponse {
	custom_items: ClickUpCustomItemType[]
}

//===============================================
// SHARED HIERARCHY
//===============================================

export interface ClickUpSharedHierarchyResponse {
	shared: {
		lists: ClickUpList[]
		folders: ClickUpFolder[]
	}
}
