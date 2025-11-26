/**
 * ClickUp OAuth Service for Next.js
 * 簡潔 (Kanketsu - Simplicity)
 */

import { exchangeCodeForToken, buildAuthUrl } from '../core/oauth-protocol'
import type { NextRequest } from 'next/server'

export interface ClickUpOAuthConfig {
	clientId: string
	clientSecret: string
	onSuccess: (token: string) => Promise<void>
}

/**
 * Handle ClickUp OAuth callback in Next.js
 *
 * @example
 * ```ts
 * // In app/api/clickup/callback/route.ts
 * await handleClickUpCallback(request, {
 *   clientId: process.env.CLICKUP_CLIENT_ID!,
 *   clientSecret: process.env.CLICKUP_CLIENT_SECRET!,
 *   onSuccess: async (token) => {
 *     await saveToken(token)
 *   }
 * })
 * ```
 */
export async function handleClickUpCallback(
	request: NextRequest,
	config: ClickUpOAuthConfig
): Promise<string> {
	const url = new URL(request.url)
	const code = url.searchParams.get('code')

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
 * Get ClickUp OAuth authorization URL for Next.js
 *
 * @example
 * ```ts
 * const authUrl = getClickUpAuthUrl(
 *   process.env.NEXT_PUBLIC_CLICKUP_CLIENT_ID!,
 *   process.env.NEXT_PUBLIC_BASE_URL!,
 *   crypto.randomUUID() // CSRF state
 * )
 * ```
 */
export function getClickUpAuthUrl(
	clientId: string,
	baseUrl: string,
	state?: string
): string {
	return buildAuthUrl({
		clientId,
		redirectUri: `${baseUrl}/api/clickup/callback`,
		state,
	})
}
