//===============================================
// CLICKUP STORED/REDUCED TYPES
//===============================================
// Minimized types for efficient storage in Properties Service

// Reduced workspace data for storage
export interface ReducedWorkspace {
	id: string
	name: string
	color: string
	hasMembers: boolean
}

// Stored workspaces response
export interface StoredWorkspaces {
	workspaces: ReducedWorkspace[]
}

// Reduced space data for storage
export interface ReducedSpace {
	id: string
	name: string
	hasFolders: boolean
	hasFolderlessLists: boolean
	hasShared: boolean
}

// Reduced folder data for storage
export interface ReducedFolder {
	id: string
	name: string
	hasLists: boolean
}

// Reduced list data for storage
export interface ReducedList {
	id: string
	name: string
}

// Stored shared hierarchy data
export interface StoredSharedHierarchy {
	folders: ReducedFolder[]
	lists: ReducedList[]
}

// Reduced view data for storage
export interface ReducedView {
	id: string
	name: string
	type: string
}

// Reduced user data for storage
export interface ReducedUser {
	id: number
	username: string
	timezone?: string
	email: string
}

