# Select

Choose one or more options from a short list in a dropdown.

## Anatomy

A select opens a list of options from a button-like control.

- **Root** `[data-scope="select"][data-part="root"]`: Groups the label, control, messages, and list.
  - **Label** `[data-scope="select"][data-part="label"]` (left): Names the select. Includes the required indicator.
  - **Trigger** `[data-scope="select"][data-part="trigger"]` (top): The button that shows the selected value and opens the list.
  - **Indicator** `[data-scope="select"][data-part="indicator"]` (right): The chevron that shows the list can open.
  - **Content** `[data-scope="select"][data-part="content"]` (left): The popover panel that holds the options.
  - **Item** `[data-scope="select"][data-part="item"]:not([data-state="checked"])` (right): One option in the list.
  - **Item indicator** `[data-scope="select"][data-part="item-indicator"][data-state="checked"]` (right): The check mark on selected options.

## Examples

Use a select for a short, known list such as a workflow status or a retention
period. Group related options under headings, allow several selections, or show
disabled and invalid states.

## Usage

### Import

```svelte
<script lang="ts">
  import { Select } from '$lib/io-poc/select';
  let value = $state<string[]>([]);
</script>

<Select
  label="Status"
  items={['Running', 'Completed', 'Failed']}
  bind:value
  placeholder="Any status"
/>
```

Package consumers can import from `@temporalio/ui/io-poc/select`.

### When to use

Use Select when people choose from a short list they already understand, usually
fewer than 15 options. Use Combobox when the list is long or people know what they
are looking for and benefit from typing. Use radio buttons when there are only a
few options and comparing them side by side helps.

### Items

Pass `items` as strings, or as objects with `label`, `value`, and optional
`disabled` and `group` fields. Items that share a `group` appear under a heading.

```svelte
<Select
  label="Retention period"
  items={[
    { label: '7 days', value: '7', group: 'Standard' },
    { label: '30 days', value: '30', group: 'Standard' },
    { label: '90 days', value: '90', group: 'Extended', disabled: true },
  ]}
  bind:value
/>
```

### Value

`value` is always an array of selected values, even when only one option can be
selected. Read the single selection with `value[0]`. Set `multiple` to keep the
list open while people select several options. The trigger lists the selected
labels.

Set `clearable` to show a button that removes the selection. Without it, people
can only change the selection, not remove it.

### Keyboard interaction

Tab to the trigger, then press Enter, Space, or the arrow keys to open the list.
Use the arrow keys, Home, and End to move through options, or type the first
letters of an option to jump to it. Press Enter or Space to select, and Escape to
close without changing the selection.

### Forms

Set `name` to submit the selection with a native form. A hidden select element
holds the value. `required`, `disabled`, and `readOnly` behave like their native
counterparts.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/select/select.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

Select forwards native div attributes to its wrapper.

### Select

| Prop                | Type                                                      | Default            | Description                                                                                               |
| ------------------- | --------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| `items`             | `(SelectItem \| string)[]`                                | `Required`         | Options to choose from.                                                                                   |
| `label`             | `string`                                                  | `Required`         | Visible label for the select.                                                                             |
| `value`             | `string[] (bindable)`                                     | `[]`               | Selected option values.                                                                                   |
| `open`              | `boolean (bindable)`                                      | `false`            | Whether the list is open.                                                                                 |
| `multiple`          | `boolean`                                                 | `false`            | Allows more than one selection.                                                                           |
| `placeholder`       | `string`                                                  | `Select an option` | Text shown when nothing is selected.                                                                      |
| `clearable`         | `boolean`                                                 | `false`            | Shows a button that clears the selection.                                                                 |
| `clearLabel`        | `string`                                                  | `Clear selection`  | Accessible label for the clear button.                                                                    |
| `portalled`         | `boolean`                                                 | `true`             | Renders the list in a portal at the end of the page. Set false to keep it inside the component.           |
| `onInteractOutside` | `(event: SelectInteractOutsideEvent) => void`             | `—`                | Called on a pointer or focus interaction outside the list. Call `event.preventDefault()` to keep it open. |
| `labelHidden`       | `boolean`                                                 | `false`            | Visually hides the label while keeping it accessible.                                                     |
| `helperText`        | `string`                                                  | `''`               | Supporting text below the select.                                                                         |
| `error`             | `string`                                                  | `''`               | Error message. A non-empty value marks the select invalid.                                                |
| `invalid`           | `boolean`                                                 | `!!error`          | Marks the select invalid without changing the message.                                                    |
| `required`          | `boolean`                                                 | `false`            | Shows the required indicator and requires a selection.                                                    |
| `disabled`          | `boolean`                                                 | `false`            | Prevents interaction.                                                                                     |
| `readOnly`          | `boolean`                                                 | `false`            | Shows the value but prevents changes.                                                                     |
| `name`              | `string`                                                  | `—`                | Name used when submitting a form.                                                                         |
| `id`                | `string`                                                  | `Generated`        | Base for the generated element IDs.                                                                       |
| `onValueChange`     | `(details: SelectValueChangeDetails<SelectItem>) => void` | `—`                | Called when the selection changes.                                                                        |
| `class`             | `string`                                                  | `—`                | Additional Tailwind classes on the wrapper.                                                               |

### SelectItem

| Prop       | Type      | Default    | Description                               |
| ---------- | --------- | ---------- | ----------------------------------------- |
| `label`    | `string`  | `Required` | Text displayed for the option.            |
| `value`    | `string`  | `Required` | Value stored when the option is selected. |
| `disabled` | `boolean` | `false`    | Prevents selecting the option.            |
| `group`    | `string`  | `—`        | Heading the option appears under.         |
