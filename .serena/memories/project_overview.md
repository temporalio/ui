# Temporal UI Project Overview

## Purpose

Temporal UI is a web-based interface for the Temporal workflow orchestration platform. It provides a visual interface for managing and monitoring Temporal workflows, activities, namespaces, and other Temporal resources.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5
- **Language**: TypeScript
- **Styling**: TailwindCSS + PostCSS
- **Design System**: Holocene (custom component library)
- **Build Tool**: Vite
- **Package Manager**: pnpm (>=8.6.0)
- **Node Version**: >=18.15.0
- **Testing**: Vitest (unit), Playwright (e2e/integration), Storybook (components)
- **Code Quality**: ESLint, Prettier, Stylelint, svelte-check
- **Forms**: SuperForms with Zod validation
- **State Management**: Svelte stores and runes

## Key Features

- Workflow execution monitoring and management
- Namespace management
- Search attributes configuration
- Activity tracking
- Real-time updates
- Multi-language support (i18n)

## Development Modes

- `dev`: Local development with UI server
- `dev:temporal-cli`: Development with Temporal CLI
- `dev:docker`: Development against Docker Compose Temporal
- `dev:local-temporal`: Development with local Temporal server

## Architecture

- Server-side rendering with SvelteKit
- Type-safe API calls using generated TypeScript types
- Responsive design with mobile support
- Modular component architecture using Holocene design system
