/**
 * POST /api/rooms/join - Join an existing room by code
 */

import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "#shared/types/database.types";

const joinRoomSchema = z.object({
  roomCode: z.string().length(6),
  username: z.string().min(2).max(20),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Validate input
  const result = joinRoomSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid request body",
      data: result.error.flatten(),
    });
  }

  const { roomCode, username } = result.data;
  const supabase = serverSupabaseServiceRole<Database>(event);

  // Find room by code
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select(
      `
      *,
      players:players!players_room_id_fkey(*)
    `,
    )
    .eq("code", roomCode.toUpperCase())
    .single();

  if (roomError || !room) {
    throw createError({
      statusCode: 404,
      message: "Room not found",
    });
  }

  // Check if room is in LOBBY state
  if (room.state !== "LOBBY") {
    throw createError({
      statusCode: 400,
      message: "Game has already started",
    });
  }

  // Check if room is full
  const maxPlayers = (room.config as { maxPlayers?: number })?.maxPlayers || 20;
  if (room.players.length >= maxPlayers) {
    throw createError({
      statusCode: 400,
      message: "Room is full",
    });
  }

  // Check if username is taken in this room
  const usernameTaken = room.players.some(
    (p: { username: string }) =>
      p.username.toLowerCase() === username.toLowerCase(),
  );
  if (usernameTaken) {
    throw createError({
      statusCode: 400,
      message: "Username is already taken in this room",
    });
  }

  // Generate session ID for the player
  const sessionId = crypto.randomUUID();

  // Create player
  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      session_id: sessionId,
      username: username,
      is_host: false,
    })
    .select()
    .single();

  if (playerError || !player) {
    throw createError({
      statusCode: 500,
      message: "Failed to join room",
    });
  }

  // Get updated player list (without sensitive data)
  const { data: players } = await supabase
    .from("players")
    .select("id, username, avatar_url, is_host, is_alive, connection_status")
    .eq("room_id", room.id);

  // Find the host's username
  const hostPlayer = players?.find((p) => p.is_host);

  return {
    roomId: room.id,
    roomCode: room.code,
    playerId: player.id,
    sessionId: sessionId,
    room: {
      roomId: room.id,
      roomCode: room.code,
      hostName: hostPlayer?.username || "Unknown",
      hostId: room.host_id,
      state: room.state,
      config: room.config,
      players: players || [],
    },
  };
});
