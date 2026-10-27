# Collapsible

Reveal secondary content on demand without the heading and card styling of an
accordion.

## Anatomy

A collapsible is a trigger that shows and hides one region of content.

- **Root** `[data-scope="collapsible"][data-part="root"]`: The wrapper that tracks the open state.
  - **Trigger** `trigger` (left): The button that toggles the content. Shows the label or your custom trigger snippet.
  - **Indicator** `indicator` (right): The chevron that rotates when open.
  - **Content** `content` (bottom): The region that expands and collapses with an animated height.

## Examples

Hide optional settings or long supporting details behind a short text trigger. Use a
custom trigger when the toggle needs to show a count or status.

## Usage

### Import

```svelte
<script lang="ts">
  import { Collapsible } from '$lib/io-ark/collapsible';
  let open = $state(false);
</script>

<Collapsible label="Advanced options" bind:open>
  <p>Content shown when the trigger is expanded.</p>
</Collapsible>
```

Package consumers can import from `@temporalio/ui/io-ark/collapsible`.

### Collapsible or Accordion

Use Collapsible for a single inline disclosure inside other content, such as
advanced form options or a long stack trace. Use Accordion for a titled section of a
page that needs card styling, a subtitle, an error badge, or header actions, and use
AccordionGroup for a set of those sections.

### Trigger content

Pass `label` for a text trigger with a chevron that rotates when open. Pass a
`trigger` snippet to render custom content inside the trigger button; it receives the
current open state. Keep the trigger content non-interactive, because it is already
inside a button.

### Open state

Use `bind:open` to read and control whether the content is visible. Content stays
mounted while collapsed so form values are preserved. Set `lazyMount` to render the
content the first time it opens, and `unmountOnExit` to remove it again when it
closes. The children snippet receives the open state.

### Motion

The content animates its height when it opens and closes. The animation is removed
when the person prefers reduced motion.

### Keyboard interaction

Tab moves focus to the trigger. Enter or Space toggles the content. The trigger sets
`aria-expanded` and `aria-controls` so assistive technology announces the state.
Disabled triggers cannot be activated.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/collapsible/collapsible.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

Collapsible forwards native div attributes and event handlers to its root element.

### Collapsible

| Prop            | Type                      | Default     | Description                                                           |
| --------------- | ------------------------- | ----------- | --------------------------------------------------------------------- |
| `label`         | `string`                  | `''`        | Text for the default trigger, shown with a chevron.                   |
| `trigger`       | `Snippet<[boolean]>`      | `—`         | Custom trigger content. Receives the open state and replaces `label`. |
| `open`          | `boolean (bindable)`      | `false`     | Whether the content is visible.                                       |
| `disabled`      | `boolean`                 | `false`     | Prevents the trigger from toggling.                                   |
| `lazyMount`     | `boolean`                 | `false`     | Renders the content the first time it opens.                          |
| `unmountOnExit` | `boolean`                 | `false`     | Removes the content after it closes.                                  |
| `onOpenChange`  | `(open: boolean) => void` | `—`         | Called after a user changes the open state.                           |
| `children`      | `Snippet<[boolean]>`      | `—`         | Content to reveal. Receives the open state.                           |
| `id`            | `string`                  | `Generated` | Base for the trigger and content IDs.                                 |
| `class`         | `string`                  | `—`         | Additional Tailwind classes on the root element.                      |
| `triggerClass`  | `string`                  | `—`         | Additional Tailwind classes on the trigger button.                    |
| `contentClass`  | `string`                  | `—`         | Additional Tailwind classes on the content region.                    |
