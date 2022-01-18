# Temporal UI

**Nota bene**: This is pre-release software.

## Prequisites

While we're in pre-production, you need to do the following before you spin up the development server:

1. Have Temporal running in development. ([See our documentation](https://docs.temporal.io/docs/server/quick-install) for details.)
2. Clone, build, and start [the UI API Server](https://github.com/temporalio/ui-server).

## Trying it out

After pulling down the lastest version of Temporal's `docker-compose`, you can start it up in _experimental mode_.

```sh
docker-compose -f docker-compose-ui-experimental.yml up -d
```

## Trying it out: Bleeding edge

Starting the UI API server will give you a somewhat recent version on `localhost:8080`. If you want to use the most recent commit to `main`, you can spin up a bleeding-edge build as described below.

Once you have the prerequisites going, run the following:

```bash
npm run build:local
npm run preview:local
```

## Developing

Developing the UI has the same prequisites as trying it out. Once you've created a project and installed dependencies with `npm install`, start the development server:

```bash
npm start
```

By default, the application will start up with a version of the UI for the local version of Temporal. You can start the UI for Temporal Cloud by setting the `TEMPORAL_UI_BUILD_TARGET` target to `cloud`. Alternatively, you can use either of the following scripts:

```bash
npm run dev:local
npm run dev:cloud
```

## Building

The Temporal UI _must_ be built for either the local version or Temporal Cloud. You must set the `TEMPORAL_UI_BUILD_TARGET` environment variable in order to build the assets. This will be set for you if you use either of the following `npm` scripts.

```bash
npm run build:local
npm run build:cloud
```

The resulting assets will be placed in either `build-local` or `build-cloud` respectively.

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.

## Configuration

Set these environment variables if you want to change their defaults

| Variable  | Description                                                      | Default               | Stage |
| --------- | ---------------------------------------------------------------- | --------------------- | ----- |
| VITE_API  | Temporal HTTP API address. Set to empty `` to use relative paths | http://localhost:8080 | Build |
| VITE_MODE | Build target                                                     | development           | Build |
