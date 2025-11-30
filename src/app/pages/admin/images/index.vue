<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: ["admin"],
});

const { t } = useI18n();
const localePath = useLocalePath();
const { $api } = useNuxtApp();

interface ImageSet {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  innocent_image_url: string;
  imposter_image_url: string;
  is_active: boolean;
  created_at: string;
}

// Fetch image sets from API
const { data, status, refresh } = await useAsyncData("admin-image-sets", () =>
  $api<{ imageSets: ImageSet[] }>("/admin/images"),
);

const imageSets = computed(() => data.value?.imageSets || []);
const isLoading = computed(() => status.value === "pending");

// Delete confirmation state
const deleteDialogOpen = ref(false);
const imageSetToDelete = ref<ImageSet | null>(null);
const isDeleting = ref(false);

const getDifficultyVariant = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "default";
    case "medium":
      return "secondary";
    case "hard":
      return "destructive";
    default:
      return "outline";
  }
};

const openDeleteDialog = (imageSet: ImageSet) => {
  imageSetToDelete.value = imageSet;
  deleteDialogOpen.value = true;
};

const handleDelete = async () => {
  if (!imageSetToDelete.value) return;

  isDeleting.value = true;

  try {
    await $api(`/admin/images/${imageSetToDelete.value.id}`, {
      method: "DELETE",
    });

    deleteDialogOpen.value = false;
    imageSetToDelete.value = null;

    // Refresh the list
    await refresh();
  } catch (err) {
    console.error("Failed to delete image set:", err);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div class="page-admin-images">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <Button variant="ghost" as-child class="mb-2">
            <NuxtLink :to="localePath('/admin')">
              <Icon name="lucide:arrow-left" class="size-4 mr-2" />
              {{ t("common.back") }}
            </NuxtLink>
          </Button>
          <h1 class="text-3xl font-bold">{{ t("admin.images.title") }}</h1>
          <p class="text-muted-foreground">
            {{ t("admin.images.description") }}
          </p>
        </div>
        <Button as-child>
          <NuxtLink :to="localePath('/admin/images/new')">
            <Icon name="lucide:plus" class="size-4 mr-2" />
            {{ t("admin.images.addSet") }}
          </NuxtLink>
        </Button>
      </div>

      <!-- Image Sets Grid -->
      <div v-if="isLoading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="n in 6" :key="n">
          <CardContent class="p-4">
            <Skeleton class="aspect-video w-full mb-4" />
            <Skeleton class="h-6 w-3/4 mb-2" />
            <Skeleton class="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>

      <div v-else-if="imageSets.length === 0" class="text-center py-12">
        <Icon
          name="lucide:image-off"
          class="size-16 mx-auto mb-4 text-muted-foreground opacity-50"
        />
        <h3 class="text-lg font-semibold mb-2">No image sets yet</h3>
        <p class="text-muted-foreground mb-4">
          Create your first image set to start games.
        </p>
        <Button as-child>
          <NuxtLink :to="localePath('/admin/images/new')">
            <Icon name="lucide:plus" class="size-4 mr-2" />
            {{ t("admin.images.addSet") }}
          </NuxtLink>
        </Button>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="imageSet in imageSets"
          :key="imageSet.id"
          class="overflow-hidden"
        >
          <CardContent class="p-0">
            <!-- Image previews -->
            <div class="grid grid-cols-2 gap-px bg-border">
              <div class="relative aspect-video bg-muted">
                <NuxtImg
                  :src="imageSet.innocent_image_url"
                  :alt="`${imageSet.name} - Innocent`"
                  class="w-full h-full object-cover"
                  format="webp"
                />
                <Badge class="absolute bottom-2 left-2" variant="secondary">
                  {{ t("admin.images.innocentImage") }}
                </Badge>
              </div>
              <div class="relative aspect-video bg-muted">
                <NuxtImg
                  :src="imageSet.imposter_image_url"
                  :alt="`${imageSet.name} - Imposter`"
                  class="w-full h-full object-cover"
                  format="webp"
                />
                <Badge class="absolute bottom-2 left-2" variant="destructive">
                  {{ t("admin.images.imposterImage") }}
                </Badge>
              </div>
            </div>

            <!-- Info -->
            <div class="p-4">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-semibold">{{ imageSet.name }}</h3>
                <Badge :variant="getDifficultyVariant(imageSet.difficulty)">
                  {{ imageSet.difficulty }}
                </Badge>
              </div>
              <p class="text-sm text-muted-foreground mb-4">
                {{ imageSet.category }}
              </p>

              <!-- Actions -->
              <div class="flex gap-2">
                <Button variant="outline" size="sm" class="flex-1" as-child>
                  <NuxtLink :to="localePath(`/admin/images/${imageSet.id}`)">
                    <Icon name="lucide:edit" class="size-4 mr-2" />
                    {{ t("common.edit") }}
                  </NuxtLink>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="openDeleteDialog(imageSet)"
                >
                  <Icon name="lucide:trash-2" class="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t("common.confirmDelete") }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{
              t("admin.images.deleteConfirm", { name: imageSetToDelete?.name })
            }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t("common.cancel") }}</AlertDialogCancel>
          <AlertDialogAction
            :disabled="isDeleting"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="handleDelete"
          >
            <Icon
              v-if="isDeleting"
              name="lucide:loader-2"
              class="size-4 mr-2 animate-spin"
            />
            {{ t("common.delete") }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
