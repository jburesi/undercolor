# Modules

Le répertoire `modules/` permet d'enregistrer automatiquement des modules locaux dans votre application.

## Structure

Les fichiers sont automatiquement enregistrés selon les patterns suivants :

`modules/*/index.ts` \
`modules/*.ts`

## Exemple de module local

```ts
// modules/hello/index.ts
import { createResolver, defineNuxtModule, addServerHandler } from "nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "hello",
  },
  setup() {
    const { resolve } = createResolver(import.meta.url);

    // Ajoute une route API
    addServerHandler({
      route: "/api/hello",
      handler: resolve("./runtime/api-route"),
    });
  },
});
```

## Ordre d'exécution

1. Modules définis dans `nuxt.config.ts`
2. Modules trouvés dans le dossier `modules/` (ordre alphabétique)

### Contrôle de l'ordre d'exécution

Structure recommandée pour gérer l'ordre :

```ts
modules/
  1.first-module/
    index.ts
  2.second-module.ts
```

> **Note :** Il n'est pas nécessaire d'ajouter ces modules locaux séparément dans votre `nuxt.config.ts`.
