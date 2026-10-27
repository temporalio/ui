<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Pagination, type PaginationVariant } from '$lib/io-ark/pagination';

  import PaginationExamples from '../../../examples/pagination-examples.svelte';
  import examplesSource from '../../../examples/pagination-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('pagination');

  const variants: PaginationVariant[] = ['full', 'compact'];
  const siblingCounts = ['0', '1', '2'] as const;

  let variant = $state<PaginationVariant>('full');
  let siblingCount = $state<(typeof siblingCounts)[number]>('1');
  let countText = $state('340');
  let label = $state('Workflow pages');
  let showSummary = $state(true);
  let pageSizes = $state(true);
  let page = $state(1);
  let pageSize = $state(25);

  const count = $derived(Math.max(0, Number(countText) || 0));

  const source = $derived(
    `<script lang="ts">
  import { Pagination } from '$lib/io-ark/pagination';
  let page = $state(1);
  let pageSize = $state(25);
</` +
      `script>

<Pagination
  count={${count}}
  bind:page
  bind:pageSize${variant !== 'full' ? `\n  variant="${variant}"` : ''}${siblingCount !== '1' ? `\n  siblingCount={${siblingCount}}` : ''}${pageSizes ? '\n  pageSizeOptions={[25, 50, 100]}' : ''}${!showSummary ? '\n  showSummary={false}' : ''}${label ? `\n  label={${JSON.stringify(label)}}` : ''}
/>`,
  );
</script>

<ComponentPage
  component={documentation}
  examples={PaginationExamples}
  {examplesSource}
  framed
>
  <Playground {source} filename="Pagination.svelte">
    {#snippet preview()}
      <div class="w-full">
        <Pagination
          id="pagination-preview"
          {count}
          bind:page
          bind:pageSize
          {variant}
          siblingCount={Number(siblingCount)}
          {showSummary}
          pageSizeOptions={pageSizes ? [25, 50, 100] : undefined}
          {label}
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          Page {page}, {pageSize} per page
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <SelectControl
        id="pagination-variant"
        label="Variant"
        options={variants}
        bind:value={variant}
      />
      <SelectControl
        id="pagination-sibling-count"
        label="Sibling count"
        options={siblingCounts}
        bind:value={siblingCount}
      />
      <Input
        id="pagination-count"
        label="Item count"
        type="number"
        bind:value={countText}
      />
      <Input id="pagination-label" label="Label" bind:value={label} />
      <Checkbox
        id="pagination-summary"
        label="Show summary"
        bind:checked={showSummary}
      />
      <Checkbox
        id="pagination-page-sizes"
        label="Page size options"
        bind:checked={pageSizes}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <Pagination
      id="pagination-anatomy"
      label="Workflow pages"
      count={340}
      page={3}
      pageSize={25}
      siblingCount={1}
    />
  {/snippet}
</ComponentPage>
