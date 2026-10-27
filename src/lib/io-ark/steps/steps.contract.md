---
component: Steps
source: ./steps.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Steps contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `StepsProps` and `StepsItem`: that `items` is required; that each item has a required `title` and optional `description`; that `step` is a bindable number; the defaults for `orientation`, `linear`, `showControls`, `prevLabel` and `nextLabel`.

## Input

- **IN-1** Use Steps for a task with three to six parts that build on each other. Independent views that can be visited in any order MUST use Tabs.
- **IN-2** `step` is zero-based. `step` equal to `items.length` means every step is complete.
- **IN-3** Pass a `content` snippet whenever the step titles are shown. Each title is a tab that controls a content panel, and without `content` those panels do not exist.
- **IN-4** A flow that must be completed in order MUST set `linear`. A step whose data must be valid before moving on MUST also pass `isStepValid`, and SHOULD explain in its content why Next is not working.
- **IN-5** `nextLabel` SHOULD name the action. On the last step it SHOULD describe what completing does, such as "Create namespace". `nextLabel` is one string, so callers change it based on `step`.
- **IN-6** With `showControls={false}`, the caller MUST provide its own way to move between steps and MUST update the bound `step`.
- **IN-7** Titles, descriptions and button labels SHOULD be translated.
- **IN-8** `class` is merged through `twMerge` onto the root, and `contentClass` onto each content panel. They MUST NOT restyle the step list or indicators.

## Behavior

- **BEH-1** Selecting a step title, or Back and Next, updates the bound `step` and calls `onStepChange`. Completing the last step calls `onStepComplete` and shows the `completed` snippet.
- **BEH-2** Without `linear`, people can select any step title. With `linear`, they can only move to the next step, and only when `isStepValid` returns true for the current one.
- **BEH-3** Back and Next are io-ark Buttons (`tertiary` and `primary`) with tracking turned off. Step titles have `data-track-name="steps"`, `data-track-intent="select"` and `data-track-text` set to the title.

## Display

- **DIS-1** Each indicator shows the step number, a check mark once the step is complete, and a ring on the current step.
- **DIS-2** Separators connect the steps. With `orientation="vertical"`, the list sits beside the content.

## Accessibility

- **A11Y-1** The step list is a tablist and each title a tab that controls its panel. Arrow keys move between titles, and the current step has `aria-current="step"`.
- **A11Y-2** Indicators are hidden from assistive technology, so the title MUST carry the meaning of each step.
- **A11Y-3** Completion MUST NOT be shown by the check mark alone.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one; it is forwarded to the root.

## Known gaps

- **GAP-1** Violates A11Y-3. The completed state is shown only by the check mark inside the indicator, which is `aria-hidden` (`steps.svelte`, the `ItemContext` snippet in `Steps.Indicator`). A screen reader hears the title of a completed step with no completion state.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
