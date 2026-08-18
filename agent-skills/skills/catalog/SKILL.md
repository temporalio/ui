---
name: catalog
description: Find, run, inspect, author, and promote Temporal Catalog examples in the temporalio/ui repository. Use when asked to add or change a workflow example, run the catalog locally, debug a catalog example that will not start, promote a local example into the shared catalog, or explain how catalog namespaces, task queues, and prerequisites are configured.
---

# Temporal Catalog

The Catalog is a local-development page in `temporalio/ui` for browsing and running Temporal workflow examples. Examples are declared in code, generated into artifacts the browser reads, and executed by a worker this repository starts.

The catalog is only reachable in local development. Every other environment returns 404.

## Start here

```bash
pnpm catalog dev
```

This runs the UI and the catalog worker together and prints a banner with the catalog URL and each target's namespace and task queue. Open the URL it prints, which looks like:

```
http://localhost:3000/namespaces/default/catalog
```

`pnpm dev` is unaffected by the catalog and never starts a worker. To run the pieces separately, use `pnpm dev` in one terminal and `pnpm catalog worker` in another.

## Commands

All catalog work goes through one command:

```bash
pnpm catalog help                     # list commands
pnpm catalog scaffold <example-id>    # create a local example
pnpm catalog generate                 # rebuild generated artifacts
pnpm catalog verify                   # check artifacts and boundaries
pnpm catalog promote <example-id>     # move a local example into the shared catalog
pnpm catalog demote <example-id>      # move a shared example back to the local catalog
pnpm catalog dev                      # UI plus worker
pnpm catalog worker                   # worker only
```

Both commands run the worker under Node's watch mode, so it restarts whenever a catalog module it loaded changes. Scaffolding, promoting, demoting, or editing an example reaches the running worker without stopping it.

`promote` and `demote` accept `--dry-run` to preview without moving anything.

## Find an example

Examples appear in the catalog list, filterable by source. Two sources exist:

- **OSS** — shared examples committed to this repository, under `src/lib/catalog/worker/examples/<id>/`.
- **Local** — your own examples, under `catalog.local/examples/<id>/`. That directory is gitignored and never ships.

The generated `src/lib/catalog/browser/catalog.generated.json` lists every shared example with its capability tags, expected evidence, input schema, and any setup instructions. Read it to answer "what examples exist" without starting anything.

## Add a local example

```bash
pnpm catalog scaffold order-lifecycle
```

This creates `catalog.local/examples/order-lifecycle/` with `example.ts` and `workflow.ts`, regenerates artifacts, and prints where to see it. Edit those two files to shape the example. Scaffolding while the worker is running restarts it, so the new example is runnable without touching the terminal. Saving the files while `pnpm catalog dev` is running regenerates the catalog, reloads the browser, and restarts the worker; there is no manual step.

`example.ts` exports `catalogExample`, which declares the id, title, description, capability tags, expected evidence, input and start-option schemas, and the execution. Registration is validated: unknown fields, empty required strings, and non-serializable values are rejected at generation time with a message naming the example.

## Run and inspect

Press **Run** on the example page. The page shows:

- **Readiness** — whether a worker is polling the target task queue, plus any declared prerequisites. A missing worker is advisory and shows the exact command to start one; a missing declared prerequisite blocks only that example.
- **Runs** — each attempt with its status, and an evidence link into the workflow history for inspecting what actually happened.

If a start fails, the page explains why rather than only saying it failed. "This server does not support that execution" usually means the running Temporal server is older than the feature the example needs.

## Declared prerequisites

An example may declare Nexus endpoints it needs:

```ts
execution: {
  kind: 'workflow',
  workflowType: 'nexusGreeting',
  workflow: nexusGreeting,
  activities: {},
  nexusEndpoints: ['ui-catalog'],
  nexusServices: [greetingServiceHandler],
}
```

Each declared endpoint becomes a required readiness check. On a plaintext local connection the worker creates missing endpoints itself at startup. When it lacks authority — any credentialed connection, including Temporal Cloud — it prints the exact `temporal operator nexus endpoint create` command instead, and the UI shows the same command as copyable text.

For manual steps no check can verify, add `setupMarkdown` to the example. It renders as a Setup card on the example page and travels in the generated artifact, so agents read the same guidance a person sees.

## Promote a local example into the shared catalog

Promotion is deliberate and never automatic:

```bash
pnpm catalog promote order-lifecycle --dry-run
pnpm catalog promote order-lifecycle
```

This moves `catalog.local/examples/<id>/` to `src/lib/catalog/worker/examples/<id>/`, then regenerates and verifies. After promoting, the example is committed to the repository and ships to every consumer, so review its input schema, expected evidence, and setup instructions before promoting.

## Demote a shared example into the local catalog

Demotion reverses a deliberate promotion:

```bash
pnpm catalog demote order-lifecycle --dry-run
pnpm catalog demote order-lifecycle
```

This moves `src/lib/catalog/worker/examples/<id>/` back to `catalog.local/examples/<id>/`, then regenerates and verifies through the same journaled transaction as promotion. The example is now local and ignored by Git; it is not deleted. The command never overwrites an existing local example, and a generation or verification failure restores the tracked source and generated outputs.

Only self-contained examples can move between the two roots. If an older shared example imports files outside its own directory, demotion refuses it with an explanation and leaves it tracked; make the example self-contained before trying again.

## Configuration

Two rules explain nearly every configuration question:

- **Namespace** comes from where you are. In the browser it is the namespace in the URL, so browsing `/namespaces/staging/catalog` targets `staging`. For the worker it comes from `TEMPORAL_NAMESPACE`. Point both at the same namespace or the UI will show no worker polling.
- **Task queues** come only from a target's registration. No environment variable overrides them, which keeps the UI's readiness check and the worker's polling in agreement.

Environment files layer, with real environment variables winning over both:

| File                         | Committed | Purpose                                              |
| ---------------------------- | --------- | ---------------------------------------------------- |
| `.env.catalog`               | yes       | Address and namespace defaults for local development |
| `.env.catalog.local`         | no        | Your overrides and all credentials                   |
| `.env.catalog.local.example` | yes       | Commented template for every credential mode         |

Exactly one credential mode may be set: an API key, or a client certificate pair, optionally with a private CA certificate and server name override. Mixing them, or providing half a certificate pair, fails at startup with a message naming the problem.

Prefer `127.0.0.1` over `localhost` in addresses. `localhost` can resolve to IPv6 and reach a different Temporal server than the UI is reading, which shows up as a healthy worker that the catalog cannot see.

## Generated artifacts

`catalog.generated.json`, `catalog.generated.ts`, and the local assemblies are generated. Never edit them by hand; run `pnpm catalog generate`. Verification compares a hash of the declared source files, so a stale artifact fails with a message naming the command that fixes it. `pnpm catalog verify` is the check to run before committing catalog changes.

## Cloud handoff

Cloud UI consumes the packaged catalog from `@temporalio/ui` rather than copying it. This repository owns the examples, the registry, the worker runtime, and the provider-neutral UI. Cloud supplies its own routes, start policy, and connection and provisioning behavior, and runs its own worker command against the same packaged examples.

Practically: an example added and promoted here becomes available to Cloud when it takes a new package version. Do not add Cloud-specific assumptions to a shared example; keep it working against a plain local server, and use declared prerequisites and `setupMarkdown` for anything an environment must provide.
