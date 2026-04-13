# `decode-payload.ts` — Usage Report & Refactoring Recommendations

## Exports

### Types

#### `PotentiallyDecodable`

`Payloads | Record<string | number | symbol, unknown>`

A union type used to describe any object that may contain payload fields somewhere in its tree. Used as the input type for the recursive walk functions.

#### `Decode`

```typescript
{ convertPayloadToJsonWithCodec: ..., decodePayloadAttributes: ... }
```

Describes the shape of the two "pipeline stage" functions. Only referenced by `DecodeFunctions`.

#### `DecodeFunctions`

```typescript
{ convertWithCodec?, decodeAttributes?, encoderEndpoint?, codecPassAccessToken?, codecIncludeCredentials? }
```

A dependency-injection interface used by `getEventAttributes` (event-history) and `getActivityAttributes` (pending-activities) to allow tests to substitute the codec and decoder steps. Not used anywhere else.

---

### Functions

#### `decodePayload(payload, returnDataOnly = true)`

**Synchronous. No codec. Decodes a single `{metadata, data}` Payload object.**

Attempts to base64-decode `payload.data` and parse it as JSON. Returns just the parsed value (`returnDataOnly = true`) or `{metadata, data}` with both fields decoded (`returnDataOnly = false`). Falls back to `null` if the encoding is `binary/null`, or returns the original payload object if parsing fails.

Used in 8 places, always synchronously — to decode a single known payload whose data is already base64-encoded JSON (search attributes, group status, local activity marker payloads). The `returnDataOnly = false` path is used only in `export-history.ts`.

#### `decodePayloadAttributes(eventAttribute, returnDataOnly = true)`

**Synchronous. No codec. Walks a known event attribute shape and decodes payload containers in place.**

Handles 4 specific containers by checking for their keys with `has()`:

- `searchAttributes.indexedFields` — search attributes in the nested Temporal form
- `searchAttributes` (flat) — search attributes on `UpsertWorkflowSearchAttributes`
- `memo.fields`
- `header.fields`
- `queryResult`

Each field's values are decoded by calling `decodePayload` on each entry. Mutates the input object. Called after a codec round-trip to convert the codec-decoded payloads into JS values.

Used in 8 places: always as the second stage of a two-stage pipeline — first `cloneAllPotentialPayloadsWithCodec` (or `convertPayloadToJsonWithCodec`), then `decodePayloadAttributes`.

#### `decodePayloads(settings)` _(curried)_

**Async. Codec only. Returns raw post-codec payloads without calling `decodePayload`.**

If a codec endpoint is configured, sends payloads through the codec and returns the result. If no endpoint, returns payloads unchanged. Does NOT call `decodePayload` on the results — the data fields remain base64-encoded.

Used only internally (by `cloneAllPotentialPayloadsWithCodec` when `decodeSetting !== 'readable'`), specifically for the event history download path where the codec is applied but the data is not further decoded.

#### `decodeSingleReadablePayloadWithCodec(payload, settings)`

**Async. Codec + decode. Decodes a single payload to a string.**

Wraps a single payload in an array, sends it through `decodeReadablePayloads`, and returns the first result as a string. Returns `''` on failure. Used exclusively to decode `userMetadata.summary` and `userMetadata.details` fields — both are expected to be human-readable strings.

Called in 5 places: `payload.svelte` (summary mode), `workflow-run-layout.svelte`, `workflow-service.ts`, `standalone-activity-metadata.svelte`.

#### `decodeAllPotentialPayloadsWithCodec(anyAttributes, namespace, settings)`

**Async. Codec + decode. Recursively walks an object and decodes payload fields IN PLACE (mutates).**

Iterates object keys. When a key is `payloads` or `encodedAttributes`, sends the value through the codec and decodes each payload. For other keys with object values, recurses. Uses `decodeReadablePayloads` only (always returns data, no download mode). Always mutates — does not clone.

Called only from `convertPayloadToJsonWithCodec`, which is itself a thin wrapper. Effectively the mutating counterpart to `cloneAllPotentialPayloadsWithCodec`.

#### `cloneAllPotentialPayloadsWithCodec(anyAttributes, namespace, settings, decodeSetting, returnDataOnly)`

**Async. Codec + decode. Recursively walks a cloned object and decodes payload fields.**

Like `decodeAllPotentialPayloadsWithCodec` but: (1) clones the top-level object before mutating, (2) handles the single-payload case (a bare `{metadata, data}` object, added for Nexus), (3) supports `decodeSetting` to switch between `decodeReadablePayloads` and `decodePayloads` (used for event history download), and (4) threads `returnDataOnly` through to `decodePayload`.

Called in 5 places: `payload.svelte`, `decode-local-activity.ts`, `export-history.ts`, `workflow-service.ts`.

#### `convertPayloadToJsonWithCodec({attributes, namespace, settings})`

**Async. Thin wrapper around `decodeAllPotentialPayloadsWithCodec` with named params.**

Exists to provide a named-parameter interface and to match the `DecodeFunctions` injection shape used in event history and pending activities. Contains no logic of its own.

Called in 4 places: `event-history/index.ts`, `pending-activities/index.ts`, `query-service.ts` (and `decode-payload.test.ts`).

#### `isSinglePayload(payload)`

**Synchronous type guard. Returns true if an object has exactly `{metadata, data}` keys.**

Used in `cloneAllPotentialPayloadsWithCodec` to detect a bare payload object (as opposed to a container), and in `get-single-attribute-for-event.ts` to special-case rendering.

