/**
 * Game Logic Utilities - Server-side game state management
 */

import type { PlayerRole, GameConfig } from "#shared/types/game.types";

/**
 * Calculate role distribution based on player count
 */
export function getRoleDistribution(
  playerCount: number,
  config: GameConfig,
): { innocents: number; imposters: number; mrWhite: boolean } {
  if (playerCount <= 5) {
    return { innocents: playerCount - 1, imposters: 1, mrWhite: false };
  } else if (playerCount <= 8) {
    return { innocents: playerCount - 2, imposters: 2, mrWhite: false };
  } else {
    return {
      innocents: playerCount - 3,
      imposters: 2,
      mrWhite: config.includeMrWhite,
    };
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Assign roles to players
 * IMPORTANT: This must only run server-side to prevent cheating
 */
export function assignRoles(
  playerIds: string[],
  config: GameConfig,
): Map<string, PlayerRole> {
  const distribution = getRoleDistribution(playerIds.length, config);
  const shuffledIds = shuffleArray(playerIds);
  const roles = new Map<string, PlayerRole>();

  let index = 0;

  // Assign imposters
  for (let i = 0; i < distribution.imposters; i++) {
    roles.set(shuffledIds[index++], "IMPOSTER" as PlayerRole);
  }

  // Assign Mr. White if enabled
  if (distribution.mrWhite) {
    roles.set(shuffledIds[index++], "MR_WHITE" as PlayerRole);
  }

  // Assign remaining as innocents
  while (index < shuffledIds.length) {
    roles.set(shuffledIds[index++], "INNOCENT" as PlayerRole);
  }

  return roles;
}

/**
 * Generate a unique room code
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate vote results
 */
export function calculateVoteResults(votes: Map<string, string>): {
  eliminatedId: string | null;
  voteBreakdown: Record<string, number>;
  isTie: boolean;
} {
  const voteBreakdown: Record<string, number> = {};

  // Count votes
  for (const targetId of votes.values()) {
    voteBreakdown[targetId] = (voteBreakdown[targetId] || 0) + 1;
  }

  // Find highest vote count
  const voteCounts = Object.values(voteBreakdown);
  if (voteCounts.length === 0) {
    return { eliminatedId: null, voteBreakdown, isTie: false };
  }

  const maxVotes = Math.max(...voteCounts);
  const playersWithMaxVotes = Object.entries(voteBreakdown)
    .filter(([_, count]) => count === maxVotes)
    .map(([id]) => id);

  // Check for tie
  if (playersWithMaxVotes.length > 1) {
    return { eliminatedId: null, voteBreakdown, isTie: true };
  }

  return {
    eliminatedId: playersWithMaxVotes[0],
    voteBreakdown,
    isTie: false,
  };
}

/**
 * Check win conditions
 */
export function checkWinCondition(
  alivePlayers: Array<{ id: string; role: PlayerRole }>,
): PlayerRole | null {
  const aliveImposters = alivePlayers.filter((p) => p.role === "IMPOSTER");
  const aliveInnocents = alivePlayers.filter((p) => p.role === "INNOCENT");
  const aliveMrWhite = alivePlayers.filter((p) => p.role === "MR_WHITE");

  // Imposters win if they equal or outnumber innocents
  if (aliveImposters.length >= aliveInnocents.length) {
    return "IMPOSTER" as PlayerRole;
  }

  // Innocents win if all imposters and Mr. White are eliminated
  if (aliveImposters.length === 0 && aliveMrWhite.length === 0) {
    return "INNOCENT" as PlayerRole;
  }

  // Game continues
  return null;
}
