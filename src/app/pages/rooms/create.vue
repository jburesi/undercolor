<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { DEFAULT_GAME_CONFIG } from "~/types/game.types";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const localePath = useLocalePath();
const { $api } = useNuxtApp();

// Form schema
const formSchema = toTypedSchema(
  z.object({
    username: z.string().min(2).max(20),
    isPublic: z.boolean().default(true),
    observationTime: z.number().min(5).max(60),
    debateTime: z.number().min(30).max(300),
    votingTime: z.number().min(10).max(120),
    maxPlayers: z.number().min(3).max(20),
  }),
);

const { handleSubmit, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: "",
    isPublic: true,
    observationTime: DEFAULT_GAME_CONFIG.observationTime,
    debateTime: DEFAULT_GAME_CONFIG.debateTime,
    votingTime: DEFAULT_GAME_CONFIG.votingTime,
    maxPlayers: DEFAULT_GAME_CONFIG.maxPlayers,
  },
});

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
        hostUsername: formValues.username,
        isPublic: formValues.isPublic,
        config: {
          observationTime: formValues.observationTime,
          debateTime: formValues.debateTime,
          votingTime: formValues.votingTime,
          maxPlayers: formValues.maxPlayers,
        },
      },
    });

    // Store session in sessionStorage
    if (import.meta.client) {
      sessionStorage.setItem(
        "undercolor_session",
        JSON.stringify({
          roomId: response.roomId,
          roomCode: response.roomCode,
          playerId: response.hostId,
          sessionId: response.sessionId,
        }),
      );
    }

    await navigateTo(`/rooms/${response.roomCode}`);
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Failed to create room";
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
            <!-- Username -->
            <div class="space-y-2">
              <label for="username" class="text-sm font-medium">
                {{ t("auth.username") }}
              </label>
              <Input
                id="username"
                :model-value="values.username"
                :placeholder="t('auth.username')"
                @update:model-value="setFieldValue('username', String($event))"
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
