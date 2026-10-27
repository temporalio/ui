# Radio Group

Choose exactly one option from a short, visible list.

## Anatomy

A radio group lets people choose one option from a labelled set.

- **Root** `[data-scope="radio-group"][data-part="root"]`: The radio group, which holds the selected value.
  - **Label** `[data-scope="radio-group"][data-part="label"]` (top): Names the group. Includes the required indicator.
  - **Helper text** `[id$="helper-text"]` (right): Describes the choice. Linked to the group.
  - **Item control** `item-control` (left): The circle that shows whether the option is selected.
  - **Item text** `item-text` (right): The option label, with an optional description.
  - **Item** `[data-part="item"]:last-child` (left): One option, made of a control and text.

## Examples

Use a radio group when people need to compare every option before choosing. Add a
description to an option when its label alone does not explain the consequence.

## Usage

### Import

```svelte
<script lang="ts">
  import { RadioGroup } from '$lib/io-poc/radio-group';
  let policy = $state<string | null>('terminate');
</script>

<RadioGroup
  label="Workflow ID conflict policy"
  bind:value={policy}
  items={[
    { value: 'fail', label: 'Fail' },
    { value: 'terminate', label: 'Terminate existing' },
    { value: 'use-existing', label: 'Use existing' },
  ]}
/>
```

Package consumers can import from `@temporalio/ui/io-poc/radio-group`.

### Options

Pass `items` for plain options. Each option can have a `description` and can be
`disabled`. To add custom content below an option, render `RadioGroupItem`
components as children instead of, or after, `items`.

### Value

`value` is the selected option's value, or `null` when nothing is selected. Select a
sensible default when one exists so people can see the recommended choice.

### When to use

Use Radio Group for two to about six options that fit on screen. Use a Select or
Combobox for longer lists, a Switch for an on/off setting that applies immediately,
and a Checkbox when people can choose more than one option.

### Keyboard interaction

Tab moves focus into the group, to the selected option or the first option. Arrow
keys move between options and select them. Disabled options are skipped.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/radio-group/radio-group.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### RadioGroup

RadioGroup forwards native div attributes to the group.

| Prop            | Type                              | Default     | Description                                               |
| --------------- | --------------------------------- | ----------- | --------------------------------------------------------- |
| `label`         | `string`                          | `Required`  | Visible name for the group.                               |
| `labelHidden`   | `boolean`                         | `false`     | Visually hides the label while keeping it accessible.     |
| `helperText`    | `string`                          | `''`        | Supporting text below the label.                          |
| `error`         | `string`                          | `''`        | Error message. A non-empty value marks the group invalid. |
| `invalid`       | `boolean`                         | `!!error`   | Marks the group invalid without changing the message.     |
| `items`         | `RadioGroupOption[]`              | `[]`        | Options to render, in order.                              |
| `value`         | `string \| null (bindable)`       | `null`      | The selected value.                                       |
| `orientation`   | `vertical \| horizontal`          | `vertical`  | Layout and arrow-key direction.                           |
| `name`          | `string`                          | `—`         | Name used when submitting a form.                         |
| `required`      | `boolean`                         | `false`     | Shows the required indicator and requires a selection.    |
| `disabled`      | `boolean`                         | `false`     | Disables every option.                                    |
| `readOnly`      | `boolean`                         | `false`     | Prevents changes while keeping options focusable.         |
| `id`            | `string`                          | `Generated` | Base for the group's element IDs.                         |
| `onValueChange` | `(value: string \| null) => void` | `—`         | Called when the selection changes.                        |
| `children`      | `Snippet`                         | `—`         | Additional RadioGroupItem components.                     |
| `class`         | `string`                          | `—`         | Additional Tailwind classes on the group.                 |

### RadioGroupOption

| Prop          | Type      | Default    | Description                               |
| ------------- | --------- | ---------- | ----------------------------------------- |
| `value`       | `string`  | `Required` | Value stored when the option is selected. |
| `label`       | `string`  | `Required` | Visible option text.                      |
| `description` | `string`  | `—`        | Supporting text below the option.         |
| `disabled`    | `boolean` | `false`    | Prevents the option from being selected.  |

### RadioGroupItem

Accepts the RadioGroupOption props plus the following.

| Prop       | Type      | Default | Description                                |
| ---------- | --------- | ------- | ------------------------------------------ |
| `children` | `Snippet` | `—`     | Custom content below the option text.      |
| `class`    | `string`  | `—`     | Additional Tailwind classes on the option. |
