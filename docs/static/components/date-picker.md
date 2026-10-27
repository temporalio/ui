# Date Picker

Choose a date or a date range from a calendar, or type it directly.

## Anatomy

A date picker is a text input with a calendar in a popover. The calendar is shown inline here.

- **Root** `[data-scope="date-picker"][data-part="root"]`: Groups the label, control, messages, and calendar.
  - **Label** `[data-scope="date-picker"][data-part="label"]` (left): Names the date picker. Includes the required indicator.
  - **Input** `[data-scope="date-picker"][data-part="input"]` (top): The text input for typing a date. Range mode shows two.
  - **Trigger** `[data-scope="date-picker"][data-part="trigger"]` (right): The calendar button that opens the popover.
  - **Content** `[data-scope="date-picker"][data-part="content"]` (left): The calendar panel.
  - **View control** `[data-scope="date-picker"][data-part="view-control"]` (right): Previous and next buttons around the month and year.
  - **Table cell trigger** `[data-scope="date-picker"][data-part="table-cell-trigger"][data-selected]` (right): A day. The selected day is filled.

## Examples

Use a single date to schedule work, and a range to filter workflow executions by
start time. Limit the selectable dates with `min`, `max`, or `isDateUnavailable`.

## Usage

### Import

```svelte
<script lang="ts">
  import { DatePicker, type DateValue } from '$lib/io-poc/date-picker';
  let value = $state<DateValue[]>([]);
</script>

<DatePicker label="Start date" bind:value />
```

Package consumers can import from `@temporalio/ui/io-poc/date-picker`.

### Value

`value` is always an array of `DateValue` from `@internationalized/date`. It holds
one date in single mode and a start and end date in range mode. An empty array
means nothing is selected. Use `parseDate` to create dates from ISO strings or
`Date` objects.

```svelte
<script lang="ts">
  import { DatePicker, parseDate } from '$lib/io-poc/date-picker';
  let value = $state([parseDate('2026-10-01'), parseDate('2026-10-27')]);
</script>

<DatePicker label="Started between" selectionMode="range" bind:value />
```

### Ranges

Set `selectionMode` to `range` to show start and end inputs. Pick the first date,
then the second; the calendar highlights the dates in between.

### Limits

`min` and `max` disable dates outside the allowed range. Use `isDateUnavailable`
for individual dates, such as weekends or maintenance windows. Explain any limit in
`helperText` so people know why a date cannot be chosen.

### Labels and messages

Every date picker needs a visible `label`. `helperText` and `error` are linked to
the inputs for assistive technologies. A non-empty `error` marks the picker as
invalid. Provide translated `triggerLabel`, `clearLabel`, and `todayLabel` text
when the interface is localized.

### Keyboard interaction

Type a date in the input and press Enter, or use the calendar button to open the
calendar. In the calendar, arrow keys move by day and week, Page Up and Page Down
move by month, Home and End move to the start and end of the week, and Enter
selects. Escape closes the calendar and returns focus to the trigger.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/date-picker/date-picker.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

DatePicker forwards native div attributes and event handlers to its wrapper. The
calendar renders in a portal so it can overflow scrolling containers.

### DatePicker

| Prop                | Type                                           | Default         | Description                                                                                         |
| ------------------- | ---------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| `label`             | `string`                                       | `Required`      | The visible label for the picker.                                                                   |
| `value`             | `DateValue[] (bindable)`                       | `[]`            | The selected date, or start and end dates in range mode.                                            |
| `open`              | `boolean (bindable)`                           | `false`         | Whether the calendar is open.                                                                       |
| `selectionMode`     | `single \| range`                              | `single`        | Choose one date or a date range.                                                                    |
| `min`               | `DateValue`                                    | `—`             | The earliest selectable date.                                                                       |
| `max`               | `DateValue`                                    | `—`             | The latest selectable date.                                                                         |
| `isDateUnavailable` | `(date: DateValue, locale: string) => boolean` | `—`             | Marks individual dates as unavailable.                                                              |
| `locale`            | `string`                                       | `en-US`         | Controls formatting, parsing, and the first day of the week.                                        |
| `timeZone`          | `string`                                       | `—`             | The time zone used to determine today.                                                              |
| `placeholder`       | `string`                                       | `Select a date` | Placeholder for the first input.                                                                    |
| `closeOnSelect`     | `boolean`                                      | `true`          | Closes the calendar once a date or range is chosen.                                                 |
| `inline`            | `boolean`                                      | `false`         | Shows the calendar below the control at all times, without a popover.                               |
| `portalled`         | `boolean`                                      | `true`          | Renders the calendar in a portal at the end of the page. Set false to keep it inside the component. |
| `fixedWeeks`        | `boolean`                                      | `true`          | Always shows six weeks so the calendar height stays the same.                                       |
| `startOfWeek`       | `number`                                       | `Locale`        | First day of the week, from 0 (Sunday) to 6.                                                        |
| `showToday`         | `boolean`                                      | `true`          | Shows a button that selects today. Single mode only.                                                |
| `todayLabel`        | `string`                                       | `Today`         | Text for the today button.                                                                          |
| `triggerLabel`      | `string`                                       | `Open calendar` | Accessible name for the calendar button.                                                            |
| `clearLabel`        | `string`                                       | `Clear date`    | Accessible name for the clear button.                                                               |
| `labelHidden`       | `boolean`                                      | `false`         | Hides the label visually while keeping it accessible.                                               |
| `helperText`        | `string`                                       | `''`            | Guidance shown below the input.                                                                     |
| `error`             | `string`                                       | `''`            | Error message shown below the input. Marks the picker invalid.                                      |
| `invalid`           | `boolean`                                      | `—`             | Overrides the invalid state derived from `error`.                                                   |
| `required`          | `boolean`                                      | `false`         | Marks the picker as required and shows an indicator.                                                |
| `disabled`          | `boolean`                                      | `false`         | Prevents interaction.                                                                               |
| `readOnly`          | `boolean`                                      | `false`         | Shows the value without allowing changes.                                                           |
| `name`              | `string`                                       | `—`             | Name of the input submitted with a form.                                                            |
| `id`                | `string`                                       | `Generated`     | Base for the generated element IDs.                                                                 |
| `onValueChange`     | `(value: DateValue[]) => void`                 | `—`             | Called when the selection changes.                                                                  |
| `class`             | `string`                                       | `—`             | Additional Tailwind classes on the wrapper.                                                         |
