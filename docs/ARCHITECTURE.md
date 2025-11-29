# Detailed Technical Report: Architecture, Design, and Implementation of a Visual Social Deduction Platform

## 1. Introduction and Conceptual Analysis of the Visual Paradigm

The transition of social deduction games based on linguistics, such as the classic "Undercover" or "Spyfall", towards a purely visual medium represents a substantial design and engineering challenge. In traditional versions, ambiguity lies in semantics: the words "Ocean" and "Sea" share a large but distinct conceptual space. The player must navigate this verbal gray area to prove their membership in the majority group (the Innocents) without giving too much information to the intruder (the Imposter).

The current demand aims to transpose this subtle mechanic into the domain of visual perception, using modern web technologies such as Nuxt 3 and Shadcn-vue. This report details the architecture necessary to support such an experience, focusing on synchronous game state management, visual asset optimization, and content administration.

### 1.1 Visual Dissonance as a Game Mechanic

The core gameplay relies on the distribution of two distinct but perceptually similar images: **Image A** for the majority (Innocents) and **Image B** for the minority (Imposter). Unlike words, images are processed cognitively with an immediacy that leaves little room for semantic ambiguity if the divergence is too flagrant. If Image A represents a dog and Image B a cat, the deduction is instant and the game collapses. The design must therefore orient towards "visual cognitive dissonance".

This dissonance can manifest in three main ways, directly influencing the image curation strategy by the administrator:

1.  **Detail Divergence**: Both images show the same scene (e.g., a crowded market), but a specific object (a red umbrella) is absent or modified in Image B. This forces players to describe peripheral elements rather than the central subject.
2.  **Contextual Divergence**: The main subject is identical (a lion), but the context differs subtly (zoo vs. savanna). This forces players to describe the ambiance or lighting.
3.  **Stylistic Divergence**: The scene is identical, but the rendering differs (photorealism vs. oil painting). This is often the most difficult variation to verbalize without betraying oneself.

The integration of a third role, such as "Mr. White" (or the Amnesiac), who receives no image or a white noise image, adds a layer of social complexity. This player must rely exclusively on the verbal cues of others to bluff, transforming the game into an exercise of pure social engineering.

### 1.2 High-Level Technical Architecture

To support these real-time interactions with minimal latency, the application must rely on a robust architecture. The choice of **Nuxt 3** as the main framework allows unifying frontend and backend development thanks to the Nitro server engine. The user interface, built with **shadcn-vue**, ensures visual consistency and native accessibility, crucial for a consumer application.

Game state management, critical for synchronizing voting and reveal phases, will be handled via **Supabase Realtime** coupled with a finite state machine (**XState**) server-side to ensure rule integrity.

## 2. Frontend Infrastructure: Nuxt 3 and Modular Architecture

The adoption of Nuxt 3 is justified not only by its popularity but by its ability to handle hybrid rendering, a necessity for a game that combines static pages (rules, landing page) and dynamic applications (game rooms).

### 2.1 Configuration and Project Structure

The project structure must reflect the clear separation between game logic, user interface, and administration. Initialization via `npx nuxi init` must be immediately followed by the integration of essential modules for optimization and developer experience (DX).

**Table 1: Recommended Nuxt Module Configuration**

| Module | Critical Function | Technical Justification |
| :--- | :--- | :--- |
| `@nuxtjs/tailwindcss` | Style Engine | Allows rapid prototyping and native integration with Shadcn. |
| `shadcn-nuxt` | UI Components | Provides accessible and customizable components without heavy dependencies. |
| `@nuxt/image` | Visual Optimization | Crucial for serving Image A/B in WebP/AVIF format with automatic resizing. |
| `@vueuse/nuxt` | Composition Utilities | Window event management, clipboard (copy room link), and WebRTC. |

The directory structure must isolate business logic. A `composables/game` folder will group specific hooks like `useGameSocket` or `useTurnTimer`, while `server/api` will handle interactions with the Supabase database for retrieving image sets.


## 3. User Interface Design: Shadcn and Visual Experience

The requirement to use **shadcn-vue** orients development towards a "component-centric" approach where interface code is an integral part of the project, rather than being hidden in an opaque third-party library.

### 3.1 Philosophy and Advantages of Shadcn

