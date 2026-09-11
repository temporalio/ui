---
name: system-nexus-operation
description: How the UI shows system Nexus endpoint operations, and how to add a new one. Use this skill when a person adds, scaffolds, or changes the display of a `__temporal_system` Nexus operation such as SignalWithStart, StartWorkflow, SignalWorkflow, or QueryWorkflow. Also use it when the event history shows a raw "Nexus Operation Scheduled" card that must show the operation.
---

# System Nexus operations

Temporal has a system Nexus endpoint with the name `__temporal_system`. A workflow
calls this endpoint to do an operation on a different workflow.

The call makes two usual events: `NexusOperationScheduled` and
`NexusOperationCompleted`. The payload of each event is a workflowservice message
in `binary/protobuf` format.

Without this module, the UI shows the Nexus transport. This module decodes the
payload and shows the operation.

## Where the code is

```
src/lib/system-nexus-endpoints/
├── index.ts                        the registry and the public functions
├── types.ts                        the SystemNexusOperationDefinition contract
├── shared.ts                       helpers for links, targets, and states
└── <operation-kind>/
    ├── schemas.ts                  the proto message types and schemas
    ├── definition.ts               all the data about this operation
    └── input-renderer.svelte       the display of its input payload
```

**Put all the data about an operation in its definition.** A component must not
test for an operation. If you write `if (operation === 'SignalWithStart')` in a
component, move that code to a definition.

## The public functions

The components use four functions only:

| Function                              | Used by                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `resolveSystemNexusEvent(event, ctx)` | `event-card`, `event-summary-row`, `event-details-full`, `timeline-graph-row` |
| `systemNexusInputRenderer(payload)`   | `event-card`, `input-and-results-payload`                                     |
| `systemNexusGroupLabel(event)`        | `get-group-name`                                                              |
| `schemaForMessageType(messageType)`   | `decode-payload`, for all binary protobuf payloads                            |

`resolveSystemNexusEvent` gives `null` for an operation that is not in the
registry. Thus the other events keep their usual display.

## How to add an operation

Use the generator:

```bash
pnpm system-nexus-operation:new StartWorkflowExecution --kind start-workflow --category workflow
```

| Flag           | Function                               | Default                          |
| -------------- | -------------------------------------- | -------------------------------- |
| _(positional)_ | The proto operation name in PascalCase | necessary                        |
| `--kind`       | The directory name and the kind slug   | the operation name in kebab case |
| `--category`   | The timeline color and icon            | `nexus`                          |
| `--grouped`    | Open all the events in the group       | off, thus the UI opens one event |

The generator writes the three files. It adds the new kind to the
`SystemNexusOperationKind` union. It also adds the definition to `OPERATIONS`.
The new code compiles, and it obeys the lint rules.

Then complete the two TODO comments:

1. **`definition.ts`, in `describeInitiated` and `describeTerminal`** — read the
   necessary fields from the decoded payload. Give back
   `{ displayName, hiddenFields, attributes?, links, summaryAttribute? }`.
2. **`input-renderer.svelte`** — show the payload panels from the design.

At the end, do this command: `pnpm lint && pnpm check && pnpm test -- --run`.

## Important fields in a definition

- **`operationName`** must be the same as the `operation` field on
  `NexusOperationScheduled`. The compiler does not find an error in this string.
  If the string is not correct, the UI shows the usual Nexus display.
- **`stateVerbs`** changes the last part of the event name. Example:
  `Scheduled` becomes `Initiated`, and `Completed` becomes `Delivered`.
- **`hiddenFields`** removes the Nexus transport fields from the card:
  `endpoint`, `service`, `operation`, and `requestId`.
- **`expandsIndividually`** controls the display of a group. Set it to `true` if
  the two events show almost the same fields. Then the UI opens one card only.
  Set it to `false` to keep the usual group behavior.
- **`summaryAttribute`** is the first item in the collapsed history row, if the
  row has no link.

## How to test

The file `src/lib/system-nexus-endpoints/resolve.test.ts` makes its test data with
`create()` and `toBinary()` from the true bufbuild schemas. Do not write the
base64 data manually.

Use the same method. It finds a change in a message type or a field name. Manual
test data hides these changes.

## A known limit

The module cannot resolve the `NexusOperationFailed`, `NexusOperationTimedOut`,
and `NexusOperationCanceled` events.

These events have only `scheduled_event_id`, `failure`, and `request_id`. They do
not have an `endpoint` field or an `operation` field. Thus the event cannot
identify itself without its related Scheduled event.

`stateVerbs` has the labels for these events. To complete this function, send the
event group to `resolveSystemNexusEvent`.

## How to see the display on your computer

Do this command:

```bash
pnpm demo start system-nexus-signal-with-start
```

The command starts the server, starts the UI, makes the two events, and shows
the links to the workflows. `pnpm demo stop` stops it again. Read
`demos/README.md` for the command list and the definition format.

The definition does these necessary things for you:

- It finds the commit that added the operation, then selects a server. If a CLI
  release has the commit, it uses that release. If no release has it, the command
  compiles your `temporalio/temporal` checkout into the dev server of the CLI.
- It enables `history.enableChasm` and
  `history.enableSignalWithStartFromWorkflow` in the dynamic configuration.
- It starts the catalog worker against that server.
- It sends the operation to the `__temporal_system` endpoint.

The target of the operation is the `signal-handlers` catalog example. The catalog
worker runs it. Thus the workflow that the operation starts and signals is a
workflow that the catalog has. Read the `catalog` skill.

**The demo is of the Nexus operation, not the `signalWithStart` function of the
client.** The function of the client goes to the frontend RPC. It makes no caller
workflow and no Nexus events.

**The Go SDK cannot send this operation from a workflow.** It refuses the
reserved `__temporal_` prefix. This is the reason that
`TestBothWorkflowsVisibleAfterSWSFromWorkflow` in the server repository is a
skipped test.

**The TypeScript SDK can send it.** The demo scenario uses an ordinary caller
workflow with `createNexusServiceClient` and the `__temporal_system` endpoint.

The payloads are `binary/protobuf` workflowservice messages, and the SDK has no
encoder for them yet. Therefore the scenario supplies one in
`payload-converter.ts` and it runs the caller on a worker of its own, thus the
Catalog worker gets no change. The converter is temporary: it goes away when the
SDK gets the operation. The Python SDK has it as
`workflow.signal_with_start_workflow(...)` on a branch. Read
`utilities/demo/README.md` for the details of the converter.

To use a server that is not the default, read the `local-temporal` skill.
