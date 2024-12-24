//===============================================
// CLICKUP TASKS BASE INTERFACES
//===============================================

// Base interface for common task properties
export interface Task {
  id: string;
  custom_id: string | null;
  custom_item_id: number | null;
  name: string;
  text_content: string;
  description: string;
  status: {
    status: string;
    color: string;
    type: string;
    orderindex?: number;
  };
  date_created: string;
  date_updated: string;
  date_closed: string | null;
  date_done: string | null;
  archived: boolean;
  creator: {
    id: number;
    username: string;
    color: string;
    email?: string;
    profilePicture: string;
  };
  assignees: Array<{
    id: number;
    username: string | null;
    color: string | null;
    initials: string;
    email: string;
    profilePicture: string | null;
  }>;
  tags: Array<{
    name: string;
    tag_fg: string;
    tag_bg: string;
    creator: number;
  }>;
  parent: string | null;
  priority: null | any; // TODO: Define priority type
  due_date: string | null;
  start_date: string | null;
  points: null | number;
  time_estimate: number | null;
  custom_fields: Array<{
    id: string;
    name: string;
    type: string;
    type_config: any;
    date_created: string;
    hide_from_guests: boolean;
    value?: any;
    required: boolean;
  }> | Record<string, any>;
  url: string;
  markdown_description?: string;
  orderindex?: string;
  time_spent: number | null;
  list?: {
    id: string;
  };
  folder?: {
    id: string;
  };
  space?: {
    id: string;
  };
  checklists: {
    id: string;
    task_id?: string;
    name: string;
    date_created: string;
    orderindex: string | number;
    creator: number;
    resolved: number;
    unresolved: number;
    items: Array<{
      id?: string;
      name: string;
      orderindex: number;
      assignee: null | any;
      group_assignee?: null | any;
      resolved: boolean;
      parent: null | string;
      date_created?: string;
      children: any[];
    }>;
  } | Array<any>;
}

// Update existing Tasks interface to extend BaseTask
export interface Tasks extends Task {
  watchers: Array<{
    id: number;
    username: string | null;
    color: string | null;
    initials: string;
    email: string;
    profilePicture: string | null;
  }>;
  dependencies: any[];
  linked_tasks: any[];
}

// Interface for task response from API
export interface TasksResponse {
tasks: Tasks[];
last_page: boolean;
} 

// Types
interface GetTasksRequestParams { // ClickUp API request options
includeSubtasks?: boolean;
includeClosed?: boolean;
}

interface LastPageCheckResult { // Result of last page check
exceededLimit: boolean;
shouldContinueSync: boolean;
tasks?: TasksResponse['tasks'];
}

interface TaskBatchResult { // Result of tasks batch fetch
tasks: Tasks[];
hasMore: boolean;
}

// Add this enum for validation status
enum ListValidationStatus {
VALID = 'valid',
EMPTY_OR_DELETED = 'emptyOrDeleted',
TOO_MANY_TASKS = 'tooManyTasks',
ERROR = 'error',
}

interface ListValidationResult {
status: ListValidationStatus;
error?: string;
}


//===============================================
// CLICKUP TASK CREATION INTERFACES
//=============================================== 

// Simplified request types for task creation
export interface CreateTaskRequestParams {
  name: string;
  description?: string;
  tags?: string[];
}

//=============================================== 
// CLICKUP COMMENT CREATION INTERFACES
//===============================================

// Simplified request types for comments
export interface CreateCommentRequestParams {
  comment_text: string;
  notify_all?: boolean;
}

// Response type for comment creation/retrieval
export interface CommentResponse {
  id: string;
  comment: string[];  // Array of comment content blocks
  user: {
    id: number;
    username: string;
    email: string;
    profilePicture?: string;
  };
  resolved: boolean;
  assignee?: {
    id: number;
    username: string;
  }
}

//=============================================== 
// CLICKUP ATTACHMENT INTERFACES
//===============================================

// Simplified request types for attachments
export interface CreateAttachmentRequestParams {
  attachment: File[];
  filename: string;
}

export interface AttachmentResponse {
  id: string;
  version: string;
  date: number;
  name: string;
  title: string;
  extension: string;
  source: number;
  thumbnail_small: string;
  thumbnail_medium: string;
  thumbnail_large: string;
  url: string;
  url_w_query: string;
  url_w_host: string;
}