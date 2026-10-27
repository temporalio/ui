# Combobox

Search a list of options and select one or more of them.

## Anatomy

A combobox is a text input inside a field, with a filtered list in a popover.

- **Root** `[data-scope="field"][data-part="root"]`: The field that groups the label, control, and messages.
  - **Label** `[data-scope="field"][data-part="label"]` (left): Names the combobox. Includes the required indicator.
  - **Input** `[data-scope="combobox"][data-part="input"]` (top): The text input people type into to filter options.
  - **Trigger** `[data-scope="combobox"][data-part="trigger"]` (right): The chevron button that opens and closes the list.
  - **Content** `[data-scope="combobox"][data-part="content"]` (left): The popover panel that holds the options.
  - **Item** `[data-scope="combobox"][data-part="item"]:not([data-state="checked"])` (right): One option in the list.
  - **Item indicator** `[data-scope="combobox"][data-part="item-indicator"][data-state="checked"]` (right): The check mark on selected options.

## Examples

Use a combobox to choose a namespace, select several task queues, or show disabled
and invalid states. Type to filter the options.

## Usage

### Import

```svelte
<script lang="ts">
  import { Combobox } from '$lib/io-ark/combobox';
  let value = $state<string[]>([]);
</script>

<Combobox
  label="Namespace"
  items={['default', 'orders-production', 'orders-staging']}
  bind:value
  placeholder="Search namespaces"
/>
```

Package consumers can import from `@temporalio/ui/io-ark/combobox`.

### When to use

Use Combobox when a list is long enough that people benefit from typing to find an
option. For a short list of choices, use radio buttons or checkboxes so every option
stays visible.

### Items

Pass `items` as strings, or as objects with `label`, `value`, and an optional
`disabled` flag. The label is displayed and searched. The value is stored.

```svelte
<Combobox
  label="Namespace"
  items={[
    { label: 'Orders (production)', value: 'orders-production' },
    { label: 'Archived', value: 'archived-2023', disabled: true },
  ]}
  bind:value
/>
```

### Value

`value` is always an array of selected values, even when only one option can be
selected. Read the single selection with `value[0]`. Set `multiple` to let people
select more than one option. Selected options appear as removable tags.

### Filtering

Options are filtered as people type, ignoring case and accents. Opening the list
again shows every option. Set `allowCustomValue` to keep text that does not match
an option. Use `emptyText` to describe what is missing when nothing matches.

### Labels, help, and errors

Every combobox needs a `label`. Use `labelHidden` only when a visible heading
already describes the field. `helperText` explains the expected choice. A non-empty
`error` marks the field invalid and is announced to assistive technology.

### Keyboard interaction

Type to filter. Press Down Arrow to open the list and move through options, Up Arrow
to move back, Enter to select the highlighted option, and Escape to close the list.
Disabled options are skipped. The clear and open buttons have accessible labels;
change them with `clearLabel` and `triggerLabel`.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/combobox/combobox.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

Combobox forwards native div attributes to its field wrapper.

### Combobox

| Prop                | Type                                                          | Default              | Description                                                                                               |
| ------------------- | ------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- |
| `label`             | `string`                                                      | `Required`           | The visible label and accessible name of the input.                                                       |
| `items`             | `(ComboboxItem \| string)[]`                                  | `Required`           | Options to search and select.                                                                             |
| `value`             | `string[] (bindable)`                                         | `[]`                 | Selected values.                                                                                          |
| `inputValue`        | `string (bindable)`                                           | `''`                 | Text in the input.                                                                                        |
| `open`              | `boolean (bindable)`                                          | `false`              | Whether the list of options is open.                                                                      |
| `multiple`          | `boolean`                                                     | `false`              | Allows more than one selected value.                                                                      |
| `placeholder`       | `string`                                                      | `—`                  | Placeholder text in the input.                                                                            |
| `helperText`        | `string`                                                      | `''`                 | Supporting text below the input.                                                                          |
| `error`             | `string`                                                      | `''`                 | Error message below the input. A non-empty value marks the field invalid.                                 |
| `invalid`           | `boolean`                                                     | `Derived from error` | Marks the field invalid without a message.                                                                |
| `required`          | `boolean`                                                     | `false`              | Shows a required indicator and marks the input required.                                                  |
| `disabled`          | `boolean`                                                     | `false`              | Prevents interaction.                                                                                     |
| `readOnly`          | `boolean`                                                     | `false`              | Shows the value without allowing changes.                                                                 |
| `labelHidden`       | `boolean`                                                     | `false`              | Visually hides the label while keeping it accessible.                                                     |
| `allowCustomValue`  | `boolean`                                                     | `false`              | Keeps typed text that does not match an option.                                                           |
| `clearable`         | `boolean`                                                     | `true`               | Shows a clear button when a value is selected.                                                            |
| `openOnClick`       | `boolean`                                                     | `true`               | Opens the list when the input is clicked.                                                                 |
| `emptyText`         | `string`                                                      | `'No results'`       | Text shown when no option matches.                                                                        |
| `clearLabel`        | `string`                                                      | `'Clear selection'`  | Accessible label for the clear button.                                                                    |
| `triggerLabel`      | `string`                                                      | `'Show options'`     | Accessible label for the open button.                                                                     |
| `portalled`         | `boolean`                                                     | `true`               | Renders the list in a portal at the end of the page. Set false to keep it inside the component.           |
| `onInteractOutside` | `(event: ComboboxInteractOutsideEvent) => void`               | `—`                  | Called on a pointer or focus interaction outside the list. Call `event.preventDefault()` to keep it open. |
| `onValueChange`     | `(details: ComboboxValueChangeDetails<ComboboxItem>) => void` | `—`                  | Called when a person changes the selection.                                                               |
| `id`                | `string`                                                      | `Generated`          | ID of the input.                                                                                          |
| `name`              | `string`                                                      | `—`                  | Name used when the form is submitted.                                                                     |
| `class`             | `string`                                                      | `—`                  | Additional Tailwind classes on the field wrapper.                                                         |

### ComboboxItem

| Prop       | Type      | Default    | Description                              |
| ---------- | --------- | ---------- | ---------------------------------------- |
| `label`    | `string`  | `Required` | Text that is displayed and searched.     |
| `value`    | `string`  | `Required` | Value stored when selected.              |
| `disabled` | `boolean` | `false`    | Prevents the option from being selected. |
