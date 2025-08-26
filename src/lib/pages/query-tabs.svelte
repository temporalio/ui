<script lang="ts">
  import { page } from '$app/state';

  import QueryPalette from '$lib/components/query-palette/index.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const query = $derived(page.url.searchParams.get('query'));

  let viewCommandPalette = $state(false);
  let editingQuery: SavedQuery | undefined = $state(undefined);

  const setTab = (_query: string) => {
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: _query,
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
    if (_query) {
      $workflowFilters = toListWorkflowFilters(_query, $searchAttributes);
    }
  };

  const showCommandPalette = () => {
    viewCommandPalette = true;
  };

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  };

  const getLastHour = () => {
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);
    lastHour.setSeconds(0, 0);
    return lastHour.toISOString();
  };
</script>

<TabButtons class="w-full overflow-auto">
  <TabButton
    icon="search"
    data-testid="search"
    class="h-10"
    on:click={() => showCommandPalette()}
  ></TabButton>
  <TabButton
    data-testid="all"
    class="h-10"
    active={query === ''}
    on:click={() => setTab('')}><p class="text-xs">All</p></TabButton
  >
  <TabButton
    data-testid="today"
    class="h-10"
    active={query === `StartTime >= "${getToday()}"`}
    on:click={() => setTab(`StartTime >= "${getToday()}"`)}
  >
    <p class="text-xs">Today</p></TabButton
  >
  <TabButton
    data-testid="last-hour"
    class="h-10"
    active={query === `StartTime >= "${getLastHour()}"`}
    on:click={() => setTab(`StartTime >= "${getLastHour()}"`)}
    ><p class="text-xs">Last Hour</p></TabButton
  >
  {#each $savedQueries as savedQuery}
    <TabButton
      data-testid={savedQuery.id}
      class="h-10"
      active={query === savedQuery.query}
      on:click={() => setTab(savedQuery.query)}
      on:dblclick={() => {
        editingQuery = savedQuery;
        viewCommandPalette = true;
      }}
    >
      <p class="max-w-24 truncate text-xs">{savedQuery.name}</p>
    </TabButton>
  {/each}
</TabButtons>
<QueryPalette bind:open={viewCommandPalette} bind:editingQuery />
