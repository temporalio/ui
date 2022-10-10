<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';
  import { page } from '$app/stores';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Input from '$lib/holocene/input/input.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import {
    getConditionalForAttribute,
    getDefaultValueForAttribute,
  } from '$lib/utilities/query/to-list-workflow-advanced-parameters';

  export let advancedSearch = false;
  export let manualSearch = false;
  export let error = '';

  let manualSearchString = '';
  let value = '';

  $: query = $page.url.searchParams.get('query');

  function setManualString(query) {
    manualSearchString = query;
  }

  $: {
    setManualString(query);
  }

  const onSearch = () => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: manualSearchString,
      allowEmpty: true,
    });
  };
</script>

<div class="flex-items-center flex grow gap-4">
  <div class="flex h-12 w-full items-center gap-0" in:fade>
    {#if manualSearch}
      <div
        class="relative flex h-12 w-full items-center gap-0"
        in:fly={{ x: -100, duration: 150 }}
      >
        {#if error}
          <span
            class="absolute left-0 h-4 text-xs font-bold text-orange-500"
            style="top: -16px">{error}</span
          >
        {/if}
        <Input
          id="manual-search"
          placeholder="Enter a query"
          icon="search"
          class="w-full"
          clearable
          unroundRight
          autoFocus
          bind:value={manualSearchString}
          errorText={error}
        />
        <CustomButton
          icon="chevron-left"
          class="h-10 border border-l-0 border-gray-900"
          on:click={() => (manualSearch = !manualSearch)}
        />
        <Button variant="primary" class="h-10" unroundLeft on:click={onSearch}>
          Search
        </Button>
      </div>
    {:else if !advancedSearch}
      <div
        class="relative flex h-12 w-full items-center gap-0"
        in:fly={{ x: -100, duration: 150 }}
      >
        <CustomButton
          class="h-10 rounded border-0"
          on:click={() => (manualSearch = !manualSearch)}>Advanced</CustomButton
        >
      </div>
    {/if}
  </div>
</div>
