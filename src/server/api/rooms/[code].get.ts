/**
 * GET /api/rooms/[code] - Get room details by code
 */

import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "#shared/types/database.types";

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");

  if (!code || code.length !== 6) {
    throw createError({
      statusCode: 400,
      message: "Invalid room code",
    });
  }

  const supabase = serverSupabaseServiceRole<Database>(event);

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
      host:players!fk_rooms_host_id(username),
      players:players!players_room_id_fkey(
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

  const hostUsername = room.host?.username;

  return {
    roomId: room.id,
    roomCode: room.code,
    hostName: hostUsername || "Unknown",
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
