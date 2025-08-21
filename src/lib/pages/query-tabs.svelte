<script lang="ts">
  import { page } from '$app/state';

  import QueryPalette from '$lib/components/query-palette/index.svelte';
  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const query = $derived(page.url.searchParams.get('query'));

  let viewCommandPalette = $state(false);
  let editingQuery: SavedQuery | undefined = $state();

  const setTab = (_query: string) => {
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: _query,
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
  };

  const showCommandPalette = () => {
    viewCommandPalette = true;
  };
</script>

<TabButtons>
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
    on:click={() => setTab('')}>All</TabButton
  >
  <TabButton
    data-testid="running"
    class="h-10"
    active={query === "StartTime >= '2025-08-19T05:00:00.000Z'"}
    on:click={() => setTab("StartTime >= '2025-08-19T05:00:00.000Z'")}
    >Today</TabButton
  >
  <TabButton
    data-testid="running"
    class="h-10"
    active={query === 'ExecutionStatus = "Running"'}
    on:click={() => setTab('ExecutionStatus = "Running"')}>Running</TabButton
  >
  <TabButton
    data-testid="failed"
    class="h-10"
    active={query === 'ExecutionStatus = "Failed"'}
    on:click={() => setTab('ExecutionStatus = "Failed"')}>Failed</TabButton
  >
  {#each $savedQueries as savedQuery}
    <TabButton
      icon="bookmark"
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
<QueryPalette bind:open={viewCommandPalette} {editingQuery} />
