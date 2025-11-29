import type { RouteLocationNormalizedLoaded } from "#vue-router";

/**
 * Generates page title from breadcrumb translations or route metadata
 *
 * @param route - Current route object
 * @param t - Translation function from useI18n
 * @param te - Translation exists check function from useI18n
 * @param getRouteBaseName - Function to get route base name without locale prefix
 * @returns Generated page title
 */
export function generatePageTitle(
  route: RouteLocationNormalizedLoaded,
  t: (key: string) => string,
  te: (key: string) => boolean,
  getRouteBaseName: (
    route: RouteLocationNormalizedLoaded,
  ) => string | undefined,
): string {
  const baseName = getRouteBaseName(route) || "index";
  const translationKey = `breadcrumb.items.${baseName}.ariaLabel`;

  console.log("Generating page title for route:", route.path);

  // Check if translation exists
  if (te(translationKey)) {
    return t(translationKey);
  }

  // Fallback to page meta title if exists
  if (route.meta.title) {
    return route.meta.title as string;
  }

  // Ultimate fallback: get last segment of route path and capitalize
  const pathSegments = route.path.split("/").filter(Boolean);

  // If no segments or only one segment (root route with locale), use "index"
  if (pathSegments.length === 0 || pathSegments.length === 1) {
    return "Index";
  }

  // Get the last meaningful segment
  const lastSegment = pathSegments[pathSegments.length - 1];

  return lastSegment
    ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    : "Index";
}
