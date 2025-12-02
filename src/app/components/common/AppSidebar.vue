<script setup lang="ts">
import type { RouteNamedMapI18n } from "vue-router/auto-routes";
import { toast } from "vue-sonner";

// Type for navigation items with IntelliSense on route names
interface NavItem {
  title: string;
  icon: string;
  to: { name: keyof RouteNamedMapI18n };
}

const { t } = useI18n();
const localePath = useLocalePath();
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const { username, isAdmin } = useProfile();

// Logout function
async function handleLogout() {
  try {
    await supabase.auth.signOut();
    toast.success(t("toast.logoutSuccess"));
    await navigateTo(localePath("index"));
  } catch {
    toast.error(t("toast.errorOccurred"));
  }
}

// Navigation items - using route names for NuxtLinkLocale
const mainNavItems = computed<NavItem[]>(() => [
  {
    title: t("nav.home"),
    icon: "lucide:home",
    to: { name: "index" },
  },
  {
    title: t("nav.rooms"),
    icon: "lucide:gamepad-2",
    to: { name: "rooms" },
  },
]);

const gameNavItems = computed<NavItem[]>(() => [
  {
    title: t("rooms.create"),
    icon: "lucide:plus-circle",
    to: { name: "rooms-create" },
  },
  {
    title: t("rooms.join"),
    icon: "lucide:log-in",
    to: { name: "rooms-join" },
  },
]);

// User stats items (for logged in users)
const userNavItems = computed<NavItem[]>(() => [
  {
    title: t("nav.profile"),
    icon: "lucide:user",
    to: { name: "profile" },
  },
  {
    title: t("nav.gameHistory"),
    icon: "lucide:history",
    to: { name: "profile-history" },
  },
]);

// Admin items (only for admin users)
const adminNavItems = computed<NavItem[]>(() => [
  {
    title: t("nav.imageSets"),
    icon: "lucide:images",
    to: { name: "admin-images" },
  },
  {
    title: t("nav.dashboard"),
    icon: "lucide:layout-dashboard",
    to: { name: "admin" },
  },
]);
</script>

<template>
  <Sidebar>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLinkLocale to="index">
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
            </NuxtLinkLocale>
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
            <SidebarMenuItem v-for="item in mainNavItems" :key="item.to.name">
              <SidebarMenuButton as-child>
                <NuxtLinkLocale :to="item.to">
                  <Icon :name="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLinkLocale>
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
            <SidebarMenuItem v-for="item in gameNavItems" :key="item.to.name">
              <SidebarMenuButton as-child>
                <NuxtLinkLocale :to="item.to">
                  <Icon :name="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLinkLocale>
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
            <SidebarMenuItem v-for="item in userNavItems" :key="item.to.name">
              <SidebarMenuButton as-child>
                <NuxtLinkLocale :to="item.to">
                  <Icon :name="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLinkLocale>
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
            <SidebarMenuItem v-for="item in adminNavItems" :key="item.to.name">
              <SidebarMenuButton as-child>
                <NuxtLinkLocale :to="item.to">
                  <Icon :name="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </NuxtLinkLocale>
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
                    {{ username || user.email }}
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
                      {{ username || user.email }}
                    </span>
                    <span class="truncate text-xs text-muted-foreground">
                      {{ user.email }}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem as-child>
                <NuxtLinkLocale to="profile">
                  <Icon name="lucide:user" class="size-4 mr-2" />
                  {{ t("nav.profile") }}
                </NuxtLinkLocale>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive" @click="handleLogout">
                <Icon name="lucide:log-out" class="size-4 mr-2" />
                {{ t("nav.logout") }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- If user is not logged in - show login link -->
          <SidebarMenuButton v-else as-child>
            <NuxtLinkLocale to="login">
              <Icon name="lucide:log-in" class="size-4" />
              <span>{{ t("nav.login") }}</span>
            </NuxtLinkLocale>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
