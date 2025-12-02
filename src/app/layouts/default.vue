<script setup lang="ts">
const user = useSupabaseUser();

// Check if user is admin
const isAdmin = computed(() => {
  return user.value?.user_metadata?.role === "admin" || true;
});

const defaultOpen = useCookie<boolean>("sidebar_state", {
  default: () => false,
});
</script>

<template>
  <!-- Admin layout with sidebar -->
  <SidebarProvider v-if="isAdmin" v-model:open="defaultOpen">
    <CommonAppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center border-b px-3">
        <!-- Left: Sidebar trigger + Breadcrumb -->
        <div class="flex-1 flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" class="h-4" />
          <CommonBreadcrumb />
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

        <!-- Right: Language switcher -->
        <div class="flex-1 flex items-center justify-end">
          <CommonLanguageSwitcher />
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- Regular layout without sidebar -->
  <div v-else class="min-h-screen">
    <header class="flex h-16 shrink-0 items-center border-b px-3">
      <!-- Left: Login/Profile button -->
      <div class="flex-1 flex items-center">
        <Button v-if="!user" as-child variant="ghost" size="icon">
          <NuxtLinkLocale to="login">
            <Icon name="lucide:log-in" class="size-5" />
            <span class="sr-only">{{ $t("auth.login") }}</span>
          </NuxtLinkLocale>
        </Button>
        <Button v-else as-child variant="ghost" size="icon">
          <NuxtLinkLocale to="profile">
            <Icon name="lucide:user" class="size-5" />
            <span class="sr-only">{{ $t("nav.profile") }}</span>
          </NuxtLinkLocale>
        </Button>
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

      <!-- Right: Language switcher -->
      <div class="flex-1 flex items-center justify-end">
        <CommonLanguageSwitcher />
      </div>
    </header>
    <div class="flex flex-1 flex-col gap-4 p-4">
      <slot />
    </div>
  </div>
</template>
