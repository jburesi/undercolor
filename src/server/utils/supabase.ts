/**
 * Supabase Server Client Utility
 *
 * Uses @nuxtjs/supabase server utilities
 */

import {
  serverSupabaseServiceRole,
  serverSupabaseClient,
} from "#supabase/server";
import type { H3Event } from "h3";
import type { Database } from "#shared/types/database.types";

/**
 * Get Supabase admin client for server-side operations
 * Uses service role key for full database access
 */
export function useSupabaseAdmin(event: H3Event) {
  return serverSupabaseServiceRole<Database>(event);
}

/**
 * Get Supabase client for server-side operations
 * Uses the user's session for RLS-enabled queries
 */
export function useSupabaseServer(event: H3Event) {
  return serverSupabaseClient<Database>(event);
}
