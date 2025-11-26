/**
 * ClickUp OAuth Service for SvelteKit
 * 簡潔 (Kanketsu - Simplicity)
 */

import { exchangeCodeForToken, buildAuthUrl } from '../core/oauth-protocol'
import type { RequestEvent } from '@sveltejs/kit'

export interface ClickUpOAuthConfig {
	clientId: string
	clientSecret: string
	onSuccess: (token: string) => Promise<void>
}

/**
 * Handle ClickUp OAuth callback in SvelteKit
 *
 * @example
 * ```ts
 * // In +server.ts
 * await handleClickUpCallback(event, {
 *   clientId: PUBLIC_CLICKUP_CLIENT_ID,
 *   clientSecret: CLICKUP_CLIENT_SECRET,
 *   onSuccess: async (token) => {
 *     await saveToken(token)
 *   }
 * })
 * ```
 */
export async function handleClickUpCallback(
	event: RequestEvent,
	config: ClickUpOAuthConfig
): Promise<string> {
	const code = event.url.searchParams.get('code')

	if (!code) {
		throw new Error('Missing authorization code')
	}

	const token = await exchangeCodeForToken({
		clientId: config.clientId,
		clientSecret: config.clientSecret,
		code,
	})

	await config.onSuccess(token)

	return token
}

/**
 * Get ClickUp OAuth authorization URL for SvelteKit
 *
 * @example
 * ```ts
 * const authUrl = getClickUpAuthUrl(
 *   PUBLIC_CLICKUP_CLIENT_ID,
 *   event.url.origin,
 *   crypto.randomUUID() // CSRF state
 * )
 * ```
 */
export function getClickUpAuthUrl(
	clientId: string,
	origin: string,
	state?: string
): string {
	return buildAuthUrl({
		clientId,
		redirectUri: `${origin}/api/clickup/callback`,
		state,
	})
}
