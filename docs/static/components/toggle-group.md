# Toggle Group

Show a set of related toggle buttons that can be pressed one at a time or together.

## Anatomy

A toggle group joins related toggle buttons into one control.

- **Root** `[data-scope="toggle-group"][data-part="root"]`: The group that tracks which items are pressed.
  - **Item** `[data-part="item"]:nth-child(3)` (bottom): One toggle button in the group.
    - **Icon** `[data-part="item"]:first-child svg` (left): An optional icon for the item.
    - **Label** `[data-part="item"]:last-child span` (right): The visible text for the item.
  - **Pressed item** `[data-part="item"][data-state="on"]` (top): An item that is on. Its value is in `value`.

## Examples

Use single selection to switch between views of the same content, and multiple
selection for independent options that belong together, such as display options.

## Usage

### Import

```svelte
<script lang="ts">
  import { ToggleGroup } from '$lib/io-ark/toggle-group';
  let view = $state(['compact']);
</script>

<ToggleGroup
  label="Event history view"
  items={[
    { value: 'compact', label: 'Compact' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'json', label: 'JSON' },
  ]}
  bind:value={view}
/>
```

Package consumers can import from `@temporalio/ui/io-ark/toggle-group`.

### Value

`value` is always an array of item values. With single selection it holds at most
one value. Single selection keeps the current item pressed by default; set
`deselectable` to allow an empty selection. Set `multiple` to let people press any
number of items.

### When to use

Use Toggle Group for toolbar-style view and display options. Use Segment Group when
one option must always be selected and the choice reads as a form value, Tabs when
each option shows a different panel, and Radio Group for choices in a form.

### Labels and icons

Give the group a `label` that names what the items control; it becomes the group's
accessible name. Icon-only items need an `ariaLabel`.

### Keyboard interaction

The group is one tab stop. Use the arrow keys to move between items, Home and End
to jump to the first and last item, and Enter or Space to press the focused item.
Focus loops from the last item to the first unless `loopFocus` is false.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/toggle-group/toggle-group.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### ToggleGroup

ToggleGroup forwards native div attributes to its root.

| Prop            | Type                        | Default      | Description                                       |
| --------------- | --------------------------- | ------------ | ------------------------------------------------- |
| `items`         | `ToggleGroupItem[]`         | `Required`   | The toggle buttons to show.                       |
| `label`         | `string`                    | `Required`   | Accessible name for the group.                    |
| `value`         | `string[] (bindable)`       | `[]`         | Values of the pressed items.                      |
| `multiple`      | `boolean`                   | `false`      | Allows more than one item to be pressed.          |
| `deselectable`  | `boolean`                   | `false`      | Allows the last pressed item to be released.      |
| `orientation`   | `horizontal \| vertical`    | `horizontal` | Layout direction and arrow-key axis.              |
| `loopFocus`     | `boolean`                   | `true`       | Moves focus from the last item back to the first. |
| `rovingFocus`   | `boolean`                   | `true`       | Makes the group a single tab stop.                |
| `size`          | `sm \| md`                  | `md`         | Height and text size of the items.                |
| `disabled`      | `boolean`                   | `false`      | Disables every item.                              |
| `onValueChange` | `(value: string[]) => void` | `—`          | Called after a person changes the pressed items.  |
| `id`            | `string`                    | `Generated`  | ID of the group root.                             |
| `class`         | `string`                    | `—`          | Additional Tailwind classes on the group.         |
| `itemClass`     | `string`                    | `—`          | Additional Tailwind classes on each item.         |

### ToggleGroupItem

| Prop        | Type            | Default    | Description                                    |
| ----------- | --------------- | ---------- | ---------------------------------------------- |
| `value`     | `string`        | `Required` | Unique value for the item.                     |
| `label`     | `string`        | `—`        | Visible text.                                  |
| `Icon`      | `IconComponent` | `—`        | Icon shown before the label.                   |
| `ariaLabel` | `string`        | `—`        | Accessible name. Required for icon-only items. |
| `disabled`  | `boolean`       | `false`    | Prevents the item from being pressed.          |
