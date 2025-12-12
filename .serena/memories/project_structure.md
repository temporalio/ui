# Temporal UI Project Structure

## Root Directory

```
/Users/ross/code/ui/
├── src/                    # Source code
├── tests/                  # E2E and integration tests
├── static/                 # Static assets
├── server/                 # UI server build output
├── build/                  # Build output
├── dist/                   # Distribution files
├── node_modules/           # Dependencies
├── .storybook/            # Storybook configuration
├── scripts/               # Build and utility scripts
├── temporal/              # Temporal API protos (git submodule)
└── docs/                  # Documentation

## Source Structure
src/
├── app.css                # Global styles
├── app.html               # HTML template
├── app.d.ts               # Global TypeScript types
├── hooks.server.ts        # SvelteKit server hooks
├── lib/                   # Library code
│   ├── components/        # Reusable components
│   ├── holocene/         # Design system components
│   ├── services/         # API and business logic
│   ├── stores/           # Svelte stores
│   ├── types/            # TypeScript type definitions
│   ├── utilities/        # Helper functions
│   ├── i18n/            # Internationalization
│   ├── theme/           # Theme configuration
│   └── vendor/          # Third-party integrations
├── routes/              # SvelteKit routes
│   ├── (app)/          # Main app routes
│   ├── (auth)/         # Auth-related routes
│   └── api/            # API routes
└── fixtures/           # Test fixtures

## Key Directories

### Holocene Design System
src/lib/holocene/
- Alert, Button, Card, Modal components
- Form controls (Input, Select, Checkbox)
- Navigation (Tabs, VerticalNav)
- Data display (Table, CodeBlock)
- Layout components

### Routes Organization
src/routes/(app)/
├── namespaces/         # Namespace management
├── workflows/          # Workflow listing and details
├── schedules/          # Schedule management
├── batch-operations/   # Batch operations
└── nexus/             # Nexus endpoints

### Component Patterns
- Route-specific: `routes/.../\_components/`
- Reusable: `lib/components/`
- Design system: `lib/holocene/`

## Configuration Files
- `vite.config.ts` - Vite configuration
- `svelte.config.js` - SvelteKit configuration
- `tailwind.config.ts` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `.env.*` - Environment configurations
- `playwright.config.ts` - E2E test configuration
- `vitest.config.ts` - Unit test configuration

## Build Outputs
- `dist/` - Local build output
- `server/ui/assets/` - UI server assets
- `.svelte-kit/` - SvelteKit build cache
- `build/` - Production build

## Important Files
- `CLAUDE.md` - AI assistant instructions
- `package.json` - Dependencies and scripts
- `.prettierrc` - Code formatting rules
- `.eslintrc.cjs` - Linting rules
- `.stylelintrc` - CSS linting rules
```
