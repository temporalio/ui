<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import DeploymentsTableRow from '$lib/components/deployments/deployments-table-row.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedDeployments } from '$lib/services/deployments-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  let refresh = Date.now();
  let coreUser = coreUserStore();
  let error = '';

  $: namespace = $page.params.namespace;
  $: createDisabled = $coreUser.namespaceWriteDisabled(namespace);
  $: query = $page.url.searchParams.get('query');

  $: onFetch = () => {
    error = '';
    return fetchPaginatedDeployments(namespace, query, undefined);
  };

  const onError = (err: APIErrorResponse) => {
    error =
      err?.body?.message || translate('deployments.error-message-fetching');
  };

  const columns = [
    { label: translate('deployments.deployments-table.name'), pinned: true },
    {
      label: translate('deployments.deployments-table.current-version'),
      pinned: true,
    },
    { label: translate('deployments.deployments-table.created'), pinned: true },
    { label: translate('deployments.deployments-table.ramping'), pinned: true },
    {
      label: translate('deployments.deployments-table.workflows'),
      pinned: true,
    },
  ];
</script>

{#key [namespace, query, refresh]}
  <PaginatedTable
    let:visibleItems
    {onFetch}
    {onError}
    aria-label={translate('deployments.deployments')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('deployments.empty-state-title')}
    errorMessage={translate('deployments.error-message-fetching')}
  >
    <caption class="sr-only" slot="caption"
      >{translate('deployments.deployments')}</caption
    >

    <div class="flex flex-col gap-4" slot="header">
      <h1>{translate('deployments.worker-deployments')}</h1>
    </div>

    <tr slot="headers" class="text-left">
      {#each columns as { label }}
        <th>{label}</th>
      {/each}
    </tr>
    {#each visibleItems as deployment}
      <DeploymentsTableRow {deployment} {columns} />
    {/each}

    <svelte:fragment slot="empty">
      {#if error}
        <EmptyState title={translate('deployments.empty-state-title')}>
          <Alert intent="warning" icon="warning" class="mx-12">
            {error}
          </Alert>
        </EmptyState>
      {:else if query}
        <EmptyState
          title={translate('deployments.empty-state-title')}
          content={translate('deployments.empty-state-description')}
        />
      {:else}
        <EmptyState title={translate('schedules.empty-state-title')}>
          <p>
            {translate('schedules.getting-started-docs-link-preface')}
            <Link newTab href="https://docs.temporal.io/workflows/#schedule"
              >{translate('schedules.getting-started-docs-link')}</Link
            >
            {translate('schedules.getting-started-cli-link-preface')}
            <Link newTab href="https://docs.temporal.io/cli/schedule"
              >Temporal CLI</Link
            >.
          </p>
          {#if !createDisabled}
            <Button
              data-testid="create-schedule"
              on:click={() => goto(routeForScheduleCreate({ namespace }))}
              disabled={!writeActionsAreAllowed()}
            >
              {translate('schedules.create')}
            </Button>
          {/if}
        </EmptyState>
      {/if}
    </svelte:fragment>
  </PaginatedTable>
{/key}
