<script setup lang="ts">
import type { SidebarProps } from "./ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppSidebarFooter from "./AppSidebarFooter.vue";

const props = defineProps<SidebarProps>();

// Supabase authentication
const user = useSupabaseUser();

// Get current route for active state
const route = useRoute();
const isActive = (url: string) => {
  if (url === "/") return route.path === "/";
  return route.path.startsWith(url);
};

watch(user, (newUser) => {
  if (newUser) {
    console.log("User is logged in:", newUser);
  } else {
    console.log("User is logged out");
  }
});

// Navigation data with submenus
const data = computed(() => {
  const baseNavigation = [
    {
      title: "Explorer",
      url: "/",
      icon: "lucide:package",
      items: [
        {
          title: "Tous les modules",
          url: "/",
          isActive: route.path === "/",
        },
        {
          title: "Modules populaires",
          url: "/",
          isActive: route.path === "/popular",
        },
        {
          title: "Nouveautés",
          url: "/",
          isActive: route.path === "/latest",
        },
        ...(user.value
          ? [
              {
                title: "Favoris",
                url: "/",
                isActive: route.path === "/favorites",
              },
            ]
          : []),
      ],
    },
    {
      title: "Catégories",
      url: "",
      icon: "lucide:folder",
      items: [
        {
          title: "UI & Design",
          url: "",
          isActive: route.path === "/categories/ui",
        },
        {
          title: "Authentication",
          url: "",
          isActive: route.path === "/categories/auth",
        },
        {
          title: "Database",
          url: "",
          isActive: route.path === "/categories/database",
        },
        {
          title: "DevTools",
          url: "",
          isActive: route.path === "/categories/devtools",
        },
        {
          title: "Performance",
          url: "",
          isActive: route.path === "/categories/performance",
        },
        {
          title: "SEO & Meta",
          url: "",
          isActive: route.path === "/categories/seo",
        },
      ],
    },
  ];

  // Ajouter des sections pour les utilisateurs connectés
  if (user.value) {
    baseNavigation.push(
      {
        title: "Analytics",
        url: "",
        icon: "lucide:bar-chart-3",
        items: [
          {
            title: "Statistiques globales",
            url: "",
            isActive: route.path === "/analytics/overview",
          },
          {
            title: "Tendances",
            url: "",
            isActive: route.path === "/analytics/trends",
          },
          {
            title: "Comparaisons",
            url: "",
            isActive: route.path === "/analytics/compare",
          },
          {
            title: "Rapports",
            url: "",
            isActive: route.path === "/analytics/reports",
          },
        ],
      },
      {
        title: "Outils",
        url: "",
        icon: "lucide:wrench",
        items: [
          {
            title: "Recherche avancée",
            url: "",
            isActive: route.path === "/tools/search",
          },
          {
            title: "Générateur de config",
            url: "",
            isActive: route.path === "/tools/config-generator",
          },
          {
            title: "Compatibility checker",
            url: "",
            isActive: route.path === "/tools/compatibility",
          },
        ],
      },
    );
  }

  return {
    navMain: baseNavigation,
    resources: [
      {
        title: "Documentation",
        url: "https://nuxt.com/modules",
        icon: "lucide:book-open",
        external: true,
      },
      {
        title: "GitHub",
        url: "https://github.com/nuxt/modules",
        icon: "lucide:github",
        external: true,
      },
      {
        title: "Discord",
        url: "https://discord.nuxtjs.org",
        icon: "lucide:message-circle",
        external: true,
      },
      {
        title: "Contribution Guide",
        url: "https://nuxt.com/docs/community/contribution",
        icon: "lucide:heart-handshake",
        external: true,
      },
    ],
  };
});

// Quick stats (could come from an API)
const stats = ref({
  totalModules: 245,
  categories: 12,
  totalDownloads: "2.1M",
  activeContributors: 180,
});
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLinkLocale to="/">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <Icon name="lucide:package" class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">Nuxt Modules</span>
                <span class="text-xs">Ecosystem Explorer</span>
              </div>
            </NuxtLinkLocale>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <ScrollArea class="flex-1 overflow-x-hidden">
        <!-- Navigation principale avec sous-menus -->
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in data.navMain" :key="item.title">
              <SidebarMenuButton as-child :is-active="isActive(item.url)">
                <NuxtLinkLocale :to="item.url" class="font-medium">
                  <Icon :name="item.icon" />
                  {{ item.title }}
                </NuxtLinkLocale>
              </SidebarMenuButton>
              <SidebarMenuSub v-if="item.items?.length">
                <SidebarMenuSubItem
                  v-for="childItem in item.items"
                  :key="childItem.title"
                >
                  <SidebarMenuSubButton
                    as-child
                    :is-active="childItem.isActive"
                  >
                    <NuxtLinkLocale :to="childItem.url">
                      {{ childItem.title }}
                    </NuxtLinkLocale>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <!-- Resources externes -->
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem
              v-for="resource in data.resources"
              :key="resource.title"
            >
              <SidebarMenuButton as-child>
                <NuxtLinkLocale
                  :to="resource.url"
                  :external="resource.external"
                  :target="resource.external ? '_blank' : undefined"
                >
                  <Icon :name="resource.icon" />
                  {{ resource.title }}
                  <Icon
                    v-if="resource.external"
                    name="lucide:external-link"
                    class="ml-auto size-3"
                  />
                </NuxtLinkLocale>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <!-- Quick Stats -->
        <SidebarGroup class="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Statistiques</SidebarGroupLabel>
          <div class="px-2 py-1 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-sidebar-foreground/70">Total Modules</span>
              <Badge variant="secondary">{{ stats.totalModules }}</Badge>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-sidebar-foreground/70">Catégories</span>
              <Badge variant="secondary">{{ stats.categories }}</Badge>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-sidebar-foreground/70">Téléchargements</span>
              <Badge variant="secondary">{{ stats.totalDownloads }}</Badge>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-sidebar-foreground/70">Contributeurs</span>
              <Badge variant="secondary">{{ stats.activeContributors }}</Badge>
            </div>
          </div>
        </SidebarGroup>
      </ScrollArea>
    </SidebarContent>

    <AppSidebarFooter />

    <SidebarRail />
  </Sidebar>
</template>
