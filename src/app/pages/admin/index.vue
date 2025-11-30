<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: ["admin"],
});

const { t } = useI18n();

// Mock stats
const stats = ref({
  imageSets: 12,
  totalGames: 156,
  activePlayers: 24,
});
</script>

<template>
  <div class="page-admin">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold">{{ t("admin.dashboard.title") }}</h1>
        <p class="text-muted-foreground">
          {{ t("admin.dashboard.welcome") }}
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              Image Sets
            </CardTitle>
            <Icon name="lucide:images" class="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.imageSets }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              Total Games
            </CardTitle>
            <Icon
              name="lucide:gamepad-2"
              class="size-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.totalGames }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              Active Players
            </CardTitle>
            <Icon name="lucide:users" class="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.activePlayers }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-4">
            <Button as-child>
              <NuxtLinkLocale to="admin-images">
                <Icon name="lucide:images" class="size-4 mr-2" />
                {{ t("admin.images.title") }}
              </NuxtLinkLocale>
            </Button>
            <Button variant="outline" as-child>
              <NuxtLinkLocale to="admin-images-new">
                <Icon name="lucide:plus" class="size-4 mr-2" />
                {{ t("admin.images.addSet") }}
              </NuxtLinkLocale>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
