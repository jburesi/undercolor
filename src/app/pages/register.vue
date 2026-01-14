<script setup lang="ts">
import { useForm } from "vee-validate";
import { z } from "zod";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
  middleware: ["guest"],
});

const { t } = useI18n();
const supabase = useSupabaseClient();

// VeeValidate v5 supports Zod v4 natively
const formSchema = z
  .object({
    username: z.string().min(2).max(20),
    email: z.email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
});

const { handleSubmit } = form;

const isLoading = ref(false);

const onSubmit = handleSubmit(async (formValues) => {
  isLoading.value = true;

  try {
    const { error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        data: {
          username: formValues.username,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t("toast.registerSuccess"));
    // Optionally redirect or show confirmation message
  } catch {
    toast.error(t("toast.errorOccurred"));
  } finally {
    isLoading.value = false;
  }
});

const signUpWithProvider = async (provider: "google" | "github") => {
  isLoading.value = true;
  try {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    });
  } catch {
    toast.error(t("toast.errorOccurred"));
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="page-register">
    <div class="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader class="text-center">
          <div
            class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
          >
            <Icon name="lucide:user-plus" class="size-6 text-primary" />
          </div>
          <CardTitle class="text-2xl">{{ t("auth.register") }}</CardTitle>
          <CardDescription>
            {{ t("auth.registerDescription") }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit="onSubmit">
            <!-- Username -->
            <FormField v-slot="{ componentField }" name="username">
              <FormItem>
                <FormLabel>{{ t("auth.username") }}</FormLabel>
                <FormControl>
                  <Input
                    :placeholder="t('auth.username')"
                    maxlength="20"
                    autocomplete="username"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Email -->
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>{{ t("auth.email") }}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    :placeholder="t('auth.email')"
                    autocomplete="email"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Password -->
            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <FormLabel>{{ t("auth.password") }}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autocomplete="new-password"
                    :placeholder="t('auth.password')"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Confirm Password -->
            <FormField v-slot="{ componentField }" name="confirmPassword">
              <FormItem>
                <FormLabel>{{ t("auth.confirmPassword") }}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autocomplete="new-password"
                    :placeholder="t('auth.confirmPassword')"
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
              {{ t("auth.register") }}
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
              @click="signUpWithProvider('google')"
            >
              <Icon name="logos:google-icon" class="size-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              :disabled="isLoading"
              @click="signUpWithProvider('github')"
            >
              <Icon name="logos:github-icon" class="size-4 mr-2" />
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter class="justify-center">
          <p class="text-sm text-muted-foreground">
            {{ t("auth.hasAccount") }}
            <NuxtLinkLocale to="login" class="text-primary hover:underline">
              {{ t("auth.login") }}
            </NuxtLinkLocale>
          </p>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
