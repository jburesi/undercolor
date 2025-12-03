/**
 * Admin Utilities - Server-side admin verification
 */

import type { H3Event } from "h3";
import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { Database } from "#shared/types/database.types";

/**
 * Check if the current user is an admin by querying the user_roles table.
 * Uses service role to bypass RLS.
 *
 * @returns The user object if admin, null otherwise
 * @throws H3Error with 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin(event: H3Event) {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  const supabase = serverSupabaseServiceRole<Database>(event);

  // Check user_roles table for admin role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.sub)
    .single();

  if (userRole?.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Admin access required",
    });
  }

  return user;
}

/**
 * Check if a user is an admin (without throwing errors)
 *
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(event: H3Event): Promise<boolean> {
  try {
    const user = await serverSupabaseUser(event);
    if (!user) return false;

    const supabase = serverSupabaseServiceRole<Database>(event);

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    return userRole?.role === "admin";
  } catch {
    return false;
  }
}
