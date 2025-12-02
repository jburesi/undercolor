export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser();
  const localePath = useLocalePath();
  const { ensureRoleLoaded } = useProfile();

  // If user is not authenticated, redirect to login
  if (!user.value) {
    return navigateTo(localePath("login"), { replace: true });
  }

  // Wait for role to be loaded and check if admin
  const role = await ensureRoleLoaded();

  if (role !== "admin") {
    // Non-admin users cannot access admin routes
    return navigateTo(localePath("index"), { replace: true });
  }
});
