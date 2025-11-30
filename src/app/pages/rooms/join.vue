<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const localePath = useLocalePath();

const joinCode = ref("");

const handleJoin = () => {
  if (joinCode.value.trim()) {
    navigateTo(localePath(`/rooms/${joinCode.value.trim().toUpperCase()}`));
  }
};
</script>

<template>
  <div class="page-rooms-join">
    <div class="container mx-auto px-4 py-8 max-w-md">
      <div class="mb-8">
        <Button variant="ghost" as-child class="mb-4">
          <NuxtLink :to="localePath('/rooms')">
            <Icon name="lucide:arrow-left" class="size-4 mr-2" />
            {{ t("common.back") }}
          </NuxtLink>
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
                class="text-center text-2xl uppercase tracking-widest"
                maxlength="6"
              />
            </div>

            <Button type="submit" class="w-full" :disabled="!joinCode.trim()">
              <Icon name="lucide:log-in" class="size-4 mr-2" />
              {{ t("rooms.join") }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
