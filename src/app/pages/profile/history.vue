<script setup lang="ts">
import { PlayerRole } from "~/types/game.types";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const { t } = useI18n();

// Mock game history data
const gameHistory = ref([
  {
    id: "1",
    roomCode: "ABC123",
    playedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    role: PlayerRole.INNOCENT,
    result: "win" as const,
    players: 8,
    duration: "6:45",
    imageSet: "Beach Scene",
  },
  {
    id: "2",
    roomCode: "XYZ789",
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    role: PlayerRole.IMPOSTER,
    result: "win" as const,
    players: 6,
    duration: "8:12",
    imageSet: "City Street",
  },
  {
    id: "3",
    roomCode: "DEF456",
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    role: PlayerRole.INNOCENT,
    result: "loss" as const,
    players: 10,
    duration: "10:30",
    imageSet: "Forest Path",
  },
  {
    id: "4",
    roomCode: "GHI012",
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    role: PlayerRole.MR_WHITE,
    result: "loss" as const,
    players: 7,
    duration: "7:55",
    imageSet: "Mountain View",
  },
  {
    id: "5",
    roomCode: "JKL345",
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    role: PlayerRole.IMPOSTER,
    result: "loss" as const,
    players: 8,
    duration: "9:20",
    imageSet: "Ocean Sunset",
  },
]);

const getRoleBadgeVariant = (role: PlayerRole) => {
  switch (role) {
    case PlayerRole.INNOCENT:
      return "default";
    case PlayerRole.IMPOSTER:
      return "destructive";
    case PlayerRole.MR_WHITE:
      return "secondary";
    default:
      return "outline";
  }
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return t("common.time.minutesAgo", { count: minutes });
  } else if (hours < 24) {
    return t("common.time.hoursAgo", { count: hours });
  } else {
    return t("common.time.daysAgo", { count: days });
  }
};
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">{{ t("user.history.title") }}</h1>
        <p class="text-muted-foreground">
          {{ t("user.history.description") }}
        </p>
      </div>
      <NuxtLinkLocale to="profile">
        <Button variant="outline">
          {{ t("user.history.backToProfile") }}
        </Button>
      </NuxtLinkLocale>
    </div>

    <!-- Game History List -->
    <div class="space-y-4">
      <Card v-for="game in gameHistory" :key="game.id">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Result Indicator -->
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full"
                :class="
                  game.result === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'
                "
              >
                <svg
                  v-if="game.result === 'win'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ game.imageSet }}</span>
                  <Badge :variant="getRoleBadgeVariant(game.role)">
                    {{ t(`game.roles.${game.role.toLowerCase()}`) }}
                  </Badge>
                </div>
                <div
                  class="text-muted-foreground mt-1 flex items-center gap-2 text-sm"
                >
                  <span>{{ t("user.history.room") }}: {{ game.roomCode }}</span>
                  <span>•</span>
                  <span
                    >{{ game.players }} {{ t("user.history.players") }}</span
                  >
                  <span>•</span>
                  <span>{{ game.duration }}</span>
                </div>
              </div>
            </div>

            <div class="text-right">
              <div
                class="font-medium"
                :class="
                  game.result === 'win' ? 'text-green-500' : 'text-red-500'
                "
              >
                {{
                  game.result === "win"
                    ? t("user.history.victory")
                    : t("user.history.defeat")
                }}
              </div>
              <div class="text-muted-foreground text-sm">
                {{ formatRelativeTime(game.playedAt) }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-if="gameHistory.length === 0" class="py-12 text-center">
      <CardContent>
        <div class="text-muted-foreground mb-4 text-6xl">🎮</div>
        <h3 class="mb-2 text-lg font-medium">
          {{ t("user.history.empty") }}
        </h3>
        <p class="text-muted-foreground mb-4">
          {{ t("user.history.emptyDescription") }}
        </p>
        <NuxtLinkLocale to="rooms">
          <Button>{{ t("user.history.startPlaying") }}</Button>
        </NuxtLinkLocale>
      </CardContent>
    </Card>

    <!-- Load More -->
    <div v-if="gameHistory.length > 0" class="mt-8 text-center">
      <Button variant="outline">
        {{ t("user.history.loadMore") }}
      </Button>
    </div>
  </div>
</template>
