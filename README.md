# Temporal UI

## Prerequisites

Temporal must be running in development.

Temporal UI requires [Temporal v1.16.0](https://github.com/temporalio/temporal/releases/tag/v1.16.0) or later.

Make sure [Corepack](https://pnpm.io/installation#using-corepack) is installed and run `corepack enable pnpm`. 

### Using Temporal CLI

You can install [Temporal CLI][] using [Homebrew][]:

```sh
brew install temporal
```

You can start a Temporal server in development using the following command:

```sh
temporal server start-dev
```

[temporal cli]: https://github.com/temporalio/cli
[homebrew]: https://brew.sh

## Development

### Local Development

#### Setup

Once you have the prerequisites going, run the following:

```bash
pnpm install
```

Running `pnpm install` will attempt to download and install the most recent version of [Temporal CLI][] into `./bin/cli/temporal`. The development server will attempt to use use this version of this Temporal when starting up.

- If that port is already in use, the UI will fallback to trying to talk to whatever process is running on that port.
- If you do not have a version of Temporal CLI at `./bin/cli/temporal`, the development server will look for a version of Temporal CLI in your path.
- For Windows users, you will need to start Temporal using one of the methods listed above until we have sufficiently tested this functionality on Windows. (We would absolutely welcome a pull request.)

```bash
git submodule update
```

This clones the [Temporal API Protos](https://github.com/temporalio/api) into the git submodule, which is required for local development of the UI when running against a local version of the UI server.


To run a local development version of the Svelte application via Vite, run `pnpm dev`. The application will run on [http://localhost:3000]() against a local ui-server running along with Temporal server from the temporal-cli.

```bash
pnpm dev
```

Alternatively, you can run `pnpm dev:temporal-cli` to run against the version of ui-server and Temporal server included temporal-cli.
```bash
pnpm dev:temporal-cli
```

### Building the UI

The Temporal UI can be built for local preview. You must set the `VITE_TEMPORAL_UI_BUILD_TARGET` environment variable in order to build the assets. This will be set for you if you use either of the following `pnpm` scripts. The resulting assets will be placed in `./build` by default or the directory defined by the `BUILD_PATH` environment variable.

> You can preview the built app with `pnpm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.


```bash
pnpm build:local
```


The Temporal UI can build assets for ui-server. The resulting assets will be placed in `./server/ui/assets`.

```bash
pnpm build:server
```

### Using Docker

After pulling down the lastest version of Temporal's [`docker-compose`](https://github.com/temporalio/docker-compose), you can access the UI by visiting `http://localhost:8080`.

If you want to point the development environment at the `docker-compose` version of Temporal, you can use the following command:

```bash
pnpm dev:docker
```

```bash
pnpm run build:docker
pnpm run preview:docker
```


### Running UI and Temporal Server locally

1. In `temporal` repo, run Temporal server locally
    
```diff
make start
```

2. In `ui` repo, add .env.local-temporal file with the following env variables

```diff
VITE_TEMPORAL_PORT="7134"
VITE_API="http://localhost:8081"
VITE_MODE="development"
VITE_TEMPORAL_UI_BUILD_TARGET="local"
```

3. Run UI with pnpm dev:local-temporal

```diff
pnpm dev:local-temporal
```

4. Create namespace with CLI (Temporal server does not do this automatically unlike CLI)

```diff
temporal operator namespace create default
```

## OSS API Development

### Understanding OSS API Endpoints

When developing new features that require API endpoints for the OSS version of Temporal, the available APIs can be found in the [Temporal API repository](https://github.com/temporalio/api). These gRPC APIs are converted to HTTP through the ui-server's gRPC proxy.

**Key Resources:**
- **API Definitions**: https://github.com/temporalio/api/tree/master/temporal/api
- **Service Definitions**: Look for `*_service.proto` files for available operations
- **HTTP Conversion**: The ui-server automatically converts gRPC calls to HTTP endpoints

**Common API Patterns:**
- **WorkflowService**: `temporal/api/workflowservice/v1/service.proto` - Core workflow operations
- **OperatorService**: `temporal/api/operatorservice/v1/service.proto` - Administrative operations (search attributes, clusters, etc.)
- **Endpoint Mapping**: gRPC service methods map to HTTP POST endpoints at `/api/v1/{service}/{method}`

**Example:**
- gRPC: `temporal.api.operatorservice.v1.OperatorService.ListSearchAttributes`
- HTTP: `POST /api/v1/operator/list-search-attributes`

**Finding Available Operations:**
1. Browse the API repository to find relevant service files
2. Look for existing method definitions in `*_service.proto` files
3. Check if the operation you need already exists before requesting new endpoints
4. For new operations, coordinate with the SDK team to add them to the appropriate service

**Development Workflow:**
1. Check existing API definitions for required operations
2. Use existing endpoints where possible via services in `src/lib/services/`
3. For missing endpoints, create adapters with TODO comments (like in `SearchAttributesAdapter`)
4. Coordinate with SDK team to implement missing gRPC methods
5. Update adapters once endpoints are available

## Authentication

Temporal UI supports OAuth2/OIDC authentication with automatic token refresh and configurable session duration.

**Quick Start:**
```bash
pnpm dev:with-auth  # Start with local OIDC server
```

See [AUTHENTICATION.md](./AUTHENTICATION.md) for complete documentation on:
- Configuration and setup
- Token refresh flow
- Session duration management
- Testing procedures
- Security considerations
- Troubleshooting

## Testing
We use [Playwright](https://playwright.dev) to interactively test the Temporal UI.

### Running the E2E tests
The e2e tests run against the UI with workflows via the [TypeScript SDK](https://github.com/temporalio/sdk-typescript), a locally built version of the UI Server, a NodeJS/Express Codec Server, and a Temporal dev server via [Temporal CLI](https://github.com/temporalio/cli)

`pnpm test:e2e`

### Running the Integration tests
The integration tests run against the UI using Mocks

`pnpm test:integration`

Both `pnpm test:e2e` and `pnpm test:integration` use the `playwright.config.ts` at the root of the repo. This file will [run the UI via the vite development server](https://playwright.dev/docs/api/class-testconfig#test-config-web-server) with the correct configuration by running either `pnpm serve:playwright:e2e` or `pnpm serve:playwright:integration`. It will also invoke the default function in `tests/globalSetup.ts`, which instantiates all of the necessary dependencies (UI Server, Codec Server, Temporal Server, Temporl Workers, etc.) when running in e2e mode.

## Configuration

Set these environment variables if you want to change their defaults

| Variable  | Description                                                      | Default               | Stage |
| --------- | ---------------------------------------------------------------- | --------------------- | ----- |
| VITE_API  | Temporal HTTP API address. Set to empty `` to use relative paths | http://localhost:8322 | Build |
| VITE_MODE | Build target                                                     | development           | Build |
| UI_SERVER_VERBOSE | Enable verbose output to see Air build logs and server output for debugging | false | Development |
| UI_SERVER_HOT_RELOAD | Enable hot reload using Air                           | false | Development |

## Releases

This repository uses an automated release management system that enforces version bump PRs before releases and maintains dual version sync between `package.json` and `server/server/version/version.go`.

### Release Management

The release system uses custom GitHub Actions for modular, reusable functionality. See [GitHub Workflows Documentation](.github/WORKFLOWS.md) for detailed information about the 8 custom actions and 3 workflows.

**Release Process**:
1. **Version Bump**: Use Actions → "Version Bump" to create a PR with updated versions
   - **Auto mode**: Analyzes commits since last tag for semantic versioning
   - **Manual mode**: Specify major/minor/patch bump type
   - **Specific version**: Override with exact version (e.g., "2.38.0")
   - **Dry run**: Preview changes without making modifications
2. **Review and Merge**: Review the auto-generated version bump PR and merge to main
3. **Draft Release**: Automatically created when version changes are detected
4. **Publish Release**: Review and publish the auto-generated draft release
5. **UI-server Release**: A published release automatically triggers a matching release in the ui-server repository

**Version Source of Truth**: The Go `UIVersion` constant in `server/server/version/version.go` is the authoritative source. All validation uses this as the reference, and `package.json` must be kept in sync.

**Version Validation**: 
- Run `pnpm validate:versions` to ensure version files are in sync and ready for release
- Validation compares against last git tag (not last commit) for robust release workflows
- Custom actions provide detailed validation and error messages

**Integration**:
- Draft releases trigger downstream ui-server releases and Docker image publishing
- UI repo releases (https://github.com/temporalio/ui/releases) contain the latest UI artifacts
- Our [npm package](https://www.npmjs.com/package/@temporalio/ui) will be manually published as needed.
- UI-server repo releases (https://github.com/temporalio/ui-server/releases) manage Docker images
