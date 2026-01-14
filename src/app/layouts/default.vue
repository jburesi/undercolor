<script setup lang="ts">
const route = useRoute();
const routeBaseName = useRouteBaseName();
const baseRouteName = computed(() => routeBaseName(route));

const isIndexPage = computed(() => baseRouteName.value === "index");
</script>

<template>
  <!-- Regular layout without sidebar -->
  <div class="min-h-screen">
    <header class="flex h-16 shrink-0 items-center border-b px-3">
      <!-- Left: Language switcher -->
      <div class="flex-1 flex items-center">
        <CommonLanguageSwitcher />
      </div>

      <!-- Center: Logo -->
      <NuxtLinkLocale
        v-if="!isIndexPage"
        to="index"
        class="flex items-center gap-2"
      >
        <div
          class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <Icon name="lucide:palette" class="size-4" />
        </div>
        <span class="font-semibold">Undercolor</span>
      </NuxtLinkLocale>
      <div v-else class="flex-1" />

      <!-- Right: User menu -->
      <div class="flex-1 flex items-center justify-end">
        <CommonUserMenu />
      </div>
    </header>
    <div class="flex flex-1 flex-col gap-4 p-4">
      <slot />
    </div>
  </div>
</template>
