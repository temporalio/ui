<script lang="ts">
  import { page } from '$app/state';

  import TabButton from '$lib/holocene/tab-buttons/tab-button.svelte';
  import TabButtons from '$lib/holocene/tab-buttons/tab-buttons.svelte';
  import { currentPageKey } from '$lib/stores/pagination';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const setTab = (_query: string) => {
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: _query,
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
  };

  const query = $derived(page.url.searchParams.get('query'));
</script>

<TabButtons>
  <TabButton
    icon="add"
    data-testid="all"
    class="h-10"
    on:click={() => setTab('')}
  ></TabButton>
  <TabButton
    icon="bookmark"
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
  <TabButton
    data-testid="running"
    class="h-10"
    active={query === 'CustomKeywordField = "Kittens"'}
    on:click={() => setTab('CustomKeywordField = "Kittens"')}
    >Silly Kittens in the last 24 Hours</TabButton
  >
</TabButtons>
