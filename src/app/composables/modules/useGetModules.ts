import type { NuxtModulesRoot } from "~/types/nuxt-modules";

export function useGetModules() {
  return useAPI<NuxtModulesRoot>("modules", {
    method: "GET",
  });
}
