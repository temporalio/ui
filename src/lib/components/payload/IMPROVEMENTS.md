# Payload Component Improvements

## Background

The four payload components (`PayloadCodeBlock`, `PayloadDecoder`, `PayloadInline`, `PayloadSummary`) share a common design problem: their `value` prop accepts `DecodableValue` — a 7-way union that includes `PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo | RawPayload | null | undefined` — and rely on a `fieldName` prop to extract the actual payload data from wrapped objects.

This document identifies where that complexity comes from, what can be simplified, and the concrete interface changes needed.

---

## The `fieldName` Problem

### Why it exists

`fieldName` exists because call sites wrap payload data in intermediate objects and then tell the component which key to extract:

```svelte
<!-- call site wraps, then names the key to unwrap -->
<PayloadCodeBlock
  value={{ searchAttributes: workflow.searchAttributes }}
  fieldName="searchAttributes"
/>
```

This pattern was inherited from the monolithic `<Payload>` component. It routes through `decodeEventAttributes`, which walks event attribute objects and decodes nested payload fields. Wrapping in `{ searchAttributes: x }` mimics an event attribute shape so the decode function knows which fields to decode.

### What fieldName actually does

In `decode-payload-value.ts`:

```typescript
// Step 1: run full decode pipeline on the whole object
const convertedAttributes = await decodeEventAttributes(value);
const decodedAttributes = parsePayloadAttributes(convertedAttributes) as object;

// Step 2: optionally extract a field from the decoded result
const keyExists = fieldName && decodedAttributes?.[fieldName];
let finalValue = keyExists ? decodedAttributes[fieldName] : decodedAttributes;

// Step 3: unwrap single-element arrays
if (Array.isArray(finalValue) && finalValue.length === 1) {
  finalValue = finalValue[0];
}
```

The decode runs on the full wrapped object regardless. `fieldName` is only used _after_ decoding to pluck one field out of the result.

### The fix: callers pass the value directly

If callers extract the payload before passing, the component can skip the wrap/unwrap dance entirely:

```svelte
<!-- before -->
<PayloadCodeBlock
  value={{ searchAttributes: workflow.searchAttributes }}
  fieldName="searchAttributes"
/>

<!-- after: caller passes the payload directly -->
<PayloadCodeBlock value={workflow.searchAttributes} />
```

This requires a decode function that can handle `Payload | Payloads | null | undefined` without needing to know the field name. The decode pipeline supports this already — the wrapper pattern was never required, only habitual.

### Exceptions

Two call sites have legitimate fieldName use that requires different handling:

| Call site                          | fieldName    | Why                                                                                                                                                                |
| ---------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `input-and-results-payload.svelte` | `"payloads"` | Receives a pre-parsed object `{ payloads: [...] }` from a JSON parse step; extracting `.payloads` before passing would require restructuring the surrounding logic |
| `schedule-input-payload.svelte`    | `"payloads"` | Same: receives a `Payloads` proto object, passes whole thing to decode and extracts `.payloads` post-decode                                                        |

For these two, the alternative is to extract `.payloads` before passing: `value={payloads.payloads}` — straightforward but requires verifying the surrounding null checks.

---

## Proposed Interface Changes

### `PayloadCodeBlock`

```typescript
// Current
interface Props {
  value: DecodableValue; // 7-way union
  fieldName?: string; // post-decode field extraction
  maxHeight?: number;
  copyIconTitle?: string;
  copySuccessIconTitle?: string;
  testId?: string;
  language?: EditorLanguage;
  onDecode?: (decodedValue: string) => void;
}

// Proposed
interface Props {
  value: Payload | Payloads | null | undefined;
  maxHeight?: number;
  copyIconTitle?: string;
  copySuccessIconTitle?: string;
  testId?: string;
  language?: EditorLanguage;
  onDecode?: (decodedValue: string) => void;
}
```

Callers that currently pass full `WorkflowEvent` objects (e.g. `workflow-json-navigator.svelte`) are not using `fieldName` and would need either a separate code path or to keep accepting the broader type for that use case only.

### `PayloadDecoder`

```typescript
// Current
interface Props {
  value: DecodableValue;
  fieldName?: string;
  onDecode?: (decodedValue: string) => void;
  children: Snippet<[decodedValue: string]>;
}

// Proposed
interface Props {
  value: Payload | Payloads | null | undefined;
  onDecode?: (decodedValue: string) => void;
  children: Snippet<[decodedValue: string]>;
}
```

### `PayloadInline`

```typescript
// Current
interface Props {
  value: DecodableValue;
  fieldName?: string;
  truncateAt?: number;
  class?: string;
}

// Proposed
interface Props {
  value: Payload | Payloads | null | undefined;
  truncateAt?: number;
  class?: string;
}
```

### `PayloadSummary`

This component already uses a narrower type (`RawPayload | Payload`) and a different decode function (`decodeUserMetadata`). Its interface is close to correct. The only improvement is renaming the type alias for clarity:

