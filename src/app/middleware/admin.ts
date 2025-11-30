export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser();
  const localePath = useLocalePath();

  // If user is not authenticated, redirect to login
  if (!user.value) {
    return navigateTo(localePath("login"), { replace: true });
  }

  // Check if user has admin role
  const isAdmin = user.value.user_metadata?.role === "admin";

  if (!isAdmin) {
    // Non-admin users cannot access admin routes
    return navigateTo(localePath("index"), { replace: true });
  }
});
