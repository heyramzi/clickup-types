/**
 * ClickUp Token Storage for SvelteKit
 * 簡潔 (Kanketsu - Simplicity)
 *
 * Swap backend by changing the re-export below:
 *   - token.service.convex.ts  → Convex
 *   - token.service.supabase.ts → Supabase
 */

export interface TokenEncryption {
  encrypt: (token: string) => string;
  decrypt: (token: string) => string;
}

// Active implementation — change this line to swap backends
export { ClickUpTokenStorageConvex as ClickUpTokenStorage } from "./token.service.convex";
