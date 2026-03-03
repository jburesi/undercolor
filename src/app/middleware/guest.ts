export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser();

  // If user is already logged in, redirect to home
  if (user.value) {
    return navigateTo("/", { replace: true });
  }
});
