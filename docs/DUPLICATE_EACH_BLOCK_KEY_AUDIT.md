# Svelte `{#each}` Block Duplicate Key Audit

## Background

In Svelte, `{#each items as item (key)}` blocks use the key expression to track item identity across DOM updates. When keys are duplicated, Svelte cannot correctly associate DOM nodes with data items, leading to rendering bugs—stale state, mismatched content, or unnecessary DOM teardown and recreation.

This audit reviewed every keyed `{#each}` block in the codebase and fixed those at risk of duplicate or ineffective keys.

---

## High Risk Fixes

### 1. `workflow-callback.svelte:48` — `||` changed to `??`

**Before:**

```svelte
{#each links as link, i (link.workflowEvent?.eventRef?.eventId || link.workflowEvent?.requestIdRef?.requestId || i)}
```

**After:**

```svelte
{#each links as link, i (link.workflowEvent?.eventRef?.eventId ?? link.workflowEvent?.requestIdRef?.requestId ?? i)}
```

**Problem:** The `||` operator treats all falsy values (`0`, `""`, `false`) as missing and skips to the next fallback. If an `eventId` were `0` (a valid ID), it would be silently ignored and the key would fall through to `requestIdRef` or the index.

**Fix:** `??` (nullish coalescing) only falls back on `null` or `undefined`, preserving valid falsy IDs like `0`.

---

### 2. `combobox.svelte:480` — Added missing key

**Before:**

```svelte
{#each value.slice(0, chipLimit) as v}
```

**After:**

```svelte
{#each value.slice(0, chipLimit) as v (v)}
```

**Problem:** No key expression at all. When a chip is removed from the middle of the selected values, Svelte falls back to index-based diffing—potentially misassociating chip components with the wrong values, causing stale `onremove` handlers or visual glitches.

**Fix:** Added `(v)` as the key. Multiselect combobox values are unique strings (you can't select the same option twice), so the value itself is a stable, unique identifier.

---

### 3. `schedule-recent-runs.svelte:48` — Fixed fallback key collision

**Before:**

```svelte
{#each sortRecentRuns(recentRuns) as run, i (`${run?.startWorkflowResult?.workflowId ?? i}:${run?.startWorkflowResult?.runId ?? i + 1}`)}
```

**After:**

```svelte
{#each sortRecentRuns(recentRuns) as run, i (`${run?.startWorkflowResult?.workflowId ?? `_${i}`}:${run?.startWorkflowResult?.runId ?? `_${i}`}`)}
```

**Problem:** When `workflowId` or `runId` is null, the key falls back to the raw index number. A run at index 1 with null fields would produce key `"1:2"`. A real run with `workflowId="1"` and `runId="2"` would produce the same key `"1:2"` — a collision.

**Fix:** Prefix fallback values with `_` (e.g., `"_1:_1"`), which can never collide with real workflow/run IDs since those don't start with underscores.

---

## Medium Risk Fixes

### 4–6. Filter lists — Added stable `id` to `SearchAttributeFilter`

**Files changed:**

- `search-attribute-filter/filter-list.svelte`
- `workflow/filter-bar/dropdown-filter-list.svelte`
- `activities-summary-filter-bar/dropdown-filter-list.svelte`

**Before:**

```svelte
{#each visibleFilters as workflowFilter, i (`${workflowFilter.attribute}-${i}`)}
```

**After:**

```svelte
{#each visibleFilters as workflowFilter, i (workflowFilter.id)}
```

**Problem:** Filters allow the same attribute multiple times (e.g., two `StartTime` filters for a date range), so `attribute` alone isn't unique. The index suffix made the composite key technically unique but defeated the purpose of keying — removing a filter from the middle caused every subsequent filter chip to get a new key, triggering full DOM teardown and recreation instead of a simple removal.

**Fix:** Added an `id: string` field to the `SearchAttributeFilter` type and a `generateFilterId()` factory function in `search-attribute-filters.ts`. Every filter now gets a stable, unique ID at creation time that persists across list mutations.

**Supporting changes across all filter construction sites:**

- `to-list-workflow-filters.ts` — `emptyFilter()` now includes `id`
- `workflow-datetime-filter.svelte` — 2 construction sites
- `text-filter.svelte` — 1 construction site
- `workflow-status.svelte` — `mapStatusToFilter()`
- `status-dropdown-filter-chip.svelte` — 2 construction sites
- `filterable-table-cell.svelte` (workflow) — 1 construction site
- `filterable-table-cell.svelte` (activities) — 1 construction site
- `activity-counts.svelte` — 1 construction site
- `workflow-counts.svelte` — 1 construction site

**Test changes:**

- `to-list-workflow-filters.test.ts` — Changed `toEqual` to `toMatchObject` for filter assertions since test expectations don't need to assert on the `id` field.

---

### 7. `orderable-list.svelte:36` — Dropped redundant index

**Before:**

```svelte
{#each columnsInUse as { label }, index (`${label}:${index}`)}
```

**After:**

```svelte
{#each columnsInUse as { label }, index (label)}
```

**Problem:** Column labels are unique within a table configuration (the UI prevents adding the same column twice). The `:${index}` suffix added no uniqueness value but prevented Svelte from recognizing that a column at a new position was the same column — causing unnecessary DOM recreation when columns were reordered.

**Fix:** Use `label` alone as the key, enabling Svelte to properly track columns across reorders.

---

### 8. `event-summary-table.svelte:94` — Dropped redundant index

**Before:**

```svelte
{#each columns as column, i (`${column.label}:${i}`)}
```

**After:**

```svelte
{#each columns as column (column.label)}
```

**Problem:** Same pattern as orderable-list — table header column labels are unique by definition (each column has a distinct label). The index suffix was unnecessary noise.

**Fix:** Use `column.label` alone.

---

## Items Reviewed and Left As-Is

### `add-search-attributes.svelte:45` — `${attribute.label}-${id}`

Index IS the identity here by design. The component uses `bind:attribute={attributesToAdd[id]}` where `id` is the loop index, meaning the index is the binding target. Changing the key wouldn't improve behavior.

### `chip-input.svelte:114,175` — `${chip}-${i}`

Chips are user-entered strings that can legitimately be duplicated (e.g., entering "foo" twice). Using `chip` alone would break on duplicates. The `${chip}-${i}` composite is an acceptable tradeoff — the DOM churn on removal is negligible for a handful of simple chip components.

### `calendar.svelte:38` — `(index)`

Pure index key is equivalent to no key, but calendar cells never reorder or mutate, so there's no practical impact.

### All `(label)` keys on table rows

`deployment-table-row.svelte`, `version-table-row.svelte`, `schedules-table-row.svelte`, `workflow-actions.svelte` — these use translated label strings as keys. Column definitions are static per table, so labels are always unique. Low risk.

### All ID-based keys

Keys using `activity.id`, `command.id`, `endpoint.id`, `workflow.id:runId` composites, enum-based status keys, and `iterableKey(event)` are all genuinely unique and correct.
