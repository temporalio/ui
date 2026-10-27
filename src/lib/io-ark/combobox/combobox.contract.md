---
component: Combobox
source: ./combobox.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Combobox contract

Also covers `./recipe.ts`, `./field.svelte`.

Rules below cover only what the types do not express. Already expressed by `ComboboxProps` and `ComboboxItem`: that `items` and `label` are required; that items may be strings or `{ label, value, disabled }`; that `value`, `inputValue` and `open` are bindable; the defaults for `clearable`, `openOnClick`, `emptyText`, `clearLabel`, `triggerLabel` and `portalled`; that other div attributes go to the field wrapper.

## Input

- **IN-1** `label` MUST name the field, even when `labelHidden` is set. It is the input's accessible name and its `data-track-text`.
- **IN-2** Use Combobox when the list is long enough that people benefit from typing to find an option. A short list without typing SHOULD use Select. A list that stays visible on the page SHOULD use Listbox.
- **IN-3** Each item `value` MUST be unique. Items are keyed by `value`, and duplicates break rendering and selection.
- **IN-4** `value` is always an array, even without `multiple`. Single-select callers MUST read `value[0]` and MUST NOT pass more than one value.
- **IN-5** With `allowCustomValue`, a selected value that is not in `items` is shown by its raw value. Callers that allow custom values SHOULD validate them and set `error`.
- **IN-6** Visible and accessible text SHOULD be translatable. Callers SHOULD pass translated `emptyText`, `clearLabel` and `triggerLabel`; their defaults are English.
- **IN-7** `class` and other div attributes go to the Field wrapper. `class` MUST NOT be used to restyle the control or the list.

## Behavior

- **BEH-1** Typing filters `items` on the client by label, ignoring case and accents. Opening the list without typing shows every item. There is no loading state for results fetched from a server. **Needs decision: DEC-2.**
- **BEH-2** Single select closes the list and replaces the value. `multiple` keeps the list open, adds each selection, shows it as a tag in the control, and clears the typed text.
- **BEH-3** The clear button shows only when `clearable` is set, the field is interactive, and a value is selected. Tag remove buttons show only while the field is interactive.
- **BEH-4** The list is rendered with `lazyMount` and `unmountOnExit`, and in a portal unless `portalled={false}`. A portalled list follows the theme set on `document.body`.
- **BEH-5** Label, helper text, error, `required`, `disabled`, `readOnly` and `invalid` come from the Field wrapper, so the input's `id`, `aria-describedby` and `aria-invalid` are set by Field context. `id` sets the input's id.
- **BEH-6** `onInteractOutside` is forwarded to Ark. Calling `event.preventDefault()` keeps the list open after an outside click.

## Display

- **DIS-1** The list matches the control width, sits 4px below it, and scrolls after 288px (`max-h-72`).
- **DIS-2** The highlighted item uses `interactive-secondary-hover`, the selected item shows a check mark, and disabled items are dimmed.

## Accessibility

- **A11Y-1** The input has `role="combobox"`. Arrow keys move the highlight, Enter selects, Escape closes the list, and typing filters.
- **A11Y-2** The trigger and clear buttons are icon-only and are named by `triggerLabel` and `clearLabel`.
- **A11Y-3** Each tag remove button MUST have an accessible name that includes the item. **Needs decision: DEC-1** on translating that name.
- **A11Y-4** Error text MUST say what to fix. The red border MUST NOT be the only signal.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers MAY pass one; it is forwarded to the Field wrapper.

## Known gaps

- **GAP-1** Violates IN-6 for tag remove buttons. `combobox.svelte` hard-codes `aria-label="Remove {item.label}"`, so the name cannot be translated.

## Decisions

- **DEC-1** Open. Add a `removeLabel` prop, such as `(label: string) => string`, for tag remove buttons, matching Tags Input and File Upload.
- **DEC-2** Open. Decide whether Combobox supports server-side search, with a loading state and caller-controlled filtering, or whether that needs a separate component. The Holocene combobox has `loading` and `loadingText`.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
