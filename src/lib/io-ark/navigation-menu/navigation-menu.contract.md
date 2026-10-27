---
component: NavigationMenu
source: ./navigation-menu.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Navigation Menu contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `NavigationMenuProps`, `NavigationMenuItem` and `NavigationMenuLinkItem`, so not repeated: that `items` is required and everything else optional; that each item has an optional `href` and optional `children`; that `value` is bindable and empty when every group is closed; the defaults of `label`, `orientation`, `openDelay` and `closeDelay`; that native nav attributes are forwarded.

## Input

- **IN-1** Use a navigation menu when each destination has its own URL. Switching views inside one page MUST use Tabs, and a list of actions MUST use Menu.
- **IN-2** Every item MUST have an `href` or at least one child. An item with neither renders an empty entry.
- **IN-3** Each item's `value` defaults to its `label`. Values MUST be unique in a menu, so items with the same label MUST set `value`. Child `href` values MUST be unique within a group.
- **IN-4** The caller sets `current`; the component does not read the URL. Exactly one link on the page SHOULD be current, and it MUST be the page being shown.
- **IN-5** `label` names the landmark. When a page has more than one navigation menu, each MUST have a distinct `label`, such as "Product" and "Namespace" in the docs examples. Labels SHOULD be translated.
- **IN-6** An unavailable destination SHOULD be left out. A link marked `disabled` MUST NOT navigate and MUST look unavailable. On a top-level item, `disabled` applies only to groups and prevents opening them.
- **IN-7** A horizontal menu's group panels are positioned absolutely below the list and are not portalled. Containers around a horizontal menu MUST NOT clip overflow.
- **IN-8** `class` is merged last onto the `<nav>` root through `twMerge` in `navigationMenuRecipe`. It does not reach links or panels, so it MUST NOT be used to restyle them.

## Behavior

- **BEH-1** Groups open on click and on hover, after `openDelay` (200ms) and closing after `closeDelay` (300ms). Only one group is open at a time; `value` holds its value.
- **BEH-2** `value` updates when a person opens or closes a group, and `onValueChange` is called only for those changes.
- **BEH-3** In a horizontal menu, group links open in a floating panel. In a vertical menu, they expand in place below the trigger.
- **BEH-4** A group trigger is highlighted when the group or any of its links is current.

## Display

- **DIS-1** The current link uses `bg-interactive-secondary-hover` and `text-brand`. Links and triggers show a 2px focus ring.
- **DIS-2** Horizontal panels are at least 256px wide and at most 24rem or the viewport width minus 2rem, at `z-50`. Their enter animation is turned off under reduced motion.

## Accessibility

- **A11Y-1** The root is a `<nav>` landmark named by `label`. Links are `<a>` elements, and the current link gets `aria-current="page"`.
- **A11Y-2** Tab moves between top-level links and triggers. Enter, Space or Down opens a group, Tab and arrow keys move through its links, and Escape closes it and returns focus to its trigger.
- **A11Y-3** The current page MUST NOT be shown by color alone to assistive technology; `aria-current` carries it.
- **A11Y-4** Link descriptions are part of each link's accessible name, so they SHOULD be short.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers pass one, which is forwarded to the `<nav>`. No tracking attributes are set.

## Known gaps

Found by reading the code; not run. Fixes MUST satisfy the cited rule.

- **GAP-1** Violates IN-6. A child link with `disabled` gets only `aria-disabled` (`navigation-menu.svelte`). It keeps its `href`, so clicking it still navigates, and `navigationMenuSubLinkRecipe` has no disabled style, so it looks available.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
