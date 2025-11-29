export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute();
  const getRouteBaseName = useRouteBaseName();

  // Access i18n from nuxtApp context
  const i18n = nuxtApp.$i18n as ReturnType<typeof useI18n>;

  // Watch route changes and update SEO meta automatically
  watch(
    () => route.path,
    () => {
      const pageTitle = generatePageTitle(
        route,
        i18n.t,
        i18n.te,
        getRouteBaseName,
      );

      if (!pageTitle) return;

      // Apply SEO meta
      useSeoMeta({
        title: pageTitle,
      });
    },
    { immediate: true },
  );
});
