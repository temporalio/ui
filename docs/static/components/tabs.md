# Tabs

Switch between related views of the same object without leaving the page.

## Anatomy

Tabs place a row of triggers above the panel for the selected tab.

- **Root** `[data-scope="tabs"][data-part="root"]`: The wrapper that tracks the selected tab.
  - **List** `list` (left): The tablist that holds the triggers.
    - **Trigger** `[data-part="trigger"][data-selected]` (top): Selects a tab. Shows an optional icon and badge.
      - **Badge** `[data-part="trigger"]:nth-child(3) span:last-child` (top): An optional count or status after the label.
    - **Indicator** `indicator` (left): The bar under the selected trigger in the line variant.
  - **Content** `[data-part="content"]:not([hidden])` (bottom): The panel for the selected tab. Other panels are hidden.

## Examples

Use line tabs for the main sections of a detail page and enclosed tabs for a
compact switch inside a card. Badges show counts that help people choose a tab.

## Usage

### Import

```svelte
<script lang="ts">
  import { Tabs, type TabsItem } from '$lib/io-poc/tabs';

  const items: TabsItem[] = [
    { value: 'history', label: 'History' },
    { value: 'workers', label: 'Workers' },
    { value: 'pending', label: 'Pending Activities', badge: 3 },
  ];
  let value = $state('history');
</script>

<Tabs {items} bind:value label="Workflow details">
  {#snippet content(item)}
    <p>{item.label} content</p>
  {/snippet}
</Tabs>
```

Package consumers can import from `@temporalio/ui/io-poc/tabs`.

### Panels

Pass a `content` snippet to render a panel for every tab; it receives the tab item.
When panels need different markup, leave `content` out and place `TabsContent`
components inside `Tabs`, one per tab value.

Panels stay mounted while hidden so form values and scroll positions are preserved.
Set `lazyMount` to render a panel the first time it is selected, and `unmountOnExit`
to remove hidden panels.

### Tabs or navigation

Use tabs to switch views of the same content on one page. When each view has its own
URL, use links with `aria-current` instead, such as a Navigation Menu.

### Keyboard interaction

Tab moves focus into the tab list and then to the active panel. Arrow keys move
between tabs; Home and End jump to the first and last tab. With the default
`automatic` activation, focusing a tab selects it. Use `manual` when switching panels
is slow, so people press Enter or Space to select.

### Labels

Give the tab list an accessible name with `label` when the page has more than one set
of tabs. Keep tab labels short; use `badge` for counts instead of putting numbers in
the label.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/tabs/tabs.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Tabs

Tabs forwards native div attributes to its root.

| Prop             | Type                      | Default         | Description                                                    |
| ---------------- | ------------------------- | --------------- | -------------------------------------------------------------- |
| `items`          | `TabsItem[]`              | `Required`      | Tabs to show, in order.                                        |
| `value`          | `string (bindable)`       | `First enabled` | The selected tab value.                                        |
| `label`          | `string`                  | `—`             | Accessible name for the tab list.                              |
| `variant`        | `line \| enclosed`        | `line`          | Underlined tabs or a segmented, enclosed list.                 |
| `orientation`    | `horizontal \| vertical`  | `horizontal`    | Layout and arrow-key direction.                                |
| `activationMode` | `automatic \| manual`     | `automatic`     | Whether focus selects a tab or Enter and Space are required.   |
| `loopFocus`      | `boolean`                 | `true`          | Wraps arrow-key focus from the last tab to the first.          |
| `lazyMount`      | `boolean`                 | `false`         | Renders a panel the first time its tab is selected.            |
| `unmountOnExit`  | `boolean`                 | `false`         | Removes hidden panels from the DOM.                            |
| `onValueChange`  | `(value: string) => void` | `—`             | Called when a person selects a tab.                            |
| `content`        | `Snippet<[TabsItem]>`     | `—`             | Panel content rendered for each tab.                           |
| `children`       | `Snippet`                 | `—`             | TabsContent panels when `content` is not used.                 |
| `id`             | `string`                  | `Generated`     | Base for tab and panel IDs.                                    |
| `class`          | `string`                  | `—`             | Additional Tailwind classes on the root.                       |
| `listClass`      | `string`                  | `—`             | Additional Tailwind classes on the tab list.                   |
| `contentClass`   | `string`                  | `—`             | Additional Tailwind classes on panels rendered from `content`. |

### TabsItem

| Prop       | Type               | Default    | Description                            |
| ---------- | ------------------ | ---------- | -------------------------------------- |
| `value`    | `string`           | `Required` | Unique tab value.                      |
| `label`    | `string`           | `Required` | Visible tab label.                     |
| `disabled` | `boolean`          | `false`    | Prevents selecting the tab.            |
| `Icon`     | `IconComponent`    | `—`        | Icon before the label.                 |
| `badge`    | `string \| number` | `—`        | Count or status shown after the label. |

### TabsContent

Place inside `Tabs`. Forwards native div attributes.

| Prop       | Type      | Default    | Description                               |
| ---------- | --------- | ---------- | ----------------------------------------- |
| `value`    | `string`  | `Required` | The tab value this panel belongs to.      |
| `children` | `Snippet` | `—`        | Panel content.                            |
| `class`    | `string`  | `—`        | Additional Tailwind classes on the panel. |
