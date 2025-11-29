<script setup lang="ts">
const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();

const isLoading = ref(true);
const error = ref<string | null>(null);

// Surveiller les changements d'utilisateur
watch(
  user,
  () => {
    if (user.value) {
      // Obtenir le chemin de redirection et l'effacer du cookie
      const path = redirectInfo.pluck();
      console.log("Redirection vers:", path || "/");
      // Rediriger vers le chemin sauvegardé, ou vers l'accueil par défaut
      return navigateTo(path || "/");
    }
  },
  { immediate: true },
);

// Surveiller l'état de chargement
onMounted(() => {
  // Donner un peu de temps pour que Supabase traite la session
  setTimeout(() => {
    if (!user.value) {
      isLoading.value = false;
      // Si après 5 secondes il n'y a toujours pas d'utilisateur, il y a peut-être une erreur
      setTimeout(() => {
        if (!user.value) {
          error.value =
            "La confirmation a pris trop de temps. Veuillez réessayer.";
        }
      }, 5000);
    }
  }, 1000);
});

const goToLogin = () => {
  navigateTo("/login");
};

const resendConfirmation = async () => {
  // Logique pour renvoyer l'email de confirmation si nécessaire
  console.log("Renvoi de l'email de confirmation");
};

const goToDashboard = () => {
  navigateTo("/");
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-md">
      <Card>
        <CardContent class="p-6 md:p-8">
          <div class="flex flex-col items-center text-center space-y-6">
            <!-- État de chargement -->
            <div v-if="isLoading" class="space-y-4">
              <div class="flex justify-center">
                <Icon
                  name="lucide:loader-2"
                  class="h-8 w-8 animate-spin text-primary"
                />
              </div>
              <h1 class="text-2xl font-bold">Confirmation en cours...</h1>
              <p class="text-muted-foreground">
                Nous vérifions votre authentification.
              </p>
            </div>

            <!-- Confirmation réussie (utilisateur connecté) -->
            <div v-else-if="user" class="space-y-4">
              <div class="flex justify-center">
                <div
                  class="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
                >
                  <Icon
                    name="lucide:check"
                    class="h-6 w-6 text-green-600 dark:text-green-400"
                  />
                </div>
              </div>
              <h1 class="text-2xl font-bold text-green-700 dark:text-green-400">
                Connexion réussie !
              </h1>
              <p class="text-muted-foreground">
                Vous êtes maintenant connecté. Redirection en cours...
              </p>
              <div class="space-y-2">
                <Button class="w-full" @click="goToDashboard">
                  <Icon name="lucide:arrow-right" class="h-4 w-4 mr-2" />
                  Continuer
                </Button>
              </div>
            </div>

            <!-- Erreur de confirmation -->
            <div v-else class="space-y-4">
              <div class="flex justify-center">
                <div
                  class="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center"
                >
                  <Icon
                    name="lucide:x"
                    class="h-6 w-6 text-red-600 dark:text-red-400"
                  />
                </div>
              </div>
              <h1 class="text-2xl font-bold text-red-700 dark:text-red-400">
                Erreur de confirmation
              </h1>
              <p class="text-muted-foreground">
                {{
                  error ||
                  "Impossible de confirmer votre authentification. Le lien peut être expiré ou invalide."
                }}
              </p>
              <div class="space-y-2">
                <Button class="w-full" @click="goToLogin">
                  <Icon name="lucide:log-in" class="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Button>
                <Button
                  variant="outline"
                  class="w-full"
                  @click="resendConfirmation"
                >
                  <Icon name="lucide:mail" class="h-4 w-4 mr-2" />
                  Renvoyer l'email
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Informations d'aide -->
      <div class="mt-6 text-center">
        <p class="text-sm text-muted-foreground">
          Besoin d'aide ?
          <NuxtLinkLocale
            to="/support"
            class="underline underline-offset-4 hover:text-primary"
          >
            Contactez le support
          </NuxtLinkLocale>
        </p>
      </div>
    </div>
  </div>
</template>
