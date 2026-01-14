<script setup lang="ts">
import { toast } from "vue-sonner";

const { t } = useI18n();
const localePath = useLocalePath();
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const { profile } = useProfile();
const { isAdmin } = useProfile();

const userInitials = computed(() => {
  if (!profile.value?.username) return "?";
  return profile.value.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success(t("toast.logoutSuccess"));
  await navigateTo(localePath("index"));
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="secondary" size="icon" class="rounded-full">
        <span class="sr-only">{{ $t("nav.myAccount") }}</span>
        <div
          v-if="user && profile?.username"
          class="size-5 flex items-center justify-center text-xs font-medium"
        >
          {{ userInitials }}
        </div>
        <Icon v-else name="lucide:user" class="size-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56" align="end">
      <!-- Logged in state -->
      <template v-if="user">
        <DropdownMenuLabel class="font-normal flex items-center gap-3">
          <Icon name="lucide:user" class="size-6 text-muted-foreground" />
          <div class="flex flex-col space-y-1">
            <p class="text-sm font-medium leading-none">
              {{ profile?.username }}
            </p>
            <p class="text-xs leading-none text-muted-foreground">
              {{ user.email }}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem as-child>
            <NuxtLinkLocale to="profile" class="flex items-center gap-2">
              <Icon name="lucide:user" class="size-4" />
              <span>{{ $t("nav.profile") }}</span>
            </NuxtLinkLocale>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NuxtLinkLocale
              to="profile-history"
              class="flex items-center gap-2"
            >
              <Icon name="lucide:history" class="size-4" />
              <span>{{ $t("nav.gameHistory") }}</span>
            </NuxtLinkLocale>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <!-- Admin section -->
        <template v-if="isAdmin">
          <DropdownMenuSeparator />
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            {{ $t("nav.admin") }}
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem as-child>
              <NuxtLinkLocale to="admin" class="flex items-center gap-2">
                <Icon name="lucide:layout-dashboard" class="size-4" />
                <span>{{ $t("nav.dashboard") }}</span>
              </NuxtLinkLocale>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </template>

        <DropdownMenuSeparator />
      </template>

      <!-- Not logged in state -->
      <template v-else>
        <DropdownMenuLabel class="font-normal">
          {{ $t("auth.loginDescription.viewStats") }}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem as-child>
            <NuxtLinkLocale to="login" class="flex items-center gap-2">
              <Icon name="lucide:log-in" class="size-4" />
              <span>{{ $t("auth.login") }}</span>
            </NuxtLinkLocale>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NuxtLinkLocale to="register" class="flex items-center gap-2">
              <Icon name="lucide:user-plus" class="size-4" />
              <span>{{ $t("auth.register") }}</span>
            </NuxtLinkLocale>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </template>

      <!-- Logout (only when logged in) -->
      <template v-if="user">
        <DropdownMenuItem
          class="flex items-center gap-2 text-destructive focus:text-destructive"
          @click="handleLogout"
        >
          <Icon name="lucide:log-out" class="size-4" />
          <span>{{ $t("nav.logout") }}</span>
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
