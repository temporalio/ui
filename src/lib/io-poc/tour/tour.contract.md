---
component: Tour
source: ./tour.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Tour contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `TourProps` and `TourStep`, so not repeated: that `steps` is required and each step needs an `id`, `title` and `description`; that `open` is bindable and defaults to `false`; the label props and their defaults; the defaults for `showProgress`, `closeOnEscape`, `closeOnInteractOutside` (false), `keyboardNavigation` and `spotlightRadius`.

## Input

- **IN-1** A tour MUST start only when someone chooses to, such as from a "Start tour" button. It MUST NOT start on page load: starting scrolls the first target into view and moves focus into the popover.
- **IN-2** Tours SHOULD be used sparingly, for new or substantially changed workflows, and SHOULD be short. A tour MUST NOT be the only way to learn how something works; labels, helper text and empty states come first.
- **IN-3** Every step except the last offers the skip action, and that action MUST NOT be removed. Labels SHOULD be translated.
- **IN-4** A step's `target` MUST return an element that is rendered when the step starts. Steps without a target appear as a centered dialog; use one for an introduction or summary.
- **IN-5** Step `id`s MUST be unique. Step `title`s SHOULD be short and `description`s one or two sentences.
- **IN-6** `class` is merged onto the step popover. It MUST NOT change the background, border or text colors.

## Behavior

- **BEH-1** Setting `open` to true starts the tour at its first step. When the tour ends by finishing, skipping or closing, `open` returns to false. Setting `open` to false while a tour runs does not stop it.
- **BEH-2** When a step with a target starts, the target is scrolled into the nearest visible position (`scrollIntoView` with `block: 'nearest'`), highlighted by the spotlight, and the popover is placed by `placement` (default `bottom`). Without a target the step is centered.
- **BEH-3** Each step's actions are generated: Skip on every step but the last, Back from the second step, and Next, or Finish on the last step.
- **BEH-4** `onComplete` is called when the last step is finished. Closing the tour on the last step, with the close button or Escape, also counts as completing it. `onSkip` is called for the skip action, and `onDismiss` when the tour is closed before the last step. `onStepChange` receives the new step index.
- **BEH-5** The backdrop, spotlight and popover always render in a portal at the end of the page; there is no `portalled` option. Because a running tour scrolls its target and traps focus, it cannot be rendered inline as a static preview; the docs page's anatomy preview is a static copy built from the Tour recipes.

## Display

- **DIS-1** Each step dims the page with a backdrop unless the step sets `backdrop: false`. The target is outlined by a 2px brand ring with `spotlightRadius` rounding.
- **DIS-2** The progress text ("2 of 3") shows when `showProgress` is on and the tour has more than one step.

## Accessibility

- **A11Y-1** When a step opens, focus moves into its popover, and Tab is kept within the popover and the highlighted target until the tour ends.
- **A11Y-2** Each step is a dialog named by its title and described by its description.
- **A11Y-3** With `keyboardNavigation`, the Right and Left arrow keys move to the next and previous step. Escape closes the tour while `closeOnEscape` is on; callers SHOULD keep it on so the tour can always be left from the keyboard.
- **A11Y-4** The close button is icon-only and named by `closeLabel`, which SHOULD be translated.

## Test hooks

- **TEST-1** The component accepts no `data-testid`. Tests SHOULD find the current step by its dialog name (the step title) and the actions by their labels.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. `open` only starts a tour (BEH-1); it cannot stop one. Decide whether setting `open` to false should end a running tour, and which callback that should call.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
