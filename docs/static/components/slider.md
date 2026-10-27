# Slider

Choose a value or a range by dragging along a track.

## Anatomy

A slider shows its label and value above a track with one or two thumbs.

- **Root** `[data-scope="slider"][data-part="root"]`: The wrapper that holds the slider and its messages.
  - **Label** `[data-scope="slider"][data-part="label"]` (top): Names the slider. Includes the required indicator.
  - **Value text** `value-text` (top): Shows the formatted current value or range.
  - **Track** `track` (left): The full range from minimum to maximum.
  - **Range** `range` (bottom): The filled portion between the selected values.
  - **Thumb** `[data-part="thumb"][data-index="1"]` (right): The draggable handle for one value. Range sliders have two.
  - **Marker** `marker` (bottom): One labelled value on the track.

## Examples

Use a slider when the position of a value within its range matters more than the
exact number. Add two thumbs to select a range, and marks to show common values.

## Usage

### Import

```svelte
<script lang="ts">
  import { Slider } from '$lib/io-poc/slider';
  let retention = $state([30]);
</script>

<Slider
  label="History retention"
  bind:value={retention}
  min={1}
  max={90}
  formatValue={(days) => `${days} days`}
/>
```

Package consumers can import from `@temporalio/ui/io-poc/slider`.

### Value and ranges

`value` is always an array. Pass one number for a single thumb, or two numbers to
select a range. Use `minStepsBetweenThumbs` to keep range thumbs apart.

### Labels and formatting

`formatValue` formats the visible value, the marks, and the value announced by
screen readers. When a range has two thumbs, pass `thumbLabels` such as
`['Minimum latency', 'Maximum latency']` so each thumb has a distinct name.

### Marks

Use `marks` for a few meaningful reference points, such as plan limits. Avoid a mark
for every step.

### When to use

Use Slider for approximate values in a bounded range. Use Number Input when people
need to type an exact value or the range is very large.

### Keyboard interaction

Tab moves between thumbs. Arrow keys change the value by `step`. Page Up and Page
Down change it by a larger step. Home and End jump to the minimum and maximum.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/slider/slider.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Slider

Slider forwards native div attributes to its root.

| Prop                    | Type                        | Default      | Description                                                |
| ----------------------- | --------------------------- | ------------ | ---------------------------------------------------------- |
| `label`                 | `string`                    | `Required`   | Visible label for the slider.                              |
| `labelHidden`           | `boolean`                   | `false`      | Visually hides the label while keeping it accessible.      |
| `helperText`            | `string`                    | `''`         | Supporting text below the label.                           |
| `error`                 | `string`                    | `''`         | Error message. A non-empty value marks the slider invalid. |
| `invalid`               | `boolean`                   | `!!error`    | Marks the slider invalid without changing the message.     |
| `value`                 | `number[] (bindable)`       | `[0]`        | One value per thumb.                                       |
| `min`                   | `number`                    | `0`          | Lowest value.                                              |
| `max`                   | `number`                    | `100`        | Highest value.                                             |
| `step`                  | `number`                    | `1`          | Amount each arrow press changes the value.                 |
| `minStepsBetweenThumbs` | `number`                    | `0`          | Minimum steps between range thumbs.                        |
| `orientation`           | `horizontal \| vertical`    | `horizontal` | Track direction.                                           |
| `marks`                 | `SliderMark[]`              | `[]`         | Reference points shown below the track.                    |
| `showValue`             | `boolean`                   | `true`       | Shows the formatted value next to the label.               |
| `formatValue`           | `(value: number) => string` | `String`     | Formats displayed and announced values.                    |
| `thumbLabels`           | `string[]`                  | `[]`         | Accessible names for each thumb in a range.                |
| `required`              | `boolean`                   | `false`      | Shows the required indicator.                              |
| `disabled`              | `boolean`                   | `false`      | Disables the slider.                                       |
| `readOnly`              | `boolean`                   | `false`      | Prevents changes while keeping thumbs focusable.           |
| `id`                    | `string`                    | `Generated`  | Base for the slider's element IDs.                         |
| `name`                  | `string`                    | `—`          | Name used when submitting a form.                          |
| `onValueChange`         | `(value: number[]) => void` | `—`          | Called while the value changes.                            |
| `onValueChangeEnd`      | `(value: number[]) => void` | `—`          | Called when dragging or a key press ends.                  |
| `class`                 | `string`                    | `—`          | Additional Tailwind classes on the root.                   |

### SliderMark

| Prop    | Type     | Default              | Description              |
| ------- | -------- | -------------------- | ------------------------ |
| `value` | `number` | `Required`           | Position of the mark.    |
| `label` | `string` | `formatValue(value)` | Text shown for the mark. |
