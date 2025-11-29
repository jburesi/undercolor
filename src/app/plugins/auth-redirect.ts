import type { Plugin } from "#app";
import {
  defineNuxtPlugin,
  addRouteMiddleware,
  defineNuxtRouteMiddleware,
  useRuntimeConfig,
  navigateTo,
} from "#imports";
import type { RouteLocationNormalized } from "#vue-router";

// Base on https://github.com/nuxt-modules/supabase/blob/main/src/runtime/plugins/auth-redirect.ts
export default defineNuxtPlugin({
  name: "auth-redirect",
  setup() {
    addRouteMiddleware(
      "global-auth",
      defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
        const config = useRuntimeConfig().public.supabase;
        const {
          login,
          callback,
          include,
          exclude,
          cookieRedirect,
          saveRedirectToCookie,
        } = config.redirectOptions;

        // Get current locale from i18n instance
        const { $i18n } = useNuxtApp();
        const currentLocale = $i18n.locale.value || $i18n.defaultLocale;

        // Helper function to add locale prefix to paths
        const withLocale = (path: string): string => {
          if (path.startsWith(`/${currentLocale}/`) || path === "/") {
            return path;
          }
          return `/${currentLocale}${path}`;
        };

        // Helper function to check if path matches pattern (with or without locale)
        const pathMatches = (pattern: string, targetPath: string): boolean => {
          // Create patterns for both localized and non-localized paths
          const patterns = [pattern];

          // Add localized version
          const localizedPattern = withLocale(pattern);
          if (localizedPattern !== pattern) {
            patterns.push(localizedPattern);
          }

          // Special handling for root path and locale-only paths
          if (pattern === "/") {
            // Root pattern should also match locale-only paths like /en, /fr
            patterns.push(...["/en", "/fr"]);
          }

          // For non-root patterns, also check if targetPath matches the pattern when stripped of locale
          if (pattern !== "/" && targetPath.match(/^\/[a-z]{2}(\/.*)?$/)) {
            const pathWithoutLocale =
              targetPath.replace(/^\/[a-z]{2}/, "") || "/";
            if (pattern === pathWithoutLocale) {
              return true;
            }
          }

          return patterns.some((p) => {
            const regex = new RegExp(`^${p.replace(/\*/g, ".*")}$`);
            return regex.test(targetPath);
          });
        };

        // Redirect only on included routes (if defined)
        if (include && include.length > 0) {
          const isIncluded = include.some((path: string) => {
            return pathMatches(path, to.path);
          });
          if (!isIncluded) {
            return;
          }
        }

        // Do not redirect on login route, callback route and excluded routes
        const isExcluded = [...(exclude ?? []), login, callback]?.some(
          (path) => {
            const matches = pathMatches(path, to.path);
            return matches;
          },
        );
        if (isExcluded) return;

        const session = useSupabaseSession();
        if (!session.value) {
          // Save current path to the redirect cookie if enabled
          if (cookieRedirect || saveRedirectToCookie) {
            const redirectInfo = useSupabaseCookieRedirect();
            redirectInfo.path.value = to.fullPath;
          }

          // Redirect to localized login page
          const localizedLogin = withLocale(login);
          return navigateTo(localizedLogin);
        }
      }),
      { global: true },
    );
  },
}) as Plugin;
