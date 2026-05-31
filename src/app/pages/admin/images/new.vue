<script setup lang="ts">
import { useForm } from "vee-validate";
import { imageSetFormSchema } from "#shared/schemas";
import { useAdminImages } from "~/composables/admin/useAdminImages";

definePageMeta({
  layout: "default",
  middleware: ["admin"],
});

const { t } = useI18n();
const { createImageSet } = useAdminImages();

const form = useForm({
  validationSchema: imageSetFormSchema,
  initialValues: {
    name: "",
    category: "",
    difficulty: "medium" as const,
  },
});

const { handleSubmit } = form;

const isCreating = ref(false);
const errorMessage = ref("");

// File upload refs
const innocentFile = ref<File | null>(null);
const imposterFile = ref<File | null>(null);
const innocentPreview = ref<string | null>(null);
const imposterPreview = ref<string | null>(null);

const categories = [
  "Nature",
  "Urban",
  "Animals",
  "Food",
  "Art",
  "Sports",
  "Technology",
  "Other",
];

const handleFileChange = (event: Event, type: "innocent" | "imposter") => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (type === "innocent") {
      innocentFile.value = file;
      innocentPreview.value = URL.createObjectURL(file);
    } else {
      imposterFile.value = file;
      imposterPreview.value = URL.createObjectURL(file);
    }
  }
};

const onSubmit = handleSubmit(async (formValues) => {
  if (!innocentFile.value || !imposterFile.value) {
    errorMessage.value = "Please upload both images";
    return;
  }

  isCreating.value = true;
  errorMessage.value = "";

  const supabase = useSupabaseClient();

  try {
    // Generate unique file names
    const timestamp = Date.now();
    const innocentPath = `image-sets/${timestamp}-innocent-${innocentFile.value.name}`;
    const imposterPath = `image-sets/${timestamp}-imposter-${imposterFile.value.name}`;

    // Upload innocent image
    const { error: innocentError } = await supabase.storage
      .from("game-images")
      .upload(innocentPath, innocentFile.value);

    if (innocentError) throw new Error("Failed to upload innocent image");

    // Upload imposter image
    const { error: imposterError } = await supabase.storage
      .from("game-images")
      .upload(imposterPath, imposterFile.value);

    if (imposterError) throw new Error("Failed to upload imposter image");

    // Get public URLs
    const { data: innocentUrl } = supabase.storage
      .from("game-images")
      .getPublicUrl(innocentPath);

    const { data: imposterUrl } = supabase.storage
      .from("game-images")
      .getPublicUrl(imposterPath);

    // Create image set via composable
    const success = await createImageSet({
      name: formValues.name,
      category: formValues.category,
      difficulty: formValues.difficulty,
      innocentImageUrl: innocentUrl.publicUrl,
      imposterImageUrl: imposterUrl.publicUrl,
    });

    if (success) {
      // Navigate back to image sets list
      await navigateTo("admin-images");
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t("common.error");
  } finally {
    isCreating.value = false;
  }
});
</script>

<template>
  <div class="page-admin-images-new">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Header -->
      <div class="mb-8">
        <Button variant="ghost" as-child class="mb-4">
          <NuxtLinkLocale to="admin-images">
            <Icon name="lucide:arrow-left" class="size-4 mr-2" />
            {{ t("common.back") }}
          </NuxtLinkLocale>
        </Button>
        <h1 class="text-3xl font-bold">{{ t("admin.images.addSet") }}</h1>
      </div>

      <Card>
        <CardContent class="pt-6">
          <form class="space-y-6" @submit="onSubmit">
            <!-- Error message -->
            <div
              v-if="errorMessage"
              class="p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
            >
              {{ errorMessage }}
            </div>

            <!-- Name -->
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Set Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Beach Sunset"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Category -->
            <FormField v-slot="{ componentField }" name="category">
              <FormItem>
                <FormLabel>{{ t("admin.images.category") }}</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="cat in categories"
                        :key="cat"
                        :value="cat"
                      >
                        {{ cat }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Difficulty -->
            <FormField v-slot="{ componentField }" name="difficulty">
              <FormItem>
                <FormLabel>{{ t("admin.images.difficulty") }}</FormLabel>
                <FormControl>
                  <RadioGroup class="flex gap-4" v-bind="componentField">
                    <div
                      v-for="diff in ['easy', 'medium', 'hard']"
                      :key="diff"
                      class="flex items-center gap-2"
                    >
                      <RadioGroupItem
                        :id="`difficulty-${diff}`"
                        :value="diff"
                      />
                      <Label
                        :for="`difficulty-${diff}`"
                        class="capitalize cursor-pointer"
                      >
                        {{ diff }}
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Image Uploads -->
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Innocent Image -->
              <div class="space-y-2">
                <label class="text-sm font-medium">
                  {{ t("admin.images.innocentImage") }}
                </label>
                <div
                  class="relative aspect-video border-2 border-dashed rounded-lg overflow-hidden transition-colors"
                  :class="
                    innocentPreview
                      ? 'border-green-500'
                      : 'border-border hover:border-muted-foreground'
                  "
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @change="(e) => handleFileChange(e, 'innocent')"
                  />
                  <div v-if="innocentPreview" class="w-full h-full">
                    <img
                      :src="innocentPreview"
                      alt="Innocent preview"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    v-else
                    class="flex flex-col items-center justify-center h-full text-muted-foreground"
                  >
                    <Icon name="lucide:upload" class="size-8 mb-2" />
                    <span class="text-sm">Upload innocent image</span>
                  </div>
                </div>
              </div>

              <!-- Imposter Image -->
              <div class="space-y-2">
                <label class="text-sm font-medium">
                  {{ t("admin.images.imposterImage") }}
                </label>
                <div
                  class="relative aspect-video border-2 border-dashed rounded-lg overflow-hidden transition-colors"
                  :class="
                    imposterPreview
                      ? 'border-red-500'
                      : 'border-border hover:border-muted-foreground'
                  "
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @change="(e) => handleFileChange(e, 'imposter')"
                  />
                  <div v-if="imposterPreview" class="w-full h-full">
                    <img
                      :src="imposterPreview"
                      alt="Imposter preview"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    v-else
                    class="flex flex-col items-center justify-center h-full text-muted-foreground"
                  >
                    <Icon name="lucide:upload" class="size-8 mb-2" />
                    <span class="text-sm">Upload imposter image</span>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-xs text-muted-foreground">
              Tip: Choose images that are similar but have subtle differences.
              This makes the game more challenging and fun!
            </p>

            <Button type="submit" class="w-full" :disabled="isCreating">
              <Icon
                v-if="isCreating"
                name="lucide:loader-2"
                class="size-4 mr-2 animate-spin"
              />
              <Icon v-else name="lucide:save" class="size-4 mr-2" />
              {{ t("common.save") }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
