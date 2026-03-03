/**
 * Game Helpers - Utility functions for game-related UI
 */

import { PlayerRole } from "#shared/types/game.types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * Get badge variant based on player role
 */
export function getRoleBadgeVariant(role: PlayerRole): BadgeVariant {
  switch (role) {
    case PlayerRole.INNOCENT:
      return "default";
    case PlayerRole.IMPOSTER:
      return "destructive";
    case PlayerRole.MR_WHITE:
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Get role display color class
 */
export function getRoleColorClass(role: PlayerRole): string {
  switch (role) {
    case PlayerRole.INNOCENT:
      return "text-blue-500";
    case PlayerRole.IMPOSTER:
      return "text-red-500";
    case PlayerRole.MR_WHITE:
      return "text-gray-500";
    default:
      return "text-muted-foreground";
  }
}

/**
 * Get role icon name
 */
export function getRoleIcon(role: PlayerRole): string {
  switch (role) {
    case PlayerRole.INNOCENT:
      return "lucide:user";
    case PlayerRole.IMPOSTER:
      return "lucide:skull";
    case PlayerRole.MR_WHITE:
      return "lucide:eye-off";
    default:
      return "lucide:help-circle";
  }
}
