# Tooltip

Show a short label or hint when a user hovers over or focuses an element.

## Anatomy

A tooltip shows short text next to the element it describes.

- **Root**: Manages the open state and delays.
  - **Trigger** `trigger` (left): The element that shows the tooltip on hover or focus.
  - **Content** `content` (right): The tooltip text.
  - **Arrow** `arrow` (left): Points at the trigger. Shown by default.

## Examples

Use tooltips to name icon-only buttons and to show the full value of truncated text.

## Usage

### Import

```svelte
<script lang="ts">
  import { IconCopy } from '$lib/io/icon';
  import { Button } from '$lib/io-poc/button';
  import { Tooltip } from '$lib/io-poc/tooltip';
</script>

<Tooltip content="Copy workflow ID">
  {#snippet trigger(props)}
    <Button
      {...props}
      colorScheme="ghost"
      LeadingIcon={IconCopy}
      aria-label="Copy workflow ID"
    />
  {/snippet}
</Tooltip>
```

Package consumers can import from `@temporalio/ui/io-poc/tooltip`.

### Supplementary content only

Tooltips are hidden until hover or focus, and touch screens rarely show them. Never put
essential information or the only explanation of an action in a tooltip. Keep the text
to a few words, and do not include links or buttons; use a popover for interactive
content.

### Accessible names

A tooltip describes its trigger, but it does not replace an accessible name. Icon-only
buttons still need an `aria-label`, usually with the same text as the tooltip.

### Triggers

Use the `trigger` snippet and spread its props onto a focusable element, such as a
Button. Without a trigger snippet, `children` are wrapped in an unstyled button so
keyboard users can reach the tooltip.

### Timing

Tooltips open after `openDelay` milliseconds of hover and immediately on keyboard
focus. Moving between triggers in quick succession keeps tooltips open without a new
delay. Escape closes the tooltip.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/tooltip/tooltip.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Tooltip

| Prop                 | Type                             | Default    | Description                                                                                                                               |
| -------------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `content`            | `string \| Snippet`              | `Required` | Tooltip text or content.                                                                                                                  |
| `trigger`            | `Snippet<[TooltipTriggerProps]>` | `—`        | Custom trigger. Spread the props onto a focusable element.                                                                                |
| `children`           | `Snippet`                        | `—`        | Content wrapped in an unstyled button when no trigger is given.                                                                           |
| `placement`          | `TooltipPlacement`               | `top`      | Preferred position relative to the trigger.                                                                                               |
| `open`               | `boolean (bindable)`             | `false`    | Whether the tooltip is visible.                                                                                                           |
| `openDelay`          | `number`                         | `400`      | Hover delay in milliseconds before opening.                                                                                               |
| `closeDelay`         | `number`                         | `150`      | Delay in milliseconds before closing.                                                                                                     |
| `disabled`           | `boolean`                        | `false`    | Prevents the tooltip from opening.                                                                                                        |
| `interactive`        | `boolean`                        | `false`    | Keeps the tooltip open while the pointer is over it.                                                                                      |
| `closeOnClick`       | `boolean`                        | `true`     | Closes the tooltip when the trigger is clicked.                                                                                           |
| `closeOnEscape`      | `boolean`                        | `true`     | Closes the tooltip when Escape is pressed.                                                                                                |
| `closeOnScroll`      | `boolean`                        | `true`     | Closes the tooltip when the page or a scrolling ancestor scrolls.                                                                         |
| `closeOnPointerDown` | `boolean`                        | `true`     | Closes the tooltip when the trigger is pressed.                                                                                           |
| `portalled`          | `boolean`                        | `true`     | Renders the panel in a portal at the end of the page. Set false to render it in place, such as inside a scrolling container or a preview. |
| `showArrow`          | `boolean`                        | `true`     | Shows an arrow pointing at the trigger.                                                                                                   |
| `onOpenChange`       | `(open: boolean) => void`        | `—`        | Called when the tooltip opens or closes.                                                                                                  |
| `class`              | `string`                         | `—`        | Additional Tailwind classes on the tooltip.                                                                                               |
| `triggerClass`       | `string`                         | `—`        | Additional Tailwind classes on the default button trigger.                                                                                |