Unlike Vuetify or Element Plus, Shadcn is not a traditional component library but a collection of "blueprints" based on Radix Vue and Tailwind CSS. This means each component (Button, Dialog, Card) is copied directly into the `/components/ui` folder.

This approach offers total flexibility. For a game like Undercover, where visual ambiance is paramount (dark themes, suspense), the ability to directly modify Tailwind classes in the `Card` component source code to create a custom "flip" effect is a major asset. Furthermore, accessibility is natively handled by Radix, ensuring that voting modals and dropdown menus are keyboard navigable, a modern software quality requirement.

### 3.2 Critical Gameplay Components

The game interface relies on several key components that must be carefully orchestrated:

*   **The Reveal Card (`RevealCard`)**: This is the central element. It must handle the "hidden" state (tap to reveal) to prevent prying eyes from seeing the image if the game is played physically with phones. Using `<NuxtImg>` inside this component ensures the image is optimally loaded (WebP format) even before the player clicks to reveal it, thanks to preloading attributes.
*   **The Voting System (`VotingGrid`)**: During the elimination phase, players must select a suspect. A grid of avatars using Shadcn's `Avatar` component, combined with state indicators ("Voted" badges), allows clear visualization. Interaction must be fluid: one click selects, a second confirms. Shadcn's `Dialog` component is ideal for requesting final confirmation ("Are you sure you want to vote against Player X?") to avoid frequent touch errors on mobile.
*   **The Timer (`Progress`)**: Time management is essential to maintain pace. Shadcn's `Progress` component, animated via CSS transitions, provides immediate visual feedback on remaining time for debate or voting. It must be synchronized with the server to avoid lags.

### 3.3 Theming and Dark Mode

The atmosphere of a social deduction game naturally lends itself to a dark aesthetic ("Dark Mode"). Shadcn handles this natively via Tailwind's `dark:` utility classes. Integrating the `@nuxtjs/color-mode` module allows automatically switching the theme based on user system preferences or via a manual toggle in the lobby. For immersion, it is recommended to force a dark theme by default when entering an active game "Room".

## 4. Real-Time Communication Architecture

The functional heart of the game lies in its ability to synchronize state between multiple clients (3 to 20 players). The choice of protocol and management library is decisive for experience stability.

### 4.1 Architectural Decision: Supabase Realtime

To ensure reliability and leverage the existing Supabase infrastructure, **Supabase Realtime** is chosen. It handles WebSocket connections, broadcasting, and presence natively, simplifying the stack by removing the need for a separate Node.js WebSocket server.

*   **Presence**: Used to track connected players in a room (`roomId`).
*   **Broadcast**: Used to send game events (phase changes, timer updates) to all clients in a room.
*   **Postgres Changes**: Can be used to listen for database updates if game state is persisted.

### 4.2 Room Manager Implementation

The server must not just relay messages; it must be authoritative on game state. A "Room Manager" is necessary to store in-memory game states (or in Redis/Database for persistence).

A typical data structure for a Room would look like this:

```typescript
interface GameRoom {
  roomId: string;
  hostId: string;
  config: GameConfig; // Timer, number of imposters
  players: Map<string, Player>; // Map<SocketId, PlayerData>
  state: GameState; // LOBBY, DISTRIBUTING, PLAYING, VOTING, FINISHED
  assets: {
    civilianImage: string;
    imposterImage: string;
  };
  votes: Map<string, string>; // VoterId -> TargetId
}
```

Using `Map` to store players and votes is preferable to standard objects to facilitate iterations and guarantee insertion order, crucial for determining speaking order during the description phase.

### 4.3 Security and Anti-Cheat via WebSockets

In a hidden role game, information is power. A critical vulnerability would be sending the full game state (who is who) to all clients and letting the frontend filter the display. A clever user could inspect WebSocket packets and discover the identity of imposters.

**Principle of Least Privilege**: The server must send personalized payloads to each client.

*   During role distribution (`GAME_START`), the server iterates over connected sockets in the room.
*   To Client A (Innocent), it sends `{ role: 'CIVILIAN', image: 'url_image_A' }`.
*   To Client B (Imposter), it sends `{ role: 'IMPOSTER', image: 'url_image_B' }`.

The client never receives the full list of roles. The server manages victory logic by comparing internal votes with roles stored in memory.

