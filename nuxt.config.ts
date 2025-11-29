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
  },
  shadcn: {
    prefix: "",
    componentDir: "./src/app/components/ui",
  },
  supabase: {
    redirect: false,
    // Note: Supabase auto-redirects don't handle i18n properly.
    // Either use "prefix_except_default" strategy or disable auto-redirects and use custom middleware.
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: ["*"],
      exclude: ["/register", "/confirm", "/login", "/"],
      saveRedirectToCookie: true,
    },
  },
  site: {
    name: "Nuxt Modules",
    description: "A modern Nuxt Modules checker platform",
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
