<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import {
    IconExternalLink,
    IconPlaySolid,
    IconSearch,
    IconTemporalSettings,
  } from '$lib/io/icon';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { changePendingRunCount } from './catalog-list-state';
  import { catalogSources } from './catalog-sources';
  import { terminalStatusPresentation } from './session-presentation';
  import type {
    CatalogSession,
    CatalogSessionState,
    CatalogSessionStore,
  } from './session-store';
  import { startWithDefaults } from './start-example';
  import type { BrowserCatalogDescriptor } from './types';
  import type { EvidenceLink, WorkbenchHost } from './workbench-host';

  type SourceFilter = 'all' | string;
  type RunBadgeType =
    | ReturnType<typeof terminalStatusPresentation>['type']
    | 'subtle';

  interface Props {
    descriptors: readonly BrowserCatalogDescriptor[];
    host: WorkbenchHost;
    sessionStore: CatalogSessionStore;
    exampleHref: (exampleId: string) => string;
  }

  let { descriptors, host, sessionStore, exampleHref }: Props = $props();

  let query = $state('');
  let filter = $state<SourceFilter>('all');
  let runError = $state('');
  let pendingRunCounts = $state<Record<string, number>>({});
  let sessions = $derived($sessionStore.sessions);
  let sources = $derived(catalogSources(descriptors));
  let visibleDescriptors = $derived(
    descriptors.filter((descriptor) => {
      const matchesFilter = filter === 'all' || descriptor.source.id === filter;
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

  const latestSession = (descriptor: BrowserCatalogDescriptor) => {
    void sessions;
    return sessionStore.latest(descriptor.id, descriptor.execution);
  };

  const pendingRunCount = (exampleId: string) =>
    pendingRunCounts[exampleId] ?? 0;

  const sessionStateLabels: Record<CatalogSessionState, string> = {
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

  const runDefaults = async (descriptor: BrowserCatalogDescriptor) => {
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

{#snippet sourceBadge(descriptor: BrowserCatalogDescriptor)}
  <Badge
    type={descriptor.source.id === 'local' ? 'warning' : 'subtle'}
    class="px-1 py-0.5 text-xs leading-none"
  >
    {descriptor.source.label}
  </Badge>
{/snippet}

{#snippet runBadge(
  type: RunBadgeType,
  label: string,
  evidence: EvidenceLink | undefined,
)}
  <span class="inline-flex items-center gap-1">
    <Badge {type} class="px-1 py-0.5 text-xs leading-none">{label}</Badge>
    {#if evidence}
      <Link
        href={evidence.href}
        aria-label={evidence.label}
        class="inline-flex items-center !no-underline"
      >
        <IconExternalLink class="h-3.5 w-3.5" />
      </Link>
    {/if}
  </span>
{/snippet}

{#snippet latestRun(latest: CatalogSession | undefined)}
  {@const evidence =
    latest?.outcome?.status === 'accepted'
      ? host.evidenceLink(latest.outcome)
      : undefined}
  {#if latest?.state === 'execution-terminal'}
    {@const status = terminalStatusPresentation(latest.terminalStatus!)}
    {@render runBadge(status.type, status.label, evidence)}
    <span class="text-secondary">{relativeRunTime(latest.createdAt)}</span>
  {:else if latest}
    {@render runBadge('subtle', sessionStateLabels[latest.state], evidence)}
    <span class="text-secondary">{relativeRunTime(latest.createdAt)}</span>
  {:else}
    <span class="text-secondary">Not run</span>
  {/if}
{/snippet}

<div class="space-y-4">
  <div
    role="search"
    aria-label="Filter example catalog"
    class="flex w-full flex-wrap items-center gap-2 border border-subtle bg-primary p-1.5"
  >
    <Input
      id="catalog-search"
      bind:value={query}
      Icon={IconSearch}
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
      <Button
        size="xs"
        variant="secondary"
        active={filter === 'all'}
        aria-pressed={filter === 'all'}
        onclick={() => (filter = 'all')}>All</Button
      >
      {#each sources as source (source.id)}
        <Button
          size="xs"
          variant="secondary"
          active={filter === source.id}
          aria-pressed={filter === source.id}
          onclick={() => (filter = source.id)}>{source.label}</Button
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
          <th scope="col" class="hidden w-20 sm:table-cell">Source</th>
          <th scope="col" class="hidden w-44 lg:table-cell">Task queue</th>
          <th scope="col" class="hidden w-36 sm:table-cell">Latest run</th>
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
                class="table-link block break-words text-sm font-medium text-primary"
                href={exampleHref(descriptor.id)}
              >
                {descriptor.title}
              </Link>
              <p class="hidden truncate text-xs text-secondary sm:block">
                {descriptor.description}
              </p>
              <div
                class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:hidden"
              >
                {@render sourceBadge(descriptor)}
                {@render latestRun(latest)}
              </div>
            </td>
            <td class="hidden sm:table-cell">
              {@render sourceBadge(descriptor)}
            </td>
            <td class="hidden truncate font-mono text-xs lg:table-cell">
              {descriptor.execution.taskQueue}
            </td>
            <td class="hidden text-xs sm:table-cell">
              <div class="flex flex-col items-start gap-0.5">
                {@render latestRun(latest)}
              </div>
            </td>
            <td
              class="catalog-actions-cell surface-primary sticky right-0 z-[5]"
            >
              <div class="flex items-center justify-end gap-1 sm:gap-2">
                <Button
                  href={exampleHref(descriptor.id)}
                  aria-label="Configure"
                  LeadingIcon={IconTemporalSettings}
                  size="xs"
                  variant="secondary"
                >
                  <span class="hidden sm:inline">Configure</span>
                </Button>
                <div class="relative">
                  <Button
                    size="xs"
                    LeadingIcon={IconPlaySolid}
                    aria-label={pending
                      ? `Start (${pending} pending)`
                      : 'Start'}
                    onclick={() => runDefaults(descriptor)}>Start</Button
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
