/**
 * Game Types - Undercolor Visual Social Deduction Game
 *
 * Core type definitions for game state management, players, and real-time synchronization.
 * These types are shared between the app and server.
 */

// ============================================================================
// Enums
// ============================================================================

/** All possible game states managed by XState on the server */
export enum GameState {
  LOBBY = "LOBBY",
  DISTRIBUTING = "DISTRIBUTING",
  OBSERVATION = "OBSERVATION",
  DEBATE = "DEBATE",
  VOTING = "VOTING",
  RESOLVING = "RESOLVING",
  FINISHED = "FINISHED",
}

/** Player roles in the game */
export enum PlayerRole {
  INNOCENT = "INNOCENT",
  IMPOSTER = "IMPOSTER",
  MR_WHITE = "MR_WHITE",
}

/** Player connection status */
export enum ConnectionStatus {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  RECONNECTING = "RECONNECTING",
}

// ============================================================================
// Core Interfaces
// ============================================================================

/** Game configuration set by the host in lobby */
export interface GameConfig {
  /** Duration of the observation phase in seconds */
  observationTime: number;
  /** Duration of the debate phase in seconds */
  debateTime: number;
  /** Duration of the voting phase in seconds */
  votingTime: number;
  /** Number of imposters (auto-calculated based on player count if not set) */
  imposterCount?: number;
  /** Whether to include Mr. White role (for 9+ players) */
  includeMrWhite: boolean;
  /** Minimum players required to start */
  minPlayers: number;
  /** Maximum players allowed */
  maxPlayers: number;
}

/** Default game configuration */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  observationTime: 15,
  debateTime: 120,
  votingTime: 30,
  includeMrWhite: false,
  minPlayers: 3,
  maxPlayers: 20,
};

/** Player data structure */
export interface Player {
  id: string;
  sessionId: string;
  username: string;
  avatarUrl?: string;
  isHost: boolean;
  isAlive: boolean;
  hasVoted: boolean;
  connectionStatus: ConnectionStatus;
  /** Role is only sent to the player themselves - NEVER broadcast */
  role?: PlayerRole;
  /** Image URL is only sent to the player themselves - NEVER broadcast */
  imageUrl?: string;
}

/** Image set used for a game round */
export interface ImageSet {
  id: string;
  name: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  /** URL for innocent players - ONLY sent server-side */
  innocentImageUrl: string;
  /** URL for imposter players - ONLY sent server-side */
  imposterImageUrl: string;
}

/** Game room data structure */
export interface GameRoom {
  roomId: string;
  roomCode: string;
  hostId: string;
  config: GameConfig;
  state: GameState;
  currentRound: number;
  players: Player[];
  /** Current image set - URLs are NEVER sent to clients */
  currentImageSetId?: string;
  /** Votes map: voterId -> targetId (only visible during resolving) */
  votes: Record<string, string>;
  /** Eliminated players this round */
  eliminatedThisRound: string[];
  /** Winner role if game is finished */
  winner?: PlayerRole;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Realtime Event Payloads
// ============================================================================

/** Event sent when a player joins a room */
export interface PlayerJoinPayload {
  player: Pick<Player, "id" | "username" | "avatarUrl">;
}

/** Event sent when a player leaves a room */
export interface PlayerLeavePayload {
  playerId: string;
  reason: "left" | "disconnected" | "kicked";
}

/** Event sent when game state changes */
export interface GameStateChangePayload {
  newState: GameState;
  /** Time remaining in current phase (seconds) */
  timeRemaining?: number;
}

/** Event sent to individual player with their role (secure, personalized) */
export interface RoleAssignmentPayload {
  role: PlayerRole;
  imageUrl: string;
}

/** Event sent when a vote is cast (anonymized) */
export interface VoteCastPayload {
  voterId: string;
  /** Target is only revealed during resolving phase */
  hasVoted: true;
}

/** Event sent during resolving phase */
export interface VoteResultPayload {
  eliminatedPlayerId: string | null;
  voteBreakdown: Record<string, number>;
  isTie: boolean;
}

/** Event sent when game ends */
export interface GameEndPayload {
  winner: PlayerRole;
  finalRoles: Record<string, PlayerRole>;
  imposters: string[];
  mrWhite?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/** Request to create a new room */
export interface CreateRoomRequest {
  hostUsername: string;
  config?: Partial<GameConfig>;
}

/** Response when room is created */
export interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  hostId: string;
}

/** Request to join a room */
export interface JoinRoomRequest {
  roomCode: string;
  username: string;
}

/** Response when joining a room */
export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
  sessionId: string;
  room: Omit<GameRoom, "votes">;
}

/** Request to cast a vote */
export interface CastVoteRequest {
  targetPlayerId: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/** Public player info (safe to broadcast) */
export type PublicPlayer = Omit<Player, "role" | "imageUrl" | "sessionId">;

/** Public room info (safe to broadcast) */
export type PublicGameRoom = Omit<GameRoom, "votes"> & {
  players: PublicPlayer[];
};
