<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { BadgeStatus, type BadgeStatusValue } from '$lib/io/badge-status';
  import { Button } from '$lib/io/button';
  import { ChipStatus } from '$lib/io/chip-status';
  import { IconRetry, IconSearch } from '$lib/io/icon';
  import { PageHeader } from '$lib/io/layouts/page-header';
  import { Segment, SegmentedControl } from '$lib/io/segmented-control';
  import { TextLink } from '$lib/io/text-link';

  type PageState = 'results' | 'no-results' | 'empty';

  const workflows: {
    id: string;
    type: string;
    status: BadgeStatusValue;
    started: string;
  }[] = [
    {
      id: 'order-4821',
      type: 'OrderWorkflow',
      status: 'Running',
      started: '14:32',
    },
    {
      id: 'order-4820',
      type: 'OrderWorkflow',
      status: 'Completed',
      started: '14:29',
    },
    {
      id: 'refund-112',
      type: 'RefundWorkflow',
      status: 'Failed',
      started: '14:20',
    },
  ];

  const statusFilters: BadgeStatusValue[] = ['Running', 'Completed', 'Failed'];

  let pageState = $state<PageState>('results');
  let search = $state('');

  const rows = $derived(
    pageState === 'results'
      ? workflows.filter(({ id }) => id.includes(search.trim().toLowerCase()))
      : [],
  );
</script>

<div class="flex w-full flex-col gap-6">
  <SegmentedControl aria-label="Page state">
    {#each [{ value: 'results', label: 'Results' }, { value: 'no-results', label: 'No results' }, { value: 'empty', label: 'First run' }] as option (option.value)}
      <Segment
        selected={pageState === option.value}
        aria-pressed={pageState === option.value}
        onclick={() => (pageState = option.value as PageState)}
      >
        {option.label}
      </Segment>
    {/each}
  </SegmentedControl>

  <div class="flex flex-col gap-4 border border-primary p-4">
    {#if pageState === 'empty'}
      <!-- Nothing exists yet: explain the page and offer the first action. -->
      <EmptyState
        title="No workflows yet"
        content="Workflows you start in this namespace appear here."
      >
        <Button>Start Workflow</Button>
      </EmptyState>
    {:else}
      <PageHeader>
        {#snippet heading()}
          {rows.length} Workflows
        {/snippet}
        {#snippet headingActions()}
          <Button
            colorScheme="ghost"
            size="sm"
            LeadingIcon={IconRetry}
            aria-label="Refresh"
          />
        {/snippet}
        {#snippet actions()}
          <Button size="sm">Start Workflow</Button>
        {/snippet}
        {#snippet filters()}
          {#each statusFilters as status (status)}
            <ChipStatus {status} count={pageState === 'results' ? 1 : 0} />
          {/each}
        {/snippet}
      </PageHeader>

      <Input
        id="guide-list-search"
        label="Search workflows"
        labelHidden
        type="search"
        placeholder="Search workflows"
        Icon={IconSearch}
        bind:value={search}
      />

      <Table class="w-full">
        {#snippet caption()}
          <caption class="sr-only">Workflows</caption>
        {/snippet}
        {#snippet headers()}
          <TableHeaderRow>
            <th>Status</th>
            <th>Workflow ID</th>
            <th>Type</th>
            <th>Start</th>
          </TableHeaderRow>
        {/snippet}
        {#each rows as workflow (workflow.id)}
          <tr>
            <td><BadgeStatus status={workflow.status} /></td>
            <td><TextLink href="#{workflow.id}">{workflow.id}</TextLink></td>
            <td>{workflow.type}</td>
            <td>{workflow.started}</td>
          </tr>
        {/each}
        {#snippet emptyState()}
          <!-- Something exists, but the search or filters hide it. -->
          {#if !rows.length}
            <EmptyState
              title="No workflows match"
              content="Try a different search or clear the filters."
            />
          {/if}
        {/snippet}
      </Table>
    {/if}
  </div>
</div>
