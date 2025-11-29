/**
 * Returns the current page title from breadcrumb translations
 * Falls back to page meta title if translation doesn't exist
 *
 * Note: Page titles are automatically set via plugin/page-title.ts
 * This composable is available for manual use in templates or custom logic
 *
 * @returns Computed ref with page title
 *
 * @example
 * ```vue
 * <template>
 *   <h1>{{ pageTitle }}</h1>
 * </template>
 *
 * <script setup>
 * const pageTitle = usePageTitle();
 * </script>
 * ```
 */
export const usePageTitle = () => {
  const { t, te } = useI18n();
  const route = useRoute();
  const getRouteBaseName = useRouteBaseName();

  return computed(() => generatePageTitle(route, t, te, getRouteBaseName));
};
