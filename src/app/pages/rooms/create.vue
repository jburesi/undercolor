<script setup lang="ts">
import { useForm } from "vee-validate";
import { z } from "zod";
import { toast } from "vue-sonner";
import { DEFAULT_GAME_CONFIG } from "~/types/game.types";

interface GameSession {
  roomId: string;
  roomCode: string;
  playerId: string;
  sessionId: string;
}

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const localePath = useLocalePath();
const { $api } = useNuxtApp();

// Form schema - VeeValidate v5 supports Zod v4 natively
const formSchema = z.object({
  hostUsername: z.string().min(2).max(20),
  isPublic: z.boolean(),
  observationTime: z.number().min(5).max(60),
  debateTime: z.number().min(30).max(300),
  votingTime: z.number().min(10).max(120),
  maxPlayers: z.number().min(3).max(20),
});

const { handleSubmit, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    hostUsername: "",
    isPublic: true,
    observationTime: DEFAULT_GAME_CONFIG.observationTime,
    debateTime: DEFAULT_GAME_CONFIG.debateTime,
    votingTime: DEFAULT_GAME_CONFIG.votingTime,
    maxPlayers: DEFAULT_GAME_CONFIG.maxPlayers,
  },
});

// Session storage - use localStorage with map format (same as useGameRoom)
const SESSIONS_KEY = "undercolor_session";

interface SessionsMap {
  [roomCode: string]: GameSession;
}

const storedSessions = useLocalStorage<SessionsMap>(SESSIONS_KEY, {});

const isCreating = ref(false);
const error = ref<string | null>(null);

const onSubmit = handleSubmit(async (formValues) => {
  isCreating.value = true;
  error.value = null;

  try {
    const response = await $api<{
      roomId: string;
      roomCode: string;
      hostId: string;
      sessionId: string;
    }>("/rooms", {
      method: "POST",
      body: {
        hostUsername: formValues.hostUsername,
        isPublic: formValues.isPublic,
        config: {
          observationTime: formValues.observationTime,
          debateTime: formValues.debateTime,
          votingTime: formValues.votingTime,
          maxPlayers: formValues.maxPlayers,
        },
      },
    });

    // Store session in the map format (same as useGameRoom)
    const newSession: GameSession = {
      roomId: response.roomId,
      roomCode: response.roomCode,
      playerId: response.hostId,
      sessionId: response.sessionId,
    };
    storedSessions.value = {
      ...storedSessions.value,
      [response.roomCode]: newSession,
    };

    toast.success(t("toast.roomCreated"));
    await navigateTo(`/rooms/${response.roomCode}`);
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Failed to create room";
    toast.error(t("toast.errorCreateRoom"));
  } finally {
    isCreating.value = false;
  }
});
</script>

<template>
  <div class="page-rooms-create">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="mb-8">
        <Button variant="ghost" as-child class="mb-4">
          <NuxtLink :to="localePath('/rooms')">
            <Icon name="lucide:arrow-left" class="size-4 mr-2" />
            {{ t("common.back") }}
          </NuxtLink>
        </Button>
        <h1 class="text-3xl font-bold">{{ t("rooms.create") }}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{{ t("rooms.create") }}</CardTitle>
          <CardDescription>
            Configure your game room and invite friends to play.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-6" @submit="onSubmit">
            <!-- Host Username (also used as room display name) -->
            <div class="space-y-2">
              <label for="hostUsername" class="text-sm font-medium">
                {{ t("rooms.yourName") }}
              </label>
              <Input
                id="hostUsername"
                :model-value="values.hostUsername"
                :placeholder="t('rooms.yourNamePlaceholder')"
                @update:model-value="
                  setFieldValue('hostUsername', String($event))
                "
              />
            </div>

            <!-- Room Visibility -->
            <div
              class="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <label for="isPublic" class="text-sm font-medium">
                  {{ t("rooms.publicRoom") }}
                </label>
                <p class="text-sm text-muted-foreground">
                  {{ t("rooms.publicRoomDescription") }}
                </p>
              </div>
              <input
                id="isPublic"
                type="checkbox"
                :checked="values.isPublic"
                class="size-5"
                @change="
                  setFieldValue(
                    'isPublic',
                    ($event.target as HTMLInputElement).checked,
                  )
                "
              />
            </div>

            <!-- Game Settings -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Game Settings</h3>

              <!-- Max Players -->
              <div class="space-y-2">
                <label for="maxPlayers" class="text-sm font-medium">
                  Max Players: {{ values.maxPlayers }}
                </label>
                <input
                  id="maxPlayers"
                  type="range"
                  :value="values.maxPlayers"
                  :min="3"
                  :max="20"
                  class="w-full"
                  @input="
                    setFieldValue(
                      'maxPlayers',
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </div>

              <!-- Observation Time -->
              <div class="space-y-2">
                <label for="observationTime" class="text-sm font-medium">
                  Observation Time: {{ values.observationTime }}s
                </label>
                <input
                  id="observationTime"
                  type="range"
                  :value="values.observationTime"
                  :min="5"
                  :max="60"
                  class="w-full"
                  @input="
                    setFieldValue(
                      'observationTime',
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </div>

              <!-- Debate Time -->
              <div class="space-y-2">
                <label for="debateTime" class="text-sm font-medium">
                  Debate Time: {{ values.debateTime }}s
                </label>
                <input
                  id="debateTime"
                  type="range"
                  :value="values.debateTime"
                  :min="30"
                  :max="300"
                  step="15"
                  class="w-full"
                  @input="
                    setFieldValue(
                      'debateTime',
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </div>

              <!-- Voting Time -->
              <div class="space-y-2">
                <label for="votingTime" class="text-sm font-medium">
                  Voting Time: {{ values.votingTime }}s
                </label>
                <input
                  id="votingTime"
                  type="range"
                  :value="values.votingTime"
                  :min="10"
                  :max="120"
                  class="w-full"
                  @input="
                    setFieldValue(
                      'votingTime',
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </div>
            </div>

            <Button type="submit" class="w-full" :disabled="isCreating">
              <Icon
                v-if="isCreating"
                name="lucide:loader-2"
                class="size-4 mr-2 animate-spin"
              />
              <Icon v-else name="lucide:plus" class="size-4 mr-2" />
              {{ t("rooms.create") }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
