<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';

  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { refresh, workflowsQuery } from '$lib/stores/workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { MAX_QUERY_LENGTH } from '$lib/utilities/request-from-api';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  let manualSearchString = '';

  $: query = $page.url.searchParams.get('query');

  function setManualString(query: string) {
    manualSearchString = query;
  }

  $: {
    setManualString(query);
  }

  const onSearch = () => {
    if (!manualSearchString) {
      $workflowFilters = [];
      $workflowsQuery = '';
    } else {
      try {
        $workflowFilters = toListWorkflowFilters(
          manualSearchString,
          $searchAttributes,
        );
      } catch (e) {
        console.error(e);
      }
    }

    if (manualSearchString && manualSearchString === query) {
      $refresh = Date.now();
    } else {
      updateQueryParameters({
        url: $page.url,
        parameter: 'query',
        value: manualSearchString,
        allowEmpty: true,
        clearParameters: [currentPageKey],
      });
    }
  };

  function handleClearInput() {
    onSearch();
  }
</script>

<div class="w-full border border-t-0 border-subtle" in:fade>
  <form
    on:submit|preventDefault={onSearch}
    class="flex gap-0"
    in:fly={{ x: -100, duration: 150 }}
    role="search"
  >
    <Input
      id="manual-search"
      type="search"
      label={translate('workflows.search-placeholder')}
      labelHidden
      placeholder={translate('workflows.search-placeholder')}
      icon="search"
      class="grow  [&_*]:border-0"
      inputClass="surface-information !border-r border-subtle"
      clearable
      copyButtonLabel={translate('common.copy-icon-title')}
      clearButtonLabel={translate('common.clear-input-button-label')}
      on:clear={handleClearInput}
      bind:value={manualSearchString}
      maxLength={MAX_QUERY_LENGTH}
      hideCount={!manualSearchString ||
        manualSearchString.length < MAX_QUERY_LENGTH}
    />
    <Button data-testid="manual-search-button" variant="ghost" type="submit">
      {translate('common.search')}
    </Button>
  </form>
</div>
