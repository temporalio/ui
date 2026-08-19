# Catalog configuration

The catalog is a local-development page for browsing and running Temporal workflow examples. This document explains how it is configured. For the authoring workflow — adding, running, and promoting examples — install the `catalog` skill (`../../../agent-plugins/temporal-ui-catalog/skills/catalog/SKILL.md`) or read it directly.

The catalog page is reachable only in local development. Every other environment returns 404.

## Addressing: namespace and task queue

Two rules answer nearly every configuration question.

**Namespace comes from where you are.** In the browser, it is the namespace in the URL: `/namespaces/staging/catalog` targets `staging`. For the worker, it comes from `TEMPORAL_NAMESPACE`. These are separate settings, so point them at the same namespace — otherwise the catalog shows examples whose readiness reports no worker polling, because the worker is polling somewhere else.

**Task queues come only from registration.** Each target declares its own task queue in code. No environment variable overrides it. This is deliberate: the UI's readiness check and the worker's polling derive the queue from the same declaration, so they cannot disagree.

## Environment files

Three files, layered. Real environment variables win over both files, and `.local` wins over the committed defaults.

| File                                  | Committed       | Purpose                                              |
| ------------------------------------- | --------------- | ---------------------------------------------------- |
| `.env.catalog`               | yes             | Address and namespace defaults for local development |
| `.env.catalog.local`         | no (gitignored) | Your overrides and all credentials                   |
| `.env.catalog.local.example` | yes             | Commented template covering every credential mode    |

Copy the example file to `.env.catalog.local` and uncomment what you need. Only the values that differ from the defaults belong there.

### Variables

| Variable                     | Purpose                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| `TEMPORAL_ADDRESS`           | Server address. Defaults to `127.0.0.1:7233`.                       |
| `TEMPORAL_NAMESPACE`         | Namespace the worker registers and polls in. Defaults to `default`. |
| `CATALOG_TARGET_ID` | Optional. Run one target instead of all of them.                    |

Prefer `127.0.0.1` over `localhost`. On some machines `localhost` resolves to IPv6 and reaches a different Temporal server than the UI is reading — for example a container publishing the same port — which appears as a healthy worker the catalog cannot see.

### Credentials

Exactly one mode may be configured. Mixing modes, or providing half of a certificate pair, fails at startup with a message naming the problem.

**API key**

```
TEMPORAL_ADDRESS=<region>.<cloud-provider>.api.temporal.io:7233
TEMPORAL_NAMESPACE=<namespace>.<account-id>
TEMPORAL_API_KEY=<api-key>
```

**Client certificate pair**

```
TEMPORAL_TLS_CERT=<base64 client certificate>
TEMPORAL_TLS_KEY=<base64 client private key>
```

**Client certificate pair with a private CA or server name override**

```
TEMPORAL_TLS_CLIENT_CERT_BASE64=<base64 client certificate>
TEMPORAL_TLS_CLIENT_KEY_BASE64=<base64 client private key>
TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64=<base64 CA certificate>
TEMPORAL_TLS_SERVER_NAME_OVERRIDE=<server name>
```

An API key cannot be combined with any TLS variable. The CA certificate and server name override each require the client pair.

## The worker

A target is a worker specification: a namespace, a task queue, a workflow bundle, and its activities. The catalog runs **one worker per target**, all in a single process sharing one connection. Starting the worker with two targets registered starts two workers.

The worker waits for the server rather than exiting if it starts first, printing progress while it retries. Non-connection failures, such as an invalid API key, still fail immediately.

On a plaintext local connection, the worker creates any Nexus endpoints its examples declare. When it lacks the authority to do so — any credentialed connection, including Temporal Cloud — it prints the exact `temporal operator nexus endpoint create` command instead, and the catalog page shows the same command as copyable text.

## Generated artifacts

The browser reads generated artifacts rather than importing worker code. `catalog.generated.json`, `catalog.generated.ts`, and the local assemblies under `catalog.local/` are all generated: never edit them by hand.

```bash
pnpm catalog generate   # rebuild
pnpm catalog verify     # check for staleness and drift
```

Verification hashes the declared source files, so an artifact that no longer matches its sources fails with a message naming the command that fixes it. Run `verify` before committing catalog changes; it is also what the worker runs as a preflight.

## Moving examples between shared and local catalogs

Preview either source move before applying it:

```bash
pnpm catalog promote order-lifecycle --dry-run
pnpm catalog demote order-lifecycle --dry-run
```

`promote` moves a self-contained example from `catalog.local/examples/` into the tracked shared catalog. `demote` reverses that move into the Git-ignored local catalog; it does not delete the example. Both commands regenerate and verify through one journaled transaction, refuse to overwrite the destination, and restore the source plus generated outputs if the transaction fails.

Examples must keep their imports inside their own directory to move safely between roots. An older shared example with cross-directory imports cannot be demoted automatically; the command explains the dependency and leaves the tracked source untouched.

## Scenarios

[Configuration scenarios](./scenarios.md) records the supported configurations, how to reproduce each one, and what has been verified.
