---
component: Tabs
source: ./tabs.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Tabs contract

Also covers `./tabs-content.svelte`, `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `TabsProps`, `TabsItem` and `TabsContentProps`: that `items` is required; that each item has a required `value` and `label` and optional `disabled`, `Icon` and `badge`; that `value` is a bindable string; the two `variant`, two `orientation` and two `activationMode` values and their defaults.

## Input

- **IN-1** Use Tabs to switch between views of the same content on one page. When each view has its own URL, use links with `aria-current`, such as Navigation Menu. Steps in a sequence MUST use Steps. A view or filter switch that changes the same content SHOULD use Segment Group.
- **IN-2** Every item MUST have a panel: either pass `content`, or place one `TabsContent` per item `value` inside Tabs. A trigger without a panel controls nothing.
- **IN-3** Callers MUST NOT pass `content` and `TabsContent` for the same value, which renders two panels.
- **IN-4** Each item `value` MUST be unique.
- **IN-5** When a page has more than one set of tabs, each MUST pass `label` to name its tab list.
- **IN-6** Labels SHOULD be short and translated. A count MUST go in `badge`, not in the label, and the label MUST say what is counted.
- **IN-7** Use `activationMode="manual"` when selecting a tab is slow, such as when a panel loads data.
- **IN-8** `class` is merged through `twMerge` onto the root, `listClass` onto the tab list and `contentClass` onto `content` panels. They MUST NOT restyle triggers or the indicator.

## Behavior

- **BEH-1** Without a bound `value`, the first enabled item is selected. The bound `value` stays undefined until someone selects a tab.
- **BEH-2** Selecting a tab updates the bound `value` and calls `onValueChange`.
- **BEH-3** Panels stay mounted while hidden, keeping form values and scroll position. `lazyMount` renders a panel when it is first selected, and `unmountOnExit` removes hidden panels.
- **BEH-4** Each trigger has `data-track-name="tabs"`, `data-track-intent="select"` and `data-track-text` set to its label. There is no option to remove them.

## Display

- **DIS-1** The `line` variant underlines the selected tab with an indicator bar that moves between tabs. The `enclosed` variant shows the tabs as segments on a filled track.
- **DIS-2** The tab list scrolls horizontally when the tabs do not fit.
- **DIS-3** `Icon` renders before the label at 16px, and `badge` after it.

## Accessibility

- **A11Y-1** Tab moves focus into the tab list and then to the active panel. Arrow keys move between tabs, Home and End jump to the ends, and disabled tabs are skipped.
- **A11Y-2** Icons are hidden from assistive technology. The label MUST carry the meaning.
- **A11Y-3** The badge is part of the tab's accessible name, so its value MUST make sense after the label, such as "Pending Activities 3".

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers that tests target MUST pass one; it is forwarded to the root, and `TabsContent` forwards its own.

## Known gaps

None found by reading the code.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
