# Feature demos

One JSON file describes everything a reviewer needs to see a feature work:
which Temporal server to run, which dynamic config to enable on it, which
catalog examples to run against it, and what to look at afterwards.

The workflows a demo runs are catalog examples, and the worker that runs them is
the catalog worker. A demo names an example by id and takes its workflow type,
task queue, and input schema from the catalog, so a demo cannot drift from the
code the catalog page runs.

```bash
pnpm demo list                                     # the definitions
pnpm demo scenarios                                # the scenarios a definition can name
pnpm demo show system-nexus-signal-with-start      # the definition with its defaults applied
pnpm demo start system-nexus-signal-with-start     # run every stage
pnpm demo start system-nexus-signal-with-start --skip ui
pnpm demo start system-nexus-signal-with-start --only scenarios --once
pnpm demo stop                                     # stop what an earlier start left running
pnpm demo new my-feature                           # a definition to edit
```

| Command                  | What it does                                                     |
| ------------------------ | ---------------------------------------------------------------- |
| `list`                   | Every scenario, with its stages and the examples it names         |
| `scenarios`              | The scenario registry, with what each one does                     |
| `show <definition>`      | The definition after defaults are applied, which runs nothing      |
| `start <definition>`     | Runs the stages, prints the reviewer summary, and exits            |
| `stop [<definition>]`    | Stops the processes a `start` recorded, all runs or one            |
| `new <name> [example-id...]` | Writes a definition naming those catalog examples            |
| `help`                   | The command list                                                   |

`start` runs the stages, prints the reviewer summary, and exits. The processes it
started are detached, so they keep running: `stop` is how they end. `--once`
tears them down again before returning, which is what a one-shot check wants.

Starting a scenario that is already recorded as running stops that run first, so
a stale stack cannot be reused by accident. Anything unrecorded on a port belongs
to somebody else and is reused as before.

The summary lands in `.feature-demo/<name>/summary.md`, the process ids and the
ports the run owns in `.feature-demo/<name>/run.json`, and each stage writes its
own log beside them, so a stage that fails to come up says where to look. `stop`
kills the recorded pids and then sweeps those ports, so a child that outlives its
record still goes. A child that holds no port, such as the catalog worker, is
reachable only through its recorded pid, because a sweep by process name would
also catch a worker you started yourself.

Repeat `--skip` or `--only` to name more than one stage.

## Layout

A scenario is a directory, the way a catalog example is. Its definition and its
own behaviour live together, and both are TypeScript:

```
utilities/demo/
  demo-cli.ts        the entry point
  cli.ts run.ts      the dispatcher and the stage runner
  stages/            one file per stage: server, worker, ui
  examples.ts        starts the catalog examples a demo names
  scenarios/
    system-nexus-signal-with-start/
      definition.ts      what to run and what to check
      scenario.ts        behaviour naming examples cannot express
    catalog-signals-and-timers/
      definition.ts      names catalog examples only, so it ships no behaviour
```

A definition is a module, not JSON, because the shape only matters at runtime
and TypeScript checks it for free. `defineScenario` applies the defaults, and a
definition that passes an option its scenario does not have fails to compile:

```
error TS2561: Object literal may only specify known properties, but
'signalNaem' does not exist in type '{ ... signalName?: string ... }'.
Did you mean to write 'signalName'?
```

A scenario declares what to run in one of two ways, and may use both:

- `examples` names catalog examples to start. The workflow type, the task queue,
  and the input schema come from the catalog.
- `scenario.ts` beside the `definition.ts` is for behaviour that naming examples
  cannot express. It exports `scenario`, and the definition gives it options
  under `scenario`, checked by the compiler.

## Adding a demo

1. **Pick the catalog examples.** The catalog owns this, so ask the catalog:

   ```bash
   pnpm catalog list            # id, source, target, workflow type
   pnpm catalog list --json     # the same, for scripting
   ```

   If the feature needs a workflow the catalog does not have, add it there first
   with `pnpm catalog scaffold <id>`, then `pnpm catalog generate`. Promote it
   with `pnpm catalog promote <id>` when the demo should work from a clean clone.

