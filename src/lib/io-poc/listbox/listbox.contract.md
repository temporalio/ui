---
component: Listbox
source: ./listbox.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Listbox contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `ListboxProps`, so not repeated: that `items` and `label` are required and everything else optional; that `items` accepts strings or `ListboxItem` objects; that `value` is bindable and is always an array; the three `selectionMode` and two `orientation` values and their defaults; the defaults of `filterable`, `filterPlaceholder` and `emptyText`; that native div attributes are forwarded.

## Input

- **IN-1** Choose by how many options must stay visible. Listbox shows every option inline and suits short lists people compare at a glance. A choice that should take one row of space MUST use Select, and a long list people search by typing SHOULD use Combobox or set `filterable`.
- **IN-2** Every item `value` MUST be unique. Items are keyed by value, and selection is stored by value.
- **IN-3** `label` MUST name the choice and SHOULD be translated, as SHOULD `filterPlaceholder`, `emptyText` and each item `label` and `description`.
- **IN-4** `value` is always an array, even with `selectionMode="single"`. Callers read the single choice as `value[0]`.
- **IN-5** Listbox renders no native form input and has no `name` or `required` prop. A form MUST read `value` through binding or `onValueChange` and validate it itself, passing `error` when nothing valid is selected.
- **IN-6** `class` is merged last onto the root through `twMerge` in `listboxRecipe`. It does not reach the bordered panel or items, so it MUST NOT be used to restyle them.

## Behavior

- **BEH-1** `selectionMode="single"` replaces the selection on each choice. `multiple` toggles each item. `extended` selects one item on click and adds or extends with Ctrl, Cmd or Shift, as in a file list.
- **BEH-2** With `filterable`, the filter input narrows the visible items by case- and accent-insensitive "contains" matching on `label`. Filtering does not change `value`: selected items stay selected while hidden. Typeahead is turned off while filtering is available.
- **BEH-3** Items with a `group` render under a heading for that group, in order of first appearance. Items without a `group` render in an unlabelled group.
- **BEH-4** `emptyText` shows when no item matches the filter.

## Display

- **DIS-1** Items sit in a bordered panel. The highlighted item uses `bg-interactive-secondary-hover`, and selected items use medium weight and show a check mark. Disabled items show reduced opacity.
- **DIS-2** Item labels and descriptions truncate to one line each. Callers MUST keep them short enough to read when truncated, or put the distinguishing part first.

## Accessibility

- **A11Y-1** The option list is a `listbox` labelled by `label`. It is described by the helper text and, while shown, the error text, and sets `aria-invalid` while invalid.
- **A11Y-2** Arrow keys move the highlight, Enter or Space selects, and Home and End jump to the ends. The list is one tab stop.
- **A11Y-3** The filter input is named "`label`: `filterPlaceholder`", so the placeholder MUST describe the action, such as "Filter options".
- **A11Y-4** The selected state MUST NOT rely only on the check mark; Ark sets `aria-selected` on each option.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers pass one, which is forwarded to the root. The list sets `data-track-name="listbox"`, `data-track-intent="select"` and `data-track-text` to `label`; tracking attributes MUST NOT be used as test selectors.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. Should selected items stay selected while a filter hides them (BEH-2)? This keeps choices across searches, but people cannot see everything they have selected. Decide whether the list should show a count of hidden selections.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
