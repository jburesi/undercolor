import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: "src/app",
  serverDir: "src/server",
  dir: {
    public: "src/public",
    modules: "src/modules",
    shared: "src/shared",
  },
  experimental: {
    typedPages: true,
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/icon",
    "@vee-validate/nuxt",
    "@vueuse/nuxt",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxtjs/supabase",
    "@nuxtjs/i18n",
    "@nuxtjs/seo",
  ],
  colorMode: {
    classSuffix: "",
  },
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "@lucide/vue",
        "class-variance-authority",
        "jwt-decode",
        "clsx",
        "reka-ui",
        "tailwind-merge",
        "vue-sonner",
        "zod",
      ],
    },
  },
  shadcn: {
    prefix: "",
  },
  supabase: {
    redirect: false,
    // Note: Auto-redirects are disabled. Authentication is handled via custom middleware.
    // The auth.ts middleware protects routes that require login.
    // The admin.ts middleware protects admin-only routes.
    types: fileURLToPath(
      new URL("./src/shared/types/database.types.ts", import.meta.url),
    ),
  },
  site: {
    name: "Undercolor",
    description:
      "A visual social deduction game. Find the imposter among you - everyone sees an image, but not everyone sees the same one!",
  },
  ogImage: {
    security: {
      strict: true,
    },
  },
  i18n: {
    strategy: "prefix",
    defaultLocale: "en",
    locales: [
      {
        code: "en",
        name: "English",
        file: "en.json",
      },
      {
        code: "fr",
        name: "Français",
        file: "fr.json",
      },
    ],
  },
});
