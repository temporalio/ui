---
component: DateInput
source: ./date-input.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Date Input contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `DateInputProps`: that `label` is required; that `value` is a single bindable `DateValue`; the four `granularity` values and the `hourCycle` values; the defaults for `granularity` and `locale`; that other div attributes are forwarded.

## Input

- **IN-1** `label` MUST name the date, even when `labelHidden` is set.
- **IN-2** Use DateInput when people already know the date and type it, such as a cutoff for history. When people need to see a calendar or pick a range, use DatePicker.
- **IN-3** `value` MUST match `granularity`: a `CalendarDate` for `day`, and a `CalendarDateTime` or `ZonedDateTime` for `hour`, `minute` and `second`. Create values with `parseDate` and the `@ark-ui/svelte/date-picker` helpers re-exported from `$lib/io-poc/date-input`.
- **IN-4** `locale` SHOULD come from the app's locale setting. The default is `en-US`. **Needs decision: DEC-1.**
- **IN-5** `min` and `max` MUST use the same calendar type as `value`.
- **IN-6** DateInput reads Fieldset context, so a disabled Fieldset disables it. It does not read Field context: it MUST NOT be wrapped in Field, because it renders its own label and messages.
- **IN-7** `class` is merged onto the root. It MUST NOT restyle the control border or the segments.

## Behavior

- **BEH-1** `value` stays `undefined` until every segment is filled, and becomes `undefined` again when a segment is cleared. `onValueChange` receives the same value.
- **BEH-2** The segments, their order and separators follow `locale` and `granularity`. `hourCycle` overrides the locale's 12 or 24 hour clock.
- **BEH-3** A hidden native input carries the value for form submission under `name`.

## Display

- **DIS-1** The control uses the shared field control styles. Empty segments show placeholder text in `text-tertiary`. The focused segment gets a background highlight.
- **DIS-2** An invalid date input shows a `danger` border and the `error` text.

## Accessibility

- **A11Y-1** Each segment is a `spinbutton`. Arrow Up and Down change the value, Left and Right move between segments, and typing digits fills the segment and advances.
- **A11Y-2** Helper and error text are linked to the segment group with `aria-describedby`, and the group gets `aria-invalid`. Error text is announced politely.
- **A11Y-3** `error` MUST say what to fix, such as the allowed range when `min` or `max` is set.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers MAY pass one; it is forwarded to the root.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. `locale` defaults to `en-US` in both DateInput and DatePicker. Decide whether both should read the app's locale (Ark `LocaleProvider`) by default.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Fixed GAP-1. DateInput now reads Fieldset context and is disabled by a disabled Fieldset; IN-6 updated. Covered by `date-input.svelte.test.ts`.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
