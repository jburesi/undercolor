/**
 * useGameRoom - Facade composable for game room management
 *
 * Composes:
 * - useRoomData: State management
 * - useGameSession: Session persistence
 * - useGameActions: API calls
 * - useGamePresence: Real-time updates
 *
 * This is the main entry point for game room functionality.
 */

import type { GameConfig } from "#shared/types/game.types";
import { useGameSession, type GameSession } from "./useGameSession";
import { useRoomData, type RoomData, type RoomPlayer } from "./useRoomData";
import { useGameActions } from "./useGameActions";
import { useGamePresence } from "./useGamePresence";

export function useGameRoom(roomCode: string) {
  // Compose sub-composables
  const session = useGameSession(roomCode);
  const data = useRoomData();
  const actions = useGameActions(roomCode);
  const presence = useGamePresence(roomCode);

  /**
   * Fetch room data and set state
   */
  async function fetchRoom() {
    try {
      data.isLoading.value = true;
      data.error.value = null;

      const roomData = await actions.fetchRoom();
      data.setRoomData(roomData);

      // Find current player if session exists
      if (session.current.value) {
        data.setCurrentPlayer(session.current.value.playerId);
      }

      return roomData;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch room";
      data.error.value = errorMessage;
      throw err;
    } finally {
      data.isLoading.value = false;
    }
  }

  /**
   * Create a new room
   */
  async function createRoom(
    hostUsername: string,
    config?: Partial<GameConfig>,
  ): Promise<GameSession> {
    const response = await actions.createRoom(hostUsername, config);

    const newSession: GameSession = {
      roomId: response.roomId,
      roomCode: response.roomCode,
      playerId: response.hostId,
      sessionId: response.sessionId,
    };

    session.saveSession(newSession);
    return newSession;
  }

  /**
   * Join an existing room
   */
  async function joinRoom(username: string): Promise<GameSession> {
    const response = await actions.joinRoom(username);

    const newSession: GameSession = {
      roomId: response.roomId,
      roomCode: response.roomCode,
      playerId: response.playerId,
      sessionId: response.sessionId,
    };

    session.saveSession(newSession);
    data.setRoomData(response.room);
    data.setCurrentPlayer(response.playerId);

    // Re-subscribe with new session
    subscribeToRoom();

    return newSession;
  }

  /**
   * Start the game (host only)
   */
  async function startGame() {
    if (!session.current.value) {
      throw new Error("Not in a room");
    }
    await actions.startGame(session.current.value.sessionId);
  }

  /**
   * Fetch player's role and image
   */
  async function fetchRole() {
    if (!session.current.value) return;

    const response = await actions.fetchRole(session.current.value.sessionId);
    data.setRole(response.role, response.imageUrl);
  }

  /**
   * Cast a vote
   */
  async function vote(targetPlayerId: string) {
    if (!session.current.value) {
      throw new Error("Not in a room");
    }
    await actions.vote(session.current.value.sessionId, targetPlayerId);
  }

  /**
   * Advance game phase (host only)
   */
  async function advancePhase() {
    if (!session.current.value) {
      throw new Error("Not in a room");
    }
    await actions.advancePhase(session.current.value.sessionId);
  }

  /**
   * Subscribe to real-time room updates
   */
  function subscribeToRoom() {
    const roomData = data.room.value;
    const currentSession = session.current.value;
    const currentPlayerData = data.currentPlayer.value;

    if (!roomData || !currentSession) return;

    presence.subscribe(
      roomData.roomId,
      currentSession.sessionId,
      currentPlayerData?.username || "Unknown",
      currentSession.playerId,
      {
        onRoomUpdate: (updates) => {
          data.updateRoomState(updates as Partial<RoomData>);
        },
        onPlayerInsert: (player) => {
          data.addPlayer(player as RoomPlayer);
        },
        onPlayerUpdate: (player) => {
          data.updatePlayer(player as RoomPlayer);
        },
        onPlayerDelete: (playerId) => {
          data.removePlayer(playerId);
        },
        onPresenceSync: (onlinePlayerIds) => {
          data.updateConnectionStatuses(onlinePlayerIds);
        },
        onGameStart: () => {
          fetchRole();
        },
      },
    );
  }

  /**
   * Initialize the room
   */
  async function init() {
    // Fetch room data
    await fetchRoom();

    // Subscribe to updates
    subscribeToRoom();

    // If we have a session and game has started, fetch our role
    if (
      session.current.value &&
      data.room.value &&
      data.room.value.state !== "LOBBY"
    ) {
      await fetchRole();
    }
  }

  /**
   * Leave the room
   */
  async function leaveRoom() {
    await presence.unsubscribe(session.current.value?.sessionId);
    session.clearSession();
    data.reset();
  }

  /**
   * Clear session wrapper
   */
  function clearSession() {
    session.clearSession();
  }

  // Cleanup on unmount
  onUnmounted(() => {
    presence.unsubscribe(session.current.value?.sessionId);
  });

  // Handle page unload (tab close, navigation away)
  if (import.meta.client) {
    const handleBeforeUnload = () => {
      if (session.current.value) {
        presence.sendDisconnectBeacon(session.current.value.sessionId);
      }
    };

    onMounted(() => {
      window.addEventListener("beforeunload", handleBeforeUnload);
    });

    onUnmounted(() => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    });
  }

  return {
    // State (from useRoomData)
    room: data.room,
    players: data.sortedPlayers,
    currentPlayer: data.currentPlayer,
    myRole: data.myRole,
    myImageUrl: data.myImageUrl,
    isLoading: data.isLoading,
    error: data.error,
    isHost: data.isHost,
    isAlive: data.isAlive,

    // Session (from useGameSession)
    session: session.current,
    hasJoined: session.hasJoined,

    // Actions
    init,
    createRoom,
    joinRoom,
    startGame,
    vote,
    advancePhase,
    fetchRole,
    fetchRoom,
    leaveRoom,
    clearSession,
  };
}

// Re-export types
export type { RoomData, RoomPlayer } from "./useRoomData";
export type { GameSession } from "./useGameSession";