```typescript
// no functional change needed — already correct
interface Props {
  value: Payload | null | undefined; // rename RawPayload → Payload for consistency
  fallback?: string;
  prefix?: string;
  maxSummaryLength?: number;
  class?: string;
  onDecode?: (decodedValue: string) => void;
  children?: Snippet<[decodedValue: string]>;
}
```

---

## Required Decode Utility Changes

### New function: `decodePayloads`

The current `decodePayloadValue` in `decode-payload-value.ts` routes through `decodeEventAttributes`, which is designed for event attribute trees. A simpler function for the `Payload | Payloads` case:

```typescript
export const decodePayloads = async (
  value: Payload | Payloads | null | undefined,
): Promise<string> => {
  if (!value) return stringifyWithBigInt(value);
  // Normalize to array
  const payloads = Array.isArray((value as Payloads).payloads)
    ? (value as Payloads).payloads
    : [value as Payload];
  // Phase 2: send through codec
  const decoded = await decodeWithCodec(payloads);
  // Phase 1: base64 parse
  const parsed = decoded.map(parseRawPayloadToJSON);
  return stringifyWithBigInt(parsed.length === 1 ? parsed[0] : parsed);
};
```

This is shorter, type-safe, and does not rely on the `fieldName` extraction step.

### Keep `decodePayloadValue` for WorkflowEvent inputs

The workflow JSON navigator passes a full `HistoryEvent` (WorkflowEvent) to `PayloadCodeBlock`. That decode path still needs `decodeEventAttributes`. Options:

1. Keep a separate `PayloadEventBlock` component for full event rendering (already a distinct use case — the only call site is the JSON navigator).
2. Accept `DecodableValue` in `PayloadCodeBlock` but only when `fieldName` is not needed, and narrow at the type level by making `fieldName` a required prop when passing a complex type — enforced via discriminated props.

Option 1 is simpler.

---

## Call Site Changes Required

| File                                           | Current                                                        | Change                                       |
| ---------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `workflow-search-attributes.svelte`            | `value={{ searchAttributes: x }} fieldName="searchAttributes"` | `value={workflow.searchAttributes}`          |
| `workflow-memo.svelte`                         | `value={{ memo: x }} fieldName="memo"`                         | `value={workflow.memo}`                      |
| `workflow-metadata.svelte`                     | Same as above ×2                                               | Same as above ×2                             |
| `standalone-activity-search-attributes.svelte` | `value={{ searchAttributes: x }} fieldName="searchAttributes"` | `value={searchAttributes}`                   |
| `standalone-activity-details.svelte`           | No fieldName; value is already `Payloads`                      | No change                                    |
| `update-confirmation-modal.svelte`             | `value={success.payloads[0]}` (single `Payload`)               | No change                                    |
| `event-details-row.svelte`                     | `value={x} fieldName="payloads"`                               | `value={x?.payloads}` — extract at call site |
| `input-and-results-payload.svelte`             | `value={parsedContent} fieldName="payloads"`                   | `value={parsedContent?.payloads}`            |
| `schedule-input-payload.svelte`                | `value={payloads} fieldName="payloads"`                        | `value={payloads?.payloads}`                 |
| `workflow-json-navigator.svelte`               | `value={rawEvent}` (full `WorkflowEvent`)                      | Move to `PayloadEventBlock` or keep separate |

---

## Prioritized Work

1. **Add `decodePayloads` utility** in `decode-payload-value.ts` — the new decode path for `Payload | Payloads`.
2. **Update `PayloadCodeBlock`, `PayloadDecoder`, `PayloadInline`** to use the new utility and remove `fieldName`.
3. **Update call sites** — 8 files, all mechanical changes (remove wrapper, remove `fieldName` prop, adjust value expression).
4. **Extract `PayloadEventBlock`** for the workflow JSON navigator use case, or document it as the one legitimate exception.
5. **Remove `fieldName` from `decode-payload-value.ts` API** and simplify `decodePayloadValue` signature.

Steps 1–3 can be done in a single pass. Step 4 is optional but recommended for type safety.

## Make decoding ASYNC/AWAIT and include Retries

### Current state

The decode utilities (`decodeEventAttributes`, `decodeUserMetadata`, `decodePayloadValue`) are already `async` functions that return Promises. However, the components cannot use `await` directly inside `$effect` — returning a Promise from `$effect` is treated as a cleanup function, not a suspension. So all four components fall back to chained `.then().catch()`:

```typescript
$effect(() => {
  if (!value) return;
  decodePayloadValue(value, fieldName)
    .then((result) => {
      decodedValue = result;
      onDecode?.(result);
    })
    .catch(() => {
      console.error('Could not decode payloads');
    });
});
```

Additionally, `data-encoder.ts` `codeServerRequest` makes a single `fetch` with no timeout and no retry. On failure it silently returns the original (undecoded) payloads, so the UI shows encoded base64 without any error indication.

