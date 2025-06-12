<script lang="ts">
  import { page } from '$app/state';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getEventLinkHref } from '$lib/utilities/event-link-href';
  import { isNexusOperationScheduledEvent } from '$lib/utilities/is-event-type';
  import {
    routeForEventHistoryEvent,
    routeForNamespace,
  } from '$lib/utilities/route-for';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  const { namespace, id, run } = $derived(page.params);
  const { workflow } = $derived($workflowRun);
  const pendingActivities = $derived(workflow?.pendingActivities);
  const pendingNexusOperations = $derived(workflow?.pendingNexusOperations);

  const groups = $derived(
    groupEvents(
      $fullEventHistory,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );
  const nexusGroups = $derived(
    groups.filter((group) => group.category === 'nexus'),
  );
  $inspect(nexusGroups);
</script>

<section class="flex flex-col gap-4">
  <h2 data-testid="nexus-links-title">
    {translate('workflows.nexus-links-tab')}
  </h2>
  <h3>Outbound</h3>
  <Table class="mb-6 w-full min-w-[600px] table-fixed">
    <caption class="sr-only" slot="caption"
      >{translate('workflows.workers-tab')}</caption
    >
    <TableHeaderRow slot="headers">
      <th>{translate('nexus.caller-event')}</th>
      <th>{translate('nexus.caller-namespace')}</th>
      <th>{translate('nexus.nexus-endpoint-simple')}</th>
      <th>{translate('nexus.nexus-service')}</th>
      <th>{translate('nexus.nexus-operation')}</th>
      <th>{translate('nexus.handler-namespace')}</th>
      <th>{translate('nexus.handler-event')}</th>
    </TableHeaderRow>
    {#each nexusGroups as group}
      {@const link = group.links[0]}
      {@const scheduledEvent = group.eventList.find((e) =>
        isNexusOperationScheduledEvent(e),
      )}
      {#if link}
        <TableRow data-testid="worker-row">
          <td class="text-left" data-testid="link-event">
            <Link
              href={routeForEventHistoryEvent({
                namespace,
                workflow: id,
                run,
                eventId: scheduledEvent.id,
              })}>{scheduledEvent.id}</Link
            >
          </td>
          <td class="text-left" data-testid="link-namespace">
            <Link
              href={routeForNamespace({
                namespace,
              })}>{namespace}</Link
            >
          </td>
          <td class="text-left" data-testid="link-endpoint">
            {scheduledEvent?.attributes?.endpoint}
          </td>
          <td class="text-left" data-testid="link-service">
            {scheduledEvent?.attributes?.service}
          </td>
          <td class="text-left" data-testid="link-operation">
            {scheduledEvent?.attributes?.operation}
          </td>
          <td class="text-left" data-testid="link-namespace">
            <Link
              href={routeForNamespace({
                namespace: link.workflowEvent.namespace,
              })}>{link.workflowEvent.namespace}</Link
            >
          </td>
          <td class="text-left" data-testid="link-href">
            {#if link?.workflowEvent}
              <Link href={getEventLinkHref(link)}
                >{fromScreamingEnum(
                  link.workflowEvent?.eventRef?.eventType ||
                    link.workflowEvent?.requestIdRef?.eventType,
                  'EventType',
                )}</Link
              >
            {/if}
          </td>
        </TableRow>
      {/if}
    {:else}
      <tr class="w-full">
        <td colspan="5">
          <EmptyState title={translate('workflows.workers-empty-state')} />
        </td>
      </tr>
    {/each}
  </Table>
</section>
