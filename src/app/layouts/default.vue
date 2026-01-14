<script setup lang="ts"></script>

<template>
  <!-- Regular layout without sidebar -->
  <div class="min-h-screen">
    <header class="flex h-16 shrink-0 items-center border-b px-3">
      <!-- Left: Language switcher -->
      <div class="flex-1 flex items-center">
        <CommonLanguageSwitcher />
      </div>

      <!-- Center: Logo -->
      <NuxtLinkLocale to="index" class="flex items-center gap-2">
        <div
          class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <Icon name="lucide:palette" class="size-4" />
        </div>
        <span class="font-semibold">Undercolor</span>
      </NuxtLinkLocale>

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
