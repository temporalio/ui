---
component: Fieldset
source: ./fieldset.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Fieldset contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `FieldsetProps`, so not repeated: that `legend` is required and everything else optional; the defaults of `legendHidden`, `helperText`, `error` and `disabled`; that native fieldset attributes are forwarded.

## Input

- **IN-1** Use a Fieldset for two or more Fields that answer one question or configure one thing, such as a retry policy. A single field MUST use Field alone.
- **IN-2** CheckboxGroup and RadioGroup already name their options as a group. They MUST NOT be wrapped in a Fieldset with the same text as their label.
- **IN-3** `legend` MUST name the group in a few translated words. `legendHidden` MAY be used only when a visible heading directly above already names the group.
- **IN-4** `error` is for problems that involve more than one field, such as a maximum interval shorter than the initial interval. A problem with one field MUST be reported on that Field.
- **IN-5** `class` is merged last onto the `<fieldset>` through `twMerge` in `fieldsetRecipe`. It MAY change spacing and layout, such as a grid of fields. It does not reach the legend, helper text or error text, so it MUST NOT be used to restyle them.

## Behavior

- **BEH-1** `disabled` sets the native `disabled` attribute, which disables every form control inside, including buttons. Fields inside also read it from Ark fieldset context, so their labels show the disabled style.
- **BEH-2** The Fieldset renders, in order: the legend, the helper text, the children, then the error text. The error renders only while the group is invalid and `error` is not empty.

## Display

- **DIS-1** The legend is 16px medium text. Fields are spaced 16px apart. The `<legend>` is not part of the flex layout, so its bottom margin, not the gap, sets the space above the helper text.
- **DIS-2** A disabled legend shows reduced opacity.

## Accessibility

- **A11Y-1** The `<fieldset>` is labelled by its legend and described by the helper text and, while shown, the error text, so screen readers announce them when focus enters the group.
- **A11Y-2** A disabled Fieldset removes all of its controls from the tab order. When people need to know why, the reason MUST be visible text, such as `helperText`, because disabled controls cannot show tooltips.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers pass one, which is forwarded to the `<fieldset>`.

## Known gaps

None found by reading the code.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
