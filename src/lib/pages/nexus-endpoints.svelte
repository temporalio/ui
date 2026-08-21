<script lang="ts">
  import { debounce } from 'es-toolkit';
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconSearch } from '$lib/io/icon';
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
    actions?: Snippet;
  };

  let {
    endpoints = [],
    searchPlaceholder = translate('common.search'),
    headers: headersSnippet,
    columns,
    actions,
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
  <NexusEmptyState>
    {#snippet actions()}
      {@render actions?.()}
    {/snippet}
  </NexusEmptyState>
{:else}
  <header>
    <div class="flex flex-col items-start justify-between gap-2 md:flex-row">
      <h1 data-testid="namespace-selector-title" class="leading-7">
        {translate('nexus.endpoints')}
      </h1>
      {@render actions?.()}
    </div>
  </header>
  <div class="flex flex-col gap-4">
    <Input
      id="endpoint-search"
      bind:value={search}
      Icon={IconSearch}
      label={searchPlaceholder}
      labelHidden
      autoFocus
      type="search"
      placeholder={searchPlaceholder}
      class="w-full"
    />
    {#if endpoints.length}
      <Table class="w-full" bordered>
        {#snippet caption()}
          <caption class="sr-only">
            {translate('nexus.endpoints')}
          </caption>
        {/snippet}
        {#snippet headers()}
          {@render headersSnippet?.()}
        {/snippet}
        {#each endpoints as endpoint (endpoint.id)}
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
