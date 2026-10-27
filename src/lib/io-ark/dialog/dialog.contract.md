---
component: Dialog
source: ./dialog.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Dialog contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `DialogProps`: that `title` is required; that `open` is bindable; the three `size` and two `role` values; the defaults for `size`, `role`, `modal`, `portalled`, `closeOnEscape` and `closeLabel`; that `trigger` receives props to spread.

## Input

- **IN-1** `title` MUST name the dialog's purpose. It is the dialog's accessible name. A `description` SHOULD state the consequence when the dialog asks for a decision.
- **IN-2** Use Dialog for a short task or decision that must be finished or dismissed before continuing. Details that people consult while staying on the page SHOULD use Drawer. Brief, non-blocking content next to a control SHOULD use Popover.
- **IN-3** A dialog that confirms a destructive or irreversible action MUST use `role="alertdialog"`, and its confirm button MUST use `colorScheme="danger"` with a label that names the action, such as "Terminate workflow".
- **IN-4** The `trigger` snippet MUST spread the props it receives onto one focusable element, normally a Button. Without a trigger, callers MUST control `open` and SHOULD pass `finalFocusEl` when focus should return somewhere other than the previously focused element.
- **IN-5** Footer buttons do not close the dialog. Each action MUST set `open` to false itself when its work is done, as the examples do.
- **IN-6** A form in the dialog body with its submit button in the footer MUST link them with the form's `id` and the button's `form` attribute.
- **IN-7** `closeLabel` SHOULD be translated. Its default is "Close".
- **IN-8** `modal={false}` and `portalled={false}` exist for previews and embedded layouts. Product dialogs SHOULD keep the defaults.
- **IN-9** `class` is merged onto the content panel. It MUST NOT change the panel's background, border or max height.

## Behavior

- **BEH-1** `bind:open` reads and controls the dialog. `onOpenChange` fires when a person opens or closes it through the trigger, close button, Escape or an outside click.
- **BEH-2** A modal dialog traps focus, locks page scrolling and hides the rest of the page from assistive technology while open.
- **BEH-3** Escape closes the dialog unless `closeOnEscape={false}`. An outside click closes it unless `closeOnInteractOutside={false}`; for `alertdialog` that defaults to `false`.
- **BEH-4** Content is mounted when the dialog opens and removed when it closes (`lazyMount`, `unmountOnExit`). State inside the dialog that must survive closing MUST live in the caller.
- **BEH-5** The backdrop and panel render in a portal unless `portalled={false}`. A portalled dialog follows the theme set on `document.body`.
- **BEH-6** The backdrop renders even when `modal={false}`. **Needs decision: DEC-1.**

## Display

- **DIS-1** `size` sets the panel's maximum width: `sm` 24rem, `md` 32rem, `lg` 48rem. The panel is at most 85% of the viewport height, and the body scrolls when content is taller.
- **DIS-2** The panel fades and scales in, and the backdrop fades. Both are removed under reduced motion.

## Accessibility

- **A11Y-1** Focus moves into the dialog when it opens: to `initialFocusEl` if given, otherwise to the first focusable element. It returns to the trigger, or to `finalFocusEl`, when the dialog closes.
- **A11Y-2** The title and description are linked to the dialog with `aria-labelledby` and `aria-describedby`.
- **A11Y-3** Every dialog has a labelled close button. An `alertdialog` SHOULD also offer a Cancel button in the footer.

## Test hooks

- **TEST-1** `data-testid` is set on the content panel. The component sets none by default. `id` is passed to the Ark root, which derives the content and title IDs from it.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. With `modal={false}` the backdrop still dims the page although the page stays interactive. Decide whether a non-modal dialog should hide the backdrop.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
