<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const localePath = useLocalePath();
const { $api } = useNuxtApp();

// Fetch public rooms from API
interface PublicRoom {
  roomId: string;
  roomCode: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: string;
}

const { data, status, refresh } = await useAsyncData("public-rooms", () =>
  $api<{ rooms: PublicRoom[] }>("/rooms"),
);

const publicRooms = computed(() => data.value?.rooms || []);
const isLoading = computed(() => status.value === "pending");

// Refresh rooms every 10 seconds
const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null);
onMounted(() => {
  refreshInterval.value = setInterval(() => {
    refresh();
  }, 10000);
});
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="page-rooms">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4 mb-8">
        <h1 class="text-3xl font-bold">{{ t("rooms.title") }}</h1>
        <Button as-child>
          <NuxtLinkLocale to="rooms-create">
            <Icon name="lucide:plus" class="size-4 md:mr-2" />
            <span class="hidden md:inline">{{ t("rooms.create") }}</span>
          </NuxtLinkLocale>
        </Button>
      </div>

      <!-- Join by Code -->
      <RoomsJoinCard class="mb-8" />

      <!-- Public Rooms -->
      <div>
        <h2 class="text-xl font-semibold mb-4">{{ t("rooms.publicRooms") }}</h2>

        <div v-if="isLoading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card v-for="n in 3" :key="n">
            <CardHeader>
              <Skeleton class="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton class="h-4 w-24 mb-2" />
              <Skeleton class="h-4 w-20" />
            </CardContent>
          </Card>
        </div>

        <div
          v-else-if="publicRooms.length === 0"
          class="text-center py-12 text-muted-foreground"
        >
          <Icon name="lucide:inbox" class="size-12 mx-auto mb-4 opacity-50" />
          <p>{{ t("rooms.noRooms") }}</p>
        </div>

        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="room in publicRooms"
            :key="room.roomId"
            class="hover:shadow-lg transition-shadow cursor-pointer"
            @click="
              navigateTo(
                localePath({
                  name: 'rooms-code',
                  params: { code: room.roomCode },
                }),
              )
            "
          >
            <CardHeader>
              <div class="flex items-center justify-between">
                <div>
                  <CardTitle class="text-lg">
                    {{ t("rooms.hostGame", { name: room.hostName }) }}
                  </CardTitle>
                  <p class="text-sm text-muted-foreground font-mono">
                    {{ room.roomCode }}
                  </p>
                </div>
                <Badge variant="default">
                  {{ t("rooms.status.lobby") }}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div class="flex items-center text-sm text-muted-foreground">
                <Icon name="lucide:users" class="size-4 mr-2" />
                {{ room.playerCount }}/{{ room.maxPlayers }}
                {{ t("rooms.players") }}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
