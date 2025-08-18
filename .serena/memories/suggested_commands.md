# Essential Development Commands

## Core Development

- `pnpm dev` - Start dev server with UI server mode
- `pnpm dev:local-temporal` - Start with local Temporal server
- `pnpm dev:docker` - Start with Docker Temporal server

## Quality Assurance

- `pnpm lint` - Run all linters (prettier, eslint, stylelint)
- `pnpm check` - TypeScript type checking
- `pnpm test -- --run` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:integration` - Run integration tests

## Building

- `pnpm build:local` - Build for local development
- `pnpm build:docker` - Build for Docker environment
- `pnpm build:server` - Build for server deployment

## Formatting & Fixing

- `pnpm format` - Auto-fix all formatting issues
- `pnpm prettier:fix` - Fix Prettier issues
- `pnpm eslint:fix` - Fix ESLint issues
- `pnpm stylelint:fix` - Fix Stylelint issues

## Other Utilities

- `pnpm stories:dev` - Start Storybook
- `pnpm workflows` - Run workflow scripts
- `pnpm audit:tailwind` - Audit Tailwind colors
