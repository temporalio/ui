<script lang="ts">
  import debounce from 'just-debounce';
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusEmptyState from '$lib/pages/nexus-empty-state.svelte';
  import type { NexusEndpoint } from '$lib/types/nexus';
  import {
    routeForNamespace,
    routeForNexusEndpoint,
    routeForNexusEndpointCreate,
  } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  type Props = {
    endpoints: NexusEndpoint[];
    searchPlaceholder?: string;
    createDisabled?: boolean;
    headerColumns?: Snippet;
    rowColumns?: Snippet<[NexusEndpoint]>;
    children?: Snippet;
  };

  let {
    endpoints = [],
    searchPlaceholder = translate('common.search'),
    createDisabled = false,
    headerColumns,
    rowColumns,
    children,
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
  <NexusEmptyState {createDisabled}>
    {@render children?.()}
  </NexusEmptyState>
{:else}
  <div class="mb-8 flex items-center justify-between">
    <h1 data-testid="namespace-selector-title">
      {translate('nexus.endpoints')}
    </h1>
    <Button
      disabled={createDisabled}
      variant="primary"
      href={routeForNexusEndpointCreate()}
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
      <Table class="w-full" bordered>
        <caption class="sr-only" slot="caption">
          {translate('nexus.endpoints')}
        </caption>
        <TableHeaderRow slot="headers">
          <th>Name</th>
          <th>Used By</th>
          {@render headerColumns?.()}
          <th>Last Updated</th>
          <th>Created On</th>
        </TableHeaderRow>
        {#each endpoints as endpoint}
          <TableRow>
            <td class="px-2">
              {#if endpoint.id && endpoint.spec?.name}
                <Link
                  href={routeForNexusEndpoint(endpoint.id)}
                  class="table-link"
                >
                  {endpoint.spec.name}
                </Link>
              {:else}
                <span class="text-secondary">—</span>
              {/if}
            </td>

            <td class="px-2">
              {#if !endpoint.spec?.allowedCallerNamespaces?.length}
                <span class="text-sm text-secondary">0 Namespaces</span>
              {:else if endpoint.spec.allowedCallerNamespaces.length === 1}
                <Link
                  href={routeForNamespace({
                    namespace: endpoint.spec.allowedCallerNamespaces[0],
                  })}
                  class="table-link"
                >
                  {endpoint.spec.allowedCallerNamespaces[0]}
                </Link>
              {:else}
                <div class="flex items-center gap-1">
                  <Link
                    href={routeForNamespace({
                      namespace: endpoint.spec.allowedCallerNamespaces[0],
                    })}
                    class="table-link"
                  >
                    {endpoint.spec.allowedCallerNamespaces[0]}
                  </Link>
                  <MenuContainer>
                    <MenuButton
                      controls="namespaces-menu-{endpoint.id}"
                      hasIndicator
                      variant="ghost"
                      size="xs"
                      label="+{endpoint.spec.allowedCallerNamespaces.length -
                        1}"
                    />
                    <Menu id="namespaces-menu-{endpoint.id}">
                      {#each endpoint.spec.allowedCallerNamespaces.slice(1) as namespace}
                        <MenuItem href={routeForNamespace({ namespace })}>
                          {namespace}
                        </MenuItem>
                      {/each}
                    </Menu>
                  </MenuContainer>
                </div>
              {/if}
            </td>

            {@render rowColumns?.(endpoint)}

            <td class="px-2">
              {#if endpoint.lastModifiedTime}
                <Timestamp dateTime={endpoint.lastModifiedTime} relative />
              {:else}
                <span class="text-secondary">—</span>
              {/if}
            </td>

            <td class="px-2">
              {#if endpoint.createdTime}
                <Timestamp dateTime={endpoint.createdTime} relative={false} />
              {:else}
                <span class="text-secondary">—</span>
              {/if}
            </td>
          </TableRow>
        {/each}
      </Table>
    {:else}
      <div class="flex w-full justify-center">
        <EmptyState title={translate('nexus.empty-state')} />
      </div>
    {/if}
  </div>
{/if}
