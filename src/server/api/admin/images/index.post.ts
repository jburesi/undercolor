/**
 * POST /api/admin/images - Create a new image set (admin only)
 */

import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "#shared/types/database.types";
import { createImageSetSchema } from "#shared/schemas";
import { requireAdmin } from "../../../utils/admin";

export default defineEventHandler(async (event) => {
  // Verify admin access using user_roles table
  const user = await requireAdmin(event);

  const body = await readBody(event);

  // Validate input
  const result = createImageSetSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid request body",
      data: result.error.flatten(),
    });
  }

  const { name, category, difficulty, innocentImageUrl, imposterImageUrl } =
    result.data;
  const supabase = serverSupabaseServiceRole<Database>(event);

  // Create image set
  const { data: imageSet, error } = await supabase
    .from("image_sets")
    .insert({
      name,
      category,
      difficulty,
      innocent_image_url: innocentImageUrl,
      imposter_image_url: imposterImageUrl,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to create image set",
    });
  }

  return { imageSet };
});
