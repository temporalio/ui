<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import IconSearch from '$lib/io/icon/icons/search.svelte';
  import IconSliders from '$lib/io/icon/icons/sliders.svelte';

  import {
    activeCatalogFilters,
    catalogFacets,
    type CatalogFilterKey,
    type CatalogFilters,
    changePendingRunCount,
    clearCatalogFilters,
    drawerFilterKeys,
    emptyCatalogFilters,
    toggleCatalogFilter,
  } from './catalog-list-state';
  import { catalogSources } from './catalog-sources';
  import { type CatalogSessionStore, findLatestSession } from './session-store';
  import { startWithDefaults } from './start-example';
  import type { BrowserCatalogDescriptor } from './types';
  import type { WorkbenchHost } from './workbench-host';

  import CatalogExampleRow from './catalog-example-row.svelte';
  import CatalogFacetOption from './catalog-facet-option.svelte';
  import CatalogFacetSidebar from './catalog-facet-sidebar.svelte';
  import CatalogFilterDrawer from './catalog-filter-drawer.svelte';
  import CatalogFilterSummary from './catalog-filter-summary.svelte';

  interface Props {
    descriptors: readonly BrowserCatalogDescriptor[];
    host: WorkbenchHost;
    sessionStore: CatalogSessionStore;
    exampleHref: (exampleId: string) => string;
    initialFilters?: CatalogFilters;
    onfilterschange?: (filters: CatalogFilters) => void;
  }

  let {
    descriptors,
    host,
    sessionStore,
    exampleHref,
    initialFilters = emptyCatalogFilters,
    onfilterschange,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let filters = $state<CatalogFilters>({ ...initialFilters });
  let filtersOpen = $state(false);
  let runError = $state('');
  let pendingRunCounts = $state<Record<string, number>>({});
  let workerUnavailable = $state(false);

  const sources = $derived(catalogSources(descriptors));
  const facets = $derived(catalogFacets(descriptors, sources, filters));
  const activeFilters = $derived(activeCatalogFilters(facets, filters));
  const drawerFilterCount = $derived(
    activeFilters.filter(({ key }) => drawerFilterKeys.includes(key)).length,
  );
  const latestSessions = $derived(
    new Map(
      descriptors.map((descriptor) => [
        descriptor.id,
        findLatestSession(
          $sessionStore.sessions,
          descriptor.id,
          descriptor.execution,
        ),
      ]),
    ),
  );

  const setFilters = (next: CatalogFilters) => {
    filters = next;
    onfilterschange?.(next);
  };

  const selectFilter = (key: CatalogFilterKey, value: string | null) =>
    setFilters(toggleCatalogFilter(filters, key, value));

  const removeFilter = (key: CatalogFilterKey) =>
    setFilters(clearCatalogFilters(filters, [key]));

  const removeFilters = () => setFilters(clearCatalogFilters(filters));

  const removeDrawerFilters = () =>
    setFilters(clearCatalogFilters(filters, drawerFilterKeys));

  const search = (event: Event & { currentTarget: HTMLInputElement }) =>
    setFilters({ ...filters, query: event.currentTarget.value });

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

  const startErrorMessage = (error: string) =>
    error === 'required-readiness-unavailable'
      ? 'A required dependency is unavailable.'
      : 'Unable to run this example.';

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
      if ('error' in result) runError = startErrorMessage(result.error);
    } finally {
      pendingRunCounts = changePendingRunCount(
        pendingRunCounts,
        descriptor.id,
        -1,
      );
    }
  };
</script>

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
  <CatalogFacetSidebar {facets} {filters} onselect={selectFilter} />

  <div class="flex min-w-0 flex-1 flex-col gap-3">
    <div role="search" aria-label="Search example catalog">
      <Input
        id="catalog-search"
        value={filters.query}
        oninput={search}
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
        {#each facets.options.kind as option (option.id)}
          <CatalogFacetOption
            {option}
            variant="chip"
            label={option.id === null ? 'All' : option.label}
            pressed={filters.kind === option.id}
            onclick={() => selectFilter('kind', option.id)}
          />
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

    <CatalogFilterSummary
      shown={facets.descriptors.length}
      total={descriptors.length}
      {activeFilters}
      onremove={removeFilter}
      onclear={removeFilters}
    />

    {#if runError}
      <p class="text-sm text-danger" role="alert">{runError}</p>
    {/if}

    <ul
      class="divide-y divide-primary overflow-hidden rounded-lg border border-primary bg-surface-primary"
      aria-label="Catalog examples"
    >
      {#each facets.descriptors as descriptor (descriptor.id)}
        <CatalogExampleRow
          {descriptor}
          {host}
          latest={latestSessions.get(descriptor.id)}
          pendingRuns={pendingRunCounts[descriptor.id] ?? 0}
          selectedFeature={filters.feature}
          href={exampleHref(descriptor.id)}
          onfeature={(feature) => selectFilter('feature', feature)}
          onstart={() => runDefaults(descriptor)}
        />
      {:else}
        <li
          class="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-secondary"
        >
          No examples match the current filters.
          {#if activeFilters.length}
            <Button size="xs" variant="ghost" onclick={removeFilters}
              >Clear filters</Button
            >
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<CatalogFilterDrawer
  bind:open={filtersOpen}
  {facets}
  {filters}
  onselect={selectFilter}
  onclear={removeDrawerFilters}
/>
