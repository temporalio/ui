<script lang="ts">
  import { page } from '$app/state';

  import QueryPalette from '$lib/components/query-palette/index.svelte';
  import Button from '$lib/holocene/button.svelte';
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

<div>
  <Button
    variant="secondary"
    leadingIcon="search"
    data-testid="search"
    class="h-10"
    on:click={() => showCommandPalette()}
  ></Button>
  <Button
    data-testid="all"
    class="h-10"
    variant={query === '' ? 'primary' : 'secondary'}
    on:click={() => setTab('')}>All</Button
  >
  <Button
    data-testid="today"
    class="h-10"
    variant={query === `StartTime >= "${getToday()}"` ? 'primary' : 'secondary'}
    on:click={() => setTab(`StartTime >= "${getToday()}"`)}
  >
    Today</Button
  >
  <Button
    data-testid="last-hour"
    class="h-10"
    variant={query === `StartTime >= "${getLastHour()}"`
      ? 'primary'
      : 'secondary'}
    on:click={() => setTab(`StartTime >= "${getLastHour()}"`)}>Last Hour</Button
  >
  {#each $savedQueries as savedQuery}
    <Button
      variant={query === savedQuery.query ? 'primary' : 'secondary'}
      leadingIcon="bookmark"
      data-testid={savedQuery.id}
      class="h-10"
      on:click={() => setTab(savedQuery.query)}
      on:dblclick={() => {
        editingQuery = savedQuery;
        viewCommandPalette = true;
      }}
    >
      <p class="max-w-24 truncate text-xs">{savedQuery.name}</p>
    </Button>
  {/each}
</div>
<QueryPalette bind:open={viewCommandPalette} bind:editingQuery />
