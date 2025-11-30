<script setup lang="ts">
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { DEFAULT_GAME_CONFIG } from "~/types/game.types";
import { createRoomFormSchema } from "#shared/schemas";

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

const form = useForm({
  validationSchema: createRoomFormSchema,
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

const onSubmit = form.handleSubmit(async (formValues) => {
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
    await navigateTo(
      localePath({ name: "rooms-code", params: { code: response.roomCode } }),
    );
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
          <NuxtLinkLocale to="rooms">
            <Icon name="lucide:arrow-left" class="size-4 mr-2" />
            {{ t("common.back") }}
          </NuxtLinkLocale>
        </Button>
        <h1 class="text-3xl font-bold">{{ t("rooms.create") }}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{{ t("rooms.create") }}</CardTitle>
          <CardDescription>
            {{ t("rooms.createDescription") }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-6" @submit="onSubmit">
            <!-- Host Username (also used as room display name) -->
            <FormField v-slot="{ componentField }" name="hostUsername">
              <FormItem>
                <FormLabel>{{ t("rooms.yourName") }}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    :placeholder="t('rooms.yourNamePlaceholder')"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Room Visibility -->
            <FormField v-slot="{ value, handleChange }" name="isPublic">
              <FormItem
                class="flex items-center justify-between p-4 rounded-lg border"
              >
                <div class="space-y-0.5">
                  <FormLabel>{{ t("rooms.publicRoom") }}</FormLabel>
                  <FormDescription>
                    {{ t("rooms.publicRoomDescription") }}
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox :checked="value" @update:checked="handleChange" />
                </FormControl>
              </FormItem>
            </FormField>

            <!-- Game Settings -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">
                {{ t("game.settings.title") }}
              </h3>

              <!-- Max Players -->
              <FormField v-slot="{ value, handleChange }" name="maxPlayers">
                <FormItem>
                  <FormLabel>
                    {{ t("game.settings.maxPlayers") }}: {{ value }}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      :model-value="[value]"
                      :min="3"
                      :max="20"
                      :step="1"
                      @update:model-value="(v) => handleChange(v?.[0] ?? 3)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Observation Time -->
              <FormField
                v-slot="{ value, handleChange }"
                name="observationTime"
              >
                <FormItem>
                  <FormLabel>
                    {{ t("game.settings.observationTime") }}: {{ value }}s
                  </FormLabel>
                  <FormControl>
                    <Slider
                      :model-value="[value]"
                      :min="5"
                      :max="60"
                      :step="5"
                      @update:model-value="(v) => handleChange(v?.[0] ?? 15)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Debate Time -->
              <FormField v-slot="{ value, handleChange }" name="debateTime">
                <FormItem>
                  <FormLabel>
                    {{ t("game.settings.debateTime") }}: {{ value }}s
                  </FormLabel>
                  <FormControl>
                    <Slider
                      :model-value="[value]"
                      :min="30"
                      :max="300"
                      :step="15"
                      @update:model-value="(v) => handleChange(v?.[0] ?? 120)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Voting Time -->
              <FormField v-slot="{ value, handleChange }" name="votingTime">
                <FormItem>
                  <FormLabel>
                    {{ t("game.settings.votingTime") }}: {{ value }}s
                  </FormLabel>
                  <FormControl>
                    <Slider
                      :model-value="[value]"
                      :min="10"
                      :max="120"
                      :step="5"
                      @update:model-value="(v) => handleChange(v?.[0] ?? 30)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
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
