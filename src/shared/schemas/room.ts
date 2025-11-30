/**
 * Room-related schemas
 */

import { z } from "zod";
import { usernameSchema, roomCodeSchema } from "./common";

// ============================================
// Game Config
// ============================================

export const gameConfigSchema = z.object({
  observationTime: z.number().min(5).max(60).optional(),
  debateTime: z.number().min(30).max(300).optional(),
  votingTime: z.number().min(10).max(120).optional(),
  includeMrWhite: z.boolean().optional(),
  minPlayers: z.number().min(3).max(20).optional(),
  maxPlayers: z.number().min(3).max(20).optional(),
});

export type GameConfigInput = z.infer<typeof gameConfigSchema>;

// ============================================
// Create Room
// ============================================

export const createRoomSchema = z.object({
  hostUsername: usernameSchema,
  isPublic: z.boolean().default(true),
  config: gameConfigSchema.optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

// Form variant (flattened config for easier form handling)
export const createRoomFormSchema = z.object({
  hostUsername: usernameSchema,
  isPublic: z.boolean(),
  observationTime: z.number().min(5).max(60),
  debateTime: z.number().min(30).max(300),
  votingTime: z.number().min(10).max(120),
  maxPlayers: z.number().min(3).max(20),
});

export type CreateRoomFormInput = z.infer<typeof createRoomFormSchema>;

// ============================================
// Join Room
// ============================================

export const joinRoomSchema = z.object({
  roomCode: roomCodeSchema,
  username: usernameSchema,
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
