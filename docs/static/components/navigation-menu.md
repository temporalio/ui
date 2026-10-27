# Navigation Menu

Link to the main areas of a product, with optional groups of related pages.

## Anatomy

A navigation menu lays out the main links of a site, with optional groups that open a panel of links.

- **Root** `[data-scope="navigation-menu"][data-part="root"]`: The navigation landmark.
  - **Link** `[data-part="list"] > [data-part="item"]:first-child [data-part="link"]` (left): A top-level link. Marked as the current page when active.
  - **Trigger** `trigger` (top): Opens a group of links.
    - **Indicator** `[data-part="trigger"] span` (top): The chevron that shows whether the group is open.
  - **Content** `[data-part="content"]:not([hidden])` (right): The panel that holds a group of links.
    - **Group link** `[data-part="content"] li:first-child [data-part="link"]` (left): A link in the group, with an optional description.

## Examples

Use a horizontal menu for top-level product navigation and group related pages under a
single trigger. Mark the page people are on with `current`.

## Usage

### Import

```svelte
<script lang="ts">
  import {
    NavigationMenu,
    type NavigationMenuItem,
  } from '$lib/io-ark/navigation-menu';

  const items: NavigationMenuItem[] = [
    { label: 'Workflows', href: '/workflows', current: true },
    { label: 'Schedules', href: '/schedules' },
    {
      label: 'Deployments',
      children: [
        { label: 'Worker deployments', href: '/deployments' },
        { label: 'Build IDs', href: '/build-ids' },
      ],
    },
  ];
</script>

<NavigationMenu {items} label="Main" />
```

Package consumers can import from `@temporalio/ui/io-ark/navigation-menu`.

### Links and groups

Items with `href` render as links. Items with `children` render as a button that opens
a panel of links; the group trigger is highlighted when one of its links is current.
Add a short `description` to group links when the destination is not obvious from its
name.

### Current page

Set `current` on the link for the page being shown. It receives `aria-current="page"`
and a selected style. Only one link should be current at a time.

### Navigation or tabs

Use a navigation menu when each destination has its own URL. Use Tabs to switch views
inside one page.

### Keyboard interaction

Tab moves between top-level items. Enter, Space, or Down Arrow opens a group and moves
into its links; Escape closes it and returns focus to the trigger. Groups also open on
hover after a short delay, set with `openDelay` and `closeDelay`.

### Orientation

Use `vertical` in side navigation. Groups then expand in place beneath their trigger
instead of opening a floating panel.

### Contract

The rules reviewers check this component against live in `src/lib/io-ark/navigation-menu/navigation-menu.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### NavigationMenu

NavigationMenu forwards native attributes to its `nav` element.

| Prop            | Type                      | Default      | Description                                                 |
| --------------- | ------------------------- | ------------ | ----------------------------------------------------------- |
| `items`         | `NavigationMenuItem[]`    | `Required`   | Top-level links and groups, in order.                       |
| `label`         | `string`                  | `Main`       | Accessible name for the navigation landmark.                |
| `value`         | `string (bindable)`       | `''`         | Value of the open group. Empty when every group is closed.  |
| `orientation`   | `horizontal \| vertical`  | `horizontal` | Top navigation or side navigation layout.                   |
| `openDelay`     | `number`                  | `200`        | Milliseconds before a group opens on hover.                 |
| `closeDelay`    | `number`                  | `300`        | Milliseconds before a group closes when the pointer leaves. |
| `onValueChange` | `(value: string) => void` | `—`          | Called when a group opens or closes.                        |
| `id`            | `string`                  | `Generated`  | Base for internal IDs.                                      |
| `class`         | `string`                  | `—`          | Additional Tailwind classes on the `nav` element.           |

### NavigationMenuItem

| Prop       | Type                       | Default    | Description                                              |
| ---------- | -------------------------- | ---------- | -------------------------------------------------------- |
| `label`    | `string`                   | `Required` | Visible link or group label.                             |
| `href`     | `string`                   | `—`        | Link destination. Ignored when the item has children.    |
| `current`  | `boolean`                  | `false`    | Marks the link as the current page.                      |
| `disabled` | `boolean`                  | `false`    | Prevents opening the group.                              |
| `value`    | `string`                   | `label`    | Unique value for the item, used by the bindable `value`. |
| `children` | `NavigationMenuLinkItem[]` | `—`        | Links shown in the group panel.                          |

### NavigationMenuLinkItem

| Prop          | Type      | Default    | Description                         |
| ------------- | --------- | ---------- | ----------------------------------- |
| `label`       | `string`  | `Required` | Visible link text.                  |
| `href`        | `string`  | `Required` | Link destination.                   |
| `description` | `string`  | `—`        | Short text below the label.         |
| `current`     | `boolean` | `false`    | Marks the link as the current page. |
| `disabled`    | `boolean` | `false`    | Marks the link as unavailable.      |
