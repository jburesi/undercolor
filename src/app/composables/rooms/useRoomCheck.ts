/**
 * useRoomCheck - Composable for checking if a room exists
 *
 * Handles:
 * - Room existence validation
 */

export function useRoomCheck() {
  const { $api } = useNuxtApp();

  /**
   * Check if a room exists by code
   */
  async function checkRoomExists(code: string): Promise<boolean> {
    try {
      await $api(`/api/rooms/${code.toUpperCase()}`);
      return true;
    } catch {
      return false;
    }
  }

  return { checkRoomExists };
}
