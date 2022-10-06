<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';
  import { page } from '$app/stores';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Input from '$lib/holocene/input/input.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import Button from '$lib/holocene/button.svelte';

  export let advancedSearch = false;
  export let manualSearch = false;
  export let error = '';

  let manualSearchString = '';

  $: query = $page.url.searchParams.get('query');

  function setManualString(manual) {
    if (manual) {
      manualSearchString = query;
    }
  }

  $: {
    setManualString(manualSearch);
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
            class="absolute left-32 h-4 text-xs font-bold text-orange-500"
            style="top: -16px">{error}</span
          >
        {/if}
        <Button variant="primary" class="h-10" unroundRight on:click={onSearch}>
          Search
        </Button>
        <CustomButton
          icon="chevron-left"
          class="h-10 border border-gray-900"
          on:click={() => (manualSearch = !manualSearch)}
        />
        <Input
          id="manual-search"
          placeholder="Enter or paste a query..."
          icon="search"
          class="w-full"
          clearable
          unroundLeft
          autoFocus
          bind:value={manualSearchString}
          errorText={error}
        />
      </div>
    {:else}
      <div in:fly={{ x: -100, duration: 150 }}>
        <CustomButton
          variant="primary"
          class="h-8 rounded"
          icon={advancedSearch ? 'chevron-left' : 'chevron-right'}
          on:click={() => (advancedSearch = !advancedSearch)}
        >
          Advanced Search
        </CustomButton>
      </div>
    {/if}
  </div>
</div>
