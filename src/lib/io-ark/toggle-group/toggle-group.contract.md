---
component: ToggleGroup
source: ./toggle-group.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Toggle Group contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `ToggleGroupProps` and `ToggleGroupItem`, so not repeated: that `items` and `label` are required; that `value` is a bindable `string[]` defaulting to `[]`; the two `size` and `orientation` values and their defaults; the defaults for `multiple`, `deselectable`, `loopFocus`, `rovingFocus` and `disabled`; that other native div attributes are forwarded to the group.

## Input

- **IN-1** `label` MUST name what the items control, such as "Event history view". It becomes the group's `aria-label` and SHOULD be translated.
- **IN-2** Every item MUST have an accessible name: a `label`, or an `ariaLabel` for an icon-only item. Without either, the item's `value` becomes its accessible name, which is an identifier, not a translated label.
- **IN-3** Item `value`s MUST be unique within the group. They are identifiers: callers MUST NOT show them to people; show the matching item `label` instead.
- **IN-4** Use Toggle Group for toolbar view and display options. Use Segment Group when one option must always be selected and the choice reads as a form value, Tabs when each option shows a different panel, and Radio Group for a choice in a form.
- **IN-5** With single selection, `value` holds at most one item. Leave `deselectable` off when the group switches between views, so one item always stays pressed.
- **IN-6** `class` and `itemClass` are merged through `twMerge` after the group and item classes. They MUST NOT set background, border or text colors, which carry the pressed state.

## Behavior

- **BEH-1** Pressing an item updates `value` and calls `onValueChange` with the new array. With `multiple`, any number of items can be pressed.
- **BEH-2** An item with `disabled: true` cannot be pressed. `disabled` on the group disables every item.
- **BEH-3** Each item gets `data-track-name="toggle-group"`, `data-track-intent="toggle"` and `data-track-text` set to its `label`, `ariaLabel` or `value`.

## Display

- **DIS-1** Items are joined in one bordered strip with dividers between them, horizontal or vertical by `orientation`. Pressed items use `bg-interactive-secondary-hover` and brand text.
- **DIS-2** An icon-only item is square. Icons are 12px for `sm` and 16px for `md`.

## Accessibility

- **A11Y-1** The group is one tab stop. Arrow keys move between items, Home and End jump to the ends, and Enter or Space press the focused item. Focus wraps unless `loopFocus` is false.
- **A11Y-2** Each item exposes its pressed state to assistive technology. Pressed styling MUST NOT be the only signal of what changed; the content the group controls SHOULD change visibly.
- **A11Y-3** Focus is shown by an inset 2px ring on `focus-visible`. `itemClass` MUST NOT remove it.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers MAY pass one, which is forwarded to the group. Items have none; tests SHOULD find an item by its accessible name.

## Known gaps

- **GAP-1** Violates IN-3. The documented examples show item values as text: "Showing the {view[0]} view" (`docs/src/examples/toggle-group-examples.svelte:27`) renders "compact", and `display.join(', ')` (line 43) renders "timestamps, durations" instead of the item labels.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
