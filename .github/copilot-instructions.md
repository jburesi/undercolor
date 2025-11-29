# Copilot Instructions - Undercolor (Visual Social Deduction Platform)

## Architecture Overview

This is a **Nuxt 4** project implementing a real-time visual social deduction game ("Undercolor").
It uses a custom directory structure with `srcDir: "src/app"`.

**Key Architectural Pillars:**

- **Visual Dissonance**: The core mechanic relies on serving slightly different images to Innocents vs. Imposters.
- **Real-time State**: **Supabase Realtime** is used for game state synchronization (Presence, Broadcast).
- **Server Authority**: Game logic (phases, voting, elimination) is validated server-side (Nitro) to prevent cheating.
- **State Machine**: **XState** is used on the server to manage complex game phases (Lobby -> Distributing -> Debate -> Vote).
- **Modular API**: Custom `useAPI()` composable for REST interactions, and specific composables for Realtime logic.

## Critical Directory Structure

```txt
src/app/           # Main application code (Nuxt srcDir)
  composables/     
    game/          # Game-specific logic (useGameSocket, useTurnTimer)
    common/        # Shared UI logic
  components/ui/   # shadcn/ui components
  layouts/         # Game layouts (default, game-room)
  middleware/      # Route guards (auth, game-state)
  types/           # Database types (auto-generated) & Game types
src/server/        # Server-side code
  api/             # REST Endpoints (upload, room management)
  utils/           # Server-side game logic (XState machines)
src/shared/        # Shared utilities across app/server
```

## Code Conventions

Follow `docs/NAMING_CONVENTIONS.md`:

- **Components**: PascalCase (e.g., `RevealCard.vue`)
- **Composables**: `use` prefix + PascalCase (e.g., `useGameStore.ts`)
- **Pages**: PascalCase files → kebab-case routes
- **Middleware**: kebab-case, `.global.ts` for global middleware
- **Types**: PascalCase interfaces, kebab-case filenames

## Development Workflows

**Type Generation**:

```bash
pnpm supabase:gen  # Generates database.types.ts from Supabase schema
```

### Database Migration Management

To create a diff file for database changes (e.g., adding agencies):

```bash
pnpm dlx supabase db diff -f migration_name
```

**Linting Strategy**:

```bash
pnpm lint          # Runs ESLint + Prettier + Markdownlint
pnpm lint:fix      # Auto-fixes all linting issues
```

> **Note:** Linting runs automatically via Husky pre-commit hooks and format-on-save is configured

**Key Commands**:

- `pnpm dev` - Development server on localhost:3000
- `pnpm build` - Production build
- Package manager: **PNPM** (not npm or yarn)
- Husky pre-commit hooks run lint-staged automatically

## Integration Patterns

**Real-time Game Pattern**:

```typescript
// Use Supabase Realtime for game events
const channel = supabase.channel(`room:${roomId}`)
  .on('broadcast', { event: 'game_state' }, (payload) => {
    // Update local store
  })
  .subscribe()
```

**API Client Pattern**:

```typescript
// Use useAPI() instead of direct useFetch for external APIs
const { data } = useAPI<GameRoom>("rooms/create", { method: "POST" });
```

**Supabase Auth**: `useSupabaseUser()` in middleware for route protection.

## Game Logic Principles

- **Anti-Cheat**: NEVER send the full list of roles to the client. Only send the player's own role and image.
- **Image Handling**: Use `<NuxtImg>` with `preload` for game assets to ensure fairness (no loading lag).
- **Validation**: All inputs (votes, settings) must be validated with **Zod** schemas on the server.

## i18n Best Practices

- Use `useLocalePath()` for all internal links.
- Use `<NuxtLinkLocale>` instead of `<NuxtLink>`.
