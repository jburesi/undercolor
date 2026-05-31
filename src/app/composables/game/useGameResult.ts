/**
 * useGameResult - Composable for game result calculations
 *
 * Handles win condition checks and game outcome logic
 */

import type { PlayerRole } from "#shared/types/game.types";

interface RoomData {
  winner: PlayerRole | null;
}

/**
 * Composable for calculating game results
 */
export function useGameResult(
  room: Ref<RoomData | null>,
  myRole: Ref<PlayerRole | null>,
) {
  /**
   * Check if current player won the game
   */
  const didIWin = computed(() => {
    const winner = room.value?.winner;
    const role = myRole.value;

    if (!winner || !role) return false;

    // Direct comparison: winner faction matches player role
    return winner === role;
  });

  /**
   * Check if the game has ended
   */
  const isGameOver = computed(() => room.value?.winner !== null);

  /**
   * Get the winning team name (for display)
   */
  const winningTeam = computed(() => room.value?.winner || null);

  return {
    didIWin,
    isGameOver,
    winningTeam,
  };
}
