<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Supabase authentication
const user = useSupabaseUser();
const supabase = useSupabaseClient();

const signOut = async () => {
  await supabase.auth.signOut();
  window.location.reload();
};

const getUserInitials = (email: string) => {
  return email.charAt(0).toUpperCase();
};
</script>

<template>
  <SidebarFooter>
    <SidebarMenu>
      <SidebarMenuItem>
        <!-- Si l'utilisateur n'est pas connecté -->
        <div v-if="!user" class="space-y-2 p-2">
          <SidebarMenuButton size="sm" as-child>
            <NuxtLinkLocale
              to="/login"
              class="flex items-center justify-center w-full"
            >
              <Icon name="lucide:log-in" class="size-4 mr-2" />
              Se connecter
            </NuxtLinkLocale>
          </SidebarMenuButton>
          <SidebarMenuButton size="sm" as-child>
            <NuxtLinkLocale
              to="/register"
              class="flex items-center justify-center w-full"
            >
              <Icon name="lucide:user-plus" class="size-4 mr-2" />
              S'inscrire
            </NuxtLinkLocale>
          </SidebarMenuButton>
        </div>

        <!-- Si l'utilisateur est connecté -->
        <DropdownMenu v-else>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div class="flex items-center gap-2 w-full">
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <span class="text-xs font-semibold">
                    {{ getUserInitials(user.email || "") }}
                  </span>
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">
                    {{ user.user_metadata?.name || "Utilisateur" }}
                  </span>
                  <span class="truncate text-xs">
                    {{ user.email }}
                  </span>
                </div>
                <Icon name="lucide:chevron-up" class="ml-auto size-4" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="top"
            align="end"
            :side-offset="4"
          >
            <DropdownMenuLabel class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none">
                  {{ user.user_metadata?.name || "Utilisateur" }}
                </p>
                <p class="text-xs leading-none text-muted-foreground">
                  {{ user.email }}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child>
              <NuxtLinkLocale to="/">
                <Icon name="lucide:user" class="mr-2 h-4 w-4" />
                Profil
              </NuxtLinkLocale>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLinkLocale to="/settings">
                <Icon name="lucide:settings" class="mr-2 h-4 w-4" />
                Paramètres
              </NuxtLinkLocale>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="signOut">
              <Icon name="lucide:log-out" class="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
</template>
