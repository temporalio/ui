<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
  import { getEventLinkHref } from '$lib/utilities/event-link-href';
  import { getWorkflowLinks } from '$lib/utilities/get-workflow-relationships';
  import {
    routeForEventHistory,
    routeForNamespace,
  } from '$lib/utilities/route-for';

  const links = $derived(getWorkflowLinks($fullEventHistory));
</script>

<section class="flex flex-col gap-4">
  <h2 data-testid="nexus-links-title">
    {translate('workflows.nexus-links-tab')}:
  </h2>
  <h2 class="flex items-center gap-2" data-testid="workers">
    <Badge type="count">{links?.length || 0}</Badge>
  </h2>
  <Table class="mb-6 w-full min-w-[600px] table-fixed">
    <caption class="sr-only" slot="caption"
      >{translate('workflows.workers-tab')}</caption
    >
    <TableHeaderRow slot="headers">
      <th>{translate('namespaces.namespace')}</th>
      <th>{translate('common.workflow-id')}</th>
      <th>{translate('common.run-id')}</th>
      <th class="w-24">{translate('common.event-id')}</th>
      <th class="w-24">{translate('common.request-id')}</th>
    </TableHeaderRow>
    {#each links as link}
      <TableRow data-testid="worker-row">
        <td class="text-left" data-testid="link-namespace">
          <Link
            href={routeForNamespace({
              namespace: link.workflowEvent.namespace,
            })}>{link.workflowEvent.namespace}</Link
          >
        </td>
        <td class="text-left" data-testid="worker-build-id">
          <Link
            href={routeForEventHistory({
              namespace: link.workflowEvent.namespace,
              workflow: link.workflowEvent.workflowId,
              run: link.workflowEvent.runId,
            })}>{link.workflowEvent.workflowId}</Link
          >
        </td>
        <td class="text-left" data-testid="worker-build-id">
          <Link
            href={routeForEventHistory({
              namespace: link.workflowEvent.namespace,
              workflow: link.workflowEvent.workflowId,
              run: link.workflowEvent.runId,
            })}>{link.workflowEvent.runId}</Link
          >
        </td>
        <td class="text-left" data-testid="worker-last-access-time">
          {#if link?.workflowEvent?.eventRef?.eventId || link?.workflowEvent?.eventRef?.eventType === 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED'}
            <Link href={getEventLinkHref(link)}
              >{link.workflowEvent.eventRef?.eventId || '1'}</Link
            >
          {/if}
        </td>
        <td class="text-left" data-testid="worker-last-access-time">
          {#if link?.workflowEvent?.requestIdRef}
            <Link href={getEventLinkHref(link)}
              >{link.workflowEvent.requestIdRef.requestId}</Link
            >
          {/if}
        </td>
      </TableRow>
    {:else}
      <tr class="w-full">
        <td colspan="5">
          <EmptyState title={translate('workflows.workers-empty-state')} />
        </td>
      </tr>
    {/each}
  </Table>
</section>
