---
component: ProgressLinear
source: ./progress-linear.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Progress Linear contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `ProgressLinearProps`, so not repeated: that `label` is required and every other prop is optional; that `value` accepts `null`; the defaults for `value`, `min`, `max`, `showValue`, `size` and `colorScheme`; the two `size` and four `colorScheme` values; that other div attributes are forwarded.

## Input

- **IN-1** `label` MUST name the operation in progress, such as "Batch terminate", not the component or the value.
- **IN-2** Pass `value={null}` only while the amount of work is unknown. When the total is known, pass a number between `min` and `max`, so people can see how much is left.
- **IN-3** Use Progress Linear for work with a measurable amount, such as items processed or attempts used. For a short wait with no measurable amount, a spinner or skeleton MAY be used instead.
- **IN-4** `formatValue` SHOULD express the value in the unit people care about, such as "342 of 1,000 workflows". Its result is the accessible value text, so it MUST be understandable without the bar.
- **IN-5** `colorScheme` MUST carry the meaning of the state. `success` is for completed work, `warning` for a value close to a limit, and `danger` for a value at or past a limit. `brand` is the default for neutral progress.
- **IN-6** `class` is merged onto the root through `twMerge`. It MAY set the width and spacing. It MUST NOT change the track or range colors; use `colorScheme`.

## Behavior

- **BEH-1** The percentage is clamped to 0–100. A value outside `min` and `max` shows an empty or full bar but keeps the given value for `formatValue`.
- **BEH-2** With `value={null}`, a short bar slides along the track and the value text is hidden.
- **BEH-3** Width changes animate over 300ms.

## Display

- **DIS-1** The track is 8px high for `md` and 4px for `sm`, fully rounded, with the range in the color set by `colorScheme`.
- **DIS-2** The label and value text share one row above the track. With `labelHidden` and `showValue={false}`, the row is visually hidden.
- **DIS-3** With reduced motion, the indeterminate bar does not move. It fills the track at half opacity, and width changes are not animated.

## Accessibility

- **A11Y-1** The track has `role="progressbar"`, is labelled by `label`, and exposes the formatted value through `aria-valuetext`. While indeterminate it has `aria-busy`.
- **A11Y-2** `colorScheme` MUST NOT be the only signal of a state. The label or the formatted value MUST say what the color means, for example "97% used, near the limit".
- **A11Y-3** Progress Linear does not announce changes. When completion matters, the caller MUST announce it separately, for example with a toast.

## Test hooks

- **TEST-1** The component sets no `data-testid`. A `data-testid` passed by the caller lands on the root. Tests SHOULD find the progress bar by its role and label.

## Known gaps

Found by reading the code; not run. Fixes MUST satisfy the cited rule.

- **GAP-1** Violates A11Y-2. The "Namespace storage" example in `docs/src/examples/progress-linear-examples.svelte` uses `colorScheme="danger"` with the default value text "97%", so the danger meaning is shown only by color.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
