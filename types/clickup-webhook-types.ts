//===============================================
// CLICKUP WEBHOOK TYPES
//===============================================

import type { ClickUpTaskCustomField, ClickUpTaskPriority } from "./clickup-task-types.js";

// Webhook delivery health states (matches ClickUp API; "failing" not "failed").
export type WebhookStatus = "active" | "suspended" | "failing";

export interface WebhookHealth {
  status: WebhookStatus;
  fail_count: number;
}

//===============================================
// WEBHOOK MANAGEMENT (list/create endpoints)
//===============================================

// Full set of webhook events documented by ClickUp.
// "spaceUpdated" is sent alongside taskMoved; included here for completeness.
export type WebhookEvent =
  | "taskCreated"
  | "taskUpdated"
  | "taskDeleted"
  | "taskMoved"
  | "taskStatusUpdated"
  | "taskPriorityUpdated"
  | "taskAssigneeUpdated"
  | "taskDueDateUpdated"
  | "taskTagUpdated"
  | "taskCommentPosted"
  | "taskCommentUpdated"
  | "taskTimeEstimateUpdated"
  | "taskTimeTrackedUpdated"
  | "spaceUpdated";

// Webhook from list endpoint (GET /team/{team_id}/webhook).
export interface WebhookListItem {
  id: string;
  userid: number;
  team_id: number;
  endpoint: string;
  client_id: string;
  events: WebhookEvent[];
  task_id: string | null;
  list_id: number | null;
  folder_id: number | null;
  space_id: number | null;
  view_id: string | null;
  health: WebhookHealth;
  secret: string;
}

// Webhook from create endpoint (POST /team/{team_id}/webhook).
export interface WebhookCreateResponse {
  id: string;
  webhook: {
    id: string;
    userid: number;
    team_id: string;
    endpoint: string;
    client_id: string;
    events: WebhookEvent[];
    task_id?: string;
    list_id?: string;
    folder_id?: string;
    space_id?: string;
    health?: WebhookHealth;
    secret: string;
  };
}

// Request body for POST /team/{team_id}/webhook.
export interface CreateWebhookPayload {
  endpoint: string;
  events: WebhookEvent[];
  space_id?: string;
  folder_id?: string;
  list_id?: string;
}

//===============================================
// WEBHOOK PAYLOADS (delivered to consumer endpoints)
//===============================================

// User block embedded in every history_item.
export interface WebhookUser {
  id: number;
  username: string;
  email: string;
  color: string;
  initials: string;
  profilePicture: string | null;
}

// Status snapshot used in before/after of status fields.
export interface WebhookStatusValue {
  status: string | null;
  color: string;
  type: string;
  orderindex: number;
}

// List metadata used in before/after of section_moved (taskMoved) items.
export interface WebhookListSnapshot {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
    hidden: boolean;
  };
  project: {
    id: string;
    name: string;
  };
}

// Comment block embedded on comment history_items.
export interface WebhookComment {
  id: string;
  date: string;
  parent: string;
  type: number;
  comment: Array<{ text: string; attributes?: Record<string, unknown> }>;
  text_content: string;
  user: WebhookUser;
  reactions: unknown[];
  emails: unknown[];
  [key: string]: unknown;
}

// Common base for every history_item entry.
interface HistoryItemBase<TField extends string, TBefore, TAfter> {
  id: string;
  type: number;
  date: string;
  field: TField;
  parent_id: string;
  data: Record<string, unknown>;
  source: string | null;
  user: WebhookUser;
  before: TBefore;
  after: TAfter;
}

export type StatusHistoryItem = HistoryItemBase<
  "status",
  WebhookStatusValue | null,
  WebhookStatusValue
>;

export type TaskCreationHistoryItem = HistoryItemBase<"task_creation", null, null>;

export type ContentHistoryItem = HistoryItemBase<"content", string | null, string>;

export type CustomFieldHistoryItem = HistoryItemBase<"custom_field", unknown, string> & {
  custom_field: ClickUpTaskCustomField;
};

export type PriorityHistoryItem = HistoryItemBase<
  "priority",
  ClickUpTaskPriority | null,
  ClickUpTaskPriority
>;

export type AssigneeAddHistoryItem = Omit<
  HistoryItemBase<"assignee_add", unknown, WebhookUser>,
  "before"
>;

