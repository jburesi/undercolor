<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[400px]">
    <Icon
      name="lucide:loader-2"
      class="size-16 text-primary animate-spin mb-4"
    />
    <p class="text-xl font-medium">{{ t("game.starting") }}</p>
    <p class="text-muted-foreground">{{ t("game.assigningRoles") }}</p>
  </div>
</template>
