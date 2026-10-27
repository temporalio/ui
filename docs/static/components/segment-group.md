# Segment Group

Choose one option from a short, connected set of segments.

## Anatomy

A segment group is a compact row of options with a sliding highlight on the selected one.

- **Root** `[data-scope="segment-group"][data-part="root"]`: The radio group, which holds the selected value.
  - **Label** `label` (top): Names the group.
  - **Track** `div:has(> [data-part="indicator"])` (left): The rail that holds the items and the indicator.
  - **Indicator** `indicator` (bottom): The highlight that slides to the selected option.
  - **Item** `[data-part="item"]:last-of-type` (right): One option.
    - **Item text** `[data-part="item"][data-state="checked"] [data-part="item-text"]` (top): The option label.

## Examples

Use a segment group for a small set of mutually exclusive options, such as a time
range or a status filter. A sliding indicator marks the selected option.

## Usage

### Import

```svelte
<script lang="ts">
  import { SegmentGroup } from '$lib/io-poc/segment-group';
  let range = $state<string | null>('24h');
</script>

<SegmentGroup
  label="Time range"
  items={[
    { value: '1h', label: '1h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
  ]}
  bind:value={range}
/>
```

Package consumers can import from `@temporalio/ui/io-poc/segment-group`.

### When to use

Use Segment Group for two to five short, mutually exclusive options that change a
view or filter. Compared with related components:

- **Toggle Group** suits toolbar actions and allows multiple selection.
- **Tabs** switch between panels of different content.
- **Radio Group** suits form questions, longer labels, and options with
  descriptions.

### Labels

Every segment group needs a `label`. Use `labelHidden` when a nearby heading already
names the choice; the label stays available to screen readers. Keep segment labels
short so they fit on one line.

### Forms

Segment Group renders native radio inputs, so set `name` to submit the selected
value with a form.

### Keyboard interaction

The group is one tab stop. Use the arrow keys to move the selection between
segments; disabled segments are skipped. The indicator animation is turned off when
reduced motion is requested.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/segment-group/segment-group.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### SegmentGroup

SegmentGroup forwards native div attributes to its root.

| Prop            | Type                              | Default      | Description                                           |
| --------------- | --------------------------------- | ------------ | ----------------------------------------------------- |
| `items`         | `SegmentGroupItem[]`              | `Required`   | The segments to show.                                 |
| `label`         | `string`                          | `Required`   | Visible label for the group.                          |
| `labelHidden`   | `boolean`                         | `false`      | Visually hides the label while keeping it accessible. |
| `value`         | `string \| null (bindable)`       | `null`       | Value of the selected segment.                        |
| `orientation`   | `horizontal \| vertical`          | `horizontal` | Layout direction and arrow-key axis.                  |
| `size`          | `sm \| md`                        | `md`         | Height and text size of the segments.                 |
| `disabled`      | `boolean`                         | `false`      | Disables every segment.                               |
| `name`          | `string`                          | `—`          | Form field name for the selected value.               |
| `onValueChange` | `(value: string \| null) => void` | `—`          | Called after a person selects a segment.              |
| `id`            | `string`                          | `Generated`  | ID of the group root.                                 |
| `class`         | `string`                          | `—`          | Additional Tailwind classes on the root.              |

### SegmentGroupItem

| Prop       | Type      | Default    | Description                               |
| ---------- | --------- | ---------- | ----------------------------------------- |
| `value`    | `string`  | `Required` | Unique value for the segment.             |
| `label`    | `string`  | `Required` | Visible text.                             |
| `disabled` | `boolean` | `false`    | Prevents the segment from being selected. |
