# Scroll Area

Contain long or wide content in a region with thin, theme-aware scrollbars.

## Anatomy

A scroll area keeps native scrolling and draws its own scrollbars on top.

- **Root** `[data-scope="scroll-area"][data-part="root"]`: The outer element that sets the size of the region.
  - **Viewport** `viewport` (left): The focusable, scrollable region that holds the content.
  - **Scrollbar** `[data-part="scrollbar"][data-orientation="vertical"]` (right): The vertical or horizontal track. Hidden when there is nothing to scroll.
    - **Thumb** `[data-part="scrollbar"][data-orientation="vertical"] [data-part="thumb"]` (right): Shows the visible portion. Drag it to scroll.
  - **Horizontal scrollbar** `[data-part="scrollbar"][data-orientation="horizontal"]` (bottom): The track for sideways scrolling.
  - **Corner** `corner` (right): Fills the space where both scrollbars meet.

## Examples

Use a scroll area for a long event list, a wide payload, or a table that scrolls in
both directions while the rest of the page stays in place.

## Usage

### Import

```svelte
<script lang="ts">
  import { ScrollArea } from '$lib/io-ark/scroll-area';
</script>

<ScrollArea label="Event history" maxHeight="20rem">
  <ol>
    <li>WorkflowExecutionStarted</li>
    <li>WorkflowTaskScheduled</li>
  </ol>
</ScrollArea>
```

Package consumers can import from `@temporalio/ui/io-ark/scroll-area`.

### When to use

Use a scroll area when a bounded region of the page must scroll on its own, such as
an event history panel or a code payload. Let the page scroll for ordinary long
content. Avoid nesting scroll areas in the same direction.

### Size

Set `maxHeight` to let the region grow with its content up to a limit, or `height`
for a fixed region. A fixed height also works through the `class` prop, for example
`class="h-80"`.

### Orientation

The default `vertical` orientation hides horizontal overflow. Use `horizontal` for
wide content in a single row, and `both` for tables or code that can overflow in
either direction.

### Scrollbar visibility

Scrollbars appear while hovering, scrolling, or dragging. Set `scrollbars` to
`always` when people need a constant cue that more content exists.

### Keyboard and accessibility

The viewport is a focusable region named by `label`. Tab to it, then use the arrow
keys, Page Up, Page Down, Home, and End to scroll. Native scrolling, touch, and
trackpad gestures keep working.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/scroll-area/scroll-area.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### ScrollArea

ScrollArea forwards native div attributes to its root element.

| Prop            | Type                             | Default     | Description                                           |
| --------------- | -------------------------------- | ----------- | ----------------------------------------------------- |
| `label`         | `string`                         | `Required`  | Accessible name for the scrollable region.            |
| `orientation`   | `vertical \| horizontal \| both` | `vertical`  | Directions that can scroll.                           |
| `scrollbars`    | `hover \| always`                | `hover`     | Show scrollbars only on interaction, or all the time. |
| `height`        | `string`                         | `—`         | Fixed CSS height of the region, such as `20rem`.      |
| `maxHeight`     | `string`                         | `—`         | Maximum CSS height before the content scrolls.        |
| `id`            | `string`                         | `Generated` | Base ID for the scroll area parts.                    |
| `children`      | `Snippet`                        | `—`         | The scrollable content.                               |
| `class`         | `string`                         | `—`         | Additional Tailwind classes on the root.              |
| `viewportClass` | `string`                         | `—`         | Additional Tailwind classes on the viewport.          |
