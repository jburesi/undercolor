/**
 * useGameActions - Composable for game API actions
 *
 * Handles:
 * - Room creation and joining
 * - Game control (start, vote, advance phase)
 * - Role fetching
 */

import type { GameConfig, PlayerRole } from "#shared/types/game.types";
import type { RoomData } from "./useRoomData";

interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  hostId: string;
  sessionId: string;
}

interface JoinRoomResponse {
  roomId: string;
  roomCode: string;
  playerId: string;
  sessionId: string;
  room: RoomData;
}

interface RoleResponse {
  role: PlayerRole;
  imageUrl: string | null;
}

export function useGameActions(roomCode: string) {
  const { $api } = useNuxtApp();

  /**
   * Fetch room data from API
   */
  async function fetchRoom(): Promise<RoomData> {
    return await $api<RoomData>(`/api/rooms/${roomCode}`);
  }

  /**
   * Create a new room
   */
  async function createRoom(
    hostUsername: string,
    config?: Partial<GameConfig>,
  ): Promise<CreateRoomResponse> {
    return await $api<CreateRoomResponse>("/api/rooms", {
      method: "POST",
      body: {
        hostUsername,
        config,
      },
    });
  }

  /**
   * Join an existing room
   */
  async function joinRoom(username: string): Promise<JoinRoomResponse> {
    return await $api<JoinRoomResponse>("/api/rooms/join", {
      method: "POST",
      body: {
        roomCode: roomCode.toUpperCase(),
        username,
      },
    });
  }

  /**
   * Start the game (host only)
   */
  async function startGame(sessionId: string): Promise<void> {
    await $api(`/api/rooms/${roomCode}/start`, {
      method: "POST",
      body: { sessionId },
    });
  }

  /**
   * Fetch player's role and image
   */
  async function fetchRole(sessionId: string): Promise<RoleResponse> {
    return await $api<RoleResponse>(
      `/api/rooms/${roomCode}/role?sessionId=${sessionId}`,
    );
  }

  /**
   * Cast a vote
   */
  async function vote(
    sessionId: string,
    targetPlayerId: string,
  ): Promise<void> {
    await $api(`/api/rooms/${roomCode}/vote`, {
      method: "POST",
      body: {
        sessionId,
        targetPlayerId,
      },
    });
  }

  /**
   * Advance game phase (host only)
   */
  async function advancePhase(sessionId: string): Promise<void> {
    await $api(`/api/rooms/${roomCode}/advance`, {
      method: "POST",
      body: { sessionId },
    });
  }

  return {
    fetchRoom,
    createRoom,
    joinRoom,
    startGame,
    fetchRole,
    vote,
    advancePhase,
  };
}

// Re-export types for convenience
export type { CreateRoomResponse, JoinRoomResponse, RoleResponse };
