---
component: Field
source: ./field.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Field contract

Also covers `./field-input.svelte`, `./field-textarea.svelte`, `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `FieldProps`, `FieldInputProps` and `FieldTextareaProps`, so not repeated: that `label` is required and everything else optional; the defaults of `labelHidden`, `helperText`, `error`, `required` and `readOnly`; that `value` is bindable on FieldInput and FieldTextarea; that FieldTextarea defaults to three rows; that native div, input and textarea attributes are forwarded.

## Input

- **IN-1** A Field MUST wrap exactly one control that reads Ark field context: `FieldInput`, `FieldTextarea`, or a component built on that context. A plain `<input>` inside Field is not linked to the label, helper text or error.
- **IN-2** Checkbox, CheckboxGroup, RadioGroup and Switch render their own label. They MUST NOT be wrapped in a Field, which would add a second label. Use Fieldset to group several Fields.
- **IN-3** `label` MUST name the value, not the action, and SHOULD be translated. `labelHidden` MAY be used only when nearby visible content already names the control; the label stays in the accessibility tree.
- **IN-4** `error` MUST say what is wrong and how to fix it, such as "Enter a task queue name." A non-empty `error` marks the field invalid. Callers that show the message elsewhere MAY set `invalid` without `error`.
- **IN-5** `disabled` is left unset by default so the field inherits `disabled` from a surrounding Fieldset. Passing `disabled={false}` overrides the Fieldset.
- **IN-6** `id` sets the control's id, which the label targets. When set, it MUST be unique on the page.
- **IN-7** `class` on Field is merged onto the wrapper, and on FieldInput or FieldTextarea onto the control, through `twMerge` after the base classes. It MUST NOT change the control's border, background or focus ring colors, which carry the invalid and disabled states.

## Behavior

- **BEH-1** Field renders, in order: the label (with the required indicator), the control, the helper text, then the error text. The error renders only while the field is invalid and `error` is not empty.
- **BEH-2** The control's `aria-describedby` lists the error text (while shown) and the helper text. `required`, `readOnly`, `disabled` and `invalid` reach the control as native attributes and `data-*` states.
- **BEH-3** `readOnly` keeps the value focusable, selectable and submitted with a form. `disabled` removes it from the tab order and from form submission.

## Display

- **DIS-1** The control is 40px tall at minimum, with a 1px `border-primary` border that turns `border-brand` on hover and `border-danger` while invalid. Focus shows a 2px ring, red while invalid.
- **DIS-2** A disabled control uses `bg-surface-tertiary` and `text-tertiary`. The label of a disabled field shows reduced opacity.
- **DIS-3** Helper text and error text are 12px, in `text-secondary` and `text-danger`.

## Accessibility

- **A11Y-1** The label is a `<label>` linked to the control with `for`. The required indicator is `aria-hidden`; the control's native `required` carries the meaning.
- **A11Y-2** Error text is announced politely when it appears (`aria-live="polite"`). Color MUST NOT be the only signal of an error; `error` MUST be set whenever the field is invalid and the message is not shown elsewhere.
- **A11Y-3** Placeholder text MUST NOT replace `label` or `helperText`. It disappears once people type.

## Test hooks

- **TEST-1** None of the three components sets a `data-testid`. Callers pass one to Field for the wrapper or to FieldInput and FieldTextarea for the control.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. When should errors appear? The docs example shows "Enter a task queue name." as soon as the page loads, before anyone has typed (`docs/src/examples/field-examples.svelte`). Decide whether errors MUST wait until the field is blurred or the form is submitted.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
