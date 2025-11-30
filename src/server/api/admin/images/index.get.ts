/**
 * GET /api/admin/images - List all image sets (admin only)
 */

import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "#shared/types/database.types";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event);

  const { data: imageSets, error } = await supabase
    .from("image_sets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to fetch image sets",
    });
  }

  return { imageSets };
});
