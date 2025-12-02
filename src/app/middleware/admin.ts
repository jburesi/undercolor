export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser();
  const localePath = useLocalePath();
  const { isAdmin } = useProfile();

  // If user is not authenticated, redirect to login
  if (!user.value) {
    return navigateTo(localePath("login"), { replace: true });
  }

  // Check if user has admin role
  if (!isAdmin.value) {
    // Non-admin users cannot access admin routes
    return navigateTo(localePath("index"), { replace: true });
  }
});
