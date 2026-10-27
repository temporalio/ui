# Popover

Show supporting information or a short task in a panel anchored to a trigger.

## Anatomy

A popover opens a panel of related content or controls next to a trigger.

- **Root**: Holds the open state and connects the trigger to the panel.
  - **Trigger** `trigger` (left): The element that opens the popover.
  - **Content** `content` (right): The floating panel.
    - **Title** `title` (left): Names the popover.
    - **Description** `description` (left): Supporting text below the title.
    - **Close trigger** `close-trigger` (right): The button that closes the popover.

## Examples

Use a popover to explain a setting in context or to collect a few quick inputs, such
as filters, without leaving the page.

## Usage

### Import

```svelte
<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { Popover } from '$lib/io-ark/popover';
</script>

<Popover title="Retry policy">
  {#snippet trigger(props)}
    <Button {...props} colorScheme="tertiary">About retries</Button>
  {/snippet}
  <p>Failed activities retry with exponential backoff.</p>
</Popover>
```

Package consumers can import from `@temporalio/ui/io-ark/popover`.

### Content

Keep popovers short and focused on the trigger they belong to. A `title` names the
panel for assistive technology and shows a close button by default. Without a title,
make sure the content itself explains its purpose.

### Popover, tooltip, or dialog

Use a tooltip for a brief, non-interactive label. Use a popover when the content is
interactive or longer than a sentence. Use a dialog when the task needs the user's
full attention or must be completed before continuing.

### Focus and dismissal

Opening a popover moves focus into it. Escape, the close button, or a click outside
closes it and returns focus to the trigger. Set `modal` to keep focus inside and
block interaction with the rest of the page while it is open.

### Placement

`placement` sets the preferred side. The panel flips and shifts to stay in view. Use
`showArrow` when the relationship to the trigger is not obvious.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/popover/popover.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Popover

| Prop                     | Type                             | Default   | Description                                                                                                                               |
| ------------------------ | -------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger`                | `Snippet<[PopoverTriggerProps]>` | `—`       | The trigger. Spread the props onto a button.                                                                                              |
| `children`               | `Snippet`                        | `—`       | Panel content.                                                                                                                            |
| `title`                  | `string`                         | `''`      | Heading and accessible name of the panel.                                                                                                 |
| `description`            | `string`                         | `''`      | Supporting text below the title.                                                                                                          |
| `open`                   | `boolean (bindable)`             | `false`   | Whether the popover is open.                                                                                                              |
| `placement`              | `PopoverPlacement`               | `bottom`  | Preferred position relative to the trigger.                                                                                               |
| `modal`                  | `boolean`                        | `false`   | Traps focus and blocks interaction outside the panel.                                                                                     |
| `closeOnInteractOutside` | `boolean`                        | `true`    | Closes when the user clicks or focuses outside.                                                                                           |
| `closeOnEscape`          | `boolean`                        | `true`    | Closes when the user presses Escape.                                                                                                      |
| `portalled`              | `boolean`                        | `true`    | Renders the panel in a portal at the end of the page. Set false to render it in place, such as inside a scrolling container or a preview. |
| `showArrow`              | `boolean`                        | `false`   | Shows an arrow pointing at the trigger.                                                                                                   |
| `showClose`              | `boolean`                        | `!!title` | Shows the close button.                                                                                                                   |
| `closeLabel`             | `string`                         | `Close`   | Accessible label for the close button.                                                                                                    |
| `initialFocusEl`         | `() => HTMLElement \| null`      | `—`       | Element to focus when the popover opens.                                                                                                  |
| `onOpenChange`           | `(open: boolean) => void`        | `—`       | Called when the user opens or closes the popover.                                                                                         |
| `class`                  | `string`                         | `—`       | Additional Tailwind classes on the panel.                                                                                                 |
