/**
 * useAdminImages - Composable for admin image sets management
 *
 * Handles:
 * - Fetching image sets
 * - Creating image sets
 * - Deleting image sets
 */

import { toast } from "vue-sonner";

export interface ImageSet {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  innocent_image_url: string;
  imposter_image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateImageSetData {
  name: string;
  category: string;
  difficulty: string;
  innocentImageUrl: string;
  imposterImageUrl: string;
}

export function useAdminImages() {
  const { $api } = useNuxtApp();
  const { t } = useI18n();

  const { data, status, refresh } = useAsyncData("admin-image-sets", () =>
    $api<{ imageSets: ImageSet[] }>("/api/admin/images"),
  );

  const imageSets = computed(() => data.value?.imageSets || []);
  const isLoading = computed(() => status.value === "pending");

  // Delete state
  const isDeleting = ref(false);

  /**
   * Delete an image set by ID
   */
  async function deleteImageSet(id: string): Promise<boolean> {
    isDeleting.value = true;
    try {
      await $api(`/api/admin/images/${id}`, { method: "DELETE" });
      await refresh();
      toast.success(t("admin.images.deleteSuccess"));
      return true;
    } catch (err) {
      console.error("Failed to delete image set:", err);
      toast.error(t("admin.images.deleteError"));
      return false;
    } finally {
      isDeleting.value = false;
    }
  }

  /**
   * Create a new image set
   */
  async function createImageSet(
    imageData: CreateImageSetData,
  ): Promise<boolean> {
    try {
      await $api("/api/admin/images", {
        method: "POST",
        body: imageData,
      });
      toast.success(t("admin.images.createSuccess"));
      return true;
    } catch (err) {
      console.error("Failed to create image set:", err);
      toast.error(t("admin.images.createError"));
      return false;
    }
  }

  return {
    imageSets,
    isLoading,
    isDeleting,
    refresh,
    deleteImageSet,
    createImageSet,
  };
}
