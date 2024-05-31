# Temporal UI

## Prerequisites

Temporal must be running in development.

Temporal UI requires [Temporal v1.16.0](https://github.com/temporalio/temporal/releases/tag/v1.16.0) or later.

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

The Temporal UI can be built for local preview. You must set the `VITE_TEMPORAL_UI_BUILD_TARGET` environment variable in order to build the assets. This will be set for you if you use either of the following `pnpm` scripts. The resulting assets will be placed in `./dist`.

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
pnpn run build:docker
pnpn run preview:docker
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


## Releases

Our `ui` repo releases page (https://github.com/temporalio/ui/releases) is for managing our [npm package](https://www.npmjs.com/package/@temporalio/ui). The package includes a copy of `/lib` directory with types.
Our `ui-server` repo releases page (https://github.com/temporalio/ui-server/releases) is for managing docker images for the entire front-end app.
