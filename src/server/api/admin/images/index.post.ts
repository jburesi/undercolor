/**
 * POST /api/admin/images - Create a new image set (admin only)
 */

import { z } from "zod";
import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { Database } from "#shared/types/database.types";

const createImageSetSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(2).max(50),
  difficulty: z.enum(["easy", "medium", "hard"]),
  innocentImageUrl: z.string().url(),
  imposterImageUrl: z.string().url(),
});

export default defineEventHandler(async (event) => {
  // Verify admin access
  const user = await serverSupabaseUser(event);
  if (!user || user.app_metadata?.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Admin access required",
    });
  }

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
