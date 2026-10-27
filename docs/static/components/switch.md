# Switch

Turn a setting on or off with an immediate effect.

## Anatomy

A switch pairs a sliding control with its label.

- **Root**: The wrapper that holds the switch and its messages.
  - **Control** `control` (left): The track that changes color when on.
  - **Thumb** `thumb` (top): The knob that slides between off and on.
  - **Label** `[data-scope="switch"][data-part="label"]` (right): Names the setting. Includes the required indicator.
  - **Helper text** `[id$="helper-text"]` (bottom): Describes the effect of the setting. Linked to the input.

## Examples

Use a switch for settings that apply as soon as they change, such as pausing a
schedule or showing a panel. Describe the effect in helper text when it is not
obvious from the label.

## Usage

### Import

```svelte
<script lang="ts">
  import { Switch } from '$lib/io-poc/switch';
  let paused = $state(false);
</script>

<Switch label="Pause schedule" bind:checked={paused} />
```

Package consumers can import from `@temporalio/ui/io-poc/switch`.

### Switch or Checkbox

Use a switch when the change takes effect immediately, like a light switch. Use a
Checkbox when the choice is submitted later with a form, when people can choose
several options, or when they need to confirm something.

### Labels

Write the label as the setting it controls, such as "Pause schedule", not as an
instruction. Avoid changing the label text when the state changes; the switch
itself shows the state.

### Sizes

Use `md` by default. Use `sm` in dense layouts such as table rows and toolbars.

### Keyboard interaction

Tab moves focus to the switch. Space toggles it. Disabled switches are skipped.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/switch/switch.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Switch

Switch forwards remaining native label attributes to its root label.

| Prop              | Type                         | Default     | Description                                                    |
| ----------------- | ---------------------------- | ----------- | -------------------------------------------------------------- |
| `label`           | `string`                     | `Required`  | Visible name for the setting.                                  |
| `labelHidden`     | `boolean`                    | `false`     | Visually hides the label while keeping it accessible.          |
| `helperText`      | `string`                     | `''`        | Supporting text below the switch.                              |
| `error`           | `string`                     | `''`        | Error message. A non-empty value marks the switch invalid.     |
| `invalid`         | `boolean`                    | `!!error`   | Marks the switch invalid without changing the message.         |
| `checked`         | `boolean (bindable)`         | `false`     | Whether the switch is on.                                      |
| `size`            | `sm \| md`                   | `md`        | Switch size.                                                   |
| `disabled`        | `boolean`                    | `false`     | Disables the switch.                                           |
| `required`        | `boolean`                    | `false`     | Shows the required indicator and requires the switch to be on. |
| `readOnly`        | `boolean`                    | `false`     | Prevents changes while keeping the switch focusable.           |
| `name`            | `string`                     | `—`         | Name used when submitting a form.                              |
| `value`           | `string`                     | `on`        | Value submitted when the switch is on.                         |
| `id`              | `string`                     | `Generated` | ID applied to the hidden input.                                |
| `onCheckedChange` | `(checked: boolean) => void` | `—`         | Called when the user changes the switch.                       |
| `class`           | `string`                     | `—`         | Additional Tailwind classes on the wrapper.                    |
