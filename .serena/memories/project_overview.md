# Temporal UI Project Overview

## Purpose

Temporal UI is the web interface for Temporal.io, built as a modern SvelteKit application. This is the frontend component that provides workflow monitoring, management, and interaction capabilities for Temporal workflows.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5
- **Language**: TypeScript
- **Styling**: TailwindCSS + Holocene/Anthropocene design system
- **Package Manager**: pnpm (>=8.6.0)
- **Node**: >=18.15.0
- **Testing**: Vitest (unit), Playwright (e2e/integration)
- **Linting**: ESLint, Prettier, Stylelint

## Current Migration Status

The project is currently migrating from Holocene to Anthropocene design system and upgrading from Svelte 4 to Svelte 5. Many components still need conversion from:

- `export let` → `$props()`
- `<slot>` → `{@render}` syntax
- `on:event` → `onevent` handlers
- `createEventDispatcher` → callback props

## Key Directories

- `src/lib/anthropocene/` - New design system components (being migrated to Svelte 5)
- `src/lib/holocene/` - Old design system (being phased out)
- `tests/` - Playwright tests (e2e and integration)
- `src/routes/` - SvelteKit routes
