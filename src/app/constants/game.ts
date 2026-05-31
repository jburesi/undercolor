/**
 * Game Constants
 *
 * Centralized timing and game rule constants.
 * Avoid magic numbers throughout the codebase.
 */

export const TIMING = {
  /** Presence heartbeat interval (ms) */
  PRESENCE_HEARTBEAT_MS: 10_000,

  /** Public rooms list refresh interval (ms) */
  PUBLIC_ROOMS_REFRESH_MS: 10_000,

  /** Threshold to show timer in red (seconds) */
  TIMER_LOW_THRESHOLD_SECONDS: 10,
} as const;

export const GAME_RULES = {
  /** Minimum players required to start */
  MIN_PLAYERS: 3,

  /** Default maximum players per room */
  MAX_PLAYERS: 12,
} as const;
