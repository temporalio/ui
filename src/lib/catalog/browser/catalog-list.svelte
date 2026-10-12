<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Chip from '$lib/holocene/chip.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { Badge, type BadgeColorScheme } from '$lib/io/badge';
  import { BadgeStatus, type BadgeStatusValue } from '$lib/io/badge-status';
  import {
    IconExternalLink,
    IconPlaySolid,
    IconSearch,
    IconSliders,
    IconTemporalSettings,
  } from '$lib/io/icon';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import {
    capabilityTagLabel,
    type CatalogExecutionKind,
    type CatalogFacetOption,
    catalogFacets,
    type CatalogFilters,
    catalogKind,
    changePendingRunCount,
    emptyCatalogFilters,
  } from './catalog-list-state';
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

  interface Props {
    descriptors: readonly BrowserCatalogDescriptor[];
    host: WorkbenchHost;
    sessionStore: CatalogSessionStore;
    exampleHref: (exampleId: string) => string;
  }

  let { descriptors, host, sessionStore, exampleHref }: Props = $props();

  type FilterKey = 'kind' | 'tag' | 'source';

  let filters = $state<CatalogFilters>({ ...emptyCatalogFilters });
  let filtersOpen = $state(false);
  let runError = $state('');
  let pendingRunCounts = $state<Record<string, number>>({});
  let workerUnavailable = $state(false);
  let sessions = $derived($sessionStore.sessions);
  let sources = $derived(catalogSources(descriptors));
  let facets = $derived(catalogFacets(descriptors, sources, filters));
  let activeFilters = $derived(
    [
      filters.kind !== 'all' && {
        key: 'kind' as const,
        label: catalogKind(filters.kind).label,
      },
      filters.tag && {
        key: 'tag' as const,
        label: capabilityTagLabel(filters.tag),
      },
      filters.source !== 'all' && {
        key: 'source' as const,
        label:
          sources.find(({ id }) => id === filters.source)?.label ??
          filters.source,
      },
    ].filter((filter): filter is { key: FilterKey; label: string } =>
      Boolean(filter),
    ),
  );
  let drawerFilterCount = $derived(
    activeFilters.filter(({ key }) => key !== 'kind').length,
  );

  const kindColors: Record<CatalogExecutionKind, BadgeColorScheme> = {
    workflow: 'info',
    'standalone-activity': 'accent',
    'standalone-nexus-operation': 'success',
  };

  const toggleTag = (tag: string) => {
    filters.tag = filters.tag === tag ? null : tag;
  };

  const clearFilter = (key: FilterKey) => {
    filters = { ...filters, [key]: emptyCatalogFilters[key] };
  };

  const clearFilters = () => {
    filters = { ...emptyCatalogFilters, query: filters.query };
  };

  const exampleCount = (count: number) =>
    count === 1 ? '1 example' : `${count} examples`;

  $effect(() => {
    const [example] = descriptors;
    if (!example) return;
    const controller = new AbortController();

    host
      .checkReadiness(example.id, controller.signal)
      .then((checks) => {
        workerUnavailable = checks.some(
          (check) => check.kind === 'worker' && check.state === 'unavailable',
        );
      })
      .catch(() => {});

    return () => controller.abort();
  });

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
    text={descriptor.source.label}
    colorScheme={descriptor.source.id === 'local' ? 'warning' : 'neutral'}
  />
{/snippet}

{#snippet runBadge(
  label: string,
  evidence: EvidenceLink | undefined,
  status: BadgeStatusValue | undefined,
)}
  <span class="inline-flex items-center gap-1">
    {#if status}
      <BadgeStatus {status} text={label} />
    {:else}
      <Badge text={label} />
    {/if}
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
    {@render runBadge(status.label, evidence, status.status)}
    <span class="text-secondary">{relativeRunTime(latest.createdAt)}</span>
  {:else if latest}
    {@render runBadge(sessionStateLabels[latest.state], evidence, undefined)}
    <span class="text-secondary">{relativeRunTime(latest.createdAt)}</span>
  {:else}
    <span class="text-secondary">Not run</span>
  {/if}
{/snippet}

{#snippet count(value: number)}
  <span
    class="rounded-full bg-surface-tertiary px-1.5 text-xs tabular-nums leading-4 text-secondary"
    >{value}</span
  >
{/snippet}

{#snippet facetOption(
  option: CatalogFacetOption,
  pressed: boolean,
  onclick: () => void,
)}
  <button
    type="button"
    class="catalog-facet-option"
    class:text-secondary={!option.count && !pressed}
    aria-pressed={pressed}
    {onclick}
  >
    <span class="min-w-0 flex-1 truncate">{option.label}</span>
    {@render count(option.count)}
  </button>
{/snippet}

{#snippet facetChip(
  option: CatalogFacetOption,
  pressed: boolean,
  onclick: () => void,
)}
  <button
    type="button"
    class="catalog-facet-chip"
    class:text-secondary={!option.count && !pressed}
    aria-pressed={pressed}
    {onclick}
  >
    {option.label}
    {@render count(option.count)}
  </button>
{/snippet}

