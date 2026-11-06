# Catalog configuration

The catalog is a local-development page for browsing and running Temporal workflow examples. This document explains how it is configured. For the authoring workflow — adding, running, and promoting examples — install the `catalog` skill (`../../../agent-plugins/temporal-ui-catalog/skills/catalog/SKILL.md`) or read it directly.

The catalog page is reachable only in local development. Every other environment returns 404.

## Addressing: namespace and task queue

Two rules answer nearly every configuration question.

**Namespace comes from where you are.** In the browser, it is the namespace in the URL: `/namespaces/staging/catalog` workspaces `staging`. For the worker, it comes from `TEMPORAL_NAMESPACE`. These are separate settings, so point them at the same namespace — otherwise the catalog shows examples whose readiness reports no worker polling, because the worker is polling somewhere else.

**Task queues come only from registration.** Each workspace declares its own task queue in code. No environment variable overrides it. This is deliberate: the UI's readiness check and the worker's polling derive the queue from the same declaration, so they cannot disagree.

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
| `CATALOG_WORKSPACE_ID`       | Optional. Run one workspace instead of all of them.                 |
| `CATALOG_CONTROL`            | Optional. `on` lets workspaces that declare `crash` exit the worker. |

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

A workspace is an isolated worker: a namespace, a task queue, a workflow bundle, and its activities. Examples are entry points into a workspace. The catalog runs **one worker per workspace**, all in a single process sharing one connection. Starting the worker with two workspaces registered starts two workers.

### Grouping examples into workspaces

An authoring workspace declares how its examples map to workers with `grouping`:

| Grouping               | Workspaces          | Task queue                    | Workflow bundle                | Same activity name in two examples |
| ---------------------- | ------------------- | ----------------------------- | ------------------------------ | ---------------------------------- |
| `shared` (the default) | One for the source  | `defaultTaskQueue`            | The generated workflows module | An error                           |
| `per-folder`           | One for each folder | `<defaultTaskQueue>-<folder>` | The folder's own `workflow.ts` | Allowed                            |

Use `shared` for many small examples that exercise primitives. Use `per-folder` when each demo must have clear boundaries: its own task queue, bundle, and activities. Both groupings run in the same process. The generated catalog lists each example's task queue, so the browser does not need to know which grouping produced it.

A `per-folder` workspace registers workspaces named `<workspace id>-<folder>`. Validation fails when a derived workspace ID or task queue collides with another workspace. Moving an example to a workspace with a different grouping changes its task queue.

### Workspace metadata

A source names its files explicitly, for example `files: { example: 'example.ts', workflow: 'workflow.ts', workspace: 'workspace.ts' }`. Generation lists the source's folders and checks only for those files. It does not parse them or derive names from them: everything else comes from the modules when they are registered. The generated registration and the generate step both call `registerCatalogSource`, so they register the same workspaces.

A `workspace.ts` describes a workspace. In a `per-folder` source it sits in a folder and describes that folder's workspace. In a `shared` source it sits at the source root and describes the one shared workspace:

```ts
export const catalogWorkspace = {
  title: 'Money transfer',
  description:
    'Move money between accounts, and undo the withdrawal if the deposit fails.',
  docsUrl: 'https://docs.temporal.io/',
  controls: ['crash'],
  eject: { sdks: ['typescript'] },
} satisfies CatalogWorkspaceDefinition;
```

Every field is optional. The ID, namespace and task queue come from the source and folder, so the file cannot set them. A `workspace.ts` in the wrong place fails generation: a folder file in a `shared` source, or a root file in a `per-folder` source. Generation validates the metadata with the Zod schema in `browser/metadata-schema.ts` and writes a `workspaces` list into the generated catalog. Each descriptor's `execution.workspaceId` points into that list.

### Scenarios

An example can declare named preset inputs:

```ts
scenarios: [
  { id: 'happy-path', title: 'Happy path', input: { amount: 100 } },
  {
    id: 'deposit-fails',
    title: 'Deposit fails',
    input: { amount: 100, to: 'closed-account' },
  },
],
```

Generation fails when a scenario's input does not match the example's input schema.

### Crashing the worker

A demo can let the user crash its worker and watch the run recover. The workflow registers the `crashWorker` update:

```ts
import { handleCrashWorker } from '../worker/crash-workflow';

export async function moneyTransfer(input: TransferInput) {
  handleCrashWorker();
  // ...
}
```

The update runs the `dangerousOperation` activity. On its first attempt, the activity exits the worker process with code 75. The host restarts the process. The activity's heartbeat timeout expires, Temporal retries it on the new worker, and the retry returns. The update result reports the recovery, and the run continues.

Crash is on only when the workspace declares `controls: ['crash']` and the runtime sets `CATALOG_CONTROL=on`. Otherwise the activity fails without retrying, and the update returns that failure. A serverless runtime should not set it, because it cannot restart a process.

The exit ends the whole process, so every workspace in it restarts. Run the worker under something that restarts it after a non-zero exit. A worker with crash enabled sets a 1-second sticky queue timeout, so the restarted worker picks up the run within a few seconds.

Locally, `pnpm catalog worker` and `pnpm catalog dev` restart the worker after a crash when `CATALOG_CONTROL=on`, from the environment or an env file. They restart only on the crash exit code, 75. Any other failure stops the command. Node's `--watch` cannot restart a process that exits, so with crash control on, the command watches `src/lib/catalog`, `scripts/catalog` and `catalog.local` itself. A change to a `.ts`, `.js` or `.json` file restarts the worker, including a new example or workspace.

The shared catalog declares the crash control. Its `worker-crash` example waits for a set time so you can crash the worker during the run:

```sh
CATALOG_CONTROL=on pnpm catalog dev
temporal workflow update execute --name crashWorker --workflow-id <workflow id>
```

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
