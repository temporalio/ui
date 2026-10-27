---
component: SegmentGroup
source: ./segment-group.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Segment Group contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `SegmentGroupProps` and `SegmentGroupItem`: that `items` and `label` are required; the two `orientation` and two `size` values and their defaults; that `value` is a `string` or `null`; that each item has a required `value` and `label` and an optional `disabled`.

## Input

- **IN-1** Segment Group is for one choice among two to five short, mutually exclusive options that change a view or a filter. A toolbar action or a multi-select set MUST use Toggle Group. Content panels MUST use Tabs. A form question with long labels or descriptions SHOULD use Radio Group.
- **IN-2** `label` MUST name the choice, such as "Time range". It is rendered by `SegmentGroup.Label`, which names the radio group. Use `labelHidden` only when visible nearby text already names the group; the label MUST still be passed.
- **IN-3** Each item `value` MUST be unique. Items are keyed by `value`, and a duplicate breaks rendering and selection.
- **IN-4** Item labels MUST be short enough to fit on one line (`whitespace-nowrap`). Abbreviations such as "1h" or "30d" SHOULD only be used when the group label makes them unambiguous.
- **IN-5** `value` starts as `null`, which selects nothing. A filter or view switcher SHOULD always have a selection, so callers SHOULD bind `value` to a valid item value.
- **IN-6** `class` is merged through `twMerge` onto the root, which holds the label and the track. It MUST NOT restyle the track, items or indicator.
- **IN-7** Item labels SHOULD be translated. The component renders them verbatim.

## Behavior

- **BEH-1** Selecting an item updates the bound `value` and calls `onValueChange` with the new value. Selection cannot be cleared by the user once set.
- **BEH-2** Each item renders a native hidden radio input. With `name`, the selected value submits with a form.
- **BEH-3** `disabled` on the root disables every item. `disabled` on an item disables only that item, which is skipped by keyboard navigation.
- **BEH-4** Each item has `data-track-name="segment-group"`, `data-track-intent="select"` and `data-track-text` set to its label. There is no option to remove them.

## Display

- **DIS-1** The track is `bg-surface-secondary` with a border. The selected item sits on a raised indicator that slides between items. Unselected items use secondary text and selected items primary text.
- **DIS-2** Sizes set the item height (`sm` 24px, `md` 32px). The track is only as wide as its items (`w-fit`).
- **DIS-3** The indicator animation is turned off when reduced motion is requested.

## Accessibility

- **A11Y-1** The group is a single tab stop. Arrow keys move the selection; disabled items are skipped.
- **A11Y-2** Focus is shown by a 2px ring on the focused item (`data-focus-visible`). `class` MUST NOT hide it.
- **A11Y-3** Selection MUST NOT rely on the indicator alone. The selected state is exposed through the native radio input, and the selected label switches to primary text.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one; it is forwarded to the root. Tracking attributes MUST NOT be used as test selectors.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. Items have no accessible-name override. An abbreviated label such as "1h" is announced as written. Decide whether items should accept an `ariaLabel`, as Toggle Group items do, or whether abbreviations should be avoided.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
