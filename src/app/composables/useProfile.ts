import { jwtDecode } from "jwt-decode";
import type { Database } from "~/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Enums"]["app_role"];

// JWT payload with custom claims from custom_access_token_hook
interface JwtPayload {
  user_role?: UserRole;
  sub?: string;
  exp?: number;
}

/**
 * Composable to fetch and manage the current user's profile from the database.
 * The role is extracted from the JWT token (set by custom_access_token_hook).
 * This should be used instead of accessing user_metadata directly.
 */
export function useProfile() {
  const user = useSupabaseUser();
  const supabase = useSupabaseClient<Database>();

  const profile = ref<Profile | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Store the decoded role from JWT
  const jwtRole = ref<UserRole>("user");
  const roleLoaded = ref(false);

  /**
   * Decode JWT and extract user_role claim
   * Called when auth state changes
   */
  async function decodeJwtRole() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const decoded = jwtDecode<JwtPayload>(session.access_token);
        jwtRole.value = decoded.user_role ?? "user";
      } else {
        jwtRole.value = "user";
      }
    } catch (err) {
      console.error("Failed to decode JWT:", err);
      jwtRole.value = "user";
    } finally {
      roleLoaded.value = true;
    }
  }

  /**
   * Ensure the role has been loaded from JWT.
   * Use this in middleware to wait for role initialization.
   */
  async function ensureRoleLoaded(): Promise<UserRole> {
    if (!roleLoaded.value) {
      await decodeJwtRole();
    }
    return jwtRole.value;
  }

  // Computed properties for easy access
  const role = computed<UserRole>(() => jwtRole.value);
  const username = computed(() => profile.value?.username ?? null);
  const avatarUrl = computed(() => profile.value?.avatar_url ?? null);
  const isAdmin = computed(() => role.value === "admin");
  const isAuthenticated = computed(() => !!user.value);

  /**
   * Fetch the current user's profile from the database
   */
  async function fetchProfile() {
    if (!user.value) {
      profile.value = null;
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.value.sub)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      profile.value = data;
      return profile.value;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch profile";
      console.error("Failed to fetch profile:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update the current user's profile
   */
  async function updateProfile(
    updates: Partial<Pick<Profile, "username" | "avatar_url">>,
  ) {
    if (!user.value) {
      throw new Error("User not authenticated");
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.value.sub)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state
      if (profile.value && data) {
        profile.value = {
          ...profile.value,
          ...data,
        };
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update profile";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Auto-fetch profile and decode JWT when user changes
  watch(
    user,
    async (newUser) => {
      if (newUser) {
        await Promise.all([fetchProfile(), decodeJwtRole()]);
      } else {
        profile.value = null;
        jwtRole.value = "user";
      }
    },
    { immediate: true },
  );

  // Listen for auth state changes to update the role (only in component context)
  if (getCurrentInstance()) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.access_token) {
        try {
          const decoded = jwtDecode<JwtPayload>(session.access_token);
          jwtRole.value = decoded.user_role ?? "user";
        } catch {
          jwtRole.value = "user";
        }
      }
    });

    // Cleanup subscription on unmount
    onUnmounted(() => {
      subscription.unsubscribe();
    });
  }

  return {
    // State
    profile: readonly(profile),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    username,
    avatarUrl,
    role,
    isAdmin,
    isAuthenticated,

    // Actions
    fetchProfile,
    updateProfile,
    ensureRoleLoaded,
  };
}
