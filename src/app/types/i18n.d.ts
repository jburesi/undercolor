/**
 * Type augmentation for @nuxtjs/i18n
 *
 * This extends the i18n types to allow string paths in localePath() and related functions.
 * The i18n module's strict typing requires route names, but we use paths for convenience.
 */

declare module "#i18n" {
  // Extend the localePath function to accept any string path
  interface LocalePathFunction {
    (route: string, locale?: string): string;
  }
}

// Allow string paths in localePath composable
declare module "@nuxtjs/i18n" {
  export function useLocalePath(): (route: string, locale?: string) => string;
}

export {};
