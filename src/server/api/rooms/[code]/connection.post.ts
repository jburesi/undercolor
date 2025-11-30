/**
 * POST /api/rooms/:code/connection - Update player connection status
 */

import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "#shared/types/database.types";

const connectionSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(["CONNECTED", "DISCONNECTED", "RECONNECTING"]),
});

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  if (!code) {
    throw createError({
      statusCode: 400,
      message: "Room code is required",
    });
  }

  const body = await readBody(event);

  // Validate input
  const result = connectionSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid request body",
      data: result.error.flatten(),
    });
  }

  const { sessionId, status } = result.data;
  const supabase = serverSupabaseServiceRole<Database>(event);

  // Find room by code
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", code.toUpperCase())
    .single();

  if (roomError || !room) {
    throw createError({
      statusCode: 404,
      message: "Room not found",
    });
  }

  // Update player connection status
  const { error: updateError } = await supabase
    .from("players")
    .update({ connection_status: status })
    .eq("room_id", room.id)
    .eq("session_id", sessionId);

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: "Failed to update connection status",
    });
  }

  return { success: true };
});
