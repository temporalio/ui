# Drawer

Show supplementary content in a panel that slides in from the edge of the screen.

## Anatomy

A drawer is a panel that slides in from an edge of the page, opened by a trigger.

- **Content** `[data-scope="drawer"][data-part="content"]`: The drawer panel. Holds the header, body, and footer.
  - **Grabber** `grabber` (top): The handle shown on bottom drawers. Drag it to resize or dismiss.
  - **Title** `title` (left): The drawer's accessible name.
  - **Description** `description` (left): Optional supporting text, linked to the drawer.
  - **Close trigger** `close-trigger` (right): The icon button that closes the drawer.
  - **Body** `body` (right): The scrolling content area for the children.
  - **Footer** `footer` (bottom): Actions related to the drawer content.

## Examples

Use a side panel to inspect details without leaving a list, and a bottom sheet for
filters and other short tasks on small screens.

## Usage

### Import

```svelte
<script lang="ts">
  import { Button } from '$lib/io-ark/button';
  import { Drawer } from '$lib/io-ark/drawer';
  let open = $state(false);
</script>

<Drawer
  bind:open
  title="Event details"
  description="Event 7 · ActivityTaskFailed"
>
  {#snippet trigger(props)}
    <Button {...props} colorScheme="secondary">Details</Button>
  {/snippet}
  <p>Drawer content.</p>
</Drawer>
```

Package consumers can import from `@temporalio/ui/io-ark/drawer`.

### When to use

Use a drawer for details, settings, or filters that relate to the current page,
especially when people benefit from keeping the page in view. Use a dialog for short
decisions that must be completed before continuing.

### Placement and size

`placement` sets the edge the drawer slides from: `right` (default), `left`, or
`bottom`. `size` limits the drawer's width for side panels and its width on wide
screens for bottom sheets. Bottom sheets show a grabber and grow with their content
up to 85% of the viewport height.

### Trigger and open state

Pass a `trigger` snippet and spread its props onto a Button, or use `bind:open` to
open the drawer from elsewhere, such as a row in a table. Focus returns to the
trigger when the drawer closes. `onOpenChange` is called when a person opens or
dismisses the drawer.

### Dismissing

People can close a drawer with the close button, Escape, clicking the backdrop, or
by swiping it toward its edge on touch and pointer devices. Set `modal` to false to
let people interact with the page while the drawer is open; non-modal drawers have
no backdrop.

### Keyboard interaction

Focus moves into the drawer when it opens and stays inside while it is modal. Tab
and Shift+Tab cycle through its controls, and Escape closes it unless
`closeOnEscape` is false.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/drawer/drawer.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Drawer

| Prop                     | Type                                 | Default                   | Description                                                                                                                               |
| ------------------------ | ------------------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                  | `string`                             | `Required`                | The visible heading and accessible name.                                                                                                  |
| `description`            | `string`                             | `''`                      | Supporting text below the title, announced as the drawer description.                                                                     |
| `open`                   | `boolean (bindable)`                 | `false`                   | Whether the drawer is open.                                                                                                               |
| `placement`              | `right \| left \| bottom`            | `right`                   | The edge the drawer slides from and is swiped toward to close.                                                                            |
| `size`                   | `sm \| md \| lg`                     | `md`                      | Maximum width of the drawer.                                                                                                              |
| `modal`                  | `boolean`                            | `true`                    | Shows a backdrop, traps focus, and blocks interaction with the page.                                                                      |
| `closeOnEscape`          | `boolean`                            | `true`                    | Whether Escape closes the drawer.                                                                                                         |
| `closeOnInteractOutside` | `boolean`                            | `true`                    | Whether clicking outside closes the drawer.                                                                                               |
| `portalled`              | `boolean`                            | `true`                    | Renders the panel in a portal at the end of the page. Set false to render it in place, such as inside a scrolling container or a preview. |
| `closeLabel`             | `string`                             | `Close`                   | Accessible label for the close button.                                                                                                    |
| `initialFocusEl`         | `() => HTMLElement \| null`          | `First focusable element` | Element to focus when the drawer opens.                                                                                                   |
| `finalFocusEl`           | `() => HTMLElement \| null`          | `Trigger`                 | Element to focus when the drawer closes.                                                                                                  |
| `onOpenChange`           | `(open: boolean) => void`            | `—`                       | Called when a person opens or dismisses the drawer.                                                                                       |
| `trigger`                | `Snippet<[Record<string, unknown>]>` | `—`                       | Renders the opening control. Spread the provided props onto a Button.                                                                     |
| `children`               | `Snippet`                            | `—`                       | Body content. Scrolls when it exceeds the available height.                                                                               |
| `footer`                 | `Snippet`                            | `—`                       | Actions pinned to the bottom of the drawer.                                                                                               |
| `id`                     | `string`                             | `Generated`               | Base for the drawer part IDs.                                                                                                             |
| `class`                  | `string`                             | `—`                       | Additional Tailwind classes on the drawer content.                                                                                        |
