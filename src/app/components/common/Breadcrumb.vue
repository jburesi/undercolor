<script setup lang="ts">
const breadcrumbItems = useBreadcrumbItems();

const router = useRouter();

// Configuration du fil d'Ariane
const MAX_VISIBLE_ITEMS = 3; // Nombre maximal d'éléments à afficher sans réduction
const VISIBLE_ITEMS_START = 1; // Nombre d'éléments à garder au début
const VISIBLE_ITEMS_END = MAX_VISIBLE_ITEMS - VISIBLE_ITEMS_START; // Nombre d'éléments à garder à la fin

// Déterminer s'il faut afficher l'ellipsis
const shouldCollapse = computed(() => {
  return (
    breadcrumbItems.value && breadcrumbItems.value.length > MAX_VISIBLE_ITEMS
  );
});

// Vérifier si une route est valide
function isValidRoute(path: string | undefined) {
  try {
    if (!router.options.routes.find((route) => route.path === path)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Préparer les éléments à afficher
const items = computed(() => {
  if (!breadcrumbItems.value || breadcrumbItems.value.length === 0) {
    return [];
  }

  // Ajouter une propriété hasRoute pour chaque élément
  const itemsWithRouteCheck = breadcrumbItems.value.map((item) => ({
    ...item,
    hasRoute: isValidRoute(item.to),
  }));

  if (shouldCollapse.value) {
    // Si on a plus d'éléments que MAX_VISIBLE_ITEMS, on garde VISIBLE_ITEMS_START au début et VISIBLE_ITEMS_END à la fin
    const firstItems = itemsWithRouteCheck.slice(0, VISIBLE_ITEMS_START);
    const lastItems = itemsWithRouteCheck.slice(-VISIBLE_ITEMS_END);
    return [...firstItems, ...lastItems];
  }

  return itemsWithRouteCheck;
});
</script>

<template>
  <Breadcrumb v-if="items.length > 0">
    <BreadcrumbList>
      <!-- Éléments du début (jusqu'à VISIBLE_ITEMS_START) -->
      <template
        v-for="(item, index) in items.slice(
          0,
          shouldCollapse ? VISIBLE_ITEMS_START : items.length,
        )"
        :key="`start-${item.to || index}`"
      >
        <BreadcrumbSeparator v-if="index > 0" />
        <BreadcrumbItem>
          <!-- Dernier élément et pas de collapse = Page -->
          <BreadcrumbLink
            v-if="!shouldCollapse && index === items.length - 1"
            as-child
          >
            <BreadcrumbPage>{{ item.ariaLabel }}</BreadcrumbPage>
          </BreadcrumbLink>
          <!-- Si route valide = NuxtLink -->
          <BreadcrumbLink v-else-if="item.hasRoute" as-child>
            <NuxtLink :to="item.to">{{ item.ariaLabel }}</NuxtLink>
          </BreadcrumbLink>
          <!-- Si pas de route valide = Span -->
          <BreadcrumbLink v-else>
            {{ item.ariaLabel }}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </template>

      <!-- Ellipsis si nécessaire -->
      <template v-if="shouldCollapse">
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>

        <!-- Éléments de la fin (VISIBLE_ITEMS_END) -->
        <template
          v-for="(item, index) in items.slice(-VISIBLE_ITEMS_END)"
          :key="`end-${item.to || index}`"
        >
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <!-- Élément de fin qui n'est pas le dernier = Link -->
            <BreadcrumbLink
              v-if="index < VISIBLE_ITEMS_END - 1 && item.hasRoute"
              as-child
            >
              <NuxtLink :to="item.to">{{ item.ariaLabel }}</NuxtLink>
            </BreadcrumbLink>
            <!-- Dernier élément = Page -->
            <BreadcrumbPage v-else-if="index === VISIBLE_ITEMS_END - 1">
              {{ item.ariaLabel }}
            </BreadcrumbPage>
            <!-- Élément sans route valide = Texte -->
            <BreadcrumbLink v-else>
              {{ item.ariaLabel }}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </template>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
