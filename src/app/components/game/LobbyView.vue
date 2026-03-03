<script setup lang="ts">
import type { RoomData, RoomPlayer } from "~/composables/game/useRoomData";

defineProps<{
  room: RoomData;
  players: RoomPlayer[];
  currentPlayerId: string | null;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Icon name="lucide:users" class="size-5" />
          {{ t("rooms.playersTitle") }} ({{ players.length }}/{{
            room.config.maxPlayers
          }})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <RoomsPlayerCard
            v-for="player in players"
            :key="player.id"
            :player="player"
            :is-me="player.id === currentPlayerId"
            show-connection-status
          />

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
    </Card>
  </div>
</template>
