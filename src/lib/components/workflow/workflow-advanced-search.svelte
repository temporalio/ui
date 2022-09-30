<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';
  import { page } from '$app/stores';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowQueryFromAdvancedFilters } from '$lib/utilities/query/list-workflow-query';

  import { searches } from '$lib/stores/searches';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import CustomSplitButton from '$lib/holocene/custom-split-button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import Button from '$lib/holocene/button.svelte';

  export let manualSearch = false;
  export let filters = [];
  export let sorts = [];
  export let error = string;

  let manualSearchString = '';

  $: query = $page.url.searchParams.get('query');

  $: {
    query = toListWorkflowQueryFromAdvancedFilters(filters, sorts);
  }

  function setManualString(manual, filters, sorts) {
    if (manual) {
      manualSearchString = query;
    }
  }

  $: {
    setManualString(manualSearch, filters, sorts);
  }

  const onSearch = () => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: manualSearchString,
      allowEmpty: true,
    });
  };
  const { copy, copied } = copyToClipboard(500);
</script>

<div class="flex grow flex-items-center gap-4">
  <div class="flex h-12 w-full items-center gap-0" in:fade>
    {#if manualSearch}
      <div
        class="flex h-12 w-full items-center gap-0 relative"
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
          class="h-10 border border-gray-900 border-r-0"
          unround
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
          class="h-10"
          icon="chevron-right"
          on:click={() => (manualSearch = !manualSearch)}
        >
          Advanced Search
        </CustomButton>
      </div>
    {/if}
  </div>
</div>
