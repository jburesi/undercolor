/**
 * usePublicRooms - Composable for public rooms listing
 *
 * Handles:
 * - Fetching public rooms from API
 * - Auto-refresh functionality
 * - Loading state
 */

import { TIMING } from "~/constants/game";

export interface PublicRoom {
  roomId: string;
  roomCode: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: string;
}

export function usePublicRooms() {
  const { $api } = useNuxtApp();

  const { data, status, refresh } = useAsyncData("public-rooms", () =>
    $api<{ rooms: PublicRoom[] }>("/api/rooms"),
  );

  const rooms = computed(() => data.value?.rooms || []);
  const isLoading = computed(() => status.value === "pending");

  // Auto-refresh interval
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  function startAutoRefresh(intervalMs = TIMING.PUBLIC_ROOMS_REFRESH_MS) {
    stopAutoRefresh();
    refreshInterval = setInterval(() => refresh(), intervalMs);
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  onMounted(() => startAutoRefresh());
  onUnmounted(() => stopAutoRefresh());

  return {
    rooms,
    isLoading,
    refresh,
  };
}
