<script setup lang="ts">
const { locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon">
        <Icon name="lucide:languages" class="h-[1.2rem] w-[1.2rem]" />
        <span class="sr-only">{{ $t("languageSwitcher.toggleLanguage") }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem v-for="loc in locales" :key="loc.code" as-child>
        <NuxtLink :to="switchLocalePath(loc.code)">
          {{ loc.name }}
        </NuxtLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