2. **Scaffold the definition with those ids:**

   ```bash
   pnpm demo new order-timeout signal-handlers long-activity
   ```

   Each example arrives with its `role` and `note` filled in from the catalog's
   own title and description. A mistyped id fails before any file is written.
3. **Say what the server needs.** Leave `source` as `auto`. Add
   `requires.serverCommit` when the feature depends on an unreleased server change,
   and put whatever dynamic config it needs in `dynamicConfig`. See
   [Which source to use](#which-source-to-use).
4. **Write the review steps.** `preview.notes` is the checklist the reviewer
   follows, so write each one as something that must be true.
5. **Run it.** `pnpm demo start order-timeout`, then `pnpm demo stop`.

A bad example id or an input that does not match the example's declared schema
fails before anything starts, naming the problem.

## Stages

Four stages run in order. Each one is optional: turn it off with `"enabled":
false` in the definition, or with `--skip <stage>` / `--only <stage>`. A stage
also stands down on its own when something is already listening on its port, so
a server or UI you started yourself is reused rather than fought over.

| Stage       | What it does                                                    |
| ----------- | --------------------------------------------------------------- |
| `server`    | Provisions a Temporal dev server and applies the dynamic config |
| `worker`    | Starts the catalog worker against that server                   |
| `ui`        | Starts the ui-server API and the UI dev server                  |
| `scenarios` | Runs the workflows that exercise the feature                    |

## `server`

| Field              | Meaning                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `source`           | `cli`, `workspace`, or `binary`                                         |
| `version`          | `cli` source only: a `temporal.download` release, or `latest`            |
| `path`             | `binary` source only: a CLI binary already on disk                      |
| `cliRepo`          | Overrides `TEMPORAL_CLI_REPO` for this definition, rarely wanted        |
| `serverRepo`       | Overrides `TEMPORAL_SERVER_REPO` for this definition, rarely wanted     |
| `serverRef`        | Fails the run unless the server checkout is on this branch or commit    |
| `minServerVersion` | Fails the run early if the resolved server is older than this           |
| `dynamicConfig`    | `--dynamic-config-value` pairs, as JSON values                          |
| `searchAttributes` | `--search-attribute` pairs, name to type                                |
| `port`, `uiPort`, `httpPort`, `logLevel`, `dbFilename`, `namespace` | Dev server settings |

### Which source to use

`cli` downloads a published release, which is right whenever the feature is in
one. Nothing is built, so it is much faster.

`workspace` is for a feature no release carries yet. It compiles your own
`temporalio/temporal` checkout into the CLI's dev server through a Go workspace
held in `.feature-demo/`.

The two checkouts are fetched, not configured. A blobless shallow fetch of one
commit costs about a second, so the build uses `temporalio/temporal` and
`temporalio/cli` at the refs a definition names, both `main` by default:

```
· Fetching Temporal CLI at main
· Fetching Temporal server at main
```

They land in `.feature-demo/checkouts/`, which means the demo needs no
configuration, it does not compile whatever you happen to have open, and it
cannot pick up a `replace` directive from your own tree.

**The two refs are a pair, and they have to move together.** The workspace puts
both modules in one dependency graph, so Go resolves `go.temporal.io/api` to the
highest requirement across the two, and both trees then have to compile against
that one version. The repositories are not released in step, so an arbitrary pair
fails, including the current `main` of each: today the CLI wants v1.63.4 and the
server wants v1.63.5, and each removes something the other uses. The pair this
scenario names agrees on v1.63.0.

To move them, find a CLI commit and a server commit that name the same
`go.temporal.io/api`, and change both refs at once. The build reports the pair it
used when it fails.

`requires.serverCommit` is a floor, not a build target. It gives the release line
the feature needs, and the fetched server is checked to contain it:

```
.../checkouts/temporal_server_repo-main is at a31f4762, which does not contain
01aa279c4. That commit adds the feature this scenario shows.
```

To build your own working tree instead, which is what developing the feature
wants, point `TEMPORAL_SERVER_REPO` or `TEMPORAL_CLI_REPO` at it. An explicit
path wins over a fetch, and only then are uncommitted changes part of the build
cache key.

## `worker`

| Field            | Meaning                                                     |
| ---------------- | ----------------------------------------------------------- |
| `targetId`       | Limit the worker to one registered catalog target           |
| `readyTimeoutMs` | How long to wait for the worker to report a running target  |

The stage runs `pnpm catalog worker` with `TEMPORAL_ADDRESS` and
`TEMPORAL_NAMESPACE` set to whatever the server stage provisioned. Real
environment variables win over `.env.catalog`, so the worker follows the demo's
server without any file being edited. The stage waits for the worker's own
`target-running` event before the scenarios start, so nothing races.

Task queues always come from a catalog target's registration and are never set
here. See the `catalog` skill.

## `ui`

| Field             | Meaning                                              |
| ----------------- | ---------------------------------------------------- |
| `uiServer`        | Start the Go ui-server that serves the HTTP API      |
| `web`             | Start the Vite dev server that serves the UI         |
| `apiPort`         | ui-server port, default `8081`                       |
| `webPort`         | UI port, default `3000`                              |
| `rebuildUiServer` | Run `make build` in `server/` even if a binary exists |

The ui-server reads `temporalGrpcAddress` from YAML with no environment
override, so the runner generates its own config directory under
`.feature-demo/` pointed at whichever port the server stage used.
`server/config` is left alone.

If the server checkout uses a newer `go.temporal.io/api` than `server/go.mod`,
the ui-server rejects new HTTP fields before they reach the server. See the
`local-temporal` skill for how to bring the two into line.

## `examples` and `scenario`

`examples` is a list of catalog examples to start:

```json
"examples": [
  { "id": "signal-handlers", "input": [300], "role": "signal wait" }
]
```

Each entry takes its workflow type, task queue, and default input from
`catalog.generated.json`. An `input` override is checked against the schema the
example declares, so a demo cannot pass something the catalog page would reject.
Naming an example that does not exist fails with the list of ids that do, before
anything starts.

For behaviour that naming examples cannot express, a demo puts `scenario.ts`
beside its `definition.ts`:

```ts
export const scenario: Scenario = {
  describe: 'what it does',
  run: async (context, options) => ({ workflows: [], observations: [] }),
};
```

`definition.ts` passes it options under `scenario`, and the compiler checks them. A demo may have both: the
examples start first, then the scenario runs.

### Why `system-nexus-signal-with-start` ships a scenario

The demo is of the Nexus **operation**, not the client's `signalWithStart`
function. The plain client call reaches the frontend RPC directly and produces
no caller workflow and no Nexus events, which is why the old
`temporal/scripts/signal-with-start.ts` was deleted. What this renders is a
workflow invoking `SignalWithStartWorkflowExecution` through the
`__temporal_system` endpoint.

The caller is an ordinary workflow. Only the **Go** SDK refuses the reserved
`__temporal_` prefix, which is why the server's own
`TestBothWorkflowsVisibleAfterSWSFromWorkflow` is skipped; TypeScript has no
such check, so `createNexusServiceClient` reaches the endpoint directly.

What TypeScript does not have yet is an encoder for the operation's payloads,
which are `binary/protobuf` workflowservice messages. The SDK's own protobuf
converters emit `json/protobuf` and want reflection metadata that
`@temporalio/proto`'s generated classes do not carry. `payload-converter.ts`
supplies one for the two messages, and the caller runs on a worker of its own
so nothing is added to the shared catalog worker. That converter is scaffolding:
it goes away when the SDK gains the operation. The Python SDK already has it as
`workflow.signal_with_start_workflow(...)`, on a branch.

Two things to know if that converter is ever revisited:

- Those generated namespaces are not constructors, so `instanceof` cannot
  identify a message. Match on `value.constructor.name`.
- A response crosses into the workflow sandbox, so its buffer belongs to another
  realm and protobufjs rejects it with "illegal buffer". Re-wrap it:
  `decode(new Uint8Array(payload.data ?? []))`.
- A payload codec must **not** encode the outer envelope. The Python SDK has a
  regression test for exactly this. Nothing here uses a codec, so it is untested
  in this repository.

Only the caller needs any of this. The operation's target is a catalog example,
run by the catalog worker, so the workflow that gets started and signalled is
one the catalog already ships. Point `targetExample` at any catalog example that
handles the signal name you set.

## `preview`

`preview.notes` is an ordered checklist for the reviewer. It goes to the console
and into the summary file, so write it as the steps someone else follows.
