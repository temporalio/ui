---
component: DatePicker
source: ./date-picker.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Date Picker contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `DatePickerProps`: that `label` is required; that `value` is a bindable `DateValue[]` and `open` is bindable; the two `selectionMode` values; the defaults for `locale`, `closeOnSelect`, `fixedWeeks`, `showToday`, `inline`, `portalled` and the button labels; that other div attributes are forwarded.

## Input

- **IN-1** `label` MUST name the date or range, even when `labelHidden` is set.
- **IN-2** Use DatePicker when people benefit from seeing a calendar or choosing a range. A date that people already know and type SHOULD use DateInput.
- **IN-3** `value` is always an array. Single selection MUST read `value[0]`. Range selection holds the start and end, and MUST be treated as incomplete until it has two dates.
- **IN-4** `min`, `max` and the values returned for `isDateUnavailable` MUST use the same calendar type as `value`. `isDateUnavailable` SHOULD be cheap, because it runs for every visible cell.
- **IN-5** `locale` SHOULD come from the app's locale setting. The default is `en-US`. See DateInput DEC-1.
- **IN-6** Visible and accessible text SHOULD be translatable. Callers SHOULD pass translated `placeholder`, `todayLabel`, `triggerLabel` and `clearLabel`.
- **IN-7** DatePicker does not read Field context and MUST NOT be wrapped in Field; it renders its own label and messages.
- **IN-8** `inline` shows the calendar in place, always open, with no positioner or portal. It SHOULD be used only where the calendar is the main content of the area.

## Behavior

- **BEH-1** Selecting a day sets `value` and, with `closeOnSelect`, closes the calendar. In range mode the first click sets the start and the second the end.
- **BEH-2** The calendar has day, month and year views. The view trigger in the header switches between them; only the active view is shown.
- **BEH-3** With `showToday`, a preset button selects today's date, computed in the browser's local time.
- **BEH-4** The calendar is rendered in a portal unless `portalled={false}` or `inline`. A portalled calendar follows the theme set on `document.body`.
- **BEH-5** Range mode renders two inputs, separated by a dash. `name` is set on the visible input, and on both inputs in range mode, so a form receives the typed text rather than an ISO value. **Needs decision: DEC-2.**

## Display

- **DIS-1** Today is marked with a dot. The selected day is filled with `interactive-primary`. Days between a range's start and end use `interactive-secondary-hover`. Unavailable days and days outside `min` and `max` are dimmed.
- **DIS-2** `fixedWeeks` always shows six weeks so the calendar height does not change between months.

## Accessibility

- **A11Y-1** Arrow keys move between days, Page Up and Page Down change month, Home and End move within the week, and Enter selects. Escape closes the calendar and returns focus to the trigger.
- **A11Y-2** The calendar trigger and clear button are icon-only and are named by `triggerLabel` and `clearLabel`.
- **A11Y-3** Helper and error text are linked to each input with `aria-describedby`. `error` MUST say what to fix.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers MAY pass one; it is forwarded to the root.

## Known gaps

- **GAP-1** Violates IN-6. In range mode the second input's placeholder is hard-coded to "End date" (`date-picker.svelte`), and `placeholder` only sets the first input, so the end placeholder cannot be translated.

## Decisions

- **DEC-1** Open. Decide whether range mode takes a pair of placeholders, or a separate `endPlaceholder` prop, to fix GAP-1.
- **DEC-2** Open. Decide whether DatePicker should submit ISO dates through hidden inputs, like DateInput, instead of the formatted text in its visible inputs.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
