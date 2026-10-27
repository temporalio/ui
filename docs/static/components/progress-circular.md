# Progress Circular

Show how far a task has progressed with a compact ring.

## Anatomy

A circular progress shows completion as a ring, with an optional value inside.

- **Root** `[data-scope="progress"][data-part="root"]`: The progress bar for assistive technology.
  - **Circle track** `circle-track` (left): The full ring behind the progress.
  - **Circle range** `circle-range` (right): The filled part of the ring.
  - **Value text** `value-text` (top): The formatted value inside the ring. Shown when `showValue` is set.
  - **Label** `label` (bottom): Names what is in progress.

## Examples

Use a progress ring where space is tight, such as a deployment card or a table cell,
and the indeterminate state while work starts.

## Usage

### Import

```svelte
<script lang="ts">
  import { ProgressCircular } from '$lib/io-poc/progress';
</script>

<ProgressCircular label="Workers upgraded" value={6} max={8} showValue />
```

Package consumers can import from `@temporalio/ui/io-poc/progress`.

### Value

Set `value` between `min` and `max`. Set `value` to `null` when progress can't be
measured; the ring spins instead. Reduced-motion users see a static ring.

### Size and value text

Choose `sm`, `md`, or `lg`, or pass a number of pixels. `thickness` overrides the
stroke width. Set `showValue` to show the formatted value inside the ring; use
`formatValue` for counts such as "6/8". Keep it short enough to fit.

### When to use

Use Progress Circular for compact status, such as a card summary. Use Progress
Linear when the label and value need more room or progress appears in a list.

### Accessibility

The ring is a `progressbar` labelled by `label`, and the value text is announced
with it. Use `labelHidden` only when the purpose is clear from nearby content.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/progress/progress-circular.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### ProgressCircular

ProgressCircular forwards native div attributes to its root.

| Prop          | Type                                        | Default     | Description                                           |
| ------------- | ------------------------------------------- | ----------- | ----------------------------------------------------- |
| `label`       | `string`                                    | `Required`  | Visible label and accessible name.                    |
| `labelHidden` | `boolean`                                   | `false`     | Visually hides the label while keeping it accessible. |
| `value`       | `number \| null`                            | `0`         | Current value. Null shows the indeterminate state.    |
| `min`         | `number`                                    | `0`         | Minimum value.                                        |
| `max`         | `number`                                    | `100`       | Maximum value.                                        |
| `showValue`   | `boolean`                                   | `false`     | Shows the formatted value inside the ring.            |
| `formatValue` | `(details: ProgressValueDetails) => string` | `Percent`   | Formats the visible and announced value.              |
| `size`        | `sm \| md \| lg \| number`                  | `md`        | Ring diameter: 32, 48, or 72 pixels, or a number.     |
| `thickness`   | `number`                                    | `By size`   | Stroke width in pixels.                               |
| `colorScheme` | `brand \| success \| warning \| danger`     | `brand`     | Ring color.                                           |
| `id`          | `string`                                    | `Generated` | ID of the root.                                       |
| `class`       | `string`                                    | `—`         | Additional Tailwind classes on the root.              |
