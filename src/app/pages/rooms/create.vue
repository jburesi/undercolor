<script setup lang="ts">
import { useCreateRoomForm } from "~/composables/forms/useCreateRoomForm";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { isSubmitting, onSubmit } = useCreateRoomForm();
</script>

<template>
  <div class="page-rooms-create">
    <div class="container mx-auto px-4 py-6 max-w-2xl">
      <div class="text-center pb-8">
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

            <Button type="submit" class="w-full" :disabled="isSubmitting">
              <Icon
                v-if="isSubmitting"
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
