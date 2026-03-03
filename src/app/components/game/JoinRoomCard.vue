<script setup lang="ts">
import type { FormContext } from "vee-validate";

defineProps<{
  form: FormContext<{ username: string }>;
  isSubmitting: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [];
}>();

const { t } = useI18n();
</script>

<template>
  <Card class="max-w-md mx-auto">
    <CardHeader>
      <CardTitle>{{ t("game.joinGame") }}</CardTitle>
      <CardDescription>
        {{ t("game.joinGameDescription") }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit.prevent="emit('submit')">
        <FormField v-slot="{ componentField }" name="username">
          <FormItem>
            <FormLabel>{{ t("auth.username") }}</FormLabel>
            <FormControl>
              <Input
                :placeholder="t('auth.username')"
                maxlength="20"
                :disabled="isSubmitting"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <p v-if="error" class="text-sm text-destructive">
          {{ error }}
        </p>
        <Button
          type="submit"
          class="w-full"
          :disabled="!form.meta.value.valid || isSubmitting"
        >
          <Icon
            v-if="isSubmitting"
            name="lucide:loader-2"
            class="size-4 mr-2 animate-spin"
          />
          <Icon v-else name="lucide:log-in" class="size-4 mr-2" />
          {{ t("game.joinRoom") }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
