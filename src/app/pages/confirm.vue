<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const localePath = useLocalePath();
</script>

<template>
  <div class="page-confirm">
    <div class="container mx-auto px-4 py-16 max-w-md text-center">
      <div class="mb-8">
        <div
          class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
        >
          <Icon name="lucide:check-circle" class="size-8 text-green-500" />
        </div>
        <h1 class="text-2xl font-bold mb-2">Authentication Successful</h1>
        <p class="text-muted-foreground">
          You have been successfully authenticated. Redirecting...
        </p>
      </div>

      <Button as-child>
        <NuxtLink :to="localePath('/')">
          <Icon name="lucide:home" class="size-4 mr-2" />
          Go to Home
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
