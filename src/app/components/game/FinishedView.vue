<script setup lang="ts">
import type { PlayerRole } from "#shared/types/game.types";
import type { RoomPlayer } from "~/composables/game/useRoomData";
import { getRoleBadgeVariant } from "~/utils/game-helpers";

defineProps<{
  players: RoomPlayer[];
  currentPlayerId: string | null;
  myRole: PlayerRole | null;
  didIWin: boolean;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <Card class="text-center">
      <CardHeader>
        <CardTitle class="text-3xl">
          {{ didIWin ? t("game.youWon") : t("game.youLost") }}
        </CardTitle>
        <CardDescription>
          {{ t("game.yourRoleWas") }}
          <Badge
            v-if="myRole"
            :variant="getRoleBadgeVariant(myRole)"
            class="ml-1 mt-2"
          >
            {{ t(`game.roles.${myRole.toLowerCase()}`) }}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Final player roles -->
        <div class="flex flex-wrap justify-center gap-4">
          <RoomsPlayerCard
            v-for="player in players"
            :key="player.id"
            :player="player"
            :is-me="player.id === currentPlayerId"
            class="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)]"
            show-role
            compact
          />
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
</template>
