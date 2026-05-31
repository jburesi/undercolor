/**
 * useGameSession - Composable for managing game sessions in localStorage
 *
 * Handles:
 * - Session persistence across page refreshes
 * - Multi-room session storage
 * - Session CRUD operations
 */

// Session storage key
const SESSION_KEY = "undercolor_session";

export interface GameSession {
  roomId: string;
  roomCode: string;
  playerId: string;
  sessionId: string;
}

type SessionsMap = Record<string, GameSession>;

/**
 * Composable for managing game sessions.
 * Can be used with or without a specific room code.
 */
export function useGameSession(roomCode?: string) {
  // All sessions stored in localStorage
  const storedSessions = useLocalStorage<SessionsMap>(SESSION_KEY, {});

  /**
   * Get session for a specific room (or current room if roomCode provided)
   */
  const current = computed(() => {
    if (!roomCode) return null;
    return storedSessions.value[roomCode] || null;
  });

  /**
   * Check if user has joined the current room
   */
  const hasJoined = computed(() => !!current.value);

  /**
   * Get session for any room code
   */
  function getSession(code: string): GameSession | null {
    return storedSessions.value[code] || null;
  }

  /**
   * Save a new session
   */
  function saveSession(session: GameSession) {
    storedSessions.value = {
      ...storedSessions.value,
      [session.roomCode]: session,
    };
  }

  /**
   * Clear session for a specific room
   */
  function clearSession(code?: string) {
    const targetCode = code || roomCode;
    if (!targetCode) return;

    const { [targetCode]: _, ...rest } = storedSessions.value;
    storedSessions.value = rest;
  }

  /**
   * Clear all sessions
   */
  function clearAllSessions() {
    storedSessions.value = {};
  }

  /**
   * Get all active sessions
   */
  const allSessions = computed(() => Object.values(storedSessions.value));

  return {
    // Current room session (if roomCode provided)
    current,
    hasJoined,

    // Session operations
    getSession,
    saveSession,
    clearSession,
    clearAllSessions,

    // All sessions
    allSessions,
  };
}
