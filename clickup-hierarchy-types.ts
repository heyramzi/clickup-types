//===============================================
// CLICKUP HIERARCHY API TYPES
//===============================================
// Pure ClickUp API response types with ClickUp prefix for clarity

export enum ClickUpPermissionLevel {
  FULL = 'create',
  EDIT = 'edit',
  COMMENT = 'comment',
  READ = 'read',
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

//===============================================
// SPACES
//===============================================

export interface ClickUpSpace {
  id: string
  name: string
  color?: string
  private?: boolean
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
  lists: ClickUpList[]
  permission_level: ClickUpPermissionLevel
}

export interface ClickUpFoldersResponse {
  folders: ClickUpFolder[]
}

//===============================================
// LISTS
//===============================================

export interface ClickUpList {
  id: string
  name: string
  status?: {
    color: string
  }
  space: { name: string }
  folder?: { name: string }
  permission_level: ClickUpPermissionLevel
}

export interface ClickUpListsResponse {
  lists: ClickUpList[]
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

//===============================================
// USER
//===============================================

export interface ClickUpUser {
  id: number
  username: string
  email: string
  timezone?: string
  color?: string
  profilePicture?: string
}

export interface ClickUpUserResponse {
  user: ClickUpUser
}
