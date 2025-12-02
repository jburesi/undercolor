<script setup lang="ts">
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import { roomCodeSchema } from "#shared/schemas";
import { z } from "zod";

const { t } = useI18n();
const localePath = useLocalePath();
const { $api } = useNuxtApp();

const joinRoomFormSchema = z.object({
  roomCode: roomCodeSchema,
});

const form = useForm({
  validationSchema: joinRoomFormSchema,
  initialValues: {
    roomCode: "",
  },
});

const isJoining = ref(false);

const onSubmit = form.handleSubmit(async (values) => {
  const code = values.roomCode.trim().toUpperCase();

  isJoining.value = true;
  try {
    // Check if room exists
    await $api(`/rooms/${code}`);
    // Room exists, navigate to it
    await navigateTo(localePath({ name: "rooms-code", params: { code } }));
  } catch {
    // Room doesn't exist
    toast.error(t("toast.roomNotFound"));
  } finally {
    isJoining.value = false;
  }
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>
        {{ t("rooms.joinByCode") }}
      </CardTitle>
      <CardDescription>
        {{ t("rooms.joinDescription") }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form
        class="flex flex-col sm:flex-row sm:items-start gap-4"
        @submit="onSubmit"
      >
        <FormField v-slot="{ componentField }" name="roomCode">
          <FormItem class="flex-1">
            <FormControl>
              <Input
                type="text"
                :placeholder="t('rooms.enterCode')"
                class="text-center sm:text-left"
                maxlength="6"
                :disabled="isJoining"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button
          type="submit"
          class="w-full sm:w-auto"
          :disabled="!form.meta.value.valid || isJoining"
        >
          <Icon
            v-if="isJoining"
            name="lucide:loader-2"
            class="size-4 mr-2 animate-spin"
          />
          <Icon v-else name="lucide:log-in" class="size-4" />
          <span>
            {{ t("rooms.join") }}
          </span>
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
