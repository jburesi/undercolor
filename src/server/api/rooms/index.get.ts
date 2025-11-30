/**
 * GET /api/rooms - List public rooms in LOBBY state
 */

import { useSupabaseAdmin } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const supabase = useSupabaseAdmin(event);

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
      players:players(count)
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

  // Transform data for client
  const publicRooms = rooms.map((room) => ({
    roomId: room.id,
    roomCode: room.code,
    playerCount: room.players[0]?.count || 0,
    maxPlayers: (room.config as { maxPlayers?: number })?.maxPlayers || 20,
    createdAt: room.created_at,
  }));

  return { rooms: publicRooms };
});