---

## Problems

### 1. Two nearly-identical recursive walk functions

`decodeAllPotentialPayloadsWithCodec` and `cloneAllPotentialPayloadsWithCodec` share the same structure: iterate keys, recurse into objects, decode `payloads`/`encodedAttributes`. Their differences:

|                          | `decodeAll...`       | `cloneAll...`       |
| ------------------------ | -------------------- | ------------------- |
| Clones input             | No (mutates)         | Yes (shallow clone) |
| Single-payload case      | No                   | Yes                 |
| `decodeSetting` support  | No (always readable) | Yes                 |
| `returnDataOnly` support | No                   | Yes                 |

`decodeAll...` is the weaker version and only exists because `convertPayloadToJsonWithCodec` calls it. If `convertPayloadToJsonWithCodec` were removed, `decodeAll...` could be removed too, leaving one canonical walk function.

### 2. `convertPayloadToJsonWithCodec` adds no logic

It is a one-liner wrapper around `decodeAllPotentialPayloadsWithCodec`. Its purpose is to provide a named-parameter calling convention so it can be injected via `DecodeFunctions`. That injection pattern is used only in 2 files. The wrapper's name (`convertPayloadToJson...`) also implies it converts a single payload to JSON, not that it recursively walks an event attribute tree.

### 3. `decodePayloads` and `decodeReadablePayloads` are confusingly named

`decodeReadablePayloads` does more (sends through codec AND calls `decodePayload`). `decodePayloads` does less (codec only). The names imply the opposite — `decodePayloads` sounds like the full decode, `decodeReadablePayloads` sounds like a specialization.

### 4. `decodePayloadAttributes` has two redundant search attribute branches

The function has separate branches for `searchAttributes.indexedFields` and `searchAttributes` (flat). The comment on the second branch says "UpsertWorkflowSearchAttributes". These could be unified.

### 5. `returnDataOnly` is a leaky concern

The flag `returnDataOnly = false` is used only by `export-history.ts` (event history download). It's threaded through `decodePayloadAttributes` and `cloneAllPotentialPayloadsWithCodec` even though no other caller ever sets it to `false`. This makes the default-parameter signatures misleading and adds a branch to every function in the chain.

### 6. `namespace` parameter is vestigial

`cloneAllPotentialPayloadsWithCodec` and `decodeAllPotentialPayloadsWithCodec` both accept `namespace` but never use it — it is not passed to any called function. It appears to be a holdover from a prior implementation.

---

## Recommendations

### 1. Remove `convertPayloadToJsonWithCodec` and `decodeAllPotentialPayloadsWithCodec`

Replace all call sites of `convertPayloadToJsonWithCodec` with `cloneAllPotentialPayloadsWithCodec`. The `DecodeFunctions` injection type can reference `cloneAllPotentialPayloadsWithCodec` directly (or the type can be dropped and tests can stub at a higher level). This eliminates the duplicate recursive walker and the misleadingly-named wrapper.

### 2. Rename for clarity

| Current name                           | Suggested name                      | Reason                                                                                                       |
| -------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `decodePayload`                        | `decodeRawPayload`                  | Emphasises it's synchronous, codec-free, and operates on a single `{metadata, data}` object                  |
| `decodePayloads(settings)`             | `applyCodecToPayloads(settings)`    | It applies the codec but does not fully decode — the name should not say "decode"                            |
| `decodeReadablePayloads(settings)`     | `decodePayloadsWithCodec(settings)` | This is the full path; make it the "obvious" name                                                            |
| `decodeSingleReadablePayloadWithCodec` | `decodeUserMetadataPayload`         | Reflects its actual usage — it's only ever called on `summary` and `details` string-valued payloads          |
| `cloneAllPotentialPayloadsWithCodec`   | `decodeEventAttributes`             | Describes what it does: takes an event attribute tree, runs codec, decodes payloads, returns a decoded clone |
| `isSinglePayload`                      | `isRawPayload`                      | Matches the `RawPayload` type name used elsewhere in the file                                                |

### 3. Remove `namespace` from signatures

Drop the `namespace` parameter from `cloneAllPotentialPayloadsWithCodec` (and `decodeAllPotentialPayloadsWithCodec`). It is unused. Callers pass it but it goes nowhere.

### 4. Isolate the `returnDataOnly = false` path

Only `export-history.ts` needs `returnDataOnly = false`. Instead of threading the flag through the entire call chain, either:

- Add a dedicated `decodeEventAttributesForExport` function that calls `decodeRawPayload(payload, false)` directly, or
- Pass the flag only to `decodeEventAttributes` (the renamed `cloneAll...`) without threading it into `decodePayloadAttributes`

This keeps the default path clean.

### 5. Unify the two `searchAttributes` branches in `decodePayloadAttributes`

```typescript
// Before: two separate branches
if (
  has(eventAttribute, 'searchAttributes') &&
  has(eventAttribute.searchAttributes, 'indexedFields')
) {
  // decode indexedFields
} else if (has(eventAttribute, 'searchAttributes')) {
  // decode flat searchAttributes
}

// After: one branch, resolve the field regardless of nesting
if (has(eventAttribute, 'searchAttributes')) {
  const fields =
    eventAttribute.searchAttributes?.indexedFields ??
    eventAttribute.searchAttributes;
  Object.entries(fields).forEach(([key, value]) => {
    fields[key] = decodeRawPayload(value, returnDataOnly);
  });
}
```
