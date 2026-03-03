/**
 * useClipboard - Composable for clipboard operations with toast feedback
 */

import { toast } from "vue-sonner";

export function useClipboard() {
  const { t } = useI18n();

  const isSupported = computed(
    () => import.meta.client && navigator?.clipboard !== undefined,
  );

  /**
   * Copy text to clipboard with optional toast feedback
   */
  async function copy(
    text: string,
    options?: {
      showToast?: boolean;
      successMessage?: string;
    },
  ) {
    if (!isSupported.value) {
      console.warn("Clipboard API not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);

      if (options?.showToast !== false) {
        toast.success(options?.successMessage || t("toast.codeCopied"));
      }

      return true;
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error(t("toast.errorCopy"));
      return false;
    }
  }

  /**
   * Copy room code specifically (convenience method)
   */
  async function copyRoomCode(code: string) {
    return copy(code, {
      showToast: true,
      successMessage: t("toast.codeCopied"),
    });
  }

  return {
    isSupported,
    copy,
    copyRoomCode,
  };
}
