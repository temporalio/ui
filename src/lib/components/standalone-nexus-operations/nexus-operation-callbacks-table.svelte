<script lang="ts">
  import NoQueryResults from '$lib/components/empty-states/no-query-results.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import Badge from '$lib/io/badge/badge.svelte';
  import IconChevronDown from '$lib/io/icon/icons/chevron-down.svelte';
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

  let {
    callbacks,
    namespace,
  }: {
    callbacks: Callback[];
    namespace: string;
  } = $props();

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
  pageParameter="callbacks-page"
  perPageParameter="callbacks-per-page"
  items={callbacks}
>
  {#snippet caption()}
    <caption class="sr-only">{translate('nexus.callbacks')}</caption>
  {/snippet}
  {#snippet headers()}
    <TableHeaderRow>
      <th class="w-[114px] text-xs font-normal text-secondary"
        >{translate('nexus.delivery-state')}</th
      >
      <th class="text-xs font-normal text-secondary"
        >{translate('nexus.nexus-endpoint-column')}</th
      >
      <th class="text-xs font-normal text-secondary"
        >{translate('nexus.nexus-service')}</th
      >
      <th class="text-xs font-normal text-secondary"
        >{translate('nexus.nexus-operation')}</th
      >
      <th class="text-xs font-normal text-secondary"
        >{translate('nexus.target-execution')}</th
      >
      <th class="text-xs font-normal text-secondary"
        >{translate('nexus.target-event')}</th
      >
      <th class="w-11"></th>
    </TableHeaderRow>
  {/snippet}
  {#snippet rows({ visibleItems })}
    {#each visibleItems as callback, index (callback.requestId || index)}
      {@const deliveryState = callbackDeliveryState(
        callback.state as unknown as string,
      )}
      {@const handler = callback.callback?.nexusHandler}
      {@const target = toTarget(callback)}
      <TableRow data-testid="callback-row" class="text-xs">
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
          <IconChevronDown />
        </td>
      </TableRow>
    {/each}
  {/snippet}
  {#snippet empty()}
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
  {/snippet}
</PaginatedTable>
