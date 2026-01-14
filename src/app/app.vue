<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "vue-sonner/style.css";

const colorMode = useColorMode();

// Computed pour déterminer le thème du Toaster
const toasterTheme = computed(() => {
  // Si on ne connaît pas encore le color mode (SSR/Generate)
  if (colorMode.unknown) {
    return "light"; // Fallback par défaut
  }

  // Si le mode système est forcé ou si la préférence est 'system'
  if (colorMode.preference === "system") {
    return colorMode.value === "dark" ? "dark" : "light";
  }

  // Sinon utiliser directement la préférence
  return colorMode.preference === "dark" ? "dark" : "light";
});
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster rich-colors :theme="toasterTheme" position="bottom-right" />
  </TooltipProvider>
</template>
