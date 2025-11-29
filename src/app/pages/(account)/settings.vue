<script setup>
import { toast } from "vue-sonner";
import PasswordInput from "@/components/common/PasswordInput.vue";

// Supabase
const user = useSupabaseUser();
const supabase = useSupabaseClient();

// i18n
const { locale, setLocale, locales } = useI18n();

// Settings data
const settings = ref({
  name: "John Doe",
  email: "john.doe@example.com",
  language: locale.value, // Utiliser la locale actuelle
});

const profile = ref({
  bio: "Software developer with a passion for building user-friendly applications.",
});

const notifications = ref({
  email: true,
  push: false,
  marketing: false,
});

const security = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorEnabled: false,
});

// Delete account dialog
const showDeleteDialog = ref(false);
const deleteConfirmation = ref("");

const loadUserSettings = async () => {
  if (!user.value) return;

  try {
    const { data, error } = await supabase
      .from("general")
      .select("*")
      .eq("id", user.value.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) {
      settings.value.language = data.language || locale.value;
      settings.value.name = user.value.user_metadata?.name || "";
      settings.value.email = user.value.email || "";

      // Mettre à jour la locale si elle est différente
      if (data.language && data.language !== locale.value) {
        await setLocale(data.language);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des paramètres:", error);
  }
};

// Methods
const saveSettings = async () => {
  if (!user.value) {
    toast.error($t("errors.authRequired"), {
      description: $t("errors.authRequiredDescription"),
    });
    return;
  }

  try {
    // Vérifier si l'utilisateur a déjà un enregistrement dans la table general
    const { data: existingData, error: fetchError } = await supabase
      .from("general")
      .select("*")
      .eq("id", user.value.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingData) {
      // Mettre à jour l'enregistrement existant
      const { error: updateError } = await supabase
        .from("general")
        .update({
          language: settings.value.language,
        })
        .eq("id", user.value.id);

      if (updateError) throw updateError;
    } else {
      // Créer un nouvel enregistrement
      const { error: insertError } = await supabase.from("general").insert({
        id: user.value.id,
        language: settings.value.language,
      });

      if (insertError) throw insertError;
    }

    // Mettre à jour la locale
    await setLocale(settings.value.language);

    toast.success($t("settings.updated"), {
      description: $t("settings.updatedDescription"),
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    toast.error($t("errors.general"), {
      description: $t("errors.saveError"),
    });
  }
};

const saveProfile = () => {
  toast.success($t("settings.profile.profileUpdated"), {
    description: $t("settings.profile.profileUpdatedDescription"),
  });
};

const saveNotifications = () => {
  toast.success($t("settings.notifications.preferencesUpdated"), {
    description: $t("settings.notifications.preferencesUpdatedDescription"),
  });
};

const updatePassword = () => {
  if (security.value.newPassword !== security.value.confirmPassword) {
    toast.error($t("errors.general"), {
      description: $t("settings.security.passwordMismatch"),
    });
    return;
  }

  toast.success($t("settings.security.passwordUpdated"), {
    description: $t("settings.security.passwordUpdatedDescription"),
  });

  security.value.currentPassword = "";
  security.value.newPassword = "";
  security.value.confirmPassword = "";
};

const enableTwoFactor = () => {
  security.value.twoFactorEnabled = true;
  toast.success($t("settings.security.twoFactorEnabled"), {
    description: $t("settings.security.twoFactorEnabledDescription"),
  });
};

const deleteAccount = () => {
  toast.error($t("settings.security.accountDeleted"), {
    description: $t("settings.security.accountDeletedDescription"),
  });
  showDeleteDialog.value = false;
};

// Charger les paramètres quand l'utilisateur est disponible
watch(
  user,
  (newUser) => {
    if (newUser) {
      loadUserSettings();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="container py-10">
    <div class="flex flex-col space-y-8 max-w-3xl mx-auto">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">{{ $t("settings.title") }}</h1>
        <p class="text-muted-foreground">
          {{ $t("settings.description") }}
        </p>
      </div>

      <Tabs default-value="general" class="w-full">
        <TabsList class="mb-4">
          <TabsTrigger value="general">{{
            $t("settings.tabs.general")
          }}</TabsTrigger>
          <TabsTrigger value="profile">{{
            $t("settings.tabs.profile")
          }}</TabsTrigger>
          <TabsTrigger value="notifications">{{
            $t("settings.tabs.notifications")
          }}</TabsTrigger>
          <TabsTrigger value="security">{{
            $t("settings.tabs.security")
          }}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{{ $t("settings.general.title") }}</CardTitle>
              <CardDescription>{{
                $t("settings.general.description")
              }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <form class="space-y-4" @submit.prevent="saveSettings">
                <div class="space-y-2">
                  <Label for="name">{{ $t("settings.general.name") }}</Label>
                  <Input
                    id="name"
                    v-model="settings.name"
                    :placeholder="$t('settings.general.namePlaceholder')"
                    autocomplete="name"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="email">{{ $t("settings.general.email") }}</Label>
                  <Input
                    id="email"
                    v-model="settings.email"
                    type="email"
                    :placeholder="$t('settings.general.emailPlaceholder')"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="language">{{
                    $t("settings.general.language")
                  }}</Label>
                  <Select v-model="settings.language">
                    <SelectTrigger>
                      <SelectValue
                        :placeholder="
                          $t('settings.general.languagePlaceholder')
                        "
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="availableLocale in locales"
                        :key="availableLocale.code"
                        :value="availableLocale.code"
                      >
                        {{ availableLocale.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button @click="saveSettings">{{
                $t("settings.saveChanges")
              }}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{{ $t("settings.profile.title") }}</CardTitle>
              <CardDescription>{{
                $t("settings.profile.description")
              }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <form class="space-y-4" @submit.prevent="saveProfile">
                <div class="space-y-2">
                  <Label for="bio">{{ $t("settings.profile.bio") }}</Label>
                  <Textarea
                    id="bio"
                    v-model="profile.bio"
                    :placeholder="$t('settings.profile.bioPlaceholder')"
                  />
                </div>
                <div class="space-y-2">
                  <span
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >{{ $t("settings.profile.profilePicture") }}</span
                  >
                  <div class="flex items-center gap-4">
                    <Avatar class="h-16 w-16">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline">{{
                      $t("settings.profile.change")
                    }}</Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button @click="saveProfile">{{
                $t("settings.profile.updateProfile")
              }}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{{ $t("settings.notifications.title") }}</CardTitle>
              <CardDescription>{{
                $t("settings.notifications.description")
              }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <form class="space-y-4" @submit.prevent="saveNotifications">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">
                        {{ $t("settings.notifications.email") }}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {{ $t("settings.notifications.emailDescription") }}
                      </p>
                    </div>
                    <Switch v-model="notifications.email" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">
                        {{ $t("settings.notifications.push") }}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {{ $t("settings.notifications.pushDescription") }}
                      </p>
                    </div>
                    <Switch v-model="notifications.push" />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">
                        {{ $t("settings.notifications.marketing") }}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {{ $t("settings.notifications.marketingDescription") }}
                      </p>
                    </div>
                    <Switch v-model="notifications.marketing" />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button @click="saveNotifications">{{
                $t("settings.notifications.savePreferences")
              }}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{{ $t("settings.security.title") }}</CardTitle>
              <CardDescription>{{
                $t("settings.security.description")
              }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <form class="space-y-4" @submit.prevent="updatePassword">
                <div class="space-y-2">
                  <Label for="current-password">{{
                    $t("settings.security.currentPassword")
                  }}</Label>
                  <PasswordInput
                    id="current-password"
                    v-model="security.currentPassword"
                    autocomplete="current-password"
                    placeholder="Mot de passe actuel"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="new-password">{{
                    $t("settings.security.newPassword")
                  }}</Label>
                  <PasswordInput
                    id="new-password"
                    v-model="security.newPassword"
                    autocomplete="new-password"
                    placeholder="Nouveau mot de passe"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="confirm-password">{{
                    $t("settings.security.confirmPassword")
                  }}</Label>
                  <PasswordInput
                    id="confirm-password"
                    v-model="security.confirmPassword"
                    autocomplete="new-password"
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                </div>
              </form>

              <div class="pt-4">
                <h3 class="font-medium mb-2">
                  {{ $t("settings.security.twoFactor") }}
                </h3>
                <p class="text-sm text-muted-foreground mb-4">
                  {{ $t("settings.security.twoFactorDescription") }}
                </p>
                <Button
                  variant="outline"
                  class="w-full"
                  :disabled="security.twoFactorEnabled"
                  @click="enableTwoFactor"
                >
                  {{
                    security.twoFactorEnabled
                      ? $t("settings.security.twoFactorEnabled")
                      : $t("settings.security.enableTwoFactor")
                  }}
                </Button>
              </div>
            </CardContent>
            <CardFooter class="flex flex-col items-start gap-4">
              <Button @click="updatePassword">{{
                $t("settings.security.updatePassword")
              }}</Button>
              <Alert variant="destructive" class="w-full">
                <AlertTitle>
                  <Icon name="lucide:circle-alert" />
                  {{ $t("settings.security.dangerZone") }}
                </AlertTitle>
                <AlertDescription>
                  {{ $t("settings.security.deleteAccountDescription") }}
                  <Button
                    variant="destructive"
                    size="sm"
                    class="mt-2"
                    @click="showDeleteDialog = true"
                  >
                    {{ $t("settings.security.deleteAccount") }}
                  </Button>
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t("settings.deleteDialog.title") }}</DialogTitle>
          <DialogDescription>
            {{ $t("settings.deleteDialog.description") }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="confirm">{{
              $t("settings.deleteDialog.confirmLabel")
            }}</Label>
            <Input
              id="confirm"
              v-model="deleteConfirmation"
              :placeholder="$t('settings.deleteDialog.confirmPlaceholder')"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">{{
            $t("settings.deleteDialog.cancel")
          }}</Button>
          <Button
            variant="destructive"
            :disabled="deleteConfirmation !== 'DELETE'"
            @click="deleteAccount"
          >
            {{ $t("settings.security.deleteAccount") }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
