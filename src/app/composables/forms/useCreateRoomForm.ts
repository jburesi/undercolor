/**
 * useCreateRoomForm - Composable for room creation form logic
 *
 * Handles:
 * - Form state and validation
 * - Auto-fill from user profile
 * - Room creation API call
 * - Session storage
 * - Navigation after creation
 */

import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { DEFAULT_GAME_CONFIG } from "#shared/types/game.types";
import { createRoomFormSchema } from "#shared/schemas";
import { useGameSession, type GameSession } from "../game/useGameSession";

interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  hostId: string;
  sessionId: string;
}

export function useCreateRoomForm() {
  const { t } = useI18n();
  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const { username: profileUsername } = useProfile();
  const { saveSession } = useGameSession();

  // Form state
  const form = useForm({
    validationSchema: createRoomFormSchema,
    initialValues: {
      hostUsername: "",
      isPublic: true,
      observationTime: DEFAULT_GAME_CONFIG.observationTime,
      debateTime: DEFAULT_GAME_CONFIG.debateTime,
      votingTime: DEFAULT_GAME_CONFIG.votingTime,
      maxPlayers: DEFAULT_GAME_CONFIG.maxPlayers,
    },
  });

  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  // Auto-fill username from profile when available
  watch(
    profileUsername,
    (newUsername) => {
      if (newUsername && !form.values.hostUsername) {
        form.setFieldValue("hostUsername", newUsername);
      }
    },
    { immediate: true },
  );

  /**
   * Submit form and create room
   */
  const onSubmit = form.handleSubmit(async (formValues) => {
    isSubmitting.value = true;
    error.value = null;

    try {
      const response = await $api<CreateRoomResponse>("/api/rooms", {
        method: "POST",
        body: {
          hostUsername: formValues.hostUsername,
          isPublic: formValues.isPublic,
          config: {
            observationTime: formValues.observationTime,
            debateTime: formValues.debateTime,
            votingTime: formValues.votingTime,
            maxPlayers: formValues.maxPlayers,
          },
        },
      });

      // Store session
      const newSession: GameSession = {
        roomId: response.roomId,
        roomCode: response.roomCode,
        playerId: response.hostId,
        sessionId: response.sessionId,
      };
      saveSession(newSession);

      toast.success(t("toast.roomCreated"));

      // Navigate to room
      await navigateTo(
        localePath({ name: "rooms-code", params: { code: response.roomCode } }),
      );
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Failed to create room";
      toast.error(t("toast.errorCreateRoom"));
    } finally {
      isSubmitting.value = false;
    }
  });

  /**
   * Reset form to initial values
   */
  function resetForm() {
    form.resetForm();
    error.value = null;
  }

  return {
    // Form instance (for template bindings)
    form,

    // State
    isSubmitting: readonly(isSubmitting),
    error: readonly(error),

    // Actions
    onSubmit,
    resetForm,
  };
}
