/**
 * POST /api/rooms - Create a new game room
 */

import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import { generateRoomCode } from "../../utils/game-logic";
import { DEFAULT_GAME_CONFIG } from "#shared/types/game.types";
import type { Database } from "#shared/types/database.types";

const createRoomSchema = z.object({
  hostUsername: z.string().min(2).max(20),
  isPublic: z.boolean().default(true),
  config: z
    .object({
      observationTime: z.number().min(5).max(60).optional(),
      debateTime: z.number().min(30).max(300).optional(),
      votingTime: z.number().min(10).max(120).optional(),
      includeMrWhite: z.boolean().optional(),
      minPlayers: z.number().min(3).max(20).optional(),
      maxPlayers: z.number().min(3).max(20).optional(),
    })
    .optional(),
});

export default defineEventHandler(async (event) => {
  console.log("Creating new room...");
  console.log(await readBody(event));

  const body = await readBody(event);

  // Validate input
  const result = createRoomSchema.safeParse(body);
  if (!result.success) {
    console.error("Validation error:", result.error.flatten());
    throw createError({
      statusCode: 400,
      message: "Invalid request body",
      data: result.error.flatten(),
    });
  }

  const { hostUsername, isPublic, config } = result.data;
  const supabase = serverSupabaseServiceRole<Database>(event);

  // Generate unique room code
  let roomCode = generateRoomCode();
  let attempts = 0;
  const maxAttempts = 10;

  console.log("Initial generated room code:", roomCode);

  // Ensure room code is unique
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", roomCode)
      .single();

    if (!existing) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  console.log("Final room code after uniqueness check:", roomCode);

  if (attempts >= maxAttempts) {
    throw createError({
      statusCode: 500,
      message: "Failed to generate unique room code",
    });
  }

  // Generate session ID for the host
  const sessionId = crypto.randomUUID();

  // Merge config with defaults
  const gameConfig = { ...DEFAULT_GAME_CONFIG, ...config };

  console.log("Creating room with config:", gameConfig);

  // Create room first (without host_id, will be set after player creation)
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      code: roomCode,
      host_id: null, // Will be set after player is created
      state: "LOBBY",
      config: gameConfig,
      is_public: isPublic,
    })
    .select()
    .single();

  console.log("Room created:", room, "Error:", roomError);
  if (roomError || !room) {
    throw createError({
      statusCode: 500,
      message: "Failed to create room",
    });
  }

  // Create host player
  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      session_id: sessionId,
      username: hostUsername,
      is_host: true,
    })
    .select()
    .single();

  if (playerError || !player) {
    // Rollback room creation
    await supabase.from("rooms").delete().eq("id", room.id);
    throw createError({
      statusCode: 500,
      message: "Failed to create host player",
    });
  }

  // Update room with host player ID
  await supabase.from("rooms").update({ host_id: player.id }).eq("id", room.id);

  return {
    roomId: room.id,
    roomCode: room.code,
    hostId: player.id,
    sessionId: sessionId,
  };
});
