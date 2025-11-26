/**
 * ClickUp Utils - Universal ClickUp Integration
 *
 * Types + Services for ClickUp API integration across projects.
 * Import only what you need - types, core, or framework-specific services.
 */

//===============================================
// TYPES - Re-export all type definitions
//===============================================

export * from './types/clickup-api-constants'
export * from './types/clickup-auth-types'
export * from './types/clickup-hierarchy-types'
export * from './types/clickup-task-types'
export * from './types/clickup-field-types'
export * from './types/clickup-doc-types'
export * from './types/clickup-time-types'
export * from './types/clickup-chat-types'
export * from './types/clickup-comment-types'
export * from './types/clickup-view-types'
export * from './types/clickup-task-transformers'

//===============================================
// CORE - Framework-agnostic OAuth protocol
//===============================================

export {
	exchangeCodeForToken,
	buildAuthUrl,
	type OAuthTokenExchangeParams,
	type OAuthUrlParams,
} from './core/oauth-protocol'

//===============================================
// SVELTEKIT - SvelteKit-specific services
//===============================================

export {
	handleClickUpCallback as handleClickUpCallbackSvelteKit,
	getClickUpAuthUrl as getClickUpAuthUrlSvelteKit,
	type ClickUpOAuthConfig as ClickUpOAuthConfigSvelteKit,
} from './sveltekit/oauth.service'

export { ClickUpTokenStorage as ClickUpTokenStorageSvelteKit } from './sveltekit/token.service'

//===============================================
// NEXT.JS - Next.js-specific services
//===============================================

export {
	handleClickUpCallback as handleClickUpCallbackNextJS,
	getClickUpAuthUrl as getClickUpAuthUrlNextJS,
	type ClickUpOAuthConfig as ClickUpOAuthConfigNextJS,
} from './nextjs/oauth.service'
