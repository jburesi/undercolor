# Undercolor - Visual Social Deduction Platform

A modern, real-time visual social deduction game built with **Nuxt 4**, **Supabase**, and **Shadcn/ui**.

> **Note**: This project is based on the `nuxt-v4-template` but has been specialized into a full-fledged gaming platform.

## 📖 Documentation

- [**Technical Architecture & Design**](./docs/ARCHITECTURE.md) - Detailed report on the game's architecture, state management, and security.
- [**Naming Conventions**](./docs/NAMING_CONVENTIONS.md) - Code style and file naming standards.

## 🎮 Project Overview

**Undercolor** transposes the mechanics of linguistic social deduction games (like "Undercover") into the visual domain. Instead of words, players receive images.
- **Innocents (Majority)** receive **Image A**.
- **Imposters (Minority)** receive **Image B** (visually similar but with subtle differences).
- **Mr. White** receives no image.

Players must describe their image to prove their innocence without revealing too much information to the Imposters.

## ✨ Key Features

- **Real-time Gameplay**: Powered by **Supabase Realtime** for instant state synchronization.
- **Visual Dissonance**: Mechanics based on detail, context, and stylistic divergences in images.
- **Modern UI**: Built with **shadcn-vue** and **Tailwind CSS** for a premium, accessible experience.
- **Performance**: Optimized with **Nuxt Image** (WebP/AVIF) and Hybrid Rendering.
- **Security**: Anti-cheat measures, Zod validation, and server-side authority.

## 🛠️ Tech Stack

- **Framework**: Nuxt 4 (Nitro Engine)
- **Database & Realtime**: Supabase (PostgreSQL + Realtime)
- **UI Library**: shadcn-vue (Radix Vue + Tailwind)
- **State Management**: Pinia (Client) + XState (Server Logic)
- **Validation**: Zod
- **Image Optimization**: @nuxt/image

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Supabase CLI

### Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Environment Configuration:**

   Copy `.env.example` to `.env` and configure your Supabase credentials.

3. **Start Local Development:**

   ```bash
   pnpm dev
   ```

4. **Start Supabase (Local):**

   ```bash
   pnpm dlx supabase start
   ```

## 📂 Project Structure

- `src/app/` - Main application code.
- `src/app/components/ui/` - Shadcn components.
- `src/app/composables/game/` - Game logic hooks.
- `src/server/` - Server-side logic (API, State Machine).
- `supabase/` - Database configuration and migrations.

## 📄 License

[MIT](./LICENSE)
