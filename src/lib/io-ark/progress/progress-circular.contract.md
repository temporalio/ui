---
component: ProgressCircular
source: ./progress-circular.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Progress Circular contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `ProgressCircularProps`, so not repeated: that `label` is required and every other prop is optional; that `value` accepts `null`; that `size` takes `sm`, `md`, `lg` or a number of pixels; the defaults for `value`, `min`, `max`, `showValue`, `size` and `colorScheme`; that other div attributes are forwarded.

## Input

- **IN-1** `label` MUST name the operation in progress, such as "Workers upgraded", not the size or the component. Use `labelHidden` only when nearby text already names it; the label stays available to assistive technology.
- **IN-2** Pass `value={null}` only while the amount of work is unknown. When the total is known, pass a number between `min` and `max`.
- **IN-3** Use Progress Circular where space is tight, such as a card or a table cell. Use Progress Linear when there is room for a full-width bar and a label above it.
- **IN-4** With `showValue`, the value text MUST fit inside the ring. Keep it to a few characters, such as "65%" or "6/8". Long text SHOULD use Progress Linear instead.
- **IN-5** `formatValue` sets the accessible value text, so it MUST be understandable on its own.
- **IN-6** `colorScheme` MUST carry the meaning of the state, as in Progress Linear IN-5.
- **IN-7** `thickness` SHOULD be left to the size default. A custom size in pixels gets a thickness of about a twelfth of the size, at least 2px.
- **IN-8** `class` is merged onto the root through `twMerge`. It MAY set spacing and alignment. It MUST NOT change the ring colors; use `colorScheme`.

## Behavior

- **BEH-1** The percentage is clamped to 0–100.
- **BEH-2** With `value={null}`, a quarter arc spins and the value text is hidden.
- **BEH-3** Changes to the arc animate over 300ms.

## Display

- **DIS-1** Sizes are 32px (`sm`), 48px (`md`) and 72px (`lg`), with 3px, 4px and 6px strokes. The label sits below the ring.
- **DIS-2** The value text inside the ring is 10px below 48px, 12px below 64px, and 14px from 64px up.
- **DIS-3** With reduced motion, the indeterminate arc does not spin and changes are not animated.

## Accessibility

- **A11Y-1** The ring has `role="progressbar"`, is labelled by `label`, and exposes the formatted value through `aria-valuetext`. The value text drawn inside the ring is `aria-hidden` so it is not read twice. While indeterminate the ring has `aria-busy`.
- **A11Y-2** `colorScheme` MUST NOT be the only signal of a state. The label or value text MUST say what the color means.
- **A11Y-3** Progress Circular does not announce changes. When completion matters, the caller MUST announce it separately.

## Test hooks

- **TEST-1** The component sets no `data-testid`. A `data-testid` passed by the caller lands on the root. Tests SHOULD find the progress bar by its role and label.

## Known gaps

Found by reading the code; not run. Fixes MUST satisfy the cited rule.

- **GAP-1** Violates IN-1. The size examples in `docs/src/examples/progress-circular-examples.svelte` use the labels "Small", "Medium" and "Large", which name the size instead of an operation. They are announced as progress bars called "Small" and so on.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
