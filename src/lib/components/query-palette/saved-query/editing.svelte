<script lang="ts">
  import { fly } from 'svelte/transition';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';

  let { editingQuery }: { editingQuery: SavedQuery } = $props();

  let queryName = $state(editingQuery.name);
  let editing = $state(false);
  const query = $derived(page.url.searchParams.get('query') || '');

  const onEnter = (event: Event) => {
    event.preventDefault();

    const newQuery = {
      id: Date.now().toString(),
      name: queryName,
      query,
    };
    $savedQueries = [...$savedQueries, newQuery];
  };
</script>

<form
  onsubmit={onEnter}
  class="flex gap-0"
  in:fly={{ x: -100, duration: 150 }}
  role="search"
>
  <Input
    id="manual-search"
    type="search"
    label="Save Query"
    labelHidden
    placeholder="Save query with name"
    icon="bookmark"
    class="grow lg:w-3/4 [&_*]:border-r-0"
    disabled={!editing}
    clearButtonLabel={translate('common.clear-input-button-label')}
    on:clear={() => (queryName = '')}
    bind:value={queryName}
    maxLength={80}
  />
  {#if editing}
    <Button
      disabled={!queryName}
      data-testid="save-button"
      variant="primary"
      type="submit"
    >
      {translate('common.update')}
    </Button>
    <Button
      data-testid="cancel-query"
      variant="secondary"
      type="button"
      on:click={() => {
        editing = false;
      }}
    >
      {translate('common.cancel')}
    </Button>
  {:else}
    <Button
      data-testid="rename-button"
      variant="secondary"
      type="button"
      on:click={() => (editing = true)}
    >
      Rename
    </Button>
    <Button data-testid="save-button" variant="primary" type="submit"
      >Save</Button
    >
    <Button
      data-testid="delete-query"
      variant="destructive"
      type="button"
      on:click={() => {
        $savedQueries = $savedQueries.filter((q) => q.id !== editingQuery.id);
        editingQuery = undefined;
      }}
    >
      {translate('common.delete')}
    </Button>
  {/if}
</form>
