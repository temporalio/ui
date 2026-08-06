<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForWorkflowCatalogExample } from '$lib/utilities/route-for';

  import { changePendingRunCount } from './catalog-list-state';
  import type {
    WorkflowCatalogSessionState,
    WorkflowCatalogSessionStore,
  } from './session-store';
  import type {
    BrowserWorkflowCatalogDescriptor,
    BrowserWorkflowCatalogSource,
  } from './types';
  import type { WorkbenchHost } from './workbench-host';

  import {
    startWithDefaults,
    terminalStatusPresentation,
  } from './workbench.svelte';

  type SourceFilter = 'all' | BrowserWorkflowCatalogSource;

  interface Props {
    descriptors: readonly BrowserWorkflowCatalogDescriptor[];
    host: WorkbenchHost;
    sessionStore: WorkflowCatalogSessionStore;
  }

  let { descriptors, host, sessionStore }: Props = $props();

  let query = $state('');
  let filter = $state<SourceFilter>('all');
  let runError = $state('');
  let pendingRunCounts = $state<Record<string, number>>({});
  let sessions = $derived($sessionStore.sessions);
  let visibleDescriptors = $derived(
    descriptors.filter((descriptor) => {
      const matchesFilter = filter === 'all' || descriptor.source === filter;
      const searchable = [
        descriptor.title,
        descriptor.description,
        descriptor.execution.kind,
        ...descriptor.capabilityTags,
      ]
        .join(' ')
        .toLocaleLowerCase();

      return (
        matchesFilter && searchable.includes(query.trim().toLocaleLowerCase())
      );
    }),
  );

  const latestSession = (descriptor: BrowserWorkflowCatalogDescriptor) => {
    void sessions;
    return sessionStore.latest(descriptor.id, descriptor.execution);
  };

  const pendingRunCount = (exampleId: string) =>
    pendingRunCounts[exampleId] ?? 0;

  const sessionStateLabels: Record<WorkflowCatalogSessionState, string> = {
    'execution-terminal': 'Finished',
    'launch-rejected': 'Launch rejected',
    'launch-uncertain': 'Launch uncertain',
    'observation-paused': 'Observation paused',
    observing: 'Running',
    starting: 'Starting',
    stopped: 'Stopped',
  };

  const relativeRunTime = (createdAt: number) => {
    const distance = formatDistanceAbbreviated({
      start: createdAt,
      end: Date.now(),
      flexibleUnits: true,
    });

    return distance ? `${distance} ago` : 'just now';
  };

  const runDefaults = async (descriptor: BrowserWorkflowCatalogDescriptor) => {
    pendingRunCounts = changePendingRunCount(
      pendingRunCounts,
      descriptor.id,
      1,
    );
    runError = '';

    try {
      const result = await startWithDefaults({
        descriptor,
        host,
        sessionStore,
      });

      if ('error' in result) {
        runError =
          result.error === 'required-readiness-unavailable'
            ? 'A required dependency is unavailable.'
            : 'Unable to run this example.';
      }
    } finally {
      pendingRunCounts = changePendingRunCount(
        pendingRunCounts,
        descriptor.id,
        -1,
      );
    }
  };
</script>