export type AssigneeRemoveHistoryItem = HistoryItemBase<"assignee_rem", WebhookUser, null>;

export type DueDateHistoryItem = HistoryItemBase<"due_date", string | null, string | null>;

export type TagHistoryItem = HistoryItemBase<
  "tag",
  Array<{ name: string; tag_fg: string; tag_bg: string; creator: number }> | null,
  Array<{ name: string; tag_fg: string; tag_bg: string; creator: number }>
>;

export type SectionMovedHistoryItem = HistoryItemBase<
  "section_moved",
  WebhookListSnapshot,
  WebhookListSnapshot
>;

export type CommentHistoryItem = HistoryItemBase<"comment", null, string> & {
  comment: WebhookComment;
};

export type TimeEstimateHistoryItem = HistoryItemBase<"time_estimate", string | null, string>;

export type TimeSpentHistoryItem = HistoryItemBase<
  "time_spent",
  unknown,
  {
    id: string;
    start: string;
    end: string;
    time: string;
    source: string;
    date_added: string;
  }
>;

// Parent change is undocumented but observed when tasks become subtasks.
export type ParentHistoryItem = HistoryItemBase<"parent", string | null, string | null>;

// Catch-all for history_items whose `field` we don't model individually.
export type UnknownHistoryItem = HistoryItemBase<string, unknown, unknown>;

export type WebhookHistoryItem =
  | StatusHistoryItem
  | TaskCreationHistoryItem
  | ContentHistoryItem
  | CustomFieldHistoryItem
  | PriorityHistoryItem
  | AssigneeAddHistoryItem
  | AssigneeRemoveHistoryItem
  | DueDateHistoryItem
  | TagHistoryItem
  | SectionMovedHistoryItem
  | CommentHistoryItem
  | TimeEstimateHistoryItem
  | TimeSpentHistoryItem
  | ParentHistoryItem
  | UnknownHistoryItem;

interface WebhookPayloadBase<TEvent extends WebhookEvent> {
  event: TEvent;
  task_id: string;
  webhook_id: string;
  history_items: WebhookHistoryItem[];
}

export type TaskCreatedPayload = WebhookPayloadBase<"taskCreated">;

export type TaskUpdatedPayload = WebhookPayloadBase<"taskUpdated">;

export type TaskMovedPayload = WebhookPayloadBase<"taskMoved">;

export type TaskStatusUpdatedPayload = WebhookPayloadBase<"taskStatusUpdated">;

export type TaskPriorityUpdatedPayload = WebhookPayloadBase<"taskPriorityUpdated">;

export type TaskAssigneeUpdatedPayload = WebhookPayloadBase<"taskAssigneeUpdated">;

export type TaskDueDateUpdatedPayload = WebhookPayloadBase<"taskDueDateUpdated">;

export type TaskTagUpdatedPayload = WebhookPayloadBase<"taskTagUpdated">;

export type TaskCommentPostedPayload = WebhookPayloadBase<"taskCommentPosted">;

export type TaskCommentUpdatedPayload = WebhookPayloadBase<"taskCommentUpdated">;

export type TaskTimeEstimateUpdatedPayload = WebhookPayloadBase<"taskTimeEstimateUpdated">;

export type TaskTimeTrackedUpdatedPayload = WebhookPayloadBase<"taskTimeTrackedUpdated"> & {
  data?: {
    description?: string;
    interval_id?: string;
  };
};

// taskDeleted is the only event without history_items.
export interface TaskDeletedPayload {
  event: "taskDeleted";
  task_id: string;
  webhook_id: string;
}

// spaceUpdated has no task_id and no history_items; it accompanies taskMoved.
export interface SpaceUpdatedPayload {
  event: "spaceUpdated";
  space_id: string;
  webhook_id: string;
}

export type ClickUpWebhookPayload =
  | TaskCreatedPayload
  | TaskUpdatedPayload
  | TaskDeletedPayload
  | TaskMovedPayload
  | TaskStatusUpdatedPayload
  | TaskPriorityUpdatedPayload
  | TaskAssigneeUpdatedPayload
  | TaskDueDateUpdatedPayload
  | TaskTagUpdatedPayload
  | TaskCommentPostedPayload
  | TaskCommentUpdatedPayload
  | TaskTimeEstimateUpdatedPayload
  | TaskTimeTrackedUpdatedPayload
  | SpaceUpdatedPayload;
