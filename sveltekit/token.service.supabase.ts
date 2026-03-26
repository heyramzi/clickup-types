/**
 * ClickUp Token Storage for SvelteKit (Supabase)
 * 簡潔 (Kanketsu - Simplicity)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { TokenEncryption } from "./token.service";

/**
 * Supabase-based token storage for ClickUp access tokens
 */
export const ClickUpTokenStorageSupabase = {
  async save(
    supabase: SupabaseClient,
    organizationId: string,
    token: string,
    encryption: TokenEncryption,
  ): Promise<void> {
    const { error } = await supabase
      .from("organizations")
      .update({ clickup_access_token: encryption.encrypt(token) })
      .eq("id", organizationId);

    if (error) {
      throw new Error(`Failed to save ClickUp token: ${error.message}`);
    }
  },

  async get(
    supabase: SupabaseClient,
    organizationId: string,
    encryption: TokenEncryption,
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from("organizations")
      .select("clickup_access_token")
      .eq("id", organizationId)
      .single();

    if (error || !data?.clickup_access_token) return null;

    try {
      return encryption.decrypt(data.clickup_access_token);
    } catch {
      return null;
    }
  },

  async delete(supabase: SupabaseClient, organizationId: string): Promise<void> {
    const { error } = await supabase
      .from("organizations")
      .update({ clickup_access_token: null })
      .eq("id", organizationId);

    if (error) {
      throw new Error(`Failed to delete ClickUp token: ${error.message}`);
    }
  },
};
