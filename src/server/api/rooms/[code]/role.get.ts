/**
 * GET /api/rooms/[code]/role - Get player's role and image (authenticated per session)
 */

import { useSupabaseAdmin } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const query = getQuery(event);

  if (!code) {
    throw createError({
      statusCode: 400,
      message: "Invalid room code",
    });
  }

  const sessionId = query.sessionId as string;
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: "Session ID required",
    });
  }

  const supabase = useSupabaseAdmin(event);

  // Find room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select(
      `
      id,
      state,
      current_image_set_id,
      image_sets(
        innocent_image_url,
        imposter_image_url
      )
    `,
    )
    .eq("code", code.toUpperCase())
    .single();

  if (roomError || !room) {
    throw createError({
      statusCode: 404,
      message: "Room not found",
    });
  }

  // Check if game has started
  if (room.state === "LOBBY") {
    throw createError({
      statusCode: 400,
      message: "Game has not started yet",
    });
  }

  // Find player by session ID
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, role")
    .eq("room_id", room.id)
    .eq("session_id", sessionId)
    .single();

  if (playerError || !player) {
    throw createError({
      statusCode: 403,
      message: "Player not found in this room",
    });
  }

  if (!player.role) {
    throw createError({
      statusCode: 400,
      message: "Role not yet assigned",
    });
  }

  // Get the correct image URL based on role
  const imageSet = room.image_sets as {
    innocent_image_url: string;
    imposter_image_url: string;
  } | null;

  let imageUrl: string | null = null;

  if (imageSet) {
    switch (player.role) {
      case "INNOCENT":
        imageUrl = imageSet.innocent_image_url;
        break;
      case "IMPOSTER":
        imageUrl = imageSet.imposter_image_url;
        break;
      case "MR_WHITE":
        // Mr. White sees nothing
        imageUrl = null;
        break;
    }
  }

  return {
    role: player.role,
    imageUrl,
  };
});
