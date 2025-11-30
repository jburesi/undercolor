/**
 * Game action schemas (connection, start, advance, vote)
 */

import { z } from "zod";
import { sessionIdSchema, playerIdSchema } from "./common";

// ============================================
// Connection Status
// ============================================

export const connectionStatusSchema = z.enum([
  "CONNECTED",
  "DISCONNECTED",
  "RECONNECTING",
]);

// Note: ConnectionStatus type is exported from game.types.ts as an enum

export const updateConnectionSchema = z.object({
  sessionId: sessionIdSchema,
  status: connectionStatusSchema,
});

export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;

// ============================================
// Start Game
// ============================================

export const startGameSchema = z.object({
  sessionId: sessionIdSchema,
});

export type StartGameInput = z.infer<typeof startGameSchema>;

// ============================================
// Advance Phase
// ============================================

export const advancePhaseSchema = z.object({
  sessionId: sessionIdSchema,
});

export type AdvancePhaseInput = z.infer<typeof advancePhaseSchema>;

// ============================================
// Vote
// ============================================

export const voteSchema = z.object({
  sessionId: sessionIdSchema,
  targetPlayerId: playerIdSchema,
});

export type VoteInput = z.infer<typeof voteSchema>;
