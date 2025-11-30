/**
 * POST /api/rooms/[code]/vote - Cast a vote to eliminate a player
 */

import { z } from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import {
  calculateVoteResults,
  checkWinCondition,
} from "../../../utils/game-logic";
import type { GameConfig, PlayerRole } from "#shared/types/game.types";
import type { Database } from "#shared/types/database.types";

const voteSchema = z.object({
  sessionId: z.string().uuid(),
  targetPlayerId: z.string().uuid(),
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
  const result = voteSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid request body",
    });
  }

  const { sessionId, targetPlayerId } = result.data;
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

  // Check room state
  if (room.state !== "VOTING") {
    throw createError({
      statusCode: 400,
      message: "Voting is not currently active",
    });
  }

  // Find voter by session ID
  const voter = room.players.find(
    (p: { session_id: string }) => p.session_id === sessionId,
  );
  if (!voter) {
    throw createError({
      statusCode: 403,
      message: "Player not found in this room",
    });
  }

  // Check if voter is alive
  if (!voter.is_alive) {
    throw createError({
      statusCode: 400,
      message: "Eliminated players cannot vote",
    });
  }

  // Check if voter already voted
  if (voter.has_voted) {
    throw createError({
      statusCode: 400,
      message: "You have already voted",
    });
  }

  // Check if target exists and is alive
  const target = room.players.find(
    (p: { id: string }) => p.id === targetPlayerId,
  );
  if (!target || !target.is_alive) {
    throw createError({
      statusCode: 400,
      message: "Invalid vote target",
    });
  }

  // Record vote
  const { error: voteError } = await supabase
    .from("players")
    .update({
      has_voted: true,
      vote_target_id: targetPlayerId,
    })
    .eq("id", voter.id);

  if (voteError) {
    throw createError({
      statusCode: 500,
      message: "Failed to record vote",
    });
  }

  // Check if all alive players have voted
  const alivePlayers = room.players.filter(
    (p: { is_alive: boolean }) => p.is_alive,
  );
  const votedPlayers = alivePlayers.filter(
    (p: { has_voted: boolean; id: string }) => p.has_voted || p.id === voter.id,
  );

  // If all have voted, resolve the round
  if (votedPlayers.length >= alivePlayers.length) {
    // Get all votes
    const { data: updatedPlayers } = await supabase
      .from("players")
      .select("id, vote_target_id, role, is_alive")
      .eq("room_id", room.id);

    if (updatedPlayers) {
      const votes = new Map<string, string>();
      updatedPlayers.forEach(
        (p: {
          id: string;
          vote_target_id: string | null;
          is_alive: boolean;
        }) => {
          if (p.vote_target_id && p.is_alive) {
            votes.set(p.id, p.vote_target_id);
          }
        },
      );

      const voteResults = calculateVoteResults(votes);

      // Eliminate player if not a tie
      if (voteResults.eliminatedId && !voteResults.isTie) {
        await supabase
          .from("players")
          .update({ is_alive: false })
          .eq("id", voteResults.eliminatedId);
      }

      // Check win condition
      const { data: remainingPlayers } = await supabase
        .from("players")
        .select("id, role")
        .eq("room_id", room.id)
        .eq("is_alive", true);

      const winner = checkWinCondition(
        (remainingPlayers || []).map(
          (p: { id: string; role: string | null }) => ({
            id: p.id,
            role: p.role as PlayerRole,
          }),
        ),
      );

      if (winner) {
        // Game over
        await supabase
          .from("rooms")
          .update({
            state: "FINISHED",
            winner: winner,
          })
          .eq("id", room.id);
      } else {
        // Move to next debate phase
        const config = room.config as unknown as GameConfig;
        const now = new Date();
        const debateEndTime = new Date(
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

        await supabase
          .from("rooms")
          .update({
            state: "DEBATE",
            current_round: room.current_round + 1,
            phase_started_at: now.toISOString(),
            phase_ends_at: debateEndTime.toISOString(),
          })
          .eq("id", room.id);
      }
    }
  }

  return { success: true };
});
