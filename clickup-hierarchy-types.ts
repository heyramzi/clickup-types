//===============================================
// CLICKUP SHARED HIERARCHY INTERFACES
//===============================================

// Add this enum before the shared hierarchy interfaces
export enum ClickUpPermissionLevel {
	FULL = "create",
	EDIT = "edit",
	COMMENT = "comment",
	READ = "read",
}
//===============================================
// CLICKUP WORKSPACES INTERFACES
//===============================================

// Represents a ClickUp workspace (team)
export interface Workspace {
	id: string;
	name: string;
	color: string;
	avatar?: string | null;
}

// API response structure for workspaces
export interface WorkspacesResponse {
	teams: Workspace[];
}

export interface StoredWorkspace {
	id: string;
	name: string;
	color: string;
	avatar?: string | null;
}
//===============================================
// CLICKUP SPACES INTERFACES
//===============================================

// Represents a ClickUp space within a workspace
export interface Space {
	id: string;
	name: string;
	//color: string;
	// Add other relevant fields
}

// API response structure for spaces
export interface SpaceResponse {
	spaces: Space[];
}

//===============================================
// CLICKUP FOLDERS INTERFACES
//===============================================

// Represents a ClickUp folder, including nested lists
export interface Folder {
	id: string;
	name: string;
	lists: List[];
	permission_level: ClickUpPermissionLevel;
}

// API response structure for folders
export interface FolderResponse {
	folders: Folder[];
}

//===============================================
// CLICKUP LISTS INTERFACES
//===============================================

// API response structure for lists
export interface ListsResponse {
	lists: List[];
}

// Interface for normalized list data
export interface List {
	id: string;
	name: string;
	color?: string;
	space: { name: string };
	folder?: { name: string };
	permission_level: ClickUpPermissionLevel;
}

//===============================================
// CLICKUP SHARED HIERARCHY INTERFACES
//===============================================

export interface SharedHierarchyResponse {
	shared: {
		lists: List[];
		folders: Folder[];
	};
}
