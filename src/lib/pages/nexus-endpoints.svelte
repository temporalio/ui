<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEmptyState from '$lib/pages/nexus-empty-state.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import type { NexusEndpoint } from '$lib/types/nexus';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    routeForNexusEndpoint,
    routeForNexusEndpointCreate,
  } from '$lib/utilities/route-for';

  export let endpoints: NexusEndpoint[] = [];

  let view: 'all' | 'mine' = 'all';
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />

{#if !endpoints?.length}
  <NexusEmptyState />
{:else}
  <div class="mb-8 flex items-center justify-between">
    <h1 data-testid="namespace-selector-title" class="text-2xl">
      {translate('nexus.endpoints')}
    </h1>
    <Button variant="primary" href={routeForNexusEndpointCreate()}
      >{translate('nexus.create-endpoint')}</Button
    >
  </div>
  <div class="flex flex-col gap-4">
    <ToggleButtons>
      <ToggleButton
        data-testid="all-endpoints"
        on:click={() => (view = 'all')}
        active={view === 'all'}>{translate('nexus.all-endpoints')}</ToggleButton
      >
      <ToggleButton
        data-testid="my-endpoints"
        on:click={() => (view = 'mine')}
        active={view === 'mine'}>{translate('nexus.my-endpoints')}</ToggleButton
      >
    </ToggleButtons>
    <div
      class="grid grid-cols-1 gap-4 pr-8 md:grid-cols-2 md:pr-24 lg:grid-cols-3 xl:grid-cols-4 xl:pr-48"
    >
      {#each endpoints as endpoint}
        <Link href={routeForNexusEndpoint(endpoint.id)} role="button">
          <div
            class="transition:colors surface-primary flex cursor-pointer flex-col gap-1 rounded-lg p-4 duration-200 ease-in-out hover:surface-interactive"
          >
            <h3 class="text-lg font-medium">
              {endpoint.spec.name}
            </h3>
            <p class="text-xs text-secondary">
              Created on {formatDate(endpoint.createdTime, $timeFormat)}
            </p>
            <Badge type="information" class="px-2 py-1">## Namespaces</Badge>
          </div>
        </Link>
      {/each}
    </div>
  </div>
{/if}
