<script setup lang="ts">
import * as z from "zod";
import { useGetModules } from "~/composables/modules/useGetModules";

const { data, error } = useGetModules();

// Formulaire de recherche de modules
const formSchema = z.object({
  username: z
    .string({ message: "Le nom d'utilisateur est requis" })
    .min(2, "Le nom d'utilisateur doit contenir au moins 2 caractères")
    .max(50, "Le nom d'utilisateur ne peut pas dépasser 50 caractères"),
  email: z
    .string({ message: "L'email est requis" })
    .email("Veuillez entrer une adresse email valide"),
  moduleName: z
    .string({ message: "Le nom du module est requis" })
    .min(1, "Le nom du module est requis")
    .max(100, "Le nom du module ne peut pas dépasser 100 caractères"),
});

const validationSchema = toTypedSchema(formSchema);

const onSubmit = (values: Record<string, unknown>) => {
  console.log("Formulaire soumis !", values);

  // Les valeurs sont typées grâce au schema de validation
  const typedValues = values as z.infer<typeof formSchema>;
  console.log("Valeurs typées:", typedValues);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="space-y-2">
      <h1 class="text-2xl font-bold tracking-tight">Modules Explorer</h1>
      <p class="text-muted-foreground">
        Découvrez et explorez l'écosystème des modules Nuxt
      </p>
    </div>

    <!-- Formulaire de soumission de module -->
    <Card>
      <CardHeader>
        <CardTitle>Proposer un nouveau module</CardTitle>
        <CardDescription>
          Soumettez votre module Nuxt pour qu'il soit ajouté à l'écosystème
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          v-slot="{ meta }"
          :validation-schema="validationSchema"
          class="space-y-6"
          @submit="onSubmit"
        >
          <FormField v-slot="{ componentField }" name="username">
            <FormItem>
              <FormLabel>Nom d'utilisateur</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="votre-nom-utilisateur"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                Votre nom d'utilisateur GitHub ou nom d'affichage public.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="votre.email@example.com"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                Votre adresse email pour les notifications (non publique).
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="moduleName">
            <FormItem>
              <FormLabel>Nom du module</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="@nuxt/mon-super-module"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                Le nom complet de votre module Nuxt (ex: @nuxt/content,
                nuxt-tailwindcss).
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button type="submit" class="w-full" :disabled="!meta.valid">
            <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
            Soumettre le module
          </Button>
        </Form>
      </CardContent>
    </Card>

    <!-- Loading State -->
    <div v-if="!data && !error" class="space-y-4">
      <div v-for="i in 3" :key="i" class="w-full">
        <Card>
          <CardHeader>
            <Skeleton class="h-6 w-3/4" />
            <Skeleton class="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton class="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center p-8">
      <Card class="w-full max-w-md">
        <CardContent class="flex items-center space-x-4 p-6">
          <Icon name="lucide:alert-circle" class="h-8 w-8 text-red-500" />
          <div>
            <h3 class="font-semibold text-red-700 dark:text-red-400">Erreur</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Erreur lors du chargement des modules.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modules List -->
    <div
      v-else-if="data?.modules"
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <Card v-for="mod in data.modules" :key="mod.name" class="h-fit">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <NuxtImg
                v-if="mod.icon"
                :src="`https://raw.githubusercontent.com/nuxt/modules/main/icons/${mod.icon}`"
                :alt="`${mod.name} icon`"
                class="h-10 w-10 rounded-lg"
              />
              <div>
                <CardTitle class="text-lg">{{ mod.name }}</CardTitle>
                <Badge variant="secondary" class="mt-1">{{
                  mod.category
                }}</Badge>
              </div>
            </div>
          </div>
          <CardDescription class="line-clamp-3">
            {{ mod.description }}
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-4">
          <!-- Stats -->
          <div
            class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
          >
            <div class="flex items-center space-x-1">
              <Icon name="lucide:download" class="h-4 w-4" />
              <span>{{ mod.stats?.downloads?.toLocaleString() || "N/A" }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <Icon name="lucide:star" class="h-4 w-4" />
              <span>{{ mod.stats?.stars?.toLocaleString() || "N/A" }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <Icon name="lucide:git-fork" class="h-4 w-4" />
              <span>{{ mod.stats?.forks?.toLocaleString() || "N/A" }}</span>
            </div>
          </div>

          <!-- Version and Compatibility -->
          <div class="flex flex-wrap gap-2">
            <Badge v-if="mod.stats?.version" variant="outline">
              v{{ mod.stats.version }}
            </Badge>
            <Badge v-if="mod.compatibility?.nuxt" variant="outline">
              Nuxt {{ mod.compatibility.nuxt }}
            </Badge>
            <Badge variant="outline">{{ mod.type }}</Badge>
          </div>

          <!-- Links -->
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" as-child>
              <NuxtLinkLocale
                :to="`https://www.npmjs.com/package/${mod.npm}`"
                external
              >
                <Icon name="lucide:external-link" class="h-3 w-3 mr-1" />
                NPM
              </NuxtLinkLocale>
            </Button>
            <Button v-if="mod.github" variant="outline" size="sm" as-child>
              <NuxtLinkLocale :to="mod.github" external>
                <Icon name="lucide:external-link" class="h-3 w-3 mr-1" />
                GitHub
              </NuxtLinkLocale>
            </Button>
            <Button v-if="mod.website" variant="outline" size="sm" as-child>
              <NuxtLinkLocale :to="mod.website" external>
                <Icon name="lucide:external-link" class="h-3 w-3 mr-1" />
                Site
              </NuxtLinkLocale>
            </Button>
          </div>

          <!-- Maintainers -->
          <div v-if="mod.maintainers?.length" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mainteneurs
            </h4>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="maintainer in mod.maintainers.slice(0, 3)"
                :key="maintainer.github"
                class="flex items-center space-x-2"
              >
                <Avatar class="h-6 w-6">
                  <AvatarImage
                    :src="maintainer.avatar || ''"
                    :alt="maintainer.name"
                  />
                  <AvatarFallback>{{
                    maintainer.name?.[0] || "M"
                  }}</AvatarFallback>
                </Avatar>
                <NuxtLinkLocale
                  :to="`https://github.com/${maintainer.github}`"
                  external
                  class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {{ maintainer.name }}
                </NuxtLinkLocale>
              </div>
              <span
                v-if="mod.maintainers.length > 3"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                +{{ mod.maintainers.length - 3 }} autres
              </span>
            </div>
          </div>

          <!-- Top Contributors -->
          <div v-if="mod.contributors?.length" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contributeurs principaux
            </h4>
            <div class="flex flex-wrap gap-1">
              <Badge
                v-for="contributor in mod.contributors.slice(0, 3)"
                :key="contributor.id"
                variant="secondary"
                class="text-xs"
              >
                {{ contributor.username }} ({{ contributor.contributions }})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
