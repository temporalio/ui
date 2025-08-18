# Codebase Structure

## Root Structure

- `src/` - Main source code
- `static/` - Static assets
- `tests/` - Test files
- `scripts/` - Build and utility scripts
- `temporal/` - Temporal-specific configurations

## Source Structure (`src/`)

- `routes/` - SvelteKit routes
  - `(app)/` - Main application routes
  - `(login)/` - Login-specific routes
- `lib/` - Shared library code
  - `components/` - Reusable Svelte components
  - `holocene/` - Holocene design system components
  - `theme/` - Theme configuration and colors
  - `utilities/` - Utility functions
  - `stores/` - Svelte stores
  - `types/` - TypeScript type definitions
  - `i18n/` - Internationalization
  - `services/` - API and service layer

## Key Files

- `src/app.css` - Global styles
- `src/app.html` - HTML template
- `tailwind.config.ts` - TailwindCSS configuration
- `CLAUDE.md` - Development guidelines
