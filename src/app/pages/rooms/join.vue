<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center">
    <div class="container mx-auto px-4 max-w-md">
      <div class="text-center mb-18">
        <Icon name="lucide:log-in" class="size-12 mx-auto mb-4 text-primary" />
        <h1 class="text-3xl font-bold">{{ t("rooms.join") }}</h1>
      </div>

      <RoomsJoinCard />
    </div>
  </div>
</template>
