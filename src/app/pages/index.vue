<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();

// Features data
const features = computed(() => [
  {
    key: "visual",
    icon: "lucide:eye",
    title: t("home.features.visual.title"),
    description: t("home.features.visual.description"),
  },
  {
    key: "realtime",
    icon: "lucide:users",
    title: t("home.features.realtime.title"),
    description: t("home.features.realtime.description"),
  },
  {
    key: "roles",
    icon: "lucide:drama",
    title: t("home.features.roles.title"),
    description: t("home.features.roles.description"),
  },
  {
    key: "accessible",
    icon: "lucide:smartphone",
    title: t("home.features.accessible.title"),
    description: t("home.features.accessible.description"),
  },
]);

// How to play steps
const steps = computed(() => [
  {
    key: "step1",
    number: 1,
    icon: "lucide:door-open",
    title: t("home.howToPlay.step1.title"),
    description: t("home.howToPlay.step1.description"),
  },
  {
    key: "step2",
    number: 2,
    icon: "lucide:image",
    title: t("home.howToPlay.step2.title"),
    description: t("home.howToPlay.step2.description"),
  },
  {
    key: "step3",
    number: 3,
    icon: "lucide:message-circle",
    title: t("home.howToPlay.step3.title"),
    description: t("home.howToPlay.step3.description"),
  },
  {
    key: "step4",
    number: 4,
    icon: "lucide:vote",
    title: t("home.howToPlay.step4.title"),
    description: t("home.howToPlay.step4.description"),
  },
]);

// Roles data
const roles = computed(() => [
  {
    key: "innocent",
    icon: "lucide:shield-check",
    title: t("home.roles.innocent.title"),
    description: t("home.roles.innocent.description"),
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  {
    key: "imposter",
    icon: "lucide:user-x",
    title: t("home.roles.imposter.title"),
    description: t("home.roles.imposter.description"),
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  {
    key: "mrWhite",
    icon: "lucide:ghost",
    title: t("home.roles.mrWhite.title"),
    description: t("home.roles.mrWhite.description"),
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
]);
</script>

<template>
  <div class="page-index">
    <!-- Hero Section -->
    <section class="relative py-20 md:py-32 overflow-hidden">
      <!-- Background gradient -->
      <div
        class="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/10 -z-10"
      />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"
      />

      <div class="container mx-auto px-4 text-center">
        <Badge variant="secondary" class="mb-4">
          <Icon name="lucide:sparkles" class="size-3 mr-1" />
          Visual Social Deduction
        </Badge>

        <h1
          class="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4"
        >
          {{ t("home.hero.title") }}
        </h1>

        <p class="text-xl md:text-2xl text-muted-foreground mb-2">
          {{ t("home.hero.subtitle") }}
        </p>

        <p
          class="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          {{ t("home.hero.description") }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" as-child>
            <NuxtLinkLocale to="rooms">
              <Icon name="lucide:play" class="size-5 mr-2" />
              {{ t("home.hero.playNow") }}
            </NuxtLinkLocale>
          </Button>
          <Button variant="outline" size="lg" as-child>
            <a href="#how-to-play">
              <Icon name="lucide:book-open" class="size-5 mr-2" />
              {{ t("home.hero.learnMore") }}
            </a>
          </Button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            {{ t("home.features.title") }}
          </h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            v-for="feature in features"
            :key="feature.key"
            class="text-center hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div
                class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2"
              >
                <Icon :name="feature.icon" class="size-6 text-primary" />
              </div>
              <CardTitle class="text-lg">{{ feature.title }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-muted-foreground text-sm">
                {{ feature.description }}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- How to Play Section -->
    <section id="how-to-play" class="py-20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            {{ t("home.howToPlay.title") }}
          </h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="step in steps"
            :key="step.key"
            class="relative text-center"
          >
            <!-- Step number -->
            <div
              class="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4"
            >
              {{ step.number }}
            </div>

            <!-- Connector line (hidden on last item and mobile) -->
            <div
              v-if="step.number < 4"
              class="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border"
            />

            <div
              class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3"
            >
              <Icon :name="step.icon" class="size-6 text-muted-foreground" />
            </div>

            <h3 class="font-semibold text-lg mb-2">{{ step.title }}</h3>
            <p class="text-muted-foreground text-sm">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Roles Section -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            {{ t("home.roles.title") }}
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card
            v-for="role in roles"
            :key="role.key"
            :class="['border-2', role.borderColor, role.bgColor]"
          >
            <CardHeader class="text-center pb-2">
              <div
                :class="[
                  'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2',
                  role.bgColor,
                ]"
              >
                <Icon :name="role.icon" :class="['size-8', role.color]" />
              </div>
              <CardTitle :class="role.color">{{ role.title }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-muted-foreground text-sm text-center">
                {{ role.description }}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <Card
          class="max-w-3xl mx-auto text-center bg-linear-to-br from-primary/5 to-secondary/10 border-primary/20"
        >
          <CardHeader>
            <CardTitle class="text-2xl md:text-3xl">
              {{ t("home.cta.title") }}
            </CardTitle>
            <CardDescription class="text-base">
              {{ t("home.cta.description") }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" as-child>
                <NuxtLinkLocale to="rooms-create">
                  <Icon name="lucide:plus" class="size-5 mr-2" />
                  {{ t("home.cta.createRoom") }}
                </NuxtLinkLocale>
              </Button>
              <Button variant="outline" size="lg" as-child>
                <NuxtLinkLocale to="rooms-join">
                  <Icon name="lucide:log-in" class="size-5 mr-2" />
                  {{ t("home.cta.joinRoom") }}
                </NuxtLinkLocale>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>
