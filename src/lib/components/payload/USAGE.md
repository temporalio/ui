# Payload Component Usage Report

## Overview

The `<Payload>` component (`payload.svelte`) is a unified decoder/renderer for all Temporal payload types. It accepts a `value` prop that can be a raw Payload, EventAttribute, WorkflowEvent, Memo, or any decodable object, and renders it in one of three modes: `code-block` (default), `summary`, or `inline-truncated`.

31 call sites across 17 files.

---

## Group 1: Event History Cards & Rows

These components render individual events in the event history panel. They show payload data, search attributes, stack traces, and user metadata.

| File                                                         | Usage                                                                                                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/components/event/event-card.svelte`                 | 5 usages: user metadata summary (mode=summary), payloads (key="payloads"), search attributes (key="searchAttributes"), generic value, stack trace (language="text") |
| `src/lib/components/event/event-details-row.svelte`          | 1 usage: `mode="inline-truncated"` for compact object value display in table rows                                                                                   |
| `src/lib/components/event/event-summary-row.svelte`          | 1 usage: `mode="summary"` for `currentEvent.userMetadata.summary` in row headers                                                                                    |
| `src/lib/components/workflow/workflow-json-navigator.svelte` | 1 usage: raw event JSON display (`testId="event-history-json"`)                                                                                                     |

**Notable patterns:** `event-card.svelte` is the most complex consumer — it switches between 5 different Payload invocations based on the attribute type (payloads vs searchAttributes vs stack traces).

---

## Group 2: Workflow Metadata Pages

These are dedicated full-page views for workflow-level metadata, reachable via the workflow detail tabs.

| File                                              | Usage                                           |
| ------------------------------------------------- | ----------------------------------------------- |
| `src/lib/pages/workflow-metadata.svelte`          | 2 usages: search attributes + memo side-by-side |
| `src/lib/pages/workflow-search-attributes.svelte` | 1 usage: search attributes only                 |
| `src/lib/pages/workflow-memo.svelte`              | 1 usage: memo only                              |

**Notable patterns:** All three use `key="searchAttributes"` or `key="memo"` to tell the decoder which field to extract. All include copy icon titles for the copy button.

---

## Group 3: Activity Input & Output

These components show the input payloads and result/failure payloads for activities, both in the workflow event history and the standalone activity view.

| File                                                                         | Usage                                                                                                |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/lib/components/standalone-activities/activity-input-and-outcome.svelte` | 2 usages: `input` (key="payloads") and `outcome.result` (key="payloads")                             |
| `src/lib/components/workflow/input-and-results-payload.svelte`               | 2 usages: parsed content with children snippet (multiple CodeBlock renders) + fallback plain payload |
| `src/lib/components/workflow/pending-activity/pending-activity-card.svelte`  | 2 usages: heartbeat details (key="payloads") + last failure (omitting stackTrace)                    |

**Notable patterns:** `input-and-results-payload.svelte` uses the `children` snippet to render individual array items as separate CodeBlocks when the payload is an array. The fallback usage handles cases where `parsedContent` is unavailable.

---

## Group 4: Standalone Activity Details

The full standalone activity execution detail view (separate from the workflow context).

| File                                                         | Usage                                       |
| ------------------------------------------------------------ | ------------------------------------------- |
| `src/lib/pages/standalone-activity-details.svelte`           | 2 usages: heartbeat details + header fields |
| `src/lib/pages/standalone-activity-search-attributes.svelte` | 1 usage: search attributes                  |

**Notable patterns:** These are simpler invocations — no copy buttons, no snippets, just raw value rendering.

---

## Group 5: Timeline / SVG Visualization

These components render within the visual timeline graph (lines-and-dots). They display payloads inside SVG-constrained boxes with pixel-level height constraints.

| File                                                              | Usage                                                                                                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/components/lines-and-dots/svg/group-details-text.svelte` | 3 usages: payloads (key="payloads"), search attributes (key="searchAttributes"), generic value — selected based on attribute type            |
| `src/lib/components/lines-and-dots/svg/timeline-graph-row.svelte` | 1 usage: `mode="summary"` for event group user metadata, with `prefix` (activity name) and `fallback` (display name or local activity label) |
| `src/lib/components/workflow/metadata/metadata-events.svelte`     | 1 usage: `mode="summary"` for event group `userMetadata.summary` with children snippet wrapping in `<span class="text-sm">`                  |

**Notable patterns:** `maxHeight` is derived from pixel calculations (`staticCodeBlockHeight - fontSizeRatio`). The `onDecode` callback is threaded through to notify the parent SVG when decoding completes (to trigger re-render). `timeline-graph-row.svelte` uses `prefix` and `fallback` together to build a display label.

---

## Group 6: Schedule Management

The schedule creation/edit form uses Payload to pre-populate the payload editor when an existing schedule is loaded.

| File                                                                      | Usage                                                                                                    |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/lib/components/schedule/schedule-form/schedule-input-payload.svelte` | 1 usage: `payloads` with `onDecode` callback and children snippet rendering `<PayloadInputWithEncoding>` |

**Notable patterns:** This is the only call site that uses `onDecode` to capture the decoded value for form initialization, and children snippet to render an editable input instead of a read-only code block.

---

## Group 7: Workflow Client Actions

| File                                                                          | Usage                                                                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/lib/components/workflow/client-actions/update-confirmation-modal.svelte` | 1 usage: `success.payloads[0]` with `language="text"` and `class="mt-4"` |

**Notable patterns:** Only call site with `language="text"` (non-JSON rendering). Targets a single payload item from an array.

---

## Mode Usage Summary

| Mode                   | Count | Files                                                                                    |
| ---------------------- | ----- | ---------------------------------------------------------------------------------------- |
| `code-block` (default) | ~24   | Most files                                                                               |
| `summary`              | 5     | `event-card`, `event-summary-row`, `metadata-events`, `timeline-graph-row`, `event-card` |
| `inline-truncated`     | 1     | `event-details-row`                                                                      |

## Key Prop Patterns

| Pattern                  | Description                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `key="payloads"`         | Tells decoder to unwrap the `payloads` array field                                               |
| `key="searchAttributes"` | Tells decoder to unwrap search attribute fields                                                  |
| `key="memo"`             | Tells decoder to unwrap memo fields                                                              |
| `onDecode` callback      | Used in schedule form and SVG timeline to react to decoded values                                |
| `children` snippet       | Used to customize rendering of decoded value (editable form, individual CodeBlocks, styled text) |
| `maxHeight`              | Constrains code block scroll height (384px in cards, pixel-calculated in SVG)                    |
| `language="text"`        | Non-JSON rendering for stack traces and update results                                           |
