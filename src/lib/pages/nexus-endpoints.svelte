<script lang="ts">
  import debounce from 'just-debounce';
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEmptyState from '$lib/pages/nexus-empty-state.svelte';
  import type { NexusEndpoint } from '$lib/types/nexus';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  type Props = {
    endpoints: NexusEndpoint[];
    searchPlaceholder?: string;
    createDisabled?: boolean;
    createHref?: string;
    headers?: Snippet;
    columns?: Snippet<[NexusEndpoint]>;
  };

  let {
    endpoints = [],
    searchPlaceholder = translate('common.search'),
    createDisabled = false,
    createHref = '/nexus/create',
    headers,
    columns,
  }: Props = $props();

  let search = $state('');
  let searchParam = $derived(page.url.searchParams.get('search') || '');

  const searchParamUpdate = debounce((value) => {
    updateQueryParameters({
      parameter: 'search',
      value,
      url: page.url,
    });
  }, 350);

  $effect(() => {
    searchParamUpdate(search);
  });
</script>

{#if !endpoints?.length && !searchParam}
  <NexusEmptyState {createDisabled} {createHref} />
{:else}
  <div class="mb-8 flex items-center justify-between">
    <h1 data-testid="namespace-selector-title">
      {translate('nexus.endpoints')}
    </h1>
    <Button disabled={createDisabled} variant="primary" href={createHref}
      >{translate('nexus.create-endpoint')}</Button
    >
  </div>
  <div class="flex flex-col gap-4">
    <Input
      id="endpoint-search"
      bind:value={search}
      icon="search"
      label={searchPlaceholder}
      labelHidden
      autoFocus
      type="search"
      placeholder={searchPlaceholder}
      class="w-full"
    />
    {#if endpoints.length}
      <Table class="w-full" bordered {headers}>
        {#snippet caption()}
          <caption class="sr-only">
            {translate('nexus.endpoints')}
          </caption>
        {/snippet}
        {#each endpoints as endpoint}
          {@render columns?.(endpoint)}
        {/each}
      </Table>
    {:else}
      <div class="flex w-full justify-center">
        <EmptyState title={translate('nexus.empty-state')} />
      </div>
    {/if}
  </div>
{/if}
