---
component: Popover
source: ./popover.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Popover contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `PopoverProps`, so not repeated: that every prop is optional; the defaults for `open`, `placement`, `modal`, `portalled`, `closeOnInteractOutside`, `closeOnEscape`, `showArrow` and `closeLabel`; that the `trigger` snippet receives the trigger props; that Popover forwards no other attributes.

## Input

- **IN-1** Popover MUST have a `trigger`, and the trigger snippet MUST spread its props onto one focusable element, usually an io-ark `Button`. The panel is positioned against that element.
- **IN-2** Popover MUST have a `title`. The panel is a `dialog`, and `title` is its only source of an accessible name, because Popover accepts no `aria-label`.
- **IN-3** Choose by content. Use Tooltip for a short, non-interactive label. Use Popover for interactive or longer content tied to one trigger. Use Dialog when the task needs full attention or must be finished before continuing. Popover MUST NOT hold the only way to finish a required task.
- **IN-4** `modal` keeps focus inside the panel and blocks the rest of the page. It SHOULD be used only when the panel holds a form that must be submitted or dismissed.
- **IN-5** `closeOnInteractOutside={false}` and `closeOnEscape={false}` MUST NOT be combined with `showClose={false}`, so there is always a way to close the panel.
- **IN-6** `portalled={false}` renders the panel in place. Use it only where the panel must stay inside a container, such as an inline preview. The container MUST NOT clip the panel.
- **IN-7** `class` is merged onto the content panel through `twMerge`. It MAY set the width. It MUST NOT change the background, border or shadow.
- **IN-8** `title`, `description` and `closeLabel` SHOULD be translated.

## Behavior

- **BEH-1** Opening moves focus into the panel, to `initialFocusEl` when given. Escape, the close button or a click outside closes it, and focus returns to the trigger.
- **BEH-2** The panel is mounted when it opens and unmounted when it closes, so state held only inside it is lost on close. Callers MUST keep form values that must survive closing in their own state, as the "Filter by status" example does.
- **BEH-3** A close button renders when `title` is set, unless `showClose` is false. It also renders with `showClose` and no title.
- **BEH-4** The panel opens on the `placement` side, and flips and shifts to stay in view. `showArrow` adds an arrow and increases the gap to 10px.

## Display

- **DIS-1** The panel uses the same surface, border, radius and shadow as the other floating panels (Combobox, Select, Menu).
- **DIS-2** The panel fades in. The animation is turned off for reduced motion.

## Accessibility

- **A11Y-1** The panel has `role="dialog"`, is named by `title` and described by `description`. The trigger has `aria-expanded` and `aria-controls`.
- **A11Y-2** The close button is icon-only and named by `closeLabel`.
- **A11Y-3** Popover content MUST stay usable by keyboard. Interactive content MUST be reachable with Tab from the panel's first focusable element.

## Test hooks

- **TEST-1** `data-testid` is applied to the content panel, which exists only while open. Tests that need the trigger MUST give it its own `data-testid` in the `trigger` snippet.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. Should Popover accept `aria-label` for panels without a visible title? Today IN-2 requires a `title`, which also adds a close button by default.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
