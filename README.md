# Temporal UI

## Prerequisites

Temporal must be running in development.

Temporal UI requires [Temporal v1.16.0](https://github.com/temporalio/temporal/releases/tag/v1.16.0) or later.

## Trying it out

### Using Temporal CLI

You can install [Temporal CLI][] using [Homebrew][]:

```sh
brew install temporal
```

You can start a Temporal server in development using the following command:

```sh
temporal server start-dev
```

You can access the UI by visiting `http://localhost:8233`. OpenAPI is accessible at `http://localhost:8233/openapi/`.

[temporal cli]: https://github.com/temporalio/cli
[homebrew]: https://brew.sh

### Using Docker

After pulling down the lastest version of Temporal's [`docker-compose`](https://github.com/temporalio/docker-compose), you can access the UI by visiting `http://localhost:8080`.

## Trying it out: Bleeding edge

If you want to use the most recent commit to `main`, you can spin up a bleeding-edge build as described below.

Once you have the prerequisites going, run the following:

```bash
pnpm install
pnpm start
```

Running `pnpm install` will attempt to download and install the most recent version of [Temporal CLI][] into `./bin/cli/temporal`. The development server will attempt to use use this version of this Temporal when starting up.

- If that port is already in use, the UI will fallback to trying to talk to whatever process is running on that port.
- If you do not have a version of Temporal CLI at `./bin/cli/temporal`, the development server will look for a version of Temporal CLI in your path.
- For Windows users, you will need to start Temporal using one of the methods listed above until we have sufficiently tested this functionality on Windows. (We would absolutely welcome a pull request.)

### Using Docker

If you're running the development version of the UI and you want to point it at the `docker-compose` version of Temporal, you can run this command:

```
pnpn run build:docker
pnpn run preview:docker
```

## Developing

Developing the UI has the same prequisites as trying it out. Once you've created a project and installed dependencies with `pnpm install`, start the development server:

```bash
pnpm start
```

and open [`localhost:3000`](http://localhost:3000).

By default, the application will start up with a version of the UI for the local version of Temporal. You can start the UI for Temporal Cloud by setting the `VITE_TEMPORAL_UI_BUILD_TARGET` target to `cloud`. Alternatively, you can use either of the following scripts:

```bash
pnpm run dev:local
pnpm run dev:cloud
```

### Using Docker

If you want to point the development environment at the `docker-compose` version of Temporal, you can use the following command:

```
pnpm run dev:docker
```

## Building

The Temporal UI _must_ be built for either the local version or Temporal Cloud. You must set the `VITE_TEMPORAL_UI_BUILD_TARGET` environment variable in order to build the assets. This will be set for you if you use either of the following `pnpm` scripts.

```bash
pnpm run build:local
pnpm run build:cloud
```

The resulting assets will be placed in `./build`.

> You can preview the built app with `pnpm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.

## Testing
We use [Playwright](https://playwright.dev) to interactively test the Temporal UI.

### Running the E2E tests
The e2e tests run against the UI with workflows via the [TypeScript SDK](https://github.com/temporalio/sdk-typescript), a locally built version of the UI Server, a NodeJS/Express Codec Server, and a Temporal dev server via [Temporal CLI](https://github.com/temporalio/cli)

`pnpm test:e2e`

### Running the Integration tests
The integration tests run against a the UI using Mocks

`pnpm test:integration`

Both `pnpm test:e2e` and `pnpm test:integration` use the `playwright.config.ts` at the root of the repo. This file will [run the UI via the vite development server](https://playwright.dev/docs/api/class-testconfig#test-config-web-server) with the correct configuration by running either `pnpm dev:playwright:e2e` or `pnpm dev:playwright:integration`. It will also invoke the default function in `tests/globalSetup.ts`, which instantiates all of the necessary dependencies (UI Server, Codec Server, Temporal Server, Temporl Workers, etc.) when running in e2e mode.

## Configuration

Set these environment variables if you want to change their defaults

| Variable  | Description                                                      | Default               | Stage |
| --------- | ---------------------------------------------------------------- | --------------------- | ----- |
| VITE_API  | Temporal HTTP API address. Set to empty `` to use relative paths | http://localhost:8322 | Build |
| VITE_MODE | Build target                                                     | development           | Build |


## Releases

Our `ui` repo releases page (https://github.com/temporalio/ui/releases) is for managing our [npm package](https://www.npmjs.com/package/@temporalio/ui). The package includes a copy of `/lib` directory with types.
Our `ui-server` repo releases page (https://github.com/temporalio/ui-server/releases) is for managing docker images for the entire front-end app.
