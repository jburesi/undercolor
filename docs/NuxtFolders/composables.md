# Composables

Ce répertoire permet d'auto-importer vos composables Vue dans votre application.

## Utilisation

### Méthode 1 : Export nommé

```ts
// composables/useFoo.ts
export const useFoo = () => {
  return useState("foo", () => "bar");
};
```

### Méthode 2 : Export par défaut

```ts
// composables/use-foo.ts ou composables/useFoo.ts
export default function () {
  return useState("foo", () => "bar");
}
```

## Exemple d'utilisation

```ts
<script setup lang="ts">
const foo = useFoo();
</script>

<template>
  <div>{{ foo }}</div>
</template>
```

## Types

Nuxt génère automatiquement le fichier `.nuxt/imports.d.ts` pour les déclarations de types.

> **Note:** Exécutez `nuxi prepare`, `nuxi dev` ou `nuxi build` pour générer les types.

## Structure des fichiers

Nuxt analyse par défaut uniquement les fichiers à la racine du dossier `composables/` (pour l'auto-importation):

```ts
composables/
├── index.ts     // analysé
├── useFoo.ts    // analysé
└── nested/
    └── utils.ts // non analysé
```

### Pour les modules imbriqués

1. **Méthode recommandée** - Ré-export depuis `composables/index.ts`:

```ts
export { utils } from "./nested/utils.ts";
```

1. **Configuration du scanner** - Dans `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  imports: {
    dirs: [
      "composables",
      "composables/*/index.{ts,js,mjs,mts}",
      "composables/**",
    ],
  },
});
```

## Notes importantes

- La réactivité est gérée via l'API de Composition Vue (ref, reactive)
- Les composables peuvent utiliser d'autres composables et accéder aux injections des plugins
