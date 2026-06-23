<script lang="ts">
  import debounce from 'just-debounce';
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

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
    actions?: Snippet;
  };

  let {
    endpoints = [],
    searchPlaceholder = translate('common.search'),
    headers,
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
  <div class="mb-8 flex items-center justify-between">
    <h1 data-testid="namespace-selector-title">
      {translate('nexus.endpoints')}
    </h1>
    {@render actions?.()}
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
      <Table class="w-full" bordered>
        <caption class="sr-only" slot="caption">
          {translate('nexus.endpoints')}
        </caption>
        <svelte:fragment slot="headers">
          {@render headers?.()}
        </svelte:fragment>
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
