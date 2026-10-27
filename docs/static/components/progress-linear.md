# Progress Linear

Show how far a task has progressed with a horizontal bar.

## Anatomy

A linear progress shows completion as a horizontal bar, with a label and an optional value.

- **Root** `[data-scope="progress"][data-part="root"]`: The progress bar for assistive technology.
  - **Label** `label` (left): Names what is in progress.
  - **Value text** `value-text` (right): The formatted value. Hidden while the progress is indeterminate.
  - **Track** `track` (bottom): The full-width bar behind the progress.
    - **Range** `range` (bottom): The filled part of the bar.

## Examples

Use a linear progress bar for work with a known amount, such as a batch operation,
and the indeterminate state when the amount is not known yet.

## Usage

### Import

```svelte
<script lang="ts">
  import { ProgressLinear } from '$lib/io-poc/progress';
</script>

<ProgressLinear label="Terminating workflows" value={342} max={1000} />
```

Package consumers can import from `@temporalio/ui/io-poc/progress`.

### Value

Set `value` between `min` and `max`. Set `value` to `null` when progress can't be
measured; the bar animates instead and the value text is hidden. Reduced-motion
users see a static bar.

### Value text

The value shows as a percentage by default. Use `formatValue` to show counts or
units, such as "342 of 1,000 workflows". The same text is announced to screen
readers. Set `showValue` to false when the value is shown elsewhere.

### Color

Use `brand` for neutral progress. Use `success`, `warning`, or `danger` only when the
color adds meaning, such as a quota that is nearly used up, and say the same thing
in text.

### When to use

Use Progress Linear inside cards, tables, and forms where horizontal space is
available. Use Progress Circular for compact status indicators.

### Accessibility

Progress Linear renders a `progressbar` labelled by `label`. Use `labelHidden` only
when the purpose is clear from nearby content.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/progress/progress-linear.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### ProgressLinear

ProgressLinear forwards native div attributes to its root.

| Prop          | Type                                        | Default     | Description                                           |
| ------------- | ------------------------------------------- | ----------- | ----------------------------------------------------- |
| `label`       | `string`                                    | `Required`  | Visible label and accessible name.                    |
| `labelHidden` | `boolean`                                   | `false`     | Visually hides the label while keeping it accessible. |
| `value`       | `number \| null`                            | `0`         | Current value. Null shows the indeterminate state.    |
| `min`         | `number`                                    | `0`         | Minimum value.                                        |
| `max`         | `number`                                    | `100`       | Maximum value.                                        |
| `showValue`   | `boolean`                                   | `true`      | Shows the formatted value next to the label.          |
| `formatValue` | `(details: ProgressValueDetails) => string` | `Percent`   | Formats the visible and announced value.              |
| `size`        | `sm \| md`                                  | `md`        | Bar thickness.                                        |
| `colorScheme` | `brand \| success \| warning \| danger`     | `brand`     | Fill color.                                           |
| `id`          | `string`                                    | `Generated` | ID of the root.                                       |
| `class`       | `string`                                    | `—`         | Additional Tailwind classes on the root.              |

### ProgressValueDetails

| Prop      | Type             | Default    | Description                              |
| --------- | ---------------- | ---------- | ---------------------------------------- |
| `value`   | `number \| null` | `Required` | Current value.                           |
| `percent` | `number`         | `Required` | Value as a percentage between 0 and 100. |
| `min`     | `number`         | `Required` | Minimum value.                           |
| `max`     | `number`         | `Required` | Maximum value.                           |
