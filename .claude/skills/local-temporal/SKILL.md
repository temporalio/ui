---
name: local-temporal
description: Instructions for running the UI against a local Temporal server build instead of the built-in CLI dev server. Use when asked how to start the dev environment, run the UI locally, or connect to a local Temporal repo.
---

# Local Temporal Dev Setup

To develop against a local build of the Temporal server, you need two things running in separate terminals.

## Terminal 1 — Temporal server (from your local temporal repo)

Navigate to your local clone of the `temporalio/temporal` repo and start the server:

```bash
make start
```

This builds and starts the server with SQLite in-memory. If you want a specific branch, check it out first:

```bash
git checkout <branch-name>
make bins  # safe to run even if already built — outputs "Nothing to be done" and exits cleanly
make start
```

The server runs gRPC on port `7233` and HTTP on `7243`.

## Terminal 2 — UI dev server (this repo)

From this repo, use the `local-temporal` script instead of the default `dev` script:

```bash
pnpm dev:local-temporal
```

This loads `.env.local-temporal` which points the UI at the local server instead of spinning up its own.

## Why not `pnpm dev`?

`pnpm dev` (aliased to `pnpm dev:ui-server`) starts a bundled Temporal server alongside the UI. `pnpm dev:local-temporal` skips that and connects to whatever is already running on the configured ports.
