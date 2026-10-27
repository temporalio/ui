---
component: Switch
source: ./switch.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Switch contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `SwitchProps`: that `label` is required; that `checked` is a bindable boolean; the two `size` values and the `md` default; that native label attributes other than `for`, `form`, `id`, `dir` and `class` are forwarded to the root label.

## Input

- **IN-1** Use Switch for a setting that takes effect immediately. A choice submitted later with a form, a choice among several options, or a confirmation MUST use Checkbox.
- **IN-2** `label` MUST name the setting, such as "Pause schedule", and MUST NOT change with the state. Use `labelHidden` only when visible nearby text already names the setting.
- **IN-3** Because the change is immediate, the caller MUST apply it in `onCheckedChange` or from the bound `checked`, and MUST show an error and restore the previous state if applying it fails.
- **IN-4** `helperText` SHOULD describe the effect when the label alone does not, such as "New workflows start every 15 minutes."
- **IN-5** `class` is merged through `twMerge` onto the outer wrapper. It MUST NOT restyle the control or thumb.
- **IN-6** Use `md` by default and `sm` only in dense layouts such as table rows and toolbars.

## Behavior

- **BEH-1** Toggling updates the bound `checked` and calls `onCheckedChange` with the new value.
- **BEH-2** `disabled`, `required`, `readOnly`, `name` and `value` are passed to Ark only when set, so a surrounding Field or Fieldset can supply them.
- **BEH-3** `id` sets the id of the hidden input. A hidden checkbox input holds the value, so `name` and `value` submit with a form.
- **BEH-4** The root label has `data-track-name="switch"`, `data-track-intent="toggle"` and `data-track-text` set to the label. Forwarded attributes are applied after these, so a caller can override them.

## Display

- **DIS-1** The checked track uses the primary interactive color. The thumb slides to the end when checked.
- **DIS-2** Helper and error text are indented to line up with the label.

## Accessibility

- **A11Y-1** The switch is one tab stop. Space toggles it. Disabled switches are skipped.
- **A11Y-2** The switch SHOULD be exposed with switch semantics (`role="switch"`), so assistive technology announces it as on or off rather than as a checkbox.
- **A11Y-3** Helper and error text are linked to the hidden input through `aria-describedby`. The required indicator is `aria-hidden`.
- **A11Y-4** The state MUST NOT rely on the track color alone. The thumb position also changes.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one; it is forwarded to the root label.

## Known gaps

- **GAP-1** Violates A11Y-2. `Switch.HiddenInput` renders `type="checkbox"` with no `role="switch"`, and neither `switch.svelte` nor Ark's switch connect adds one. Screen readers announce the switch as a checkbox.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
