<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { IconComponent } from '$lib/io/icon';

  export interface TreeViewNode {
    id: string;
    label: string;
    children?: TreeViewNode[];
    disabled?: boolean;
    Icon?: IconComponent;
  }

  export interface TreeViewNodeState {
    selected: boolean;
    expanded: boolean;
    disabled: boolean;
    focused: boolean;
    depth: number;
    isBranch: boolean;
  }

  export interface TreeViewProps {
    nodes: TreeViewNode[];
    label: string;
    labelHidden?: boolean;
    selectedValue?: string[];
    expandedValue?: string[];
    selectionMode?: 'single' | 'multiple';
    typeahead?: boolean;
    expandOnClick?: boolean;
    onSelectionChange?: (selectedValue: string[]) => void;
    onExpandedChange?: (expandedValue: string[]) => void;
    id?: string;
    'data-testid'?: string;
    class?: string;
    item?: Snippet<[TreeViewNode, TreeViewNodeState]>;
  }
</script>

<script lang="ts">
  import {
    TreeView as ArkTreeView,
    createTreeCollection,
    type TreeViewExpandedChangeDetails,
    type TreeViewSelectionChangeDetails,
  } from '@ark-ui/svelte/tree-view';

  import { IconChevronRight } from '$lib/io/icon';
  import { fieldLabelRecipe } from '$lib/io-poc/field';

  import {
    treeViewBranchContentRecipe,
    treeViewBranchControlRecipe,
    treeViewBranchIndicatorRecipe,
    treeViewIndentGuideRecipe,
    treeViewItemRecipe,
    treeViewNodeTextRecipe,
    treeViewRecipe,
    treeViewTreeRecipe,
  } from './recipe';

  let {
    nodes,
    label,
    labelHidden = false,
    selectedValue = $bindable([]),
    expandedValue = $bindable([]),
    selectionMode = 'single',
    typeahead = true,
    expandOnClick = true,
    onSelectionChange,
    onExpandedChange,
    id,
    'data-testid': testId,
    class: className,
    item,
  }: TreeViewProps = $props();

  const collection = $derived(
    createTreeCollection<TreeViewNode>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.label,
      isNodeDisabled: (node) => !!node.disabled,
      rootNode: { id: 'ROOT', label: '', children: nodes },
    }),
  );

  function handleSelectionChange(
    details: TreeViewSelectionChangeDetails<TreeViewNode>,
  ) {
    selectedValue = details.selectedValue;
    onSelectionChange?.(details.selectedValue);
  }

  function handleExpandedChange(
    details: TreeViewExpandedChangeDetails<TreeViewNode>,
  ) {
    expandedValue = details.expandedValue;
    onExpandedChange?.(details.expandedValue);
  }
</script>

{#snippet nodeContent(node: TreeViewNode, state: TreeViewNodeState)}
  {#if item}
    {@render item(node, state)}
  {:else}
    {#if node.Icon}
      <node.Icon width={16} height={16} class="shrink-0 text-secondary" />
    {/if}
    <span class="truncate">{node.label}</span>
  {/if}
{/snippet}

{#snippet treeNode(node: TreeViewNode, indexPath: number[])}
  <ArkTreeView.NodeProvider {node} {indexPath}>
    <ArkTreeView.NodeContext>
      {#snippet render(nodeState)}
        {@const state = nodeState()}
        {#if node.children}
          <ArkTreeView.Branch>
            <ArkTreeView.BranchControl class={treeViewBranchControlRecipe()}>
              <ArkTreeView.BranchIndicator
                class={treeViewBranchIndicatorRecipe()}
              >
                <IconChevronRight width={14} height={14} />
              </ArkTreeView.BranchIndicator>
              <ArkTreeView.BranchText class={treeViewNodeTextRecipe()}>
                {@render nodeContent(node, state)}
              </ArkTreeView.BranchText>
            </ArkTreeView.BranchControl>
            <ArkTreeView.BranchContent class={treeViewBranchContentRecipe()}>
              <ArkTreeView.BranchIndentGuide
                class={treeViewIndentGuideRecipe()}
              />
              {#each node.children as child, index (child.id)}
                {@render treeNode(child, [...indexPath, index])}
              {/each}
            </ArkTreeView.BranchContent>
          </ArkTreeView.Branch>
        {:else}
          <ArkTreeView.Item class={treeViewItemRecipe()}>
            <ArkTreeView.ItemText class={treeViewNodeTextRecipe()}>
              {@render nodeContent(node, state)}
            </ArkTreeView.ItemText>
          </ArkTreeView.Item>
        {/if}
      {/snippet}
    </ArkTreeView.NodeContext>
  </ArkTreeView.NodeProvider>
{/snippet}

<ArkTreeView.Root
  {id}
  {collection}
  {selectedValue}
  {expandedValue}
  {selectionMode}
  {typeahead}
  {expandOnClick}
  onSelectionChange={handleSelectionChange}
  onExpandedChange={handleExpandedChange}
  data-testid={testId}
  class={treeViewRecipe(className)}
>
  <ArkTreeView.Label class={fieldLabelRecipe({ hidden: labelHidden })}
    >{label}</ArkTreeView.Label
  >
  <ArkTreeView.Tree class={treeViewTreeRecipe()}>
    {#each nodes as node, index (node.id)}
      {@render treeNode(node, [index])}
    {/each}
  </ArkTreeView.Tree>
</ArkTreeView.Root>
