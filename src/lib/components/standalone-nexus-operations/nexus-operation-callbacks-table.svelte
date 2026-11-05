<script lang="ts">
  import { tick } from 'svelte';

  import { page } from '$app/state';

  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import Button from '$lib/holocene/button.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import Badge from '$lib/io/badge/badge.svelte';
  import IconChevronDown from '$lib/io/icon/icons/chevron-down.svelte';
  import IconChevronUp from '$lib/io/icon/icons/chevron-up.svelte';
  import IconDotnetColorblock from '$lib/io/icon/icons/dotnet-colorblock.svelte';
  import IconGoColorblock from '$lib/io/icon/icons/go-colorblock.svelte';
  import IconJavaColorblock from '$lib/io/icon/icons/java-colorblock.svelte';
  import IconPythonColorblock from '$lib/io/icon/icons/python-colorblock.svelte';
  import IconRubyColorblock from '$lib/io/icon/icons/ruby-colorblock.svelte';
  import IconRustColorblock from '$lib/io/icon/icons/rust-colorblock.svelte';
  import IconSwiftColorblock from '$lib/io/icon/icons/swift-colorblock.svelte';
  import IconTypescriptColorblock from '$lib/io/icon/icons/typescript-colorblock.svelte';
  import type { IconComponent } from '$lib/io/icon/types';
  import type { Callback } from '$lib/types/nexus';
  import { toEventLinkView } from '$lib/utilities/event-link';
  import {
    callbackDeliveryState,
    callbackTargetEvent,
    callbackTargetName,
    callbackTargetTypeLabel,
  } from '$lib/utilities/nexus-operation-callbacks';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import NexusOperationCallbackDetails from './nexus-operation-callback-details.svelte';

  let {
    callbacks,
    namespace,
    filtered = false,
    onClearFilters,
  }: {
    callbacks: Callback[];
    namespace: string;
    filtered?: boolean;
    onClearFilters?: () => void;
  } = $props();

  const PAGE_PARAMETER = 'callbacks-page';
  const PER_PAGE_PARAMETER = 'callbacks-per-page';
  const DEFAULT_PER_PAGE = 100;

  const expanded = $state<Record<string, boolean>>({});
  let deepLinkedRequestId: string | undefined;

  const rowKey = (callback: Callback) =>
    callback.requestId || `index-${callbacks.indexOf(callback)}`;
  const rowId = (key: string) => `callback-row-${key}`;
  const detailsId = (key: string) => `callback-details-${key}`;

  const toggle = (key: string) => {
    expanded[key] = !expanded[key];
  };

  const scrollToRow = async (key: string) => {
    await tick();
    document.getElementById(rowId(key))?.scrollIntoView({ block: 'center' });
  };

  $effect(() => {
    const requestId = page.url.searchParams.get('requestId');
    if (!requestId || requestId === deepLinkedRequestId) return;
    const index = callbacks.findIndex(
      (callback) => callback.requestId === requestId,
    );
    if (index === -1) return;

    deepLinkedRequestId = requestId;
    expanded[requestId] = true;

    const perPage =
      Number(page.url.searchParams.get(PER_PAGE_PARAMETER)) || DEFAULT_PER_PAGE;
    const targetPage = Math.floor(index / perPage) + 1;
    const currentPage = Number(page.url.searchParams.get(PAGE_PARAMETER)) || 1;

    if (targetPage === currentPage) {
      scrollToRow(requestId);
      return;
    }
    updateQueryParameters({
      parameter: PAGE_PARAMETER,
      value: targetPage,
      url: page.url,
    }).then(() => scrollToRow(requestId));
  });

  const SDKS: {
    id: string;
    name: string;
    Icon: IconComponent;
    href?: string;
  }[] = [
    {
      id: 'go',
      name: 'Go',
      Icon: IconGoColorblock,
      href: 'https://learn.temporal.io/getting_started/go/',
    },
    {
      id: 'python',
      name: 'Python',
      Icon: IconPythonColorblock,
      href: 'https://learn.temporal.io/getting_started/python/',
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      Icon: IconTypescriptColorblock,
      href: 'https://learn.temporal.io/getting_started/typescript/',
    },
    {
      id: 'dotnet',
      name: '.NET',
      Icon: IconDotnetColorblock,
      href: 'https://learn.temporal.io/getting_started/dotnet/',
    },
    {
      id: 'ruby',
      name: 'Ruby',
      Icon: IconRubyColorblock,
      href: 'https://learn.temporal.io/getting_started/ruby/',
    },
    {
      id: 'java',
      name: 'Java',
      Icon: IconJavaColorblock,
      href: 'https://learn.temporal.io/getting_started/java/',
    },
    {
      id: 'rust',
      name: 'Rust',
      Icon: IconRustColorblock,
      href: 'https://docs.temporal.io/develop/rust/quickstart',
    },
    { id: 'swift', name: 'Swift', Icon: IconSwiftColorblock },
  ];

  const toTarget = (callback: Callback) => {
    if (String(callback.state) !== 'Succeeded') return undefined;
    const link = callback.callback?.links?.[0];
    if (!link) return undefined;
    const view = toEventLinkView(link, { namespace });
    return {
      href: view.href,
      name: callbackTargetName(link, view),
      typeLabel: callbackTargetTypeLabel(view.variant),
      event: callbackTargetEvent(link),
    };
  };
