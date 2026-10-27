---
component: Collapsible
source: ./collapsible.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Collapsible contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `CollapsibleProps`: that every prop is optional; the defaults for `open`, `disabled`, `lazyMount` and `unmountOnExit`; that `trigger` and `children` receive the open state; that native div attributes are forwarded.

## Input

- **IN-1** Every Collapsible MUST pass `label` or a `trigger` snippet. With neither, the trigger button is empty and has no accessible name.
- **IN-2** `trigger` content renders inside the trigger button. It MUST NOT contain links, buttons or other interactive elements.
- **IN-3** Use Collapsible for one inline disclosure inside other content, such as advanced options or a stack trace. A titled page section with card styling, a subtitle, an error badge or header actions SHOULD use Accordion.
- **IN-4** Content that holds form values MUST keep the default `unmountOnExit={false}`, or the values are lost when it closes.
- **IN-5** `class` styles the root, `triggerClass` the trigger and `contentClass` the content. They are merged with `twMerge` and MUST NOT remove the trigger's focus ring.
- **IN-6** A `trigger` whose text changes with the open state, such as "Show" and "Hide", MAY be used. The state is also exposed through `aria-expanded`, so the text SHOULD keep the same subject in both states.

## Behavior

- **BEH-1** `bind:open` reads and controls the content. `onOpenChange` fires only when a person toggles the trigger.
- **BEH-2** With `lazyMount`, children render the first time the content opens. With `unmountOnExit`, they are removed again when it closes.
- **BEH-3** With `label`, the trigger shows the text and a chevron that rotates when open. With `trigger`, the caller owns the whole trigger content, including any indicator.
- **BEH-4** The trigger gets `data-track-name="collapsible"`, `data-track-intent="toggle"` and `data-track-text` set to `label`, or `*textContent*` when there is no label.

## Display

- **DIS-1** Collapsible has no border, background or padding around its content. Callers that need a card SHOULD use Accordion instead of adding one with `class`.
- **DIS-2** The content animates its height on open and close, and the chevron rotates. Both are removed under reduced motion.

## Accessibility

- **A11Y-1** The trigger is a button with `aria-expanded` and `aria-controls`. Enter and Space toggle it. A disabled trigger cannot be activated.
- **A11Y-2** Focus stays on the trigger after toggling. Content that opens SHOULD NOT move focus on its own.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers MAY pass one; it is forwarded to the root.

## Known gaps

None found by reading the code.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
