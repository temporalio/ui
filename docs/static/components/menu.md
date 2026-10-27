# Menu

Show a list of actions or options from a trigger button.

## Anatomy

A menu opens a list of actions from a trigger button.

- **Root**: Holds the open state and selection handling.
  - **Trigger** `trigger` (left): The button that opens the menu.
  - **Content** `content` (right): The panel that holds the menu entries.
    - **Item group label** `item-group-label` (left): The heading for a group of entries.
    - **Item** `item` (left): An action or link, with an optional icon and description.

## Examples

Use menus for row actions, view settings, and grouped commands. Danger items stand
out, checkbox and radio items stay open while you change them, and submenus hold
related secondary actions.

## Usage

### Import

```svelte
<script lang="ts">
  import { Menu, type MenuEntry } from '$lib/io-poc/menu';

  const items: MenuEntry[] = [
    { value: 'signal', label: 'Send signal' },
    { value: 'reset', label: 'Reset' },
    { type: 'separator' },
    { value: 'terminate', label: 'Terminate', danger: true },
  ];
</script>

<Menu label="Actions" {items} onSelect={(value) => console.log(value)} />
```

Package consumers can import from `@temporalio/ui/io-poc/menu`.

### Items

Pass `items` as data. Action items call `onSelect` with their `value`; add `href`
to render a link instead. Use `separator` entries between unrelated sets of
actions and `group` entries to label related ones. Mark destructive actions with
`danger` and confirm them in a dialog before they run.

### Checkbox and radio items

`checkbox` entries toggle independent settings, such as visible columns. `radio`
entries choose one option, such as a sort order. You own their state: update
`checked` or `value` in `onCheckedChange` or `onValueChange`. These items keep the
menu open so several changes can be made at once.

### Submenus

Use a `submenu` entry for a small set of secondary actions, such as export formats.
Keep menus shallow; one level of nesting is usually enough.

### Triggers

Set `label` to render a Button with a chevron. Use the `trigger` snippet for a custom
trigger, such as an icon-only button, and spread the provided props onto it. Icon-only
triggers need an `aria-label`.

### Menu or select

Use a menu for actions and view settings. Use a select or combobox to choose a value
that is submitted with a form.

### Keyboard interaction

Enter, Space, or Arrow Down opens the menu and focuses the first item. Arrow keys move
between items, typing jumps to a matching item, Arrow Right opens a submenu, and
Escape or Arrow Left closes it. Focus returns to the trigger when the menu closes.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/menu/menu.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Menu

| Prop                     | Type                          | Default        | Description                                                                                                                               |
| ------------------------ | ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `items`                  | `MenuEntry[]`                 | `Required`     | Items, separators, groups, checkbox and radio items, submenus.                                                                            |
| `label`                  | `string`                      | `''`           | Text for the default Button trigger.                                                                                                      |
| `trigger`                | `Snippet<[MenuTriggerProps]>` | `—`            | Custom trigger. Spread the props onto a button.                                                                                           |
| `triggerColorScheme`     | `ButtonColorScheme`           | `tertiary`     | Color scheme of the default trigger.                                                                                                      |
| `triggerSize`            | `xs \| sm \| md`              | `md`           | Size of the default trigger.                                                                                                              |
| `open`                   | `boolean (bindable)`          | `false`        | Whether the menu is open.                                                                                                                 |
| `placement`              | `MenuPlacement`               | `bottom-start` | Preferred position relative to the trigger.                                                                                               |
| `closeOnSelect`          | `boolean`                     | `true`         | Closes the menu after an action item is selected.                                                                                         |
| `closeOnInteractOutside` | `boolean`                     | `true`         | Closes the menu when the user clicks or focuses outside.                                                                                  |
| `closeOnEscape`          | `boolean`                     | `true`         | Closes the menu when the user presses Escape.                                                                                             |
| `portalled`              | `boolean`                     | `true`         | Renders the panel in a portal at the end of the page. Set false to render it in place, such as inside a scrolling container or a preview. |
| `disabled`               | `boolean`                     | `false`        | Disables the trigger.                                                                                                                     |
| `onSelect`               | `(value: string) => void`     | `—`            | Called when an action item is selected.                                                                                                   |
| `onOpenChange`           | `(open: boolean) => void`     | `—`            | Called when the user opens or closes the menu.                                                                                            |
| `class`                  | `string`                      | `—`            | Additional Tailwind classes on the menu panel.                                                                                            |

### MenuEntry

| Prop              | Type                                                         | Default | Description                                                  |
| ----------------- | ------------------------------------------------------------ | ------- | ------------------------------------------------------------ |
| `type`            | `item \| separator \| group \| checkbox \| radio \| submenu` | `item`  | Kind of entry.                                               |
| `value`           | `string`                                                     | `—`     | Item value. For radio entries, the selected option value.    |
| `label`           | `string`                                                     | `—`     | Visible text. Optional for groups and radio entries.         |
| `description`     | `string`                                                     | `—`     | Supporting text below an action item label.                  |
| `Icon`            | `IconComponent`                                              | `—`     | Icon before an action or submenu label.                      |
| `danger`          | `boolean`                                                    | `false` | Styles an action item as destructive.                        |
| `disabled`        | `boolean`                                                    | `false` | Prevents selecting the item.                                 |
| `href`            | `string`                                                     | `—`     | Renders an action item as a link.                            |
| `items`           | `MenuEntry[]`                                                | `—`     | Entries inside a group or submenu.                           |
| `checked`         | `boolean`                                                    | `—`     | Checked state of a checkbox entry.                           |
| `onCheckedChange` | `(checked: boolean) => void`                                 | `—`     | Called when a checkbox entry is toggled.                     |
| `options`         | `MenuRadioOption[]`                                          | `—`     | Options for a radio entry, each with value, label, disabled. |
| `onValueChange`   | `(value: string) => void`                                    | `—`     | Called when a radio option is chosen.                        |
