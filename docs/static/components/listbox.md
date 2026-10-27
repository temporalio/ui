# Listbox

Show a list of options inline and let people select one or more of them.

## Anatomy

A listbox shows a labelled list of options inline, with optional filtering.

- **Root** `[data-scope="listbox"][data-part="root"]`: Groups the label, filter, list, and messages.
  - **Label** `[data-scope="listbox"][data-part="label"]` (left): Names the list.
  - **Input** `[data-scope="listbox"][data-part="input"]` (top): Filters the options when `filterable` is set.
  - **Content** `[data-scope="listbox"][data-part="content"]` (left): The bordered list that holds the options.
  - **Item** `[data-scope="listbox"][data-part="item"]:not([data-state="checked"])` (right): One option, with optional description.
  - **Item indicator** `[data-scope="listbox"][data-part="item-indicator"][data-state="checked"]` (right): The check mark on selected options.

## Examples

Use a listbox when the options should stay visible on the page, such as choosing
workers from a task queue or picking the search attributes to show as columns. Add
filtering for longer lists.

## Usage

### Import

```svelte
<script lang="ts">
  import { Listbox } from '$lib/io-poc/listbox';
  let value = $state<string[]>([]);
</script>

<Listbox
  label="Worker"
  items={['worker-orders-1', 'worker-orders-2', 'worker-orders-3']}
  bind:value
/>
```

Package consumers can import from `@temporalio/ui/io-poc/listbox`.

### When to use

Use Listbox when the options are part of the main task and people benefit from
seeing them without opening a menu. Use Select or Combobox to save space in a form.
Use checkboxes or radio buttons for a handful of options that need longer
descriptions or should be submitted with a native form.

### Items

Pass `items` as strings, or as objects with `label`, `value`, and optional
`description`, `disabled`, and `group` fields. Items that share a `group` appear
under a heading.

### Selection modes

`selectionMode` controls how many options people can select.

- `single` selects one option. Selecting another option replaces it.
- `multiple` toggles each option on click.
- `extended` selects one option on click and adds to the selection with Shift or
  Ctrl/Cmd, like a desktop file list.

`value` is always an array of selected values.

### Filtering

Set `filterable` to show a filter field above the list. Options are filtered as
people type, ignoring case and accents. The arrow keys move through the filtered
options while focus stays in the field.

### Keyboard interaction

Tab to the list, then use the arrow keys, Home, and End to move between options.
Press Enter or Space to select the highlighted option. Without a filter field, type
the first letters of an option to jump to it. Use `orientation="horizontal"` for a
row of options navigated with the left and right arrow keys.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/listbox/listbox.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

Listbox forwards native div attributes to its wrapper.

### Listbox

| Prop                | Type                                                        | Default          | Description                                              |
| ------------------- | ----------------------------------------------------------- | ---------------- | -------------------------------------------------------- |
| `items`             | `(ListboxItem \| string)[]`                                 | `Required`       | Options to choose from.                                  |
| `label`             | `string`                                                    | `Required`       | Visible label for the list.                              |
| `value`             | `string[] (bindable)`                                       | `[]`             | Selected option values.                                  |
| `selectionMode`     | `single \| multiple \| extended`                            | `single`         | How many options can be selected and how.                |
| `orientation`       | `vertical \| horizontal`                                    | `vertical`       | Layout and arrow-key direction.                          |
| `filterable`        | `boolean`                                                   | `false`          | Shows a filter field above the options.                  |
| `filterPlaceholder` | `string`                                                    | `Filter options` | Placeholder for the filter field.                        |
| `emptyText`         | `string`                                                    | `No results`     | Shown when no options match the filter.                  |
| `labelHidden`       | `boolean`                                                   | `false`          | Visually hides the label while keeping it accessible.    |
| `helperText`        | `string`                                                    | `''`             | Supporting text below the list.                          |
| `error`             | `string`                                                    | `''`             | Error message. A non-empty value marks the list invalid. |
| `invalid`           | `boolean`                                                   | `!!error`        | Marks the list invalid without changing the message.     |
| `disabled`          | `boolean`                                                   | `false`          | Prevents interaction.                                    |
| `id`                | `string`                                                    | `Generated`      | Base for the generated element IDs.                      |
| `onValueChange`     | `(details: ListboxValueChangeDetails<ListboxItem>) => void` | `—`              | Called when the selection changes.                       |
| `class`             | `string`                                                    | `—`              | Additional Tailwind classes on the wrapper.              |

### ListboxItem

| Prop          | Type      | Default    | Description                               |
| ------------- | --------- | ---------- | ----------------------------------------- |
| `label`       | `string`  | `Required` | Text displayed for the option.            |
| `value`       | `string`  | `Required` | Value stored when the option is selected. |
| `description` | `string`  | `—`        | Secondary text below the label.           |
| `disabled`    | `boolean` | `false`    | Prevents selecting the option.            |
| `group`       | `string`  | `—`        | Heading the option appears under.         |