</script>

<PaginatedTable
  id="nexus-operation-callbacks"
  class="w-full"
  fixed
  aria-label={translate('nexus.callbacks')}
  perPageLabel={translate('common.per-page')}
  nextPageButtonLabel={translate('common.next-page')}
  previousPageButtonLabel={translate('common.previous-page')}
  pageButtonLabel={(p) => translate('common.go-to-page', { page: p })}
  pageParameter={PAGE_PARAMETER}
  perPageParameter={PER_PAGE_PARAMETER}
  items={callbacks}
>
  {#snippet caption()}
    <caption class="sr-only">{translate('nexus.callbacks')}</caption>
  {/snippet}
  {#snippet headers()}
    <TableHeaderRow>
      <th>{translate('nexus.delivery-state')}</th>
      <th>{translate('nexus.nexus-endpoint-column')}</th>
      <th>{translate('nexus.nexus-service')}</th>
      <th>{translate('nexus.nexus-operation')}</th>
      <th>{translate('nexus.target-execution')}</th>
      <th>{translate('nexus.target-event')}</th>
      <th class="w-11"></th>
    </TableHeaderRow>
  {/snippet}
  {#snippet rows({ visibleItems })}
    {#each visibleItems as callback (rowKey(callback))}
      {@const key = rowKey(callback)}
      {@const isExpanded = Boolean(expanded[key])}
      {@const deliveryState = callbackDeliveryState(
        callback.state as unknown as string,
      )}
      {@const handler = callback.callback?.nexusHandler}
      {@const target = toTarget(callback)}
      <TableRow
        id={rowId(key)}
        class="hover:cursor-pointer"
        data-testid="callback-row"
        onclick={() => toggle(key)}
      >
        <td data-testid="callback-delivery-state">
          <Badge
            text={deliveryState.label}
            colorScheme={deliveryState.colorScheme}
          />
        </td>
        <td class="truncate" data-testid="callback-endpoint">
          {handler?.taskQueueName ?? ''}
        </td>
        <td class="truncate" data-testid="callback-service">
          {handler?.service ?? ''}
        </td>
        <td class="truncate" data-testid="callback-operation">
          {handler?.operation ?? ''}
        </td>
        <td data-testid="callback-target-execution">
          {#if target}
            <div class="flex flex-col">
              {#if target.href}
                <Link href={target.href} class="truncate">{target.name}</Link>
              {:else}
                <span class="truncate">{target.name}</span>
              {/if}
              {#if target.typeLabel}
                <span class="truncate text-secondary">{target.typeLabel}</span>
              {/if}
            </div>
          {/if}
        </td>
        <td class="truncate" data-testid="callback-target-event">
          {target?.event ?? ''}
        </td>
        <td data-testid="callback-expand">
          <IconButton
            Icon={isExpanded ? IconChevronUp : IconChevronDown}
            label={isExpanded
              ? translate('events.collapse-details')
              : translate('events.expand-details')}
            aria-expanded={isExpanded}
            aria-controls={isExpanded ? detailsId(key) : undefined}
            class="h-6 w-6"
            onclick={() => toggle(key)}
          />
        </td>
      </TableRow>
      {#if isExpanded}
        <tr id={detailsId(key)} class="expanded">
          <td class="!p-0" colspan={7}>
            <NexusOperationCallbackDetails {callback} />
          </td>
        </tr>
      {/if}
    {/each}
  {/snippet}
  {#snippet empty()}
    {#if filtered}
      <div
        class="flex flex-col items-center gap-4 p-8 text-center"
        data-testid="callbacks-no-matches"
      >
        <NoQueryResults class="mb-4" />
        <h3 class="text-primary">
          {translate('nexus.callbacks-no-matches')}
        </h3>
        <Button variant="secondary" size="sm" onclick={onClearFilters}>
          {translate('nexus.clear-filters')}
        </Button>
      </div>
    {:else}
      <div
        class="flex flex-col items-center gap-2 p-8 text-center"
        data-testid="callbacks-empty-state"
      >
        <NoQueryResults class="mb-4" />
        <h3 class="text-primary">
          {translate('nexus.callbacks-empty-state-title')}
        </h3>
        <p class="text-secondary">
          {translate('nexus.callbacks-empty-state-preface')}<Link
            href="https://docs.temporal.io/nexus"
            newTab>{translate('common.docs')}</Link
          >{translate('nexus.callbacks-empty-state-postface')}
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          {#each SDKS as { id, name, Icon, href } (id)}
            {#if href}
              <Link newTab {href} aria-label={name} data-testid="sdk-icon-{id}">
                <Icon title={name} />
              </Link>
            {:else}
              <span data-testid="sdk-icon-{id}">
                <Icon title={name} />
              </span>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  {/snippet}
</PaginatedTable>
