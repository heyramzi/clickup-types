/**
 * ClickUp Token Storage for SvelteKit (Convex)
 * 簡潔 (Kanketsu - Simplicity)
 */

import type { ConvexHttpClient } from "convex/browser";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import type { TokenEncryption } from "./token.service";

/**
 * Convex-based token storage for ClickUp access tokens
 */
export const ClickUpTokenStorageConvex = {
  async save(
    convex: ConvexHttpClient,
    organizationId: Id<"organizations">,
    token: string,
    encryption: TokenEncryption,
  ): Promise<void> {
    await convex.mutation(api.organizations.update, {
      id: organizationId,
      clickupAccessToken: encryption.encrypt(token),
    });
  },

  async get(
    convex: ConvexHttpClient,
    organizationId: Id<"organizations">,
    encryption: TokenEncryption,
  ): Promise<string | null> {
    const org = await convex.query(api.organizations.get, {
      id: organizationId,
    });

    if (!org?.clickupAccessToken) return null;

    try {
      return encryption.decrypt(org.clickupAccessToken);
    } catch {
      return null;
    }
  },

  async delete(convex: ConvexHttpClient, organizationId: Id<"organizations">): Promise<void> {
    await convex.mutation(api.organizations.clearClickUpToken, {
      id: organizationId,
    });
  },
};