## 5. Backend Logic and Finite State Machines (FSM)

The complexity of game phases (Lobby -> Distribution -> Description -> Vote -> Result) requires rigorous management to avoid invalid states (e.g., a player voting when the voting phase is over). Using **XState** server-side is recommended to model this logic.

### 5.1 State Machine Modeling

A finite state machine (FSM) explicitly defines possible states and allowed transitions.

**Table 2: Game States and Transitions**

| State | Description | Allowed Transitions (Events) |
| :--- | :--- | :--- |
| `LOBBY` | Waiting room, configuration. | `PLAYER_JOIN`, `START_GAME` (Host only) |
| `DISTRIBUTING` | Fetching images, assigning roles. | Automatic transition to `OBSERVATION` |
| `OBSERVATION` | Players look at their image (Short timer). | `TIMER_END` -> `DEBATE` |
| `DEBATE` | Free discussion or turn-based. | `TIMER_END` -> `VOTING`, `FORCE_VOTE` (Admin) |
| `VOTING` | Secret vote collection. | `CAST_VOTE` (if player alive), `ALL_VOTED` -> `RESOLVING` |
| `RESOLVING` | Calculating eliminations and win conditions. | `GAME_OVER` (Win/Loss), `NEXT_ROUND` -> `DEBATE` |

Integrating XState allows defining "Guards". For example, the `CAST_VOTE` transition is protected by a condition `isPlayerAlive && !hasAlreadyVoted`. If this condition is not met, the event is ignored, preventing any cheating or interface bugs.

### 5.2 Handling Disconnections and Reconnections

A major challenge of web games is connection volatility (especially on mobile). If a player loses WiFi connection for 2 seconds, the socket disconnects. The system must handle "graceful reconnection".

1.  The server keeps the player in memory for a grace period (e.g., 60 seconds) after a disconnection event. Their status changes to `DISCONNECTED` but they are not removed from the game.
2.  If the player reconnects with the same `sessionId` (stored in localStorage or a cookie), the server sends them the current game state and re-establishes their socket connection, allowing them to resume the game without interruption.

### 5.3 Role Distribution Algorithm

The role assignment logic must be fair and random. It adapts to the number of players present in the room at launch.

*   **3-5 Players**: 1 Imposter.
*   **6-8 Players**: 2 Imposters.
*   **9+ Players**: 2 Imposters + 1 Mr. White.

The algorithm uses a Fisher-Yates shuffle to randomize a pre-generated array of roles, then assigns these roles sequentially to the IDs of connected sockets. This operation is atomic and occurs in the `DISTRIBUTING` state before any communication with clients.

## 6. Data Management and Image Administration

The "Admin" aspect required by the client implies a dedicated interface to manage the image library, which constitutes the playable content.

### 6.1 Storage and Database: Supabase

Using **Supabase** (PostgreSQL + Storage) is ideal for this project, integrating perfectly with Nuxt.

*   **Database (PostgreSQL)**:
    *   Table `image_sets`: Contains metadata (ID, Name, Difficulty, Category).
    *   Table `images`: Contains links to files, linked by `set_id`. Each set typically has two entries here: one marked `role: 'MAJORITY'` and the other `role: 'MINORITY'`.
*   **Storage (S3 Compatible)**: A public or private bucket to store actual image files. To secure images (prevent someone from scanning the bucket to see all pairs), one can use signed URLs with limited duration, generated by the Nuxt server at the time of distribution.

### 6.2 Upload Workflow and Admin Dashboard

The administration interface, built with Shadcn `DataTable` and `Dialog`, allows creating image pairs.

*   The upload form must handle two files simultaneously (Image A and Image B).
*   **Client Validation**: Before upload, the script checks that both images have similar dimensions (aspect ratio). A ratio difference (e.g., a square image vs. a portrait image) would be a fatal visual clue allowing players to guess their role without analyzing content.
*   **Server Processing (`/server/api/upload`)**: Nuxt receives files via `readMultipartFormData`. It is crucial to rename files with random UUIDs to prevent the original filename (e.g., "lion_zoo.jpg" vs "lion_savanna.jpg") from betraying the content if a player inspects the image source.

### 6.3 AI Image Generation (Future Extension)

