---
component: ScrollArea
source: ./scroll-area.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Scroll Area contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `ScrollAreaProps`, so not repeated: that `label` is required and every other prop is optional; the three `orientation` and two `scrollbars` values and their defaults; that `height` and `maxHeight` are CSS lengths; that other div attributes are forwarded to the root.

## Input

- **IN-1** `label` MUST name the content of the region, such as "Event history", because the viewport is a named, focusable region.
- **IN-2** Use Scroll Area only for a bounded region that must scroll on its own, such as an event history panel or a code payload. Ordinary long content SHOULD scroll with the page.
- **IN-3** Scroll areas MUST NOT be nested in the same direction.
- **IN-4** The region MUST have a bounded size: `height`, `maxHeight`, or a height from `class` or the parent layout. Without one, the content never overflows and there is nothing to scroll.
- **IN-5** Set the size with `height` or `maxHeight`, not with a `style` attribute. A caller `style` replaces the root style that `height` sets.
- **IN-6** `orientation` MUST match the content: `vertical` for lists, `horizontal` for single wide rows such as a payload, and `both` for tables or code that overflow either way. Overflow in a direction that is not enabled is hidden.
- **IN-7** `class` is merged onto the root through `twMerge` and MAY set borders, radius and size. `viewportClass` MAY set padding on the viewport. Neither MUST hide the scrollbars.

## Behavior

- **BEH-1** Only the scrollbars for enabled directions render. A scrollbar hides when there is nothing to scroll in its direction.
- **BEH-2** With `scrollbars="hover"`, scrollbars fade in while the region is hovered, scrolled or dragged. With `always`, they stay visible.
- **BEH-3** Native scrolling, touch and trackpad gestures keep working. The browser's own scrollbars are hidden.

## Display

- **DIS-1** Scrollbars are thin overlays on the edge of the viewport. The thumb uses the secondary border color and darkens on hover and drag.
- **DIS-2** With `orientation="both"`, a corner fills the space where the two scrollbars meet.

## Accessibility

- **A11Y-1** The viewport has `role="region"`, is named by `label`, and is in the tab order, so keyboard users can scroll it with the arrow keys, Page Up, Page Down, Home and End.
- **A11Y-2** The viewport shows a focus ring when focused. `viewportClass` MUST NOT remove it.
- **A11Y-3** When more content is hidden and people need to know it, `scrollbars` SHOULD be `always`, because hover-only scrollbars are not visible on touch screens until scrolling starts.

## Test hooks

- **TEST-1** The component sets no `data-testid`. A `data-testid` passed by the caller lands on the root. Tests SHOULD find the scrollable region by its role and name.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. The viewport is always in the tab order, even when its content fits and nothing scrolls. Decide whether the tab stop should be removed when there is no overflow.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
