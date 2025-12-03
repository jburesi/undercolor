<script setup lang="ts">
interface PlayerData {
  id: string;
  username: string;
  is_host?: boolean;
  is_alive?: boolean;
  role?: string;
  connection_status?: "CONNECTED" | "DISCONNECTED" | "RECONNECTING";
}

interface Props {
  player: PlayerData;
  isMe?: boolean;
  showConnectionStatus?: boolean;
  showRole?: boolean;
  selectable?: boolean;
  selected?: boolean;
  compact?: boolean;
}

withDefaults(defineProps<Props>(), {
  isMe: false,
  showConnectionStatus: false,
  showRole: false,
  selectable: false,
  selected: false,
  compact: false,
});

defineEmits<{
  select: [];
}>();

const { t } = useI18n();

function getRoleColor(role: string) {
  switch (role) {
    case "INNOCENT":
      return "bg-blue-500";
    case "IMPOSTER":
      return "bg-red-500";
    case "MR_WHITE":
      return "bg-gray-400";
    default:
      return "bg-muted-foreground";
  }
}
</script>

<template>
  <div
    class="relative flex items-center gap-3 p-3 rounded-lg transition-colors"
    :class="[
      compact ? 'flex-col p-3' : 'min-h-[72px]',
      selectable ? 'cursor-pointer border-2' : 'bg-muted',
      selectable && selected && 'border-primary bg-primary/10',
      selectable && !selected && 'border-muted hover:border-primary/50',
      !selectable && player.is_alive === false && 'bg-muted/50 opacity-50',
    ]"
    @click="selectable && $emit('select')"
  >
    <!-- "Me" Badge -->
    <Badge
      v-if="isMe"
      class="absolute -top-2 -left-2 text-[10px] px-1.5 py-0.5"
    >
      {{ t("game.you") }}
    </Badge>

    <!-- Avatar -->
    <Avatar>
      <AvatarFallback>
        {{ player.username.substring(0, 2).toUpperCase() }}
      </AvatarFallback>
    </Avatar>

    <!-- Info -->
    <div :class="compact ? 'text-center' : 'flex-1 min-w-0'">
      <p class="font-medium truncate" :class="compact && 'text-sm'">
        {{ player.username }}
      </p>
      <!-- Lobby: show host label -->
      <p
        v-if="showConnectionStatus && player.is_host"
        class="text-xs text-muted-foreground"
      >
        {{ t("game.host") }}
      </p>
      <!-- Game over: show role with colored dot -->
      <div
        v-else-if="showRole && player.role"
        class="flex items-center gap-1.5 text-xs text-muted-foreground"
        :class="compact && 'justify-center'"
      >
        <span class="w-2 h-2 rounded-full" :class="getRoleColor(player.role)" />
        {{ t(`game.roles.${player.role.toLowerCase()}`) }}
      </div>
      <!-- In-game: show eliminated status only -->
      <p v-else-if="player.is_alive === false" class="text-xs text-destructive">
        {{ t("game.eliminated") }}
      </p>
    </div>

    <!-- Connection Status (lobby only) -->
    <Tooltip v-if="showConnectionStatus && player.connection_status">
      <TooltipTrigger as-child>
        <div class="relative">
          <div
            :class="[
              'w-2.5 h-2.5 rounded-full',
              player.connection_status === 'CONNECTED'
                ? 'bg-green-500'
                : player.connection_status === 'RECONNECTING'
                  ? 'bg-yellow-500'
                  : 'bg-red-500',
            ]"
          />
          <div
            v-if="player.connection_status === 'CONNECTED'"
            class="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ t(`game.connectionStatus.${player.connection_status}`) }}</p>
      </TooltipContent>
    </Tooltip>

    <!-- Selection check icon -->
    <Icon
      v-if="selectable && selected"
      name="lucide:check"
      class="size-5 text-primary"
    />
  </div>
</template>
