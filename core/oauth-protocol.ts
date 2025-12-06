/**
 * ClickUp OAuth Protocol
 * 純粋 (Junsui - Purity)
 *
 * Pure functions for ClickUp OAuth 2.0 flow.
 * Zero dependencies, zero side effects, framework-agnostic.
 */

import type { ClickUpTokenResponse } from "../types/clickup-auth-types";

export interface OAuthTokenExchangeParams {
	clientId: string;
	clientSecret: string;
	code: string;
}

export interface OAuthUrlParams {
	clientId: string;
	redirectUri: string;
	state?: string;
}

/**
 * Exchange authorization code for access token
 *
 * @throws Error if token exchange fails
 */
export async function exchangeCodeForToken(
	params: OAuthTokenExchangeParams,
): Promise<string> {
	const response = await fetch("https://api.clickup.com/api/v2/oauth/token", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			client_id: params.clientId,
			client_secret: params.clientSecret,
			code: params.code,
			grant_type: "authorization_code",
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`ClickUp OAuth token exchange failed: ${errorText}`);
	}

	const data: ClickUpTokenResponse = await response.json();
	return data.access_token;
}

/**
 * Build ClickUp OAuth authorization URL
 */
export function buildAuthUrl(params: OAuthUrlParams): string {
	const searchParams = new URLSearchParams({
		client_id: params.clientId,
		redirect_uri: params.redirectUri,
		response_type: "code",
	});

	if (params.state) {
		searchParams.set("state", params.state);
	}

	return `https://app.clickup.com/api?${searchParams.toString()}`;
}
