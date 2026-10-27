---
component: Slider
source: ./slider.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Slider contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `SliderProps` and `SliderMark`: that `label` is required; that `value` is a bindable `number[]`; the defaults for `min` (0), `max` (100), `step` (1), `minStepsBetweenThumbs` (0), `orientation`, `showValue` and `formatValue`; that `aria-label` and `aria-labelledby` cannot be passed to the root.

## Input

- **IN-1** Use Slider for an approximate value in a bounded range. When people need an exact value or the range is very large, use Number Input.
- **IN-2** `value` MUST contain one number for a single thumb or two for a range. Each entry renders one thumb, so an empty array renders none.
- **IN-3** `min` MUST be less than `max`, and `step` SHOULD divide the range evenly so both ends are reachable.
- **IN-4** A range slider MUST pass `thumbLabels` with a distinct name for each thumb, such as `['Minimum latency', 'Maximum latency']`. Without them, both thumbs share the group label.
- **IN-5** `formatValue` MUST return the value with its unit when the unit is not obvious, such as "30 days". It is used for the visible value, the marks and the value announced by screen readers.
- **IN-6** Each mark `value` MUST be unique and within `min` and `max`. Marks SHOULD be a few meaningful reference points, not one per step.
- **IN-7** `class` is merged through `twMerge` onto the root. It MUST NOT restyle the track, range or thumbs.

## Behavior

- **BEH-1** `onValueChange` fires on every change while dragging or pressing keys. `onValueChangeEnd` fires once when the interaction ends. Expensive work such as a query SHOULD use `onValueChangeEnd`.
- **BEH-2** With two thumbs, `minStepsBetweenThumbs` keeps them at least that many steps apart.
- **BEH-3** `required` shows the required indicator next to the label. It is not passed to the slider or its hidden inputs.
- **BEH-4** Each thumb renders a hidden input, so `name` submits the value with a form.

## Display

- **DIS-1** The track is 6px high (horizontal) and the selected range uses the primary interactive color. A vertical slider has a fixed height of 192px.
- **DIS-2** Thumbs stay inside the track at both ends (`thumbAlignment="contain"`).
- **DIS-3** With `showValue`, the formatted value appears beside the label. A range shows both values joined with an en dash.

## Accessibility

- **A11Y-1** Each thumb is a tab stop with the slider role. Arrow keys change the value by `step`, Page Up and Page Down by a larger step, and Home and End jump to `min` and `max`.
- **A11Y-2** Helper and error text are linked to every thumb through `aria-describedby`.
- **A11Y-3** Marks and the value text are visual aids. The value MUST also be available from the thumb, which it is through `aria-valuetext` from `formatValue`.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one; it is forwarded to the root.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. `required` is visual only (BEH-3), because a slider always has a value. Decide whether Slider should accept `required` at all, or whether the prop should be removed to avoid suggesting validation that does not happen.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
