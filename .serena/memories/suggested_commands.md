# Essential Commands for Temporal UI Development

## Development Commands

```bash
# Start development server
pnpm dev                    # Default: UI server mode on http://localhost:3000
pnpm dev:temporal-cli       # Against temporal-cli server
pnpm dev:docker            # Against Docker Compose setup
pnpm dev:local-temporal    # Against local Temporal server

# Install dependencies
pnpm install               # Install all dependencies

# Git submodules (required for local development)
git submodule update       # Clone Temporal API Protos
```

## Code Quality Commands

```bash
# Linting and formatting
pnpm lint                  # Run all linters (prettier, eslint, stylelint)
pnpm format               # Fix formatting issues
pnpm prettier:fix         # Fix Prettier issues only
pnpm eslint:fix          # Fix ESLint issues only
pnpm stylelint:fix       # Fix Stylelint issues only

# Type checking
pnpm check               # TypeScript type checking
pnpm check:watch        # Continuous type checking
```

## Testing Commands

```bash
# Unit tests
pnpm test                # Run unit tests with Vitest
pnpm test -- --run       # Run unit tests once (no watch mode)
pnpm test:ui            # Run tests with Vitest UI
pnpm test:coverage      # Run tests with coverage report

# End-to-end tests
pnpm test:e2e           # Run E2E tests with Playwright
pnpm test:e2e:ui        # Run E2E tests with Playwright UI

# Integration tests
pnpm test:integration   # Run integration tests with mocks
pnpm test:integration:ui # Run integration tests with UI
```

## Build Commands

```bash
# Build for different targets
pnpm build:local        # Build for local preview
pnpm build:docker      # Build for Docker environment
pnpm build:server      # Build for ui-server integration

# Preview built application
pnpm preview:local     # Preview local build
pnpm preview:docker    # Preview Docker build
```

## Utility Commands

```bash
# Component development
pnpm stories:dev       # Start Storybook development server
pnpm stories:build     # Build Storybook

# Version management
pnpm validate:versions # Ensure version files are in sync

# Code generation
pnpm audit:tailwind    # Audit Tailwind color usage
pnpm audit:holocene-props # Generate Holocene component props
```

## System Commands (macOS/Darwin)

```bash
# File operations
ls                     # List files
find . -name "*.ts"   # Find TypeScript files
grep -r "pattern"     # Search for patterns
cd path/to/directory  # Change directory

# Git operations
git status            # Check repository status
git add .             # Stage all changes
git commit -m "msg"   # Commit changes
git pull origin main  # Pull latest changes
```

## Task Completion Checklist

After making code changes, always run:

1. `pnpm lint` - Ensure code quality
2. `pnpm check` - Verify TypeScript compliance
3. `pnpm test -- --run` - Run unit tests (if applicable)
4. Review changes before committing
