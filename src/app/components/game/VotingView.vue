<script setup lang="ts">
import type { RoomPlayer } from "~/composables/game/useRoomData";

const props = defineProps<{
  players: RoomPlayer[];
  currentPlayer: RoomPlayer | null;
  isAlive: boolean;
}>();

const emit = defineEmits<{
  vote: [targetId: string];
}>();

const { t } = useI18n();

const selectedVoteTarget = ref<string | null>(null);
const isSubmitting = ref(false);

const alivePlayersForVoting = computed(() =>
  props.players.filter((p) => p.is_alive && p.id !== props.currentPlayer?.id),
);

async function handleVote() {
  if (!selectedVoteTarget.value) return;
  isSubmitting.value = true;
  emit("vote", selectedVoteTarget.value);
  // Parent will handle the actual API call
}

// Reset submission state when vote is processed
watch(
  () => props.currentPlayer?.has_voted,
  (hasVoted) => {
    if (hasVoted) {
      isSubmitting.value = false;
      selectedVoteTarget.value = null;
    }
  },
);
</script>

<template>
  <div class="space-y-6">
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
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <RoomsPlayerCard
              v-for="player in alivePlayersForVoting"
              :key="player.id"
              :player="player"
              selectable
              :selected="selectedVoteTarget === player.id"
              @select="selectedVoteTarget = player.id"
            />
          </div>

          <Button
            class="w-full"
            :disabled="!selectedVoteTarget || isSubmitting"
            @click="handleVote"
          >
            <Icon
              v-if="isSubmitting"
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
</template>
