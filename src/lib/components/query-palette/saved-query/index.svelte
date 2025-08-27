<script lang="ts">
  import { fly } from 'svelte/transition';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  let {
    editingQuery,
    close,
  }: {
    editingQuery: SavedQuery | undefined;
    close: () => void;
  } = $props();

  const namespace = $derived(page.params.namespace);
  const query = $derived(page.url.searchParams.get('query') || '');
  let queryName = $derived(editingQuery?.name || '');

  const onEnter = (event: Event) => {
    event.preventDefault();

    if (!$savedQueries[namespace]) {
      $savedQueries[namespace] = [];
    }

    if (editingQuery) {
      const updatedQuery = {
        ...editingQuery,
        name: queryName,
        query,
      };
      $savedQueries[namespace] = $savedQueries[namespace].map((q) =>
        q.id === editingQuery.id ? updatedQuery : q,
      );
    } else {
      const newQuery = {
        id: Date.now().toString(),
        name: queryName,
        query,
      };
      $savedQueries[namespace] = [...$savedQueries[namespace], newQuery];
    }
    close();
  };

  const deleteFilter = () => {
    $savedQueries[namespace] = $savedQueries[namespace].filter(
      (q) => q.id !== editingQuery.id,
    );
    editingQuery = undefined;
    $workflowFilters = [];
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: '',
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
    close();
  };
</script>

<form
  onsubmit={onEnter}
  class="flex gap-0"
  in:fly={{ x: -100, duration: 150 }}
  role="search"
>
  {#if editingQuery}
    <Input
      id="manual-search"
      type="search"
      label="Save Query"
      labelHidden
      placeholder="Save query with name"
      icon="bookmark"
      class="grow lg:w-3/4 [&_*]:border-r-0"
      clearButtonLabel={translate('common.clear-input-button-label')}
      on:clear={() => (queryName = '')}
      bind:value={queryName}
      maxLength={80}
    />
    <Button data-testid="save-button" variant="primary" type="submit"
      >Save</Button
    >
    <Button
      data-testid="delete-query"
      variant="destructive"
      type="button"
      on:click={deleteFilter}
    >
      {translate('common.delete')}
    </Button>
  {:else}
    <Input
      id="manual-search"
      type="search"
      label="Save Query"
      labelHidden
      placeholder="Name"
      icon="bookmark"
      class="grow lg:w-3/4 [&_*]:border-r-0"
      clearable
      clearButtonLabel={translate('common.clear-input-button-label')}
      on:clear={() => (queryName = '')}
      bind:value={queryName}
      maxLength={80}
    />
    <Button
      disabled={!queryName}
      data-testid="manual-search-button"
      variant="primary"
      type="submit"
    >
      {translate('common.save')}
    </Button>
  {/if}
</form>
