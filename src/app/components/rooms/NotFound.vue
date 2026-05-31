<script setup lang="ts">
defineProps<{
  roomCode: string;
}>();

const { t } = useI18n();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[400px] text-center"
  >
    <div
      class="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6"
    >
      <Icon name="lucide:search-x" class="size-12 text-muted-foreground" />
    </div>
    <h1 class="text-2xl font-bold mb-2">
      {{ t("rooms.notFound.title") }}
    </h1>
    <p class="text-muted-foreground mb-6 max-w-md">
      {{ t("rooms.notFound.description", { code: roomCode }) }}
    </p>
    <div class="flex gap-3">
      <Button variant="outline" as-child>
        <NuxtLinkLocale to="rooms">
          <Icon name="lucide:arrow-left" class="size-4 mr-2" />
          {{ t("rooms.notFound.backToRooms") }}
        </NuxtLinkLocale>
      </Button>
      <Button as-child>
        <NuxtLinkLocale to="rooms-create">
          <Icon name="lucide:plus" class="size-4 mr-2" />
          {{ t("rooms.notFound.createRoom") }}
        </NuxtLinkLocale>
      </Button>
    </div>
  </div>
</template>
