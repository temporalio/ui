<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { TreeView, type TreeViewNode } from '$lib/io-ark/tree-view';

  import TreeViewExamples from '../../../examples/tree-view-examples.svelte';
  import examplesSource from '../../../examples/tree-view-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('tree-view');

  const nodes: TreeViewNode[] = [
    {
      id: 'payments-prod',
      label: 'payments-prod',
      children: [
        { id: 'charges', label: 'charges' },
        { id: 'refunds', label: 'refunds' },
        {
          id: 'payouts',
          label: 'payouts',
          children: [
            { id: 'payouts-daily', label: 'payouts-daily' },
            { id: 'payouts-weekly', label: 'payouts-weekly' },
          ],
        },
      ],
    },
    {
      id: 'orders-prod',
      label: 'orders-prod',
      children: [
        { id: 'fulfillment', label: 'fulfillment' },
        { id: 'notifications', label: 'notifications', disabled: true },
      ],
    },
  ];

  const selectionModes = ['single', 'multiple'] as const;
  let label = $state('Task queues');
  let selectionMode = $state<(typeof selectionModes)[number]>('single');
  let labelHidden = $state(false);
  let expandOnClick = $state(true);
  let typeahead = $state(true);
  let selectedValue = $state<string[]>([]);
  let expandedValue = $state<string[]>(['payments-prod']);

  const source = $derived(
    `<script lang="ts">
  import { TreeView, type TreeViewNode } from '$lib/io-ark/tree-view';

  const nodes: TreeViewNode[] = [
    {
      id: 'payments-prod',
      label: 'payments-prod',
      children: [
        { id: 'charges', label: 'charges' },
        { id: 'refunds', label: 'refunds' },
      ],
    },
  ];
  let selectedValue = $state<string[]>([]);
  let expandedValue = $state<string[]>(['payments-prod']);
</` +
      `script>

<TreeView
  label={${JSON.stringify(label)}}
  {nodes}${selectionMode === 'multiple' ? '\n  selectionMode="multiple"' : ''}${labelHidden ? '\n  labelHidden' : ''}${!expandOnClick ? '\n  expandOnClick={false}' : ''}${!typeahead ? '\n  typeahead={false}' : ''}
  bind:selectedValue
  bind:expandedValue
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={TreeViewExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="TreeView.svelte">
    {#snippet preview()}
      <div class="w-full max-w-xs">
        <TreeView
          id="tree-view-preview"
          {label}
          {nodes}
          {selectionMode}
          {labelHidden}
          {expandOnClick}
          {typeahead}
          bind:selectedValue
          bind:expandedValue
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          Selected: {selectedValue.join(', ') || 'none'}
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="tree-view-label" label="Label" bind:value={label} />
      <SelectControl
        id="tree-view-selection-mode"
        label="Selection mode"
        options={selectionModes}
        bind:value={selectionMode}
      />
      <Checkbox
        id="tree-view-label-hidden"
        label="Hide label"
        bind:checked={labelHidden}
      />
      <Checkbox
        id="tree-view-expand-on-click"
        label="Expand on click"
        bind:checked={expandOnClick}
      />
      <Checkbox
        id="tree-view-typeahead"
        label="Typeahead"
        bind:checked={typeahead}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <TreeView
      id="tree-view-anatomy"
      label="Workflows"
      expandedValue={['orders']}
      selectedValue={['charge']}
      nodes={[
        {
          id: 'orders',
          label: 'order-fulfillment',
          children: [
            { id: 'charge', label: 'charge-payment' },
            { id: 'ship', label: 'ship-order' },
          ],
        },
        {
          id: 'billing',
          label: 'billing-sync',
          children: [{ id: 'invoice', label: 'send-invoice' }],
        },
        { id: 'audit', label: 'audit-log' },
      ]}
      class="w-full"
    />
  {/snippet}
</ComponentPage>
