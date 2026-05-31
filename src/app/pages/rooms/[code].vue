<script setup lang="ts">
import { useGameRoom } from "~/composables/game/useGameRoom";
import { useGameTimer } from "~/composables/game/useGameTimer";
import { useGameResult } from "~/composables/game/useGameResult";
import { useGamePhase } from "~/composables/game/useGamePhase";
import { useClipboard } from "~/composables/common/useClipboard";
import { useAsyncAction } from "~/composables/common/useAsyncAction";
import { GAME_RULES } from "~/constants/game";
import { useJoinRoomForm } from "~/composables/forms/useJoinRoomForm";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const { t } = useI18n();

const roomCode = computed(() => (route.params.code as string).toUpperCase());

// Game composables
const {
  room,
  players,
  currentPlayer,
  myRole,
  myImageUrl,
  isLoading,
  error,
  isHost,
  isAlive,
  hasJoined,
  init,
  joinRoom,
  startGame,
  vote,
  advancePhase,
} = useGameRoom(roomCode.value);

const timer = useGameTimer();
const { copyRoomCode } = useClipboard();
const { didIWin } = useGameResult(room, myRole);
const {
  isLobby,
  isDistributing,
  isObservation,
  isDebate,
  isVoting,
  isFinished,
  currentPhase,
} = useGamePhase(room);

// Join form
const {
  form: joinForm,
  onSubmit: handleJoinRoom,
  isSubmitting: isJoining,
  error: joinError,
} = useJoinRoomForm(joinRoom);

// Async actions with loading states
const { execute: handleStartGame } = useAsyncAction(
  async () => {
    if (!canStartGame.value) return;
    await startGame();
  },
  {
    successMessage: t("toast.gameStarted"),
    errorMessage: t("toast.errorStartGame"),
  },
);

const { execute: handleSkipPhase } = useAsyncAction(
  async () => {
    if (!isHost.value) return;
    await advancePhase();
  },
  { showErrorToast: true },
);

// Computed
const canStartGame = computed(
  () =>
    isHost.value &&
    players.value.length >= GAME_RULES.MIN_PLAYERS &&
    isLobby.value,
);

const statusKey = computed(() => currentPhase.value?.toLowerCase() ?? "lobby");
const showTimer = computed(
  () => !isFinished.value && !isDistributing.value && !isLobby.value,
);

const currentPlayerId = computed(() => currentPlayer.value?.id ?? null);

// Dynamic page title - update when room is loaded
watch(
  () => room.value?.hostName,
  (hostName) => {
    if (hostName) {
      const title = t("rooms.hostGame", { name: hostName });
      useHead({ title });
    }
  },
  { immediate: true },
);

// Watch for phase changes to update timer
watch(
  () => room.value?.phaseEndsAt,
  (newEndTime) => {
    if (newEndTime) {
      timer.start(newEndTime);
    } else {
      timer.stop();
    }
  },
);

// Initialize room on mount
onMounted(async () => {
  await init();
});

// Handle vote from VotingView
async function handleVote(targetId: string) {
  await vote(targetId);
}
</script>

<template>
  <div class="page-room">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <RoomsLoading v-if="isLoading" />

      <!-- Room Not Found State -->
      <RoomsNotFound v-else-if="error" :room-code="roomCode" />

      <!-- Room Loaded -->
      <template v-else-if="room">
        <!-- Header -->
        <RoomsHeader
          :room="room"
          :room-code="roomCode"
          :status-key="statusKey"
          :is-lobby="isLobby"
          :is-finished="isFinished"
          :show-timer="showTimer"
          :is-host="isHost"
          :can-start-game="canStartGame"
          :player-count="players.length"
          :timer-formatted-time="timer.formattedTime.value"
          :timer-is-low="timer.isLow.value"
          @copy-code="copyRoomCode(roomCode)"
          @start-game="handleStartGame"
        />

        <!-- Join Form (if not joined) -->
        <GameJoinRoomCard
          v-if="!hasJoined"
          :form="joinForm"
          :is-submitting="isJoining"
          :error="joinError"
          @submit="handleJoinRoom"
        />

        <!-- Game View (if joined) -->
        <template v-else>
          <GameLobbyView
            v-if="isLobby"
            :room="room"
            :players="players"
            :current-player-id="currentPlayerId"
          />

          <GameDistributingView v-else-if="isDistributing" />

          <GameObservationView
            v-else-if="isObservation"
            :my-role="myRole"
            :my-image-url="myImageUrl"
            :is-host="isHost"
            @skip-phase="handleSkipPhase"
          />

          <GameDebateView
            v-else-if="isDebate"
            :players="players"
            :current-player-id="currentPlayerId"
            :is-host="isHost"
            @skip-phase="handleSkipPhase"
          />

          <GameVotingView
            v-else-if="isVoting"
            :players="players"
            :current-player="currentPlayer"
            :is-alive="isAlive"
            @vote="handleVote"
          />

          <GameFinishedView
            v-else-if="isFinished"
            :players="players"
            :current-player-id="currentPlayerId"
            :my-role="myRole"
            :did-i-win="didIWin"
          />
        </template>
      </template>
    </div>
  </div>
</template>
