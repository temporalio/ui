# Temporal UI

## Prerequisites

Temporal must be running in development. (For details, see [Run a dev Cluster](https://docs.temporal.io/application-development-guide#run-a-dev-cluster) in the documentation.)

## Trying it out

After pulling down the lastest version of Temporal's [`docker-compose`](https://github.com/temporalio/docker-compose), you can access the UI by visiting `http://localhost:8080`.

## Trying it out: Bleeding edge

Starting the UI API server will give you a somewhat recent version on `localhost:8080`. If you want to use the most recent commit to `main`, you can spin up a bleeding-edge build as described below.

Once you have the prerequisites going, run the following:

```bash
pnpm install
pnpm run build:local
pnpm run preview:local
```

## Developing

Developing the UI has the same prequisites as trying it out. Once you've created a project and installed dependencies with `pnpm install`, start the development server:

```bash
pnpm start
```

By default, the application will start up with a version of the UI for the local version of Temporal. You can start the UI for Temporal Cloud by setting the `VITE_TEMPORAL_UI_BUILD_TARGET` target to `cloud`. Alternatively, you can use either of the following scripts:

```bash
pnpm run dev:local
pnpm run dev:cloud
```

## Building

The Temporal UI _must_ be built for either the local version or Temporal Cloud. You must set the `VITE_TEMPORAL_UI_BUILD_TARGET` environment variable in order to build the assets. This will be set for you if you use either of the following `pnpm` scripts.

```bash
pnpm run build:local
pnpm run build:cloud
```

The resulting assets will be placed in either `build-local` or `build-cloud` respectively.

> You can preview the built app with `pnpm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.

## Configuration

Set these environment variables if you want to change their defaults

| Variable  | Description                                                      | Default               | Stage |
| --------- | ---------------------------------------------------------------- | --------------------- | ----- |
| VITE_API  | Temporal HTTP API address. Set to empty `` to use relative paths | http://localhost:8080 | Build |
| VITE_MODE | Build target                                                     | development           | Build |

## Developing with Canary

To get a better representation of production data, you can run our UI with the [canary-go](https://github.com/temporalio/canary-go) repo. You will need go installed on your machine.

### canary-go

```bash
make bins
./temporal-canary start
```

### temporal

```bash
make bins
TEMPORAL_ENVIRONMENT=development_sqlite make start
```

### tctl

```bash
make build
./tctl --ns canary namespace register
./tctl --ns default namespace register (if you also want a default namespace)
./tctl --auto_confirm admin cluster add-search-attributes \
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

### ui-server

```bash
make build-server
./ui-server start
```

### ui

```bash
pnpm start
```
