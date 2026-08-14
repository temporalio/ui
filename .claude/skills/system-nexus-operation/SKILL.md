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

The Temporal server must support the operation. Read the `local-temporal` skill
for the procedure to run a local server build.

You must also enable `history.enableChasm` and
`history.enableSignalWithStartFromWorkflow` in the dynamic configuration.
