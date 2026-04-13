<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { fade, slide } from 'svelte/transition';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { searchAttributes as defaultSearchAttributes } from '$lib/stores/search-attributes';
  import type { SearchAttributes } from '$lib/types/workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { MAX_QUERY_LENGTH } from '$lib/utilities/request-from-api';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  interface Props {
    filters: Writable<SearchAttributeFilter[]>;
    searchAttributes?: SearchAttributes;
    id: string;
    onSearch?: (query: string) => void;
  }

  let {
    filters,
    searchAttributes = $defaultSearchAttributes,
    id,
    onSearch,
  }: Props = $props();

  let manualSearchString = $state('');

  const query = $derived(page.url.searchParams.get('query') ?? '');

  function setManualString(query: string) {
    manualSearchString = query;
  }

  $effect(() => {
    setManualString(query);
  });

  const handleSearch = () => {
    if (!manualSearchString) {
      $filters = [];
    } else {
      try {
        $filters = toListWorkflowFilters(manualSearchString, searchAttributes);
      } catch (e) {
        console.error(e);
      }
    }

    if (manualSearchString && manualSearchString === query) {
      onSearch?.(manualSearchString);
    } else {
      updateQueryParameters({
        url: page.url,
        parameter: 'query',
        value: manualSearchString,
        allowEmpty: true,
        clearParameters: [currentPageKey],
      });
    }
  };

  function handleClearInput() {
    handleSearch();
  }
</script>

<div class="w-full border border-t-0 border-subtle" in:fade>
  <form
    onsubmit={handleSearch}
    class="flex gap-0"
    transition:slide
    role="search"
  >
    <Input
      id="query"
      type="search"
      label={translate('workflows.search-placeholder')}
      labelHidden
      placeholder={translate('workflows.search-placeholder')}
      icon="search"
      class="grow  [&_*]:border-0"
      inputContainerClass="surface-information !border-r border-subtle"
      clearable
      copyButtonLabel={translate('common.copy-icon-title')}
      clearButtonLabel={translate('common.clear-input-button-label')}
      on:clear={handleClearInput}
      bind:value={manualSearchString}
      maxLength={MAX_QUERY_LENGTH}
      hideCount={!manualSearchString ||
        manualSearchString.length < MAX_QUERY_LENGTH}
      data-testid="{id}-manual-search-input"
    />
    <Button
      data-testid="{id}-manual-search-button"
      variant="ghost"
      type="submit"
    >
      {translate('common.search')}
    </Button>
  </form>
</div>
