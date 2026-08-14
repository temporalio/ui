---
name: system-nexus-operation
description: How the UI renders system Nexus endpoint operations, and how to add a new one. Use when asked to add, scaffold, or change rendering for a `__temporal_system` Nexus operation such as SignalWithStart, StartWorkflow, SignalWorkflow, or QueryWorkflow — or when event history shows a raw "Nexus Operation Scheduled" card that should read as a friendlier operation.
---

# System Nexus Operations

Temporal exposes a built-in `__temporal_system` Nexus endpoint. A workflow calling
it produces ordinary `NexusOperationScheduled` / `NexusOperationCompleted` events
whose payloads are `binary/protobuf` workflowservice request/response messages.

Left alone, the UI renders those as raw Nexus wrapper events. This module decodes
the payload and presents the operation the user actually invoked.

## Where it lives

```
src/lib/system-nexus-endpoints/
├── index.ts                        registry + the public API
├── types.ts                        SystemNexusOperationDefinition contract
├── shared.ts                       link/target/state helpers
└── <operation-kind>/
    ├── schemas.ts                  proto message types + bufbuild schemas
    ├── definition.ts               everything about this operation
    └── input-renderer.svelte       how its input payload renders
```

**All per-operation knowledge belongs in a definition.** Host components must
never branch on an operation. If you find yourself adding
`if (operation === 'SignalWithStart')` to a component, it belongs in a definition
instead.

## The public API

Host components consume exactly four functions:

| Function                              | Used by                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `resolveSystemNexusEvent(event, ctx)` | `event-card`, `event-summary-row`, `event-details-full`, `timeline-graph-row` |
| `systemNexusInputRenderer(payload)`   | `event-card`, `input-and-results-payload`                                     |
| `systemNexusGroupLabel(event)`        | `get-group-name`                                                              |
| `schemaForMessageType(messageType)`   | `decode-payload` (generic binary/protobuf decode)                             |

`resolveSystemNexusEvent` returns `null` for anything that is not a registered
operation, so callers fall through to normal event rendering.

## Adding an operation

Scaffold it:

```bash
pnpm system-nexus-operation:new StartWorkflowExecution --kind start-workflow --category workflow
```

| Flag           | Meaning                               | Default                     |
| -------------- | ------------------------------------- | --------------------------- |
| _(positional)_ | Proto operation name, PascalCase      | required                    |
| `--kind`       | Directory name + kind slug            | kebab-case of the operation |
| `--category`   | Timeline category (colour + icon)     | `nexus`                     |
| `--grouped`    | Expand the whole event group together | off (one event at a time)   |

That writes the three files, widens the `SystemNexusOperationKind` union, and adds
the definition to `OPERATIONS`. The generated code compiles and lints as-is.

Then fill in the two TODOs:

1. **`definition.ts` → `describeInitiated` / `describeTerminal`** — pull the fields
   this operation should surface off the decoded payload and return
   `{ displayName, hiddenFields, attributes?, links, summaryAttribute? }`.
2. **`input-renderer.svelte`** — render the payload panels the design calls for.

Finally: `pnpm lint && pnpm check && pnpm test -- --run`.

## Definition fields worth thinking about

- **`operationName`** must exactly match the `operation` field on
  `NexusOperationScheduled`. A typo is not a compile error — the operation silently
  falls through to default Nexus rendering.
- **`stateVerbs`** remaps the event-name suffix, e.g. `Scheduled → Initiated`,
  `Completed → Delivered`.
- **`hiddenFields`** suppresses raw Nexus wrapper fields (`endpoint`, `service`,
  `operation`, `requestId`) so the card reads as the operation, not as Nexus.
- **`expandsIndividually`** — `true` when the paired events carry near-identical
  fields (synchronous operations like SignalWithStart), so expanding one does not
  open both. `false` restores the normal grouped expansion.
- **`summaryAttribute`** is what the collapsed history row leads with when there is
  no link to show.

## Testing

`src/lib/system-nexus-endpoints/resolve.test.ts` builds fixtures with `create()`
and `toBinary()` from the real bufbuild schemas rather than hand-rolled base64.
Copy that pattern — it catches message-type and field-name drift that hand-written
fixtures hide.

## Known limitation

Terminal events other than `Completed` — `NexusOperationFailed`, `TimedOut`,
`Canceled` — cannot currently be resolved. Their attributes carry only
`scheduled_event_id`, `failure`, and `request_id`; there is no `endpoint` or
`operation`, so the event cannot identify itself without its Scheduled sibling.
`stateVerbs` already carries labels for them; wiring it up requires passing the
event group into `resolveSystemNexusEvent`.

## Exercising it locally

The operation only appears if the Temporal server supports it. See the
`local-temporal` skill for running against a local server build, and note that
`history.enableChasm` and `history.enableSignalWithStartFromWorkflow` must be
enabled in dynamic config.
