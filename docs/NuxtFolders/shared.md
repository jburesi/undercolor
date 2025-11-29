# Shared

Le répertoire `shared/` permet de partager du code entre l'application Vue et le serveur Nitro.

> **Note:** Disponible depuis Nuxt v3.14+

## Structure et auto-importation

```ts
shared/
├── capitalize.ts        # Non auto-importé
├── formatters/
│   └── lower.ts        # Non auto-importé
├── utils/
│   ├── lower.ts        # Auto-importé ✅
│   └── formatters/
│       └── upper.ts    # Non auto-importé
└── types/
    └── bar.d.ts        # Auto-importé ✅
```

## Utilisation

### Méthode 1 : Export nommé

```ts
// shared/utils/capitalize.ts
export const capitalize = (input: string) => {
  return input[0] ? input[0].toUpperCase() + input.slice(1) : "";
};
```

### Méthode 2 : Export par défaut

```ts
// shared/utils/capitalize.ts
export default function capitalize(input: string) {
  return input[0] ? input[0].toUpperCase() + input.slice(1) : "";
}
```

### Importation manuelle (pour les fichiers non auto-importés)

```ts
// Import depuis la racine de shared/
import capitalize from "#shared/capitalize";

// Import depuis un sous-dossier
import lower from "#shared/formatters/lower";
```

## Exemple d'utilisation

### Dans une page Vue

```ts
<script setup lang="ts">
const hello = capitalize("hello");
</script>

<template>
  <div>{{ hello }}</div>
</template>
```

### Dans une API serveur

```ts
// server/api/hello.get.ts
export default defineEventHandler((event) => {
  return {
    hello: capitalize("hello"),
  };
});
```

## Limitations importantes

- ⚠️ Le code dans `shared/` ne peut pas importer de code Vue ou Nitro
- ✅ Seuls les fichiers dans `shared/utils/` et `shared/types/` sont auto-importés
- ⚠️ Les fichiers dans les sous-dossiers de `utils/` et `types/` ne sont pas auto-importés
