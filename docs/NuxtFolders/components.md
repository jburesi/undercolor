# Composants dans Nuxt 3

Le dossier `components/` est l'endroit où vous placez tous vos composants Vue. Nuxt offre plusieurs fonctionnalités clés :

## Import automatique

Nuxt importe automatiquement tous les composants de ce dossier. Par exemple :

```javascript
// components/AppHeader.vue
<template>
  <header>Mon en-tête</header>
</template>
```

Vous pouvez l'utiliser directement dans vos pages sans import.

```javascript
<template>
  <div>
    <AppHeader />
  </div>
</template>
```

## Nommage des composants

Les composants sont nommés en fonction de leur chemin :

- `components/base/Button.vue` devient `<BaseButton />`
- `components/ui/forms/Input.vue` devient `<UiFormsInput />`

## Fonctionnalités principales

- **Composants dynamiques** : Utilisez le préfixe `Lazy` pour le chargement à la demande
- **Composants client** : Suffixe `.client.vue` pour rendu côté client uniquement
- **Composants serveur** : Suffixe `.server.vue` pour rendu côté serveur

## Configuration

Dans `nuxt.config.ts` vous pouvez personnaliser la configuration.

```javascript
export default defineNuxtConfig({
  components: {
    dirs: ["~/components", "~/custom-components"],
  },
});
```
