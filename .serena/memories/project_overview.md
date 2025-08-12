# Temporal UI Project Overview

## Purpose

Temporal UI is the official web-based user interface for Temporal, a distributed workflow orchestration platform. The UI provides visualization and management capabilities for workflows, activities, schedules, and other Temporal primitives.

## Tech Stack

- **Frontend Framework**: SvelteKit + Svelte 5
- **Language**: TypeScript
- **Styling**: TailwindCSS + Custom Holocene design system
- **Package Manager**: pnpm (>=8.6.0)
- **Node Version**: >=18.15.0
- **Testing**:
  - Unit Tests: Vitest
  - E2E Tests: Playwright
  - Integration Tests: Playwright with mocks
- **Development Tools**:
  - ESLint for linting
  - Prettier for code formatting
  - Stylelint for CSS linting
  - Husky for git hooks
  - Storybook for component documentation

## Key Dependencies

- **Form Handling**: sveltekit-superforms with Zod validation
- **Date Handling**: date-fns, date-fns-tz
- **Code Editor**: Monaco Editor, CodeMirror
- **UI Components**: Custom Holocene design system
- **Internationalization**: i18next
- **State Management**: Svelte 5 runes ($state, $derived, $effect)

## Build Targets

- **Local Development**: Against local Temporal server
- **Docker**: Against Docker Compose Temporal setup
- **UI Server**: For integration with Go-based ui-server
- **Temporal CLI**: Against temporal-cli server

## Architecture

- **Components**: Custom component library (Holocene) in `src/lib/holocene/`
- **Pages**: Route-specific page components in `src/lib/pages/`
- **Services**: API interaction layer in `src/lib/services/`
- **Stores**: Svelte stores for state management in `src/lib/stores/`
- **Utilities**: Helper functions in `src/lib/utilities/`
- **Types**: TypeScript definitions in `src/lib/types/`
