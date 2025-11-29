# Project Structure & File Naming

| Folder          | File Naming Style                       | Naming Conventions & Examples                                 |
| --------------- | --------------------------------------- | ------------------------------------------------------------- |
| `/pages`        | PascalCase `.vue`                       | `About.vue` → route `/about`                                  |
| `/components`   | PascalCase `.vue`                       | `UserCard.vue`, nested naming like `<BaseFooButton />`        |
| `/composables`  | `use` + PascalCase `.ts`                | `useUser.ts`, `useProductList.ts`                             |
| `/shared/types` | kebab-case `.ts`, PascalCase interfaces | `user.ts` exports `User`, `order-item.ts` exports `OrderItem` |
| `/layouts`      | kebab-case `.vue`                       | `default.vue`, `auth-layout.vue`                              |
| `/middleware`   | kebab-case `.ts`                        | `auth.ts` (named), `auth.global.ts` (global middleware)       |
| `/plugins`      | kebab-case `.ts`                        | `axios.ts`, `cache.client.ts`, `database.server.ts`           |

---

## Naming Conventions

| Item               | Naming Convention                                  | Example                            |
| ------------------ | -------------------------------------------------- | ---------------------------------- |
| Vue Components     | PascalCase, multi-word preferred                   | `UserCard.vue`, `<UserCard />`     |
| Composables        | Prefix “use” + PascalCase                          | `useFetch.ts`, `useCart.ts`        |
| Interfaces / Types | PascalCase, no `I` prefix                          | `User`, `Product`, `UserCardProps` |
| Layouts            | kebab-case filename                                | `default.vue`, `auth-layout.vue`   |
| Middleware         | kebab-case, `.global` suffix for global            | `auth.ts`, `logging.global.ts`     |
| Plugins            | kebab-case, `.client`/`.server` suffix when needed | `axios.ts`, `analytics.client.ts`  |

---

## Special Notes on Usage

- **Pages:** Nuxt converts PascalCase page filenames to kebab-case route URLs automatically.
- **Layouts:** Use kebab-case filenames like `auth-layout.vue` for clarity and explicitness even inside `/layouts`.
- **Middleware:**
  - `auth.ts` runs only on routes where explicitly assigned.
  - `auth.global.ts` runs on every route navigation automatically.
- **Plugins:** Use client/server suffixes to control plugin execution environment.
- **Shared Types:** Centralize your reusable TypeScript interfaces/types in `/shared/types` with kebab-case files and PascalCase types for easy imports across app and server code.
