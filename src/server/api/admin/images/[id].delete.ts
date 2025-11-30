/**
 * DELETE /api/admin/images/[id] - Delete an image set (admin only)
 */

import { useSupabaseAdmin } from "../../../utils/supabase";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  // Verify admin access
  const user = await serverSupabaseUser(event);
  if (!user || user.app_metadata?.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Admin access required",
    });
  }

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Image set ID required",
    });
  }

  const supabase = useSupabaseAdmin(event);

  // Delete image set
  const { error } = await supabase.from("image_sets").delete().eq("id", id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to delete image set",
    });
  }

  return { success: true };
});
