<script setup lang="ts">
import * as z from "zod";
import PasswordInput from "@/components/common/PasswordInput.vue";

definePageMeta({
  middleware: "guest",
});

const supabase = useSupabaseClient();

// Schema de validation pour le formulaire de connexion
const loginSchema = z.object({
  email: z
    .string({ message: "L'email est requis" })
    .email("Veuillez entrer une adresse email valide"),
  password: z
    .string({ message: "Le mot de passe est requis" })
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const validationSchema = toTypedSchema(loginSchema);
const isLoading = ref(false);

const onSubmit = async (values: Record<string, unknown>) => {
  isLoading.value = true;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email as string,
      password: values.password as string,
    });

    if (error) {
      console.error("Erreur de connexion:", error.message);
      return;
    }

    await navigateTo("/confirm");
  } catch (error) {
    console.error("Erreur de connexion:", error);
  } finally {
    isLoading.value = false;
  }
};

const signInWithOtp = async (email: string) => {
  isLoading.value = true;
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) {
      console.error("Erreur envoi OTP:", error.message);
      return;
    }

    console.log("Email de connexion envoyé !");
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    isLoading.value = false;
  }
};

const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) {
      console.error("Erreur connexion Google:", error.message);
    }
  } catch (error) {
    console.error("Erreur connexion Google:", error);
  }
};

const signInWithGitHub = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) {
      console.error("Erreur connexion GitHub:", error.message);
    }
  } catch (error) {
    console.error("Erreur connexion GitHub:", error);
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-md">
      <Card class="overflow-hidden">
        <CardContent class="p-0">
          <div class="p-6 md:p-8">
            <div class="flex flex-col gap-6">
              <!-- En-tête -->
              <div class="flex flex-col items-center text-center">
                <h1 class="text-2xl font-bold">Bon retour</h1>
                <p class="text-balance text-muted-foreground">
                  Connectez-vous à votre compte Nuxt Modules
                </p>
              </div>

              <!-- Formulaire de connexion -->
              <Form
                v-slot="{ meta, values }"
                :validation-schema="validationSchema"
                class="space-y-4"
                @submit="onSubmit"
              >
                <FormField v-slot="{ componentField }" name="email">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        v-bind="componentField"
                        autocomplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="password">
                  <FormItem>
                    <div class="flex items-center justify-between">
                      <FormLabel>Mot de passe</FormLabel>
                      <NuxtLinkLocale
                        to=""
                        class="text-sm underline-offset-2 hover:underline text-muted-foreground"
                      >
                        Mot de passe oublié ?
                      </NuxtLinkLocale>
                    </div>
                    <FormControl>
                      <PasswordInput
                        v-bind="componentField"
                        autocomplete="current-password"
                        placeholder="Entrez votre mot de passe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <div class="space-y-2">
                  <Button
                    type="submit"
                    class="w-full"
                    :disabled="!meta.valid || isLoading"
                  >
                    <Icon
                      v-if="isLoading"
                      name="lucide:loader-2"
                      class="h-4 w-4 mr-2 animate-spin"
                    />
                    Se connecter
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    class="w-full"
                    :disabled="!values.email || isLoading"
                    @click="signInWithOtp(values.email as string)"
                  >
                    <Icon name="lucide:mail" class="h-4 w-4 mr-2" />
                    Connexion par lien magique
                  </Button>
                </div>
              </Form>

              <!-- Séparateur -->
              <div
                class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
              >
                <span
                  class="relative z-10 bg-background px-2 text-muted-foreground"
                >
                  Ou continuer avec
                </span>
              </div>

              <!-- Boutons OAuth -->
              <div class="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  class="w-full"
                  :disabled="isLoading"
                  @click="signInWithGoogle"
                >
                  <Icon name="lucide:chrome" class="h-4 w-4 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  class="w-full"
                  :disabled="isLoading"
                  @click="signInWithGitHub"
                >
                  <Icon name="lucide:github" class="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div>

              <!-- Lien d'inscription -->
              <div class="text-center text-sm">
                Vous n'avez pas de compte ?
                <NuxtLinkLocale
                  to="/register"
                  class="underline underline-offset-4 hover:text-primary"
                >
                  S'inscrire
                </NuxtLinkLocale>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Conditions d'utilisation -->
      <div
        class="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary"
      >
        En continuant, vous acceptez nos
        <NuxtLinkLocale to="/">Conditions d'utilisation</NuxtLinkLocale>
        et notre
        <NuxtLinkLocale to="/">Politique de confidentialité</NuxtLinkLocale>.
      </div>
    </div>
  </div>
</template>