---

### Problem 1: Race conditions on reactive updates

When `value` changes while a decode is in progress, the `$effect` re-runs and fires a second decode. Both are in flight simultaneously. The later one to _resolve_ (not necessarily the one started later) wins. This can cause the UI to flash the wrong decoded value.

#### Fix: AbortController + `$effect` cleanup

`$effect` supports a cleanup function — whatever it returns is called before the next run. An `AbortController` cancels the stale request:

```typescript
$effect(() => {
  if (!value) return;
  const controller = new AbortController();

  (async () => {
    try {
      const result = await decodePayloadValue(value, fieldName);
      if (!controller.signal.aborted) {
        decodedValue = result;
        onDecode?.(result);
      }
    } catch {
      if (!controller.signal.aborted) {
        console.error('Could not decode payloads');
      }
    }
  })();

  return () => controller.abort();
});
```

The async IIFE gives us clean `await` syntax inside `$effect`. The `controller.abort()` cleanup fires when `value` changes or the component unmounts, so stale responses are dropped.

To propagate the signal into the codec fetch, `codeServerRequest` in `data-encoder.ts` would accept an optional `signal` and forward it to `fetch`:

```typescript
const decoderResponse = fetch(endpoint + `/${type}`, {
  ...requestOptions,
  signal,
});
```

---

### Problem 2: No timeout on codec server requests

`codeServerRequest` makes an unbounded `fetch`. If the codec server hangs, the UI waits indefinitely. The component shows the initial (undecoded) value forever with no feedback.

#### Fix: Timeout via `AbortSignal.timeout` (or `AbortSignal.any`)

```typescript
// Option A — native timeout signal (supported in modern browsers)
const signal = AbortSignal.timeout(5000);

// Option B — compose with the cancellation signal from above
const timeoutSignal = AbortSignal.timeout(5000);
const signal = AbortSignal.any([controller.signal, timeoutSignal]);
```

`AbortSignal.any` (available in browsers since 2023) merges multiple signals — the fetch is aborted as soon as either the component unmounts OR the 5 second timeout fires.

In `codeServerRequest`, a `TimeoutError` should be handled distinctly from a network error so callers can differentiate transient failures from permanent ones.

---

### Problem 3: No retry on transient codec failures

`codeServerRequest` catches all errors and returns the original payloads on `decode` failures. This means a temporary codec server blip (e.g. a cold-start 502) permanently shows encoded data for that page load. There is no attempt to recover.

#### Fix: Exponential backoff retry in `codeServerRequest`

Adding retry at the `codeServerRequest` level benefits every decode path (components, export, event history) without changes to callers.

```typescript
async function codeServerRequest(
  options: CodecRequestOptions,
  signal?: AbortSignal,
  maxAttempts = 3,
): Promise<PotentialPayloads> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await fetchCodecEndpoint(options, signal);
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts || signal?.aborted) throw err;
      await delay(250 * 2 ** attempt, signal); // 500ms, 1000ms
    }
  }
  throw new Error('unreachable');
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
```

Retry should only apply to transient errors (network failure, 5xx). A 4xx (bad request, auth failure) should not be retried.

---

### Problem 4: No loading state in components

Because the initial render uses `getInitialPayloadValue` (which returns the raw base64 JSON), the user sees undecoded data until the async decode resolves. There is no loading indicator, so it is not clear whether decoding is in progress or has failed.

#### Fix: Explicit `isDecoding` state

```typescript
let isDecoding = $state(false);
let decodedValue = $state(getInitialPayloadValue(value, fieldName));

$effect(() => {
  if (!value) return;
  const controller = new AbortController();
  isDecoding = true;

  (async () => {
    try {
      const result = await decodePayloadValue(
        value,
        fieldName,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        decodedValue = result;
        isDecoding = false;
        onDecode?.(result);
      }
    } catch {
      if (!controller.signal.aborted) {
        isDecoding = false;
      }
    }
  })();

  return () => {
    controller.abort();
    isDecoding = false;
  };
});
```

`PayloadCodeBlock` could pass `isDecoding` to `<CodeBlock>` as a loading prop; `PayloadInline` could render a placeholder; `PayloadSummary` could keep the `fallback` value visible during decode.

---

### Summary of changes

| Layer                                          | Change                                                                         | Benefit                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `data-encoder.ts` `codeServerRequest`          | Accept `signal`, add retry with exponential backoff, handle timeout distinctly | All callers get resilient fetching without changes     |
| `decode-payload-value.ts` `decodePayloadValue` | Forward `signal` to `decodeEventAttributes`                                    | Enables cancellation from components                   |
| All four payload components                    | Use async IIFE + `AbortController` in `$effect`, track `isDecoding` state      | No race conditions, no stale updates, loading feedback |

The retry and timeout changes are additive — existing callers that don't pass a `signal` continue to work without modification.
