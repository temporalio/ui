---
component: Accordion
source: ./accordion.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Accordion contract

Also covers `./accordion-group.svelte`, `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `AccordionProps` and `AccordionGroupProps`: that `title` is required and every other prop is optional; the defaults for `open`, `expandable`, `disabled`, `subtitle` and `error`; that `children` receives the open state; that native div attributes are forwarded.

## Input

- **IN-1** `title` MUST NOT be empty. It is the visible heading and the trigger's accessible name, and it is also sent as `data-track-container` and `data-track-text`.
- **IN-2** `summary` and `subtitle` render inside the trigger button. They MUST NOT contain links, buttons or other interactive elements. Put independent controls in the `action` snippet, which renders outside the trigger.
- **IN-3** Use Accordion for a titled page section that needs card styling, a subtitle, an error badge or header actions. A single inline disclosure inside other content SHOULD use Collapsible instead.
- **IN-4** Adjacent Accordion cards that form one list SHOULD be wrapped in AccordionGroup. AccordionGroup only joins borders and corners: it MUST NOT be relied on to limit how many panels are open.
- **IN-5** `error` SHOULD be a short translated message. It renders as a `danger` Badge in the trigger, so it becomes part of the trigger's accessible name.
- **IN-6** `class` is merged through `twMerge` onto the outer card. It MUST NOT set border or background colors.
- **IN-7** An Accordion with `expandable={false}` has no trigger. Callers MUST control visibility through `open`.
- **IN-8** `summary` MUST NOT contain elements with an `id` or components that hold state, because it renders twice (BEH-4).

## Behavior

- **BEH-1** `bind:open` reads and controls the panel. `onToggle` fires only when a person toggles the trigger, not when `open` changes from outside.
- **BEH-2** Children stay mounted while the panel is closed (`lazyMount={false}`, `unmountOnExit={false}`), so form values are kept. Content that is expensive to render SHOULD check the open state passed to `children`.
- **BEH-3** The trigger and content IDs are derived from `id` (`<id>-trigger`, `<id>-content`). Callers that render several accordions with a fixed `id` MUST keep each `id` unique.
- **BEH-4** The `summary` snippet is rendered twice: once beside the title on wide screens and once below it on small screens, with CSS hiding one.

## Display

- **DIS-1** The title uses the `text-xl` heading style. The trigger and content inherit body text.
- **DIS-2** The chevron points up when open and down when closed. It is not shown when `expandable` is false.

## Accessibility

- **A11Y-1** The trigger is wrapped in an `h3`. On a page whose heading structure needs another level, the accordion breaks the outline. **Needs decision: DEC-1.**
- **A11Y-2** Enter and Space toggle the panel. A disabled accordion cannot be toggled, and its reason SHOULD be given in `subtitle`, as the "Retry policy" example does.
- **A11Y-3** `error` MUST state the problem in words. The badge color MUST NOT be the only signal.

## Test hooks

- **TEST-1** `data-testid` is forwarded to the outer card. The component sets none by default.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. The heading level is fixed at `h3`. Decide whether Accordion should take a `headingLevel` prop or whether pages must be structured around `h3`.
- **DEC-2** Open. `summary` is rendered twice to move it under the title on small screens (BEH-4, IN-8). Decide whether a single element positioned with CSS should replace the duplicate.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
