# Development Environment Setup

## Prerequisites

- **Node.js**: >=18.15.0
- **pnpm**: >=8.6.0 (use Corepack: `corepack enable pnpm`)
- **Temporal Server**: v1.16.0 or later for local development

## Initial Setup

```bash
# Install dependencies
pnpm install

# Update git submodules (required for local development)
git submodule update

# Enable pnpm via Corepack
corepack enable pnpm
```

## Development Modes

### 1. UI Server Mode (Default)

```bash
pnpm dev  # Runs on http://localhost:3000
```

- Uses built-in UI server
- Best for most development tasks

### 2. Temporal CLI Mode

```bash
pnpm dev:temporal-cli
```

- Uses temporal-cli server
- Automatically downloads Temporal CLI to `./bin/cli/temporal`

### 3. Docker Mode

```bash
pnpm dev:docker
```

- Connects to Docker Compose Temporal setup
- Requires Docker Compose to be running on localhost:8080

### 4. Local Temporal Server Mode

```bash
pnpm dev:local-temporal
```

- Requires `.env.local-temporal` file with configuration
- For development against local Temporal server build

## Environment Configuration

### Docker Setup

Create `.env` file:

```env
VITE_API=http://localhost:8080
VITE_MODE=development
VITE_TEMPORAL_UI_BUILD_TARGET=local
```

### Local Temporal Setup

Create `.env.local-temporal` file:

```env
VITE_TEMPORAL_PORT=7134
VITE_API=http://localhost:8081
VITE_MODE=development
VITE_TEMPORAL_UI_BUILD_TARGET=local
```

## Available Environment Variables

| Variable               | Description                  | Default                 |
| ---------------------- | ---------------------------- | ----------------------- |
| `VITE_API`             | Temporal HTTP API address    | `http://localhost:8322` |
| `VITE_MODE`            | Build target                 | `development`           |
| `UI_SERVER_VERBOSE`    | Enable verbose server output | `false`                 |
| `UI_SERVER_HOT_RELOAD` | Enable hot reload with Air   | `false`                 |

## Development Tools

- **Hot Reload**: Automatic browser refresh on file changes
- **TypeScript**: Real-time type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Automatic code formatting
- **Storybook**: Component development and documentation
- **Playwright**: E2E and integration testing
- **Vitest**: Unit testing with hot reload

## IDE Integration

- SvelteKit provides excellent TypeScript support
- ESLint and Prettier integration recommended
- Svelte extensions available for major IDEs
- Path aliases configured for easy imports (`$lib`, `$types`, etc.)

## Common Development Tasks

- **Component Development**: Use Storybook (`pnpm stories:dev`)
- **API Testing**: Mock APIs available in test utilities
- **Debugging**: Browser dev tools + Svelte dev tools
- **Performance**: Built-in Vite performance monitoring
