# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: Base image with pnpm
# =============================================================================
FROM node:24-alpine AS base

# Install pnpm globally
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set working directory
WORKDIR /app

# =============================================================================
# Stage 2: Install dependencies
# =============================================================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies (including devDependencies for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# =============================================================================
# Stage 3: Build the application
# =============================================================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

ENV NODE_ENV=production

# Build the Nuxt application
RUN pnpm build

# =============================================================================
# Stage 4: Production image
# =============================================================================
FROM node:24-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=node:node /app/.output ./.output

# Copy Supabase configuration and migrations
COPY --from=builder --chown=node:node /app/supabase ./supabase

ENV NODE_ENV=production

# Switch to non-root user
USER node

# Expose the port
EXPOSE 3000

# Configure healthcheck
HEALTHCHECK --interval=5s --timeout=5s --retries=10 \
    CMD ["curl", "-sf", "http://localhost:3000/"]

# Start the application
CMD ["node", ".output/server/index.mjs"]
