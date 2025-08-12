# Temporal UI Codebase Structure

## Root Directory Structure

```
/Users/ross/code/ui/
├── src/                    # Main source code
├── server/                 # Go-based UI server
├── tests/                  # Test files (Playwright)
├── scripts/                # Build and utility scripts
├── temporal/               # Temporal worker and workflow definitions
├── plugins/                # Vite plugins
├── static/                 # Static assets
└── utilities/              # Development utilities
```

## Source Code Organization (`src/`)

### Core Application Structure

```
src/
├── lib/                    # Main library code
│   ├── components/         # UI components
│   ├── holocene/          # Design system components
│   ├── pages/             # Page-specific components
│   ├── services/          # API service layer
│   ├── stores/            # Svelte stores
│   ├── utilities/         # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── models/            # Data models and business logic
│   ├── layouts/           # Layout components
│   ├── theme/             # Theming and design tokens
│   ├── i18n/              # Internationalization
│   └── runes/             # Svelte 5 runes
├── routes/                # SvelteKit routes
├── fixtures/              # Test data and mock responses
├── app.html               # HTML template
├── app.css                # Global styles
└── global.d.ts            # Global type definitions
```

### Key Subdirectories

#### `src/lib/components/`

Organized by feature area:

- `activity/` - Activity-related components
- `batch-operations/` - Batch operation components
- `event/` - Event history and display components
- `workflow/` - Workflow-specific components
- `schedule/` - Schedule management components
- `search-attribute-filter/` - Search and filtering components

#### `src/lib/holocene/`

Custom design system components:

- Form components (input, select, checkbox, etc.)
- Navigation components (menu, tabs, pagination)
- Display components (card, table, modal, etc.)
- Feedback components (alert, toast, loading)

#### `src/lib/services/`

API service layer for different Temporal services:

- `workflow-service.ts` - Workflow operations
- `events-service.ts` - Event history
- `schedule-service.ts` - Schedule management
- `batch-service.ts` - Batch operations
- `namespaces-service.ts` - Namespace management

#### `src/lib/stores/`

Svelte stores for state management:

- `workflows.ts` - Workflow list state
- `events.ts` - Event history state
- `filters.ts` - Search and filter state
- `settings.ts` - User preferences
- `auth-user.ts` - Authentication state

#### `src/lib/utilities/`

Helper functions organized by purpose:

- Date/time formatting functions
- Data encoding/decoding utilities
- API request helpers
- Validation utilities
- URL and routing helpers

## Configuration Files

- `svelte.config.js` - SvelteKit configuration
- `tailwind.config.ts` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `playwright.config.ts` - Playwright test configuration
- `vitest.config.ts` - Vitest test configuration
- `.eslintrc.cjs` - ESLint configuration
- `package.json` - Dependencies and scripts

## Important Patterns

- **Alias Resolution**: Uses SvelteKit aliases (`$lib`, `$types`, `$components`)
- **Component Co-location**: Related components grouped by feature
- **Service Layer**: Clear separation between UI and API logic
- **Type Safety**: Comprehensive TypeScript coverage
- **Testing**: Separated unit, integration, and E2E test suites
