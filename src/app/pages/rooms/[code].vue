<script setup lang="ts">
import { toast } from "vue-sonner";
import { GameState, PlayerRole } from "~/types/game.types";
import { useGameRoom } from "~/composables/game/useGameRoom";
import { useGameTimer } from "~/composables/game/useGameTimer";

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
  session,
  init,
  joinRoom,
  startGame,
  vote,
  advancePhase,
} = useGameRoom(roomCode.value);

const timer = useGameTimer();

// Local state
const username = ref("");
const isJoining = ref(false);
const joinError = ref<string | null>(null);
const selectedVoteTarget = ref<string | null>(null);
const isVoting = ref(false);
const roleRevealed = ref(false);

// Computed
const hasJoined = computed(() => !!session.value);
const gameState = computed(() => room.value?.state || GameState.LOBBY);
const canStartGame = computed(
  () =>
    isHost.value && players.value.length >= 3 && gameState.value === "LOBBY",
);

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

// Join room handler
async function handleJoinRoom() {
  if (!username.value.trim()) return;

  isJoining.value = true;
  joinError.value = null;

  try {
    await joinRoom(username.value);
    toast.success(t("toast.roomJoined"));
  } catch (err: unknown) {
    joinError.value =
      err instanceof Error ? err.message : "Failed to join room";
    toast.error(t("toast.errorJoinRoom"));
  } finally {
    isJoining.value = false;
  }
}

// Start game handler
async function handleStartGame() {
  if (!canStartGame.value) return;

  try {
    await startGame();
    toast.success(t("toast.gameStarted"));
  } catch (err: unknown) {
    console.error("Failed to start game:", err);
    toast.error(t("toast.errorStartGame"));
  }
}

// Vote handler
async function handleVote() {
  if (!selectedVoteTarget.value || !isAlive.value) return;

  isVoting.value = true;

  try {
    await vote(selectedVoteTarget.value);
    selectedVoteTarget.value = null;
    toast.success(t("toast.voteSubmitted"));
  } catch (err: unknown) {
    console.error("Failed to vote:", err);
    toast.error(t("toast.errorVote"));
  } finally {
    isVoting.value = false;
  }
}

// Skip phase handler (host only)
async function handleSkipPhase() {
  if (!isHost.value) return;

  try {
    await advancePhase();
  } catch (err: unknown) {
    console.error("Failed to advance phase:", err);
  }
}

// Copy room code
async function copyRoomCode() {
  await navigator.clipboard.writeText(roomCode.value);
  toast.success(t("toast.codeCopied"));
}

// Get role badge variant
function getRoleBadgeVariant(role: PlayerRole) {
  switch (role) {
    case PlayerRole.INNOCENT:
      return "default";
    case PlayerRole.IMPOSTER:
      return "destructive";
    case PlayerRole.MR_WHITE:
      return "secondary";
  }
}

// Get alive players for voting
const alivePlayersForVoting = computed(() =>
  players.value.filter((p) => p.is_alive && p.id !== currentPlayer.value?.id),
);
</script>

