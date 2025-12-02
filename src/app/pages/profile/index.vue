<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const { t } = useI18n();
const user = useSupabaseUser();
const { username, avatarUrl } = useProfile();

// Mock user stats
const stats = ref({
  totalGames: 42,
  wins: 28,
  losses: 14,
  winRate: 66.7,
  gamesAsInnocent: 30,
  gamesAsImposter: 10,
  gamesAsMrWhite: 2,
  innocentWins: 20,
  imposterWins: 7,
  mrWhiteWins: 1,
  averageGameDuration: "8:32",
  longestWinStreak: 7,
  currentStreak: 3,
});
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">{{ t("user.profile.title") }}</h1>
      <p class="text-muted-foreground">
        {{ t("user.profile.description") }}
      </p>
    </div>

    <!-- User Info Card -->
    <Card class="mb-8">
      <CardHeader>
        <div class="flex items-center gap-4">
          <Avatar class="h-16 w-16">
            <AvatarImage
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="username || user?.email || 'User'"
            />
            <AvatarFallback class="text-xl">
              {{ (username || user?.email || "U").charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle class="text-xl">
              {{ username || user?.email }}
            </CardTitle>
            <CardDescription>
              {{ t("user.profile.memberSince") }}
              {{
                new Date(user?.created_at || Date.now()).toLocaleDateString()
              }}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>

    <!-- Quick Stats -->
    <div class="mb-8 grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>{{ t("user.stats.totalGames") }}</CardDescription>
          <CardTitle class="text-3xl">{{ stats.totalGames }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>{{ t("user.stats.wins") }}</CardDescription>
          <CardTitle class="text-3xl text-green-500">{{
            stats.wins
          }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>{{ t("user.stats.losses") }}</CardDescription>
          <CardTitle class="text-3xl text-red-500">{{
            stats.losses
          }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>{{ t("user.stats.winRate") }}</CardDescription>
          <CardTitle class="text-3xl">{{ stats.winRate }}%</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <!-- Role Performance -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle>{{ t("user.stats.rolePerformance") }}</CardTitle>
        <CardDescription>
          {{ t("user.stats.rolePerformanceDescription") }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <!-- Innocent -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-blue-500" />
                <span class="font-medium">{{ t("game.roles.innocent") }}</span>
              </div>
              <span class="text-muted-foreground">
                {{ stats.innocentWins }}/{{ stats.gamesAsInnocent }}
                {{ t("user.stats.winsGames") }}
              </span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full bg-blue-500 transition-all"
                :style="{
                  width: `${(stats.innocentWins / stats.gamesAsInnocent) * 100}%`,
                }"
              />
            </div>
          </div>

          <!-- Imposter -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-red-500" />
                <span class="font-medium">{{ t("game.roles.imposter") }}</span>
              </div>
              <span class="text-muted-foreground">
                {{ stats.imposterWins }}/{{ stats.gamesAsImposter }}
                {{ t("user.stats.winsGames") }}
              </span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full bg-red-500 transition-all"
                :style="{
                  width: `${(stats.imposterWins / stats.gamesAsImposter) * 100}%`,
                }"
              />
            </div>
          </div>

          <!-- Mr. White -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-gray-400" />
                <span class="font-medium">{{ t("game.roles.mrWhite") }}</span>
              </div>
              <span class="text-muted-foreground">
                {{ stats.mrWhiteWins }}/{{ stats.gamesAsMrWhite }}
                {{ t("user.stats.winsGames") }}
              </span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full bg-gray-400 transition-all"
                :style="{
                  width: `${(stats.mrWhiteWins / stats.gamesAsMrWhite) * 100}%`,
                }"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Additional Stats -->
    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>{{ t("user.stats.avgDuration") }}</CardDescription>
          <CardTitle class="text-2xl">{{
            stats.averageGameDuration
          }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>{{ t("user.stats.longestStreak") }}</CardDescription>
          <CardTitle class="text-2xl">
            {{ stats.longestWinStreak }} {{ t("user.stats.games") }}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>{{ t("user.stats.currentStreak") }}</CardDescription>
          <CardTitle class="text-2xl">
            {{ stats.currentStreak }} {{ t("user.stats.games") }}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>

    <!-- View History Link -->
    <div class="mt-8 text-center">
      <NuxtLinkLocale to="profile-history">
        <Button variant="outline">
          {{ t("user.profile.viewHistory") }}
        </Button>
      </NuxtLinkLocale>
    </div>
  </div>
</template>
