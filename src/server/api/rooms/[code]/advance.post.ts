/**
 * POST /api/rooms/[code]/advance - Advance game phase (called by timer or host)
 */

import { serverSupabaseServiceRole } from "#supabase/server";
import type { GameConfig, GameState } from "#shared/types/game.types";
import type { Database } from "#shared/types/database.types";
import { advancePhaseSchema } from "#shared/schemas";

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
  const result = advancePhaseSchema.safeParse(body);
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
      message: "Only the host can manually advance phases",
    });
  }

  const config = room.config as unknown as GameConfig;
  const now = new Date();
  let newState: GameState;
  let phaseEndTime: Date;

  // Determine next state based on current state
  switch (room.state) {
    case "OBSERVATION":
      newState = "DEBATE" as GameState;
      phaseEndTime = new Date(
        now.getTime() + (config.debateTime || 120) * 1000,
      );
      break;

    case "DEBATE":
      newState = "VOTING" as GameState;
      phaseEndTime = new Date(now.getTime() + (config.votingTime || 30) * 1000);
      break;

    case "VOTING":
      // This should be handled by the vote endpoint when all votes are in
      // But host can force it
      newState = "RESOLVING" as GameState;
      phaseEndTime = new Date(now.getTime() + 5000); // 5 seconds to show results
      break;

    case "RESOLVING":
      newState = "DEBATE" as GameState;
      phaseEndTime = new Date(
        now.getTime() + (config.debateTime || 120) * 1000,
      );

      // Reset votes for next round
      await supabase
        .from("players")
        .update({
          has_voted: false,
          vote_target_id: null,
        })
        .eq("room_id", room.id);
      break;

    default:
      throw createError({
        statusCode: 400,
        message: "Cannot advance from current state",
      });
  }

  // Update room state
  const { error: updateError } = await supabase
    .from("rooms")
    .update({
      state: newState,
      phase_started_at: now.toISOString(),
      phase_ends_at: phaseEndTime.toISOString(),
    })
    .eq("id", room.id);

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: "Failed to advance phase",
    });
  }

  return {
    success: true,
    newState,
    phaseEndsAt: phaseEndTime.toISOString(),
  };
});
