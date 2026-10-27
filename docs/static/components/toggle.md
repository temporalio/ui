# Toggle

Turn a single option on or off with a button that stays pressed.

## Anatomy

A toggle is a single button that stays pressed until it is pressed again.

- **Root** `[data-scope="toggle"][data-part="root"]`: The button that switches between pressed and not pressed.
  - **Icon** `[data-scope="toggle"][data-part="root"] svg` (left): An optional icon. It can change while pressed.
  - **Label** `[data-scope="toggle"][data-part="root"] > span` (right): The visible text, or custom content from the children snippet.

## Examples

Use a toggle for a view preference that applies immediately, such as live updates
or pinning an item. Icon-only toggles need an accessible name.

## Usage

### Import

```svelte
<script lang="ts">
  import { Toggle } from '$lib/io-ark/toggle';
  let liveUpdates = $state(true);
</script>

<Toggle label="Live updates" bind:pressed={liveUpdates} />
```

Package consumers can import from `@temporalio/ui/io-ark/toggle`.

### When to use

Use Toggle for an on/off state that changes what people see right away and that
belongs with other toolbar actions. Use Checkbox for settings that are submitted
with a form, and Toggle Group when several related options sit together.

### Labels and icons

Keep the label the same in both states and let the pressed style show the state.
For icon-only toggles, pass an `aria-label` that names the option, such as
"Pin workflow". Use `PressedIcon` when a filled icon better shows the on state.

### Keyboard interaction

Toggle is a native button. Tab to focus it and press Enter or Space to change its
state. Screen readers announce it as a toggle button with its pressed state.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/toggle/toggle.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Toggle

Toggle forwards native button attributes such as `aria-label`, `title`, and event
handlers.

| Prop              | Type                         | Default | Description                                                     |
| ----------------- | ---------------------------- | ------- | --------------------------------------------------------------- |
| `pressed`         | `boolean (bindable)`         | `false` | Whether the toggle is on.                                       |
| `label`           | `string`                     | `''`    | Visible text. Omit it for icon-only toggles and set aria-label. |
| `Icon`            | `IconComponent`              | `—`     | Icon shown before the label.                                    |
| `PressedIcon`     | `IconComponent`              | `—`     | Icon shown instead of Icon while pressed.                       |
| `size`            | `sm \| md`                   | `md`    | Height and text size.                                           |
| `disabled`        | `boolean`                    | `false` | Prevents changes.                                               |
| `onPressedChange` | `(pressed: boolean) => void` | `—`     | Called after a person changes the state.                        |
| `children`        | `Snippet<[boolean]>`         | `—`     | Custom content. Receives the pressed state.                     |
| `id`              | `string`                     | `—`     | ID applied to the button.                                       |
| `class`           | `string`                     | `—`     | Additional Tailwind classes on the button.                      |
