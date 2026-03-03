/**
 * useGamePhase - Composable for game phase logic
 *
 * Provides:
 * - Current phase state
 * - Boolean computed for each phase
 * - Derived states (isGameInProgress, showTimer, etc.)
 */

import { GameState } from "#shared/types/game.types";
import type { RoomData } from "./useRoomData";

export function useGamePhase(room: Ref<RoomData | null>) {
  // Current phase
  const currentPhase = computed<GameState | null>(
    () => room.value?.state || null,
  );

  // Individual phase booleans
  const isLobby = computed(() => currentPhase.value === GameState.LOBBY);
  const isDistributing = computed(
    () => currentPhase.value === GameState.DISTRIBUTING,
  );
  const isObservation = computed(
    () => currentPhase.value === GameState.OBSERVATION,
  );
  const isDebate = computed(() => currentPhase.value === GameState.DEBATE);
  const isVoting = computed(() => currentPhase.value === GameState.VOTING);
  const isResolving = computed(
    () => currentPhase.value === GameState.RESOLVING,
  );
  const isFinished = computed(() => currentPhase.value === GameState.FINISHED);

  // Derived states
  const isGameInProgress = computed(
    () =>
      currentPhase.value !== null &&
      !isLobby.value &&
      !isFinished.value &&
      !isDistributing.value,
  );

  const isDiscussionPhase = computed(() => isDebate.value || isVoting.value);

  const showTimer = computed(
    () => isObservation.value || isDebate.value || isVoting.value,
  );

  // Phase duration from config
  const currentPhaseDuration = computed(() => {
    if (!room.value?.config) return null;

    switch (currentPhase.value) {
      case GameState.OBSERVATION:
        return room.value.config.observationTime;
      case GameState.DEBATE:
        return room.value.config.debateTime;
      case GameState.VOTING:
        return room.value.config.votingTime;
      default:
        return null;
    }
  });

  return {
    // Current phase
    currentPhase,

    // Individual phases
    isLobby,
    isDistributing,
    isObservation,
    isDebate,
    isVoting,
    isResolving,
    isFinished,

    // Derived states
    isGameInProgress,
    isDiscussionPhase,
    showTimer,
    currentPhaseDuration,
  };
}
