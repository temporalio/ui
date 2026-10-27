---
component: Menu
source: ./menu.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Menu contract

Also covers `./menu-items.svelte`, `./types.ts`, `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `MenuProps` and the `MenuEntry` union, so not repeated: that `items` is required and everything else optional; the entry types (action, `separator`, `group`, `checkbox`, `radio`, `submenu`) and their fields; that `open` is bindable; the defaults of `placement`, `closeOnSelect`, `closeOnInteractOutside`, `closeOnEscape`, `portalled`, `disabled`, `triggerColorScheme` and `triggerSize`.

## Input

- **IN-1** Use Menu for a list of actions or view options opened from one trigger. A choice of a value that belongs to a form MUST use Select, and navigation between pages SHOULD use links or Navigation Menu.
- **IN-2** The trigger MUST have an accessible name. Pass `label` for the default Button trigger, or a `trigger` snippet whose control has visible text or an `aria-label`, as the row actions example does. With neither, the default trigger is an unnamed chevron button.
- **IN-3** A `trigger` snippet MUST spread its props onto one focusable control, normally an io-poc `Button`.
- **IN-4** Every action, checkbox and submenu `value` MUST be unique across the whole menu, including submenus. `onSelect` reports only the value.
- **IN-5** Checkbox and radio entries are controlled. The caller MUST update `checked` or `value` in `onCheckedChange` or `onValueChange`; otherwise the entry does not change.
- **IN-6** `danger` MUST mark only destructive actions, and the label MUST say what happens, such as "Terminate". A destructive action SHOULD ask for confirmation after it is selected.
- **IN-7** An action with `href` renders a link and SHOULD be used only for navigation. An action without `href` MUST be handled in `onSelect`.
- **IN-8** A submenu cannot be disabled: Ark's `TriggerItem` has no `disabled` prop, and `MenuSubmenuEntry` has no `disabled` field. A submenu with no available entries MUST be left out of `items`.
- **IN-9** `class` is merged last onto the menu panel through `twMerge` in `menuContentRecipe`. It MUST NOT change the panel's background, border or z-index. It does not apply to submenu panels.
- **IN-10** `portalled` MUST stay `true` in product UI. Set it to `false` only to render the menu inside a contained preview or scrolling container, and then every panel of the menu, including submenus, MUST render in that container.

## Behavior

- **BEH-1** Selecting an action calls `onSelect` with its value and closes the menu unless `closeOnSelect` is false. Checkbox and radio entries keep the menu open and do not call `onSelect`.
- **BEH-2** `open` updates when a person opens or dismisses the menu, and `onOpenChange` is called only for those changes.
- **BEH-3** `closeOnInteractOutside={false}` and `closeOnEscape={false}` cancel Ark's dismiss events, so the menu stays open until an action closes it or `open` is set to false.
- **BEH-4** The menu panel and each submenu panel mount when opened and unmount when closed.
- **BEH-5** `portalled={false}` renders the top-level panel in place. Submenu panels always render in a portal.

## Display

- **DIS-1** The highlighted item uses `bg-interactive-secondary-hover`. Danger items use `text-danger` and a danger surface when highlighted. Disabled items show reduced opacity.
- **DIS-2** When any entry in a list is a checkbox or radio, every item in that list reserves space for the indicator so labels align.

## Accessibility

- **A11Y-1** The panel is a `menu` and items are `menuitem`, `menuitemcheckbox` or `menuitemradio`. Arrow keys move between items, Enter or Space activates, typing jumps to a matching item, Right and Left open and close submenus, and Escape closes the menu unless `closeOnEscape` is false.
- **A11Y-2** Opening the menu from the keyboard MUST move focus into it, and closing it MUST return focus to the trigger.
- **A11Y-3** `danger` color MUST NOT be the only signal of a destructive action (IN-6). Item icons are decorative; the label MUST carry the meaning.

## Test hooks

- **TEST-1** `data-testid` is set on the top-level panel, which exists only while the menu is open. Tests MUST open the menu before querying it. The default trigger sets no tracking attributes.

## Known gaps

Found by reading the code and the docs page; not fully verified. Fixes MUST satisfy the cited rule.

- **GAP-1** Violates IN-10. `portalled` is not passed to submenus: `menu-items.svelte` wraps each submenu panel in `<Portal>` with no `disabled`. A menu rendered in place with `portalled={false}` still opens its submenus at the end of the page.

## Decisions

- **DEC-1** Open. Should submenus support `disabled`? Ark's `TriggerItem` cannot be disabled, so IN-8 requires leaving an unavailable submenu out, which hides that the option exists.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
