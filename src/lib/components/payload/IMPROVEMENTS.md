# Payload Component Improvement Suggestions

## Core Problem

The current API has "dead props" — props that are only relevant in specific modes but are always present on the interface:

| Prop                                                                       | Only relevant in...                             |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| `maxHeight`, `copyIconTitle`, `copySuccessIconTitle`, `testId`, `language` | `code-block`                                    |
| `fallback`, `prefix`, `maxSummaryLength`                                   | `summary`                                       |
| `truncateAt`                                                               | `inline-truncated`                              |
| `key`                                                                      | `code-block` (never used in `decodeForSummary`) |

A caller using `mode="summary"` has to ignore 5 irrelevant props. A caller using `mode="inline-truncated"` ignores 9. This is the main thing worth fixing.

---

## Recommendation: Split by mode, not by usage group

Do **not** create 7 components for the 7 usage groups — those groups reflect where data comes from, not how it's rendered. The split that actually eliminates dead props is by rendering mode.

### 1. `<PayloadCodeBlock>` (replaces default mode)

Covers ~24 call sites (Groups 1–5, 7). Clean API:

```svelte
<PayloadCodeBlock
  value={...}
  key="payloads"
  maxHeight={384}
  copyIconTitle="..."
  copySuccessIconTitle="..."
  language="json"
  testId="..."
/>
```

The `key` prop stays here because `decodeForCodeBlock` is the only decode path that uses it to post-extract a field from the decoded attributes object. `decodeForSummary` never uses it.

### 2. `<PayloadSummary>` (replaces `mode="summary"`)

5 call sites (Groups 1 and 5). Clean API:

```svelte
<PayloadSummary
  value={group.userMetadata.summary}
  fallback="decode failed"
  prefix="ActivityName"
  maxSummaryLength={120}
  class="block truncate"
/>
```

No `key`, no `language`, no copy props.

### 3. `<PayloadInline>` (replaces `mode="inline-truncated"`)

1 call site (`event-details-row.svelte`). Barely worth a component on its own, but the separation makes the intent obvious and keeps `PayloadCodeBlock` from carrying `truncateAt`.

### 4. `<PayloadDecoder>` — headless decoder (for `children` + `onDecode` uses)

The `children` snippet pattern is effectively a different use case: the component has no rendering of its own and just exposes the decoded value. Currently it's conflated with the display modes. Two call sites use this pattern purely:

- `schedule-input-payload.svelte` — wraps an editable `<PayloadInputWithEncoding>` with the decoded value as initial state
- `input-and-results-payload.svelte` — renders individual items as separate `<CodeBlock>` components

Making this explicit as a headless component clarifies intent:

```svelte
<PayloadDecoder value={payloads} key="payloads" {onDecode}>
  {#snippet children(decodedValue)}
    <PayloadInputWithEncoding value={decodedValue} ... />
  {/snippet}
</PayloadDecoder>
```

The other `children` uses in `metadata-events.svelte` and `timeline-graph-row.svelte` wrap the decoded string in a styled `<span>` or `<Text>` — those could switch to `<PayloadSummary>` with a custom `class` instead, eliminating the children snippet entirely.

---

## What NOT to do

- **No component per usage group.** Groups 1–4 all need `PayloadCodeBlock`. The groups describe data sources, not rendering contracts.
- **No change to the decode utilities.** `cloneAllPotentialPayloadsWithCodec`, `decodePayloadAttributes`, `decodeSingleReadablePayloadWithCodec` are already well-separated — the components just call them.
- **No removal of `key`.** It encodes real semantic information (which subfield to extract post-decode). But renaming it to `fieldName` or `payloadField` would make it less ambiguous, since `key` in Svelte conventionally means the list reconciliation key.

---

## Summary

| New component        | Replaces                                    | Call sites |
| -------------------- | ------------------------------------------- | ---------- |
| `<PayloadCodeBlock>` | `<Payload>` / `<Payload mode="code-block">` | ~24        |
| `<PayloadSummary>`   | `<Payload mode="summary">`                  | 5          |
| `<PayloadInline>`    | `<Payload mode="inline-truncated">`         | 1          |
| `<PayloadDecoder>`   | `<Payload>{children}</Payload>`             | 2–3        |

The shared decode logic stays in the utility functions it already lives in. Each display component calls the appropriate decode path directly, no `mode` switching needed.