<div class="space-y-4">
  <div
    role="search"
    aria-label="Filter example catalog"
    class="flex w-full flex-wrap items-center gap-2 border border-subtle bg-primary p-1.5"
  >
    <Input
      id="workflow-catalog-search"
      bind:value={query}
      icon="search"
      label="Search examples"
      labelHidden
      type="search"
      placeholder="Search examples"
      noBorder
      class="min-w-64 flex-1"
    />
    <div
      class="flex flex-wrap items-center gap-1"
      role="group"
      aria-label="Example source filter"
    >
      {#each ['all', 'shared', 'local'] as value (value)}
        <Button
          size="xs"
          variant="secondary"
          active={filter === value}
          aria-pressed={filter === value}
          onclick={() => (filter = value as SourceFilter)}
          >{value[0]?.toUpperCase()}{value.slice(1)}</Button
        >
      {/each}
    </div>
  </div>

  {#if runError}
    <p class="text-sm text-danger" role="alert">{runError}</p>
  {/if}

  <div class="catalog-table-region w-full overflow-x-auto">
    <Table aria-label="Workflow examples" fixed>
      {#snippet caption()}
        <caption class="sr-only">Workflow examples</caption>
      {/snippet}
      {#snippet headers()}
        <TableHeaderRow>
          <th scope="col" class="w-auto">Workflow</th>
          <th scope="col" class="w-20">Source</th>
          <th scope="col" class="hidden w-44 lg:table-cell">Task queue</th>
          <th scope="col" class="w-36">Latest run</th>
          <th
            scope="col"
            class="surface-table-header sticky right-0 z-20 w-36 !text-right sm:w-60"
            >Actions</th
          >
        </TableHeaderRow>
      {/snippet}
      {#if visibleDescriptors.length}
        {#each visibleDescriptors as descriptor (descriptor.id)}
          {@const latest = latestSession(descriptor)}
          {@const pending = pendingRunCount(descriptor.id)}
          <TableRow>
            <td class="min-w-0 py-2">
              <Link
                class="table-link block truncate text-sm font-medium text-primary"
                href={routeForWorkflowCatalogExample(descriptor.id)}
              >
                {descriptor.title}
              </Link>
              <p class="hidden truncate text-xs text-secondary sm:block">
                {descriptor.description}
              </p>
            </td>
            <td>
              <Badge
                type={descriptor.source === 'local' ? 'warning' : 'subtle'}
                class="px-1 py-0.5 text-xs leading-none"
              >
                {descriptor.source === 'local' ? 'Local' : 'Shared'}
              </Badge>
            </td>
            <td class="hidden truncate font-mono text-xs lg:table-cell">
              {descriptor.execution.taskQueue}
            </td>
            <td class="text-xs">
              {#if latest?.state === 'execution-terminal'}
                {@const status = terminalStatusPresentation(
                  latest.terminalStatus!,
                )}
                <div class="flex flex-col items-start gap-0.5">
                  <Badge
                    type={status.type}
                    class="px-1 py-0.5 text-xs leading-none"
                    >{status.label}</Badge
                  >
                  <span class="text-secondary"
                    >{relativeRunTime(latest.createdAt)}</span
                  >
                </div>
              {:else if latest}
                <div class="flex flex-col items-start gap-0.5">
                  <Badge type="subtle" class="px-1 py-0.5 text-xs leading-none"
                    >{sessionStateLabels[latest.state]}</Badge
                  >
                  <span class="text-secondary"
                    >{relativeRunTime(latest.createdAt)}</span
                  >
                </div>
              {:else}
                <span class="text-secondary">Not run</span>
              {/if}
            </td>
            <td
              class="catalog-actions-cell surface-primary sticky right-0 z-[5]"
            >
              <div class="flex items-center justify-end gap-1 sm:gap-2">
                <Button
                  href={routeForWorkflowCatalogExample(descriptor.id)}
                  aria-label="Configure"
                  leadingIcon="settings"
                  size="xs"
                  variant="secondary"
                >
                  <span class="hidden sm:inline">Configure</span>
                </Button>
                <div class="relative">
                  <Button
                    size="xs"
                    leadingIcon="play"
                    aria-label={pending ? `Run (${pending} pending)` : 'Run'}
                    onclick={() => runDefaults(descriptor)}>Run</Button
                  >
                  {#if pending}
                    <span
                      class="surface-primary pointer-events-none absolute -right-1 -top-1 min-w-4 rounded-full border border-subtle px-1 text-center text-[10px] leading-4 text-primary"
                      aria-hidden="true">{pending}</span
                    >
                  {/if}
                </div>
              </div>
            </td>
          </TableRow>
        {/each}
      {:else}
        <TableRow>
          <td colspan="5" class="py-6 text-center text-sm text-secondary">
            No examples match the current filters.
          </td>
        </TableRow>
      {/if}
    </Table>
  </div>
</div>

<style lang="postcss">
  .catalog-table-region {
    :global(.holocene-table-body tr:nth-of-type(odd) > .catalog-actions-cell) {
      @apply surface-background;
    }

    :global(.holocene-table-body tr:hover > .catalog-actions-cell) {
      @apply bg-interactive-table-hover bg-fixed;
    }
  }
</style>
