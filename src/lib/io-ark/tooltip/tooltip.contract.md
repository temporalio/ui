---
component: Tooltip
source: ./tooltip.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Tooltip contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `TooltipProps`, so not repeated: that `content` is required and accepts a string or a snippet; the twelve `placement` values and the `top` default; that `open` is bindable; the defaults for `openDelay` (400), `closeDelay` (150), `showArrow`, `interactive`, `portalled` and each `closeOn*` option.

## Input

- **IN-1** Tooltip content MUST be supplementary. It MUST NOT be the only place essential information, an error, or the only explanation of an action appears, because tooltips need hover or focus and touch screens rarely show them.
- **IN-2** `content` SHOULD be a few words of translated plain text. It MUST NOT contain links, buttons or other interactive elements; use Popover for interactive or longer content.
- **IN-3** A tooltip does not give its trigger an accessible name. An icon-only trigger MUST still have its own `aria-label`, usually with the same text as the tooltip.
- **IN-4** With the `trigger` snippet, callers MUST spread the received props onto a focusable element, such as a Button, so keyboard users can open the tooltip.
- **IN-5** A tooltip MUST NOT be attached to a disabled native button: it cannot receive hover or focus. Explain unavailable actions with visible text (Button A11Y-2).
- **IN-6** `class` is merged through `twMerge` onto the tooltip content after its base classes. It MUST NOT change the background or text color, which are paired for contrast.

## Behavior

- **BEH-1** The tooltip opens after `openDelay` of hover and closes after `closeDelay`. By default it closes on Escape, on click, on pointer down, and when the page scrolls.
- **BEH-2** Without a `trigger` snippet, `children` are wrapped in an unstyled `<button type="button">` that carries the trigger props. `triggerClass` styles that button.
- **BEH-3** Content is mounted only while open (`lazyMount`, `unmountOnExit`).
- **BEH-4** Content renders in a portal at the end of the page unless `portalled` is false. With `portalled={false}`, the closest transformed or clipping ancestor positions and may clip it.
- **BEH-5** With `interactive`, the pointer can move onto the tooltip without closing it. Interactive content is still not allowed (IN-2).

## Display

- **DIS-1** Content uses the inverse colors (`bg-content-primary`, `text-inverse-primary`) at `text-xs`, up to `max-w-xs`, with an 8px arrow unless `showArrow` is false.
- **DIS-2** Content fades in and out; animation is removed under reduced motion.

## Accessibility

- **A11Y-1** While open, the trigger is described by the tooltip content (`aria-describedby`), so screen readers announce the content after the trigger's name.
- **A11Y-2** Focus is shown on the default trigger button by a 2px ring on `focus-visible`. `triggerClass` MUST NOT remove it.

## Test hooks

- **TEST-1** The component accepts no `data-testid`. Callers SHOULD put one on the element they render in the `trigger` snippet. Tests SHOULD assert on the content through the trigger's description, not on the portalled content node.

## Known gaps

- **GAP-1** Violates IN-1. The Run ID example (`docs/src/examples/tooltip-examples.svelte`) truncates the run ID to `w-32` and shows the full value only in the tooltip, so sighted people on touch screens cannot read it.

## Decisions

- **DEC-1** Open. The default trigger (BEH-2) is a `<button>` even when the content it wraps is not an action, such as the Run ID text. Screen readers announce a button that does nothing when pressed. Decide whether non-interactive triggers should use a different focusable element, or whether truncated values should get a copy action instead of a tooltip.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
