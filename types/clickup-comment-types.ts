//===============================================
// CLICKUP COMMENT TYPES
//===============================================

/**
 * Quill Delta text attributes for inline formatting.
 * ClickUp comments use Quill Delta format under the hood.
 */
export interface ClickUpCommentTextAttributes {
  bold?: true;
  italic?: true;
  strike?: true;
  underline?: true;
  link?: string;
  code?: true;
}

/**
 * Quill Delta line attributes applied to newline characters.
 * These format the entire line preceding the newline.
 */
export interface ClickUpCommentLineAttributes {
  header?: 1 | 2 | 3;
  list?: "bullet" | "ordered" | "checked" | "unchecked";
  blockquote?: true;
  "code-block"?: true;
  divider?: true;
  "block-id"?: string;
}

/**
 * A single segment of rich text in a ClickUp comment (Quill Delta op).
 * - Plain text: `{ text: "hello" }`
 * - Inline formatting: `{ text: "bold", attributes: { bold: true } }`
 * - Line formatting: `{ text: "\n", attributes: { header: 1 } }`
 * - User mention: `{ type: "tag", user: {...}, text: "@Name" }`
 */
export type ClickUpCommentSegment =
  | {
      text: string;
      type?: never;
      attributes?: ClickUpCommentTextAttributes & ClickUpCommentLineAttributes;
    }
  | {
      type: "tag";
      text: string;
      user: {
        id: number;
        username: string;
        email?: string;
        initials?: string;
        profilePicture?: string;
      };
    };

/**
 * Request body for creating a comment with rich text formatting.
 * Use `comment` array for Quill Delta formatting, or `comment_text` for plain text.
 */
export interface CreateCommentBody {
  comment?: ClickUpCommentSegment[];
  comment_text?: string;
  assignee?: number;
  notify_all?: boolean;
}

/**
 * ClickUp Task Comment
 * Represents a comment on a task
 */
export interface ClickUpTaskComment {
  id: string;
  comment: ClickUpCommentSegment[];
  comment_text: string;
  user: {
    id: number;
    username: string;
    email?: string;
    color: string;
    profilePicture: string;
  };
  resolved: boolean;
  assignee: {
    id: number;
    username: string;
    email?: string;
    color: string;
    profilePicture: string;
  } | null;
  assigned_by: {
    id: number;
    username: string;
    email?: string;
    color: string;
    profilePicture: string;
  } | null;
  reactions: string[];
  date: string;
  reply_count: string;
}

/**
 * Get Task Comments Response
 */
export interface ClickUpTaskCommentsResponse {
  comments: ClickUpTaskComment[];
}
