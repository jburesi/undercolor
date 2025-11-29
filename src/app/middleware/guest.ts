export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser();

  // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
  if (user.value) {
    return navigateTo("/", { replace: true });
  }
});
