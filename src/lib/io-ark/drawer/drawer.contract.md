---
component: Drawer
source: ./drawer.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Drawer contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `DrawerProps`, so not repeated: that `title` is required and everything else optional; the three `placement` and three `size` values and their defaults; that `open` is bindable; the defaults of `modal`, `portalled`, `closeOnEscape`, `closeOnInteractOutside` and `closeLabel`; that `trigger` receives the trigger props as an untyped record.

## Input

- **IN-1** `title` names the drawer and is its accessible name. It MUST NOT be empty and SHOULD be a short, translated noun phrase such as "Event details". A drawer that shows one of several records SHOULD include the record in `title` or `description`.
- **IN-2** Choose by task. A drawer is for details, settings or filters that relate to the page and benefit from keeping it in view. A short decision that must be finished before continuing MUST use Dialog instead.
- **IN-3** A `trigger` snippet MUST spread its props onto one focusable control, normally an io-ark `Button`. A drawer opened from elsewhere, such as a table row, MUST use `bind:open` instead of a trigger.
- **IN-4** `class` is merged last onto the content panel through `twMerge` in `drawerContentRecipe`. It MUST NOT change the panel's position, width, background or border. Use `placement` and `size`.
- **IN-5** `portalled` MUST stay `true` in product UI. Set it to `false` only to render the drawer inside a contained preview, such as the docs anatomy figure. Without a portal, the fixed positioner resolves to the nearest transformed ancestor.
- **IN-6** `modal={false}` removes the backdrop and lets people use the page while the drawer is open. It SHOULD be used only when the page and drawer are meant to be used together. `closeLabel` SHOULD be translated.

## Behavior

- **BEH-1** The drawer mounts its content when it opens and unmounts it when it closes (`lazyMount`, `unmountOnExit`). State held inside the drawer's children is lost on close. State that must survive, such as unapplied filters, MUST live in the caller.
- **BEH-2** `open` updates when a person opens or dismisses the drawer, and `onOpenChange` is called only for those changes. Setting `open` from outside does not call `onOpenChange`.
- **BEH-3** `placement` sets the swipe direction (`right` swipes to the end, `left` to the start, `bottom` down). People can dismiss by swiping toward the edge, by the close button, by Escape unless `closeOnEscape` is false, and by clicking outside unless `closeOnInteractOutside` is false.
- **BEH-4** The header always renders the title and close button. Body and footer render only when `children` and `footer` are passed. Header, body and footer carry `data-part="header"`, `"body"` and `"footer"`.

## Display

- **DIS-1** Side drawers fill the viewport height and are limited to `max-w-sm`, `max-w-xl` or `max-w-3xl` by `size`. Bottom sheets grow with their content up to 85% of the viewport height, show a grabber, and are limited to `max-w-xl`, `max-w-3xl` or full width.
- **DIS-2** The backdrop and panel sit at `z-50`. Enter and exit animations are turned off under reduced motion.

## Accessibility

- **A11Y-1** Focus moves into the drawer when it opens and stays inside while `modal` is true. On close it returns to the trigger, or, without a trigger, to the element that had focus before. A caller whose opener can disappear while the drawer is open MUST pass `finalFocusEl`.
- **A11Y-2** The close button is an icon button whose accessible name is `closeLabel`. It MUST stay present; callers MUST NOT hide it with `class`.
- **A11Y-3** `description`, when set, is linked to the drawer as its description. Content that people need before acting SHOULD be in `description` or the body, not only in the footer.

## Test hooks

- **TEST-1** `data-testid` is set on the content panel, which exists only while the drawer is open. Tests MUST open the drawer before querying it. The close button sets no tracking attributes (`tracking={false}`).

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. Should the drawer keep its content mounted while closed? Unmounting (BEH-1) avoids rendering hidden panels, but it discards in-progress input. The filters example keeps its draft state in the caller to work around this.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
