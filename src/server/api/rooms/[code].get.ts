/**
 * GET /api/rooms/[code] - Get room details by code
 */

import { useSupabaseAdmin } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");

  if (!code || code.length !== 6) {
    throw createError({
      statusCode: 400,
      message: "Invalid room code",
    });
  }

  const supabase = useSupabaseAdmin(event);

  // Find room by code
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select(
      `
      id,
      code,
      host_id,
      state,
      config,
      current_round,
      phase_started_at,
      phase_ends_at,
      winner,
      created_at,
      players(
        id,
        username,
        avatar_url,
        is_host,
        is_alive,
        has_voted,
        connection_status
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

  return {
    roomId: room.id,
    roomCode: room.code,
    hostId: room.host_id,
    state: room.state,
    config: room.config,
    currentRound: room.current_round,
    phaseStartedAt: room.phase_started_at,
    phaseEndsAt: room.phase_ends_at,
    winner: room.winner,
    players: room.players,
    createdAt: room.created_at,
  };
});
