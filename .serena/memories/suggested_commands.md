# Suggested Commands for Temporal UI Development

## Essential Development Commands

### Starting Development

```bash
pnpm dev                    # Start dev server with UI server (default)
pnpm dev:temporal-cli       # Dev with Temporal CLI
pnpm dev:docker            # Dev against Docker Compose
pnpm dev:local-temporal    # Dev with local Temporal server
```

### Code Quality (MUST RUN AFTER CHANGES)

```bash
pnpm lint                  # Run all linters (prettier, eslint, stylelint)
pnpm check                 # TypeScript type checking
pnpm format               # Auto-fix all formatting issues
```

### Individual Linters

```bash
pnpm prettier             # Check code formatting
pnpm prettier:fix         # Auto-fix formatting
pnpm eslint              # Check ESLint rules
pnpm eslint:fix          # Auto-fix ESLint issues
pnpm stylelint           # Check CSS/PostCSS styles
pnpm stylelint:fix       # Auto-fix style issues
```

### Testing

```bash
pnpm test                # Run unit tests
pnpm test:ui             # Run tests with UI
pnpm test:coverage       # Run tests with coverage
pnpm test:e2e            # Run end-to-end tests
pnpm test:integration    # Run integration tests
```

### Building

```bash
pnpm build:local         # Build for local preview
pnpm build:server        # Build for UI server
pnpm build:docker        # Build for Docker
pnpm preview:local       # Preview built app
```

### Storybook

```bash
pnpm stories:dev         # Start Storybook dev server
pnpm stories:build       # Build Storybook
pnpm stories:test        # Test Storybook stories
```

### Git Commands (Darwin/macOS)

```bash
git status               # Check current changes
git add -A               # Stage all changes
git commit -m "message"  # Commit with message
git push                 # Push to remote
git stash               # Stash current changes
git stash pop           # Apply stashed changes
```

### System Utilities (Darwin/macOS)

```bash
ls -la                  # List files with details
find . -name "*.ts"     # Find TypeScript files
grep -r "pattern" .     # Search for pattern
open .                  # Open current directory in Finder
pbcopy < file           # Copy file to clipboard
pbpaste > file          # Paste clipboard to file
```

### Package Management

```bash
pnpm install            # Install dependencies
pnpm add package        # Add new dependency
pnpm add -D package     # Add dev dependency
pnpm update            # Update dependencies
```

## Important Notes

- Always run `pnpm lint` and `pnpm check` before committing
- Use `pnpm format` to auto-fix most issues
- The project uses pnpm, not npm or yarn
- Node version must be >=18.15.0
- pnpm version must be >=8.6.0
