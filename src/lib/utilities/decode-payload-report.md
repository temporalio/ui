# `decode-payload.ts` — Decoding Phase Reference

Two phases apply whenever a Payload is decoded:

- **Phase 1 — Base64 → JSON**: `decodeRawPayload()` calls `atob()` + `parseWithBigInt()` to turn the raw `data` bytes into a JS value. Synchronous, no network.
- **Phase 2 — Codec server**: `callCodecEndpoint()` (re-exported from `data-encoder.ts`) POSTs payloads to the configured remote codec server and returns the transformed payloads. Async, may be skipped when no endpoint is configured.

Background colours below:

- **Blue** = Phase 2 (Codec server)
- **Green** = Phase 1 (Base64 → JSON)

---

## `decodeEventAttributes`

Recursively walks the attribute tree. For every `payloads` / `encodedAttributes`
key, runs Phase 2 then Phase 1 (`returnDataOnly=true` → bare JS values).

```mermaid
sequenceDiagram
    participant INT as decodeEventAttributesInternal()
    participant DPC as decodePayloadsWithCodec() [internal]
    participant CE as data-encoder.ts<br/>callCodecEndpoint()
    participant DRP as decodeRawPayload()

    Note over INT: shallow-clone attributes, recurse into object keys

    rect rgb(173, 216, 230)
        Note over INT,CE: Phase 2 — Codec server
        INT->>DPC: decode(payloads, returnDataOnly=true)
        DPC->>CE: { payloads }
        CE-->>DPC: PotentialPayloads
    end

    rect rgb(144, 238, 144)
        Note over DPC,DRP: Phase 1 — Base64 → JSON
        DPC->>DRP: decodeRawPayload(p, returnDataOnly=true)
        DRP-->>DPC: JS value
    end

    DPC-->>INT: decoded[]
    INT-->>INT: recurse into nested objects
```

---

## `decodeEventAttributesForExport`

Same recursive walk as `decodeEventAttributes` but `returnDataOnly=false`,
so Phase 1 returns `{metadata, data}` objects instead of bare JS values.
When `decodeSetting` is not `'readable'`, Phase 1 is skipped entirely.

```mermaid
sequenceDiagram
    participant INT as decodeEventAttributesInternal()
    participant DPC as decodePayloadsWithCodec() [internal]
    participant ACP as applyCodecToPayloads()
    participant CE as data-encoder.ts<br/>callCodecEndpoint()
    participant DRP as decodeRawPayload()

    Note over INT: shallow-clone attributes, recurse into object keys

    alt decodeSetting === 'readable'
        rect rgb(173, 216, 230)
            Note over INT,CE: Phase 2 — Codec server
            INT->>DPC: decode(payloads, returnDataOnly=false)
            DPC->>CE: { payloads }
            CE-->>DPC: PotentialPayloads
        end
        rect rgb(144, 238, 144)
            Note over DPC,DRP: Phase 1 — Base64 → JSON (structured)
            DPC->>DRP: decodeRawPayload(p, returnDataOnly=false)
            DRP-->>DPC: { metadata, data }
        end
    else decodeSetting !== 'readable'
        rect rgb(173, 216, 230)
            Note over INT,CE: Phase 2 — Codec server (Phase 1 skipped)
            INT->>ACP: decode(payloads)
            ACP->>CE: { payloads }
            CE-->>ACP: PotentialPayloads
            ACP-->>INT: raw payloads
        end
    end
```

---

## `decodePayloadAttributes`

Handles structured fields only (`searchAttributes`, `memo`, `header`,
`queryResult`). Phase 2 is never involved — this is always the final
base64-decode pass applied after an async codec round-trip.

```mermaid
sequenceDiagram
    participant DPA as decodePayloadAttributes()
    participant DRP as decodeRawPayload()

    rect rgb(144, 238, 144)
        Note over DPA,DRP: Phase 1 — Base64 → JSON (no codec)
        DPA->>DRP: decodeRawPayload(searchAttribute)
        DRP-->>DPA: JS value
        DPA->>DRP: decodeRawPayload(memoField)
        DRP-->>DPA: JS value
        DPA->>DRP: decodeRawPayload(headerField)
        DRP-->>DPA: JS value
    end
```

---

## `decodeUserMetadataPayload`

Decodes a single `summary` or `details` Payload. Delegates to the internal
`decodePayloadsWithCodec`, which runs both phases in sequence.

```mermaid
sequenceDiagram
    participant UMP as decodeUserMetadataPayload()
    participant DPC as decodePayloadsWithCodec() [internal]
    participant CE as data-encoder.ts<br/>callCodecEndpoint()
    participant DRP as decodeRawPayload()

    UMP->>DPC: decodePayloadsWithCodec([payload])

    rect rgb(173, 216, 230)
        Note over DPC,CE: Phase 2 — Codec server
        DPC->>CE: { payloads: [payload] }
        CE-->>DPC: PotentialPayloads
    end

    rect rgb(144, 238, 144)
        Note over DPC,DRP: Phase 1 — Base64 → JSON
        DPC->>DRP: decodeRawPayload(p, returnDataOnly=true)
        DRP-->>DPC: string | Payload
    end

    DPC-->>UMP: decoded[]
    UMP-->>UMP: return decoded[0] ?? ''
```

---

## `decodeRawPayload` / `isRawPayload`

No codec involvement. Phase 1 only.

```mermaid
sequenceDiagram
    participant DRP as decodeRawPayload()
    participant ATOB as atob()
    participant PBI as parseWithBigInt()

    rect rgb(144, 238, 144)
        Note over DRP,PBI: Phase 1 — Base64 → JSON
        DRP->>ATOB: atob(payload.data)
        ATOB-->>DRP: raw string
        DRP->>PBI: parseWithBigInt(rawString)
        PBI-->>DRP: JS value
    end

    Note over DRP: isRawPayload() — checks {metadata,data} shape only, no decode
```
