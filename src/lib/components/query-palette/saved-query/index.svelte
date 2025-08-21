<script lang="ts">
  import { fly } from 'svelte/transition';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';

  import Editing from './editing.svelte';

  let { editingQuery }: { editingQuery: SavedQuery | undefined } = $props();

  let queryName = $state('');
  const query = page.url.searchParams.get('query') || '';

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

{#if editingQuery}
  <Editing {editingQuery} />
{:else}
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
      icon="search"
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
  </form>
{/if}
