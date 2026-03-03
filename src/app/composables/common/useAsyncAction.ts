/**
 * useAsyncAction - Composable for wrapping async operations with loading/error state
 *
 * Provides a standardized way to handle:
 * - Loading state management
 * - Error handling
 * - Toast notifications
 */

import { toast } from "vue-sonner";

interface AsyncActionOptions {
  /** Toast message on success */
  successMessage?: string;
  /** Toast message on error (uses error.message if not provided) */
  errorMessage?: string;
  /** Whether to show error toast (default: true) */
  showErrorToast?: boolean;
  /** Whether to show success toast (default: true if successMessage provided) */
  showSuccessToast?: boolean;
  /** Whether to rethrow the error after handling (default: false) */
  rethrow?: boolean;
}

/**
 * Wrap an async action with loading state and error handling
 *
 * @example
 * ```ts
 * const { execute: submitForm, isLoading, error } = useAsyncAction(
 *   async (data: FormData) => {
 *     await api.submit(data)
 *   },
 *   { successMessage: 'Form submitted!' }
 * )
 *
 * // In template: @submit="submitForm(formData)"
 * ```
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options: AsyncActionOptions = {},
) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function execute(...args: TArgs): Promise<TResult | undefined> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await action(...args);

      if (
        options.successMessage &&
        (options.showSuccessToast ?? !!options.successMessage)
      ) {
        toast.success(options.successMessage);
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      error.value = errorMsg;

      if (options.showErrorToast !== false) {
        toast.error(options.errorMessage || errorMsg);
      }

      if (options.rethrow) {
        throw err;
      }

      return undefined;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Reset error state
   */
  function resetError() {
    error.value = null;
  }

  return {
    execute,
    isLoading: readonly(isLoading),
    error: readonly(error),
    resetError,
  };
}
