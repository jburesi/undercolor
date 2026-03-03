<script setup lang="ts">
import type { RoomPlayer } from "~/composables/game/useRoomData";

defineProps<{
  players: RoomPlayer[];
  currentPlayerId: string | null;
  isHost: boolean;
}>();

const emit = defineEmits<{
  skipPhase: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
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
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <RoomsPlayerCard
            v-for="player in players"
            :key="player.id"
            :player="player"
            :is-me="player.id === currentPlayerId"
          />
        </div>
      </CardContent>
      <CardFooter v-if="isHost">
        <Button class="w-full" @click="emit('skipPhase')">
          <Icon name="lucide:vote" class="size-4 mr-2" />
          {{ t("game.startVoting") }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
