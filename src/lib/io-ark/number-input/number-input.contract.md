---
component: NumberInput
source: ./number-input.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Number Input contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `NumberInputProps`, so not repeated: that `label` is required and every other prop is optional; that `value` is a string; the defaults for `min`, `max`, `step`, `clampValueOnBlur`, `allowMouseWheel`, `incrementLabel` and `decrementLabel`; that other div attributes are forwarded.

## Input

- **IN-1** `label` MUST name the quantity, not the unit or the control, for example "Maximum attempts". Use `labelHidden` only when a visible heading next to the field already names it; the label stays available to assistive technology.
- **IN-2** `value` is a string. Callers MUST parse it before use and MUST treat an empty string and `NaN` as "no value". To read a number, use `valueAsNumber` from `onValueChange`.
- **IN-3** Set `min` and `max` whenever the domain has limits. The defaults are `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`, so without them any value is accepted.
- **IN-4** With `clampValueOnBlur={false}`, the field keeps out-of-range values. The caller MUST then validate the value and pass `error` while it is out of range, as the "Maximum concurrent activities" example does.
- **IN-5** `unit` is a short suffix such as `s`, `ms` or `%`. It is hidden from assistive technology, so when the unit matters the `label` or `helperText` MUST state it in words.
- **IN-6** `class` and other div attributes are applied to the Field wrapper, not to the input or the control box. `class` MUST NOT be used to restyle the control; use the props.
- **IN-7** Use Number Input when the exact value matters or the range is large. Use a Slider when an approximate value in a small range is enough. Callers MUST NOT use Number Input for identifiers that only contain digits, such as a run or build ID; use a text field.
- **IN-8** `incrementLabel`, `decrementLabel` and the label and messages SHOULD be translated.

## Behavior

- **BEH-1** Number Input renders inside `Field`, which supplies the label, helper text, error text and their ids through Ark field context. `required`, `disabled`, `readOnly` and `invalid` are passed to both.
- **BEH-2** Arrow Up and Arrow Down change the value by `step`, and the stepper buttons do the same with the pointer. With `clampValueOnBlur`, the value is clamped to `min` and `max` when the input loses focus.
- **BEH-3** `formatOptions` formats the displayed value with `Intl.NumberFormat`; `value` stays the raw string.
- **BEH-4** The mouse wheel changes the value only with `allowMouseWheel`. It SHOULD stay off in scrollable forms so that scrolling the page does not change values.

## Display

- **DIS-1** The control is 40px high and uses the shared field control styles (`fieldControlRecipe`), including the invalid and disabled states. The stepper buttons sit in a 28px column at the right edge.
- **DIS-2** Numbers use tabular figures so values line up while they change.

## Accessibility

- **A11Y-1** The input is named by `label`, and helper and error text are linked through Field (`aria-describedby`). Error text is announced politely.
- **A11Y-2** The stepper buttons are named by `incrementLabel` and `decrementLabel` and are kept out of the tab order, because the arrow keys offer the same actions. Callers MUST NOT rely on the buttons as the only way to change the value.
- **A11Y-3** The invalid state MUST be explained in `error` text. The red border alone MUST NOT be the only signal.

## Test hooks

- **TEST-1** The component sets no `data-testid`. A `data-testid` passed by the caller lands on the Field wrapper, not the input. Tests SHOULD find the input by its label.

## Known gaps

Found by reading the code; not run. Fixes MUST satisfy the cited rule.

- **GAP-1** Violates IN-5. The "Start-to-close timeout" example in `docs/src/examples/number-input-examples.svelte` shows `unit="s"` with no unit in the label or helper text, so assistive technology announces the value without "seconds".

## Decisions

- **DEC-1** Open. Should `unit` be announced, for example by adding it to the input's accessible description, so callers do not have to repeat it in the label (IN-5)?

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
