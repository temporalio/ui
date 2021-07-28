# Temporal UI

## Developing

### First run

Install dependencies and build Typescript definitions:

```bash
npm install
npm run build-types
```

### Starting UI

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm start
```

By default, the application will start up with a version of the UI for the local version of Temporal. You can start the UI for Temporal Cloud by setting the `TEMPORAL_UI_BUILD_TARGET` target to `cloud`. Alternatively, you can use either of the following scripts:

```bash
npm run dev:local
npm run dev:cloud
```

To run storyboard components, start a development server:

```bash
npm run stories
```

## Building

The Temporal UI _must_ be built for either the local version or Temporal Cloud. You must set the `TEMPORAL_UI_BUILD_TARGET` environment variable in order to build the assets. This will be set for you if you use either of the following `npm` scripts.

```bash
npm run build:local
npm run build:cloud
```

The resulting assets will be placed in either `build-local` or `build-cloud` respectively.

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.