{#snippet featureOptions(chips: boolean)}
  {#each facets.features as option (option.id)}
    {@render (chips ? facetChip : facetOption)(
      option,
      filters.tag === option.id,
      () => toggleTag(option.id),
    )}
  {/each}
{/snippet}

{#snippet sourceOptions(chips: boolean)}
  {#each facets.sources as option (option.id)}
    {@render (chips ? facetChip : facetOption)(
      option,
      filters.source === option.id,
      () => (filters.source = option.id),
    )}
  {/each}
{/snippet}

<Alert
  intent="warning"
  title="No Worker is polling"
  data-testid="catalog-worker-unavailable"
  hidden={!workerUnavailable}
>
  <p>Catalog examples will wait until a Worker is running.</p>
  <p class="-mt-2 flex items-end gap-1">
    Start one with:
    <Copyable
      visible
      clickAllToCopy
      content="pnpm catalog worker"
      copyIconTitle="Copy the worker start command"
      copySuccessIconTitle="Copied the worker start command"
      container-class="mt-2"
      class="font-mono text-xs"
    />
  </p>
</Alert>

<div class="flex items-start gap-6">
  <nav
    aria-label="Filter examples"
    class="hidden w-60 shrink-0 flex-col gap-5 md:flex"
  >
    <fieldset class="catalog-facet">
      <legend class="catalog-facet-title">Execution kind</legend>
      {#each facets.kinds as option (option.id)}
        {@render facetOption(
          option,
          filters.kind === option.id,
          () => (filters.kind = option.id),
        )}
      {/each}
    </fieldset>
    <fieldset class="catalog-facet">
      <legend class="catalog-facet-title">Feature</legend>
      {@render featureOptions(false)}
    </fieldset>
    <fieldset class="catalog-facet">
      <legend class="catalog-facet-title">Source</legend>
      {@render sourceOptions(false)}
    </fieldset>
  </nav>

  <div class="flex min-w-0 flex-1 flex-col gap-3">
    <div role="search" aria-label="Search example catalog">
      <Input
        id="catalog-search"
        bind:value={filters.query}
        Icon={IconSearch}
        label="Search examples"
        labelHidden
        type="search"
        placeholder="Search examples"
      />
    </div>

    <div class="flex flex-col gap-2 md:hidden">
      <div
        class="-mx-4 flex gap-1.5 overflow-x-auto px-4 py-0.5"
        role="group"
        aria-label="Execution kind"
      >
        {#each facets.kinds as option (option.id)}
          {@render facetChip(
            { ...option, label: option.id === 'all' ? 'All' : option.label },
            filters.kind === option.id,
            () => (filters.kind = option.id),
          )}
        {/each}
      </div>
      <Button
        size="xs"
        variant="secondary"
        LeadingIcon={IconSliders}
        aria-haspopup="dialog"
        aria-controls="catalog-filters"
        onclick={() => (filtersOpen = true)}
      >
        Filters
        {#if drawerFilterCount}
          <span
            class="rounded-full bg-interactive-primary px-1.5 text-xs leading-4 text-white"
            >{drawerFilterCount}</span
          >
        {/if}
      </Button>
    </div>

    <div
      class="flex min-h-8 flex-wrap items-center gap-2 text-sm text-secondary"
      aria-live="polite"
      data-testid="catalog-summary"
    >
      <span
        ><strong class="text-primary">{facets.descriptors.length}</strong> of {descriptors.length}
        examples</span
      >
      {#each activeFilters as filter (filter.key)}
        <Chip
          removeButtonLabel={`Remove filter ${filter.label}`}
          onremove={() => clearFilter(filter.key)}>{filter.label}</Chip
        >
      {/each}
      {#if activeFilters.length}
        <Button size="xs" variant="ghost" onclick={clearFilters}
          >Clear filters</Button
        >
      {/if}
    </div>

    {#if runError}
      <p class="text-sm text-danger" role="alert">{runError}</p>
    {/if}

    <ul
      class="divide-y divide-primary border border-primary bg-surface-primary"
      aria-label="Catalog examples"
    >
      {#each facets.descriptors as descriptor (descriptor.id)}
        {@const latest = latestSession(descriptor)}
        {@const pending = pendingRunCount(descriptor.id)}
        {@const kind = catalogKind(descriptor.execution.kind)}
        <li
          class="grid grid-cols-1 items-center gap-3 px-3.5 py-3 hover:bg-interactive-tertiary-hover sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:gap-4"
        >
          <div class="min-w-0">
            <Link
              class="table-link block break-words text-sm font-medium text-primary"
              href={exampleHref(descriptor.id)}
            >
              {descriptor.title}
            </Link>
            <div
              class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-secondary"
            >
              <Badge
                text={kind.label}
                colorScheme={kindColors[descriptor.execution.kind]}
              />
              <span
                >{kind.locationHeader}
                <span class="break-all font-mono"
                  >{kind.location(descriptor)}</span
                ></span
              >
              {@render sourceBadge(descriptor)}
            </div>
            <p class="mt-1 max-w-[70ch] text-xs text-secondary">
              {descriptor.description}
            </p>
            {#if descriptor.capabilityTags.length}
              <div
                class="mt-1.5 flex flex-wrap gap-1"
                role="group"
                aria-label={`${descriptor.title} features`}
              >
                {#each descriptor.capabilityTags as tag (tag)}
                  <button
                    type="button"
                    class="catalog-tag"
                    aria-pressed={filters.tag === tag}
                    onclick={() => toggleTag(tag)}
                    >{capabilityTagLabel(tag)}</button
                  >
                {/each}
              </div>
            {/if}
          </div>
          <div
            class="flex flex-row flex-wrap items-center gap-2 text-xs sm:flex-col sm:items-start sm:gap-0.5"
          >
            {@render latestRun(latest)}
          </div>
          <div class="flex items-center gap-2 sm:justify-end">
            <Button
              href={exampleHref(descriptor.id)}
              aria-label="Configure"
              LeadingIcon={IconTemporalSettings}
              size="xs"
              variant="secondary"
            >
              Configure
            </Button>
            <div class="relative">
              <Button
                size="xs"
                LeadingIcon={IconPlaySolid}
                aria-label={pending ? `Start (${pending} pending)` : 'Start'}
                onclick={() => runDefaults(descriptor)}>Start</Button
              >
              {#if pending}
                <span
                  class="pointer-events-none absolute -right-1 -top-1 min-w-4 rounded-full border border-primary bg-surface-primary px-1 text-center text-[10px] leading-4 text-primary"
                  aria-hidden="true">{pending}</span
                >
              {/if}
            </div>
          </div>
        </li>
      {:else}
        <li
          class="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-secondary"
        >
          No examples match the current filters.
          {#if activeFilters.length}
            <Button size="xs" variant="ghost" onclick={clearFilters}
              >Clear filters</Button
            >
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<Drawer
  bind:open={filtersOpen}
  id="catalog-filters"
  position="bottom"
  dark={false}
  closeButtonLabel="Close filters"
  onClick={() => (filtersOpen = false)}
  class="max-h-[82vh] md:hidden"
>
  <DrawerContent title="Filters" class="flex flex-col gap-5">
    <fieldset class="catalog-facet">
      <legend class="catalog-facet-title">Feature</legend>
      <div class="flex flex-wrap gap-1.5">{@render featureOptions(true)}</div>
    </fieldset>
    <fieldset class="catalog-facet">
      <legend class="catalog-facet-title">Source</legend>
      <div class="flex flex-wrap gap-1.5">{@render sourceOptions(true)}</div>
    </fieldset>
    <div class="flex gap-2">
      <Button
        variant="secondary"
        class="flex-1"
        onclick={() => {
          filters = { ...filters, tag: null, source: 'all' };
        }}>Clear</Button
      >
      <Button class="flex-1" onclick={() => (filtersOpen = false)}
        >Show {exampleCount(facets.descriptors.length)}</Button
      >
    </div>
  </DrawerContent>
</Drawer>

<style lang="postcss">
  .catalog-facet {
    @apply flex min-w-0 flex-col gap-0.5;
  }

  .catalog-facet-title {
    @apply mb-1.5 text-xs font-medium uppercase tracking-wider text-secondary;
  }

  .catalog-facet-option {
    @apply flex min-h-8 w-full items-center gap-2 border-l-2 border-transparent px-2 text-left text-sm hover:bg-interactive-secondary-hover;

    &[aria-pressed='true'] {
      @apply border-brand bg-interactive-secondary-press font-medium;
    }
  }

  .catalog-facet-chip {
    @apply inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap border border-primary bg-surface-primary px-3 text-sm;

    &[aria-pressed='true'] {
      @apply border-brand bg-interactive-secondary-press font-medium;
    }
  }

  .catalog-tag {
    @apply h-[22px] border border-primary px-1.5 text-xs text-secondary hover:border-brand hover:text-primary;

    &[aria-pressed='true'] {
      @apply border-brand bg-interactive-secondary-hover text-primary;
    }
  }
</style>
