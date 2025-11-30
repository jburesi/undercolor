<script setup lang="ts">
const defaultOpen = useCookie<boolean>("sidebar_state", {
  default: () => false,
});
</script>

<template>
  <SidebarProvider v-model:open="defaultOpen">
    <CommonAppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b">
        <div class="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <CommonBreadcrumb />
        </div>
        <div class="ml-auto px-3">
          <CommonLanguageSwitcher />
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
