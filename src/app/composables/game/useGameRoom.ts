/**
 * useGameRoom - Composable for managing game room state and real-time updates
 *
 * Handles:
 * - Room data fetching and caching
 * - Player session management
 * - Real-time subscriptions via Supabase
 * - Game state synchronization
 */

import type { GameConfig, GameState, PlayerRole } from "~/types/game.types";

// Session storage keys
const SESSION_KEY = "undercolor_session";

interface GameSession {
  roomId: string;
  roomCode: string;
  playerId: string;
  sessionId: string;
}

interface RoomPlayer {
  id: string;
  username: string;
  avatar_url: string | null;
  is_host: boolean;
  is_alive: boolean;
  has_voted: boolean;
  connection_status: string;
}

interface RoomData {
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

export function useGameRoom(roomCode: string) {
  const supabase = useSupabaseClient();
  const { $api } = useNuxtApp();

  // State
  const room = ref<RoomData | null>(null);
  const players = ref<RoomPlayer[]>([]);
  const currentPlayer = ref<RoomPlayer | null>(null);
  const myRole = ref<PlayerRole | null>(null);
  const myImageUrl = ref<string | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const isHost = computed(() => currentPlayer.value?.is_host === true);
  const isAlive = computed(() => currentPlayer.value?.is_alive !== false);

  // Session management using localStorage for persistence across page refreshes
  const storedSessions = useLocalStorage<Record<string, GameSession>>(
    SESSION_KEY,
    {},
  );
  const session = computed(() => {
    // Return session for current room if it exists
    return storedSessions.value[roomCode] || null;
  });

  // Real-time channel - using ReturnType to avoid direct import
  let channel: ReturnType<
    ReturnType<typeof useSupabaseClient>["channel"]
  > | null = null;

  /**
   * Save session to storage
   */
  function saveSession(newSession: GameSession) {
    storedSessions.value = {
      ...storedSessions.value,
      [newSession.roomCode]: newSession,
    };
  }

  /**
   * Clear session from storage
   */
  function clearSession() {
    const { [roomCode]: _, ...rest } = storedSessions.value;
    storedSessions.value = rest;
  }

  /**
   * Fetch room data from API
   */
  async function fetchRoom() {
    try {
      isLoading.value = true;
      error.value = null;

      const data = await $api<RoomData>(`/rooms/${roomCode}`);
      room.value = data;
      players.value = data.players;

      // Find current player if session exists
      if (session.value) {
        currentPlayer.value =
          players.value.find((p) => p.id === session.value!.playerId) || null;
      }

      return data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch room";
      error.value = errorMessage;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new room
   */
  async function createRoom(
    hostUsername: string,
    config?: Partial<GameConfig>,
  ): Promise<GameSession> {
    const data = await $api<{
      roomId: string;
      roomCode: string;
      hostId: string;
      sessionId: string;
    }>("/rooms", {
      method: "POST",
      body: {
        hostUsername,
        config,
      },
    });

    const newSession: GameSession = {
      roomId: data.roomId,
      roomCode: data.roomCode,
      playerId: data.hostId,
      sessionId: data.sessionId,
    };

    saveSession(newSession);
    return newSession;
  }

  /**
   * Join an existing room
   */
  async function joinRoom(username: string): Promise<GameSession> {
    const data = await $api<{
      roomId: string;
      roomCode: string;
      playerId: string;
      sessionId: string;
      room: RoomData;
    }>("/rooms/join", {
      method: "POST",
      body: {
        roomCode: roomCode.toUpperCase(),
        username,
      },
    });

    const newSession: GameSession = {
      roomId: data.roomId,
      roomCode: data.roomCode,
      playerId: data.playerId,
      sessionId: data.sessionId,
    };

    saveSession(newSession);
    room.value = data.room;
    players.value = data.room.players;

    // Set current player
    currentPlayer.value =
      players.value.find((p) => p.id === data.playerId) || null;

    return newSession;
  }

  /**
   * Start the game (host only)
   */
  async function startGame() {
    if (!session.value) {
      throw new Error("Not in a room");
    }

    await $api(`/rooms/${roomCode}/start`, {
      method: "POST",
      body: {
        sessionId: session.value.sessionId,
      },
    });
  }

  /**
   * Fetch player's role and image
   */
  async function fetchRole() {
    if (!session.value) return;

    const data = await $api<{
      role: PlayerRole;
      imageUrl: string | null;
    }>(`/rooms/${roomCode}/role?sessionId=${session.value.sessionId}`);

    myRole.value = data.role;
    myImageUrl.value = data.imageUrl;
  }

  /**
   * Cast a vote
   */
  async function vote(targetPlayerId: string) {
    if (!session.value) {
      throw new Error("Not in a room");
    }

    await $api(`/rooms/${roomCode}/vote`, {
      method: "POST",
      body: {
        sessionId: session.value.sessionId,
        targetPlayerId,
      },
    });
  }

  /**
   * Advance game phase (host only)
   */
  async function advancePhase() {
    if (!session.value) {
      throw new Error("Not in a room");
    }

    await $api(`/rooms/${roomCode}/advance`, {
      method: "POST",
      body: {
        sessionId: session.value.sessionId,
      },
    });
  }

  /**
   * Subscribe to real-time room updates
   */
  function subscribeToRoom() {
    if (!room.value) return;

    // Subscribe to room changes
    channel = supabase
      .channel(`room:${room.value.roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.value.roomId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" && room.value) {
            const newData = payload.new as {
              state: GameState;
              current_round: number;
              phase_started_at: string | null;
              phase_ends_at: string | null;
              winner: PlayerRole | null;
            };
            room.value = {
              ...room.value,
              state: newData.state,
              currentRound: newData.current_round,
              phaseStartedAt: newData.phase_started_at,
              phaseEndsAt: newData.phase_ends_at,
              winner: newData.winner,
            };

            // Fetch role when game starts
            if (
              newData.state === "OBSERVATION" ||
              newData.state === "DISTRIBUTING"
            ) {
              fetchRole();
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${room.value.roomId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPlayer = payload.new as RoomPlayer;
            // Avoid duplicates (can happen if we just joined and realtime catches up)
            if (!players.value.some((p) => p.id === newPlayer.id)) {
              players.value = [...players.value, newPlayer];
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as RoomPlayer;
            players.value = players.value.map((p) =>
              p.id === updated.id ? updated : p,
            );
            // Update current player if it's us
            if (currentPlayer.value?.id === updated.id) {
              currentPlayer.value = updated;
            }
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            players.value = players.value.filter((p) => p.id !== deleted.id);
          }
        },
      )
      .subscribe();
  }

  /**
   * Unsubscribe from real-time updates
   */
  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
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
    if (session.value && room.value && room.value.state !== "LOBBY") {
      await fetchRole();
    }
  }

  /**
   * Leave the room
   */
  function leaveRoom() {
    unsubscribe();
    clearSession();
    room.value = null;
    players.value = [];
    currentPlayer.value = null;
    myRole.value = null;
    myImageUrl.value = null;
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe();
  });

  return {
    // State
    room,
    players,
    currentPlayer,
    myRole,
    myImageUrl,
    isLoading,
    error,
    isHost,
    isAlive,
    session,

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
