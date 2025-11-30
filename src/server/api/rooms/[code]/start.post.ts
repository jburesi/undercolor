/**
 * POST /api/rooms/[code]/start - Start the game (host only)
 */

import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import { assignRoles } from "../../../utils/game-logic";
import type { Database } from "#shared/types/database.types";
import type { GameConfig } from "#shared/types/game.types";

const startGameSchema = z.object({
  sessionId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const body = await readBody(event);

  if (!code) {
    throw createError({
      statusCode: 400,
      message: "Invalid room code",
    });
  }

  // Validate input
  const result = startGameSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid request body",
    });
  }

  const { sessionId } = result.data;
  const supabase = serverSupabaseServiceRole<Database>(event);

  // Find room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select(
      `
      *,
      players:players!players_room_id_fkey(*)
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

  // Verify requester is the host
  const host = room.players.find(
    (p: { session_id: string; is_host: boolean }) =>
      p.session_id === sessionId && p.is_host,
  );
  if (!host) {
    throw createError({
      statusCode: 403,
      message: "Only the host can start the game",
    });
  }

  // Check room state
  if (room.state !== "LOBBY") {
    throw createError({
      statusCode: 400,
      message: "Game has already started",
    });
  }

  // Check minimum players
  const config = room.config as unknown as GameConfig;
  const minPlayers = config.minPlayers || 3;
  if (room.players.length < minPlayers) {
    throw createError({
      statusCode: 400,
      message: `Need at least ${minPlayers} players to start`,
    });
  }

  // Get a random active image set
  const { data: imageSets, error: imageError } = await supabase
    .from("image_sets")
    .select("*")
    .eq("is_active", true);

  if (imageError || !imageSets || imageSets.length === 0) {
    throw createError({
      statusCode: 500,
      message: "No image sets available",
    });
  }

  const randomImageSet =
    imageSets[Math.floor(Math.random() * imageSets.length)];

  // Assign roles to players
  const playerIds = room.players.map((p: { id: string }) => p.id);
  const roles = assignRoles(playerIds, config);

  // Update each player with their role
  const updatePromises = room.players.map((player: { id: string }) => {
    const role = roles.get(player.id);
    return supabase.from("players").update({ role }).eq("id", player.id);
  });

  await Promise.all(updatePromises);

  // Calculate phase end time
  const now = new Date();
  const observationEndTime = new Date(
    now.getTime() + (config.observationTime || 15) * 1000,
  );

  // Update room state to DISTRIBUTING then OBSERVATION
  const { error: updateError } = await supabase
    .from("rooms")
    .update({
      state: "OBSERVATION",
      current_round: 1,
      current_image_set_id: randomImageSet.id,
      phase_started_at: now.toISOString(),
      phase_ends_at: observationEndTime.toISOString(),
    })
    .eq("id", room.id);

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: "Failed to start game",
    });
  }

  return {
    success: true,
    state: "OBSERVATION",
    phaseEndsAt: observationEndTime.toISOString(),
    imageSetId: randomImageSet.id,
  };
});
