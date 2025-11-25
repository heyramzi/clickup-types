//===============================================
// CLICKUP CUSTOM FIELDS INTERFACES
//===============================================

// Enum for defining ClickUp field types
export enum ClickUpFieldType {
	TEXT = 'text',
	SHORT_TEXT = 'short_text',
	URL = 'url',
	EMAIL = 'email',
	PHONE = 'phone',
	DROPDOWN = 'drop_down',
	DATE = 'date',
	TIMESTAMP = 'timestamp',
	NUMERIC = 'numeric',
	NUMBER = 'number',
	CURRENCY = 'currency',
	CHECKBOX = 'checkbox',
	LABELS = 'labels',
	USERS = 'users',
	TASKS = 'tasks',
	STATUS = 'status',
	ATTACHMENT = 'attachment',
	MANUAL_PROGRESS = 'manual_progress',
	AUTOMATIC_PROGRESS = 'automatic_progress',
	LOCATION = 'location',
	EMOJI = 'emoji',
	VOTES = 'votes',
	LIST_RELATIONSHIP = 'list_relationship' // Add this new type
}

// Define type configurations for different field types
export type FieldTypeConfig =
	| { options: DropdownOption[] } // For dropdown fields
	| { options: { id: string; label: string; color: string }[] } // For label fields
	| { precision: number; currency_type: string; color: string } // For currency fields
	| { single_user: boolean; include_guests: boolean } // For user fields
	| { code_point: string; hide_voters: boolean } // For vote fields
	| ListRelationshipTypeConfig // For list relationship fields
	| Record<string, never> // For fields with empty config like attachments
	| Record<string, unknown> // For other field types with unknown config

// Custom Field Types
export interface ClickUpCustomField {
	id: string
	name: string
	type: ClickUpFieldType
	type_config: FieldTypeConfig
	value?: unknown
}

// Custom Field Response
export interface ClickUpCustomFieldResponse {
	fields: ClickUpCustomField[]
}

// Define the option type first
export interface DropdownOption {
	id: string
	name: string
	color: string | null
	orderindex: number
}

// Use DropdownOption in DropdownField
export interface DropdownField extends ClickUpCustomField {
	type: ClickUpFieldType.DROPDOWN
	type_config: {
		options: DropdownOption[]
	}
	value?: number
}

export interface LabelField extends ClickUpCustomField {
	type: ClickUpFieldType.LABELS
	type_config: {
		options: {
			id: string
			label: string
			color: string //Hex Color Code
		}[]
	}
	value?: string[]
}

export interface CurrencyField extends ClickUpCustomField {
	type: ClickUpFieldType.CURRENCY
	type_config: {
		precision: number
		currency_type: string
		color: string //Hex Color Code
	}
	value?: number
}

export interface UserField extends ClickUpCustomField {
	type: ClickUpFieldType.USERS
	type_config: {
		single_user: boolean
		include_guests: boolean
	}
	value?: Array<{
		id: number
		username: string | null
		email: string
		color: string | null
		initials: string
		profilePicture: string | null
	}>
}

// Add or update the VoteField type if not already defined
export interface VoteField extends ClickUpCustomField {
	type: ClickUpFieldType.VOTES
	type_config: {
		code_point: string
		hide_voters: boolean
	}
	value: number[]
}

// Add the LocationField type if not already defined
export interface LocationField extends ClickUpCustomField {
	type: ClickUpFieldType.LOCATION
	value: {
		place_id: string
		formatted_address: string
		location: {
			lat: number
			lng: number
		}
	}
}

// Add the TaskField type if not already defined
export interface TaskField extends ClickUpCustomField {
	type: ClickUpFieldType.TASKS
	value: Array<{
		id: string
		name: string
		status?: string
		url?: string
		custom_type?: number
		deleted?: boolean
		access?: boolean
		color?: string
		team_id?: string
	}>
}

// Add interface for list relationship value type (for better type safety)
export interface ListRelationshipItem {
	id: string
	name: string
	status: string
	color: string
	custom_type: number | null
	team_id: string
	deleted: boolean
	url: string
	access: boolean
}

export interface ClickUpCustomFieldOption {
	id: string
	name: string
	color: string | null // can be null
	orderindex: number
}

// Add interface for list relationship type config
export interface ListRelationshipTypeConfig {
	fields: ListRelationshipField[]
	subcategory_id: string
	linked_subcategory_access: boolean
	subcategory_inverted_name: string
}

// Add ListRelationshipField interface
export interface ListRelationshipField extends ClickUpCustomField {
	type: ClickUpFieldType.LIST_RELATIONSHIP
	type_config: ListRelationshipTypeConfig
	value?: ListRelationshipItem[]
}

// Add the AttachmentField interface
export interface AttachmentField extends ClickUpCustomField {
	type: ClickUpFieldType.ATTACHMENT
	type_config: Record<string, never> // Empty object type since type_config is {}
	value?: Array<{
		title: string
		url_w_query: string
	}>
}

//===============================================
// BACKWARD COMPATIBLE ALIASES
//===============================================

// Legacy alias for ClickUpFieldType
export const ClickUpCustomFieldType = ClickUpFieldType;
