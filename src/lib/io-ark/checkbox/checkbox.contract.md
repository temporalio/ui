---
component: Checkbox
source: ./checkbox.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Checkbox contract

Also covers `./checkbox-group.svelte`, `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `CheckboxProps` and `CheckboxGroupProps`: that `label` is required; that `checked` and group `value` are bindable; the two `orientation` values; that other label and div attributes are forwarded.

## Input

- **IN-1** `label` MUST name the option, even when `labelHidden` is set. It is the accessible name and the `data-track-text` value.
- **IN-2** Use Checkbox for an option that takes effect when a form is submitted, or for one of several independent choices. A setting that applies immediately SHOULD use Switch. A single choice from a list SHOULD use RadioGroup.
- **IN-3** A Checkbox inside a CheckboxGroup MUST pass `value`. Without `value` it is not part of the group and keeps its own `checked` state.
- **IN-4** Inside a group, the group's `value` controls checked state. Callers MUST NOT bind `checked` on grouped checkboxes.
- **IN-5** `indeterminate` is controlled by the caller. A parent checkbox that shows a partly selected list MUST derive both `checked` and `indeterminate` from the list, and MUST update the list in `onCheckedChange`, as the "All task queues" example does.
- **IN-6** `error` and `helperText` SHOULD be short, translated sentences. A non-empty `error` marks the checkbox invalid unless `invalid={false}` is passed. `error` MUST be cleared once the problem is fixed.
- **IN-7** On Checkbox, `class` is merged onto the outer wrapper (`checkboxRecipe`), not the label or control. It MUST NOT be used to restyle the box.
- **IN-8** CheckboxGroup `required` sets `aria-required` only. It does not prevent submitting with nothing selected; callers MUST validate and set `error`.

## Behavior

- **BEH-1** The root is a `<label>`, so clicking the label or the box toggles the checkbox. A native hidden input carries the value for forms and assistive technology.
- **BEH-2** A standalone Checkbox reads `disabled`, `required`, `readOnly` and `invalid` from a surrounding Field or CheckboxGroup when they are not passed.
- **BEH-3** `onCheckedChange` receives `true` or `false`. It also fires for grouped checkboxes.

## Display

- **DIS-1** The box is 20px with a 4px radius. Checked and indeterminate states fill it with `interactive-primary`; invalid sets a `danger` border; disabled lowers the opacity of the box and label.
- **DIS-2** Helper and error text are indented to align with the label.

## Accessibility

- **A11Y-1** Helper and error text are linked to the hidden input with `aria-describedby`. Error text is announced politely when it appears.
- **A11Y-2** CheckboxGroup names the group with `aria-labelledby` on its label and links its helper and error text with `aria-describedby`.
- **A11Y-3** Space toggles the focused checkbox. Each checkbox in a group is its own tab stop.
- **A11Y-4** `invalid` MUST NOT be the only signal. `error` MUST say what to fix.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers MAY pass one; on Checkbox it is forwarded to the root label, on CheckboxGroup to the group element.

## Known gaps

- **GAP-1** Violates IN-6. The "I understand this terminates 12 workflows" example in `docs/src/examples/checkbox-examples.svelte` passes a fixed `error`, so the error stays after the box is checked. The example SHOULD derive `error` from the checked state.

## Decisions

- **DEC-1** Open. CheckboxGroup labels the group with a `<span>` and `aria-labelledby` rather than a `<fieldset>` and `<legend>`. Decide whether groups should use Fieldset semantics so a disabled group behaves like a disabled Fieldset.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
