<script setup lang="ts">
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const localePath = useLocalePath();
const { $api } = useNuxtApp();

const joinCode = ref("");
const isJoining = ref(false);

const handleJoin = async () => {
  const code = joinCode.value.trim().toUpperCase();
  if (!code) return;

  isJoining.value = true;
  try {
    // Check if room exists
    await $api(`/rooms/${code}`);
    // Room exists, navigate to it
    await navigateTo(localePath(`/rooms/${code}`));
  } catch {
    // Room doesn't exist
    toast.error(t("toast.roomNotFound"));
  } finally {
    isJoining.value = false;
  }
};
</script>

<template>
  <div class="page-rooms-join">
    <div class="container mx-auto px-4 py-8 max-w-md">
      <div class="mb-8">
        <Button variant="ghost" as-child class="mb-4">
          <NuxtLinkLocale to="rooms">
            <Icon name="lucide:arrow-left" class="size-4 mr-2" />
            {{ t("common.back") }}
          </NuxtLinkLocale>
        </Button>
        <h1 class="text-3xl font-bold">{{ t("rooms.join") }}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{{ t("rooms.joinByCode") }}</CardTitle>
          <CardDescription>
            Enter the room code shared by your friend to join the game.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-6" @submit.prevent="handleJoin">
            <div class="space-y-2">
              <label for="joinCode" class="text-sm font-medium">
                Room Code
              </label>
              <Input
                id="joinCode"
                v-model="joinCode"
                :placeholder="t('rooms.enterCode')"
                class="text-center text-2xl tracking-widest"
                maxlength="6"
                :disabled="isJoining"
              />
            </div>

            <Button
              type="submit"
              class="w-full"
              :disabled="!joinCode.trim() || isJoining"
            >
              <Icon
                v-if="isJoining"
                name="lucide:loader-2"
                class="size-4 mr-2 animate-spin"
              />
              <Icon v-else name="lucide:log-in" class="size-4 mr-2" />
              {{ t("rooms.join") }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
