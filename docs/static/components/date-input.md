# Date Input

Type a date, or a date and time, one segment at a time.

## Anatomy

A date input is a row of editable date segments with a label and messages.

- **Root** `[data-scope="date-input"][data-part="root"]`: Connects the label, segments, and hidden input.
  - **Label** `[data-scope="date-input"][data-part="label"]` (top): Names the date, with the required indicator.
  - **Segment** `segment` (left): One editable part such as month, day, year, or hour.
  - **Control** `[data-scope="date-input"][data-part="control"]` (right): The bordered input box around the segment group.
  - **Helper text** `[id$="helper-text"]` (bottom): Describes the expected date. Linked to the segments.

## Examples

Use segments for dates that people already know, such as a cutoff for workflow
history or a scheduled start time. Add time segments with `granularity`.

## Usage

### Import

```svelte
<script lang="ts">
  import { DateInput, type DateValue } from '$lib/io-poc/date-input';
  let value = $state<DateValue | undefined>();
</script>

<DateInput label="Started after" bind:value />
```

Package consumers can import from `@temporalio/ui/io-poc/date-input`.

### Value

`value` is a single `DateValue` from `@internationalized/date`, or `undefined` while
the date is incomplete. Use `parseDate` to create one from an ISO string or a
`Date`. It is exported from `$lib/io-poc/date-input`.

```svelte
<script lang="ts">
  import { DateInput, parseDate } from '$lib/io-poc/date-input';
  let value = $state(parseDate('2026-10-27'));
</script>

<DateInput label="Retention cutoff" bind:value />
```

### Date and time

Set `granularity` to `hour`, `minute`, or `second` to add time segments. Pass a
`DateValue` that includes a time, and use `hourCycle` to choose 12- or 24-hour
time.

### Limits

Use `min` and `max` to mark dates outside a range as invalid. Validate the value
before submitting, and explain the limit in `helperText` or `error`.

### Labels and messages

Every date input needs a visible `label`. Set `labelHidden` only when nearby text
already names the input. `helperText` and `error` are linked to the segments for
assistive technologies. A non-empty `error` marks the input as invalid.

### Keyboard interaction

Tab moves between segments. Type digits to fill a segment; focus moves to the next
segment when it is complete. Arrow Up and Arrow Down change the focused segment,
Arrow Left and Arrow Right move between segments, and Backspace clears it.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/date-input/date-input.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

DateInput forwards native div attributes and event handlers to its wrapper.

### DateInput

| Prop            | Type                                      | Default     | Description                                                   |
| --------------- | ----------------------------------------- | ----------- | ------------------------------------------------------------- |
| `label`         | `string`                                  | `Required`  | The visible label for the input.                              |
| `value`         | `DateValue \| undefined (bindable)`       | `undefined` | The entered date. It is undefined until every segment is set. |
| `granularity`   | `day \| hour \| minute \| second`         | `day`       | The smallest segment shown.                                   |
| `locale`        | `string`                                  | `en-US`     | Controls segment order, separators, and formatting.           |
| `timeZone`      | `string`                                  | `—`         | The time zone used for date values with time.                 |
| `min`           | `DateValue`                               | `—`         | The earliest valid date.                                      |
| `max`           | `DateValue`                               | `—`         | The latest valid date.                                        |
| `hourCycle`     | `12 \| 24`                                | `Locale`    | Whether time segments use 12- or 24-hour time.                |
| `labelHidden`   | `boolean`                                 | `false`     | Hides the label visually while keeping it accessible.         |
| `helperText`    | `string`                                  | `''`        | Guidance shown below the input.                               |
| `error`         | `string`                                  | `''`        | Error message shown below the input. Marks the input invalid. |
| `invalid`       | `boolean`                                 | `—`         | Overrides the invalid state derived from `error`.             |
| `required`      | `boolean`                                 | `false`     | Marks the input as required and shows an indicator.           |
| `disabled`      | `boolean`                                 | `false`     | Prevents interaction. A disabled Fieldset also disables it.   |
| `readOnly`      | `boolean`                                 | `false`     | Shows the value without allowing changes.                     |
| `name`          | `string`                                  | `—`         | Name of the hidden input submitted with a form.               |
| `id`            | `string`                                  | `Generated` | Base for the generated element IDs.                           |
| `onValueChange` | `(value: DateValue \| undefined) => void` | `—`         | Called when the entered date changes.                         |
| `class`         | `string`                                  | `—`         | Additional Tailwind classes on the wrapper.                   |
