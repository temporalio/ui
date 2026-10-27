# Accordion

Show and hide content in expandable panels.

## Anatomy

An accordion group stacks items. Each item has a trigger and a collapsible panel.

- **Root**: The AccordionGroup that joins adjacent items.
  - **Item** `[data-scope="accordion"][data-part="root"]` (left): One Accordion card with its own open state.
    - **Item trigger** `item-trigger` (top): The heading button that toggles the panel. Holds the title, summary, and subtitle.
    - **Item content** `item-content` (right): The panel content. Stays mounted while collapsed.
    - **Item indicator** `[data-scope="accordion"][data-part="root"]:nth-child(2) [data-part="item-indicator"]` (bottom): The chevron that shows whether the panel is open.

## Examples

Group panels to create a compact list. Each panel opens independently.

## Usage

### Import

```svelte
<script lang="ts">
  import { Accordion, AccordionGroup } from '$lib/io-poc/accordion';
  let open = $state(false);
</script>

<AccordionGroup>
  <Accordion title="Details" bind:open>
    <p>Panel content.</p>
  </Accordion>
  <Accordion title="Additional details">
    <p>Each panel opens independently.</p>
  </Accordion>
</AccordionGroup>
```

Package consumers can import from `@temporalio/ui/io-poc/accordion`.

### Title and header content

Describe the information inside. Use `summary` for a short count or status, and
`action` for a separate button. Keep interactive controls outside the title and
summary.

### Open state

Use `bind:open` to read and control the expanded state. Children stay mounted while
collapsed so form values are preserved. The children snippet receives `open` when
expensive content needs to render conditionally.

### Keyboard interaction

Tab to a heading, then press Enter or Space to toggle its panel. Disabled headings
cannot be activated. Separate action buttons retain their own focus and behavior.

### Static panels

Set `expandable` to false to hide the toggle. Use `open` to control whether the
content is visible.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/accordion/accordion.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

Accordion forwards native div attributes and event handlers to its outer card.

### Accordion

| Prop         | Type                 | Default     | Description                                                                       |
| ------------ | -------------------- | ----------- | --------------------------------------------------------------------------------- |
| `title`      | `string`             | `Required`  | The visible heading and accessible trigger label.                                 |
| `subtitle`   | `string`             | `''`        | Supporting text below the title.                                                  |
| `open`       | `boolean (bindable)` | `false`     | Whether the content is visible.                                                   |
| `expandable` | `boolean`            | `true`      | Set false for a static card controlled through open.                              |
| `disabled`   | `boolean`            | `false`     | Prevents the trigger from toggling.                                               |
| `Icon`       | `IconComponent`      | `—`         | Optional icon before the title.                                                   |
| `error`      | `string`             | `''`        | Error badge displayed next to the subtitle.                                       |
| `onToggle`   | `() => void`         | `—`         | Called after a user changes the open state. External open changes do not call it. |
| `summary`    | `Snippet`            | `—`         | Compact information beside the title, below it on small screens.                  |
| `action`     | `Snippet`            | `—`         | Independent actions alongside the heading.                                        |
| `children`   | `Snippet<[boolean]>` | `—`         | Panel content receives the current open state and stays mounted while collapsed.  |
| `id`         | `string`             | `Generated` | Base for the trigger and content IDs.                                             |
| `class`      | `string`             | `—`         | Additional Tailwind classes on the outer card.                                    |

### AccordionGroup

Wrap adjacent Accordion components to join their borders and corners. Panels keep
their own open state; the group does not control expansion or limit how many panels
can be open.

| Prop                    | Type                             | Default | Description                                                                                |
| ----------------------- | -------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `children`              | `Snippet`                        | `—`     | Adjacent Accordion components to display as a group.                                       |
| `class`                 | `string`                         | `—`     | Additional Tailwind classes merged with the group border and corner styles.                |
| `Native div attributes` | `HTMLAttributes<HTMLDivElement>` | `—`     | Forwarded to the wrapper div, including id, style, aria-\* attributes, and event handlers. |
