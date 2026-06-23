# Braintrust + Temporal Span Tracing POC

Demonstrates end-to-end Braintrust observability integrated with Temporal workflows. Run a workflow, see the full span trace in Braintrust with deep links from Temporal's UI.

This POC complements the [UI prototype](../../temporal/) which shows the **Temporal side** (compact view, chat view, metric badges). This shows the **Braintrust side** - the span trace that users click through to via `trace_url`.

## Prerequisites

- Node.js 18+
- pnpm
- Temporal CLI (`brew install temporal` or see [docs](https://docs.temporal.io/cli))
- **`BRAINTRUST_API_KEY`** - required. Get one from [braintrust.dev](https://www.braintrust.dev/) under Settings > API Keys.

## Quick Start

```bash
# 1. Start a local Temporal server (skip if already running)
temporal server start-dev

# 2. Set your Braintrust API key
export BRAINTRUST_API_KEY=sk-...

# 3. Install and run
cd poc/braintrust-tracing
pnpm install
pnpm approve-builds braintrust @swc/core esbuild protobufjs
npx tsx run.ts
```

The script prints the Braintrust project URL at the end. Open it to see the trace.

## What it does

Runs a support ticket triage workflow with 4 activities:

1. **classifyTicket** - classify intent, urgency, category (simulated LLM)
2. **retrieveDocs** - look up relevant docs (non-LLM, with custom `doc_lookup` span)
3. **draftResponse** - generate customer response (simulated LLM, with retry policy)
4. **qualityCheck** - score response on helpfulness/accuracy/tone (LLM-as-judge)

Each LLM activity calls `setCompletionDetails()` with model, tokens, cost, and `traceUrl` from `currentSpan().permalink()`. The quality check activity uses `logFeedback()` to score the draft response's span via its `spanId`.

## How span context propagates

```
Client (run.ts)                Temporal Server              Worker
---------------                --------------              ------
start_span("api.triage")
  |
  +- BraintrustPlugin
  |  serializes span context
  |  into workflow headers
  |  key: "_braintrust-span" --> stores in event history -->
  |                                                         |
  |                                                   BraintrustPlugin
  |                                                   extracts span context
  |                                                         |
  |                                                   Creates workflow span
  |                                                   (child of client span)
  |                                                         |
  |                                                   For each activity:
  |                                                   - Injects updated context
  |                                                     into activity headers
  |                                                   - Creates activity span
  |                                                     (child of workflow)
  |                                                         |
  |                                                   All spans flush to
  |                                                   Braintrust API
  |                                                         |
  +------------ trace_url <---------------------------------+
```

**Header key:** `_braintrust-span`

**Context payload** (serialized JSON):
```json
{
  "span_id": "...",
  "root_span_id": "...",
  "trace_id": "..."
}
```

## Resulting trace in Braintrust

```
api.triage_ticket                            [task - client span]
  temporal.workflow.TicketTriageWorkflow      [task - auto-created]
    temporal.activity.classifyTicket          [task - auto-created]
    temporal.activity.retrieveDocs            [task - auto-created]
      doc_lookup                              [tool - custom span]
    temporal.activity.draftResponse           [task - auto-created]
    temporal.activity.qualityCheck            [task - auto-created]
```

## How trace_url and spanId are obtained

Inside an activity, the Braintrust plugin makes the current span available via `currentSpan()`:

```typescript
import { currentSpan } from "braintrust";

// Full deep link to this span's trace in Braintrust
const traceUrl = await currentSpan().permalink();

// Span ID for cross-activity feedback (e.g. LLM-as-judge)
const spanId = currentSpan().id;

setCompletionDetails({
  llm: {
    model: "gpt-4o",
    traceUrl,   // click-through from Temporal UI -> Braintrust
    spanId,     // enables scoring this span from another activity
  },
});
```

## LLM-as-judge pattern

The `qualityCheck` activity scores the `draftResponse` activity's span using its `spanId`:

```typescript
import { currentLogger } from "braintrust";

logger.logFeedback({
  id: draftSpanId,  // span ID from the draft activity
  scores: { helpfulness: 0.9, accuracy: 0.8, tone: 1.0 },
  source: "external",
});
```

This attaches scores to the draft span in Braintrust, visible in the trace view.

## API key

`BRAINTRUST_API_KEY` must be set in your environment. Without it, the POC will exit with an error.

The key is used for:
- `initLogger()` - initializes the Braintrust logger with your project
- `createBraintrustTemporalPlugin()` - the plugin reads the key from the initialized logger
- `flush()` - sends all buffered spans to the Braintrust API

The key is never stored in code or committed. Get one from [braintrust.dev](https://www.braintrust.dev/) > Settings > API Keys.

## How this connects to the 1-pager

The [First-class AI metadata](https://www.notion.so/temporalio/First-class-AI-metadata-3748fc56773880ab9fe6fcf300962f9d) 1-pager proposes `ActivityCompletionDetails.LLMCallDetails.trace_url` as a bridge:
- **Temporal UI** shows orchestration (retries, branches, failures, metric badges)
- **Braintrust** shows LLM-level detail (prompts, eval scores, response quality)
- `trace_url` links from Temporal UI directly to the Braintrust trace

This POC demonstrates the Braintrust half of that bridge.

## Files

| File | Purpose |
|------|---------|
| `run.ts` | Entry point: starts worker, executes workflow, prints trace URL |
| `activities.ts` | 4 activities (3 simulated LLM + 1 non-LLM doc lookup) |
| `workflows.ts` | `TicketTriageWorkflow` - sequential activity orchestration |
| `completion-details.ts` | `setCompletionDetails()` API simulation (AsyncLocalStorage) |
| `details-interceptor.ts` | Interceptor that attaches details to activity result |
