/**
 * useJoinRoomForm - Composable for room join form logic
 *
 * Handles:
 * - Form state and validation
 * - Auto-fill from user profile
 * - Join room submission
 */

import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { joinRoomFormSchema } from "#shared/schemas";

export function useJoinRoomForm(
  joinRoomFn: (username: string) => Promise<unknown>,
) {
  const { t } = useI18n();
  const { username: profileUsername } = useProfile();

  // Form state
  const form = useForm({
    validationSchema: joinRoomFormSchema,
    initialValues: {
      username: "",
    },
  });

  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  // Auto-fill username from profile when available
  watch(
    profileUsername,
    (newUsername) => {
      if (newUsername && !form.values.username) {
        form.setFieldValue("username", newUsername);
      }
    },
    { immediate: true },
  );

  /**
   * Submit form and join room
   */
  const onSubmit = form.handleSubmit(async (formValues) => {
    isSubmitting.value = true;
    error.value = null;

    try {
      await joinRoomFn(formValues.username);
      toast.success(t("toast.roomJoined"));
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : "Failed to join room";
      toast.error(t("toast.errorJoinRoom"));
    } finally {
      isSubmitting.value = false;
    }
  });

  return {
    form,
    isSubmitting,
    error,
    onSubmit,
  };
}
