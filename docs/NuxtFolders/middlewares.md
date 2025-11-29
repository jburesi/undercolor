# Middlewares

Les middlewares permettent d'exécuter du code avant la navigation vers une route particulière.

## Types de Middlewares

Il existe trois types de middlewares :

1. **Anonymes** : Définis directement dans la page
2. **Nommés** : Placés dans le dossier `middleware/`
3. **Globaux** : Placés dans `middleware/` avec suffixe `.global`

> **Note :** Les noms des `middleware` sont normalisées en kebab-case: monMiddleware devient mon-middleware.

## Utilisation

### Exemple de middleware nommé

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path !== "/") {
    return navigateTo("/");
  }
});
```

### Utilisation dans une page

```ts
<script setup>
definePageMeta({
  middleware: ['auth']
  // ou middleware: 'auth'
})
</script>
```

## Ordre d'exécution

1. Middlewares globaux
2. Middlewares définis dans la page

### Structure recommandée pour l'ordre

```ts
middleware/
├── 01.setup.global.ts
├── 02.analytics.global.ts
└── auth.ts
```

## Retours possibles

- `return` : Continue la navigation
- `return navigateTo('/')` : Redirige vers le chemin spécifié
- `return abortNavigation()` : Arrête la navigation
- `return abortNavigation(error)` : Arrête avec une erreur

## Ajout dynamique (Plugin)

```ts
export default defineNuxtPlugin(() => {
  addRouteMiddleware(
    "global-test",
    () => {
      console.log("Middleware global ajouté via plugin");
    },
    { global: true },
  );
});
```

## Configuration au build (Pas recomandée)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    'pages:extend' (pages) {
      function setMiddleware(pages) {
        for (const page of pages) {
          if (/* condition */) {
            page.meta ||= {}
            page.meta.middleware = ['named']
          }
          if (page.children) {
            setMiddleware(page.children)
          }
        }
      }
      setMiddleware(pages)
    }
  }
})
```

> **Note :** Les middlewares s'exécutent dans la partie Vue de l'application, et sont différents des middlewares serveur de Nitro.
