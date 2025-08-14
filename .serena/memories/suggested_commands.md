# Essential Commands for Temporal UI Development

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server with UI server
pnpm dev:temporal-cli # Start dev server with Temporal CLI
```

## Quality Assurance (Always run after changes)

```bash
pnpm lint             # Run all linters (prettier, eslint, stylelint)
pnpm check            # TypeScript type checking
pnpm test -- --run    # Run unit tests
```

## Individual Linting

```bash
pnpm prettier         # Check formatting
pnpm prettier:fix     # Fix formatting
pnpm eslint           # Check ESLint rules
pnpm eslint:fix       # Fix ESLint issues
pnpm stylelint        # Check CSS/styles
pnpm stylelint:fix    # Fix style issues
```

## Testing

```bash
pnpm test             # Unit tests (watch mode)
pnpm test:ui          # Unit tests with UI
pnpm test:coverage    # Unit tests with coverage
pnpm test:e2e         # End-to-end tests
pnpm test:integration # Integration tests
```

## Building

```bash
pnpm build:local      # Build for local preview
pnpm build:server     # Build for ui-server
pnpm preview:local    # Preview local build
```

## Utility

```bash
pnpm validate:versions # Ensure version files are in sync
pnpm package          # Build as package
```
