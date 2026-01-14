<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <div
          class="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <Icon name="lucide:door-open" class="size-8 text-primary" />
        </div>
        <h1 class="text-4xl font-bold mb-4">{{ t("rooms.join") }}</h1>
        <p class="text-lg text-muted-foreground max-w-md mx-auto">
          {{ t("rooms.joinDescription") }}
        </p>
      </div>

      <!-- Join Card -->
      <div class="mb-8">
        <RoomsJoinCard />
      </div>

      <!-- Divider -->
      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">
            {{ t("common.or") }}
          </span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid gap-4 sm:grid-cols-2">
        <Card class="flex flex-col">
          <CardHeader class="flex-1">
            <CardTitle class="flex items-center gap-2 text-base">
              <Icon name="lucide:list" class="size-5" />
              {{ t("rooms.publicRooms") }}
            </CardTitle>
            <CardDescription>
              {{ t("rooms.browsePublicRooms") }}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button as-child variant="outline" class="w-full">
              <NuxtLinkLocale to="rooms">
                <Icon name="lucide:search" class="size-4 mr-2" />
                {{ t("common.browse") }}
              </NuxtLinkLocale>
            </Button>
          </CardFooter>
        </Card>

        <Card class="flex flex-col">
          <CardHeader class="flex-1">
            <CardTitle class="flex items-center gap-2 text-base">
              <Icon name="lucide:plus" class="size-5" />
              {{ t("rooms.createOwn") }}
            </CardTitle>
            <CardDescription>
              {{ t("rooms.createDescription") }}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button as-child class="w-full">
              <NuxtLinkLocale to="rooms-create">
                <Icon name="lucide:plus" class="size-4 mr-2" />
                {{ t("rooms.create") }}
              </NuxtLinkLocale>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>
