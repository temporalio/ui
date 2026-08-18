# Catalog configuration scenarios

Every supported configuration, how to reproduce it, and what has been verified. See [Catalog configuration](./README.md) for the model these scenarios exercise.

Verified entries were exercised by hand against a real Temporal server. Unverified entries are supported by code and tests but have not been run end to end; treat them as untested until someone records a result.

## Running the catalog

### Zero configuration

Committed defaults, built-in dev server, no `.env.catalog.local`.

```bash
pnpm catalog dev
```

The banner prints the catalog URL and each target. Both shared and local examples appear and run.

**Verified.** Cold start with nothing running: the worker waits for the server, both targets reach running, and examples execute.

### Separate processes

```bash
pnpm dev                            # terminal 1
pnpm catalog worker        # terminal 2
```

`pnpm dev` never starts a worker on its own.

**Verified.**

### One target only

```bash
CATALOG_TARGET_ID=shared-workflows pnpm catalog worker
```

An unknown id fails in about a second, listing the available targets, without attempting a connection. Because the worker runs under Node's watch mode, a runtime preflight failure like this one reports and then waits for a file change instead of exiting the command; stop it with a signal. Stale artifacts still exit right away, because the command verifies them before starting the worker.

**Verified**, including the unknown-id path.

## Namespaces

### Relocating the worker

Set `TEMPORAL_NAMESPACE` in `.env.catalog.local`. Every target moves to that namespace and keeps its registered task queue. Browse the matching namespace in the UI.

**Verified** that all targets relocate and queues are preserved.

### Namespace mismatch

Browse a namespace the worker is not polling. Examples stay visible; readiness reports no worker polling and offers the command to start one. A run started anyway waits for a worker rather than failing.

**Verified** for the readiness state. The parked-run behavior is expected but was not recorded.

## Credentials

Each mode is validated at startup, and mixing modes or providing half a certificate pair fails immediately with a message naming the problem.

| Mode                                                            | Status                                                |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| Plaintext local                                                 | **Verified**                                          |
| API key                                                         | Unverified                                            |
| `TEMPORAL_TLS_CERT` / `TEMPORAL_TLS_KEY` pair                   | Unverified                                            |
| Base64 client pair with CA certificate and server name override | Unverified                                            |
| Rejection of mixed or half-configured credentials               | Covered by tests; not exercised against a live server |

The credentialed modes were exercised against Temporal Cloud from the Cloud UI side rather than from this repository. Recording a run from here is the main gap in this matrix.

## Local examples

### Authoring

```bash
pnpm catalog scaffold order-lifecycle
```

Creates the example and its assemblies, regenerates, and prints where to see it. Saving the example files while `dev` is running regenerates and reloads without a manual step.

**Verified** from a completely empty workspace, including a second scaffold alongside the first, and running the scaffolded workflow to completion.

### Reloading a running worker

Both `dev` and `worker` run the worker entry under Node's watch mode, so it restarts whenever a catalog module it loaded changes. A worker started before an example existed picks that example up on its own.

**Verified** against a live server: scaffolding while the worker ran restarted it, both targets came back, the new workflow ran to completion, and a later edit to its `workflow.ts` restarted the worker again with the new code.

### Promotion

```bash
pnpm catalog promote order-lifecycle --dry-run
pnpm catalog promote order-lifecycle
```

Moves the example into the shared catalog, then regenerates and verifies.

**Unverified.** Covered by tests but not exercised by hand.

### Demotion

```bash
pnpm catalog demote order-lifecycle --dry-run
pnpm catalog demote order-lifecycle
```

Moves a self-contained shared example back to `catalog.local/examples/`, regenerates, and verifies. The result is local and ignored by Git, not deleted. An occupied local destination or an import outside the example directory is refused without moving the tracked source. Generation and verification failures roll back the move and generated outputs.

**Unverified.** The successful move and both rollback phases are covered by automated tests but have not been exercised by hand.

## Prerequisites

### Automatic endpoint provisioning

On a plaintext local connection, the worker creates the Nexus endpoints its examples declare, reporting created or already existing.

**Verified**, including on a fresh server where the endpoint did not exist.

### Blocked endpoint handoff

Without provisioning authority, the worker prints the `temporal operator nexus endpoint create` command with the right address, and the example page shows the same command as copyable text while blocking only that example.

**Verified** for the UI state and copy. The credentialed worker path is unverified.

## Environment interference

### A second Temporal server on the same port

Another server publishing `7233` can take the port, and `localhost` may resolve to it over IPv6 while the UI reads a different server. Committed defaults use `127.0.0.1` to avoid the resolution half of this.

**Verified** as a real failure and fixed by the default. Note that the built-in dev server cannot start at all if another server already holds the port: running the catalog alongside another local Temporal is not supported today, because the port is not configurable.

### Interrupted runs leave state behind

A worker or command killed mid-write can leave `.catalog.lock` and a `.catalog.transaction-*` directory. A later command then reports that another mutation is in progress. Deleting the lock, the journal, and the transaction directory clears it. These paths are gitignored.

**Verified** as an observed failure and recovery.

### Killing the worker leaves child processes

Stopping `pnpm catalog worker` with a signal can leave the underlying Node process polling. `pnpm catalog dev` stops its whole process group correctly; the standalone worker command does not.

**Verified** as an observed problem. Not yet fixed.

## Server version requirements

Examples can require a newer server than the pinned CLI provides. Standalone Nexus operations are the current instance: the catalog supports the execution kind, but no released server implements it, so a start is rejected. The Nexus example ships as a caller workflow instead, which works on the pinned server.

Record the required server version alongside any example that needs more than the pinned CLI provides.

**Verified** that the caller-workflow Nexus example runs on the pinned server (CLI v1.8.2, server 1.31.2).
