# ui-server

[![build](https://github.com/temporalio/ui-server/actions/workflows/test.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/test.yml)
[![E2E Tests](https://github.com/temporalio/ui-server/actions/workflows/e2e.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/e2e.yml)
[![Publish Docker image](https://github.com/temporalio/ui-server/actions/workflows/docker.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/docker.yml)
[![Update UI Submodule](https://github.com/temporalio/ui-server/actions/workflows/update-ui.yml/badge.svg)](https://github.com/temporalio/ui-server/actions/workflows/update-ui.yml)

ui-server serves an HTTP API analogue of [Temporal gRPC API](https://github.com/temporalio/api) as well as serves Temporal UI https://github.com/temporalio/ui. It can be compiled into a binary or consumed as a Go library.

# Docker

### Using Temporal CLI

You can install [Temporal CLI][] using [Homebrew][]:

```sh
brew install temporal
```

You can start a Temporal server in development using the following command:

```sh
temporal server start-dev
```

You can access the UI by visiting `http://localhost:8233`.

[temporal cli]: https://github.com/temporalio/cli
[homebrew]: https://brew.sh

### Using Docker

After pulling down the lastest version of Temporal's [`docker-compose`](https://github.com/temporalio/docker-compose), you can access the UI by visiting `http://localhost:8080`.

You can run it with Temporal Server using the [Temporal docker-compose](https://github.com/temporalio/docker-compose/blob/main/docker-compose.yml).

See [Docker README](https://github.com/temporalio/ui-server/blob/main/docker/README.md) for more details on running Docker images

# Configuration

```bash
pnpm install
pnpm run build:local
pnpm run preview:local
```

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

The resulting assets will be placed in `.vercel/output/static`.

- Alternatively you can pass a .yaml configuration file based on the Dockerize template . Ex [development.yml config](https://github.com/temporalio/ui-server/tree/main/config)

Check out [the configuration docs](https://docs.temporal.io/references/ui-configuration) for more details

# Development

| Variable  | Description                                                      | Default               | Stage |
| --------- | ---------------------------------------------------------------- | --------------------- | ----- |
| VITE_API  | Temporal HTTP API address. Set to empty `` to use relative paths | http://localhost:8322 | Build |
| VITE_MODE | Build target                                                     | development           | Build |

## Developing with Canary

To get a better representation of production data, you can run our UI with the [canary-go](https://github.com/temporalio/canary-go) repo. You will need Go installed on your machine.

### `canary-go`

```bash
make bins
./temporal-canary start
```

### `temporal`

```bash
make bins
TEMPORAL_ENVIRONMENT=development_sqlite make start
```

### `tctl`

```bash
make build
./tctl config set version next
./tctl -n canary namespace register
./tctl -n default namespace register
./tctl cluster add-search-attributes -y \
 	--name CustomKeywordField --type Keyword \
 	--name CustomStringField --type Text \
 	--name CustomTextField --type Text \
 	--name CustomIntField --type Int \
 	--name CustomDatetimeField --type Datetime \
 	--name CustomDoubleField --type Double \
 	--name CustomBoolField --type Bool
```

To view the search attributes code:
https://github.com/temporalio/docker-builds/blob/main/docker/auto-setup.sh#L297

### `ui-server`

```bash
make build-server
./ui-server start
```

- Open http://localhost:8080/ in the browser to explore the UI
- Open http://localhost:8080/openapi/ in the browser to explore HTTP API

## Debugging

In VSCode launch "Debug Server" script (or press F5)
