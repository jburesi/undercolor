/**
 * GET /api/rooms - List public rooms in LOBBY state
 */

import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "#shared/types/database.types";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event);

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(
      `
      id,
      code,
      state,
      config,
      is_public,
      created_at,
      host:players!fk_rooms_host_id(username),
      players:players!players_room_id_fkey(count)
    `,
    )
    .eq("state", "LOBBY")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to fetch rooms",
    });
  }

  // Transform data for client - use host's username as room display name

  const publicRooms = rooms.map((room) => {
    const hostUsername = room.host?.username;
    return {
      roomId: room.id,
      roomCode: room.code,
      hostName: hostUsername || "Unknown",
      playerCount: room.players[0]?.count || 0,
      maxPlayers: (room.config as { maxPlayers?: number })?.maxPlayers || 20,
      createdAt: room.created_at,
    };
  });

  return { rooms: publicRooms };
});
