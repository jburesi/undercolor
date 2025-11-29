<script setup lang="ts">
import * as z from "zod";
import PasswordInput from "@/components/common/PasswordInput.vue";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "guest",
});

const supabase = useSupabaseClient();

// Registration form validation schema
const registerSchema = z
  .object({
    email: z.email({ error: "Veuillez entrer une adresse email valide" }),
    password: z
      .string({ error: "Le mot de passe est requis" })
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
      ),
    confirmPassword: z.string({
      error: "La confirmation du mot de passe est requise",
    }),
    name: z
      .string({ error: "Le nom est requis" })
      .min(2, { error: "Le nom doit contenir au moins 2 caractères" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const validationSchema = toTypedSchema(registerSchema);
const isLoading = ref(false);
const isRegistered = ref(false);

// Setup form with validation
const { handleSubmit, setErrors } = useForm({
  validationSchema,
});

const submitHandler = async (values: z.infer<typeof registerSchema>) => {
  isLoading.value = true;
  try {
    const { error, data } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          name: values.name,
        },
      },
    });

    if (error) {
      console.error("Registration error:", error.message);

      // Handle specific Supabase auth errors
      if (error.message.includes("already registered")) {
        setErrors({ email: "Cette adresse email est déjà utilisée" });
        toast.error("Cette adresse email est déjà utilisée");
      } else if (error.message.includes("invalid email")) {
        setErrors({ email: "Adresse email invalide" });
        toast.error("Adresse email invalide");
      } else if (error.message.includes("weak password")) {
        setErrors({ password: "Le mot de passe est trop faible" });
        toast.error("Le mot de passe est trop faible");
      } else {
        toast.error("Erreur lors de l'inscription: " + error.message);
      }
      return;
    }

    if (data.session) {
      toast.success("Inscription réussie ! Bienvenue !");
      await navigateTo("/");
    } else {
      isRegistered.value = true;
      toast.success("Email de confirmation envoyé !");
    }
  } catch (error) {
    console.error("Registration error:", error);
    toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
  } finally {
    isLoading.value = false;
  }
};

// Handle validation errors
const onInvalidSubmit = ({ errors }: { errors: Record<string, string> }) => {
  if (Object.keys(errors).length > 0) {
    toast.error("Formulaire invalide", {
      description:
        "Veuillez corriger les erreurs indiquées ci-dessous avant de continuer.",
    });
  }
};

const onSubmit = handleSubmit(submitHandler, onInvalidSubmit);

const signUpWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) {
      console.error("Google signup error:", error.message);
    }
  } catch (error) {
    console.error("Google signup error:", error);
  }
};

const signUpWithGitHub = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) {
      console.error("GitHub signup error:", error.message);
    }
  } catch (error) {
    console.error("GitHub signup error:", error);
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
              <!-- Succès d'inscription -->
              <div
                v-if="isRegistered"
                class="flex flex-col items-center text-center space-y-4"
              >
                <div
                  class="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
                >
                  <Icon
                    name="lucide:mail-check"
                    class="h-6 w-6 text-green-600 dark:text-green-400"
                  />
                </div>
                <h1
                  class="text-2xl font-bold text-green-700 dark:text-green-400"
                >
                  Inscription réussie !
                </h1>
                <p class="text-muted-foreground">
                  Nous avons envoyé un email de confirmation à votre adresse.
                  Veuillez cliquer sur le lien dans l'email pour activer votre
                  compte.
                </p>
                <Button class="w-full" @click="navigateTo('/login')">
                  <Icon name="lucide:log-in" class="h-4 w-4 mr-2" />
                  Aller à la connexion
                </Button>
              </div>

              <!-- Formulaire d'inscription -->
              <div v-else>
                <!-- En-tête -->
                <div class="flex flex-col items-center text-center">
                  <h1 class="text-2xl font-bold">Créer un compte</h1>
                  <p class="text-balance text-muted-foreground">
                    Rejoignez la communauté Nuxt Modules
                  </p>
                </div>

                <!-- Formulaire -->
                <form class="space-y-4" @submit="onSubmit">
                  <FormField v-slot="{ componentField }" name="name">
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>

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
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <PasswordInput
                          v-bind="componentField"
                          autocomplete="new-password"
                          placeholder="Entrez votre mot de passe"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>

                  <FormField v-slot="{ componentField }" name="confirmPassword">
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <PasswordInput
                          v-bind="componentField"
                          autocomplete="new-password"
                          placeholder="Confirmez votre mot de passe"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>

                  <Button type="submit" class="w-full" :disabled="isLoading">
                    <Icon
                      v-if="isLoading"
                      name="lucide:loader-2"
                      class="h-4 w-4 mr-2 animate-spin"
                    />
                    Créer le compte
                  </Button>
                </form>

                <!-- Séparateur -->
                <div
                  class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
                >
                  <span
                    class="relative z-10 bg-background px-2 text-muted-foreground"
                  >
                    Ou s'inscrire avec
                  </span>
                </div>

                <!-- Boutons OAuth -->
                <div class="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    class="w-full"
                    :disabled="isLoading"
                    @click="signUpWithGoogle"
                  >
                    <Icon name="lucide:chrome" class="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    class="w-full"
                    :disabled="isLoading"
                    @click="signUpWithGitHub"
                  >
                    <Icon name="lucide:github" class="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </div>

                <!-- Lien de connexion -->
                <div class="text-center text-sm">
                  Vous avez déjà un compte ?
                  <NuxtLinkLocale
                    to="login"
                    class="underline underline-offset-4 hover:text-primary"
                  >
                    Se connecter
                  </NuxtLinkLocale>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Conditions d'utilisation -->
      <div
        class="mt-6 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary"
      >
        En créant un compte, vous acceptez nos
        <NuxtLink to="/">Conditions d'utilisation</NuxtLink>
        et notre
        <NuxtLink to="/">Politique de confidentialité</NuxtLink>.
      </div>
    </div>
  </div>
</template>
