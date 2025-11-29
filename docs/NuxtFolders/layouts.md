# Layouts

Ce répertoire permet de gérer les mises en page réutilisables de votre application Nuxt.

## Activation des Layouts

Pour activer les layouts, ajoutez `<NuxtLayout>` dans votre `app.vue` :

```ts
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

## Layout par défaut

Créez un layout par défaut dans `layouts/default.vue` :

```ts
<template>
  <div>
    <p>Contenu partagé entre toutes les pages</p>
    <slot />
  </div>
</template>
```

> **Note:** Les layouts doivent avoir un élément racine unique (qui ne peut pas être `<slot />`).

## Layouts nommés

Structure des dossiers :

```ts
layouts/
├── default.vue
└── custom.vue
```

### Utilisation dans une page

```ts
<script setup lang="ts">
definePageMeta({
  layout: "custom",
});
</script>
```

### Changement dynamique

```ts
<script setup lang="ts">
function changerLayout() {
  setPageLayout("custom");
}
definePageMeta({
  layout: false,
});
</script>
```

## Convention de nommage

Les noms de layouts sont normalisés en kebab-case :

| Fichier                         | Nom du layout   |
| ------------------------------- | --------------- |
| ~/layouts/desktop/default.vue   | desktop-default |
| ~/layouts/desktop-base/base.vue | desktop-base    |
| ~/layouts/desktop/Desktop.vue   | desktop         |

## Personnalisation par page

Pour un contrôle total sur une page spécifique :

```ts
<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>

<template>
  <div>
    <NuxtLayout name="custom">
      <template #header> Contenu d'en-tête personnalisé </template>
      Contenu principal
    </NuxtLayout>
  </div>
</template>
```

> **Important :** Si vous utilisez `<NuxtLayout>` dans vos pages, assurez-vous qu'il ne soit pas l'élément racine.
