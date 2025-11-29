# Plugins

Ce répertoire permet d'étendre votre application Vue en ajoutant des plugins qui seront chargés à la création de l'application.

## Structure

```ts
plugins/
├── foo.ts           // analysé
└── bar/
    ├── baz.ts      // non analysé
    ├── foz.vue     // non analysé
    └── index.ts    // analysé (déprécié)
```

## Création de plugins

### Plugin simple

```ts
// plugins/hello.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Configuration avec nuxtApp
});
```

### Plugin avec syntaxe objet (Recommandé pour cas avancés)

```ts
export default defineNuxtPlugin({
  name: "mon-plugin",
  enforce: "pre", // ou 'post'
  async setup(nuxtApp) {
    // Code du plugin
  },
  hooks: {
    "app:created"() {
      const nuxtApp = useNuxtApp();
    },
  },
});
```

## Ordre de chargement

Structure recommandée pour contrôler l'ordre :

```ts
plugins/
├── 01.monPlugin.ts
└── 02.autrePlugin.ts
```

## Stratégies de chargement

### Plugin parallèle

```ts
export default defineNuxtPlugin({
  name: "mon-plugin",
  parallel: true,
  async setup(nuxtApp) {
    // Le prochain plugin sera exécuté sans attendre le setup de celui-ci
  },
});
```

### Plugin avec dépendances

```ts
export default defineNuxtPlugin({
  name: "depend-de-mon-plugin",
  dependsOn: ["mon-plugin"],
  async setup(nuxtApp) {
    // Attend l'exécution de 'mon-plugin'
  },
});
```

## Helpers et Types

### Fournir des helpers (⚠️ Utiliser les composables de préférence)

```ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      hello: (msg: string) => `Hello ${msg}!`,
    },
  };
});
```

### Typage des plugins

```ts
// index.d.ts
declare module "#app" {
  interface NuxtApp {
    $hello(msg: string): string;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $hello(msg: string): string;
  }
}

export {};
```

## Plugins Vue

### Installation d'un plugin Vue (Exemple avec vue-gtag)

```ts
// plugins/vue-gtag.client.ts
import VueGtag, { trackRouter } from "vue-gtag-next";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueGtag, {
    property: {
      id: "GA_MEASUREMENT_ID",
    },
  });
  trackRouter(useRouter());
});
```

### Directives Vue

```ts
// plugins/my-directive.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("focus", {
    mounted(el) {
      el.focus();
    },
  });
});
```

> **Note:** Utilisez les suffixes `.client` ou `.server` pour charger un plugin uniquement côté client ou serveur.
