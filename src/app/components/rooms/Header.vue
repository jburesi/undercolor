<script setup lang="ts">
import type { RoomData } from "~/composables/game/useRoomData";

defineProps<{
  room: RoomData;
  roomCode: string;
  statusKey: string;
  isLobby: boolean;
  isFinished: boolean;
  showTimer: boolean;
  isHost: boolean;
  canStartGame: boolean;
  playerCount: number;
  timerFormattedTime: string;
  timerIsLow: boolean;
}>();

const emit = defineEmits<{
  copyCode: [];
  startGame: [];
}>();

const { t } = useI18n();
</script>

<template>
  <!-- LOBBY layout (badge + button on right) -->
  <div
    v-if="isLobby"
    class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8"
  >
    <!-- Left: Title + Code -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold mb-1">
          {{ t("rooms.hostGame", { name: room.hostName }) }}
        </h1>
        <div class="flex items-center gap-2">
          <p class="text-sm text-muted-foreground font-mono">
            {{ roomCode }}
          </p>
          <Button
            variant="ghost"
            size="icon"
            class="size-6"
            @click="emit('copyCode')"
          >
            <Icon name="lucide:copy" class="size-3" />
          </Button>
        </div>
      </div>
      <!-- Badge: mobile only -->
      <Badge class="text-sm px-4 py-1.5 sm:hidden" variant="secondary">
        {{ t(`rooms.status.${statusKey}`) }}
      </Badge>
    </div>

    <!-- Right: Badge (desktop) / Button -->
    <div class="flex flex-col sm:items-end gap-2">
      <!-- Badge: desktop only -->
      <Badge
        class="hidden sm:inline-flex text-sm px-4 py-1.5"
        variant="secondary"
      >
        {{ t(`rooms.status.${statusKey}`) }}
      </Badge>
      <!-- Start Game Button (Host only) -->
      <Button
        v-if="isHost"
        :disabled="!canStartGame"
        class="w-full sm:w-auto"
        @click="emit('startGame')"
      >
        <Icon name="lucide:play" class="size-4 mr-2" />
        {{ t("game.startGame") }}
        <span
          v-if="playerCount < room.config.minPlayers"
          class="text-xs opacity-75"
        >
          ({{ playerCount }}/{{ room.config.minPlayers }})
        </span>
      </Button>
    </div>
  </div>

  <!-- OTHER STATES layout (badge next to title, timer on right) -->
  <div v-else class="mb-8">
    <!-- Row 1: Title + Badge | Timer -->
    <div class="flex items-start justify-between gap-4">
      <!-- Left: Title + Badge -->
      <div class="flex-1">
        <div
          class="flex items-center gap-3 mb-1"
          :class="
            isFinished ? 'justify-between' : 'justify-between sm:justify-start'
          "
        >
          <h1 class="text-3xl font-bold">
            {{ t("rooms.hostGame", { name: room.hostName }) }}
          </h1>
          <Badge class="text-sm px-4 py-1.5">
            {{ t(`rooms.status.${statusKey}`) }}
          </Badge>
        </div>
        <div class="flex items-center gap-2">
          <p class="text-sm text-muted-foreground font-mono">
            {{ roomCode }}
          </p>
          <Button
            variant="ghost"
            size="icon"
            class="size-6"
            @click="emit('copyCode')"
          >
            <Icon name="lucide:copy" class="size-3" />
          </Button>
        </div>
      </div>

      <!-- Right: Timer (desktop only) -->
      <div v-if="showTimer" class="hidden sm:block text-right">
        <p class="text-sm text-muted-foreground">
          {{ t("game.timeRemaining") }}
        </p>
        <p
          class="text-2xl font-bold font-mono"
          :class="{ 'text-destructive': timerIsLow }"
        >
          {{ timerFormattedTime }}
        </p>
      </div>
    </div>

    <!-- Row 2: Timer (mobile only) -->
    <div v-if="showTimer" class="sm:hidden mt-3">
      <p class="text-sm text-muted-foreground">
        {{ t("game.timeRemaining") }}
      </p>
      <p
        class="text-xl font-bold font-mono"
        :class="{ 'text-destructive': timerIsLow }"
      >
        {{ timerFormattedTime }}
      </p>
    </div>
  </div>
</template>
