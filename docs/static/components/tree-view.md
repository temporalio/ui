# Tree View

Display hierarchical data that people can expand, collapse, and select.

## Anatomy

A tree view shows nested nodes that expand and collapse under a label.

- **Root** `[data-scope="tree-view"][data-part="root"]`: The wrapper that tracks selection and expansion.
  - **Label** `label` (top): Names the tree.
  - **Branch control** `branch-control` (right): The row that selects or expands the branch.
    - **Branch indicator** `branch-indicator` (left): The chevron that rotates when expanded.
  - **Branch content** `[data-part="branch-content"]:not([hidden])` (right): The children of the branch. Hidden while collapsed.
  - **Item** `[data-part="branch-content"] [data-part="item"]` (left): A node without children.

## Examples

Show parent and child workflows as a tree, or browse namespaces and their task queues
like a file explorer. Use the `item` snippet to add status or counts beside each label.

## Usage

### Import

```svelte
<script lang="ts">
  import { TreeView, type TreeViewNode } from '$lib/io-poc/tree-view';

  const nodes: TreeViewNode[] = [
    {
      id: 'order-processing',
      label: 'order-processing',
      children: [
        { id: 'charge-payment', label: 'charge-payment' },
        { id: 'ship-order', label: 'ship-order' },
      ],
    },
  ];
  let selectedValue = $state<string[]>([]);
</script>

<TreeView label="Workflows" {nodes} bind:selectedValue />
```

Package consumers can import from `@temporalio/ui/io-poc/tree-view`.

### Nodes

Each node needs a unique `id` and a `label`. Nodes with `children` render as
expandable branches; nodes without them are leaves. Set `disabled` on a node to
keep it visible but unselectable, and `Icon` to show an icon before the label.

### Selection and expansion

Bind `selectedValue` and `expandedValue` to read or control which nodes are selected
and expanded. Both hold node IDs. Set `selectionMode="multiple"` to let people select
several nodes with Ctrl or Cmd and Shift.

### Custom node content

Pass an `item` snippet to replace the default label. It receives the node and its
state (`selected`, `expanded`, `disabled`, `focused`, `depth`, and `isBranch`). Keep
interactive controls out of the snippet; the whole row is the interactive element.

### When to use

Use a tree view when the hierarchy itself matters, such as parent and child workflows
or a namespace and its task queues. For flat lists, use Listbox or a table. For a few
collapsible sections of content, use Accordion or Collapsible.

### Keyboard interaction

The tree is a single tab stop. Use Up and Down to move between visible nodes, Right
to expand a branch or move to its first child, Left to collapse a branch or move to
its parent, Home and End to jump to the first or last node, and `*` to expand all
siblings. Press Enter or Space to select. Typing a character moves focus to the next
node that starts with it.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/tree-view/tree-view.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### TreeView

| Prop                | Type                                         | Default     | Description                                                   |
| ------------------- | -------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `nodes`             | `TreeViewNode[]`                             | `Required`  | The top-level nodes. Nested nodes go in each node's children. |
| `label`             | `string`                                     | `Required`  | Accessible name for the tree, shown above it.                 |
| `labelHidden`       | `boolean`                                    | `false`     | Visually hides the label while keeping it accessible.         |
| `selectedValue`     | `string[] (bindable)`                        | `[]`        | IDs of the selected nodes.                                    |
| `expandedValue`     | `string[] (bindable)`                        | `[]`        | IDs of the expanded branches.                                 |
| `selectionMode`     | `single \| multiple`                         | `single`    | Whether one or several nodes can be selected.                 |
| `typeahead`         | `boolean`                                    | `true`      | Moves focus to matching nodes as people type.                 |
| `expandOnClick`     | `boolean`                                    | `true`      | Toggles a branch when its row is clicked.                     |
| `onSelectionChange` | `(selectedValue: string[]) => void`          | `—`         | Called when the selection changes.                            |
| `onExpandedChange`  | `(expandedValue: string[]) => void`          | `—`         | Called when a branch expands or collapses.                    |
| `item`              | `Snippet<[TreeViewNode, TreeViewNodeState]>` | `—`         | Custom content for each node.                                 |
| `id`                | `string`                                     | `Generated` | Base for the tree and node IDs.                               |
| `class`             | `string`                                     | `—`         | Additional Tailwind classes on the wrapper.                   |

### TreeViewNode

| Prop       | Type             | Default    | Description                                    |
| ---------- | ---------------- | ---------- | ---------------------------------------------- |
| `id`       | `string`         | `Required` | Unique value used for selection and expansion. |
| `label`    | `string`         | `Required` | Visible text and typeahead value.              |
| `children` | `TreeViewNode[]` | `—`        | Child nodes. Makes the node a branch.          |
| `disabled` | `boolean`        | `false`    | Prevents selecting the node.                   |
| `Icon`     | `IconComponent`  | `—`        | Optional icon before the label.                |
