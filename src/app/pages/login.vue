<script setup lang="ts">
import { useForm } from "vee-validate";
import { z } from "zod";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
  middleware: ["guest"],
});

const { t } = useI18n();
const localePath = useLocalePath();
const supabase = useSupabaseClient();

// VeeValidate v5 supports Zod v4 natively
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: "",
    password: "",
  },
});

const { handleSubmit } = form;

const isLoading = ref(false);
const errorMessage = ref("");

const onSubmit = handleSubmit(async (formValues) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });

    if (error) {
      errorMessage.value = error.message;
      toast.error(error.message);
      return;
    }

    // Redirect to home on success
    toast.success(t("toast.loginSuccess"));
    await navigateTo(localePath({ path: "/" }));
  } catch {
    errorMessage.value = t("common.error");
    toast.error(t("toast.errorOccurred"));
  } finally {
    isLoading.value = false;
  }
});

const signInWithProvider = async (provider: "google" | "github") => {
  isLoading.value = true;
  try {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    });
  } catch {
    errorMessage.value = t("common.error");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="page-login">
    <div class="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader class="text-center">
          <div
            class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
          >
            <Icon name="lucide:user" class="size-6 text-primary" />
          </div>
          <CardTitle class="text-2xl">{{ t("auth.login") }}</CardTitle>
          <CardDescription>
            {{ t("auth.loginDescription") }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit="onSubmit">
            <!-- Error message -->
            <div
              v-if="errorMessage"
              class="p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
            >
              {{ errorMessage }}
            </div>

            <!-- Email -->
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>{{ t("auth.email") }}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    :placeholder="t('auth.email')"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Password -->
            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <div class="flex items-center justify-between">
                  <FormLabel>{{ t("auth.password") }}</FormLabel>
                  <NuxtLink
                    :to="localePath({ path: '/forgot-password' })"
                    class="text-xs text-primary hover:underline"
                  >
                    {{ t("auth.forgotPassword") }}
                  </NuxtLink>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    :placeholder="t('auth.password')"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button type="submit" class="w-full" :disabled="isLoading">
              <Icon
                v-if="isLoading"
                name="lucide:loader-2"
                class="size-4 mr-2 animate-spin"
              />
              {{ t("auth.login") }}
            </Button>
          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-card px-2 text-muted-foreground">
                {{ t("auth.orContinueWith") }}
              </span>
            </div>
          </div>

          <!-- OAuth providers -->
          <div class="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              :disabled="isLoading"
              @click="signInWithProvider('google')"
            >
              <Icon name="logos:google-icon" class="size-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              :disabled="isLoading"
              @click="signInWithProvider('github')"
            >
              <Icon name="logos:github-icon" class="size-4 mr-2" />
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter class="justify-center">
          <p class="text-sm text-muted-foreground">
            {{ t("auth.noAccount") }}
            <NuxtLinkLocale to="register" class="text-primary hover:underline">
              {{ t("auth.register") }}
            </NuxtLinkLocale>
          </p>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