To ensure infinite replayability and perfect visual similarity (same style, same lighting), integrating an AI image generation API (like OpenAI DALL-E 3 or Stable Diffusion) can be considered. The admin would enter a prompt ("A medieval castle in the rain") and request two variations with slightly different "seeds" or a low "denoising strength" parameter to create Image B from Image A. This guarantees absolute stylistic consistency, making the game more subtle.

## 7. Optimization and Performance

To satisfy the "optimization modules" requirement, several strategies specific to Nuxt 3 must be deployed.

### 7.1 Nuxt Image and Modern Formats

The `@nuxt/image` module is indispensable. It allows on-the-fly transformation of uploaded images (often heavy JPEGs) into WebP or AVIF formats, which are much lighter.

```html
<NuxtImg 
  :src="imageSecret" 
  format="webp" 
  quality="80" 
  sizes="sm:100vw md:50vw lg:400px" 
  preload 
/>
```

The `sizes` attribute ensures mobiles download a smaller version than desktop screens, saving critical bandwidth on cellular networks. The `preload` attribute injects a `<link rel="preload">` tag in the head, forcing the browser to download the image as soon as the phase loading starts, minimizing the risk of a player seeing their image appear after others.

### 7.2 Code Splitting and Lazy Loading

The application contains two distinct parts: the game (light, fast) and the admin (heavy, rich in forms). It is useless to load admin code for a regular player.

Nuxt handles this automatically via its folder structure, but optimization can be reinforced using `Lazy` components (e.g., `LazyVotingModal`). This component will only be downloaded by the client when the voting phase begins, reducing the initial load time of the room.

Administration routes must be protected and ideally excluded from the main bundle via specific build configuration if possible, or simply loaded dynamically.

### 7.3 Caching and Edge Computing

For static assets (JS, CSS, Public Images), using a CDN is standard. However, for API requests (e.g., retrieving the list of public rooms), using **SWR** (Stale-While-Revalidate) via Nitro `routeRules` allows serving an instant response while updating it in the background.

**Example `nuxt.config.ts`:**

```typescript
routeRules: {
  '/api/rooms': { swr: 10 }, // Cache room list for 10 seconds
  '/api/images/**': { headers: { 'Cache-Control': 'max-age=3600' } }
}
```

This reduces load on the Supabase database and speeds up navigation in the lobby.

## 8. Security and Game Integrity

### 8.1 Protection against Inspection (Anti-Cheat)

As mentioned, DOM inspection is a threat.

*   **URL Obfuscation**: Image URLs must not contain "imposter" or "civilian".
*   **Canvas Rendering**: Instead of displaying a simple `<img>` tag, the image can be drawn into a `<canvas>` element. This prevents "right-click -> open image" and makes source URL extraction harder for a non-technical user.
*   **Context Menu Disabling**: Preventing right-click on the image via `@contextmenu.prevent` is a simple but effective measure against quick image saving for sharing outside the game.

### 8.2 Rate Limiting and Validation

To protect the Supabase Realtime/Server against Denial of Service (DoS) attacks or vote spamming:

*   Implement a **Rate Limiter** (via `rate-limiter-flexible` and Redis/Memory) on socket events. A player cannot send more than 5 "VOTE" events per second.
*   **Strict Payload Validation with Zod**. Each incoming event (`join_room`, `vote`, `update_settings`) is parsed by a Zod schema. If the structure is incorrect (e.g., negative vote or empty string), the event is silently rejected, protecting server logic from malformed data.

## 9. Conclusion

Realizing a visual "Undercover" game with Nuxt 3 and Shadcn-vue is an ambitious project requiring fine orchestration between the reactive frontend and real-time backend. The proposed architecture relies on solid pillars: **Supabase Realtime** for synchronization, **XState** for infallible game logic, **Supabase** for persistence, and **Nuxt Image** for visual performance.

This modular approach guarantees not only a fluid and aesthetic user experience (thanks to Shadcn) but also long-term maintainability. Clear separation of responsibilities (Room Manager vs Socket Handler) and the use of TypeScript at all levels (shared types) drastically reduce technical debt. By respecting optimization strategies (WebP, Lazy Loading) and security (Zod Validation, Obfuscation), this platform is ready to move from a prototype to a production application capable of hosting thousands of simultaneous players.
