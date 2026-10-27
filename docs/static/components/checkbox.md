# Checkbox

Let people turn an option on or off, or choose several options from a list.

## Anatomy

A checkbox pairs a visual box with a label, backed by a native input.

- **Root** `[data-scope="checkbox"][data-part="root"]`: The label element that makes the whole row clickable.
  - **Control** `control` (left): The visual box. Shows a check or dash when selected.
  - **Label** `label` (bottom): The text that names the option, with the required indicator.

## Examples

Use a single checkbox for an independent setting. Use CheckboxGroup when several
related options share a label, and show the indeterminate state on a parent checkbox
that controls a partially selected list.

## Usage

### Import

```svelte
<script lang="ts">
  import { Checkbox, CheckboxGroup } from '$lib/io-ark/checkbox';
  let archived = $state(false);
  let statuses = $state(['running']);
</script>

<Checkbox label="Show archived workflows" bind:checked={archived} />

<CheckboxGroup label="Execution status" bind:value={statuses}>
  <Checkbox label="Running" value="running" />
  <Checkbox label="Completed" value="completed" />
  <Checkbox label="Failed" value="failed" />
</CheckboxGroup>
```

Package consumers can import from `@temporalio/ui/io-ark/checkbox`.

### Labels

Every checkbox needs a `label`. Write it as the option it turns on, such as "Retry
failed activities", not as a question. Use `labelHidden` only when nearby text already
names the option visually, such as a checkbox in a table row; the label stays
available to assistive technology.

### Checked and indeterminate states

Use `bind:checked` for a standalone checkbox. Set `indeterminate` on a parent
checkbox when only some of its children are selected. The indeterminate state is
controlled by you: derive it from the child selection rather than toggling it in
response to clicks.

### Groups

Wrap related checkboxes in CheckboxGroup and give each checkbox a unique `value`.
The group owns the selection through `bind:value`, so do not bind `checked` on the
children. The group label names the set, and its `disabled`, `readOnly`, and
`invalid` states apply to every checkbox inside it. Use `orientation="horizontal"`
for two or three short options.

### Helper and error text

Use `helperText` to explain the consequence of an option. Set `error` to show a
validation message; a non-empty error marks the checkbox or group as invalid. Both
messages are announced with the checkbox through `aria-describedby`.

### Keyboard interaction

Tab moves focus to each checkbox. Space toggles the focused checkbox. Disabled
checkboxes are skipped. Read-only checkboxes can be focused but not changed.

### Forms

Checkbox renders a native hidden input, so `name`, `value`, `required`, and form
reset work with standard form submission. Grouped checkboxes submit one entry per
selected value under the group `name`.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/checkbox/checkbox.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

Checkbox forwards native label attributes and event handlers to its root label.

### Checkbox

| Prop              | Type                         | Default     | Description                                                                 |
| ----------------- | ---------------------------- | ----------- | --------------------------------------------------------------------------- |
| `label`           | `string`                     | `Required`  | The visible label and accessible name.                                      |
| `labelHidden`     | `boolean`                    | `false`     | Visually hides the label while keeping it accessible.                       |
| `checked`         | `boolean (bindable)`         | `false`     | Whether a standalone checkbox is checked. Grouped checkboxes use the group. |
| `indeterminate`   | `boolean`                    | `false`     | Shows a mixed state, typically for a partially selected parent.             |
| `value`           | `string`                     | `—`         | Submitted value; required inside CheckboxGroup.                             |
| `name`            | `string`                     | `—`         | Name of the native hidden input.                                            |
| `helperText`      | `string`                     | `''`        | Supporting text below the label.                                            |
| `error`           | `string`                     | `''`        | Validation message. A non-empty error marks the checkbox invalid.           |
| `invalid`         | `boolean`                    | `—`         | Overrides the invalid state derived from `error`.                           |
| `disabled`        | `boolean`                    | `false`     | Prevents interaction and removes the checkbox from the tab order.           |
| `required`        | `boolean`                    | `false`     | Marks the input as required and shows an indicator.                         |
| `readOnly`        | `boolean`                    | `false`     | Keeps the checkbox focusable but prevents changes.                          |
| `onCheckedChange` | `(checked: boolean) => void` | `—`         | Called after a user changes the checked state.                              |
| `id`              | `string`                     | `Generated` | ID of the native hidden input.                                              |
| `class`           | `string`                     | `—`         | Additional Tailwind classes on the outer wrapper.                           |

### CheckboxGroup

CheckboxGroup forwards native div attributes and event handlers to the element that
wraps the checkboxes.

| Prop                | Type                        | Default     | Description                                                         |
| ------------------- | --------------------------- | ----------- | ------------------------------------------------------------------- |
| `label`             | `string`                    | `Required`  | Visible heading and accessible name for the group.                  |
| `labelHidden`       | `boolean`                   | `false`     | Visually hides the group label while keeping it accessible.         |
| `value`             | `string[] (bindable)`       | `[]`        | Values of the checked checkboxes.                                   |
| `orientation`       | `vertical \| horizontal`    | `vertical`  | Stacks the checkboxes or places them in a wrapping row.             |
| `name`              | `string`                    | `—`         | Name submitted for every checked checkbox.                          |
| `helperText`        | `string`                    | `''`        | Supporting text below the group label.                              |
| `error`             | `string`                    | `''`        | Validation message. A non-empty error marks every checkbox invalid. |
| `invalid`           | `boolean`                   | `—`         | Overrides the invalid state derived from `error`.                   |
| `disabled`          | `boolean`                   | `false`     | Disables every checkbox in the group.                               |
| `readOnly`          | `boolean`                   | `false`     | Prevents changes to every checkbox in the group.                    |
| `required`          | `boolean`                   | `false`     | Shows a required indicator and sets `aria-required` on the group.   |
| `maxSelectedValues` | `number`                    | `—`         | Prevents selecting more than this many options.                     |
| `onValueChange`     | `(value: string[]) => void` | `—`         | Called after a user changes the selection.                          |
| `children`          | `Snippet`                   | `—`         | Checkbox components with unique `value` props.                      |
| `id`                | `string`                    | `Generated` | Base for the group, label, helper, and error IDs.                   |
| `class`             | `string`                    | `—`         | Additional Tailwind classes on the outer wrapper.                   |
