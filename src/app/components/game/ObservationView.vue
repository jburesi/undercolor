<script setup lang="ts">
import { PlayerRole } from "#shared/types/game.types";

defineProps<{
  myRole: PlayerRole | null;
  myImageUrl: string | null;
  isHost: boolean;
}>();

const emit = defineEmits<{
  skipPhase: [];
}>();

const { t } = useI18n();

const roleRevealed = ref(false);
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Role Card -->
    <Card class="overflow-hidden">
      <CardHeader class="text-center">
        <CardTitle>{{ t("game.yourImage") }}</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Mr. White sees nothing -->
        <div v-if="myRole === PlayerRole.MR_WHITE" class="text-center py-12">
          <Icon
            name="lucide:eye-off"
            class="size-16 text-muted-foreground mx-auto mb-4"
          />
          <p class="text-xl font-medium">
            {{ t("game.mrWhiteNoImage") }}
          </p>
          <p class="text-muted-foreground">
            {{ t("game.mrWhiteHint") }}
          </p>
        </div>

        <!-- Image for Innocent/Imposter -->
        <div v-else class="text-center">
          <!-- Reveal button -->
          <div
            v-if="!roleRevealed"
            class="aspect-video bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
            @click="roleRevealed = true"
          >
            <div class="text-center">
              <Icon
                name="lucide:eye"
                class="size-12 text-muted-foreground mx-auto mb-2"
              />
              <p class="font-medium">{{ t("game.tapToReveal") }}</p>
            </div>
          </div>
          <!-- Revealed image -->
          <div v-else class="aspect-video bg-muted rounded-lg overflow-hidden">
            <NuxtImg
              v-if="myImageUrl"
              :src="myImageUrl"
              class="w-full h-full object-cover"
              format="webp"
              quality="80"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <p class="text-muted-foreground">
                {{ t("game.noImageAvailable") }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Skip button for host -->
    <div v-if="isHost" class="text-center">
      <Button variant="outline" @click="emit('skipPhase')">
        {{ t("game.skipToDebate") }}
      </Button>
    </div>
  </div>
</template>
