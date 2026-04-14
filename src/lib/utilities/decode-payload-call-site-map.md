# `decode-payload.ts` Call Site Map

Sequence diagrams for all call sites of exports from
`src/lib/utilities/decode-payload.ts`.

---

## `decodeEventAttributes`

Async. Recursively walks payload attributes, sending `payloads` and
`encodedAttributes` keys through the codec endpoint.

```mermaid
sequenceDiagram
    participant ESR as event-summary-row.svelte<br/>onMount()
    participant TGR as timeline-graph-row.svelte<br/>onMount()
    participant DLA as decode-local-activity.ts<br/>decodeLocalActivity()
    participant PD as payload-decoder.svelte<br/>decodePayloads()
    participant QS as query-service.ts<br/>getQuery()
    participant EH as event-history/index.ts<br/>getEventAttributes()
    participant DP as decode-payload.ts<br/>decodeEventAttributes()
    participant DE as data-encoder.ts<br/>decodePayloadsWithCodec()

    ESR->>DLA: decodeLocalActivity(event)
    TGR->>DLA: decodeLocalActivity(event)
    DLA->>DP: decodeEventAttributes(attributes)

    PD->>DP: decodeEventAttributes(value)
    QS->>DP: decodeEventAttributes(queryResult)
    EH->>DP: decodeEventAttributes(attributes)

    DP->>DE: decodePayloadsWithCodec({ payloads })
    DE-->>DP: PotentialPayloads
    DP-->>DLA: decoded attributes
    DP-->>PD: decoded attributes
    DP-->>QS: decoded attributes
    DP-->>EH: decoded attributes

    DLA-->>ESR: DecodedLocalActivity
    DLA-->>TGR: DecodedLocalActivity
```

---

## `decodeEventAttributesForExport`

Async. Same as `decodeEventAttributes` but `returnDataOnly=false` — payloads
are kept as structured objects rather than unwrapped JS values, preserving
metadata for JSON export.

```mermaid
sequenceDiagram
    participant DEHM as download-event-history-modal.svelte<br/>onDownloadClick()
    participant EH as export-history.ts<br/>exportHistory() / decodePayloads()
    participant WS as workflow-service.ts<br/>fetchInitialValuesForStartWorkflow()
    participant DP as decode-payload.ts<br/>decodeEventAttributesForExport()
    participant DE as data-encoder.ts<br/>decodePayloadsWithCodec()

    DEHM->>EH: exportHistory({ namespace, workflowId, runId, decodeSetting })
    EH->>DP: decodeEventAttributesForExport(event, decodeSetting)
    WS->>DP: decodeEventAttributesForExport(startEvent.attributes.input)

    DP->>DE: decodePayloadsWithCodec({ payloads })
    DE-->>DP: PotentialPayloads (raw, not decoded to JS values)
    DP-->>EH: PotentiallyDecodable
    DP-->>WS: PotentiallyDecodable
```

---

## `decodePayloadAttributes`

Sync. Base64-decodes search attributes, memo, header, and queryResult fields
in-place. Called after the async codec pass.

```mermaid
sequenceDiagram
    participant PD as payload-decoder.svelte<br/>decodePayloads()
    participant EH as event-history/index.ts<br/>getEventAttributes()
    participant DLA as decode-local-activity.ts<br/>decodeLocalActivity()
    participant ExH as export-history.ts<br/>decodePayloads()
    participant STR as schedules-table-row.svelte<br/>$derived
    participant SSA as schedule-search-attributes.svelte<br/>$:
    participant DP as decode-payload.ts<br/>decodePayloadAttributes()

    PD->>DP: decodePayloadAttributes(convertedAttributes)
    EH->>DP: decodePayloadAttributes(convertedAttributes)
    DLA->>DP: decodePayloadAttributes(convertedAttributes)
    ExH->>DP: decodePayloadAttributes(convertedAttributes, false)
    STR->>DP: decodePayloadAttributes({ searchAttributes })
    SSA->>DP: decodePayloadAttributes({ searchAttributes })

    DP-->>PD: decoded object
    DP-->>EH: EventAttributesWithType
    DP-->>DLA: DecodedLocalActivity
    DP-->>ExH: decoded object (returnDataOnly=false)
    DP-->>STR: decoded search attributes
    DP-->>SSA: decoded search attributes
```

---

## `decodeUserMetadataPayload`

Async. Decodes a single `summary` or `details` payload (user metadata) through
the codec endpoint. Returns the decoded value or the original payload on failure.

```mermaid
sequenceDiagram
    participant MD as metadata-decoder.svelte
    participant WRL as workflow-run-layout.svelte<br/>decodeUserMetadata()
    participant WS as workflow-service.ts<br/>fetchInitialValuesForStartWorkflow()
    participant SAM as standalone-activity-metadata.svelte<br/>decodeMetadata()
    participant NX as nexus/[id]/+layout.ts<br/>load()
    participant DP as decode-payload.ts<br/>decodeUserMetadataPayload()
    participant DE as data-encoder.ts<br/>decodePayloadsWithCodec()

    MD->>DP: decodeUserMetadataPayload(value)
    WRL->>DP: decodeUserMetadataPayload(workflow.summary)
    WRL->>DP: decodeUserMetadataPayload(workflow.details)
    WS->>DP: decodeUserMetadataPayload(workflow.summary)
    WS->>DP: decodeUserMetadataPayload(workflow.details)
    SAM->>DP: decodeUserMetadataPayload(userMetadata.summary)
    SAM->>DP: decodeUserMetadataPayload(userMetadata.details)
    NX->>DP: decodeUserMetadataPayload(endpoint.spec.description)

    DP->>DE: decodePayloadsWithCodec({ payloads: [payload] })
    DE-->>DP: PotentialPayloads
    DP-->>MD: string | Payload
    DP-->>WRL: string | Payload
    DP-->>WS: string | Payload
    DP-->>SAM: string | Payload
    DP-->>NX: string | Payload
```

---

## `decodeRawPayload` / `isRawPayload`

Sync. Pure base64 → JS value conversion with no codec involvement.
`isRawPayload` checks whether an unknown value has the `{ metadata, data }`
shape before passing it to `decodeRawPayload`.

```mermaid
sequenceDiagram
    participant GSA as get-single-attribute-for-event.ts<br/>getEventSummaryAttribute() / formatSummaryValue()
    participant SAW as standalone-activity-workers.svelte<br/>$derived
    participant DP as decode-payload.ts

    GSA->>DP: isRawPayload(value)
    DP-->>GSA: boolean

    GSA->>DP: decodeRawPayload(payload)
    DP-->>GSA: decoded JS value

    SAW->>DP: decodeRawPayload(payload)
    DP-->>SAW: decoded JS value
```
