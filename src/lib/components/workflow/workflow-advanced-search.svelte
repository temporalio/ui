<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';
  import { page } from '$app/stores';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Input from '$lib/holocene/input/input.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { workflowsQuery } from '$lib/stores/workflows';

  let manualSearchString = '';

  $: query = $page.url.searchParams.get('query');

  function setManualString(query) {
    manualSearchString = query;
  }

  $: {
    setManualString(query);
  }

  const onSearch = () => {
    if (!manualSearchString) {
      $workflowFilters = [];
      $workflowSorts = [];
      $workflowsQuery = '';
    } else {
      try {
        $workflowFilters = toListWorkflowFilters(manualSearchString);
      } catch (e) {}
    }

    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: manualSearchString,
      allowEmpty: true,
    });
  };

  function handleClearInput() {
    onSearch();
  }
</script>

<div class="flex-items-center flex grow gap-4">
  <div class="flex h-12 w-full items-center gap-0" in:fade>
    <form
      on:submit|preventDefault={onSearch}
      class="relative flex h-12 w-full items-center gap-0"
      in:fly={{ x: -100, duration: 150 }}
    >
      <Input
        id="manual-search"
        placeholder={`Enter a query (i.e. WorkflowId="workflowid")`}
        icon="terminal"
        class="w-3/4"
        clearable
        unroundRight
        on:clear={handleClearInput}
        bind:value={manualSearchString}
      />
      <Button
        dataCy="manual-search-button"
        variant="primary"
        class="h-10"
        unroundLeft
        type="submit"
      >
        Run Query
      </Button>
    </form>
  </div>
</div>
