# PayloadCoverageWorkflow — Design Notes

## Context

The `<Payload>` component in `src/lib/components/payload/payload.svelte` decodes and renders Temporal Payloads from event history. To test all display/decode paths in the UI, we need a Temporal workflow that exercises every event type that produces a Payload field. The workflow is added to the existing `temporal/` directory which already has a worker, client, codec, and 4 existing workflows.

## Files

- `temporal/activities/complex.ts` — new activity with rich input/output types
- `temporal/activities/index.ts` — exports the new `complex` activity
- `temporal/workflows.ts` — adds `PayloadCoverageChildWorkflow` and `PayloadCoverageWorkflow`
- `temporal/client.ts` — adds `startPayloadCoverageWorkflow` helper for easy testing

## Payload-Producing Event Types Covered

| Event / Location                            | Payload Field                                                              |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `WorkflowExecutionStarted`                  | `input` — rich object with all JSON primitive types; `memo` — set at start |
| `ActivityTaskScheduled`                     | `input` — complex object with nested arrays/objects                        |
| `ActivityTaskCompleted`                     | `result` — complex return object                                           |
| `ActivityTaskFailed`                        | `failure.details` — from deliberately failing activity variant             |
| `ActivityTaskScheduled` (local)             | inside `MarkerRecorded` details                                            |
| `ActivityTaskCompleted` (local)             | inside `MarkerRecorded` details                                            |
| `WorkflowExecutionSignaled`                 | `input` — two signals with typed payloads                                  |
| `WorkflowExecutionUpdateAccepted/Completed` | `input` / `result`                                                         |
| `UpsertWorkflowSearchAttributes`            | search attribute value Payloads                                            |
| `StartChildWorkflowExecutionInitiated`      | `input`                                                                    |
| `ChildWorkflowExecutionCompleted`           | `result`                                                                   |
| `WorkflowExecutionCompleted`                | `result` — aggregate result object                                         |
| Query `get-status`                          | runtime query response (visible in UI query tab)                           |
| Query `get-field`                           | parameterized query response                                               |

## Workflow Behavior

- **Starts and runs activities/child workflow immediately** — all Payload events are created on start
- **Waits up to 5 minutes** for signals/queries/updates via `condition` — gives time for manual UI testing
- **Auto-completes** after the timeout, so you also see `WorkflowExecutionCompleted` with result payload
- **Failing activity** is wrapped in try/catch — workflow continues after `ActivityTaskFailed` is recorded

## Running It

```bash
# Register custom search attributes (one-time, local dev server)
temporal operator search-attribute create --name CustomKeywordField --type Keyword
temporal operator search-attribute create --name CustomIntField --type Int
```

Then call `startPayloadCoverageWorkflow(client)` from `client.ts`. The workflow starts at ID `payload-coverage-workflow`.

## Interacting During the 5-Minute Window

**Send a signal:**

```bash
temporal workflow signal \
  --workflow-id payload-coverage-workflow \
  --name add-data \
  --input '{"key":"testKey","value":{"nested":true}}'

temporal workflow signal \
  --workflow-id payload-coverage-workflow \
  --name trigger \
  --input '["tagA","tagB"]'
```

**Send an update:**

```bash
temporal workflow update \
  --workflow-id payload-coverage-workflow \
  --name process-update \
  --input '{"operation":"transform","payload":{"x":1,"y":2}}'
```

**Run a query:**

```bash
temporal workflow query \
  --workflow-id payload-coverage-workflow \
  --type get-status

temporal workflow query \
  --workflow-id payload-coverage-workflow \
  --type get-field \
  --input '"stringField"'
```
