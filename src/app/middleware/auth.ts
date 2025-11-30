export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser();
  const localePath = useLocalePath();

  // If user is not authenticated, redirect to login
  if (!user.value) {
    return navigateTo(localePath({ path: "/login" }), { replace: true });
  }
});
