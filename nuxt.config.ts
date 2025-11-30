import tailwindcss from "@tailwindcss/vite";

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
    // Disabled because it conflicts with @nuxtjs/i18n's localePath
    // typedPages: true,
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
  },
  shadcn: {
    prefix: "",
    componentDir: "./src/app/components/ui",
  },
  supabase: {
    redirect: false,
    // Note: Auto-redirects are disabled. Authentication is handled via custom middleware.
    // The auth.ts middleware protects routes that require login.
    // The admin.ts middleware protects admin-only routes.
  },
  site: {
    name: "Undercolor",
    description:
      "A visual social deduction game. Find the imposter among you - everyone sees an image, but not everyone sees the same one!",
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
