# LLM Observability Demo

Branch: `llm-observability-prototype`

## Quick Start

```bash
cd /Users/laniehei/code/src/github/temporalio/ui
git checkout llm-observability-prototype
pnpm install
pnpm dev
```

In a second terminal:

```bash
node_modules/.bin/esno temporal/run-llm-demo.ts
```

Open: http://localhost:3334/namespaces/default/workflows/llm-workflow-run-a-v2

## What the demo runs

`run-llm-demo.ts` starts 2 workflows with different prompts (for A/B comparison):
- `llm-workflow-run-a-v2` and `llm-workflow-run-b-v2`

Each workflow runs 10 activities:
- `callLLM` (gpt-4o) - with custom `_details` fields (temperature, retrievalSource)
- `echo` - non-LLM activity (system message in chat view)
- `callLLMClaude` (claude-3-5-sonnet)
- `callLLMGemini` (gemini-1.5-pro)
- `echo` - "Validating responses..."
- `callLLM` - summarization step
- `echo` - "Generating final report..."
- `callLLMClaude` - executive summary
- `callLLMFlaky` (gpt-4o) - fails twice, succeeds on attempt 3 (shows retry badge)
- `callLLM` - action items

## What to look at

### Compact view (default)
- **Name column** - activity name as its own column
- **Duration column** - activity execution time
- **LLM badges** - model, tokens, cost in Details column (only for `_details` activities)
- **Attempt badge** - shows "Attempt 3" warning on `callLLMFlaky` (hidden when attempt = 1)
- **Custom fields** - `temperature: 0.7`, `retrievalSource: knowledge-base-v3` on first callLLM
- **Click any row** to expand: shows clean Input/Output with "Raw event details" toggle

### Chat tab
- Input/output bubble view (iMessage style)
- Activity header with model + tokens + cost
- "Show more" / "Show less" for long messages (>500 chars)
- Non-LLM activities as centered system messages

### A/B Comparison
- Select both workflows from the workflow list (checkboxes appear on hover)
- Click "Compare" button
- Side-by-side: model, tokens, duration, output per step
- Token/duration deltas with color coding
- Word-level output diff

### Workflow details sidebar
- Total LLM tokens, models used, LLM steps count

## The `_details` convention

Activities return `_details` in their result:

```json
{
  "result": "...",
  "_details": {
    "model": "gpt-4o",
    "promptTokens": 150,
    "completionTokens": 380,
    "totalTokens": 530,
    "cost": 0.012,
    "temperature": 0.7,
    "anyCustomField": "rendered automatically"
  }
}
```

Known fields get special rendering (model badge, token count, cost). Extra fields render as key:value pairs.

## Key files

| File | What it does |
|------|-------------|
| `temporal/activities/call-llm.ts` | Demo LLM activity (gpt-4o) |
| `temporal/activities/call-llm-claude.ts` | Demo LLM activity (claude) |
| `temporal/activities/call-llm-gemini.ts` | Demo LLM activity (gemini) |
| `temporal/activities/call-llm-flaky.ts` | Demo LLM activity that retries |
| `temporal/workflows.ts` | LLMWorkflow definition |
| `temporal/run-llm-demo.ts` | Script to start demo workflows |
| `src/lib/models/event-history/get-event-llm-metadata.ts` | `_details` extraction logic |
| `src/lib/components/event/chat-view.svelte` | Chat tab component |
| `src/lib/components/event/event-summary-row.svelte` | Compact view row (badges, columns) |
| `src/lib/components/event/event-details-full.svelte` | Expanded view (input/output + raw toggle) |
| `src/lib/layouts/workflow-history-layout.svelte` | Tab system (All/Compact/JSON/Chat) |
| `src/lib/pages/compare-runs.svelte` | A/B comparison page |

## Documentation

- [UI Prototype doc](https://www.notion.so/temporalio/UI-Prototype-LLM-Observability-32f8fc56773881559f24c32bd0681de5)
- [Agentic Observability 1-pager](https://www.notion.so/temporalio/Agentic-Observability-31f8fc56773880618801e6e260376284)
