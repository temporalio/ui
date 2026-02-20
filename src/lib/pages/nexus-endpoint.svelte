<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NexusEndpoint as Endpoint } from '$lib/types/nexus';
  import {
    routeForNamespace,
    routeForNexusEndpointEdit,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';

  let {
    endpoint,
    editDisabled = false,
    taskQueueStatus,
    editHref,
  }: {
    endpoint: Endpoint;
    editDisabled?: boolean;
    taskQueueStatus?: Snippet;
    editHref?: string;
  } = $props();

  const allowedCallerNamespaces = $derived(
    endpoint.spec?.allowedCallerNamespaces,
  );
</script>

{#snippet target()}
  <Card class="flex grow flex-col gap-4">
    <h5>{translate('nexus.target')}</h5>
    <div class="flex flex-col gap-0.5">
      <dt class="font-medium">{translate('namespaces.namespace')}</dt>
      <dd class="truncate">
        <Link
          href={routeForNamespace({
            namespace: endpoint.spec?.target?.worker?.namespace || '',
          })}
        >
          <i>{endpoint.spec?.target?.worker?.namespace || ''}</i>
        </Link>
      </dd>
    </div>

    <div class="flex flex-col gap-0.5">
      <dt class="font-medium">{translate('common.task-queue')}</dt>
      <dd>
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={endpoint.spec?.target?.worker?.taskQueue || ''}
        >
          <Link
            href={routeForTaskQueue({
              namespace: endpoint.spec?.target?.worker?.namespace || '',
              queue: endpoint.spec?.target?.worker?.taskQueue || '',
            })}
            class="truncate"
          >
            <i>{endpoint.spec?.target?.worker?.taskQueue || ''}</i>
          </Link>
        </Copyable>
      </dd>
    </div>

    {@render taskQueueStatus?.()}
  </Card>
{/snippet}

{#snippet description()}
  <Card
    class={merge(
      'flex flex-col gap-4',
      allowedCallerNamespaces &&
        'h-auto xl:max-h-[var(--panel-h)] xl:w-1/2 xl:overflow-auto',
    )}
  >
    <h5>{translate('common.description')}</h5>
    <Markdown
      content={endpoint.spec?.descriptionString ||
        translate('nexus.no-description')}
      overrideTheme="background"
    />
  </Card>
{/snippet}

{#snippet allowedCallerNamespacesTable()}
  <Card class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <h5>{translate('nexus.allowed-caller-namespaces')}</h5>
      <Badge type="count">{allowedCallerNamespaces.length}</Badge>
    </div>
    <div class="flex flex-wrap items-center gap-4">
      <PaginatedTable
        id="allowed-caller-namespaces"
        aria-label={translate('nexus.allowed-caller-namespaces')}
        perPageLabel={translate('common.per-page')}
        previousPageButtonLabel={translate('common.previous-page')}
        nextPageButtonLabel={translate('common.next-page')}
        pageButtonLabel={(page) => translate('common.go-to-page', { page })}
        variant="primary"
        items={allowedCallerNamespaces}
        let:visibleItems
        maxHeight="24rem"
      >
        <caption class="sr-only" slot="caption"
          >{translate('nexus.allowed-caller-namespaces')}</caption
        >
        <TableHeaderRow slot="headers">
          <th class="w-full">{translate('common.name')}</th>
        </TableHeaderRow>
        {#each visibleItems as namespace (namespace)}
          <TableRow>
            <td>
              <Link href={routeForNamespace({ namespace })}>{namespace}</Link>
            </td>
          </TableRow>
        {:else}
          <EmptyState
            slot="empty"
            title={translate('nexus.no-allowed-caller-namespaces')}
          />
        {/each}
      </PaginatedTable>
    </div>
  </Card>
{/snippet}

{#snippet editButton(className: ClassNameValue = undefined)}
  <Button
    href={editHref ?? routeForNexusEndpointEdit(endpoint.id!)}
    disabled={editDisabled}
    class={merge(className)}
  >
    {translate('common.edit')}
  </Button>
{/snippet}

<div
  class={merge(
    'flex flex-col gap-8',
    !allowedCallerNamespaces && 'w-full xl:w-3/4 2xl:w-1/2',
  )}
>
  <div class="flex flex-col gap-1">
    <header class="flex items-center justify-between gap-2 break-all">
      <h1>
        {endpoint.spec?.name || ''}
      </h1>
      {@render editButton('max-sm:hidden')}
    </header>
    <p>UUID: {endpoint.id}</p>
    {@render editButton('sm:hidden mt-6 w-full')}
  </div>
  <div
    class={merge(
      'flex flex-col gap-8',
      allowedCallerNamespaces && 'xl:flex-row',
    )}
  >
    <div class="flex h-fit grow flex-col gap-8">
      {@render target()}
      {#if allowedCallerNamespaces}
        {@render allowedCallerNamespacesTable()}
      {/if}
    </div>
    {@render description()}
  </div>
</div>
