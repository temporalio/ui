<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';
  import { page } from '$app/stores';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Input from '$lib/holocene/input/input.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { toListWorkflowAdvancedParameters } from '$lib/utilities/query/to-list-workflow-advanced-parameters';

  let manualSearchString = '';

  $: query = $page.url.searchParams.get('query');

  function setManualString(query) {
    manualSearchString = query;
  }

  $: {
    setManualString(query);
  }

  const onSearch = () => {
    try {
      $workflowFilters = toListWorkflowAdvancedParameters(manualSearchString);
    } catch (e) {}

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
    <div
      class="relative flex h-12 w-full items-center gap-0"
      in:fly={{ x: -100, duration: 150 }}
    >
      <Input
        id="manual-search"
        placeholder="Enter a query"
        icon="search"
        class="w-2/3"
        clearable
        unroundRight
        on:clear={handleClearInput}
        bind:value={manualSearchString}
      />
      <Button variant="primary" class="h-10" unroundLeft on:click={onSearch}>
        Search
      </Button>
    </div>
  </div>
</div>
