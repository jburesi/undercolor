/**
 * useRoomData - Composable for room data state management
 *
 * Handles:
 * - Room data state (room, players, currentPlayer)
 * - Loading and error state
 * - Player sorting and computed properties
 */

import type {
  GameConfig,
  GameState,
  PlayerRole,
} from "#shared/types/game.types";

export interface RoomPlayer {
  id: string;
  username: string;
  avatar_url: string | null;
  is_host: boolean;
  is_alive: boolean;
  has_voted: boolean;
  connection_status: "CONNECTED" | "DISCONNECTED" | "RECONNECTING";
  role?: PlayerRole;
}

export interface RoomData {
  roomId: string;
  roomCode: string;
  hostName: string;
  hostId: string | null;
  state: GameState;
  config: GameConfig;
  currentRound: number;
  phaseStartedAt: string | null;
  phaseEndsAt: string | null;
  winner: PlayerRole | null;
  players: RoomPlayer[];
}

export function useRoomData() {
  // Core state
  const room = ref<RoomData | null>(null);
  const players = ref<RoomPlayer[]>([]);
  const currentPlayer = ref<RoomPlayer | null>(null);
  const myRole = ref<PlayerRole | null>(null);
  const myImageUrl = ref<string | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  // Computed properties
  const isHost = computed(() => currentPlayer.value?.is_host === true);
  const isAlive = computed(() => currentPlayer.value?.is_alive !== false);

  // Sorted players with host always first
  const sortedPlayers = computed(() =>
    [...players.value].sort((a, b) => {
      if (a.is_host && !b.is_host) return -1;
      if (!a.is_host && b.is_host) return 1;
      return 0;
    }),
  );

  /**
   * Set room data from API response
   */
  function setRoomData(data: RoomData) {
    room.value = data;
    players.value = data.players;
  }

  /**
   * Update room state (partial update from realtime)
   */
  function updateRoomState(updates: Partial<RoomData>) {
    if (room.value) {
      room.value = { ...room.value, ...updates };
    }
  }

  /**
   * Set current player by ID
   */
  function setCurrentPlayer(playerId: string) {
    currentPlayer.value = players.value.find((p) => p.id === playerId) || null;
  }

  /**
   * Add a player to the list
   */
  function addPlayer(player: RoomPlayer) {
    if (!players.value.some((p) => p.id === player.id)) {
      players.value = [...players.value, player];
    }
  }

  /**
   * Update a player in the list
   */
  function updatePlayer(updated: RoomPlayer) {
    players.value = players.value.map((p) =>
      p.id === updated.id ? updated : p,
    );
    // Update current player if it's us
    if (currentPlayer.value?.id === updated.id) {
      currentPlayer.value = updated;
    }
  }

  /**
   * Remove a player from the list
   */
  function removePlayer(playerId: string) {
    players.value = players.value.filter((p) => p.id !== playerId);
  }

  /**
   * Update player connection statuses
   */
  function updateConnectionStatuses(onlinePlayerIds: Set<string>) {
    players.value = players.value.map((player) => ({
      ...player,
      connection_status: onlinePlayerIds.has(player.id)
        ? "CONNECTED"
        : "DISCONNECTED",
    }));

    if (currentPlayer.value) {
      currentPlayer.value = {
        ...currentPlayer.value,
        connection_status: onlinePlayerIds.has(currentPlayer.value.id)
          ? "CONNECTED"
          : "DISCONNECTED",
      };
    }
  }

  /**
   * Set role and image for current player
   */
  function setRole(role: PlayerRole, imageUrl: string | null) {
    myRole.value = role;
    myImageUrl.value = imageUrl;
  }

  /**
   * Reset all state
   */
  function reset() {
    room.value = null;
    players.value = [];
    currentPlayer.value = null;
    myRole.value = null;
    myImageUrl.value = null;
    isLoading.value = true;
    error.value = null;
  }

  return {
    // State
    room,
    players,
    sortedPlayers,
    currentPlayer,
    myRole,
    myImageUrl,
    isLoading,
    error,

    // Computed
    isHost,
    isAlive,

    // Actions
    setRoomData,
    updateRoomState,
    setCurrentPlayer,
    addPlayer,
    updatePlayer,
    removePlayer,
    updateConnectionStatuses,
    setRole,
    reset,
  };
}
