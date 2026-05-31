/**
 * useGamePresence - Composable for real-time presence and subscriptions
 *
 * Handles:
 * - Supabase Realtime channel management
 * - Presence tracking for online status
 * - Connection status heartbeat
 * - Room and player change subscriptions
 */

import type { GameState, PlayerRole } from "#shared/types/game.types";
import type { RoomPlayer, RoomData } from "./useRoomData";
import { TIMING } from "~/constants/game";

interface PresenceState {
  playerId: string;
  username: string;
  online_at: string;
}

interface PresenceCallbacks {
  onRoomUpdate: (updates: Partial<RoomData>) => void;
  onPlayerInsert: (player: RoomPlayer) => void;
  onPlayerUpdate: (player: RoomPlayer) => void;
  onPlayerDelete: (playerId: string) => void;
  onPresenceSync: (onlinePlayerIds: Set<string>) => void;
  onGameStart: () => void;
}

export function useGamePresence(roomCode: string) {
  const supabase = useSupabaseClient();
  const { $api } = useNuxtApp();

  // Channel reference
  let channel: ReturnType<
    ReturnType<typeof useSupabaseClient>["channel"]
  > | null = null;
  let presenceHeartbeat: ReturnType<typeof setInterval> | null = null;

  /**
   * Update connection status on the server
   */
  async function updateConnectionStatus(
    sessionId: string,
    status: "CONNECTED" | "DISCONNECTED" | "RECONNECTING",
  ) {
    try {
      await $api(`/api/rooms/${roomCode}/connection`, {
        method: "POST",
        body: {
          sessionId,
          status,
        },
      });
    } catch (err) {
      console.error("Failed to update connection status:", err);
    }
  }

  /**
   * Subscribe to real-time room updates
   */
  function subscribe(
    roomId: string,
    sessionId: string,
    username: string,
    playerId: string,
    callbacks: PresenceCallbacks,
  ) {
    const channelName = `room:${roomId}`;

    channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newData = payload.new as {
              state: GameState;
              current_round: number;
              phase_started_at: string | null;
              phase_ends_at: string | null;
              winner: PlayerRole | null;
            };

            callbacks.onRoomUpdate({
              state: newData.state,
              currentRound: newData.current_round,
              phaseStartedAt: newData.phase_started_at,
              phaseEndsAt: newData.phase_ends_at,
              winner: newData.winner,
            });

            // Fetch role when game starts
            if (
              newData.state === "OBSERVATION" ||
              newData.state === "DISTRIBUTING"
            ) {
              callbacks.onGameStart();
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            callbacks.onPlayerInsert(payload.new as RoomPlayer);
          } else if (payload.eventType === "UPDATE") {
            callbacks.onPlayerUpdate(payload.new as RoomPlayer);
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            callbacks.onPlayerDelete(deleted.id);
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel?.presenceState<PresenceState>();
        if (!state) return;

        const onlinePlayerIds = new Set<string>();
        Object.values(state).forEach((presences) => {
          (presences as PresenceState[]).forEach((p) => {
            onlinePlayerIds.add(p.playerId);
          });
        });

        callbacks.onPresenceSync(onlinePlayerIds);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track presence when subscribed
          await channel?.track({
            playerId,
            username,
            online_at: new Date().toISOString(),
          });

          // Update connection status to CONNECTED
          await updateConnectionStatus(sessionId, "CONNECTED");

          // Set up heartbeat
          presenceHeartbeat = setInterval(async () => {
            await updateConnectionStatus(sessionId, "CONNECTED");
          }, TIMING.PRESENCE_HEARTBEAT_MS);
        }
      });
  }

  /**
   * Unsubscribe from real-time updates
   */
  async function unsubscribe(sessionId?: string) {
    // Clear heartbeat
    if (presenceHeartbeat) {
      clearInterval(presenceHeartbeat);
      presenceHeartbeat = null;
    }

    // Update connection status to DISCONNECTED
    if (sessionId) {
      await updateConnectionStatus(sessionId, "DISCONNECTED");
    }

    // Remove channel
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  }

  /**
   * Send beacon on page unload (for reliable disconnect)
   */
  function sendDisconnectBeacon(sessionId: string) {
    const blob = new Blob(
      [
        JSON.stringify({
          sessionId,
          status: "DISCONNECTED",
        }),
      ],
      { type: "application/json" },
    );
    navigator.sendBeacon(`/api/rooms/${roomCode}/connection`, blob);
  }

  return {
    subscribe,
    unsubscribe,
    updateConnectionStatus,
    sendDisconnectBeacon,
  };
}
