# Number Input

Enter a number by typing or by stepping up and down within a range.

## Anatomy

A number input is a field with buttons that step the value up and down.

- **Root** `[data-scope="field"][data-part="root"]`: The field wrapper with the label, control, and messages.
  - **Label** `[data-scope="field"][data-part="label"]` (top): Names the input. Includes the required indicator.
  - **Control** `[data-scope="number-input"][data-part="control"]` (left): The bordered box around the input and buttons.
  - **Increment trigger** `increment-trigger` (right): Increases the value by one step.
  - **Decrement trigger** `decrement-trigger` (right): Decreases the value by one step.
  - **Helper text** `[data-scope="field"][data-part="helper-text"]` (bottom): Describes the expected value. Linked to the input.

## Examples

Use a number input for counts, limits, and durations where people often adjust a
value by small amounts. Add a unit when the number alone is ambiguous.

## Usage

### Import

```svelte
<script lang="ts">
  import { NumberInput } from '$lib/io-poc/number-input';
  let attempts = $state('5');
</script>

<NumberInput
  label="Maximum attempts"
  helperText="Use 0 for unlimited attempts."
  bind:value={attempts}
  min={0}
  max={100}
/>
```

Package consumers can import from `@temporalio/ui/io-poc/number-input`.

### Value

`value` is a string so it can hold partial input such as an empty field or a
trailing decimal point. Use `onValueChange` to read `valueAsNumber`, which is `NaN`
when the field is empty.

### Range and step

Set `min` and `max` to limit the value. By default the value is clamped to the range
when the input loses focus. `step` controls the amount each arrow press or stepper
click adds or removes.

### Units and formatting

Use `unit` for a short suffix such as `s` or `ms`. Use `formatOptions` for
locale-aware formatting such as percentages or grouping separators.

### When to use

Use Number Input when the exact value matters and the range is large or open-ended.
Use a Slider when an approximate value within a small range is enough and seeing the
position helps.

### Keyboard interaction

Arrow Up and Arrow Down change the value by `step`. Hold Shift for a larger step.
Home and End jump to `min` and `max`. The stepper buttons are
hidden from the tab order because the keyboard offers the same actions.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/number-input/number-input.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### NumberInput

NumberInput forwards native div attributes to its field wrapper.

| Prop               | Type                                                          | Default            | Description                                                       |
| ------------------ | ------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------- |
| `label`            | `string`                                                      | `Required`         | Visible label for the input.                                      |
| `labelHidden`      | `boolean`                                                     | `false`            | Visually hides the label while keeping it accessible.             |
| `helperText`       | `string`                                                      | `''`               | Supporting text below the input.                                  |
| `error`            | `string`                                                      | `''`               | Error message. A non-empty value marks the input invalid.         |
| `invalid`          | `boolean`                                                     | `!!error`          | Marks the input invalid without changing the message.             |
| `value`            | `string (bindable)`                                           | `''`               | The current value as typed.                                       |
| `min`              | `number`                                                      | `MIN_SAFE_INTEGER` | Lowest allowed value.                                             |
| `max`              | `number`                                                      | `MAX_SAFE_INTEGER` | Highest allowed value.                                            |
| `step`             | `number`                                                      | `1`                | Amount added or removed by the arrows and steppers.               |
| `unit`             | `string`                                                      | `''`               | Short suffix shown inside the input.                              |
| `placeholder`      | `string`                                                      | `—`                | Placeholder text when the input is empty.                         |
| `formatOptions`    | `Intl.NumberFormatOptions`                                    | `—`                | Locale-aware display formatting.                                  |
| `allowMouseWheel`  | `boolean`                                                     | `false`            | Changes the value with the mouse wheel while focused.             |
| `clampValueOnBlur` | `boolean`                                                     | `true`             | Clamps the value to the range when the input loses focus.         |
| `required`         | `boolean`                                                     | `false`            | Shows the required indicator and requires a value.                |
| `disabled`         | `boolean`                                                     | `false`            | Disables the input and steppers.                                  |
| `readOnly`         | `boolean`                                                     | `false`            | Prevents changes while keeping the value focusable and submitted. |
| `id`               | `string`                                                      | `Generated`        | ID applied to the input. The label targets it.                    |
| `name`             | `string`                                                      | `—`                | Name used when submitting a form.                                 |
| `incrementLabel`   | `string`                                                      | `Increase value`   | Accessible label for the increment button.                        |
| `decrementLabel`   | `string`                                                      | `Decrease value`   | Accessible label for the decrement button.                        |
| `onValueChange`    | `(details: { value: string; valueAsNumber: number }) => void` | `—`                | Called when the value changes.                                    |
| `class`            | `string`                                                      | `—`                | Additional Tailwind classes on the field wrapper.                 |
