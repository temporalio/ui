# Temporal UI Project Overview

## Purpose

Temporal UI is the official web interface for Temporal.io, a workflow orchestration platform. It provides a comprehensive dashboard for managing workflows, schedules, namespaces, and other Temporal entities.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (using runes: $state, $derived, $effect)
- **Language**: TypeScript
- **Styling**: TailwindCSS with Holocene design system
- **Forms**: SuperForms with Zod validation
- **Testing**: Vitest for unit tests, Playwright for E2E/integration
- **Linting**: ESLint, Prettier, Stylelint
- **Package Manager**: pnpm (>= 8.6.0)
- **Node**: >= 18.15.0

## Key Dependencies

- @temporalio/\* packages for Temporal SDK integration
- Monaco Editor for code editing
- i18next for internationalization
- date-fns for date handling
- CodeMirror for syntax highlighting

## Design System

Uses Holocene design system components with custom Temporal branding and color palette.
