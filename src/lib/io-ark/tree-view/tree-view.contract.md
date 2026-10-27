---
component: TreeView
source: ./tree-view.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Tree View contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `TreeViewProps`, `TreeViewNode` and `TreeViewNodeState`, so not repeated: that `nodes` and `label` are required; that `selectedValue` and `expandedValue` are bindable `string[]`s defaulting to `[]`; the two `selectionMode` values and the `single` default; the defaults for `labelHidden`, `typeahead` and `expandOnClick`; the fields the `item` snippet receives.

## Input

- **IN-1** Every node `id` MUST be unique across the whole tree. `selectedValue` and `expandedValue` hold these ids.
- **IN-2** Node ids MUST NOT be `ROOT`; the component uses that id for the hidden root of the collection.
- **IN-3** A node with a `children` array renders as an expandable branch, even when the array is empty. Leaves MUST omit `children`.
- **IN-4** `label` MUST name the tree, such as "Workflows". Use `labelHidden` only when a visible heading already names it.
- **IN-5** Node `label`s SHOULD be the names people recognize. They are used for typeahead and as the default row text.
- **IN-6** Use Tree View when the hierarchy itself matters, such as parent and child workflows or a namespace and its task queues. Use Listbox or a table for flat lists, and Accordion or Collapsible for collapsible sections of content.
- **IN-7** The `item` snippet MUST NOT contain interactive elements; the whole row is the interactive element.
- **IN-8** `class` is merged through `twMerge` onto the root. It MUST NOT set text or background colors used for selection.

## Behavior

- **BEH-1** Selecting a node updates `selectedValue` and calls `onSelectionChange`. With `selectionMode="multiple"`, Ctrl or Cmd and Shift add to the selection.
- **BEH-2** Expanding or collapsing a branch updates `expandedValue` and calls `onExpandedChange`. With `expandOnClick`, clicking a branch row also toggles it.
- **BEH-3** Disabled nodes stay visible but cannot be selected.
- **BEH-4** The whole tree is re-created from `nodes` when `nodes` changes. `selectedValue` and `expandedValue` are kept, so ids that no longer exist SHOULD be removed by the caller.

## Display

- **DIS-1** Children are indented by depth with an indent guide. The branch chevron rotates when expanded. Collapsed branch content is hidden.
- **DIS-2** Selected rows use the selected background and brand text. Row labels are truncated to one line with an ellipsis. **Needs decision: DEC-1.**

## Accessibility

- **A11Y-1** The tree is one tab stop with the `tree` role, labelled by `label`. Up and Down move between visible nodes, Right expands or moves to the first child, Left collapses or moves to the parent, Home and End jump to the ends, `*` expands all siblings, and Enter or Space selects. Typing a character moves to the next matching node while `typeahead` is on.
- **A11Y-2** Branches expose their expanded state, and selected nodes their selected state, to assistive technology.
- **A11Y-3** A node `Icon` is decorative. The node's meaning MUST be in its `label`.

## Test hooks

- **TEST-1** `data-testid` is forwarded to the root. Rows have none; tests SHOULD find nodes by their accessible names within the tree.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. Truncated node labels have no full-text affordance for sighted mouse and keyboard users, although the full text stays in the DOM for screen readers. Decide whether long labels need a tooltip, wrapping, or a horizontal scroll area.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