<template>
  <div class="page-room">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center min-h-[400px]"
      >
        <Icon name="lucide:loader-2" class="size-8 animate-spin text-primary" />
      </div>

      <!-- Room Not Found State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <div
          class="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6"
        >
          <Icon name="lucide:search-x" class="size-12 text-muted-foreground" />
        </div>
        <h1 class="text-2xl font-bold mb-2">
          {{ t("rooms.notFound.title") }}
        </h1>
        <p class="text-muted-foreground mb-6 max-w-md">
          {{ t("rooms.notFound.description", { code: roomCode }) }}
        </p>
        <div class="flex gap-3">
          <Button variant="outline" as-child>
            <NuxtLinkLocale to="rooms">
              <Icon name="lucide:arrow-left" class="size-4 mr-2" />
              {{ t("rooms.notFound.backToRooms") }}
            </NuxtLinkLocale>
          </Button>
          <Button as-child>
            <NuxtLinkLocale to="rooms-create">
              <Icon name="lucide:plus" class="size-4 mr-2" />
              {{ t("rooms.notFound.createRoom") }}
            </NuxtLinkLocale>
          </Button>
        </div>
      </div>

      <!-- Room Loaded -->
      <template v-else-if="room">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" as-child class="mb-2">
              <NuxtLinkLocale to="rooms">
                <Icon name="lucide:arrow-left" class="size-4 mr-2" />
                {{ t("common.back") }}
              </NuxtLinkLocale>
            </Button>
            <div>
              <h1 class="text-3xl font-bold mb-2">
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
                  @click="copyRoomCode"
                >
                  <Icon name="lucide:copy" class="size-3" />
                </Button>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Timer -->
            <div
              v-if="timer.isRunning.value && gameState !== 'LOBBY'"
              class="text-right"
            >
              <p class="text-sm text-muted-foreground">
                {{ t("game.timeRemaining") }}
              </p>
              <p
                class="text-2xl font-bold font-mono"
                :class="{ 'text-destructive': timer.isLow.value }"
              >
                {{ timer.formattedTime.value }}
              </p>
            </div>
            <Badge
              :variant="gameState === 'LOBBY' ? 'secondary' : 'default'"
              class="text-lg px-4 py-2"
            >
              {{ t(`rooms.status.${gameState.toLowerCase()}`) }}
            </Badge>
          </div>
        </div>

        <!-- Join Form (if not joined) -->
        <Card v-if="!hasJoined" class="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{{ t("game.joinGame") }}</CardTitle>
            <CardDescription>
              {{ t("game.joinGameDescription") }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form class="space-y-4" @submit.prevent="handleJoinRoom">
              <div class="space-y-2">
                <label for="join-username" class="text-sm font-medium">
                  {{ t("auth.username") }}
                </label>
                <Input
                  id="join-username"
                  v-model="username"
                  :placeholder="t('auth.username')"
                  maxlength="20"
                  :disabled="isJoining"
                />
                <p v-if="joinError" class="text-sm text-destructive">
                  {{ joinError }}
                </p>
              </div>
              <Button
                type="submit"
                class="w-full"
                :disabled="!username.trim() || isJoining"
              >
                <Icon
                  v-if="isJoining"
                  name="lucide:loader-2"
                  class="size-4 mr-2 animate-spin"
                />
                <Icon v-else name="lucide:log-in" class="size-4 mr-2" />
                {{ t("game.joinRoom") }}
              </Button>
            </form>
          </CardContent>
        </Card>

        <!-- Game View (if joined) -->
        <div v-else>
          <!-- ==================== LOBBY STATE ==================== -->
          <div v-if="gameState === 'LOBBY'" class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Icon name="lucide:users" class="size-5" />
                  {{ t("rooms.playersTitle") }} ({{ players.length }})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    v-for="player in players"
                    :key="player.id"
                    class="flex items-center gap-3 p-3 rounded-lg bg-muted min-h-[72px]"
                    :class="{
                      'ring-2 ring-primary': player.id === currentPlayer?.id,
                    }"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {{ player.username.substring(0, 2).toUpperCase() }}
                      </AvatarFallback>
                    </Avatar>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium truncate">{{ player.username }}</p>
                      <p
                        v-if="player.is_host"
                        class="text-xs text-muted-foreground"
                      >
                        {{ t("game.host") }}
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <div class="relative">
                          <div
                            :class="[
                              'w-2.5 h-2.5 rounded-full',
                              player.connection_status === 'CONNECTED'
                                ? 'bg-green-500'
                                : player.connection_status === 'RECONNECTING'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500',
                            ]"
                          />
                          <div
                            v-if="player.connection_status === 'CONNECTED'"
                            class="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {{
                            t(
                              `game.connectionStatus.${player.connection_status}`,
                            )
                          }}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <!-- Empty slots -->
                  <div
                    v-for="n in Math.max(
                      0,
                      (room.config.maxPlayers || 20) - players.length,
                    )"
                    :key="`empty-${n}`"
                    class="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-muted-foreground/20 min-h-[72px]"
                  >
                    <span class="text-muted-foreground text-sm">
                      {{ t("game.waiting") }}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter v-if="isHost">
                <Button
                  class="w-full"
                  :disabled="!canStartGame"
                  @click="handleStartGame"
                >
                  <Icon name="lucide:play" class="size-4 mr-2" />
                  {{ t("game.startGame") }} ({{ players.length }}/3
                  {{ t("game.minimumPlayers") }})
                </Button>
              </CardFooter>
            </Card>
          </div>

          <!-- ==================== DISTRIBUTING STATE ==================== -->
          <div
            v-else-if="gameState === 'DISTRIBUTING'"
            class="flex flex-col items-center justify-center min-h-[400px]"
          >
            <Icon
              name="lucide:loader-2"
              class="size-16 text-primary animate-spin mb-4"
            />
            <p class="text-xl font-medium">{{ t("game.starting") }}</p>
            <p class="text-muted-foreground">{{ t("game.assigningRoles") }}</p>
          </div>

          <!-- ==================== OBSERVATION STATE ==================== -->
          <div
            v-else-if="gameState === 'OBSERVATION'"
            class="max-w-2xl mx-auto space-y-6"
          >
            <!-- Role Card -->
            <Card class="overflow-hidden">
              <CardHeader class="text-center">
                <CardTitle>{{ t("game.yourRole") }}</CardTitle>
                <Badge
                  v-if="myRole"
                  :variant="getRoleBadgeVariant(myRole)"
                  class="w-fit mx-auto text-lg px-4 py-1"
                >
                  {{ myRole }}
                </Badge>
              </CardHeader>
              <CardContent>
                <!-- Mr. White sees nothing -->
                <div
                  v-if="myRole === PlayerRole.MR_WHITE"
                  class="text-center py-12"
                >
                  <Icon
                    name="lucide:eye-off"
                    class="size-16 text-muted-foreground mx-auto mb-4"
                  />
                  <p class="text-xl font-medium">
                    {{ t("game.mrWhiteNoImage") }}
                  </p>
                  <p class="text-muted-foreground">
                    {{ t("game.mrWhiteHint") }}
                  </p>
                </div>

                <!-- Image for Innocent/Imposter -->
                <div v-else class="text-center">
                  <p class="text-muted-foreground mb-4">
                    {{ t("game.yourImage") }}
                  </p>
                  <!-- Reveal button -->
                  <div
                    v-if="!roleRevealed"
                    class="aspect-video bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                    @click="roleRevealed = true"
                  >
                    <div class="text-center">
                      <Icon
                        name="lucide:eye"
                        class="size-12 text-muted-foreground mx-auto mb-2"
                      />
                      <p class="font-medium">{{ t("game.tapToReveal") }}</p>
                    </div>
                  </div>
                  <!-- Revealed image -->
                  <div
                    v-else
                    class="aspect-video bg-muted rounded-lg overflow-hidden"
                  >
                    <NuxtImg
                      v-if="myImageUrl"
                      :src="myImageUrl"
                      class="w-full h-full object-cover"
                      format="webp"
                      quality="80"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center"
                    >
                      <p class="text-muted-foreground">
                        {{ t("game.noImageAvailable") }}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Skip button for host -->
            <div v-if="isHost" class="text-center">
              <Button variant="outline" @click="handleSkipPhase">
                {{ t("game.skipToDebate") }}
              </Button>
            </div>
          </div>

          <!-- ==================== DEBATE STATE ==================== -->
          <div v-else-if="gameState === 'DEBATE'" class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Icon name="lucide:message-circle" class="size-5" />
                  {{ t("game.debate") }}
                </CardTitle>
                <CardDescription>
                  {{ t("game.debateDescription") }}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <!-- Player list with status -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    v-for="player in players"
                    :key="player.id"
                    class="flex items-center gap-3 p-3 rounded-lg"
                    :class="[
                      player.is_alive ? 'bg-muted' : 'bg-muted/50 opacity-50',
                      player.id === currentPlayer?.id
                        ? 'ring-2 ring-primary'
                        : '',
                    ]"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {{ player.username.substring(0, 2).toUpperCase() }}
                      </AvatarFallback>
                    </Avatar>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium truncate">{{ player.username }}</p>
                      <p
                        v-if="!player.is_alive"
                        class="text-xs text-destructive"
                      >
                        {{ t("game.eliminated") }}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter v-if="isHost">
                <Button class="w-full" @click="handleSkipPhase">
                  <Icon name="lucide:vote" class="size-4 mr-2" />
                  {{ t("game.startVoting") }}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <!-- ==================== VOTING STATE ==================== -->
          <div v-else-if="gameState === 'VOTING'" class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Icon name="lucide:vote" class="size-5" />
                  {{ t("game.voting") }}
                </CardTitle>
                <CardDescription>
                  {{ t("game.votingDescription") }}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <!-- Already voted -->
                <div v-if="currentPlayer?.has_voted" class="text-center py-8">
                  <Icon
                    name="lucide:check-circle"
                    class="size-16 text-green-500 mx-auto mb-4"
                  />
                  <p class="text-xl font-medium">{{ t("game.voted") }}</p>
                  <p class="text-muted-foreground">
                    {{ t("game.waitingForVotes") }}
                  </p>
                </div>

                <!-- Eliminated - can't vote -->
                <div v-else-if="!isAlive" class="text-center py-8">
                  <Icon
                    name="lucide:ghost"
                    class="size-16 text-muted-foreground mx-auto mb-4"
                  />
                  <p class="text-xl font-medium">
                    {{ t("game.youAreEliminated") }}
                  </p>
                  <p class="text-muted-foreground">
                    {{ t("game.watchOthers") }}
                  </p>
                </div>

                <!-- Vote selection -->
                <div v-else class="space-y-4">
                  <p class="text-sm text-muted-foreground">
                    {{ t("game.selectPlayer") }}
                  </p>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div
                      v-for="player in alivePlayersForVoting"
                      :key="player.id"
                      class="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors"
                      :class="[
                        selectedVoteTarget === player.id
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50',
                      ]"
                      @click="selectedVoteTarget = player.id"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {{ player.username.substring(0, 2).toUpperCase() }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium truncate">
                          {{ player.username }}
                        </p>
                      </div>
                      <Icon
                        v-if="selectedVoteTarget === player.id"
                        name="lucide:check"
                        class="size-5 text-primary"
                      />
                    </div>
                  </div>

                  <Button
                    class="w-full"
                    :disabled="!selectedVoteTarget || isVoting"
                    @click="handleVote"
                  >
                    <Icon
                      v-if="isVoting"
                      name="lucide:loader-2"
                      class="size-4 mr-2 animate-spin"
                    />
                    <Icon v-else name="lucide:vote" class="size-4 mr-2" />
                    {{ t("game.vote") }}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- ==================== FINISHED STATE ==================== -->
          <div v-else-if="gameState === 'FINISHED'" class="space-y-6">
            <Card class="text-center">
              <CardHeader>
                <CardTitle class="text-3xl">
                  <template v-if="room.winner === 'INNOCENT'">
                    🎉 {{ t("game.innocentsWin") }}
                  </template>
                  <template v-else-if="room.winner === 'IMPOSTER'">
                    😈 {{ t("game.impostersWin") }}
                  </template>
                  <template v-else-if="room.winner === 'MR_WHITE'">
                    👻 {{ t("game.mrWhiteWins") }}
                  </template>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground mb-6">
                  {{ t("game.yourRoleWas") }}
                  <Badge
                    v-if="myRole"
                    :variant="getRoleBadgeVariant(myRole)"
                    class="ml-2"
                  >
                    {{ myRole }}
                  </Badge>
                </p>

                <!-- Final player roles -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    v-for="player in players"
                    :key="player.id"
                    class="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {{ player.username.substring(0, 2).toUpperCase() }}
                      </AvatarFallback>
                    </Avatar>
                    <p class="font-medium text-sm">{{ player.username }}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter class="flex gap-4 justify-center">
                <Button variant="outline" as-child>
                  <NuxtLinkLocale to="rooms">
                    {{ t("game.backToLobby") }}
                  </NuxtLinkLocale>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
