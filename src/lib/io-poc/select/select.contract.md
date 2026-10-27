---
component: Select
source: ./select.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Select contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `SelectProps` and `SelectItem`: that `items` and `label` are required; that `items` accepts strings or objects with `label`, `value` and optional `disabled` and `group`; that `value` is a `string[]` and `open` a boolean, both bindable; the defaults for `multiple`, `clearable`, `portalled` and the label strings.

## Input

- **IN-1** Use Select for a short list people already understand, usually fewer than 15 options. A long list, or one people search by typing, MUST use Combobox. Two to five options that benefit from comparison SHOULD use Radio Group or Segment Group.
- **IN-2** `label` MUST name the choice. It is rendered by `Select.Label` and names the trigger. Use `labelHidden` only when visible nearby text already names the field.
- **IN-3** `value` is always an array, even without `multiple`. Callers MUST read a single selection as `value[0]` and MUST NOT pass a bare string.
- **IN-4** Every `value` MUST be unique across `items`. Items are keyed by value, and the collection maps values back to items.
- **IN-5** Items with a `group` render under a heading with that name. When any item has a `group`, items without one render in an unlabelled group. Callers SHOULD give every item a group or none.
- **IN-6** Without `clearable`, people cannot remove a selection. An optional field whose value can be empty MUST set `clearable`.
- **IN-7** `placeholder`, `clearLabel` and item labels SHOULD be translated. The defaults ("Select an option", "Clear selection") are English.
- **IN-8** `portalled={false}` and `onInteractOutside` exist for rendering the list in place, such as in documentation figures. Product UI SHOULD keep the default portal so the list is not clipped by its container.
- **IN-9** `class` is merged through `twMerge` onto the root, which holds the label, control and messages. It MUST NOT restyle the trigger, the list or the items.

## Behavior

- **BEH-1** Without `multiple`, selecting an option closes the list. With `multiple`, the list stays open and the trigger shows every selected label.
- **BEH-2** The list is rendered only while open (`lazyMount`, `unmountOnExit`) and is positioned 4px below the trigger at the trigger's width.
- **BEH-3** A hidden native `<select>` holds the value, so `name`, `required`, `disabled` and `readOnly` work with native forms.
- **BEH-4** `error` sets the field invalid and renders below the control. `invalid` sets the invalid state without a message.
- **BEH-5** The trigger has `data-track-name="select"`, `data-track-intent="select"` and `data-track-text` set to the label. There is no option to remove them.

## Display

- **DIS-1** The control uses the shared field control style (`fieldControlRecipe`), including the invalid and disabled states.
- **DIS-2** Selected options show a check mark. Disabled options are dimmed and cannot be selected.
- **DIS-3** Long labels are truncated with an ellipsis in both the trigger and the list.

## Accessibility

- **A11Y-1** The trigger is the only tab stop. Enter, Space or the arrow keys open the list; arrow keys, Home, End and typeahead move through options; Escape closes without changing the selection.
- **A11Y-2** Helper and error text are linked to the trigger through `aria-describedby`. The required indicator is `aria-hidden`; `required` is exposed through the hidden select.
- **A11Y-3** The clear button is icon-only and is named by `clearLabel`.
- **A11Y-4** Selection MUST NOT be shown by the check mark alone; the trigger text also names the selected options.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one; it is forwarded to the root.

## Known gaps

None found by reading the code.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
