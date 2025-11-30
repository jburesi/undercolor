<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const user = useSupabaseUser();

// Check if user is admin (based on user metadata or role)
const isAdmin = computed(() => {
  return user.value?.user_metadata?.role === "admin";
});

// Navigation items
const mainNavItems = computed(() => [
  {
    title: t("nav.home"),
    icon: "lucide:home",
    to: localePath("/"),
  },
  {
    title: t("nav.rooms"),
    icon: "lucide:gamepad-2",
    to: localePath("/rooms"),
  },
]);

const gameNavItems = computed(() => [
  {
    title: t("rooms.create"),
    icon: "lucide:plus-circle",
    to: localePath("/rooms/create"),
  },
  {
    title: t("rooms.join"),
    icon: "lucide:log-in",
    to: localePath("/rooms/join"),
  },
]);

// User stats items (for logged in users)
const userNavItems = computed(() => [
  {
    title: t("nav.profile"),
    icon: "lucide:user",
    to: localePath("/profile"),
  },
  {
    title: t("nav.gameHistory"),
    icon: "lucide:history",
    to: localePath("/profile/history"),
  },
]);

// Admin items (only for admin users)
const adminNavItems = computed(() => [
  {
    title: t("nav.imageSets"),
    icon: "lucide:images",
    to: localePath("/admin/images"),
  },
  {
    title: t("nav.dashboard"),
    icon: "lucide:layout-dashboard",
    to: localePath("/admin"),
  },
]);
</script>

<template>
  <Sidebar>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink :to="localePath('/')">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <Icon name="lucide:palette" class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">Undercolor</span>
                <span class="text-xs text-muted-foreground">
                  Visual Deduction
                </span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- Main Navigation -->
      <SidebarGroup>
        <SidebarGroupLabel>{{ t("nav.home") }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in mainNavItems" :key="item.to">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.to">
                  <Icon :name="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- Game Actions -->
      <SidebarGroup>
        <SidebarGroupLabel>{{ t("nav.play") }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in gameNavItems" :key="item.to">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.to">
                  <Icon :name="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- User Stats Section (for logged in users) -->
      <SidebarGroup v-if="user">
        <SidebarGroupLabel>{{ t("nav.myAccount") }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in userNavItems" :key="item.to">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.to">
                  <Icon :name="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- Admin Section (only for admin users) -->
      <SidebarGroup v-if="isAdmin">
        <SidebarGroupLabel>{{ t("nav.admin") }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in adminNavItems" :key="item.to">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.to">
                  <Icon :name="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <!-- If user is logged in -->
          <DropdownMenu v-if="user">
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton
                size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarFallback class="rounded-lg">
                    {{ user.email?.substring(0, 2).toUpperCase() }}
                  </AvatarFallback>
                </Avatar>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">
                    {{ user.user_metadata?.username || user.email }}
                  </span>
                  <span class="truncate text-xs text-muted-foreground">
                    {{ user.email }}
                  </span>
                </div>
                <Icon name="lucide:chevrons-up-down" class="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="bottom"
              align="end"
              :side-offset="4"
            >
              <DropdownMenuLabel class="p-0 font-normal">
                <div
                  class="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
                >
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarFallback class="rounded-lg">
                      {{ user.email?.substring(0, 2).toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">
                      {{ user.user_metadata?.username || user.email }}
                    </span>
                    <span class="truncate text-xs text-muted-foreground">
                      {{ user.email }}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem as-child>
                <NuxtLink :to="localePath('/profile')">
                  <Icon name="lucide:user" class="size-4 mr-2" />
                  {{ t("nav.profile") }}
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive">
                <Icon name="lucide:log-out" class="size-4 mr-2" />
                {{ t("nav.logout") }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- If user is not logged in - show login link -->
          <SidebarMenuButton v-else as-child>
            <NuxtLink :to="localePath('/login')">
              <Icon name="lucide:log-in" class="size-4" />
              <span>{{ t("nav.login") }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
